# Replace Conveyor Trust Center with Arcline

In `trust-center-prototype/src/App.jsx`, replace the first Trust Center entry (Conveyor) with a new fake company called **Arcline** (Workflow Automation). Conveyor should only appear as the **platform** that hosts Trust Centers.

**Rule of thumb:** If the word "Conveyor" refers to the company whose Trust Center is being viewed, change it to "Arcline." If it refers to the platform/product (e.g., "Powered by Conveyor," "Conveyor Trust Centers" as a benchmark set), leave it as-is.

---

## 1. Add `ArclineLogo` component

Add this function next to the existing `ConveyorLogo` and `MediacoreLogo` functions (~line 4164). This is a clean vector logo (Arc Swoosh in Cyan), intentionally non-pixel to distinguish company logos from the Coco pixel art style:

```jsx
// Arcline logo SVG (Arc Swoosh — Cyan)
function ArclineLogo({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="8" fill="#122E32"/>
      <path d="M8 26C8 26 12 10 20 10C28 10 32 26 32 26" stroke="url(#arcGrad)" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
      <circle cx="20" cy="22" r="3" fill="#80E0E8"/>
      <line x1="8" y1="30" x2="32" y2="30" stroke="#22B8CF" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
      <defs><linearGradient id="arcGrad" x1="8" y1="18" x2="32" y2="18" gradientUnits="userSpaceOnUse">
        <stop stopColor="#22B8CF"/><stop offset="0.5" stopColor="#80E0E8"/><stop offset="1" stopColor="#22B8CF"/>
      </linearGradient></defs>
    </svg>
  );
}
```

> **Note:** Use `strokeWidth`, `strokeLinecap`, `stopColor` (JSX camelCase), not the HTML kebab-case versions.

---

## 2. Replace `TRUST_CENTERS[0]` (Conveyor → Arcline)

Replace the entire first object in the `TRUST_CENTERS` array (~line 4194) with:

```javascript
{
  id: "arcline",
  name: "Arcline",
  subtitle: "Workflow Automation",
  logo: "arcline",
  accent: "oklch(0.65 0.12 200)", // fixed cyan - does not change with theme
  stats: { docs: 42, faqs: 128, certs: 6 },
  theme: {
    brandHue: 200,
    brandChroma: [0.03, 0.05, 0.08, 0.10, 0.12, 0.12, 0.10, 0.08, 0.06, 0.04, 0.03],
    accentHue: 60,
    accentChroma: [0.04, 0.08, 0.12, 0.16, 0.18, 0.16, 0.14, 0.12, 0.10, 0.07],
  },
  mcpDomain: "trust.conveyor.com/arcline",
  greeting: "Hey there! Welcome to Arcline's Trust Center. I'm Coco - your cowork agent for security reviews.",
  tcTitle: "Arcline Trust Center",
  tcSubtitle: "Transparent security for our customers and partners",
},
```

---

## 3. Update `applyTcTheme()` lightness logic

The current code (~line 4241) uses `isConveyor = t.brandHue < 200` to pick a lightness curve. Since Arcline's hue is exactly 200, update to `<=` so it uses the same `lightness` curve that Conveyor (168) used:

**Before:**
```javascript
const isConveyor = t.brandHue < 200;
```

**After:**
```javascript
// Arcline (200) and former Conveyor (168) use the `lightness` curve; MediaCore (288) uses `lightnessBrand`
const useDefaultLightness = t.brandHue <= 200;
const bL = useDefaultLightness ? lightness : lightnessBrand;
```

Also update the comment on the line above from `// Use the hue from Conveyor (168) vs MediaCore (288) to decide lightness` to `// Use the hue to decide lightness curve`.

---

## 4. Update all logo conditionals in `TrustCenterSwitcher`

There are 4 places where the code checks `current.logo === "conveyor"` or `tc.logo === "conveyor"` to decide which logo component to render. Update all of them to handle three logos:

### 4a. Main switcher button (~line 4266-4271)

**Before:**
```jsx
style={{ background: current.id === "mediacore" ? "#333366" : undefined }}
>
  {current.logo === "conveyor"
    ? <div style={{ color: current.accent }}><ConveyorLogo size={22} color="currentColor" /></div>
    : <MediacoreLogo size={28} />
  }
```

**After:**
```jsx
style={{ background: current.id === "mediacore" ? "#333366" : current.id === "arcline" ? "#122E32" : undefined }}
>
  {current.logo === "arcline"
    ? <ArclineLogo size={28} />
    : current.logo === "mediacore"
    ? <MediacoreLogo size={28} />
    : <div style={{ color: current.accent }}><ConveyorLogo size={22} color="currentColor" /></div>
  }
```

### 4b. Dropdown item logo (~line 4294-4299)

**Before:**
```jsx
style={{ background: tc.logo === "mediacore" ? "#333366" : undefined, ... }}>
  {tc.logo === "conveyor"
    ? <div style={{ color: tc.accent }}><ConveyorLogo size={18} color="currentColor" /></div>
    : <MediacoreLogo size={24} />
  }
```

**After:**
```jsx
style={{ background: tc.logo === "mediacore" ? "#333366" : tc.logo === "arcline" ? "#122E32" : undefined, ... }}>
  {tc.logo === "arcline"
    ? <ArclineLogo size={24} />
    : tc.logo === "mediacore"
    ? <MediacoreLogo size={24} />
    : <div style={{ color: tc.accent }}><ConveyorLogo size={18} color="currentColor" /></div>
  }
```

---

## 5. Update favicon (~line 4456)

The current favicon conditional only handles `"conveyor"` and else (mediacore). Add Arcline:

**Before:**
```javascript
if (currentTc.logo === "conveyor") {
  link.href = `data:image/svg+xml,...conveyor favicon...`;
} else {
  link.href = `data:image/svg+xml,...mediacore favicon...`;
}
```

**After:**
```javascript
if (currentTc.logo === "arcline") {
  link.href = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="8" fill="%23122E32"/><path d="M8 26C8 26 12 10 20 10C28 10 32 26 32 26" stroke="%2322B8CF" stroke-width="3.5" stroke-linecap="round" fill="none"/><circle cx="20" cy="22" r="3" fill="%2380E0E8"/><line x1="8" y1="30" x2="32" y2="30" stroke="%2322B8CF" stroke-width="2" stroke-linecap="round" opacity="0.4"/></svg>')}`;
} else if (currentTc.logo === "mediacore") {
  link.href = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="8" fill="%23333366"/><path d="M27.38 11.36L20.24 16.61c-.17.12-.41.12-.58-.01l-7-5.24c-.8-.59-1.94-.02-1.94.98v13.9a2.65 2.65 0 0 0 2.65 2.65h13.31a2.65 2.65 0 0 0 2.64-2.65V12.34c0-.72-.59-1.22-1.22-1.22-.25 0-.5.07-.72.24Z" fill="%236C63FF"/><rect x="23.94" y="16.08" width="2.75" height="10.49" rx="1.38" fill="white" opacity=".8"/><circle cx="25.31" cy="17.45" r="1.38" fill="white"/><rect x="19.61" y="19.37" width="2.75" height="7.2" rx="1.38" fill="white" opacity=".8"/><circle cx="20.99" cy="20.75" r="1.38" fill="white"/><rect x="15.28" y="22.39" width="2.75" height="4.18" rx="1.38" fill="white" opacity=".8"/><circle cx="16.66" cy="23.76" r="1.38" fill="white"/></svg>')}`;
} else {
  // Fallback for any future trust centers
  link.href = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16" rx="3" fill="%23666"/><text x="8" y="11.5" text-anchor="middle" fill="white" font-size="10" font-family="system-ui">' + (currentTc.name?.[0] || 'T') + '</text></svg>')}`;
}
```

> **Note:** The favicon SVG uses HTML attributes (`stroke-width`, `stop-color`) not JSX camelCase, since it's inside a raw SVG string, not a React component.

---

## 6. Keep document title as-is

The document title (~line 4451) already says:
```javascript
document.title = `${currentTc.name} Trust Center — Powered by Conveyor`;
```

**Leave this unchanged.** It will now read "Arcline Trust Center — Powered by Conveyor" which is correct — Conveyor is the platform.

---

## 7. Update demo flow text (Conveyor → Arcline as a vendor)

These are all in the MCP vendor comparison flow. Change "Conveyor" to "Arcline" since these refer to the company being reviewed, not the platform.

### 7a. User prompt text (~line 2283)

```
"Compare breach notification timelines and incident response across @mediacore @conveyor @nunita"
```
→
```
"Compare breach notification timelines and incident response across @mediacore @arcline @nunita"
```

### 7b. Thinking step (~line 2293)

```
"Querying Conveyor Trust Center incident response policies..."
```
→
```
"Querying Arcline Trust Center incident response policies..."
```

### 7c. Vendor array (~line 2308)

```javascript
vendors: ["Mediacore", "Conveyor", "Nunita"],
```
→
```javascript
vendors: ["Mediacore", "Arcline", "Nunita"],
```

### 7d. All `@conveyor/` source references in the comparison table (~lines 2314, 2322, 2330, 2338, 2346)

Replace every `@conveyor/` with `@arcline/`:
- `@conveyor/dpa p.11` → `@arcline/dpa p.11`
- `@conveyor/security-policy p.22` → `@arcline/security-policy p.22`
- `@conveyor/soc2-report p.38` → `@arcline/soc2-report p.38`
- `@conveyor/security-policy p.24` → `@arcline/security-policy p.24`
- `@conveyor/soc2-report p.40` → `@arcline/soc2-report p.40`

### 7e. Comparison summary (~line 2352)

Replace both instances of `**Conveyor**` and `Conveyor` with `**Arcline**` and `Arcline`:
```
"**Conveyor** is strong across the board..."
```
→
```
"**Arcline** is strong across the board..."
```

### 7f. Vendor comparison collection item (~line 2924)

```
desc: "Side-by-side incident response comparison across Mediacore, Conveyor, and Nunita"
```
→
```
desc: "Side-by-side incident response comparison across Mediacore, Arcline, and Nunita"
```

### 7g. Company tag render (~line 2957)

```jsx
<span className="text-brand-400 font-semibold">@conveyor</span>
```
→
```jsx
<span className="text-brand-400 font-semibold">@arcline</span>
```

---

## 8. Update scorecard fallback names

These lines use `tc?.name || "Conveyor"` as a fallback. Change the fallback to `"Arcline"`:

- **Line 3535:** `{tc?.name || "Conveyor"}` → `{tc?.name || "Arcline"}`
- **Line 3671:** `name={tc?.name || "Conveyor"}` → `name={tc?.name || "Arcline"}`
- **Line 3680:** `{tc?.name || "Conveyor"}` → `{tc?.name || "Arcline"}`
- **Line 3948:** `{tc?.name || "Conveyor"}` → `{tc?.name || "Arcline"}`
- **Line 3956:** `{tc?.name || "Conveyor"}` → `{tc?.name || "Arcline"}`
- **Line 3972:** `{tc?.name || "Conveyor"}` → `{tc?.name || "Arcline"}`

---

## 9. Keep these Conveyor references UNCHANGED (platform references)

These all refer to Conveyor as the platform, not the demo company. **Do not change them:**

- **Line 3415:** `"...850+ Conveyor Trust Centers."` — benchmark stat
- **Line 3949:** `"Benchmarked against {ranking.total}+ Conveyor Trust Centers"` — platform benchmark
- **Line 3987:** `"of {ranking.total}+ Conveyor Trust Centers across all dimensions"` — platform benchmark
- **Line 4451:** `"Powered by Conveyor"` — platform attribution
- **Line 273:** Comment about Coco logo shape — internal comment, harmless either way

---

## 10. Update default active Trust Center

The app initializes with `useState("conveyor")` (~line 4441):

```javascript
const [activeTc, setActiveTc] = useState("conveyor");
```

Change to:

```javascript
const [activeTc, setActiveTc] = useState("arcline");
```

---

## 11. Delete `ConveyorLogo` function (optional cleanup)

After all changes, the `ConveyorLogo` function (~line 4165) is no longer referenced anywhere. You can safely remove it and its preceding comment. Check first that no other code references `ConveyorLogo` — it should only have been used in the switcher conditionals which now use `ArclineLogo`.

---

## Summary of changes

| # | What | Action |
|---|------|--------|
| 1 | `ArclineLogo` component | Add new function |
| 2 | `TRUST_CENTERS[0]` | Replace Conveyor entry with Arcline |
| 3 | `applyTcTheme()` | Change `< 200` to `<= 200`, rename variable |
| 4 | Switcher logo conditionals (4 places) | Add Arcline branch |
| 5 | Favicon | Add Arcline case, restructure if/else |
| 6 | Document title | No change (already uses `currentTc.name`) |
| 7 | Demo flow text (8 changes) | Conveyor → Arcline (vendor references) |
| 8 | Scorecard fallbacks (6 places) | `"Conveyor"` → `"Arcline"` |
| 9 | Platform references (4 places) | No change |
| 10 | Default `useState("conveyor")` | Change to `"arcline"` |
| 11 | `ConveyorLogo` function | Delete if unused |

### Arcline identity reference

- **Company:** Arcline — Workflow Automation (B2B SaaS)
- **Logo:** Arc Swoosh (parabolic arc + center node + baseline)
- **Container:** `#122E32` (dark teal) with `rx="8"` rounded square
- **Primary color:** `#22B8CF` (Arcline Cyan)
- **Light accent:** `#80E0E8`
- **oklch theme:** brandHue 200, accentHue 60 (amber)
