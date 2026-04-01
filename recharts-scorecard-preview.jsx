import { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  PieChart, Pie, Cell,
  BarChart, Bar,
  ComposedChart, Scatter, Line,
  Treemap,
} from "recharts";

/* ── Color palette (Conveyor dark theme) ── */
const BRAND = "#33C69F";
const BRAND_DIM = "#2AA886";
const BRAND_LIGHT = "#7AE8CB";
const SURFACE = "#16161E";
const BORDER = "#2A2A3A";
const TEXT_PRIMARY = "#F0F0F8";
const TEXT_SECONDARY = "#A0A0B8";
const TEXT_MUTED = "#7A7A8E";
const YELLOW = "#f59e0b";
const RED = "#ef4444";
const BLUE = "#38bdf8";
const PURPLE = "#a78bfa";

/* ── Shared custom tooltip ── */
function CTooltip({ active, payload, label, fmt }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#1E1E2A", border: "1px solid #2A2A3A", borderRadius: 8,
      padding: "10px 14px", boxShadow: "0 8px 24px rgba(0,0,0,0.4)"
    }}>
      {label && <div style={{ fontSize: 12, fontWeight: 600, color: TEXT_PRIMARY, marginBottom: 4 }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: 11, color: TEXT_SECONDARY }}>
          {p.name}: <strong style={{ color: BRAND }}>{fmt ? fmt(p.value, p.name) : p.value}</strong>
        </div>
      ))}
    </div>
  );
}

/* ═══ 1. AREA CHART — Score Trend ═══ */
function ScoreTrendArea() {
  const data = [
    { month: "Oct", score: 60 }, { month: "Nov", score: 67 },
    { month: "Dec", score: 72 }, { month: "Jan", score: 76 },
    { month: "Feb", score: 78 }, { month: "Mar", score: 82 },
  ];
  return (
    <Card label="Suggestion 1 — Replaces DIV bar chart" title="Score Trend — Last 6 Months" sub="AreaChart with gradient fill">
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={BRAND} stopOpacity={0.35} />
              <stop offset="95%" stopColor={BRAND} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={BORDER} vertical={false} />
          <XAxis dataKey="month" tick={{ fill: TEXT_MUTED, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis domain={[40, 100]} tick={{ fill: TEXT_MUTED, fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CTooltip fmt={v => `${v}/100`} />} />
          <Area type="monotone" dataKey="score" stroke={BRAND} strokeWidth={2.5}
            fill="url(#scoreGrad)" dot={{ r: 4, fill: BRAND, stroke: SURFACE, strokeWidth: 2 }}
            activeDot={{ r: 6, fill: BRAND_LIGHT, stroke: BRAND, strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
      <Stat icon="📈" text="+22 points improvement since October" color={BRAND} />
      <Note>The gradient fill creates a sense of growth and momentum. Hover tooltips show exact scores. Much richer than flat bars.</Note>
    </Card>
  );
}

/* ═══ 2. RADAR CHART — Category Breakdown ═══ */
function CategoryRadar() {
  const data = [
    { cat: "Access Mgmt", thisTC: 89, avg: 72 },
    { cat: "App Security", thisTC: 82, avg: 70 },
    { cat: "Data Privacy", thisTC: 76, avg: 68 },
    { cat: "Infrastructure", thisTC: 91, avg: 75 },
    { cat: "Incident Resp.", thisTC: 68, avg: 66 },
    { cat: "Vendor Risk", thisTC: 88, avg: 71 },
    { cat: "Business Cont.", thisTC: 85, avg: 69 },
  ];
  return (
    <Card label="Suggestion 2 — Pairs with expandable category list" title="Category Breakdown" sub="RadarChart with network overlay">
      <ResponsiveContainer width="100%" height={310}>
        <RadarChart cx="50%" cy="50%" outerRadius="72%" data={data}>
          <PolarGrid stroke={BORDER} />
          <PolarAngleAxis dataKey="cat" tick={{ fill: TEXT_MUTED, fontSize: 10.5 }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar name="Network Avg" dataKey="avg" stroke={TEXT_MUTED} fill={TEXT_MUTED}
            fillOpacity={0.08} strokeWidth={1.5} strokeDasharray="4 3" />
          <Radar name="Acme Corp" dataKey="thisTC" stroke={BRAND} fill={BRAND}
            fillOpacity={0.18} strokeWidth={2} dot={{ r: 3, fill: BRAND }} />
          <Tooltip content={<CTooltip fmt={v => `${v}/100`} />} />
        </RadarChart>
      </ResponsiveContainer>
      <LegendRow>
        <LegendItem color={BRAND} label="Acme Corp" />
        <LegendItem color={TEXT_MUTED} label="Network Average" dashed />
      </LegendRow>
      <Note>Instant visual fingerprint — the dip at "Incident Resp." is immediately obvious. The dashed network average overlay lets visitors benchmark at a glance.</Note>
    </Card>
  );
}

/* ═══ 3. DONUT PIE — Visitor Satisfaction ═══ */
function SatisfactionDonut() {
  const data = [
    { name: "Helpful", value: 72 },
    { name: "Partial", value: 19 },
    { name: "Not helpful", value: 9 },
  ];
  const COLORS = [BRAND, YELLOW, RED];
  return (
    <Card label="Suggestion 3 — Replaces text-only breakdown" title="Visitor Satisfaction" sub="Donut PieChart">
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <div style={{ position: "relative", width: 160, height: 160, flexShrink: 0 }}>
          <ResponsiveContainer width={160} height={160}>
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={48} outerRadius={72}
                dataKey="value" startAngle={90} endAngle={-270} paddingAngle={2} stroke="none">
                {data.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip content={<CTooltip fmt={v => `${v}%`} />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{
            position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            textAlign: "center", pointerEvents: "none"
          }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: TEXT_PRIMARY, lineHeight: 1 }}>4.2</div>
            <div style={{ fontSize: 10, color: TEXT_MUTED, marginTop: 2 }}>/ 5.0</div>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: TEXT_MUTED, marginBottom: 10 }}>Based on 1,847 rated interactions</div>
          {data.map((d, i) => (
            <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS[i], flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: TEXT_SECONDARY, width: 76 }}>{d.name}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: TEXT_PRIMARY }}>{d.value}%</span>
            </div>
          ))}
        </div>
      </div>
      <Note>The donut gives instant visual weight — green dominates. Score centered inside eliminates redundancy.</Note>
    </Card>
  );
}

/* ═══ 4. HORIZONTAL BAR — Document Engagement ═══ */
function DocEngagement() {
  const data = [
    { name: "SOC 2 Type II Report", views: 487 },
    { name: "Security Whitepaper", views: 312 },
    { name: "Sub-processor List", views: 289 },
    { name: "Pen Test Summary", views: 201 },
    { name: "Data Processing Agmt", views: 178 },
  ];
  return (
    <Card label="Suggestion 4 — Replaces plain numbered list" title="Document Engagement" sub="Horizontal BarChart">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={BORDER} horizontal={false} />
          <XAxis type="number" tick={{ fill: TEXT_MUTED, fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" width={130} tick={{ fill: TEXT_SECONDARY, fontSize: 10.5 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CTooltip fmt={v => `${v} views`} />} />
          <Bar dataKey="views" fill={BRAND} radius={[0, 4, 4, 0]} barSize={18}
            background={{ fill: "#1E1E2A", radius: [0, 4, 4, 0] }} />
        </BarChart>
      </ResponsiveContainer>
      <div style={{ display: "flex", gap: 20, marginTop: 6 }}>
        <span style={{ fontSize: 11, color: TEXT_MUTED }}>Downloads: <strong style={{ color: TEXT_SECONDARY }}>1,847</strong></span>
        <span style={{ fontSize: 11, color: TEXT_MUTED }}>Unique: <strong style={{ color: TEXT_SECONDARY }}>412</strong></span>
      </div>
      <Note>Bar lengths make the SOC 2 report's dominance immediately obvious. Track backgrounds show scale context.</Note>
    </Card>
  );
}

/* ═══ 5. TREEMAP — Entry Points ═══ */
function EntryPointsTreemap() {
  const data = [
    { name: "Direct Link", pct: "52%", size: 52, fill: BRAND },
    { name: "Search", pct: "28%", size: 28, fill: BLUE },
    { name: "Referral", pct: "20%", size: 20, fill: PURPLE },
  ];
  const TreeContent = (props) => {
    const { x, y, width, height, name, pct, fill } = props;
    if (!width || !height || width < 10 || height < 10) return null;
    return (
      <g>
        <rect x={x + 1} y={y + 1} width={width - 2} height={height - 2} rx={6}
          fill={fill} fillOpacity={0.18} stroke={fill} strokeWidth={1.5} strokeOpacity={0.4} />
        {width > 50 && height > 28 && (
          <>
            <text x={x + width / 2} y={y + height / 2 - 6} textAnchor="middle" fill={fill}
              fontSize={11} fontWeight={600}>{name}</text>
            <text x={x + width / 2} y={y + height / 2 + 12} textAnchor="middle" fill={fill}
              fontSize={16} fontWeight={700} opacity={0.9}>{pct}</text>
          </>
        )}
      </g>
    );
  };
  return (
    <Card label="Suggestion 5 — Replaces plain text percentages" title="Top Entry Points" sub="Treemap">
      <ResponsiveContainer width="100%" height={120}>
        <Treemap data={data} dataKey="size" content={<TreeContent />} animationDuration={600} />
      </ResponsiveContainer>
      <Note>Proportional area encoding — Direct Link clearly dominates. Distinctive visual that breaks up the grid.</Note>
    </Card>
  );
}

/* ═══ 6. BAR — Framework Coverage ═══ */
function FrameworkBars() {
  const data = [
    { name: "SIG Lite", pct: 92, q: 256, a: 236 },
    { name: "CAIQ", pct: 87, q: 197, a: 171 },
    { name: "VSA", pct: 83, q: 136, a: 113 },
    { name: "Custom Q's", pct: 78, q: 89, a: 69 },
  ];
  return (
    <Card label="Suggestion 6 — Replaces custom progress bars" title="Framework Coverage" sub="BarChart with reference line">
      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart data={data} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={BORDER} horizontal vertical={false} />
          <XAxis dataKey="name" tick={{ fill: TEXT_MUTED, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fill: TEXT_MUTED, fontSize: 10 }} axisLine={false} tickLine={false}
            tickFormatter={v => `${v}%`} />
          <Tooltip content={<CTooltip fmt={(v, n) => {
            const d = data.find(x => x.pct === v);
            return d ? `${v}% (${d.a} of ${d.q})` : `${v}%`;
          }} />} />
          <Bar dataKey="pct" name="Answerable" fill={BRAND} radius={[6, 6, 0, 0]} barSize={48}
            background={{ fill: "#1E1E2A", radius: [6, 6, 0, 0] }}
            label={{ position: "top", fill: TEXT_PRIMARY, fontSize: 12, fontWeight: 600, formatter: v => `${v}%` }} />
          {/* 100% reference line */}
          <Line type="monotone" dataKey={() => 100} stroke={BRAND_LIGHT} strokeDasharray="6 4"
            strokeWidth={1} dot={false} activeDot={false} legendType="none" />
        </ComposedChart>
      </ResponsiveContainer>
      <div style={{
        display: "flex", alignItems: "center", gap: 8, marginTop: 10,
        background: "rgba(51,198,159,0.05)", border: "1px solid rgba(51,198,159,0.15)",
        borderRadius: 8, padding: "8px 12px"
      }}>
        <span style={{ fontSize: 12 }}>✨</span>
        <span style={{ fontSize: 11, color: BRAND }}>"Coco can pre-fill 92% of a SIG Lite from this Trust Center"</span>
      </div>
      <Note>Dashed 100% reference line shows the ceiling. Tooltip reveals exact question counts (236 of 256).</Note>
    </Card>
  );
}

/* ═══ 7. COMPOSED — Dimension Comparison ═══ */
function DimensionComparison() {
  const data = [
    { dim: "Response", thisTC: 78, avg: 48, best: 97 },
    { dim: "Coverage", thisTC: 94, avg: 76, best: 99 },
    { dim: "Freshness", thisTC: 91, avg: 52, best: 98 },
    { dim: "AI Accuracy", thisTC: 96, avg: 81, best: 99 },
    { dim: "Traffic", thisTC: 65, avg: 35, best: 95 },
    { dim: "Questions", thisTC: 73, avg: 40, best: 92 },
  ];
  const StarShape = (props) => {
    const { cx, cy } = props;
    return (
      <svg x={cx - 6} y={cy - 6} width={12} height={12}>
        <polygon points="6,0 7.5,4.5 12,4.5 8.5,7.5 9.5,12 6,9 2.5,12 3.5,7.5 0,4.5 4.5,4.5"
          fill={BRAND_LIGHT} opacity={0.9} />
      </svg>
    );
  };
  return (
    <Card label="Suggestion 7 — Enhances the comparison table" title="How Acme Corp Compares" sub="ComposedChart — grouped bars + scatter">
      <div style={{ fontSize: 11, color: TEXT_MUTED, marginBottom: 12 }}>Percentile rankings across 6 dimensions — benchmarked against 850+ Trust Centers</div>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={data} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={BORDER} vertical={false} />
          <XAxis dataKey="dim" tick={{ fill: TEXT_MUTED, fontSize: 10.5 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fill: TEXT_MUTED, fontSize: 10 }} axisLine={false} tickLine={false}
            tickFormatter={v => `${v}th`} />
          <Tooltip content={<CTooltip fmt={v => `${v}th percentile`} />} />
          <Bar dataKey="thisTC" name="Acme Corp" fill={BRAND} radius={[4, 4, 0, 0]} barSize={28} fillOpacity={0.85} />
          <Bar dataKey="avg" name="Network Avg" fill={TEXT_MUTED} radius={[4, 4, 0, 0]} barSize={28} fillOpacity={0.3} />
          <Scatter dataKey="best" name="Network Best" fill={BRAND_LIGHT} shape={<StarShape />} />
        </ComposedChart>
      </ResponsiveContainer>
      <LegendRow>
        <LegendItem color={BRAND} label="Acme Corp" />
        <LegendItem color={TEXT_MUTED} label="Network Avg" opacity={0.35} />
        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: TEXT_MUTED }}>
          <span style={{ color: BRAND_LIGHT, fontSize: 13 }}>★</span> Network Best
        </span>
      </LegendRow>
      <Note>Grouped bars let you instantly see the gap between this TC and network average. Star markers show the ceiling.</Note>
    </Card>
  );
}

/* ── Layout helpers ── */
function Card({ label, title, sub, children }) {
  return (
    <div style={{
      background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 24
    }}>
      {label && <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: BRAND, marginBottom: 4 }}>{label}</div>}
      <h2 style={{ fontSize: 16, fontWeight: 600, color: TEXT_PRIMARY, marginBottom: 16, display: "flex", alignItems: "baseline", gap: 8 }}>
        {title} {sub && <span style={{ fontWeight: 400, fontSize: 13, color: TEXT_MUTED }}>{sub}</span>}
      </h2>
      {children}
    </div>
  );
}

function Note({ children }) {
  return (
    <div style={{
      marginTop: 12, padding: "10px 14px",
      background: "rgba(51,198,159,0.05)", border: "1px solid rgba(51,198,159,0.15)",
      borderRadius: 8, fontSize: 11, color: BRAND, lineHeight: 1.5
    }}>{children}</div>
  );
}

function Stat({ icon, text, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
      <span>{icon}</span>
      <span style={{ fontSize: 12, color, fontWeight: 600 }}>{text}</span>
    </div>
  );
}

function LegendRow({ children }) {
  return <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 12, flexWrap: "wrap" }}>{children}</div>;
}

function LegendItem({ color, label, dashed, opacity }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: TEXT_MUTED }}>
      <div style={{
        width: 8, height: 8, borderRadius: "50%", background: color,
        opacity: opacity || 1,
        ...(dashed ? { background: "transparent", border: `1.5px dashed ${color}` } : {})
      }} />
      {label}
    </div>
  );
}

/* ═══ APP ═══ */
export default function RechartsPreview() {
  return (
    <div style={{ maxWidth: 780, margin: "0 auto", padding: "32px 16px", display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: TEXT_PRIMARY, marginBottom: 4 }}>Recharts Visualization Preview</h1>
        <p style={{ fontSize: 13, color: TEXT_MUTED }}>7 suggested Recharts upgrades for the Trust Scorecard, rendered with your dark theme and Conveyor Green palette.</p>
      </div>

      <ScoreTrendArea />
      <CategoryRadar />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <SatisfactionDonut />
        <DocEngagement />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <EntryPointsTreemap />
        <FrameworkBars />
      </div>

      <DimensionComparison />
    </div>
  );
}
