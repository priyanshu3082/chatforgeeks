"use client";

import { useState, useRef } from "react";
import { CloudUpload, X, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { uploadFile } from "@/utils/api";
import { UploadResponse } from "@/types";

interface Props {
  onUploadSuccess: (r: UploadResponse) => void;
}

export default function UploadPanel({ onUploadSuccess }: Props) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    const validExts = [".csv", ".json", ".xls", ".xlsx"];
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!validExts.includes(ext)) { setError("Only .csv, .json, and .xlsx files supported."); return; }
    setUploading(true); setError(null); setResult(null); setProgress(0);

    const t = setInterval(() => setProgress((p) => Math.min(p + 15, 88)), 200);
    try {
      const res = await uploadFile(file);
      clearInterval(t); setProgress(100);
      setTimeout(() => { setResult(res); onUploadSuccess(res); setProgress(0); }, 400);
    } catch (e: unknown) {
      clearInterval(t); setProgress(0);
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
        || (e as Error).message || "Upload failed.";
      setError(msg);
    } finally { setUploading(false); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Drop zone */}
      <div
        className={`drop-zone ${dragging ? "drag-over" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        onClick={() => ref.current?.click()}
        style={{ cursor: uploading ? "default" : "pointer" }}
      >
        <input ref={ref} type="file" accept=".csv,.json,.xls,.xlsx" className="hidden" id="csv-upload-input"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />

        {uploading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <Loader2 size={22} className="spinner" style={{ color: "#d97706" }} />
            <span style={{ fontSize: 12, color: "var(--sidebar-text)" }}>Processing…</span>
            <div className="progress-bar-track" style={{ width: "100%" }}>
              <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <CloudUpload size={22} style={{ color: dragging ? "#d97706" : "var(--sidebar-muted)" }} />
            <p style={{ fontSize: 12, color: "var(--sidebar-text)" }}>
              {dragging ? "Drop it!" : <>Drop a <strong style={{ color: "#d97706" }}>.csv, .json, or excel file</strong> or click</>}
            </p>
            <p style={{ fontSize: 10, color: "var(--sidebar-muted)" }}>Any tabular data file with headers</p>
          </div>
        )}
      </div>

      {/* Success */}
      {result && (
        <div style={{
          background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.2)",
          borderRadius: 9, padding: "10px 12px",
        }} className="animate-slide-up">
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <CheckCircle size={13} style={{ color: "#22c55e" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#15803d" }}>Uploaded!</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--sidebar-muted)", display: "flex", flexDirection: "column", gap: 2 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Table</span>
              <span style={{ color: "var(--sidebar-text)", fontWeight: 600 }}>{result.table_name}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Rows</span>
              <span style={{ color: "var(--sidebar-text)", fontWeight: 600 }}>{result.rows_loaded.toLocaleString()}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Columns</span>
              <span style={{ color: "var(--sidebar-text)", fontWeight: 600 }}>{result.columns.length}</span>
            </div>
          </div>
          <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 4 }}>
            {result.columns.slice(0, 5).map((c) => (
              <span key={c.name} style={{
                fontSize: 10, padding: "2px 7px", borderRadius: 99,
                background: "rgba(255,255,255,0.06)", color: "var(--sidebar-muted)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}>
                <FileText size={8} style={{ display: "inline", marginRight: 3 }} />
                {c.name}
              </span>
            ))}
            {result.columns.length > 5 && (
              <span style={{ fontSize: 10, color: "var(--sidebar-muted)" }}>+{result.columns.length - 5} more</span>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: 9, padding: "10px 12px", display: "flex", gap: 8, alignItems: "flex-start",
        }} className="animate-fade-in">
          <AlertCircle size={13} style={{ color: "#ef4444", flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 12, color: "#ef4444", flex: 1 }}>{error}</span>
          <button onClick={() => setError(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444" }}>
            <X size={12} />
          </button>
        </div>
      )}

      {/* Tips */}
      {!result && !error && !uploading && (
        <div style={{ fontSize: 10, color: "var(--sidebar-muted)", lineHeight: 1.6 }}>
          <p style={{ fontWeight: 700, marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.05em" }}>Tips</p>
          <p>• First row must be column headers</p>
          <p>• Use YYYY-MM-DD for date columns</p>
          <p>• Numeric columns enable math queries</p>
        </div>
      )}
    </div>
  );
}
