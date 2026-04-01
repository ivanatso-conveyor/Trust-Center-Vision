# Replace User Profile Avatar with Pixel Art

In `trust-center-prototype/src/App.jsx`, replace the "JC" initials avatar with a pixel art SVG. Two options below — use **Option B (IT initials)**.

## What to change

Find the user profile avatar button (~line 4251). The current code is:

```jsx
{/* User profile avatar */}
{(() => { const { dark: dk } = useTheme(); return (
  <button onClick={onOpenProfile} aria-label="Open profile"
    className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors ${
      dk
        ? "bg-gradient-to-br from-brand-600 to-brand-900 border-border-default hover:border-brand-600/60"
        : "bg-gradient-to-br from-brand-500 to-brand-600 border-brand-500/30 hover:border-brand-500/60"
    }`}
    title="Jordan Chen">
    <span className={`text-xs font-semibold leading-none ${dk ? "text-white" : "text-white"}`}>JC</span>
  </button>
); })()}
```

Replace the entire `{(() => { ... })()}` block (including the outer IIFE) with the chosen option below. The new button does not need the `useTheme()` hook — the neutral greys work in both modes.

---

## Option A: Cube Coco (grey)

The Cube Coco character (antenna, square body, dot eyes, smile, arms, feet) in neutral grey:

```jsx
{/* User profile avatar */}
<button onClick={onOpenProfile} aria-label="Open profile"
  className="w-10 h-10 rounded-full border border-border-default hover:border-text-muted/40 flex items-center justify-center transition-colors bg-bg-surface"
  title="Jordan Chen">
  <svg width="24" height="24" viewBox="0 0 7 7" style={{ imageRendering: 'pixelated' }} xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="0" width="1" height="1" fill="#A0A0B0"/>
    <rect x="1" y="1" width="5" height="1" fill="#9090A0"/>
    <rect x="1" y="2" width="5" height="1" fill="#808090"/>
    <rect x="2" y="2" width="1" height="1" fill="#FFF"/>
    <rect x="4" y="2" width="1" height="1" fill="#FFF"/>
    <rect x="1" y="3" width="5" height="1" fill="#808090"/>
    <rect x="1" y="4" width="5" height="1" fill="#707080"/>
    <rect x="2" y="4" width="3" height="1" fill="#FFF"/>
    <rect x="0" y="3" width="1" height="1" fill="#9090A0"/>
    <rect x="6" y="3" width="1" height="1" fill="#9090A0"/>
    <rect x="1" y="5" width="1" height="1" fill="#606070"/>
    <rect x="5" y="5" width="1" height="1" fill="#606070"/>
  </svg>
</button>
```

---

## Option B: IT Pixel Initials (use this one)

Serifed "I" and "T" in pixel squares with a top-to-bottom grey gradient for depth. Same 7×7 grid as Cube Coco:

```jsx
{/* User profile avatar */}
<button onClick={onOpenProfile} aria-label="Open profile"
  className="w-10 h-10 rounded-full border border-border-default hover:border-text-muted/40 flex items-center justify-center transition-colors bg-bg-surface"
  title="Ivana Tso">
  <svg width="24" height="24" viewBox="0 0 7 7" style={{ imageRendering: 'pixelated' }} xmlns="http://www.w3.org/2000/svg">
    {/* I — top serif */}
    <rect x="0" y="0" width="3" height="1" fill="#A0A0B0"/>
    {/* I — stem */}
    <rect x="1" y="1" width="1" height="1" fill="#9898A8"/>
    <rect x="1" y="2" width="1" height="1" fill="#9090A0"/>
    <rect x="1" y="3" width="1" height="1" fill="#888898"/>
    <rect x="1" y="4" width="1" height="1" fill="#808090"/>
    <rect x="1" y="5" width="1" height="1" fill="#787888"/>
    {/* I — bottom serif */}
    <rect x="0" y="6" width="3" height="1" fill="#707080"/>
    {/* T — top bar */}
    <rect x="4" y="0" width="3" height="1" fill="#A0A0B0"/>
    {/* T — stem */}
    <rect x="5" y="1" width="1" height="1" fill="#9898A8"/>
    <rect x="5" y="2" width="1" height="1" fill="#9090A0"/>
    <rect x="5" y="3" width="1" height="1" fill="#888898"/>
    <rect x="5" y="4" width="1" height="1" fill="#808090"/>
    <rect x="5" y="5" width="1" height="1" fill="#787888"/>
    <rect x="5" y="6" width="1" height="1" fill="#707080"/>
  </svg>
</button>
```

### Pixel grid reference (7×7)

```
  0 1 2 3 4 5 6
0 █ █ █ · █ █ █   ← I serif + T bar (#A0A0B0)
1 · █ · · · █ ·   (#9898A8)
2 · █ · · · █ ·   (#9090A0)
3 · █ · · · █ ·   (#888898)
4 · █ · · · █ ·   (#808090)
5 · █ · · · █ ·   (#787888)
6 █ █ █ · · █ ·   ← I serif (#707080)
```

Column 3 is always empty — it's the letter spacing between I and T.

### Grey palette (top → bottom gradient)

| Row | Color | Hex |
|-----|-------|-----|
| 0 (serifs/bar) | Lightest | `#A0A0B0` |
| 1 | | `#9898A8` |
| 2 | | `#9090A0` |
| 3 | Mid | `#888898` |
| 4 | | `#808090` |
| 5 | | `#787888` |
| 6 (base) | Darkest | `#707080` |

All greys have a subtle blue-purple tint to match the app's dark UI. They read cleanly on both dark (`#12121A`) and light (`#F5F5F8`) backgrounds.

## Button styling notes

- Removed the `dk` theme conditional and brand-color gradients — neutral greys work in both modes
- Uses `bg-bg-surface` and `border-border-default` which already adapt to light/dark
- Kept `rounded-full` for the circular container
- SVG is 24×24px inside the 40×40px button, giving comfortable padding
- Updated title from "Jordan Chen" to "Ivana Tso"
