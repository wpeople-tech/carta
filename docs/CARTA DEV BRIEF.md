# CARTA — Chrome Extension Developer Brief
**Cartography Trading Agent**
Version: 1.0 | Status: Ready for Development

---

## 1. OVERVIEW

CARTA adalah Chrome Extension yang inject sebuah panel analisis teknikal langsung ke dalam halaman TradingView. Saat user membuka chart crypto manapun, panel CARTA muncul otomatis di sisi kanan chart, menampilkan signal, S/R levels, indicator values, trade setup, dan AI narrative dari Claude.

**Yang penting dipahami dari awal:**
- Extension ini TIDAK melakukan API call ke Claude saat user buka chart
- Semua analisis sudah di-generate sebelumnya oleh backend (cron job setiap 4 jam) dan disimpan di Supabase
- Extension hanya: detect symbol → query Supabase → render UI
- Hasilnya terasa instant dan "real-time" karena tidak ada latency AI

---

## 2. ARSITEKTUR SISTEM

```
┌─────────────────────────────────────────────────────────┐
│                    BACKEND (sudah ada di MCPTrade)       │
│                                                          │
│  CoinGecko API                                           │
│       │ filter marketcap > $100M                         │
│       ↓                                                  │
│  Claude Sonnet (via Anthropic API + MCP)                 │
│       │ generate analisis per coin                       │
│       ↓                                                  │
│  Supabase PostgreSQL                                     │
│       │ simpan hasil analisis                            │
│       ↓                                                  │
│  Vercel Cron Job (setiap 4 jam)                          │
│       │ trigger re-generate semua coin                   │
└─────────────────────────────────────────────────────────┘
                         │
                         │ Supabase REST API (public read)
                         ↓
┌─────────────────────────────────────────────────────────┐
│                  CHROME EXTENSION (yang dibangun)        │
│                                                          │
│  content.js                                              │
│       │ inject ke tradingview.com/*                      │
│       │ detect symbol dari URL / DOM                     │
│       │ query Supabase                                   │
│       ↓                                                  │
│  panel.js + panel.css                                    │
│       │ render CARTA panel UI                            │
│       │ inject sebagai sidebar di atas chart             │
└─────────────────────────────────────────────────────────┘
```

---

## 3. STRUKTUR FILE EXTENSION

```
carta-extension/
├── manifest.json
├── content.js          ← script utama yang inject ke TradingView
├── panel.css           ← styling panel CARTA
├── panel.html          ← template HTML panel (opsional, bisa inline)
├── background.js       ← service worker (minimal, hanya untuk config)
├── icons/
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png
└── lib/
    └── supabase.js     ← Supabase JS client (bundle atau CDN)
```

---

## 4. MANIFEST.JSON

```json
{
  "manifest_version": 3,
  "name": "CARTA — Cartography Trading Agent",
  "version": "1.0.0",
  "description": "AI-powered crypto technical analysis on TradingView. Powered by Claude via MCP.",
  "icons": {
    "16": "icons/icon-16.png",
    "48": "icons/icon-48.png",
    "128": "icons/icon-128.png"
  },
  "permissions": [
    "storage",
    "activeTab"
  ],
  "host_permissions": [
    "https://www.tradingview.com/*",
    "https://*.supabase.co/*"
  ],
  "content_scripts": [
    {
      "matches": ["https://www.tradingview.com/chart/*"],
      "js": ["lib/supabase.js", "content.js"],
      "css": ["panel.css"],
      "run_at": "document_idle"
    }
  ],
  "background": {
    "service_worker": "background.js"
  },
  "action": {
    "default_icon": "icons/icon-48.png",
    "default_title": "CARTA"
  }
}
```

---

## 5. SYMBOL DETECTION LOGIC

TradingView URL format yang perlu di-handle:

```
https://www.tradingview.com/chart/?symbol=BINANCE:BTCUSDT
https://www.tradingview.com/chart/XXXXXX/?symbol=BYBIT:ETHUSDT
https://www.tradingview.com/chart/?symbol=BTCUSDT  (tanpa exchange prefix)
```

Logic detection di `content.js`:

```javascript
function detectSymbol() {
  // Method 1: Dari URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const symbolParam = urlParams.get('symbol');

  if (symbolParam) {
    const symbol = symbolParam.includes(':')
      ? symbolParam.split(':')[1]   // strip exchange prefix: "BINANCE:BTCUSDT" → "BTCUSDT"
      : symbolParam;

    // Hanya proses jika ending USDT
    if (symbol.endsWith('USDT')) {
      return symbol; // return "BTCUSDT"
    }
  }

  // Method 2: Fallback dari DOM (jika URL tidak ada symbol param)
  // TradingView render symbol di title bar
  const titleEl = document.querySelector('[data-symbol-short]');
  if (titleEl) {
    const sym = titleEl.getAttribute('data-symbol-short');
    if (sym && sym.endsWith('USDT')) return sym;
  }

  return null; // symbol tidak ditemukan / bukan USDT pair
}

// Watch untuk navigasi dalam SPA TradingView (user ganti chart tanpa reload)
function watchSymbolChange(callback) {
  let lastSymbol = null;

  // Check setiap 1 detik (TradingView adalah SPA)
  setInterval(() => {
    const current = detectSymbol();
    if (current !== lastSymbol) {
      lastSymbol = current;
      callback(current);
    }
  }, 1000);
}
```

---

## 6. SUPABASE QUERY

Extension query Supabase langsung via REST API (public anon key, read-only).

### Credentials yang dibutuhkan dari backend team:
- `SUPABASE_URL` — contoh: `https://xxxxx.supabase.co`
- `SUPABASE_ANON_KEY` — public key, aman untuk di-embed di extension

### Query utama:

```javascript
const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';

async function fetchAnalysis(tvSymbol) {
  // tvSymbol = "BTCUSDT"

  const url = `${SUPABASE_URL}/rest/v1/rpc/get_latest_analysis`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify({ tv_symbol: tvSymbol })
  });

  if (!response.ok) return null;
  return await response.json();
}
```

### Alternatif tanpa RPC (query langsung ke view):

```javascript
async function fetchAnalysis(tvSymbol) {
  const url = new URL(`${SUPABASE_URL}/rest/v1/latest_analysis`);
  url.searchParams.set('tradingview_sym', `eq.${tvSymbol}`);
  url.searchParams.set('select', '*,support_resistance(*),indicators(*),trade_setups(*)');
  url.searchParams.set('limit', '1');

  const response = await fetch(url, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    }
  });

  const data = await response.json();
  return data[0] || null;
}
```

### Shape of data yang di-return:

```json
{
  "id": "uuid",
  "coin_id": "uuid",
  "symbol": "BTC",
  "tradingview_sym": "BTCUSDT",
  "name": "Bitcoin",
  "generated_at": "2025-06-22T14:00:00Z",
  "expires_at": "2025-06-22T18:00:00Z",
  "signal": "BUY",
  "confidence_pct": 82,
  "weekly_bias": "BULLISH",
  "claude_call": "Price is holding above weekly structure with clean volume...",
  "support_resistance": [
    { "level_type": "RESISTANCE", "strength": "STRONG", "price": 109400, "confluence_note": "Weekly flip zone", "sort_order": 1 },
    { "level_type": "RESISTANCE", "strength": "WEAK",   "price": 105800, "confluence_note": null, "sort_order": 2 },
    { "level_type": "SUPPORT",    "strength": "WEAK",   "price": 101400, "confluence_note": null, "sort_order": 3 },
    { "level_type": "SUPPORT",    "strength": "STRONG", "price": 97200,  "confluence_note": "Historical support", "sort_order": 4 }
  ],
  "indicators": {
    "rsi_value": 58.4,
    "rsi_status": "NEUTRAL",
    "macd_cross": "BULLISH",
    "price_vs_ema20": "ABOVE",
    "price_vs_ema200": "ABOVE",
    "bb_status": "NORMAL",
    "atr_value": 1840.5,
    "volume_status": "ABOVE_AVG"
  },
  "trade_setups": [
    {
      "direction": "LONG",
      "grade": "A",
      "conviction": "HIGH",
      "entry_zone_low": 101200,
      "entry_zone_high": 102000,
      "stop_tight": 99800,
      "stop_safe": 98500,
      "risk_pct_tight": 1.4,
      "risk_pct_safe": 2.8,
      "tp1_price": 105800,
      "tp1_rr": 3.8,
      "tp2_price": 109400,
      "tp2_rr": 7.4,
      "tp3_price": 115000,
      "tp3_rr": 12.1,
      "trigger_note": "Wait for 4H candle close above $102,000",
      "invalidation": "4H close below $99,800",
      "setup_note": null
    },
    {
      "direction": "SHORT",
      "grade": "B",
      "conviction": "MEDIUM",
      "entry_zone_low": 109000,
      "entry_zone_high": 109500,
      "stop_tight": 110200,
      "stop_safe": 111000,
      "risk_pct_tight": 0.9,
      "risk_pct_safe": 1.8,
      "tp1_price": 105800,
      "tp1_rr": 2.8,
      "tp2_price": 101400,
      "tp2_rr": 5.9,
      "tp3_price": null,
      "tp3_rr": null,
      "trigger_note": "4H bearish rejection wick inside the red box",
      "invalidation": "4H close above $110,200",
      "setup_note": "Counter to daily bias. Half size only."
    }
  ]
}
```

---

## 7. PANEL UI — LAYOUT & DESIGN

### Posisi Panel

Panel muncul sebagai **fixed sidebar di sisi kanan chart**, menempel di dalam TradingView layout, bukan floating di atas konten. Inject sebagai DOM element yang di-append ke body TradingView.

```
┌─────────────────────────────────┬──────────────────────┐
│                                 │  ● CARTA    BTCUSDT  │
│                                 │──────────────────────│
│         TradingView Chart       │  ▲ BUY          82%  │
│                                 │──────────────────────│
│                                 │  S/R · Daily         │
│                                 │  ── Strong Res       │
│                                 │  ── Weak Res         │
│                                 │  ● CURRENT           │
│                                 │  ── Weak Sup         │
│                                 │  ── Strong Sup       │
│                                 │──────────────────────│
│                                 │  Indicators          │
│                                 │  RSI · MACD · EMA   │
│                                 │──────────────────────│
│                                 │  Trade Setup · Long  │
│                                 │  Entry / Stop / TP   │
│                                 │──────────────────────│
│                                 │  CARTA's Call        │
│                                 │  [AI narrative]      │
│                                 │──────────────────────│
│                                 │  Generated 2h ago    │
└─────────────────────────────────┴──────────────────────┘
```

Panel width: **280px** fixed. Tinggi: full viewport height. Scrollable di dalam panel jika konten panjang.

### Toggle Button

Ada tombol kecil di kanan chart untuk show/hide panel:
```
[◀ CARTA]   ← visible saat panel terbuka
[▶ CARTA]   ← visible saat panel tertutup
```

State tersimpan di `chrome.storage.local` (remember last position).

---

## 8. DESIGN TOKENS

```css
:root {
  /* Background & Surface */
  --carta-bg:         #F5F4F0;
  --carta-surface:    #EDECEA;
  --carta-surface-2:  #E4E2DE;

  /* Borders */
  --carta-border:     #D0CEC9;
  --carta-border-2:   #B8B5AF;

  /* Text */
  --carta-ink:        #0F0F0D;
  --carta-ink-muted:  #6B6860;
  --carta-ink-faint:  #9C9990;

  /* Brand */
  --carta-signal:     #FF6B00;   /* orange — MCPTrade brand */
  --carta-signal-dim: #FF6B0018;

  /* Signal colors */
  --carta-green:      #1A7A4A;
  --carta-green-dim:  #1A7A4A18;
  --carta-red:        #C0392B;
  --carta-red-dim:    #C0392B18;

  /* Typography */
  --carta-mono: 'JetBrains Mono', 'Courier New', monospace;
  --carta-sans: 'Inter', -apple-system, sans-serif;

  /* Sizing */
  --carta-panel-width: 280px;
  --carta-radius: 0px;   /* NO border radius — sharp edges, premium feel */
}
```

### Typography Rules

| Element | Font | Size | Weight |
|---|---|---|---|
| Panel header | Mono | 11px | 600 |
| Section labels | Mono | 10px | 600 |
| Signal badge | Mono | 13px | 600 |
| S/R prices | Mono | 12px | 500 |
| Indicator values | Mono | 12px | 400 |
| Trade numbers | Mono | 11px | 500 |
| CARTA's Call | Sans | 12px | 400 |
| Freshness label | Mono | 10px | 400 |

---

## 9. PANEL HTML STRUCTURE

```html
<div id="carta-panel" class="carta-panel">

  <!-- HEADER -->
  <div class="carta-header">
    <div class="carta-header-left">
      <span class="carta-dot"></span>
      CARTA
    </div>
    <div class="carta-ticker">BTCUSDT · Daily</div>
    <button class="carta-close" aria-label="Close CARTA">✕</button>
  </div>

  <!-- SIGNAL BAR -->
  <div class="carta-signal-bar">
    <div class="carta-badge carta-badge--buy">▲ BUY</div>
    <div class="carta-confidence">
      <span class="carta-confidence-num">82%</span>
      <span class="carta-confidence-label">Confidence</span>
    </div>
  </div>

  <!-- WEEKLY BIAS -->
  <div class="carta-weekly-bias">
    Weekly bias: <span class="carta-bias--bullish">BULLISH</span>
  </div>

  <!-- SCROLLABLE CONTENT -->
  <div class="carta-body">

    <!-- S/R LEVELS -->
    <div class="carta-section">
      <div class="carta-section-label">Support & Resistance · Daily</div>
      <div class="carta-sr-list">
        <!-- Resistance levels (dari atas ke bawah) -->
        <div class="carta-sr-row">
          <div class="carta-sr-label">
            <span class="carta-dot--strong-res"></span>
            Strong Resistance
          </div>
          <div class="carta-sr-price">$109,400</div>
        </div>
        <div class="carta-sr-row">
          <div class="carta-sr-label">
            <span class="carta-dot--weak-res"></span>
            Weak Resistance
          </div>
          <div class="carta-sr-price">$105,800</div>
        </div>

        <!-- Current price row -->
        <div class="carta-sr-row carta-sr-row--current">
          <div class="carta-sr-current-label">CURRENT · $103,240</div>
          <div class="carta-sr-current-dist">+1.8% from support</div>
        </div>

        <!-- Support levels -->
        <div class="carta-sr-row">
          <div class="carta-sr-label">
            <span class="carta-dot--weak-sup"></span>
            Weak Support
          </div>
          <div class="carta-sr-price">$101,400</div>
        </div>
        <div class="carta-sr-row">
          <div class="carta-sr-label">
            <span class="carta-dot--strong-sup"></span>
            Strong Support
          </div>
          <div class="carta-sr-price">$97,200</div>
        </div>
      </div>
    </div>

    <!-- INDICATORS -->
    <div class="carta-section">
      <div class="carta-section-label">Indicators</div>
      <div class="carta-indicator-grid">
        <div class="carta-indicator">
          <div class="carta-ind-label">RSI (14)</div>
          <div class="carta-ind-value carta-ind--neutral">58.4 · Neutral</div>
        </div>
        <div class="carta-indicator">
          <div class="carta-ind-label">MACD</div>
          <div class="carta-ind-value carta-ind--bullish">Bullish Cross</div>
        </div>
        <div class="carta-indicator">
          <div class="carta-ind-label">EMA 200</div>
          <div class="carta-ind-value carta-ind--bullish">Above</div>
        </div>
        <div class="carta-indicator">
          <div class="carta-ind-label">EMA 20</div>
          <div class="carta-ind-value carta-ind--bullish">Above</div>
        </div>
        <div class="carta-indicator">
          <div class="carta-ind-label">Bollinger</div>
          <div class="carta-ind-value carta-ind--neutral">Normal</div>
        </div>
        <div class="carta-indicator">
          <div class="carta-ind-label">Volume</div>
          <div class="carta-ind-value carta-ind--bullish">Above Avg</div>
        </div>
      </div>
    </div>

    <!-- TRADE SETUP — LONG -->
    <div class="carta-section">
      <div class="carta-section-label">
        Trade Setup · Long
        <span class="carta-grade carta-grade--a">A</span>
      </div>
      <div class="carta-setup-rows">
        <div class="carta-setup-row">
          <span class="carta-setup-label">Entry Zone</span>
          <span class="carta-setup-value">$101,200 – $102,000</span>
        </div>
        <div class="carta-setup-row">
          <span class="carta-setup-label">Stop (tight)</span>
          <span class="carta-setup-value carta-setup-value--sl">$99,800 · -1.4%</span>
        </div>
        <div class="carta-setup-row">
          <span class="carta-setup-label">Stop (safe)</span>
          <span class="carta-setup-value carta-setup-value--sl">$98,500 · -2.8%</span>
        </div>
        <div class="carta-setup-row">
          <span class="carta-setup-label">TP1</span>
          <span class="carta-setup-value carta-setup-value--tp">$105,800 · +3.8R</span>
        </div>
        <div class="carta-setup-row">
          <span class="carta-setup-label">TP2</span>
          <span class="carta-setup-value carta-setup-value--tp">$109,400 · +7.4R</span>
        </div>
        <div class="carta-setup-row">
          <span class="carta-setup-label">TP3</span>
          <span class="carta-setup-value carta-setup-value--tp">$115,000 · +12.1R</span>
        </div>
        <div class="carta-setup-divider"></div>
        <div class="carta-setup-row carta-setup-row--trigger">
          <span class="carta-setup-label">Trigger</span>
          <span class="carta-setup-value">4H close above $102,000</span>
        </div>
        <div class="carta-setup-row carta-setup-row--invalidation">
          <span class="carta-setup-label">Invalidation</span>
          <span class="carta-setup-value carta-setup-value--sl">4H close below $99,800</span>
        </div>
      </div>
    </div>

    <!-- TRADE SETUP — SHORT (collapsed by default, click to expand) -->
    <div class="carta-section carta-section--collapsible">
      <div class="carta-section-label carta-section-toggle">
        Trade Setup · Short
        <span class="carta-grade carta-grade--b">B</span>
        <span class="carta-toggle-icon">▼</span>
      </div>
      <div class="carta-setup-rows carta-collapsible-content" style="display:none;">
        <!-- same structure as long setup -->
        <div class="carta-setup-row">
          <span class="carta-setup-label">Entry Zone</span>
          <span class="carta-setup-value">$109,000 – $109,500</span>
        </div>
        <!-- ... -->
        <div class="carta-setup-note">Counter to daily bias. Half size only.</div>
      </div>
    </div>

    <!-- CARTA'S CALL -->
    <div class="carta-call">
      <div class="carta-call-label">CARTA's Call</div>
      <p class="carta-call-text">
        Price is holding above the weekly structure with clean volume.
        I'd wait for a 4H close inside the entry zone before committing.
        If it flushes to $97,200, that's the deeper setup. Higher conviction there.
      </p>
    </div>

  </div><!-- end carta-body -->

  <!-- FOOTER -->
  <div class="carta-footer">
    <a href="https://mcptrade.site" target="_blank" class="carta-footer-link">
      mcptrade.site →
    </a>
    <span class="carta-freshness">Generated 2h ago</span>
  </div>

</div><!-- end carta-panel -->

<!-- TOGGLE BUTTON (inject terpisah, selalu visible) -->
<button id="carta-toggle" class="carta-toggle-btn" title="Toggle CARTA">
  <span class="carta-toggle-icon">◀</span>
  <span class="carta-toggle-text">CARTA</span>
</button>
```

---

## 10. PANEL CSS (CORE)

```css
/* Semua class diprefix "carta-" untuk avoid conflict dengan TradingView CSS */

#carta-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: var(--carta-panel-width);
  height: 100vh;
  background: var(--carta-bg);
  border-left: 1px solid var(--carta-border);
  font-family: var(--carta-mono);
  font-size: 12px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 16px rgba(0,0,0,0.08);
  transition: transform 0.2s ease;
}

#carta-panel.carta-hidden {
  transform: translateX(280px);
}

.carta-header {
  background: var(--carta-ink);
  color: var(--carta-bg);
  padding: 10px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.carta-header-left {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
}

.carta-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--carta-signal);
  animation: carta-pulse 2s infinite;
}

@keyframes carta-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.carta-ticker {
  font-size: 10px;
  color: #888;
  letter-spacing: 0.04em;
  flex: 1;
  text-align: center;
}

.carta-close {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 12px;
  padding: 0;
}

/* SIGNAL BAR */
.carta-signal-bar {
  padding: 12px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--carta-border);
  flex-shrink: 0;
}

.carta-badge {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  padding: 5px 12px;
  border: 1px solid;
}

.carta-badge--buy {
  background: var(--carta-green-dim);
  color: var(--carta-green);
  border-color: var(--carta-green);
}

.carta-badge--sell {
  background: var(--carta-red-dim);
  color: var(--carta-red);
  border-color: var(--carta-red);
}

.carta-badge--neutral {
  background: var(--carta-surface);
  color: var(--carta-ink-muted);
  border-color: var(--carta-border-2);
}

.carta-confidence {
  text-align: right;
}

.carta-confidence-num {
  display: block;
  font-size: 18px;
  font-weight: 600;
  color: var(--carta-ink);
  line-height: 1;
}

.carta-confidence-label {
  font-size: 10px;
  color: var(--carta-ink-faint);
  letter-spacing: 0.04em;
}

/* WEEKLY BIAS */
.carta-weekly-bias {
  padding: 6px 14px;
  font-size: 10px;
  color: var(--carta-ink-faint);
  letter-spacing: 0.04em;
  border-bottom: 1px solid var(--carta-border);
  background: var(--carta-surface);
  flex-shrink: 0;
}

.carta-bias--bullish { color: var(--carta-green); font-weight: 600; }
.carta-bias--bearish { color: var(--carta-red); font-weight: 600; }
.carta-bias--neutral { color: var(--carta-ink-muted); font-weight: 600; }

/* SCROLLABLE BODY */
.carta-body {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--carta-border) transparent;
}

/* SECTIONS */
.carta-section {
  padding: 12px 14px;
  border-bottom: 1px solid var(--carta-border);
}

.carta-section-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--carta-ink-faint);
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* S/R ROWS */
.carta-sr-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  border-bottom: 1px solid var(--carta-border);
  font-size: 11px;
}

.carta-sr-row:last-child { border-bottom: none; }

.carta-sr-label {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--carta-ink-muted);
}

/* S/R dot colors */
.carta-dot--strong-res { background: var(--carta-red); }
.carta-dot--weak-res   { background: #e07070; }
.carta-dot--weak-sup   { background: #70b090; }
.carta-dot--strong-sup { background: var(--carta-green); }

.carta-dot--strong-res,
.carta-dot--weak-res,
.carta-dot--weak-sup,
.carta-dot--strong-sup {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}

.carta-sr-price {
  font-weight: 500;
  color: var(--carta-ink);
  font-variant-numeric: tabular-nums;
}

/* Current price row */
.carta-sr-row--current {
  background: var(--carta-signal-dim);
  margin: 0 -14px;
  padding: 4px 14px;
  border-bottom: none;
}

.carta-sr-current-label {
  font-size: 10px;
  color: var(--carta-signal);
  font-weight: 600;
  letter-spacing: 0.04em;
}

.carta-sr-current-dist {
  font-size: 10px;
  color: var(--carta-signal);
}

/* INDICATORS */
.carta-indicator-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.carta-indicator {
  background: var(--carta-surface);
  padding: 7px 9px;
}

.carta-ind-label {
  font-size: 10px;
  color: var(--carta-ink-faint);
  letter-spacing: 0.04em;
  margin-bottom: 2px;
}

.carta-ind-value { font-size: 11px; font-weight: 500; }
.carta-ind--bullish { color: var(--carta-green); }
.carta-ind--bearish { color: var(--carta-red); }
.carta-ind--neutral { color: var(--carta-ink-muted); }

/* TRADE SETUP */
.carta-setup-rows { display: flex; flex-direction: column; gap: 0; }

.carta-setup-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 4px 0;
  font-size: 11px;
  border-bottom: 1px solid var(--carta-border);
}

.carta-setup-row:last-child { border-bottom: none; }

.carta-setup-label { color: var(--carta-ink-faint); flex-shrink: 0; margin-right: 8px; }
.carta-setup-value { color: var(--carta-ink); font-weight: 500; text-align: right; font-variant-numeric: tabular-nums; }
.carta-setup-value--tp { color: var(--carta-green); }
.carta-setup-value--sl { color: var(--carta-red); }

/* Grade badges */
.carta-grade {
  font-size: 10px;
  font-weight: 700;
  padding: 1px 5px;
  border: 1px solid;
}

.carta-grade--a { background: var(--carta-green-dim); color: var(--carta-green); border-color: var(--carta-green); }
.carta-grade--b { background: #fff3e0; color: #E65100; border-color: #E65100; }
.carta-grade--c { background: var(--carta-surface); color: var(--carta-ink-muted); border-color: var(--carta-border-2); }

/* CARTA'S CALL */
.carta-call {
  padding: 12px 14px;
  background: var(--carta-surface);
  border-top: 2px solid var(--carta-signal);
  border-bottom: 1px solid var(--carta-border);
}

.carta-call-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--carta-signal);
  margin-bottom: 6px;
}

.carta-call-text {
  font-family: var(--carta-sans);
  font-size: 12px;
  line-height: 1.65;
  color: var(--carta-ink-muted);
  font-style: italic;
}

/* FOOTER */
.carta-footer {
  padding: 8px 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--carta-border);
  flex-shrink: 0;
  background: var(--carta-bg);
}

.carta-footer-link {
  font-size: 10px;
  color: var(--carta-ink-faint);
  text-decoration: none;
  letter-spacing: 0.04em;
}

.carta-footer-link:hover { color: var(--carta-signal); }

.carta-freshness {
  font-size: 10px;
  color: var(--carta-ink-faint);
  letter-spacing: 0.04em;
}

/* LOADING STATE */
.carta-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  gap: 12px;
}

.carta-loading-dot {
  width: 6px;
  height: 6px;
  background: var(--carta-signal);
  border-radius: 50%;
  animation: carta-blink 1s infinite;
}

@keyframes carta-blink {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 1; }
}

/* UNCHARTED STATE (coin tidak ada di DB) */
.carta-uncharted {
  padding: 24px 14px;
  text-align: center;
}

.carta-uncharted-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--carta-ink-faint);
  margin-bottom: 8px;
}

.carta-uncharted-text {
  font-size: 12px;
  color: var(--carta-ink-muted);
  line-height: 1.6;
}

/* TOGGLE BUTTON */
#carta-toggle {
  position: fixed;
  right: var(--carta-panel-width);
  top: 50%;
  transform: translateY(-50%);
  background: var(--carta-ink);
  color: var(--carta-bg);
  border: none;
  padding: 8px 6px;
  cursor: pointer;
  z-index: 9998;
  font-family: var(--carta-mono);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.06em;
  writing-mode: vertical-rl;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: right 0.2s ease, background 0.15s;
}

#carta-toggle:hover { background: var(--carta-signal); }

#carta-panel.carta-hidden ~ #carta-toggle {
  right: 0;
}
```

---

## 11. CONTENT.JS — LOGIC UTAMA

```javascript
// content.js

const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';

let currentSymbol = null;
let panelVisible = true;

// ─── INIT ───────────────────────────────────────────────

function init() {
  injectPanel();
  injectToggleButton();
  restorePanelState();

  // Initial load
  const symbol = detectSymbol();
  if (symbol) {
    currentSymbol = symbol;
    loadAnalysis(symbol);
  }

  // Watch for chart navigation
  watchSymbolChange((newSymbol) => {
    if (newSymbol && newSymbol !== currentSymbol) {
      currentSymbol = newSymbol;
      loadAnalysis(newSymbol);
    }
    if (!newSymbol) {
      showUncharted('Not a USDT pair');
    }
  });
}

// ─── SYMBOL DETECTION ───────────────────────────────────

function detectSymbol() {
  const urlParams = new URLSearchParams(window.location.search);
  const symbolParam = urlParams.get('symbol');

  if (symbolParam) {
    const raw = symbolParam.includes(':') ? symbolParam.split(':')[1] : symbolParam;
    if (raw.endsWith('USDT')) return raw.toUpperCase();
  }

  // DOM fallback
  const titleEl = document.querySelector('[data-symbol-short], .chart-container header');
  if (titleEl) {
    const text = titleEl.textContent || '';
    const match = text.match(/([A-Z]+USDT)/);
    if (match) return match[1];
  }

  return null;
}

function watchSymbolChange(callback) {
  let lastUrl = window.location.href;
  setInterval(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      callback(detectSymbol());
    }
  }, 800);
}

// ─── DATA FETCHING ───────────────────────────────────────

async function fetchAnalysis(tvSymbol) {
  try {
    const url = `${SUPABASE_URL}/rest/v1/latest_analysis?tradingview_sym=eq.${tvSymbol}&select=*,support_resistance(*),indicators(*),trade_setups(*)&limit=1`;

    const res = await fetch(url, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data[0] || null;

  } catch (err) {
    console.error('[CARTA] Fetch error:', err);
    return null;
  }
}

async function loadAnalysis(symbol) {
  showLoading(symbol);

  const data = await fetchAnalysis(symbol);

  if (!data) {
    showUncharted(symbol);
    return;
  }

  renderPanel(data);
}

// ─── RENDER ──────────────────────────────────────────────

function renderPanel(data) {
  const panel = document.getElementById('carta-panel');
  if (!panel) return;

  // Update header ticker
  panel.querySelector('.carta-ticker').textContent = `${data.tradingview_sym} · Daily`;

  // Signal badge
  const badge = panel.querySelector('.carta-badge');
  badge.className = `carta-badge carta-badge--${data.signal.toLowerCase()}`;
  badge.textContent = data.signal === 'BUY' ? '▲ BUY' : data.signal === 'SELL' ? '▼ SELL' : '● NEUTRAL';

  // Confidence
  panel.querySelector('.carta-confidence-num').textContent = `${data.confidence_pct}%`;

  // Weekly bias
  const biasEl = panel.querySelector('.carta-weekly-bias');
  biasEl.innerHTML = `Weekly bias: <span class="carta-bias--${data.weekly_bias.toLowerCase()}">${data.weekly_bias}</span>`;

  // S/R Levels
  renderSRLevels(panel, data.support_resistance);

  // Indicators
  renderIndicators(panel, data.indicators);

  // Trade setups
  renderTradeSetups(panel, data.trade_setups);

  // CARTA's Call
  panel.querySelector('.carta-call-text').textContent = data.claude_call;

  // Freshness
  const generatedAt = new Date(data.generated_at);
  const hoursAgo = Math.round((Date.now() - generatedAt) / 3600000);
  panel.querySelector('.carta-freshness').textContent =
    hoursAgo < 1 ? 'Generated just now' : `Generated ${hoursAgo}h ago`;

  // Show panel body
  panel.querySelector('.carta-body').style.display = 'flex';
  panel.querySelector('.carta-loading')?.remove();
  panel.querySelector('.carta-uncharted')?.remove();
}

function renderSRLevels(panel, srLevels) {
  const list = panel.querySelector('.carta-sr-list');
  if (!list || !srLevels) return;

  // Sort: resistances (high to low), then current, then supports (high to low)
  const resistances = srLevels
    .filter(l => l.level_type === 'RESISTANCE')
    .sort((a, b) => b.price - a.price);

  const supports = srLevels
    .filter(l => l.level_type === 'SUPPORT')
    .sort((a, b) => b.price - a.price);

  list.innerHTML = '';

  resistances.forEach(level => {
    const dotClass = level.strength === 'STRONG' ? 'strong-res' : 'weak-res';
    const label = level.strength === 'STRONG' ? 'Strong Resistance' : 'Weak Resistance';
    list.innerHTML += `
      <div class="carta-sr-row">
        <div class="carta-sr-label">
          <span class="carta-dot--${dotClass}"></span>
          ${label}
        </div>
        <div class="carta-sr-price">$${formatPrice(level.price)}</div>
      </div>`;
  });

  // Current price row — fetch from TradingView DOM or skip
  // NOTE: getting live price from TradingView DOM is tricky.
  // Simplest: omit current price row, or show static placeholder.
  // Advanced: read from document.title or TV's price element.

  supports.forEach(level => {
    const dotClass = level.strength === 'STRONG' ? 'strong-sup' : 'weak-sup';
    const label = level.strength === 'STRONG' ? 'Strong Support' : 'Weak Support';
    list.innerHTML += `
      <div class="carta-sr-row">
        <div class="carta-sr-label">
          <span class="carta-dot--${dotClass}"></span>
          ${label}
        </div>
        <div class="carta-sr-price">$${formatPrice(level.price)}</div>
      </div>`;
  });
}

function renderIndicators(panel, ind) {
  if (!ind) return;

  const grid = panel.querySelector('.carta-indicator-grid');
  if (!grid) return;

  const items = [
    { label: 'RSI (14)',  value: `${ind.rsi_value} · ${capitalize(ind.rsi_status)}`,  tone: rssTone(ind.rsi_status) },
    { label: 'MACD',      value: ind.macd_cross === 'BULLISH' ? 'Bullish Cross' : ind.macd_cross === 'BEARISH' ? 'Bearish Cross' : 'No Cross', tone: macdTone(ind.macd_cross) },
    { label: 'EMA 200',   value: capitalize(ind.price_vs_ema200), tone: emaTone(ind.price_vs_ema200) },
    { label: 'EMA 20',    value: capitalize(ind.price_vs_ema20),  tone: emaTone(ind.price_vs_ema20) },
    { label: 'Bollinger', value: capitalize(ind.bb_status),        tone: bbTone(ind.bb_status) },
    { label: 'Volume',    value: ind.volume_status === 'ABOVE_AVG' ? 'Above Avg' : ind.volume_status === 'BELOW_AVG' ? 'Below Avg' : 'Normal', tone: volTone(ind.volume_status) }
  ];

  grid.innerHTML = items.map(i => `
    <div class="carta-indicator">
      <div class="carta-ind-label">${i.label}</div>
      <div class="carta-ind-value carta-ind--${i.tone}">${i.value}</div>
    </div>
  `).join('');
}

function renderTradeSetups(panel, setups) {
  if (!setups || !setups.length) return;

  const longSetup = setups.find(s => s.direction === 'LONG');
  const shortSetup = setups.find(s => s.direction === 'SHORT');

  const longSection = panel.querySelector('[data-setup="long"]');
  const shortSection = panel.querySelector('[data-setup="short"]');

  if (longSetup && longSection) renderSetupRows(longSection, longSetup);
  if (shortSetup && shortSection) renderSetupRows(shortSection, shortSetup);
}

function renderSetupRows(section, setup) {
  const rows = section.querySelector('.carta-setup-rows');
  if (!rows) return;

  const tp3Row = setup.tp3_price
    ? `<div class="carta-setup-row">
        <span class="carta-setup-label">TP3</span>
        <span class="carta-setup-value carta-setup-value--tp">$${formatPrice(setup.tp3_price)} · +${setup.tp3_rr}R</span>
       </div>`
    : '';

  rows.innerHTML = `
    <div class="carta-setup-row">
      <span class="carta-setup-label">Entry Zone</span>
      <span class="carta-setup-value">$${formatPrice(setup.entry_zone_low)} – $${formatPrice(setup.entry_zone_high)}</span>
    </div>
    <div class="carta-setup-row">
      <span class="carta-setup-label">Stop (tight)</span>
      <span class="carta-setup-value carta-setup-value--sl">$${formatPrice(setup.stop_tight)} · -${setup.risk_pct_tight}%</span>
    </div>
    <div class="carta-setup-row">
      <span class="carta-setup-label">Stop (safe)</span>
      <span class="carta-setup-value carta-setup-value--sl">$${formatPrice(setup.stop_safe)} · -${setup.risk_pct_safe}%</span>
    </div>
    <div class="carta-setup-row">
      <span class="carta-setup-label">TP1</span>
      <span class="carta-setup-value carta-setup-value--tp">$${formatPrice(setup.tp1_price)} · +${setup.tp1_rr}R</span>
    </div>
    <div class="carta-setup-row">
      <span class="carta-setup-label">TP2</span>
      <span class="carta-setup-value carta-setup-value--tp">$${formatPrice(setup.tp2_price)} · +${setup.tp2_rr}R</span>
    </div>
    ${tp3Row}
    <div class="carta-setup-row carta-setup-row--trigger">
      <span class="carta-setup-label">Trigger</span>
      <span class="carta-setup-value">${setup.trigger_note}</span>
    </div>
    <div class="carta-setup-row carta-setup-row--invalidation">
      <span class="carta-setup-label">Invalidation</span>
      <span class="carta-setup-value carta-setup-value--sl">${setup.invalidation}</span>
    </div>
    ${setup.setup_note ? `<div class="carta-setup-note">${setup.setup_note}</div>` : ''}
  `;
}

// ─── STATES ──────────────────────────────────────────────

function showLoading(symbol) {
  const body = document.querySelector('.carta-body');
  if (!body) return;

  // Update ticker
  document.querySelector('.carta-ticker').textContent = `${symbol} · Daily`;

  body.innerHTML = `
    <div class="carta-loading">
      <div class="carta-loading-dot"></div>
      <div style="font-size:11px; color:var(--carta-ink-faint); letter-spacing:0.06em;">
        CARTA READING TERRITORY
      </div>
    </div>`;
}

function showUncharted(symbol) {
  const body = document.querySelector('.carta-body');
  if (!body) return;

  body.innerHTML = `
    <div class="carta-uncharted">
      <div class="carta-uncharted-label">Uncharted</div>
      <div class="carta-uncharted-text">
        ${symbol} is not in CARTA's coverage.<br>
        CARTA tracks USDT pairs with marketcap above $100M.
      </div>
    </div>`;
}

// ─── PANEL INJECT ─────────────────────────────────────────

function injectPanel() {
  if (document.getElementById('carta-panel')) return;

  const panel = document.createElement('div');
  panel.id = 'carta-panel';
  panel.innerHTML = `
    <div class="carta-header">
      <div class="carta-header-left">
        <span class="carta-dot"></span>
        CARTA
      </div>
      <div class="carta-ticker">--</div>
      <button class="carta-close">✕</button>
    </div>

    <div class="carta-signal-bar">
      <div class="carta-badge">--</div>
      <div class="carta-confidence">
        <span class="carta-confidence-num">--%</span>
        <span class="carta-confidence-label">Confidence</span>
      </div>
    </div>

    <div class="carta-weekly-bias">Weekly bias: <span>--</span></div>

    <div class="carta-body">
      <div class="carta-loading">
        <div class="carta-loading-dot"></div>
        <div style="font-size:11px; color:var(--carta-ink-faint); letter-spacing:0.06em;">INITIALIZING</div>
      </div>
    </div>

    <div class="carta-footer">
      <a href="https://mcptrade.site" target="_blank" class="carta-footer-link">mcptrade.site →</a>
      <span class="carta-freshness">--</span>
    </div>
  `;

  document.body.appendChild(panel);

  // Close button
  panel.querySelector('.carta-close').addEventListener('click', togglePanel);
}

function injectToggleButton() {
  if (document.getElementById('carta-toggle')) return;

  const btn = document.createElement('button');
  btn.id = 'carta-toggle';
  btn.innerHTML = '<span>CARTA</span>';
  btn.addEventListener('click', togglePanel);
  document.body.appendChild(btn);
}

function togglePanel() {
  const panel = document.getElementById('carta-panel');
  if (!panel) return;

  panelVisible = !panelVisible;
  panel.classList.toggle('carta-hidden', !panelVisible);
  chrome.storage.local.set({ cartaPanelVisible: panelVisible });
}

function restorePanelState() {
  chrome.storage.local.get('cartaPanelVisible', (result) => {
    if (result.cartaPanelVisible === false) {
      panelVisible = false;
      document.getElementById('carta-panel')?.classList.add('carta-hidden');
    }
  });
}

// ─── HELPERS ─────────────────────────────────────────────

function formatPrice(price) {
  if (!price) return '--';
  return Number(price).toLocaleString('en-US', {
    minimumFractionDigits: price < 1 ? 4 : 0,
    maximumFractionDigits: price < 1 ? 6 : 0
  });
}

function capitalize(str) {
  if (!str) return '--';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function rssTone(status) {
  if (status === 'OVERBOUGHT') return 'bearish';
  if (status === 'OVERSOLD') return 'bullish';
  return 'neutral';
}

function macdTone(cross) {
  if (cross === 'BULLISH') return 'bullish';
  if (cross === 'BEARISH') return 'bearish';
  return 'neutral';
}

function emaTone(pos) {
  if (pos === 'ABOVE') return 'bullish';
  if (pos === 'BELOW') return 'bearish';
  return 'neutral';
}

function bbTone(status) {
  if (status === 'SQUEEZE') return 'neutral';
  if (status === 'EXPANSION') return 'bullish';
  return 'neutral';
}

function volTone(status) {
  if (status === 'ABOVE_AVG') return 'bullish';
  if (status === 'BELOW_AVG') return 'bearish';
  return 'neutral';
}

// ─── START ───────────────────────────────────────────────

// TradingView adalah SPA, jadi perlu delay setelah initial load
window.addEventListener('load', () => {
  setTimeout(init, 1500);
});
```

---

## 12. EDGE CASES YANG HARUS DI-HANDLE

| Case | Handling |
|---|---|
| Symbol bukan USDT (misal BTCUSD, BTCEUR) | Tampilkan "Uncharted" state |
| Symbol USDT tapi marketcap < $100M | Tampilkan "Uncharted" state dengan note "Below coverage threshold" |
| Supabase down / network error | Tampilkan "Uncharted" dengan note "Analysis temporarily unavailable" |
| Data sudah lebih dari 8 jam (expires_at terlewat) | Tampilkan freshness label dengan warna orange sebagai warning: "Analysis 8h ago — refresh pending" |
| User navigasi antar chart di TradingView | watchSymbolChange() trigger re-render otomatis |
| Short setup tidak ada (hanya Long) | Section short di-hide, tidak error |
| TP3 tidak ada | Row TP3 tidak di-render |
| Panel overlap dengan TV toolbar | Pastikan z-index CARTA lebih tinggi dari TV elements (9999 sudah cukup) |

---

## 13. SUPABASE RLS (ROW LEVEL SECURITY)

Backend perlu setup RLS di Supabase agar extension bisa read tapi tidak write:

```sql
-- Enable RLS pada semua tabel
ALTER TABLE coins ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_resistance ENABLE ROW LEVEL SECURITY;
ALTER TABLE indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_setups ENABLE ROW LEVEL SECURITY;

-- Policy: anon dapat SELECT saja
CREATE POLICY "Public read coins" ON coins FOR SELECT TO anon USING (true);
CREATE POLICY "Public read analyses" ON analyses FOR SELECT TO anon USING (true);
CREATE POLICY "Public read sr" ON support_resistance FOR SELECT TO anon USING (true);
CREATE POLICY "Public read indicators" ON indicators FOR SELECT TO anon USING (true);
CREATE POLICY "Public read setups" ON trade_setups FOR SELECT TO anon USING (true);

-- View latest_analysis
CREATE OR REPLACE VIEW latest_analysis AS
SELECT
  c.symbol,
  c.tradingview_sym,
  c.name,
  c.marketcap_usd,
  a.id,
  a.generated_at,
  a.expires_at,
  a.signal,
  a.confidence_pct,
  a.weekly_bias,
  a.claude_call
FROM coins c
JOIN analyses a ON a.coin_id = c.id
WHERE a.generated_at = (
  SELECT MAX(a2.generated_at) FROM analyses a2 WHERE a2.coin_id = c.id
)
AND c.is_active = true;
```

---

## 14. TESTING CHECKLIST

Sebelum submit ke Chrome Web Store, test semua case ini:

- [ ] Extension load saat buka `tradingview.com/chart/`
- [ ] Panel muncul di sisi kanan dalam 1-2 detik
- [ ] Symbol detection benar untuk BTCUSDT, ETHUSDT, SOLUSDT
- [ ] Data S/R levels muncul dengan urutan yang benar
- [ ] Indicator values dan tone colors sesuai
- [ ] Trade setup Long dan Short render dengan benar
- [ ] Short section collapsed by default, expand on click
- [ ] CARTA's Call text muncul
- [ ] Freshness label menampilkan jam yang benar
- [ ] Toggle button show/hide panel bekerja
- [ ] State panel tersimpan (reload halaman, state tetap sama)
- [ ] Navigasi antar chart (ganti symbol) trigger re-render
- [ ] Uncharted state muncul untuk non-USDT pairs
- [ ] Uncharted state muncul untuk USDT pairs yang tidak ada di DB
- [ ] Panel tidak overlap dengan TradingView toolbar penting
- [ ] Extension tidak break layout TradingView

---

## 15. REFERENSI TAMBAHAN

- **Landing Page:** carta-landing-v2.html (sudah dibuat, reference untuk visual panel)
- **DB Schema lengkap:** CARTA_PROJECT_SUMMARY.md section 7
- **Parent project:** mcptrade.site (share Supabase DB dan cron job)
- **Brand colors:** `#FF6B00` orange, `#0F0F0D` dark ink, `#F5F4F0` off-white
- **Font:** JetBrains Mono (mono), Inter (body)

---

*CARTA — Cartography Trading Agent*
*Chrome Extension v1.0 | Built on MCPTrade | Powered by Anthropic Claude*
