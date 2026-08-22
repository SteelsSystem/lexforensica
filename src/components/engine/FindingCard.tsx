import type { Finding } from "../../lib/forensics/schema";

export function FindingCard({ finding }: { finding: Finding }) {
  const { claims, axiomHits, narrativeGaps, frameworkFlags, prepNotes } = finding.payload;
  return <article className="finding-card">
    <header>FINDING / {finding.payload.stage}</header>
    {claims.length > 0 && <section><h3>Claims</h3>{claims.map((item, i) => <p key={i}><b>{item.source}</b> · {item.attribution}: {item.text}</p>)}</section>}
    {axiomHits.length > 0 && <section><h3>Axiom hits</h3>{axiomHits.map((item, i) => <p key={i}><b>{item.axiom}</b> / {item.confidence} — {item.basis}<br/><q>{item.sourceQuotes.join("” · “")}</q></p>)}</section>}
    {narrativeGaps.length > 0 && <section><h3>Narrative gaps</h3>{narrativeGaps.map((item, i) => <p key={i}>{item.description} <em>Missing: {item.missingFrom}</em></p>)}</section>}
    {frameworkFlags.length > 0 && <section><h3>Framework flags</h3>{frameworkFlags.map((item, i) => <p key={i}>{item.framework} · {item.status}: {item.issue}</p>)}</section>}
    {prepNotes.length > 0 && <section><h3>Prep notes</h3><ul>{prepNotes.map((item, i) => <li key={i}>{item}</li>)}</ul></section>}
  </article>;
}
