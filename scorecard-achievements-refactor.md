# Scorecard Achievements Refactor

Refactor the Achievements section in `trust-center-prototype/src/App.jsx`. Two tasks:

1. **Move** the current 6 operational achievement badges from the Scorecard (`TrustScorecard`) to the Trust Center homepage (`TrustCenterHome`)
2. **Replace** them on the Scorecard with 3 new buyer-facing achievement cards

---

## Task 1: Move current achievements to TrustCenterHome

The current achievements (Response Time, Content Accuracy, Questions Answered, Visitor Engagement, Content Freshness, Update Frequency) and the `ACHIEVEMENT_ICONS` map (~line 3047) are vendor-admin metrics that belong on the homepage, not the buyer scorecard.

### Where to put them on the homepage

Add a new section to `TrustCenterHome` (starts ~line 898) on the **Overview tab**, below the existing stats bar (the 4-item row with Documents 42, FAQs 128, Certifications 6, Avg Response < 2hr) and above the certifications/security items. Render them in a **3×2 grid** just like they appear on the scorecard now.

### What to move

- The `ACHIEVEMENT_ICONS` object (~line 3047) — keep it where it is since it's a top-level const, both pages can reference it
- The `achievements` array from `TrustScorecard` (~line 3328) — recreate it inside `TrustCenterHome`
- The render block (~lines 3404-3426) — copy the grid markup into the homepage

### Homepage render

Add a "Trust Center Performance" subsection. Use the same card markup:

```jsx
{/* Trust Center Performance */}
<div className="mt-6">
  <h3 className="text-sm font-semibold text-text-primary mb-3">Trust Center Performance</h3>
  <div className="grid grid-cols-3 gap-3">
    {achievements.map(a => (
      <div key={a.title} className="bg-bg-primary/40 rounded-xl px-4 py-3.5 border border-border-default/50 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-bg-primary/60 border border-border-default/50 shrink-0 flex items-center justify-center">
          {ACHIEVEMENT_ICONS[a.title]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-text-muted truncate">{a.title}</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-text-primary leading-tight">{a.value}</span>
            <span className="text-[10px] text-text-muted truncate">{a.desc}</span>
          </div>
        </div>
      </div>
    ))}
  </div>
</div>
```

---

## Task 2: Replace Scorecard achievements with 3 buyer-facing cards

Delete the old `achievements` array from `TrustScorecard` and replace with these 3 items. These are trust signals for the buyer, not operational metrics.

### New data

```javascript
const achievements = [
  {
    title: "Framework Coverage",
    value: "92%",
    desc: "SIG Lite pre-fill rate",
    detail: "4 frameworks supported · CAIQ 87% · VSA 83%",
    icon: "framework",
  },
  {
    title: "Audit Streak",
    value: "4 years",
    desc: "Consecutive clean SOC 2",
    detail: "Zero qualified opinions since 2022",
    icon: "audit",
  },
  {
    title: "Active Reviewers",
    value: "47",
    desc: "Companies reviewed this quarter",
    detail: "1,240 unique visitors · 89% first-contact resolution",
    icon: "reviewers",
  },
];
```

### New card design

These should feel more prominent than the old 3×2 grid since there are only 3. Use a **single row of 3 cards**, each slightly taller to accommodate the extra `detail` line:

```jsx
{/* Buyer Trust Signals */}
<div className="border-t border-border-default/50 pt-4">
  <h3 className="text-sm font-semibold text-text-primary mb-3">Trust Highlights</h3>
  <div className="grid grid-cols-3 gap-3">
    {achievements.map(a => (
      <div key={a.title} className="bg-bg-primary/40 rounded-xl px-4 py-4 border border-border-default/50 flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-brand-500/10 border border-brand-500/20 shrink-0 flex items-center justify-center">
          {BUYER_ACHIEVEMENT_ICONS[a.icon]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-text-muted truncate">{a.title}</p>
          <span className="text-lg font-bold text-text-primary leading-tight">{a.value}</span>
          <span className="text-[10px] text-text-muted ml-1.5">{a.desc}</span>
          <p className="text-[10px] text-text-muted/70 mt-0.5">{a.detail}</p>
        </div>
      </div>
    ))}
  </div>
</div>
```

### New pixel art icons

Add a `BUYER_ACHIEVEMENT_ICONS` map next to the existing `ACHIEVEMENT_ICONS`. These follow the same 8×8 Coco pixel art style with Conveyor Green palette and subtle `<animate>` elements.

```jsx
const BUYER_ACHIEVEMENT_ICONS = {
  // Framework Coverage — layered document stack with checkmark
  framework: (
    <svg width="28" height="28" viewBox="0 0 8 8" style={{ imageRendering: 'pixelated' }}>
      {/* Back doc */}
      <rect x="1" y="0" width="5" height="1" fill="#1E7F65"/>
      <rect x="1" y="1" width="1" height="5" fill="#1E7F65"/>
      <rect x="6" y="0" width="1" height="5" fill="#1E7F65"/>
      {/* Front doc */}
      <rect x="2" y="2" width="5" height="1" fill="#2AA886"/>
      <rect x="2" y="3" width="1" height="4" fill="#2AA886"/>
      <rect x="7" y="2" width="1" height="5" fill="#2AA886"/>
      <rect x="2" y="7" width="6" height="1" fill="#2AA886"/>
      {/* Content lines */}
      <rect x="3" y="4" width="3" height="1" fill="#33C69F" opacity="0.6"/>
      <rect x="3" y="6" width="3" height="1" fill="#33C69F" opacity="0.6"/>
      {/* Checkmark */}
      <rect x="4" y="4" width="1" height="1" fill="#7AE8CB">
        <animate attributeName="fill" values="#7AE8CB;#FFFFFF;#7AE8CB" dur="2.4s" repeatCount="indefinite"/>
      </rect>
      <rect x="5" y="3" width="1" height="1" fill="#7AE8CB"/>
    </svg>
  ),

  // Audit Streak — shield with checkmark
  audit: (
    <svg width="28" height="28" viewBox="0 0 8 8" style={{ imageRendering: 'pixelated' }}>
      <rect x="2" y="0" width="4" height="1" fill="#7AE8CB"/>
      <rect x="1" y="1" width="1" height="3" fill="#5DDBB8"/>
      <rect x="6" y="1" width="1" height="3" fill="#5DDBB8"/>
      <rect x="0" y="1" width="1" height="2" fill="#33C69F"/>
      <rect x="7" y="1" width="1" height="2" fill="#33C69F"/>
      <rect x="1" y="4" width="1" height="1" fill="#2AA886"/>
      <rect x="6" y="4" width="1" height="1" fill="#2AA886"/>
      <rect x="2" y="5" width="1" height="1" fill="#1E7F65"/>
      <rect x="5" y="5" width="1" height="1" fill="#1E7F65"/>
      <rect x="3" y="6" width="2" height="1" fill="#0F3D31"/>
      {/* Center check */}
      <rect x="2" y="3" width="1" height="1" fill="#7AE8CB"/>
      <rect x="3" y="4" width="1" height="1" fill="#7AE8CB">
        <animate attributeName="fill" values="#7AE8CB;#FFFFFF;#7AE8CB" dur="2s" repeatCount="indefinite"/>
      </rect>
      <rect x="4" y="3" width="1" height="1" fill="#7AE8CB"/>
      <rect x="5" y="2" width="1" height="1" fill="#7AE8CB"/>
    </svg>
  ),

  // Active Reviewers — group of 3 people
  reviewers: (
    <svg width="28" height="28" viewBox="0 0 8 8" style={{ imageRendering: 'pixelated' }}>
      {/* Center person (front) */}
      <rect x="3" y="1" width="2" height="1" fill="#7AE8CB"/>
      <rect x="3" y="2" width="2" height="1" fill="#5DDBB8"/>
      <rect x="2" y="3" width="4" height="1" fill="#33C69F"/>
      <rect x="3" y="4" width="2" height="1" fill="#2AA886"/>
      {/* Left person (behind) */}
      <rect x="0" y="1" width="2" height="1" fill="#1E7F65"/>
      <rect x="0" y="2" width="2" height="1" fill="#1E7F65"/>
      <rect x="0" y="3" width="2" height="1" fill="#0F3D31"/>
      {/* Right person (behind) */}
      <rect x="6" y="1" width="2" height="1" fill="#1E7F65"/>
      <rect x="6" y="2" width="2" height="1" fill="#1E7F65"/>
      <rect x="6" y="3" width="2" height="1" fill="#0F3D31"/>
      {/* Connection line */}
      <rect x="0" y="5" width="8" height="1" fill="#1E7F65" opacity="0.4"/>
      <rect x="1" y="6" width="6" height="1" fill="#2AA886" opacity="0.3"/>
      {/* Sparkle on center person */}
      <rect x="4" y="0" width="1" height="1" fill="#7AE8CB" opacity="0.6">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="1.8s" repeatCount="indefinite"/>
      </rect>
    </svg>
  ),
};
```

---

## Summary of changes

1. Keep `ACHIEVEMENT_ICONS` where it is (top-level const)
2. Add `BUYER_ACHIEVEMENT_ICONS` next to it
3. In `TrustCenterHome`: add `achievements` array (the old 6 items) + render grid in the Overview tab below the stats bar
4. In `TrustScorecard`: replace the old `achievements` array with the new 3-item buyer array, update the render block to use `BUYER_ACHIEVEMENT_ICONS` and the new card markup with `detail` line, update the section title from "Achievements" to "Trust Highlights"
5. Remove any unused Lucide icon imports that were only used by the old scorecard achievements (Zap, Target, etc. — check if they're used elsewhere before removing)
