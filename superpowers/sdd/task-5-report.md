# Task 5 Report: Route Animation Enhancement

**Status:** DONE  
**Commit:** b8f606a — feat: animate roadmap route — draw line, needle trail, waypoint pulse  
**TypeScript:** `yarn tsc --noEmit` — 0 errors

## Changes Made

### Step 1: WaypointPulse component
Added before `WaypointDot`. Renders an absolutely-positioned pulse ring div with `@keyframes pulse-ring` injected via a `<style>` tag inside the component. React deduplicates these in SSR/hydration.

### Step 2: RouteConnector — animated draw
Updated signature to `{ solid: boolean; inView: boolean }`. The solid connector is now a `motion.div` with `scaleX: 0 → 1` on inView (duration 0.8s, delay 0.4s, ease bezier). Dashed connector unchanged (passes inView but ignores it).

### Step 3: CompassNeedle — trail ghosts
Replaced single motion.div with 3 ghost trails + main needle:
- Trail offsets: -36, -24, -12px (opacity 0.03, 0.08, 0.15; durations 1.0, 1.1, 1.2s)
- x targets: `calc(33.33% - 44px)`, `calc(33.33% - 32px)`, `calc(33.33% - 20px)`
- Main needle: `calc(33.33% - 8px)` at 1.4s
- prefersReduced path preserved (static div)

### Step 4: Route track JSX
- NOW dot wrapped in relative container with WaypointPulse (BRASS, delay=0)
- NEXT dot wrapped in relative container with WaypointPulse (SIGNAL_PREMIUM, delay=1)
- LATER dot left bare (no pulse)
- Both RouteConnectors now receive `inView={inView}`
