import { useState, useEffect, useRef, useMemo, useCallback, createContext, useContext } from "react";
import { createPortal } from "react-dom";
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs } from "@ark-ui/react/tabs";
import {
  FileText, Shield, Search, Sparkles, Check, Lock, ChevronDown,
  X, Send, Paperclip, Clock, Award, Eye, Download, Trash2, AlertTriangle,
  Flame, Globe, Users, MessageSquare, Zap, Star, Compass, Bug, ExternalLink,
  ShieldCheck, Bell, Settings, BookOpen, Building2, Bot, Home,
  Upload, Loader, CheckCircle2, Circle, ListTodo, Plus, Package,
  Quote, Bookmark, StickyNote, FolderDown, History, RotateCcw,
  Sun, Moon, Filter, Copy, Plug, ArrowRight, ArrowLeft, RefreshCw,
  Info, ThumbsUp, ThumbsDown, TrendingUp, ChevronUp, Target, Activity,
  BarChart3, Timer, MousePointer, ArrowUpRight, Mic,
  Folder, ChevronRight, LayoutGrid, List, Columns3,
} from "lucide-react";
import {
  RadialBarChart, RadialBar, Legend, Sector,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, PieChart, Pie, Cell, BarChart, Bar, ComposedChart, Line,
} from "recharts";

/* ═══════════════════════════════════════════════════════════════
   THEME CONTEXT
   ═══════════════════════════════════════════════════════════════ */

const ThemeContext = createContext();
function useTheme() { return useContext(ThemeContext); }

const TcContext = createContext();
function useTc() { return useContext(TcContext); }

const CocoCharacterContext = createContext("sort");
function useCocoCharacter() { return useContext(CocoCharacterContext); }

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

  // Shared content gaps state (scorecard + agent can both read/write)
  const [contentGaps, setContentGaps] = useState([
    { id: 1, topic: "EU Data Residency — specific AWS regions", category: "Data Privacy", firstAsked: "Feb 12", asked: 47, status: "review", watchers: 3, votes: 47 },
    { id: 2, topic: "SOC 2 Type II scope — which services covered?", category: "Certifications", firstAsked: "Jan 8", asked: 31, status: "drafted", watchers: 5, votes: 31, eta: "2 days" },
    { id: 3, topic: "Complete sub-processor list with DPA status", category: "Vendor Risk", firstAsked: "Mar 1", asked: 28, status: "open", watchers: 0, votes: 28 },
    { id: 4, topic: "Incident response SLA for critical vulnerabilities", category: "Incident Response", firstAsked: "Feb 20", asked: 19, status: "open", watchers: 0, votes: 19 },
    { id: 5, topic: "Data deletion / right to erasure process", category: "Data Privacy", firstAsked: "Mar 5", asked: 15, status: "review", watchers: 2, votes: 15 },
    { id: 6, topic: "Penetration test methodology details", category: "Application Security", firstAsked: "Mar 10", asked: 8, status: "open", watchers: 0, votes: 8 },
  ]);
  const addContentGap = useCallback((gap) => {
    setContentGaps(prev => {
      if (prev.some(g => g.topic === gap.topic)) return prev;
      return [...prev, { id: Date.now() + Math.random(), asked: 1, watchers: 1, votes: 1, status: "open", firstAsked: "Mar 29", ...gap }];
    });
  }, []);

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
      contentGaps, setContentGaps, addContentGap,
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

const COCO_CHARACTERS = {
  sort: {
    name: "Sort Coco",
    role: "The Organizer",
    isDefault: true,
    renderSvg: (size) => (
      <svg width={size} height={size} viewBox="0 0 8 8" xmlns="http://www.w3.org/2000/svg"
        style={{ imageRendering: "pixelated" }}>
        <rect x="2" y="0" width="4" height="1" fill="var(--coco-top)"/>
        <rect x="1" y="1" width="2" height="1" fill="var(--coco-spine)"/>
        <rect x="1" y="2" width="1" height="1" fill="var(--coco-spine)"/>
        <rect x="1" y="3" width="1" height="1" fill="var(--coco-spine)"/>
        <rect x="1" y="4" width="2" height="1" fill="var(--coco-mid)"/>
        <rect x="2" y="5" width="4" height="1" fill="var(--coco-bottom)"/>
        <rect x="3" y="1" width="3" height="1" fill="var(--coco-mid)"/>
        <rect x="3" y="4" width="3" height="1" fill="var(--coco-interior)" opacity="0.3"/>
        {/* Scanning eyes */}
        <rect x="3" y="2" width="1" height="1" fill="var(--coco-eye-l)">
          <animate attributeName="x" values="3;3;2;2;3;3;4;4;3;3" dur="3s" repeatCount="indefinite"/>
        </rect>
        <rect x="5" y="2" width="1" height="1" fill="var(--coco-eye-r)">
          <animate attributeName="x" values="5;5;4;4;5;5;6;6;5;5" dur="3s" repeatCount="indefinite"/>
        </rect>
        {/* Smile */}
        <rect x="1" y="3" width="1" height="1" fill="var(--coco-smile)" opacity="var(--coco-smile-opacity)"/>
        {/* Arm */}
        <rect x="0" y="2" width="1" height="1" fill="var(--coco-arm)"/>
        {/* Sort flashes */}
        <rect x="0" y="1" width="1" height="1" fill="var(--coco-flash)" opacity="0">
          <animate attributeName="opacity" values="0;0;0.8;0.4;0;0;0;0;0;0" dur="3s" repeatCount="indefinite"/>
        </rect>
        <rect x="7" y="1" width="1" height="1" fill="var(--coco-gold)" opacity="0">
          <animate attributeName="opacity" values="0;0;0;0;0;0;0.8;0.4;0;0" dur="3s" repeatCount="indefinite"/>
        </rect>
        {/* Feet */}
        <rect x="2" y="6" width="1" height="1" fill="var(--coco-feet)"/>
        <rect x="5" y="6" width="1" height="1" fill="var(--coco-feet)"/>
      </svg>
    ),
  },

  search: {
    name: "Search Coco",
    role: "The Document Finder",
    renderSvg: (size) => (
      <svg width={size} height={size} viewBox="0 0 8 8" xmlns="http://www.w3.org/2000/svg"
        style={{ imageRendering: "pixelated" }}>
        <rect x="2" y="0" width="4" height="1" fill="var(--coco-top)"/>
        <rect x="1" y="1" width="2" height="1" fill="var(--coco-spine)"/>
        <rect x="1" y="2" width="1" height="1" fill="var(--coco-spine)"/>
        <rect x="1" y="3" width="1" height="1" fill="var(--coco-spine)"/>
        <rect x="1" y="4" width="2" height="1" fill="var(--coco-mid)"/>
        <rect x="2" y="5" width="4" height="1" fill="var(--coco-bottom)"/>
        <rect x="3" y="1" width="3" height="1" fill="var(--coco-mid)"/>
        <rect x="3" y="4" width="3" height="1" fill="var(--coco-interior)" opacity="0.3"/>
        <rect x="3" y="2" width="1" height="1" fill="var(--coco-eye-l)"/>
        <rect x="5" y="2" width="1" height="1" fill="var(--coco-eye-r)">
          <animate attributeName="y" values="2;2;3;3;2;1;1;2" dur="3s" repeatCount="indefinite"/>
        </rect>
        <rect x="6" y="2" width="1" height="1" fill="var(--coco-eye-l)" opacity="0">
          <animate attributeName="opacity" values="0;0.4;0.6;0.4;0;0;0;0" dur="3s" repeatCount="indefinite"/>
          <animate attributeName="y" values="2;2;3;3;2;1;1;2" dur="3s" repeatCount="indefinite"/>
        </rect>
        <rect x="1" y="3" width="1" height="1" fill="var(--coco-smile)" opacity="var(--coco-smile-opacity)"/>
        <rect x="0" y="2" width="1" height="1" fill="var(--coco-arm)"/>
        <rect x="2" y="6" width="1" height="1" fill="var(--coco-feet)"/>
        <rect x="5" y="6" width="1" height="1" fill="var(--coco-feet)"/>
      </svg>
    ),
  },

  stamp: {
    name: "Stamp Coco",
    role: "The Approver",
    renderSvg: (size) => (
      <svg width={size} height={size} viewBox="0 0 8 8" xmlns="http://www.w3.org/2000/svg"
        style={{ imageRendering: "pixelated" }}>
        <rect x="2" y="0" width="4" height="1" fill="var(--coco-top)"/>
        <rect x="1" y="1" width="2" height="1" fill="var(--coco-spine)"/>
        <rect x="1" y="2" width="1" height="1" fill="var(--coco-spine)"/>
        <rect x="1" y="3" width="1" height="1" fill="var(--coco-spine)"/>
        <rect x="1" y="4" width="2" height="1" fill="var(--coco-mid)"/>
        <rect x="2" y="5" width="4" height="1" fill="var(--coco-bottom)"/>
        <rect x="3" y="1" width="3" height="1" fill="var(--coco-mid)"/>
        <rect x="3" y="4" width="3" height="1" fill="var(--coco-interior)" opacity="0.3"/>
        <rect x="3" y="2" width="1" height="1" fill="var(--coco-eye-l)"/>
        <rect x="5" y="2" width="1" height="1" fill="var(--coco-eye-l)"/>
        <rect x="1" y="3" width="1" height="1" fill="var(--coco-smile)" opacity="var(--coco-smile-opacity)"/>
        <rect x="0" y="2" width="1" height="1" fill="var(--coco-arm)"/>
        <rect x="7" y="1" width="1" height="1" fill="var(--coco-arm)">
          <animate attributeName="y" values="1;1;3;3;1;1" dur="1.4s" repeatCount="indefinite"/>
        </rect>
        <rect x="7" y="4" width="1" height="1" fill="var(--coco-gold)" opacity="0">
          <animate attributeName="opacity" values="0;0;0.9;0.4;0;0" dur="1.4s" repeatCount="indefinite"/>
        </rect>
        <rect x="2" y="6" width="1" height="1" fill="var(--coco-feet)"/>
        <rect x="5" y="6" width="1" height="1" fill="var(--coco-feet)"/>
      </svg>
    ),
  },

  wave: {
    name: "Wave Crunch",
    role: "The Greeter",
    renderSvg: (size) => (
      <svg width={size} height={size} viewBox="0 0 7 7" xmlns="http://www.w3.org/2000/svg"
        style={{ imageRendering: "pixelated" }}>
        <rect x="3" y="0" width="1" height="1" fill="var(--coco-gold)"/>
        <rect x="1" y="1" width="5" height="1" fill="var(--coco-top)"/>
        <rect x="1" y="2" width="5" height="1" fill="var(--coco-spine)"/>
        <rect x="1" y="3" width="5" height="1" fill="var(--coco-spine)"/>
        <rect x="1" y="4" width="5" height="1" fill="var(--coco-mid)"/>
        <rect x="2" y="2" width="1" height="1" fill="var(--coco-smile)"/>
        <rect x="4" y="2" width="1" height="1" fill="var(--coco-smile)"/>
        <rect x="2" y="4" width="3" height="1" fill="var(--coco-smile)"/>
        <rect x="0" y="3" width="1" height="1" fill="var(--coco-arm)"/>
        <rect x="6" y="3" width="1" height="1" fill="var(--coco-arm)">
          <animate attributeName="y" values="3;2;1;2;3;3" dur="1.2s" repeatCount="indefinite"/>
        </rect>
        <rect x="6" y="0" width="1" height="1" fill="var(--coco-gold)" opacity="0">
          <animate attributeName="opacity" values="0;0;0.8;0;0;0" dur="1.2s" repeatCount="indefinite"/>
        </rect>
        <rect x="1" y="5" width="1" height="1" fill="var(--coco-bottom)"/>
        <rect x="5" y="5" width="1" height="1" fill="var(--coco-bottom)"/>
      </svg>
    ),
  },

  typer: {
    name: "Typer Crunch",
    role: "The Auto-Filler",
    renderSvg: (size) => (
      <svg width={size} height={size} viewBox="0 0 7 7" xmlns="http://www.w3.org/2000/svg"
        style={{ imageRendering: "pixelated" }}>
        <rect x="3" y="0" width="1" height="1" fill="var(--coco-gold)"/>
        <rect x="1" y="1" width="5" height="1" fill="var(--coco-top)"/>
        <rect x="1" y="2" width="5" height="1" fill="var(--coco-spine)"/>
        <rect x="1" y="3" width="5" height="1" fill="var(--coco-spine)"/>
        <rect x="1" y="4" width="5" height="1" fill="var(--coco-mid)"/>
        <rect x="2" y="3" width="1" height="1" fill="var(--coco-smile)"/>
        <rect x="4" y="3" width="1" height="1" fill="var(--coco-smile)"/>
        <rect x="3" y="4" width="1" height="1" fill="var(--coco-smile)"/>
        <rect x="0" y="3" width="1" height="1" fill="var(--coco-arm)">
          <animate attributeName="y" values="3;4;3;3;4;3" dur="0.7s" repeatCount="indefinite"/>
        </rect>
        <rect x="6" y="4" width="1" height="1" fill="var(--coco-arm)">
          <animate attributeName="y" values="4;3;4;4;3;4" dur="0.7s" repeatCount="indefinite"/>
        </rect>
        <rect x="1" y="5" width="1" height="1" fill="var(--coco-bottom)"/>
        <rect x="5" y="5" width="1" height="1" fill="var(--coco-bottom)"/>
      </svg>
    ),
  },

  loader: {
    name: "Loader Crunch",
    role: "The Package Carrier",
    renderSvg: (size) => (
      <svg width={size} height={size} viewBox="0 0 7 8" xmlns="http://www.w3.org/2000/svg"
        style={{ imageRendering: "pixelated" }}>
        <rect x="1" y="0" width="3" height="1" fill="var(--coco-mid)">
          <animate attributeName="y" values="0;0;1;0" dur="1.8s" repeatCount="indefinite"/>
        </rect>
        <rect x="2" y="0" width="1" height="1" fill="var(--coco-gold)" opacity="0.5">
          <animate attributeName="y" values="0;0;1;0" dur="1.8s" repeatCount="indefinite"/>
        </rect>
        <rect x="1" y="1" width="5" height="1" fill="var(--coco-top)">
          <animate attributeName="y" values="1;1;2;1" dur="1.8s" repeatCount="indefinite"/>
        </rect>
        <rect x="1" y="2" width="5" height="1" fill="var(--coco-spine)">
          <animate attributeName="y" values="2;2;3;2" dur="1.8s" repeatCount="indefinite"/>
        </rect>
        <rect x="1" y="3" width="5" height="1" fill="var(--coco-spine)">
          <animate attributeName="y" values="3;3;4;3" dur="1.8s" repeatCount="indefinite"/>
        </rect>
        <rect x="1" y="4" width="5" height="1" fill="var(--coco-mid)">
          <animate attributeName="y" values="4;4;5;4" dur="1.8s" repeatCount="indefinite"/>
        </rect>
        <rect x="2" y="2" width="1" height="1" fill="var(--coco-smile)">
          <animate attributeName="y" values="2;2;3;2" dur="1.8s" repeatCount="indefinite"/>
        </rect>
        <rect x="4" y="2" width="1" height="1" fill="var(--coco-smile)">
          <animate attributeName="y" values="2;2;3;2" dur="1.8s" repeatCount="indefinite"/>
        </rect>
        <rect x="3" y="4" width="1" height="1" fill="var(--coco-smile)">
          <animate attributeName="y" values="4;4;5;4" dur="1.8s" repeatCount="indefinite"/>
        </rect>
        <rect x="0" y="1" width="1" height="1" fill="var(--coco-arm)">
          <animate attributeName="y" values="1;1;2;1" dur="1.8s" repeatCount="indefinite"/>
        </rect>
        <rect x="6" y="3" width="1" height="1" fill="var(--coco-arm)">
          <animate attributeName="y" values="3;3;4;3" dur="1.8s" repeatCount="indefinite"/>
        </rect>
        <rect x="1" y="6" width="1" height="1" fill="var(--coco-bottom)"/>
        <rect x="5" y="6" width="1" height="1" fill="var(--coco-bottom)"/>
      </svg>
    ),
  },
};

function Coco({ size = 48, state = "idle", className = "" }) {
  const characterId = useCocoCharacter();
  const p = COCO_PALETTE;
  const config = COCO_STATES[state] || COCO_STATES.idle;
  const dur = config.speed;

  // Determine if we should use the character's custom SVG
  // "sort" always uses the existing C-Block (it IS the C-Block)
  // Other characters use their renderSvg for idle/sorting/waving states
  // but fall back to C-Block for celebrating/sleeping/thinking (state-specific animations)
  const character = COCO_CHARACTERS[characterId];
  const useCharacterSvg = characterId !== "sort" && character &&
    ["idle", "sorting", "waving"].includes(state);

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
        @keyframes cocoNod { 0%,100%{transform:rotate(0deg)} 25%{transform:rotate(-3deg)} 75%{transform:rotate(3deg)} }
      `}</style>

      {useCharacterSvg ? (
        <>
          {character.renderSvg(size)}
        </>
      ) : (
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
      )}

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

  // Voice mode
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState([]);
  const voiceTimerRef = useRef(null);

  const startVoice = () => {
    setVoiceActive(true);
    setVoiceTranscript([]);
    // Demo: simulate a conversation after a short delay
    voiceTimerRef.current = setTimeout(() => {
      setVoiceTranscript(prev => [...prev, { role: "user", text: "What encryption does this vendor use?" }]);
      setTimeout(() => {
        setVoiceTranscript(prev => [...prev, { role: "coco", text: "They use AES-256 for data at rest and TLS 1.2+ in transit. Key management is through AWS KMS with annual rotation." }]);
      }, 2500);
    }, 1500);
  };

  const stopVoice = () => {
    setVoiceActive(false);
    if (voiceTimerRef.current) clearTimeout(voiceTimerRef.current);
  };

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
    <div className="w-[340px] bg-bg-surface/50 border-l border-border-default flex flex-col shrink-0 overflow-hidden relative">
      {/* Coco status bar - clickable to go to agent chat */}
      <button onClick={onNavigateToAgent}
        className={`w-full flex items-center gap-2.5 px-4 h-[56px] shrink-0 border-b transition-all text-left hover:bg-bg-hover/50 ${cocoStatus === "done" ? "border-brand-600/30 bg-brand-500/5" : "border-border-default"}`}>
        <Coco size={28} state={cocoAnim} />
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <span className="text-xs font-medium text-text-primary shrink-0">Coco</span>
          <span className="text-[10px] text-text-muted truncate">
            · {cocoStatus === "working" ? cocoTaskLabel || "Working..." : cocoStatus === "done" ? "Task complete - tap to review" : "Ready"}
          </span>
        </div>
        {cocoStatus === "working" && cocoTasksTotal > 0 && (
          <span className="text-[10px] font-medium text-brand-500 shrink-0">{Math.round((cocoTasksDone / cocoTasksTotal) * 100)}%</span>
        )}
        <button onClick={(e) => { e.stopPropagation(); voiceActive ? stopVoice() : startVoice(); }}
          className={`shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors ${
            voiceActive ? "bg-red-500/15 text-red-400 border border-red-500/30 animate-pulse" : "bg-bg-primary/60 text-text-muted border border-border-default/50 hover:text-brand-400 hover:border-brand-500/30"
          }`}>
          <Mic className="w-3 h-3" /> {voiceActive ? "Stop" : "Voice"}
        </button>
      </button>

      {/* Voice transcript overlay — covers tabs + content */}
      <AnimatePresence>
        {voiceActive && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="absolute inset-x-3 top-[58px] z-30 bg-bg-surface border border-border-default rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <div className="px-4 py-3">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                <span className="text-[10px] font-medium text-red-400">Listening...</span>
              </div>
              {voiceTranscript.length === 0 && (
                <p className="text-[11px] text-text-muted italic">Speak to Coco — your words will appear here...</p>
              )}
              <div className="space-y-2.5">
                {voiceTranscript.map((t, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2.5 ${t.role === "user" ? "justify-end" : ""}`}>
                    {t.role === "coco" && <Coco size={22} state="idle" className="shrink-0 mt-0.5" />}
                    <div className={`rounded-xl px-3 py-2 max-w-[85%] ${
                      t.role === "user" ? "bg-brand-500/10 border border-brand-500/20" : "bg-bg-primary border border-border-default"
                    }`}>
                      <p className="text-xs text-text-primary leading-relaxed">{t.text}</p>
                    </div>
                  </motion.div>
                ))}
                {voiceTranscript.length > 0 && voiceTranscript[voiceTranscript.length - 1].role === "coco" && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <button onClick={() => { const t = [...voiceTranscript]; stopVoice(); onNavigateToAgent({ voiceTranscript: t }); }}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 mt-1 rounded-xl border border-brand-500/30 text-brand-400 text-xs font-medium hover:bg-brand-500/10 transition-colors">
                      Continue in chat <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
  "Cloud Platform", "On-Prem Server", "API Gateway",
  "Data Analytics", "Mobile SDK", "Identity Manager",
];

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

const UPDATES_ARCLINE = [
  { type: 'new', date: 'March 28, 2026', title: 'New SOC 2 Type II Report Added',
    body: 'Our latest SOC 2 Type II audit report covering the period July 2025 – January 2026 is now available for download. This report was conducted by Deloitte and covers all five trust service criteria.\n\nKey highlights include zero critical findings, improved controls around data encryption at rest, and expanded coverage of our incident response procedures. The report is available in the Documents section for immediate download.' },
  { type: 'updated', date: 'March 22, 2026', title: 'Security Whitepaper Refreshed',
    body: 'Updated our security whitepaper to reflect the latest infrastructure changes including our migration to a multi-region deployment and zero-trust network architecture.\n\nNew sections cover our container security strategy, service mesh implementation, and updated key management practices. The previous version has been archived and is still accessible upon request.' },
  { type: 'new', date: 'March 15, 2026', title: 'New Sub-processor: Datadog',
    body: 'Datadog has been added as a sub-processor for monitoring and observability services. Data processed includes application performance metrics and log data. Full details available in the updated sub-processor list.\n\nDatadog processes data in US-based facilities and has been assessed against our vendor security requirements. Their SOC 2 Type II report and security documentation are available upon request.' },
  { type: 'updated', date: 'March 8, 2026', title: 'Data Processing Agreement v3.2',
    body: 'Minor revisions to our DPA reflecting updated data retention policies and expanded EU representative information per GDPR requirements.\n\nChanges include a new 90-day data retention window for analytics data (reduced from 180 days), updated Standard Contractual Clauses reflecting the latest EU Commission decisions, and designation of our new EU representative based in Dublin.' },
  { type: 'removed', date: 'March 1, 2026', title: 'Deprecated: Legacy Encryption Whitepaper',
    body: 'The 2024 encryption whitepaper has been replaced by the updated Security Whitepaper which now includes comprehensive encryption details.\n\nAll encryption-related content from the legacy document has been incorporated into sections 4 and 5 of the new Security Whitepaper. If you previously referenced the old document in compliance reviews, please update your references accordingly.' },
];

const SEARCH_DOCS_ARCLINE = [
  { name: 'ISO 27001 Certificate', type: 'cert' },
  { name: 'SOC 2 Type II Report', type: 'pdf' },
  { name: 'Security Whitepaper', type: 'pdf' },
  { name: 'Data Processing Agreement', type: 'pdf' },
  { name: 'Vendor Risk Assessment', type: 'xlsx' },
  { name: 'Pentest Executive Summary', type: 'docx' },
  { name: 'Business Continuity Plan', type: 'pdf' },
  { name: 'Incident Response Policy', type: 'docx' },
  { name: 'Sub-processor List', type: 'xlsx' },
  { name: 'Information Security Policy', type: 'pdf' },
  { name: 'CSA CAIQ v4', type: 'xlsx' },
  { name: 'Privacy Policy', type: 'pdf' },
];

const SEARCH_DOCS_MEDIACORE = [
  { name: 'SOC 2 Type II (Broadcast Platform)', type: 'pdf' },
  { name: 'ISO 27001 Certificate', type: 'cert' },
  { name: 'Media Platform Security Overview', type: 'pdf' },
  { name: 'Broadcast Partner DPA', type: 'pdf' },
  { name: 'DRM & Content Protection Statement', type: 'pdf' },
  { name: 'CDN & Edge Security Architecture', type: 'pdf' },
  { name: 'Live-Streaming Incident Runbook', type: 'docx' },
  { name: 'Ad-Tech Subprocessor Register', type: 'xlsx' },
  { name: 'Privacy Policy (Viewers & Partners)', type: 'pdf' },
  { name: 'WCAG & Accessibility Attestation', type: 'pdf' },
  { name: 'CSA CAIQ v4 (Media)', type: 'xlsx' },
  { name: 'Penetration Test Summary — OTT APIs', type: 'docx' },
];

function getSearchData(tcName, tcId) {
  return {
    sections: [
      { title: 'Documents & Knowledge Base', desc: 'Browse documents and security categories' },
      { title: 'Trusted By', desc: `Companies that trust ${tcName}` },
      { title: 'Announcements', desc: 'Latest trust center announcements' },
      { title: 'Video Resources', desc: 'Security and compliance video content' },
    ],
    docs: tcId === 'mediacore' ? SEARCH_DOCS_MEDIACORE : SEARCH_DOCS_ARCLINE,
  };
}

const PRODUCT_LINES_MEDIACORE = [
  'Live Linear', 'VOD & Catch-up', 'Server-Side Ad Insertion',
  'Analytics & Measurement', 'DRM & Licensing', 'Partner APIs',
];

const UPDATES_MEDIACORE = [
  { type: 'new', date: 'April 2, 2026', title: 'EU Data Residency Pack for Broadcast Partners',
    body: 'We published a consolidated package covering Frankfurt and Dublin regions for linear and VOD workloads, including updated SCC references and a refreshed subprocessor map for EU ad decisioning.\n\nThe pack replaces the January draft and aligns with our new 48-hour breach notification commitment for premium tier customers. Download the zip from Compliance Reports → Legal addendum folder.' },
  { type: 'updated', date: 'March 26, 2026', title: 'Media Platform Security Overview v4',
    body: 'The overview now documents our multi-CDN strategy, tokenized playback URLs, and key rotation for studio-grade DRM. We added a section on synthetic monitoring for SSAI stitch points.\n\nPartner security teams asked for clearer diagrams—see the new Global CDN & Origin Architecture PDF in the root of All Content.' },
  { type: 'new', date: 'March 18, 2026', title: 'New Subprocessor: Mux (Video Infrastructure)',
    body: 'Mux is listed for transcoding and quality-of-experience metrics. Customer content passes through encrypted pipelines; Mux does not retain full-resolution mezzanine files after processing.\n\nTheir SOC 2 Type II and pen-test summary are linked from the Ad-Tech Subprocessor Register spreadsheet.' },
  { type: 'updated', date: 'March 9, 2026', title: 'Live-Streaming Incident Runbook v2.1',
    body: 'Runbook updates cover coordinated comms with distribution partners during playback incidents, including status page templates and RPO targets for origin failover.\n\nEscalation paths now include our 24/7 Broadcast NOC bridge for tier-1 events.' },
  { type: 'removed', date: 'March 1, 2026', title: 'Retired: Legacy Flash Delivery FAQ',
    body: 'All Flash-era delivery guidance has been removed. Use the DRM & Content Protection Statement and the CDN & Edge Security Architecture documents instead.\n\nIf your questionnaire still cites the old FAQ ID, replace it with section 3 of the Media Platform Security Overview.' },
];

const TOP_DOCS_MEDIACORE = [
  { name: 'SOC 2 Type II (Broadcast Platform)', views: 512 },
  { name: 'Media Platform Security Overview', views: 341 },
  { name: 'Ad-Tech Subprocessor Register', views: 276 },
  { name: 'Penetration Test Summary — OTT APIs', views: 214 },
  { name: 'Broadcast Partner DPA', views: 189 },
  { name: 'DRM & Content Protection Statement', views: 167 },
  { name: 'Live-Streaming Incident Runbook', views: 143 },
  { name: 'CDN & Edge Security Architecture', views: 121 },
];

const PERF_METRICS_ARCLINE = [
  { label: 'Response Time', value: '1.8 hr', sub: 'Average response time' },
  { label: 'Content Accuracy', value: '96%', sub: 'AI answer accuracy' },
  { label: 'Questions Answered', value: '2,847', sub: 'Total questions answered' },
  { label: 'Visitor Engagement', value: '1,240', sub: 'Unique visitors (90 days)' },
  { label: 'Content Freshness', value: '3 days', sub: 'Since last update' },
  { label: 'Update Frequency', value: '8', sub: 'Updates this month' },
];

const PERF_METRICS_MEDIACORE = [
  { label: 'Response Time', value: '2.2 hr', sub: 'Average response time' },
  { label: 'Content Accuracy', value: '94%', sub: 'AI answer accuracy' },
  { label: 'Questions Answered', value: '1,903', sub: 'Total questions answered' },
  { label: 'Visitor Engagement', value: '886', sub: 'Unique visitors (90 days)' },
  { label: 'Content Freshness', value: '5 days', sub: 'Since last update' },
  { label: 'Update Frequency', value: '6', sub: 'Updates this month' },
];

const TRUSTED_BY_MEDIACORE = [
  { name: 'Netflix', logo: 'https://cdn.simpleicons.org/netflix/E50914' },
  { name: 'Spotify', logo: 'https://cdn.simpleicons.org/spotify/1DB954' },
  { name: 'Twitch', logo: 'https://cdn.simpleicons.org/twitch/9146FF' },
  { name: 'Plex', logo: 'https://cdn.simpleicons.org/plex/EBAF00' },
  { name: 'Dailymotion', logo: 'https://cdn.simpleicons.org/dailymotion/0066DC' },
  { name: 'SoundCloud', logo: 'https://cdn.simpleicons.org/soundcloud/FF5500' },
  { name: 'Deezer', logo: 'https://cdn.simpleicons.org/deezer/FEAA2D' },
  { name: 'Vimeo', logo: 'https://cdn.simpleicons.org/vimeo/1AB7EA' },
];

const TRUSTED_BY_ARCLINE = [
  { name: 'GitHub', logo: 'https://cdn.simpleicons.org/github/FFFFFF' },
  { name: 'GitLab', logo: 'https://cdn.simpleicons.org/gitlab/FC6D26' },
  { name: 'Linear', logo: 'https://cdn.simpleicons.org/linear/5E6AD2' },
  { name: 'Jira', logo: 'https://cdn.simpleicons.org/jira/0052CC' },
  { name: 'HubSpot', logo: 'https://cdn.simpleicons.org/hubspot/FF7A59' },
  { name: 'Zendesk', logo: 'https://cdn.simpleicons.org/zendesk/03363D' },
  { name: 'Airtable', logo: 'https://cdn.simpleicons.org/airtable/18BFFF' },
  { name: 'Docker', logo: 'https://cdn.simpleicons.org/docker/2496ED' },
];

const SUBPROCESSORS_MEDIACORE = [
  { name: 'Fastly', usage: 'Edge compute and live linear caching at the network edge', location: 'Global', logo: 'https://cdn.simpleicons.org/fastly/FF282D' },
  { name: 'Akamai', usage: 'Media delivery, token auth, and origin shielding', location: 'Global', logo: 'https://cdn.simpleicons.org/akamai/0096D6' },
  { name: 'Cloudflare', usage: 'DNS, WAF, and bot management in front of public APIs', location: 'Global', logo: 'https://cdn.simpleicons.org/cloudflare/F38020' },
  { name: 'Google Cloud', usage: 'Origin storage, transcoding queues, and analytics lakes', location: 'US, EU, APAC', logo: 'https://cdn.simpleicons.org/googlecloud/4285F4' },
];

const SUBPROCESSORS_ARCLINE = [
  { name: 'Google Cloud', usage: 'Production workloads, secrets management, and encrypted object storage', location: 'US-East, EU-West', logo: 'https://cdn.simpleicons.org/googlecloud/4285F4' },
  { name: 'Okta', usage: 'Workforce and customer identity, SSO, and MFA for the platform', location: 'US, EU', logo: 'https://cdn.simpleicons.org/okta/007DC1' },
  { name: 'PagerDuty', usage: 'Incident paging, on-call schedules, and status communications', location: 'US', logo: 'https://cdn.simpleicons.org/pagerduty/06AC38' },
  { name: 'Sentry', usage: 'Error monitoring, performance tracing, and release health tracking', location: 'US, EU', logo: 'https://cdn.simpleicons.org/sentry/362D59' },
];

/** 2×4 grid order: row-major. MediaCore uses a different sequence than Arcline for quick visual differentiation. */
const CERTS_MEDIACORE = [
  { src: '/badges/gdpr.png', label: 'GDPR' },
  { src: '/badges/iso-27001.png', label: 'ISO 27001' },
  { src: '/badges/iso-27701.svg', label: 'ISO 27701' },
  { src: '/badges/nist.png', label: 'NIST CSF' },
  { src: '/badges/itar.png', label: 'ITAR' },
  { src: '/badges/cmmc.png', label: 'CMMC L2' },
  { src: '/badges/hds.png', label: 'HDS' },
  { src: '/badges/acn.png', label: 'CSA STAR' },
];

const CERTS_ARCLINE = [
  { src: '/badges/iso-27001.png', label: 'ISO 27001' },
  { src: '/badges/iso-27701.svg', label: 'ISO 27701' },
  { src: '/badges/gdpr.png', label: 'GDPR' },
  { src: '/badges/nist.png', label: 'NIST 800-53' },
  { src: '/badges/acn.png', label: 'ACN' },
  { src: '/badges/cmmc.png', label: 'CMMC' },
  { src: '/badges/hds.png', label: 'HDS' },
  { src: '/badges/itar.png', label: 'ITAR' },
];

/** MediaCore-specific file tree (same shape as FILE_SYSTEM; different labels for key assets). */
function getFileSystemForTc(tcId) {
  if (tcId !== 'mediacore') return FILE_SYSTEM;
  const tree = structuredClone(FILE_SYSTEM);
  const compliance = tree.find((i) => i.type === 'folder' && i.name === 'Compliance Reports');
  if (compliance?.children) {
    const soc2 = compliance.children.find((c) => c.name === 'SOC 2 Type II Report');
    if (soc2) soc2.name = 'SOC 2 Type II (Broadcast Platform)';
    const hipaa = compliance.children.find((c) => c.name === 'HIPAA Compliance Letter');
    if (hipaa) hipaa.name = 'MPAA / TPN Alignment Summary';
  }
  const policies = tree.find((i) => i.type === 'folder' && i.name === 'Policies');
  if (policies?.children) {
    const ir = policies.children.find((c) => c.name === 'Incident Response Policy');
    if (ir) ir.name = 'Live-Streaming Incident Runbook';
    const bcm = policies.children.find((c) => c.name === 'Business Continuity Plan');
    if (bcm) bcm.name = 'Broadcast Continuity & Origin Failover Plan';
  }
  const legal = tree.find((i) => i.type === 'folder' && i.name === 'Legal');
  if (legal?.children) {
    const dpa = legal.children.find((c) => c.name === 'Data Processing Agreement');
    if (dpa) dpa.name = 'Broadcast Partner DPA';
    const sub = legal.children.find((c) => c.name === 'Sub-processor List');
    if (sub) sub.name = 'Ad-Tech Subprocessor Register';
  }
  const pentest = tree.find((i) => i.type === 'folder' && i.name === 'Penetration Testing');
  if (pentest) pentest.name = 'AppSec & API Testing';
  if (pentest?.children) {
    const ex = pentest.children.find((c) => c.name === 'Pentest Executive Summary');
    if (ex) ex.name = 'Pentest Executive Summary — OTT APIs';
  }
  const rootFile = (n) => tree.find((i) => i.type === 'file' && i.name === n);
  const w = rootFile('Security Whitepaper');
  if (w) w.name = 'Media Platform Security Overview';
  const arch = rootFile('Architecture Diagram');
  if (arch) arch.name = 'Global CDN & Origin Architecture';
  const enc = rootFile('Encryption at Rest Overview');
  if (enc) enc.name = 'DRM & Content Protection Statement';
  const net = rootFile('Network Security Overview');
  if (net) net.name = 'CDN & Edge Security Architecture';
  return tree;
}

function getFaqsForTc(tc) {
  const n = tc.name;
  if (tc.id === 'mediacore') {
    return [
      { category: 'Access Management', q: `How does ${n} manage user access controls?`, a: 'Studio, syndication, and ad-ops roles are enforced through SSO with short-lived API tokens. Emergency access expires in four hours and is reviewed in weekly access reports.' },
      { category: 'Application Security', q: 'How do you secure playback and partner APIs?', a: 'We run a secure SDLC with mandatory reviews, SAST in CI, and regular third-party tests focused on token issuance, DRM hooks, and SSAI endpoints.' },
      { category: 'Data Privacy', q: 'Where is viewer and partner data processed?', a: 'Metadata and analytics are processed in AWS and GCP regions disclosed in our Broadcast Partner DPA. EU linear traffic can be pinned to Frankfurt or Dublin upon contract.' },
      { category: 'Infrastructure', q: 'How is the delivery stack protected?', a: 'Multi-CDN egress, mutual TLS between origins and edges, AES-256 at rest, and continuous config drift checks across Terraform-managed infrastructure.' },
      { category: 'Incident Response', q: 'What happens during a streaming or API incident?', a: 'Our Live-Streaming Incident Runbook defines NOC bridges, partner comms templates, and customer notification targets—typically within 48 hours for confirmed data impact on the premium tier.' },
    ];
  }
  return [
    { category: 'Access Management', q: `How does ${n} manage user access controls?`, a: 'We implement role-based access control (RBAC) with least-privilege principles. All access is reviewed quarterly and requires manager approval.' },
    { category: 'Application Security', q: 'What is your secure development lifecycle?', a: 'We follow OWASP guidelines with mandatory code reviews, SAST/DAST scanning, and annual penetration testing by independent third parties.' },
    { category: 'Data Privacy', q: 'Where is customer data stored and processed?', a: 'Customer data is stored in AWS us-east-1 and eu-west-1 regions. Data processing locations are documented in our DPA.' },
    { category: 'Infrastructure', q: 'How is your infrastructure secured?', a: 'We use AWS with VPC isolation, encrypted storage (AES-256), and WAF protection. All infrastructure is managed via Terraform with drift detection.' },
    { category: 'Incident Response', q: 'What is your incident response process?', a: 'We maintain a documented IR plan with 24/7 on-call rotation. Customers are notified within 72 hours of confirmed breaches per GDPR requirements.' },
  ];
}

function getFileCount(item) {
  if (item.type === 'file') return 1;
  return item.children.reduce((sum, c) => sum + getFileCount(c), 0);
}

function getItemsAtPath(root, path) {
  let items = root;
  for (const seg of path) {
    const folder = items.find((i) => i.type === 'folder' && i.name === seg);
    if (folder) items = folder.children;
    else return [];
  }
  return items;
}

function TrustCenterHome() {
  const tc = useTc();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchResultsOpen, setSearchResultsOpen] = useState(false);
  const productLineList = useMemo(
    () => (tc.id === "mediacore" ? PRODUCT_LINES_MEDIACORE : PRODUCT_LINES),
    [tc.id],
  );
  const [productChecks, setProductChecks] = useState(() => PRODUCT_LINES.map(() => true));
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(0);
  const [fileBrowserView, setFileBrowserView] = useState("grid");
  const [currentPath, setCurrentPath] = useState([]);
  const [columnSelections, setColumnSelections] = useState([]);
  const [selectedUpdate, setSelectedUpdate] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const columnsRef = useRef(null);

  const fileRoot = useMemo(() => getFileSystemForTc(tc.id), [tc.id]);
  const updates = tc.id === "mediacore" ? UPDATES_MEDIACORE : UPDATES_ARCLINE;
  const searchData = useMemo(() => getSearchData(tc.name, tc.id), [tc.name, tc.id]);
  const faqs = useMemo(() => getFaqsForTc(tc), [tc.id, tc.name]);
  const topDocs = useMemo(
    () =>
      tc.id === "mediacore"
        ? TOP_DOCS_MEDIACORE
        : [
            { name: "SOC 2 Type II Report (2026)", views: 487 },
            { name: "Security Whitepaper", views: 312 },
            { name: "Sub-processor List", views: 289 },
            { name: "Penetration Test Summary", views: 201 },
            { name: "Data Processing Agreement", views: 178 },
            { name: "Vendor Risk Assessment", views: 156 },
            { name: "Business Continuity Plan", views: 134 },
            { name: "Incident Response Policy", views: 112 },
          ],
    [tc.id],
  );
  const trustedByCompanies = tc.id === "mediacore" ? TRUSTED_BY_MEDIACORE : TRUSTED_BY_ARCLINE;
  const subprocessors = tc.id === "mediacore" ? SUBPROCESSORS_MEDIACORE : SUBPROCESSORS_ARCLINE;
  const certGrid = tc.id === "mediacore" ? CERTS_MEDIACORE : CERTS_ARCLINE;

  useEffect(() => {
    setCurrentPath([]);
    setColumnSelections([]);
    setExpandedFaq(0);
    setSelectedUpdate(null);
    setProductChecks((tc.id === "mediacore" ? PRODUCT_LINES_MEDIACORE : PRODUCT_LINES).map(() => true));
  }, [tc.id]);

  // Product filter label
  const allChecked = productChecks.every(Boolean);
  const noneChecked = productChecks.every(v => !v);
  const checkedCount = productChecks.filter(Boolean).length;
  const filterLabel = (allChecked || noneChecked) ? "All Products" : `${checkedCount} Product${checkedCount !== 1 ? "s" : ""}`;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setProductDropdownOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) { setSearchResultsOpen(false); }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Keyboard shortcuts: Cmd+K, Escape
  useEffect(() => {
    const handleKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("tc-global-search")?.focus();
      }
      if (e.key === "Escape") {
        if (selectedUpdate !== null) { setSelectedUpdate(null); return; }
        if (searchResultsOpen) { setSearchResultsOpen(false); setSearchQuery(""); return; }
        if (productDropdownOpen) { setProductDropdownOpen(false); return; }
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [selectedUpdate, searchResultsOpen, productDropdownOpen]);

  // Lock body scroll when modal open
  useEffect(() => {
    if (selectedUpdate !== null) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [selectedUpdate]);

  // Search filtering
  const filteredSections = useMemo(() => {
    if (!searchQuery) return searchData.sections;
    const q = searchQuery.toLowerCase();
    return searchData.sections.filter(s => s.title.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q));
  }, [searchQuery, searchData.sections]);
  const filteredDocs = useMemo(() => {
    if (!searchQuery) return searchData.docs;
    const q = searchQuery.toLowerCase();
    return searchData.docs.filter(d => d.name.toLowerCase().includes(q));
  }, [searchQuery, searchData.docs]);

  // Heatmap data (17 weeks x 7 days)
  const heatmapData = useMemo(() => {
    function seededRand(seed) { let x = Math.sin(seed) * 10000; return x - Math.floor(x); }
    const cells = [];
    for (let week = 0; week < 17; week++) {
      for (let day = 0; day < 7; day++) {
        const r = seededRand(week * 7 + day + 42 + (tc.id === "mediacore" ? 131 : 0));
        const boost = week / 17;
        let level = 0;
        if (r < 0.18 + boost * 0.25) level = 1;
        if (r < 0.10 + boost * 0.18) level = 2;
        if (r < 0.05 + boost * 0.12) level = 3;
        if (r < 0.02 + boost * 0.07) level = 4;
        if (day >= 5 && level > 0) level = Math.max(0, level - 1);
        cells.push(level);
      }
    }
    return cells;
  }, [tc.id]);

  // File browser helpers
  const currentItems = useMemo(() => getItemsAtPath(fileRoot, currentPath), [fileRoot, currentPath]);
  const openFolder = (name) => { setCurrentPath(prev => [...prev, name]); };
  const navigateTo = (idx) => { if (idx < 0) setCurrentPath([]); else setCurrentPath(prev => prev.slice(0, idx + 1)); };

  // Column view selection
  const selectColumn = (depth, idx) => {
    setColumnSelections(prev => { const next = prev.slice(0, depth); next[depth] = idx; return next; });
    setTimeout(() => { if (columnsRef.current) columnsRef.current.scrollLeft = columnsRef.current.scrollWidth; }, 50);
  };

  // Build columns data
  const columnsData = useMemo(() => {
    const cols = [fileRoot];
    let items = fileRoot;
    for (let d = 0; d < columnSelections.length; d++) {
      const selIdx = columnSelections[d];
      if (selIdx == null || !items[selIdx] || items[selIdx].type !== 'folder') break;
      items = items[selIdx].children;
      cols.push(items);
    }
    return cols;
  }, [columnSelections, fileRoot]);

  const perfCards = useMemo(() => {
    const metrics = tc.id === "mediacore" ? PERF_METRICS_MEDIACORE : PERF_METRICS_ARCLINE;
    const icons = [
      <svg key="p0" className="w-11 h-11" viewBox="0 0 16 16" fill="none" style={{ imageRendering: "pixelated" }}><rect x="2" y="8" width="2" height="2" fill="var(--color-brand-400)"/><rect x="4" y="6" width="2" height="2" fill="var(--color-brand-400)"/><rect x="6" y="4" width="2" height="2" fill="var(--color-brand-400)"/><rect x="8" y="6" width="2" height="2" fill="var(--color-brand-400)"/><rect x="10" y="8" width="2" height="2" fill="var(--color-brand-400)"/><rect x="12" y="10" width="2" height="2" fill="var(--color-brand-400)"/><rect x="6" y="2" width="2" height="2" fill="var(--color-brand-300)"/><rect x="4" y="10" width="2" height="2" fill="var(--color-brand-400)" opacity="0.5"/><rect x="2" y="12" width="12" height="2" fill="var(--color-brand-400)" opacity="0.3"/></svg>,
      <svg key="p1" className="w-11 h-11" viewBox="0 0 16 16" fill="none" style={{ imageRendering: "pixelated" }}><rect x="4" y="2" width="8" height="2" fill="var(--color-brand-400)"/><rect x="2" y="4" width="2" height="8" fill="var(--color-brand-400)"/><rect x="12" y="4" width="2" height="8" fill="var(--color-brand-400)"/><rect x="4" y="12" width="8" height="2" fill="var(--color-brand-400)"/><rect x="6" y="6" width="4" height="4" fill="var(--color-brand-300)"/><rect x="7" y="7" width="2" height="2" fill="var(--color-brand-400)"/></svg>,
      <svg key="p2" className="w-11 h-11" viewBox="0 0 16 16" fill="none" style={{ imageRendering: "pixelated" }}><rect x="6" y="2" width="4" height="2" fill="var(--color-brand-400)"/><rect x="4" y="4" width="2" height="2" fill="var(--color-brand-400)"/><rect x="10" y="4" width="2" height="2" fill="var(--color-brand-400)"/><rect x="6" y="6" width="4" height="2" fill="var(--color-brand-400)"/><rect x="6" y="8" width="4" height="2" fill="var(--color-brand-300)"/><rect x="4" y="10" width="2" height="4" fill="var(--color-brand-400)"/><rect x="10" y="10" width="2" height="4" fill="var(--color-brand-400)"/><rect x="6" y="12" width="4" height="2" fill="var(--color-brand-400)" opacity="0.5"/></svg>,
      <svg key="p3" className="w-11 h-11" viewBox="0 0 16 16" fill="none" style={{ imageRendering: "pixelated" }}><rect x="6" y="2" width="2" height="2" fill="var(--color-brand-300)"/><rect x="4" y="4" width="2" height="2" fill="var(--color-brand-400)"/><rect x="8" y="4" width="2" height="2" fill="var(--color-brand-400)"/><rect x="2" y="6" width="2" height="2" fill="var(--color-brand-400)"/><rect x="10" y="6" width="2" height="2" fill="var(--color-brand-400)"/><rect x="4" y="8" width="2" height="4" fill="var(--color-brand-400)"/><rect x="8" y="8" width="2" height="4" fill="var(--color-brand-400)"/><rect x="2" y="12" width="4" height="2" fill="var(--color-brand-400)" opacity="0.5"/><rect x="8" y="12" width="4" height="2" fill="var(--color-brand-400)" opacity="0.5"/></svg>,
      <svg key="p4" className="w-11 h-11" viewBox="0 0 16 16" fill="none" style={{ imageRendering: "pixelated" }}><rect x="4" y="2" width="8" height="2" fill="var(--color-brand-400)"/><rect x="2" y="4" width="2" height="2" fill="var(--color-brand-400)"/><rect x="12" y="4" width="2" height="2" fill="var(--color-brand-400)"/><rect x="4" y="6" width="2" height="2" fill="var(--color-brand-300)"/><rect x="10" y="6" width="2" height="2" fill="var(--color-brand-300)"/><rect x="6" y="8" width="4" height="2" fill="var(--color-brand-400)"/><rect x="4" y="10" width="8" height="2" fill="var(--color-brand-400)" opacity="0.5"/><rect x="6" y="12" width="4" height="2" fill="var(--color-brand-400)" opacity="0.3"/></svg>,
      <svg key="p5" className="w-11 h-11" viewBox="0 0 16 16" fill="none" style={{ imageRendering: "pixelated" }}><rect x="2" y="12" width="2" height="2" fill="var(--color-brand-400)"/><rect x="2" y="10" width="2" height="2" fill="var(--color-brand-400)" opacity="0.5"/><rect x="5" y="8" width="2" height="6" fill="var(--color-brand-400)"/><rect x="5" y="6" width="2" height="2" fill="var(--color-brand-300)"/><rect x="8" y="6" width="2" height="8" fill="var(--color-brand-400)"/><rect x="8" y="4" width="2" height="2" fill="var(--color-brand-300)"/><rect x="11" y="2" width="2" height="12" fill="var(--color-brand-400)"/><rect x="11" y="0" width="2" height="2" fill="var(--color-brand-300)"/></svg>,
    ];
    return metrics.map((m, i) => ({ ...m, icon: icons[i] }));
  }, [tc.id]);

  const heatLevelClass = (level) => {
    if (level === 0) return "bg-bg-elevated";
    const mixes = [
      "",
      "[background:color-mix(in_srgb,var(--color-brand-400)_20%,var(--color-bg-elevated))]",
      "[background:color-mix(in_srgb,var(--color-brand-400)_40%,var(--color-bg-elevated))]",
      "[background:color-mix(in_srgb,var(--color-brand-400)_65%,var(--color-bg-elevated))]",
      "bg-brand-400",
    ];
    return mixes[level];
  };

  return (
    <Tabs.Root value={activeTab} onValueChange={(e) => { setActiveTab(e.value); setCurrentPath([]); setColumnSelections([]); }}
      className="max-w-[960px] mx-auto">
      {/* ═══ STICKY HEADER ═══ */}
      <div className="sticky top-0 z-40 bg-bg-primary pt-6 mb-6" style={{ position: "sticky" }}>
        {/* Tab selector */}
        <div className="flex justify-center mb-5">
          <Tabs.List className="inline-flex bg-bg-surface/60 backdrop-blur-sm border border-border-default rounded-lg p-0.5 gap-0.5">
            {[
              { key: "overview", label: "Overview" },
              { key: "docs", label: "Documents & Knowledge" },
              { key: "updates", label: "Updates" },
            ].map(tab => (
              <Tabs.Trigger key={tab.key} value={tab.key}
                className="px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer data-[selected]:bg-brand-500/80 data-[selected]:backdrop-blur-md data-[selected]:text-white text-text-secondary hover:bg-bg-hover hover:text-text-primary"
                style={activeTab === tab.key ? { boxShadow: "0 2px 12px var(--brand-glow-md), inset 0 1px 0 rgba(255,255,255,0.1)" } : undefined}>
                {tab.label}
              </Tabs.Trigger>
            ))}
            <Tabs.Indicator className="hidden" />
          </Tabs.List>
        </div>

        {/* Search row */}
        <div className="flex gap-2.5 items-center">
          {/* Product filter */}
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setProductDropdownOpen(!productDropdownOpen)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl bg-bg-elevated border text-[13px] font-medium cursor-pointer whitespace-nowrap shrink-0 transition-colors ${productDropdownOpen ? "border-brand-400 text-brand-400" : "border-border-default text-text-secondary hover:border-border-bright"}`}>
              <Filter className="w-3.5 h-3.5 text-text-muted" />
              <span>{filterLabel}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${productDropdownOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {productDropdownOpen && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-2 w-60 bg-bg-surface border border-border-default rounded-xl p-4 shadow-[0_12px_40px_rgba(0,0,0,0.4)] z-[45]">
                  <div className="text-[10px] font-bold uppercase tracking-[1.2px] text-brand-400 mb-3">Filter by Product</div>
                  {productLineList.map((product, idx) => (
                    <button key={product} onClick={() => setProductChecks(prev => { const next = [...prev]; next[idx] = !next[idx]; return next; })}
                      className="flex items-center gap-2.5 py-1.5 w-full text-left text-[13px] font-medium text-text-primary hover:text-brand-400 transition-colors cursor-pointer">
                      <div className={`w-[18px] h-[18px] rounded flex items-center justify-center shrink-0 border-2 transition-all ${productChecks[idx] ? "bg-brand-400 border-brand-400" : "border-border-bright"}`}>
                        {productChecks[idx] && <Check className="w-3 h-3 text-white" />}
                      </div>
                      {product}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Search input */}
          <div className="relative flex-1" ref={searchRef}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            <input id="tc-global-search" type="text" value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setSearchResultsOpen(true); }}
              onFocus={() => { setSearchFocused(true); if (searchQuery) setSearchResultsOpen(true); }}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search Documents, FAQs, Certifications, etc"
              className={`w-full py-2.5 pl-11 pr-12 rounded-xl bg-bg-elevated border text-[13px] text-text-primary placeholder:text-text-muted font-[inherit] outline-none transition-colors ${searchFocused ? "border-brand-400" : "border-border-default"}`} />
            {!searchQuery && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded-[5px] bg-bg-hover border border-border-default text-[11px] text-text-muted pointer-events-none">⌘K</span>
            )}

            {/* Search results dropdown */}
            <AnimatePresence>
              {searchResultsOpen && searchQuery && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-bg-surface border border-border-default rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.4)] z-[45] max-h-[420px] overflow-y-auto flex">
                  <div className="w-[220px] border-r border-border-default p-4 shrink-0">
                    <div className="text-[10px] font-bold uppercase tracking-[1px] text-text-muted mb-2.5">Trust Center Sections ({filteredSections.length})</div>
                    {filteredSections.map(s => (
                      <div key={s.title} className="p-2 px-2.5 rounded-lg cursor-pointer hover:bg-bg-hover transition-colors">
                        <div className="text-[13px] font-semibold text-text-primary">{s.title}</div>
                        <div className="text-[11px] text-text-muted mt-0.5">{s.desc}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 p-4 overflow-y-auto">
                    <div className="text-[10px] font-bold uppercase tracking-[1px] text-text-muted mb-2.5">Documents ({filteredDocs.length})</div>
                    {filteredDocs.map(d => (
                      <div key={d.name} className="p-2 px-2.5 rounded-lg cursor-pointer hover:bg-bg-hover transition-colors">
                        <div className="text-[13px] font-semibold text-text-primary">
                          <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase mr-1.5 bg-bg-elevated border border-border-default text-text-secondary align-[1px]">{d.type.toUpperCase()}</span>
                          {d.name}
                        </div>
                      </div>
                    ))}
                    {/* Ask AI Agent bar */}
                    <div onClick={() => navigate("/trust-center/agent")}
                      className="flex items-center gap-2.5 p-3 mt-2.5 border-t border-border-default cursor-pointer hover:bg-bg-hover rounded-b-xl transition-colors">
                      <button className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-brand-400 text-brand-400 text-xs font-semibold whitespace-nowrap shrink-0">
                        <Bot className="w-3.5 h-3.5" /> Ask AI Agent
                      </button>
                      <span className="text-[13px] text-text-secondary flex-1">Ask about &apos;<strong className="text-brand-400">{searchQuery}</strong>&apos;</span>
                      <ChevronRight className="w-4 h-4 text-text-muted shrink-0" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom border line */}
        <div className="h-px bg-border-default mt-5" />
      </div>

      {/* ═══ TAB CONTENT ═══ */}
      <AnimatePresence mode="wait">
        {/* ═══════ TAB 1: OVERVIEW ═══════ */}
        {activeTab === "overview" && (
          <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {/* Hero card */}
            <div className="bg-bg-surface border border-border-default rounded-[14px] p-7 mb-6">
              <div className="flex gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3.5 mb-3">
                    <div className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 overflow-hidden"
                      style={{ background: tc.logo === "mediacore" ? "#333366" : tc.logo === "arcline" ? "#122E32" : "var(--color-brand-800)" }}>
                      {tc.logo === "arcline" ? <ArclineLogo size={28} />
                        : tc.logo === "mediacore" ? <MediacoreLogo size={32} />
                        : <ArclineLogo size={28} />}
                    </div>
                    <h2 className="text-lg font-bold text-text-primary">{tc.name} Trust Center</h2>
                  </div>
                  <p className="text-[13px] text-text-secondary leading-[1.7] mb-5">
                    {tc.trustHeroBody} Reach out at <a href="#" className="text-brand-400 no-underline">{tc.contactEmail}</a>.
                  </p>
                  <div className="flex gap-2.5 flex-wrap">
                    <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] bg-bg-elevated border border-border-default text-xs font-medium text-text-secondary">
                      <FileText className="w-3.5 h-3.5 text-brand-400" /><span className="text-brand-400 font-bold">{tc.stats.docs}</span> Documents
                    </div>
                    <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] bg-bg-elevated border border-border-default text-xs font-medium text-text-secondary">
                      <BookOpen className="w-3.5 h-3.5 text-brand-400" /><span className="text-brand-400 font-bold">{tc.stats.faqs}</span> FAQs
                    </div>
                    <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] bg-bg-elevated border border-border-default text-xs font-medium text-text-secondary">
                      <Shield className="w-3.5 h-3.5 text-brand-400" /><span className="text-brand-400 font-bold">{tc.stats.certs}</span> Certifications
                    </div>
                    <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] bg-bg-elevated border border-border-default text-xs font-medium text-text-secondary">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> {tc.lastActiveLabel}
                    </div>
                  </div>
                </div>
                {/* Quick Links */}
                <div className="w-[200px] shrink-0 border-l border-border-default pl-6">
                  <div className="text-[10px] font-bold uppercase tracking-[1.2px] text-text-muted mb-3.5">Quick Links</div>
                  {["Homepage", "Privacy Policy", "Status Page"].map(link => (
                    <a key={link} href="#" className="flex items-center gap-2 py-1.5 text-xs text-brand-400 no-underline hover:opacity-80 transition-opacity">
                      <ExternalLink className="w-[13px] h-[13px] shrink-0" />{tc.name} {link}
                    </a>
                  ))}
                  <a href="#" className="flex items-center gap-2 py-1.5 text-xs text-brand-400 no-underline hover:opacity-80 transition-opacity">
                    <Shield className="w-[13px] h-[13px] shrink-0" />Report a vulnerability
                  </a>
                </div>
              </div>
            </div>

            {/* Activity + Certifications */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Activity Heatmap */}
              <div className="bg-bg-surface border border-border-default rounded-[14px] p-[22px]">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-semibold text-text-primary">{tc.activityCardTitle}</span>
                  <span className="text-xs font-medium text-brand-400 cursor-pointer">View All</span>
                </div>
                <div className="flex justify-between items-center mb-2.5">
                  <p className="text-xs text-text-secondary">{tc.activityMetricLabel}: <strong className="text-brand-400">{tc.activityNewDocs}</strong></p>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[9px] text-text-muted">Less</span>
                    {[0, 1, 2, 3, 4].map(l => (
                      <div key={l} className={`w-2.5 h-2.5 rounded-sm ${heatLevelClass(l)}`} />
                    ))}
                    <span className="text-[9px] text-text-muted">More</span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <div className="grid grid-rows-7 grid-flow-col gap-0.5" style={{ gridAutoColumns: "1fr" }}>
                    {heatmapData.map((level, i) => (
                      <div key={i} className={`aspect-square rounded-sm ${heatLevelClass(level)} hover:scale-[1.6] hover:z-[2] hover:relative transition-transform`} style={{ minWidth: 0 }} />
                    ))}
                  </div>
                </div>
                <div className="flex mt-2">
                  {tc.activityMonths.map(m => (
                    <span key={m} className="flex-1 text-left text-[9px] text-text-muted">{m}</span>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div className="bg-bg-surface border border-border-default rounded-[14px] p-[22px]">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-semibold text-text-primary">Certifications</span>
                  <span className="text-xs font-medium text-brand-400 cursor-pointer">View All</span>
                </div>
                <div className={`grid gap-2.5 ${certGrid.length <= 6 ? "grid-cols-3" : "grid-cols-4"}`}>
                  {certGrid.map(cert => (
                    <div key={cert.label} className="aspect-square rounded-[10px] bg-bg-elevated border border-border-default flex flex-col items-center justify-center gap-1.5 p-2 hover:border-border-bright transition-colors">
                      <img src={cert.src} alt={cert.label} className="w-10 h-10 object-contain rounded-lg" />
                      <span className="text-[9px] font-semibold text-text-muted text-center leading-tight">{cert.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Performance */}
            <div className="bg-bg-surface border border-border-default rounded-[14px] p-6 mb-6">
              <div className="text-[13px] font-semibold text-brand-400 mb-4">Trust Center Performance</div>
              <div className="grid grid-cols-3 gap-3">
                {perfCards.map(card => (
                  <div key={card.label} className="bg-[rgba(255,255,255,0.04)] border border-border-default rounded-[10px] p-4 flex gap-3.5 items-center">
                    <div className="shrink-0">{card.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] text-text-muted mb-1">{card.label}</div>
                      <div className="text-[22px] font-bold text-text-primary leading-none">{card.value}<span className="text-[11px] text-text-muted ml-1 font-normal">{card.sub}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trusted By + Subprocessors */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-bg-surface border border-border-default rounded-[14px] p-[22px]">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-semibold text-text-primary">Trusted By</span>
                  <span className="text-xs font-medium text-brand-400 cursor-pointer">View All</span>
                </div>
                <div className="grid grid-cols-4 gap-2.5">
                  {trustedByCompanies.map(c => (
                    <div key={c.name} className="aspect-square rounded-[10px] bg-bg-elevated border border-border-default flex flex-col items-center justify-center gap-2.5 p-2 hover:border-border-bright transition-colors">
                      <img src={c.logo} alt={c.name} className="w-10 h-10 object-contain" />
                      <span className="text-[9px] font-semibold text-text-muted text-center leading-tight">{c.name}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-text-muted leading-relaxed mt-4">
                  <strong className="text-text-secondary">{tc.name}</strong> {tc.trustedByBlurb}
                </p>
              </div>
              <div className="bg-bg-surface border border-border-default rounded-[14px] p-[22px]">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-semibold text-text-primary">Subprocessors</span>
                  <span className="text-xs font-medium text-brand-400 cursor-pointer">View Table</span>
                </div>
                <div className="flex flex-col gap-2">
                  {subprocessors.map(sp => (
                    <div key={sp.name} className="flex items-center gap-3 p-3 px-3.5 rounded-[10px] bg-bg-elevated text-[13px]">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 overflow-hidden">
                        <img src={sp.logo} alt={sp.name} className="w-[22px] h-[22px] object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-text-primary font-semibold text-[13px]">{sp.name}</div>
                        <div className="text-text-secondary text-[11px] mt-0.5">{sp.usage}</div>
                      </div>
                      <span className="text-[10px] text-text-muted whitespace-nowrap px-2 py-0.5 rounded-md bg-bg-hover shrink-0">{sp.location}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════ TAB 2: DOCUMENTS & KNOWLEDGE ═══════ */}
        {activeTab === "docs" && (
          <motion.div key="docs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {/* Top row: Engagement + KB */}
            <div className="grid grid-cols-2 gap-4 mb-7">
              {/* Document Engagement */}
              <div className="bg-bg-surface border border-border-default rounded-[14px] p-[22px] group/doc">
                <div className="flex justify-between items-center mb-3.5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                    <FileText className="w-4 h-4 text-brand-400" /> Document Engagement
                  </div>
                  <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-bg-elevated border border-border-default text-xs font-medium text-text-secondary hover:border-brand-400 hover:text-brand-400 transition-all cursor-pointer opacity-0 group-hover/doc:opacity-100">
                    <Download className="w-3 h-3" /> Bulk download
                  </button>
                </div>
                <div className="text-[11px] text-text-muted mb-3.5">Most Viewed Documents (30 days)</div>
                {topDocs.map((doc, i) => (
                  <div key={doc.name} onClick={() => setSelectedDoc(doc)} className="flex items-center py-2.5 px-3 rounded-lg cursor-pointer hover:bg-bg-hover transition-colors group">
                    <span className="w-6 text-xs text-text-muted shrink-0">{i + 1}.</span>
                    <span className="flex-1 text-[13px] text-text-primary font-medium">{doc.name}</span>
                    <span className="text-[13px] font-semibold text-text-secondary">{doc.views}</span>
                    <ChevronRight className="w-4 h-4 text-text-muted ml-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
                <div className="mt-3.5 pt-3 border-t border-border-default text-[11px] text-text-muted">
                  Downloads: <strong className="text-brand-400 font-semibold">{tc.docEngagement.downloads.toLocaleString()}</strong> &nbsp;&nbsp; Unique: <strong className="text-brand-400 font-semibold">{tc.docEngagement.unique.toLocaleString()}</strong>
                </div>
              </div>

              {/* Knowledge Base FAQs */}
              <div className="bg-bg-surface border border-border-default rounded-[14px] p-[22px] flex flex-col group/kb">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                    <BookOpen className="w-4 h-4 text-brand-400" /> Knowledge Base FAQs
                  </div>
                  <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-bg-elevated border border-border-default text-xs font-medium text-text-secondary hover:border-brand-400 hover:text-brand-400 transition-all cursor-pointer opacity-0 group-hover/kb:opacity-100">
                    <Download className="w-3 h-3" /> Bulk download
                  </button>
                </div>
                {faqs.map((faq, i) => (
                  <div key={i} className="py-2.5 border-b border-white/[0.04] last:border-b-0 cursor-pointer" onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}>
                    <div className="flex items-center gap-2.5">
                      <span className="flex-1 text-[13px] text-text-primary leading-relaxed">{faq.q}</span>
                      <ChevronDown className={`w-4 h-4 text-text-muted shrink-0 ml-2 transition-transform ${expandedFaq === i ? "rotate-180" : ""}`} />
                    </div>
                    <span className="inline-block mt-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold whitespace-nowrap bg-[rgba(34,184,207,0.12)] text-brand-400">{faq.category}</span>
                    <AnimatePresence>
                      {expandedFaq === i && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="pt-3 pb-1.5">
                            <p className="text-[13px] text-text-secondary leading-[1.7]">{faq.a}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>

            {/* All Content - File Browser */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-base font-semibold text-text-primary">All Content</span>
              <div className="flex gap-1">
                {[
                  { key: "grid", icon: <LayoutGrid className="w-4 h-4" />, title: "Icons" },
                  { key: "list", icon: <List className="w-4 h-4" />, title: "List" },
                  { key: "columns", icon: <Columns3 className="w-4 h-4" />, title: "Columns" },
                ].map(v => (
                  <button key={v.key} title={v.title}
                    onClick={() => { setFileBrowserView(v.key); if (v.key === "columns") { setCurrentPath([]); setColumnSelections([]); } }}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center border cursor-pointer transition-all ${fileBrowserView === v.key ? "bg-bg-elevated border-border-bright text-text-primary" : "border-border-default text-text-muted hover:text-text-primary"}`}>
                    {v.icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Breadcrumb */}
            {currentPath.length > 0 && fileBrowserView !== "columns" && (
              <div className="flex items-center gap-1 mb-3.5 text-xs">
                <button onClick={() => navigateTo(-1)} className="text-brand-400 font-medium px-1.5 py-0.5 rounded hover:bg-bg-hover transition-colors cursor-pointer bg-transparent border-none text-xs font-[inherit]">All Content</button>
                {currentPath.map((seg, i) => (
                  <span key={i} className="flex items-center gap-1">
                    <span className="text-text-muted text-[11px]">&#x203A;</span>
                    {i < currentPath.length - 1 ? (
                      <button onClick={() => navigateTo(i)} className="text-brand-400 font-medium px-1.5 py-0.5 rounded hover:bg-bg-hover transition-colors cursor-pointer bg-transparent border-none text-xs font-[inherit]">{seg}</button>
                    ) : (
                      <span className="text-text-primary font-medium px-1.5 py-0.5">{seg}</span>
                    )}
                  </span>
                ))}
              </div>
            )}

            {/* Grid View */}
            {fileBrowserView === "grid" && (
              <div className="grid grid-cols-3 gap-3.5">
                {currentItems.map(item => item.type === "folder" ? (
                  <div key={item.name} onClick={() => openFolder(item.name)}
                    className="bg-bg-surface border border-border-default rounded-xl p-6 flex flex-col items-center text-center cursor-pointer hover:border-border-bright hover:bg-bg-hover transition-all">
                    <Folder className="w-[42px] h-[42px] text-brand-400" fill="var(--color-brand-400)" />
                    <div className="text-[13px] font-semibold text-text-primary mt-2.5">{item.name}</div>
                    <div className="text-[11px] text-text-muted mt-0.5">{getFileCount(item)} items</div>
                  </div>
                ) : (
                  <div key={item.name} className="relative bg-bg-surface border border-border-default rounded-xl p-[18px] flex flex-col hover:border-border-bright hover:bg-bg-hover transition-all group/file">
                    <div className="flex items-center gap-1.5 mb-3">
                      <FileText className="w-6 h-6 text-text-muted" />
                    </div>
                    <div className="text-[13px] font-semibold text-text-primary mb-1 leading-tight">{item.name}</div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[5px] text-[10px] font-bold uppercase bg-bg-elevated border border-border-default text-text-secondary">
                        {item.locked && <Lock className="w-2.5 h-2.5" />}
                        {item.fileType.toUpperCase()}
                      </span>
                      <span className="text-[11px] text-text-muted">{item.date}</span>
                    </div>
                    <div className="absolute top-2.5 right-2.5 opacity-0 group-hover/file:opacity-100 transition-opacity">
                      <AddToCartButton item={{ title: item.name, type: item.fileType.toUpperCase(), desc: item.date }} label="Save" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* List View */}
            {fileBrowserView === "list" && (
              <div className="flex flex-col gap-0.5">
                {currentItems.map(item => item.type === "folder" ? (
                  <div key={item.name} onClick={() => openFolder(item.name)}
                    className="relative flex items-center gap-3 py-2.5 px-3.5 pr-24 rounded-lg cursor-pointer hover:bg-bg-hover transition-colors group">
                    <Folder className="w-[18px] h-[18px] text-brand-400 shrink-0" fill="var(--color-brand-400)" />
                    <span className="flex-1 text-[13px] font-medium text-text-primary">{item.name}</span>
                    <span className="text-xs text-text-muted w-[72px] text-right shrink-0">{getFileCount(item)} items</span>
                    <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ) : (
                  <div key={item.name} className="relative flex items-center gap-3 py-2.5 px-3.5 pr-24 rounded-lg hover:bg-bg-hover transition-colors group/listfile">
                    <FileText className="w-[18px] h-[18px] text-text-muted shrink-0" />
                    <span className="text-[13px] font-medium text-text-primary">{item.name}</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[5px] text-[10px] font-bold uppercase bg-bg-elevated border border-border-default text-text-secondary shrink-0">
                      {item.locked && <Lock className="w-2.5 h-2.5" />}
                      {item.fileType.toUpperCase()}
                    </span>
                    <span className="flex-1" />
                    <span className="text-xs text-text-muted w-[72px] text-right shrink-0">{item.date}</span>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover/listfile:opacity-100 transition-opacity">
                      <AddToCartButton item={{ title: item.name, type: item.fileType.toUpperCase(), desc: item.date }} label="Save" />
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Columns View */}
            {fileBrowserView === "columns" && (
              <div ref={columnsRef} className="flex border border-border-default rounded-xl overflow-x-auto overflow-y-hidden" style={{ height: 380 }}>
                {columnsData.map((items, depth) => (
                  <div key={depth} className={`min-w-[220px] w-[220px] border-r border-border-default overflow-y-auto shrink-0 ${depth === columnsData.length - 1 ? "flex-1 !min-w-[260px] !border-r-0" : ""}`}>
                    {items.map((item, idx) => {
                      const isActive = columnSelections[depth] === idx;
                      return (
                        <div key={item.name} onClick={() => selectColumn(depth, idx)}
                          className={`flex items-center gap-2 py-2 px-3.5 cursor-pointer transition-colors text-[13px] ${isActive ? "bg-brand-400 text-white" : "text-text-primary hover:bg-bg-hover"}`}>
                          {item.type === "folder" ? (
                            <Folder className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-brand-400"}`} fill={isActive ? "white" : "var(--color-brand-400)"} />
                          ) : (
                            <FileText className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-text-muted"}`} />
                          )}
                          <span className="flex-1 font-medium whitespace-nowrap overflow-hidden text-ellipsis">{item.name}</span>
                          {item.type === "folder" ? (
                            <>
                              <span className={`text-[11px] shrink-0 ${isActive ? "text-white/70" : "text-text-muted"}`}>{getFileCount(item)}</span>
                              <ChevronRight className={`w-3 h-3 shrink-0 ${isActive ? "text-white/60" : "text-text-muted"}`} />
                            </>
                          ) : (
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 ${isActive ? "bg-white/20 text-white" : "bg-bg-elevated border border-border-default text-text-secondary"}`}>{item.fileType.toUpperCase()}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ═══════ TAB 3: UPDATES ═══════ */}
        {activeTab === "updates" && (
          <motion.div key="updates" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <div className="flex flex-col gap-4">
              {updates.map((update, i) => (
                <div key={i} onClick={() => setSelectedUpdate(i)}
                  className="bg-bg-surface border border-border-default rounded-[14px] p-6 cursor-pointer transition-all hover:border-brand-400 hover:shadow-[0_0_0_1px_var(--color-brand-400)]">
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[rgba(34,184,207,0.12)] shrink-0">
                      {update.type === "new" && <Plus className="w-[15px] h-[15px] text-brand-400" />}
                      {update.type === "updated" && <Eye className="w-[15px] h-[15px] text-brand-400" />}
                      {update.type === "removed" && <Trash2 className="w-[15px] h-[15px] text-brand-400" />}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.5px] text-brand-400">{update.type}</span>
                    <span className="text-[11px] text-text-muted">{update.date}</span>
                  </div>
                  <div className="text-[15px] font-semibold text-text-primary mb-1.5">{update.title}</div>
                  <div className="text-[13px] text-text-secondary leading-relaxed" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {update.body.split("\n\n")[0]}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ UPDATE DETAIL MODAL ═══ */}
      {selectedUpdate !== null && createPortal(
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center" onClick={() => setSelectedUpdate(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="bg-bg-surface border border-border-default rounded-2xl p-8 max-w-[600px] w-[90%] max-h-[80vh] overflow-y-auto relative shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
            onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedUpdate(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-bg-elevated border border-border-default text-text-muted flex items-center justify-center cursor-pointer hover:border-brand-400 hover:text-brand-400 transition-all">
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[rgba(34,184,207,0.12)] shrink-0">
                {updates[selectedUpdate].type === "new" && <Plus className="w-[15px] h-[15px] text-brand-400" />}
                {updates[selectedUpdate].type === "updated" && <Eye className="w-[15px] h-[15px] text-brand-400" />}
                {updates[selectedUpdate].type === "removed" && <Trash2 className="w-[15px] h-[15px] text-brand-400" />}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.5px] text-brand-400">{updates[selectedUpdate].type}</span>
              <span className="text-[11px] text-text-muted">{updates[selectedUpdate].date}</span>
            </div>
            <div className="text-xl font-bold text-text-primary mb-4 pr-10">{updates[selectedUpdate].title}</div>
            <div className="text-sm text-text-secondary leading-[1.8]">
              {updates[selectedUpdate].body.split("\n\n").map((p, i) => <p key={i} className="mb-3">{p}</p>)}
            </div>
            <div className="mt-5 pt-4 border-t border-border-default flex gap-2">
              <button onClick={() => setSelectedUpdate(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer border border-border-default bg-bg-elevated text-text-secondary hover:border-brand-400 hover:text-brand-400 transition-all">Close</button>
              <button className="px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer border border-brand-400 bg-brand-400 text-white hover:opacity-90 transition-all">View Document</button>
            </div>
          </motion.div>
        </div>,
        document.body
      )}

      {/* ═══ DOCUMENT PREVIEW MODAL ═══ */}
      {selectedDoc && createPortal(
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center" onClick={() => setSelectedDoc(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-bg-surface border border-border-default rounded-2xl max-w-[640px] w-[90%] max-h-[80vh] overflow-hidden relative shadow-[0_20px_60px_rgba(0,0,0,0.5)] flex flex-col"
            onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-default">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-brand-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary">{selectedDoc.name}</h3>
                  <p className="text-[10px] text-text-muted">{selectedDoc.views} views in the last 30 days</p>
                </div>
              </div>
              <button onClick={() => setSelectedDoc(null)} className="p-1.5 rounded-lg hover:bg-bg-hover transition-colors">
                <X className="w-4 h-4 text-text-muted" />
              </button>
            </div>
            {/* Placeholder document body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="bg-bg-elevated rounded-xl border border-border-default p-6 mb-4">
                <div className="space-y-3">
                  <div className="h-3 bg-bg-hover rounded-full w-3/4" />
                  <div className="h-3 bg-bg-hover rounded-full w-full" />
                  <div className="h-3 bg-bg-hover rounded-full w-5/6" />
                  <div className="h-3 bg-bg-hover rounded-full w-2/3" />
                </div>
                <div className="mt-6 space-y-3">
                  <div className="h-3 bg-bg-hover rounded-full w-full" />
                  <div className="h-3 bg-bg-hover rounded-full w-4/5" />
                  <div className="h-3 bg-bg-hover rounded-full w-full" />
                  <div className="h-3 bg-bg-hover rounded-full w-3/4" />
                  <div className="h-3 bg-bg-hover rounded-full w-5/6" />
                </div>
                <div className="mt-6 space-y-3">
                  <div className="h-3 bg-bg-hover rounded-full w-2/3" />
                  <div className="h-3 bg-bg-hover rounded-full w-full" />
                  <div className="h-3 bg-bg-hover rounded-full w-4/5" />
                </div>
              </div>
              <p className="text-[11px] text-text-muted text-center">This is a preview placeholder. The full document would be rendered here.</p>
              <p className="text-[10px] text-text-muted text-center mt-2">PDF · Last updated Mar 2026</p>
            </div>
            {/* Footer */}
            <div className="px-6 py-4 border-t border-border-default flex items-center justify-between">
              <button onClick={() => setSelectedDoc(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer border border-border-default bg-bg-elevated text-text-secondary hover:border-brand-400 hover:text-brand-400 transition-all">Close</button>
              <div className="flex gap-2">
                <AddToCartButton item={{ title: selectedDoc.name, type: "PDF", desc: `${selectedDoc.views} views` }} label="Save to Collection" />
                <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer bg-brand-500 text-white hover:opacity-90 transition-all">
                  <Download className="w-3 h-3" /> Download
                </button>
              </div>
            </div>
          </motion.div>
        </div>,
        document.body
      )}
    </Tabs.Root>
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
                        { label: "Certifications", value: "8 active", icon: Shield },
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
  const location = useLocation();
  const { addItem, isItemAdded, startReviewTodos, advanceTodos, toggleTodo, setPanelTab, setCocoState, startCocoWork, updateCocoTask, finishCocoWork, resetCoco, cocoAnim: sharedCocoAnim, cocoStatus: sharedCocoStatus, addContentGap } = useCart();
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
  const [gapsShared, setGapsShared] = useState(false);
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

  // Skip to questionnaire upload when navigated from Scorecard
  const skipHandled = useRef(false);
  useEffect(() => {
    if (location.state?.skipToUpload && !skipHandled.current && !chatStarted) {
      skipHandled.current = true;
      // Clear the navigation state so it doesn't re-trigger
      window.history.replaceState({}, "");
      // Start chat and jump to step 12 (questionnaire upload prompt)
      demoActive.current = true;
      setChatStarted(true);
      setMessages([
        { role: "agent", state: "idle", text: "Hey! I see you're coming from the Trust Scorecard. I can help pre-fill a questionnaire from the Trust Center docs — just upload yours and I'll get started." },
      ]);
      setDemoStep(12); // Step 12 is the upload prompt
      setCocoState("idle", "idle", "Ready for questionnaire");
      // Start the review todos in the sidebar
      startReviewTodos();
    }
  }, [location.state, chatStarted, setCocoState, startReviewTodos, demoScript]);

  // Continue from voice mode — seed chat with voice transcript
  const voiceHandled = useRef(false);
  useEffect(() => {
    if (location.state?.voiceTranscript && !voiceHandled.current && !chatStarted) {
      voiceHandled.current = true;
      const transcript = location.state.voiceTranscript;
      window.history.replaceState({}, "");
      demoActive.current = true;
      setChatStarted(true);
      // Convert voice transcript to chat messages
      const msgs = transcript.map(t => ({
        role: t.role === "coco" ? "agent" : "user",
        state: "idle",
        text: t.text,
      }));
      // Add a bridging message from Coco
      msgs.push({
        role: "agent", state: "idle",
        text: "Continuing from our voice conversation — feel free to ask follow-up questions or I can help you dig deeper into any of these topics.",
      });
      setMessages(msgs);
      setCocoState("idle", "idle", "Continuing conversation");
    }
  }, [location.state, chatStarted, setCocoState]);

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
  }, [addContentGap]);

  // MCP vendor comparison flow
  const handleStartComparison = useCallback(() => {
    if (comparisonStarted) return;
    setComparisonStarted(true);

    // 1. Add user message
    setMessages(prev => [...prev, {
      role: "user",
      text: "Compare breach notification timelines and incident response across @mediacore @arcline @nunita",
    }]);

    // 2. Thinking steps - querying each vendor via MCP
    setTimeout(() => {
      setCocoState("thinking", "Comparing vendors...");
      setMessages(prev => [...prev, {
        role: "agent", state: "thinking",
        thinking: [
          "Connecting to Mediacore Trust Center via MCP...",
          "Querying Arcline Trust Center incident response policies...",
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
          vendors: ["Mediacore", "Arcline", "Nunita"],
          rows: [
            {
              label: "Breach Notification SLA",
              cells: [
                { status: "good", value: "24 hours", source: "@mediacore/dpa p.8" },
                { status: "good", value: "72 hours (GDPR-aligned)", source: "@arcline/dpa p.11" },
                { status: "gap", value: "\"Without undue delay\"", source: "@nunita/privacy-policy p.5" },
              ],
            },
            {
              label: "Dedicated IR Team",
              cells: [
                { status: "good", value: "Yes — 24/7 CSIRT, 4 FTEs", source: "@mediacore/soc2-type2 p.41" },
                { status: "good", value: "Yes — SecOps on-call rotation", source: "@arcline/security-policy p.22" },
                { status: "warning", value: "Shared with engineering team", source: "@nunita/security-overview p.9" },
              ],
            },
            {
              label: "Post-Incident Reporting",
              cells: [
                { status: "good", value: "RCA within 5 business days", source: "@mediacore/ir-plan p.6" },
                { status: "good", value: "RCA within 7 business days", source: "@arcline/soc2-report p.38" },
                { status: "gap", value: "No documented timeline", source: "No source found" },
              ],
            },
            {
              label: "Customer Communication",
              cells: [
                { status: "good", value: "Direct email + status page", source: "@mediacore/ir-plan p.7" },
                { status: "good", value: "Email + in-app banner + status page", source: "@arcline/security-policy p.24" },
                { status: "warning", value: "Email only", source: "@nunita/faq #incident-response" },
              ],
            },
            {
              label: "Annual IR Testing",
              cells: [
                { status: "good", value: "Quarterly tabletop exercises", source: "@mediacore/iso27001 p.15" },
                { status: "good", value: "Biannual tabletop + annual simulation", source: "@arcline/soc2-report p.40" },
                { status: "gap", value: "Not documented", source: "No source found" },
              ],
            },
          ],
        },
        comparisonSummary: "**Mediacore** has the tightest breach notification window at 24 hours with a dedicated CSIRT. **Arcline** is strong across the board with GDPR-aligned 72-hour notification, multi-channel communication, and the most rigorous IR testing program. **Nunita** has significant gaps — no defined notification SLA, no documented post-incident timeline, and no evidence of IR testing. I'd flag Nunita's incident response as a risk item.",
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
              View guided demo <ArrowRight className="w-3.5 h-3.5" />
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
                  <button className="flex items-center gap-1.5 text-[11px] text-text-muted hover:text-brand-400 transition-colors" aria-label="Voice input">
                    <Mic className="w-3.5 h-3.5" />Voice
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
      <div className="flex items-center gap-3 px-6 h-[56px] shrink-0 border-b border-border-default bg-bg-surface/50">
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
                        <p className="text-[11px] text-brand-400 font-medium flex-1">Message sent to {msg.gapDraft.to}</p>
                        {!gapsShared ? (
                          <button onClick={() => {
                            setGapsShared(true);
                            addContentGap({ topic: "Client-managed encryption keys (BYOK) support", category: "Encryption & Key Mgmt" });
                            addContentGap({ topic: "Key custodian procedures and segregation of duties", category: "Encryption & Key Mgmt" });
                            addContentGap({ topic: "Data retention policy for backups after termination", category: "Data Privacy" });
                          }}
                            className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-md bg-brand-500 text-bg-primary text-[10px] font-medium hover:bg-brand-400 transition-colors">
                            <ArrowUpRight className="w-3 h-3" /> Share to Scorecard
                          </button>
                        ) : (
                          <span className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-md bg-brand-500/15 text-brand-400 text-[10px] font-medium">
                            <Check className="w-3 h-3" /> Shared
                          </span>
                        )}
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
                            onClick={() => { if (!comparisonAdded) { addItem({ title: "Vendor IR Comparison", type: "Report", desc: "Side-by-side incident response comparison across Mediacore, Arcline, and Nunita" }); setPanelTab("collection"); } }}
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
                  <span className="text-brand-400 font-semibold">@arcline</span>{" "}
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
            <button className="p-1 hover:bg-bg-hover rounded transition-colors" aria-label="Voice input">
              <Mic className="w-4 h-4 text-text-muted" />
            </button>
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
   VIEW: TRUST SCORECARD
   ═══════════════════════════════════════════════════════════════ */

function Tooltip({ text, children }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-flex" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      <AnimatePresence>
        {show && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 rounded-lg bg-bg-primary border border-border-default shadow-xl text-xs text-text-secondary leading-relaxed pointer-events-none">
            {text}
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}

function SaveableSection({ title, desc, type = "image", children }) {
  const { addItem, isItemAdded } = useCart();
  const saved = isItemAdded(title);
  return (
    <div className="group/save relative">
      {children}
      <div className={`absolute top-3 right-3 z-10 transition-all duration-200 ${saved ? "opacity-100" : "opacity-0 group-hover/save:opacity-100"}`}>
        {!saved ? (
          <button onClick={() => addItem({ title, desc: desc || title, type: type === "table" ? "XLSX" : "PNG" })}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-bg-primary/90 backdrop-blur border border-border-default shadow-lg text-[10px] font-medium text-text-secondary hover:text-brand-400 hover:border-brand-500/40 transition-colors">
            <FolderDown className="w-3.5 h-3.5" /> Save to Collection
          </button>
        ) : (
          <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-brand-500/10 backdrop-blur border border-brand-500/30 text-[10px] font-medium text-brand-400">
            <Check className="w-3.5 h-3.5" /> Saved
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Recharts shared components ── */

const CHART_PALETTES = {
  arcline: { brand: '#22B8CF', brandLight: '#80E0E8', brandDim: '#1A9DB5' },
  mediacore: { brand: '#8B5CF6', brandLight: '#C4B5FD', brandDim: '#7C3AED' },
};
const CHART_COLORS_BASE = {
  surface: '#16161E', border: '#2A2A3A', textMuted: '#7A7A8E',
  textSecondary: '#A0A0B8', textPrimary: '#F0F0F8',
  yellow: '#f59e0b', red: '#ef4444', blue: '#38bdf8', purple: '#a78bfa',
};
function getChartColors(tcId) {
  const p = CHART_PALETTES[tcId] || CHART_PALETTES.arcline;
  return { ...CHART_COLORS_BASE, ...p };
}
// Default for non-TC-aware contexts
const CHART_COLORS = { ...CHART_COLORS_BASE, ...CHART_PALETTES.arcline };

function ChartTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-bg-primary border border-border-default rounded-lg px-3.5 py-2.5 shadow-xl">
      {label && <div className="text-xs font-semibold text-text-primary mb-1">{label}</div>}
      {payload.map((p, i) => (
        <div key={i} className="text-[11px] text-text-secondary">
          {p.name}: <strong className="text-brand-400">{formatter ? formatter(p.value, p.name) : p.value}</strong>
        </div>
      ))}
    </div>
  );
}

/* ── Radial Bar Chart for Trust Score ── */

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

const BUYER_ICONS_PURPLE = {
  framework: (
    <svg width="28" height="28" viewBox="0 0 8 8" style={{ imageRendering: 'pixelated' }}>
      <rect x="1" y="0" width="5" height="1" fill="#4C1D95"/>
      <rect x="1" y="1" width="1" height="5" fill="#4C1D95"/>
      <rect x="6" y="0" width="1" height="5" fill="#4C1D95"/>
      <rect x="2" y="2" width="5" height="1" fill="#6D28D9"/>
      <rect x="2" y="3" width="1" height="4" fill="#6D28D9"/>
      <rect x="7" y="2" width="1" height="5" fill="#6D28D9"/>
      <rect x="2" y="7" width="6" height="1" fill="#6D28D9"/>
      <rect x="3" y="4" width="3" height="1" fill="#8B5CF6" opacity="0.6"/>
      <rect x="3" y="6" width="3" height="1" fill="#8B5CF6" opacity="0.6"/>
      <rect x="4" y="4" width="1" height="1" fill="#C4B5FD">
        <animate attributeName="fill" values="#C4B5FD;#FFFFFF;#C4B5FD" dur="2.4s" repeatCount="indefinite"/>
      </rect>
      <rect x="5" y="3" width="1" height="1" fill="#C4B5FD"/>
    </svg>
  ),
  audit: (
    <svg width="28" height="28" viewBox="0 0 8 8" style={{ imageRendering: 'pixelated' }}>
      <rect x="2" y="0" width="4" height="1" fill="#C4B5FD"/>
      <rect x="1" y="1" width="1" height="3" fill="#A78BFA"/>
      <rect x="6" y="1" width="1" height="3" fill="#A78BFA"/>
      <rect x="0" y="1" width="1" height="2" fill="#8B5CF6"/>
      <rect x="7" y="1" width="1" height="2" fill="#8B5CF6"/>
      <rect x="1" y="4" width="1" height="1" fill="#6D28D9"/>
      <rect x="6" y="4" width="1" height="1" fill="#6D28D9"/>
      <rect x="2" y="5" width="1" height="1" fill="#4C1D95"/>
      <rect x="5" y="5" width="1" height="1" fill="#4C1D95"/>
      <rect x="3" y="6" width="2" height="1" fill="#2E1065"/>
      <rect x="2" y="3" width="1" height="1" fill="#C4B5FD"/>
      <rect x="3" y="4" width="1" height="1" fill="#C4B5FD">
        <animate attributeName="fill" values="#C4B5FD;#FFFFFF;#C4B5FD" dur="2s" repeatCount="indefinite"/>
      </rect>
      <rect x="4" y="3" width="1" height="1" fill="#C4B5FD"/>
      <rect x="5" y="2" width="1" height="1" fill="#C4B5FD"/>
    </svg>
  ),
  reviewers: (
    <svg width="28" height="28" viewBox="0 0 8 8" style={{ imageRendering: 'pixelated' }}>
      <rect x="3" y="1" width="2" height="1" fill="#C4B5FD"/>
      <rect x="3" y="2" width="2" height="1" fill="#A78BFA"/>
      <rect x="2" y="3" width="4" height="1" fill="#8B5CF6"/>
      <rect x="3" y="4" width="2" height="1" fill="#6D28D9"/>
      <rect x="0" y="1" width="2" height="1" fill="#4C1D95"/>
      <rect x="0" y="2" width="2" height="1" fill="#4C1D95"/>
      <rect x="0" y="3" width="2" height="1" fill="#2E1065"/>
      <rect x="6" y="1" width="2" height="1" fill="#4C1D95"/>
      <rect x="6" y="2" width="2" height="1" fill="#4C1D95"/>
      <rect x="6" y="3" width="2" height="1" fill="#2E1065"/>
      <rect x="0" y="5" width="8" height="1" fill="#4C1D95" opacity="0.4"/>
      <rect x="1" y="6" width="6" height="1" fill="#6D28D9" opacity="0.3"/>
      <rect x="4" y="0" width="1" height="1" fill="#C4B5FD" opacity="0.6">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="1.8s" repeatCount="indefinite"/>
      </rect>
    </svg>
  ),
};

const BUYER_ACHIEVEMENT_ICONS = {
  framework: (
    <svg width="28" height="28" viewBox="0 0 8 8" style={{ imageRendering: 'pixelated' }}>
      <rect x="1" y="0" width="5" height="1" fill="#14768A"/>
      <rect x="1" y="1" width="1" height="5" fill="#14768A"/>
      <rect x="6" y="0" width="1" height="5" fill="#14768A"/>
      <rect x="2" y="2" width="5" height="1" fill="#1A9DB5"/>
      <rect x="2" y="3" width="1" height="4" fill="#1A9DB5"/>
      <rect x="7" y="2" width="1" height="5" fill="#1A9DB5"/>
      <rect x="2" y="7" width="6" height="1" fill="#1A9DB5"/>
      <rect x="3" y="4" width="3" height="1" fill="#22B8CF" opacity="0.6"/>
      <rect x="3" y="6" width="3" height="1" fill="#22B8CF" opacity="0.6"/>
      <rect x="4" y="4" width="1" height="1" fill="#80E0E8">
        <animate attributeName="fill" values="#80E0E8;#FFFFFF;#80E0E8" dur="2.4s" repeatCount="indefinite"/>
      </rect>
      <rect x="5" y="3" width="1" height="1" fill="#80E0E8"/>
    </svg>
  ),
  audit: (
    <svg width="28" height="28" viewBox="0 0 8 8" style={{ imageRendering: 'pixelated' }}>
      <rect x="2" y="0" width="4" height="1" fill="#80E0E8"/>
      <rect x="1" y="1" width="1" height="3" fill="#5CD0DC"/>
      <rect x="6" y="1" width="1" height="3" fill="#5CD0DC"/>
      <rect x="0" y="1" width="1" height="2" fill="#22B8CF"/>
      <rect x="7" y="1" width="1" height="2" fill="#22B8CF"/>
      <rect x="1" y="4" width="1" height="1" fill="#1A9DB5"/>
      <rect x="6" y="4" width="1" height="1" fill="#1A9DB5"/>
      <rect x="2" y="5" width="1" height="1" fill="#14768A"/>
      <rect x="5" y="5" width="1" height="1" fill="#14768A"/>
      <rect x="3" y="6" width="2" height="1" fill="#0A3D4A"/>
      <rect x="2" y="3" width="1" height="1" fill="#80E0E8"/>
      <rect x="3" y="4" width="1" height="1" fill="#80E0E8">
        <animate attributeName="fill" values="#80E0E8;#FFFFFF;#80E0E8" dur="2s" repeatCount="indefinite"/>
      </rect>
      <rect x="4" y="3" width="1" height="1" fill="#80E0E8"/>
      <rect x="5" y="2" width="1" height="1" fill="#80E0E8"/>
    </svg>
  ),
  reviewers: (
    <svg width="28" height="28" viewBox="0 0 8 8" style={{ imageRendering: 'pixelated' }}>
      <rect x="3" y="1" width="2" height="1" fill="#80E0E8"/>
      <rect x="3" y="2" width="2" height="1" fill="#5CD0DC"/>
      <rect x="2" y="3" width="4" height="1" fill="#22B8CF"/>
      <rect x="3" y="4" width="2" height="1" fill="#1A9DB5"/>
      <rect x="0" y="1" width="2" height="1" fill="#14768A"/>
      <rect x="0" y="2" width="2" height="1" fill="#14768A"/>
      <rect x="0" y="3" width="2" height="1" fill="#0A3D4A"/>
      <rect x="6" y="1" width="2" height="1" fill="#14768A"/>
      <rect x="6" y="2" width="2" height="1" fill="#14768A"/>
      <rect x="6" y="3" width="2" height="1" fill="#0A3D4A"/>
      <rect x="0" y="5" width="8" height="1" fill="#14768A" opacity="0.4"/>
      <rect x="1" y="6" width="6" height="1" fill="#1A9DB5" opacity="0.3"/>
      <rect x="4" y="0" width="1" height="1" fill="#80E0E8" opacity="0.6">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="1.8s" repeatCount="indefinite"/>
      </rect>
    </svg>
  ),
};

function getScoreColors(tcId) {
  const brand = tcId === "mediacore" ? "#8B5CF6" : "#22B8CF";
  return { "Depth": "#f59e0b", "Freshness": "#38bdf8", "Coverage": "#a78bfa", "Overall Score": brand };
}
const SCORE_COLORS = getScoreColors("arcline");

function ScoreRadialBar(props) {
  const colors = props.colors || SCORE_COLORS;
  const isActive = !props.selected || props.payload?.label === props.selected;
  return (
    <Sector {...props}
      fill={colors[props.payload?.label] || props.fill}
      opacity={isActive ? 1 : 0.12}
      style={{ transition: "opacity 0.3s ease" }}
    />
  );
}

function TrustScoreRadialChart({ data, selected, colors }) {
  const c = colors || SCORE_COLORS;
  const chartData = data.map(d => ({ ...d, fill: c[d.label] }));

  return (
    <RadialBarChart width={260} height={240} cx="50%" cy="50%"
      innerRadius={30} outerRadius={110} barSize={16}
      data={chartData} startAngle={90} endAngle={-270}>
      <RadialBar
        background={{ fill: "#334155", opacity: 0.25 }}
        dataKey="value" cornerRadius={8}
        shape={<ScoreRadialBar selected={selected} colors={c} />}
        label={{ position: "insideStart", fill: "#fff", fontSize: 11, fontWeight: 600,
          formatter: (v, _name, _props, index) => {
            if (!selected) return `${v}%`;
            return selected === data[index]?.label ? `${v}%` : "";
          }
        }}
      />
    </RadialBarChart>
  );
}

function ScorecardDashboard() {
  const tc = useTc();
  const tcId = tc?.id || "arcline";
  const chartColors = useMemo(() => getChartColors(tcId), [tcId]);
  const scoreColors = useMemo(() => getScoreColors(tcId), [tcId]);
  const buyerIcons = tcId === "mediacore" ? BUYER_ICONS_PURPLE : BUYER_ACHIEVEMENT_ICONS;
  const { contentGaps, addContentGap } = useCart();
  const navigate = useNavigate();
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [gapSort, setGapSort] = useState("votes");
  const [gapVotes, setGapVotes] = useState({});
  const [compareSearch, setCompareSearch] = useState("");
  const [categoryView, setCategoryView] = useState("list");
  const [docView, setDocView] = useState("list");
  const [selectedScore, setSelectedScore] = useState(null);
  const [gapModalOpen, setGapModalOpen] = useState(false);
  const [gapTitle, setGapTitle] = useState("");
  const [gapDesc, setGapDesc] = useState("");
  const [gapCategory, setGapCategory] = useState("");
  const [gapSubmitted, setGapSubmitted] = useState(false);
  const [gapMatchConfirmed, setGapMatchConfirmed] = useState(null);
  const [gapSnackbar, setGapSnackbar] = useState(null); // snackbar message

  /* ── Section 1: Trust Score data ── */
  const isMediacore = tcId === "mediacore";
  const trustScore = isMediacore
    ? { overall: 74, coverage: 86, freshness: 79, depth: 68 }
    : { overall: 82, coverage: 94, freshness: 88, depth: 76 };
  const radialData = isMediacore ? [
    { label: "Depth", value: trustScore.depth, blurb: "Evidence layers across broadcast & ad-tech",
      detail: "Measures evidence layers per topic. Single FAQ = 1pt, FAQ + document = 2pt, FAQ + doc + certification = 3pt. Strongest in CDN & Delivery, weakest in DRM Key Management." },
    { label: "Freshness", value: trustScore.freshness, blurb: "Docs refreshed within the last quarter",
      detail: "Weighted by document importance — SOC 2 and DRM audit weighted 3×. Currently 4 documents are due for refresh including the SSAI threat model. 1 expired document." },
    { label: "Coverage", value: trustScore.coverage, blurb: "246 media security topics documented",
      detail: "Measured against CAIQ (197 questions), MPAA/TPN (82 controls), and partner intake forms with de-duplication. 38 topics remaining across DRM Key Management, Ad-Tech Privacy, and Physical Media Security." },
    { label: "Overall Score", value: trustScore.overall, blurb: "Composite of coverage, freshness, and depth",
      detail: "Weighted composite: Coverage 40%, Freshness 30%, Depth 30%. Score improved +16 points over the last 6 months. Ranks in the top 24% of 850+ Conveyor Trust Centers." },
  ] : [
    { label: "Depth", value: trustScore.depth, blurb: "Multi-source evidence per topic",
      detail: "Measures evidence layers per topic. Single FAQ = 1pt, FAQ + document = 2pt, FAQ + doc + certification = 3pt. Strongest in Access Management, weakest in Incident Response." },
    { label: "Freshness", value: trustScore.freshness, blurb: "All docs updated within 90 days",
      detail: "Weighted by document importance — SOC 2 reports and pen tests weighted 3×. Currently 2 documents are due for refresh. 0 expired documents." },
    { label: "Coverage", value: trustScore.coverage, blurb: "326 security topics with documented answers",
      detail: "Measured against SIG Lite (256 questions), CAIQ (197 questions), and VSA (136 questions) with de-duplication. 20 topics remaining across Data Residency, Incident Response, and Physical Security." },
    { label: "Overall Score", value: trustScore.overall, blurb: "Composite of coverage, freshness, and depth",
      detail: "Weighted composite: Coverage 40%, Freshness 30%, Depth 30%. Score improved +22 points over the last 6 months. Ranks in the top 12% of 850+ Conveyor Trust Centers." },
  ];
  const scoreTips = isMediacore ? {
    "Overall Score": "Composite of Coverage (40%), Freshness (30%), and Depth (30%). Coverage measures answers against media-industry frameworks. Freshness weights DRM and SOC docs higher. Depth rewards multi-source evidence.",
    "Coverage": "86% of 246 media security topics have documented answers. Measured against CAIQ (197 questions) and MPAA/TPN (82 controls) with de-duplication.",
    "Freshness": "Weighted average of document age. SOC 2 and DRM audit reports weighted 3×. Score: 100% = all docs < 90 days. Current: 79% — 4 documents due for refresh.",
    "Depth": "Measures evidence layers per topic. FAQ = 1pt, FAQ + document = 2pt, FAQ + doc + certification = 3pt. Current: 68% — strongest in CDN & Delivery, weakest in DRM Key Management.",
  } : {
    "Overall Score": "Composite of Coverage (40%), Freshness (30%), and Depth (30%). Coverage measures documented answers against standard frameworks. Freshness weights recent documents higher. Depth rewards multi-source evidence (FAQ + doc + cert).",
    "Coverage": "94% of 326 common security review topics have documented answers. Measured against SIG Lite (256 questions), CAIQ (197 questions), and VSA (136 questions) with de-duplication.",
    "Freshness": "Weighted average of document age. SOC 2 reports, pen test results, and certifications weighted 3×. Score: 100% = all docs < 90 days. Current: 88% — 2 documents due for refresh.",
    "Depth": "Measures evidence layers per topic. Single FAQ = 1pt, FAQ + document = 2pt, FAQ + document + certification = 3pt. Current: 76% — strongest in Access Management, weakest in Incident Response.",
  };

  /* ── Section 2: Category Breakdown ── */
  const categories = isMediacore ? [
    { name: "CDN & Delivery", score: 92, controls: 11, docs: 8, qaRate: 95, tags: ["Multi-CDN", "Token Auth", "Origin Shielding", "Edge WAF", "TLS 1.3"] },
    { name: "Content Protection", score: 78, controls: 9, docs: 5, qaRate: 82, tags: ["Widevine", "FairPlay", "PlayReady", "Key Rotation", "Forensic Watermarking"] },
    { name: "Data Privacy & GDPR", score: 83, controls: 10, docs: 7, qaRate: 86, tags: ["Viewer Consent", "DPA", "Cookie Compliance", "DSAR"] },
    { name: "Ad-Tech Security", score: 71, controls: 7, docs: 4, qaRate: 74, tags: ["SSAI", "VAST Validation", "Brand Safety", "Prebid Server"] },
    { name: "Incident Response", score: 66, controls: 6, docs: 3, qaRate: 69, tags: ["NOC Bridge", "Playback Recovery", "Partner Comms"] },
    { name: "Vendor & Partner Risk", score: 80, controls: 8, docs: 6, qaRate: 84, tags: ["Subprocessor Register", "CDN Vendor Reviews", "Measurement Partners"] },
    { name: "Origin Infrastructure", score: 88, controls: 12, docs: 8, qaRate: 91, tags: ["AWS Multi-Region", "Auto-Scaling", "Failover", "S3 Encryption"] },
  ] : [
    { name: "Access Management", score: 89, controls: 12, docs: 8, qaRate: 94, tags: ["SSO", "MFA", "RBAC", "SCIM", "Audit Logs"] },
    { name: "Application Security", score: 82, controls: 10, docs: 6, qaRate: 88, tags: ["SAST", "DAST", "Dependency Scanning", "Code Review"] },
    { name: "Data Privacy & Residency", score: 76, controls: 8, docs: 5, qaRate: 79, tags: ["GDPR", "DPA", "Data Classification", "Encryption at Rest"] },
    { name: "Infrastructure & Hosting", score: 91, controls: 14, docs: 9, qaRate: 96, tags: ["AWS", "SOC 2 Scope", "Network Segmentation", "WAF", "DDoS Protection"] },
    { name: "Incident Response", score: 68, controls: 6, docs: 3, qaRate: 71, tags: ["IR Plan", "Breach Notification", "Post-Incident Review"] },
    { name: "Vendor Risk Management", score: 88, controls: 9, docs: 7, qaRate: 91, tags: ["Sub-processor List", "Vendor Assessments", "DPA Tracking"] },
    { name: "Business Continuity", score: 85, controls: 7, docs: 6, qaRate: 87, tags: ["BCP", "DR Testing", "RTO/RPO", "Backup Strategy"] },
  ];
  const frameworks = isMediacore
    ? [{ name: "CAIQ", pct: 84 }, { name: "MPAA/TPN", pct: 76 }, { name: "Custom Q's", pct: 69 }, { name: "SIG Lite", pct: 81 }]
    : [{ name: "SIG Lite", pct: 92 }, { name: "CAIQ", pct: 87 }, { name: "VSA", pct: 83 }, { name: "Custom Q's", pct: 78 }];
  const NETWORK_AVG_SCORES = isMediacore
    ? { "CDN & Delivery": 74, "Content Protection": 65, "Data Privacy & GDPR": 69, "Ad-Tech Security": 58, "Incident Response": 63, "Vendor & Partner Risk": 67, "Origin Infrastructure": 73 }
    : { "Access Management": 72, "Application Security": 70, "Data Privacy & Residency": 68, "Infrastructure & Hosting": 75, "Incident Response": 66, "Vendor Risk Management": 71, "Business Continuity": 69 };
  const categoryRadarData = categories.map(cat => ({
    category: cat.name.length > 14 ? cat.name.split(" ").slice(0, 2).join(" ") : cat.name,
    thisTC: cat.score,
    networkAvg: NETWORK_AVG_SCORES[cat.name] || 70,
  }));

  /* ── Section 3: Content Gaps (from shared CartContext) ── */
  const gapStatusConfig = { open: { label: "Open", color: "text-red-400", dot: "bg-red-400" }, review: { label: "In Review", color: "text-yellow-400", dot: "bg-yellow-400" }, drafted: { label: "Response Drafted", color: "text-green-400", dot: "bg-green-400" } };
  const sortedGaps = useMemo(() => {
    const g = [...contentGaps];
    if (gapSort === "votes") g.sort((a, b) => (b.votes + (gapVotes[b.id] || 0)) - (a.votes + (gapVotes[a.id] || 0)));
    else if (gapSort === "newest") g.reverse();
    else if (gapSort === "status") g.sort((a, b) => a.status.localeCompare(b.status));
    return g;
  }, [contentGaps, gapSort, gapVotes]);
  const handleVote = (id, dir) => setGapVotes(p => ({ ...p, [id]: (p[id] || 0) === dir ? 0 : dir }));

  const GAP_CATEGORIES = ["Data Privacy", "Certifications", "Vendor Risk", "Incident Response", "Application Security", "Access Management", "Infrastructure", "Encryption & Key Mgmt", "Business Continuity", "Other"];

  // Fuzzy match: find existing gaps whose topic overlaps with what user is typing
  const gapMatches = useMemo(() => {
    if (gapTitle.length < 3) return [];
    const words = gapTitle.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    return contentGaps.filter(g => {
      const t = g.topic.toLowerCase();
      return words.some(w => t.includes(w));
    }).slice(0, 3);
  }, [gapTitle, contentGaps]);

  const resetGapModal = () => {
    setGapModalOpen(false);
    setGapTitle("");
    setGapDesc("");
    setGapCategory("");
    setGapSubmitted(false);
    setGapMatchConfirmed(null);
  };

  const showGapSnackbar = (msg) => {
    setGapSnackbar(msg);
    setTimeout(() => setGapSnackbar(null), 4000);
  };

  const handleSubmitGap = () => {
    if (!gapTitle.trim()) return;
    addContentGap({ topic: gapTitle.trim(), category: gapCategory || "Other" });
    setGapSort("newest");
    resetGapModal();
    showGapSnackbar("Question submitted! It's now at the top of Content Gaps.");
  };

  const handleConfirmMatch = (gapId) => {
    handleVote(gapId, 1);
    resetGapModal();
    showGapSnackbar("Upvote added to an existing question.");
  };

  /* ── Section 4: How This TC Compares ── */
  const ranking = isMediacore ? { percentile: 24, total: 850 } : { percentile: 12, total: 850 };
  const dimensions = isMediacore ? [
    { label: "Response Time", thisTC: "2.2 hr", avg: "4.2 hr", best: "0.3 hr", pct: 68, icon: Timer },
    { label: "Content Coverage", thisTC: "86%", avg: "76%", best: "99%", pct: 72, icon: Shield },
    { label: "Doc Freshness", thisTC: "5 days", avg: "28 days", best: "< 1 day", pct: 84, icon: RefreshCw },
    { label: "AI Answer Accuracy", thisTC: "94%", avg: "81%", best: "99%", pct: 76, icon: Target },
    { label: "Visitor Traffic (90d)", thisTC: "886", avg: "380", best: "8,500", pct: 54, icon: Users },
    { label: "Questions Answered", thisTC: "1,903", avg: "620", best: "12,400", pct: 62, icon: MessageSquare },
  ] : [
    { label: "Response Time", thisTC: "1.8 hr", avg: "4.2 hr", best: "0.3 hr", pct: 78, icon: Timer },
    { label: "Content Coverage", thisTC: "94%", avg: "76%", best: "99%", pct: 85, icon: Shield },
    { label: "Doc Freshness", thisTC: "3 days", avg: "28 days", best: "< 1 day", pct: 91, icon: RefreshCw },
    { label: "AI Answer Accuracy", thisTC: "96%", avg: "81%", best: "99%", pct: 82, icon: Target },
    { label: "Visitor Traffic (90d)", thisTC: "1,240", avg: "380", best: "8,500", pct: 65, icon: Users },
    { label: "Questions Answered", thisTC: "2,847", avg: "620", best: "12,400", pct: 73, icon: MessageSquare },
  ];
  const trendData = isMediacore ? [
    { month: "Oct", score: 52 }, { month: "Nov", score: 56 }, { month: "Dec", score: 61 },
    { month: "Jan", score: 65 }, { month: "Feb", score: 70 }, { month: "Mar", score: 74 },
  ] : [
    { month: "Oct", score: 60 }, { month: "Nov", score: 67 }, { month: "Dec", score: 72 },
    { month: "Jan", score: 76 }, { month: "Feb", score: 78 }, { month: "Mar", score: 82 },
  ];

  /* ── Section 5: Trust Highlights (buyer-facing) ── */
  const achievements = isMediacore ? [
    { title: "Framework Coverage", value: "84%", desc: "CAIQ pre-fill rate", detail: "4 frameworks supported · MPAA/TPN 76% · SIG Lite 81%", icon: "framework" },
    { title: "Audit Streak", value: "2 years", desc: "Consecutive clean SOC 2", detail: "Zero qualified opinions since 2024", icon: "audit" },
    { title: "Active Reviewers", value: "31", desc: "Partners reviewed this quarter", detail: "886 unique visitors · 81% first-contact resolution", icon: "reviewers" },
  ] : [
    { title: "Framework Coverage", value: "92%", desc: "SIG Lite pre-fill rate", detail: "4 frameworks supported · CAIQ 87% · VSA 83%", icon: "framework" },
    { title: "Audit Streak", value: "4 years", desc: "Consecutive clean SOC 2", detail: "Zero qualified opinions since 2022", icon: "audit" },
    { title: "Active Reviewers", value: "47", desc: "Companies reviewed this quarter", detail: "1,240 unique visitors · 89% first-contact resolution", icon: "reviewers" },
  ];

  /* ── Section 7: Analytics ── */
  const analytics = isMediacore ? {
    satisfaction: { score: 3.8, total: 1203, helpful: 64, partial: 22, not: 14 },
    resolution: { firstContact: 81, avgLength: 3.1, escalation: 19, aiTime: "1.6s", adminTime: "2.2hr" },
    topDocs: [
      { name: "SOC 2 Type II (Broadcast Platform)", views: 512 },
      { name: "Media Platform Security Overview", views: 341 },
      { name: "Ad-Tech Subprocessor Register", views: 276 },
      { name: "Penetration Test Summary — OTT APIs", views: 214 },
      { name: "Broadcast Partner DPA", views: 189 },
    ],
    behavior: { avgSession: "3.9 min", pages: 2.7, returnRate: 28, bounceRate: 24 },
  } : {
    satisfaction: { score: 4.2, total: 1847, helpful: 72, partial: 19, not: 9 },
    resolution: { firstContact: 89, avgLength: 2.3, escalation: 11, aiTime: "1.2s", adminTime: "1.8hr" },
    topDocs: [
      { name: "SOC 2 Type II Report (2026)", views: 487 },
      { name: "Security Whitepaper", views: 312 },
      { name: "Sub-processor List", views: 289 },
      { name: "Penetration Test Summary", views: 201 },
      { name: "Data Processing Agreement", views: 178 },
    ],
    behavior: { avgSession: "4.7 min", pages: 3.2, returnRate: 34, bounceRate: 18 },
  };

  return (
    <div className="space-y-6">
      {/* ═══ HEADER ═══ */}
      <div>
        <h1 className="text-[28px] font-bold text-text-primary">{tc?.name || "Arcline"} Trust Scorecard</h1>
        <p className="text-sm text-text-secondary mt-1">{isMediacore ? "Broadcast & streaming trust posture, content quality, and partner benchmarks" : "Data-driven trust posture, content quality, and benchmarks"}</p>
      </div>

      {/* ═══ SECTION 1: TRUST SCORE OVERVIEW ═══ */}
      <SaveableSection title="Trust Score Overview" desc="Overall trust score with coverage, freshness, and depth breakdown">
      <div className="bg-bg-surface rounded-xl border border-border-default">
        <div className="px-5 py-4 border-b border-border-default">
          <h2 className="text-lg font-semibold text-text-primary">Overview</h2>
        </div>
        <div className="p-6 space-y-5">
        <div className="flex items-center gap-2">
          {/* Radial chart */}
          <div className="shrink-0">
            <TrustScoreRadialChart data={radialData} selected={selectedScore} colors={scoreColors} />
          </div>
          {/* Legend + summary */}
          <div className="flex-1 min-w-0">
            {/* Custom legend */}
            <div className="space-y-1 mb-3 pt-1">
              {[...radialData].reverse().map(d => {
                const isActive = selectedScore === d.label;
                const isDimmed = selectedScore && !isActive;
                return (
                  <div key={d.label}
                    onClick={() => setSelectedScore(prev => prev === d.label ? null : d.label)}
                    className={`rounded-lg px-3 py-2.5 cursor-pointer transition-all ${isActive ? "bg-bg-primary/60 border border-border-default/50" : "border border-transparent hover:bg-bg-primary/30"}`}
                    style={{ opacity: isDimmed ? 0.35 : 1, transition: "opacity 0.3s ease" }}>
                    <div className="flex items-center gap-3">
                      <span className="w-3 h-3 rounded-full shrink-0 transition-transform" style={{ background: scoreColors[d.label], transform: isActive ? "scale(1.3)" : "scale(1)" }} />
                      <span className={`text-sm transition-colors ${isActive ? "text-text-primary font-medium" : "text-text-secondary"}`}>{d.label}</span>
                      <Tooltip text={scoreTips[d.label]}><Info className="w-3.5 h-3.5 text-text-muted cursor-help shrink-0" /></Tooltip>
                      <span className="text-sm font-bold text-text-primary ml-auto">{d.value}%</span>
                    </div>
                    <AnimatePresence mode="wait">
                      {isActive ? (
                        <motion.p key="detail" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          className="text-[11px] text-text-secondary leading-relaxed ml-6 mt-1.5 overflow-hidden">{d.detail}</motion.p>
                      ) : !selectedScore ? (
                        <motion.p key="blurb" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          className="text-[10px] text-text-muted ml-6 mt-0.5 overflow-hidden">{d.blurb}</motion.p>
                      ) : null}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {/* Trust Highlights */}
        <div className="border-t border-border-default/50 pt-4">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Trust Highlights</h3>
          <div className="grid grid-cols-3 gap-3">
            {achievements.map(a => (
              <div key={a.title} className="bg-bg-primary/40 rounded-xl px-4 py-4 border border-border-default/50 flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand-500/10 border border-brand-500/20 shrink-0 flex items-center justify-center">
                  {buyerIcons[a.icon]}
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
      </div>
      </div>
      </SaveableSection>

      {/* ═══ SECTION 2: CATEGORY BREAKDOWN ═══ */}
      <SaveableSection
        title={`Category Scores — ${categoryView === "list" ? "List View" : categoryView === "radar" ? "Radar View" : "Framework Coverage"}`}
        desc={categoryView === "list" ? "Security domain scores with controls and Q&A rates" : categoryView === "radar" ? "Radar chart comparing category scores vs network average" : "Framework questionnaire coverage with answerable percentages"}
        type={categoryView === "frameworks" ? "image" : categoryView === "radar" ? "image" : "table"}>
      <div className="bg-bg-surface rounded-xl border border-border-default">
        <div className="px-5 py-4 border-b border-border-default flex items-center gap-3">
          <h2 className="text-lg font-semibold text-text-primary">Category Scores</h2>
          <div className="flex gap-1 bg-bg-primary/60 rounded-lg p-0.5 border border-border-default/50">
            {[{ key: "list", label: "List" }, { key: "radar", label: "Radar" }, { key: "frameworks", label: "Frameworks" }].map(v => (
              <button key={v.key} onClick={() => setCategoryView(v.key)}
                className={`text-[10px] px-2.5 py-1 rounded-md transition-colors ${categoryView === v.key ? "bg-brand-500/15 text-brand-400 font-medium" : "text-text-muted hover:text-text-secondary"}`}>
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* List view */}
        {categoryView === "list" && (
          <>
            {categories.map(cat => (
              <div key={cat.name} className="border-b border-border-default/50 last:border-0">
                <button className="w-full flex items-center gap-4 px-5 py-4 hover:bg-bg-hover transition-colors text-left"
                  onClick={() => setExpandedCategory(expandedCategory === cat.name ? null : cat.name)}>
                  <ChevronDown className={`w-4 h-4 text-text-muted shrink-0 transition-transform ${expandedCategory === cat.name ? "rotate-180" : "-rotate-90"}`} />
                  <span className="text-sm font-medium text-text-primary flex-1">{cat.name}</span>
                  {cat.score < 70 && <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />}
                  <span className={`text-sm font-bold shrink-0 ${cat.score >= 75 ? "text-brand-400" : cat.score >= 50 ? "text-yellow-400" : "text-red-400"}`}>{cat.score} / 100</span>
                  <div className="w-32 shrink-0">
                    <ProgressBar value={cat.score} color={cat.score >= 75 ? "var(--color-brand-500)" : cat.score >= 50 ? "var(--color-status-warning)" : "var(--color-status-error)"} height={5} />
                  </div>
                </button>
                <AnimatePresence>
                  {expandedCategory === cat.name && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="px-5 pb-4 pl-12">
                        <p className="text-xs text-text-muted mb-3">{cat.controls} controls documented · {cat.docs} supporting docs · {cat.qaRate}% Q&A rate</p>
                        <div className="flex flex-wrap gap-1.5">
                          {cat.tags.map(t => (
                            <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center gap-1">
                              <Check className="w-2.5 h-2.5" /> {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </>
        )}

        {/* Radar view */}
        {categoryView === "radar" && (
          <div className="px-5 py-4">
            <ResponsiveContainer width="100%" height={320}>
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={categoryRadarData}>
                <PolarGrid stroke={chartColors.border} />
                <PolarAngleAxis dataKey="category" tick={{ fill: chartColors.textMuted, fontSize: 10.5 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Network Avg" dataKey="networkAvg" stroke={chartColors.textMuted}
                  fill={chartColors.textMuted} fillOpacity={0.08} strokeWidth={1.5} strokeDasharray="4 3" />
                <Radar name={tc?.name || "Arcline"} dataKey="thisTC" stroke={chartColors.brand}
                  fill={chartColors.brand} fillOpacity={0.18} strokeWidth={2}
                  dot={{ r: 3, fill: chartColors.brand }} />
                <RechartsTooltip content={<ChartTooltip formatter={(v) => `${v}/100`} />} />
              </RadarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-2 justify-center">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-brand-500" />
                <span className="text-[10px] text-text-muted">{tc?.name || "Arcline"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full border border-text-muted border-dashed" />
                <span className="text-[10px] text-text-muted">Network Average</span>
              </div>
            </div>
          </div>
        )}

        {/* Frameworks view */}
        {categoryView === "frameworks" && (
          <div className="px-5 py-4">
            <ResponsiveContainer width="100%" height={200}>
              <ComposedChart
                data={frameworks.map(fw => ({ ...fw, ceiling: 100 }))}
                margin={{ top: 10, right: 16, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.border} horizontal vertical={false} />
                <XAxis dataKey="name" tick={{ fill: chartColors.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: chartColors.textMuted, fontSize: 10 }} axisLine={false} tickLine={false}
                  tickFormatter={v => `${v}%`} />
                <RechartsTooltip content={<ChartTooltip formatter={(v, name) => {
                  if (name === "ceiling") return null;
                  return `${v}% answerable`;
                }} />} />
                <Bar dataKey="pct" name="Answerable" fill={chartColors.brand} radius={[6, 6, 0, 0]} barSize={44}
                  background={{ fill: '#1E1E2A', radius: [6, 6, 0, 0] }}
                  label={{ position: 'top', fill: chartColors.textPrimary, fontSize: 12, fontWeight: 600, formatter: v => `${v}%` }} />
                <Line type="monotone" dataKey="ceiling" stroke={chartColors.brandLight} strokeDasharray="6 4"
                  strokeWidth={1} dot={false} activeDot={false} legendType="none" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Coco callout — only on Frameworks view */}
        {categoryView === "frameworks" && (
          <div className="px-5 pb-4 pt-1">
            <div className="flex items-center gap-3 bg-brand-500/5 rounded-lg px-3 py-2.5 border border-brand-600/20">
              <Coco size={24} state="idle" className="shrink-0" />
              <p className="text-xs text-brand-400 flex-1">"I can pre-fill <strong>{isMediacore ? "84%" : "92%"}</strong> of a {isMediacore ? "CAIQ" : "SIG Lite"} from this Trust Center — want me to start?"</p>
              <button onClick={() => navigate("/trust-center/agent", { state: { skipToUpload: true } })}
                className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg border border-brand-500/40 text-brand-400 text-[11px] font-medium hover:bg-brand-500/10 transition-colors">
                Start with Coco <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>
      </SaveableSection>

      {/* ═══ SECTION 3: CONTENT GAPS ═══ */}
      <div className="bg-bg-surface rounded-xl border border-border-default">
        <div className="px-5 py-4 border-b border-border-default flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Content Gaps</h2>
            <p className="text-xs text-text-muted mt-0.5">{contentGaps.filter(g => g.status === "open").length} open gaps · {isMediacore ? "34" : "47"} resolved</p>
          </div>
          <button onClick={() => setGapModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500 text-bg-primary text-xs font-medium hover:bg-brand-400 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Submit a question
          </button>
        </div>
        <div className="px-5 pt-3 flex items-center justify-between gap-3">
          <p className="text-xs text-text-muted">Topics visitors have asked about that don't yet have complete answers. Vote to help prioritize.</p>
          <div className="flex gap-1.5 shrink-0">
            {[{ key: "votes", label: "Most Voted" }, { key: "newest", label: "Newest" }, { key: "status", label: "Status" }].map(s => (
              <button key={s.key} onClick={() => setGapSort(s.key)}
                className={`text-[10px] px-2.5 py-1 rounded-full border transition-colors ${gapSort === s.key ? "bg-brand-500/15 border-brand-500/30 text-brand-400" : "border-border-default text-text-muted hover:text-text-secondary"}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <div className="divide-y divide-border-default/50">
          {sortedGaps.map(gap => {
            const st = gapStatusConfig[gap.status];
            const userVote = gapVotes[gap.id] || 0;
            const netVotes = gap.votes + userVote;
            return (
              <div key={gap.id} className="flex items-start gap-3 px-5 py-3.5">
                {/* Vote buttons */}
                <div className="flex flex-col items-center gap-0.5 pt-0.5">
                  <button onClick={() => handleVote(gap.id, 1)} className={`p-0.5 rounded transition-colors ${userVote === 1 ? "text-brand-400" : "text-text-muted hover:text-text-secondary"}`}>
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-text-primary">{netVotes}</span>
                  <button onClick={() => handleVote(gap.id, -1)} className={`p-0.5 rounded transition-colors ${userVote === -1 ? "text-red-400" : "text-text-muted hover:text-text-secondary"}`}>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">{gap.topic}</p>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
                    <span className="text-[10px] text-text-muted">{gap.category}</span>
                    <span className="text-[10px] text-text-muted">·</span>
                    <span className="text-[10px] text-text-muted">First asked: {gap.firstAsked}</span>
                    <span className="text-[10px] text-text-muted">·</span>
                    <span className="text-[10px] text-text-muted">Asked {gap.asked}×</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${st.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} /> {st.label}
                    </span>
                    {gap.eta && <span className="text-[10px] text-text-muted">· ETA: {gap.eta}</span>}
                    {gap.watchers > 0 && <span className="text-[10px] text-text-muted">· {gap.watchers} watching</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {/* Gap analytics */}
        <div className="px-5 py-3 border-t border-border-default flex flex-wrap items-center gap-x-6 gap-y-1">
          <span className="text-xs text-text-secondary">Gap Resolution Rate: <strong className="text-text-primary">{isMediacore ? "72.3%" : "79.7%"}</strong> ({isMediacore ? "34 of 47" : "47 of 59"} total)</span>
          <span className="text-xs text-text-secondary">Avg. Time to Resolve: <strong className="text-text-primary">{isMediacore ? "8.4 days" : "6.2 days"}</strong></span>
        </div>
        <div className="px-5 pb-4">
          <div className="bg-brand-500/5 rounded-lg px-3 py-2 border border-brand-600/20 flex items-center gap-2">
            <AiSparkle size={16} animate color="brand" />
            <p className="text-xs text-text-secondary">Don't see your question? <button onClick={() => navigate("/trust-center/agent")} className="text-brand-400 font-medium hover:underline">Ask Coco →</button> and if it can't answer, it'll automatically create a gap request.</p>
          </div>
        </div>
      </div>

      {/* ── Gap Snackbar ── */}
      {createPortal(
        <AnimatePresence>
          {gapSnackbar && (
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2 px-4 py-3 rounded-xl bg-bg-surface border border-brand-500/30 shadow-2xl">
              <Check className="w-4 h-4 text-brand-400 shrink-0" />
              <span className="text-sm text-text-primary font-medium">{gapSnackbar}</span>
              <button onClick={() => setGapSnackbar(null)} className="ml-2 p-0.5 text-text-muted hover:text-text-primary transition-colors"><X className="w-3.5 h-3.5" /></button>
            </motion.div>
          )}
        </AnimatePresence>,
      document.body)}

      {/* ── Submit a Question Modal ── */}
      {createPortal(
      <AnimatePresence>
        {gapModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) resetGapModal(); }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-bg-surface border border-border-default rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">

              {/* Header */}
              <div className="px-6 py-4 border-b border-border-default flex items-center justify-between">
                <h3 className="text-base font-semibold text-text-primary">Submit a Question</h3>
                <button onClick={resetGapModal} className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {!gapSubmitted && !gapMatchConfirmed ? (
                <div className="px-6 py-5 space-y-4">
                  {/* Title */}
                  <div>
                    <label className="text-xs font-medium text-text-secondary mb-1.5 block">Question title</label>
                    <input value={gapTitle} onChange={e => setGapTitle(e.target.value)}
                      placeholder="e.g. What are your data retention policies?"
                      className="w-full bg-bg-primary border border-border-default rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-500/50" />
                  </div>

                  {/* Coco similar question detection */}
                  {gapMatches.length > 0 && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                      className="bg-brand-500/5 rounded-lg border border-brand-600/20 p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <Coco size={20} state="idle" className="shrink-0" />
                        <p className="text-[11px] text-brand-400 font-medium">Coco found similar questions already asked:</p>
                      </div>
                      {gapMatches.map(m => (
                        <button key={m.id} onClick={() => handleConfirmMatch(m.id)}
                          className="w-full flex items-center gap-3 p-2.5 rounded-lg bg-bg-primary/60 border border-border-default/50 text-left hover:border-brand-500/40 transition-colors group">
                          <div className="flex flex-col items-center gap-0.5 shrink-0">
                            <ChevronUp className="w-3.5 h-3.5 text-text-muted group-hover:text-brand-400 transition-colors" />
                            <span className="text-[10px] font-bold text-text-primary">{m.votes}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-text-primary truncate">{m.topic}</p>
                            <p className="text-[10px] text-text-muted">{m.category} · Asked {m.asked}×</p>
                          </div>
                          <span className="text-[10px] text-brand-400 font-medium shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">Upvote this →</span>
                        </button>
                      ))}
                      <p className="text-[10px] text-text-muted">Click to upvote an existing question, or continue below to submit a new one.</p>
                    </motion.div>
                  )}

                  {/* Description */}
                  <div>
                    <label className="text-xs font-medium text-text-secondary mb-1.5 block">Details <span className="text-text-muted font-normal">(optional)</span></label>
                    <textarea value={gapDesc} onChange={e => setGapDesc(e.target.value)} rows={3}
                      placeholder="Provide more context about what you're looking for..."
                      className="w-full bg-bg-primary border border-border-default rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-500/50 resize-none" />
                  </div>

                  {/* Category dropdown */}
                  <div>
                    <label className="text-xs font-medium text-text-secondary mb-1.5 block">Category</label>
                    <select value={gapCategory} onChange={e => setGapCategory(e.target.value)}
                      className="w-full bg-bg-primary border border-border-default rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand-500/50 appearance-none cursor-pointer">
                      <option value="">Select a category...</option>
                      {GAP_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-1">
                    <button type="button" onClick={() => handleSubmitGap()} disabled={!gapTitle.trim()}
                      className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-brand-500 text-bg-primary text-sm font-medium hover:bg-brand-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                      <Send className="w-3.5 h-3.5" /> Submit question
                    </button>
                    <button onClick={resetGapModal}
                      className="px-4 py-2.5 rounded-lg border border-border-default text-sm text-text-secondary hover:text-text-primary transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : gapMatchConfirmed ? (
                /* Confirmed upvote on existing question */
                <div className="px-6 py-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-brand-500/15 flex items-center justify-center mx-auto">
                    <ChevronUp className="w-6 h-6 text-brand-400" />
                  </div>
                  <h4 className="text-base font-semibold text-text-primary">Upvote added!</h4>
                  <p className="text-xs text-text-muted max-w-xs mx-auto">
                    Your vote has been added to the existing question. You'll be notified when the vendor responds.
                  </p>
                  <button onClick={resetGapModal}
                    className="mt-2 px-5 py-2 rounded-lg bg-brand-500 text-bg-primary text-sm font-medium hover:bg-brand-400 transition-colors">
                    Done
                  </button>
                </div>
              ) : (
                /* Successfully submitted new question */
                <div className="px-6 py-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-brand-500/15 flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6 text-brand-400" />
                  </div>
                  <h4 className="text-base font-semibold text-text-primary">Question submitted!</h4>
                  <p className="text-xs text-text-muted max-w-xs mx-auto">
                    Your question has been added to the Content Gaps list. You'll be notified when the vendor publishes an answer.
                  </p>
                  <button onClick={resetGapModal}
                    className="mt-2 px-5 py-2 rounded-lg bg-brand-500 text-bg-primary text-sm font-medium hover:bg-brand-400 transition-colors">
                    Done
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body)}

      {/* ═══ SECTION 4: HOW THIS TC COMPARES ═══ */}
      <SaveableSection title="Trust Center Benchmarks" desc="Ranking, dimension comparison, and score trend vs network" type="table">
      <div className="bg-bg-surface rounded-xl border border-border-default">
        {/* 1. Header */}
        <div className="px-5 py-4 border-b border-border-default">
          <h2 className="text-lg font-semibold text-text-primary">How {tc?.name || "Arcline"} Compares</h2>
          <p className="text-xs text-text-muted mt-0.5">Benchmarked against {ranking.total}+ Conveyor Trust Centers</p>
        </div>

        {/* 2. Compare with another vendor */}
        <div className="px-5 py-4 border-b border-border-default">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-text-primary font-medium bg-bg-primary/60 px-3 py-2 rounded-lg border border-border-default/50">
              <Building2 className="w-4 h-4 text-brand-500" /> {tc?.name || "Arcline"}
            </div>
            <span className="text-xs text-text-muted font-medium">vs</span>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
              <input value={compareSearch} onChange={e => setCompareSearch(e.target.value)}
                placeholder="Search for a company to compare..."
                className="w-full bg-bg-primary/60 border border-border-default/50 rounded-lg pl-8 pr-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-500/50" />
            </div>
            <button className="px-4 py-2 text-xs font-medium rounded-lg border border-brand-500/40 text-brand-400 hover:bg-brand-500/10 transition-colors flex items-center gap-1.5">
              Compare in Coco <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex gap-3 mt-2">
            <span className="text-[10px] text-text-muted">Recent:</span>
            {(isMediacore ? ["StreamGuard", "PlaybackHQ"] : ["Globex Inc.", "Initech"]).map(c => (
              <button key={c} className="text-[10px] text-brand-400 hover:underline">{tc?.name || "Arcline"} vs. {c}</button>
            ))}
          </div>
        </div>

        {/* 3. Overall Ranking + Score Trend (combined) */}
        <div className="px-5 py-5">
          <div className="bg-bg-primary/40 rounded-xl border border-border-default/50 overflow-hidden">
            <div className="flex items-stretch">
              {/* Left: Ranking stat */}
              <div className="w-[220px] shrink-0 p-5 flex flex-col justify-center border-r border-border-default/30">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-5 h-5 text-brand-500" />
                  <span className="text-3xl font-bold text-brand-400">Top {ranking.percentile}%</span>
                </div>
                <p className="text-[11px] text-text-secondary leading-relaxed mb-3">of {ranking.total}+ Conveyor Trust Centers across all dimensions</p>
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-brand-400" />
                  <span className="text-[11px] text-brand-400 font-medium">{isMediacore ? "+16 pts since Oct" : "+22 pts since Oct"}</span>
                </div>
              </div>
              {/* Right: Trend chart */}
              <div className="flex-1 p-4">
                <p className="text-[10px] text-text-muted mb-2">Score Trend — Last 6 Months</p>
                <ResponsiveContainer width="100%" height={140}>
                  <AreaChart data={trendData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="scoreTrendGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={chartColors.brand} stopOpacity={0.35} />
                        <stop offset="95%" stopColor={chartColors.brand} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.border} vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: chartColors.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[40, 100]} tick={{ fill: chartColors.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <RechartsTooltip content={<ChartTooltip formatter={(v) => `${v}/100`} />} />
                    <Area type="monotone" dataKey="score" stroke={chartColors.brand} strokeWidth={2.5}
                      fill="url(#scoreTrendGradient)"
                      dot={{ r: 3, fill: chartColors.brand, stroke: chartColors.surface, strokeWidth: 2 }}
                      activeDot={{ r: 5, fill: chartColors.brandLight, stroke: chartColors.brand, strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Dimension comparison table */}
        <div className="px-5 pb-4">
          <div className="rounded-xl border border-border-default/50 overflow-hidden">
            <div className="grid grid-cols-[1fr_80px_80px_80px_100px] gap-2 px-4 py-2.5 bg-bg-primary/40 text-[10px] font-medium text-text-muted">
              <span></span><span className="text-center">This TC</span><span className="text-center">Avg</span><span className="text-center">Best</span><span className="text-center">Percentile</span>
            </div>
            {dimensions.map(d => {
              const Icon = d.icon;
              return (
                <div key={d.label} className="grid grid-cols-[1fr_80px_80px_80px_100px] gap-2 items-center px-4 py-2.5 border-t border-border-default/30">
                  <div className="flex items-center gap-2"><Icon className="w-3.5 h-3.5 text-text-muted" /><span className="text-xs text-text-secondary">{d.label}</span></div>
                  <span className="text-xs font-semibold text-text-primary text-center">{d.thisTC}</span>
                  <span className="text-[11px] text-text-muted text-center">{d.avg}</span>
                  <span className="text-[11px] text-text-muted text-center">{d.best}</span>
                  <div className="flex items-center gap-1.5">
                    <div className="flex-1"><ProgressBar value={d.pct} height={4} /></div>
                    <span className="text-[10px] text-text-muted w-8">{d.pct}th</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
      </SaveableSection>

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
            <div className="w-20 h-20 rounded-2xl bg-bg-elevated border border-border-default flex items-center justify-center">
              <svg width="52" height="52" viewBox="0 0 7 7" style={{ imageRendering: 'pixelated' }} xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="0" width="1" height="1" fill="#A0A0B0"/>
                <rect x="1" y="1" width="5" height="1" fill="#9090A0"/>
                <rect x="1" y="2" width="5" height="1" fill="#808090"/>
                <rect x="2" y="2" width="1" height="1" fill="#FFF"/>
                <rect x="4" y="2" width="1" height="1" fill="#FFF"/>
                <rect x="1" y="3" width="5" height="1" fill="#808090"/>
                <rect x="1" y="4" width="5" height="1" fill="#707080"/>
                <rect x="2" y="4" width="3" height="1" fill="#FFF"/>
                <rect x="0" y="3" width="1" height="1" fill="#9090A0"/>
                <rect x="6" y="3" width="1" height="1" fill="#9090A0"/>
                <rect x="1" y="5" width="1" height="1" fill="#606070"/>
                <rect x="5" y="5" width="1" height="1" fill="#606070"/>
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-text-primary">Ivana Tso</h3>
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

// Arcline logo SVG (Arc Swoosh — Cyan)
function ArclineLogo({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="8" fill="#122E32"/>
      <path d="M8 26C8 26 12 10 20 10C28 10 32 26 32 26" stroke="url(#arcGrad)" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
      <circle cx="20" cy="22" r="3" fill="#80E0E8"/>
      <line x1="8" y1="30" x2="32" y2="30" stroke="#22B8CF" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
      <defs><linearGradient id="arcGrad" x1="8" y1="18" x2="32" y2="18" gradientUnits="userSpaceOnUse">
        <stop stopColor="#22B8CF"/><stop offset="0.5" stopColor="#80E0E8"/><stop offset="1" stopColor="#22B8CF"/>
      </linearGradient></defs>
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
    id: "arcline",
    name: "Arcline",
    subtitle: "Workflow Automation",
    logo: "arcline",
    accent: "oklch(0.65 0.12 200)", // fixed cyan - does not change with theme
    stats: { docs: 42, faqs: 128, certs: 8, sidebarDocs: "42 docs" },
    theme: {
      brandHue: 200,
      brandChroma: [0.03, 0.05, 0.08, 0.10, 0.12, 0.12, 0.10, 0.08, 0.06, 0.04, 0.03],
      accentHue: 60,
      accentChroma: [0.04, 0.08, 0.12, 0.16, 0.18, 0.16, 0.14, 0.12, 0.10, 0.07],
    },
    mcpDomain: "trust.conveyor.com/arcline",
    greeting: "Hey there! Welcome to Arcline's Trust Center. I'm Coco - your cowork agent for security reviews.",
    tcTitle: "Arcline Trust Center",
    tcSubtitle: "Transparent security for our customers and partners",
    contactEmail: "trust@arcline.com",
    trustHeroBody: "Use this hub as the source of truth for workflow automation security: policies, SOC and ISO evidence, data maps, and subprocessors in one place. We publish changes on a rolling cadence so procurement, IT, and InfoSec always see the same version—no more scattered PDFs or stale attachments.",
    activityCardTitle: "Trust Center activity",
    activityMetricLabel: "Artifacts updated since your last visit",
    activityNewDocs: 5,
    activityMonths: ["Nov", "Dec", "Jan", "Feb"],
    lastActiveLabel: "Updated 12 minutes ago",
    docEngagement: { downloads: 1847, unique: 412 },
    trustedByBlurb: "serves global enterprises that run core operations on automation and integrations. Teams here use our materials for enterprise RFPs, vendor risk cycles, and annual control attestations without waiting on manual packet assembly.",
  },
  {
    id: "mediacore",
    name: "MediaCore",
    subtitle: "Digital media experts",
    logo: "mediacore",
    accent: "oklch(0.55 0.27 288)", // fixed purple - does not change with theme
    stats: { docs: 34, faqs: 86, certs: 8, sidebarDocs: "34 docs" },
    theme: {
      brandHue: 288, brandChroma: [0.03, 0.06, 0.12, 0.18, 0.24, 0.27, 0.22, 0.18, 0.13, 0.09, 0.06],
      accentHue: 340, accentChroma: [0.03, 0.06, 0.10, 0.14, 0.16, 0.14, 0.12, 0.10, 0.08, 0.06],
    },
    mcpDomain: "trust.mediacore.io/mediacore",
    greeting: "Hey there! Welcome to MediaCore's Trust Center. I'm Coco - your cowork agent for security reviews.",
    tcTitle: "MediaCore Trust Center",
    tcSubtitle: "Secure digital media infrastructure for our partners",
    contactEmail: "trust@mediacore.io",
    trustHeroBody: "Streamers, rights holders, and ad partners use this space for playback security: audit letters, regional data flows, DRM posture, and who touches what in the delivery path. When we add an edge POP, a measurement vendor, or a new SSAI control, the evidence lands here first.",
    activityCardTitle: "Publishing & audit cadence",
    activityMetricLabel: "New or revised documents this week",
    activityNewDocs: 4,
    activityMonths: ["W1", "W2", "W3", "W4"],
    lastActiveLabel: "Live catalog sync: 6 min ago",
    docEngagement: { downloads: 1203, unique: 287 },
    trustedByBlurb: "is embedded in viewer-facing apps and B2B distribution deals worldwide. The logos below represent the types of programs that run on our stack; they depend on these disclosures for privacy DPIAs, broadcast compliance, and joint security assessments.",
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
  // Use the hue to decide lightness curve
  const useDefaultLightness = t.brandHue <= 200;
  const bL = useDefaultLightness ? lightness : lightnessBrand;

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

  // Light mode overrides — shift brand-400/500/600 darker so they're readable on white
  const isLight = root.classList.contains("light-mode");
  if (isLight) {
    const lightShift = useDefaultLightness
      ? { 4: 0.52, 5: 0.45, 6: 0.38 }  // Arcline teal — darken significantly
      : { 4: 0.45, 5: 0.38, 6: 0.32 };  // MediaCore purple — darken significantly
    Object.entries(lightShift).forEach(([idx, l]) => {
      const i = parseInt(idx);
      root.style.setProperty(`--color-brand-${steps[i]}`, `oklch(${l} ${t.brandChroma[i]} ${t.brandHue})`);
    });
  }
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
        style={{ background: current.id === "mediacore" ? "#333366" : current.id === "arcline" ? "#122E32" : undefined }}
      >
        {current.logo === "arcline"
          ? <ArclineLogo size={28} />
          : current.logo === "mediacore"
          ? <MediacoreLogo size={28} />
          : <div style={{ color: current.accent }}><ConveyorLogo size={22} color="currentColor" /></div>
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
                    style={{ background: tc.logo === "mediacore" ? "#333366" : tc.logo === "arcline" ? "#122E32" : undefined, border: tc.id === activeTc ? `2px solid ${tc.accent}` : "2px solid transparent" }}>
                    {tc.logo === "arcline"
                      ? <ArclineLogo size={24} />
                      : tc.logo === "mediacore"
                      ? <MediacoreLogo size={24} />
                      : <div style={{ color: tc.accent }}><ConveyorLogo size={18} color="currentColor" /></div>
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

const ROUTE_MAP = { "trust-center": "/trust-center", "agent": "/trust-center/agent", "scorecard": "/trust-center/scorecard" };
const VIEW_FROM_PATH = { "/trust-center": "trust-center", "/trust-center/agent": "agent", "/trust-center/scorecard": "scorecard" };

function Sidebar({ onOpenProfile, activeTc, onSwitchTc }) {
  const navigate = useNavigate();
  const location = useLocation();
  const activeView = VIEW_FROM_PATH[location.pathname] || "trust-center";

  const navItems = [
    { id: "trust-center", icon: Home, label: "Trust Center", useCoco: false },
    { id: "agent", icon: Bot, label: "Agent", useCoco: true },
    { id: "scorecard", icon: Building2, label: "Trust Scorecard", useCoco: false },
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
      <button onClick={onOpenProfile} aria-label="Open profile"
        className="w-10 h-10 rounded-full border border-border-default hover:border-text-muted/40 flex items-center justify-center transition-colors bg-bg-surface"
        title="Ivana Tso">
        <svg width="17" height="14" viewBox="0 0 12 10" style={{ imageRendering: 'pixelated' }} xmlns="http://www.w3.org/2000/svg">
          {/* I */}
          <rect x="0" y="0" width="5" height="1" fill="#A0A0B0"/>
          <rect x="2" y="1" width="1" height="1" fill="#9090A0"/>
          <rect x="2" y="2" width="1" height="1" fill="#9090A0"/>
          <rect x="2" y="3" width="1" height="1" fill="#808090"/>
          <rect x="2" y="4" width="1" height="1" fill="#808090"/>
          <rect x="2" y="5" width="1" height="1" fill="#707080"/>
          <rect x="2" y="6" width="1" height="1" fill="#707080"/>
          <rect x="2" y="7" width="1" height="1" fill="#606070"/>
          <rect x="0" y="8" width="5" height="1" fill="#606070"/>
          {/* T */}
          <rect x="7" y="0" width="5" height="1" fill="#A0A0B0"/>
          <rect x="9" y="1" width="1" height="1" fill="#9090A0"/>
          <rect x="9" y="2" width="1" height="1" fill="#9090A0"/>
          <rect x="9" y="3" width="1" height="1" fill="#808090"/>
          <rect x="9" y="4" width="1" height="1" fill="#808090"/>
          <rect x="9" y="5" width="1" height="1" fill="#707080"/>
          <rect x="9" y="6" width="1" height="1" fill="#707080"/>
          <rect x="9" y="7" width="1" height="1" fill="#606070"/>
          <rect x="9" y="8" width="1" height="1" fill="#606070"/>
        </svg>
      </button>
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
  const isAgent = location.pathname === "/trust-center/agent";
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
            <button onClick={() => { navigate("/trust-center/agent"); dismissCocoNotification(); }}
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
   WELCOME PAGE - character selection
   ═══════════════════════════════════════════════════════════════ */

function WelcomePage({ onComplete }) {
  const [selectedId, setSelectedId] = useState("sort");
  const [transitioning, setTransitioning] = useState(false);

  const characters = Object.entries(COCO_CHARACTERS);

  function handleContinue() {
    if (!selectedId) return;
    setTransitioning(true);
    setTimeout(() => onComplete(selectedId), 800);
  }

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-bg-primary relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 600px 400px at 30% 20%, var(--brand-glow-lg), transparent), radial-gradient(ellipse 500px 500px at 70% 80%, rgba(51,198,159,0.03), transparent)"
        }} />

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={transitioning ? { opacity: 0, scale: 0.96 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[680px] px-8"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-bg-elevated border border-border-default text-[11px] font-medium text-text-secondary mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500" style={{ animation: "cocoPulse 2s ease-in-out infinite" }} />
            Access granted
          </div>
          <h1 className="text-[28px] font-bold text-text-primary mb-2 tracking-tight">
            Welcome, <span className="text-brand-400">Ivana</span>
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed max-w-[440px] mx-auto">
            Pick a Coco companion to guide you through your security review. Your character will appear throughout the Trust Center.
          </p>
        </div>

        {/* Section label */}
        <p className="text-[11px] font-semibold uppercase tracking-widest text-text-muted text-center mb-4">Choose your Coco</p>

        {/* Character grid */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {characters.map(([id, char]) => (
            <button
              key={id}
              onClick={() => setSelectedId(id)}
              className={`relative rounded-2xl border-2 p-5 pt-6 text-center transition-all duration-200 cursor-pointer outline-none
                ${selectedId === id
                  ? "border-brand-400 bg-brand-500/5 shadow-[0_0_0_1px_var(--color-brand-400),0_8px_24px_rgba(34,184,207,0.1)]"
                  : "border-border-default bg-bg-surface hover:border-border-bright hover:bg-bg-hover hover:-translate-y-0.5"
                }`}
            >
              {/* Check indicator */}
              <div className={`absolute top-2 right-2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200
                ${selectedId === id ? "border-brand-400 bg-brand-400" : "border-border-default bg-bg-surface"}`}>
                <svg viewBox="0 0 10 10" fill="none" className="w-2.5 h-2.5" style={{ opacity: selectedId === id ? 1 : 0 }}>
                  <path d="M2 5L4.5 7.5L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              {/* Coco SVG */}
              <div className="w-[72px] h-[72px] mx-auto mb-3 flex items-center justify-center">
                {char.renderSvg(72)}
              </div>

              <div className="text-[13px] font-semibold text-text-primary">{char.name}</div>
              <div className="text-[11px] text-text-muted font-medium">{char.role}</div>

              {/* Default badge */}
              {char.isDefault && (
                <div className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide text-brand-400 bg-brand-500/10 border border-brand-500/20">
                  Default
                </div>
              )}

              {/* Top accent line when selected */}
              {selectedId === id && (
                <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
                  style={{ background: "linear-gradient(90deg, transparent, var(--color-brand-400), transparent)" }} />
              )}
            </button>
          ))}
        </div>

        {/* Continue button */}
        <div className="text-center">
          <button
            onClick={handleContinue}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold transition-all duration-200 bg-brand-400 text-bg-primary hover:bg-brand-500 hover:-translate-y-0.5 shadow-[0_4px_16px_rgba(34,184,207,0.25)]"
          >
            Enter Trust Center
            <span className="transition-transform duration-200">{"\u2192"}</span>
          </button>

          <p className="text-[11px] text-text-muted mt-6">
            You can change your Coco anytime from your profile settings.
          </p>
        </div>
      </motion.div>

      {/* Transition overlay */}
      <AnimatePresence>
        {transitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-bg-primary"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
              className="w-24 h-24 flex items-center justify-center"
            >
              {COCO_CHARACTERS[selectedId || "sort"].renderSvg(96)}
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-4 text-sm font-medium text-text-secondary"
            >
              Loading your Trust Center...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   APP SHELL - layout with routing
   ═══════════════════════════════════════════════════════════════ */

function AppShell() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeTc, setActiveTc] = useState("arcline");
  const navigate = useNavigate();
  const location = useLocation();
  const isAgent = location.pathname === "/trust-center/agent";

  const currentTc = TRUST_CENTERS.find(tc => tc.id === activeTc) || TRUST_CENTERS[0];

  // Apply theme CSS variables when trust center or dark/light mode changes
  const { dark: isDark } = useTheme();
  useEffect(() => {
    applyTcTheme(currentTc);
    document.title = `${currentTc.name} Trust Center — Powered by Conveyor`;
    // Dynamic favicon
    const link = document.querySelector("link[rel='icon']") || document.createElement("link");
    link.rel = "icon";
    link.type = "image/svg+xml";
    if (currentTc.logo === "arcline") {
      link.href = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="8" fill="%23122E32"/><path d="M8 26C8 26 12 10 20 10C28 10 32 26 32 26" stroke="%2322B8CF" stroke-width="3.5" stroke-linecap="round" fill="none"/><circle cx="20" cy="22" r="3" fill="%2380E0E8"/><line x1="8" y1="30" x2="32" y2="30" stroke="%2322B8CF" stroke-width="2" stroke-linecap="round" opacity="0.4"/></svg>')}`;
    } else if (currentTc.logo === "mediacore") {
      link.href = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="8" fill="%23333366"/><path d="M27.38 11.36L20.24 16.61c-.17.12-.41.12-.58-.01l-7-5.24c-.8-.59-1.94-.02-1.94.98v13.9a2.65 2.65 0 0 0 2.65 2.65h13.31a2.65 2.65 0 0 0 2.64-2.65V12.34c0-.72-.59-1.22-1.22-1.22-.25 0-.5.07-.72.24Z" fill="%236C63FF"/><rect x="23.94" y="16.08" width="2.75" height="10.49" rx="1.38" fill="white" opacity=".8"/><circle cx="25.31" cy="17.45" r="1.38" fill="white"/><rect x="19.61" y="19.37" width="2.75" height="7.2" rx="1.38" fill="white" opacity=".8"/><circle cx="20.99" cy="20.75" r="1.38" fill="white"/><rect x="15.28" y="22.39" width="2.75" height="4.18" rx="1.38" fill="white" opacity=".8"/><circle cx="16.66" cy="23.76" r="1.38" fill="white"/></svg>')}`;
    } else {
      link.href = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16" rx="3" fill="%23666"/><text x="8" y="11.5" text-anchor="middle" fill="white" font-size="10" font-family="system-ui">' + (currentTc.name?.[0] || 'T') + '</text></svg>')}`;
    }
    document.head.appendChild(link);
  }, [currentTc, isDark]);

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
                <motion.div key={location.pathname + activeTc} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
                  <Routes location={location}>
                    <Route path="/" element={<TrustCenterHome key={activeTc} />} />
                    <Route path="/scorecard" element={<ScorecardDashboard />} />
                    <Route path="*" element={<Navigate to="/trust-center" replace />} />
                  </Routes>
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </main>

        {/* Persistent right-side cart panel */}
        <CartPanel onNavigateToAgent={(state) => navigate("/trust-center/agent", state ? { state } : undefined)} />
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
  const [cocoCharacter, setCocoCharacter] = useState(null);

  useEffect(() => {
    document.documentElement.classList.toggle("light-mode", !dark);
  }, [dark]);

  // Apply default TC theme on mount so welcome page gets correct brand colors (teal for Arcline)
  useEffect(() => {
    applyTcTheme(TRUST_CENTERS[0]);
  }, []);

  function handleWelcomeComplete(characterId) {
    setCocoCharacter(characterId);
  }

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
    <CocoCharacterContext.Provider value={cocoCharacter || "sort"}>
    <CartProvider>
    <BrowserRouter>
      <Routes>
        {/* Welcome page is the root route */}
        <Route path="/" element={
          cocoCharacter ? (
            <Navigate to="/trust-center" replace />
          ) : (
            <div className={`h-screen flex text-text-primary overflow-hidden ${dark ? "bg-bg-primary" : "light-mode bg-white"}`}>
              <WelcomePage onComplete={handleWelcomeComplete} />
            </div>
          )
        } />

        {/* Trust Center and all sub-routes */}
        <Route path="/trust-center/*" element={
          cocoCharacter ? (
            <div className={`h-screen flex text-text-primary overflow-hidden ${dark ? "bg-bg-primary" : "light-mode bg-white"}`}>
              <AppShell />
            </div>
          ) : (
            <Navigate to="/" replace />
          )
        } />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </CartProvider>
    </CocoCharacterContext.Provider>
    </ThemeContext.Provider>
  );
}
