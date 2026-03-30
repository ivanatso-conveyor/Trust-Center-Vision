# Claude Code Prompt: Conveyor Trust Center Vision Prototype

> Copy and paste this entire prompt into Claude Code to build the prototype. It is designed to be self-contained with all context, design tokens, component specs, and interaction patterns needed.

---

## PROMPT START

You are building a high-fidelity interactive prototype of a reimagined Trust Center for Conveyor (conveyor.com). This is a vision prototype — not production code — meant to demonstrate what a next-generation trust center could look and feel like. Build it as a single-page React app using Vite + React + Tailwind CSS.

### Project Setup

```
npx create-vite@latest trust-center-prototype --template react
cd trust-center-prototype
npm install
npm install lucide-react framer-motion
```

Replace the default app with the prototype described below. All code should be in a single `src/App.jsx` file with Tailwind utility classes (no separate CSS files). Use `framer-motion` for animations and `lucide-react` for icons.

---

### DESIGN SYSTEM: Dark Mode with Conveyor Green

**Primary palette built around `#33C69F` (Conveyor Green):**

| Token | Hex | Usage |
|---|---|---|
| `green-400` | `#5DDBB8` | Hover states, highlights, contribution graph bright |
| `green-500` | `#33C69F` | Primary accent — buttons, active states, badges, links |
| `green-600` | `#2AA886` | Pressed states, borders |
| `green-700` | `#1E7F65` | Contribution graph medium |
| `green-900` | `#0F3D31` | Contribution graph dim, subtle backgrounds |
| `bg-primary` | `#0D0D12` | Page background (near-black with slight warmth) |
| `bg-surface` | `#16161E` | Card/panel backgrounds |
| `bg-elevated` | `#1E1E2A` | Elevated cards, modals, Coco chat panel |
| `bg-hover` | `#252535` | Hover states on surfaces |
| `border-default` | `#2A2A3A` | Default borders |
| `border-bright` | `#3A3A4F` | Emphasized borders |
| `text-primary` | `#E8E8ED` | Primary text |
| `text-secondary` | `#9898A8` | Secondary text, labels |
| `text-muted` | `#5E5E72` | Muted text, placeholders |
| `badge-gold` | `#FFD700` | Gold tier badge accent |
| `badge-silver` | `#C0C0D0` | Silver tier badge accent |
| `badge-bronze` | `#CD7F32` | Bronze tier badge accent |
| `red-500` | `#EF4444` | Error, low-confidence indicators |
| `yellow-500` | `#EAB308` | Warning, medium-confidence indicators |

**Typography:**
- Font family: `Inter` (import from Google Fonts) with fallback to `system-ui, sans-serif`
- Heading 1: 28px / bold / `text-primary`
- Heading 2: 22px / semibold / `text-primary`
- Heading 3: 16px / semibold / `text-secondary`
- Body: 14px / regular / `text-primary`
- Caption: 12px / regular / `text-secondary`

**Border radius:** Use `rounded-xl` (12px) for cards, `rounded-lg` (8px) for buttons and inputs, `rounded-full` for badges and avatars.

**Spacing:** Use Tailwind's default scale. Generous whitespace — this should feel premium, not cramped.

---

### THE PROTOTYPE: What to Build

Build a scrollable single-page prototype with these sections/states, all within one React app. Use React `useState` to toggle between views. Include a top nav bar with buttons to switch between the major views.

---

#### VIEW 1: Trust Center Home (Default View)

The main trust center page that a visitor sees. Dark mode, full-width layout at 1280px max-width centered.

**Header/Hero Section:**
- Top bar: Conveyor logo (use a simple green `<C>` monogram in a rounded square) + company name "Acme Corp" + "Powered by Conveyor" badge
- Navigation tabs: `Overview` | `Documents` | `Knowledge Base` | `Subprocessors` | `Updates` — styled as pill tabs with green active state
- Hero area with a subtle gradient banner (dark-to-slightly-lighter sweep from left to right using `green-900` to `bg-surface`)
- Large heading: "Acme Corp Trust Center"
- Subheading: "Transparent security for our customers and partners"
- **Stats bar:** Four stats in a row: `42 Documents` | `128 FAQs` | `6 Certifications` | `< 2hr Avg Response` — each in a subtle card with an icon
- **Compliance badges row:** Display badges for SOC 2 Type II, ISO 27001, GDPR, HIPAA, SOC 3 — each as a small pill with a shield icon and green accent border. On hover, show a tooltip "View Report"
- **"Actively Maintained" indicator:** A mini GitHub-style contribution graph (tiny, 12 weeks x 7 days grid of small squares) using the green palette shades (`green-900` for low, `green-700` for medium, `green-500` for high activity). Label it "Trust Center Activity — Last 90 Days". Generate random but realistic-looking data weighted toward recent activity.
- **Unified search bar:** Large, centered, with placeholder "Ask anything about Acme Corp's security posture..." and a sparkle icon indicating AI. On focus, expand slightly with a green glow border.

**Content Area (below the fold):**
- **"Just for You" section** (shown to authenticated visitors): A personalized card with "Welcome back, Jordan" heading, showing 2-3 cards: "Your Questionnaire — 87% complete", "3 New Documents since your last visit", "2 Gap Requests Resolved"
- **Quick Summary panel:** A two-column grid of security posture items with green checkmarks: "Annual Penetration Testing ✓", "Data Processing Agreement ✓", "Mobile Device Management ✓", "Cyber Insurance ✓", "Bug Bounty Program ✓", "Vulnerability Scanning ✓", "Security Awareness Training ✓", "Incident Response Plan ✓"
- **Featured Documents:** 3-4 document cards in a grid showing title, type badge (PDF, XLSX), last-updated date, and a lock icon for NDA-gated docs
- **Knowledge Base Preview:** 4-5 categorized FAQ entries (Access Management, Application Security, Data Privacy, Infrastructure, Incident Response) with expandable accordion

**Coco — Bottom Right:**
- A floating button in the bottom-right corner (64x64px) using the `<Coco size={48} state="idle" />` component (see COCO PIXEL ART SPEC section below)
- Coco is "Sort Coco — The Organizer": a 4-bit (8x8 grid) C-Block character shaped like the Conveyor "C" logo. In idle state, its eyes flick left and right as it "sorts" items — a green flash appears left (approved) and a gold flash appears right (flagged). This is the signature animation.
- Wrap in a gentle bounce animation and place on a circular `bg-elevated` background with a `green-500` border
- Speech bubble on load (appears after 2 seconds): "Hi! I'm Coco — I sort through your security docs so you don't have to. 👋" — styled as a dark tooltip with green accent border
- On click, open the Coco Chat Panel (View 3)

---

#### VIEW 2: Coco Profile Page

A dedicated profile page for the visitor, inspired by GitHub's profile page. Navigated to via a "My Profile" link in the top nav.

**Profile Header:**
- Left side: Coco avatar (larger version of the 8-bit character, 120x120px) with the visitor's name "Jordan Chen" and title "Security Analyst at BigCorp"
- Right side: Streak counter showing "🔥 14-day streak" with a flame icon and the text "Longest: 32 days"
- Below: A row of stats: `12 Trust Centers Visited` | `8 Questionnaires Completed` | `23 Gaps Reported` | `7 Badges Earned`

**Trust Activity Graph (GitHub Contribution Graph Clone):**
- Full-width heatmap grid: 52 columns (weeks) x 7 rows (days), using small 11x11px rounded squares with 2px gap
- Color scale: `bg-surface` (no activity) → `green-900` (low) → `green-700` (medium-low) → `green-500` (medium-high) → `green-400` (high)
- Generate realistic random data weighted toward weekdays and recent months
- Label: "Trust Review Activity — Last 12 Months"
- Below the grid: month labels (Apr, May, Jun... Mar) and a color legend
- On hover over a square, show a tooltip: "3 activities on March 15, 2026"

**Badge Showcase:**
- Section heading: "Badges" with a small "7 earned" count
- Display badges as a grid of 8-bit pixel art style cards (3 per row):
  - **Trust Explorer** (Silver tier) — "Visited 25 Trust Centers" — silver border glow
  - **Gap Finder** (Bronze tier) — "Reported 23 missing items" — bronze border glow
  - **Questionnaire Ace** (Default tier) — "Completed 8 questionnaires" — green border
  - **Quality Scout** (Default tier) — "5 improvement suggestions" — green border
  - **Speed Demon** (Default tier) — "Completed a review in <1hr" — green border
  - **Trust Streak** (Bronze tier) — "14 consecutive days active" — bronze border glow
  - **Pair Extraordinaire** (Default tier) — "Collaborated on 3 reviews" — green border
- Each badge card: icon (use an emoji or lucide icon as placeholder), name, tier indicator (colored dot), description, and a progress bar showing progress to next tier
- An 8th card with a dashed border and `+` icon: "3 more to discover" in muted text

**Recent Activity Feed:**
- A vertical timeline showing the last 10 activities:
  - "Completed SIG Lite questionnaire at Acme Corp" — 2 hours ago
  - "Downloaded SOC 2 Type II report from CloudVault" — yesterday
  - "Reported missing data residency FAQ at NetGuard" — 2 days ago
  - "Earned Bronze Gap Finder badge! 🎉" — 3 days ago
  - etc.

**Privacy Controls (Bottom Section):**
- Heading: "What Coco Remembers" with a shield icon
- Toggle switches for: "Show my activity to Trust Center admins" (off), "Show badges on public profile" (on), "Enable cross-Trust Center memory" (on), "Show activity graph publicly" (off)
- A "Download My Data" button and a red "Delete All Data" button

---

#### VIEW 3: Coco Chat Panel

A slide-in panel from the right side (400px wide, full-height) that overlays the Trust Center. Triggered by clicking Coco in View 1.

**Panel Header:**
- Coco's pixel avatar (32x32) + "Coco" name + green "online" dot
- Two mode tabs: `Chat` (active) | `Assist`
- Close button (X)

**Chat Mode — Conversation UI:**
- Pre-populated conversation showing Coco's capabilities:
  1. **Coco (initial):** "Hey Jordan! Welcome back to Acme Corp's Trust Center. I see you visited CloudVault's Trust Center last week — would you like me to compare their security postures? Here's what's new since your last visit:" followed by 2-3 bullet cards (new SOC 2 report, updated privacy policy, 2 FAQ additions)
  2. **User:** "I need to fill out our standard SIG Lite questionnaire for Acme Corp"
  3. **Coco:** "I recognize that template from your CloudVault review! Let me pre-fill it with Acme Corp's information. Uploading now..." — show an animated progress bar at 73% with the text "Filling Section 4 of 12: Application Security..."
  4. **Coco (follow-up):** Shows a summary card: "✅ 89 of 104 questions answered (86%)" with confidence breakdown: "🟢 72 High confidence | 🟡 14 Needs review | 🔴 3 Couldn't find — sent to admin"

- At the bottom: A message input with placeholder "Ask Coco anything..." and a green send button. Also an upload button (paperclip icon) for questionnaire files.

**Assist Mode (shown when tab is toggled):**
- A structured wizard-style interface:
  - Step indicator: "Step 2 of 4 — Reviewing Answers"
  - A list of questionnaire sections with status indicators (green check, yellow warning, red X)
  - An expandable question showing: the question text, Coco's proposed answer, a confidence badge, a citation link ("Source: Acme Corp Privacy Policy, Section 3.2"), and edit/approve/flag buttons
  - A "Send Gaps to Admin" button that shows a preview of what the admin will receive

---

#### VIEW 4: Admin Dashboard

An admin-facing view showing how Trust Center admins interact with Coco and the rewards system.

**Admin Header:**
- "Acme Corp Trust Center — Admin" heading
- Admin badges displayed: "Response Hero (Bronze)" and "Always Fresh (Silver)" as small pills

**Trust Health Graph:**
- A larger version of the contribution graph from the homepage, but showing admin-specific metrics
- Label: "Trust Center Health — Last 12 Months"
- Below: Summary stats: "312 Visitor Questions Answered" | "47 Gaps Resolved" | "96% AI Accuracy" | "1.8hr Avg Response Time"

**Gap Requests Queue:**
- A table/list showing pending visitor gap requests:
  - Row 1: "Data Residency in EU — Jordan Chen (BigCorp)" — 3 hours ago — Priority: High — green "Respond" button
  - Row 2: "Penetration Test Methodology — Alex Rivera (TechStart)" — 1 day ago — Priority: Medium
  - Row 3: "SSO SAML Configuration — Sam Park (FinanceInc)" — 2 days ago — Priority: Low
- Each row expandable to show Coco's context summary: "Jordan asked about EU data residency during a SIG Lite questionnaire. Coco found partial answers in your Privacy Policy but couldn't determine specific AWS regions. Suggested response: ..."

**Coco Insights Panel:**
- A card showing Coco's suggestions: "🔍 Visitors asked about data residency 47 times this month, but your Knowledge Base only has 2 answers. Want me to draft 5 more FAQs from your documentation?"
- A "Trust Center Content Gaps" chart — simple horizontal bar chart showing the top 5 topic areas where Coco couldn't answer questions

**Admin Badge Progress:**
- Progress cards for admin badges showing current tier and progress to next:
  - "Response Hero — Bronze (25/100 to Silver)" with progress bar
  - "Content Master — 92% accuracy (need 95% for Silver)"
  - "Always Fresh — Silver (12/24 months to Gold)"

---

### INTERACTION & ANIMATION SPECS

**Coco's Idle Animation:**
- Gentle vertical bounce: translateY between 0px and -4px, 3-second cycle, ease-in-out
- Eyes blink every 5 seconds (brief squint animation)
- On hover: Coco waves (slight rotation of the character + speech bubble appears)

**Coco Chat Panel:**
- Slides in from right with `framer-motion`: `initial={{ x: 400 }}` → `animate={{ x: 0 }}` with spring transition
- Messages appear with a typing indicator (three bouncing dots) before each Coco message

**Page Transitions:**
- Use `framer-motion` `AnimatePresence` for view transitions with fade + slight upward slide

**Contribution Graph:**
- On page load, squares fill in from left to right with a staggered 5ms delay per square
- On hover, individual square scales up slightly and shows tooltip

**Badge Cards:**
- On hover, scale up 1.05x with a glow effect matching the tier color
- Gold badges have a subtle shimmer animation (CSS gradient sweep)

**Progress Bars:**
- Animate from 0 to target width over 1 second on mount

---

### COCO PIXEL ART SPEC — "Sort Coco" (The Organizer)

Build Coco as an inline SVG component called `<Coco />` that accepts a `size` prop (default 48) and a `state` prop. The character is "Sort Coco" — a C-Block shaped character (the Conveyor "C" logo anthropomorphized) whose signature animation is sorting items.

**Base SVG (8x8 grid, `viewBox="0 0 8 8"`, `image-rendering: pixelated`):**

```jsx
// Sort Coco — The Organizer
// C-Block base (Conveyor "C" shape) with sorting animation
const Coco = ({ size = 48, state = 'idle' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 8 8"
    xmlns="http://www.w3.org/2000/svg"
    style={{ imageRendering: 'pixelated' }}
  >
    {/* === C SHAPE BODY === */}
    {/* Top bar of C */}
    <rect x="2" y="0" width="4" height="1" fill="#5DDBB8" />
    {/* Left spine of C */}
    <rect x="1" y="1" width="2" height="1" fill="#33C69F" />
    <rect x="1" y="2" width="1" height="1" fill="#33C69F" />
    <rect x="1" y="3" width="1" height="1" fill="#33C69F" />
    {/* Bottom curve of C */}
    <rect x="1" y="4" width="2" height="1" fill="#2AA886" />
    {/* Bottom bar */}
    <rect x="2" y="5" width="4" height="1" fill="#1E7F65" />
    {/* Top bar inner extension */}
    <rect x="3" y="1" width="3" height="1" fill="#2AA886" />
    {/* C opening (dark interior) */}
    <rect x="3" y="4" width="3" height="1" fill="#0F3D31" opacity="0.3" />

    {/* === EYES — flick left/right as items are sorted === */}
    {/* Left eye (animated x position) */}
    <rect x="3" y="2" width="1" height="1" fill="#7AE8CB">
      <animate attributeName="x" values="3;3;2;2;3;3;4;4;3;3" dur="3s" repeatCount="indefinite" />
    </rect>
    {/* Right eye (animated x position, follows left) */}
    <rect x="5" y="2" width="1" height="1" fill="#5DDBB8">
      <animate attributeName="x" values="5;5;4;4;5;5;6;6;5;5" dur="3s" repeatCount="indefinite" />
    </rect>

    {/* === SMILE on inner C curve === */}
    <rect x="1" y="3" width="1" height="1" fill="#FFF" opacity="0.7" />

    {/* === ARM === */}
    <rect x="0" y="2" width="1" height="1" fill="#5DDBB8" />

    {/* === SORTING INDICATORS (flash on sides) === */}
    {/* Left flash — green (approved) */}
    <rect x="0" y="1" width="1" height="1" fill="#7AE8CB" opacity="0">
      <animate attributeName="opacity" values="0;0;0.8;0.4;0;0;0;0;0;0" dur="3s" repeatCount="indefinite" />
    </rect>
    {/* Right flash — gold (flagged) */}
    <rect x="7" y="1" width="1" height="1" fill="#FFD700" opacity="0">
      <animate attributeName="opacity" values="0;0;0;0;0;0;0.8;0.4;0;0" dur="3s" repeatCount="indefinite" />
    </rect>

    {/* === FEET === */}
    <rect x="2" y="6" width="1" height="1" fill="#33C69F" />
    <rect x="5" y="6" width="1" height="1" fill="#33C69F" />
  </svg>
);
```

**Color reference for Coco's pixels:**
| Pixel | Hex | Role |
|---|---|---|
| `#5DDBB8` | Top bar, arm | Bright green highlight |
| `#33C69F` | Body spine, feet | Primary Conveyor Green |
| `#2AA886` | Inner bar, bottom curve | Mid green |
| `#1E7F65` | Bottom bar | Dark green base |
| `#0F3D31` | C opening | Interior shadow |
| `#7AE8CB` | Left eye, approved flash | Bright accent |
| `#5DDBB8` | Right eye | Secondary accent |
| `#FFD700` | Right flash (flagged) | Gold accent |
| `#FFF` @ 0.7 | Smile | White, slightly transparent |

**Rendering sizes:**
- **Floating button:** 48x48px (8x8 grid × 6px per pixel)
- **Chat panel header:** 32x32px
- **Profile page avatar:** 120x120px
- **Favicon:** 16x16px (still readable — just the C shape + eyes)

**Character states** — modify the base SVG via React props/CSS classes:

1. **`idle`** (default) — The sorting animation plays: eyes flick left, green flash appears on left side (approved), then eyes flick right, gold flash appears on right side (flagged). Repeat on a 3-second loop. Wrap in a gentle CSS bounce:
   ```css
   @keyframes cocoBounce {
     0%, 100% { transform: translateY(0); }
     50% { transform: translateY(-4px); }
   }
   .coco-idle { animation: cocoBounce 2.5s ease-in-out infinite; }
   ```

2. **`thinking`** — Eyes stop sorting and instead pulse opacity (0.3 → 1 → 0.3) together. Sorting flashes stop. Body gets a subtle dim filter (`opacity: 0.8`). Show 3 dots below the character animating left-to-right.

3. **`celebrating`** — Eyes go bright (`#FFF`), arm pixel moves up one row (y: 2 → 1). 3-4 tiny 1px square particles burst outward in green and gold using CSS keyframes. Both sorting flashes fire simultaneously.

4. **`sorting`** — The default sorting animation but faster (1.5s loop instead of 3s). Used when Coco is actively processing a questionnaire. Add a small progress indicator below the character.

5. **`waving`** — Arm pixel at (0,2) animates y position: `2 → 1 → 0 → 1 → 2` on a 1.2s loop. Eyes stay centered (no sorting). Smile pixel gets brighter (`opacity: 1`).

6. **`sleeping`** — Eyes replaced with horizontal line pixels (same position, but `#5E5E72` color, no animation). Sorting flashes stop. Tiny "z" letters float up in `text-muted` color using CSS animation.

---

### ADDITIONAL REQUIREMENTS

1. **Responsive:** Should work at 1280px+ desktop. Don't worry about mobile for this prototype.
2. **No backend:** All data is hardcoded/mocked. Use realistic sample data.
3. **Accessible:** Include proper aria-labels on interactive elements, ensure color contrast meets WCAG AA on dark backgrounds.
4. **Performance:** Keep animations at 60fps. Use `will-change: transform` on animated elements.
5. **Code quality:** Clean, well-commented code. Group related components into clearly labeled sections within App.jsx.

---

### FILE STRUCTURE

```
trust-center-prototype/
├── index.html          (add Inter font import)
├── src/
│   ├── App.jsx         (entire prototype)
│   ├── main.jsx        (default Vite entry)
│   └── index.css       (Tailwind imports + custom CSS for pixel art animations)
├── tailwind.config.js  (extend with custom colors above)
├── postcss.config.js
└── package.json
```

After building, run `npm run dev` and confirm it works at `http://localhost:5173`.

---

## PROMPT END
