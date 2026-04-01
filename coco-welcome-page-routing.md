# Welcome Page + Routing Restructure

Add a full-screen Coco character selection page as the default route (`/`). Move the existing Trust Center to `/trust-center`. The Welcome Page is always the landing page — visiting `localhost:5174` or refreshing at `/` always shows it. Clicking "Enter Trust Center" navigates to `/trust-center`.

**Reference mockup:** `public/coco-welcome-page.html` (interactive HTML preview of the final design)

---

## Overview

1. `/` → `WelcomePage` (character selection — always the landing page)
2. `/trust-center` → existing Trust Center overview (was previously `/`)
3. `/trust-center/agent` → Coco AI agent chat (was previously `/agent`)
4. `/trust-center/scorecard` → Trust Scorecard (was previously `/scorecard`)
5. Selected character is stored in `CocoCharacterContext` and used by all `<Coco>` components

---

## 1. Update route map and path constants

Find the `ROUTE_MAP` and `VIEW_FROM_PATH` objects (~line 4410–4411):

```jsx
// BEFORE
const ROUTE_MAP = { "trust-center": "/", "agent": "/agent", "scorecard": "/scorecard" };
const VIEW_FROM_PATH = { "/": "trust-center", "/agent": "agent", "/scorecard": "scorecard" };

// AFTER
const ROUTE_MAP = { "trust-center": "/trust-center", "agent": "/trust-center/agent", "scorecard": "/trust-center/scorecard" };
const VIEW_FROM_PATH = { "/trust-center": "trust-center", "/trust-center/agent": "agent", "/trust-center/scorecard": "scorecard" };
```

---

## 2. Update `isAgent` checks

There are two places that check `location.pathname === "/agent"`. Update both:

**In `AppShell` (~line 4530):**
```jsx
// BEFORE
const isAgent = location.pathname === "/agent";

// AFTER
const isAgent = location.pathname === "/trust-center/agent";
```

**In `CocoCompletionBanner` (~line 4488):**
```jsx
// BEFORE
const isAgent = location.pathname === "/agent";

// AFTER
const isAgent = location.pathname === "/trust-center/agent";
```

---

## 3. Update `navigate("/agent")` calls

Search for all `navigate("/agent"` calls in the file and prefix with `/trust-center`. There are several:

| Line (approx) | Context | Change |
|---|---|---|
| ~3787 | TrustCenterHome "Upload questionnaire" button | `navigate("/trust-center/agent", { state: { skipToUpload: true } })` |
| ~3867 | FAQ section "Ask Coco →" link | `navigate("/trust-center/agent")` |
| ~4507 | CocoCompletionBanner "View" button | `navigate("/trust-center/agent")` |
| ~4580 | CartPanel `onNavigateToAgent` callback | `navigate("/trust-center/agent", ...)` |

---

## 4. Update Routes inside `AppShell`

Find the `<Routes>` block inside `AppShell` (~line 4568–4572):

```jsx
// BEFORE
<Routes location={location}>
  <Route path="/" element={<TrustCenterHome />} />
  <Route path="/scorecard" element={<ScorecardDashboard />} />
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>

// AFTER
<Routes location={location}>
  <Route path="/trust-center" element={<TrustCenterHome />} />
  <Route path="/trust-center/scorecard" element={<ScorecardDashboard />} />
  <Route path="*" element={<Navigate to="/trust-center" replace />} />
</Routes>
```

Also update the `isAgent` conditional that wraps AgentView (~line 4561):
```jsx
// The AgentView div — no route change needed, it's toggled by `isAgent` which was already updated in step 2
```

---

## 5. Create `CocoCharacterContext`

Add near the top of App.jsx, alongside the existing `ThemeContext`, `TcContext`, and `CartContext`:

```jsx
const CocoCharacterContext = createContext("sort");

function useCocoCharacter() {
  return useContext(CocoCharacterContext);
}
```

---

## 6. Create the `COCO_CHARACTERS` config

Add this config object below the existing `COCO_STATES` and `COCO_PALETTE` definitions (~line 294). This defines the 6 selectable characters.

**Important:** The characters use CSS variables (`var(--coco-*)`) for colors, NOT hardcoded hex values. The hardcoded hex values in the HTML mockup are for preview only. In the React code, always use the existing CSS variable references.

Row 1 characters are "Coco" variants (C-Block base). Row 2 characters are "Crunch" variants (Cube base).

```jsx
const COCO_CHARACTERS = {
  sort: {
    name: "Sort Coco",
    role: "The Organizer",
    isDefault: true,
    // This is the existing C-Block Coco. When selected, the Coco component renders
    // exactly as it does today — no changes. renderSvg is only for the WelcomePage picker card.
    renderSvg: (size) => (
      <svg width={size} height={size} viewBox="0 0 8 8" xmlns="http://www.w3.org/2000/svg"
        style={{ imageRendering: "pixelated" }}>
        <rect x="2" y="0" width="4" height="1" fill="var(--coco-top)"/>
        <rect x="1" y="1" width="2" height="1" fill="var(--coco-spine)"/>
        <rect x="1" y="2" width="1" height="1" fill="var(--coco-spine)"/>
        <rect x="1" y="3" width="1" height="1" fill="var(--coco-spine)"/>
        <rect x="1" y="4" width="2" height="1" fill="var(--coco-mid)"/>
        <rect x="2" y="5" width="4" height="1" fill="var(--coco-bottom)"/>
        <rect x="3" y="1" width="3" height="1" fill="var(--coco-mid)"/>
        <rect x="3" y="4" width="3" height="1" fill="var(--coco-interior)" opacity="0.3"/>
        {/* Scanning eyes */}
        <rect x="3" y="2" width="1" height="1" fill="var(--coco-eye-l)">
          <animate attributeName="x" values="3;3;2;2;3;3;4;4;3;3" dur="3s" repeatCount="indefinite"/>
        </rect>
        <rect x="5" y="2" width="1" height="1" fill="var(--coco-eye-r)">
          <animate attributeName="x" values="5;5;4;4;5;5;6;6;5;5" dur="3s" repeatCount="indefinite"/>
        </rect>
        {/* Smile */}
        <rect x="1" y="3" width="1" height="1" fill="var(--coco-smile)" opacity="var(--coco-smile-opacity)"/>
        {/* Arm */}
        <rect x="0" y="2" width="1" height="1" fill="var(--coco-arm)"/>
        {/* Sort flashes */}
        <rect x="0" y="1" width="1" height="1" fill="var(--coco-flash)" opacity="0">
          <animate attributeName="opacity" values="0;0;0.8;0.4;0;0;0;0;0;0" dur="3s" repeatCount="indefinite"/>
        </rect>
        <rect x="7" y="1" width="1" height="1" fill="var(--coco-gold)" opacity="0">
          <animate attributeName="opacity" values="0;0;0;0;0;0;0.8;0.4;0;0" dur="3s" repeatCount="indefinite"/>
        </rect>
        {/* Feet */}
        <rect x="2" y="6" width="1" height="1" fill="var(--coco-feet)"/>
        <rect x="5" y="6" width="1" height="1" fill="var(--coco-feet)"/>
      </svg>
    ),
  },

  search: {
    name: "Search Coco",
    role: "The Document Finder",
    // C-Block base — one eye tracks/searches, magnifying glass glow follows the searching eye
    renderSvg: (size) => (
      <svg width={size} height={size} viewBox="0 0 8 8" xmlns="http://www.w3.org/2000/svg"
        style={{ imageRendering: "pixelated" }}>
        <rect x="2" y="0" width="4" height="1" fill="var(--coco-top)"/>
        <rect x="1" y="1" width="2" height="1" fill="var(--coco-spine)"/>
        <rect x="1" y="2" width="1" height="1" fill="var(--coco-spine)"/>
        <rect x="1" y="3" width="1" height="1" fill="var(--coco-spine)"/>
        <rect x="1" y="4" width="2" height="1" fill="var(--coco-mid)"/>
        <rect x="2" y="5" width="4" height="1" fill="var(--coco-bottom)"/>
        <rect x="3" y="1" width="3" height="1" fill="var(--coco-mid)"/>
        <rect x="3" y="4" width="3" height="1" fill="var(--coco-interior)" opacity="0.3"/>
        <rect x="3" y="2" width="1" height="1" fill="var(--coco-eye-l)"/>
        <rect x="5" y="2" width="1" height="1" fill="var(--coco-eye-r)">
          <animate attributeName="y" values="2;2;3;3;2;1;1;2" dur="3s" repeatCount="indefinite"/>
        </rect>
        <rect x="6" y="2" width="1" height="1" fill="var(--coco-eye-l)" opacity="0">
          <animate attributeName="opacity" values="0;0.4;0.6;0.4;0;0;0;0" dur="3s" repeatCount="indefinite"/>
          <animate attributeName="y" values="2;2;3;3;2;1;1;2" dur="3s" repeatCount="indefinite"/>
        </rect>
        <rect x="1" y="3" width="1" height="1" fill="var(--coco-smile)" opacity="var(--coco-smile-opacity)"/>
        <rect x="0" y="2" width="1" height="1" fill="var(--coco-arm)"/>
        <rect x="2" y="6" width="1" height="1" fill="var(--coco-feet)"/>
        <rect x="5" y="6" width="1" height="1" fill="var(--coco-feet)"/>
      </svg>
    ),
  },

  stamp: {
    name: "Stamp Coco",
    role: "The Approver",
    // C-Block base — right arm stamps down, gold flash on impact
    renderSvg: (size) => (
      <svg width={size} height={size} viewBox="0 0 8 8" xmlns="http://www.w3.org/2000/svg"
        style={{ imageRendering: "pixelated" }}>
        <rect x="2" y="0" width="4" height="1" fill="var(--coco-top)"/>
        <rect x="1" y="1" width="2" height="1" fill="var(--coco-spine)"/>
        <rect x="1" y="2" width="1" height="1" fill="var(--coco-spine)"/>
        <rect x="1" y="3" width="1" height="1" fill="var(--coco-spine)"/>
        <rect x="1" y="4" width="2" height="1" fill="var(--coco-mid)"/>
        <rect x="2" y="5" width="4" height="1" fill="var(--coco-bottom)"/>
        <rect x="3" y="1" width="3" height="1" fill="var(--coco-mid)"/>
        <rect x="3" y="4" width="3" height="1" fill="var(--coco-interior)" opacity="0.3"/>
        <rect x="3" y="2" width="1" height="1" fill="var(--coco-eye-l)"/>
        <rect x="5" y="2" width="1" height="1" fill="var(--coco-eye-l)"/>
        <rect x="1" y="3" width="1" height="1" fill="var(--coco-smile)" opacity="var(--coco-smile-opacity)"/>
        <rect x="0" y="2" width="1" height="1" fill="var(--coco-arm)"/>
        <rect x="7" y="1" width="1" height="1" fill="var(--coco-arm)">
          <animate attributeName="y" values="1;1;3;3;1;1" dur="1.4s" repeatCount="indefinite"/>
        </rect>
        <rect x="7" y="4" width="1" height="1" fill="var(--coco-gold)" opacity="0">
          <animate attributeName="opacity" values="0;0;0.9;0.4;0;0" dur="1.4s" repeatCount="indefinite"/>
        </rect>
        <rect x="2" y="6" width="1" height="1" fill="var(--coco-feet)"/>
        <rect x="5" y="6" width="1" height="1" fill="var(--coco-feet)"/>
      </svg>
    ),
  },

  wave: {
    name: "Wave Crunch",
    role: "The Greeter",
    // Cube base — right arm waves up and down, gold sparkle at peak
    renderSvg: (size) => (
      <svg width={size} height={size} viewBox="0 0 7 7" xmlns="http://www.w3.org/2000/svg"
        style={{ imageRendering: "pixelated" }}>
        <rect x="3" y="0" width="1" height="1" fill="var(--coco-gold)"/>
        <rect x="1" y="1" width="5" height="1" fill="var(--coco-top)"/>
        <rect x="1" y="2" width="5" height="1" fill="var(--coco-spine)"/>
        <rect x="1" y="3" width="5" height="1" fill="var(--coco-spine)"/>
        <rect x="1" y="4" width="5" height="1" fill="var(--coco-mid)"/>
        <rect x="2" y="2" width="1" height="1" fill="var(--coco-smile)"/>
        <rect x="4" y="2" width="1" height="1" fill="var(--coco-smile)"/>
        <rect x="2" y="4" width="3" height="1" fill="var(--coco-smile)"/>
        <rect x="0" y="3" width="1" height="1" fill="var(--coco-arm)"/>
        <rect x="6" y="3" width="1" height="1" fill="var(--coco-arm)">
          <animate attributeName="y" values="3;2;1;2;3;3" dur="1.2s" repeatCount="indefinite"/>
        </rect>
        <rect x="6" y="0" width="1" height="1" fill="var(--coco-gold)" opacity="0">
          <animate attributeName="opacity" values="0;0;0.8;0;0;0" dur="1.2s" repeatCount="indefinite"/>
        </rect>
        <rect x="1" y="5" width="1" height="1" fill="var(--coco-bottom)"/>
        <rect x="5" y="5" width="1" height="1" fill="var(--coco-bottom)"/>
      </svg>
    ),
  },

  typer: {
    name: "Typer Crunch",
    role: "The Auto-Filler",
    // Cube base — both arms alternately type (move up/down out of sync)
    renderSvg: (size) => (
      <svg width={size} height={size} viewBox="0 0 7 7" xmlns="http://www.w3.org/2000/svg"
        style={{ imageRendering: "pixelated" }}>
        <rect x="3" y="0" width="1" height="1" fill="var(--coco-gold)"/>
        <rect x="1" y="1" width="5" height="1" fill="var(--coco-top)"/>
        <rect x="1" y="2" width="5" height="1" fill="var(--coco-spine)"/>
        <rect x="1" y="3" width="5" height="1" fill="var(--coco-spine)"/>
        <rect x="1" y="4" width="5" height="1" fill="var(--coco-mid)"/>
        <rect x="2" y="3" width="1" height="1" fill="var(--coco-smile)"/>
        <rect x="4" y="3" width="1" height="1" fill="var(--coco-smile)"/>
        <rect x="3" y="4" width="1" height="1" fill="var(--coco-smile)"/>
        <rect x="0" y="3" width="1" height="1" fill="var(--coco-arm)">
          <animate attributeName="y" values="3;4;3;3;4;3" dur="0.7s" repeatCount="indefinite"/>
        </rect>
        <rect x="6" y="4" width="1" height="1" fill="var(--coco-arm)">
          <animate attributeName="y" values="4;3;4;4;3;4" dur="0.7s" repeatCount="indefinite"/>
        </rect>
        <rect x="1" y="5" width="1" height="1" fill="var(--coco-bottom)"/>
        <rect x="5" y="5" width="1" height="1" fill="var(--coco-bottom)"/>
      </svg>
    ),
  },

  loader: {
    name: "Loader Crunch",
    role: "The Package Carrier",
    // Cube base — carries a package on head, whole body bobs down under weight
    renderSvg: (size) => (
      <svg width={size} height={size} viewBox="0 0 7 8" xmlns="http://www.w3.org/2000/svg"
        style={{ imageRendering: "pixelated" }}>
        <rect x="1" y="0" width="3" height="1" fill="var(--coco-mid)">
          <animate attributeName="y" values="0;0;1;0" dur="1.8s" repeatCount="indefinite"/>
        </rect>
        <rect x="2" y="0" width="1" height="1" fill="var(--coco-gold)" opacity="0.5">
          <animate attributeName="y" values="0;0;1;0" dur="1.8s" repeatCount="indefinite"/>
        </rect>
        <rect x="1" y="1" width="5" height="1" fill="var(--coco-top)">
          <animate attributeName="y" values="1;1;2;1" dur="1.8s" repeatCount="indefinite"/>
        </rect>
        <rect x="1" y="2" width="5" height="1" fill="var(--coco-spine)">
          <animate attributeName="y" values="2;2;3;2" dur="1.8s" repeatCount="indefinite"/>
        </rect>
        <rect x="1" y="3" width="5" height="1" fill="var(--coco-spine)">
          <animate attributeName="y" values="3;3;4;3" dur="1.8s" repeatCount="indefinite"/>
        </rect>
        <rect x="1" y="4" width="5" height="1" fill="var(--coco-mid)">
          <animate attributeName="y" values="4;4;5;4" dur="1.8s" repeatCount="indefinite"/>
        </rect>
        <rect x="2" y="2" width="1" height="1" fill="var(--coco-smile)">
          <animate attributeName="y" values="2;2;3;2" dur="1.8s" repeatCount="indefinite"/>
        </rect>
        <rect x="4" y="2" width="1" height="1" fill="var(--coco-smile)">
          <animate attributeName="y" values="2;2;3;2" dur="1.8s" repeatCount="indefinite"/>
        </rect>
        <rect x="3" y="4" width="1" height="1" fill="var(--coco-smile)">
          <animate attributeName="y" values="4;4;5;4" dur="1.8s" repeatCount="indefinite"/>
        </rect>
        <rect x="0" y="1" width="1" height="1" fill="var(--coco-arm)">
          <animate attributeName="y" values="1;1;2;1" dur="1.8s" repeatCount="indefinite"/>
        </rect>
        <rect x="6" y="3" width="1" height="1" fill="var(--coco-arm)">
          <animate attributeName="y" values="3;3;4;3" dur="1.8s" repeatCount="indefinite"/>
        </rect>
        <rect x="1" y="6" width="1" height="1" fill="var(--coco-bottom)"/>
        <rect x="5" y="6" width="1" height="1" fill="var(--coco-bottom)"/>
      </svg>
    ),
  },
};
```

---

## 7. Modify the existing `Coco` component

Find the `Coco` function (~line 296). Add a context lookup at the top and conditionally use the character SVG:

```jsx
function Coco({ size = 28, state = "idle" }) {
  const characterId = useCocoCharacter();
  const config = COCO_STATES[state] || COCO_STATES.idle;
  const p = COCO_PALETTE;

  // Determine if we should use the character's custom SVG
  // "sort" always uses the existing C-Block (it IS the C-Block)
  // Other characters use their renderSvg for idle/sorting/waving states
  // but fall back to C-Block for celebrating/sleeping/thinking (state-specific animations)
  const character = COCO_CHARACTERS[characterId];
  const useCharacterSvg = characterId !== "sort" && character &&
    ["idle", "sorting", "waving"].includes(state);

  return (
    <div
      style={{
        width: size,
        height: size,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        animation: config.bounce ? "cocoBounce 2.5s ease-in-out infinite" : "none",
        position: "relative",
      }}
      role="img"
      aria-label="Coco"
    >
      {/* Keep existing <style> keyframes block unchanged */}

      {useCharacterSvg ? (
        <>
          {character.renderSvg(size)}
        </>
      ) : (
        <>
          {/* === EXISTING C-BLOCK SVG RENDERING — keep all of it unchanged === */}
          {/* ... the entire current <svg> and state-conditional blocks ... */}
        </>
      )}

      {/* Keep all existing overlay elements (celebrating particles, sleep Z's, etc.) unchanged */}
    </div>
  );
}
```

> **Key point:** Do NOT delete any existing C-Block rendering code. Keep the full current SVG as the `else` branch. The character SVGs handle idle/sorting/waving states; the C-Block handles celebrating/sleeping/thinking since those have special eye/body animations only built for the C-Block shape.

---

## 8. Create `WelcomePage` component

Add this component above `AppShell` (~line 4525). It renders a full-screen character picker. Sort Coco is pre-selected by default and shows a "Default" badge. Row 2 characters are called "Crunch" (not "Coco").

```jsx
function WelcomePage({ onComplete }) {
  const [selectedId, setSelectedId] = useState("sort"); // Sort Coco pre-selected by default
  const [transitioning, setTransitioning] = useState(false);

  const characters = Object.entries(COCO_CHARACTERS);

  function handleContinue() {
    if (!selectedId) return;
    setTransitioning(true);
    setTimeout(() => onComplete(selectedId), 800);
  }

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-bg-primary relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 600px 400px at 30% 20%, var(--brand-glow-lg), transparent), radial-gradient(ellipse 500px 500px at 70% 80%, rgba(51,198,159,0.03), transparent)"
        }} />

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={transitioning ? { opacity: 0, scale: 0.96 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[680px] px-8"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-bg-elevated border border-border-default text-[11px] font-medium text-text-secondary mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500" style={{ animation: "cocoPulse 2s ease-in-out infinite" }} />
            Access granted
          </div>
          <h1 className="text-[28px] font-bold text-text-primary mb-2 tracking-tight">
            Welcome, <span className="text-brand-400">Ivana</span>
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed max-w-[440px] mx-auto">
            Pick a Coco companion to guide you through your security review. Your character will appear throughout the Trust Center.
          </p>
        </div>

        {/* Section label */}
        <p className="text-[11px] font-semibold uppercase tracking-widest text-text-muted text-center mb-4">Choose your Coco</p>

        {/* Character grid — 3 columns, 2 rows */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {characters.map(([id, char]) => (
            <button
              key={id}
              onClick={() => setSelectedId(id)}
              className={`relative rounded-2xl border-2 p-5 pt-6 text-center transition-all duration-200 cursor-pointer outline-none
                ${selectedId === id
                  ? "border-brand-400 bg-brand-500/5 shadow-[0_0_0_1px_var(--color-brand-400),0_8px_24px_rgba(34,184,207,0.1)]"
                  : "border-border-default bg-bg-surface hover:border-border-bright hover:bg-bg-hover hover:-translate-y-0.5"
                }`}
            >
              {/* Check indicator */}
              <div className={`absolute top-2 right-2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200
                ${selectedId === id ? "border-brand-400 bg-brand-400" : "border-border-default bg-bg-surface"}`}>
                <svg viewBox="0 0 10 10" fill="none" className="w-2.5 h-2.5" style={{ opacity: selectedId === id ? 1 : 0 }}>
                  <path d="M2 5L4.5 7.5L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              {/* Coco SVG */}
              <div className="w-[72px] h-[72px] mx-auto mb-3 flex items-center justify-center">
                {char.renderSvg(72)}
              </div>

              <div className="text-[13px] font-semibold text-text-primary">{char.name}</div>
              <div className="text-[11px] text-text-muted font-medium">{char.role}</div>

              {/* Default badge — only on Sort Coco */}
              {char.isDefault && (
                <div className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide text-brand-400 bg-brand-500/10 border border-brand-500/20">
                  Default
                </div>
              )}

              {/* Top accent line when selected */}
              {selectedId === id && (
                <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
                  style={{ background: "linear-gradient(90deg, transparent, var(--color-brand-400), transparent)" }} />
              )}
            </button>
          ))}
        </div>

        {/* Continue button */}
        <div className="text-center">
          <button
            onClick={handleContinue}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold transition-all duration-200 bg-brand-400 text-bg-primary hover:bg-brand-500 hover:-translate-y-0.5 shadow-[0_4px_16px_rgba(34,184,207,0.25)]"
          >
            Enter Trust Center
            <span className="transition-transform duration-200">→</span>
          </button>

          <p className="text-[11px] text-text-muted mt-6">
            You can change your Coco anytime from your profile settings.
          </p>
        </div>
      </motion.div>

      {/* Transition overlay */}
      <AnimatePresence>
        {transitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-bg-primary"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
              className="w-24 h-24 flex items-center justify-center"
            >
              {COCO_CHARACTERS[selectedId || "sort"].renderSvg(96)}
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-4 text-sm font-medium text-text-secondary"
            >
              Loading your Trust Center...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

---

## 9. Restructure the `App` component

Replace the existing `App` component (~line 4597) with this version that manages the welcome state, provides character context, and uses routing to separate the Welcome Page from the Trust Center:

```jsx
export default function App() {
  const [dark, setDark] = useState(true);
  const toggle = useCallback(() => setDark(d => !d), []);
  const [cocoCharacter, setCocoCharacter] = useState(null); // null = show welcome page

  useEffect(() => {
    document.documentElement.classList.toggle("light-mode", !dark);
  }, [dark]);

  function handleWelcomeComplete(characterId) {
    setCocoCharacter(characterId);
  }

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
    <CocoCharacterContext.Provider value={cocoCharacter || "sort"}>
    <CartProvider>
    <BrowserRouter>
      <Routes>
        {/* Welcome page is the root route — always shown at "/" if no character selected */}
        <Route path="/" element={
          cocoCharacter ? (
            <Navigate to="/trust-center" replace />
          ) : (
            <div className={`h-screen flex text-text-primary overflow-hidden ${dark ? "bg-bg-primary" : "light-mode bg-white"}`}>
              <WelcomePage onComplete={handleWelcomeComplete} />
            </div>
          )
        } />

        {/* Trust Center and all sub-routes — only accessible after character selection */}
        <Route path="/trust-center/*" element={
          cocoCharacter ? (
            <div className={`h-screen flex text-text-primary overflow-hidden ${dark ? "bg-bg-primary" : "light-mode bg-white"}`}>
              <AppShell />
            </div>
          ) : (
            <Navigate to="/" replace />
          )
        } />

        {/* Catch-all: redirect to welcome page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </CartProvider>
    </CocoCharacterContext.Provider>
    </ThemeContext.Provider>
  );
}
```

**Important behavior:**
- Visiting `localhost:5174` → shows Welcome Page (if no character selected)
- Visiting `localhost:5174` → redirects to `/trust-center` (if character already selected)
- Visiting `localhost:5174/trust-center` → shows Trust Center (if character selected) or redirects to `/` (if not)
- Refreshing at `/` → always shows Welcome Page (since `cocoCharacter` state resets)

---

## 10. Update `AppShell` internal routes

Since `AppShell` is now rendered under `/trust-center/*`, its internal routes need to be relative. Update the Routes block inside AppShell:

```jsx
// BEFORE (absolute paths)
<Routes location={location}>
  <Route path="/trust-center" element={<TrustCenterHome />} />
  <Route path="/trust-center/scorecard" element={<ScorecardDashboard />} />
  <Route path="*" element={<Navigate to="/trust-center" replace />} />
</Routes>

// AFTER (relative paths — since AppShell is under /trust-center/*)
<Routes location={location}>
  <Route path="/" element={<TrustCenterHome />} />
  <Route path="/scorecard" element={<ScorecardDashboard />} />
  <Route path="*" element={<Navigate to="/trust-center" replace />} />
</Routes>
```

And the `isAgent` check should use:
```jsx
const isAgent = location.pathname === "/trust-center/agent";
```

---

## 11. All `<Coco>` render locations (no changes needed)

The context approach means these 14+ existing `<Coco>` usages automatically pick up the selected character:

- Sidebar Coco status (~line 662)
- Sidebar task items (~line 697, 726, 763, 783)
- Agent homepage hero (~line 2495)
- Agent chat avatar (~line 2513, 2620, 2641)
- Chat completion badges (~line 2829)
- Scorecard section (~line 3785, 3920)
- Completion banner (~line 4502)
- Agent homepage cards (~line 1743)

All call `<Coco size={N} state="..." />` which now internally checks `useCocoCharacter()` and renders the right variant.

---

## Summary of all changes

| # | What | Where | Action |
|---|------|-------|--------|
| 1 | `ROUTE_MAP` + `VIEW_FROM_PATH` | ~line 4410 | Prefix all paths with `/trust-center` |
| 2 | `isAgent` checks (2 places) | ~line 4530, 4488 | Change to `/trust-center/agent` |
| 3 | `navigate("/agent"` calls (4+ places) | various | Prefix with `/trust-center` |
| 4 | `<Routes>` in AppShell | ~line 4568 | Use relative paths under `/trust-center/*` |
| 5 | `CocoCharacterContext` | Top of file | Add new context with `"sort"` default |
| 6 | `COCO_CHARACTERS` config | Below `COCO_PALETTE` (~line 294) | Add 6 character definitions (3 Coco + 3 Crunch) |
| 7 | `Coco` component | ~line 296 | Add context check; `"sort"` uses existing C-Block |
| 8 | `WelcomePage` component | Above `AppShell` | New full-screen character picker |
| 9 | `App` component | ~line 4597 | Add character state, context provider, route restructure |
| 10 | Internal AppShell routes | ~line 4568 | Relative paths under `/trust-center/*` |

### Route mapping (before → after)

| Before | After | Content |
|--------|-------|---------|
| `/` | `/` | Welcome Page (new) |
| `/` | `/trust-center` | Trust Center Home |
| `/agent` | `/trust-center/agent` | Coco Agent Chat |
| `/scorecard` | `/trust-center/scorecard` | Trust Scorecard |

### Character grid layout

Row 1 (C-Block / "Coco"): **Sort Coco** (default, pre-selected), Search Coco, Stamp Coco
Row 2 (Cube / "Crunch"): Wave Crunch, Typer Crunch, Loader Crunch

### Flow

```
User visits localhost:5174 → "/" route → cocoCharacter is null → WelcomePage renders (Sort Coco pre-selected)
  ↓ user picks "typer" and clicks "Enter Trust Center"
setCocoCharacter("typer") → WelcomePage fades → Navigate to /trust-center → AppShell renders
  ↓ everywhere in the app
<Coco size={28} state="idle" /> reads context → renders Typer Crunch SVG
<Coco size={32} state="celebrating" /> → falls back to C-Block (state-specific animation)
  ↓ if "sort" was selected (or default)
<Coco size={28} state="idle" /> → renders the existing C-Block code unchanged (all states work)
  ↓ user refreshes at /trust-center
cocoCharacter is null → redirect to / → WelcomePage shows again
```
