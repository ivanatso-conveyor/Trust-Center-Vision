# Trust Center Vision Prototype

## Project Overview

Conveyor Trust Center Vision Sprint prototype — a next-gen buyer-facing security portal. Built as a Vite + React single-page app with Tailwind CSS and Framer Motion. The entire prototype lives in a single component file (`trust-center-prototype/src/App.jsx`).

**Sprint:** April 1–3, 2026 (TrustUs League team)
**Goal:** Demonstrate a vision where visitors complete security reviews without human support (Touchless Rate)
**Context docs:** `CONTEXT.md` (research/competitive landscape), `claude-code-prompt-trust-center-prototype.md` (full spec)

## Tech Stack

- **Framework:** React (no TypeScript) via Vite
- **Styling:** Tailwind CSS v4 with CSS variable theming (`brand-*`, `accent-*`)
- **Animation:** Framer Motion
- **Icons:** Lucide React
- **Build:** `npm run build` from `trust-center-prototype/`
- **Preview:** `npx vite preview` from `trust-center-prototype/`

## Architecture

Everything is in `trust-center-prototype/src/App.jsx` (~2500+ lines). Key sections:

### State Management
- `ThemeContext` — light/dark mode
- `TcContext` — company data (name, stats, docs, FAQs)
- `CartContext` — shared state for sidebar (collection, to-dos, Coco status, tasks, notifications)

### Navigation (3 main routes)
- `/` — Trust Center overview (documents, knowledge base, certifications)
- `/agent` — Coco AI agent chat (demo flow lives here)
- `/scorecard` — Trust Scorecard (placeholder, next to build)

### Coco Agent Demo Flow

The demo is a scripted walkthrough with two phases:

**Phase 1: Scripted demo** (`getDemoScript()` ~line 1284)
- 15+ steps auto-advancing via `useEffect` with configurable delays
- Steps are objects: `{ role: "agent"|"prompt", state, delay, text, docs, citations, thinking, ... }`
- `"prompt"` steps show clickable user response buttons
- `"agent"` steps auto-advance after their delay

**Phase 2: Post-script interactions** (imperative `setTimeout` + `setMessages`)
- Download questionnaire → gap draft email → send draft → MCP comparison suggestion → vendor comparison table → to-do checkoff
- Each triggered by the previous action's callback (`handleDownloadQuestionnaire`, `handleSendDraft`, `handleStartComparison`)

### Demo Sequence (full flow)
1. User: "Help me with my security review"
2. Coco asks about frameworks
3. User: SOC 2, ISO 27001, data processing
4. Coco thinking (4 steps) → to-do list (8 items) populates in sidebar
5. Coco confirms checklist, explains workflow
6. Coco pulls 6 relevant documents with Add buttons
7. User asks about encryption
8. Coco answers with 3 inline citations + expandable source cards
9. Coco bridges: "That covers encryption..." → checks off t3 (encryption) → to-do 1/8
10. User uploads CSA CAIQ spreadsheet
11. Coco parses (4 thinking steps) → sidebar switches to To-Do tab → 10-task auto-fill runs (~30s)
12. Completion card: 89/104 answered (86%), 72 high confidence, 14 needs review, 3 gaps
13. Coco's Tasks panel collapses after 4s → to-do list returns to top (now 3/8 after auto-fill advances t1+t2)
14. User clicks Download → Coco surfaces 3 gap questions with draft email
15. User sends draft → Coco suggests MCP side-by-side comparison for incident response
16. User: "Compare breach notification timelines and incident response across @mediacore @conveyor @nunita"
17. Coco thinking → inline comparison table (5 rows: Breach Notification SLA, Dedicated IR Team, Post-Incident Reporting, Customer Communication, Annual IR Testing) x 3 vendors
18. Summary + Export/Add buttons ("Add to review collection" adds item to sidebar collection)
19. Coco checks off "Check incident response procedures" (t6) → to-do goes to 4/8

### Key Patterns

**Text animation timing:** `getTextDuration(text)` calculates per-character duration (0.018s/char + 0.4s pause at punctuation). All contextual content (citations, tables, emails) must wait for text to finish before appearing.

**To-do system:** 8 review items (`REVIEW_TODO_STEPS`), IDs `t1`-`t8`. Items auto-check when matching documents are added to collection (`matchDocs` arrays). `toggleTodo(id)` for specific items, `advanceTodos(n)` for first N items. Demo script steps support `checkTodo: "tN"` to toggle a specific item. Progression: 0/8 → t3 at bridge (1/8) → t1+t2 at auto-fill (3/8) → t6 at comparison (4/8).

**Coco states:** idle, waving, sorting, thinking, celebrating, sleeping. Managed via `setCocoState(status, anim, label)`. Sidebar shows status text + optional progress percentage.

**Enter key fast-forward:** Pressing Enter at any point skips the current delay or clicks the next prompt/action button. Works through the entire demo including post-script steps.

**Company tags vs document tags:** Document tags (`@soc2-type2`, `@iso27001`) render as pill badges with file icon and brand background. Company tags (`@mediacore`, `@conveyor`, `@nunita`) render as plain green text with no container.

## Design Decisions

- **Button hierarchy:** Primary actions (e.g., "Bulk Download") use solid `bg-brand-500`. Secondary actions (e.g., "Download questionnaire") use outline style `border-brand-500 text-brand-500`. This avoids competing CTAs.
- **Comparison table:** Uses `grid-cols-4` (label + 3 vendors), max-width bumped to 720px for table messages. Status indicators: green check (good), yellow warning, red X (gap).
- **Demo prompt buttons:** Show "Click to continue →" with pulsing arrow in `brand-400/60`. Upload prompts use dashed border style.
- **Coco's Tasks panel:** Appears during auto-fill (sidebar auto-switches to To-Do tab), collapses 4 seconds after completion via `resetCoco()` so to-do list returns to top of sidebar.
- **Homepage container:** `max-w-[780px]` to fit action card titles on one line.
- **MCP badge:** "Connected via MCP to 3 Trust Centers" with Plug icon appears above comparison tables.
- **MCP comparison topic:** Incident Response (not encryption, which is covered earlier). Backup option: Access Control & Authentication if IR doesn't land well during demo.
- **Collection integration:** "Add to review collection" on comparison table adds a "Vendor IR Comparison" item and switches sidebar to Collection tab.

## Theming

All brand colors use CSS variables — never hardcode hex values:
- `brand-50` through `brand-950` (oklch scale)
- `accent-50` through `accent-900`
- Coco uses `--coco-*` CSS variables
- Switching company = swapping oklch hue/chroma in the `@theme` block

## What's Next

- **Trust Scorecard page** (`/scorecard` route) — currently a placeholder
- "Search documents" action card on agent homepage currently just starts the demo — could be a separate flow
- Gap draft flow could be extended with vendor response tracking
- MCP connection modal exists as a separate 5-step guided flow (`MCP_STEPS`)
