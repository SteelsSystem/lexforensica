import { useState } from "react";
export function Composer({ onSend }: { onSend: (value: string) => void }) {
  const [value, setValue] = useState("");
  return <form className="composer" onSubmit={(e) => { e.preventDefault(); if (!value.trim()) return; onSend(value.trim()); setValue(""); }}>
    <textarea value={value} onChange={(e) => setValue(e.target.value)} placeholder="Add source text or ask a question…" aria-label="Message" />
    <button type="submit">TRANSMIT</button>
  </form>;
}
