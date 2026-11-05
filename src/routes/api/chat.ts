import { Router } from "express";
import { GoogleGenAI, Type } from "@google/genai";
import { randomUUID } from "node:crypto";
import { FORENSIC_SYSTEM_PROMPT } from "../../lib/forensics/prompt";
import { applySourceInputs, getOrCreateSession, setStage } from "../../lib/forensics/session";
import { chatRequestSchema, findingPayloadSchema, type FindingPayload } from "../../lib/forensics/schema";
import { deriveSelfAudit } from "../../lib/forensics/audit";
import { evaluateOutlogic } from "../../lib/forensics/outlogic";

export const chatRouter = Router();

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export function verifyQuotedSupport(payload: FindingPayload, state: { institutionalRecord?: string; subjectVoice?: string }) {
  const corpus = `${state.institutionalRecord || ""}\n${state.subjectVoice || ""}`;
  return {
    ...payload,
    axiomHits: payload.axiomHits.map((hit) => {
      const supportedQuotes = hit.sourceQuotes.filter((quote) => corpus.includes(quote));
      const unsupportedQuotes = hit.sourceQuotes.length - supportedQuotes.length;
      if (unsupportedQuotes === 0) return { ...hit, sourceQuotes: supportedQuotes };
      return {
        ...hit,
        confidence: "possible" as const,
        basis: `${hit.basis} Evidence quotation could not be verified against supplied session text; ${unsupportedQuotes} quotation(s) were not retained.`,
        sourceQuotes: supportedQuotes,
      };
    }),
  };
}

chatRouter.post("/", async (req, res) => {
  const parsed = chatRequestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid chat request", issues: parsed.error.issues });

  const input = parsed.data;
  const state = applySourceInputs(getOrCreateSession(input.session.id), input.sourceInputs);
  const requestedStage = input.session.stage;

  try {
    setStage(state, requestedStage);
  } catch (error) {
    return res.status(409).json({
      error: "RULE_001_BLOCKED",
      message: error instanceof Error ? error.message : "Analysis blocked.",
      session: state,
    });
  }

  if (!state.institutionalRecord) {
    return res.json({ content: "Institutional record is missing. Provide the institutional record before analysis can begin.", session: state });
  }
  if (!state.subjectVoice) {
    return res.json({ content: "The subject's own account is missing. Provide it before substantive forensic synthesis can begin.", session: state });
  }
  if (!ai) return res.status(503).json({ error: "AI provider is not configured on the server." });

  try {
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: JSON.stringify({
        stage: state.stage,
        institutionalRecord: state.institutionalRecord,
        subjectVoice: state.subjectVoice,
        messages: input.messages,
      }) }] }],
      config: {
        systemInstruction: FORENSIC_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            content: { type: Type.STRING },
            findings: {
              type: Type.OBJECT,
              properties: {
                stage: { type: Type.STRING },
                claims: { type: Type.ARRAY, items: { type: Type.OBJECT } },
                axiomHits: { type: Type.ARRAY, items: { type: Type.OBJECT } },
                narrativeGaps: { type: Type.ARRAY, items: { type: Type.OBJECT } },
                frameworkFlags: { type: Type.ARRAY, items: { type: Type.OBJECT } },
                prepNotes: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
            },
          },
          required: ["content", "findings"],
        },
      },
    });

    const decoded = JSON.parse(response.text || "{}") as { content?: string; findings?: unknown };
    const findings = findingPayloadSchema.parse(decoded.findings);
    const verified = verifyQuotedSupport(findings, state);
    const outlogic = evaluateOutlogic(verified, state);

    // OUTLOGIC is a deterministic second gate for DEFENSE. Earlier stages may
    // expose REVIEW/HOLD results, but a blocked draft is not stored as a finding.
    if (state.stage === "DEFENSE" && !outlogic.pass) {
      return res.status(409).json({
        error: "OUTLOGIC_BLOCKED",
        message: "Defense synthesis is on hold: source-anchor checks require review.",
        outlogic,
        session: state,
      });
    }

    const finding = { id: randomUUID(), createdAt: Date.now(), payload: verified };
    state.findings.push(finding);
    // The broader dignity, attribution-span, coherence, and framing-drift
    // verifiers are not wired into this route. Their statuses remain REVIEW.
    const audit = deriveSelfAudit(state, {
      dignityPriority: false,
      attribution: false,
      coherence: false,
      unsupportedFacts: false,
      institutionalFramingDrift: false,
    });
    state.lastAudit = audit;
    res.json({ content: decoded.content || "Analysis completed.", finding, audit, outlogic, session: state });
  } catch (error) {
    res.status(502).json({ error: "AI_RESPONSE_REJECTED", message: error instanceof Error ? error.message : "Provider response rejected." });
  }
});
