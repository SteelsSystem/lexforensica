import type { PipelineStage, SelfAudit, SessionState } from "./schema";

export type AuditChecks = {
  dignityPriority: boolean;
  attribution: boolean;
  coherence: boolean;
  unsupportedFacts: boolean;
  institutionalFramingDrift: boolean;
};

/**
 * Convert completed verifier results into display statuses.
 * A false check means "not established", never "passed".
 */
export function deriveSelfAudit(
  state: Pick<SessionState, "stage" | "subjectVoice">,
  checks: AuditChecks,
): SelfAudit {
  const status = (passed: boolean): "PASS" | "REVIEW" =>
    passed ? "PASS" : "REVIEW";

  return {
    stage: state.stage as PipelineStage,
    dignityPriority: status(checks.dignityPriority),
    subjectVoice: state.subjectVoice?.trim() ? "PRESENT" : "ABSENT",
    attribution: status(checks.attribution),
    coherence: checks.coherence ? "REVIEWED" : "REVIEW",
    unsupportedFacts: checks.unsupportedFacts ? "NONE_IDENTIFIED" : "REVIEW_REQUIRED",
    institutionalFramingDrift: checks.institutionalFramingDrift ? "NONE_IDENTIFIED" : "REVIEW_REQUIRED",
  };
}
