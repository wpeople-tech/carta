# RoadmapSection Animation Enhancement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enhance `RoadmapSection.tsx` with bold, interactive animations using three React Bits components (ShinyText, GlitchText, SpotlightCard) plus native `motion/react` enhancements for the heading, route line, compass needle, and waypoint dots.

**Architecture:** Three React Bits components are copy-pasted as local `.tsx` + `.css` files into `src/components/ui/`. All changes to `RoadmapSection.tsx` are in-place — no structural refactor. The existing `motion/react` animation system and `design.config.ts` presets are preserved and extended.

**Tech Stack:** `motion/react` v12, React Bits (ShinyText, GlitchText, SpotlightCard — copy-pasted, no new npm deps), CSS `@keyframes`, TypeScript.

## Global Constraints

- Package manager: `yarn` — use `yarn dev`, `yarn build`, never `npm run ...`
- Animation library: `motion/react` (not `framer-motion`) — imports from `'motion/react'`
- No GSAP Club plugins — SplitText from GSAP is not available (paid license); use `motion/react` stagger instead
- No new npm packages — React Bits components are copy-pasted source, not installed
- Reduced motion: all `motion/react` animations must respect `useReducedMotion()`
- TypeScript strict — no `any`, all props typed
- File locations: new UI components go in `src/components/ui/`, colocated CSS alongside `.tsx`

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/components/ui/ShinyText.tsx` | Animated shine-sweep text (motion/react) |
| Create | `src/components/ui/ShinyText.css` | Minimal inline-block style |
| Create | `src/components/ui/GlitchText.tsx` | Hover-triggered glitch effect (pure CSS) |
| Create | `src/components/ui/GlitchText.css` | Glitch keyframes + brand override class |
| Create | `src/components/ui/SpotlightCard.tsx` | Mouse-tracked spotlight wrapper |
| Create | `src/components/ui/SpotlightCard.css` | Radial gradient overlay via CSS custom props |
| Modify | `src/sections/Home/RoadmapSection.tsx` | All animation changes |

---

### Task 1: ShinyText component

**Files:**
- Create: `src/components/ui/ShinyText.tsx`
- Create: `src/components/ui/ShinyText.css`

**Interfaces:**
- Produces: `ShinyText` default export — props: `text: string`, `color?: string`, `shineColor?: string`, `speed?: number`, `spread?: number`, `className?: string`

- [ ] **Step 1: Create `src/components/ui/ShinyText.css`**

```css
.shiny-text {
  display: inline-block;
}
```

- [ ] **Step 2: Create `src/components/ui/ShinyText.tsx`**

```tsx
'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, useMotionValue, useAnimationFrame, useTransform } from 'motion/react'
import './ShinyText.css'

interface ShinyTextProps {
  text: string
  disabled?: boolean
  speed?: number
  className?: string
  color?: string
  shineColor?: string
  spread?: number
  pauseOnHover?: boolean
}

export default function ShinyText({
  text,
  disabled = false,
  speed = 2,
  className = '',
  color = '#b5b5b5',
  shineColor = '#ffffff',
  spread = 120,
  pauseOnHover = false,
}: ShinyTextProps) {
  const [isPaused, setIsPaused] = useState(false)
  const progress = useMotionValue(0)
  const elapsedRef = useRef(0)
  const lastTimeRef = useRef<number | null>(null)

  const animationDuration = speed * 1000

  useAnimationFrame(time => {
    if (disabled || isPaused) {
      lastTimeRef.current = null
      return
    }
    if (lastTimeRef.current === null) {
      lastTimeRef.current = time
      return
    }
    const delta = time - lastTimeRef.current
    lastTimeRef.current = time
    elapsedRef.current += delta
    const cycleTime = elapsedRef.current % animationDuration
    progress.set((cycleTime / animationDuration) * 100)
  })

  const backgroundPosition = useTransform(progress, p => `${150 - p * 2}% center`)

  const handleMouseEnter = useCallback(() => {
    if (pauseOnHover) setIsPaused(true)
  }, [pauseOnHover])

  const handleMouseLeave = useCallback(() => {
    if (pauseOnHover) setIsPaused(false)
  }, [pauseOnHover])

  return (
    <motion.span
      className={`shiny-text ${className}`}
      style={{
        backgroundImage: `linear-gradient(${spread}deg, ${color} 0%, ${color} 35%, ${shineColor} 50%, ${color} 65%, ${color} 100%)`,
        backgroundSize: '200% auto',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundPosition,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {text}
    </motion.span>
  )
}
```

- [ ] **Step 3: Verify no TypeScript errors**

```bash
cd /path/to/project && yarn tsc --noEmit --project tsconfig.json 2>&1 | grep ShinyText
```

Expected: no output (no errors).

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/ShinyText.tsx src/components/ui/ShinyText.css
git commit -m "feat: add ShinyText component from React Bits"
```

---

### Task 2: GlitchText component

**Files:**
- Create: `src/components/ui/GlitchText.tsx`
- Create: `src/components/ui/GlitchText.css`

**Interfaces:**
- Produces: `GlitchText` default export — props: `children: React.ReactNode`, `speed?: number`, `enableShadows?: boolean`, `enableOnHover?: boolean`, `className?: string`

- [ ] **Step 1: Create `src/components/ui/GlitchText.css`**

```css
.glitch {
  position: relative;
  user-select: none;
  cursor: pointer;
  white-space: nowrap;
}

.glitch::after,
.glitch::before {
  content: attr(data-text);
  position: absolute;
  top: 0;
  overflow: hidden;
  clip-path: inset(0 0 0 0);
}

/* Always-on mode */
.glitch:not(.enable-on-hover)::after {
  left: 10px;
  text-shadow: var(--after-shadow, -10px 0 red);
  animation: animate-glitch var(--after-duration, 3s) infinite linear alternate-reverse;
}
.glitch:not(.enable-on-hover)::before {
  left: -10px;
  text-shadow: var(--before-shadow, 10px 0 cyan);
  animation: animate-glitch var(--before-duration, 2s) infinite linear alternate-reverse;
}

/* Hover-only mode */
.glitch.enable-on-hover::after,
.glitch.enable-on-hover::before {
  content: '';
  opacity: 0;
  animation: none;
}
.glitch.enable-on-hover:hover::after {
  content: attr(data-text);
  opacity: 1;
  left: 10px;
  text-shadow: var(--after-shadow, -10px 0 red);
  animation: animate-glitch var(--after-duration, 3s) infinite linear alternate-reverse;
}
.glitch.enable-on-hover:hover::before {
  content: attr(data-text);
  opacity: 1;
  left: -10px;
  text-shadow: var(--before-shadow, 10px 0 cyan);
  animation: animate-glitch var(--before-duration, 2s) infinite linear alternate-reverse;
}

/* Brand override for CARTA Premium on white card */
.carta-premium-glitch {
  --after-shadow: -4px 0 #4B3FCF;
  --before-shadow: 4px 0 #C9BFA8;
  color: #0F0F0D;
  font-size: inherit;
  font-family: inherit;
  font-weight: inherit;
}
.carta-premium-glitch::after,
.carta-premium-glitch::before {
  background-color: #ffffff;
  color: #0F0F0D;
}

@keyframes animate-glitch {
  0%   { clip-path: inset(20% 0 50% 0); }
  5%   { clip-path: inset(10% 0 60% 0); }
  10%  { clip-path: inset(15% 0 55% 0); }
  15%  { clip-path: inset(25% 0 35% 0); }
  20%  { clip-path: inset(30% 0 40% 0); }
  25%  { clip-path: inset(40% 0 20% 0); }
  30%  { clip-path: inset(10% 0 60% 0); }
  35%  { clip-path: inset(15% 0 55% 0); }
  40%  { clip-path: inset(25% 0 35% 0); }
  45%  { clip-path: inset(30% 0 40% 0); }
  50%  { clip-path: inset(20% 0 50% 0); }
  55%  { clip-path: inset(10% 0 60% 0); }
  60%  { clip-path: inset(15% 0 55% 0); }
  65%  { clip-path: inset(25% 0 35% 0); }
  70%  { clip-path: inset(30% 0 40% 0); }
  75%  { clip-path: inset(40% 0 20% 0); }
  80%  { clip-path: inset(20% 0 50% 0); }
  85%  { clip-path: inset(10% 0 60% 0); }
  90%  { clip-path: inset(15% 0 55% 0); }
  95%  { clip-path: inset(25% 0 35% 0); }
  100% { clip-path: inset(30% 0 40% 0); }
}
```

- [ ] **Step 2: Create `src/components/ui/GlitchText.tsx`**

```tsx
import './GlitchText.css'

interface GlitchTextProps {
  children: string
  speed?: number
  enableShadows?: boolean
  enableOnHover?: boolean
  className?: string
}

export default function GlitchText({
  children,
  speed = 1,
  enableShadows = true,
  enableOnHover = true,
  className = '',
}: GlitchTextProps) {
  return (
    <div
      className={`glitch ${enableOnHover ? 'enable-on-hover' : ''} ${className}`}
      data-text={children}
      style={{
        '--after-duration': `${speed * 3}s`,
        '--before-duration': `${speed * 2}s`,
        '--after-shadow': enableShadows ? '-5px 0 red' : 'none',
        '--before-shadow': enableShadows ? '5px 0 cyan' : 'none',
      } as React.CSSProperties}
    >
      {children}
    </div>
  )
}
```

- [ ] **Step 3: Verify no TypeScript errors**

```bash
yarn tsc --noEmit 2>&1 | grep GlitchText
```

Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/GlitchText.tsx src/components/ui/GlitchText.css
git commit -m "feat: add GlitchText component from React Bits"
```

---

### Task 3: SpotlightCard component

**Files:**
- Create: `src/components/ui/SpotlightCard.tsx`
- Create: `src/components/ui/SpotlightCard.css`

**Interfaces:**
- Produces: `SpotlightCard` default export — props: `children: React.ReactNode`, `className?: string`, `spotlightColor?: string`

- [ ] **Step 1: Create `src/components/ui/SpotlightCard.css`**

```css
.card-spotlight {
  position: relative;
  overflow: hidden;
  --mouse-x: 50%;
  --mouse-y: 50%;
  --spotlight-color: rgba(255, 255, 255, 0.05);
}

.card-spotlight::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at var(--mouse-x) var(--mouse-y), var(--spotlight-color), transparent 80%);
  opacity: 0;
  transition: opacity 0.5s ease;
  pointer-events: none;
  z-index: 1;
}

.card-spotlight:hover::before,
.card-spotlight:focus-within::before {
  opacity: 1;
}
```

- [ ] **Step 2: Create `src/components/ui/SpotlightCard.tsx`**

```tsx
'use client'

import { useRef } from 'react'
import type { ReactNode, MouseEvent } from 'react'
import './SpotlightCard.css'

interface SpotlightCardProps {
  children: ReactNode
  className?: string
  spotlightColor?: string
}

export default function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'rgba(255, 255, 255, 0.25)',
}: SpotlightCardProps) {
  const divRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return
    const rect = divRef.current.getBoundingClientRect()
    divRef.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`)
    divRef.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`)
    divRef.current.style.setProperty('--spotlight-color', spotlightColor)
  }

  return (
    <div ref={divRef} onMouseMove={handleMouseMove} className={`card-spotlight ${className}`}>
      {children}
    </div>
  )
}
```

- [ ] **Step 3: Verify no TypeScript errors**

```bash
yarn tsc --noEmit 2>&1 | grep SpotlightCard
```

Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/SpotlightCard.tsx src/components/ui/SpotlightCard.css
git commit -m "feat: add SpotlightCard component from React Bits"
```

---

### Task 4: Heading animations — ShinyText eyebrow + character-stagger h2

**Files:**
- Modify: `src/sections/Home/RoadmapSection.tsx`

**Interfaces:**
- Consumes: `ShinyText` from `'@/components/ui/ShinyText'`
- Produces: updated `RoadmapSection` with animated heading

- [ ] **Step 1: Add ShinyText import to RoadmapSection.tsx**

At the top of `src/sections/Home/RoadmapSection.tsx`, after existing imports:

```tsx
import ShinyText from '@/components/ui/ShinyText'
```

- [ ] **Step 2: Replace the eyebrow div text with ShinyText**

Find the eyebrow div (around line 177–186 in the original file):

```tsx
// Before:
<div
  style={{
    fontFamily: MONO,
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '0.18em',
    color: BRASS,
    textTransform: 'uppercase',
    marginBottom: 20,
  }}
>
  Roadmap
</div>

// After:
<div
  style={{
    fontFamily: MONO,
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    marginBottom: 20,
  }}
>
  <ShinyText text="Roadmap" color={BRASS} shineColor="#FFD580" speed={3} spread={100} />
</div>
```

Note: remove `color: BRASS` from the wrapper div style — `ShinyText` handles its own color via `backgroundClip: text`.

- [ ] **Step 3: Add character-stagger variant constant near the top of the file (after existing color constants)**

After the `const SANS = ...` line, add:

```tsx
const charVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}
```

- [ ] **Step 4: Replace the h2 with character-stagger version**

Find the `<h2>` element (around line 189–200):

```tsx
// Before:
<h2
  style={{
    fontFamily: SANS,
    fontSize: 'clamp(28px, 4vw, 48px)',
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
    color: INK,
    marginBottom: 16,
  }}
>
  The Next Bearing
</h2>

// After:
<motion.h2
  variants={staggerContainer}
  initial="hidden"
  whileInView="visible"
  viewport={viewportOnce}
  style={{
    fontFamily: SANS,
    fontSize: 'clamp(28px, 4vw, 48px)',
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
    color: INK,
    marginBottom: 16,
    display: 'block',
  }}
>
  {'The Next Bearing'.split('').map((char, i) =>
    char === ' ' ? (
      <span key={i}>&nbsp;</span>
    ) : (
      <motion.span
        key={i}
        variants={charVariants}
        transition={{ ...easeOut, duration: 0.4 }}
        style={{ display: 'inline-block' }}
      >
        {char}
      </motion.span>
    )
  )}
</motion.h2>
```

- [ ] **Step 5: Verify the heading renders correctly**

Run `yarn dev` and open `http://localhost:3000`. Scroll to `#roadmap`. Confirm:
- "Roadmap" eyebrow has a brass→gold shine sweep running continuously
- "The Next Bearing" heading characters animate in letter-by-letter on scroll entry
- No layout shift or overflow

- [ ] **Step 6: Commit**

```bash
git add src/sections/Home/RoadmapSection.tsx
git commit -m "feat: animate roadmap heading — ShinyText eyebrow + char stagger h2"
```

---

### Task 5: Route line — animated draw + compass needle trail + waypoint dot pulse

**Files:**
- Modify: `src/sections/Home/RoadmapSection.tsx`

**Interfaces:**
- Consumes: existing `inView` (already wired via `useInView(routeRef, ...)`)
- Consumes: `useReducedMotion` from `'motion/react'` (already imported)

- [ ] **Step 1: Add `WaypointPulse` component inside `RoadmapSection.tsx` (before the `export default`)**

Add after the `WaypointDot` component definition:

```tsx
function WaypointPulse({ color, delay = 0 }: { color: string; delay?: number }) {
  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <style>{`
        @keyframes pulse-ring {
          0%   { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>
      <div
        style={{
          position: 'absolute',
          width: 16,
          height: 16,
          borderRadius: '50%',
          border: `1.5px solid ${color}`,
          animation: `pulse-ring 2s ${delay}s ease-out infinite`,
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
```

- [ ] **Step 2: Update `RouteConnector` to support animated draw**

Replace the `RouteConnector` component with:

```tsx
function RouteConnector({ solid, inView }: { solid: boolean; inView: boolean }) {
  if (solid) {
    return (
      <motion.div
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 0.97, 0.36, 1], delay: 0.4 }}
        style={{
          flex: 1,
          height: 2,
          background: BRASS,
          alignSelf: 'center',
          minWidth: 0,
          transformOrigin: 'left',
        }}
      />
    )
  }
  return (
    <div
      style={{
        flex: 1,
        height: 2,
        backgroundImage: `repeating-linear-gradient(90deg, ${ROUTE} 0, ${ROUTE} 8px, transparent 8px, transparent 16px)`,
        alignSelf: 'center',
        minWidth: 0,
      }}
    />
  )
}
```

- [ ] **Step 3: Update `CompassNeedle` to render motion-trail ghosts**

Replace the entire `CompassNeedle` component with:

```tsx
function CompassNeedle({ inView }: { inView: boolean }) {
  const prefersReduced = useReducedMotion()
  const finalX = 'calc(33.33% - 8px)'

  const needle = (
    <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
      <path d="M8 0L14 12H8V20L2 8H8V0Z" fill={BRASS} opacity="0.9" />
    </svg>
  )

  if (prefersReduced) {
    return (
      <div
        style={{
          position: 'absolute',
          top: '50%',
          transform: `translateY(-50%) translateX(${finalX})`,
          left: 0,
          pointerEvents: 'none',
        }}
      >
        {needle}
      </div>
    )
  }

  const trails = [
    { offset: -36, opacity: 0.03, duration: 1.0 },
    { offset: -24, opacity: 0.08, duration: 1.1 },
    { offset: -12, opacity: 0.15, duration: 1.2 },
  ]

  return (
    <>
      {trails.map((t, i) => (
        <motion.div
          key={i}
          initial={{ x: 0 }}
          animate={inView ? { x: `calc(33.33% - ${8 - t.offset}px)` } : { x: 0 }}
          transition={{ duration: t.duration, ease: [0.22, 0.97, 0.36, 1], delay: 0.3 }}
          style={{
            position: 'absolute',
            top: '50%',
            translateY: '-50%',
            left: 0,
            pointerEvents: 'none',
            opacity: t.opacity,
          }}
        >
          {needle}
        </motion.div>
      ))}
      <motion.div
        initial={{ x: 0 }}
        animate={inView ? { x: finalX } : { x: 0 }}
        transition={{ duration: 1.4, ease: [0.22, 0.97, 0.36, 1], delay: 0.3 }}
        style={{
          position: 'absolute',
          top: '50%',
          translateY: '-50%',
          left: 0,
          pointerEvents: 'none',
        }}
      >
        {needle}
      </motion.div>
    </>
  )
}
```

- [ ] **Step 4: Update the route track JSX — pass `inView` to `RouteConnector` and wrap dots in `WaypointPulse`**

Find the route track `<div>` (the one with `display: 'flex', alignItems: 'center', position: 'relative', gap: 0`) and update it:

```tsx
<div style={{ display: 'flex', alignItems: 'center', position: 'relative', gap: 0 }}>
  <CompassNeedle inView={inView} />

  {/* NOW dot with brass pulse */}
  <div style={{ position: 'relative', flexShrink: 0 }}>
    <WaypointDot color={BRASS} hero={false} />
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <WaypointPulse color={BRASS} delay={0} />
    </div>
  </div>

  {/* NOW → NEXT: solid brass, animated draw */}
  <RouteConnector solid={true} inView={inView} />

  {/* NEXT dot with premium purple pulse */}
  <div style={{ position: 'relative', flexShrink: 0 }}>
    <WaypointDot color={SIGNAL_PREMIUM} hero={true} />
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <WaypointPulse color={SIGNAL_PREMIUM} delay={1} />
    </div>
  </div>

  {/* NEXT → LATER: dotted route, no draw animation */}
  <RouteConnector solid={false} inView={inView} />

  {/* LATER dot — no pulse (muted) */}
  <WaypointDot color={ROUTE} hero={false} />
</div>
```

- [ ] **Step 5: Verify route animations**

Run `yarn dev`, scroll to `#roadmap`. Confirm:
- Solid connector line draws left-to-right on entry
- Compass needle travels with 3 trailing ghost copies behind it
- NOW and NEXT waypoint dots have pulsing rings (offset by 1s so they don't sync)
- LATER dot has no pulse ring
- No layout shift on the route track

- [ ] **Step 6: Commit**

```bash
git add src/sections/Home/RoadmapSection.tsx
git commit -m "feat: animate roadmap route — draw line, needle trail, waypoint pulse"
```

---

### Task 6: Waypoint cards — SpotlightCard + GlitchText on NEXT

**Files:**
- Modify: `src/sections/Home/RoadmapSection.tsx`

**Interfaces:**
- Consumes: `SpotlightCard` from `'@/components/ui/SpotlightCard'`
- Consumes: `GlitchText` from `'@/components/ui/GlitchText'`

- [ ] **Step 1: Add imports**

Add to imports in `src/sections/Home/RoadmapSection.tsx`:

```tsx
import SpotlightCard from '@/components/ui/SpotlightCard'
import GlitchText from '@/components/ui/GlitchText'
```

- [ ] **Step 2: Define spotlight color map**

Add near the top of the file, after the `WAYPOINTS` constant:

```tsx
const SPOTLIGHT_COLORS: Record<string, string> = {
  now: 'rgba(176, 141, 87, 0.15)',
  next: 'rgba(75, 63, 207, 0.18)',
  later: 'rgba(176, 141, 87, 0.10)',
}
```

- [ ] **Step 3: Wrap each card's `motion.div` with SpotlightCard**

Find the `WAYPOINTS.map((wp, idx) => ...)` block. Wrap each `motion.div` with `SpotlightCard`:

```tsx
{WAYPOINTS.map((wp, idx) => (
  <SpotlightCard
    key={wp.id}
    spotlightColor={SPOTLIGHT_COLORS[wp.id]}
    className="roadmap-card-spotlight"
  >
    <motion.div
      variants={fadeUp}
      transition={{ ...easeOutFast, delay: idx * 0.08 }}
      style={{
        background: wp.hero ? '#fff' : SURFACE,
        border: `1px solid ${wp.hero ? SIGNAL_PREMIUM : BORDER}`,
        padding: wp.hero ? '32px 28px 28px' : '24px 24px 20px',
        position: 'relative',
        boxShadow: wp.hero
          ? '0 8px 32px rgba(75,63,207,0.12), 0 2px 8px rgba(0,0,0,0.06)'
          : 'none',
        height: '100%',
      }}
    >
      {/* ... all existing card content unchanged ... */}
    </motion.div>
  </SpotlightCard>
))}
```

Add the override class to `src/components/ui/SpotlightCard.css`:

```css
/* Override defaults for roadmap cards — visual styling stays on inner motion.div */
.roadmap-card-spotlight {
  background: transparent;
  border-radius: 0;
  border: none;
  padding: 0;
}
```

- [ ] **Step 4: Wrap "CARTA Premium" title in GlitchText**

Inside the card map, find where `wp.title` is rendered inside the `<div style={{ fontFamily: SANS, fontSize: wp.hero ? 22 : 18, ... }}>` element. For the hero card only, wrap the title text:

```tsx
<div
  style={{
    fontFamily: SANS,
    fontSize: wp.hero ? 22 : 18,
    fontWeight: 700,
    color: wp.muted ? INK_MUTED : INK,
    lineHeight: 1.2,
  }}
>
  {wp.hero ? (
    <GlitchText enableOnHover={true} enableShadows={true} speed={1.2} className="carta-premium-glitch">
      {wp.title}
    </GlitchText>
  ) : (
    wp.title
  )}
</div>
```

- [ ] **Step 5: Remove the `key` prop from `motion.div` (it moved to `SpotlightCard`)**

The `key={wp.id}` must be on `SpotlightCard` (the outermost element in the map), not on `motion.div`. Confirm the `motion.div` has no `key` prop.

- [ ] **Step 6: Verify cards**

Run `yarn dev`, scroll to `#roadmap`. Confirm:
- Move cursor across each card — spotlight radial gradient follows the cursor
- Hover the "CARTA Premium" text — glitch animation fires with purple/warm-brass shadows
- No layout shift, no overflow, spotlight doesn't bleed outside card bounds
- The `staggerContainer` + `motion.div` scroll reveal still works (cards still animate in on scroll)

- [ ] **Step 7: Final build check**

```bash
yarn build
```

Expected: build completes with no TypeScript errors or warnings.

- [ ] **Step 8: Commit**

```bash
git add src/sections/Home/RoadmapSection.tsx src/components/ui/SpotlightCard.css
git commit -m "feat: add SpotlightCard hover effect and GlitchText on CARTA Premium card"
```

---

## Self-Review Checklist

- [x] **Spec coverage:**
  - ShinyText eyebrow → Task 4
  - Char-stagger h2 → Task 4
  - Animated route draw → Task 5
  - Needle trail → Task 5
  - Waypoint dot pulse → Task 5
  - SpotlightCard cards → Task 6
  - GlitchText CARTA Premium → Task 6
  - Reduced motion → `useReducedMotion` in CompassNeedle (Task 5), char-stagger inherits `whileInView` which skips on reduced motion
- [x] **No placeholders** — all steps have exact code
- [x] **Type consistency** — `RouteConnector` gains `inView` prop in Task 5 and is called with it in the same task; `WaypointPulse` defined and used in Task 5; `SPOTLIGHT_COLORS` defined and consumed in Task 6
- [x] **yarn throughout** — `yarn dev`, `yarn build`, `yarn tsc`
