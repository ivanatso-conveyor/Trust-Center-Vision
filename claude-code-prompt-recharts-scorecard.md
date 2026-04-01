# Recharts Scorecard Upgrades

## Overview

Replace 5 sections of the Trust Scorecard page (`AcmeCorpDashboard` component in `trust-center-prototype/src/App.jsx`) with proper Recharts visualizations. The scorecard currently uses a `RadialBarChart` for the trust score overview and custom CSS for everything else. We're adding `AreaChart`, `RadarChart`, `PieChart`, `BarChart`, and `ComposedChart` from Recharts.

## Setup

Update the Recharts import at the top of `App.jsx` (currently line ~15):

```jsx
// REPLACE THIS:
import { RadialBarChart, RadialBar, Legend, Sector } from "recharts";

// WITH THIS:
import {
  RadialBarChart, RadialBar, Legend, Sector,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, PieChart, Pie, Cell, BarChart, Bar, ComposedChart, Line,
} from "recharts";
```

Note: We import Recharts `Tooltip` as `RechartsTooltip` because there's already a custom `Tooltip` component in the codebase (the hover tooltip for info icons, around line ~2750).

## Shared: Custom Recharts Tooltip Component

Add this component near the existing `TrustScoreRadialChart` component (around line ~2766). All 5 new charts will use it for consistent styling:

```jsx
function ChartTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-bg-primary border border-border-default rounded-lg px-3.5 py-2.5 shadow-xl">
      {label && <div className="text-xs font-semibold text-text-primary mb-1">{label}</div>}
      {payload.map((p, i) => (
        <div key={i} className="text-[11px] text-text-secondary">
          {p.name}: <strong className="text-brand-400">{formatter ? formatter(p.value, p.name) : p.value}</strong>
        </div>
      ))}
    </div>
  );
}
```

## Color Constants

Add these near the `SCORE_COLORS` constant (around line ~2768). Use CSS variable references where possible, but Recharts `fill`/`stroke` props need actual hex values since they render to SVG attributes:

```jsx
const CHART_COLORS = {
  brand: '#33C69F',
  brandLight: '#7AE8CB',
  brandDim: '#2AA886',
  surface: '#16161E',
  border: '#2A2A3A',
  textMuted: '#7A7A8E',
  textSecondary: '#A0A0B8',
  textPrimary: '#F0F0F8',
  yellow: '#f59e0b',
  red: '#ef4444',
  blue: '#38bdf8',
  purple: '#a78bfa',
};
```

---

## Change 1: Score Trend — Replace DIV bars with AreaChart

**Current location:** Inside `AcmeCorpDashboard`, the "Score Trend — Last 6 Months" section. It currently renders a `<div className="flex items-end gap-1 h-28">` with manual `motion.div` bars for each month.

**Data already exists:** `trendData` array with `{ month, score }` objects.

**Replace the entire score trend rendering block** (the `<div className="bg-bg-primary/40 rounded-xl p-4 ...">` that contains the DIV bars) with:

```jsx
<div className="bg-bg-primary/40 rounded-xl p-4 border border-border-default/50">
  <ResponsiveContainer width="100%" height={200}>
    <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
      <defs>
        <linearGradient id="scoreTrendGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={CHART_COLORS.brand} stopOpacity={0.35} />
          <stop offset="95%" stopColor={CHART_COLORS.brand} stopOpacity={0.02} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} vertical={false} />
      <XAxis dataKey="month" tick={{ fill: CHART_COLORS.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
      <YAxis domain={[40, 100]} tick={{ fill: CHART_COLORS.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
      <RechartsTooltip content={<ChartTooltip formatter={(v) => `${v}/100`} />} />
      <Area type="monotone" dataKey="score" stroke={CHART_COLORS.brand} strokeWidth={2.5}
        fill="url(#scoreTrendGradient)"
        dot={{ r: 4, fill: CHART_COLORS.brand, stroke: CHART_COLORS.surface, strokeWidth: 2 }}
        activeDot={{ r: 6, fill: CHART_COLORS.brandLight, stroke: CHART_COLORS.brand, strokeWidth: 2 }} />
    </AreaChart>
  </ResponsiveContainer>
  <div className="flex items-center gap-1.5 mt-3">
    <TrendingUp className="w-3.5 h-3.5 text-brand-400" />
    <span className="text-xs text-brand-400 font-medium">+22 points improvement since October</span>
  </div>
</div>
```

---

## Change 2: Category Breakdown — Add RadarChart with view switcher

**Current location:** The "Category Scores" section that renders `categories.map(cat => ...)` as expandable accordion rows.

**Keep the existing accordion.** Add a toggle button in the section header to switch between "List" and "Radar" views.

**Add state** to `AcmeCorpDashboard`:
```jsx
const [categoryView, setCategoryView] = useState("list"); // "list" | "radar"
```

**Add radar data** (derive from existing `categories` array — add network averages):
```jsx
const categoryRadarData = categories.map(cat => ({
  category: cat.name.replace("Data Privacy & Residency", "Data Privacy").replace("Vendor Risk Management", "Vendor Risk").replace("Business Continuity", "Business Cont.").replace("Infrastructure & Hosting", "Infrastructure").replace("Application Security", "App Security").replace("Access Management", "Access Mgmt").replace("Incident Response", "Incident Resp."),
  thisTC: cat.score,
  networkAvg: Math.round(cat.score * 0.78 + Math.random() * 5), // simulated network avg
}));
```

Actually, use fixed network average values to avoid re-renders:
```jsx
const NETWORK_AVG_SCORES = { "Access Management": 72, "Application Security": 70, "Data Privacy & Residency": 68, "Infrastructure & Hosting": 75, "Incident Response": 66, "Vendor Risk Management": 71, "Business Continuity": 69 };
const categoryRadarData = categories.map(cat => ({
  category: cat.name.length > 14 ? cat.name.split(" ").slice(0, 2).join(" ") : cat.name,
  thisTC: cat.score,
  networkAvg: NETWORK_AVG_SCORES[cat.name] || 70,
}));
```

**Update the section header** to include the view switcher. Replace the current `<div className="px-5 py-4 border-b ...">` header with:

```jsx
<div className="px-5 py-4 border-b border-border-default flex items-center justify-between">
  <h2 className="text-lg font-semibold text-text-primary">Category Scores</h2>
  <div className="flex gap-1 bg-bg-primary/60 rounded-lg p-0.5 border border-border-default/50">
    {[{ key: "list", label: "List" }, { key: "radar", label: "Radar" }].map(v => (
      <button key={v.key} onClick={() => setCategoryView(v.key)}
        className={`text-[10px] px-2.5 py-1 rounded-md transition-colors ${categoryView === v.key ? "bg-brand-500/15 text-brand-400 font-medium" : "text-text-muted hover:text-text-secondary"}`}>
        {v.label}
      </button>
    ))}
  </div>
</div>
```

**After the header, conditionally render** either the existing list OR the radar chart:

```jsx
{categoryView === "list" ? (
  <>
    {/* EXISTING categories.map accordion code — keep as-is */}
    {categories.map(cat => (
      /* ... existing expandable row code ... */
    ))}
  </>
) : (
  <div className="px-5 py-4">
    <ResponsiveContainer width="100%" height={320}>
      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={categoryRadarData}>
        <PolarGrid stroke={CHART_COLORS.border} />
        <PolarAngleAxis dataKey="category" tick={{ fill: CHART_COLORS.textMuted, fontSize: 10.5 }} />
        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
        <Radar name="Network Avg" dataKey="networkAvg" stroke={CHART_COLORS.textMuted}
          fill={CHART_COLORS.textMuted} fillOpacity={0.08} strokeWidth={1.5} strokeDasharray="4 3" />
        <Radar name={tc?.name || "Acme Corp"} dataKey="thisTC" stroke={CHART_COLORS.brand}
          fill={CHART_COLORS.brand} fillOpacity={0.18} strokeWidth={2}
          dot={{ r: 3, fill: CHART_COLORS.brand }} />
        <RechartsTooltip content={<ChartTooltip formatter={(v) => `${v}/100`} />} />
      </RadarChart>
    </ResponsiveContainer>
    <div className="flex items-center gap-4 mt-2 justify-center">
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-brand-500" />
        <span className="text-[10px] text-text-muted">{tc?.name || "Acme Corp"}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full border border-text-muted border-dashed" />
        <span className="text-[10px] text-text-muted">Network Average</span>
      </div>
    </div>
  </div>
)}
```

**Important:** The Framework Coverage sub-section (below the category list) should remain visible in BOTH views. Make sure it stays outside the conditional.

---

## Change 3: Visitor Satisfaction — Replace with Donut PieChart

**Current location:** Inside the Analytics Deep Dive grid, the "Visitor Satisfaction" card. It currently has a progress bar and text breakdown.

**Replace the entire Visitor Satisfaction card contents** (everything inside the card `<div>`) with:

```jsx
<div className="bg-bg-surface rounded-xl p-5 border border-border-default">
  <div className="flex items-center gap-2 mb-3">
    <Star className="w-4 h-4 text-brand-500" />
    <span className="text-sm font-semibold text-text-primary">Visitor Satisfaction</span>
    <Tooltip text={`${analytics.satisfaction.score}/5.0 average across ${analytics.satisfaction.total.toLocaleString()} rated interactions.`}>
      <Info className="w-3 h-3 text-text-muted cursor-help" />
    </Tooltip>
  </div>
  <div className="flex items-center gap-5">
    <div className="relative shrink-0" style={{ width: 140, height: 140 }}>
      <ResponsiveContainer width={140} height={140}>
        <PieChart>
          <Pie
            data={[
              { name: "Helpful", value: analytics.satisfaction.helpful },
              { name: "Partial", value: analytics.satisfaction.partial },
              { name: "Not helpful", value: analytics.satisfaction.not },
            ]}
            cx="50%" cy="50%" innerRadius={42} outerRadius={63}
            dataKey="value" startAngle={90} endAngle={-270}
            paddingAngle={2} stroke="none"
          >
            <Cell fill={CHART_COLORS.brand} />
            <Cell fill={CHART_COLORS.yellow} />
            <Cell fill={CHART_COLORS.red} />
          </Pie>
          <RechartsTooltip content={<ChartTooltip formatter={(v) => `${v}%`} />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-2xl font-bold text-text-primary leading-none">{analytics.satisfaction.score}</span>
        <span className="text-[10px] text-text-muted mt-0.5">/ 5.0</span>
      </div>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] text-text-muted mb-2.5">Based on {analytics.satisfaction.total.toLocaleString()} rated interactions</p>
      {[
        { label: "Helpful", value: analytics.satisfaction.helpful, color: "bg-brand-400" },
        { label: "Partial", value: analytics.satisfaction.partial, color: "bg-yellow-400" },
        { label: "Not helpful", value: analytics.satisfaction.not, color: "bg-red-400" },
      ].map(d => (
        <div key={d.label} className="flex items-center gap-2 mb-1.5">
          <span className={`w-2 h-2 rounded-full ${d.color} shrink-0`} />
          <span className="text-[11px] text-text-secondary w-16">{d.label}</span>
          <span className="text-xs font-semibold text-text-primary">{d.value}%</span>
        </div>
      ))}
    </div>
  </div>
</div>
```

---

## Change 4: Document Engagement — Add Horizontal BarChart with view switcher

**Current location:** Inside the Analytics Deep Dive grid, the "Document Engagement" card. It renders a numbered list of top docs.

**Add state** to `AcmeCorpDashboard`:
```jsx
const [docView, setDocView] = useState("list"); // "list" | "chart"
```

**Replace the Document Engagement card contents** with a view that supports both modes:

```jsx
<div className="bg-bg-surface rounded-xl p-5 border border-border-default">
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-2">
      <Eye className="w-4 h-4 text-brand-500" />
      <span className="text-sm font-semibold text-text-primary">Document Engagement</span>
    </div>
    <div className="flex gap-1 bg-bg-primary/60 rounded-lg p-0.5 border border-border-default/50">
      {[{ key: "list", label: "List" }, { key: "chart", label: "Chart" }].map(v => (
        <button key={v.key} onClick={() => setDocView(v.key)}
          className={`text-[10px] px-2.5 py-1 rounded-md transition-colors ${docView === v.key ? "bg-brand-500/15 text-brand-400 font-medium" : "text-text-muted hover:text-text-secondary"}`}>
          {v.label}
        </button>
      ))}
    </div>
  </div>
  <p className="text-[10px] text-text-muted mb-2">Most Viewed Documents (30 days)</p>

  {docView === "list" ? (
    <div className="space-y-2">
      {analytics.topDocs.map((doc, i) => (
        <div key={doc.name} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-text-muted w-3">{i + 1}.</span>
            <span className="text-xs text-text-secondary">{doc.name}</span>
          </div>
          <span className="text-xs font-medium text-text-primary">{doc.views}</span>
        </div>
      ))}
    </div>
  ) : (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart
        data={analytics.topDocs.map(d => ({ ...d, name: d.name.length > 20 ? d.name.slice(0, 18) + "…" : d.name }))}
        layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} horizontal={false} />
        <XAxis type="number" tick={{ fill: CHART_COLORS.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="name" width={120} tick={{ fill: CHART_COLORS.textSecondary, fontSize: 10 }} axisLine={false} tickLine={false} />
        <RechartsTooltip content={<ChartTooltip formatter={(v) => `${v} views`} />} />
        <Bar dataKey="views" fill={CHART_COLORS.brand} radius={[0, 4, 4, 0]} barSize={16}
          background={{ fill: '#1E1E2A', radius: [0, 4, 4, 0] }} />
      </BarChart>
    </ResponsiveContainer>
  )}

  <div className="border-t border-border-default/50 mt-3 pt-2.5 flex gap-4">
    <span className="text-[10px] text-text-muted">Downloads: <strong className="text-text-secondary">1,847</strong></span>
    <span className="text-[10px] text-text-muted">Unique: <strong className="text-text-secondary">412</strong></span>
  </div>
</div>
```

---

## Change 5: Framework Coverage — Replace progress bars with BarChart

**Current location:** The "Framework Coverage" sub-section inside the Category Breakdown card, below the categories accordion. It uses custom `ProgressBar` components.

**Replace the framework bars rendering** (the `<div className="space-y-2.5">` that maps over `frameworks`) with a Recharts `ComposedChart`. Keep the Coco callout below.

Replace from `<div className="space-y-2.5">` through the closing `</div>` of that block (but NOT the Coco callout) with:

```jsx
<ResponsiveContainer width="100%" height={180}>
  <ComposedChart
    data={frameworks.map(fw => ({ ...fw, ceiling: 100 }))}
    margin={{ top: 10, right: 16, left: -10, bottom: 0 }}
  >
    <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} horizontal vertical={false} />
    <XAxis dataKey="name" tick={{ fill: CHART_COLORS.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
    <YAxis domain={[0, 100]} tick={{ fill: CHART_COLORS.textMuted, fontSize: 10 }} axisLine={false} tickLine={false}
      tickFormatter={v => `${v}%`} />
    <RechartsTooltip content={<ChartTooltip formatter={(v, name) => {
      if (name === "ceiling") return null;
      return `${v}% answerable`;
    }} />} />
    <Bar dataKey="pct" name="Answerable" fill={CHART_COLORS.brand} radius={[6, 6, 0, 0]} barSize={44}
      background={{ fill: '#1E1E2A', radius: [6, 6, 0, 0] }}
      label={{ position: 'top', fill: CHART_COLORS.textPrimary, fontSize: 12, fontWeight: 600, formatter: v => `${v}%` }} />
    <Line type="monotone" dataKey="ceiling" stroke={CHART_COLORS.brandLight} strokeDasharray="6 4"
      strokeWidth={1} dot={false} activeDot={false} legendType="none" />
  </ComposedChart>
</ResponsiveContainer>
```

The dashed line at 100% acts as a visual ceiling showing how close each framework is to full coverage.

---

## Theme Compatibility

All charts use hex values in the `CHART_COLORS` constant for SVG rendering. These map to the dark theme variables:
- `#33C69F` = `--color-brand-500`
- `#7AE8CB` = `--color-brand-400` / light accent
- `#16161E` = `--color-bg-surface`
- `#2A2A3A` = `--color-border-default`
- `#7A7A8E` = `--color-text-muted`
- `#A0A0B8` = `--color-text-secondary`
- `#F0F0F8` = `--color-text-primary`

If the app supports light mode, you may want to make `CHART_COLORS` context-aware later, but for this prototype dark mode only is fine.

## Testing

After making changes, run `npm run dev` from `trust-center-prototype/` and navigate to `/scorecard`. Verify:
1. Score Trend shows a smooth area chart with gradient fill and hover tooltips
2. Category Scores has a List/Radar toggle — List shows the existing accordion, Radar shows the spider chart
3. Framework Coverage shows bar chart with percentage labels and dashed 100% ceiling line
4. The Coco pre-fill callout still appears below Framework Coverage
5. Visitor Satisfaction shows a donut chart with 4.2 centered inside
6. Document Engagement has a List/Chart toggle — List shows numbered docs, Chart shows horizontal bars
7. All tooltips appear on hover with the dark styled `ChartTooltip` component
