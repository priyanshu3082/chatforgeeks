"use client";

import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  AreaChart, Area, PieChart, Pie, Cell, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, TooltipProps, Treemap,
} from "recharts";
import { ChartData } from "@/types";
import { BarChart2, TrendingUp, Activity, PieChart as PieIcon, Zap, Maximize2, Minimize2, Download, LayoutGrid } from "lucide-react";
import { useState } from "react";

const exportCSV = (data: Record<string, unknown>[], columns: string[], title: string) => {
  if (!data || data.length === 0) return;
  const headers = columns.join(",");
  const rows = data.map(row => columns.map(col => `"${String(row[col] ?? '').replace(/"/g, '""')}"`).join(","));
  const csv = [headers, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${title || "export"}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const PALETTE = [
  "#d97706", "#7c3aed", "#0891b2", "#059669",
  "#dc2626", "#7c3aed", "#0d9488", "#ea580c",
  "#6366f1", "#db2777",
];

const ICONS: Record<string, React.ReactNode> = {
  line: <TrendingUp size={13} />,
  area: <Activity size={13} />,
  bar: <BarChart2 size={13} />,
  pie: <PieIcon size={13} />,
  scatter: <Zap size={13} />,
  heatmap: <LayoutGrid size={13} />,
};

type TT = TooltipProps<number, string> & {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
};

const CustomTooltip = ({ active, payload, label }: TT) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--content-surface)",
      border: "1px solid var(--content-border)",
      borderRadius: 10,
      padding: "10px 14px",
      boxShadow: "var(--shadow-lg)",
      fontSize: 13,
      minWidth: 130,
    }}>
      {label && (
        <p style={{ color: "var(--text-secondary)", fontWeight: 600, marginBottom: 6, fontSize: 12 }}>
          {label}
        </p>
      )}
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: i < payload.length - 1 ? 3 : 0 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, display: "inline-block" }} />
          <span style={{ color: "var(--text-muted)" }}>{p.name ? String(p.name).replace(/_/g, ' ').replace(/\b\w/g, match => match.toUpperCase()) : ''}:</span>
          <span style={{ color: "var(--text-primary)", fontWeight: 600, marginLeft: "auto" }}>
            {typeof p.value === "number"
              ? p.value.toLocaleString(undefined, { maximumFractionDigits: 2 })
              : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

function prettyStr(str: string) {
  if (!str) return '';
  return str.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function fmt(v: unknown) {
  if (typeof v === "number") {
    if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
    return v.toFixed(0);
  }
  const pretty = prettyStr(String(v));
  return pretty.length > 15 ? pretty.slice(0, 13) + "…" : pretty;
}

export default function ChartRenderer({ chart, index }: { chart: ChartData; index: number }) {
  const { chart_type, x_axis, y_axis, data, title } = chart;
  const [expanded, setExpanded] = useState(false);

  const axisStyle = { fill: "var(--text-muted)", fontSize: 11, fontFamily: "Inter, sans-serif" };
  const grid = "var(--content-border)";
  const legend = { color: "var(--text-secondary)", fontSize: 12 };
  const props = { data, margin: { top: 8, right: 16, left: 0, bottom: 4 } };

  const renderChart = () => {
    switch (chart_type) {
      case "line":
        return (
          <LineChart {...props}>
            <defs>
              <linearGradient id={`ll-${index}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#d97706" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={grid} />
            <XAxis dataKey={x_axis} tick={axisStyle} tickFormatter={fmt} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} tickFormatter={fmt} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={legend} />
            <Line type="monotone" dataKey={y_axis} name={prettyStr(y_axis)} stroke={`url(#ll-${index})`} strokeWidth={2}
              dot={{ r: 3, fill: "#d97706" }} activeDot={{ r: 5 }} />
          </LineChart>
        );
      case "area":
        return (
          <AreaChart {...props}>
            <defs>
              <linearGradient id={`af-${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d97706" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={grid} />
            <XAxis dataKey={x_axis} tick={axisStyle} tickFormatter={fmt} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} tickFormatter={fmt} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={legend} />
            <Area type="monotone" dataKey={y_axis} name={prettyStr(y_axis)} stroke="#d97706" strokeWidth={2} fill={`url(#af-${index})`} />
          </AreaChart>
        );
      case "bar":
        return (
          <BarChart {...props} barCategoryGap="28%">
            <defs>
              {PALETTE.map((c, i) => (
                <linearGradient key={i} id={`bg-${index}-${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={c} stopOpacity={0.9} />
                  <stop offset="100%" stopColor={c} stopOpacity={0.55} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
            <XAxis dataKey={x_axis} tick={axisStyle} tickFormatter={fmt} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} tickFormatter={fmt} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={legend} />
            <Bar dataKey={y_axis} name={prettyStr(y_axis)} radius={[4, 4, 0, 0]} maxBarSize={56}>
              {data.map((_, i) => (
                <Cell key={i} fill={`url(#bg-${index}-${i % PALETTE.length})`} />
              ))}
            </Bar>
          </BarChart>
        );
      case "pie":
        return (
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={legend} />
            <Pie data={data} dataKey={y_axis} nameKey={x_axis}
              cx="50%" cy="50%" innerRadius="30%" outerRadius="60%" paddingAngle={3}
              label={({ name, percent }) => `${prettyStr(String(name))} ${((percent ?? 0) * 100).toFixed(0)}%`}
              labelLine={{ stroke: "var(--text-muted)" }}
            >
              {data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
            </Pie>
          </PieChart>
        );
      case "scatter":
        return (
          <ScatterChart {...props}>
            <CartesianGrid strokeDasharray="3 3" stroke={grid} />
            <XAxis dataKey={x_axis} type="category" tick={axisStyle} tickFormatter={fmt} name={prettyStr(x_axis)} axisLine={false} tickLine={false} />
            <YAxis dataKey={y_axis} type="number" tick={axisStyle} tickFormatter={fmt} name={prettyStr(y_axis)} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Scatter name={prettyStr(y_axis)} data={data} fill="#d97706" opacity={0.8} />
          </ScatterChart>
        );
      case "heatmap":
        const treemapData = data.map(d => ({
          name: prettyStr(String(d[x_axis])),
          value: Number(d[y_axis]) || 0,
        }));
        return (
          <Treemap
            data={treemapData}
            dataKey="value"
            aspectRatio={4 / 3}
            stroke="var(--content-border)"
            fill="#d97706"
          >
            <Tooltip content={<CustomTooltip />} />
          </Treemap>
        );
      default:
        return <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Unknown chart: {chart_type}</div>;
    }
  };

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <div>
          <div className="chart-card-title">{title}</div>
          <div className="chart-card-subtitle">{data.length} rows · {chart_type} chart</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="chart-type-badge">
            {ICONS[chart_type] || <BarChart2 size={13} />}
            {chart_type}
          </span>
          <button
            onClick={() => exportCSV(data, chart.columns, title)}
            style={{
              width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
              border: "1px solid var(--content-border)", borderRadius: 7, background: "transparent",
              cursor: "pointer", color: "var(--text-muted)", transition: "all 0.15s",
            }}
            title="Export CSV"
          >
            <Download size={12} />
          </button>
          <button
            onClick={() => setExpanded((e) => !e)}
            style={{
              width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
              border: "1px solid var(--content-border)", borderRadius: 7, background: "transparent",
              cursor: "pointer", color: "var(--text-muted)", transition: "all 0.15s",
            }}
            title={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={expanded ? 400 : 280}>
        {renderChart() as React.ReactElement}
      </ResponsiveContainer>
    </div>
  );
}
