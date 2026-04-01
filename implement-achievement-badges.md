# Implement Pixel Art Achievement Badges on Scorecard

Replace the empty placeholder divs in the Achievements section of `trust-center-prototype/src/App.jsx` with pixel art SVG badge icons. The scorecard page is at `/scorecard` (`localhost:5174/scorecard`).

## What to change

### 1. Add a badge icon map

Add this object near the top of the file (after imports, before components). Each key matches the `title` field in the `achievements` array:

```jsx
const ACHIEVEMENT_ICONS = {
  "Response Time": (
    <svg width="28" height="28" viewBox="0 0 8 8" style={{ imageRendering: 'pixelated' }}>
      <rect x="4" y="0" width="2" height="1" fill="#7AE8CB"/>
      <rect x="3" y="1" width="2" height="1" fill="#5DDBB8"/>
      <rect x="2" y="2" width="3" height="1" fill="#33C69F"/>
      <rect x="1" y="3" width="5" height="1" fill="#7AE8CB">
        <animate attributeName="fill" values="#7AE8CB;#FFFFFF;#7AE8CB;#7AE8CB" dur="2s" repeatCount="indefinite"/>
      </rect>
      <rect x="3" y="4" width="2" height="1" fill="#33C69F"/>
      <rect x="2" y="5" width="2" height="1" fill="#5DDBB8"/>
      <rect x="1" y="6" width="2" height="1" fill="#2AA886"/>
      <rect x="0" y="2" width="1" height="1" fill="#1E7F65" opacity="0.5">
        <animate attributeName="opacity" values="0.5;0;0.5" dur="1.2s" repeatCount="indefinite"/>
      </rect>
      <rect x="7" y="4" width="1" height="1" fill="#1E7F65" opacity="0.5">
        <animate attributeName="opacity" values="0;0.5;0" dur="1.2s" repeatCount="indefinite"/>
      </rect>
    </svg>
  ),

  "Content Accuracy": (
    <svg width="28" height="28" viewBox="0 0 8 8" style={{ imageRendering: 'pixelated' }}>
      <rect x="2" y="0" width="4" height="1" fill="#1E7F65"/>
      <rect x="0" y="2" width="1" height="4" fill="#1E7F65"/>
      <rect x="7" y="2" width="1" height="4" fill="#1E7F65"/>
      <rect x="2" y="7" width="4" height="1" fill="#1E7F65"/>
      <rect x="1" y="1" width="1" height="1" fill="#1E7F65"/>
      <rect x="6" y="1" width="1" height="1" fill="#1E7F65"/>
      <rect x="1" y="6" width="1" height="1" fill="#1E7F65"/>
      <rect x="6" y="6" width="1" height="1" fill="#1E7F65"/>
      <rect x="3" y="2" width="2" height="1" fill="#2AA886"/>
      <rect x="2" y="3" width="1" height="2" fill="#2AA886"/>
      <rect x="5" y="3" width="1" height="2" fill="#2AA886"/>
      <rect x="3" y="5" width="2" height="1" fill="#2AA886"/>
      <rect x="3" y="3" width="2" height="2" fill="#7AE8CB">
        <animate attributeName="fill" values="#7AE8CB;#FFFFFF;#7AE8CB" dur="2.4s" repeatCount="indefinite"/>
      </rect>
    </svg>
  ),

  "Questions Answered": (
    <svg width="28" height="28" viewBox="0 0 8 8" style={{ imageRendering: 'pixelated' }}>
      <rect x="2" y="0" width="4" height="1" fill="#7AE8CB"/>
      <rect x="1" y="1" width="1" height="1" fill="#5DDBB8"/>
      <rect x="6" y="1" width="1" height="1" fill="#5DDBB8"/>
      <rect x="5" y="2" width="2" height="1" fill="#33C69F"/>
      <rect x="4" y="3" width="1" height="1" fill="#33C69F"/>
      <rect x="3" y="4" width="1" height="1" fill="#2AA886"/>
      <rect x="3" y="5" width="1" height="1" fill="#2AA886"/>
      <rect x="3" y="7" width="1" height="1" fill="#7AE8CB">
        <animate attributeName="fill" values="#7AE8CB;#FFFFFF;#7AE8CB" dur="2s" repeatCount="indefinite"/>
      </rect>
    </svg>
  ),

  "Visitor Engagement": (
    <svg width="28" height="28" viewBox="0 0 8 8" style={{ imageRendering: 'pixelated' }}>
      <rect x="3" y="0" width="2" height="1" fill="#7AE8CB"/>
      <rect x="3" y="1" width="2" height="1" fill="#5DDBB8"/>
      <rect x="6" y="1" width="1" height="1" fill="#5DDBB8">
        <animate attributeName="fill" values="#5DDBB8;#FFFFFF;#5DDBB8;#5DDBB8" dur="1.6s" repeatCount="indefinite"/>
      </rect>
      <rect x="1" y="2" width="1" height="1" fill="#2AA886"/>
      <rect x="2" y="2" width="4" height="1" fill="#33C69F"/>
      <rect x="3" y="3" width="2" height="1" fill="#33C69F"/>
      <rect x="3" y="4" width="2" height="1" fill="#2AA886"/>
      <rect x="3" y="5" width="1" height="1" fill="#1E7F65"/>
      <rect x="4" y="5" width="1" height="1" fill="#1E7F65"/>
      <rect x="3" y="6" width="1" height="1" fill="#1E7F65"/>
      <rect x="4" y="6" width="1" height="1" fill="#1E7F65"/>
      <rect x="3" y="7" width="1" height="1" fill="#0F3D31"/>
      <rect x="4" y="7" width="1" height="1" fill="#0F3D31"/>
    </svg>
  ),

  "Content Freshness": (
    <svg width="28" height="28" viewBox="0 0 8 8" style={{ imageRendering: 'pixelated' }}>
      <rect x="5" y="0" width="1" height="1" fill="#7AE8CB">
        <animate attributeName="fill" values="#7AE8CB;#FFFFFF;#7AE8CB" dur="3s" repeatCount="indefinite"/>
      </rect>
      <rect x="5" y="1" width="1" height="1" fill="#5DDBB8"/>
      <rect x="4" y="2" width="2" height="1" fill="#33C69F"/>
      <rect x="2" y="1" width="1" height="1" fill="#5DDBB8"/>
      <rect x="2" y="2" width="1" height="1" fill="#33C69F"/>
      <rect x="1" y="2" width="1" height="1" fill="#2AA886"/>
      <rect x="3" y="2" width="1" height="1" fill="#33C69F"/>
      <rect x="3" y="3" width="1" height="1" fill="#2AA886"/>
      <rect x="3" y="4" width="1" height="1" fill="#1E7F65"/>
      <rect x="3" y="5" width="1" height="1" fill="#1E7F65"/>
      <rect x="2" y="6" width="3" height="1" fill="#0F3D31"/>
      <rect x="1" y="7" width="6" height="1" fill="#0F3D31" opacity="0.6"/>
    </svg>
  ),

  "Update Frequency": (
    <svg width="28" height="28" viewBox="0 0 8 8" style={{ imageRendering: 'pixelated' }}>
      <rect x="2" y="0" width="4" height="1" fill="#7AE8CB"/>
      <rect x="1" y="1" width="1" height="1" fill="#5DDBB8"/>
      <rect x="6" y="1" width="1" height="1" fill="#5DDBB8"/>
      <rect x="7" y="0" width="1" height="1" fill="#7AE8CB">
        <animate attributeName="fill" values="#7AE8CB;#FFFFFF;#7AE8CB" dur="2s" repeatCount="indefinite"/>
      </rect>
      <rect x="7" y="1" width="1" height="1" fill="#5DDBB8" opacity="0.6"/>
      <rect x="7" y="2" width="1" height="1" fill="#33C69F"/>
      <rect x="7" y="3" width="1" height="1" fill="#2AA886"/>
      <rect x="2" y="7" width="4" height="1" fill="#2AA886"/>
      <rect x="6" y="6" width="1" height="1" fill="#33C69F"/>
      <rect x="1" y="6" width="1" height="1" fill="#33C69F"/>
      <rect x="0" y="7" width="1" height="1" fill="#33C69F">
        <animate attributeName="fill" values="#33C69F;#7AE8CB;#33C69F" dur="2s" repeatCount="indefinite"/>
      </rect>
      <rect x="0" y="6" width="1" height="1" fill="#2AA886" opacity="0.6"/>
      <rect x="0" y="4" width="1" height="1" fill="#2AA886"/>
      <rect x="0" y="5" width="1" height="1" fill="#33C69F"/>
    </svg>
  ),
};
```

### 2. Remove Lucide icon imports from the achievements array

In the `achievements` array (around line 3004), remove the `icon` property from each object — it's no longer needed since we look up icons by `title`.

### 3. Replace the placeholder div in the render

Find the achievement card render (around line 3491). Replace the empty placeholder:

```jsx
<div className="w-10 h-10 rounded-lg bg-bg-primary/60 border border-border-default/50 shrink-0" />
```

With:

```jsx
<div className="w-10 h-10 rounded-lg bg-bg-primary/60 border border-border-default/50 shrink-0 flex items-center justify-center">
  {ACHIEVEMENT_ICONS[a.title]}
</div>
```

That's it — each card looks up its pixel art icon by title from the map.

## Style notes

- All icons are 28×28px with `viewBox="0 0 8 8"` and `image-rendering: pixelated`
- They use the Conveyor Green palette (`#7AE8CB`, `#5DDBB8`, `#33C69F`, `#2AA886`, `#1E7F65`, `#0F3D31`)
- Each has a subtle SVG `<animate>` for liveliness (white flash, opacity pulse, etc.)
- They match the existing Coco and AiSparkle 4-bit pixel art style
