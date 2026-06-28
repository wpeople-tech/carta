"use client";

import React, { useState, useEffect } from "react";
import { motion, Transition } from "motion/react";
import TextType from "@/components/TextType";

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg: "#F5F4F0",
  surface: "#EDECEA",
  surface2: "#E4E2DE",
  border: "#D0CEC9",
  border2: "#B8B5AF",
  ink: "#0F0F0D",
  inkMuted: "#6B6860",
  inkFaint: "#9C9990",
  signal: "#FF6B00",
  signalDim: "rgba(255,107,0,0.094)",
  green: "#1A7A4A",
  greenDim: "rgba(26,122,74,0.094)",
  red: "#C0392B",
  redDim: "rgba(192,57,43,0.094)",
};

const MONO = "'JetBrains Mono', monospace";
const SANS = "'Space Grotesk', sans-serif";
const BODY = "'Inter', sans-serif";

// ─── Animation variants ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const slideFromRight = {
  hidden: { opacity: 0, x: 48 },
  visible: { opacity: 1, x: 0 },
};

const slideFromLeft = {
  hidden: { opacity: 0, x: -32 },
  visible: { opacity: 1, x: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const staggerFast = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0 } },
};

const easeOut: Transition<any> = { ease: [0.22, 0.97, 0.36, 1], duration: 0.55 };
const easeOutFast: Transition<any> = { ease: [0.22, 0.97, 0.36, 1], duration: 0.4 };

const viewportOnce = { once: true, margin: "-60px" };

// ─── Sub-components ───────────────────────────────────────────────────────────

function TopoBg() {
  return (
    <div
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, opacity: 0.028 }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        style={{ width: "100%", height: "100%" }}
        fill="none"
        stroke="#0F0F0D"
        strokeWidth="0.8"
      >
        <g>
          <path d="M-100,180 C120,140 280,200 460,170 C640,140 780,90 960,120 C1140,150 1280,100 1540,130" />
          <path d="M-100,220 C100,185 260,245 440,215 C620,185 770,128 950,162 C1130,196 1270,142 1540,175" />
          <path d="M-100,260 C80,228 240,292 420,260 C600,228 755,168 935,204 C1115,240 1255,184 1540,220" />
          <path d="M-100,300 C60,272 218,338 398,305 C578,272 738,208 918,246 C1098,284 1238,226 1540,265" />
          <path d="M-100,340 C50,316 198,384 378,350 C558,316 720,248 900,288 C1080,328 1218,268 1540,310" />
          <path d="M-100,420 C150,380 340,460 520,425 C700,390 860,310 1040,355 C1220,400 1360,335 1540,375" />
          <path d="M-100,465 C130,428 320,508 500,472 C680,436 845,353 1025,400 C1205,447 1345,380 1540,422" />
          <path d="M-100,510 C110,476 296,556 476,519 C656,482 825,396 1005,445 C1185,494 1325,425 1540,469" />
          <path d="M-100,555 C90,524 272,604 452,566 C632,528 805,439 985,490 C1165,541 1305,470 1540,516" />
          <path d="M-100,640 C200,595 420,680 600,640 C780,600 940,510 1120,560 C1300,610 1420,545 1540,580" />
          <path d="M-100,685 C180,642 398,728 578,687 C758,646 920,553 1100,605 C1280,657 1400,590 1540,627" />
          <path d="M-100,60 C200,30 380,90 560,55 C740,20 900,-30 1080,20 C1260,70 1380,10 1540,40" />
          <path d="M-100,100 C180,72 358,134 538,98 C718,62 880,5 1060,57 C1240,109 1358,47 1540,80" />
          <ellipse cx="240" cy="380" rx="180" ry="90" opacity="0.6" />
          <ellipse cx="240" cy="380" rx="130" ry="62" opacity="0.7" />
          <ellipse cx="240" cy="380" rx="80" ry="36" opacity="0.8" />
          <ellipse cx="240" cy="380" rx="40" ry="18" opacity="0.9" />
          <ellipse cx="780" cy="250" rx="200" ry="100" opacity="0.5" />
          <ellipse cx="780" cy="250" rx="140" ry="68" opacity="0.6" />
          <ellipse cx="780" cy="250" rx="85" ry="40" opacity="0.7" />
          <ellipse cx="780" cy="250" rx="42" ry="20" opacity="0.9" />
          <ellipse cx="1280" cy="500" rx="160" ry="80" opacity="0.5" />
          <ellipse cx="1280" cy="500" rx="110" ry="54" opacity="0.6" />
          <ellipse cx="1280" cy="500" rx="65" ry="32" opacity="0.8" />
          <ellipse cx="400" cy="700" rx="150" ry="75" opacity="0.5" />
          <ellipse cx="400" cy="700" rx="100" ry="50" opacity="0.6" />
          <ellipse cx="400" cy="700" rx="55" ry="28" opacity="0.8" />
        </g>
        <g stroke="#0F0F0D" strokeWidth="0.3" opacity="0.4">
          <line x1="360" y1="0" x2="360" y2="900" />
          <line x1="720" y1="0" x2="720" y2="900" />
          <line x1="1080" y1="0" x2="1080" y2="900" />
          <line x1="0" y1="225" x2="1440" y2="225" />
          <line x1="0" y1="450" x2="1440" y2="450" />
          <line x1="0" y1="675" x2="1440" y2="675" />
        </g>
      </svg>
    </div>
  );
}

type TopoDividerVariant = 1 | 2 | 3 | 4 | 5;

function TopoDivider({ v = 1 }: { v?: TopoDividerVariant }) {
  const configs: Record<TopoDividerVariant, { paths: string[]; stroke: string; opacity: number }> = {
    1: {
      paths: [
        "M0,24 C120,10 240,38 360,24 C480,10 600,38 720,24 C840,10 960,38 1080,24 C1200,10 1320,38 1440,24",
        "M0,32 C120,18 240,46 360,32 C480,18 600,46 720,32 C840,18 960,46 1080,32 C1200,18 1320,46 1440,32",
        "M0,16 C120,4 240,28 360,16 C480,4 600,28 720,16 C840,4 960,28 1080,16 C1200,4 1320,28 1440,16",
      ],
      stroke: "#0F0F0D",
      opacity: 0.12,
    },
    2: {
      paths: [
        "M0,28 C180,14 360,42 540,28 C720,14 900,42 1080,28 C1260,14 1380,36 1440,28",
        "M0,20 C180,8 360,34 540,20 C720,8 900,34 1080,20 C1260,8 1380,28 1440,20",
      ],
      stroke: "#0F0F0D",
      opacity: 0.12,
    },
    3: {
      paths: [
        "M0,24 C200,8 400,40 600,24 C800,8 1000,40 1200,24 C1320,16 1400,32 1440,24",
        "M0,34 C200,18 400,48 600,34 C800,18 1000,48 1200,34 C1320,26 1400,42 1440,34",
      ],
      stroke: "#F5F4F0",
      opacity: 0.07,
    },
    4: {
      paths: [
        "M0,20 C160,36 320,8 480,24 C640,40 800,12 960,28 C1120,44 1280,16 1440,24",
        "M0,30 C160,46 320,18 480,34 C640,50 800,22 960,38 C1120,54 1280,26 1440,34",
        "M0,12 C160,26 320,2 480,16 C640,30 800,4 960,18 C1120,32 1280,8 1440,16",
      ],
      stroke: "#0F0F0D",
      opacity: 0.12,
    },
    5: {
      paths: [
        "M0,24 C120,10 240,38 360,24 C480,10 600,38 720,24 C840,10 960,38 1080,24 C1200,10 1320,38 1440,24",
        "M0,14 C120,2 240,26 360,14 C480,2 600,26 720,14 C840,2 960,26 1080,14 C1200,2 1320,26 1440,14",
      ],
      stroke: "#0F0F0D",
      opacity: 0.12,
    },
  };

  const { paths, stroke, opacity } = configs[v];
  return (
    <div
      style={{ position: "relative", height: 48, overflow: "hidden", opacity, zIndex: 1 }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 48"
        preserveAspectRatio="none"
        style={{ width: "100%", height: "100%" }}
        fill="none"
        stroke={stroke}
        strokeWidth="1"
      >
        {paths.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </svg>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Home() {
  const [coinsAnalyzed, setCoinsAnalyzed] = useState(0);
  const [updatesQueue, setUpdatesQueue] = useState(0);
  const [srValues, setSrValues] = useState(["", "", "", ""]);
  const [confidence, setConfidence] = useState(0);

  // Live metric counters
  useEffect(() => {
    let coins = 0;
    const ci = setInterval(() => {
      coins += Math.floor(Math.random() * 5) + 3;
      if (coins >= 150) { coins = 150; clearInterval(ci); }
      setCoinsAnalyzed(coins);
    }, 80);
    let updates = 0;
    const ui = setInterval(() => {
      updates += Math.floor(Math.random() * 3) + 1;
      if (updates >= 47) { updates = 47; clearInterval(ui); }
      setUpdatesQueue(updates);
    }, 120);
    return () => { clearInterval(ci); clearInterval(ui); };
  }, []);

  // Panel type-out + confidence animation
  useEffect(() => {
    const t = setTimeout(() => {
      const targets = ["$109,400", "$105,800", "$101,400", "$97,200"];
      targets.forEach((val, idx) => {
        let j = 0;
        const iv = setInterval(() => {
          setSrValues((prev) => {
            const n = [...prev];
            n[idx] = val.slice(0, j + 1);
            return n;
          });
          j++;
          if (j >= val.length) clearInterval(iv);
        }, 30);
      });
      let c = 0;
      const ct = setInterval(() => {
        c += 3;
        if (c >= 82) { setConfidence(82); clearInterval(ct); } else setConfidence(c);
      }, 20);
    }, 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ background: C.bg, color: C.ink, fontFamily: BODY, fontSize: 16, lineHeight: 1.6 }}>
      <TopoBg />

      {/* ── NAV ── */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 48px", background: C.bg, borderBottom: `1px solid ${C.border}`,
        }}
      >
        <a
          href="#"
          style={{ fontFamily: MONO, fontSize: 15, fontWeight: 600, letterSpacing: "0.08em", color: C.ink, textDecoration: "none" }}
        >
          CARTA<span style={{ color: C.signal }}>.</span>
        </a>
        <motion.ul
          className="hidden md:flex"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          style={{ gap: 32, listStyle: "none", margin: 0, padding: 0 }}
        >
          {([["#how", "How it works"], ["#features", "Features"], ["#mcp", "Claude via MCP"], ["#lore", "The Territory"]] as [string, string][]).map(
            ([href, label]) => (
              <motion.li key={href} variants={fadeIn} transition={easeOutFast}>
                <a
                  href={href}
                  className="nav-link-hover"
                  style={{ fontFamily: MONO, fontSize: 12, fontWeight: 500, letterSpacing: "0.06em", color: C.inkMuted, textDecoration: "none", textTransform: "uppercase", transition: "color 0.15s" }}
                >
                  {label}
                </a>
              </motion.li>
            )
          )}
        </motion.ul>
        <motion.a
          href="#install"
          className="btn-ink"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.3 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          style={{ fontFamily: MONO, fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", color: C.bg, background: C.ink, padding: "8px 20px", textDecoration: "none", textTransform: "uppercase", transition: "background 0.15s", display: "inline-block" }}
        >
          Install Free
        </motion.a>
      </motion.nav>

      {/* ── HERO WRAPPER ── */}
      <div style={{ position: "relative" }}>
        {/* Coordinate labels */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          style={{ position: "absolute", top: 80, left: 48, zIndex: 2, display: "flex", alignItems: "center", gap: 8 }}
          className="hidden md:flex"
        >
          <span style={{ fontFamily: MONO, fontSize: 10, color: C.inkMuted, letterSpacing: "0.08em", opacity: 0.8 }}>13°S 106°E</span>
          <span style={{ fontFamily: MONO, fontSize: 10, color: C.inkMuted, opacity: 0.7 }}>·</span>
          <span style={{ fontFamily: MONO, fontSize: 10, color: C.inkMuted, letterSpacing: "0.08em", opacity: 0.8 }}>CRYPTO TERRITORY · DAILY</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          style={{ position: "absolute", bottom: 24, right: 48, zIndex: 2 }}
          className="hidden md:block"
        >
          <span style={{ fontFamily: MONO, fontSize: 10, color: C.inkMuted, letterSpacing: "0.08em", opacity: 0.8 }}>CARTA · CHART INTEL · MAPPED</span>
        </motion.div>

        {/* ── HERO SECTION ── */}
        <section
          className="grid grid-cols-1 lg:grid-cols-2 items-center"
          style={{ minHeight: "100vh", padding: "120px 48px 80px", gap: 64, maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 1 }}
        >
          {/* Hero left — stagger children */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={slideFromLeft}
              transition={{ ...easeOut, delay: 0.1 }}
              style={{ fontFamily: MONO, fontWeight: 500, letterSpacing: "0.12em", color: C.signal, textTransform: "uppercase", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}
              className="md:text-xl text-center md:text-start"
            >
              <span
                style={{ width: 40, height: 2, background: C.signal }}
                className="hidden md:inline-block"
              />
              Cartography Trading Agent
            </motion.div>

            {/* <motion.h1
              variants={fadeUp}
              transition={{ ...easeOut, delay: 0.15 }}
              style={{ fontFamily: SANS, fontSize: "clamp(40px, 5vw, 64px)", fontWeight: 700, lineHeight: 1.05, letterSpacing: "-0.02em", color: C.ink, marginBottom: 24 }}
            >
              Your chart<br />finally has a<br />
              <em style={{ fontStyle: "normal", color: C.signal }}>navigator.</em>
            </motion.h1> */}
            <TextType
              text={["Your chart finally has a navigator"]}
              typingSpeed={40}
              pauseDuration={1500}
              showCursor
              cursorCharacter="|"
              deletingSpeed={20}
              variableSpeed={{
                min: 60,
                max: 120,
              }}
              cursorBlinkDuration={0.5}
              className="text-2xl md:text-5xl font-semibold mb-4 md:mb-8"
            />

            <motion.p
              variants={fadeUp}
              transition={{ ...easeOut, delay: 0.2 }}
              style={{ fontFamily: BODY, fontSize: 17, lineHeight: 1.65, color: C.inkMuted, marginBottom: 40, maxWidth: 440 }}
            >
              CARTA reads every crypto chart you open in TradingView. Signal, levels, trade setup.
              Already there when you arrive. Powered by Claude via MCP.
            </motion.p>

            <motion.div
              variants={fadeUp}
              transition={{ ...easeOut, delay: 0.25 }}
              style={{ display: "flex", alignItems: "center", gap: 20 }}
            >
              <motion.a
                href="#install"
                className="btn-ink"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{ fontFamily: MONO, fontSize: 13, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: C.bg, background: C.ink, padding: "14px 28px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 10, transition: "background 0.15s" }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1v8M4 7l3 3 3-3M2 11h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Add to Chrome
              </motion.a>
              <a
                href="#how"
                style={{ fontFamily: MONO, fontSize: 12, fontWeight: 500, letterSpacing: "0.05em", color: C.inkMuted, textDecoration: "none", textTransform: "uppercase", borderBottom: `1px solid ${C.border}`, paddingBottom: 2, transition: "color 0.15s, border-color 0.15s" }}
              >
                See how it works
              </a>
            </motion.div>

            {/* Hero meta stats */}
            <motion.div
              variants={staggerFast}
              style={{ marginTop: 40, display: "flex", gap: 32 }}
            >
              {([["150+", "Coins covered"], ["4h", "Refresh cycle"], ["$100M+", "Marketcap filter"]] as [string, string][]).map(([num, label]) => (
                <motion.div
                  key={label}
                  variants={fadeUp}
                  transition={easeOutFast}
                  style={{ fontFamily: MONO, fontSize: 11, color: C.inkFaint, letterSpacing: "0.04em" }}
                >
                  <strong style={{ display: "block", fontSize: 20, fontWeight: 600, color: C.ink, marginBottom: 2 }}>{num}</strong>
                  {label}
                </motion.div>
              ))}
            </motion.div>

            {/* Live metric box */}
            <motion.div
              variants={fadeUp}
              transition={{ ...easeOut, delay: 0.35 }}
              style={{ marginTop: 56, padding: 28, background: `linear-gradient(135deg, ${C.signalDim} 0%, rgba(255,107,0,0.08) 100%)`, border: `1px solid ${C.signal}`, borderRadius: 6, position: "relative", overflow: "hidden" }}
            >
              <div
                style={{ fontFamily: MONO, fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", color: C.signal, textTransform: "uppercase", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}
              >
                <span className="panel-dot-pulse" style={{ width: 8, height: 8, background: C.signal, borderRadius: "50%", display: "inline-block" }} />
                Live Metric
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 16 }}>
                <div style={{ background: "rgba(255,255,255,0.4)", padding: 16, borderRadius: 4, borderLeft: `3px solid ${C.signal}` }}>
                  <div style={{ fontSize: 32, fontWeight: 700, color: C.signal, fontVariantNumeric: "tabular-nums" }}>{coinsAnalyzed}</div>
                  <div style={{ fontSize: 11, color: C.inkMuted, marginTop: 6, fontWeight: 500 }}>Coins analyzed today</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.4)", padding: 16, borderRadius: 4, borderLeft: `3px solid ${C.signal}` }}>
                  <div style={{ fontSize: 32, fontWeight: 700, color: C.signal, fontVariantNumeric: "tabular-nums" }}>{updatesQueue}</div>
                  <div style={{ fontSize: 11, color: C.inkMuted, marginTop: 6, fontWeight: 500 }}>Updates in queue</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: C.signal, fontStyle: "italic", display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M8 2L4 6L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Scroll to see how it works
              </div>
            </motion.div>
          </motion.div>

          {/* Hero right — CARTA Panel, slides in from right */}
          <motion.div
            initial={{ opacity: 0, x: 48, y: 8 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 0.97, 0.36, 1] }}
          >
            <motion.div
              whileHover={{ y: -10, boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 32px 64px rgba(0,0,0,0.1)", scale: 1.01 }}
              transition={{ duration: 0.3 }}
              style={{ background: C.bg, border: `1px solid ${C.border}`, boxShadow: "0 2px 8px rgba(0,0,0,0.06), 0 16px 48px rgba(0,0,0,0.08)", fontFamily: MONO, fontSize: 12, overflow: "hidden" }}
            >
              {/* Panel header */}
              <div
                style={{ background: C.ink, color: C.bg, padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 600, letterSpacing: "0.08em" }}>
                  <span className="panel-dot-pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: C.signal, display: "inline-block" }} />
                  CARTA
                </div>
                <span style={{ fontSize: 11, color: "#999", letterSpacing: "0.04em" }}>BTCUSDT · Daily</span>
              </div>

              {/* Signal bar */}
              <div
                style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}
              >
                <span
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", padding: "6px 14px", background: C.greenDim, color: C.green, border: `1px solid ${C.green}` }}
                >
                  ▲ BUY
                </span>
                <div style={{ fontSize: 11, color: C.inkMuted, textAlign: "right" }}>
                  <strong style={{ display: "block", fontSize: 18, fontWeight: 600, color: C.green }}>{confidence}%</strong>
                  Confidence
                </div>
              </div>

              {/* S/R Levels */}
              <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: C.inkFaint, marginBottom: 10 }}>
                  Support & Resistance · Daily
                </div>
                {([{ dot: C.red, label: "Strong Resistance", val: srValues[0] }, { dot: "#e07070", label: "Weak Resistance", val: srValues[1] }] as { dot: string; label: string; val: string }[]).map(({ dot, label, val }) => (
                  <div
                    key={label}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", borderBottom: `1px solid ${C.border}` }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: C.inkMuted }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: dot, flexShrink: 0, display: "inline-block" }} />
                      {label}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 500, color: C.ink, fontVariantNumeric: "tabular-nums" }}>{val}</span>
                  </div>
                ))}
                {/* Current price */}
                <div
                  style={{ background: C.signalDim, margin: "0 -16px", padding: "4px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                  <span style={{ color: C.signal, fontSize: 10, letterSpacing: "0.06em" }}>CURRENT · $103,240</span>
                  <span style={{ color: C.signal, fontSize: 10 }}>+1.8% from support</span>
                </div>
                {([{ dot: "#70b090", label: "Weak Support", val: srValues[2] }, { dot: C.green, label: "Strong Support", val: srValues[3] }] as { dot: string; label: string; val: string }[]).map(({ dot, label, val }) => (
                  <div
                    key={label}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", borderBottom: `1px solid ${C.border}` }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: C.inkMuted }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: dot, flexShrink: 0, display: "inline-block" }} />
                      {label}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 500, color: C.ink, fontVariantNumeric: "tabular-nums" }}>{val}</span>
                  </div>
                ))}
              </div>

              {/* Indicators */}
              <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: C.inkFaint, marginBottom: 10 }}>Indicators</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {([{ label: "RSI (14)", value: "58.4 · Neutral", color: C.green }, { label: "MACD", value: "Bullish Cross", color: C.green }, { label: "EMA 200", value: "Above", color: C.green }, { label: "Volume", value: "Above Avg", color: C.inkMuted }] as { label: string; value: string; color: string }[]).map(({ label, value, color }) => (
                    <div key={label} style={{ background: C.surface, padding: "8px 10px" }}>
                      <div style={{ fontSize: 10, color: C.inkFaint, letterSpacing: "0.06em", marginBottom: 3 }}>{label}</div>
                      <div style={{ fontSize: 13, fontWeight: 500, color }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trade Setup */}
              <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: C.inkFaint, marginBottom: 10 }}>
                  Trade Setup · Long (A-Grade)
                </div>
                {([{ label: "Entry Zone", value: "$101,200 – $102,000", color: C.ink }, { label: "Stop (tight)", value: "$99,800 · −1.4%", color: C.red }, { label: "TP1", value: "$105,800 · +3.8R", color: C.green }, { label: "TP2", value: "$109,400 · +7.4R", color: C.green }, { label: "Invalidation", value: "4H close below $99,800", color: C.red }] as { label: string; value: string; color: string }[]).map(({ label, value, color }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", fontSize: 11 }}>
                    <span style={{ color: C.inkFaint }}>{label}</span>
                    <span style={{ color, fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>{value}</span>
                  </div>
                ))}
              </div>

              {/* CARTA's Call */}
              <div
                style={{ padding: "12px 16px", background: C.surface, borderTop: `2px solid ${C.signal}`, fontSize: 11, lineHeight: 1.6, color: C.inkMuted, fontFamily: BODY, fontStyle: "italic" }}
              >
                <strong style={{ fontStyle: "normal", color: C.signal, fontFamily: MONO, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
                  CARTA&apos;s Call
                </strong>
                Price is holding above the weekly structure with clean volume. I&apos;d wait for a 4H close inside
                the entry zone before committing. If it flushes to $97,200, that&apos;s the deeper setup. Higher conviction there.
              </div>

              {/* Freshness row */}
              <div style={{ padding: "8px 16px", fontSize: 10, color: C.inkFaint, display: "flex", justifyContent: "space-between", letterSpacing: "0.04em" }}>
                <span>mcptrade.site · Full analysis →</span>
                <span>Generated 1h ago</span>
              </div>
            </motion.div>
          </motion.div>
        </section>
      </div>

      {/* ── DIVIDER ── */}
      <TopoDivider v={1} />

      {/* ── PROBLEM SECTION ── */}
      <section id="problem" style={{ maxWidth: 1280, margin: "0 auto", padding: "100px 48px", position: "relative", zIndex: 1 }}>
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          transition={easeOut}
        >
          <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", color: C.inkFaint, textTransform: "uppercase", marginBottom: 16 }}>The Problem</div>
          <h2 style={{ fontFamily: SANS, fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 0 }}>
            You open the chart.<br />Then what?
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 48, marginTop: 56, alignItems: "start" }}>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            transition={{ ...easeOut, delay: 0.1 }}
          >
            {[
              "Every serious crypto trader knows TradingView. But reading a chart takes real work. Finding the actual support levels, knowing which indicators matter, deciding where to enter and where your trade breaks. It takes time most traders don't spend.",
              "Most skip the analysis entirely or copy calls from accounts they've never verified. Neither of those is a real process.",
              "Tools like Claude Code connected to TradingView via MCP can do this properly. But the setup takes 30+ minutes, requires terminal access, and isn't built for people who just want to trade.",
            ].map((p, i) => (
              <p key={i} style={{ fontSize: 16, lineHeight: 1.75, color: C.inkMuted, marginBottom: 20 }}>{p}</p>
            ))}
          </motion.div>

          <motion.ul
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}
          >
            {[
              "Drawing S/R lines manually on every chart you open",
              "Cross-referencing RSI, MACD, EMA separately before each trade",
              "No consistent framework. Every session starts from scratch",
              "Claude MCP setup requires terminal access and 30+ minutes",
              "Switching tabs between analysis tools and the chart breaks focus",
            ].map((item) => (
              <motion.li
                key={item}
                variants={fadeUp}
                transition={easeOutFast}
                whileHover={{ x: 4, transition: { duration: 0.2 } }}
                style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", background: C.surface, borderLeft: `2px solid ${C.border2}`, fontSize: 14, color: C.inkMuted, lineHeight: 1.5 }}
              >
                <span style={{ fontFamily: MONO, fontSize: 12, color: C.inkFaint, flexShrink: 0, marginTop: 1 }}>//</span>
                {item}
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </section>

      {/* ── DIVIDER ── */}
      <TopoDivider v={2} />

      {/* ── HOW IT WORKS (dark) ── */}
      <section id="how" style={{ background: C.ink, color: C.bg, padding: "100px 48px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            transition={easeOut}
          >
            <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", color: C.signal, textTransform: "uppercase", marginBottom: 16 }}>How CARTA Works</div>
            <h2 style={{ fontFamily: SANS, fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.02em", color: C.bg }}>
              Install once.<br />CARTA handles the rest.
            </h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            style={{ gap: 1, background: "#2a2a28", marginTop: 56, border: "1px solid #2a2a28" }}
          >
            {([{
              num: "Step 01", title: "Install the extension",
              desc: "Add CARTA to Chrome from the Web Store. No account required. No configuration. No terminal commands.",
              code: [
                { t: "comment", s: "// One click. That's it." },
                { t: "pre", s: "chrome.extensions." },
                { t: "keyword", s: "install" },
                { t: "paren-string", s: '("CARTA")' },
              ],
            }, {
              num: "Step 02", title: "Open any crypto chart",
              desc: 'Navigate to TradingView and open any crypto pair ending in USDT with a marketcap above $100M. CARTA detects the symbol automatically.',
              code: [
                { t: "comment", s: "// CARTA reads the URL" },
                { t: "string-arg", s: '"BINANCE:BTCUSDT"' },
                { t: "keyword-line", s: "→ match → load analysis" },
              ],
            }, {
              num: "Step 03", title: "Analysis is already there",
              desc: "The CARTA panel appears on your chart with signal, S/R levels, indicators, trade setup, and CARTA's Call. Pre-computed, instant, no waiting.",
              code: [
                { t: "comment", s: "// No API call on open" },
                { t: "keyword-line", s: "signal: BUY · 82%" },
                { t: "string-line", s: "support: $101,400" },
              ],
            }] as { num: string; title: string; desc: string; code: { t: string; s: string }[] }[]).map(({ num, title, desc, code }) => (
              <motion.div
                key={num}
                variants={fadeUp}
                transition={easeOut}
                whileHover={{ backgroundColor: "#181816" }}
                style={{ background: C.ink, padding: "40px 32px", transition: "background 0.2s" }}
              >
                <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: C.signal, marginBottom: 20, textTransform: "uppercase" }}>{num}</div>
                <div style={{ fontFamily: SANS, fontSize: 20, fontWeight: 600, color: C.bg, marginBottom: 12, lineHeight: 1.3 }}>{title}</div>
                <p style={{ fontSize: 14, lineHeight: 1.65, color: "#888" }}>{desc}</p>
                <div style={{ marginTop: 20, background: "#1a1a18", padding: "12px 14px", fontFamily: MONO, fontSize: 11, borderLeft: `2px solid ${C.signal}` }}>
                  {code.map((line, i) => {
                    if (line.t === "comment") return <div key={i} className="step-code-line-comment">{line.s}</div>;
                    if (line.t === "keyword" || line.t === "keyword-line") return <div key={i} className="step-code-line-keyword">{line.s}</div>;
                    if (line.t === "string-arg" || line.t === "string-line") return <div key={i} className="step-code-line-string">{line.s}</div>;
                    return <div key={i} className="step-code-line-default">{line.s}</div>;
                  })}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── DIVIDER (dark→light) ── */}
      <div style={{ background: C.ink }}>
        <TopoDivider v={3} />
      </div>

      {/* ── MCP SECTION ── */}
      <section id="mcp" style={{ maxWidth: 1280, margin: "0 auto", padding: "100px 48px", position: "relative", zIndex: 1 }}>
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          transition={easeOut}
        >
          <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", color: C.inkFaint, textTransform: "uppercase", marginBottom: 16 }}>Claude via MCP</div>
          <h2 style={{ fontFamily: SANS, fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
            How the analysis<br />actually gets made
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 64, marginTop: 56, alignItems: "start" }}>
          {/* Text + stats */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            transition={{ ...easeOut, delay: 0.1 }}
          >
            {[
              "CARTA's analysis is not rule-based. Every coin is read by Claude Sonnet via the Model Context Protocol, the same infrastructure that powers serious trading workflows, running automatically in the background every 4 hours.",
              "Claude looks at price action, indicator values, historical S/R confluence, and volume context. From that it produces a structured output: signal, levels, a full trade setup with entry, stop, and targets, plus a plain read of what the chart is actually doing right now.",
              "When you open a chart, CARTA pulls that pre-computed analysis from the database instantly. No API call on open. No waiting. The work was already done before you arrived.",
            ].map((p, i) => (
              <p key={i} style={{ fontSize: 16, lineHeight: 1.75, color: C.inkMuted, marginBottom: 20 }}>{p}</p>
            ))}
            <motion.div
              variants={staggerFast}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 32 }}
            >
              {([["4h", "Refresh cycle"], ["150+", "Coins analyzed"], ["7", "Indicators tracked"], ["Daily", "Primary timeframe"]] as [string, string][]).map(([num, label]) => (
                <motion.div
                  key={label}
                  variants={fadeUp}
                  transition={easeOutFast}
                  whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                  style={{ background: C.surface, padding: 20, border: `1px solid ${C.border}` }}
                >
                  <div style={{ fontFamily: MONO, fontSize: 28, fontWeight: 600, color: C.ink, marginBottom: 4 }}>{num}</div>
                  <div style={{ fontFamily: MONO, fontSize: 10, color: C.inkFaint, letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Flow diagram — stagger items */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            style={{ display: "flex", flexDirection: "column" }}
          >
            {([{ label: "CoinGecko API", desc: "Filter all coins with marketcap above $100M. Build the analysis queue." }, { label: "Claude Sonnet via MCP", desc: "Claude reads chart data per coin: S/R levels, indicator values, volume, weekly bias. Outputs structured analysis ready for the database." }, { label: "Supabase Database", desc: "Analysis stored per coin with timestamp. Cron job refreshes every 4 hours." }, { label: "Chrome Extension", desc: "Detects the symbol you're viewing. Queries the database. Renders the panel instantly." }, { label: "CARTA Panel", desc: "Signal, levels, trade setup, and CARTA's Call. On your chart, every time you open it." }] as { label: string; desc: string }[]).map(({ label, desc }, idx, arr) => (
              <motion.div
                key={label}
                variants={slideFromLeft}
                transition={{ ...easeOut, delay: idx * 0.06 }}
                style={{ display: "flex", gap: 16 }}
              >
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, width: 24 }}>
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + idx * 0.08, type: "spring", stiffness: 300, damping: 20 }}
                    style={{ width: 10, height: 10, borderRadius: "50%", background: C.signal, flexShrink: 0, marginTop: 4 }}
                  />
                  {idx < arr.length - 1 && (
                    <div style={{ width: 1, flex: 1, background: C.border, minHeight: 32 }} />
                  )}
                </div>
                <div style={{ paddingBottom: 28 }}>
                  <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: C.ink, marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 13, color: C.inkMuted, lineHeight: 1.5 }}>{desc}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── DIVIDER ── */}
      <TopoDivider v={4} />

      {/* ── FEATURES SECTION ── */}
      <section
        id="features"
        style={{ background: C.surface, padding: "100px 48px", borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, position: "relative", zIndex: 1 }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            transition={easeOut}
          >
            <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", color: C.inkFaint, textTransform: "uppercase", marginBottom: 16 }}>Features</div>
            <h2 style={{ fontFamily: SANS, fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
              Everything on the chart.<br />Nothing in your way.
            </h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            style={{ gap: 1, background: C.border, marginTop: 56, border: `1px solid ${C.border}` }}
          >
            {([{ icon: "Signal", title: "BUY / SELL / NEUTRAL with confidence score", desc: "The primary signal with a 0–100% confidence score and weekly bias filter. Color-coded and always visible at the top of the panel." }, { icon: "S/R Levels", title: "Multi-level support & resistance, Daily focus", desc: "Strong and weak levels with historical confluence notes. Shows your current price distance from the nearest support and resistance." }, { icon: "Indicators", title: "RSI, MACD, EMA, Bollinger, ATR, Volume", desc: "Seven indicators pre-read and interpreted. Not just values but status: above/below, squeeze/expansion, crossover direction." }, { icon: "Trade Setup", title: "Entry zone, stop, T1/T2/T3 with R:R ratios", desc: "Long and short setups with tight and safe stop variants. Graded A/B/C by conviction. Trigger condition and invalidation level included." }, { icon: "CARTA's Call", title: "Plain-language read of the chart", desc: "2 to 3 sentences from CARTA on what the chart is saying right now. Not a list of numbers. An actual point of view." }, { icon: "Auto-detect", title: "Works on any USDT pair above $100M marketcap", desc: "Open a chart, CARTA detects the symbol automatically. No input. No switching tabs. 150+ coins covered and expanding." }] as { icon: string; title: string; desc: string }[]).map(({ icon, title, desc }) => (
              <motion.div
                key={icon}
                variants={fadeUp}
                transition={easeOut}
                whileHover={{ y: -6, boxShadow: "0 12px 32px rgba(0,0,0,0.1)", zIndex: 2 }}
                style={{ background: C.bg, padding: "32px 28px", position: "relative" }}
              >
                <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: C.signal, textTransform: "uppercase", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 4, height: 4, background: C.signal, display: "inline-block" }} />
                  {icon}
                </div>
                <div style={{ fontFamily: SANS, fontSize: 17, fontWeight: 600, color: C.ink, marginBottom: 10, lineHeight: 1.3 }}>{title}</div>
                <p style={{ fontSize: 13, lineHeight: 1.65, color: C.inkMuted }}>{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── DIVIDER ── */}
      <TopoDivider v={5} />

      {/* ── THE TERRITORY (dark lore section) ── */}
      <section id="lore" style={{ background: C.ink, color: C.bg, padding: "100px 48px", position: "relative", overflow: "hidden", zIndex: 1 }}>
        {/* Subtle topo bg inside dark section */}
        <div style={{ position: "absolute", inset: 0, opacity: 0.04, pointerEvents: "none" }} aria-hidden="true">
          <svg viewBox="0 0 1440 600" preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: "100%" }} fill="none" stroke="#F5F4F0" strokeWidth="0.8">
            <path d="M-100,100 C200,60 400,140 600,100 C800,60 1000,140 1200,100 C1320,80 1400,120 1540,100" />
            <path d="M-100,280 C200,240 400,320 600,280 C800,240 1000,320 1200,280 C1320,260 1400,300 1540,280" />
            <path d="M-100,460 C200,420 400,500 600,460 C800,420 1000,500 1200,460 C1320,440 1400,480 1540,460" />
            <ellipse cx="1100" cy="300" rx="180" ry="90" opacity="0.6" />
            <ellipse cx="1100" cy="300" rx="120" ry="58" opacity="0.7" />
            <ellipse cx="1100" cy="300" rx="65" ry="30" opacity="0.9" />
          </svg>
        </div>

        <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            transition={easeOut}
            style={{ marginBottom: 72 }}
          >
            <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", color: C.signal, textTransform: "uppercase", marginBottom: 20 }}>The Territory</div>
            <h2 style={{ fontFamily: SANS, fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 700, lineHeight: 1.1, color: C.bg, maxWidth: 640 }}>
              Before you trade,<br />someone has to read<br />the map.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 80, alignItems: "start" }}>
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              transition={{ ...easeOut, delay: 0.1 }}
            >
              {[
                "The old cartographers did not guess. Before a ship left port, someone spent weeks charting the coastline, marking the depths, noting where the current ran wrong. The map came first. Then the journey.",
                "Most traders operate without one. They open a chart cold, draw a few lines from memory, and call it analysis. It works until it doesn't. Then they blame the market.",
                "CARTA is the cartographer. Every 4 hours, it reads the territory across 150+ coins. Support, resistance, trend structure, where volume confirmed and where it didn't. By the time you open TradingView, the map is already drawn. You just have to decide whether to follow it.",
              ].map((p, i) => (
                <p key={i} style={{ fontSize: 17, lineHeight: 1.8, color: "#aaa", marginBottom: 24 }}>{p}</p>
              ))}
              <div style={{ borderLeft: `2px solid ${C.signal}`, padding: "20px 24px", background: "rgba(255,255,255,0.05)" }}>
                <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: C.signal, marginBottom: 10 }}>CARTA&apos;s Mandate</div>
                <p style={{ fontSize: 15, lineHeight: 1.7, color: "#ccc", fontStyle: "italic" }}>
                  &ldquo;The chart does not care what you think. It records what happened. CARTA reads that record and tells you what it found. What you do with it is yours.&rdquo;
                </p>
              </div>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            >
              {([{ num: "I.", title: "The Territory Is Real", desc: "Support and resistance are not drawn by indicators. They are left behind by price. CARTA finds them where they actually exist, not where a formula says they should." }, { num: "II.", title: "The Map Precedes the Move", desc: "Analysis done during a trade is not analysis. It is justification. CARTA runs the read before the session starts so you arrive at the chart knowing the territory, not discovering it under pressure." }, { num: "III.", title: "Conviction Has a Level", desc: "Not every setup is equal. CARTA grades each one A, B, or C and tells you why. A-grade setups get full attention. B-grade setups get smaller size. C-grade setups get ignored until the picture clears." }, { num: "IV.", title: "The Invalidation Matters More", desc: "Knowing where to enter is easy. Knowing exactly when the trade is wrong is what separates a plan from a guess. CARTA gives you the invalidation level first. The target is secondary." }] as { num: string; title: string; desc: string }[]).map(({ num, title, desc }, idx, arr) => (
                <motion.div
                  key={num}
                  variants={slideFromRight}
                  transition={{ ...easeOut, delay: idx * 0.08 }}
                  style={{ padding: "28px 0", borderBottom: idx < arr.length - 1 ? "1px solid #2a2a28" : "none" }}
                >
                  <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: C.signal, textTransform: "uppercase", marginBottom: 10 }}>
                    {num} {title}
                  </div>
                  <p style={{ fontSize: 14, lineHeight: 1.7, color: "#888" }}>{desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <motion.div
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            transition={{ ...easeOut, delay: 0.2 }}
            style={{ marginTop: 72, paddingTop: 48, borderTop: "1px solid #2a2a28", textAlign: "center" }}
          >
            <p style={{ fontFamily: MONO, fontSize: 13, letterSpacing: "0.06em", color: "#555", maxWidth: 560, margin: "0 auto", lineHeight: 1.8 }}>
              CARTA · CARTOGRAPHY TRADING AGENT<br />
              <span style={{ color: "#333" }}>The chart always speaks.</span>
              <span style={{ color: C.signal }}> CARTA translates.</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── INSTALL SECTION ── */}
      <section
        id="install"
        style={{ maxWidth: 1280, margin: "0 auto", padding: "100px 48px", textAlign: "center", position: "relative", overflow: "hidden", zIndex: 1 }}
      >
        {/* Compass ornament */}
        <motion.div
          initial={{ opacity: 0, rotate: -15 }}
          whileInView={{ opacity: 0.04, rotate: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{ position: "absolute", right: 80, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
          aria-hidden="true"
        >
          <svg width="320" height="320" viewBox="0 0 320 320" fill="none">
            <circle cx="160" cy="160" r="140" stroke="#0F0F0D" strokeWidth="0.8" />
            <circle cx="160" cy="160" r="100" stroke="#0F0F0D" strokeWidth="0.5" />
            <circle cx="160" cy="160" r="60" stroke="#0F0F0D" strokeWidth="0.5" />
            <circle cx="160" cy="160" r="20" stroke="#0F0F0D" strokeWidth="1" />
            <line x1="160" y1="20" x2="160" y2="300" stroke="#0F0F0D" strokeWidth="0.8" />
            <line x1="20" y1="160" x2="300" y2="160" stroke="#0F0F0D" strokeWidth="0.8" />
            <line x1="61" y1="61" x2="259" y2="259" stroke="#0F0F0D" strokeWidth="0.4" />
            <line x1="259" y1="61" x2="61" y2="259" stroke="#0F0F0D" strokeWidth="0.4" />
          </svg>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          <motion.div variants={fadeUp} transition={easeOut} style={{ fontFamily: MONO, fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", color: C.inkFaint, textTransform: "uppercase", marginBottom: 16 }}>Ready</motion.div>
          <motion.h2 variants={fadeUp} transition={easeOut} style={{ fontFamily: SANS, fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 16 }}>
            Add CARTA to<br />your TradingView.
          </motion.h2>
          <motion.p variants={fadeUp} transition={easeOut} style={{ fontSize: 16, color: C.inkMuted, marginBottom: 40, maxWidth: 480, marginLeft: "auto", marginRight: "auto" }}>
            Free to install. Works immediately. No account, no API key, no setup.
          </motion.p>
          <motion.div variants={fadeUp} transition={easeOut} style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
            <motion.a
              href="#"
              className="btn-signal"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              style={{ fontFamily: MONO, fontSize: 13, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: C.bg, background: C.signal, padding: "16px 36px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 10, transition: "background 0.15s" }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v9M5 8l3 3 3-3M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Add to Chrome – Free
            </motion.a>
          </motion.div>
          <motion.div variants={fadeUp} transition={easeOut} style={{ fontFamily: MONO, fontSize: 11, color: C.inkFaint, letterSpacing: "0.04em", marginTop: 20 }}>
            Chrome · Manifest V3 · No data collected
          </motion.div>

          <motion.div
            variants={staggerFast}
            style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 20, marginTop: 56, paddingTop: 40, borderTop: `1px solid ${C.border}`, flexWrap: "wrap" }}
          >
            <motion.span variants={fadeIn} transition={easeOutFast} style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: C.inkFaint }}>Powered by</motion.span>
            {["Anthropic Claude", "MCPTrade", "Supabase"].map((badge) => (
              <motion.span
                key={badge}
                variants={fadeUp}
                transition={easeOutFast}
                whileHover={{ scale: 1.05, borderColor: C.border2 }}
                style={{ fontFamily: MONO, fontSize: 11, fontWeight: 600, color: C.inkMuted, padding: "5px 12px", border: `1px solid ${C.border}`, letterSpacing: "0.06em", display: "inline-block" }}
              >
                {badge}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row items-center justify-between"
        style={{ background: C.ink, color: "#555", padding: "40px 48px", fontFamily: MONO, fontSize: 11, letterSpacing: "0.06em", gap: 20 }}
      >
        <div style={{ color: C.bg, fontWeight: 600, letterSpacing: "0.1em" }}>
          CARTA<span style={{ color: C.signal }}>.</span>
        </div>
        <ul style={{ display: "flex", gap: 24, listStyle: "none", margin: 0, padding: 0, flexWrap: "wrap", justifyContent: "center" }}>
          {["MCPTrade", "GitHub", "X / Twitter"].map((link) => (
            <li key={link}>
              <a href="#" style={{ color: "#555", textDecoration: "none", textTransform: "uppercase", transition: "color 0.15s" }}>
                {link}
              </a>
            </li>
          ))}
        </ul>
        <div>Cartography Trading Agent · Built on MCPTrade</div>
      </motion.footer>
    </div>
  );
}
