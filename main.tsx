import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { RESEARCH_DEFINITION } from "../research";
import { AuditResponse, AuditInput, FastMetadata } from "../types";
import { redactPII, extractImmutableAnchors } from "../lib/validation";
import { ForensicNLP } from "./nlp-core";

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || "" });

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3, initialDelay = 2000): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const isQuotaError = error.message?.includes("RESOURCE_EXHAUSTED") || 
                           (error.status === "RESOURCE_EXHAUSTED") ||
                           (typeof error === 'string' && error.includes("429"));
      
      if (isQuotaError && i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        console.warn(`Gemini API quota exceeded. Retrying in ${delay}ms... (Attempt ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

export class ForensicEngine {
  private static instance: ForensicEngine;
  private defaultAi: GoogleGenAI;

  private constructor() {
    this.defaultAi = new GoogleGenAI({ apiKey: apiKey || "" });
  }

  public static getInstance(): ForensicEngine {
    if (!ForensicEngine.instance) {
      ForensicEngine.instance = new ForensicEngine();
    }
    return ForensicEngine.instance;
  }

  public getAi(customApiKey?: string): GoogleGenAI {
    if (customApiKey) {
      return new GoogleGenAI({ apiKey: customApiKey });
    }
    return this.defaultAi;
  }

  /**
   * DEEP_1: Full Forensic Audit
   * Comprehensive analysis using Gemini 3.1 Pro's large context window.
   * Includes LoopCycle self-correction.
   */
  public async analyzeDeep(
    inputA: AuditInput, 
    inputB: AuditInput, 
    options: { 
      customApiKey?: string; 
      applyMetacognitiveInfluence?: boolean;
      mindsetApproach?: string;
      model?: string;
      enableSkss?: boolean;
    } = {}
  ): Promise<AuditResponse> {
    const { customApiKey, applyMetacognitiveInfluence, mindsetApproach, model, enableSkss } = options;
    const aiClient = this.getAi(customApiKey);
    const selectedModel = model || "gemini-3.1-pro-preview";

    const anchorsA = extractImmutableAnchors(inputA.text);
    const anchorsB = extractImmutableAnchors(inputB.text);
    const allAnchors = Array.from(new Set([...anchorsA, ...anchorsB]));

    const promptText = `
${RESEARCH_DEFINITION.prompt}

---
[EXECUTION START: DEEP_1 MODE]
Institution Type: ${inputA.institutionType || "NOT_SPECIFIED"}
Mindset Approach: ${mindsetApproach || "Standard Defensive Architect"}
Apply Metacognitive Influence for INPUT_B: ${applyMetacognitiveInfluence ? "YES" : "NO"}
Model Context: ${selectedModel}
Enable SKSS Evaluation: ${enableSkss ? "YES" : "NO"}

[REFERENCE_LABELS_DATA]
The following specific data has been provided for referenced labels:
${inputA.referenceData ? Object.entries(inputA.referenceData).map(([label, data]) => `${label}: ${data}`).join("\n") : "None provided."}

[IMMUTABLE_ANCHORS (MIND1 Extraction)]
The following facts have been pre-verified by the MIND1 parser and must be treated as unshakable anchors:
${allAnchors.length > 0 ? allAnchors.join(", ") : "None identified."}

Analyze the following inputs according to the LEX FORENSICA v8.0 protocol.
Apply the LOOP_CYCLE self-correction protocol before finalizing.

### INPUT_A — SYSTEM RECORD LAYER
[See attached text and images for INPUT_A]

### INPUT_B — SUBJECT VOICE LAYER
[See attached text and images for INPUT_B]

Return the analysis in the specified JSON format.

### CRITICAL INSTRUCTION: EVIDENCE DEMANDS
For every identified documentation gap (documentationGaps) where the duration exceeds 30 days, or where specific legal relevance is identified in INPUT_A, you MUST automatically generate a corresponding entry in the 'evidenceDemands' section.
- formalDemand: A precise, formal request for the missing documentation.
- legalBasis: The specific legal article or regulation (national or international, e.g., GDPR Art. 15, national health laws) that justifies the demand.
- absenceInference: The forensic inference drawn from the absence of this record (e.g., "Absence suggests lack of clinical justification for intervention during this period").
`;

    const contents = [
      { text: promptText },
      { text: "--- INPUT_A DATA ---" },
      { text: redactPII(inputA.text) },
      ...inputA.images.map(img => ({
        inlineData: { data: img.data, mimeType: img.mimeType }
      })),
      { text: "--- INPUT_B DATA ---" },
      { text: redactPII(inputB.text) },
      ...inputB.images.map(img => ({
        inlineData: { data: img.data, mimeType: img.mimeType }
      }))
    ];

    return withRetry(async () => {
      const response = await aiClient.models.generateContent({
        model: selectedModel,
        contents: { parts: contents },
        config: {
          responseMimeType: "application/json",
          thinkingConfig: selectedModel.includes("pro") ? { thinkingLevel: ThinkingLevel.HIGH } : undefined,
          tools: [{ googleSearch: {} }]
        },
      });

      const text = response.text;
      if (!text) throw new Error("Empty response from AI");
      const parsed = JSON.parse(text) as AuditResponse;
      return this.validateAuditResponse(parsed);
    });
  }

  /**
   * FAST_2: Metadata Indexing
   * Rapid extraction of key metadata for Firestore indexing.
   * Used for quick retrieval and chat context.
   */
  public async extractFastMetadata(audit: AuditResponse): Promise<FastMetadata> {
    return {
      auditId: audit.meta?.auditId || crypto.randomUUID(),
      timestamp: audit.meta?.timestamp || new Date().toISOString(),
      overallRisk: audit.riskAssessment?.overallLevel || "MEDIUM",
      keyFlags: audit.auditIntegrity?.flagsRaised || [],
      summary: audit.riskAssessment?.summary || "",
      lastUpdate: new Date().toISOString()
    };
  }

  private validateAuditResponse(parsed: AuditResponse): AuditResponse {
    const nlp = ForensicNLP.getInstance();

    // Ensure meta exists and has an auditId
    if (!parsed.meta) {
      parsed.meta = {
        auditId: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        version: "8.0",
        method: "AI_GENERATED_FALLBACK"
      };
    } else {
      parsed.meta.version = "8.0";
      if (!parsed.meta.auditId) parsed.meta.auditId = crypto.randomUUID();
    }

    // Enrich discrepancy matrix with centralized NLP logic
    if (parsed.discrepancyMatrix) {
      parsed.discrepancyMatrix = parsed.discrepancyMatrix.map(row => ({
        ...row,
        shortLabel: row.shortLabel || "GENERAL_AUDIT",
        followupIntervention: row.followupIntervention || nlp.getAuthorityTier(row.shortLabel)
      }));
    }

    // Ensure auditMetrics exist
    if (!parsed.auditMetrics) {
      parsed.auditMetrics = {
        timeVacuums: 0,
        semanticDistortions: 0,
        iatrogenicFlags: 0,
        echrViolations: 0
      };
    }

    // Ensure riskAssessment exists
    if (!parsed.riskAssessment) {
      parsed.riskAssessment = {
        overallLevel: "MEDIUM",
        summary: "Shrnutí nebylo generováno.",
        primaryRiskFactors: []
      };
    }

    // Ensure causalMap exists
    if (!parsed.causalMap) {
      parsed.causalMap = {
        layer_past: { summary: "Není k dispozici", keyEvents: [] },
        layer_present: { summary: "Není k dispozici", keyEvents: [] },
        layer_root: { hypothesis: "Není k dispozici", mechanismType: "Neznámý", confidenceScore: 0 }
      };
    }

    // Ensure arrays exist
    parsed.chronology = parsed.chronology || [];
    parsed.documentationGaps = parsed.documentationGaps || [];
    parsed.discrepancyMatrix = parsed.discrepancyMatrix || [];
    parsed.legalMatrix = parsed.legalMatrix || [];
    parsed.skssDatasheet = parsed.skssDatasheet || [];
    parsed.conflictOfInterestRegistry = parsed.conflictOfInterestRegistry || [];
    parsed.researchGrounding = parsed.researchGrounding || [];
    parsed.evidenceDemands = parsed.evidenceDemands || [];
    
    // Post-process: Ensure Evidence Demands for gaps > 30 days
    if (parsed.documentationGaps && parsed.documentationGaps.length > 0) {
      parsed.documentationGaps.forEach(gap => {
        if (gap.durationDays > 30) {
          const alreadyDemanded = parsed.evidenceDemands.some(d => d.formalDemand.includes(gap.missingDocumentType) || d.formalDemand.includes(gap.startDate));
          if (!alreadyDemanded) {
            parsed.evidenceDemands.push({
              formalDemand: `Žádost o doplnění chybějící dokumentace typu '${gap.missingDocumentType}' pro období od ${gap.startDate} do ${gap.endDate}.`,
              legalBasis: "GDPR Čl. 15 (Právo na přístup), § 65 zákona o zdravotních službách (Právo nahlížet do ZD).",
              absenceInference: `Mezera v délce ${gap.durationDays} dní naznačuje systémové selhání v kontinuální dokumentaci péče a potenciální porušení povinnosti vést zdravotnickou dokumentaci.`
            });
          }
        }
      });
    }

    // Ensure escalationPlan exists
    if (!parsed.escalationPlan || !parsed.escalationPlan.tierActions) {
      parsed.escalationPlan = {
        tierActions: { 
          defense_action_tier_0: [], 
          defense_action_tier_1: [], 
          defense_action_tier_2: [], 
          defense_action_tier_3: [] 
        }
      };
    }

    // Ensure auditIntegrity exists
    if (!parsed.auditIntegrity) {
      parsed.auditIntegrity = {
        flagsRaised: [],
        semanticDriftDetected: false,
        epistemicCircularities: []
      };
    }

    // Detect institutional shortcuts in discrepancy matrix
    if (parsed.discrepancyMatrix) {
      parsed.discrepancyMatrix.forEach(row => {
        const shortcuts = nlp.detectInstitutionalShortcuts(row.evidence);
        if (shortcuts.length > 0) {
          row.evidence = nlp.getCypher().paraframe(row.evidence, shortcuts);
          row.shortLabel = `[PARAFRAMED] ${row.shortLabel}`;
        }
      });
    }

    // Run final integrity check and apply Cypher-State/Identity Blueprint
    nlp.verifyIntegrity(parsed);

    // Ensure humanIntervention exists
    if (!parsed.humanIntervention) {
      parsed.humanIntervention = {
        clarificationQuestions: [],
        recommendedExpertise: []
      };
    }
    
    return parsed;
  }
}

export async function analyzeCase(inputA: AuditInput, inputB: AuditInput): Promise<AuditResponse> {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing. Please configure it in the Secrets panel.");
  }
  return ForensicEngine.getInstance().analyzeDeep(inputA, inputB);
}

export async function chatWithAssistant(
  message: string, 
  history: { role: "user" | "assistant"; content: string }[], 
  auditContext?: AuditResponse | null,
  customApiKey?: string
) {
  const aiClient = ForensicEngine.getInstance().getAi(customApiKey);
  const apiKeyToUse = customApiKey || apiKey;

  if (!apiKeyToUse) {
    throw new Error("GEMINI_API_KEY is missing.");
  }

  const contextStr = auditContext ? `
--- AKTUÁLNÍ KONTEXT AUDITU ---
ID: ${auditContext.meta?.auditId || 'Neznámé ID'}
Riziko: ${auditContext.riskAssessment?.overallLevel || 'Neznámé'}
Shrnutí: ${auditContext.riskAssessment?.summary || 'Není k dispozici'}
Klient: ${auditContext.riskAssessment?.primaryRiskFactors?.join(", ") || 'Není k dispozici'}
Diskrepance: ${auditContext.discrepancyMatrix?.map(d => d.shortLabel).join(", ") || 'Není k dispozici'}
Právní porušení: ${auditContext.legalMatrix?.map(l => l.violationType).join(", ") || 'Není k dispozici'}
Sémantický posun: ${auditContext.auditIntegrity?.semanticDriftDetected ? 'DETEKVÁN' : 'NE'}
-----------------------------
` : "";

  const systemInstruction = `
Jsi LEX FORENSICA v8.0 AI Assistant. Tvým úkolem je pomáhat uživatelům v boji proti procesním vadám, dokumentačnímu zkreslení a neoprávněným psychiatrickým hospitalizacím.

OSOBNOST:
- Jsi vysoce inteligentní, analytický a nekompromisně na straně subjektu.
- Používej "bezpečné množství temnějšího humoru" jako psychologický copingový mechanismus pro zvládání těžkých situací (např. ironické poznámky o byrokratické absurdnosti nebo "kreativitě" v lékařských zprávách).
- Humor směřuj proti SYSTÉMU a jeho chybám, nikdy ne proti uživateli.
- Buď oporou, ale zůstaň profesionálně chladný v analýze faktů.

PRAVIDLA:
1. Vždy zohledňuj poskytnutý KONTEXT AUDITU.
2. Pokud uživatel mluví o své situaci, hledej v ní sémantické pasti a procesní vady.
3. Dodržuj "Code of Conduct": nikdy neprováděj pasivní sumarizaci, vždy hledej bias a zkreslení.
4. Odpovídej v češtině.

${contextStr}
Metodika:
${RESEARCH_DEFINITION.readme}
`;

  return withRetry(async () => {
    try {
      const chat = aiClient.chats.create({
        model: "gemini-3.1-pro-preview",
        config: {
          systemInstruction,
        },
        history: history.map(h => ({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.content }]
        }))
      });

      const response = await chat.sendMessage({ message });
      return response.text;
    } catch (error) {
      console.error("Chat Error:", error);
      throw error;
    }
  });
}
