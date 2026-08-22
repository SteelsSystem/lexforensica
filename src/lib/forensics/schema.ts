import { z } from "zod";

export const pipelineStageSchema = z.enum(["INTAKE", "MIND1", "BRIDGE", "DEEP_1", "LOOP_CYCLE", "DEFENSE"]);
export type PipelineStage = z.infer<typeof pipelineStageSchema>;

export const sourceKindSchema = z.enum(["institutional_record", "subject_voice"]);
export type SourceKind = z.infer<typeof sourceKindSchema>;

export const claimSchema = z.object({
  source: sourceKindSchema,
  text: z.string().min(1),
  attribution: z.string().min(1),
});

export const axiomHitSchema = z.object({
  axiom: z.enum(["A1", "A2", "A3", "A4", "A5", "A6"]),
  confidence: z.enum(["possible", "supported", "strongly_supported"]),
  basis: z.string().min(1),
  sourceQuotes: z.array(z.string().min(1)).min(1),
});

export const narrativeGapSchema = z.object({
  description: z.string().min(1),
  missingFrom: z.enum(["institutional_record", "subject_voice", "both"]),
  significance: z.string().min(1),
});

export const frameworkFlagSchema = z.object({
  framework: z.enum(["ECHR", "CRPD", "GDPR"]),
  issue: z.string().min(1),
  status: z.enum(["question_for_review", "potential_relevance"]),
});

export const findingPayloadSchema = z.object({
  stage: z.enum(["MIND1", "BRIDGE", "DEEP_1", "LOOP_CYCLE", "DEFENSE"]),
  claims: z.array(claimSchema),
  axiomHits: z.array(axiomHitSchema),
  narrativeGaps: z.array(narrativeGapSchema),
  frameworkFlags: z.array(frameworkFlagSchema),
  prepNotes: z.array(z.string()),
});

export const selfAuditSchema = z.object({
  stage: pipelineStageSchema,
  dignityPriority: z.enum(["PASS", "REVIEW"]),
  subjectVoice: z.enum(["PRESENT", "ABSENT"]),
  attribution: z.enum(["PASS", "REVIEW"]),
  coherence: z.enum(["REVIEWED", "REVIEW"]),
  unsupportedFacts: z.enum(["NONE_IDENTIFIED", "REVIEW_REQUIRED"]),
  institutionalFramingDrift: z.enum(["NONE_IDENTIFIED", "REVIEW_REQUIRED"]),
});

export const exhibitSchema = z.object({
  id: z.string(),
  kind: sourceKindSchema,
  text: z.string().min(1),
});

export const findingSchema = z.object({
  id: z.string(),
  createdAt: z.number(),
  payload: findingPayloadSchema,
});

export const sessionStateSchema = z.object({
  id: z.string(),
  stage: pipelineStageSchema,
  institutionalRecord: z.string().optional(),
  subjectVoice: z.string().optional(),
  exhibits: z.array(exhibitSchema),
  findings: z.array(findingSchema),
  lastAudit: selfAuditSchema.optional(),
});

export type Claim = z.infer<typeof claimSchema>;
export type AxiomHit = z.infer<typeof axiomHitSchema>;
export type FindingPayload = z.infer<typeof findingPayloadSchema>;
export type SelfAudit = z.infer<typeof selfAuditSchema>;
export type Exhibit = z.infer<typeof exhibitSchema>;
export type Finding = z.infer<typeof findingSchema>;
export type SessionState = z.infer<typeof sessionStateSchema>;

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
});

export const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).max(100),
  session: z.object({
    id: z.string().min(1).optional(),
    stage: pipelineStageSchema,
    institutionalRecordPresent: z.boolean(),
    subjectVoicePresent: z.boolean(),
    findings: z.array(findingSchema).max(100),
  }),
  sourceInputs: z.object({
    institutionalRecord: z.string().optional(),
    subjectVoice: z.string().optional(),
  }).optional(),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
