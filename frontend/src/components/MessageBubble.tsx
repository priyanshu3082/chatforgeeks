"use client";

import { ChatMessage } from "@/types";
import ChartRenderer from "./ChartRenderer";
import { BarChart2, User, AlertTriangle, Code2, ChevronDown, ChevronUp, Copy, Check, Download } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

interface MessageBubbleProps {
  message: ChatMessage;
  onSuggestionClick?: (q: string) => void;
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

export default function MessageBubble({ message, onSuggestionClick }: MessageBubbleProps) {
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
            <ReactMarkdown
              components={{
                p: ({children}) => <p style={{ marginBottom: 8 }}>{children}</p>,
                strong: ({children}) => <strong style={{ fontWeight: 700, color: "var(--text-primary)" }}>{children}</strong>,
                em: ({children}) => <em style={{ fontStyle: "italic" }}>{children}</em>,
                ul: ({children}) => <ul style={{ paddingLeft: 18, marginBottom: 8 }}>{children}</ul>,
                ol: ({children}) => <ol style={{ paddingLeft: 18, marginBottom: 8 }}>{children}</ol>,
                li: ({children}) => <li style={{ marginBottom: 4, lineHeight: 1.6 }}>{children}</li>,
                h1: ({children}) => <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: "var(--text-primary)" }}>{children}</h1>,
                h2: ({children}) => <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: "var(--text-primary)" }}>{children}</h2>,
                h3: ({children}) => <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: "var(--text-primary)" }}>{children}</h3>,
                code: ({children}) => <code style={{ background: "var(--content-divider)", padding: "1px 5px", borderRadius: 4, fontFamily: "monospace", fontSize: 12 }}>{children}</code>,
                blockquote: ({children}) => <blockquote style={{ borderLeft: "3px solid var(--accent)", paddingLeft: 10, color: "var(--text-secondary)", marginBottom: 8 }}>{children}</blockquote>,
              }}
            >
              {resp.explanation}
            </ReactMarkdown>
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
            <ReactMarkdown>{message.content}</ReactMarkdown>
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

        {/* Follow Up Questions */}
        {resp?.follow_up_questions && resp.follow_up_questions.length > 0 && (
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 2 }}>
              Related Questions
            </div>
            {resp.follow_up_questions.map((q, i) => (
              <button
                key={i}
                onClick={() => onSuggestionClick?.(q)}
                style={{
                  background: "transparent",
                  border: "1px solid var(--content-border)",
                  borderRadius: 6,
                  padding: "6px 10px",
                  fontSize: 12,
                  color: "var(--accent)",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "background 0.2s, color 0.2s",
                }}
                className="hover-bg-surface hover-border-accent"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Download PDF block */}
        {resp?.download_url && (
            <div style={{ marginTop: 14 }}>
              <a
                href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}${resp.download_url}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "var(--accent)",
                  color: "#fff",
                  textDecoration: "none",
                  padding: "8px 14px",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  boxShadow: "var(--shadow-sm)",
                  transition: "background 0.2s"
                }}
                className="hover-bg-accent-hover"
              >
                <Download size={14} />
                Download Report (PDF)
              </a>
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
