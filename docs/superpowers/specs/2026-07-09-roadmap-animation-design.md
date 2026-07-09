# RoadmapSection Animation Enhancement

**Date:** 2026-07-09  
**Scope:** `src/sections/Home/RoadmapSection.tsx`  
**Goal:** Make the roadmap section bold & expressive with React Bits components — interactive cursor-driven spotlight on cards, glitch hover on the hero card title, shiny sweep on the eyebrow, character-stagger on the heading, and a motion-trail compass needle with animated route draw.

---

## Context

The current `RoadmapSection` uses standard `motion/react` scroll-reveal variants (`fadeUp`, `staggerContainer`) shared across all Home sections. The animations are functional but passive — everything just fades up. The section needs to feel more alive and interactive, especially around the hero "NEXT / CARTA Premium" card, to match the premium positioning.

---

## New Files

Three React Bits components are copy-pasted into `src/components/ui/` as TypeScript files with colocated CSS. No npm installs required — ShinyText already uses `motion/react` (installed), GlitchText and SpotlightCard are pure CSS+React.

| File | Source |
|------|--------|
| `src/components/ui/ShinyText.tsx` | React Bits ShinyText (motion/react) |
| `src/components/ui/ShinyText.css` | Colocated styles |
| `src/components/ui/GlitchText.tsx` | React Bits GlitchText (pure CSS) |
| `src/components/ui/GlitchText.css` | Colocated styles, brand colors |
| `src/components/ui/SpotlightCard.tsx` | React Bits SpotlightCard (CSS custom props) |
| `src/components/ui/SpotlightCard.css` | Colocated styles |

---

## Modified Files

`src/sections/Home/RoadmapSection.tsx` — all changes are in-place, no structural rework.

---

## Animation Spec

### 1. Heading — Eyebrow "Roadmap"

Replace the plain `<div>` text with `<ShinyText>`:

```tsx
<ShinyText
  text="Roadmap"
  color={BRASS}
  shineColor="#FFD580"
  speed={3}
  spread={100}
/>
```

Continuous left-to-right brass→gold sweep. The `fontFamily`, `fontSize`, `letterSpacing`, `textTransform` styles stay on the wrapper div.

### 2. Heading — "The Next Bearing" h2

Replace the `<h2>` text with a character-by-character stagger using `motion/react`. No GSAP SplitText (requires paid Club license).

Implementation: split `"The Next Bearing"` into an array of characters inside the component, render each as `motion.span` with `display: inline-block`. Wrap in a `motion.h2` that uses `staggerContainer` variant (`staggerChildren: 0.03`). Each char animates `{ opacity: 0, y: 20 } → { opacity: 1, y: 0 }` with `easeOut` transition. Spaces rendered as `&nbsp;` with no animation.

Triggered by `whileInView` + `viewportOnce` (consistent with the rest of the section).

### 3. Route Line — Animated Draw

The solid NOW→NEXT brass connector currently renders at full width immediately. Change to:

- Wrap the connector `<div>` in a `motion.div`
- `initial={{ scaleX: 0 }}`, `animate={inView ? { scaleX: 1 } : { scaleX: 0 }}`
- `transformOrigin: 'left'`, duration `0.8s`, `easeOut`, `delay: 0.4`

This makes the line "draw" left-to-right before the compass needle starts its travel.

### 4. Route Line — Compass Needle Trail

The current `CompassNeedle` renders one `motion.div` traveling from `x: 0` to `x: calc(33.33% - 8px)`.

Extend to render 3 ghost trails behind the main needle:

```
Trail[0]: animates to finalX - 36px, opacity: 0.03, duration: 1.0s
Trail[1]: animates to finalX - 24px, opacity: 0.08, duration: 1.1s  
Trail[2]: animates to finalX - 12px, opacity: 0.15, duration: 1.2s
Main:     animates to finalX,         opacity: 0.9,  duration: 1.4s
```

All use the same `[0.22, 0.97, 0.36, 1]` cubic bezier with `delay: 0.3`. The result is a speed-blur trail that makes the needle feel like it's cutting through air. Each trail is the same SVG, `pointer-events: none`.

### 5. Route Line — Waypoint Dot Pulse

The NEXT (hero) waypoint dot and the NOW dot get a CSS pulse ring. Add a `WaypointPulse` wrapper component using CSS animation:

```tsx
// Renders the dot + an absolutely-positioned pulse ring sibling
// The ring: border-radius 50%, border 1px solid color, 
// animates scale 1→2 + opacity 0.6→0 on a 2s infinite loop
```

NOW dot: pulse in brass (`#B08D57`), delay `0s`  
NEXT dot: pulse in premium purple (`#4B3FCF`), delay `1s` (offset so they don't sync)  
LATER dot: no pulse (muted)

### 6. Waypoint Cards — SpotlightCard

All three `motion.div` cards are wrapped with `SpotlightCard`. The `motion.div` moves inside SpotlightCard (SpotlightCard is the outer shell for mouse tracking, motion.div is the inner content layer).

Spotlight colors:
- NOW card: `rgba(176, 141, 87, 0.15)` (brass)
- NEXT card: `rgba(75, 63, 207, 0.18)` (premium purple, slightly stronger)
- LATER card: `rgba(176, 141, 87, 0.10)` (brass, dimmer — it's muted)

The SpotlightCard `.card-spotlight` default styles (dark background, border-radius) are overridden: `background: transparent`, `border-radius: 0`, `border: none`, `padding: 0` — all card visual styling stays on the inner `motion.div`.

### 7. NEXT Card — GlitchText on Title

The "CARTA Premium" title `<div>` is wrapped in `GlitchText`:

```tsx
<GlitchText
  enableOnHover={true}
  enableShadows={true}
  speed={1.2}
  className="carta-premium-glitch"
>
  CARTA Premium
</GlitchText>
```

Add to `src/components/ui/GlitchText.css`:
```css
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
  background-color: #ffffff; /* match NEXT card white background for clip-path reveal */
  color: #0F0F0D;
}
```

---

## Reduced Motion

All new `motion/react` animations already inherit the `useReducedMotion` check in `CompassNeedle`. The trail ghosts and route draw are also gated behind the same check. SpotlightCard mouse-tracking is CSS-only and non-distracting — no change needed. GlitchText's CSS animation is continuous only on hover, acceptable even with reduced motion preference (it requires deliberate user action).

---

## Verification

1. Run `yarn dev`, open `http://localhost:3000` and scroll to `#roadmap`
2. Check eyebrow: brass→gold shine sweeps continuously on "Roadmap"
3. Check heading: characters animate in left-to-right on scroll entry
4. Check route: connector line draws left-to-right, then needle travels with trail, waypoint dots pulse
5. Check cards: move cursor across each card — spotlight follows. Hover NEXT card title — glitch fires
6. Check reduced motion: set `prefers-reduced-motion: reduce` in DevTools → needle snaps to position, route draws instantly, char stagger skipped
7. Verify no console errors, no TypeScript errors (`npm run build`)
