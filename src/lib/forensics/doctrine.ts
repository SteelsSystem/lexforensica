import type { PipelineStage } from "./schema";

export const AXIOMS = {
  A1: "Spoliation",
  A2: "Asymmetry",
  A3: "Narrative Appropriation",
  A4: "Epistemic Circularity",
  A5: "Pathologization of Dissent",
  A6: "Dignity Erasure",
} as const;

export const STAGES: PipelineStage[] = [
  "INTAKE",
  "MIND1",
  "BRIDGE",
  "DEEP_1",
  "LOOP_CYCLE",
  "DEFENSE",
];

export const stageLabel: Record<PipelineStage, string> = {
  INTAKE: "Intake",
  MIND1: "Mind 1",
  BRIDGE: "Bridge",
  DEEP_1: "Deep 1",
  LOOP_CYCLE: "Loop Cycle",
  DEFENSE: "Defense",
};

export const canRunSubstantiveAnalysis = (state: {
  institutionalRecord?: string;
  subjectVoice?: string;
}) => Boolean(state.institutionalRecord?.trim() && state.subjectVoice?.trim());
