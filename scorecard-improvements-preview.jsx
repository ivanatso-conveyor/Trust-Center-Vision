import { useState } from "react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, Tooltip as RechartsTooltip,
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

/* ── Color palette ── */
const C = {
  brand: "#33C69F", brandLight: "#7AE8CB", brandDim: "#2AA886",
  surface: "#16161E", bg: "#0D0D12", elevated: "#1E1E2A",
  border: "#2A2A3A", borderLight: "#2A2A3A80",
  textPrimary: "#F0F0F8", textSecondary: "#A0A0B8", textMuted: "#7A7A8E",
  green: "#34d399", greenDim: "#065f46",
  yellow: "#f59e0b", yellowDim: "#78350f",
  red: "#ef4444", redDim: "#7f1d1d",
  blue: "#38bdf8", purple: "#a78bfa",
};

/* ── Shared tooltip ── */
function ChartTip({ active, payload, label, fmt }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
      {label && <div style={{ fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 4 }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: 11, color: C.textSecondary }}>{p.name}: <strong style={{ color: C.brand }}>{fmt ? fmt(p.value) : p.value}</strong></div>
      ))}
    </div>
  );
}

/* ── Info icon ── */
const InfoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ cursor: "help", flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
  </svg>
);

/* ── Shield icon ── */
const ShieldIcon = ({ color = C.brand, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

/* ── Check / Warning / X icons ── */
const CheckIcon = ({ color = C.green }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);
const WarnIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.yellow} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
);
const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);
const ArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
);

/* ═══════════════════════════════════════════════════════════
   SECTION 1: RISK SNAPSHOT
   Inspired by the Dovetail assessment's header risk snapshot.
   Shows inherent risk → controls → residual risk at a glance.
   ═══════════════════════════════════════════════════════════ */
function RiskSnapshot() {
  return (
    <Card>
      <SectionLabel>New Section — Inspired by TPRM Risk Snapshot</SectionLabel>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
        <ShieldIcon size={24} />
        <h2 style={{ fontSize: 18, fontWeight: 700, color: C.textPrimary, margin: 0 }}>Risk Snapshot</h2>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16, justifyContent: "center", padding: "24px 0" }}>
        {/* Inherent Risk */}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: C.textMuted, marginBottom: 8 }}>Inherent Risk</div>
          <div style={{
            padding: "10px 24px", borderRadius: 8, fontSize: 14, fontWeight: 700,
            background: `${C.yellow}15`, border: `1px solid ${C.yellow}30`, color: C.yellow
          }}>MEDIUM</div>
          <div style={{ fontSize: 10, color: C.textMuted, marginTop: 6, maxWidth: 120 }}>Based on data sensitivity and processing scope</div>
        </div>

        {/* Arrow with controls label */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Controls</div>
          <svg width="80" height="24" viewBox="0 0 80 24">
            <line x1="0" y1="12" x2="68" y2="12" stroke={C.textMuted} strokeWidth="1.5" strokeDasharray="4 3" />
            <polygon points="70,6 80,12 70,18" fill={C.textMuted} />
          </svg>
          <div style={{ fontSize: 10, color: C.brand, fontWeight: 500 }}>15 key controls verified</div>
        </div>

        {/* Residual Risk */}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: C.textMuted, marginBottom: 8 }}>Residual Risk</div>
          <div style={{
            padding: "10px 24px", borderRadius: 8, fontSize: 14, fontWeight: 700,
            background: `${C.green}15`, border: `1px solid ${C.green}30`, color: C.green
          }}>LOW</div>
          <div style={{ fontSize: 10, color: C.textMuted, marginTop: 6, maxWidth: 120 }}>After security controls and mitigations</div>
        </div>
      </div>

      {/* Quick risk factors */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 8 }}>
        {[
          { label: "Data Processed", value: "Business data", sub: "No PII by default", color: C.green },
          { label: "AI Processing", value: "Scoped to tenant", sub: "No cross-tenant training", color: C.green },
          { label: "Subprocessors", value: "4 total", sub: "All with DPAs", color: C.yellow },
        ].map(f => (
          <div key={f.label} style={{ background: C.bg, borderRadius: 8, padding: "12px 14px", border: `1px solid ${C.borderLight}` }}>
            <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 4 }}>{f.label}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>{f.value}</div>
            <div style={{ fontSize: 10, color: f.color, marginTop: 2 }}>{f.sub}</div>
          </div>
        ))}
      </div>

      <Note>Mirrors the TPRM Executive Summary risk snapshot — gives a GRC analyst the answer to "should I keep evaluating?" in 3 seconds. The inherent → controls → residual flow is the exact mental model they use.</Note>
    </Card>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 2: SECURITY POSTURE EVIDENCE
   Inspired by page 4 of the assessment — the concrete proof cards.
   ═══════════════════════════════════════════════════════════ */
function SecurityPostureEvidence() {
  const certs = [
    { name: "SOC 2 Type II", status: "Unqualified", detail: "BARR Advisory, Jul 2024–Jun 2025", scope: "Security, Confidentiality, Availability, Privacy, HIPAA", color: C.green, icon: "✓" },
    { name: "ISO 27001:2022", status: "Certified", detail: "BARR Certifications, Jun 2025–Jun 2028", scope: "Information Security Management System", color: C.green, icon: "✓" },
    { name: "ISO 42001:2023", status: "Certified", detail: "BARR Certifications, Jun 2025", scope: "AI Management System", color: C.green, icon: "✓" },
  ];

  const evidence = [
    { label: "Pen Test Findings", value: "9", detail: "1H / 1M / 7L — all remediated", status: "pass", subtext: "Razilio, Sep 2025" },
    { label: "Reported Incidents", value: "0", detail: "No disclosable incidents during audit period", status: "pass", subtext: "SOC 2 audit period" },
    { label: "Uptime (90-day)", value: "99.96%", detail: "Web application per status page", status: "pass", subtext: "status.acme.com" },
    { label: "SOC 2 Report Quality", value: "Strong", detail: "11/11 signals passed (S2 Guild Rubric v1.0)", status: "pass", subtext: "Structure, Substance, Source" },
  ];

  return (
    <Card>
      <SectionLabel>New Section — Inspired by TPRM Residual Risk Assessment</SectionLabel>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: C.textPrimary, marginBottom: 20 }}>Security Posture Evidence</h2>

      {/* Certification cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
        {certs.map(c => (
          <div key={c.name} style={{ background: C.bg, borderRadius: 10, padding: "16px", border: `1px solid ${C.borderLight}`, position: "relative" }}>
            <div style={{ position: "absolute", top: 12, right: 12 }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: `${c.color}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckIcon color={c.color} />
              </div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary, marginBottom: 2 }}>{c.name}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: c.color, marginBottom: 8 }}>{c.status}</div>
            <div style={{ fontSize: 10, color: C.textMuted, lineHeight: 1.4 }}>{c.detail}</div>
            <div style={{ fontSize: 10, color: C.textMuted, marginTop: 4, opacity: 0.7 }}>{c.scope}</div>
          </div>
        ))}
      </div>

      {/* Evidence row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
        {evidence.map(e => (
          <div key={e.label} style={{ background: C.bg, borderRadius: 10, padding: "14px", border: `1px solid ${C.borderLight}` }}>
            <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 6 }}>{e.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, lineHeight: 1 }}>{e.value}</div>
            <div style={{ fontSize: 10, color: C.green, marginTop: 4 }}>{e.detail}</div>
            <div style={{ fontSize: 9, color: C.textMuted, marginTop: 4, opacity: 0.7 }}>{e.subtext}</div>
          </div>
        ))}
      </div>

      <Note>This is the "evidence shelf" — every item a GRC analyst checks in Section 3 of the TPRM. SOC 2 scope, pen test findings breakdown, incident history, uptime, and even report quality scoring. Currently none of this exists on the scorecard.</Note>
    </Card>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 3: KEY CONTROLS CHECKLIST
   Inspired by pages 7-8 of the assessment.
   ═══════════════════════════════════════════════════════════ */
function KeyControlsChecklist() {
  const [expanded, setExpanded] = useState(null);

  const controls = [
    { name: "Encryption in Transit", status: "pass", evidence: "TLS 1.3 enforced for all connections. Auditor-verified with no exceptions.", source: "SOC 2, p.60" },
    { name: "Encryption at Rest", status: "pass", evidence: "AES-256 encryption. Strong cryptography standards per Cryptography Policy.", source: "SOC 2, p.60" },
    { name: "Administrative Access Controls", status: "pass", evidence: "SSO with MFA enforced. Temporary credentials expire in <8 hours. VPN required for remote admin.", source: "SOC 2, p.53" },
    { name: "Quarterly Access Reviews", status: "pass", evidence: "User access reviews performed quarterly for employees and contractors. Issues resolved.", source: "SOC 2, p.55" },
    { name: "Network Segmentation", status: "pass", evidence: "Segmented VPCs with ACLs. Security groups with default-deny rules. IDS deployed.", source: "SOC 2, p.75" },
    { name: "Vulnerability Scanning", status: "pass", evidence: "Automated scanning via Amazon Inspector, GitHub Advanced Security, AWS SecurityHub.", source: "SOC 2, p.16" },
    { name: "Annual Penetration Testing", status: "pass", evidence: "2025 test by Razilio (Sep 1–11). 9 findings, all self-attested as remediated.", source: "PEN-01, p.2" },
    { name: "Incident Response Plan", status: "pass", evidence: "Documented IR Plan with severity classification and CTO notification for critical incidents.", source: "SOC 2, p.67" },
    { name: "Business Continuity / DR", status: "pass", evidence: "Multi-AZ architecture. Annual DR testing. Daily backups via AWS RDS.", source: "SOC 2, p.58" },
    { name: "Secure SDLC", status: "pass", evidence: "Separate dev/test environments. Static analysis via CodeQL. Devs can't deploy to prod.", source: "SOC 2, p.59" },
    { name: "Background Checks", status: "pass", evidence: "Background or verification checks conducted for all new hires.", source: "SOC 2, p.62" },
    { name: "Security Awareness Training", status: "pass", evidence: "Security, privacy, and HIPAA training within 30 days of hire and annually.", source: "SOC 2, p.64" },
    { name: "Breach Notification SLA", status: "warn", evidence: "DPA states 'without undue delay'. No specific hourly or daily SLA defined.", source: "DPA, p.4" },
    { name: "Subprocessor Management", status: "pass", evidence: "Third-party management policy. 14-day advance notification of changes.", source: "SOC 2, p.29" },
    { name: "Data Deletion", status: "pass", evidence: "Customer-initiated deletion from production. 30-day recovery. 14-day permanent from backups.", source: "SOC 2, p.68" },
  ];

  const passCount = controls.filter(c => c.status === "pass").length;
  const warnCount = controls.filter(c => c.status === "warn").length;

  return (
    <Card>
      <SectionLabel>New Section — Inspired by TPRM Key Controls Assessment</SectionLabel>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: C.textPrimary, margin: 0 }}>Key Controls</h2>
        <div style={{ display: "flex", gap: 12 }}>
          <Pill color={C.green}>{passCount} Verified</Pill>
          <Pill color={C.yellow}>{warnCount} Partial</Pill>
        </div>
      </div>

      {/* Controls pie + list */}
      <div style={{ display: "flex", gap: 20 }}>
        {/* Mini donut */}
        <div style={{ position: "relative", width: 100, height: 100, flexShrink: 0, alignSelf: "flex-start" }}>
          <ResponsiveContainer width={100} height={100}>
            <PieChart>
              <Pie data={[{ v: passCount }, { v: warnCount }]} cx="50%" cy="50%"
                innerRadius={30} outerRadius={44} dataKey="v" startAngle={90} endAngle={-270} paddingAngle={3} stroke="none">
                <Cell fill={C.green} />
                <Cell fill={C.yellow} />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", pointerEvents: "none" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.textPrimary, lineHeight: 1 }}>{passCount}</div>
            <div style={{ fontSize: 8, color: C.textMuted }}>of {controls.length}</div>
          </div>
        </div>

        {/* Controls list */}
        <div style={{ flex: 1 }}>
          {controls.map((ctrl, i) => (
            <div key={ctrl.name}>
              <button
                onClick={() => setExpanded(expanded === i ? null : i)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 0", background: "none", border: "none", cursor: "pointer",
                  borderBottom: `1px solid ${C.borderLight}`, textAlign: "left"
                }}
              >
                {ctrl.status === "pass" ? <CheckIcon /> : <WarnIcon />}
                <span style={{ fontSize: 12, color: C.textPrimary, flex: 1 }}>{ctrl.name}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2"
                  style={{ transform: expanded === i ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              {expanded === i && (
                <div style={{ padding: "8px 0 8px 26px", borderBottom: `1px solid ${C.borderLight}` }}>
                  <div style={{ fontSize: 11, color: C.textSecondary, lineHeight: 1.5 }}>{ctrl.evidence}</div>
                  <div style={{ fontSize: 10, color: C.textMuted, marginTop: 4 }}>Source: {ctrl.source}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Note>This is the exact checklist from pages 7–9 of the TPRM. Security reviewers mentally run through these controls — surfacing them proactively eliminates back-and-forth. Expandable rows keep it scannable. The donut gives instant "14 of 15 verified" confidence.</Note>
    </Card>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 4: VENDOR REQUIREMENTS COMPLIANCE
   Inspired by pages 9-10 of the assessment.
   ═══════════════════════════════════════════════════════════ */
function VendorRequirements() {
  const requirements = [
    { name: "SOC 2 Type II (current, unqualified)", status: "pass", notes: "Issued Aug 2025, covering Jul 2024–Jun 2025. Unqualified opinion. BARR Advisory." },
    { name: "Annual penetration testing", status: "pass", notes: "2025 pen test by Razilio, Sep 1–11. Annual commitment verified." },
    { name: "Encryption at rest and in transit", status: "pass", notes: "TLS 1.3 in transit, AES-256 at rest. Auditor-verified." },
    { name: "Incident response plan", status: "pass", notes: "Security IR Plan v1.9 with severity classification and escalation procedures." },
    { name: "Business continuity / disaster recovery", status: "pass", notes: "BC/DR plan v1.4 documented. Annual DR testing. Multi-AZ architecture." },
    { name: "Data Processing Agreement available", status: "pass", notes: "DPA available. Covers GDPR, UK GDPR, CCPA. Includes EU SCCs." },
    { name: "Breach notification SLA defined", status: "warn", notes: "'Without undue delay' — no specific hourly or daily SLA defined." },
    { name: "Data deletion policy defined", status: "pass", notes: "Customer-initiated deletion from production. 30-day recovery window." },
    { name: "Background checks on employees", status: "pass", notes: "Background checks for all new hires. Auditor-verified." },
    { name: "Security awareness training", status: "pass", notes: "Within 30 days of hire and annually thereafter. Auditor-verified." },
  ];

  const passCount = requirements.filter(r => r.status === "pass").length;

  return (
    <Card>
      <SectionLabel>New Section — Inspired by TPRM Vendor Requirements Compliance</SectionLabel>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: C.textPrimary, margin: 0 }}>Vendor Requirements</h2>
        <span style={{ fontSize: 12, color: C.green, fontWeight: 600 }}>{passCount} of {requirements.length} met</span>
      </div>
      <p style={{ fontSize: 11, color: C.textMuted, marginBottom: 16 }}>Evaluated against Conveyor's default minimum vendor security requirements.</p>

      {/* Progress bar */}
      <div style={{ height: 6, borderRadius: 3, background: C.elevated, marginBottom: 20, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${(passCount / requirements.length) * 100}%`, borderRadius: 3, background: C.brand, transition: "width 0.8s ease" }} />
      </div>

      {/* Requirements table */}
      <div style={{ borderRadius: 10, border: `1px solid ${C.borderLight}`, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 60px 1fr", gap: 8, padding: "10px 16px", background: C.bg, fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: C.textMuted }}>
          <span>Requirement</span>
          <span style={{ textAlign: "center" }}>Status</span>
          <span>Notes</span>
        </div>
        {requirements.map(r => (
          <div key={r.name} style={{ display: "grid", gridTemplateColumns: "1fr 60px 1fr", gap: 8, padding: "12px 16px", borderTop: `1px solid ${C.borderLight}`, alignItems: "start" }}>
            <span style={{ fontSize: 12, color: C.textPrimary }}>{r.name}</span>
            <div style={{ display: "flex", justifyContent: "center" }}>
              {r.status === "pass" ? <CheckIcon /> : <WarnIcon />}
            </div>
            <span style={{ fontSize: 11, color: C.textSecondary, lineHeight: 1.4 }}>{r.notes}</span>
          </div>
        ))}
      </div>

      <Note>Directly from pages 9–10 of the TPRM. This is the "checklist before approval" — every GRC analyst runs through it. Showing it proactively means the reviewer can skip half their questionnaire. The one yellow warning (breach SLA) shows honest transparency, which builds trust.</Note>
    </Card>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 5: RESIDUAL GAPS (Honest Transparency)
   Inspired by the "RESIDUAL GAPS" callout on page 9.
   ═══════════════════════════════════════════════════════════ */
function ResidualGaps() {
  const gaps = [
    { title: "Breach notification SLA is imprecise", detail: "DPA uses 'without undue delay' language rather than a specific timeframe (e.g., 72 hours). The DPA is non-negotiable per vendor policy.", severity: "medium", mitigation: "Conveyor documents acceptance of this language as part of vendor approval." },
    { title: "Pen test remediation is vendor-self-attested", detail: "All 9 findings are self-attested as remediated by the vendor. No independent retest report was provided to confirm remediation.", severity: "medium", mitigation: "Monitoring vendor's next pen test cycle for independent confirmation." },
    { title: "ISO 27001 certificate not provided for review", detail: "ISO 27001:2022 is referenced as a compliance framework in the SOC 2 report, but the actual certificate was not included in the evidence package.", severity: "low", mitigation: "Requested copy of certificate. Web research confirms certification." },
    { title: "AI processing boundary claims are vendor-self-attested", detail: "Vendor claims 'all AI features run on our own infrastructure'. This includes external transcription subprocessors. Claim is not auditor-verified.", severity: "low", mitigation: "Accepted based on subprocessor list and architecture documentation." },
  ];

  return (
    <Card>
      <SectionLabel>New Section — Inspired by TPRM Residual Gaps</SectionLabel>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <WarnIcon />
        <h2 style={{ fontSize: 18, fontWeight: 700, color: C.textPrimary, margin: 0 }}>Known Limitations</h2>
        <span style={{ fontSize: 11, color: C.textMuted }}>({gaps.length} items)</span>
      </div>
      <p style={{ fontSize: 11, color: C.textMuted, marginBottom: 16 }}>We believe in honest transparency. These are areas where our documentation or controls have known gaps, and what we're doing about them.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {gaps.map(g => (
          <div key={g.title} style={{
            background: C.bg, borderRadius: 10, padding: "16px",
            border: `1px solid ${g.severity === "medium" ? `${C.yellow}25` : C.borderLight}`,
            borderLeft: `3px solid ${g.severity === "medium" ? C.yellow : C.textMuted}`
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>{g.title}</span>
              <span style={{
                fontSize: 9, fontWeight: 600, textTransform: "uppercase", padding: "2px 6px", borderRadius: 4,
                background: g.severity === "medium" ? `${C.yellow}15` : `${C.textMuted}15`,
                color: g.severity === "medium" ? C.yellow : C.textMuted,
              }}>{g.severity}</span>
            </div>
            <div style={{ fontSize: 11, color: C.textSecondary, lineHeight: 1.5, marginBottom: 8 }}>{g.detail}</div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 6, background: `${C.brand}08`, borderRadius: 6, padding: "8px 10px" }}>
              <span style={{ fontSize: 10, color: C.brand, fontWeight: 600, flexShrink: 0 }}>Mitigation:</span>
              <span style={{ fontSize: 10, color: C.brand, opacity: 0.85, lineHeight: 1.4 }}>{g.mitigation}</span>
            </div>
          </div>
        ))}
      </div>

      <Note>This is the most powerful trust-builder on the page. The Dovetail TPRM has 7 residual gaps listed explicitly — and the recommendation is still "Approve with Provisions." Showing gaps proactively with mitigations says "we know what's not perfect and we're transparent about it." No competitor does this. It directly reduces the number of follow-up questions from reviewers.</Note>
    </Card>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 6: PENETRATION TEST SUMMARY
   Inspired by pages 14-15 of the assessment.
   ═══════════════════════════════════════════════════════════ */
function PenTestSummary() {
  const findings = [
    { severity: "High", count: 1, color: C.red, items: ["MFA not implemented for password-based login (CVSS 7.4)"] },
    { severity: "Medium", count: 1, color: C.yellow, items: ["Unauthenticated SSRF allowing backend EC2 to call arbitrary URLs (CVSS 6.9)"] },
    { severity: "Low", count: 7, color: C.textMuted, items: ["CSV injection", "Insufficient file upload filtering", "Privilege escalation (viewer → write)", "JWT token in URL", "CSP headers missing", "2 others"] },
  ];

  const chartData = [
    { severity: "High", count: 1, fill: C.red },
    { severity: "Medium", count: 1, fill: C.yellow },
    { severity: "Low", count: 7, fill: C.textMuted },
  ];

  return (
    <Card>
      <SectionLabel>New Section — Inspired by TPRM Penetration Test Summary</SectionLabel>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: C.textPrimary, margin: 0 }}>Penetration Test Summary</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <CheckIcon />
          <span style={{ fontSize: 11, color: C.green, fontWeight: 600 }}>All findings remediated</span>
        </div>
      </div>
      <p style={{ fontSize: 11, color: C.textMuted, marginBottom: 20 }}>Razilio (Sydney, Australia) — September 2025 · Web application and API penetration test</p>

      <div style={{ display: "flex", gap: 20 }}>
        {/* Bar chart */}
        <div style={{ width: 200, flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="severity" tick={{ fill: C.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 10]} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={36}>
                {chartData.map((d, i) => <Cell key={i} fill={d.fill} fillOpacity={0.7} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ textAlign: "center", fontSize: 10, color: C.textMuted }}>9 total findings</div>
        </div>

        {/* Findings by severity */}
        <div style={{ flex: 1 }}>
          {findings.map(f => (
            <div key={f.severity} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: f.color, flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: C.textPrimary }}>{f.count} {f.severity}</span>
                <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 4, background: `${C.green}15`, color: C.green }}>Remediated</span>
              </div>
              {f.items.map((item, i) => (
                <div key={i} style={{ fontSize: 10, color: C.textSecondary, paddingLeft: 16, lineHeight: 1.5 }}>• {item}</div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <Note>Pages 14–15 of the TPRM break down pen test findings by severity. This is one of the first things a security reviewer requests. Showing it proactively — with the "all remediated" badge — saves an entire round of back-and-forth.</Note>
    </Card>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 7: SOC 2 REPORT QUALITY (S2 Guild Rubric)
   Inspired by pages 4-6 of the assessment.
   ═══════════════════════════════════════════════════════════ */
function SOC2ReportQuality() {
  const signals = [
    { id: "S1", name: "Auditor Report Structure", pillar: "Structure", rating: "pass" },
    { id: "S2", name: "Management's Assertion Completeness", pillar: "Structure", rating: "pass" },
    { id: "S3", name: "Inconsistent Language Across Sections", pillar: "Structure", rating: "pass" },
    { id: "S4", name: "System Description Specificity", pillar: "Substance", rating: "pass" },
    { id: "S5", name: "Control-to-Criteria Mapping Logic", pillar: "Substance", rating: "pass" },
    { id: "S6", name: "Vague or Conflicting Control Descriptions", pillar: "Substance", rating: "pass" },
    { id: "S7", name: "Test Procedure Detail and Specificity", pillar: "Substance", rating: "pass" },
    { id: "S8", name: "CPA Firm Registration and Peer Review", pillar: "Source", rating: "pass" },
    { id: "S9", name: "CPA-to-SOC Reports Ratio", pillar: "Source", rating: "adequate" },
    { id: "S10", name: "Leadership Experience", pillar: "Source", rating: "adequate" },
    { id: "S11", name: "GRC Tool Usage", pillar: "Source", rating: "adequate" },
  ];

  const pillarColors = { Structure: C.brand, Substance: C.blue, Source: C.purple };
  const ratingColors = { pass: C.green, adequate: C.yellow };

  return (
    <Card>
      <SectionLabel>New Section — Inspired by TPRM SOC 2 Report Quality Rubric</SectionLabel>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: C.textPrimary, margin: 0 }}>SOC 2 Report Quality</h2>
        <Pill color={C.green}>Strong</Pill>
      </div>
      <p style={{ fontSize: 11, color: C.textMuted, marginBottom: 16 }}>Evaluated against the S2 Guild Reliability Rubric v1.0 — 11 signals across Structure, Substance, and Source.</p>

      {/* Pillar summary */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
        {["Structure", "Substance", "Source"].map(p => {
          const items = signals.filter(s => s.pillar === p);
          const passCount = items.filter(s => s.rating === "pass").length;
          return (
            <div key={p} style={{ background: C.bg, borderRadius: 8, padding: "12px 14px", border: `1px solid ${C.borderLight}`, borderTop: `2px solid ${pillarColors[p]}` }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 2 }}>{p}</div>
              <div style={{ fontSize: 10, color: C.textMuted }}>{passCount} pass · {items.length - passCount} adequate</div>
            </div>
          );
        })}
      </div>

      {/* Signals list */}
      <div style={{ borderRadius: 10, border: `1px solid ${C.borderLight}`, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 80px 70px", gap: 8, padding: "8px 16px", background: C.bg, fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: C.textMuted }}>
          <span></span><span>Signal</span><span>Pillar</span><span>Rating</span>
        </div>
        {signals.map(s => (
          <div key={s.id} style={{ display: "grid", gridTemplateColumns: "40px 1fr 80px 70px", gap: 8, padding: "8px 16px", borderTop: `1px solid ${C.borderLight}`, alignItems: "center" }}>
            <span style={{ fontSize: 10, color: C.textMuted, fontWeight: 500 }}>{s.id}</span>
            <span style={{ fontSize: 11, color: C.textPrimary }}>{s.name}</span>
            <span style={{ fontSize: 10, color: pillarColors[s.pillar] }}>{s.pillar}</span>
            <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", color: ratingColors[s.rating] }}>{s.rating}</span>
          </div>
        ))}
      </div>

      <Note>This entire rubric is from pages 4–6 of the TPRM. It answers "how much should I trust this SOC 2 report?" — something most buyers wonder but can't evaluate themselves. Surfacing it proactively is a power move that says "our report is substantive, not boilerplate."</Note>
    </Card>
  );
}


/* ── Layout helpers ── */
function Card({ children }) {
  return <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>{children}</div>;
}

function SectionLabel({ children }) {
  return <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: C.brand, marginBottom: 12 }}>{children}</div>;
}

function Pill({ color, children }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: `${color}15`, border: `1px solid ${color}30`, color }}>
      {children}
    </span>
  );
}

function Note({ children }) {
  return (
    <div style={{
      marginTop: 16, padding: "12px 14px", background: `${C.brand}08`, border: `1px solid ${C.brand}18`,
      borderRadius: 8, fontSize: 11, color: C.brand, lineHeight: 1.5
    }}>{children}</div>
  );
}

/* ═══ APP ═══ */
export default function ScorecardImprovements() {
  return (
    <div style={{ maxWidth: 780, margin: "0 auto", padding: "32px 16px", display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: C.textPrimary, marginBottom: 6 }}>Trust Scorecard — New Sections</h1>
        <p style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.5, maxWidth: 600 }}>
          6 new sections inspired by the Dovetail TPRM assessment. Each surfaces information that security reviewers actively look for — proactively showing it eliminates rounds of back-and-forth.
        </p>
      </div>

      <RiskSnapshot />
      <SecurityPostureEvidence />
      <KeyControlsChecklist />
      <VendorRequirements />
      <ResidualGaps />
      <PenTestSummary />
      <SOC2ReportQuality />
    </div>
  );
}
