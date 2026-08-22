import type { SelfAudit } from "../../lib/forensics/schema";
export function SelfAuditStrip({ audit }: { audit: SelfAudit }) {
  return <div className="audit-strip">LOOP_CYCLE / LAST OUTPUT&nbsp;&nbsp; DIGNITY PRIORITY: {audit.dignityPriority} &nbsp; SUBJECT VOICE: {audit.subjectVoice} &nbsp; ATTRIBUTION: {audit.attribution} &nbsp; COHERENCE: {audit.coherence} &nbsp; UNSUPPORTED FACTS: {audit.unsupportedFacts}</div>;
}
