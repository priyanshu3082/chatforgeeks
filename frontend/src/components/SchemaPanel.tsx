"use client";

import { useState } from "react";
import { SchemaResponse } from "@/types";
import { Database, ChevronDown, ChevronRight, Table2, Trash2 } from "lucide-react";

interface Props {
  schema: SchemaResponse | null;
  activeTable: string | null;
  onSelectTable: (t: string | null) => void;
  onDeleteTable: (t: string) => void;
}

export default function SchemaPanel({ schema, activeTable, onSelectTable, onDeleteTable }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (name: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  if (!schema || !Object.keys(schema.tables).length) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "24px 8px", textAlign: "center" }}>
        <div style={{
          width: 36, height: 36, borderRadius: 9, background: "var(--sidebar-hover)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Database size={16} color="var(--sidebar-muted)" />
        </div>
        <div>
          <p style={{ fontSize: 12, fontWeight: 500, color: "var(--sidebar-text)", marginBottom: 2 }}>No tables found</p>
          <p style={{ fontSize: 11, color: "var(--sidebar-muted)" }}>Upload a CSV to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {Object.entries(schema.tables).map(([name, cols]) => {
        const isActive = activeTable === name;
        const isOpen = expanded.has(name);

        return (
          <div key={name}>
            <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
              {/* Expand arrow */}
              <button
                onClick={() => toggle(name)}
                style={{
                  width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center",
                  background: "none", border: "none", cursor: "pointer",
                  color: "var(--sidebar-muted)", flexShrink: 0, borderRadius: 4,
                  transition: "color 0.12s",
                }}
              >
                {isOpen
                  ? <ChevronDown size={12} />
                  : <ChevronRight size={12} />
                }
              </button>

              {/* Delete button wrapper */}
              <div 
                className={`schema-table-row ${isActive ? "active" : ""}`}
                style={{ flex: 1, display: "flex", alignItems: "center", paddingRight: "4px", minWidth: 0 }}
              >
                {/* Table row */}
                <button
                  onClick={() => onSelectTable(isActive ? null : name)}
                  style={{ flex: 1, display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", cursor: "pointer", color: "inherit", textAlign: "left", minWidth: 0 }}
                >
                  <Table2 size={11} style={{ color: isActive ? "#e8d9c0" : "var(--sidebar-icon)", flexShrink: 0 }} />
                  <span style={{ flex: 1, fontWeight: isActive ? 600 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>{name}</span>
                  <span style={{
                    fontSize: 10, background: "rgba(255,255,255,0.06)", borderRadius: 99,
                    padding: "1px 6px", color: "var(--sidebar-muted)", fontWeight: 600, flexShrink: 0
                  }}>
                    {cols.length}
                  </span>
                </button>

                {/* Delete action */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Are you sure you want to delete table '${name}'?`)) {
                      onDeleteTable(name);
                    }
                  }}
                  title="Delete Table"
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "var(--sidebar-muted)", padding: "4px", borderRadius: "4px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginLeft: "4px", flexShrink: 0
                  }}
                  className="hover:text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>

            {/* Columns */}
            {isOpen && (
              <div style={{ paddingLeft: 26, paddingBottom: 4 }} className="animate-fade-in">
                {cols.map((col) => (
                  <div
                    key={col.name}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "3px 8px", borderRadius: 5, fontSize: 11,
                      color: "var(--sidebar-muted)",
                    }}
                  >
                    <span style={{ fontFamily: "monospace", fontSize: 11.5 }}>{col.name}</span>
                    <span style={{
                      fontSize: 9, textTransform: "uppercase", letterSpacing: "0.06em",
                      background: "rgba(255,255,255,0.05)", borderRadius: 3, padding: "1px 5px",
                      color: "var(--sidebar-muted)",
                    }}>
                      {col.type.split("(")[0]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
