"use client";

import { ChatMessage } from "@/types";
import ChartRenderer from "./ChartRenderer";
import { BarChart2, User, AlertTriangle, Code2, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import { useState } from "react";

interface MessageBubbleProps {
  message: ChatMessage;
}

function SQLToggle({ sql }: { sql: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="sql-block-wrapper">
      <div className="sql-block-header">
        <button
          onClick={() => setOpen((o) => !o)}
          style={{
            display: "flex", alignItems: "center", gap: 6, background: "none", border: "none",
            cursor: "pointer", color: "var(--text-muted)", fontSize: 12, fontFamily: "inherit",
          }}
        >
          <Code2 size={12} />
          <span className="sql-block-lang">SQL</span>
          {open ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        </button>
        {open && (
          <button
            onClick={copy}
            style={{
              display: "flex", alignItems: "center", gap: 4, background: "none", border: "none",
              cursor: "pointer", color: copied ? "#22c55e" : "var(--text-muted)", fontSize: 11,
              fontFamily: "inherit", transition: "color 0.15s",
            }}
          >
            {copied ? <Check size={11} /> : <Copy size={11} />}
            {copied ? "Copied!" : "Copy"}
          </button>
        )}
      </div>
      {open && (
        <pre className="sql-block-code animate-fade-in">{sql}</pre>
      )}
    </div>
  );
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const resp = message.queryResponse;

  /* ── User ── */
  if (isUser) {
    return (
      <div className="bubble-user">
        <div className="bubble-user-text">{message.content}</div>
        <div className="user-avatar">
          <User size={14} color="white" />
        </div>
      </div>
    );
  }

  /* ── Assistant ── */
  return (
    <div className="bubble-ai">
      <div className="bubble-ai-avatar">
        <BarChart2 size={14} color="white" />
      </div>

      <div className="bubble-ai-body">
        <div className="bubble-ai-name">BI Assistant</div>

        {/* Explanation */}
        {resp?.explanation && (
          <div className="bubble-ai-text">
            <p>{resp.explanation}</p>
            {resp.sql_query && <SQLToggle sql={resp.sql_query} />}
          </div>
        )}

        {/* Error */}
        {resp?.error_message && (
          <div className="bubble-error-text">
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <p>{resp.error_message}</p>
                {resp.sql_query && <SQLToggle sql={resp.sql_query} />}
              </div>
            </div>
          </div>
        )}

        {/* Plain text */}
        {!resp && (
          <div className="bubble-ai-text">
            <p>{message.content}</p>
          </div>
        )}

        {/* Charts */}
        {resp?.charts && resp.charts.length > 0 && (
          <div style={{ marginTop: 4 }}>
            {resp.charts.map((chart, i) => (
              <ChartRenderer key={i} chart={chart} index={i} />
            ))}
          </div>
        )}

        {/* Timestamp */}
        <div className="msg-time">
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
}
