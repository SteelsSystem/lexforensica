/**
 * Gemini API Service for LEX FORENSICA v7.0
 * Uses the forensic semantic audit engine prompt to analyze legal and medical documentation.
 */

import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { RESEARCH_DEFINITION } from "../research";

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export interface AuditResponse {
  meta: {
    auditId: string;
    timestamp: string;
    version: string;
    method: string;
  };
  riskAssessment: {
    overallLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    summary: string;
    primaryRiskFactors: string[];
  };
  causalMap: {
    layer_past: { summary: string; keyEvents: string[] };
    layer_present: { summary: string; keyEvents: string[] };
    layer_root: { hypothesis: string; mechanismType: string; confidenceScore: number };
  };
  chronology: Array<{
    isoDate: string;
    eventType: string;
    eventLayer: "PAST" | "PRESENT" | "ROOT";
    systemRecord: { content: string; source: string };
    subjectRecord?: { content: string; source: string };
    legalFlags: { national: string[]; international: string[] };
  }>;
  documentationGaps: Array<{
    startDate: string;
    endDate: string;
    durationDays: number;
    missingDocumentType: string;
    criticality: "LOW" | "MEDIUM" | "HIGH";
  }>;
  discrepancyMatrix: Array<{
    eventId: string;
    systemVersion: string;
    subjectVersion: string;
    discrepancyType: string;
    severity: number;
  }>;
  legalMatrix: Array<{
    violationType: string;
    domain: string;
    articles: string[];
    reasoning: string;
    remedySuggestion: string;
  }>;
  conflictOfInterestRegistry: Array<{
    actor: string;
    conflictType: string;
    evidence: string;
  }>;
  researchGrounding: Array<{
    finding: string;
    citation: string;
    applicationNote: string;
    relevanceScore: number;
  }>;
  evidenceDemands: Array<{
    formalDemand: string;
    legalBasis: string;
    absenceInference: string;
  }>;
  escalationPlan: {
    tierActions: {
      tier_0: string[];
      tier_1: string[];
      tier_2: string[];
      tier_3: string[];
    };
  };
  humanIntervention: {
    clarificationQuestions: string[];
    recommendedExpertise: string[];
  };
  auditIntegrity: {
    flagsRaised: string[];
    semanticDriftDetected: boolean;
    epistemicCircularities: string[];
  };
}

export interface AuditInput {
  text: string;
  images: Array<{ data: string; mimeType: string }>;
}

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

export interface FastMetadata {
  auditId: string;
  timestamp: string;
  overallRisk: string;
  keyFlags: string[];
  summary: string;
  lastUpdate: string;
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
    } = {}
  ): Promise<AuditResponse> {
    const { customApiKey, applyMetacognitiveInfluence, mindsetApproach, model } = options;
    const aiClient = this.getAi(customApiKey);
    const selectedModel = model || "gemini-3.1-pro-preview";

    const promptText = `
${RESEARCH_DEFINITION.prompt}

---
[EXECUTION START: DEEP_1 MODE]
Mindset Approach: ${mindsetApproach || "Standard Defensive Architect"}
Apply Metacognitive Influence for INPUT_B: ${applyMetacognitiveInfluence ? "YES" : "NO"}
Model Context: ${selectedModel}

Analyze the following inputs according to the LEX FORENSICA v7.0 protocol.
Apply the LOOP_CYCLE self-correction protocol before finalizing.

### INPUT_A — SYSTEM RECORD LAYER
[See attached text and images for INPUT_A]

### INPUT_B — SUBJECT VOICE LAYER
[See attached text and images for INPUT_B]

Return the analysis in the specified JSON format.
`;

    const contents = [
      { text: promptText },
      { text: "--- INPUT_A DATA ---" },
      { text: inputA.text },
      ...inputA.images.map(img => ({
        inlineData: { data: img.data, mimeType: img.mimeType }
      })),
      { text: "--- INPUT_B DATA ---" },
      { text: inputB.text },
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
    // Ensure meta exists and has an auditId
    if (!parsed.meta) {
      parsed.meta = {
        auditId: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        version: "7.0",
        method: "AI_GENERATED_FALLBACK"
      };
    } else if (!parsed.meta.auditId) {
      parsed.meta.auditId = crypto.randomUUID();
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
    parsed.conflictOfInterestRegistry = parsed.conflictOfInterestRegistry || [];
    parsed.researchGrounding = parsed.researchGrounding || [];
    parsed.evidenceDemands = parsed.evidenceDemands || [];
    
    // Ensure escalationPlan exists
    if (!parsed.escalationPlan || !parsed.escalationPlan.tierActions) {
      parsed.escalationPlan = {
        tierActions: { tier_0: [], tier_1: [], tier_2: [], tier_3: [] }
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
Diskrepance: ${auditContext.discrepancyMatrix?.map(d => d.discrepancyType).join(", ") || 'Není k dispozici'}
Právní porušení: ${auditContext.legalMatrix?.map(l => l.violationType).join(", ") || 'Není k dispozici'}
Sémantický posun: ${auditContext.auditIntegrity?.semanticDriftDetected ? 'DETEKVÁN' : 'NE'}
-----------------------------
` : "";

  const systemInstruction = `
Jsi LEX FORENSICA v7.0 AI Assistant. Tvým úkolem je pomáhat uživatelům v boji proti procesním vadám, dokumentačnímu zkreslení a neoprávněným psychiatrickým hospitalizacím.

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
