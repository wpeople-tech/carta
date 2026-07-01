'use client'

import TextType from "@/components/TextType";
import { easeOut, easeOutFast, fadeUp, slideFromLeft, staggerContainer, staggerFast } from "@/design.config";
import { motion } from "motion/react";

export default function LeftHeroSection({ dark = false, centered = false }: { dark?: boolean; centered?: boolean }) {
  const textColor = dark ? '#F5F4F0' : undefined
  const mutedColor = dark ? 'rgba(245,244,240,0.75)' : undefined
  const alignClass = centered ? 'text-center' : 'text-center md:text-start'
  const justifyClass = centered ? 'justify-center' : 'justify-start'

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        variants={slideFromLeft}
        transition={{ ...easeOut, delay: 0.1 }}
        className={`font-technical font-medium tracking-[0.12em] uppercase text-signal-orange mb-5 flex items-center gap-2 md:text-xl ${alignClass} ${justifyClass}`}
      >
        {!centered && <span className="hidden md:inline-block h-0.5 w-10 bg-signal-orange" />}
        Cartography Trading Agent
      </motion.div>

      <div style={textColor ? { color: textColor } : undefined}>
        <TextType
          text={["Your Chart Finally Has A Navigator"]}
          typingSpeed={40}
          pauseDuration={1500}
          showCursor
          cursorCharacter="_"
          deletingSpeed={40}
          variableSpeed={{ min: 60, max: 120 }}
          cursorBlinkDuration={0.5}
          className={`text-3xl md:text-5xl font-semibold mb-4 md:mb-6 min-h-20 md:min-h-24 font-technical tracking-tighter ${alignClass}`}
        />
      </div>

      <motion.p
        variants={fadeUp}
        transition={{ ...easeOut, delay: 0.2 }}
        className={`font-reading text-[17px] leading-[1.65] mb-10 max-w-110 ${centered ? 'mx-auto' : ''}`}
        style={{ color: mutedColor ?? undefined }}
      >
        CARTA reads every crypto chart you open in TradingView. Signal, levels, trade setup.
        Already there when you arrive. Powered by Claude via MCP.
      </motion.p>

      <motion.div
        variants={fadeUp}
        transition={{ ...easeOut, delay: 0.25 }}
        className={`flex items-center gap-5 ${centered ? 'justify-center' : ''}`}
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
          className="font-technical text-[12px] font-medium tracking-wider uppercase no-underline pb-0.5 border-b transition-colors duration-150"
          style={{ color: mutedColor ?? undefined, borderColor: dark ? 'rgba(245,244,240,0.3)' : undefined }}
        >
          See how it works
        </a>
      </motion.div>

      {/* Hero meta stats */}
      <motion.div variants={staggerFast} className={`mt-10 flex gap-8 ${centered ? 'justify-center' : ''}`}>
        {([["150+", "Coins covered"], ["4h", "Refresh cycle"], ["$100M+", "Marketcap filter"]] as [string, string][]).map(([num, label]) => (
          <motion.div
            key={label}
            variants={fadeUp}
            transition={easeOutFast}
            className="font-technical text-[11px] tracking-[0.04em]"
            style={{ color: mutedColor ?? undefined }}
          >
            <strong className="block text-[20px] font-semibold mb-0.5" style={{ color: textColor ?? undefined }}>{num}</strong>
            {label}
          </motion.div>
        ))}
      </motion.div>

    </motion.div>
  )
}