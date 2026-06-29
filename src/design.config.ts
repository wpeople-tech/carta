import { Transition } from "motion/react";

// ─── Animation variants ───────────────────────────────────────────────────────
export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const slideFromRight = {
  hidden: { opacity: 0, x: 48 },
  visible: { opacity: 1, x: 0 },
};

export const slideFromLeft = {
  hidden: { opacity: 0, x: -32 },
  visible: { opacity: 1, x: 0 },
};

export const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

export const staggerFast = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0 } },
};

export const easeOut: Transition<any> = { ease: [0.22, 0.97, 0.36, 1], duration: 0.55 };
export const easeOutFast: Transition<any> = { ease: [0.22, 0.97, 0.36, 1], duration: 0.4 };

export const viewportOnce = { once: true, margin: "-60px" };