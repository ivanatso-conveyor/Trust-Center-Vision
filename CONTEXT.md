# Trust Center Vision — Context for Claude Code

> This file summarizes the research, strategy, and competitive landscape behind the Conveyor Trust Center Vision prototype. Use this as background context when building or iterating on the prototype.

---

## What Is Conveyor?

Conveyor is a B2B SaaS trust automation platform. Its core product is the **Trust Center** — a buyer-facing security portal where visitors (security analysts, GRC teams) can review a vendor's compliance posture, download documents, and ask questions via an AI Agent. Conveyor's company vision is "instant trust between companies" and its 2026 North Star metric is **Touchless Rate** — the percentage of security reviews completed end-to-end with zero human touches.

---

## The Project: Trust Center Vision Sprint

The TrustUs League team (Haley, Ivana, Nadim + extended: Chris, Anner, Sydney) is running a 3-day sprint (April 1–3, 2026) to define the highest-leverage bets for the Trust Center in Q2 2026. This is the last dedicated quarter of TC development, so decisions must be sharp.

**Sprint structure:**
- Day 1 (Build): Everyone independently prototypes ideas in parallel
- Day 2 (Show & Discuss): Show-and-tell, reactions, cross-pollination
- Day 3 (Converge): Force-rank by impact × feasibility, lock the Q2 build plan

**The prototype we're building is Ivana's Day 1 artifact** — a vision of what a next-generation Trust Center could look and feel like.

---

## Q2 2026 Strategy — Four Objectives

1. **Improve TC Visitor CSAT from 3.3 → 4.0** — Make self-service frictionless
2. **Ship Trust Center 2.0** — Staging first (prerequisite), then first round of vision improvements
3. **TC Agent: adoption → effectiveness** — Higher answer acceptance, fewer follow-ups
4. **Make TCs searchable by AI** — So buyers using LLMs to research vendors can discover Conveyor TCs

These roll up to company OKRs: Touchless Reviews, Trials + Onboarding, Foundation for Growth.

**Key constraint:** Staging must ship before TC 2.0 can roll out — customers need to preview changes safely.

---

## North Star

> "Trust Center Visitors can confidently and efficiently complete their security review without support when using a Conveyor Trust Center."

---

## Customer Feedback Themes (from Slack, interviews, and support)

**Top 10 themes from 18 months of feedback:**

1. **AI Agent Speed** — P50 response time ~15s, minimum 6.77s. Customers say "painfully slow." Root cause: agent re-initialization per request for security.
2. **Agent Content & Customization** — Customers want custom disclaimers, fallback messages, smarter content scoping, "answered with AI" labels, and region-specific recommendations.
3. **Document Management** — Separate view vs. download permissions, inline CSV/Excel viewing, custom watermarks, better file upload limits.
4. **NDA / Access Gating** — Internal users incorrectly gated, confused routing between TC and questionnaires, need notes/status on access requests.
5. **Analytics & Reporting** — Visitor counts inflated by bots, need document-to-revenue correlation, exportable feedback data, thumbs up/down visibility.
6. **Automation & Innovation Pace** — Notion perceives Conveyor as less innovative than competition. Demand for Slack-native questionnaire workflows.
7. **Branding & Customization** — Custom fonts, brand colors on emails, AI bot name/color customization. Enterprise customers want TC to feel like "their" product.
8. **Positive Feedback** — Workday: "such a better experience." Instructure: "intuitive, nice UI, total breeze setup." Qualtrics using agent data for AI trend analysis.
9. **Admin UX** — Confusing agent review notifications, subprocessor list limitations, no "download all" for subprocessors.
10. **Churn Risk** — KB/TC maintenance burden cited as churn factor. Competitors (Drata, SafeBase) pulling accounts.

---

## Competitive Landscape (March 2026)

### Market Snapshot

| Vendor | Type | Positioning | Pricing |
|---|---|---|---|
| **SafeBase / Drata** | Bundled (compliance) | Pioneer TC, now part of Drata | ~$10k/yr (Drata base) |
| **Vanta** | Bundled (compliance) | Agentic Trust Platform; TC is $6k add-on | $10–80k/yr + $6k TC |
| **OneTrust** | Enterprise GRC | Broad GRC; not a direct TC competitor | ~$11.5k/yr custom |
| **Wolfia** | Standalone (AI-first) | AI agent + TC; unlimited users | Flat fee (undisclosed) |

### Key Competitive Insights

- **SafeBase's acquisition by Drata is a strategic gift.** The category's original champion is no longer standalone. Customers wanting a best-in-class independent TC are now underserved — Conveyor's biggest opportunity.
- **AI is table stakes.** The new battlegrounds are UX, accuracy, citation transparency, and time-to-value.
- **Vanta's TC is a bolt-on.** $6k+ on top of $10–80k compliance platform = room for Conveyor at mid-market.
- **Wolfia is a sleeper threat.** Unlimited-user pricing, 30-min setup, citation transparency. Small (5 people, $500k seed) but compelling unit economics.
- **No competitor has nailed the buyer experience.** Everyone optimizes for the seller's workflow. The visitor's experience is underdeveloped across the board — this is Conveyor's clearest differentiation.

### Feature Comparison (Conveyor Strengths)

- Trust Center Portal: Strong
- AI Questionnaire Automation: Strong
- Buyer Self-Serve Experience: Strong
- Knowledge Base: Strong
- AI Citation Transparency: Strong
- Standalone Product: Strong (no bundle required)
- Transparent Pricing: Strong (public pricing page)

### Feature Comparison (Conveyor Gaps)

- Analytics & Pipeline Impact: Good (vs SafeBase's Strong — biggest retention driver)
- Access Controls & NDA: Good (vs SafeBase/Vanta Strong)
- CRM & Sales Integrations: Good (vs SafeBase/Vanta Strong — deal-stage gating, bidirectional sync)
- Compliance Platform Integration: Limited

---

## Feature & Functionality Gaps

**TC Designer & Customization** — Loudest signal. Marketing teams want deeper layout control, font/color/branding, staging/preview, page-level customization. Current designer is functional but limited.

**Visitor Experience & Navigation** — Three-panel nav is confusing. Need smarter guided entry, better search, proactive doc recommendations, clearer visual hierarchy.

**Document & Content Management** — Bulk actions, version management, expiry reminders, richer organization beyond flat folders.

**Analytics & Reporting** — Strategically significant gap. Need CRM-linked pipeline correlation, account engagement summaries, ROI reporting for QBRs.

**Integrations** — Need deeper CRM sync (bidirectional deal-stage), Slack workflows, compliance platform connections, NDA signing (DocuSign/Ironclad).

**Access Controls & NDA** — SCIM provisioning, full audit log, flexible NDA templates, time-limited access.

**Multi-Product Support** — Multiple TC experiences under one account for different products/business units.

---

## Differentiation Opportunities

1. **Buyer experience is the biggest white space.** Personalized navigation, proactive doc recommendations, review progress indicators.
2. **Independent TC positioning.** With SafeBase absorbed into Drata, Conveyor can own "best-in-class TC without buying a compliance platform."
3. **AI citation transparency & answer quality.** Already leading — treat as measurable product commitment.
4. **Helping admins prove ROI.** Pipeline impact dashboards and revenue attribution.

---

## Above the Fold Improvements (Current Q1 Work)

The team is shipping incremental improvements to the first impression of a Trust Center (1440×800 viewport). This is designed but not yet live.

**Prioritized scope (stack ranked):**
1. Preview links (Must have)
2. Rollback capability (Must have)
3. Improved global search (Must have)
4. Updated header bar (Must have)
5. Custom documents → user menu (Must have)
6. New layout (Must have)
7. Docs/Certs/Updated date badges (Nice to have)
8. Quick links (Nice to have)
9. Pinned announcements (Nice to have)
10. Table of contents navigation (Nice to have)

**Descoped:** Product line modal, onboarding modal, change log widget, manage preferences.

**Launch approach:** Internal validation → limited customer preview → rollout to all → post-launch sentiment measurement.

---

## Card Sorting Research Results (Figma)

User preference synthesis from card sorting on Trust Center changes:

**Highest excitement (build these):**
- New header bar + search selector (7.5 excited / 0.5 neutral)
- Preview links in Trust Center (7 / 2)
- Open/Card styling options (7 / 2)
- Combined/Separate selector with search (7 / 0)

**Moderate excitement:**
- User Profile with side-panel documents (5.5 / 3.5)
- Rollback with 2 weeks notification (5 / 3)
- Horizontal banner format (4.5 / 5.5)

**Lower priority / mixed:**
- Staging preview (4 / 5.5 / 0.5 scared)
- Updated badges (2 / 7)
- Push notifications (2 / 6 / 1 scared)

**Key takeaway:** Search/navigation improvements are universally wanted. Structural changes (modals, notifications) generate more caution.

---

## Coco — The Mascot

Sort Coco (The Organizer) is the Trust Center AI mascot — a 4-bit pixel art character based on Conveyor's "C" logo. It's an 8×8 grid SVG character whose signature animation is "sorting" — eyes flick left/right as items are sorted, with a green flash (approved) on the left and a gold flash (flagged) on the right.

The full Coco component code is in `Coco.jsx` and in the COCO PIXEL ART SPEC section of `claude-code-prompt-trust-center-prototype.md`. Use that component exactly as specified — do not recreate or reinterpret the character design.

**Coco's 6 states:** idle (sorting), thinking (pulsing), sorting (2× speed), waving (arm animates), celebrating (particles + arm raised), sleeping (gray eyes + floating z's).

---

## Files in This Folder

| File | Description |
|---|---|
| `claude-code-prompt-trust-center-prototype.md` | Full Claude Code prompt with design system, views, and Coco spec |
| `Coco.jsx` | Standalone React component — use this exactly |
| `CONTEXT.md` | This file — research & strategy summary |
| `coco-variations-v6.html` | Character design explorations (V6 final) |
| `coco-sort-variations.html` | Sort Coco animation variations |
| `Trust Center Vision Sprint.pdf` | Sprint planning doc |
| `TrustUs League Q2 2026 Strategy.pdf` | Q2 objectives & KRs |
| `Trust Center Vision.pdf` | Vision doc with customer themes & gaps |
| `Competitive Research - March 2026.pdf` | Full competitive analysis |
| `Above the Fold Improvements.pdf` | Q1 initiative scope |
| `Slack Feedback by Theme Sep 2024 - Mar 2026.pdf` | 18 months of customer feedback |
| `Card Sorting - Preference Synthesis (Figma).pdf` | Research results from card sorting |

---

*Last updated: March 28, 2026*
