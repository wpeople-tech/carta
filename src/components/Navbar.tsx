'use client';

import { easeOutFast, fadeIn, staggerContainer } from "@/design.config";
import { motion } from "motion/react";
import { useState } from "react";
import Link from "next/link";

const CA = "5wbeGDwCUCgmJSBVGVc6FLcmMMQVirrCsUSsBPYupump";

interface NavLink {
  href: string;
  label: string;
}

const navLinks: NavLink[] = [
  {
    href: "#how",
    label: "How it works",
  },
  {
    href: "#features",
    label: "Features",
  },
  {
    href: "#mcp",
    label: "Claude via MCP",
  },
  {
    href: "#lore",
    label: "The Territory",
  }
]

function CaButton() {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(CA).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <motion.button
      onClick={handleCopy}
      className="hidden md:flex items-center gap-2 font-technical cursor-pointer text-xs font-medium text-ink-muted border border-border-base px-3 py-2 uppercase hover:border-ink hover:text-ink"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.35, duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      style={{ transition: "color 0.15s, border-color 0.15s" }}
      title={CA}
    >
      <span>CA: {CA.slice(0, 6)}…{CA.slice(-4)}</span>
      {copied ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </motion.button>
  );
}

export default function Navbar() {
  return (
    <motion.nav
      initial={{
        y: -20,
        opacity: 0
      }}
      animate={{
        y: 0,
        opacity: 1
      }}
      transition={{
        duration: 0.45,
        ease: "easeOut"
      }}
      className="fixed top-0 left-0 right-0 z-100 flex items-center justify-between p-4 bg-background border border-border-base"
    >
      <a
        href="#"
        className="font-technical text-xl font-semibold text-ink"
      >
        CARTA<span className="text-signal-orange">.</span>
      </a>
      <motion.ul
        className="hidden md:flex gap-8 m-0 p-0"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {navLinks.map((item, idx) => (
          <motion.li
            key={idx}
            variants={fadeIn}
            transition={easeOutFast}
          >
            <a
              href={item.href}
              className="nav-link-hover text-sm font-technical font-medium text-ink-muted uppercase"
              style={{ transition: "color 0.15s" }}
            >
              {item.label}
            </a>
          </motion.li>
        )
        )}
      </motion.ul>

      <div className="flex gap-x-3 items-center">
        <CaButton />
        <motion.a
          href="https://x.com/cartatrade"
          target="_blank"
          rel="noopener noreferrer"
          className="text-ink-muted hover:text-ink"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.3 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          style={{ transition: "color 0.15s" }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.26 5.632 5.904-5.632Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </motion.a>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.3 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Link
            href="/premium"
            className="font-technical font-semibold text-xs uppercase px-4 py-2 inline-block"
            style={{
              color: '#4B3FCF',
              border: '1px solid #4B3FCF',
              letterSpacing: '0.08em',
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = '#4B3FCF'
              ;(e.currentTarget as HTMLElement).style.color = '#fff'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'transparent'
              ;(e.currentTarget as HTMLElement).style.color = '#4B3FCF'
            }}
          >
            Premium
          </Link>
        </motion.div>
        <motion.a
          href="#install"
          className="btn-ink font-technical font-semibold text-background bg-ink px-6 py-2 uppercase inline-block"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.3 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          style={{ transition: "background 0.15s" }}
        >
          Install Free
        </motion.a>
      </div>
    </motion.nav>
  )
}