# Coco Character Selection — Welcome Page

Add a full-screen welcome page that appears before the Trust Center loads. The user picks one of 6 Coco characters. That character is used everywhere `<Coco>` appears for the rest of the session.

**Reference mockup:** `public/coco-welcome-page.html` (interactive HTML preview)

---

## Overview

1. A new `WelcomePage` component shows "Welcome, Ivana" + a grid of 7 animated Coco characters (Sort Coco is pre-selected by default)
2. User clicks a character → it highlights with a cyan border + checkmark (Sort Coco starts already selected)
3. User clicks "Enter Trust Center" → transition screen → `AppShell` loads
4. The selected character ID is stored in a React context (`CocoCharacterContext`)
5. The existing `Coco` component reads from this context and renders the appropriate character variant instead of always rendering the C-Block

---

## 1. Create `CocoCharacterContext`

Add near the top of App.jsx, alongside the existing `ThemeContext`, `TcContext`, and `CartContext`:

```jsx
const CocoCharacterContext = createContext("sort");

function useCocoCharacter() {
  return useContext(CocoCharacterContext);
}
```

---

## 2. Create the `COCO_CHARACTERS` config

Add this config object below the existing `COCO_STATES` and `COCO_PALETTE` definitions (~line 294). This defines the 7 selectable characters and their SVG render functions. Each character has a `name`, `role`, and `renderSvg(size)` function that returns the pixel art SVG. The first entry (`sort`) is the existing C-Block Sort Coco and should be pre-selected by default.

```jsx
const COCO_CHARACTERS = {
  sort: {
    name: "Sort Coco",
    role: "The Organizer",
    // C-Block base — the original Coco. Sorting eyes scan left/right, green flash (approved) on left, gold flash (flagged) on right.
    // This character reuses the existing Coco component's rendering for ALL states (idle, thinking, celebrating, sleeping, waving, sorting).
    // When this character is selected, the Coco component should render exactly as it does today — no changes needed.
    // The renderSvg below is only used on the WelcomePage picker card (idle preview).
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

  wave: {
    name: "Wave Coco",
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
        <rect x="1" y="5" width="1" height="1" fill="var(--coco-feet)"/>
        <rect x="5" y="5" width="1" height="1" fill="var(--coco-feet)"/>
      </svg>
    ),
  },

  typer: {
    name: "Typer Coco",
    role: "The Auto-Filler",
    // Cube base — arms alternate typing, eyes look down, focused mouth
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
        <rect x="1" y="5" width="1" height="1" fill="var(--coco-feet)"/>
        <rect x="5" y="5" width="1" height="1" fill="var(--coco-feet)"/>
      </svg>
    ),
  },

  nod: {
    name: "Nod Coco",
    role: "The Confirmer",
    // Cube base — whole body nods, gold thumbs-up arm
    renderSvg: (size) => (
      <svg width={size} height={size} viewBox="0 0 7 7" xmlns="http://www.w3.org/2000/svg"
        style={{ imageRendering: "pixelated", animation: "cocoNod 2s ease-in-out infinite", transformOrigin: "3.5px 5px" }}>
        <rect x="3" y="0" width="1" height="1" fill="var(--coco-gold)"/>
        <rect x="1" y="1" width="5" height="1" fill="var(--coco-top)"/>
        <rect x="1" y="2" width="5" height="1" fill="var(--coco-spine)"/>
        <rect x="1" y="3" width="5" height="1" fill="var(--coco-spine)"/>
        <rect x="1" y="4" width="5" height="1" fill="var(--coco-mid)"/>
        <rect x="2" y="2" width="1" height="1" fill="var(--coco-smile)"/>
        <rect x="4" y="2" width="1" height="1" fill="var(--coco-smile)"/>
        <rect x="2" y="4" width="3" height="1" fill="var(--coco-smile)"/>
        <rect x="6" y="2" width="1" height="1" fill="var(--coco-arm)"/>
        <rect x="6" y="3" width="1" height="1" fill="var(--coco-gold)"/>
        <rect x="0" y="3" width="1" height="1" fill="var(--coco-arm)"/>
        <rect x="1" y="5" width="1" height="1" fill="var(--coco-feet)"/>
        <rect x="5" y="5" width="1" height="1" fill="var(--coco-feet)"/>
      </svg>
    ),
  },

  search: {
    name: "Search Coco",
    role: "The Document Finder",
    // C-Block base — one fixed eye, one scanning magnifier eye with beam
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
        <rect x="5" y="2" width="1" height="1" fill="var(--coco-smile)">
          <animate attributeName="y" values="2;2;3;3;2;1;1;2" dur="3s" repeatCount="indefinite"/>
        </rect>
        <rect x="6" y="2" width="1" height="1" fill="var(--coco-eye-l)" opacity="0">
          <animate attributeName="opacity" values="0;0.4;0.6;0.4;0;0;0;0" dur="3s" repeatCount="indefinite"/>
          <animate attributeName="y" values="2;2;3;3;2;1;1;2" dur="3s" repeatCount="indefinite"/>
        </rect>
        <rect x="1" y="3" width="1" height="1" fill="var(--coco-smile)" opacity="0.7"/>
        <rect x="0" y="2" width="1" height="1" fill="var(--coco-arm)"/>
        <rect x="2" y="6" width="1" height="1" fill="var(--coco-feet)"/>
        <rect x="5" y="6" width="1" height="1" fill="var(--coco-feet)"/>
      </svg>
    ),
  },

  loader: {
    name: "Loader Coco",
    role: "The Package Carrier",
    // Cube base — carries package on head, bobs under weight
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
        <rect x="1" y="6" width="1" height="1" fill="var(--coco-feet)"/>
        <rect x="5" y="6" width="1" height="1" fill="var(--coco-feet)"/>
      </svg>
    ),
  },

  stamp: {
    name: "Stamp Coco",
    role: "The Approver",
    // C-Block base — arm stamps down with gold flash on contact
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
        <rect x="1" y="3" width="1" height="1" fill="var(--coco-smile)" opacity="0.7"/>
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
};
```

> **Important:** All SVGs use `var(--coco-*)` CSS variables (same as the existing `COCO_PALETTE`), so they automatically adapt to light/dark mode and theme switching. Add a `@keyframes cocoNod` animation to the existing `<style>` tag inside the `Coco` component (or globally):
> ```css
> @keyframes cocoNod { 0%,100%{transform:rotate(0deg)} 20%{transform:rotate(5deg)} 30%{transform:rotate(0deg)} 40%{transform:rotate(5deg)} 50%{transform:rotate(0deg)} }
> ```

---

## 3. Modify the `Coco` component

The existing `Coco` component (~line 296) always renders the C-Block body. Update it to check the `CocoCharacterContext` and delegate to the selected character's `renderSvg` when available.

**Strategy:** When `"sort"` is selected (the default), render the existing C-Block code as-is for ALL states — no changes at all. For the other 6 characters, use their `renderSvg` function for idle/sorting/waving states and fall back to C-Block rendering for celebrating/sleeping/thinking (since those state-specific animations are only built for the C-Block shape).

```jsx
function Coco({ size = 48, state = "idle", className = "" }) {
  const characterId = useCocoCharacter();
  const character = COCO_CHARACTERS[characterId];
  const p = COCO_PALETTE;
  const config = COCO_STATES[state] || COCO_STATES.idle;
  const dur = config.speed;

  // "sort" is the original C-Block Coco — always use the existing rendering for all states.
  // For other characters, use their renderSvg for idle/sorting/waving states,
  // and fall back to C-Block for celebrating/sleeping/thinking (state-specific animations).
  const useCharacterSvg = characterId !== "sort" && character && (state === "idle" || state === "sorting" || state === "waving");

  return (
    <div
      className={className}
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
      <style>{`
        @keyframes cocoBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        @keyframes cocoWaveArm { 0%,100%{transform:translateY(0)} 25%{transform:translateY(-1px)} 50%{transform:translateY(-2px)} 75%{transform:translateY(-1px)} }
        @keyframes cocoPulse { 0%,100%{opacity:0.3} 50%{opacity:1} }
        @keyframes cocoParticle1 { 0%{transform:translate(0,0);opacity:1} 100%{transform:translate(-3px,-4px);opacity:0} }
        @keyframes cocoParticle2 { 0%{transform:translate(0,0);opacity:1} 100%{transform:translate(3px,-3px);opacity:0} }
        @keyframes cocoParticle3 { 0%{transform:translate(0,0);opacity:1} 100%{transform:translate(4px,-5px);opacity:0} }
        @keyframes cocoZFloat { 0%{transform:translateY(0);opacity:0.6} 100%{transform:translateY(-8px);opacity:0} }
        @keyframes cocoNod { 0%,100%{transform:rotate(0deg)} 20%{transform:rotate(5deg)} 30%{transform:rotate(0deg)} 40%{transform:rotate(5deg)} 50%{transform:rotate(0deg)} }
      `}</style>

      {useCharacterSvg ? (
        <>
          {character.renderSvg(size)}
          {/* Celebrating particles still overlay on character SVGs */}
        </>
      ) : (
        <>
          {/* === EXISTING C-BLOCK SVG RENDERING — keep all of it unchanged === */}
          {/* ... the entire current <svg> and state-conditional blocks ... */}
        </>
      )}

      {/* Keep all the existing overlay elements (celebrating particles, sleep Z's, etc.) */}
      {state === "celebrating" && (
        <>
          <div style={{ position:"absolute", top:"10%", left:"20%", width:4, height:4, background:p.particle1, animation:"cocoParticle1 0.8s ease-out infinite" }} />
          <div style={{ position:"absolute", top:"15%", right:"20%", width:4, height:4, background:p.particle2, animation:"cocoParticle2 0.8s ease-out infinite 0.2s" }} />
          <div style={{ position:"absolute", top:"5%", right:"30%", width:3, height:3, background:p.particle3, animation:"cocoParticle3 0.8s ease-out infinite 0.4s" }} />
        </>
      )}
      {state === "sleeping" && (
        <div style={{ position:"absolute", top:"-10%", right:"15%", fontSize:size*0.2, color:p.sleepZ, fontFamily:"monospace", animation:"cocoZFloat 2s ease-out infinite" }}>z</div>
      )}
    </div>
  );
}
```

> **Key point:** Do NOT delete any existing C-Block rendering code. Keep the full current SVG as the `else` branch. The character SVGs handle idle/sorting/waving states; the C-Block handles celebrating/sleeping/thinking since those have special eye/body animations that are only built for the C-Block shape.

---

## 4. Create `WelcomePage` component

Add this component above `AppShell` (~line 4525). It renders a full-screen character picker that matches the dark Trust Center aesthetic.

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

  function handleSkip() {
    setTransitioning(true);
    setTimeout(() => onComplete("sort"), 600);
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

        {/* Character grid */}
        <div className="grid grid-cols-4 gap-3 mb-8">
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

              {/* Top accent line when selected */}
              {selectedId === id && (
                <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
                  style={{ background: "linear-gradient(90deg, transparent, var(--color-brand-400), transparent)" }} />
              )}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="text-center">
          <button
            onClick={handleContinue}
            disabled={!selectedId}
            className={`inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold transition-all duration-200
              ${selectedId
                ? "bg-brand-400 text-bg-primary hover:bg-brand-500 hover:-translate-y-0.5 shadow-[0_4px_16px_rgba(34,184,207,0.25)]"
                : "bg-bg-elevated text-text-muted cursor-not-allowed"
              }`}
          >
            Enter Trust Center
            <span className="transition-transform duration-200" style={{ transform: selectedId ? "translateX(0)" : "none" }}>→</span>
          </button>

          <button onClick={handleSkip}
            className="block mx-auto mt-4 text-xs text-text-muted hover:text-text-secondary transition-colors">
            Skip — use default Coco
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
              {COCO_CHARACTERS[selectedId || "wave"].renderSvg(96)}
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

## 5. Wire it into the `App` component

Modify the `App` component (~line 4597) to manage welcome state and provide the character context:

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
      {!cocoCharacter ? (
        <div className={`h-screen flex text-text-primary overflow-hidden ${dark ? "bg-bg-primary" : "light-mode bg-white"}`}>
          <WelcomePage onComplete={handleWelcomeComplete} />
        </div>
      ) : (
        <div className={`h-screen flex text-text-primary overflow-hidden ${dark ? "bg-bg-primary" : "light-mode bg-white"}`}>
          <AppShell />
        </div>
      )}
    </BrowserRouter>
    </CartProvider>
    </CocoCharacterContext.Provider>
    </ThemeContext.Provider>
  );
}
```

> **What this does:** On first load, `cocoCharacter` is `null`, so `WelcomePage` renders. Once the user picks a character, `cocoCharacter` is set (e.g., `"typer"`), the welcome page fades out, and `AppShell` renders. The `CocoCharacterContext.Provider` wraps everything so any `<Coco>` component anywhere in the app can read the selected character.

---

## 6. All `<Coco>` render locations (no changes needed)

The beauty of the context approach is that these 14+ existing `<Coco>` usages automatically pick up the selected character — **no changes needed** at any of these call sites:

- **Sidebar Coco status** (~line 662): `<Coco size={28} state={cocoAnim} />`
- **Sidebar task items** (~line 697, 726, 763, 783): various sizes and states
- **Agent homepage hero** (~line 2495): `<Coco size={80} state={cocoStates[cocoIdx]} />`
- **Agent chat avatar** (~line 2513, 2620, 2641): agent message Coco
- **Chat completion badges** (~line 2829): celebrating state
- **Scorecard section** (~line 3785, 3920): idle Coco
- **Completion banner** (~line 4502): `<Coco size={32} state="celebrating" />`
- **Agent homepage cards** (~line 1743): status-dependent state

All of these call `<Coco size={N} state="..." />` which now internally checks `useCocoCharacter()` and renders the right variant.

---

## Summary of changes

| # | What | Where | Action |
|---|------|-------|--------|
| 1 | `CocoCharacterContext` + `useCocoCharacter` | Top of file, near other contexts | Add new context |
| 2 | `COCO_CHARACTERS` config | Below `COCO_PALETTE` (~line 294) | Add 7 character definitions with `renderSvg` (`sort` first, pre-selected) |
| 3 | `Coco` component | ~line 296 | Add character context check; `"sort"` always uses existing C-Block for all states; others use renderSvg for idle/sorting/waving |
| 4 | `@keyframes cocoNod` | Inside Coco's `<style>` tag | Add nod animation |
| 5 | `WelcomePage` component | Above `AppShell` (~line 4525) | Add full welcome page |
| 6 | `App` component | ~line 4597 | Add `cocoCharacter` state, wrap with `CocoCharacterContext.Provider`, conditionally render WelcomePage vs AppShell |

### Flow

```
App loads → cocoCharacter is null → WelcomePage renders (Sort Coco pre-selected)
  ↓ user picks "typer" and clicks Enter (or keeps Sort Coco and clicks Enter)
setCocoCharacter("typer") → WelcomePage fades → AppShell renders
  ↓ everywhere in the app
<Coco size={28} state="idle" /> reads context → renders Typer Coco SVG
<Coco size={32} state="celebrating" /> → falls back to C-Block (state-specific animation)
  ↓ if "sort" was selected instead
<Coco size={28} state="idle" /> → renders the existing C-Block code unchanged (all states work)
```
