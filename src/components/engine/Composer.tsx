import { FormEvent, KeyboardEvent, useState } from "react";

type ComposerProps = {
  onSend: (value: string) => Promise<void> | void;
  disabled?: boolean;
};

export function Composer({ onSend, disabled = false }: ComposerProps) {
  const [value, setValue] = useState("");

  async function submit(event?: FormEvent) {
    event?.preventDefault();
    const next = value.trim();
    if (!next || disabled) return;
    setValue("");
    await onSend(next);
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submit();
    }
  }

  return (
    <form className="composer" onSubmit={submit}>
      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={onKeyDown}
        disabled={disabled}
        placeholder={disabled ? "Engine is processing…" : "Write a message, paste source text, or ask what should happen next…"}
        aria-label="Message to Lex Forensica"
      />
      <div className="composer-actions">
        <span>ENTER / SEND · SHIFT+ENTER / NEW LINE</span>
        <button type="submit" disabled={disabled || !value.trim()}>
          {disabled ? "PROCESSING…" : "TRANSMIT"}
        </button>
      </div>
    </form>
  );
}
