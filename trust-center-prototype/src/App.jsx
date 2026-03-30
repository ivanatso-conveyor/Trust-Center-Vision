import { useState, useEffect, useRef, useMemo, useCallback, createContext, useContext } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Shield, Search, Sparkles, Check, Lock, ChevronDown,
  X, Send, Paperclip, Clock, Award, Eye, Download, Trash2, AlertTriangle,
  Flame, Globe, Users, MessageSquare, Zap, Star, Compass, Bug, ExternalLink,
  ShieldCheck, Bell, Settings, BookOpen, Building2, Bot, Home,
  Upload, Loader, CheckCircle2, Circle, ListTodo, Plus, Package,
  Quote, Bookmark, StickyNote, FolderDown, History, RotateCcw,
  Sun, Moon, Filter, Copy, Plug, ArrowRight, ArrowLeft, RefreshCw,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   THEME CONTEXT
   ═══════════════════════════════════════════════════════════════ */

const ThemeContext = createContext();
function useTheme() { return useContext(ThemeContext); }

const TcContext = createContext();
function useTc() { return useContext(TcContext); }

/* ═══════════════════════════════════════════════════════════════
   CART CONTEXT - shared across all views
   ═══════════════════════════════════════════════════════════════ */

const CartContext = createContext();

function useCart() {
  return useContext(CartContext);
}

// Review to-do steps that populate when a user starts a security review
const REVIEW_TODO_STEPS = [
  { id: "t1", label: "Gather compliance certifications", detail: "SOC 2 Type II report, ISO 27001 certificate", matchDocs: ["SOC 2 Type II Report", "ISO 27001 Certificate"] },
  { id: "t2", label: "Collect data processing agreements", detail: "DPA, subprocessor list, privacy policy", matchDocs: ["Data Processing Addendum", "Subprocessor List", "Privacy Policy v3.2"] },
  { id: "t3", label: "Review encryption and key management", detail: "AES-256 at rest, TLS 1.2+ in transit, AWS KMS" },
  { id: "t4", label: "Verify data residency and storage", detail: "Confirm AWS regions and data center locations" },
  { id: "t5", label: "Review access control and authentication", detail: "SSO, MFA, RBAC policies" },
  { id: "t6", label: "Check incident response procedures", detail: "IR plan, breach notification SLAs", matchDocs: ["Incident Response Plan"] },
  { id: "t7", label: "Review vendor and subprocessor management", detail: "Third-party risk assessment process", matchDocs: ["Subprocessor List"] },
  { id: "t8", label: "Compile findings and export report", detail: "Summary with document references" },
];

function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [sessions] = useState([
    { id: "s1", title: "CSA CAIQ - Current Review", date: "Yesterday", progress: 87 },
    { id: "s2", title: "SIG Lite for MediaCore", date: "3 days ago", progress: 100 },
  ]);
  const [todos, setTodos] = useState([]);
  const [panelTab, setPanelTab] = useState("todo");

  // Shared Coco agent state (visible across all views)
  const [cocoStatus, setCocoStatus] = useState("idle"); // idle | working | done
  const [cocoAnim, setCocoAnim] = useState("idle"); // maps to Coco component states
  const [cocoTaskLabel, setCocoTaskLabel] = useState("");
  const [cocoTasks, setCocoTasks] = useState([]); // { id, label, detail, status: pending|active|done }
  const [cocoNotification, setCocoNotification] = useState(null); // { message, timestamp }

  const setCocoState = useCallback((status, anim, label) => {
    if (status) setCocoStatus(status);
    if (anim) setCocoAnim(anim);
    if (label !== undefined) setCocoTaskLabel(label);
  }, []);

  const startCocoWork = useCallback((label, tasks) => {
    setCocoStatus("working");
    setCocoAnim("sorting");
    setCocoTaskLabel(label);
    setCocoTasks(tasks.map((t, i) => ({ ...t, status: i === 0 ? "active" : "pending" })));
    setCocoNotification(null);
  }, []);

  const updateCocoTask = useCallback((taskId, status) => {
    setCocoTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
  }, []);

  const finishCocoWork = useCallback((message) => {
    setCocoStatus("done");
    setCocoAnim("celebrating");
    setCocoTasks(prev => prev.map(t => ({ ...t, status: "done" })));
    setCocoNotification({ message, timestamp: Date.now() });
  }, []);

  // Dismiss notification only - Coco stays in "done" state
  const dismissCocoNotification = useCallback(() => {
    setCocoNotification(null);
  }, []);

  // Full reset - only when user has reviewed results (e.g. navigated back to chat)
  const resetCoco = useCallback(() => {
    setCocoStatus("idle");
    setCocoAnim("idle");
    setCocoTaskLabel("");
    setCocoTasks([]);
    setCocoNotification(null);
  }, []);

  // To-do completion notifications
  const [todoNotification, setTodoNotification] = useState(null); // { message, remaining }
  const [recentlyCompleted, setRecentlyCompleted] = useState(new Set());

  const addItem = useCallback((item) => {
    setItems(prev => {
      if (prev.some(i => i.title === item.title)) return prev;
      const docMatch = AVAILABLE_DOCS.find(d => d.name === item.title);
      const desc = item.desc || docMatch?.desc || "";
      return [{ ...item, desc, id: Date.now().toString(), addedAt: "Just now" }, ...prev];
    });
    // Check if this doc matches any pending to-do items
    setTodos(prev => {
      const matched = prev.filter(t => t.status === "pending" && t.matchDocs?.includes(item.title));
      if (matched.length > 0) {
        const updated = prev.map(t =>
          t.status === "pending" && t.matchDocs?.includes(item.title) ? { ...t, status: "done" } : t
        );
        const remaining = updated.filter(t => t.status === "pending").length;
        // Show notification
        setTodoNotification({ message: `Checked off: ${matched[0].label}`, remaining });
        setTimeout(() => setTodoNotification(null), 4000);
        // Track recently completed for highlight
        setRecentlyCompleted(s => {
          const next = new Set(s);
          matched.forEach(m => next.add(m.id));
          return next;
        });
        // Clear highlight after user has seen it
        setTimeout(() => {
          setRecentlyCompleted(s => {
            const next = new Set(s);
            matched.forEach(m => next.delete(m.id));
            return next;
          });
        }, 5000);
        return updated;
      }
      return prev;
    });
    setPanelTab("collection");
  }, []);

  const removeItem = useCallback((id) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const clearAll = useCallback(() => setItems([]), []);

  const isItemAdded = useCallback((title) => {
    return items.some(i => i.title === title);
  }, [items]);

  const startReviewTodos = useCallback(() => {
    setPanelTab("todo");
    setTodos([]);
    // Add items one by one with staggered delays
    REVIEW_TODO_STEPS.forEach((t, i) => {
      setTimeout(() => {
        setTodos(prev => [...prev, { ...t, status: "pending" }]);
      }, (i + 1) * 300);
    });
  }, []);

  const toggleTodo = useCallback((id) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, status: t.status === "done" ? "pending" : "done" } : t));
  }, []);

  const advanceTodos = useCallback((count) => {
    setTodos(prev => prev.map((t, i) => i < count ? { ...t, status: "done" } : t));
  }, []);

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, clearAll, isItemAdded, sessions, todos, startReviewTodos, toggleTodo, advanceTodos, panelTab, setPanelTab,
      cocoStatus, cocoAnim, cocoTaskLabel, cocoTasks, cocoNotification, setCocoState, startCocoWork, updateCocoTask, finishCocoWork, dismissCocoNotification, resetCoco,
      todoNotification, recentlyCompleted,
    }}>
      {children}
    </CartContext.Provider>
  );
}

/* ═══════════════════════════════════════════════════════════════
   UTILITIES
   ═══════════════════════════════════════════════════════════════ */

function seededRandom(seed) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

function generateContributionData(weeks, seed = 42) {
  const rng = seededRandom(seed);
  const data = [];
  for (let w = 0; w < weeks; w++) {
    const row = [];
    const weekWeight = 0.3 + (w / weeks) * 0.7;
    for (let d = 0; d < 7; d++) {
      const dayWeight = (d > 0 && d < 6) ? 1.2 : 0.4;
      const v = rng() * weekWeight * dayWeight;
      row.push(v < 0.25 ? 0 : v < 0.45 ? 1 : v < 0.65 ? 2 : v < 0.82 ? 3 : 4);
    }
    data.push(row);
  }
  return data;
}

// Contribution graph colors use CSS variables for brand theming
const CONTRIB_COLORS = [
  "var(--contrib-empty)",
  "var(--color-brand-900)",
  "var(--color-brand-700)",
  "var(--color-brand-500)",
  "var(--color-brand-400)",
];
const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function getMonthLabels(weeks) {
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - weeks * 7);
  const labels = [];
  let lastMonth = -1;
  for (let w = 0; w < weeks; w++) {
    const d = new Date(start);
    d.setDate(d.getDate() + w * 7);
    if (d.getMonth() !== lastMonth) {
      labels.push({ week: w, label: MONTHS_SHORT[d.getMonth()] });
      lastMonth = d.getMonth();
    }
  }
  return labels;
}

function getDateForCell(weeks, w, d) {
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - weeks * 7);
  const date = new Date(start);
  date.setDate(date.getDate() + w * 7 + d);
  return date;
}

/* ═══════════════════════════════════════════════════════════════
   COCO - Sort Coco, The Organizer
   Conveyor "C" logo shape with animated sorting eyes.
   Ported from standalone Coco.jsx.
   ═══════════════════════════════════════════════════════════════ */

const COCO_STATES = {
  idle:        { eyeAnimation: true,  sortFlash: true,  speed: "3s",   bodyOpacity: 1,    bounce: true },
  thinking:    { eyeAnimation: false, sortFlash: false, speed: "3s",   bodyOpacity: 0.75, bounce: false },
  sorting:     { eyeAnimation: true,  sortFlash: true,  speed: "1.5s", bodyOpacity: 1,    bounce: false },
  waving:      { eyeAnimation: false, sortFlash: false, speed: "3s",   bodyOpacity: 1,    bounce: true },
  celebrating: { eyeAnimation: false, sortFlash: false, speed: "3s",   bodyOpacity: 1,    bounce: false },
  sleeping:    { eyeAnimation: false, sortFlash: false, speed: "3s",   bodyOpacity: 0.6,  bounce: false },
};

// Single Coco palette using CSS variables - theme switching handled by CSS
const COCO_PALETTE = {
  topBar: "var(--coco-top)", spine: "var(--coco-spine)", midBar: "var(--coco-mid)", bottomBar: "var(--coco-bottom)",
  interior: "var(--coco-interior)", eyeL: "var(--coco-eye-l)", eyeR: "var(--coco-eye-r)", smile: "var(--coco-smile)",
  arm: "var(--coco-arm)", feet: "var(--coco-feet)", flash: "var(--coco-flash)", gold: "var(--coco-gold)",
  sleepEye: "var(--coco-sleep-eye)", sleepZ: "var(--coco-sleep-z)", celebEye: "var(--coco-smile)",
  particle1: "var(--coco-particle1)", particle2: "var(--coco-particle2)", particle3: "var(--coco-particle3)", dot: "var(--coco-dot)",
  smileOpacity: "var(--coco-smile-opacity)",
};

function Coco({ size = 48, state = "idle", className = "" }) {
  const p = COCO_PALETTE;
  const config = COCO_STATES[state] || COCO_STATES.idle;
  const dur = config.speed;

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        animation: config.bounce ? "cocoBounce 2.5s ease-in-out infinite" : "none",
        position: "relative",
      }}
      role="img"
      aria-label="Coco"
    >
      <style>{`
        @keyframes cocoBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        @keyframes cocoWaveArm { 0%,100%{transform:translateY(0)} 25%{transform:translateY(-1px)} 50%{transform:translateY(-2px)} 75%{transform:translateY(-1px)} }
        @keyframes cocoPulse { 0%,100%{opacity:0.3} 50%{opacity:1} }
        @keyframes cocoParticle1 { 0%{transform:translate(0,0);opacity:1} 100%{transform:translate(-3px,-4px);opacity:0} }
        @keyframes cocoParticle2 { 0%{transform:translate(0,0);opacity:1} 100%{transform:translate(3px,-3px);opacity:0} }
        @keyframes cocoParticle3 { 0%{transform:translate(0,0);opacity:1} 100%{transform:translate(4px,-5px);opacity:0} }
        @keyframes cocoZFloat { 0%{transform:translateY(0);opacity:0.6} 100%{transform:translateY(-8px);opacity:0} }
      `}</style>

      <svg width={size} height={size} viewBox="0 0 8 8" xmlns="http://www.w3.org/2000/svg"
        style={{ imageRendering: "pixelated", opacity: config.bodyOpacity }}>
        {/* C SHAPE BODY */}
        <rect x="2" y="0" width="4" height="1" fill={p.topBar} />
        <rect x="1" y="1" width="2" height="1" fill={p.spine} />
        <rect x="1" y="2" width="1" height="1" fill={p.spine} />
        <rect x="1" y="3" width="1" height="1" fill={p.spine} />
        <rect x="1" y="4" width="2" height="1" fill={p.midBar} />
        <rect x="2" y="5" width="4" height="1" fill={p.bottomBar} />
        <rect x="3" y="1" width="3" height="1" fill={p.midBar} />
        <rect x="3" y="4" width="3" height="1" fill={p.interior} opacity="0.3" />

        {/* EYES */}
        {state === "sleeping" ? (
          <>
            <rect x="3" y="2" width="1" height="1" fill={p.sleepEye} />
            <rect x="5" y="2" width="1" height="1" fill={p.sleepEye} />
          </>
        ) : state === "thinking" ? (
          <>
            <rect x="3" y="2" width="1" height="1" fill={p.eyeL}>
              <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" />
            </rect>
            <rect x="5" y="2" width="1" height="1" fill={p.eyeR}>
              <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" />
            </rect>
          </>
        ) : state === "celebrating" ? (
          <>
            <rect x="3" y="2" width="1" height="1" fill={p.celebEye} />
            <rect x="5" y="2" width="1" height="1" fill={p.celebEye} />
          </>
        ) : state === "waving" ? (
          <>
            <rect x="3" y="2" width="1" height="1" fill={p.eyeL} />
            <rect x="5" y="2" width="1" height="1" fill={p.eyeL} />
          </>
        ) : (
          <>
            <rect x="3" y="2" width="1" height="1" fill={p.eyeL}>
              <animate attributeName="x" values="3;3;2;2;3;3;4;4;3;3" dur={dur} repeatCount="indefinite" />
            </rect>
            <rect x="5" y="2" width="1" height="1" fill={p.eyeR}>
              <animate attributeName="x" values="5;5;4;4;5;5;6;6;5;5" dur={dur} repeatCount="indefinite" />
            </rect>
          </>
        )}

        {/* SMILE */}
        <rect x="1" y="3" width="1" height="1" fill={p.smile} opacity={state === "waving" ? 1 : p.smileOpacity} />

        {/* ARM */}
        {state === "waving" ? (
          <rect x="0" y="2" width="1" height="1" fill={p.arm}>
            <animate attributeName="y" values="2;1;0;1;2;2" dur="1.2s" repeatCount="indefinite" />
          </rect>
        ) : state === "celebrating" ? (
          <rect x="0" y="1" width="1" height="1" fill={p.arm} />
        ) : (
          <rect x="0" y="2" width="1" height="1" fill={p.arm} />
        )}

        {/* SORTING INDICATOR FLASHES */}
        {config.sortFlash && (
          <>
            <rect x="0" y="1" width="1" height="1" fill={p.flash} opacity="0">
              <animate attributeName="opacity" values="0;0;0.8;0.4;0;0;0;0;0;0" dur={dur} repeatCount="indefinite" />
            </rect>
            <rect x="7" y="1" width="1" height="1" fill={p.gold} opacity="0">
              <animate attributeName="opacity" values="0;0;0;0;0;0;0.8;0.4;0;0" dur={dur} repeatCount="indefinite" />
            </rect>
          </>
        )}

        {/* CELEBRATING FLASHES */}
        {state === "celebrating" && (
          <>
            <rect x="0" y="1" width="1" height="1" fill={p.flash}>
              <animate attributeName="opacity" values="0.8;0.3;0.8" dur="0.6s" repeatCount="indefinite" />
            </rect>
            <rect x="7" y="1" width="1" height="1" fill={p.gold}>
              <animate attributeName="opacity" values="0.8;0.3;0.8" dur="0.6s" repeatCount="indefinite" />
            </rect>
          </>
        )}

        {/* FEET */}
        <rect x="2" y="6" width="1" height="1" fill={p.feet} />
        <rect x="5" y="6" width="1" height="1" fill={p.feet} />
      </svg>

      {/* PARTICLES (celebrating) */}
      {state === "celebrating" && (
        <>
          <div style={{ position:"absolute", top:"10%", left:"20%", width:4, height:4, background:p.particle1, animation:"cocoParticle1 0.8s ease-out infinite" }} />
          <div style={{ position:"absolute", top:"15%", right:"20%", width:4, height:4, background:p.particle2, animation:"cocoParticle2 0.8s ease-out infinite 0.2s" }} />
          <div style={{ position:"absolute", top:"5%", right:"30%", width:3, height:3, background:p.particle3, animation:"cocoParticle3 0.8s ease-out infinite 0.4s" }} />
        </>
      )}

      {/* Z's (sleeping) */}
      {state === "sleeping" && (
        <>
          <div style={{ position:"absolute", top:"-10%", right:"15%", fontSize:size*0.2, color:p.sleepZ, fontFamily:"monospace", animation:"cocoZFloat 2s ease-out infinite" }}>z</div>
          <div style={{ position:"absolute", top:"-20%", right:"5%", fontSize:size*0.25, color:p.sleepZ, fontFamily:"monospace", animation:"cocoZFloat 2s ease-out infinite 0.7s" }}>z</div>
        </>
      )}

      {/* THINKING DOTS */}
      {state === "thinking" && (
        <div style={{ position:"absolute", bottom:"-15%", display:"flex", gap:2 }}>
          {[0, 0.3, 0.6].map((delay, i) => (
            <div key={i} style={{ width:size*0.06, height:size*0.06, borderRadius:"50%", background:p.dot, animation:`cocoPulse 1s ease-in-out infinite ${delay}s` }} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SHARED UI COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function ContributionGraph({ weeks = 12, cellSize = 10, gap = 2, seed = 42, label, showMonths = false, showLegend = false }) {
  const { dark } = useTheme();
  const colors = CONTRIB_COLORS;
  const data = useMemo(() => generateContributionData(weeks, seed), [weeks, seed]);
  const monthLabels = useMemo(() => showMonths ? getMonthLabels(weeks) : [], [weeks, showMonths]);
  const [tooltip, setTooltip] = useState(null);
  const totalW = weeks * (cellSize + gap);
  const totalH = 7 * (cellSize + gap);

  return (
    <div className="relative">
      {label && <p className="text-xs text-text-secondary mb-2 font-medium">{label}</p>}
      <div className="overflow-x-auto">
        {showMonths && (
          <div className="relative h-4 mb-1">
            {monthLabels.map((m, i) => <span key={i} className="absolute text-[10px] text-text-muted" style={{ left: m.week * (cellSize + gap) }}>{m.label}</span>)}
          </div>
        )}
        <svg width={totalW} height={totalH}>
          {data.map((week, w) => week.map((level, d) => (
            <motion.rect key={`${w}-${d}`} x={w * (cellSize + gap)} y={d * (cellSize + gap)} width={cellSize} height={cellSize} rx={2}
              fill={colors[level]} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: w * 0.005 + d * 0.002 }}
              style={{ cursor: "pointer" }}
              onMouseEnter={(e) => {
                const date = getDateForCell(weeks, w, d);
                const acts = level === 0 ? 0 : level + Math.floor(Math.random() * 3);
                setTooltip({ x: e.clientX, y: e.clientY, text: `${acts} activities on ${date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}` });
              }}
              onMouseLeave={() => setTooltip(null)} whileHover={{ scale: 1.3 }} />
          )))}
        </svg>
      </div>
      {showLegend && (
        <div className="flex items-center gap-1 mt-2 text-[10px] text-text-muted">
          <span>Less</span>
          {colors.map((c, i) => <div key={i} className="rounded-sm" style={{ width: cellSize, height: cellSize, background: c }} />)}
          <span>More</span>
        </div>
      )}
      {tooltip && (
        <div className="fixed z-50 px-2 py-1 text-xs rounded-lg bg-bg-elevated border border-border-bright text-text-primary shadow-xl pointer-events-none"
          style={{ left: tooltip.x + 10, top: tooltip.y - 30 }}>{tooltip.text}</div>
      )}
    </div>
  );
}

/**
 * AiSparkle - Tri-Twinkle pixel art AI icon
 * Three sparkles (large, medium, small) that twinkle in sequence.
 * Uses CSS variables for brand theming.
 */
function AiSparkle({ size = 16, animate = true, color = "brand" }) {
  const palette = color === "muted"
    ? { bright: "var(--color-text-muted)", mid: "var(--color-text-muted)", dim: "var(--color-border-bright)", flash: "var(--color-text-muted)" }
    : { bright: "var(--color-brand-300)", mid: "var(--color-brand-500)", dim: "var(--color-brand-600)", flash: "var(--color-brand-50)", med: "var(--color-brand-400)", dark: "var(--color-brand-700)" };

  return (
    <svg width={size} height={size} viewBox="0 0 7 7" xmlns="http://www.w3.org/2000/svg"
      style={{ imageRendering: "pixelated", display: "inline-block", verticalAlign: "middle" }}
      role="img" aria-label="AI sparkle icon">
      {/* Large sparkle (top-left) */}
      <rect x="2" y="2" width="1" height="1" fill={palette.bright}>
        {animate && <animate attributeName="fill" values={`${palette.bright};${palette.flash};${palette.bright};${palette.bright}`} dur="2.4s" repeatCount="indefinite" />}
      </rect>
      <rect x="2" y="1" width="1" height="1" fill={palette.mid}>
        {animate && <animate attributeName="opacity" values="0.8;1;0.3;0.8" dur="2.4s" repeatCount="indefinite" />}
      </rect>
      <rect x="1" y="2" width="1" height="1" fill={palette.mid}>
        {animate && <animate attributeName="opacity" values="0.8;1;0.3;0.8" dur="2.4s" repeatCount="indefinite" />}
      </rect>
      <rect x="3" y="2" width="1" height="1" fill={palette.mid}>
        {animate && <animate attributeName="opacity" values="0.8;1;0.3;0.8" dur="2.4s" repeatCount="indefinite" />}
      </rect>
      <rect x="2" y="3" width="1" height="1" fill={palette.mid}>
        {animate && <animate attributeName="opacity" values="0.8;1;0.3;0.8" dur="2.4s" repeatCount="indefinite" />}
      </rect>

      {/* Medium sparkle (right) */}
      <rect x="5" y="3" width="1" height="1" fill={palette.med || palette.mid}>
        {animate && <animate attributeName="fill" values={`${palette.med || palette.mid};${palette.med || palette.mid};${palette.flash};${palette.med || palette.mid}`} dur="2.4s" repeatCount="indefinite" />}
      </rect>
      <rect x="5" y="2" width="1" height="1" fill={palette.dim}>
        {animate && <animate attributeName="opacity" values="0.3;0.8;1;0.3" dur="2.4s" repeatCount="indefinite" />}
      </rect>
      <rect x="4" y="3" width="1" height="1" fill={palette.dim}>
        {animate && <animate attributeName="opacity" values="0.3;0.8;1;0.3" dur="2.4s" repeatCount="indefinite" />}
      </rect>
      <rect x="6" y="3" width="1" height="1" fill={palette.dim}>
        {animate && <animate attributeName="opacity" values="0.3;0.8;1;0.3" dur="2.4s" repeatCount="indefinite" />}
      </rect>
      <rect x="5" y="4" width="1" height="1" fill={palette.dim}>
        {animate && <animate attributeName="opacity" values="0.3;0.8;1;0.3" dur="2.4s" repeatCount="indefinite" />}
      </rect>

      {/* Small sparkle (bottom) */}
      <rect x="3" y="5" width="1" height="1" fill={palette.mid}>
        {animate && <animate attributeName="fill" values={`${palette.mid};${palette.mid};${palette.mid};${palette.flash}`} dur="2.4s" repeatCount="indefinite" />}
      </rect>
      <rect x="3" y="4" width="1" height="1" fill={palette.dark || palette.dim}>
        {animate && <animate attributeName="opacity" values="0.3;0.3;0.8;0.3" dur="2.4s" repeatCount="indefinite" />}
      </rect>
      <rect x="2" y="5" width="1" height="1" fill={palette.dark || palette.dim}>
        {animate && <animate attributeName="opacity" values="0.3;0.3;0.8;0.3" dur="2.4s" repeatCount="indefinite" />}
      </rect>
    </svg>
  );
}

/* Backward-compatible wrapper used in sidebar + chat input */
function PixelAIIcon({ size = 20, active = false }) {
  return <AiSparkle size={size} animate={active} color={active ? "brand" : "muted"} />;
}

function ProgressBar({ value, color = "var(--color-brand-500)", height = 6, className = "" }) {
  return (
    <div className={`w-full rounded-full overflow-hidden ${className}`} style={{ height, background: "var(--progress-track)" }}>
      <motion.div className="h-full rounded-full" style={{ background: color }}
        initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 1, ease: "easeOut" }} />
    </div>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center justify-between gap-3 py-2 cursor-pointer group">
      <span className="text-sm text-text-primary group-hover:text-brand-400 transition-colors">{label}</span>
      <button role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors ${checked ? "bg-brand-500" : "bg-border-bright"}`}>
        <motion.div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow"
          animate={{ left: checked ? 22 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} />
      </button>
    </label>
  );
}

// "Add to cart" button - stays in "Added" disabled state once added
function AddToCartButton({ item, label = "Add" }) {
  const { addItem, isItemAdded } = useCart();
  const added = isItemAdded(item.title);
  return (
    <button
      onClick={(e) => { e.stopPropagation(); if (!added) addItem(item); }}
      disabled={added}
      className={`flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded-md transition-all ${
        added
          ? "bg-brand-500/20 text-brand-400 border border-brand-500/30 cursor-default opacity-70"
          : "bg-bg-hover text-text-secondary border border-border-default hover:text-brand-400 hover:border-brand-600/40 cursor-pointer"
      }`}
      aria-label={added ? `${item.title} already in collection` : `Add ${item.title} to collection`}
    >
      {added ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
      {added ? "Added" : label}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════
   RIGHT PANEL: CART & TO-DO LIST (persistent across all views)
   ═══════════════════════════════════════════════════════════════ */

function CartPanel({ onNavigateToAgent }) {
  const { items, removeItem, clearAll, sessions, todos, toggleTodo, panelTab, setPanelTab, cocoStatus, cocoAnim, cocoTaskLabel, cocoTasks, cocoNotification, dismissCocoNotification, todoNotification, recentlyCompleted } = useCart();
  const activeTab = panelTab;
  const setActiveTab = setPanelTab;
  const cocoTasksDone = cocoTasks.filter(t => t.status === "done").length;
  const cocoTasksTotal = cocoTasks.length;

  const typeIcons = {
    document: <FileText className="w-3.5 h-3.5 text-brand-500" />,
    quote: <Quote className="w-3.5 h-3.5 text-yellow-500" />,
    reminder: <StickyNote className="w-3.5 h-3.5 text-blue-400" />,
    bookmark: <Bookmark className="w-3.5 h-3.5 text-purple-400" />,
  };

  const todoDoneCount = todos.filter(t => t.status === "done").length;

  // (tab switching is now handled by CartContext)

  const tabs = [
    { id: "todo", label: "To-Do", icon: <ListTodo className="w-3.5 h-3.5" />, count: todos.length > 0 ? `${todoDoneCount}/${todos.length}` : null },
    { id: "collection", label: "Collection", icon: <Package className="w-3.5 h-3.5" />, count: items.length || null },
    { id: "sessions", label: "Sessions", icon: <History className="w-3.5 h-3.5" />, count: sessions.length || null },
  ];

  return (
    <div className="w-[340px] bg-bg-surface/50 border-l border-border-default flex flex-col shrink-0 overflow-hidden">
      {/* Coco status bar - clickable to go to agent chat */}
      <button onClick={onNavigateToAgent}
        className={`w-full flex items-center gap-2.5 px-4 py-2.5 border-b transition-all text-left hover:bg-bg-hover/50 ${cocoStatus === "done" ? "border-brand-600/30 bg-brand-500/5" : "border-border-default"}`}>
        <Coco size={24} state={cocoAnim} />
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <span className="text-xs font-medium text-text-primary shrink-0">Coco</span>
          <span className="text-[10px] text-text-muted truncate">
            · {cocoStatus === "working" ? cocoTaskLabel || "Working..." : cocoStatus === "done" ? "Task complete - tap to review" : "Ready"}
          </span>
        </div>
        {cocoStatus === "working" && cocoTasksTotal > 0 && (
          <span className="text-[10px] font-medium text-brand-500 shrink-0">{Math.round((cocoTasksDone / cocoTasksTotal) * 100)}%</span>
        )}
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cocoStatus === "working" ? "bg-yellow-500 animate-pulse" : cocoStatus === "done" ? "bg-brand-500" : "bg-text-muted/30"}`} />
      </button>

      {/* Coco notification toast */}
      <AnimatePresence>
        {cocoNotification && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden">
            <div className="px-4 py-3 bg-brand-500/5 border-b border-brand-600/20">
              <div className="flex items-start gap-2.5">
                <Coco size={20} state="celebrating" className="shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-brand-400">{cocoNotification.message}</p>
                  <p className="text-[10px] text-text-muted mt-0.5">Click the Agent tab to review results</p>
                  <button onClick={dismissCocoNotification} className="text-[10px] text-text-muted hover:text-brand-400 mt-1 transition-colors">Dismiss</button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex border-b border-border-default">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors border-b-2 ${
              activeTab === tab.id ? "text-brand-500 border-brand-500" : "text-text-muted border-transparent hover:text-text-secondary"
            }`}>
            {tab.icon}
            {tab.label}
            {tab.count && (
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? "bg-brand-500/15 text-brand-500" : "bg-bg-hover text-text-muted"}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* To-do notification toast */}
      <AnimatePresence>
        {todoNotification && activeTab !== "todo" && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden">
            <button onClick={() => setPanelTab("todo")}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 bg-brand-500/5 border-b border-brand-600/20 text-left hover:bg-brand-500/10 transition-colors">
              <Coco size={20} state="celebrating" className="shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-brand-400 truncate">{todoNotification.message}</p>
                <p className="text-[10px] text-text-muted">{todoNotification.remaining} item{todoNotification.remaining !== 1 ? "s" : ""} remaining</p>
              </div>
              <AiSparkle size={14} animate color="brand" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === "todo" ? (
            <motion.div key="todo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-3">
              {/* Coco's Tasks section */}
              {cocoTasks.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Coco size={16} state={cocoAnim} />
                    <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wide">Coco's Tasks</span>
                    {cocoStatus === "working" && (
                      <span className="text-[10px] text-brand-500 font-medium ml-auto">{cocoTasksDone}/{cocoTasksTotal}</span>
                    )}
                  </div>
                  <div className="space-y-0.5 mb-2">
                    {cocoTasks.map((task, i) => (
                      <motion.div key={task.id}
                        initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                        className={`flex items-start gap-2.5 p-2 rounded-lg text-left ${task.status === "done" ? "opacity-50" : task.status === "active" ? "bg-brand-500/5" : ""}`}>
                        <div className="mt-0.5 shrink-0">
                          {task.status === "done" ? <CheckCircle2 className="w-3.5 h-3.5 text-brand-500" /> :
                           task.status === "active" ? <Loader className="w-3.5 h-3.5 text-brand-500 animate-spin" /> :
                           <Circle className="w-3.5 h-3.5 text-text-muted/40" />}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-[11px] font-medium ${task.status === "done" ? "text-text-muted line-through" : task.status === "active" ? "text-brand-400" : "text-text-secondary"}`}>
                            {task.label}
                          </p>
                          <p className="text-[10px] text-text-muted mt-0.5">{task.detail}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  {cocoStatus === "working" && (
                    <ProgressBar value={(cocoTasksDone / cocoTasksTotal) * 100} height={3} />
                  )}
                  <div className="border-b border-border-default mt-3" />
                </div>
              )}

              {todos.length === 0 && cocoTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ListTodo className="w-8 h-8 text-text-muted mb-3" />
                  <p className="text-sm text-text-secondary mb-1">No active review</p>
                  <p className="text-xs text-text-muted leading-relaxed">Start a questionnaire or interact with<br />the agent to see your review checklist</p>
                </div>
              ) : todos.length === 0 ? null : (
                <div>
                  {/* Progress header */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-text-primary">Review Progress</span>
                      <span className="text-[10px] text-brand-500 font-semibold">{Math.round((todoDoneCount / todos.length) * 100)}%</span>
                    </div>
                    <ProgressBar value={(todoDoneCount / todos.length) * 100} height={4} />
                  </div>
                  <div className="space-y-1">
                    {todos.map((todo, i) => {
                      const justCompleted = recentlyCompleted.has(todo.id);
                      return (
                      <motion.button
                        key={todo.id}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{
                          opacity: 1, x: 0,
                          backgroundColor: justCompleted ? ["rgba(var(--color-brand-500), 0.12)", "rgba(var(--color-brand-500), 0)"] : undefined,
                        }}
                        transition={justCompleted ? { backgroundColor: { duration: 2, ease: "easeOut" } } : { delay: i * 0.03 }}
                        onClick={() => toggleTodo(todo.id)}
                        className={`w-full flex items-start gap-2.5 p-2.5 rounded-lg text-left transition-all group ${
                          justCompleted ? "bg-brand-500/10" : todo.status === "done" ? "opacity-50 hover:opacity-70" : todo.status === "working" ? "bg-brand-500/5" : "hover:bg-bg-hover"
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {todo.status === "done"
                            ? <CheckCircle2 className="w-4 h-4 text-brand-500" />
                            : todo.status === "working"
                            ? <Loader className="w-4 h-4 text-brand-400 animate-spin" />
                            : <Circle className="w-4 h-4 text-text-muted group-hover:text-brand-400 transition-colors" />
                          }
                        </div>
                        <div className="min-w-0">
                          <p className={`text-xs font-medium ${todo.status === "done" ? "text-text-muted line-through" : todo.status === "working" ? "text-brand-400" : "text-text-primary"}`}>
                            {todo.label}
                          </p>
                          <p className="text-[10px] text-text-muted mt-0.5">{todo.detail}</p>
                        </div>
                      </motion.button>
                    ); })}
                  </div>
                </div>
              )}
            </motion.div>
          ) : activeTab === "collection" ? (
            <motion.div key="collection" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Package className="w-8 h-8 text-text-muted mb-3" />
                  <p className="text-sm text-text-secondary mb-1">Nothing here yet</p>
                  <p className="text-xs text-text-muted">Add documents, quotes, or reminders<br />from any page</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {items.map((item) => (
                    <motion.div key={item.id} layout initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 20 }}
                      className="group rounded-lg bg-bg-surface border border-border-default/50 hover:border-border-bright transition-colors overflow-hidden">
                      <div className="p-2.5">
                        {/* Header row: icon, title+badge, actions */}
                        <div className="flex items-center gap-1.5">
                          <div className="shrink-0">{typeIcons[item.type] || <FileText className="w-3.5 h-3.5 text-text-muted" />}</div>
                          <p className="text-xs font-medium text-text-primary truncate">{item.title}</p>
                          {item.subtitle && (() => {
                            const ft = item.subtitle.split("·")[0]?.trim();
                            return ft ? <span className="text-[9px] font-semibold px-1 py-0.5 rounded shrink-0 bg-bg-hover text-text-muted border border-border-default ml-0.5">{ft}</span> : null;
                          })()}
                          <div className="flex-1" />
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <button className="p-1 rounded hover:bg-bg-hover transition-colors" aria-label="View" title="View">
                              <Eye className="w-3 h-3 text-text-muted hover:text-brand-400" />
                            </button>
                            <button className="p-1 rounded hover:bg-bg-hover transition-colors" aria-label="Download" title="Download">
                              <Download className="w-3 h-3 text-text-muted hover:text-brand-400" />
                            </button>
                            <button onClick={() => removeItem(item.id)}
                              className="p-1 rounded hover:bg-bg-hover transition-colors" aria-label="Remove" title="Remove">
                              <X className="w-3 h-3 text-text-muted hover:text-red-400" />
                            </button>
                          </div>
                        </div>
                        {/* Description - full width below */}
                        {item.desc && <p className="text-[10px] text-text-muted mt-1.5 line-clamp-2 leading-relaxed">{item.desc}</p>}
                        {!item.desc && item.subtitle && <p className="text-[10px] text-text-muted truncate mt-1.5">{item.subtitle}</p>}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="sessions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-3 space-y-2">
              {sessions.map(session => (
                <button key={session.id}
                  className="w-full text-left p-3 rounded-lg bg-bg-surface border border-border-default/50 hover:border-brand-600/30 transition-colors group">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-medium text-text-primary group-hover:text-brand-400 transition-colors truncate">{session.title}</p>
                    <RotateCcw className="w-3 h-3 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-[10px] text-text-muted mb-2">{session.date}</p>
                  <ProgressBar value={session.progress} height={3} color={session.progress === 100 ? "var(--color-brand-500)" : "var(--color-brand-400)"} />
                  <p className="text-[10px] text-text-muted mt-1">{session.progress}% complete</p>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom actions */}
      {activeTab === "collection" && items.length > 0 && (
        <div className="p-3 border-t border-border-default space-y-2">
          <button className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-brand-500 text-bg-primary hover:bg-brand-400 transition-colors">
            <FolderDown className="w-3.5 h-3.5" /> Download All as ZIP
          </button>
          <button onClick={clearAll} className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-[10px] text-text-muted hover:text-red-400 transition-colors">
            <Trash2 className="w-3 h-3" /> Clear collection
          </button>
        </div>
      )}
      {activeTab === "todo" && todoDoneCount === todos.length && todos.length > 0 && (
        <div className="p-3 border-t border-border-default">
          <div className="bg-brand-500/5 rounded-lg p-3 border border-brand-600/20 text-center">
            <p className="text-xs font-medium text-brand-400">Review complete! 🎉</p>
            <p className="text-[10px] text-text-muted mt-1">All steps finished. Export your questionnaire.</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   VIEW: TRUST CENTER HOME
   ═══════════════════════════════════════════════════════════════ */

const PRODUCT_LINES = [
  "All Products", "Cloud Platform", "On-Prem Server", "API Gateway",
  "Data Analytics", "Mobile SDK", "IoT Edge", "Identity Manager",
];

function TrustCenterHome() {
  const tc = useTc();
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("All Products");
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setProductDropdownOpen(false); };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // ⌘K shortcut
  useEffect(() => {
    const handleKey = (e) => { if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); document.getElementById("tc-global-search")?.focus(); } };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const tabs = [
    { label: "Overview", icon: Compass },
    { label: "Documents", icon: FileText },
    { label: "Knowledge Base", icon: BookOpen },
    { label: "Subprocessors", icon: Users },
    { label: "Updates", icon: Bell },
  ];
  const stats = [
    { icon: FileText, label: "Documents", value: "42" },
    { icon: BookOpen, label: "FAQs", value: "128" },
    { icon: Shield, label: "Certifications", value: "6" },
    { icon: Clock, label: "Avg Response", value: "< 2hr" },
  ];
  const certifications = ["SOC 2 Type II", "ISO 27001", "GDPR", "HIPAA", "SOC 3"];
  const securityItems = [
    "Annual Penetration Testing", "Data Processing Agreement", "Mobile Device Management", "Cyber Insurance",
    "Bug Bounty Program", "Vulnerability Scanning", "Security Awareness Training", "Incident Response Plan",
  ];
  const documents = [
    { title: "SOC 2 Type II Report", type: "PDF", date: "Mar 2026", locked: true },
    { title: "ISO 27001 Certificate", type: "PDF", date: "Jan 2026", locked: false },
    { title: "Data Processing Addendum", type: "PDF", date: "Feb 2026", locked: false },
    { title: "Vendor Risk Assessment", type: "XLSX", date: "Mar 2026", locked: true },
  ];
  const faqs = [
    { category: "Access Management", q: `How does ${tc.name} manage user access controls?`, a: "We implement role-based access control (RBAC) with least-privilege principles. All access is reviewed quarterly and requires manager approval." },
    { category: "Application Security", q: "What is your secure development lifecycle?", a: "We follow OWASP guidelines with mandatory code reviews, SAST/DAST scanning, and annual penetration testing by independent third parties." },
    { category: "Data Privacy", q: "Where is customer data stored and processed?", a: "Customer data is stored in AWS us-east-1 and eu-west-1 regions. Data processing locations are documented in our DPA." },
    { category: "Infrastructure", q: "How is your infrastructure secured?", a: "We use AWS with VPC isolation, encrypted storage (AES-256), and WAF protection. All infrastructure is managed via Terraform with drift detection." },
    { category: "Incident Response", q: "What is your incident response process?", a: "We maintain a documented IR plan with 24/7 on-call rotation. Customers are notified within 72 hours of confirmed breaches per GDPR requirements." },
  ];

  return (
    <div>
      {/* Global Search Bar */}
      <div className={`flex items-center rounded-xl mb-8 border transition-all ${searchFocused ? "border-brand-500 shadow-[0_0_20px_var(--brand-glow-lg)]" : "border-border-default"} bg-bg-surface`}>
        {/* Product line dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setProductDropdownOpen(!productDropdownOpen)}
            className="flex items-center gap-2 pl-4 pr-3 py-3 border-r border-border-default text-sm font-medium text-text-primary hover:bg-bg-hover transition-colors rounded-l-xl whitespace-nowrap">
            <Filter className="w-3.5 h-3.5 text-brand-500" />
            {selectedProduct}
            <ChevronDown className={`w-3.5 h-3.5 text-text-muted transition-transform ${productDropdownOpen ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence>
            {productDropdownOpen && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}
                className="absolute top-full left-0 mt-1 w-56 bg-bg-surface border border-border-default rounded-xl shadow-lg z-50 py-1 overflow-hidden">
                {PRODUCT_LINES.map(product => (
                  <button key={product} onClick={() => { setSelectedProduct(product); setProductDropdownOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${selectedProduct === product ? "text-brand-500 bg-brand-500/5" : "text-text-primary hover:bg-bg-hover"}`}>
                    <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${selectedProduct === product || selectedProduct === "All Products" ? "border-brand-500 bg-brand-500" : "border-border-bright"}`}>
                      {(selectedProduct === product || selectedProduct === "All Products") && <Check className="w-3 h-3 text-white" />}
                    </div>
                    {product}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {/* Search input */}
        <div className="flex-1 flex items-center gap-3 px-4">
          <Search className="w-4 h-4 text-text-muted shrink-0" />
          <input id="tc-global-search" type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search documents, FAQs, certifications..."
            className="bg-transparent outline-none text-text-primary placeholder:text-text-muted w-full text-sm py-3"
            onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)} aria-label="Global search" />
        </div>
        {/* Keyboard shortcut hint */}
        <div className="flex items-center gap-1 mr-4 px-2 py-1 rounded-md bg-bg-elevated border border-border-default">
          <span className="text-[11px] text-text-muted font-medium">⌘K</span>
        </div>
      </div>

      {/* Glow menu tabs */}
      <div className="flex justify-center mb-8">
        <motion.nav className="p-1.5 rounded-2xl bg-bg-surface/80 backdrop-blur-lg border border-border-default/40 shadow-lg relative overflow-hidden"
          initial="initial" whileHover="hover">
          <motion.div className="absolute -inset-2 rounded-3xl z-0 pointer-events-none"
            style={{ background: "radial-gradient(circle, var(--brand-glow-sm) 0%, transparent 70%)" }}
            variants={{ initial: { opacity: 0 }, hover: { opacity: 1, transition: { duration: 0.5 } } }} />
          <ul className="flex items-center gap-1 relative z-10">
            {tabs.map(({ label, icon: Icon }) => {
              const isActive = label === activeTab;
              return (
                <motion.li key={label} className="relative">
                  <button onClick={() => setActiveTab(label)} className="block w-full">
                    <motion.div className="block rounded-xl overflow-visible group relative"
                      style={{ perspective: "600px" }} whileHover="hover" initial="initial">
                      {/* Glow behind active item */}
                      <motion.div className="absolute inset-0 z-0 pointer-events-none rounded-xl"
                        variants={{ initial: { opacity: 0, scale: 0.8 }, hover: { opacity: 1, scale: 2, transition: { opacity: { duration: 0.5 }, scale: { duration: 0.5, type: "spring", stiffness: 300, damping: 25 } } } }}
                        animate={isActive ? "hover" : "initial"}
                        style={{ background: "radial-gradient(circle, var(--brand-glow-md) 0%, var(--brand-glow-sm) 50%, transparent 100%)" }} />
                      {/* Front face */}
                      <motion.div
                        className={`flex items-center gap-2 px-4 py-2 relative z-10 rounded-xl transition-colors ${isActive ? "text-text-primary" : "text-text-muted group-hover:text-text-primary"}`}
                        variants={{ initial: { rotateX: 0, opacity: 1 }, hover: { rotateX: -90, opacity: 0 } }}
                        transition={{ type: "spring", stiffness: 100, damping: 20, duration: 0.5 }}
                        style={{ transformStyle: "preserve-3d", transformOrigin: "center bottom" }}>
                        <Icon className={`w-4 h-4 transition-colors duration-300 ${isActive ? "text-brand-500" : "group-hover:text-brand-500"}`} />
                        <span className="text-sm font-medium">{label}</span>
                      </motion.div>
                      {/* Back face (flips in on hover) */}
                      <motion.div
                        className={`flex items-center gap-2 px-4 py-2 absolute inset-0 z-10 rounded-xl transition-colors ${isActive ? "text-text-primary" : "text-text-muted group-hover:text-text-primary"}`}
                        variants={{ initial: { rotateX: 90, opacity: 0 }, hover: { rotateX: 0, opacity: 1 } }}
                        transition={{ type: "spring", stiffness: 100, damping: 20, duration: 0.5 }}
                        style={{ transformStyle: "preserve-3d", transformOrigin: "center top", rotateX: 90 }}>
                        <Icon className={`w-4 h-4 transition-colors duration-300 ${isActive ? "text-brand-500" : "group-hover:text-brand-500"}`} />
                        <span className="text-sm font-medium">{label}</span>
                      </motion.div>
                    </motion.div>
                  </button>
                </motion.li>
              );
            })}
          </ul>
        </motion.nav>
      </div>

      {/* Hero */}
      <div className="rounded-xl p-8 mb-8" style={{ background: "var(--hero-gradient)" }}>
        <h1 className="text-[28px] font-bold text-text-primary mb-2">{tc.tcTitle}</h1>
        <p className="text-text-secondary text-base mb-6">{tc.tcSubtitle}</p>
        <div className="grid grid-cols-4 gap-4 mb-6">
          {stats.map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-bg-primary/40 backdrop-blur rounded-xl p-4 border border-border-default/50">
              <Icon className="w-5 h-5 text-brand-500 mb-2" />
              <p className="text-xl font-bold text-text-primary">{value}</p>
              <p className="text-xs text-text-secondary">{label}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          {certifications.map(cert => (
            <div key={cert} className="group relative">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-brand-600/40 bg-bg-primary/30 text-sm text-brand-400 hover:border-brand-500 transition-colors cursor-pointer">
                <Shield className="w-3.5 h-3.5" />{cert}
              </div>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded-lg bg-bg-elevated border border-border-bright text-text-primary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">View Report</div>
            </div>
          ))}
        </div>
        <div className="bg-bg-primary/30 rounded-xl p-4 border border-border-default/50 mb-6">
          <ContributionGraph weeks={12} cellSize={8} gap={2} seed={42} label="Trust Center Activity - Last 90 Days" />
        </div>
      </div>

      {/* Personalized */}
      <div className="mb-8">
        <h2 className="text-[22px] font-semibold text-text-primary mb-4">Welcome back, Jordan</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { title: "Your Questionnaire", detail: "87% complete", icon: FileText, color: "text-brand-500" },
            { title: "New Documents", detail: "3 since your last visit", icon: Bell, color: "text-brand-400" },
            { title: "Gap Requests", detail: "2 resolved", icon: Check, color: "text-brand-500" },
          ].map(card => (
            <motion.div key={card.title} className="bg-bg-surface rounded-xl p-5 border border-border-default hover:border-brand-600/40 transition-colors cursor-pointer" whileHover={{ y: -2 }}>
              <card.icon className={`w-5 h-5 ${card.color} mb-3`} />
              <p className="text-sm font-semibold text-text-primary">{card.title}</p>
              <p className="text-xs text-text-secondary mt-1">{card.detail}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Security Posture */}
      <div className="mb-8">
        <h2 className="text-[22px] font-semibold text-text-primary mb-4">Security Posture</h2>
        <div className="grid grid-cols-2 gap-3">
          {securityItems.map(item => (
            <div key={item} className="flex items-center justify-between bg-bg-surface rounded-xl px-4 py-3 border border-border-default group">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-brand-500/15 flex items-center justify-center shrink-0"><Check className="w-3 h-3 text-brand-500" /></div>
                <span className="text-sm text-text-primary">{item}</span>
              </div>
              <AddToCartButton item={{ type: "quote", title: item, subtitle: "Security posture item" }} label="Save" />
            </div>
          ))}
        </div>
      </div>

      {/* Documents - with add-to-cart */}
      <div className="mb-8">
        <h2 className="text-[22px] font-semibold text-text-primary mb-4">Featured Documents</h2>
        <div className="grid grid-cols-2 gap-4">
          {documents.map(doc => (
            <motion.div key={doc.title} className="bg-bg-surface rounded-xl p-5 border border-border-default hover:border-border-bright transition-colors cursor-pointer group" whileHover={{ y: -2 }}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-brand-500" />
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${doc.type === "PDF" ? "bg-red-500/15 text-red-400" : "bg-brand-500/15 text-brand-400"}`}>{doc.type}</span>
                </div>
                <div className="flex items-center gap-2">
                  {doc.locked && <Lock className="w-4 h-4 text-text-muted" />}
                  <AddToCartButton item={{ type: "document", title: doc.title, subtitle: `${doc.type} · ${doc.date}` }} />
                </div>
              </div>
              <p className="text-sm font-semibold text-text-primary group-hover:text-brand-400 transition-colors">{doc.title}</p>
              <p className="text-xs text-text-muted mt-1">Updated {doc.date}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Knowledge Base - with save-quote */}
      <div className="mb-8">
        <h2 className="text-[22px] font-semibold text-text-primary mb-4">Knowledge Base</h2>
        <div className="bg-bg-surface rounded-xl border border-border-default divide-y divide-border-default">
          {faqs.map((faq, i) => (
            <div key={i}>
              <button onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-bg-hover transition-colors" aria-expanded={expandedFaq === i}>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-500">{faq.category}</span>
                  <span className="text-sm text-text-primary">{faq.q}</span>
                </div>
                <motion.div animate={{ rotate: expandedFaq === i ? 180 : 0 }}><ChevronDown className="w-4 h-4 text-text-muted shrink-0" /></motion.div>
              </button>
              <AnimatePresence>
                {expandedFaq === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="px-5 pb-4 flex items-start justify-between gap-4">
                      <p className="text-sm text-text-secondary leading-relaxed">{faq.a}</p>
                      <AddToCartButton item={{ type: "quote", title: `"${faq.a.substring(0, 60)}..."`, subtitle: `From: ${faq.category}` }} label="Quote" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   VIEW: AGENT - Coco homepage + chat with demo mode
   ═══════════════════════════════════════════════════════════════ */

// Fake taggable documents available in the Trust Center
const AVAILABLE_DOCS = [
  { tag: "@soc2-type2", name: "SOC 2 Type II Report", type: "PDF", date: "Mar 2026", desc: "Independent audit of security controls covering availability, confidentiality, and processing integrity." },
  { tag: "@penetration-test", name: "Annual Penetration Test Results", type: "PDF", date: "Feb 2026", desc: "Third-party penetration test findings and remediation summary for the current year." },
  { tag: "@iso27001", name: "ISO 27001 Certificate", type: "PDF", date: "Jan 2026", desc: "Certification of information security management system compliance with ISO/IEC 27001:2022." },
  { tag: "@iso27018", name: "ISO 27018 Certificate", type: "PDF", date: "Dec 2025", desc: "Certification for protection of personally identifiable information (PII) in public cloud environments." },
  { tag: "@csa-star", name: "CSA STAR Self-Assessment", type: "XLSX", date: "Nov 2025", desc: "Cloud Security Alliance STAR Level 1 self-assessment covering the Consensus Assessments Initiative Questionnaire." },
  { tag: "@security-policy", name: "Information Security Policy", type: "PDF", date: "Mar 2026", desc: "Company-wide security policy covering access control, encryption, incident response, and vendor management." },
  { tag: "@dpa", name: "Data Processing Addendum", type: "PDF", date: "Feb 2026", desc: "Standard contractual terms for processing personal data under GDPR and applicable privacy laws." },
  { tag: "@privacy-policy", name: "Privacy Policy v3.2", type: "PDF", date: "Mar 2026", desc: "Public-facing privacy policy detailing data collection, use, retention, and individual rights." },
  { tag: "@subprocessors", name: "Subprocessor List", type: "XLSX", date: "Mar 2026", desc: "Current list of third-party subprocessors with service descriptions and data processing locations." },
  { tag: "@sig-lite", name: "SIG Lite Questionnaire Template", type: "XLSX", date: "2024", desc: "Standardized Information Gathering questionnaire template for third-party risk assessments." },
  { tag: "@incident-response", name: "Incident Response Plan", type: "PDF", date: "Jan 2026", desc: "Documented plan for detecting, responding to, and recovering from security incidents." },
];

const AGENT_TASKS = [
  { id: 1, label: "Parsing uploaded questionnaire", detail: "SIG Lite v2024 - 104 questions detected" },
  { id: 2, label: "Scanning Trust Center knowledge base", detail: "Matching against 128 FAQs and 42 documents" },
  { id: 3, label: "Cross-referencing compliance documents", detail: "SOC 2 Type II, ISO 27001, Privacy Policy" },
  { id: 4, label: "Filling Section 1: Organization", detail: "12 questions - 11 answered, 1 flagged" },
  { id: 5, label: "Filling Section 2: Risk Management", detail: "8 questions - all answered" },
  { id: 6, label: "Filling Section 3: Compliance", detail: "10 questions - 9 answered, 1 needs review" },
  { id: 7, label: "Filling Section 4: App Security", detail: "15 questions - 12 answered, 3 needs review" },
  { id: 8, label: "Filling Section 5: Data Privacy", detail: "11 questions - 8 answered, 2 flagged" },
  { id: 9, label: "Compiling confidence scores", detail: "Generating summary report" },
  { id: 10, label: "Sending gaps to admin", detail: "3 items flagged for vendor team" },
];

// Inline doc tag pill for chat messages
function DocTag({ tag }) {
  const doc = AVAILABLE_DOCS.find(d => d.tag === tag);
  if (!doc) return <span className="text-brand-400">{tag}</span>;
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-brand-500/15 border border-brand-600/20 text-brand-400 text-xs font-medium cursor-pointer hover:bg-brand-500/25 transition-colors">
      <FileText className="w-3 h-3" />{doc.name}
    </span>
  );
}

// Inline citation link - small clickable pill [1], [2], etc.
function CitationLink({ number, citation, onClick }) {
  return (
    <button onClick={() => onClick(citation)}
      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 mx-0.5 rounded bg-brand-500/15 border border-brand-600/20 text-brand-400 text-[10px] font-semibold hover:bg-brand-500/25 transition-colors align-super cursor-pointer"
      title={`${citation.docName} - ${citation.section}`}>
      <FileText className="w-2.5 h-2.5" />{number}
    </button>
  );
}

// Per-character fade-in text effect with sentence-end pauses
function TextEffect({ children, per = "char", delay = 0 }) {
  if (typeof children !== "string") return children;
  const chars = children.split("");
  const BASE_STAGGER = 0.018; // ~18ms per char
  const SENTENCE_PAUSE = 0.4; // 400ms pause after sentence-ending punctuation

  // Build cumulative delay for each character, adding pauses after sentence endings
  let cumulative = 0;
  const delays = chars.map((ch, i) => {
    const d = delay + cumulative;
    cumulative += BASE_STAGGER;
    // Add pause after sentence-ending punctuation followed by a space or end of string
    if (/[.!?:]/.test(ch)) {
      const next = chars[i + 1];
      if (!next || next === " ") cumulative += SENTENCE_PAUSE;
    }
    return d;
  });

  return (
    <>
      {chars.map((ch, i) => (
        <motion.span key={i}
          initial={{ opacity: 0, filter: "blur(4px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.25, delay: delays[i], ease: "easeOut" }}
          style={{ display: "inline" }}>
          {ch}
        </motion.span>
      ))}
    </>
  );
}

// Calculate total animation duration for a text string (used for delay chaining)
function getTextDuration(text) {
  if (!text) return 0;
  const BASE = 0.018;
  const PAUSE = 0.4;
  let d = 0;
  for (let i = 0; i < text.length; i++) {
    d += BASE;
    if (/[.!?:]/.test(text[i]) && (i === text.length - 1 || text[i + 1] === " ")) d += PAUSE;
  }
  return d;
}

// Renders message text with @doc-tags, [N] citation links, **bold**, and optional per-char animation
function RichText({ text, citations, onCitationClick, animate: shouldAnimate }) {
  if (!text) return null;
  const parts = text.split(/(@[\w-]+|\[\d+\]|\*\*[^*]+\*\*)/g);
  let timeOffset = 0; // cumulative time offset in seconds

  return (
    <p className="text-sm text-text-primary leading-relaxed">
      {parts.map((part, i) => {
        if (part.startsWith("@")) {
          const d = timeOffset;
          timeOffset += getTextDuration(part);
          return shouldAnimate
            ? <motion.span key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: d }}><DocTag tag={part} /></motion.span>
            : <DocTag key={i} tag={part} />;
        }
        const citMatch = part.match(/^\[(\d+)\]$/);
        if (citMatch && citations && onCitationClick) {
          const d = timeOffset;
          timeOffset += getTextDuration(part);
          const idx = parseInt(citMatch[1]) - 1;
          const cit = citations[idx];
          if (cit) return shouldAnimate
            ? <motion.span key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: d }}><CitationLink number={citMatch[1]} citation={cit} onClick={onCitationClick} /></motion.span>
            : <CitationLink key={i} number={citMatch[1]} citation={cit} onClick={onCitationClick} />;
        }
        if (part.startsWith("**") && part.endsWith("**")) {
          const inner = part.slice(2, -2);
          const d = timeOffset;
          timeOffset += getTextDuration(inner);
          return shouldAnimate
            ? <strong key={i} className="font-semibold text-text-primary"><TextEffect delay={d}>{inner}</TextEffect></strong>
            : <strong key={i} className="font-semibold text-text-primary">{inner}</strong>;
        }
        // Plain text
        const d = timeOffset;
        timeOffset += getTextDuration(part);
        if (shouldAnimate && part.length > 0) {
          return <TextEffect key={i} delay={d}>{part}</TextEffect>;
        }
        return <span key={i}>{part}</span>;
      })}
    </p>
  );
}

// Part 1 demo script - security review flow with citations
function getDemoScript(companyName) { return [
  // Step 0: User initiates
  { role: "prompt", label: "Help me with my security review", buttonLabel: "Start review" },
  // Step 1: Coco greeting - no to-do list yet
  { role: "agent", state: "idle", delay: 1200,
    text: `Sure - I can help pull documents, answer compliance questions, and track your review progress. What frameworks or standards does your review cover?` },
  // Step 2: User specifies frameworks
  { role: "prompt", label: "We need SOC 2, ISO 27001, and we're looking at your data processing practices", buttonLabel: "Send requirements" },
  // Step 3: Coco thinking (4 thoughts × 0.5s stagger + buffer = ~4s before auto-advance)
  { role: "agent", state: "thinking", delay: 4000,
    thinking: [
      "Mapping SOC 2 requirements to available documents...",
      "Cross-referencing ISO 27001 controls...",
      "Identifying data processing review items...",
      "Building your review checklist...",
    ],
    text: null },
  // Step 4: Silently start populating to-do list (no message shown)
  { role: "agent", state: "sorting", delay: 1500, startTodos: true, silent: true },
  // Step 5: "To-do list created" appears after all 8 items populate (8 × 300ms = 2.4s + buffer)
  { role: "agent", state: "sorting", delay: 3200,
    text: "✓ To-do list created" },
  // Step 6: Coco confirms checklist
  { role: "agent", state: "idle", delay: 3000,
    text: `Got it - I've built a review checklist for you on the right based on SOC 2, ISO 27001, and data processing requirements.` },
  // Step 6: Coco explains workflow (reading time for previous message)
  { role: "agent", state: "idle", delay: 5000,
    text: `I'll check items off as we go, and you can tackle things in any order while I work in the background.` },
  // Step 7: Coco starts pulling documents
  { role: "agent", state: "sorting", delay: 4000,
    text: `Pulling relevant documents...` },
  // Step 8: Document list appears
  { role: "agent", state: "idle", delay: 3000, docs: [
    { tag: "@soc2-type2", relevance: "Requested - latest audit report" },
    { tag: "@iso27001", relevance: "Requested - certification proof" },
    { tag: "@dpa", relevance: "Requested - data processing terms" },
    { tag: "@security-policy", relevance: "Related - security controls detail" },
    { tag: "@subprocessors", relevance: "Related - third-party processors" },
    { tag: "@privacy-policy", relevance: "Related - privacy practices" },
  ] },
  // Step 8: User asks encryption question
  { role: "prompt", label: "What encryption standards do you use for data at rest and in transit?", buttonLabel: "Ask about encryption" },
  // Step 9: Coco searching with doc tags
  { role: "agent", state: "thinking", delay: 2000,
    text: "Searching @security-policy and @soc2-type2 for encryption standards..." },
  // Step 10: Coco answers with citations
  { role: "agent", state: "idle", delay: 3000,
    citations: [
      { id: "c1", docTag: "@security-policy", docName: "Information Security Policy",
        page: 12, section: "4.3 Encryption Standards",
        excerpt: "All data at rest is encrypted using AES-256. Encryption keys are managed through AWS KMS with automatic rotation every 365 days. All storage volumes, database instances, and backup archives are encrypted by default with no opt-out.",
        highlight: "AES-256",
        context: [
          "4.2 Data Classification - All customer data is classified as Confidential and subject to encryption requirements outlined in this section.",
          null,
          "4.4 Certificate Management - TLS certificates are provisioned via AWS Certificate Manager with automatic renewal. Internal services use mTLS for service-to-service authentication.",
        ] },
      { id: "c2", docTag: "@soc2-type2", docName: "SOC 2 Type II Report",
        page: 34, section: "CC6.1 - Logical Access Controls",
        excerpt: "Data in transit is protected using TLS 1.2 or higher for all API endpoints and internal service communication. Certificate pinning is enforced for mobile clients. HSTS is enabled with a minimum max-age of one year.",
        highlight: "TLS 1.2 or higher",
        context: [
          "CC5.8 - The organization has implemented network segmentation to restrict lateral movement between production and non-production environments.",
          null,
          "CC6.2 - Authentication mechanisms include multi-factor authentication for all administrative access and single sign-on (SSO) for customer-facing applications.",
        ] },
      { id: "c3", docTag: "@iso27001", docName: "ISO 27001 Certificate",
        page: 8, section: "A.10 - Cryptographic Controls",
        excerpt: "AWS KMS is used for all key management operations. Keys are rotated automatically every 365 days. Customer-managed keys (BYOK) are supported for Enterprise tier customers upon request. All cryptographic controls are reviewed annually as part of the ISMS audit cycle.",
        highlight: "AWS KMS",
        context: [
          "A.9 - Access Control - Role-based access control is enforced across all systems with quarterly access reviews and automated deprovisioning.",
          null,
          "A.11 - Physical Security - Data centers are SOC 2 certified with 24/7 monitoring, biometric access, and environmental controls.",
        ] },
    ],
    text: `${companyName} uses **AES-256 encryption for data at rest** [1] and **TLS 1.2+ for data in transit** [2] across all endpoints. Key management is handled through **AWS KMS with automatic annual rotation** [3], and Enterprise customers can bring their own keys (BYOK). Here are the specific references:` },

  // ── PART 2: Questionnaire upload + auto-fill ──

  // Step 11: Coco bridges from encryption to next steps + checks off encryption to-do (delay = text animation ~6s + citation cards ~2s + reading time ~2s)
  { role: "agent", state: "idle", delay: 10000, checkTodo: "t3",
    text: "That covers encryption and key management. Want to keep working through the checklist? Or if you have a questionnaire ready I can start to draft answers." },
  // Step 12: Prompt - user uploads questionnaire
  { role: "prompt", label: "Upload CSA CAIQ v4.0", buttonLabel: "Upload questionnaire", isUpload: true,
    uploadFile: { name: "CSA_CAIQ_v4.0_2024.xlsx", type: "XLSX", size: "2.4 MB" } },
  // Step 13: Coco parsing - thinking state (4 thoughts × 0.5s = 2s, then wait for them to be read)
  { role: "agent", state: "sorting", delay: 2000,
    thinking: [
      "Parsing spreadsheet structure - 17 domains, 104 questions detected...",
      "Matching questions to Trust Center knowledge base...",
      "Identifying documents to cross-reference...",
      "Starting auto-fill...",
    ],
    text: null },
  // Step 14: Coco starts auto-fill (wait for thinking to complete ~4s)
  { role: "agent", state: "thinking", delay: 5000, startTasks: true,
    text: "Starting auto-fill across all 17 domains. I'm cross-referencing @soc2-type2, @iso27001, @security-policy, @dpa, and @privacy-policy." },
  // Step 15: Coco tells user they can leave (wait for auto-fill text to animate ~5s)
  { role: "agent", state: "idle", delay: 7000,
    text: "This will take a minute. Feel free to browse the Trust Center while I work." },
]; }

/* ═══════════════════════════════════════════════════════════════
   MCP CONNECTION FLOW - Coco-guided setup
   ═══════════════════════════════════════════════════════════════ */

const MCP_STEPS = [
  { id: "intro", title: "Connect your tools to this Trust Center", cocoState: "waving",
    cocoMsg: "I'll walk you through each step. It only takes a couple minutes - and once you're connected, your tools can talk to me directly!" },
  { id: "server", title: "Trust Center MCP Server", cocoState: "idle",
    cocoMsg: "Grab this server URL and drop it into your MCP client config. Works with Claude Desktop, Cursor, Windsurf, or any MCP-compatible client." },
  { id: "auth", title: "Authenticate your connection", cocoState: "sorting",
    cocoMsg: null }, // dynamic - set in component based on apiKey state
  { id: "verify", title: "Verify connection", cocoState: "thinking",
    cocoMsg: null }, // dynamic - set in component based on verify state
  { id: "done", title: "You're connected!", cocoState: "celebrating",
    cocoMsg: null }, // dynamic - uses tc.name
];

function McpConnectFlow({ open, onClose }) {
  const tc = useTc();
  const mcpUrl = `mcp://${tc.mcpDomain}`;
  const mcpServerName = `${tc.id}-trust-center`;
  const [step, setStep] = useState(0);
  const [copied, setCopied] = useState(null);
  const [apiKey, setApiKey] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  const currentStep = MCP_STEPS[step];

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleVerify = () => {
    setVerifying(true);
    // Simulate verification
    setTimeout(() => { setVerifying(false); setVerified(true); }, 2200);
  };

  const reset = () => { setStep(0); setCopied(null); setApiKey(""); setVerifying(false); setVerified(false); };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
        onClick={(e) => { if (e.target === e.currentTarget) { onClose(); reset(); } }}>
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          className="bg-bg-surface border border-border-default rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">

          {/* Header - title + step count, no Coco */}
          <div className="flex items-start justify-between px-6 pt-5 pb-3">
            <div>
              <p className="text-base font-semibold text-text-primary">{currentStep.title}</p>
              <p className="text-xs text-text-muted mt-0.5">Step {step + 1} of {MCP_STEPS.length}</p>
            </div>
            <button onClick={() => { onClose(); reset(); }} className="p-1.5 rounded-lg hover:bg-bg-hover transition-colors mt-0.5">
              <X className="w-4 h-4 text-text-muted" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-bg-hover">
            <motion.div className="h-full bg-brand-500" animate={{ width: `${((step + 1) / MCP_STEPS.length) * 100}%` }} transition={{ type: "spring", stiffness: 300, damping: 30 }} />
          </div>

          {/* Coco guide message */}
          <div className="flex items-start gap-2.5 px-6 mt-4">
            <Coco size={24} state={
              step === 0 ? "waving" :
              step === 1 ? "sorting" :
              step === 2 ? (apiKey ? "celebrating" : "thinking") :
              step === 3 ? (verified ? "celebrating" : verifying ? "sorting" : "idle") :
              "waving"
            } className="shrink-0 mt-0.5" />
            <motion.p key={`coco-${step}-${apiKey ? "key" : ""}-${verified ? "v" : verifying ? "ing" : ""}`}
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
              className="text-xs text-text-secondary leading-relaxed">
              <span className="font-medium text-brand-500">Coco: </span>
              {step === 2
                ? (apiKey ? "Nice! Key generated. Add this to your MCP client config under the auth header. Ready to test?" : "Your key scopes to your access level, so NDA-gated docs stay gated. Security first!")
                : step === 3
                ? (verified ? "All green! Your AI tools can now talk to me directly. Let's go!" : verifying ? "Testing... give me a sec..." : "Hit the button and I'll check if everything's wired up correctly.")
                : step === 4
                ? `You're all set! You won't need to come back here - your AI tools can reach me directly now. Try asking "What certifications does ${tc.name} hold?"`
                : currentStep.cocoMsg}
            </motion.p>
          </div>

          {/* Body */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} transition={{ duration: 0.2 }}>

                {/* Step 0: Intro */}
                {step === 0 && (
                  <div className="space-y-2.5">
                    {[
                      { icon: FileText, text: "Pull compliance documents on demand" },
                      { icon: MessageSquare, text: "Query security posture with cited answers" },
                      { icon: Zap, text: "Auto-fill questionnaires from Trust Center data" },
                      { icon: Bell, text: "Get notified when documents are updated" },
                    ].map(({ icon: Icon, text }) => (
                      <div key={text} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-bg-elevated border border-border-default">
                        <Icon className="w-4 h-4 text-brand-500 shrink-0" />
                        <span className="text-sm text-text-primary">{text}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Step 1: Server URL */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-text-muted mb-1.5 block">MCP Server URL</label>
                      <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-bg-elevated border border-border-default font-mono text-sm text-text-primary">
                        <Globe className="w-4 h-4 text-brand-500 shrink-0" />
                        <span className="flex-1 truncate select-all">{mcpUrl}</span>
                        <button onClick={() => handleCopy(mcpUrl, "url")}
                          className="p-1 rounded hover:bg-bg-hover transition-colors shrink-0">
                          {copied === "url" ? <Check className="w-3.5 h-3.5 text-brand-500" /> : <Copy className="w-3.5 h-3.5 text-text-muted" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-text-muted mb-1.5 block">Example config (claude_desktop_config.json)</label>
                      <div className="relative rounded-lg bg-bg-elevated border border-border-default p-3 font-mono text-xs text-text-secondary leading-relaxed">
                        <button onClick={() => handleCopy(`{\n  "mcpServers": {\n    "${mcpServerName}": {\n      "url": "${mcpUrl}"\n    }\n  }\n}`, "config")}
                          className="absolute top-2 right-2 p-1 rounded hover:bg-bg-hover transition-colors">
                          {copied === "config" ? <Check className="w-3.5 h-3.5 text-brand-500" /> : <Copy className="w-3.5 h-3.5 text-text-muted" />}
                        </button>
                        <pre className="whitespace-pre">{`{
  "mcpServers": {
    "${mcpServerName}": {
      "url": "${mcpUrl}"
    }
  }
}`}</pre>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Auth */}
                {step === 2 && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-text-muted mb-1.5 block">Your API Key</label>
                      <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-bg-elevated border border-border-default">
                        <ShieldCheck className="w-4 h-4 text-brand-500 shrink-0" />
                        <input type="text" value={apiKey} readOnly placeholder="Click generate to create a key"
                          className="flex-1 bg-transparent outline-none font-mono text-sm text-text-primary placeholder:text-text-muted" />
                        {apiKey && (
                          <button onClick={() => handleCopy(apiKey, "key")} className="p-1 rounded hover:bg-bg-hover transition-colors shrink-0">
                            {copied === "key" ? <Check className="w-3.5 h-3.5 text-brand-500" /> : <Copy className="w-3.5 h-3.5 text-text-muted" />}
                          </button>
                        )}
                      </div>
                    </div>
                    {!apiKey ? (
                      <button onClick={() => setApiKey("ctc_live_" + Math.random().toString(36).substring(2, 18))}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-brand-500 text-bg-primary text-sm font-medium hover:bg-brand-400 transition-colors">
                        <Zap className="w-4 h-4" /> Generate API Key
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                          <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0" />
                          <p className="text-xs text-text-secondary">Copy this key now - it won't be shown again.</p>
                        </div>
                        <div className="text-xs text-text-muted space-y-1">
                          <p className="flex items-center gap-2"><Check className="w-3 h-3 text-brand-500" /> Access level: <span className="text-text-primary font-medium">Standard (NDA on file)</span></p>
                          <p className="flex items-center gap-2"><Check className="w-3 h-3 text-brand-500" /> Rate limit: <span className="text-text-primary font-medium">100 requests/min</span></p>
                          <p className="flex items-center gap-2"><Check className="w-3 h-3 text-brand-500" /> Expires: <span className="text-text-primary font-medium">90 days (rotatable)</span></p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Verify */}
                {step === 3 && (
                  <div className="space-y-4">
                    {!verifying && !verified && (
                      <button onClick={handleVerify}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-brand-500 text-bg-primary text-sm font-medium hover:bg-brand-400 transition-colors">
                        <RefreshCw className="w-4 h-4" /> Test Connection
                      </button>
                    )}
                    {verifying && (
                      <div className="space-y-3">
                        {["Connecting to MCP server...", "Authenticating with API key...", "Running test query..."].map((msg, i) => (
                          <motion.div key={msg} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.6 }}
                            className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-bg-elevated border border-border-default">
                            <Loader className="w-4 h-4 text-brand-500 animate-spin shrink-0" />
                            <span className="text-sm text-text-secondary">{msg}</span>
                          </motion.div>
                        ))}
                      </div>
                    )}
                    {verified && (
                      <div className="space-y-3">
                        {[
                          { label: "Server connection", detail: mcpUrl },
                          { label: "Authentication", detail: "Valid - Standard access" },
                          { label: "Test query", detail: "\"List available documents\" → 42 results returned" },
                        ].map(({ label, detail }) => (
                          <div key={label} className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-brand-500/5 border border-brand-600/20">
                            <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-text-primary">{label}</p>
                              <p className="text-xs text-text-muted">{detail}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Step 4: Done */}
                {step === 4 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Documents", value: "42 available", icon: FileText },
                        { label: "FAQs", value: "128 indexed", icon: MessageSquare },
                        { label: "Certifications", value: "6 active", icon: Shield },
                        { label: "Response time", value: "~200ms", icon: Zap },
                      ].map(({ label, value, icon: Icon }) => (
                        <div key={label} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-bg-elevated border border-border-default">
                          <Icon className="w-4 h-4 text-brand-500 shrink-0" />
                          <div>
                            <p className="text-xs font-medium text-text-primary">{value}</p>
                            <p className="text-[10px] text-text-muted">{label}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border-default bg-bg-elevated/50">
            <button onClick={() => { if (step === 0) { onClose(); reset(); } else setStep(s => s - 1); }}
              className="px-4 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors">
              {step === 0 ? "Cancel" : "Back"}
            </button>
            {step < MCP_STEPS.length - 1 ? (
              <button onClick={() => setStep(s => s + 1)}
                disabled={step === 2 && !apiKey || step === 3 && !verified}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 text-bg-primary text-sm font-medium hover:bg-brand-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                Next <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button onClick={() => { onClose(); reset(); }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 text-bg-primary text-sm font-medium hover:bg-brand-400 transition-colors">
                Done <Check className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DOCUMENT VIEWER - citation overlay with highlighted excerpt
   ═══════════════════════════════════════════════════════════════ */

function DocumentViewer({ citation, onClose }) {
  if (!citation) return null;
  const doc = AVAILABLE_DOCS.find(d => d.tag === citation.docTag);
  const context = citation.context || [];

  // Highlight the key phrase within the excerpt
  const renderHighlighted = (text, hl) => {
    if (!hl) return <span>{text}</span>;
    const parts = text.split(new RegExp(`(${hl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === hl.toLowerCase()
        ? <mark key={i} className="bg-brand-500/30 text-brand-300 px-0.5 rounded font-medium">{part}</mark>
        : <span key={i}>{part}</span>
    );
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }}
          className="bg-bg-surface border border-border-default rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">

          {/* PDF-style header bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-border-default bg-bg-elevated/80 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-brand-500" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-primary truncate">{citation.docName}</p>
                <p className="text-[11px] text-text-muted">{doc?.type || "PDF"} · Page {citation.page} of {citation.page + 12}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <AddToCartButton item={{ type: "document", title: citation.docName, subtitle: `${doc?.type || "PDF"} · ${doc?.date || "2026"}`, desc: doc?.desc }} />
              <button className="p-1.5 rounded-lg hover:bg-bg-hover transition-colors" title="Download">
                <Download className="w-4 h-4 text-text-muted" />
              </button>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-bg-hover transition-colors">
                <X className="w-4 h-4 text-text-muted" />
              </button>
            </div>
          </div>

          {/* PDF page content */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-[560px] mx-auto py-8 px-10">
              {/* Page number */}
              <p className="text-[10px] text-text-muted text-right mb-6">{citation.page}</p>

              {/* Context paragraph before (dimmed) */}
              {context[0] && (
                <p className="text-xs text-text-muted/60 leading-relaxed mb-4">{context[0]}</p>
              )}

              {/* Section heading */}
              <h3 className="text-sm font-bold text-text-primary mb-3">{citation.section}</h3>

              {/* The cited excerpt - highlighted */}
              <motion.div
                initial={{ backgroundColor: "transparent" }}
                animate={{ backgroundColor: ["rgba(var(--color-brand-500), 0.08)", "rgba(var(--color-brand-500), 0.03)"] }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="rounded-lg border-l-2 border-brand-500 pl-4 py-2 mb-4 -ml-4"
              >
                <p className="text-sm text-text-primary leading-relaxed">
                  {renderHighlighted(citation.excerpt, citation.highlight)}
                </p>
              </motion.div>

              {/* Context paragraph after (dimmed) */}
              {context[2] && (
                <p className="text-xs text-text-muted/60 leading-relaxed mb-4">{context[2]}</p>
              )}

              {/* Faux continuation text */}
              <div className="space-y-3 mt-6 opacity-30">
                <div className="h-3 bg-text-muted/10 rounded w-full" />
                <div className="h-3 bg-text-muted/10 rounded w-11/12" />
                <div className="h-3 bg-text-muted/10 rounded w-4/5" />
                <div className="h-3 bg-text-muted/10 rounded w-full" />
                <div className="h-3 bg-text-muted/10 rounded w-3/4" />
              </div>

              {/* Page footer */}
              <div className="flex items-center justify-between mt-8 pt-4 border-t border-border-default/30">
                <p className="text-[10px] text-text-muted italic">{citation.docName}</p>
                <p className="text-[10px] text-text-muted">Confidential</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function AgentView() {
  const tc = useTc();
  const { addItem, isItemAdded, startReviewTodos, advanceTodos, toggleTodo, setPanelTab, setCocoState, startCocoWork, updateCocoTask, finishCocoWork, resetCoco, cocoAnim: sharedCocoAnim, cocoStatus: sharedCocoStatus } = useCart();
  const [chatStarted, setChatStarted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [viewerCitation, setViewerCitation] = useState(null);
  const [agentWorking, setAgentWorking] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [currentTaskIdx, setCurrentTaskIdx] = useState(-1);
  const [demoStep, setDemoStep] = useState(-1);
  const [showDocSuggestions, setShowDocSuggestions] = useState(false);
  const [thoughtExpanded, setThoughtExpanded] = useState(true);
  const [mcpOpen, setMcpOpen] = useState(false);
  const [draftModalOpen, setDraftModalOpen] = useState(false);
  const [draftSent, setDraftSent] = useState(false);
  const [questionnaireDownloaded, setQuestionnaireDownloaded] = useState(false);
  const [comparisonStarted, setComparisonStarted] = useState(false);
  const [mcpPromptReady, setMcpPromptReady] = useState(false);
  const chatEndRef = useRef(null);
  const demoActive = useRef(false);
  const demoTimerRef = useRef(null); // tracks current auto-advance timeout so Enter can skip it
  const demoScript = useMemo(() => getDemoScript(tc.name), [tc.name]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, demoStep]);

  // Task progression (questionnaire filling)
  useEffect(() => {
    if (!agentWorking || currentTaskIdx < 0) return;
    if (currentTaskIdx >= AGENT_TASKS.length) {
      setTimeout(() => {
        setTasks(prev => prev.map(t => ({ ...t, status: t.status === "active" ? "done" : t.status })));
        setAgentWorking(false);
        advanceTodos(2);
        finishCocoWork("Questionnaire complete - 89 of 104 answered (86%)");
        // Append completion card after the task progress
        setMessages(prev => [...prev, {
          role: "agent", state: "celebrating", text: null,
          card: {
            title: "✅ Questionnaire Complete - 89 of 104 answered (86%)",
            items: [
              { color: "var(--color-brand-500)", label: "72 High confidence - sourced from Trust Center docs" },
              { color: "var(--color-status-warning)", label: "14 Needs your review - flagged for accuracy" },
              { color: "var(--color-status-error)", label: "3 Gaps - sent to vendor admin for response" },
            ],
          },
          showDownload: true,
        }]);
        // Collapse Coco's Tasks panel after a brief viewing window
        setTimeout(() => { resetCoco(); }, 4000);
      }, 600);
      return;
    }
    const timer = setTimeout(() => {
      setTasks(prev => {
        let updated = prev.map(t => t.id === AGENT_TASKS[currentTaskIdx].id ? { ...t, status: "active" } : t);
        if (currentTaskIdx > 0) {
          const prevId = AGENT_TASKS[currentTaskIdx - 1].id;
          updated = updated.map(t => t.id === prevId ? { ...t, status: "done" } : t);
        }
        return updated;
      });
      // Sync to shared Coco state
      updateCocoTask(AGENT_TASKS[currentTaskIdx].id, "active");
      if (currentTaskIdx > 0) updateCocoTask(AGENT_TASKS[currentTaskIdx - 1].id, "done");
      setCurrentTaskIdx(i => i + 1);
    }, 2500 + Math.random() * 1000);
    return () => clearTimeout(timer);
  }, [agentWorking, currentTaskIdx, advanceTodos]);

  // Demo script auto-advance
  useEffect(() => {
    if (demoStep < 0 || demoStep >= demoScript.length) return;
    const step = demoScript[demoStep];
    if (step.role === "prompt") return;

    const timer = setTimeout(() => {
      demoTimerRef.current = null;
      if (step.role === "agent") {
        const msg = { role: "agent", state: step.state };
        if (step.text) msg.text = step.text;
        if (step.docs) msg.docList = step.docs;
        if (step.citations) msg.citations = step.citations;
        if (step.thinking) msg.thinking = step.thinking;
        if (step.startTasks) msg._isTaskProgress = true;
        // Silent steps trigger side effects without adding a chat message
        if (!step.silent) {
          setMessages(prev => [...prev, msg]);
        }

        // Sync Coco panel state to match demo phase
        const animMap = { waving: "waving", sorting: "sorting", thinking: "thinking", idle: "idle" };
        const labelMap = { waving: "Greeting visitor", sorting: "Organizing documents...", thinking: "Searching knowledge base...", idle: "Reviewing results" };
        setCocoState("working", animMap[step.state] || "idle", labelMap[step.state] || "Working...");

        // Trigger to-do list population
        if (step.startTodos) startReviewTodos();
        // Auto-advance to-do items
        if (step.advanceTodo) advanceTodos(step.advanceTodo);
        // Check off a specific to-do item
        if (step.checkTodo) toggleTodo(step.checkTodo);
        // Trigger questionnaire task list
        if (step.startTasks) {
          setTasks(AGENT_TASKS.map(t => ({ ...t, status: "pending" })));
          setAgentWorking(true);
          setCurrentTaskIdx(0);
          startCocoWork("Auto-filling CAIQ v4.0...", AGENT_TASKS);
          setPanelTab("todo");
        }
        // Surface docs phase
        if (step.docs) {
          setCocoState("working", "sorting", "Pulling documents...");
        }
      }
      // Always advance to next step
      const nextStep = demoScript[demoStep + 1];
      if (nextStep) setDemoStep(s => s + 1);
    }, step.delay || 500);
    demoTimerRef.current = timer;
    return () => { clearTimeout(timer); demoTimerRef.current = null; };
  }, [demoStep, startReviewTodos, advanceTodos, toggleTodo, setPanelTab]);

  // Start the demo
  const startDemo = useCallback(() => {
    if (demoActive.current) return;
    demoActive.current = true;
    setChatStarted(true);
    // Step 0 is a prompt - auto-send it and advance to step 1 (agent greeting)
    setMessages([{ role: "user", text: demoScript[0].label }]);
    setDemoStep(1);
    setCocoState("working", "waving", "Greeting visitor");
  }, [setCocoState, demoScript]);

  // User clicks a demo prompt button
  const advanceDemo = useCallback((promptText, uploadFile) => {
    if (uploadFile) {
      setMessages(prev => [...prev, { role: "user", text: promptText, uploadFile }]);
    } else {
      setMessages(prev => [...prev, { role: "user", text: promptText }]);
    }
    setDemoStep(s => s + 1);
  }, []);

  // Download questionnaire → triggers gap draft message
  const handleDownloadQuestionnaire = useCallback(() => {
    if (questionnaireDownloaded) return;
    setQuestionnaireDownloaded(true);
    // After a brief pause, Coco sends the gap draft
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: "agent", state: "idle",
        text: "I found **3 questions I couldn't answer** from the Trust Center docs and drafted a message to send to the vendor to complete the missing information.",
        gapDraft: {
          to: "admin@" + (tc?.name?.toLowerCase() || "vendor") + ".com",
          subject: "Information Request - CSA CAIQ Gap Items",
          body: `Hi team,\n\nI'm completing a CSA CAIQ assessment and have 3 items that need input from your side:\n\n1. CEK-03: Do you support client-managed encryption keys (BYOK)? If so, what key management service is used?\n\n2. CEK-08: What are your key custodian procedures and segregation of duties for encryption key access?\n\n3. DSP-17: What is your data retention policy for backups after contract termination?\n\nCould you provide documentation or responses for these? Happy to jump on a call if easier.\n\nThanks!`,
        },
      }]);
    }, 2000);
  }, [questionnaireDownloaded, tc]);

  // Send gap draft → shows confirmation + MCP suggestion
  const mcpSuggestionText = "While we wait, here's a tip: if you're reviewing multiple vendors, you can **connect their Trust Centers via MCP** and I can run a side-by-side comparison. Want to compare incident response policies across vendors?";
  const handleSendDraft = useCallback(() => {
    setDraftSent(true);
    // After confirmation, show MCP suggestion
    const msgDelay = 5000;
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: "agent", state: "idle",
        text: mcpSuggestionText,
      }]);
      // Show comparison prompt only after text finishes animating
      const animDuration = getTextDuration(mcpSuggestionText) * 1000 + 1200;
      setTimeout(() => setMcpPromptReady(true), animDuration);
    }, msgDelay);
  }, []);

  // MCP vendor comparison flow
  const handleStartComparison = useCallback(() => {
    if (comparisonStarted) return;
    setComparisonStarted(true);

    // 1. Add user message
    setMessages(prev => [...prev, {
      role: "user",
      text: "Compare breach notification timelines and incident response across @mediacore @conveyor @nunita",
    }]);

    // 2. Thinking steps - querying each vendor via MCP
    setTimeout(() => {
      setCocoState("thinking", "Comparing vendors...");
      setMessages(prev => [...prev, {
        role: "agent", state: "thinking",
        thinking: [
          "Connecting to Mediacore Trust Center via MCP...",
          "Querying Conveyor Trust Center incident response policies...",
          "Fetching Nunita Trust Center IR documentation...",
          "Cross-referencing breach notification SLAs across all three vendors...",
        ],
        text: null,
      }]);
    }, 800);

    // 3. Deliver comparison table + summary
    setTimeout(() => {
      setCocoState("idle", "Comparison ready");
      setMessages(prev => [...prev, {
        role: "agent", state: "idle",
        text: "Here's a side-by-side comparison of incident response practices across all three vendors:",
        comparisonTable: {
          vendors: ["Mediacore", "Conveyor", "Nunita"],
          rows: [
            {
              label: "Breach Notification SLA",
              cells: [
                { status: "good", value: "24 hours", source: "@mediacore/dpa p.8" },
                { status: "good", value: "72 hours (GDPR-aligned)", source: "@conveyor/dpa p.11" },
                { status: "gap", value: "\"Without undue delay\"", source: "@nunita/privacy-policy p.5" },
              ],
            },
            {
              label: "Dedicated IR Team",
              cells: [
                { status: "good", value: "Yes — 24/7 CSIRT, 4 FTEs", source: "@mediacore/soc2-type2 p.41" },
                { status: "good", value: "Yes — SecOps on-call rotation", source: "@conveyor/security-policy p.22" },
                { status: "warning", value: "Shared with engineering team", source: "@nunita/security-overview p.9" },
              ],
            },
            {
              label: "Post-Incident Reporting",
              cells: [
                { status: "good", value: "RCA within 5 business days", source: "@mediacore/ir-plan p.6" },
                { status: "good", value: "RCA within 7 business days", source: "@conveyor/soc2-report p.38" },
                { status: "gap", value: "No documented timeline", source: "No source found" },
              ],
            },
            {
              label: "Customer Communication",
              cells: [
                { status: "good", value: "Direct email + status page", source: "@mediacore/ir-plan p.7" },
                { status: "good", value: "Email + in-app banner + status page", source: "@conveyor/security-policy p.24" },
                { status: "warning", value: "Email only", source: "@nunita/faq #incident-response" },
              ],
            },
            {
              label: "Annual IR Testing",
              cells: [
                { status: "good", value: "Quarterly tabletop exercises", source: "@mediacore/iso27001 p.15" },
                { status: "good", value: "Biannual tabletop + annual simulation", source: "@conveyor/soc2-report p.40" },
                { status: "gap", value: "Not documented", source: "No source found" },
              ],
            },
          ],
        },
        comparisonSummary: "**Mediacore** has the tightest breach notification window at 24 hours with a dedicated CSIRT. **Conveyor** is strong across the board with GDPR-aligned 72-hour notification, multi-channel communication, and the most rigorous IR testing program. **Nunita** has significant gaps — no defined notification SLA, no documented post-incident timeline, and no evidence of IR testing. I'd flag Nunita's incident response as a risk item.",
        comparisonActions: true,
      }]);
    }, 5500);

    // 4. Check off incident response to-do after reading time
    setTimeout(() => {
      toggleTodo("t6");
      setPanelTab("todo");
      setMessages(prev => [...prev, {
        role: "agent", state: "idle",
        text: "✓ Checked off **Check incident response procedures** from your to-do list — that's now covered across all three vendors.",
      }]);
    }, 16000);
  }, [comparisonStarted, setCocoState, toggleTodo, setPanelTab]);

  // Free-form send (for manual typing)
  const handleSend = () => {
    if (!input.trim() || agentWorking) return;
    const text = input.trim();
    setInput("");
    if (!chatStarted) {
      startDemo();
    } else {
      setMessages(prev => [...prev, { role: "user", text }]);
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: "agent", state: "idle",
          text: `I can help with that. Let me check ${tc.name}'s Trust Center documents...`,
        }]);
      }, 800);
    }
  };

  // Doc suggestion dropdown for @-tagging
  const handleInputChange = (e) => {
    const val = e.target.value;
    setInput(val);
    setShowDocSuggestions(val.includes("@") && !val.endsWith(" "));
  };

  const insertDoc = (tag) => {
    setInput(prev => prev.replace(/@[\w-]*$/, tag + " "));
    setShowDocSuggestions(false);
  };

  // Enter key to fast-forward demo — skips current delay or clicks the next prompt
  useEffect(() => {
    if (!chatStarted) return;
    const onKey = (e) => {
      if (e.key !== "Enter" || e.target.tagName === "TEXTAREA" || e.target.tagName === "INPUT") return;
      e.preventDefault();

      // 1. If an auto-advance timer is pending, clear it and fire immediately
      if (demoTimerRef.current) {
        clearTimeout(demoTimerRef.current);
        demoTimerRef.current = null;
        const step = demoScript[demoStep];
        if (step && step.role === "agent") {
          const msg = { role: "agent", state: step.state };
          if (step.text) msg.text = step.text;
          if (step.docs) msg.docList = step.docs;
          if (step.citations) msg.citations = step.citations;
          if (step.thinking) msg.thinking = step.thinking;
          if (step.startTasks) msg._isTaskProgress = true;
          if (!step.silent) setMessages(prev => [...prev, msg]);
          const animMap = { waving: "waving", sorting: "sorting", thinking: "thinking", idle: "idle" };
          const labelMap = { waving: "Greeting visitor", sorting: "Organizing documents...", thinking: "Searching knowledge base...", idle: "Reviewing results" };
          setCocoState("working", animMap[step.state] || "idle", labelMap[step.state] || "Working...");
          if (step.startTodos) startReviewTodos();
          if (step.advanceTodo) advanceTodos(step.advanceTodo);
          if (step.checkTodo) toggleTodo(step.checkTodo);
          if (step.startTasks) {
            setTasks(AGENT_TASKS.map(t => ({ ...t, status: "pending" })));
            setAgentWorking(true);
            setCurrentTaskIdx(0);
            startCocoWork("Auto-filling CAIQ v4.0...", AGENT_TASKS);
            setPanelTab("todo");
          }
          if (step.docs) setCocoState("working", "sorting", "Pulling documents...");
          const nextStep = demoScript[demoStep + 1];
          if (nextStep) setDemoStep(s => s + 1);
        }
        return;
      }

      // 2. If a prompt button is waiting, click it
      const step = demoStep >= 0 && demoStep < demoScript.length ? demoScript[demoStep] : null;
      if (step && step.role === "prompt") {
        advanceDemo(step.label, step.isUpload ? step.uploadFile : undefined);
        return;
      }

      // 3. Post-script interactions: download → send draft → comparison
      if (!questionnaireDownloaded && demoStep >= demoScript.length) {
        handleDownloadQuestionnaire();
        return;
      }
      if (questionnaireDownloaded && !draftSent) {
        handleSendDraft();
        return;
      }
      if (mcpPromptReady && !comparisonStarted) {
        handleStartComparison();
        return;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [chatStarted, demoStep, demoScript, questionnaireDownloaded, draftSent, mcpPromptReady, comparisonStarted,
      advanceDemo, handleDownloadQuestionnaire, handleSendDraft, handleStartComparison,
      startReviewTodos, advanceTodos, setCocoState, startCocoWork]);

  const taskStatusIcon = (status) => {
    if (status === "done") return <CheckCircle2 className="w-4 h-4 text-brand-500" />;
    if (status === "active") return <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}><Loader className="w-4 h-4 text-brand-400" /></motion.div>;
    return <Circle className="w-4 h-4 text-text-muted/40" />;
  };

  const doneCount = tasks.filter(t => t.status === "done").length;

  // Current prompt step (if any)
  const currentPrompt = demoStep >= 0 && demoStep < demoScript.length && demoScript[demoStep].role === "prompt" ? demoScript[demoStep] : null;

  // Calculate how long the last agent message takes to animate, so the prompt appears after
  const lastAgentText = messages.length > 0 ? messages[messages.length - 1]?.text : null;
  const promptAppearDelay = lastAgentText && messages[messages.length - 1]?.role === "agent"
    ? getTextDuration(lastAgentText) + 0.8 // text animation + small buffer
    : 1.5;

  // Coco click-to-cycle on homepage
  const cocoStates = ["idle", "waving", "sorting", "thinking", "celebrating", "sleeping"];
  const cocoMessages = ["What can I help you with?", "Hey there! 👋", "Sorting through documents...", "Hmm, let me think...", "Woohoo! 🎉", "zzz... just resting my eyes..."];
  const [cocoIdx, setCocoIdx] = useState(1);

  // ── HOMEPAGE STATE ──
  if (!chatStarted) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center max-w-[780px] mx-auto px-6">
          {/* Coco - click to cycle */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
            className="mb-6 cursor-pointer select-none" onClick={() => setCocoIdx(i => (i + 1) % cocoStates.length)} whileTap={{ scale: 0.9 }} title="Click me!">
            <Coco size={80} state={cocoStates[cocoIdx]} />
          </motion.div>

          <motion.h1 key={cocoIdx} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="text-[24px] font-bold text-text-primary text-center mb-2">{cocoMessages[cocoIdx]}</motion.h1>
          <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
            className="text-sm text-text-secondary text-center mb-8">
            Your cowork agent for security reviews. Tag documents, ask questions, or hand me a questionnaire.
            <button onClick={startDemo} className="inline-flex items-center gap-1 ml-1 text-brand-500 hover:text-brand-400 transition-colors font-medium">
              <Sparkles className="w-3.5 h-3.5" />View guided demo
            </button>
          </motion.p>

          {/* Resume conversation banner */}
          {messages.length > 0 && (
            <motion.button initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.45 }}
              onClick={() => setChatStarted(true)}
              className="w-full flex items-center gap-3 px-4 py-3 mb-4 rounded-xl bg-brand-500/5 border border-brand-600/20 hover:border-brand-500/40 transition-all text-left group">
              <Coco size={24} state={agentWorking ? "sorting" : "idle"} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary group-hover:text-brand-400 transition-colors">Resume conversation</p>
                <p className="text-[11px] text-text-muted truncate">{messages[messages.length - 1]?.text?.substring(0, 60) || "Continue where you left off"}...</p>
              </div>
              <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-brand-400 transition-colors shrink-0" />
            </motion.button>
          )}

          {/* Chat input */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="w-full mb-6">
            <div className="rounded-2xl bg-bg-surface border border-border-default focus-within:border-brand-500 focus-within:shadow-[0_0_24px_var(--brand-glow-sm)] transition-all overflow-hidden">
              {/* Tag suggestions row */}
              <div className="flex items-center gap-1.5 px-4 pt-3 pb-1">
                <div className="shrink-0">
                  <PixelAIIcon size={14} active />
                </div>
                {AVAILABLE_DOCS.slice(0, 4).map(doc => (
                  <button key={doc.tag} onClick={() => setInput(prev => prev + doc.tag + " ")}
                    className="flex items-center gap-1 px-2 py-1 rounded-md bg-bg-hover text-[10px] text-text-secondary hover:text-brand-400 hover:bg-brand-500/10 transition-colors border border-transparent hover:border-brand-600/20">
                    <FileText className="w-3 h-3" />{doc.tag}
                  </button>
                ))}
              </div>

              {/* Textarea */}
              <div className="px-4 py-2">
                <textarea value={input} onChange={handleInputChange}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Help me with my security review, or try @soc2-type2..."
                  className="bg-transparent outline-none text-text-primary placeholder:text-text-muted w-full text-sm resize-none leading-relaxed"
                  rows={2} aria-label="Message Coco" />
              </div>

              {/* Action bar */}
              <div className="flex items-center justify-between px-4 pb-3 pt-1">
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-1.5 text-[11px] text-text-muted hover:text-brand-400 transition-colors">
                    <FolderDown className="w-3.5 h-3.5" />Project
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  <button className="flex items-center gap-1.5 text-[11px] text-text-muted hover:text-brand-400 transition-colors">
                    <Paperclip className="w-3.5 h-3.5" />Attach
                  </button>
                </div>
                <button onClick={handleSend} disabled={!input.trim()}
                  className="p-2 bg-brand-500 rounded-lg hover:bg-brand-400 transition-colors disabled:opacity-20" aria-label="Send">
                  <Send className="w-4 h-4 text-bg-primary" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Action cards */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="w-full grid grid-cols-3 gap-3">
            <button onClick={startDemo}
              className="flex items-center gap-3 p-4 rounded-xl bg-bg-surface border border-border-default hover:border-brand-600/40 transition-all text-left group cursor-pointer">
              <div className="w-9 h-9 rounded-lg bg-brand-500/10 flex items-center justify-center shrink-0 group-hover:bg-brand-500/20 transition-colors">
                <FileText className="w-4 h-4 text-brand-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary group-hover:text-brand-400 transition-colors whitespace-nowrap">Start a security review</p>
                <p className="text-xs text-text-muted mt-0.5">SOC 2, ISO 27001, and more</p>
              </div>
            </button>

            <button onClick={startDemo}
              className="flex items-center gap-3 p-4 rounded-xl bg-bg-surface border border-border-default hover:border-brand-600/40 transition-all text-left group cursor-pointer">
              <div className="w-9 h-9 rounded-lg bg-brand-500/10 flex items-center justify-center shrink-0 group-hover:bg-brand-500/20 transition-colors">
                <Search className="w-4 h-4 text-brand-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary group-hover:text-brand-400 transition-colors whitespace-nowrap">Search documents</p>
                <p className="text-xs text-text-muted mt-0.5">Find policies, reports, or FAQs</p>
              </div>
            </button>

            <button onClick={() => setMcpOpen(true)}
              className="flex items-center gap-3 p-4 rounded-xl bg-bg-surface border border-border-default hover:border-brand-600/40 transition-all text-left group cursor-pointer">
              <div className="w-9 h-9 rounded-lg bg-brand-500/10 flex items-center justify-center shrink-0 group-hover:bg-brand-500/20 transition-colors">
                <Plug className="w-4 h-4 text-brand-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary group-hover:text-brand-400 transition-colors">Connect MCP</p>
                <p className="text-xs text-text-muted mt-0.5">Link your AI tools directly</p>
              </div>
            </button>
          </motion.div>
          <McpConnectFlow open={mcpOpen} onClose={() => setMcpOpen(false)} />
          {viewerCitation && <DocumentViewer citation={viewerCitation} onClose={() => setViewerCitation(null)} />}
        </div>
      </div>
    );
  }

  // ── ACTIVE CHAT STATE ──
  return (
    <div className="h-full flex flex-col">
      {/* Chat header */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-border-default bg-bg-surface/50">
        <button onClick={() => setChatStarted(false)}
          className="p-1.5 rounded-lg hover:bg-bg-hover transition-colors shrink-0" aria-label="Back to home">
          <ArrowLeft className="w-4 h-4 text-text-muted" />
        </button>
        <Coco size={32} state={sharedCocoAnim} />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-text-primary text-sm">Coco</span>
            <span className="text-[10px] text-text-muted">· cowork agent</span>
            <span className={`w-2 h-2 rounded-full ${sharedCocoStatus === "working" ? "bg-yellow-500 animate-pulse" : sharedCocoStatus === "done" ? "bg-brand-500" : "bg-text-muted/30"}`} />
          </div>
          <p className="text-[11px] text-text-muted">{sharedCocoStatus === "working" ? "Working through your questionnaire..." : sharedCocoStatus === "done" ? "Task complete - ready for review" : `Reviewing ${tc.name} Trust Center`}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, i) => {
          const prevMsg = messages[i - 1];
          const isConsecutiveAgent = msg.role === "agent" && prevMsg?.role === "agent";
          const showCocoAvatar = msg.role === "agent" && !isConsecutiveAgent;
          return (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "gap-2.5"} ${isConsecutiveAgent ? "!mt-1.5" : ""}`}>
            {msg.role === "agent" && (showCocoAvatar
              ? <Coco size={28} state={msg.state || "idle"} className="shrink-0 mt-1" />
              : <div className="w-[28px] shrink-0" /> /* spacer to maintain alignment */
            )}
            <div className={`${msg.comparisonTable ? "max-w-[720px]" : "max-w-[600px]"} ${msg.role === "user"
              ? "bg-brand-500/15 rounded-xl rounded-tr-none p-3.5 border border-brand-600/30"
              : "bg-bg-surface rounded-xl rounded-tl-none p-3.5 border border-border-default"}`}>
              {/* File upload attachment */}
              {msg.uploadFile && (
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-3 p-2.5 mb-2 rounded-lg bg-bg-surface/50 border border-border-default/50">
                  <div className="w-9 h-9 rounded-lg bg-brand-500/10 flex items-center justify-center shrink-0">
                    <Upload className="w-4 h-4 text-brand-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-text-primary truncate">{msg.uploadFile.name}</p>
                    <p className="text-[10px] text-text-muted">{msg.uploadFile.type} · {msg.uploadFile.size}</p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0" />
                </motion.div>
              )}
              {/* Inline task progress checklist */}
              {msg._isTaskProgress && tasks.length > 0 && (
                <div className="mb-3">
                  <div className="bg-bg-elevated/50 rounded-lg border border-border-default p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-medium text-text-secondary">CAIQ Auto-fill Progress</span>
                      <span className="text-[10px] text-brand-500 font-semibold">{doneCount}/{tasks.length}</span>
                    </div>
                    <ProgressBar value={tasks.length > 0 ? (doneCount / tasks.length) * 100 : 0} height={3} className="mb-2.5" />
                    <div className="space-y-0.5">
                      {tasks.map((task) => (
                        <div key={task.id} className={`flex items-start gap-2 px-2 py-1.5 rounded-md transition-colors ${task.status === "active" ? "bg-brand-500/5" : task.status === "done" ? "opacity-40" : ""}`}>
                          <div className="mt-0.5 shrink-0">{taskStatusIcon(task.status)}</div>
                          <div className="min-w-0">
                            <p className={`text-[11px] font-medium ${task.status === "active" ? "text-brand-400" : task.status === "done" ? "text-text-muted line-through" : "text-text-primary"}`}>{task.label}</p>
                            {task.status === "active" && <p className="text-[10px] text-text-muted truncate">{task.detail}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                    {!agentWorking && doneCount === tasks.length && tasks.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-border-default/50">
                        <p className="text-[11px] text-brand-400 font-medium">All steps complete</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {/* Thinking state - expandable, auto-collapses when next message arrives */}
              {msg.thinking && (() => {
                const isLatest = i === messages.length - 1;
                const expanded = isLatest || thoughtExpanded;
                return (
                <div className={isLatest ? "mb-2" : "mb-1"}>
                  <button onClick={() => setThoughtExpanded(e => !e)}
                    className="flex items-center gap-1.5 text-[11px] text-text-muted hover:text-text-secondary transition-colors mb-1">
                    <motion.div animate={{ rotate: expanded ? 90 : 0 }}><ChevronDown className="w-3 h-3 -rotate-90" /></motion.div>
                    {isLatest ? <Loader className="w-3 h-3 animate-spin text-brand-400" /> : <CheckCircle2 className="w-3 h-3 text-brand-500" />}
                    <span>{isLatest ? "Thinking..." : "Thought process"}</span>
                  </button>
                  <AnimatePresence>
                    {expanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden">
                        <div className="pl-5 border-l border-border-default/50 space-y-1 py-1">
                          {msg.thinking.map((thought, ti) => (
                            <motion.p key={ti} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: isLatest ? ti * 0.5 : 0 }}
                              className="text-[11px] text-text-muted">{thought}</motion.p>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                ); })()}
              {msg.text && <RichText text={msg.text} citations={msg.citations} onCitationClick={setViewerCitation} animate={msg.role === "agent" && i === messages.length - 1} />}
              {/* Citation reference cards - delayed until text animation finishes */}
              {msg.citations && (() => {
                const isLatestAgent = msg.role === "agent" && i === messages.length - 1;
                const textDelay = isLatestAgent && msg.text ? getTextDuration(msg.text) + 0.5 : 0;
                return (
                <motion.div
                  initial={isLatestAgent ? { opacity: 0, y: 8 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: textDelay, duration: 0.4 }}
                  className="space-y-2 mt-3 pt-3 border-t border-border-default/50">
                  {msg.citations.map((cit, j) => (
                    <motion.button key={cit.id} onClick={() => setViewerCitation(cit)}
                      initial={isLatestAgent ? { opacity: 0, x: -8 } : false}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: textDelay + j * 0.3, duration: 0.3 }}
                      className="w-full flex items-start gap-2.5 p-2.5 rounded-lg bg-bg-primary/40 border border-border-default/50 hover:border-brand-600/30 transition-all text-left group">
                      <FileText className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-text-primary group-hover:text-brand-400 transition-colors">[{j + 1}] {cit.docName}</p>
                        <p className="text-[10px] text-text-muted">p.{cit.page} - {cit.section}</p>
                        <p className="text-[10px] text-text-secondary mt-1 line-clamp-2 italic">"{cit.excerpt.substring(0, 120)}..."</p>
                      </div>
                      <Eye className="w-3.5 h-3.5 text-text-muted group-hover:text-brand-400 shrink-0 mt-0.5 transition-colors" />
                    </motion.button>
                  ))}
                </motion.div>
                ); })()}
              {msg.docList && (
                <div className="space-y-2 mt-2">
                  {msg.docList.map((doc, j) => {
                    const full = AVAILABLE_DOCS.find(d => d.tag === doc.tag);
                    return (
                      <div key={j} className="flex items-center gap-3 p-2.5 rounded-lg bg-bg-primary/40 border border-border-default/50">
                        <FileText className="w-4 h-4 text-brand-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-text-primary truncate">{full?.name || doc.tag}</p>
                          <p className="text-[10px] text-text-muted">{doc.relevance} · {full?.type} · {full?.date}</p>
                        </div>
                        <AddToCartButton item={{ type: "document", title: full?.name || doc.tag, subtitle: `${full?.type || "PDF"} · ${full?.date || "2026"}`, desc: full?.desc }} />
                      </div>
                    );
                  })}
                </div>
              )}
              {msg.card && (
                <div>
                  <div className="bg-brand-500/10 rounded-lg p-3 border border-brand-600/20 mb-2">
                    <p className="text-sm font-semibold text-brand-400">{msg.card.title}</p>
                  </div>
                  <div className="space-y-1.5">
                    {msg.card.items.map((item, j) => (
                      <p key={j} className="text-xs text-text-primary flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
                        {item.label}
                      </p>
                    ))}
                  </div>
                  {msg.showDownload && (
                    <button onClick={handleDownloadQuestionnaire} disabled={questionnaireDownloaded}
                      className={`mt-3 w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${questionnaireDownloaded ? "bg-bg-hover text-text-muted" : "border border-brand-500 text-brand-500 hover:bg-brand-500/10"}`}>
                      {questionnaireDownloaded ? <><CheckCircle2 className="w-4 h-4" /> Downloaded</> : <><Download className="w-4 h-4" /> Download questionnaire</>}
                    </button>
                  )}
                </div>
              )}
              {/* Gap resolution draft email - delayed until text animation finishes */}
              {msg.gapDraft && (() => {
                const isLatestAgent = msg.role === "agent" && i === messages.length - 1;
                const draftDelay = isLatestAgent && msg.text ? getTextDuration(msg.text) + 0.8 : 0;
                return (
                <motion.div
                  initial={isLatestAgent ? { opacity: 0, y: 8 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: draftDelay, duration: 0.4 }}
                  className="mt-3 rounded-lg border border-border-default overflow-hidden">
                  <div className="px-3 py-2 bg-bg-elevated/50 border-b border-border-default flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-3.5 h-3.5 text-text-muted" />
                      <span className="text-[11px] font-medium text-text-primary">Draft message to admin</span>
                    </div>
                    {draftSent && <span className="text-[10px] text-brand-500 font-medium">Sent ✓</span>}
                  </div>
                  {!draftSent && (
                    <>
                      <div className="p-3 space-y-2">
                        <div className="flex items-center gap-2 text-[11px]">
                          <span className="text-text-muted">To:</span>
                          <span className="text-text-primary font-medium">{msg.gapDraft.to}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px]">
                          <span className="text-text-muted">Subject:</span>
                          <span className="text-text-primary">{msg.gapDraft.subject}</span>
                        </div>
                        <div className="border-t border-border-default/50 pt-2 mt-2">
                          <pre className="text-[11px] text-text-secondary leading-relaxed whitespace-pre-wrap font-sans">{msg.gapDraft.body}</pre>
                        </div>
                      </div>
                      <div className="px-3 py-2 border-t border-border-default flex items-center gap-2">
                        <button onClick={handleSendDraft}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500 text-bg-primary text-[11px] font-medium hover:bg-brand-400 transition-colors">
                          <Send className="w-3 h-3" /> Send to admin
                        </button>
                        <button onClick={() => setDraftModalOpen(true)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-hover text-text-secondary text-[11px] hover:text-text-primary transition-colors border border-border-default">
                          Edit draft
                        </button>
                      </div>
                    </>
                  )}
                  {draftSent && (
                    <div className="p-3">
                      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-brand-500/5 border border-brand-600/20">
                        <Coco size={20} state="celebrating" className="shrink-0" />
                        <p className="text-[11px] text-brand-400 font-medium">Message sent to {msg.gapDraft.to}</p>
                      </div>
                    </div>
                  )}
                </motion.div>
                ); })()}
              {/* Vendor comparison table */}
              {msg.comparisonTable && (() => {
                const isLatest = msg.role === "agent" && i === messages.length - 1;
                const tblDelay = isLatest && msg.text ? getTextDuration(msg.text) + 0.8 : 0;
                const sIcon = (s) => s === "good" ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                  : s === "warning" ? <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                  : <X className="w-3.5 h-3.5 text-red-400 shrink-0" />;
                const sBg = (s) => s === "good" ? "bg-green-500/5" : s === "warning" ? "bg-yellow-500/5" : "bg-red-500/5";
                const tbl = msg.comparisonTable;
                return (
                <motion.div
                  initial={isLatest ? { opacity: 0, y: 8 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: tblDelay, duration: 0.4 }}
                  className="mt-3">
                  {/* MCP connection badge */}
                  <div className="flex items-center gap-1.5 mb-2">
                    <Plug className="w-3 h-3 text-brand-500" />
                    <span className="text-[10px] text-brand-400 font-medium">Connected via MCP to 3 Trust Centers</span>
                  </div>
                  {/* Table */}
                  <div className="rounded-lg border border-border-default overflow-hidden text-[11px]">
                    {/* Header */}
                    <div className="grid grid-cols-4 bg-bg-elevated/50 border-b border-border-default">
                      <div className="px-2.5 py-2 text-[10px] font-medium text-text-muted uppercase tracking-wider" />
                      {tbl.vendors.map((v, vi) => (
                        <div key={vi} className="px-2.5 py-2 text-[10px] font-semibold text-text-primary text-center">{v}</div>
                      ))}
                    </div>
                    {/* Rows */}
                    {tbl.rows.map((row, ri) => (
                      <motion.div key={ri}
                        initial={isLatest ? { opacity: 0 } : false}
                        animate={{ opacity: 1 }}
                        transition={{ delay: tblDelay + 0.3 + ri * 0.15 }}
                        className={`grid grid-cols-4 border-b border-border-default/50 last:border-b-0 ${ri % 2 ? "bg-bg-elevated/20" : ""}`}>
                        <div className="px-2.5 py-2 font-medium text-text-primary flex items-center">{row.label}</div>
                        {row.cells.map((cell, ci) => (
                          <div key={ci} className={`px-2.5 py-2 text-center ${sBg(cell.status)}`}>
                            <div className="flex items-center justify-center gap-1 mb-0.5">
                              {sIcon(cell.status)}
                              <span className="text-text-primary leading-tight">{cell.value}</span>
                            </div>
                            <p className="text-[9px] text-text-muted italic">{cell.source}</p>
                          </div>
                        ))}
                      </motion.div>
                    ))}
                  </div>
                  {/* Summary */}
                  {msg.comparisonSummary && (
                    <motion.div
                      initial={isLatest ? { opacity: 0 } : false}
                      animate={{ opacity: 1 }}
                      transition={{ delay: tblDelay + 1.5 }}
                      className="mt-3 p-3 rounded-lg bg-bg-elevated/30 border border-border-default/50">
                      <RichText text={msg.comparisonSummary} />
                    </motion.div>
                  )}
                  {/* Action buttons */}
                  {msg.comparisonActions && (
                    <motion.div
                      initial={isLatest ? { opacity: 0 } : false}
                      animate={{ opacity: 1 }}
                      transition={{ delay: tblDelay + 2.5 }}
                      className="flex items-center gap-2 mt-3">
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500 text-bg-primary text-[11px] font-medium hover:bg-brand-400 transition-colors">
                        <Download className="w-3 h-3" /> Export comparison (PDF)
                      </button>
                      {(() => {
                        const comparisonAdded = isItemAdded("Vendor IR Comparison");
                        return (
                          <button
                            onClick={() => { if (!comparisonAdded) { addItem({ title: "Vendor IR Comparison", type: "Report", desc: "Side-by-side incident response comparison across Mediacore, Conveyor, and Nunita" }); setPanelTab("collection"); } }}
                            disabled={comparisonAdded}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] transition-colors border ${comparisonAdded ? "bg-brand-500/20 text-brand-400 border-brand-500/30 cursor-default opacity-70" : "bg-bg-hover text-text-secondary hover:text-text-primary border-border-default cursor-pointer"}`}>
                            <Bookmark className="w-3 h-3" /> {comparisonAdded ? "Added to collection" : "Add to review collection"}
                          </button>
                        );
                      })()}
                    </motion.div>
                  )}
                </motion.div>
                ); })()}
            </div>
          </motion.div>
        ); })}

        {/* Task checklist is now rendered inline via _isTaskProgress messages */}

        {/* MCP comparison prompt - appears after gap draft is sent */}
        {mcpPromptReady && !comparisonStarted && !currentPrompt && !agentWorking && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: [0, 0.25, 0.7, 0.25, 0.7, 0.25, 0.7], y: [8, 8, 0] }}
            transition={{
              opacity: { duration: 8, delay: 0.5, times: [0, 0.01, 0.17, 0.34, 0.51, 0.68, 1] },
              y: { duration: 0.4, delay: 0.5 },
            }}
            className="flex justify-end">
            <button onClick={handleStartComparison}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-brand-500/15 border border-brand-600/30 hover:bg-brand-500/25 transition-colors cursor-pointer group max-w-[520px]">
              <div className="flex-1 text-right">
                <p className="text-sm text-text-primary group-hover:text-brand-400 transition-colors">
                  Compare breach notification timelines and incident response across{" "}
                  <span className="text-brand-400 font-semibold">@mediacore</span>{" "}
                  <span className="text-brand-400 font-semibold">@conveyor</span>{" "}
                  <span className="text-brand-400 font-semibold">@nunita</span>
                </p>
                <p className="text-[11px] text-brand-400/60 mt-1 flex items-center justify-end gap-1">Click to continue <span className="inline-block animate-[pulse_2s_ease-in-out_infinite]">→</span></p>
              </div>
            </button>
          </motion.div>
        )}

        {/* Demo prompt button - appears after text animation finishes, pulses 25%→70% */}
        {currentPrompt && !agentWorking && (
          <motion.div
            key={demoStep}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: [0, 0.25, 0.7, 0.25, 0.7, 0.25, 0.7], y: [8, 8, 0] }}
            transition={{
              opacity: { duration: 8, delay: promptAppearDelay, times: [0, 0.01, 0.17, 0.34, 0.51, 0.68, 1] },
              y: { duration: 0.4, delay: promptAppearDelay },
            }}
            className="flex justify-end">
            {currentPrompt.isUpload ? (
              <button onClick={() => advanceDemo(currentPrompt.label, currentPrompt.uploadFile)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-brand-500/15 border border-brand-600/30 border-dashed hover:bg-brand-500/25 transition-colors cursor-pointer group">
                <Upload className="w-5 h-5 text-brand-400 group-hover:text-brand-300 transition-colors" />
                <div className="text-left">
                  <p className="text-sm text-text-primary group-hover:text-brand-400 transition-colors">{currentPrompt.uploadFile.name}</p>
                  <p className="text-[10px] text-text-muted mt-0.5">{currentPrompt.uploadFile.type} · {currentPrompt.uploadFile.size} - Click to upload</p>
                </div>
                <Paperclip className="w-4 h-4 text-text-muted" />
              </button>
            ) : (
              <button onClick={() => advanceDemo(currentPrompt.label)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-brand-500/15 border border-brand-600/30 hover:bg-brand-500/25 transition-colors cursor-pointer group">
                <div className="flex-1 text-right">
                  <p className="text-sm text-text-primary group-hover:text-brand-400 transition-colors">{currentPrompt.label}</p>
                  <p className="text-[11px] text-brand-400/60 mt-1 flex items-center justify-end gap-1">Click to continue <span className="inline-block animate-[pulse_2s_ease-in-out_infinite]">→</span></p>
                </div>
              </button>
            )}
          </motion.div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border-default bg-bg-surface/30">
        <div className="relative">
          <AnimatePresence>
            {showDocSuggestions && (
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                className="absolute bottom-full left-0 right-0 mb-2 bg-bg-elevated border border-border-bright rounded-xl shadow-xl overflow-hidden z-10">
                <div className="px-3 py-1.5 border-b border-border-default"><span className="text-[10px] text-text-muted font-medium">Available documents</span></div>
                <div className="max-h-[200px] overflow-y-auto">
                  {AVAILABLE_DOCS.map(doc => (
                    <button key={doc.tag} onClick={() => insertDoc(doc.tag)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-bg-hover transition-colors">
                      <FileText className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-text-primary truncate">{doc.name}</p>
                        <p className="text-[10px] text-text-muted">{doc.tag} · {doc.type}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex items-center gap-2 bg-bg-surface rounded-lg border border-border-default px-3 py-2.5">
            <button className="p-1 hover:bg-bg-hover rounded transition-colors" aria-label="Attach"><Paperclip className="w-4 h-4 text-text-muted" /></button>
            <input type="text" value={input} onChange={handleInputChange}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              onBlur={() => setTimeout(() => setShowDocSuggestions(false), 200)}
              placeholder={agentWorking ? "Coco is working..." : "Type @ to tag documents, or ask anything..."}
              disabled={agentWorking}
              className="bg-transparent outline-none text-sm text-text-primary placeholder:text-text-muted flex-1 disabled:opacity-50" />
            <button onClick={handleSend} disabled={agentWorking || !input.trim()}
              className="p-1.5 bg-brand-500 rounded-lg hover:bg-brand-400 transition-colors disabled:opacity-30" aria-label="Send">
              <Send className="w-3.5 h-3.5 text-bg-primary" />
            </button>
          </div>
        </div>
      </div>
      {/* Document viewer overlay */}
      {viewerCitation && <DocumentViewer citation={viewerCitation} onClose={() => setViewerCitation(null)} />}

      {/* Draft edit modal */}
      <AnimatePresence>
        {draftModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={(e) => { if (e.target === e.currentTarget) setDraftModalOpen(false); }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-bg-surface border border-border-default rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border-default">
                <p className="text-sm font-semibold text-text-primary">Edit draft message</p>
                <button onClick={() => setDraftModalOpen(false)} className="p-1.5 rounded-lg hover:bg-bg-hover transition-colors">
                  <X className="w-4 h-4 text-text-muted" />
                </button>
              </div>
              <div className="p-5 space-y-3">
                <div>
                  <label className="text-[11px] font-medium text-text-muted mb-1 block">To</label>
                  <input type="text" defaultValue={"admin@" + (tc?.name?.toLowerCase() || "vendor") + ".com"}
                    className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-default text-sm text-text-primary outline-none focus:border-brand-500 transition-colors" />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-text-muted mb-1 block">Subject</label>
                  <input type="text" defaultValue="Information Request - CSA CAIQ Gap Items"
                    className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-default text-sm text-text-primary outline-none focus:border-brand-500 transition-colors" />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-text-muted mb-1 block">Message</label>
                  <textarea rows={10} defaultValue={`Hi team,\n\nI'm completing a CSA CAIQ assessment and have 3 items that need input from your side:\n\n1. CEK-03: Do you support client-managed encryption keys (BYOK)? If so, what key management service is used?\n\n2. CEK-08: What are your key custodian procedures and segregation of duties for encryption key access?\n\n3. DSP-17: What is your data retention policy for backups after contract termination?\n\nCould you provide documentation or responses for these? Happy to jump on a call if easier.\n\nThanks!`}
                    className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-default text-sm text-text-primary outline-none focus:border-brand-500 transition-colors resize-none leading-relaxed" />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border-default">
                <button onClick={() => setDraftModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary transition-colors">
                  Cancel
                </button>
                <button onClick={() => { setDraftModalOpen(false); handleSendDraft(); }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-500 text-bg-primary text-sm font-medium hover:bg-brand-400 transition-colors">
                  <Send className="w-3.5 h-3.5" /> Send
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   VIEW: ACME CORP (Admin)
   ═══════════════════════════════════════════════════════════════ */

function AcmeCorpDashboard() {
  const [expandedRow, setExpandedRow] = useState(null);
  const adminStats = [
    { label: "Questions Answered", value: "312" },
    { label: "Gaps Resolved", value: "47" },
    { label: "AI Accuracy", value: "96%" },
    { label: "Avg Response", value: "1.8hr" },
  ];
  const gapRequests = [
    { id: 1, title: "Data Residency in EU", requester: "Jordan Chen", company: "BigCorp", time: "3 hours ago", priority: "high",
      context: "Jordan asked about EU data residency during a SIG Lite questionnaire. Coco found partial answers in your Privacy Policy but couldn't determine specific AWS regions." },
    { id: 2, title: "Penetration Test Methodology", requester: "Alex Rivera", company: "TechStart", time: "1 day ago", priority: "medium",
      context: "Alex requested details about penetration testing methodology. Coco referenced the annual pentest report but couldn't extract specific methodology details." },
    { id: 3, title: "SSO SAML Configuration", requester: "Sam Park", company: "FinanceInc", time: "2 days ago", priority: "low",
      context: "Sam asked about SSO SAML integration. Coco found references to SSO support but couldn't locate specific SAML metadata endpoints." },
  ];
  const contentGaps = [
    { topic: "Data Residency", count: 47 }, { topic: "SSO Configuration", count: 31 },
    { topic: "Pen Test Reports", count: 24 }, { topic: "Subprocessor List", count: 18 }, { topic: "Incident History", count: 12 },
  ];
  const maxGap = Math.max(...contentGaps.map(g => g.count));
  const priorityColors = {
    high: "bg-red-500/15 text-red-400 border-red-500/30",
    medium: "bg-yellow-500/15 text-yellow-500 border-yellow-500/30",
    low: "bg-bg-hover text-text-secondary border-border-default",
  };
  const adminBadges = [
    { name: "Response Hero", tier: "Bronze", progress: 25, target: 100, color: "var(--color-badge-bronze)" },
    { name: "Content Master", tier: "—", progress: 92, target: 95, color: "var(--color-brand-500)", label: "92% accuracy (need 95%)" },
    { name: "Always Fresh", tier: "Silver", progress: 50, target: 100, color: "var(--color-badge-silver)", label: "12/24 months" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-text-primary">Trust Scorecard</h1>
          <p className="text-sm text-text-secondary mt-1">Trust Center health and performance</p>
          <div className="flex gap-2 mt-2">
            <span className="text-xs px-2.5 py-1 rounded-full border border-badge-bronze/40 text-badge-bronze bg-badge-bronze/10">Response Hero (Bronze)</span>
            <span className="text-xs px-2.5 py-1 rounded-full border border-badge-silver/40 text-badge-silver bg-badge-silver/10">Always Fresh (Silver)</span>
          </div>
        </div>
      </div>

      <div className="bg-bg-surface rounded-xl p-6 border border-border-default mb-6">
        <ContributionGraph weeks={52} cellSize={11} gap={2} seed={77} label="Trust Center Health - Last 12 Months" showMonths showLegend />
        <div className="grid grid-cols-4 gap-4 mt-5">
          {adminStats.map(s => (
            <div key={s.label} className="text-center bg-bg-primary/40 rounded-xl p-3 border border-border-default/50">
              <p className="text-xl font-bold text-text-primary">{s.value}</p>
              <p className="text-xs text-text-secondary">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-bg-surface rounded-xl border border-border-default mb-6">
        <div className="px-5 py-4 border-b border-border-default"><h2 className="text-lg font-semibold text-text-primary">Gap Requests</h2></div>
        {gapRequests.map(req => (
          <div key={req.id} className="border-b border-border-default/50 last:border-0">
            <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-bg-hover transition-colors text-left"
              onClick={() => setExpandedRow(expandedRow === req.id ? null : req.id)}>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-sm font-medium text-text-primary truncate">{req.title}</span>
                <span className="text-xs text-text-muted shrink-0">— {req.requester} ({req.company})</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-text-muted">{req.time}</span>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${priorityColors[req.priority]}`}>
                  {req.priority.charAt(0).toUpperCase() + req.priority.slice(1)}
                </span>
                {req.priority === "high" && <button className="px-3 py-1 text-xs rounded-lg bg-brand-500 text-bg-primary font-medium hover:bg-brand-400 transition-colors" onClick={e => e.stopPropagation()}>Respond</button>}
                <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${expandedRow === req.id ? "rotate-180" : ""}`} />
              </div>
            </button>
            <AnimatePresence>
              {expandedRow === req.id && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="px-5 pb-4">
                    <div className="bg-bg-primary/40 rounded-lg p-4 flex gap-3">
                      <Coco size={28} state="idle" className="shrink-0" />
                      <div><p className="text-xs font-medium text-brand-500 mb-1">Coco's Context</p><p className="text-sm text-text-secondary leading-relaxed">{req.context}</p></div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-bg-surface rounded-xl p-5 border border-border-default">
          <div className="flex items-center gap-2 mb-4"><Sparkles className="w-5 h-5 text-brand-500" /><h3 className="text-base font-semibold text-text-primary">Coco Insights</h3></div>
          <div className="bg-brand-500/5 rounded-lg p-4 border border-brand-600/20">
            <p className="text-sm text-text-primary leading-relaxed">🔍 Visitors asked about <strong className="text-brand-400">data residency 47 times</strong> this month, but your KB only has 2 answers. Want me to draft 5 more FAQs?</p>
            <button className="mt-3 px-3 py-1.5 text-xs rounded-lg bg-brand-500 text-bg-primary font-medium hover:bg-brand-400 transition-colors">Draft FAQs</button>
          </div>
        </div>
        <div className="bg-bg-surface rounded-xl p-5 border border-border-default">
          <h3 className="text-base font-semibold text-text-primary mb-4">Content Gaps</h3>
          <div className="space-y-3">
            {contentGaps.map(gap => (
              <div key={gap.topic}>
                <div className="flex items-center justify-between mb-1"><span className="text-xs text-text-secondary">{gap.topic}</span><span className="text-xs text-text-muted">{gap.count}q</span></div>
                <ProgressBar value={(gap.count / maxGap) * 100} color={gap.count > 30 ? "var(--color-status-error)" : gap.count > 20 ? "var(--color-status-warning)" : "var(--color-brand-500)"} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Your Badges</h2>
        <div className="grid grid-cols-3 gap-4">
          {adminBadges.map(b => (
            <div key={b.name} className="bg-bg-surface rounded-xl p-5 border border-border-default">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2"><Award className="w-5 h-5" style={{ color: b.color }} /><span className="text-sm font-semibold text-text-primary">{b.name}</span></div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border" style={{ borderColor: b.color + "60", color: b.color }}>{b.tier}</span>
              </div>
              <p className="text-xs text-text-secondary mb-3">{b.label || `${b.progress}/${b.target}`}</p>
              <ProgressBar value={(b.progress / b.target) * 100} color={b.color} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PROFILE PANEL (slide-out)
   ═══════════════════════════════════════════════════════════════ */

function ProfilePanel({ onClose }) {
  const [privacy, setPrivacy] = useState({ showActivity: false, showBadges: true, crossMemory: true, showGraph: false });

  const badges = [
    { name: "Trust Explorer", tier: "silver", icon: <Compass className="w-5 h-5" />, desc: "Visited 25 Trust Centers", progress: 78 },
    { name: "Gap Finder", tier: "bronze", icon: <Bug className="w-5 h-5" />, desc: "Reported 23 missing items", progress: 62 },
    { name: "Questionnaire Ace", tier: "default", icon: <FileText className="w-5 h-5" />, desc: "Completed 8 questionnaires", progress: 45 },
    { name: "Speed Demon", tier: "default", icon: <Zap className="w-5 h-5" />, desc: "Review in <1hr", progress: 55 },
    { name: "Trust Streak", tier: "bronze", icon: <Flame className="w-5 h-5" />, desc: "14 days active", progress: 70 },
    { name: "Pair Extraordinaire", tier: "default", icon: <Users className="w-5 h-5" />, desc: "3 collab reviews", progress: 25 },
  ];

  const tierStyle = { silver: "border-badge-silver/40 text-badge-silver", bronze: "border-badge-bronze/40 text-badge-bronze", default: "border-brand-500/40 text-brand-500" };

  const activities = [
    { text: "Completed SIG Lite review", time: "2 hours ago", icon: <FileText className="w-3.5 h-3.5" /> },
    { text: "Downloaded SOC 2 from CloudVault", time: "yesterday", icon: <Download className="w-3.5 h-3.5" /> },
    { text: "Reported missing FAQ at NetGuard", time: "2 days ago", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
    { text: "Earned Bronze Gap Finder! 🎉", time: "3 days ago", icon: <Award className="w-3.5 h-3.5" /> },
    { text: "Visited FinanceVault Trust Center", time: "4 days ago", icon: <Globe className="w-3.5 h-3.5" /> },
    { text: "Submitted questionnaire to CloudWatch", time: "5 days ago", icon: <Send className="w-3.5 h-3.5" /> },
  ];

  return (
    <motion.div className="fixed inset-0 z-50 flex" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div className="relative ml-auto w-[560px] h-full bg-bg-primary border-l border-border-default overflow-y-auto"
        initial={{ x: 560 }} animate={{ x: 0 }} exit={{ x: 560 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
        <div className="sticky top-0 z-10 bg-bg-primary/90 backdrop-blur-xl border-b border-border-default px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">Profile</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-bg-hover rounded-lg transition-colors" aria-label="Close"><X className="w-4 h-4 text-text-muted" /></button>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-bg-elevated border border-border-default flex items-center justify-center"><Coco size={64} state="idle" /></div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-text-primary">Jordan Chen</h3>
              <p className="text-sm text-text-secondary">Security Analyst at BigCorp</p>
              <div className="flex items-center gap-2 mt-1 text-badge-bronze"><Flame className="w-4 h-4" /><span className="text-sm font-semibold">14-day streak</span><span className="text-xs text-text-muted ml-1">· Best: 32</span></div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[{ v:"12", l:"Trust Centers" }, { v:"8", l:"Questionnaires" }, { v:"23", l:"Gaps" }, { v:"7", l:"Badges" }].map(s => (
              <div key={s.l} className="text-center bg-bg-surface rounded-xl p-3 border border-border-default"><p className="text-lg font-bold text-text-primary">{s.v}</p><p className="text-[10px] text-text-secondary">{s.l}</p></div>
            ))}
          </div>
          <div className="bg-bg-surface rounded-xl p-4 border border-border-default">
            <ContributionGraph weeks={52} cellSize={9} gap={2} seed={99} label="Activity - Last 12 Months" showMonths showLegend />
          </div>
          <div>
            <h3 className="text-base font-semibold text-text-primary mb-3">Badges</h3>
            <div className="grid grid-cols-2 gap-3">
              {badges.map(b => (
                <div key={b.name} className={`bg-bg-surface rounded-xl p-3 border ${tierStyle[b.tier]}`}>
                  <div className="flex items-center gap-2 mb-2"><div className={tierStyle[b.tier].split(" ")[1]}>{b.icon}</div><div><p className="text-xs font-semibold text-text-primary">{b.name}</p><p className="text-[10px] text-text-muted">{b.desc}</p></div></div>
                  <ProgressBar value={b.progress} color={b.tier === "bronze" ? "var(--color-badge-bronze)" : b.tier === "silver" ? "var(--color-badge-silver)" : "var(--color-brand-500)"} height={4} />
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-base font-semibold text-text-primary mb-3">Recent Activity</h3>
            <div className="space-y-3 relative">
              <div className="absolute left-[9px] top-2 bottom-2 w-px bg-border-default" />
              {activities.map((a, i) => (
                <div key={i} className="flex items-start gap-3 relative">
                  <div className="w-5 h-5 rounded-full bg-bg-elevated border border-border-default flex items-center justify-center z-10 shrink-0 text-brand-500">{a.icon}</div>
                  <div><p className="text-xs text-text-primary">{a.text}</p><p className="text-[10px] text-text-muted">{a.time}</p></div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3"><ShieldCheck className="w-4 h-4 text-brand-500" /><h3 className="text-base font-semibold text-text-primary">What Coco Remembers</h3></div>
            <div className="bg-bg-surface rounded-xl p-4 border border-border-default">
              <Toggle label="Show activity to admins" checked={privacy.showActivity} onChange={v => setPrivacy(p => ({...p, showActivity: v}))} />
              <Toggle label="Show badges publicly" checked={privacy.showBadges} onChange={v => setPrivacy(p => ({...p, showBadges: v}))} />
              <Toggle label="Cross-Trust Center memory" checked={privacy.crossMemory} onChange={v => setPrivacy(p => ({...p, crossMemory: v}))} />
              <Toggle label="Show activity graph" checked={privacy.showGraph} onChange={v => setPrivacy(p => ({...p, showGraph: v}))} />
              <div className="flex gap-2 mt-3 pt-3 border-t border-border-default">
                <button className="px-3 py-1.5 text-xs rounded-lg bg-bg-elevated border border-border-default text-text-primary hover:bg-bg-hover transition-colors flex items-center gap-1.5"><Download className="w-3.5 h-3.5" /> Download Data</button>
                <button className="px-3 py-1.5 text-xs rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors flex items-center gap-1.5"><Trash2 className="w-3.5 h-3.5" /> Delete All</button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LEFT SIDEBAR
   ═══════════════════════════════════════════════════════════════ */

// Conveyor AI logo SVG
function ConveyorLogo({ size = 20, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M5.09375 11.6681C5.84488 11.4294 6.64737 11.5555 7.28613 12.0119C7.92494 12.4684 8.29554 13.1806 8.29688 13.9572V14.8429C7.84871 14.946 7.38148 15.0001 6.90137 15.0001C6.80942 15.0001 6.71791 14.9982 6.62695 14.9943V13.925C6.62686 13.4309 6.13437 13.0811 5.65625 13.2335C4.91505 13.4699 4.17188 13.702 3.42969 13.9357C2.9046 13.5781 2.43948 13.1416 2.05176 12.6437L5.09375 11.6681ZM10.0039 9.56363C10.6349 9.10754 11.4356 8.98294 12.1943 9.22281L12.9863 9.47573C12.9414 10.0389 12.8172 10.5803 12.625 11.089C12.2894 10.9817 11.9539 10.8737 11.6182 10.7668C11.1468 10.6166 10.6681 10.9633 10.668 11.4503V13.7218C10.1667 14.1087 9.60202 14.4202 8.99219 14.6388L8.99414 11.5109C8.99281 10.7344 9.35782 10.0221 10.0039 9.56363ZM3.7334 8.07925C4.1997 8.7148 4.32686 9.50239 4.08105 10.2335C3.83747 10.9796 3.26193 11.5417 2.51074 11.7804L1.64746 12.0558C1.36497 11.5874 1.14507 11.0774 1 10.5382L2.02734 10.1964C2.50419 10.0378 2.68284 9.46563 2.38379 9.06753C1.93612 8.47159 1.4957 7.8702 1.05566 7.2687C1.24211 6.6596 1.52388 6.09081 1.88477 5.58023L3.7334 8.07925ZM12.0215 1.3107C12.2129 0.896449 12.7979 0.89642 12.9893 1.3107L13.8291 3.18179L15.6895 4.02163C16.1037 4.21307 16.1037 4.798 15.6895 4.98941L13.8291 5.82925L12.9893 7.6896C12.7978 8.10389 12.2022 8.10389 12.0107 7.6896L11.1709 5.81851L9.31055 4.97866C8.8963 4.78723 8.89627 4.2023 9.31055 4.01089L11.1816 3.17105L12.0215 1.3107ZM6.90137 3.00015C7.48922 3.00015 8.05778 3.08206 8.5957 3.23452L6.78516 5.6857C6.32131 6.31369 5.59801 6.67775 4.80859 6.67886C4.01907 6.67986 3.29451 6.32033 2.82812 5.68472L2.33496 5.0187C2.70711 4.6066 3.13657 4.2452 3.61035 3.94644L4.20996 4.78042C4.50276 5.18707 5.11624 5.1886 5.41113 4.78335L6.70605 3.00308C6.77087 3.00108 6.83606 3.00015 6.90137 3.00015Z" fill={color} />
    </svg>
  );
}

// Mediacore logo SVG (from Mediacore Logo.svg)
function MediacoreLogo({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="8" fill="#333366"/>
      <path d="M27.38 11.36L20.24 16.61C20.07 16.73 19.83 16.73 19.66 16.6L12.66 11.36C11.86 10.77 10.72 11.34 10.72 12.34V26.24C10.72 27.7 11.91 28.89 13.37 28.89H26.68C28.14 28.89 29.32 27.7 29.32 26.24V12.34C29.32 11.62 28.73 11.12 28.1 11.12C27.85 11.12 27.6 11.19 27.38 11.36Z" fill="url(#mc_grad)"/>
      <rect x="23.94" y="16.08" width="2.75" height="10.49" rx="1.38" fill="white" opacity="0.8"/>
      <circle cx="25.31" cy="17.45" r="1.38" fill="white"/>
      <rect x="19.61" y="19.37" width="2.75" height="7.2" rx="1.38" fill="white" opacity="0.8"/>
      <circle cx="20.99" cy="20.75" r="1.38" fill="white"/>
      <rect x="15.28" y="22.39" width="2.75" height="4.18" rx="1.38" fill="white" opacity="0.8"/>
      <circle cx="16.66" cy="23.76" r="1.38" fill="white"/>
      <defs><linearGradient id="mc_grad" x1="28" y1="27" x2="0.5" y2="1.6" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6C63FF"/><stop offset="1" stopColor="#F8A4D8"/>
      </linearGradient></defs>
    </svg>
  );
}

// Trust Center data for switcher
const TRUST_CENTERS = [
  {
    id: "conveyor",
    name: "Conveyor",
    subtitle: "Security & Compliance",
    logo: "conveyor",
    accent: "oklch(0.67 0.14 168)", // fixed green - does not change with theme
    stats: { docs: 42, faqs: 128, certs: 6 },
    // Brand theme - oklch hue/chroma pairs
    theme: {
      brandHue: 168, brandChroma: [0.04, 0.07, 0.12, 0.15, 0.15, 0.14, 0.12, 0.10, 0.08, 0.06, 0.04],
      accentHue: 90, accentChroma: [0.05, 0.10, 0.15, 0.17, 0.18, 0.16, 0.14, 0.12, 0.10, 0.07],
    },
    mcpDomain: "trust.conveyor.com/conveyor",
    greeting: "Hey there! Welcome to Conveyor's Trust Center. I'm Coco - your cowork agent for security reviews.",
    tcTitle: "Conveyor Trust Center",
    tcSubtitle: "Transparent security for our customers and partners",
  },
  {
    id: "mediacore",
    name: "MediaCore",
    subtitle: "Digital media experts",
    logo: "mediacore",
    accent: "oklch(0.55 0.27 288)", // fixed purple - does not change with theme
    stats: { docs: 28, faqs: 57, certs: 6 },
    theme: {
      brandHue: 288, brandChroma: [0.03, 0.06, 0.12, 0.18, 0.24, 0.27, 0.22, 0.18, 0.13, 0.09, 0.06],
      accentHue: 340, accentChroma: [0.03, 0.06, 0.10, 0.14, 0.16, 0.14, 0.12, 0.10, 0.08, 0.06],
    },
    mcpDomain: "trust.mediacore.io/mediacore",
    greeting: "Hey there! Welcome to MediaCore's Trust Center. I'm Coco - your cowork agent for security reviews.",
    tcTitle: "MediaCore Trust Center",
    tcSubtitle: "Secure digital media infrastructure for our partners",
  },
];

// Apply brand theme CSS variables when switching trust centers
function applyTcTheme(tc) {
  const t = tc.theme;
  const lightness = [0.97, 0.93, 0.85, 0.77, 0.72, 0.67, 0.59, 0.50, 0.40, 0.30, 0.20];
  // brand-50 through brand-950 (lighter → darker variants of brandHue)
  const lightnessBrand = [0.97, 0.93, 0.85, 0.75, 0.65, 0.55, 0.47, 0.40, 0.33, 0.27, 0.20];
  const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
  const accentSteps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
  const accentLightness = [0.97, 0.93, 0.87, 0.82, 0.78, 0.72, 0.62, 0.52, 0.42, 0.32];

  const root = document.documentElement;
  // Use the hue from Conveyor (168) vs MediaCore (288) to decide lightness
  const isConveyor = t.brandHue < 200;
  const bL = isConveyor ? lightness : lightnessBrand;

  steps.forEach((s, i) => {
    root.style.setProperty(`--color-brand-${s}`, `oklch(${bL[i]} ${t.brandChroma[i]} ${t.brandHue})`);
  });
  accentSteps.forEach((s, i) => {
    root.style.setProperty(`--color-accent-${s}`, `oklch(${accentLightness[i]} ${t.accentChroma[i]} ${t.accentHue})`);
  });
  // Update glows
  root.style.setProperty("--brand-glow-sm", `oklch(${bL[5]} ${t.brandChroma[5]} ${t.brandHue} / 0.1)`);
  root.style.setProperty("--brand-glow-md", `oklch(${bL[5]} ${t.brandChroma[5]} ${t.brandHue} / 0.15)`);
  root.style.setProperty("--brand-glow-lg", `oklch(${bL[5]} ${t.brandChroma[5]} ${t.brandHue} / 0.12)`);
}

function TrustCenterSwitcher({ activeTc, onSwitch }) {
  const [open, setOpen] = useState(false);
  const current = TRUST_CENTERS.find(tc => tc.id === activeTc) || TRUST_CENTERS[0];

  return (
    <div className="relative mb-6">
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-xl border border-border-default flex items-center justify-center cursor-pointer hover:border-border-bright transition-colors overflow-hidden"
        aria-label={`Current: ${current.name}. Click to switch.`}
        style={{ background: current.id === "mediacore" ? "#333366" : undefined }}
      >
        {current.logo === "conveyor"
          ? <div style={{ color: current.accent }}><ConveyorLogo size={22} color="currentColor" /></div>
          : <MediacoreLogo size={28} />
        }
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, x: -8, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute left-full top-0 ml-3 z-50 w-[240px] bg-bg-elevated border border-border-bright rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="px-3 py-2 border-b border-border-default">
                <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Switch Trust Center</p>
              </div>
              {TRUST_CENTERS.map(tc => (
                <button
                  key={tc.id}
                  onClick={() => { onSwitch(tc.id); setOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-bg-hover transition-colors ${tc.id === activeTc ? "bg-bg-hover" : ""}`}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 overflow-hidden"
                    style={{ background: tc.logo === "mediacore" ? "#333366" : undefined, border: tc.id === activeTc ? `2px solid ${tc.accent}` : "2px solid transparent" }}>
                    {tc.logo === "conveyor"
                      ? <div style={{ color: tc.accent }}><ConveyorLogo size={18} color="currentColor" /></div>
                      : <MediacoreLogo size={24} />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-text-primary truncate">{tc.name}</p>
                      {tc.id === activeTc && <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: tc.accent }} />}
                    </div>
                    <p className="text-[10px] text-text-muted truncate">{tc.subtitle}</p>
                  </div>
                  <div className="text-[9px] text-text-muted shrink-0">{tc.stats.docs} docs</div>
                </button>
              ))}
              <div className="px-3 py-2 border-t border-border-default">
                <button className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[10px] text-text-muted hover:text-text-secondary transition-colors">
                  <Plus className="w-3 h-3" /> Browse more Trust Centers
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

const ROUTE_MAP = { "trust-center": "/", "agent": "/agent", "acme": "/scorecard" };
const VIEW_FROM_PATH = { "/": "trust-center", "/agent": "agent", "/scorecard": "acme" };

function Sidebar({ onOpenProfile, activeTc, onSwitchTc }) {
  const navigate = useNavigate();
  const location = useLocation();
  const activeView = VIEW_FROM_PATH[location.pathname] || "trust-center";

  const navItems = [
    { id: "trust-center", icon: Home, label: "Trust Center", useCoco: false },
    { id: "agent", icon: Bot, label: "Agent", useCoco: true },
    { id: "acme", icon: Building2, label: "Trust Scorecard", useCoco: false },
  ];

  return (
    <div className="w-[68px] bg-bg-surface border-r border-border-default flex flex-col items-center py-4 shrink-0">
      {/* Trust Center Switcher */}
      <TrustCenterSwitcher activeTc={activeTc} onSwitch={onSwitchTc} />
      <nav className="flex-1 flex flex-col items-center gap-1" aria-label="Main navigation">
        {navItems.map(({ id, icon: Icon, label, useCoco }) => (
          <button key={id} onClick={() => navigate(ROUTE_MAP[id])} aria-label={label} aria-current={activeView === id ? "page" : undefined}
            className={`group relative w-11 h-11 rounded-xl flex items-center justify-center transition-all ${activeView === id ? "bg-brand-500/15 text-brand-500" : "text-text-muted hover:text-text-primary hover:bg-bg-hover"}`}>
            {useCoco ? <PixelAIIcon size={20} active={activeView === id} /> : <Icon className="w-5 h-5" />}
            {activeView === id && <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[2px] w-1 h-5 rounded-full bg-brand-500" />}
            <div className="absolute left-full ml-3 px-2 py-1 text-xs rounded-lg bg-bg-elevated border border-border-bright text-text-primary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">{label}</div>
          </button>
        ))}
      </nav>
      {/* Theme toggle */}
      {(() => { const { dark, toggle } = useTheme(); return (
        <button onClick={toggle} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors mb-2 group relative">
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          <div className="absolute left-full ml-3 px-2 py-1 text-xs rounded-lg bg-bg-elevated border border-border-bright text-text-primary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            {dark ? "Light mode" : "Dark mode"}
          </div>
        </button>
      ); })()}

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
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COCO COMPLETION BANNER - slides in when Coco finishes a task
   ═══════════════════════════════════════════════════════════════ */

function CocoCompletionBanner() {
  const { cocoNotification, dismissCocoNotification } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const isAgent = location.pathname === "/agent";
  const show = cocoNotification && !isAgent;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[480px] max-w-[90vw]"
        >
          <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-bg-surface border border-brand-600/30 shadow-2xl backdrop-blur-xl">
            <Coco size={32} state="celebrating" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-brand-400">{cocoNotification.message}</p>
              <p className="text-[11px] text-text-muted mt-0.5">Click to review results</p>
            </div>
            <button onClick={() => { navigate("/agent"); dismissCocoNotification(); }}
              className="px-3 py-1.5 rounded-lg bg-brand-500 text-bg-primary text-xs font-medium hover:bg-brand-400 transition-colors shrink-0">
              View
            </button>
            <button onClick={dismissCocoNotification} className="p-1 rounded-lg hover:bg-bg-hover transition-colors shrink-0">
              <X className="w-3.5 h-3.5 text-text-muted" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════════════
   APP SHELL - layout with routing
   ═══════════════════════════════════════════════════════════════ */

function AppShell() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeTc, setActiveTc] = useState("conveyor");
  const navigate = useNavigate();
  const location = useLocation();
  const isAgent = location.pathname === "/agent";

  const currentTc = TRUST_CENTERS.find(tc => tc.id === activeTc) || TRUST_CENTERS[0];

  // Apply theme CSS variables when trust center changes
  useEffect(() => {
    applyTcTheme(currentTc);
  }, [currentTc]);

  return (
    <TcContext.Provider value={currentTc}>
      <Sidebar onOpenProfile={() => setProfileOpen(true)} activeTc={activeTc} onSwitchTc={setActiveTc} />

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Page content */}
        <main className="flex-1 overflow-y-auto relative">
          {/* AgentView is always mounted to preserve chat state - hidden when not active */}
          <div className={isAgent ? "h-full" : "hidden"}>
            <AgentView />
          </div>
          {!isAgent && (
            <div className="max-w-[1100px] mx-auto px-6 py-8">
              <AnimatePresence mode="wait">
                <motion.div key={location.pathname} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
                  <Routes location={location}>
                    <Route path="/" element={<TrustCenterHome />} />
                    <Route path="/scorecard" element={<AcmeCorpDashboard />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </main>

        {/* Persistent right-side cart panel */}
        <CartPanel onNavigateToAgent={() => navigate("/agent")} />
      </div>

      {/* Coco completion banner */}
      <CocoCompletionBanner />

      <AnimatePresence>
        {profileOpen && <ProfilePanel onClose={() => setProfileOpen(false)} />}
      </AnimatePresence>
    </TcContext.Provider>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN APP - providers + router
   ═══════════════════════════════════════════════════════════════ */

export default function App() {
  const [dark, setDark] = useState(true);
  const toggle = useCallback(() => setDark(d => !d), []);

  useEffect(() => {
    document.documentElement.classList.toggle("light-mode", !dark);
  }, [dark]);

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
    <CartProvider>
    <BrowserRouter>
      <div className={`h-screen flex text-text-primary overflow-hidden ${dark ? "bg-bg-primary" : "light-mode bg-white"}`}>
        <AppShell />
      </div>
    </BrowserRouter>
    </CartProvider>
    </ThemeContext.Provider>
  );
}
