import test from "node:test";
import assert from "node:assert/strict";
import { deriveSelfAudit } from "./audit";

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
