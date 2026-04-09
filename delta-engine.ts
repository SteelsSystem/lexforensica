/**
 * LEX FORENSICA v8.0 - Global Type Definitions
 */

export enum CausalityLayer {
  ROOT_CAUSE = "Kořenová příčina (Systémové nastavení/Záměr)",
  PROCESS_FAILURE = "Procesní selhání (Nedodržení závazných postupů)",
  COGNITIVE_BIAS = "Kognitivní a systémový bias (Pochybení lidského operátora)",
  EXECUTION_ERROR = "Chyba provedení (Aktivní konání/Nečinnost)",
  IMPACT = "Přímý následek (Dopad na práva/subjekt)",
}

export enum ChronologicalAnomaly {
  TIME_VACUUM = "Neospravedlnitelné časové vakuum (Prodleva bez legálního důvodu)",
  LOGICAL_CRACK = "Skrytá logická trhlina v posloupnosti (Příčina následuje po následku)",
  DEADLINE_EVASION = "Účelové obcházení lhůt (Umělé prodlužování řízení)",
}

export enum SemanticDistortion {
  TERMINOLOGICAL_BIAS = "Terminologické zkreslení sémantiky (Účelová redefinice pojmu)",
  PHONETIC_BIAS = "Fonetické zkreslení (Záměna podobně znějících/vypadajících entit)",
  CONTEXT_OMISSION = "Vytržení z kontextu (Zamlčení určujícího faktu)",
}

export enum AuthorityTier {
  TIER_1 = "TIER 1 [Ω] Moral Standard",
  TIER_2 = "TIER 2 [Δ] Press/Media",
  TIER_3 = "TIER 3 [◈] Government/Institutional",
}

export enum OperationalAxiom {
  A1 = "A1: Absence of documentation ≠ absence of event",
  A2 = "A2: Compliance framing requires incident dates",
  A3 = "A3: Iatrogenic effects are distinct from symptoms",
  A4 = "A4: Non-falsifiable conclusions are invalid",
  A5 = "A5: Multiple assessments by one expert indicate bias",
  A6 = "A6: Judicial delegation to experts violates ECHR",
}

export enum LegalImpact {
  CONSTITUTIONAL = "Ústavněprávní rozměr (Zásah do ZPS)",
  CRIMINAL = "Trestněprávní rovina",
  ADMINISTRATIVE = "Správní / Medicínské / Administrativní pochybení",
  CIVIL = "Občanskoprávní / Náhrada škody",
  PROCEDURAL = "Procesní vada s fatálním vlivem na validitu",
}

export enum CypherState {
  STATIC = "MIND1_STATIC_PREPROCESSING",
  DYNAMIC = "MIND2_DEEP_REASONING",
  FLUID = "LOOP_CYCLE_SELF_CORRECTION",
  CYPHERED = "ENCRYPTED_FORENSIC_PAYLOAD",
}

export enum LinguisticMode {
  ORGANIC = "ORGANIC_CZECH_FLUIDITY",
  MECHANICAL = "MECHANICAL_ENGLISH_STRUCTURE",
  HYBRID_CZENGLISH = "CZENGLISH_WORD_PLANTING_ERROR",
}

export interface SlangLabel {
  term: string;
  factualShortcut: string;
  hiddenMeaning: string;
  institutionalAccessImpact: "HIGH" | "MEDIUM" | "LOW";
}

export interface WordPlantingError {
  detectedTerm: string;
  intendedMeaning: string;
  rootCause: "LLM_ROOTING" | "INSTITUTIONAL_MISUSE";
  remediation: string;
}

export interface SocialIdentityBlueprint {
  subjectRole: "WITNESS" | "ACTOR" | "SURVIVOR" | "SUBJECT";
  internalizedOppressionDetected: boolean;
  gaslightingMarkers: string[];
  reconstructedNarrative: string;
  identitySovereigntyScore: number;
}

export interface InstitutionalShortcut {
  jargon: string;
  paraframedMeaning: string;
  institutionalBiasScore: number;
  axiomViolation?: OperationalAxiom;
}

export interface ChronometerData {
  expectedSequence: string;
  actualSequence: string;
  anomalyType: ChronologicalAnomaly;
  timeGapDuration: string;
  unjustifiedVacuum: boolean; 
}

export interface SemanticBridgeData {
  originalTerm: string;
  distortedTerm: string;
  distortionType: SemanticDistortion;
  cognitiveBiasDetected: boolean;
  impactOnMeaning: string;
}

export interface ForensicEvidence {
  id: string;
  contentSnippet: string;
  source: string;
  timestamp: string;
}

export interface AnalyticalNode {
  nodeId: string;
  eventDescription: string;
  causality: CausalityLayer;
  impactLayer: LegalImpact;
  chronometerAnalysis?: ChronometerData;
  semanticAnalysis?: SemanticBridgeData;
  linkedEvidenceIds: string[];
  logicalJustification: string;
  mitigationRequirement: string;
}

export type InstitutionType = "MEDICAL" | "GOVERNMENTAL_POLICE" | "FINANCIAL";

export interface ReferenceData {
  [label: string]: string;
}

export interface AuditInput {
  text: string;
  images: Array<{ data: string; mimeType: string }>;
  institutionType?: InstitutionType;
  referenceData?: ReferenceData;
}

export interface MedicalLineEntry {
  year: string;
  event: string;
  institutionalLabel: string;
  legalRelevance: string;
  evidenceWeight: "Nízká" | "Střední" | "Vysoká";
}

export interface CognitiveLineEntry {
  year: string;
  experience: string;
  internalInterpretation: string;
  scientificContext: string;
  usability: string;
}

export interface NeuroAnalogyEntry {
  marker: string;
  biologicalMechanism: string;
  institutionalMisinterpretation: string;
  forensicRelevance: string;
  impactScore: number;
}

export interface ChangelogEntry {
  timestamp: string;
  module: string;
  changeType: "STRUCTURAL" | "METACODE" | "SEMANTIC";
  deductionReason: string;
  outputAnalysed: string;
  cypheringMethod: string;
}

export interface NetworkNode {
  id: string;
  label: string;
  type: "INSTRUCTION" | "DATABASE" | "NLP_CORE";
  status: "ACTIVE" | "IDLE" | "SYNCING";
  connections: string[];
}

export interface ControlRoomState {
  nodes: NetworkNode[];
  changelog: ChangelogEntry[];
  systemAnalysis: string;
}

export interface TerminologyUpgrade {
  originalTerm: string;
  upgradedTerm: string;
  reasoning: string;
  alignmentScore: number;
}

export interface SecretsAlignment {
  selfIntegrityString: string;
  transcriptionReport: string;
  whyToFunctionReason: string;
  pdfAnalysis: {
    inputHash: string;
    outputHash: string;
    alignmentStatus: "SYNCED" | "DRIFT_DETECTED";
  };
  terminologyUpgrades: TerminologyUpgrade[];
}

export interface DeltaStateAudit {
  medicalLine: MedicalLineEntry[];
  cognitiveLine: CognitiveLineEntry[];
  neuroAnalogy: NeuroAnalogyEntry[];
  metaLoop: {
    inputMind: string;
    nlpParsing: string;
    correlation: string;
    outputScience: string;
    feedbackLoop: string;
  };
  stateOfMeaning: string;
}

export interface AuditResponse {
  meta: {
    auditId: string;
    timestamp: string;
    version: string;
    method: string;
  };
  auditMetrics: {
    timeVacuums: number;
    semanticDistortions: number;
    iatrogenicFlags: number;
    echrViolations: number;
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
    id: number;
    time: string;
    claimA: string;
    claimB: string;
    shortLabel: string;
    evidence: string;
    severity: string;
    followupIntervention: string;
  }>;
  legalMatrix: Array<{
    violationType: string;
    domain: string;
    articles: string[];
    reasoning: string;
    remedySuggestion: string;
  }>;
  skssDatasheet?: Array<{
    term: string;
    domain: string;
    definition: string;
    importance: string;
    connections: string;
    ethicalWeight: string;
    biasFlags: string;
    decompileKey: string;
    upgradeNote: string;
    keywordTier?: "KEYWORD_TIER_1" | "KEYWORD_TIER_2" | "KEYWORD_TIER_3";
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
      defense_action_tier_0: string[];
      defense_action_tier_1: string[];
      defense_action_tier_2: string[];
      defense_action_tier_3: string[];
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
    cypherState?: CypherState;
    identityBlueprint?: SocialIdentityBlueprint;
    linguisticAudit?: {
      mode: LinguisticMode;
      slangLabels: SlangLabel[];
      wordPlantingErrors: WordPlantingError[];
    };
  };
  deltaState?: DeltaStateAudit;
}

export interface FastMetadata {
  auditId: string;
  timestamp: string;
  overallRisk: string;
  keyFlags: string[];
  summary: string;
  lastUpdate: string;
}

export interface PromptTemplate {
  phase: string;
  systemContext: string;
  instructionPlan: string[];
  expectedOutputFormat: string;
}
