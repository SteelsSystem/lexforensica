import test from "node:test";
import assert from "node:assert/strict";
import { deriveSelfAudit } from "./audit";
import { evaluateOutlogic } from "./outlogic";
import type { FindingPayload } from "./schema";

const noChecks = {
  dignityPriority: false,
  attribution: false,
  coherence: false,
  unsupportedFacts: false,
  institutionalFramingDrift: false,
};

test("audit stage and subject-voice status derive from session state", () => {
  const audit = deriveSelfAudit({ stage: "DEEP_1", subjectVoice: "  first-person account  " }, noChecks);
  assert.equal(audit.stage, "DEEP_1");
  assert.equal(audit.subjectVoice, "PRESENT");

  const absent = deriveSelfAudit({ stage: "INTAKE", subjectVoice: "   " }, noChecks);
  assert.equal(absent.stage, "INTAKE");
  assert.equal(absent.subjectVoice, "ABSENT");
});

test("unavailable verifiers never emit PASS or NONE_IDENTIFIED", () => {
  const audit = deriveSelfAudit({ stage: "BRIDGE", subjectVoice: "account" }, noChecks);
  assert.equal(audit.dignityPriority, "REVIEW");
  assert.equal(audit.attribution, "REVIEW");
  assert.equal(audit.coherence, "REVIEW");
  assert.equal(audit.unsupportedFacts, "REVIEW_REQUIRED");
  assert.equal(audit.institutionalFramingDrift, "REVIEW_REQUIRED");
});

test("a status changes only when its corresponding verifier result changes", () => {
  const audit = deriveSelfAudit(
    { stage: "LOOP_CYCLE", subjectVoice: "account" },
    { ...noChecks, attribution: true, coherence: true },
  );
  assert.equal(audit.attribution, "PASS");
  assert.equal(audit.coherence, "REVIEWED");
  assert.equal(audit.dignityPriority, "REVIEW");
});

import { verifyQuotedSupport } from "../../routes/api/chat";

test("unverifiable model hits remain visible as possible, without fabricated source quotes", () => {
  const payload = {
    stage: "DEEP_1" as const,
    claims: [],
    axiomHits: [{
      axiom: "A4" as const,
      confidence: "strongly_supported" as const,
      basis: "Model-supplied basis",
      sourceQuotes: ["quote not present in supplied material"],
    }],
    narrativeGaps: [],
    frameworkFlags: [],
    prepNotes: [],
  };
  const result = verifyQuotedSupport(payload, {
    institutionalRecord: "institutional text",
    subjectVoice: "subject text",
  });
  assert.equal(result.axiomHits.length, 1);
  assert.equal(result.axiomHits[0].confidence, "possible");
  assert.deepEqual(result.axiomHits[0].sourceQuotes, []);
  assert.match(result.axiomHits[0].basis, /could not be verified/);
});

test("OUTLOGIC allows only provisional output when both channels and anchors are present", () => {
  const payload: FindingPayload = {
    stage: "DEEP_1",
    claims: [{
      source: "institutional_record",
      text: "The record date is 12. 9. 2025.",
      attribution: "Institutional record",
    }],
    axiomHits: [],
    narrativeGaps: [],
    frameworkFlags: [],
    prepNotes: [],
  };
  const result = evaluateOutlogic(payload, {
    institutionalRecord: "The record date is 12. 9. 2025.",
    subjectVoice: "I dispute the record's interpretation.",
  });
  assert.equal(result.pass, true);
  assert.equal(result.decision, "ALLOW_PROVISIONAL");
  assert.equal(result.provisionalOnly, true);
  assert.equal(result.humanReviewRequired, true);
});

test("OUTLOGIC blocks a specific date that is absent from the attributed source", () => {
  const payload: FindingPayload = {
    stage: "DEEP_1",
    claims: [{
      source: "institutional_record",
      text: "The record date is 13. 9. 2025.",
      attribution: "Institutional record",
    }],
    axiomHits: [],
    narrativeGaps: [],
    frameworkFlags: [],
    prepNotes: [],
  };
  const result = evaluateOutlogic(payload, {
    institutionalRecord: "The record date is 12. 9. 2025.",
    subjectVoice: "I dispute the record's interpretation.",
  });
  assert.equal(result.pass, false);
  assert.equal(result.decision, "REVIEW");
  assert.equal(result.claims[0].status, "UNANCHORED_SPECIFICITY");
});

test("OUTLOGIC holds when one RULE_001 source channel is missing", () => {
  const payload: FindingPayload = {
    stage: "DEEP_1",
    claims: [{
      source: "institutional_record",
      text: "A plain statement.",
      attribution: "Institutional record",
    }],
    axiomHits: [],
    narrativeGaps: [],
    frameworkFlags: [],
    prepNotes: [],
  };
  const result = evaluateOutlogic(payload, {
    institutionalRecord: "A plain statement.",
    subjectVoice: "",
  });
  assert.equal(result.pass, false);
  assert.equal(result.decision, "HOLD");
  assert.deepEqual(result.sourceChannels.missing, ["subject_voice"]);
  assert.ok(result.decisionStates.includes("VETO"));
});

test("partial quote support is downgraded and the unsupported quote is disclosed", () => {
  const payload = {
    stage: "DEEP_1" as const,
    claims: [],
    axiomHits: [{
      axiom: "A4" as const,
      confidence: "strongly_supported" as const,
      basis: "Model-supplied basis",
      sourceQuotes: [
        "A quotation present in the institutional record.",
        "A quotation that does not exist in the source.",
      ],
    }],
    narrativeGaps: [],
    frameworkFlags: [],
    prepNotes: [],
  };
  const result = verifyQuotedSupport(payload, {
    institutionalRecord: "A quotation present in the institutional record.",
    subjectVoice: "Subject account.",
  });
  assert.equal(result.axiomHits[0].confidence, "possible");
  assert.deepEqual(result.axiomHits[0].sourceQuotes, [
    "A quotation present in the institutional record.",
  ]);
  assert.match(result.axiomHits[0].basis, /1 quotation\(s\) were not retained/);
});

test("OUTLOGIC fails closed on a paraphrase with no exact source anchor", () => {
  const payload: FindingPayload = {
    stage: "DEEP_1",
    claims: [{
      source: "institutional_record",
      text: "The institution imposed a restriction after reviewing the file.",
      attribution: "Institutional record",
    }],
    axiomHits: [],
    narrativeGaps: [],
    frameworkFlags: [],
    prepNotes: [],
  };
  const result = evaluateOutlogic(payload, {
    institutionalRecord: "A review of the file took place before the decision.",
    subjectVoice: "I dispute the interpretation.",
  });
  assert.equal(result.pass, false);
  assert.equal(result.decision, "REVIEW");
  assert.equal(result.claims[0].status, "PARAPHRASE_UNVERIFIED");
});
