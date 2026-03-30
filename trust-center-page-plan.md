# Trust Center — Page Plan

> The standard Trust Center page that visitors land on. A clean, section-based layout for browsing security documentation, compliance posture, and AI transparency. Separate from the Trust Scorecard (see `trust-scorecard-page-plan.md`).

---

## Design Philosophy

**Look like their product, not ours.** The loudest customer signal is that marketing teams want the TC to feel like an extension of the vendor's own product. The page should be a branded canvas: vendor logo, vendor colors, vendor voice. "Powered by Conveyor" is small and in the footer only.

**Orient in 5 seconds.** The current three-panel layout is confusing. This layout uses a single-column flow with clearly labeled sections and a sticky nav. A visitor should be able to scan the page and know exactly what's available without scrolling.

**Progressive depth.** Each section starts with a summary that answers the quick question, with expand/click-through for detail. Badges answer "are they certified?" in one glance. The AI section answers "how do they use AI?" with model cards you can drill into. Documents let you browse and preview without downloading.

---

## Layout Model

The prototype uses a **three-panel layout**:

```
┌────┬──────────────────────────────────────┬────────────────────┐
│    │                                      │                    │
│ N  │        TRUST CENTER CONTENT          │   COCO SIDEBAR     │
│ A  │     (scrollable main area)           │  (persistent)      │
│ V  │                                      │                    │
│    │                                      │  "Coco  Ready"     │
│ I  │                                      │  To-Do│Collection  │
│ C  │                                      │  │Sessions         │
│ O  │                                      │                    │
│ N  │                                      │  [Active review    │
│ S  │                                      │   checklist, chat, │
│    │                                      │   questionnaire    │
│    │                                      │   progress, etc.]  │
│    │                                      │                    │
└────┴──────────────────────────────────────┴────────────────────┘
```

**Left icon nav** — Thin vertical rail with icons: Home, Coco/AI (sparkle icon), Documents, and potentially Trust Scorecard. The active section gets a green highlight bar.

**Center content area** — The main Trust Center content. Scrollable. This is where all the sections below live. Max-width constrained for readability.

**Right sidebar — Coco** — Persistent panel (~320px wide). Always visible. Shows Coco's pixel art character at top, with tabs: To-Do (active review checklist), Collection (saved docs), Sessions (past interactions). When not in an active review, shows the welcome state with quick actions (Start a security review, Search documents, Connect MCP). During a review, shows real-time questionnaire progress, gap tracking, and Coco's chat interface.

**Coco is NOT a floating button.** Coco lives in this persistent sidebar and is always accessible. The sidebar is the primary interaction surface for Coco — visitors can chat, track their review, and manage their questionnaire all without leaving the Trust Center content.

---

## Trust Center Content Sections

The center content area uses a single-column flow with a sticky header and section-based navigation.

---

### Sticky Header

```
┌──────────────────────────────────────────────────────────────────┐
│  [Vendor Logo]  Vendor Name                                      │
│                                                                  │
│  Overview · Documents · Knowledge Base · AI · Subprocessors ·    │
│  Updates                                          [🔍 Search ✨] │
└──────────────────────────────────────────────────────────────────┘
```

- **Vendor branding** — Logo + name, left-aligned. Vendor's brand color as a subtle accent line or gradient.
- **Section nav** — Horizontal anchors that scroll to each section. Active section gets a green underline. These are scroll anchors, not separate pages — the visitor stays on one continuous page.
- **Unified search** — Right-aligned, with AiSparkle icon. Searches across all sections: documents, KB, AI features, subprocessors. Placeholder: "Search [Vendor]'s security posture..."

**Research backing:** New header bar + search selector scored 7.5/9 in card sorting (highest of any feature). "User menu" within header was a must-have in scope table.

---

### Section 1: Hero / Overview

The first thing visitors see. Establishes trust and gives a quick orientation.

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  Acme Corp Trust Center                                          │
│  Transparent security for our customers and partners             │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  [🛡 SOC 2 Type II]  [🛡 ISO 27001]  [🛡 GDPR]         │    │
│  │  [🛡 HIPAA]  [🛡 SOC 3]  [🛡 CSA STAR]                  │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                  │
│  "Trusted by"                                                    │
│  [Logo] [Logo] [Logo] [Logo] [Logo] [Logo]                      │
│                                                                  │
│  ┌─ Quick Stats ────────────────────────────────────────────┐    │
│  │  42 Documents · 128 FAQs · 6 Certifications · <2hr Avg  │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Compliance Badges** — Row of pill-shaped badges for each certification/framework. Each badge is clickable: public certs open a preview; NDA-gated ones show an access request prompt. Visual style: icon + name + green accent border. On hover, show validity dates ("Valid through Dec 2026").

**Trusted By** — A row of customer/partner logos. Social proof that this vendor's TC is used by recognizable companies. Admin-curated. This is a standard trust signal that SafeBase and Vanta both use but Conveyor currently doesn't surface prominently.

**Quick Stats** — Four key numbers in a horizontal strip: document count, FAQ count, certification count, average agent response time. Establishes that this is an active, well-maintained Trust Center.

---

### Section 2: Philosophy

A brief, human-readable statement of the vendor's security philosophy. This is content the admin writes — their voice, their values.

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  Our Security Philosophy                                         │
│                                                                  │
│  "At Acme Corp, security isn't a feature — it's a foundation.   │
│  We believe in transparency, continuous improvement, and         │
│  earning our customers' trust every day. Our security program    │
│  is built on [framework] and independently audited annually."    │
│                                                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                 │
│  │ 🔒         │  │ 📊         │  │ 🛡         │                 │
│  │ Zero Trust │  │ Continuous │  │ Annual     │                 │
│  │ by Default │  │ Monitoring │  │ Pen Tests  │                 │
│  └────────────┘  └────────────┘  └────────────┘                 │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Philosophy statement** — 2–3 sentences written by the admin. Conveyor provides a template/prompt to help admins write this. Displayed in a slightly larger, more prominent typeface.

**Pillars** — 3–4 cards highlighting the vendor's security principles (Zero Trust, Continuous Monitoring, Annual Pen Tests, etc.). Admin-configurable. Each pillar can optionally link to a relevant document.

**Why this section matters:** Customer feedback from Zapier specifically described wanting the TC to be "enterprise ready" for non-security audiences. A philosophy section provides accessible, plain-language context before the visitor dives into technical documents.

---

### Section 3: Documents

The core document browsing experience.

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  Documents                                          42 total     │
│                                                                  │
│  [All] [Certifications] [Policies] [Reports] [Legal] [Other]    │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │  📄 SOC 2    │  │  📄 ISO      │  │  📄 DPA      │           │
│  │  Type II     │  │  27001 Cert  │  │              │           │
│  │              │  │              │  │              │           │
│  │  PDF · 🔒    │  │  PDF         │  │  PDF         │           │
│  │  Mar 2026    │  │  Jan 2026    │  │  Feb 2026    │           │
│  │  [Preview]   │  │  [Preview]   │  │  [Download]  │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │  📄 Privacy  │  │  📄 Pen Test │  │  📄 Incident │           │
│  │  Policy      │  │  Summary     │  │  Response    │           │
│  │              │  │              │  │  Plan        │           │
│  │  PDF         │  │  PDF · 🔒    │  │  PDF         │           │
│  │  Dec 2025    │  │  Mar 2026    │  │  Nov 2025    │           │
│  │  [Preview]   │  │  [Preview]   │  │  [Preview]   │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                  │
│  [Show all 42 documents →]                                       │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Category filter pills** — One row of toggles. "All" is default. Each category shows its count. Filtering is instant (no page reload).

**Document cards** — 3-column grid. Each card shows: title, file type badge (PDF, XLSX, etc.), access level (🔒 = NDA required), last-updated date, and a Preview or Download action. Clicking "Preview" opens a slide-in panel from the right with: document metadata, Coco's AI summary of what the document covers, and an inline document viewer (if access is granted).

**"Show all" link** — If there are more than 6–9 documents, the section shows a truncated grid with a link to expand or navigate to a full Documents view.

**Research backing:** Preview links scored 7/9 in card sorting (must-have). Open/card styling scored 7/9. The side-panel preview pattern tested at 5.5/9. Document freshness dates address the content currency feedback theme.

---

### Section 4: Knowledge Base

Curated FAQ answers organized by security domain.

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  Knowledge Base                                     128 FAQs     │
│                                                                  │
│  [All] [Access Mgmt] [App Security] [Data Privacy]              │
│  [Infrastructure] [Incident Response] [Business Continuity]      │
│                                                                  │
│  ▸ How does Acme Corp handle SSO authentication?                 │
│    ──────────────────────────────────────────────                 │
│  ▾ What MFA methods are supported?                               │
│    Acme supports TOTP, WebAuthn/FIDO2, and push                  │
│    notifications via Duo. SMS-based MFA is available but          │
│    discouraged for security reasons.                              │
│    📎 Source: Security Whitepaper, §4.2                           │
│    ──────────────────────────────────────────────                 │
│  ▸ Does Acme Corp encrypt data at rest?                          │
│    ──────────────────────────────────────────────                 │
│  ▸ What is Acme's incident response SLA?                         │
│    ──────────────────────────────────────────────                 │
│  ▸ How are sub-processors vetted?                                │
│                                                                  │
│  [View all 128 FAQs →]                                           │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Category filter** — Same pill pattern as Documents. Categories mirror the security domains used across the TC.

**Accordion FAQ** — Each question expands to show the answer with a source citation. Citations link directly to the relevant document/section. Answers are Coco-generated from the vendor's actual content, with the admin able to review/edit.

**Thumbs up/down** — Each answer has a small feedback mechanism. This feeds into the agent effectiveness metrics (Q2 Objective 3) and gives admins signal on which answers need improvement.

**Research backing:** Citation transparency is a Conveyor strength in the competitive analysis. Wolfia's citation-on-every-answer approach was noted positively. Instructure asked for the agent to be able to access all TC content types including FAQs.

---

### Section 5: AI Transparency

Model cards inspired by HubSpot's AI trust page (trust.hubspot.com/ai). This section shows how the vendor uses AI, what models power it, and what controls are in place. Increasingly important as AI-assisted vendor reviews become common.

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  AI at Acme Corp                                                 │
│                                                                  │
│  "We use AI to enhance our products while maintaining strict     │
│  data controls. No customer data is used for model training."    │
│                                                                  │
│  ┌─ Trust Center Agent ──────────────┐  ┌─ Controls ──────────┐ │
│  │                                   │  │                      │ │
│  │  ✨ Coco — AI Security Assistant  │  │ ✓ Zero Data         │ │
│  │                                   │  │   Retention          │ │
│  │  Purpose: Answers visitor         │  │                      │ │
│  │  questions about security         │  │ ✓ No Customer Data  │ │
│  │  posture using TC content         │  │   for Training       │ │
│  │                                   │  │                      │ │
│  │  Models                           │  │ ✓ SOC 2 Covered     │ │
│  │  Anthropic: Claude Sonnet 4       │  │                      │ │
│  │                                   │  │ ✓ Citations on      │ │
│  │  Data Handling                    │  │   Every Answer       │ │
│  │  • Queries processed in real time │  │                      │ │
│  │  • No conversation storage        │  │ Frameworks           │ │
│  │  • Responses cite source docs     │  │ [NIST AI RMF]       │ │
│  │                                   │  │ [OWASP LLM Top 10]  │ │
│  │  [Learn More →]                   │  │                      │ │
│  └───────────────────────────────────┘  └──────────────────────┘ │
│                                                                  │
│  ┌─ Product AI Features ────────────────────────────────────────┐│
│  │                                                              ││
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐ ││
│  │  │ Auto-Response  │  │ Smart Search   │  │ Risk Scoring   │ ││
│  │  │ Engine         │  │                │  │                │ ││
│  │  │                │  │                │  │                │ ││
│  │  │ Model: GPT-4.1 │  │ Model: Claude  │  │ Model:         │ ││
│  │  │ Type: Content  │  │ Type: Analysis │  │ Proprietary    │ ││
│  │  │ Generation     │  │ & Insights     │  │ Type: Analysis │ ││
│  │  │ Data: Zero     │  │ Data: Zero     │  │ Data: Zero     │ ││
│  │  │ Retention      │  │ Retention      │  │ Retention      │ ││
│  │  └────────────────┘  └────────────────┘  └────────────────┘ ││
│  │                                                              ││
│  └──────────────────────────────────────────────────────────────┘│
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**AI philosophy statement** — A brief admin-written paragraph about how the vendor approaches AI, with key commitments front and center.

**Trust Center Agent card** — Dedicated card for Coco (or whatever the vendor's TC agent is). Shows: purpose, model provider + model name, data handling policies, and a "Learn More" drill-down. This is the most visitor-facing AI feature, so it deserves its own prominent card.

**AI Controls sidebar** — A checklist of AI safety controls: Zero Data Retention, No Customer Data for Training, SOC 2 Coverage, Citation on Every Answer. Uses green checkmarks like HubSpot's "Model Red Teaming Coverage" panel.

**Frameworks** — Badges for relevant AI security frameworks (NIST AI RMF, OWASP LLM Top 10, MITRE ATLAS) — same pattern as HubSpot's page.

**Product AI Feature cards** — A grid of cards for each AI-powered feature the vendor offers. Each card follows the model card pattern from HubSpot: feature name, model provider, use case category (Content Generation, Analysis, Automation, etc.), and data handling policy. Clicking a card expands to show the full model card details.

**Why this section matters:** Q2 Objective 4 is "Make TCs searchable by AI." An AI transparency section demonstrates that Conveyor is forward-thinking about AI governance — and it gives visitors using LLM-assisted reviews concrete data about the vendor's AI practices. No competitor currently offers this in their Trust Center.

---

### Section 6: Subprocessors

A structured, searchable table of the vendor's sub-processors.

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  Sub-processors                                    24 total      │
│                                                                  │
│  [Search sub-processors...]                                      │
│                                                                  │
│  Name             Purpose              Location    Last Updated  │
│  ─────────────────────────────────────────────────────────────── │
│  AWS              Cloud hosting         US          Mar 2026     │
│  Datadog          Monitoring            US          Mar 2026     │
│  Snowflake        Data warehouse        US          Feb 2026     │
│  Twilio           Communications        US          Jan 2026     │
│  Okta             Identity provider     US          Jan 2026     │
│  ...                                                             │
│                                                                  │
│  [Download full list as CSV]                                     │
│                                                                  │
│  Last updated: March 15, 2026                                    │
│  ⚠ Changes since your last visit: +1 (Datadog added Mar 2026)   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Searchable table** — Clean table with columns for name, purpose/service, location/region, and last updated date. Searchable and sortable. Admin-maintained.

**Download** — "Download as CSV" or "Download as PDF" button. Instructure's Gary specifically requested a "Download All" for subprocessors.

**Change indicator** — For returning visitors, highlight what's changed since their last visit: additions, removals, and changes. This is a small but high-signal feature for GRC analysts tracking vendor changes.

---

### Section 7: Video Resources

Embedded or linked video content for visitors who prefer visual/audio learning.

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  Video Resources                                                 │
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ ▶ [Thumbnail]   │  │ ▶ [Thumbnail]   │  │ ▶ [Thumbnail]   │  │
│  │                 │  │                 │  │                 │  │
│  │ Security        │  │ How We Handle   │  │ SOC 2 Audit     │  │
│  │ Overview        │  │ Your Data       │  │ Walkthrough     │  │
│  │ 3:42            │  │ 5:10            │  │ 8:25            │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Video cards** — Thumbnail, title, duration. Clicking opens an embedded player or links to the hosted video. Admin-curated. This is an optional section — only shown if the admin has added video content.

**Why include this:** Non-security audiences (the Zapier "enterprise ready" feedback) often prefer video walkthroughs over reading PDFs. It also differentiates the TC as a multimedia resource, not just a document repository.

---

### Section 8: Announcements

A chronological feed of important updates, pinned at the admin's discretion.

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  Announcements                                                   │
│                                                                  │
│  📌 SOC 2 Type II (2025) report now available                    │
│     March 12, 2026 · [View Report →]                             │
│                                                                  │
│  📄 Privacy Policy updated to v3.3                               │
│     March 15, 2026 · Added EU data residency clause              │
│                                                                  │
│  🔒 New sub-processor added: Datadog (monitoring)                │
│     March 8, 2026                                                │
│                                                                  │
│  💬 5 new Knowledge Base answers added                           │
│     February 28, 2026 · Topics: Data residency, SSO, MFA        │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Pinned announcement** — Admin can pin one announcement to the top with a highlight treatment. For major events (new certifications, policy changes).

**Changelog entries** — Chronological feed of TC updates: new/updated documents, KB additions, subprocessor changes. Each entry is one line with icon, date, and summary. Auto-generated from TC activity with admin ability to add custom entries.

**Research backing:** Pinned announcements scored as "nice to have" in card sorting. The changelog was descoped from Q1 Above the Fold work but fits here as a lightweight dedicated section.

---

### Footer

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  Powered by Conveyor                    [Trust Scorecard →]      │
│  © 2026 Acme Corp                       [Privacy] [Terms]        │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

- **Powered by Conveyor** — Small, unobtrusive. The vendor's brand dominates.
- **Trust Scorecard link** — Navigates to the separate Trust Scorecard page (see companion plan).

---

### Coco Sidebar Behavior

The right sidebar is always visible, but Coco's content adapts to what the visitor is doing:

**Idle state (no active review):** Shows Coco's pixel art character with the welcome greeting, quick action cards (Start a security review, Search documents), and document tag shortcuts (@soc2-type2, @penetration-test, etc.).

**Active review state:** The sidebar transforms into a review companion showing: questionnaire progress bar, section-by-section checklist (To-Do tab), saved/collected documents (Collection tab), and past session history (Sessions tab). Coco's chat is always available within this panel.

**Contextual prompts:** Coco's greeting/suggestions in the sidebar adapt based on which TC section the visitor is currently viewing in the main content area:

- Overview: "Need help finding something?"
- Documents: "I can summarize any document — just tag it"
- Knowledge Base: "Don't see your question? Ask me"
- AI: "Want to know more about how they use AI?"
- Subprocessors: "Looking for a specific vendor?"
- Announcements: "Want to be notified about changes?"

**Interactions with main content:** Actions in the sidebar affect the main content and vice versa. Clicking a document in the content area can add it to Coco's Collection. Asking Coco a question can scroll the main content to the relevant KB entry. Starting a questionnaire in the sidebar can highlight relevant documents in the content area.

---

## Section Priority Order

Based on card sorting, customer feedback, and competitive analysis:

| Priority | Section | Rationale |
|---|---|---|
| 1 | Header + Search | Highest card sorting score (7.5/9) |
| 2 | Hero / Badges | Instant trust signal + orientation |
| 3 | Documents | Core use case, preview links scored 7/9 |
| 4 | Knowledge Base | Directly serves questionnaire completion |
| 5 | AI Transparency | Forward-looking differentiator |
| 6 | Subprocessors | Standard TC requirement, high admin demand |
| 7 | Philosophy | Accessibility for non-security audiences |
| 8 | Trusted By | Social proof, easy to implement |
| 9 | Video Resources | Optional, high value for non-technical visitors |
| 10 | Announcements | Nice-to-have, low effort |

---

*See also: `trust-scorecard-page-plan.md` for the companion Trust Scorecard page.*
