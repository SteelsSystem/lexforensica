import type { Finding, SelfAudit } from "../../lib/forensics/schema";
import { FindingCard } from "./FindingCard";
import { SelfAuditStrip } from "./SelfAuditStrip";

type Message = { role: "system" | "user" | "assistant"; content: string; finding?: Finding; audit?: SelfAudit };
export function ChatTranscript({ messages }: { messages: Message[] }) {
  return <div className="transcript">{messages.map((message, i) => <div key={i} className={`message message-${message.role}`}>
    <div className="message-kind">{message.role === "assistant" ? "ENGINE" : message.role === "user" ? "SUBJECT" : "SYSTEM"}</div>
    <div className="message-content">{message.content}</div>
    {message.finding && <FindingCard finding={message.finding} />}
    {message.audit && <SelfAuditStrip audit={message.audit} />}
  </div>)}</div>;
}
