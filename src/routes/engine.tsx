import { useMemo, useState } from "react";
import { PipelineRail } from "../components/archive/PipelineRail";
import { ChatTranscript } from "../components/engine/ChatTranscript";
import { Composer } from "../components/engine/Composer";
import type { Finding, PipelineStage, SelfAudit } from "../lib/forensics/schema";

type Message = {
  role: "system" | "user" | "assistant";
  content: string;
  finding?: Finding;
  audit?: SelfAudit;
};

export default function EngineRoute() {
  const [stage, setStage] = useState<PipelineStage>("INTAKE");
  const [sessionId, setSessionId] = useState(() => crypto.randomUUID());
  const [institutionalRecord, setInstitutionalRecord] = useState("");
  const [subjectVoice, setSubjectVoice] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content: "INTAKE / Paste the institutional record below or send it through the chat. The engine will request the subject's own account before substantive synthesis.",
    },
  ]);

  const findings = useMemo(
    () => messages.flatMap((message) => (message.finding ? [message.finding] : [])),
    [messages],
  );

  async function send(content: string) {
    if (isSending) return;

    const userMessage: Message = { role: "user", content };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content: messageContent }) => ({ role, content: messageContent })),
          session: {
            id: sessionId,
            stage,
            institutionalRecordPresent: Boolean(institutionalRecord.trim()),
            subjectVoicePresent: Boolean(subjectVoice.trim()),
            findings,
          },
          sourceInputs: {
            institutionalRecord,
            subjectVoice,
          },
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (data.session?.id) setSessionId(data.session.id);
      if (data.session?.stage) setStage(data.session.stage);

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: data.content || data.message || data.error || "The request could not be completed.",
          finding: data.finding,
          audit: data.audit,
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: "The chat connection failed. Your source text remains in this page; try transmitting again.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  function onInstitutionalRecord(value: string) {
    setInstitutionalRecord(value);
  }

  function onSubjectVoice(value: string) {
    setSubjectVoice(value);
  }

  return (
    <main className="engine-shell">
      <PipelineRail stage={stage} />

      <section className="engine-main" aria-label="Narrative engine conversation">
        <header className="engine-heading">
          <div>
            <span>LEX FORENSICA / NARRATIVE ENGINE</span>
            <h1>Conversation, source records, findings.</h1>
            <p>
              You can write normally below. For substantive forensic analysis, both the institutional record and the subject's own account must be present.
            </p>
          </div>
          <div className="stage-readout">STAGE / {stage}</div>
        </header>

        <div className="source-inputs">
          <label>
            <span>INSTITUTIONAL RECORD</span>
            <textarea
              value={institutionalRecord}
              onChange={(event) => onInstitutionalRecord(event.target.value)}
              placeholder="Paste the institutional record here…"
            />
          </label>
          <label>
            <span>SUBJECT VOICE</span>
            <textarea
              value={subjectVoice}
              onChange={(event) => onSubjectVoice(event.target.value)}
              placeholder="Paste or write the subject's own account here…"
            />
          </label>
        </div>

        <ChatTranscript messages={messages} />
        <Composer onSend={send} disabled={isSending} />
      </section>

      <aside className="telemetry" aria-label="Session telemetry">
        <h2>SESSION TELEMETRY</h2>
        <dl>
          <div><dt>Record</dt><dd>{institutionalRecord.trim() ? "PRESENT" : "MISSING"}</dd></div>
          <div><dt>Subject voice</dt><dd>{subjectVoice.trim() ? "PRESENT" : "MISSING"}</dd></div>
          <div><dt>Findings</dt><dd>{findings.length}</dd></div>
          <div><dt>Connection</dt><dd>{isSending ? "PROCESSING" : "READY"}</dd></div>
          <div><dt>Traceability</dt><dd>SESSION TEXT</dd></div>
        </dl>
        <p>Positive status means traceable to supplied session text, not objectively established.</p>
      </aside>
    </main>
  );
}
