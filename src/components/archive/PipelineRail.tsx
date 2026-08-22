import { STAGES, stageLabel } from "../../lib/forensics/doctrine";
import type { PipelineStage } from "../../lib/forensics/schema";

export function PipelineRail({ stage }: { stage: PipelineStage }) {
  const active = STAGES.indexOf(stage);
  return <aside className="pipeline-rail" aria-label="Pipeline state">
    <div className="rail-label">PIPELINE</div>
    {STAGES.map((item, index) => <div key={item} className={`rail-stage ${index === active ? "is-active" : ""} ${index < active ? "is-complete" : ""}`}>
      <span>{String(index + 1).padStart(2, "0")}</span><strong>{stageLabel[item]}</strong>
    </div>)}
  </aside>;
}
