"use client";

import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { ChatMessage, SchemaResponse, UploadResponse } from "@/types";
import { sendQuery, getSchema, clearSession, deleteTable } from "@/utils/api";
import ChatInput from "@/components/ChatInput";
import MessageBubble from "@/components/MessageBubble";
import UploadPanel from "@/components/UploadPanel";
import SchemaPanel from "@/components/SchemaPanel";
import {
  BarChart2,
  Database,
  Upload,
  Trash2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Zap,
  Sparkles,
  LogOut,
  Home,
  User,
} from "lucide-react";
import { useAuth } from "@/utils/AuthContext";
import { useRouter } from "next/navigation";
import { auth } from "@/utils/firebase";
import { signOut } from "firebase/auth";

/* ── Typing indicator ── */
function TypingIndicator() {
  return (
    <div className="message-row animate-fade-in">
      <div className="bubble-ai">
        <div className="bubble-ai-avatar">
          <BarChart2 size={15} color="white" />
        </div>
        <div className="bubble-ai-body">
          <div className="bubble-ai-name">BI Assistant</div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, paddingTop: 4 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="typing-dot" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Hero suggestions (removed by request) ── */

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => uuidv4());
  const [schema, setSchema] = useState<SchemaResponse | null>(null);
  const [activeTable, setActiveTable] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"schema" | "upload">("schema");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const saved = localStorage.getItem("bi-theme") as "light" | "dark" | null;
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("bi-theme", theme);
  }, [theme]);

  useEffect(() => { if (user) loadSchema(); }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const loadSchema = async () => {
    try {
      const s = await getSchema();
      setSchema(s);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTable = async (tableName: string) => {
    try {
      await deleteTable(tableName);
      if (activeTable === tableName) {
        setActiveTable(null);
      }
      loadSchema(); // Refresh schema after deletion
    } catch (e: any) {
      alert(e.response?.data?.detail || "Failed to delete table");
      console.error(e);
    }
  };
  if (loading || !user) {
    return <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--content-bg)" }}>Loading...</div>;
  }

  const handleQuery = async (prompt: string) => {
    const userMsg: ChatMessage = {
      id: uuidv4(), role: "user", content: prompt, timestamp: new Date(),
    };
    setMessages((p) => [...p, userMsg]);
    setIsLoading(true);
    try {
      const resp = await sendQuery(prompt, sessionId, activeTable || undefined);
      setMessages((p) => [...p, {
        id: uuidv4(), role: "assistant",
        content: resp.explanation || resp.error_message || "Done.",
        timestamp: new Date(), queryResponse: resp,
      }]);
    } catch (err: unknown) {
      const errMsg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        (err as Error).message ||
        "Network error. Is the backend running?";
      setMessages((p) => [...p, {
        id: uuidv4(), role: "assistant", content: errMsg,
        timestamp: new Date(),
        queryResponse: { session_id: sessionId, prompt, error_message: errMsg, charts: [] },
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = async () => {
    try { await clearSession(sessionId); } catch { }
    setMessages([]);
  };

  const handleUploadSuccess = async (result: UploadResponse) => {
    await loadSchema();
    setActiveTable(result.table_name);
    setActiveTab("schema");
    setMessages((p) => [...p, {
      id: uuidv4(), role: "assistant",
      content: `Uploaded **${result.table_name}** (${result.rows_loaded.toLocaleString()} rows, ${result.columns.length} columns). You can now query this table!`,
      timestamp: new Date(),
    }]);
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>

      {/* ═══ SIDEBAR ═══ */}
      <aside
        style={{
          width: sidebarOpen ? 260 : 0,
          transition: "width 0.25s cubic-bezier(.4,0,.2,1)",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <div className="sidebar" style={{ width: 260 }}>

          {/* Logo */}
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <BarChart2 size={17} color="white" />
            </div>
            <div>
              <div className="sidebar-logo-text">ChatForGeeks</div>
              <div className="sidebar-logo-sub">Conversational Analytics</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="sidebar-tabs">
            {(["schema", "upload"] as const).map((id) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`sidebar-tab ${activeTab === id ? "active" : ""}`}
              >
                {id === "schema" ? <Database size={13} /> : <Upload size={13} />}
                {id === "schema" ? "Schema" : "Upload"}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="sidebar-content">
            {activeTab === "schema" ? (
              <>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--sidebar-muted)" }}>
                    Tables
                  </span>
                  <button
                    onClick={loadSchema}
                    className="sidebar-toggle"
                    title="Refresh"
                  >
                    <RefreshCw size={11} />
                  </button>
                </div>
                <SchemaPanel
                  schema={schema}
                  activeTable={activeTable}
                  onSelectTable={setActiveTable}
                  onDeleteTable={handleDeleteTable}
                />
              </>
            ) : (
              <>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--sidebar-muted)", marginBottom: 10 }}>
                  Upload CSV
                </div>
                <UploadPanel onUploadSuccess={handleUploadSuccess} />
              </>
            )}
          </div>

          {/* Footer */}
          <div className="sidebar-footer">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 10, color: "var(--sidebar-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Session</span>
              <code
                style={{ fontSize: 10, color: "var(--sidebar-muted)", fontFamily: "monospace" }}
                suppressHydrationWarning
              >
                {mounted ? `${sessionId.slice(0, 8)}…` : "--------…"}
              </code>
            </div>
            {activeTable && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }} className="animate-fade-in">
                <span style={{ fontSize: 10, color: "var(--sidebar-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Active</span>
                <div className="badge">
                  <Zap size={9} />
                  {activeTable}
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ═══ MAIN AREA ═══ */}
      <main style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: "var(--content-bg)",
        minWidth: 0,
      }}>

        {/* Header */}
        <header className="main-header">
          <div className="header-brand">
            {/* Sidebar toggle */}
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              className="sidebar-toggle"
              style={{ marginRight: 4 }}
              title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>

            <Sparkles size={16} style={{ color: "var(--accent)" }} />
            <span>ChatForGeeks</span>

            {activeTable && (
              <div className="badge animate-fade-in" style={{ marginLeft: 4 }}>
                <Zap size={9} />
                {activeTable}
              </div>
            )}
          </div>

          <div className="header-actions" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            
            {/* User Profile Badge */}
            {user && (
              <div 
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--sidebar-muted)]/30 bg-[var(--sidebar-muted)]/10"
                title={user.email || "Logged In"}
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-5 h-5 rounded-full" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-[var(--accent)] text-[#121715] flex items-center justify-center">
                    <User size={12} strokeWidth={3} />
                  </div>
                )}
                <span className="text-xs font-medium max-w-[120px] truncate opacity-90">
                  {user.displayName || user.email?.split("@")[0] || "User"}
                </span>
              </div>
            )}

            <div className="h-4 w-px bg-[var(--sidebar-muted)]/30 mx-1 hidden sm:block"></div>

            {/* Home */}
            <button
              onClick={() => router.push("/")}
              className="btn btn-ghost"
              style={{ gap: 5, fontSize: 12, padding: "5px 10px" }}
              title="Go to Homepage"
            >
              <Home size={13} /> Home
            </button>

            {/* Theme toggle */}
            <button
              id="theme-toggle-btn"
              onClick={() => setTheme((t) => t === "light" ? "dark" : "light")}
              className="btn btn-ghost"
              style={{ gap: 5, fontSize: 12, padding: "5px 10px" }}
            >
              {theme === "light"
                ? <><Moon size={13} /> Dark</>
                : <><Sun size={13} /> Light</>
              }
            </button>

            {/* Clear */}
            <button
              id="clear-chat-btn"
              onClick={handleClear}
              disabled={messages.length === 0}
              className="btn btn-danger-ghost"
              style={{ gap: 5, fontSize: 12, padding: "5px 10px" }}
            >
              <Trash2 size={12} />
              Clear
            </button>

            {/* Logout */}
            <button
              onClick={() => signOut(auth)}
              className="btn btn-ghost"
              style={{ gap: 5, fontSize: 12, padding: "5px 10px" }}
              title="Sign Out"
            >
              <LogOut size={12} />
              Logout
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="messages-area">
          {messages.length === 0 ? (
            /* ── Hero ── */
            <div className="hero animate-fade-in">
              <div className="hero-icon">
                <BarChart2 size={26} color="white" />
              </div>

              <h1 className="hero-title">Ask your data anything</h1>
              <p className="hero-sub" style={{marginBottom: "30px"}}>
                Type a business question in plain English. Claude AI generates SQL,
                runs it, and builds an interactive chart instantly.
              </p>

              <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 8 }}>
                Type your question below ↓
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="message-row">
                <MessageBubble message={msg} onSuggestionClick={handleQuery} />
              </div>
            ))
          )}

          {isLoading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="input-area">
          <div className="input-wrap">
            <ChatInput
              onSubmit={handleQuery}
              isLoading={isLoading}
              placeholder={activeTable ? `Ask about "${activeTable}"…` : "Ask a question about your data…"}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
