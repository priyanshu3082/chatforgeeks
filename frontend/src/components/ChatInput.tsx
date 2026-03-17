"use client";

import { useState, useRef, KeyboardEvent, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";

interface ChatInputProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

const CHIPS = [
  "Show monthly revenue trend",
  "Compare revenue by region",
  "Which product category performs best?",
  "Top 5 regions by profit",
  "Revenue vs profit scatter",
  "Quarterly profit breakdown",
];

export default function ChatInput({ onSubmit, isLoading, placeholder }: ChatInputProps) {
  const [input, setInput] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  const submit = () => {
    const v = input.trim();
    if (!v || isLoading) return;
    onSubmit(v);
    setInput("");
    if (ref.current) ref.current.style.height = "auto";
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
  };

  const onInput = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 180) + "px";
  };

  useEffect(() => { ref.current?.focus(); }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {/* Chips */}
      <div className="chips-row">
        {CHIPS.map((q) => (
          <button
            key={q}
            disabled={isLoading}
            className="chip"
            onClick={() => { setInput(q); ref.current?.focus(); }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input box */}
      <div className="input-box">
        <textarea
          ref={ref}
          id="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          onInput={onInput}
          placeholder={placeholder || "Ask a question about your data…"}
          rows={1}
          disabled={isLoading}
          className="input-textarea"
        />
        <button
          id="send-query-btn"
          onClick={submit}
          disabled={isLoading || !input.trim()}
          className="btn-send"
          aria-label="Send"
        >
          {isLoading
            ? <Loader2 size={15} className="spinner" />
            : <Send size={14} />
          }
        </button>
      </div>

      {/* Hint */}
      <div className="input-hint">
        <kbd>Enter</kbd> to send &nbsp;·&nbsp; <kbd>Shift+Enter</kbd> for new line
        {isLoading && (
          <span style={{ marginLeft: 8, color: "var(--accent)", display: "flex", alignItems: "center", gap: 4 }}>
            <Loader2 size={10} className="spinner" />
            Generating…
          </span>
        )}
      </div>
    </div>
  );
}
