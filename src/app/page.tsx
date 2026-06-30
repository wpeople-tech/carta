"use client";

import { useState, useEffect } from "react";
import { motion, Transition } from "motion/react";
import TopoBg from "@/components/TopoBg";
import TopoDivider from "@/components/TopoDivider";
import Navbar from "@/components/Navbar";
import LeftHeroSection from "@/sections/Home/LeftHeroSection";

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg: "#F5F4F0",
  surface: "#EDECEA",
  surface2: "#E4E2DE",
  border: "#D0CEC9",
  border2: "#B8B5AF",
  ink: "#0F0F0D",
  inkMuted: "#6B6860",
  inkFaint: "#7d7c79",
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

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Page() {
  const [srValues, setSrValues] = useState(["", "", "", ""]);
  const [confidence, setConfidence] = useState(0);

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
    <div className="bg-background text-ink font-reading">
      <TopoBg />

      <Navbar />

      {/* ── HERO WRAPPER ── */}
      <div className="relative">
        {/* Map reference box — top-left */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="hidden md:block absolute top-24 left-12 z-2"
        >
          <div style={{
             border: `1px solid ${C.border}`, 
             background: "rgba(245,244,240,0.85)", 
             padding: "8px 12px", 
             backdropFilter: "blur(4px)",
             display: 'flex',
             gap: '8px',
             alignItems: 'center',
           }}
           className="shadow-md"
           >
            <div style={{ fontFamily: MONO, fontSize: 12, color: C.inkFaint, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600 }}>Ref. Point</div>
            <div style={{ fontFamily: MONO, fontSize: 14, color: C.inkMuted, fontWeight: 600, letterSpacing: "0.06em" }}>13°S 106°E</div>
            <div style={{ fontFamily: MONO, fontSize: 12, color: C.inkFaint, letterSpacing: "0.08em", fontWeight: 600 }}>CRYPTO TERRITORY · DAILY</div>
          </div>
        </motion.div>

        {/* North arrow — top-right */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85, duration: 0.6 }}
          className="hidden lg:flex absolute top-24 right-12 z-2 flex-col items-center gap-1"
          style={{ opacity: 0.5 }}
        >
          <svg width="24" height="32" viewBox="0 0 24 32" fill="none">
            <path d="M12 2L16 14H8L12 2Z" fill={C.ink} />
            <path d="M12 30L8 18H16L12 30Z" fill="none" stroke={C.ink} strokeWidth="0.8" />
            <line x1="12" y1="2" x2="12" y2="30" stroke={C.ink} strokeWidth="0.5" />
          </svg>
          <span style={{ fontFamily: MONO, fontSize: 12, color: C.inkMuted, fontWeight: 700, letterSpacing: "0.12em" }}>N</span>
        </motion.div>

        {/* Scale bar + datum — bottom-right */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          style={{ position: "absolute", bottom: 24, right: 48, zIndex: 2 }}
          className="hidden md:block"
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
            {/* Scale bar */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontFamily: MONO, fontSize: 12, color: C.inkFaint, letterSpacing: "0.06em" }}>0</span>
              <div style={{ width: 48, height: 4, border: `1px solid ${C.border2}`, overflow: "hidden", display: "flex" }}>
                <div style={{ width: "50%", background: C.ink, height: "100%", opacity: 0.5 }} />
              </div>
              <span style={{ fontFamily: MONO, fontSize: 12, color: C.inkFaint, letterSpacing: "0.06em" }}>50km</span>
            </div>
            <span style={{ fontFamily: MONO, fontSize: 12, color: C.inkFaint, letterSpacing: "0.08em", textTransform: "uppercase" }}>Contour interval: 200m · WGS84</span>
            <span style={{ fontFamily: MONO, fontSize: 10, color: C.inkMuted, letterSpacing: "0.08em", fontWeight: 600 }}>CARTA · CHART INTEL · MAPPED</span>
          </div>
        </motion.div>

        {/* ── HERO SECTION ── */}
        <section
          className="grid grid-cols-1 lg:grid-cols-2 items-center px-8 md:px-16 py-28"
          style={{ minHeight: "100vh", gap: 64, maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 1 }}
        >
          {/* Hero left — stagger children */}
          <LeftHeroSection />

          {/* Hero right — CARTA Panel, enters from the right on first render */}
          <motion.div
            initial={{ opacity: 0, x: 72 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="overflow-hidden bg-background border border-border-base shadow-md font-technical text-[12px]"
            >
              {/* Panel header */}
              <div
                className="flex items-center justify-between"
                style={{ background: C.ink, color: C.bg, padding: "10px 16px" }}
                
              >
                <div className="flex items-center" style={{ gap: 8, fontSize: 14, fontWeight: 600, letterSpacing: "0.08em" }}>
                  <span className="panel-dot-pulse inline-block rounded-full" style={{ width: 6, height: 6, background: C.signal }} />
                  CARTA
                </div>
                <span style={{ fontSize: 14, color: "#999", letterSpacing: "0.04em" }}>BTCUSDT · Daily</span>
              </div>

              {/* Signal bar */}
              <div
                className="flex items-center justify-between"
                style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}` }}
              >
                <span
                  className="inline-flex items-center"
                  style={{ gap: 6, fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", padding: "6px 14px", background: C.greenDim, color: C.green, border: `1px solid ${C.green}` }}
                >
                  ▲ BUY
                </span>
                <div className="text-right" style={{ fontSize: 14, color: C.inkMuted }}>
                  <strong className="block" style={{ fontSize: 18, fontWeight: 600, color: C.green }}>{confidence}%</strong>
                  Confidence
                </div>
              </div>

              {/* S/R Levels */}
              <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}` }}>
                <div className="uppercase" style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", color: C.inkFaint, marginBottom: 10 }}>
                  Support & Resistance · Daily
                </div>
                {([{ dot: C.red, label: "Strong Resistance", val: srValues[0] }, { dot: "#e07070", label: "Weak Resistance", val: srValues[1] }] as { dot: string; label: string; val: string }[]).map(({ dot, label, val }) => (
                  <div
                    key={label}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", borderBottom: `1px solid ${C.border}` }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: C.inkMuted }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: dot, flexShrink: 0, display: "inline-block" }} />
                      {label}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 500, color: C.ink, fontVariantNumeric: "tabular-nums" }}>{val}</span>
                  </div>
                ))}
                {/* Current price */}
                <div
                  className="flex justify-between items-center"
                  style={{ background: C.signalDim, margin: "0 -16px", padding: "4px 16px" }}
                >
                  <span style={{ color: C.signal, fontSize: 10, letterSpacing: "0.06em" }}>CURRENT · $103,240</span>
                  <span style={{ color: C.signal, fontSize: 10 }}>+1.8% from support</span>
                </div>
                {([{ dot: "#70b090", label: "Weak Support", val: srValues[2] }, { dot: C.green, label: "Strong Support", val: srValues[3] }] as { dot: string; label: string; val: string }[]).map(({ dot, label, val }) => (
                  <div
                    key={label}
                    className="flex justify-between items-center border-b"
                    style={{ padding: "4px 0", borderColor: C.border }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: C.inkMuted }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: dot, flexShrink: 0, display: "inline-block" }} />
                      {label}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 500, color: C.ink, fontVariantNumeric: "tabular-nums" }}>{val}</span>
                  </div>
                ))}
              </div>

              {/* Indicators */}
              <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}` }}>
                <div className="uppercase" style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", color: C.inkFaint, marginBottom: 10 }}>Indicators</div>
                <div className="grid grid-cols-2" style={{ gap: 8 }}>
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
                <div className="uppercase" style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", color: C.inkFaint, marginBottom: 10 }}>
                  Trade Setup · Long (A-Grade)
                </div>
                {([{ label: "Entry Zone", value: "$101,200 – $102,000", color: C.ink }, { label: "Stop (tight)", value: "$99,800 · −1.4%", color: C.red }, { label: "TP1", value: "$105,800 · +3.8R", color: C.green }, { label: "TP2", value: "$109,400 · +7.4R", color: C.green }, { label: "Invalidation", value: "4H close below $99,800", color: C.red }] as { label: string; value: string; color: string }[]).map(({ label, value, color }) => (
                  <div key={label} className="flex justify-between items-center" style={{ padding: "5px 0", fontSize: 14 }}>
                    <span style={{ color: C.inkFaint }}>{label}</span>
                    <span className="font-medium" style={{ color, fontVariantNumeric: "tabular-nums" }}>{value}</span>
                  </div>
                ))}
              </div>

              {/* CARTA's Call */}
              <div
                className="italic"
                style={{ padding: "12px 16px", background: C.surface, borderTop: `2px solid ${C.signal}`, fontSize: 14, lineHeight: 1.6, color: C.inkMuted, fontFamily: BODY }}
              >
                <strong className="block uppercase" style={{ color: C.signal, fontFamily: MONO, fontSize: 10, letterSpacing: "0.08em", marginBottom: 4 }}>
                  CARTA&apos;s Call
                </strong>
                Price is holding above the weekly structure with clean volume. I&apos;d wait for a 4H close inside
                the entry zone before committing. If it flushes to $97,200, that&apos;s the deeper setup. Higher conviction there.
              </div>

              {/* Freshness row */}
              <div className="flex justify-between" style={{ padding: "8px 16px", fontSize: 10, color: C.inkFaint, letterSpacing: "0.04em" }}>
                <span>mcptrade.site · Full analysis →</span>
                <span>Generated 1h ago</span>
              </div>
            </motion.div>
          </motion.div>
        </section>
      </div>

      {/* ── MAP LEGEND STRIP ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0, duration: 0.6 }}
        className="hidden md:flex items-center justify-center gap-8 border-t border-b"
        style={{ borderColor: C.border, padding: "10px 48px", background: "rgba(237,236,234,0.6)", position: "relative", zIndex: 1 }}
      >
        {([
          { color: C.ink, label: "Index Contour (200m)" },
          { color: C.inkFaint, label: "Intermediate Contour" },
          { color: C.signal, label: "Signal Level" },
          { color: C.green, label: "Support Zone" },
          { color: C.red, label: "Resistance Zone" },
        ] as { color: string; label: string }[]).map(({ color, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 20, height: 1.5, background: color, flexShrink: 0 }} />
            <span style={{ fontFamily: MONO, fontSize: 12, color: C.inkFaint, letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</span>
          </div>
        ))}
        <div style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 12, color: C.inkFaint, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Scale 1:250,000 · Projection: Mercator
        </div>
      </motion.div>

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
          <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 500, letterSpacing: "0.12em", color: C.inkFaint, textTransform: "uppercase", marginBottom: 16 }}>The Problem</div>
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

      {/* ── MCP SECTION ── */}
      <section id="mcp" style={{ maxWidth: 1280, margin: "0 auto", padding: "100px 48px", position: "relative", zIndex: 1 }}>
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          transition={easeOut}
        >
          <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 500, letterSpacing: "0.12em", color: C.inkFaint, textTransform: "uppercase", marginBottom: 16 }}>Claude via MCP</div>
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
                  <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: C.ink, marginBottom: 4 }}>{label}</div>
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
            <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 500, letterSpacing: "0.12em", color: C.inkFaint, textTransform: "uppercase", marginBottom: 16 }}>Features</div>
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
                <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 600, letterSpacing: "0.1em", color: C.signal, textTransform: "uppercase", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
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
            <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 600, letterSpacing: "0.12em", color: C.signal, textTransform: "uppercase", marginBottom: 20 }}>The Territory</div>
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
                  <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 600, letterSpacing: "0.1em", color: C.signal, textTransform: "uppercase", marginBottom: 10 }}>
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
            style={{ marginTop: 72, paddingTop: 48, borderTop: "1px solid #2a2a28" }}
          >
            {/* Cartographic inset panel */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32 }}>
              {/* Mini map legend box */}
              <div style={{ display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center" }}>
                {([
                  { color: C.signal, label: "Signal Level" },
                  { color: C.green, label: "Support" },
                  { color: C.red, label: "Resistance" },
                  { color: "#555", label: "Contour (200m)" },
                ] as { color: string; label: string }[]).map(({ color, label }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 16, height: 1.5, background: color }} />
                    <span style={{ fontFamily: MONO, fontSize: 12, color: "#555", letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</span>
                  </div>
                ))}
              </div>
              {/* Projection note */}
              <p style={{ fontFamily: MONO, fontSize: 14, letterSpacing: "0.06em", color: "#444", maxWidth: 480, textAlign: "center", lineHeight: 1.9 }}>
                <span style={{ color: "#666" }}>Datum: WGS84 · Projection: Mercator · Scale 1:250,000</span><br />
                CARTA · CARTOGRAPHY TRADING AGENT<br />
                <span style={{ color: "#333" }}>The chart always speaks.</span>
                <span style={{ color: C.signal }}> CARTA translates.</span>
              </p>
            </div>
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
          <motion.div variants={fadeUp} transition={easeOut} style={{ fontFamily: MONO, fontSize: 14, fontWeight: 500, letterSpacing: "0.12em", color: C.inkFaint, textTransform: "uppercase", marginBottom: 16 }}>Ready</motion.div>
          <motion.h2 variants={fadeUp} transition={easeOut} style={{ fontFamily: SANS, fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 16 }}>
            Add CARTA to<br />your TradingView.
          </motion.h2>
          <motion.p variants={fadeUp} transition={easeOut} style={{ fontSize: 16, color: C.inkMuted, marginBottom: 40, maxWidth: 480, marginLeft: "auto", marginRight: "auto" }}>
            Free. No account, no API key, no setup. Load it manually in 30 seconds.
          </motion.p>

          {/* Download button */}
          <motion.div variants={fadeUp} transition={easeOut} style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
            <motion.a
              href="/carta-extension.zip"
              className="btn-signal"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              style={{ fontFamily: MONO, fontSize: 13, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: C.bg, background: C.signal, padding: "16px 36px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 10, transition: "background 0.15s" }}
              download
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v9M5 8l3 3 3-3M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Download CARTA – Free
            </motion.a>
          </motion.div>
          <motion.div variants={fadeUp} transition={easeOut} style={{ fontFamily: MONO, fontSize: 14, color: C.inkFaint, letterSpacing: "0.04em", marginTop: 12 }}>
            Chrome · Manifest V3 · No data collected
          </motion.div>

          {/* Manual install steps */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            style={{ maxWidth: 480, margin: "40px auto 0", textAlign: "left" }}
            className="bg-white p-4 rounded-md shadow-md"
          >
            <motion.div variants={fadeUp} transition={easeOut} style={{ fontFamily: MONO, fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: C.inkFaint, marginBottom: 16 }}>
              How to install manually
            </motion.div>
            {([
              { step: "01", text: "Download the .zip above and extract it to a permanent folder" },
              { step: "02", text: "Open Chrome and go to chrome://extensions" },
              { step: "03", text: 'Enable "Developer mode" toggle (top-right corner)' },
              { step: "04", text: 'Click "Load unpacked" and select the extracted folder' },
              { step: "05", text: "Open TradingView, navigate to any USDT pair — CARTA appears" },
            ] as { step: string; text: string }[]).map(({ step, text }) => (
              <motion.div
                key={step}
                variants={fadeUp}
                transition={easeOutFast}
                style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: "10px 0", borderBottom: `1px solid ${C.border}` }}
              >
                <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: C.signal, flexShrink: 0, minWidth: 24 }}>{step}</span>
                <span style={{ fontSize: 13, color: C.inkMuted, lineHeight: 1.5 }}>{text}</span>
              </motion.div>
            ))}
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
                style={{ fontFamily: MONO, fontSize: 14, fontWeight: 600, color: C.inkMuted, padding: "5px 12px", border: `1px solid ${C.border}`, letterSpacing: "0.06em", display: "inline-block" }}
              >
                {badge}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>
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
            <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 500, letterSpacing: "0.12em", color: C.signal, textTransform: "uppercase", marginBottom: 16 }}>How CARTA Works</div>
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
              num: "Step 01", title: "Download & load the extension",
              desc: "Download the .zip, extract it, then load it into Chrome manually. No Web Store. No account. No terminal.",
              code: [
                { t: "comment", s: "// Load unpacked — 30 seconds" },
                { t: "keyword", s: "chrome://extensions" },
                { t: "string-arg", s: '"Load unpacked" → select folder' },
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
              desc: "The CARTA panel appears instantly on your chart with live signals, key S/R levels, indicators, trade setups, and CARTA's Call—all updated in real time, with no waiting.",
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
                <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 600, letterSpacing: "0.1em", color: C.signal, marginBottom: 20, textTransform: "uppercase" }}>{num}</div>
                <div style={{ fontFamily: SANS, fontSize: 20, fontWeight: 600, color: C.bg, marginBottom: 12, lineHeight: 1.3 }}>{title}</div>
                <p style={{ fontSize: 14, lineHeight: 1.65, color: "#888" }}>{desc}</p>
                <div style={{ marginTop: 20, background: "#1a1a18", padding: "12px 14px", fontFamily: MONO, fontSize: 14, borderLeft: `2px solid ${C.signal}` }}>
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

      {/* ── FOOTER ── */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row items-center justify-between"
        style={{ background: C.ink, color: "#555", padding: "40px 48px", fontFamily: MONO, fontSize: 14, letterSpacing: "0.06em", gap: 20 }}
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
