# CARTA x Fable 5 — Roadmap Section Dev Brief

For: cartatrade.tech landing page, new "Roadmap" section
Note: color/type tokens below are a proposed direction built on CARTA's existing cartography identity. If they clash with the current design system on the live site, swap in the real tokens and keep the layout/signature concept.

---

## 1. Design Concept

**The idea:** the roadmap isn't a bulleted list, it's a route on a chart. Three waypoints (Now / Next / Later), connected by a plotted course, like a voyage log. This isn't decoration, the numbering and the connecting line are the actual content, since a roadmap genuinely is a sequence.

### Token System

**Color** (4-6 named hex, cartography/nautical direction):
- `--carta-parchment: #F3EEE3` — background, aged chart paper
- `--carta-ink: #1F2622` — primary text, deep chart-ink green-black
- `--carta-brass: #B08D57` — current brand accent, waypoints already live
- `--carta-signal: #4B3FCF` — new accent, reserved only for Fable 5 / Premium elements. Deliberately distinct from brass so the eye reads "this is the new instrument," not "same thing, different label."
- `--carta-route: #C9BFA8` — the connecting line/dotted path between waypoints
- `--carta-alert: #B4482E` — error/insufficient-balance states only

**Type:**
- Display: a slab or engraved-style serif (e.g. "Fraunces" or "Cormorant" at heavier weights) for the section headline, evokes ship's log lettering, used only for the headline and waypoint titles, never body copy
- Body: a clean grotesk (e.g. "Inter" or whatever CARTA already runs) for descriptions
- Utility/data: a monospace (e.g. "JetBrains Mono") for anything numeric: the token threshold, the coverage count ("Top 30"), coin symbols. Coordinates should look like coordinates.

**Layout concept:**
```
[ROADMAP eyebrow, mono, letterspaced]

The Next Bearing
[hyped subhead, 1-2 lines]

●───────────○┄┄┄┄┄┄┄┄┄○
NOW          NEXT         LATER
Core Engine  CARTA        Extension
             Premium      Rollout
             (Fable 5)
```
The route line between waypoint 1 and 2 is solid (shipped). Between 2 and 3 it's dotted (planned). This alone communicates status without needing a "status" label.

**Signature element:** on scroll into view, a small compass-needle or route marker animates along the line from waypoint 1 toward wherever the current stage sits, then stops. One animation, not three. Respect `prefers-reduced-motion` and freeze on the final state.

---

## 2. Section Copy (hyped, ready to drop in)

**Eyebrow:** ROADMAP

**Headline:** The Next Bearing

**Subhead:**
> CARTA is charting new waters. The reasoning engine behind every call is moving to Claude Fable 5, Anthropic's newest and most capable model, Anthropic's newest generation of frontier reasoning. This is the sharpest CARTA has ever read a chart.

**Waypoint 1 — NOW (solid line, brass)**
> **Core Engine**
> Live across top pairs. TA-Lib and scipy clustering under the hood, every call validated against hard assertions before it reaches you.

**Waypoint 2 — NEXT (signal color, the hero waypoint)**
> **CARTA Premium — Powered by Claude Fable 5**
> The reasoning layer gets a new engine. Multi-timeframe confluence. Confidence scoring on every call. Reasoning behind every entry, stop, and target, not just the numbers.
> Top 30 pairs by market cap. $CARTA holders only.
> [Get Access →]

**Waypoint 3 — LATER (dotted line, muted)**
> **On Your Chart**
> Premium reasoning ships inside the CARTA Chrome extension. Live on TradingView. No second screen, no tab switching.

---

## 3. Token-Gating — How Holder Access Actually Works

This is the real mechanism behind "$CARTA holders only," write it so it's actually true when it ships.

### Flow

```
1. User clicks "Connect Wallet" on /premium
   → Solana wallet adapter (Phantom / Solflare / Backpack)

2. Sign-in-with-wallet: user signs a message (no funds move,
   pure ownership proof), not a transaction
   → e.g. @solana/wallet-adapter + a nonce-based challenge

3. Backend verifies signature, then checks $CARTA balance:
   → getTokenAccountsByOwner filtered by $CARTA mint address
   → Recommend Helius or QuickNode RPC over public RPC for
     reliability at any real traffic volume

4. Compare balance to MIN_HOLD_THRESHOLD (env-configurable,
   not hardcoded, since this number will likely get tuned)

5. If eligible:
   → Issue short-lived JWT / session cookie scoped to wallet
     address, marks user "premium" for the session
   → Cache the eligibility check (e.g. 15-30 min) so you're
     not hammering RPC on every page load

6. Gate premium routes/components server-side on that session,
   not just client-side hiding (client-side-only gating is
   trivially bypassed by reading the API response directly)
```

### Product decision to make explicitly, not by default

**Re-verification cadence.** A user can qualify, get the session token, then sell the $CARTA right after. Decide on purpose:
- Re-check balance every N minutes during an active session, or
- Re-check on every new session/login only

Neither is wrong, but pick one deliberately rather than letting it fall out of whatever's easiest to build, since it directly affects whether "holders only" is actually true at all times or just at the moment of connecting.

### DB additions
```sql
premium_access (
  wallet_address TEXT PRIMARY KEY,
  last_verified_at TIMESTAMP,
  last_balance NUMERIC,
  session_expires_at TIMESTAMP
)
```

### Frontend states (write these in CARTA's voice, not a generic error tone)

- **Not connected:** "Connect a wallet to check your bearing." + Connect button
- **Connected, under threshold:** "You're holding [X] $CARTA. [Threshold] gets you Premium." + link to acquire, show the gap not just a wall
- **Connected, eligible:** unlock immediately, no extra click
- **RPC/verification error:** "Couldn't confirm your holdings. Try again." + retry button, never a silent fail
- **Session expired mid-browse:** re-verify quietly in the background before showing a re-connect prompt, don't kick the user out abruptly if it can be avoided

---

## 4. Notes for the dev

- Confirm actual `MIN_HOLD_THRESHOLD` and refresh cadence before this section ships publicly, both appear in copy above as placeholders implicitly (the number itself isn't written in, intentionally, fill in once locked)
- If the current site already uses a different type/color system, treat section 1 as a proposal to reconcile against, not a mandate
- The waypoint 2 card is the one that should get the visual weight (bigger, colored, maybe slightly elevated/shadowed vs the other two), it's the actual news
