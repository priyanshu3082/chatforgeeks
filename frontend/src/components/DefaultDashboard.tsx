"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { TrendingUp, DollarSign, Users, Target, RefreshCw } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const PALETTE = ["#d97706", "#7c3aed", "#0891b2", "#059669", "#dc2626", "#6366f1"];

/** Call the /execute endpoint — NO Claude API, pure SQL, zero cost */
async function execSQL(sql: string): Promise<{ columns: string[]; rows: Record<string, unknown>[] }> {
  const res = await fetch(`${API_BASE}/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sql }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/** Detect usable column names from schema */
function detectCols(cols: { name: string; type: string }[]) {
  const names = cols.map((c) => c.name.toLowerCase());
  const find = (...kws: string[]) => cols.find((c) => kws.some((k) => c.name.toLowerCase().includes(k)))?.name;
  return {
    revenueCol: find("revenue", "sales", "amount", "total", "price", "value"),
    profitCol: find("profit", "margin", "net", "earning"),
    categoryCol: find("category", "product", "type", "segment", "class", "item"),
    regionCol: find("region", "area", "location", "country", "city", "state", "zone"),
    dateCol: find("month", "date", "year", "week", "quarter", "period"),
    customerCol: find("customer", "client", "user", "buyer"),
    hasRevenue: names.some((n) => ["revenue", "sales", "amount", "total", "price", "value"].some((k) => n.includes(k))),
    hasCategory: names.some((n) => ["category", "product", "type", "segment", "class", "item"].some((k) => n.includes(k))),
    hasRegion: names.some((n) => ["region", "area", "location", "country", "city", "state", "zone"].some((k) => n.includes(k))),
    hasDate: names.some((n) => ["month", "date", "year", "week", "quarter", "period"].some((k) => n.includes(k))),
  };
}

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}
function fmtN(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return `${n}`;
}
const axisStyle = { fill: "var(--text-muted)", fontSize: 11, fontFamily: "Inter, sans-serif" };
const tickFmt = (v: unknown) => {
  const n = Number(v);
  return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(0)}K` : String(v).slice(0, 8);
};

interface KPICardProps { label: string; value: string; sub: string; icon: React.ReactNode; color: string; }
function KPICard({ label, value, sub, icon, color }: KPICardProps) {
  return (
    <div style={{
      background: "var(--content-surface)", border: "1px solid var(--content-border)",
      borderRadius: 14, padding: "18px 20px", display: "flex", alignItems: "center",
      gap: 14, flex: 1, minWidth: 155, boxShadow: "var(--shadow-sm)",
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 10, background: `${color}1a`,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div>
        <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3 }}>
          {label}
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em", lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{sub}</div>
      </div>
    </div>
  );
}

interface DefaultDashboardProps {
  tableName?: string;
  onQueryClick?: (q: string) => void;
}

export default function DefaultDashboard({ tableName, onQueryClick }: DefaultDashboardProps) {
  const [kpis, setKpis] = useState({ revenue: "—", profit: "—", rows: "—", margin: "—" });
  const [trendData, setTrendData] = useState<Record<string, unknown>[]>([]);
  const [catData, setCatData] = useState<Record<string, unknown>[]>([]);
  const [regionData, setRegionData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const table = tableName || "sales";

  /* ─────────────────────────────────────────────────────────
     All queries go to /execute — pure SQL, NO Claude API cost
  ───────────────────────────────────────────────────────── */
  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Inspect schema to pick columns dynamically
      const schemaRes = await fetch(`${API_BASE}/schema`);
      const schemaJson = await schemaRes.json();
      const cols: { name: string; type: string }[] = schemaJson.tables?.[table] || [];
      if (!cols.length) { setError(`Table "${table}" not found.`); setLoading(false); return; }

      const { revenueCol, profitCol, categoryCol, regionCol, dateCol, customerCol, hasRevenue, hasCategory, hasRegion, hasDate } = detectCols(cols);

      // 2. KPI query
      const kpiParts = [
        revenueCol ? `ROUND(SUM(${revenueCol}),2) AS total_revenue` : null,
        profitCol  ? `ROUND(SUM(${profitCol}),2) AS total_profit` : null,
        "COUNT(*) AS total_rows",
        revenueCol && profitCol ? `ROUND(SUM(${profitCol})*100.0/NULLIF(SUM(${revenueCol}),0),1) AS margin_pct` : null,
        customerCol ? `COUNT(DISTINCT ${customerCol}) AS distinct_customers` : null,
      ].filter(Boolean).join(", ");

      const kpiResult = await execSQL(`SELECT ${kpiParts} FROM ${table}`);
      const row = kpiResult.rows[0] || {};
      setKpis({
        revenue : row.total_revenue  != null ? fmt(Number(row.total_revenue)) : (row.total_rows != null ? fmtN(Number(row.total_rows)) + " rows" : "—"),
        profit  : row.total_profit   != null ? fmt(Number(row.total_profit))  : "N/A",
        rows    : row.distinct_customers != null ? fmtN(Number(row.distinct_customers)) : fmtN(Number(row.total_rows || 0)),
        margin  : row.margin_pct     != null ? `${Number(row.margin_pct).toFixed(1)}%` : "N/A",
      });

      // 3. Trend chart (pure SQL, no LLM)
      if (hasDate && dateCol && hasRevenue && revenueCol) {
        const trendSql = `SELECT ${dateCol} AS period, ROUND(SUM(${revenueCol}),2) AS revenue${profitCol ? `, ROUND(SUM(${profitCol}),2) AS profit` : ""} FROM ${table} GROUP BY ${dateCol} ORDER BY ${dateCol} LIMIT 24`;
        const t = await execSQL(trendSql);
        setTrendData(t.rows);
      }

      // 4. Category bar (no LLM)
      if (hasCategory && categoryCol && hasRevenue && revenueCol) {
        const catSql = `SELECT ${categoryCol} AS category, ROUND(SUM(${revenueCol}),2) AS revenue${profitCol ? `, ROUND(SUM(${profitCol}),2) AS profit` : ""} FROM ${table} GROUP BY ${categoryCol} ORDER BY revenue DESC LIMIT 8`;
        const c = await execSQL(catSql);
        setCatData(c.rows);
      }

      // 5. Region pie (no LLM)
      if (hasRegion && regionCol && hasRevenue && revenueCol) {
        const regSql = `SELECT ${regionCol} AS region, ROUND(SUM(${revenueCol}),2) AS revenue FROM ${table} GROUP BY ${regionCol} ORDER BY revenue DESC LIMIT 6`;
        const r = await execSQL(regSql);
        setRegionData(r.rows);
      }

    } catch (e) {
      setError("Could not load dashboard. Make sure the backend is running.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [table]);

  const SUGGESTIONS = [
    "Show monthly revenue trend",
    "Compare profit by category",
    "Top regions by revenue",
    "What is the profit margin?",
    "Which category has the highest growth?",
    "Give me a full business summary",
  ];

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: "80px 24px" }}>
      <div style={{ width: 36, height: 36, border: "3px solid var(--content-border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Loading dashboard…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error) return (
    <div style={{ padding: "60px 24px", textAlign: "center" }}>
      <p style={{ color: "var(--text-muted)", fontSize: 14 }}>{error}</p>
      <button onClick={load} style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: "var(--accent)", color: "#fff", border: "none", cursor: "pointer", fontSize: 13 }}>
        <RefreshCw size={13} /> Retry
      </button>
    </div>
  );

  const grid = "var(--content-border)";

  return (
    <div style={{ padding: "24px 28px 40px", maxWidth: 920, margin: "0 auto", display: "flex", flexDirection: "column", gap: 22 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 19, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em", margin: 0 }}>
            📊 Business Dashboard
            {tableName && tableName !== "sales" && (
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", marginLeft: 10, background: "rgba(217,119,6,.12)", borderRadius: 99, padding: "2px 10px" }}>
                {tableName}
              </span>
            )}
          </h2>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
            Live analytics from <strong>{table}</strong> · Ask a question below to use AI
          </p>
        </div>
        <button
          onClick={load}
          style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "1px solid var(--content-border)", borderRadius: 8, padding: "5px 12px", cursor: "pointer", color: "var(--text-muted)", fontSize: 12, fontFamily: "inherit" }}
        >
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <KPICard label="Total Revenue"    value={kpis.revenue} sub="All records"    icon={<DollarSign size={19} />} color="#d97706" />
        <KPICard label="Total Profit"     value={kpis.profit}  sub="Net earnings"   icon={<TrendingUp size={19} />} color="#059669" />
        <KPICard label="Records / Customers" value={kpis.rows} sub="In dataset"     icon={<Users size={19} />}      color="#7c3aed" />
        <KPICard label="Profit Margin"    value={kpis.margin}  sub="Efficiency"     icon={<Target size={19} />}     color="#0891b2" />
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>

        {/* Trend */}
        {trendData.length > 0 && (
          <div style={{ background: "var(--content-surface)", border: "1px solid var(--content-border)", borderRadius: 14, padding: "18px 16px", boxShadow: "var(--shadow-sm)" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14 }}>📈 Revenue Trend</div>
            <ResponsiveContainer width="100%" height={185}>
              <AreaChart data={trendData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gr1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gr2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={grid} />
                <XAxis dataKey="period" tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={(v) => String(v).slice(0, 7)} />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={tickFmt} width={45} />
                <Tooltip formatter={(v: unknown) => [`$${Number(v).toLocaleString()}`, ""]} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="revenue" stroke="#d97706" strokeWidth={2} fill="url(#gr1)" />
                {trendData[0]?.profit !== undefined && (
                  <Area type="monotone" dataKey="profit" stroke="#059669" strokeWidth={2} fill="url(#gr2)" />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Category */}
        {catData.length > 0 && (
          <div style={{ background: "var(--content-surface)", border: "1px solid var(--content-border)", borderRadius: 14, padding: "18px 16px", boxShadow: "var(--shadow-sm)" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14 }}>🧩 By Category</div>
            <ResponsiveContainer width="100%" height={185}>
              <BarChart data={catData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barCategoryGap="28%">
                <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
                <XAxis dataKey="category" tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={(v) => String(v).slice(0, 8)} />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={tickFmt} width={45} />
                <Tooltip formatter={(v: unknown) => [`$${Number(v).toLocaleString()}`, ""]} />
                <Bar dataKey="revenue" radius={[5, 5, 0, 0]} maxBarSize={42}>
                  {catData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Region */}
        {regionData.length > 0 && (
          <div style={{ background: "var(--content-surface)", border: "1px solid var(--content-border)", borderRadius: 14, padding: "18px 16px", boxShadow: "var(--shadow-sm)" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14 }}>🗺️ By Region</div>
            <ResponsiveContainer width="100%" height={185}>
              <PieChart>
                <Pie data={regionData} dataKey="revenue" nameKey="region"
                  cx="50%" cy="50%" outerRadius={72} innerRadius={28} paddingAngle={3}
                  label={({ name, percent }) => `${String(name).slice(0, 7)} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {regionData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                </Pie>
                <Tooltip formatter={(v: unknown) => [`$${Number(v).toLocaleString()}`, "Revenue"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Quick questions — clicking these will call Claude */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: 10 }}>
          💬 Ask AI — click to query with Claude
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => onQueryClick?.(s)}
              style={{
                background: "var(--content-surface)", border: "1px solid var(--content-border)",
                borderRadius: 99, padding: "6px 14px", fontSize: 12,
                color: "var(--text-secondary)", cursor: "pointer",
                transition: "all 0.15s", fontFamily: "inherit",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
