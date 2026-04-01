# Claude Code Prompt: Trust Center Tabs — Overview, Documents & Knowledge, Updates

> Paste this into Claude Code. It describes a new tabbed Trust Center homepage to integrate into the existing `trust-center-prototype/src/App.jsx`. A companion mockup file (`trust-center-tabs-mockup.html`) is included in the workspace for visual reference — open it in a browser to see the exact layout, interactions, and styling.

---

## PROMPT START

You are adding a **tabbed Trust Center homepage** to the existing Conveyor Trust Center Vision prototype. The current prototype lives in `trust-center-prototype/src/App.jsx` and is a Vite + React + Tailwind CSS + Framer Motion single-file app. You will be modifying the existing `TrustCenterHome` component (currently at ~line 1183) to implement a three-tab interface: **Overview**, **Documents & Knowledge**, and **Updates**.

**Visual reference:** Open `trust-center-tabs-mockup.html` (in the repo root) in a browser to see the exact design. Match it as closely as possible.

---

## ARCHITECTURE: Where This Fits

### Existing structure (do NOT break)
- `ThemeContext`, `TcContext`, `CartContext` — keep all existing contexts
- Router: `/trust-center` renders `TrustCenterHome`, `/trust-center/agent` renders the Coco agent, `/trust-center/scorecard` renders the scorecard
- The Coco agent demo flow, sidebar, and all existing functionality must remain untouched

### What to change
- **Replace the content inside `TrustCenterHome`** with the new tabbed interface described below
- Add a `useState` for `activeTab` (`"overview"` | `"docs"` | `"updates"`) defaulting to `"overview"`
- The existing hero section, document grid, FAQ accordion, and contribution graph in `TrustCenterHome` should be reorganized into the three tabs as specified

---

## STICKY HEADER

The header sticks to the top when scrolling. It contains two rows:

### Row 1: Tab selector
- Three tabs in a single pill container: **Overview** | **Documents & Knowledge** | **Updates**
- Container: `bg-[var(--bg-surface)]` with `border border-[var(--border-default)]` and `rounded-xl`, `p-1`, `gap-0.5`
- Each tab: `px-6 py-2.5 rounded-[9px] text-[13px] font-semibold`
- Active tab: `bg-brand-500 text-white` with a subtle box-shadow glow
- Inactive: transparent background, `text-[var(--text-secondary)]`, hover → `bg-[var(--bg-hover)]`
- Center the pill container horizontally

### Row 2: Search bar with product filter
- **Product filter button** (left): Shows a filter icon + "All Products" label + chevron. Clicking opens a dropdown with checkboxes for product lines (Cloud Platform, On-Prem Server, API Gateway, Data Analytics, Mobile SDK, Identity Manager). Checking/unchecking updates the button label to show count ("3 Products").
- **Search input** (right, flex-1): Placeholder "Search Documents, FAQs, Certifications, etc" with a search icon left and `⌘K` keyboard shortcut badge right. Focus → green border glow.
- **Search results dropdown**: Two-panel layout. Left panel: "Trust Center Sections" with clickable items (Documents & Knowledge Base, Trusted By, Announcements, Video Resources). Right panel: "Documents" with file-type badges (PDF, DOCX, XLSX, CERT). Bottom bar: "Ask AI Agent" button linking to the Coco agent view.
- Dropdown dismisses on Escape key or clicking outside (use an overlay div)
- `⌘K` / `Ctrl+K` keyboard shortcut focuses the search input

### Sticky behavior
- `sticky top-0 z-40` with `bg-[var(--bg-primary)]`
- A 1px border line at the bottom of the header (use `::after` pseudo or a border div)

---

## TAB 1: OVERVIEW

### Hero card
- Full-width card with `bg-[var(--bg-surface)]` border and rounded corners
- Two columns: left content area + right "Quick Links" sidebar separated by a left border
- **Left side:**
  - Company logo (rounded square with brand color) + title "Arcline Trust Center" (or dynamic from `TcContext`)
  - Description paragraph with link to trust email
  - Stats row: 4 pill badges showing "28 Documents", "57 FAQs", "6 Certifications", "Active: 8 minutes ago" (with green dot)
- **Quick Links** (right, 200px wide): Links to Homepage, Privacy Policy, Status Page, Report a vulnerability — each with an external link icon

### Activity heatmap + Certifications (two-column grid)
- **Left: Trust Center Activity**
  - Section header with "View All" link
  - Above the heatmap: "New documents since your last visit: **3**" (left) and Less/More legend (right)
  - GitHub-style contribution heatmap: 17 weeks × 7 days (Jan–Apr), using `grid-auto-flow: column`
  - Color levels via `color-mix(in srgb, var(--brand-500) X%, var(--bg-elevated))` at 0%, 20%, 40%, 65%, 100%
  - Month labels below: Jan, Feb, Mar, Apr
  - Generate data with a seeded pseudo-random function for consistency:
    ```js
    function seededRandom(seed) {
      let s = seed;
      return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
    }
    const rand = seededRandom(42);
    // For each of 119 cells (17×7), assign level 0-4 based on rand()
    ```
  - Cells hover: `transform: scale(1.6)` with `z-index: 2`

- **Right: Certifications**
  - 4×2 grid of square certification badges: SOC 2 Type II, ISO 27001, ISO 27701, HIPAA, GDPR, SOC 3, CSA STAR, PCI DSS
  - Each badge: `bg-[var(--bg-elevated)]` with border, centered text, `aspect-ratio: 1`

### Performance section
- Full-width card with "Trust Center Performance" title in brand color
- 3×2 grid of performance cards, each containing:
  - A pixel-art SVG icon (16×16 viewbox with `image-rendering: pixelated`, using `var(--brand-400)` and `var(--brand-300)`)
  - Label + large value + subtitle
  - Cards: Response Time (1.8 hr), Content Accuracy (96%), Questions Answered (2,847), Visitor Engagement (1,240), Content Freshness (3 days), Update Frequency (8)
- Card background: `rgba(255,255,255,0.04)` with `border-default`

### Trusted By + Subprocessors (two-column grid)
- **Left: Trusted By** — 4×2 grid of placeholder logo boxes
- **Right: Subprocessors** — List of 4 vendors with real logos from Simple Icons CDN:
  - AWS: `https://cdn.simpleicons.org/amazonaws/232F3E`
  - Datadog: `https://cdn.simpleicons.org/datadog/632CA6`
  - Snowflake: `https://cdn.simpleicons.org/snowflake/29B5E8`
  - Stripe: `https://cdn.simpleicons.org/stripe/635BFF`
  - Each row: logo (32px, white background rounded square) + name & usage description + location badge (e.g., "US-East, US-West")

---

## TAB 2: DOCUMENTS & KNOWLEDGE

### Top row (two-column grid)

#### Left: Document Engagement
- Card with header: document icon + "Document Engagement" title + "Bulk download" button
- Subtitle: "Most Viewed Documents (30 days)"
- 8 ranked rows, each showing: rank number, document name, view count, right-arrow on hover
- Data:
  1. SOC 2 Type II Report (2026) — 487
  2. Security Whitepaper — 312
  3. Sub-processor List — 289
  4. Penetration Test Summary — 201
  5. Data Processing Agreement — 178
  6. Vendor Risk Assessment — 156
  7. Business Continuity Plan — 134
  8. Incident Response Policy — 112
- Footer: "Downloads: **1,847** Unique: **412**"

#### Right: Knowledge Base
- Card with header: book icon + "Knowledge Base" title + "Bulk download" button
- 5 FAQ accordion items (first one open by default):
  1. "How does Arcline manage user access controls?" — Badge: Access Management
  2. "What is your secure development lifecycle?" — Badge: Application Security
  3. "Where is customer data stored and processed?" — Badge: Data Privacy
  4. "How is your infrastructure secured?" — Badge: Infrastructure
  5. "What is your incident response process?" — Badge: Incident Response
- Category badges appear below the question title on their own line, all using brand color tint: `bg-[rgba(34,184,207,0.12)] text-brand-400`
- Each expanded answer shows text + a "+ Quote" button (right-aligned)
- Clicking the header row toggles open/closed

### All Content — File Browser
This is the key new feature: a Mac Finder-style file browser with three views.

#### File system data structure
Create a `FILE_SYSTEM` array with **42 documents** organized into folders:

```js
const FILE_SYSTEM = [
  { type: 'folder', name: 'Compliance Reports', children: [
    { type: 'file', name: 'SOC 2 Type II Report', fileType: 'pdf', date: 'Feb 2026', locked: true },
    { type: 'file', name: 'SOC 3 Report', fileType: 'pdf', date: 'Feb 2026', locked: false },
    { type: 'file', name: 'ISO 27001 Certificate', fileType: 'cert', date: 'Dec 2025', locked: false },
    { type: 'file', name: 'ISO 27701 Certificate', fileType: 'cert', date: 'Nov 2025', locked: false },
    { type: 'file', name: 'HIPAA Compliance Letter', fileType: 'pdf', date: 'Jan 2026', locked: true },
    { type: 'file', name: 'CSA STAR Self-Assessment', fileType: 'xlsx', date: 'Mar 2026', locked: false },
    { type: 'file', name: 'PCI DSS AOC', fileType: 'pdf', date: 'Oct 2025', locked: true },
  ]},
  { type: 'folder', name: 'Policies', children: [
    { type: 'file', name: 'Information Security Policy', fileType: 'pdf', date: 'Mar 2026', locked: false },
    { type: 'file', name: 'Incident Response Policy', fileType: 'docx', date: 'Jan 2026', locked: false },
    { type: 'file', name: 'Business Continuity Plan', fileType: 'pdf', date: 'Feb 2026', locked: false },
    { type: 'file', name: 'Disaster Recovery Plan', fileType: 'pdf', date: 'Feb 2026', locked: true },
    { type: 'file', name: 'Acceptable Use Policy', fileType: 'pdf', date: 'Dec 2025', locked: false },
    { type: 'file', name: 'Data Retention Policy', fileType: 'pdf', date: 'Nov 2025', locked: false },
    { type: 'file', name: 'Access Control Policy', fileType: 'docx', date: 'Jan 2026', locked: false },
    { type: 'file', name: 'Change Management Policy', fileType: 'docx', date: 'Mar 2026', locked: false },
  ]},
  { type: 'folder', name: 'Legal', children: [
    { type: 'file', name: 'Data Processing Agreement', fileType: 'pdf', date: 'Mar 2026', locked: false },
    { type: 'file', name: 'Standard NDA Template', fileType: 'docx', date: 'Jan 2026', locked: false },
    { type: 'file', name: 'Terms of Service', fileType: 'pdf', date: 'Feb 2026', locked: false },
    { type: 'file', name: 'Privacy Policy', fileType: 'pdf', date: 'Mar 2026', locked: false },
    { type: 'file', name: 'Sub-processor List', fileType: 'xlsx', date: 'Mar 2026', locked: false },
    { type: 'file', name: 'GDPR Compliance Statement', fileType: 'pdf', date: 'Dec 2025', locked: false },
  ]},
  { type: 'folder', name: 'Penetration Testing', children: [
    { type: 'file', name: 'Pentest Report – Q1 2026', fileType: 'pdf', date: 'Mar 2026', locked: true },
    { type: 'file', name: 'Pentest Report – Q4 2025', fileType: 'pdf', date: 'Dec 2025', locked: true },
    { type: 'file', name: 'Pentest Executive Summary', fileType: 'docx', date: 'Mar 2026', locked: false },
    { type: 'file', name: 'Remediation Tracker', fileType: 'xlsx', date: 'Mar 2026', locked: true },
  ]},
  { type: 'folder', name: 'Questionnaires', children: [
    { type: 'file', name: 'SIG Lite Questionnaire', fileType: 'xlsx', date: 'Feb 2026', locked: false },
    { type: 'file', name: 'CSA CAIQ v4', fileType: 'xlsx', date: 'Mar 2026', locked: false },
    { type: 'file', name: 'Custom Questionnaire Template', fileType: 'xlsx', date: 'Jan 2026', locked: false },
    { type: 'file', name: 'HECVAT Full', fileType: 'xlsx', date: 'Nov 2025', locked: false },
  ]},
  // Standalone files (not in folders)
  { type: 'file', name: 'Security Whitepaper', fileType: 'pdf', date: 'Mar 2026', locked: false },
  { type: 'file', name: 'Vendor Risk Assessment', fileType: 'xlsx', date: 'Mar 2026', locked: true },
  { type: 'file', name: 'Architecture Diagram', fileType: 'pdf', date: 'Feb 2026', locked: false },
  { type: 'file', name: 'Encryption at Rest Overview', fileType: 'pdf', date: 'Jan 2026', locked: false },
  { type: 'file', name: 'Network Security Overview', fileType: 'pdf', date: 'Feb 2026', locked: false },
  { type: 'file', name: 'Employee Security Training Log', fileType: 'xlsx', date: 'Mar 2026', locked: true },
  { type: 'file', name: 'Annual Risk Assessment Summary', fileType: 'pdf', date: 'Dec 2025', locked: false },
  { type: 'file', name: 'Third-Party Audit Letter', fileType: 'pdf', date: 'Feb 2026', locked: true },
  { type: 'file', name: 'Cloud Infrastructure FAQ', fileType: 'docx', date: 'Jan 2026', locked: false },
  { type: 'file', name: 'SSO Integration Guide', fileType: 'pdf', date: 'Nov 2025', locked: false },
  { type: 'file', name: 'API Security Best Practices', fileType: 'pdf', date: 'Mar 2026', locked: false },
  { type: 'file', name: 'Product Security Roadmap', fileType: 'pdf', date: 'Mar 2026', locked: true },
  { type: 'file', name: 'Bug Bounty Program Overview', fileType: 'pdf', date: 'Feb 2026', locked: false },
];
```

#### View header
- "All Content" title (left) + 3 view toggle buttons (right): Icons (grid), List, Columns
- Active toggle: `bg-[var(--bg-elevated)]` with brighter border, white icon
- Below header: breadcrumb trail (only visible when inside a folder): "All Content › Folder Name"

#### View 1: Grid (Icons)
- `grid-cols-3 gap-3.5`
- **Folder cards**: centered layout, large filled folder SVG icon (42px, brand color), folder name, item count ("7 items"). Click to navigate into folder.
- **File cards**: top row = doc icon + lock icon (if `locked`), file name, bottom = file-type badge (PDF/DOCX/XLSX/CERT) + date, "+ Add" button
- File-type badges: `text-[10px] font-bold uppercase` with `bg-white/8` background

#### View 2: List
- Compact rows with: icon (folder or doc) + name (flex-1) + file-type badge + lock icon + date + "+ Add" button
- Folder rows show item count instead of badge/date, chevron on hover
- Click folder row to navigate into it

#### View 3: Columns (Finder-style)
- Container: `flex` with `border rounded-xl`, `height: 380px`, `overflow-x: auto`
- Each column: `min-w-[220px] w-[220px]`, `border-r`, scrollable vertically
- Last column: `flex-1 min-w-[260px]`
- Items: folder icon + name + item count + chevron (for folders), or doc icon + name + badge (for files)
- Clicking a folder item highlights it (brand background, white text) and opens a new column to the right with that folder's contents
- Auto-scroll right when a new column opens
- Track selections with a `columnSelections` array (index of selected item per depth level)

#### Navigation
- `currentPath` state: array of folder name strings (empty = root)
- Clicking a folder pushes its name onto the path
- Breadcrumb items are clickable to jump back to any level
- Switching to Columns view resets column selections

---

## TAB 3: UPDATES

### Updates feed
- Vertical list of update cards, each clickable to open a detail modal
- Each card shows: type icon (in a tinted square) + type label + date, then title + truncated description (2-line clamp)
- **Type icons** (all teal-tinted `bg-[rgba(34,184,207,0.12)]` with brand-colored SVG):
  - "New" → plus icon
  - "Updated" → eye icon
  - "Removed" → trash icon

### Update data
```js
const UPDATES = [
  { type: 'new', date: 'March 28, 2026', title: 'New SOC 2 Type II Report Added',
    body: 'Our latest SOC 2 Type II audit report covering the period July 2025 – January 2026 is now available...' },
  { type: 'updated', date: 'March 22, 2026', title: 'Security Whitepaper Refreshed',
    body: 'Updated our security whitepaper to reflect the latest infrastructure changes...' },
  { type: 'new', date: 'March 15, 2026', title: 'New Sub-processor: Datadog',
    body: 'Datadog has been added as a sub-processor for monitoring and observability...' },
  { type: 'updated', date: 'March 8, 2026', title: 'Data Processing Agreement v3.2',
    body: 'Minor revisions to our DPA reflecting updated data retention policies...' },
  { type: 'removed', date: 'March 1, 2026', title: 'Deprecated: Legacy Encryption Whitepaper',
    body: 'The 2024 encryption whitepaper has been replaced by the updated Security Whitepaper...' },
];
```

### Detail modal
- Overlay: `fixed inset-0 bg-black/60 z-[100]` centered flex
- Content: `bg-[var(--bg-surface)]` card, max-width 600px, rounded-2xl, 32px padding
- Close button (X) top-right
- Shows: type meta row (icon + label + date), full title, full body text (split paragraphs), footer with "Close" + "View Document" buttons
- Close on Escape key or clicking overlay backdrop
- Prevent body scroll when modal is open

---

## STYLING RULES

1. **Use existing CSS variables** from the prototype's `@theme` block — never hardcode hex colors
2. **Brand colors**: `brand-50` through `brand-950` — use `brand-500` for primary accent, `brand-400` for highlights
3. **File-type badges**: All use the same gray style: `bg-white/8 text-[var(--text-secondary)]` — no color differentiation by type
4. **FAQ category badges**: All use brand tint: `bg-[rgba(34,184,207,0.12)] text-[var(--brand-400)]` — same color regardless of category
5. **Button hierarchy**: Primary = solid `bg-brand-500`. Secondary/outline = `border-brand-500 text-brand-500`. Tertiary = `bg-[var(--bg-elevated)] border-[var(--border-default)]`
6. **The homepage container** should be `max-w-[960px]` centered with `px-7`
7. **Cards** use `bg-[var(--bg-surface)]` with `border-[var(--border-default)]` and `rounded-[14px]`
8. **Hover states**: cards get `border-[var(--border-bright)]` and `bg-[var(--bg-hover)]`
9. **Font**: Inter via Google Fonts (already imported in the prototype)
10. **Animations**: Use Framer Motion for tab transitions (fade in/out). Keep it subtle.

---

## INTERACTION DETAILS

### Keyboard shortcuts
- `⌘K` / `Ctrl+K` → focus search input
- `Escape` → close any open dropdown, modal, or search results (in that priority order)

### Search behavior
- Empty query → hide results dropdown, show `⌘K` badge
- Typing → filter both sections and documents, show "Ask AI Agent" bar at bottom
- The "Ask AI Agent" button should navigate to the `/trust-center/agent` route

### Product filter
- Click toggles dropdown open/closed
- Each checkbox toggles independently
- Button label updates: all checked = "All Products", some = "3 Products", etc.
- Clicking outside closes the dropdown

### FAQ accordion
- Click header to toggle open/closed
- Expand indicator (▾) rotates 180° when open
- Only one can be open at a time (optional — the mockup allows multiple)

### File browser navigation
- Clicking a folder card/row opens that folder (pushes to path)
- Breadcrumb "All Content" resets to root
- Breadcrumb segments are clickable to jump to that depth
- View toggle persists when navigating folders
- Columns view: clicking an item at depth N truncates selections after N, sets new selection, re-renders

---

## WHAT NOT TO CHANGE

- Do NOT modify the Coco agent demo flow, sidebar, or CartContext behavior
- Do NOT change the router structure — keep `/trust-center`, `/trust-center/agent`, `/trust-center/scorecard`
- Do NOT change the `@theme` block or CSS variable definitions
- Do NOT create separate CSS files — keep everything in the single `App.jsx` with Tailwind classes
- Do NOT remove or rename any existing components that are used by other views

---

## TESTING

After implementing, verify:
1. `npm run build` completes without errors
2. All three tabs render and switch correctly
3. Search dropdown opens and filters in real-time
4. Product filter dropdown toggles checkboxes
5. FAQ accordion opens/closes
6. File browser: grid, list, and columns views all render
7. File browser: clicking folders navigates in, breadcrumb navigates out
8. Columns view: clicking folders reveals nested columns
9. Updates tab: clicking a card opens the modal, Escape closes it
10. Coco agent (navigate to `/trust-center/agent`) still works completely
11. The sidebar cart/todo panel still works
12. Theme switching (if implemented) still works

## PROMPT END
