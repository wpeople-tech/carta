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
    </motion.nav>
  )
}