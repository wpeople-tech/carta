'use client';

import { easeOutFast, fadeIn, staggerContainer } from "@/design.config";
import { motion } from "motion/react";

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