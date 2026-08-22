import { randomUUID } from "node:crypto";
import { canRunSubstantiveAnalysis } from "./doctrine";
import type { PipelineStage, SessionState } from "./schema";

const sessions = new Map<string, SessionState>();

export function getOrCreateSession(id?: string): SessionState {
  if (id && sessions.has(id)) return sessions.get(id)!;
  const state: SessionState = {
    id: id || randomUUID(),
    stage: "INTAKE",
    exhibits: [],
    findings: [],
  };
  sessions.set(state.id, state);
  return state;
}

export function applySourceInputs(
  state: SessionState,
  inputs?: { institutionalRecord?: string; subjectVoice?: string },
): SessionState {
  if (inputs?.institutionalRecord?.trim()) {
    state.institutionalRecord = inputs.institutionalRecord.trim();
    state.exhibits = state.exhibits.filter((item) => item.kind !== "institutional_record");
    state.exhibits.push({ id: randomUUID(), kind: "institutional_record", text: state.institutionalRecord });
  }
  if (inputs?.subjectVoice?.trim()) {
    state.subjectVoice = inputs.subjectVoice.trim();
    state.exhibits = state.exhibits.filter((item) => item.kind !== "subject_voice");
    state.exhibits.push({ id: randomUUID(), kind: "subject_voice", text: state.subjectVoice });
  }
  if (state.institutionalRecord && !state.subjectVoice) state.stage = "MIND1";
  if (canRunSubstantiveAnalysis(state) && state.stage === "MIND1") state.stage = "BRIDGE";
  sessions.set(state.id, state);
  return state;
}

export function assertStageAllowed(state: SessionState, requested: PipelineStage) {
  const substantive: PipelineStage[] = ["BRIDGE", "DEEP_1", "LOOP_CYCLE", "DEFENSE"];
  if (substantive.includes(requested) && !canRunSubstantiveAnalysis(state)) {
    throw new Error("RULE_001_BLOCKED: institutional record and subject voice are both required before substantive analysis.");
  }
}

export function setStage(state: SessionState, stage: PipelineStage) {
  assertStageAllowed(state, stage);
  state.stage = stage;
  sessions.set(state.id, state);
}
