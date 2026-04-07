// LEX FORENSICA v8.0 — Core Domain Model

// Institution types (domain-agnostic)
export enum InstitutionType {
  PSYCHIATRIC = 'PSYCHIATRIC',
  JUDICIAL = 'JUDICIAL',
  ADMINISTRATIVE = 'ADMINISTRATIVE',
  IMMIGRATION = 'IMMIGRATION',
  CUSTODIAL = 'CUSTODIAL',
  REGULATORY = 'REGULATORY',
  MEDICAL_GENERAL = 'MEDICAL_GENERAL',
  CHILD_PROTECTIVE = 'CHILD_PROTECTIVE',
  OTHER = 'OTHER',
}

export enum CausalityLayer {
  TEMPORAL = 'TEMPORAL',
  PROCEDURAL = 'PROCEDURAL',
  PHARMACOLOGICAL = 'PHARMACOLOGICAL',
  INSTITUTIONAL = 'INSTITUTIONAL',
  EPISTEMIC = 'EPISTEMIC',
}

export enum ChronologicalAnomaly {
  TIME_VACUUM = 'TIME_VACUUM',
  RETROACTIVE_JUSTIFICATION = 'RETROACTIVE_JUSTIFICATION',
  TEMPORAL_INVERSION = 'TEMPORAL_INVERSION',
  DOCUMENTATION_DELAY = 'DOCUMENTATION_DELAY',
  PARALLEL_TIMELINE = 'PARALLEL_TIMELINE',
}

export enum SemanticDistortion {
  TERMINOLOGICAL_BIAS = 'TERMINOLOGICAL_BIAS',
  COMPLIANCE_FRAMING = 'COMPLIANCE_FRAMING',
  IATROGENIC_ATTRIBUTION = 'IATROGENIC_ATTRIBUTION',
  CIRCULAR_REASONING = 'CIRCULAR_REASONING',
  AUTHORITY_LAUNDERING = 'AUTHORITY_LAUNDERING',
  LINGUISTIC_GASLIGHTING = 'LINGUISTIC_GASLIGHTING',
}

export enum OperationalAxiom {
  A1_FORENSIC_SPOLIATION = 'A1',
  A2_SEMANTIC_NEUTRALIZATION = 'A2',
  A3_IATROGENIC_ATTRIBUTION = 'A3',
  A4_EPISTEMIC_CIRCULARITY = 'A4',
  A5_STRUCTURAL_BIAS = 'A5',
  A6_JUDICIAL_ABANDONMENT = 'A6',
}

export enum CypherState {
  MIND1_STATIC_PREPROCESSING = 'MIND1',
  DEEP1_FORENSIC_REASONING = 'DEEP_1',
  LOOP_CYCLE_SELF_CORRECTION = 'LOOP_CYCLE',
  FAST2_METADATA_INDEXING = 'FAST_2',
  DEFENSE_SYNTHESIS = 'DEFENSE_SYNTHESIS',
}

export enum LinguisticMode {
  ORGANIC_CZECH = 'ORGANIC_CZ',
  MECHANICAL_ENGLISH = 'MECHANICAL_EN',
  FORMAL_GERMAN = 'FORMAL_DE',
  HYBRID_CZENGLISH = 'HYBRID_CZEN',
  INSTITUTIONAL_JARGON = 'INSTITUTIONAL',
}

export enum AxiomSeverity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  INFO = 'INFO',
}

export enum SubscriptionTier {
  INDIVIDUAL = 'TIER_1',
  ADVOCATE = 'TIER_2',
  INSTITUTIONAL = 'TIER_3',
}

// Input types
export interface AuditInput {
  inputA: string;
  inputB: string;
  institutionType: InstitutionType;
  language: 'cs' | 'en' | 'de';
  referenceData?: Record<string, string>;
}

// Normalized Event Frame (MIND1 output)
export interface NormalizedEventFrame {
  id: string;
  source: 'INPUT_A' | 'INPUT_B';
  actor: string;
  predicate: string;
  object: string;
  negation: boolean;
  negationScope?: string[];
  date: string | null;
  lexicalEscalation: 0 | 1 | 2 | 3;
  potentialIatrogenic: boolean;
  evidentiaryStrength: 'STRONG' | 'WEAK' | 'NONE';
}

// Immutable fact checkpoint (resolves CG-10)
export interface FactCheckpoint {
  id: string;
  frameRef: string;
  date: string;
  fact: string;
  source: 'INPUT_A' | 'INPUT_B';
  hash: string;
  locked: true;
}

// Social Identity Blueprint
export interface SocialIdentityBlueprint {
  gasLightingMarkers: string[];
  internalizedOppression: string[];
  institutionalFramingPatterns: string[];
  subjectVoicePreservation: {
    directQuotes: string[];
    paraphrasedClaims: string[];
    emotionalState: string;
  };
}

// Discrepancy Matrix entry
export interface DiscrepancyEntry {
  id: string;
  refCode: string;
  axiom: OperationalAxiom;
  severity: AxiomSeverity;
  finding: string;
  evidence: string;
  sourceA: string;
  sourceB: string;
  legalBasis: string;
  remedySuggestion: string;
}

// Legal Matrix entry
export interface LegalMatrixEntry {
  article: string;
  provision: string;
  violation: string;
  evidenceRefs: string[];
  strength: 'STRONG' | 'MODERATE' | 'CIRCUMSTANTIAL';
}

// Axiomatic Violation
export interface AxiomaticViolation {
  code: string;
  axiom: OperationalAxiom;
  finding: string;
  legalArgument: string;
  severity: AxiomSeverity;
  evidenceRefs: string[];
}

// Semantic Drift Timeline entry
export interface SemanticDriftEntry {
  date: string;
  term: string;
  originalContext: string;
  shiftedContext: string;
  pathologizingShift: boolean;
  distortionType: SemanticDistortion;
}

// Defense Synthesis (inside pipeline, resolves BLOCKER-03)
export interface DefenseSynthesis {
  summary: string;
  echrArticles: string[];
  crpdProvisions: string[];
  counterArguments: string[];
  recommendedActions: string[];
  legalBriefDraft: string;
}

// Chronological Anomaly Tracker entry
export interface ChronologicalEntry {
  date: string;
  event: string;
  anomalyType: ChronologicalAnomaly;
  gapDays?: number;
  source: 'INPUT_A' | 'INPUT_B' | 'CROSS_REFERENCE';
}

// Full AuditResponse (LLM structured output)
export interface AuditResponse {
  meta: {
    version: string;
    timestamp: string;
    institutionType: InstitutionType;
    language: 'cs' | 'en' | 'de';
    cypherState: CypherState;
    processingTimeMs: number;
  };
  auditMetrics: {
    totalEntitiesExtracted: number;
    temporalCoverage: { startDate: string; endDate: string };
    inputAWordCount: number;
    inputBWordCount: number;
    crossReferenceHits: number;
  };
  riskAssessment: {
    overallRiskLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
    riskScore: number;
    primaryConcerns: string[];
    immediateActions: string[];
  };
  causalMap: {
    layers: Array<{
      layer: CausalityLayer;
      findings: string[];
      confidence: number;
    }>;
  };
  chronology: ChronologicalEntry[];
  documentationGaps: Array<{
    periodStart: string;
    periodEnd: string;
    gapDays: number;
    significance: string;
    axiomTriggered: OperationalAxiom;
  }>;
  discrepancyMatrix: DiscrepancyEntry[];
  legalMatrix: LegalMatrixEntry[];
  axiomaticViolations: AxiomaticViolation[];
  semanticDriftTimeline: SemanticDriftEntry[];
  auditIntegrity: {
    overallCoherenceScore: number;
    flagsRaised: string[];
    semanticDriftDetected: boolean;
    linguisticMode: LinguisticMode;
    epistemicCircularities: string[];
    loopCycleLog: string[];
  };
  defenseSynthesis: DefenseSynthesis;
  remediationPatches: string[];
  humanIntervention: {
    required: boolean;
    reason: string;
    suggestedExpert: string;
  };
  skssDatasheet?: Array<{
    term: string;
    domain: string;
    definition: string;
    biasIndicator: boolean;
  }>;
}

// LOOP_CYCLE violation
export interface LoopCycleViolation {
  axiom: OperationalAxiom | 'TRIPARTITE' | 'RULE_001';
  severity: AxiomSeverity;
  message: string;
  autoRemediation?: string;
}

// Chat message
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// Firestore document types (all encrypted before write)
export interface StoredAudit {
  id: string;
  uid: string;
  encryptedData: string;
  iv: string;
  salt: string;
  createdAt: number;
  updatedAt: number;
}

export interface StoredMetadata {
  id: string;
  uid: string;
  encryptedData: string;
  iv: string;
  salt: string;
  updatedAt: number;
}

export interface StoredChatHistory {
  id: string;
  uid: string;
  auditId: string;
  encryptedData: string;
  iv: string;
  salt: string;
  updatedAt: number;
}

// SKSS Registry Entry (CoC 0x05)
export interface SKSSEntry {
  id: string;
  term: string;
  domain: string;
  definition: string;
  biasIndicator: boolean;
  phoneticallyAmbiguous: boolean;
  createdAt: number;
}

export interface StoredSKSSEntry {
  id: string;
  uid: string;
  encryptedData: string;
  iv: string;
  salt: string;
  updatedAt: number;
}
