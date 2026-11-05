import type { FindingPayload, SourceKind } from "./schema";

export type OutlogicDecision = "ALLOW_PROVISIONAL" | "HOLD" | "REVIEW";

export interface OutlogicReport {
  version: "OUTLOGIC/1.0";
  coreThinkingVersion: "CORE-THINKING/1.0";
  decision: OutlogicDecision;
  pass: boolean;
  provisionalOnly: true;
  humanReviewRequired: true;
  sourceChannels: {
    institutionalRecordPresent: boolean;
    subjectVoicePresent: boolean;
    missing: SourceKind[];
  };
  claims: Array<{
    index: number;
    source: SourceKind;
    epistemicStatus: "OBSERVED" | "REPORTED" | "INFERRED" | "DISPUTED" | "UNKNOWN" | "UNVERIFIED";
    exactTextMatched: boolean;
    specificAnchors: string[];
    unsupportedAnchors: string[];
    status: "SOURCE_ANCHORED" | "PARAPHRASE_UNVERIFIED" | "UNANCHORED_SPECIFICITY";
  }>;
  unsupportedQuotedSpans: string[];
  decisionStates: ["ALLOW", "DENY", "HOLD", "UNKNOWN", "VETO", "REVIEW"];
  epistemicStates: ["OBSERVED", "REPORTED", "INFERRED", "UNKNOWN", "DISPUTED", "UNVERIFIED"];
  vetoSemantics: string;
  limitations: string[];
}

const SPECIFIC_ANCHOR_PATTERNS = [
  /\b(?:\d{4}-\d{2}-\d{2}|\d{1,2}\.\s?\d{1,2}\.\s?\d{4})\b/g,
  /\b\d+(?:[ .,]\d{3})*(?:[,.]\d+)?\s?(?:Kč|CZK|EUR|USD|%|days?|months?|years?|dnů|dní|měsíců|let)\b/gi,
  /\b\d{1,3}\s?[A-Z]{1,4}\s?\d{1,5}\/\d{4}\b/gi,
];

function normalize(value: string): string {
  return value.normalize("NFKC").replace(/\s+/g, " ").trim().toLocaleLowerCase("en");
}

function normalizedAnchor(value: string): string {
  return normalize(value).replace(/\s+/g, "");
}

function extractSpecificAnchors(value: string): string[] {
  const found = new Set<string>();
  for (const pattern of SPECIFIC_ANCHOR_PATTERNS) {
    pattern.lastIndex = 0;
    for (const match of value.matchAll(pattern)) {
      if (match[0]) found.add(match[0].trim());
    }
  }
  return [...found];
}

function sourceText(source: SourceKind, state: {
  institutionalRecord?: string;
  subjectVoice?: string;
}): string {
  return source === "institutional_record"
    ? state.institutionalRecord || ""
    : state.subjectVoice || "";
}

/**
 * OUTLOGIC is an out-of-model, deterministic anchor check.
 * It detects unsupported specificity; it does not prove semantic entailment or truth.
 */
export function evaluateOutlogic(
  payload: FindingPayload,
  state: { institutionalRecord?: string; subjectVoice?: string },
): OutlogicReport {
  const institutional = state.institutionalRecord || "";
  const subject = state.subjectVoice || "";
  const missing: SourceKind[] = [];
  if (!institutional.trim()) missing.push("institutional_record");
  if (!subject.trim()) missing.push("subject_voice");

  const claims = payload.claims.map((claim, index) => {
    const origin = sourceText(claim.source, state);
    const originNormalized = normalize(origin);
    const exactTextMatched = Boolean(claim.text.trim()) &&
      originNormalized.includes(normalize(claim.text));
    const specificAnchors = extractSpecificAnchors(claim.text);
    const unsupportedAnchors = specificAnchors.filter(
      (anchor) => !normalizedAnchor(origin).includes(normalizedAnchor(anchor)),
    );
    const status = unsupportedAnchors.length
      ? "UNANCHORED_SPECIFICITY" as const
      : exactTextMatched
        ? "SOURCE_ANCHORED" as const
        : "PARAPHRASE_UNVERIFIED" as const;
    const epistemicStatus = claim.epistemicStatus === "OBSERVED" && !exactTextMatched
      ? "UNVERIFIED" as const
      : claim.epistemicStatus;
    return {
      index,
      source: claim.source,
      epistemicStatus,
      exactTextMatched,
      specificAnchors,
      unsupportedAnchors,
      status,
    };
  });

  const combinedSource = normalize(`${institutional}\n${subject}`);
  const unsupportedQuotedSpans = payload.axiomHits.flatMap((hit) =>
    hit.sourceQuotes.filter((quote) => !combinedSource.includes(normalize(quote))),
  );
  const hasUnverifiedQuoteMarker = payload.axiomHits.some((hit) =>
    hit.basis.toLowerCase().includes("quotation could not be verified"),
  );
  const unsupportedSpecificity = claims.some((claim) => claim.unsupportedAnchors.length > 0);
  const unverifiedParaphrases = claims.filter(
    (claim) => claim.status === "PARAPHRASE_UNVERIFIED",
  ).length;
  const pass = missing.length === 0 &&
    claims.length > 0 &&
    !unsupportedSpecificity &&
    unverifiedParaphrases === 0 &&
    unsupportedQuotedSpans.length === 0 &&
    !hasUnverifiedQuoteMarker;

  const decision: OutlogicDecision = missing.length
    ? "HOLD"
    : pass
      ? "ALLOW_PROVISIONAL"
      : "REVIEW";

  return {
    version: "OUTLOGIC/1.0",
    coreThinkingVersion: "CORE-THINKING/1.0",
    decision,
    pass,
    provisionalOnly: true,
    humanReviewRequired: true,
    sourceChannels: {
      institutionalRecordPresent: Boolean(institutional.trim()),
      subjectVoicePresent: Boolean(subject.trim()),
      missing,
    },
    claims,
    unsupportedQuotedSpans,
    decisionStates: ["ALLOW", "DENY", "HOLD", "UNKNOWN", "VETO", "REVIEW"],
    epistemicStates: ["OBSERVED", "REPORTED", "INFERRED", "UNKNOWN", "DISPUTED", "UNVERIFIED"],
    vetoSemantics: "VETO blocks the proposed operation; it does not prove the rejected interpretation false.",
    limitations: [
      "Exact text and specific-anchor checks are not semantic entailment.",
      "A source match does not establish authenticity, authorship, completeness, or factual truth.",
      "Paraphrase claims remain PARAPHRASE_UNVERIFIED and fail the provisional defense gate until source support is made explicit.",
      "Quote support currently checks the combined A+B corpus because the current schema has no quote-level source attribution; claim-specific anchors are checked against the declared source channel.",
      "Epistemic labels are model-proposed classifications and still require human review.",
      "Causal, clinical, legal, and intent conclusions require separate human and source review.",
      "ALLOW_PROVISIONAL is not certification and is not a finding of truth.",
    ],
  };
}
