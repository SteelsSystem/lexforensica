import { useMemo, useState } from "react";
import { PipelineRail } from "../components/archive/PipelineRail";
import { ChatTranscript } from "../components/engine/ChatTranscript";
import { Composer } from "../components/engine/Composer";
import type { Finding, PipelineStage, SelfAudit } from "../lib/forensics/schema";

type Message = { role: "system" | "user" | "assistant"; content: string; finding?: Finding; audit?: SelfAudit };

export default function EngineRoute() {
  const [stage, setStage] = useState<PipelineStage>("INTAKE");
  const [sessionId, setSessionId] = useState(() => crypto.randomUUID());
  const [institutionalRecord, setInstitutionalRecord] = useState("");
  const [subjectVoice, setSubjectVoice] = useState("");
  const [messages, setMessages] = useState<Message[]>([{ role: "system", content: "INTAKE / Provide the institutional record. The engine will then request the subject's own account before substantive synthesis." }]);
  const findings = useMemo(() => messages.flatMap((m) => m.finding ? [m.finding] : []), [messages]);

  async function send(content: string) {
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    const response = await fetch("/api/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({
      messages: next.map(({ role, content }) => ({ role, content })),
      session: { id: sessionId, stage, institutionalRecordPresent: Boolean(institutionalRecord.trim()), subjectVoicePresent: Boolean(subjectVoice.trim()), findings },
      sourceInputs: { institutionalRecord, subjectVoice },
    }) });
    const data = await response.json();
    if (data.session?.id) setSessionId(data.session.id);
    if (data.session?.stage) setStage(data.session.stage);
    setMessages((current) => [...current, { role: "assistant", content: data.content || data.message || data.error || "Request failed.", finding: data.finding, audit: data.audit }]);
  }

  return <main className="engine-shell">
    <PipelineRail stage={stage} />
    <section className="engine-main">
      <header className="engine-heading"><div><span>LEX FORENSICA / NARRATIVE ENGINE</span><h1>Evidence-bound analysis with the subject account intact.</h1></div><div className="stage-readout">STAGE / {stage}</div></header>
      <div className="source-inputs">
        <label>INSTITUTIONAL RECORD<textarea value={institutionalRecord} onChange={(e) => { setInstitutionalRecord(e.target.value); if (e.target.value.trim()) setStage("MIND1"); }} placeholder="Paste the institutional record…" /></label>
        <label>SUBJECT VOICE<textarea value={subjectVoice} onChange={(e) => { setSubjectVoice(e.target.value); if (institutionalRecord.trim() && e.target.value.trim()) setStage("BRIDGE"); }} placeholder="Paste the subject's own account…" /></label>
      </div>
      <ChatTranscript messages={messages} />
      <Composer onSend={send} />
    </section>
    <aside className="telemetry"><h2>SESSION TELEMETRY</h2><dl><div><dt>Record</dt><dd>{institutionalRecord ? "PRESENT" : "MISSING"}</dd></div><div><dt>Subject voice</dt><dd>{subjectVoice ? "PRESENT" : "MISSING"}</dd></div><div><dt>Findings</dt><dd>{findings.length}</dd></div><div><dt>Traceability</dt><dd>SESSION TEXT</dd></div></dl><p>Green or positive status indicates traceability to supplied text, not objective verification.</p></aside>
  </main>;
}
