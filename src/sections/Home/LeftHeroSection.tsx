'use client'

import TextType from "@/components/TextType";
import { easeOut, easeOutFast, fadeUp, slideFromLeft, staggerContainer, staggerFast } from "@/design.config";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

export default function LeftHeroSection() {
  const [coinsAnalyzed, setCoinsAnalyzed] = useState(0);
  const [updatesQueue, setUpdatesQueue] = useState(0);

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
  
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        variants={slideFromLeft}
        transition={{ ...easeOut, delay: 0.1 }}
        className="font-technical font-medium tracking-[0.12em] uppercase text-signal-orange mb-5 flex items-center gap-2 md:text-xl text-center md:text-start"
      >
        <span
          className="hidden md:inline-block h-0.5 w-10 bg-signal-orange"
        />
        Cartography Trading Agent
      </motion.div>

      <TextType
        text={["Your Chart Finally Has A Navigator"]}
        typingSpeed={40}
        pauseDuration={1500}
        showCursor
        cursorCharacter="_"
        deletingSpeed={40}
        variableSpeed={{
          min: 60,
          max: 120,
        }}
        cursorBlinkDuration={0.5}
        className="text-3xl md:text-5xl font-semibold mb-4 md:mb-6 min-h-20 md:min-h-24 font-technical tracking-tighter text-center md:text-start"
      />

      <motion.p
        variants={fadeUp}
        transition={{ ...easeOut, delay: 0.2 }}
        className="font-reading text-[17px] leading-[1.65] text-ink-muted mb-10 max-w-110"
      >
        CARTA reads every crypto chart you open in TradingView. Signal, levels, trade setup.
        Already there when you arrive. Powered by Claude via MCP.
      </motion.p>

      <motion.div
        variants={fadeUp}
        transition={{ ...easeOut, delay: 0.25 }}
        className="flex items-center gap-5"
      >
        <motion.a
          href="#install"
          className="btn-ink font-technical text-[13px] font-semibold tracking-wider uppercase text-background bg-ink px-7 py-3.5 no-underline inline-flex items-center gap-2.5 transition-colors duration-150"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v8M4 7l3 3 3-3M2 11h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Add to Chrome
        </motion.a>
        <a
          href="#how"
          className="font-technical text-[12px] font-medium tracking-wider uppercase text-ink-muted no-underline pb-0.5 border-b border-border-base transition-colors duration-150 hover:text-ink"
        >
          See how it works
        </a>
      </motion.div>

      {/* Hero meta stats */}
      <motion.div
        variants={staggerFast}
        className="mt-10 flex gap-8"
      >
        {([["150+", "Coins covered"], ["4h", "Refresh cycle"], ["$100M+", "Marketcap filter"]] as [string, string][]).map(([num, label]) => (
          <motion.div
            key={label}
            variants={fadeUp}
            transition={easeOutFast}
            className="font-technical text-[11px] text-ink-faint tracking-[0.04em]"
          >
            <strong className="text-[20px] font-semibold text-ink mb-0.5">{num}</strong>
            {label}
          </motion.div>
        ))}
      </motion.div>

      {/* Live metric box */}
      <motion.div
        variants={fadeUp}
        transition={{ ...easeOut, delay: 0.35 }}
        className="relative mt-14 overflow-hidden rounded-md border border-signal-orange bg-orange-100 p-7"
      >
        <div
          className="mb-4 flex items-center gap-2 font-technical text-[10px] font-semibold uppercase tracking-[0.08em] text-signal-orange"
        >
          <span className="panel-dot-pulse inline-block h-2 w-2 rounded-full bg-signal-orange" />
          Live Metric
        </div>
        <div className="mb-4 grid grid-cols-2 gap-5">
          <div className="rounded border-l-[3px] border-signal-orange bg-white/40 p-4">
            <div className="text-[32px] font-bold tabular-nums text-signal-orange">{coinsAnalyzed}</div>
            <div className="mt-1.5 text-[11px] font-medium text-ink-muted">Coins analyzed today</div>
          </div>
          <div className="rounded border-l-[3px] border-signal-orange bg-white/40 p-4">
            <div className="text-[32px] font-bold tabular-nums text-signal-orange">{updatesQueue}</div>
            <div className="mt-1.5 text-[11px] font-medium text-ink-muted">Updates in queue</div>
          </div>
        </div>
        <a 
          className="flex items-center gap-2 text-[12px] italic text-signal-orange cursor-pointer hover:underline"
          href="#how"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M8 2L4 6L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Scroll to see how it works
        </a>
      </motion.div>
    </motion.div>
  )
}