# Trust Scorecard — Page Plan

> A separate page from the Trust Center, focused on measurable trust posture, content gap transparency, visitor-driven prioritization, and comparative achievements. Think of it as the "GitHub Profile" for a Trust Center — stats, activity, and social proof all in one view.

---

## What This Page Is

The Trust Scorecard is a **data-driven, interactive view** of how well this Trust Center serves its visitors. While the main Trust Center page is about browsing content, the Scorecard is about *measuring* the quality and completeness of that content.

It answers four questions:
1. **How strong is this vendor's trust posture?** (Content Coverage, Freshness, Depth)
2. **Where are the gaps — and what do visitors actually need?** (Content Gaps with upvoting/downvoting)
3. **How does this Trust Center compare?** (Achievements benchmarked against other Conveyor TCs)
4. **How does this vendor stack up against another vendor I'm evaluating?** (Side-by-side comparison via Coco)

This page is accessible via a link in the Trust Center footer or header, the left icon nav, and from the visitor's Coco sidebar. It can be public (visible to all visitors) or gated (visible only to authenticated visitors), at the admin's discretion.

**Layout note:** Like the Trust Center, this page uses the same three-panel layout: left icon nav, center scrollable content (where all Scorecard sections live), and the persistent Coco sidebar on the right. Coco can reference scorecard data in real time: "This TC scores 82/100 and ranks in the top 12% — want me to start your questionnaire?"

---

## Page Structure

---

### Section 1: Trust Score Overview

The headline. A single composite score that gives visitors an instant read on posture quality.

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  Acme Corp Trust Scorecard                                       │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │                                                          │    │
│  │         ┌─────────────────┐                              │    │
│  │         │                 │                              │    │
│  │         │       82        │    "Strong posture with      │    │
│  │         │    out of 100   │    minor gaps in data        │    │
│  │         │                 │    residency and incident    │    │
│  │         └─────────────────┘    response documentation"   │    │
│  │                                                          │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐               │    │
│  │  │Coverage  │  │Freshness │  │  Depth   │               │    │
│  │  │  94%     │  │   88%    │  │   76%    │               │    │
│  │  │██████░░  │  │█████░░░  │  │████░░░░  │               │    │
│  │  └──────────┘  └──────────┘  └──────────┘               │    │
│  │                                                          │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Overall Score (0–100)** — A composite number displayed prominently in a circular or card-style treatment. Color-coded: green (75+), yellow (50–74), red (below 50). Accompanied by a Coco-generated one-line plain-English summary.

**Three Sub-Scores:**
- **Coverage** — What percentage of common security review topics have documented answers? (Measured against standard frameworks like SIG Lite, CAIQ, etc.)
- **Freshness** — How current is the documentation? Weighted by document importance. A SOC 2 report from this year scores higher than one from 2 years ago.
- **Depth** — How thoroughly is each topic covered? A single FAQ answer scores lower than a FAQ + supporting document + certification evidence.

**How it's calculated:** Conveyor computes this automatically based on the TC's content, framework coverage, and document metadata. The admin sees the same score and can use it as a guide for where to invest effort.

**Tooltip Spec — Score Calculation Transparency:**

Every score on this page has an info icon (ⓘ) that reveals a tooltip on hover/click explaining exactly how the score was derived. This is critical for data-backed trust — visitors should never wonder "where did this number come from?"

- **Overall Score tooltip:** "Composite of Coverage (40%), Freshness (30%), and Depth (30%). Coverage measures documented answers against standard frameworks. Freshness weights recent documents higher. Depth rewards multi-source evidence (FAQ + doc + cert)."
- **Coverage tooltip:** "94% of 326 common security review topics have documented answers. Measured against SIG Lite (256 questions), CAIQ (197 questions), and VSA (136 questions) with de-duplication."
- **Freshness tooltip:** "Weighted average of document age. SOC 2 reports, pen test results, and certifications weighted 3×. Score: 100% = all docs < 90 days, 0% = all docs > 2 years. Current: 88% — 2 documents due for refresh."
- **Depth tooltip:** "Measures evidence layers per topic. Single FAQ = 1pt, FAQ + document = 2pt, FAQ + document + certification = 3pt. Score = actual points / maximum possible points. Current: 76% — strongest in Access Management, weakest in Incident Response."

---

### Section 2: Category Breakdown

Drills into each security domain with specific scores and supporting evidence.

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  Category Scores                                                 │
│                                                                  │
│  ▾ Access Management                          89 / 100           │
│    ████████████████████████████░░░░                               │
│    12 controls documented · 8 supporting docs · 94% Q&A rate     │
│    ✓ SSO  ✓ MFA  ✓ RBAC  ✓ SCIM  ✓ Audit Logs                   │
│    ──────────────────────────────────────────────────             │
│                                                                  │
│  ▸ Application Security                       82 / 100           │
│    ██████████████████████████░░░░░░                               │
│    ──────────────────────────────────────────────────             │
│                                                                  │
│  ▸ Data Privacy & Residency                   76 / 100           │
│    ████████████████████████░░░░░░░░                               │
│    ──────────────────────────────────────────────────             │
│                                                                  │
│  ▸ Infrastructure & Hosting                   91 / 100           │
│    ████████████████████████████░░░                                │
│    ──────────────────────────────────────────────────             │
│                                                                  │
│  ▸ Incident Response                          68 / 100  ⚠        │
│    ██████████████████████░░░░░░░░░░                               │
│    ──────────────────────────────────────────────────             │
│                                                                  │
│  ▸ Vendor Risk Management                     88 / 100           │
│    ████████████████████████████░░░░                               │
│    ──────────────────────────────────────────────────             │
│                                                                  │
│  ▸ Business Continuity                        85 / 100           │
│    ███████████████████████████░░░░░                               │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Expandable category rows** — Each domain shows its score as a horizontal progress bar + number. Clicking expands to show: number of controls documented, supporting documents count, percentage of visitor questions Coco can answer in this category, and specific topic checkmarks.

**Warning indicators** — Categories below a threshold (e.g., 70) show a ⚠ icon. This is visible to visitors and signals honest transparency about where there are gaps — which actually builds trust rather than undermining it.

**Framework Coverage sub-section** — Below the categories, show what percentage of common questionnaire frameworks can be answered:

```
│  Framework Coverage                                              │
│                                                                  │
│  SIG Lite         ████████████████████░░  92% answerable         │
│  CAIQ             ███████████████████░░░  87% answerable         │
│  VSA              ██████████████████░░░░  83% answerable         │
│  Custom Q's       █████████████████░░░░░  78% answerable         │
│                                                                  │
│  ✨ "Coco can pre-fill 92% of a SIG Lite from this TC"           │
```

This directly addresses the questionnaire pre-fill value proposition: visitors can see before starting that Coco already has most of the answers.

**Tooltip Spec — Category Scores:**

Each category score has an ⓘ tooltip:
- **Category score tooltip:** "Access Management: 89/100. Based on 12 controls documented (weight: 40%), 8 supporting documents (weight: 30%), and 94% Coco Q&A success rate in this category (weight: 30%). Controls verified: SSO, MFA, RBAC, SCIM, Audit Logs, [+7 more]."
- **Framework Coverage tooltip:** "SIG Lite 92% answerable = 236 of 256 questions have documented answers or can be inferred from existing content. 20 unanswered questions map to: Data Residency (8), Incident Response (7), Physical Security (5)."
- **Warning ⚠ tooltip:** "This category scores below 70/100, indicating gaps in documentation. Click to see which specific topics are missing."

---

### Section 3: Content Gaps (with Visitor Upvote/Downvote)

The most interactive section. Shows what's missing and lets visitors signal what matters most.

**Why upvote/downvote belongs on the Scorecard (confirmed):** The Scorecard is the right home for content gap voting because it's the page about *measuring and improving* the Trust Center — not just consuming it. Visitors arriving at the Scorecard are already in an evaluative mindset ("how good is this TC?"), which is exactly the right context for "what's missing and what should be fixed first?" Placing voting on the main TC page would feel like a complaint box next to the content itself. On the Scorecard, it's a constructive feedback mechanism inside a data-driven context — it's expected and feels natural. The voting data also feeds directly into the analytics on this same page (gap resolution rate, admin responsiveness), creating a self-reinforcing loop.

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  Content Gaps                        12 open gaps · 47 resolved  │
│                                                                  │
│  Topics visitors have asked about that don't yet have complete   │
│  answers. Vote ▲ or ▼ to help prioritize what matters most.     │
│                                                                  │
│  ┌── Sort: [Most Voted ▾]  [Newest]  [Category]  [Status] ───┐  │
│  │                                                            │  │
│  │  ▲   EU Data Residency — specific AWS regions              │  │
│  │  47  Data Privacy · First asked: Feb 12 · Asked 47x        │  │
│  │  ▼   Status: 🟡 In Review  · 3 visitors watching           │  │
│  │      ────────────────────────────────────────               │  │
│  │                                                            │  │
│  │  ▲   SOC 2 Type II scope — which services covered?         │  │
│  │  31  Certifications · First asked: Jan 8 · Asked 31x       │  │
│  │  ▼   Status: 🟢 Response drafted · ETA: 2 days             │  │
│  │      ────────────────────────────────────────               │  │
│  │                                                            │  │
│  │  ▲   Complete sub-processor list with DPA status            │  │
│  │  28  Vendor Risk · First asked: Mar 1 · Asked 28x          │  │
│  │  ▼   Status: 🔴 Open                                       │  │
│  │      ────────────────────────────────────────               │  │
│  │                                                            │  │
│  │  ▲   Incident response SLA for critical vulnerabilities     │  │
│  │  19  Incident Response · First asked: Feb 20 · Asked 19x   │  │
│  │  ▼   Status: 🔴 Open                                       │  │
│  │      ────────────────────────────────────────               │  │
│  │                                                            │  │
│  │  ▲   Data deletion / right to erasure process               │  │
│  │  15  Data Privacy · First asked: Mar 5 · Asked 15x         │  │
│  │  ▼   Status: 🟡 In Review                                  │  │
│  │      ────────────────────────────────────────               │  │
│  │                                                            │  │
│  │  ▲    Penetration test methodology details                  │  │
│  │   8   Application Security · First asked: Mar 10            │  │
│  │  ▼    Status: 🔴 Open                                      │  │
│  │       ────────────────────────────────────────              │  │
│  │                                                            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  📊 Gap Resolution Rate: 79.7% (47 of 59 total gaps resolved)   │
│  ⏱  Avg. Time to Resolve: 6.2 days  ⓘ                           │
│                                                                  │
│  💡 Don't see your question? [Ask Coco →] and if it can't       │
│  answer, it'll automatically create a gap request.               │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Gap list** — Each gap shows: the topic/question, the security category it falls under, when it was first asked, how many times visitors have asked about it, a status indicator, and (where applicable) an ETA and watcher count.

**Upvote/Downvote buttons (▲ / ▼)** — Visitors can upvote gaps they care about or downvote gaps they consider low priority or already resolved elsewhere. One vote per visitor per gap. Net vote count is publicly visible. This gives admins a democratized priority queue — they can see exactly what their buyers need most and deprioritize noise. The downvote serves an important quality function: if a gap has been partially addressed or is no longer relevant, the community can signal that without requiring admin action.

**Watcher count** — Visitors can "watch" a gap to get notified (via Coco or email) when it's resolved. Watcher count is shown next to in-progress gaps. This gives the admin a secondary signal: even if a gap has modest votes, 12 watchers means 12 people waiting on an answer.

**Status indicators:**
- 🔴 **Open** — No response yet
- 🟡 **In Review** — Admin is working on it
- 🟢 **Response Drafted** — Answer is being prepared, expected soon (with ETA when available)

**Gap Resolution Analytics** — Below the gap list, two key metrics with tooltips:
- **Gap Resolution Rate:** Percentage of all-time gaps that have been resolved. Tooltip: "79.7% = 47 resolved / 59 total gaps since this TC launched. Gaps are marked resolved when the admin publishes an answer or uploads supporting documentation."
- **Avg. Time to Resolve:** Mean time from gap creation to resolution. Tooltip: "6.2 days average across 47 resolved gaps. Median: 4 days. Fastest: 2 hours (SOC 2 scope clarification). Slowest: 21 days (penetration test methodology)."

**Sorting** — Sort by most voted (default), newest, category, or status. This lets visitors browse gaps by what matters to the community vs. what's most recent vs. what's closest to being addressed.

**Coco bridge** — If a visitor's question isn't in the gap list, they can ask Coco directly. If Coco can't answer, it automatically creates a new gap entry and adds the visitor as the first watcher.

**Why voting matters strategically:** This is a two-sided value loop. Visitors get transparency about what's missing and a voice in prioritization. Admins get a data-driven backlog of exactly what their buyers need — ranked by actual demand, not guesswork. No competitor offers anything like this. It also feeds directly into the analytics story: "47 visitors asked about EU data residency this month" is a powerful signal for the admin to act on. The downvote mechanic prevents stale gaps from clogging the queue and keeps the list relevant over time.

---

### Section 4: How This Trust Center Compares

The primary visitor-confidence builder. Shows real data analytics comparing this TC to the broader Conveyor network, so visitors can objectively assess whether this vendor takes trust seriously relative to peers.

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  How Acme Corp Compares                                          │
│  Benchmarked against 850+ Conveyor Trust Centers                 │
│                                                                  │
│  ┌─ Overall Ranking ────────────────────────────────────────────┐│
│  │                                                              ││
│  │  📊 Top 12%                                                  ││
│  │  Acme Corp ranks in the top 12% of all Conveyor              ││
│  │  Trust Centers across all measured dimensions.                ││
│  │                                                              ││
│  │  ██████████████████████████████████████████░░░░░░░░░░        ││
│  │  ▲ Acme Corp                                                 ││
│  │                                                              ││
│  └──────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌─ Dimension Comparison ───────────────────────────────────────┐│
│  │                                                              ││
│  │              This TC    Network Avg    Network Best           ││
│  │              ───────    ───────────    ────────────           ││
│  │  Response    1.8 hr     4.2 hr         0.3 hr                ││
│  │  Time        ████████████████░░░░░░░░░░░░░░░░░░░░            ││
│  │              ▲ 78th percentile                                ││
│  │                                                              ││
│  │  Content     94%        76%            99%                    ││
│  │  Coverage    ██████████████████████████████████░░░░           ││
│  │              ▲ 85th percentile                                ││
│  │                                                              ││
│  │  Doc         3 days     28 days        < 1 day               ││
│  │  Freshness   ████████████████████████████████████░            ││
│  │              ▲ 91st percentile                                ││
│  │                                                              ││
│  │  AI Answer   96%        81%            99%                    ││
│  │  Accuracy    █████████████████████████████████░░░░            ││
│  │              ▲ 82nd percentile                                ││
│  │                                                              ││
│  │  Visitor     1,240      380            8,500                  ││
│  │  Traffic     ████████████████░░░░░░░░░░░░░░░░░░░░            ││
│  │  (90 day)    ▲ 65th percentile                               ││
│  │                                                              ││
│  │  Questions   2,847      620            12,400                 ││
│  │  Answered    ██████████████████████░░░░░░░░░░░░░░            ││
│  │              ▲ 73rd percentile                                ││
│  │                                                              ││
│  └──────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌─ Trend ──────────────────────────────────────────────────────┐│
│  │                                                              ││
│  │  Score Trend — Last 6 Months                                 ││
│  │                                                              ││
│  │  100 ┤                                                       ││
│  │   90 ┤                              ╭──●                     ││
│  │   80 ┤                  ╭───────────╯                        ││
│  │   70 ┤       ╭─────────╯                                     ││
│  │   60 ┤───────╯                                               ││
│  │   50 ┤                                                       ││
│  │      └──────────────────────────────────                     ││
│  │       Oct    Nov    Dec    Jan    Feb    Mar                  ││
│  │                                                              ││
│  │  ↑ 22 points improvement since October                       ││
│  │                                                              ││
│  └──────────────────────────────────────────────────────────────┘│
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Overall Ranking** — A single percentile showing where this TC falls in the entire Conveyor network. "Top 12% of 850+ Trust Centers" is an immediate confidence signal for visitors. The horizontal bar shows the TC's position visually.

**Dimension Comparison Table** — Six key metrics, each showing three data points: this TC's value, the network average, and the network best. Plus a percentile bar and rank. This lets visitors see exactly where this TC excels and where it's closer to average. The dimensions are:
- **Response Time** — How fast the admin responds to questions/gaps
- **Content Coverage** — What % of common security topics are documented
- **Document Freshness** — How recently content was updated
- **AI Answer Accuracy** — Thumbs-up rate on Coco's answers
- **Visitor Traffic** — Unique visitors in 90 days (proxy for usefulness)
- **Questions Answered** — Total questions resolved (volume + effectiveness)

**Score Trend** — A simple line chart showing how the TC's overall score has changed over the last 6 months. An improving trend builds confidence: "This vendor is actively investing in their trust posture." A flat or declining trend is honest transparency that still builds trust through openness.

**Tooltip Spec — Comparison Metrics:**

Each dimension in the comparison table has an ⓘ tooltip:
- **Response Time tooltip:** "1.8 hr average across 312 visitor questions this month. Measured from question submission to first admin response or AI answer acceptance. Excludes weekends. 78th percentile = faster than 78% of 850+ Conveyor Trust Centers."
- **Content Coverage tooltip:** "94% = 306 of 326 common security topics have documented answers. Topics drawn from SIG Lite, CAIQ, VSA, and Conveyor's proprietary topic index. Network average: 76% (248 topics). Top performer: 99% (323 topics)."
- **Doc Freshness tooltip:** "3 days since last content update. Weighted score: 88/100. Weighting: SOC 2 and pen test reports (3×), policies (2×), FAQ entries (1×). 0 expired documents. 91st percentile = fresher than 91% of Conveyor Trust Centers."
- **AI Answer Accuracy tooltip:** "96% = 2,733 of 2,847 AI-generated answers received positive feedback (thumbs up). Excludes questions where no feedback was given. Network average: 81%. 82nd percentile."
- **Visitor Traffic tooltip:** "1,240 unique visitors in the last 90 days based on authenticated sessions and unique IP/fingerprint de-duplication. Bot traffic excluded. 65th percentile."
- **Questions Answered tooltip:** "2,847 total questions answered since TC launch. 89% (2,534) answered by AI without escalation. 11% (313) escalated to admin. This month: 312 questions. 73rd percentile."
- **Trend tooltip (on hover over any data point):** "March 2026: Score 82/100 (+4 from February). Key changes: +2 Coverage (added Data Residency FAQ), +1 Freshness (updated SOC 2 report), +1 Depth (added pen test methodology doc)."

**Why this matters for visitor confidence:** When a GRC analyst lands on a Trust Scorecard and sees "top 12%, faster than 78% of TCs, 96% AI accuracy" — that's not marketing copy. It's real, benchmarked data from the Conveyor network. It gives the visitor defensible evidence they can share with their team: "This vendor's Trust Center is objectively well-maintained."

---

### Section 4b: Compare Scorecards (Side-by-Side via Coco)

A dedicated comparison feature that lets visitors evaluate two vendors side by side — the killer feature for GRC analysts reviewing multiple vendors simultaneously.

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  Compare Trust Centers                                           │
│                                                                  │
│  See how this Trust Center stacks up against another vendor      │
│  you're evaluating.                                              │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  🔍 Search for a company to compare...                     │  │
│  │     [ Acme Corp  vs  _________________ ]                   │  │
│  │                                                            │  │
│  │  Recent comparisons:                                       │  │
│  │  Acme Corp vs. Globex Inc.  ·  Acme Corp vs. Initech      │  │
│  │                                                            │  │
│  │                    [Compare in Coco →]                      │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**How it works:**

1. **Search & Select** — The visitor types a company name into the search field. Autocomplete suggests companies that have public Conveyor Trust Centers. The current TC is pre-filled on the left side.

2. **"Compare in Coco →" button** — Clicking this opens the Coco sidebar (or focuses it if already open) with a pre-filled comparison prompt. Coco then generates a structured comparison including:

```
┌─ Coco Sidebar: Comparison Mode ─────────────────────────────────┐
│                                                                  │
│  🤖 Coco                                                        │
│                                                                  │
│  Here's how Acme Corp and Globex Inc. compare:                  │
│                                                                  │
│  ┌─────────────────────┬───────────┬───────────┐                │
│  │                     │ Acme Corp │ Globex    │                │
│  ├─────────────────────┼───────────┼───────────┤                │
│  │ Trust Score         │ 82/100    │ 74/100    │                │
│  │ Coverage            │ 94%       │ 81%       │                │
│  │ Freshness           │ 88%       │ 72%       │                │
│  │ Response Time       │ 1.8 hr    │ 6.1 hr    │                │
│  │ AI Accuracy         │ 96%       │ 89%       │                │
│  │ Open Gaps           │ 12        │ 23        │                │
│  │ Framework Coverage  │ 92% SIG   │ 78% SIG   │                │
│  └─────────────────────┴───────────┴───────────┘                │
│                                                                  │
│  ✅ Acme Corp strengths:                                        │
│  • Faster response time (top 22% vs. Globex top 45%)            │
│  • Higher AI accuracy with better citation coverage              │
│  • Fewer open content gaps (12 vs. 23)                           │
│  • More complete SIG Lite coverage (92% vs. 78%)                 │
│                                                                  │
│  ⚠️ Areas where Globex leads:                                   │
│  • More compliance certifications listed (7 vs. 5)              │
│  • Incident response documentation is more detailed              │
│                                                                  │
│  💡 Recommendation:                                              │
│  Acme Corp has a stronger overall trust posture. Their           │
│  documentation is more current and comprehensive. I'd            │
│  suggest requesting their SOC 2 report and Data Residency        │
│  FAQ for your review. Want me to start gathering those?          │
│                                                                  │
│  [Start questionnaire with Acme Corp →]                          │
│  [Start questionnaire with Globex →]                             │
│  [Export comparison as PDF →]                                    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

3. **Coco's comparison output includes:**
   - Side-by-side data table with key metrics from both scorecards
   - Strengths of the current TC (where it leads)
   - Areas where the other vendor leads (honest transparency)
   - A plain-English recommendation based on the data
   - Action buttons to start a questionnaire with either vendor or export the comparison

4. **Privacy & data rules:**
   - Only publicly available scorecard data is compared (no gated content)
   - The comparison only works with vendors that have public Conveyor Trust Centers
   - Neither vendor's admin is notified about the comparison
   - Visitors can export the comparison as a PDF to share with their team

5. **Recent comparisons** — Shows the visitor's last 2–3 comparisons for quick re-access (stored in session, not persistent).

**Why this is powerful:** GRC analysts almost never evaluate a single vendor. They're always comparing 2–5 vendors in parallel. By making that comparison native to the Scorecard — and routing it through Coco for an intelligent analysis — Conveyor becomes the hub for vendor evaluation, not just a portal for a single vendor. This is a significant competitive moat: no other Trust Center product offers cross-vendor comparison.

---

### Section 5: Achievements

Badge-style recognition for specific milestones. More granular and gamified than the comparative analytics above.

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  Achievements                                                    │
│                                                                  │
│  ┌─ Response Time ───────────┐  ┌─ Content Accuracy ──────────┐ │
│  │                           │  │                              │ │
│  │  ⚡ 1.8 hours             │  │  🎯 96%                      │ │
│  │  Average response time    │  │  AI answer accuracy          │ │
│  │                           │  │                              │ │
│  │  ██████████████░░░░░░     │  │  ████████████████████░░      │ │
│  │                           │  │                              │ │
│  │  Faster than 78% of      │  │  Higher than 82% of          │ │
│  │  Conveyor Trust Centers   │  │  Conveyor Trust Centers      │ │
│  │                           │  │                              │ │
│  │  🥈 Silver                │  │  🥇 Gold                     │ │
│  │  (< 1hr for Gold)        │  │                              │ │
│  └───────────────────────────┘  └──────────────────────────────┘ │
│                                                                  │
│  ┌─ Questions Answered ──────┐  ┌─ Visitor Engagement ────────┐ │
│  │                           │  │                              │ │
│  │  💬 2,847                 │  │  👥 1,240                    │ │
│  │  Total questions answered │  │  Unique visitors (90 days)   │ │
│  │                           │  │                              │ │
│  │  312 this month           │  │  ██████████████████░░░░      │ │
│  │  89% answered by AI       │  │                              │ │
│  │  11% escalated to admin   │  │  More traffic than 65% of   │ │
│  │                           │  │  Conveyor Trust Centers      │ │
│  │  🥇 Gold                  │  │                              │ │
│  └───────────────────────────┘  │  🥈 Silver                   │ │
│                                 └──────────────────────────────┘ │
│                                                                  │
│  ┌─ Content Freshness ───────┐  ┌─ Update Frequency ──────────┐ │
│  │                           │  │                              │ │
│  │  📅 Last updated:         │  │  🔄 8 updates this month    │ │
│  │  3 days ago               │  │                              │ │
│  │                           │  │  ██████████████████████░░    │ │
│  │  0 expired documents      │  │                              │ │
│  │  2 docs updated this week │  │  More active than 88% of    │ │
│  │                           │  │  Conveyor Trust Centers      │ │
│  │  ██████████████████████░  │  │                              │ │
│  │                           │  │  🥇 Gold                     │ │
│  │  Fresher than 91% of     │  │                              │ │
│  │  Conveyor Trust Centers   │  └──────────────────────────────┘ │
│  │                           │                                   │
│  │  🥇 Gold                  │                                   │
│  └───────────────────────────┘                                   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Six Achievement Cards:**

1. **Response Time** — Average time to respond to visitor questions and gap requests. Benchmarked as a percentile against all Conveyor Trust Centers. Tiers: Gold (< 1hr), Silver (< 4hr), Bronze (< 24hr).

2. **Content Accuracy** — Percentage of AI-generated answers that visitors rate as accurate (thumbs up). Benchmarked against the network. Tiers: Gold (95%+), Silver (90%+), Bronze (80%+).

3. **Questions Answered** — Total questions answered, with breakdown of AI-answered vs. escalated to admin. Shows volume and AI effectiveness.

4. **Visitor Engagement** — Unique visitors in the last 90 days. Benchmarked against the network. Shows how much traffic the TC attracts — a proxy for how useful it is.

5. **Content Freshness** — When the TC was last updated, how many expired documents exist, recent update activity. Benchmarked against the network.

6. **Update Frequency** — How often the admin updates the TC. Benchmarked against the network. Rewards consistent maintenance over one-time setup.

**Tier System** — Each achievement has three tiers (🥇 Gold, 🥈 Silver, 🥉 Bronze) based on absolute thresholds, plus a percentile rank showing how this TC compares to the Conveyor network. Progress bars show how close the admin is to the next tier.

**Tooltip Spec — Achievement Calculations:**

Each achievement card has an ⓘ tooltip:
- **Response Time tooltip:** "Average: 1.8 hours across 312 questions this month. Median: 1.2 hours. Calculated from question timestamp to first response timestamp. Excludes weekends/holidays. Silver tier (current): < 4 hours average. Gold threshold: < 1 hour average. You need to reduce by 0.8 hours to reach Gold."
- **Content Accuracy tooltip:** "96% = 2,733 positive ratings / 2,847 total rated answers. Ratings collected via thumbs up/down on AI responses. Unrated answers excluded. Gold tier (current): ≥ 95%. Calculation window: rolling 90 days."
- **Questions Answered tooltip:** "2,847 total (all-time). This month: 312. Breakdown: 278 answered by AI (89%), 34 escalated to admin (11%). Gold tier threshold: 1,000+ total. Percentile based on all-time volume."
- **Visitor Engagement tooltip:** "1,240 unique visitors in last 90 days. De-duplicated by authenticated session or IP+fingerprint. Bot traffic excluded using Conveyor's detection model. Silver tier (current): 500–2,499. Gold threshold: 2,500+ visitors."
- **Content Freshness tooltip:** "Last update: 3 days ago. 0 expired documents (past validity date). 2 documents updated this week. Freshness score: 91/100. Gold tier (current): score ≥ 85 and 0 expired docs."
- **Update Frequency tooltip:** "8 updates this month. Counted: document uploads, KB additions, FAQ edits, gap resolutions. Gold tier (current): ≥ 4 updates/month. Rolling 30-day window."

**Why benchmarking works:** Admins are motivated by comparative performance — "fresher than 91% of Conveyor Trust Centers" is a much more powerful signal than "your content is recent." It also creates a network effect: the more TCs on Conveyor, the more meaningful the benchmarks become. This reinforces Conveyor's position as the independent TC network.

---

### Section 6: Activity Graph

A GitHub-style contribution heatmap showing Trust Center maintenance activity.

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  Trust Center Activity — Last 12 Months                          │
│                                                                  │
│  ░░▒▒▓▓██░░▒▒▓▓██░░▒▒▓▓██░░▒▒▓▓██░░▒▒▓▓██░░▒▒▓▓██             │
│  ░░░░▒▒▓▓░░░░▒▒▓▓░░░░▒▒▓▓░░░░▒▒▓▓░░░░▒▒▓▓░░░░▒▒▓▓             │
│  ░░░░░░▒▒░░░░░░▒▒░░░░░░▒▒░░░░░░▒▒░░░░░░▒▒░░░░░░▒▒             │
│  Apr  May  Jun  Jul  Aug  Sep  Oct  Nov  Dec  Jan  Feb  Mar      │
│                                                                  │
│  [░ None] [▒ Low] [▓ Medium] [█ High]                            │
│                                                                  │
│  Hover: "5 updates on March 15, 2026"                            │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**52-week heatmap** — Same pattern as the prototype's contribution graph. Each cell represents a day, colored by activity level (document updates, KB additions, gap responses). On hover, show the specific activity count and date.

**Color scale** — Uses the Conveyor Green palette: `bg-surface` (none) → `green-900` (low) → `green-700` (medium) → `green-500` (high) → `green-400` (very high).

**What it signals to visitors:** This TC is actively maintained. The visual pattern is immediately recognizable (from GitHub) and communicates health at a glance. Admins who see sparse activity are motivated to fill in the gaps.

**Tooltip Spec — Activity Graph:**
- **Cell hover tooltip:** "March 15, 2026: 5 updates — 2 document uploads, 1 KB article added, 1 FAQ edited, 1 gap resolved."
- **Legend tooltip:** "Activity levels: None (0 updates), Low (1–2), Medium (3–5), High (6+). Counted actions: document uploads, KB additions, FAQ edits, gap resolutions, certification uploads."

---

### Section 7: Additional Analytics Dashboard

A dense analytics section that maximizes the data-backed nature of the Scorecard. Designed for visitors who want deep evidence and admins who want operational metrics.

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  Analytics Deep Dive                                             │
│                                                                  │
│  ┌─ Visitor Satisfaction ──────────────────────────────────────┐ │
│  │                                                              │ │
│  │  Coco Satisfaction Score: 4.2 / 5.0  ⓘ                      │ │
│  │  ████████████████████████████████████████░░░░░░░░            │ │
│  │  Based on 1,847 rated interactions                           │ │
│  │                                                              │ │
│  │  Helpful: 72%  ·  Partially helpful: 19%  ·  Not: 9%        │ │
│  │                                                              │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─ Question Resolution ───────────────────────────────────────┐ │
│  │                                                              │ │
│  │  First-Contact Resolution: 89%  ⓘ                            │ │
│  │  Avg. Conversation Length: 2.3 messages  ⓘ                   │ │
│  │  Escalation Rate: 11%  ⓘ                                    │ │
│  │  Avg. Time to First Response: 1.2s (AI) / 1.8hr (admin)  ⓘ │ │
│  │                                                              │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─ Document Engagement ───────────────────────────────────────┐ │
│  │                                                              │ │
│  │  Most Viewed Documents (30 days):                            │ │
│  │  1. SOC 2 Type II Report (2026)         487 views  ⓘ        │ │
│  │  2. Security Whitepaper                 312 views            │ │
│  │  3. Sub-processor List                  289 views            │ │
│  │  4. Penetration Test Summary            201 views            │ │
│  │  5. Data Processing Agreement           178 views            │ │
│  │                                                              │ │
│  │  Total Document Downloads: 1,847 (30 days)                   │ │
│  │  Unique Downloaders: 412                                     │ │
│  │                                                              │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─ Visitor Behavior ──────────────────────────────────────────┐ │
│  │                                                              │ │
│  │  Avg. Session Duration: 4.7 min  ⓘ                          │ │
│  │  Pages per Session: 3.2                                      │ │
│  │  Return Visitor Rate: 34%  ⓘ                                │ │
│  │  Bounce Rate: 18%  ⓘ                                        │ │
│  │                                                              │ │
│  │  Top Entry Points:                                           │ │
│  │  Direct link: 52%  ·  Search: 28%  ·  Referral: 20%         │ │
│  │                                                              │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Tooltip Spec — Analytics Deep Dive:**
- **Coco Satisfaction tooltip:** "4.2/5.0 average across 1,847 rated interactions. Ratings collected after each Coco conversation via 1–5 star prompt. Only includes interactions where the visitor rated. 72% rated 4–5 stars (helpful), 19% rated 3 stars (partially helpful), 9% rated 1–2 stars (not helpful)."
- **First-Contact Resolution tooltip:** "89% of questions resolved in a single Coco conversation without escalation or follow-up. A question is 'resolved' when the visitor doesn't return with a related question within 7 days."
- **Avg. Conversation Length tooltip:** "2.3 messages average per conversation. Includes visitor messages and Coco responses. Lower is better — indicates Coco answers effectively in fewer turns."
- **Escalation Rate tooltip:** "11% of questions escalated from AI to human admin. Triggers: visitor requests human, Coco confidence < 60%, or topic is flagged as admin-only."
- **Document views tooltip:** "487 views of SOC 2 Type II Report in the last 30 days by 298 unique visitors. 201 downloads. Average time spent viewing: 3.2 minutes."
- **Avg. Session Duration tooltip:** "4.7 minutes average across 1,240 unique sessions (90 days). Median: 3.1 minutes. Calculated from first page load to last interaction."
- **Return Visitor Rate tooltip:** "34% of visitors in the last 90 days have visited this TC more than once. Average return visits: 2.8 per returning visitor. Indicates ongoing security review or multi-stage evaluation."
- **Bounce Rate tooltip:** "18% of visitors leave after viewing only one page. Lower is better. Network average: 31%. This TC's low bounce rate suggests visitors find the content relevant and navigate deeper."

---

## Dual Audience Design

The Scorecard serves two audiences simultaneously:

**For Visitors:**
- Instant confidence assessment ("Is this vendor's documentation good enough for my review?")
- Transparency about gaps ("What's missing, and is the admin working on it?")
- Ability to influence what gets prioritized (upvote/downvote)
- Benchmarks that validate quality ("Faster than 78% of Trust Centers")
- Side-by-side vendor comparison through Coco for multi-vendor evaluations
- Tooltip transparency — every number is explainable, defensible, and shareable with their team
- Deep analytics that serve as evidence for internal security review sign-off

**For Admins (same data, different framing):**
- A health dashboard for their TC ("Where should I invest effort?")
- A prioritized backlog driven by real visitor demand (gap votes with upvote/downvote signals)
- Competitive motivation through benchmarks ("How do I get to Gold?")
- A narrative for internal stakeholders ("Our Trust Center scores 82/100 and is fresher than 91% of the network")
- Operational analytics (satisfaction scores, resolution rates, document engagement) for QBR reporting
- Visibility into how visitors are comparing them to competitors (anonymized comparison volume)

---

## Relationship to the Trust Center Page

The Scorecard is a **companion page**, not a replacement for any TC section. The Trust Center page is for *browsing and consuming content*. The Scorecard is for *evaluating the quality of that content*.

Navigation between them:
- Trust Center footer → "View Trust Scorecard →"
- Trust Scorecard header → "← Back to Trust Center"
- Coco can reference scorecard data in chat: "This TC scores 82/100 and can pre-fill 92% of a SIG Lite"
- Content Gaps link to relevant TC sections (e.g., a gap about "EU data residency" links to the Data Privacy category in the KB)
- Compare button on Scorecard routes to Coco sidebar for intelligent cross-TC analysis
- Cross-TC links: if a visitor compares Acme vs. Globex, Coco provides links to visit Globex's Trust Center directly

---

## Implementation Priority

| Priority | Section | Rationale |
|---|---|---|
| 1 | Trust Score Overview + Tooltips | The headline — instant value. Tooltips are day-one because they establish the "data-backed" credibility of every number on the page |
| 2 | How This TC Compares | The confidence builder — real benchmarked data analytics |
| 3 | Content Gaps + Upvote/Downvote | The differentiator — no competitor has this. Downvote adds quality signal |
| 4 | Compare Scorecards (Coco) | The network effect play — makes Conveyor the hub for multi-vendor evaluation |
| 5 | Achievements | Motivates admins, validates quality for visitors |
| 6 | Analytics Deep Dive | Maximizes data density for evidence-oriented visitors and admin reporting |
| 7 | Category Breakdown + Framework Coverage | Detail layer for deep reviews, enables questionnaire pre-fill story |
| 8 | Activity Graph | Visual health signal, low effort to implement |

---

*See also: `trust-center-page-plan.md` for the companion Trust Center page plan.*
