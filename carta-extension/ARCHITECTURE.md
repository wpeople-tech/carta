# CARTA Extension — Architecture Documentation

CARTA (Cartography Trading Agent) adalah Chrome extension yang menyuntikkan panel analisis kripto bertenaga AI langsung ke dalam TradingView. Backend AI menggunakan Claude via MCP, dan data analisis disimpan di Supabase.

---

## Struktur Direktori

```
carta-extension/
├── public/
│   ├── manifest.json          # Chrome Extension Manifest v3
│   └── background.js          # Service worker minimal (wajib MV3)
├── src/
│   ├── content.tsx            # Content script — diinjeksi ke halaman TradingView
│   ├── App.tsx                # Dev preview app (menggunakan mock data)
│   ├── main.tsx               # Entry point dev app
│   ├── index.css              # Styling dev app
│   └── panel/                 # Inti UI extension
│       ├── Panel.tsx          # Komponen utama, orkestrator semua state
│       ├── panel.css          # Styling panel (custom CSS tokens)
│       ├── types.ts           # TypeScript interfaces (Analysis, Signal, TradeSetup, dll)
│       ├── utils.ts           # Helper functions: formatPrice, timeAgo, isExpired
│       ├── __mocks__/
│       │   └── mockData.ts    # Mock data BTC untuk dev & testing
│       ├── components/
│       │   ├── Header.tsx     # Menampilkan simbol (e.g., "BTCUSDT · Daily") + tombol tutup
│       │   ├── SignalBar.tsx  # Badge BUY/SELL/NEUTRAL + confidence % + weekly bias
│       │   ├── SRLevels.tsx   # Level support & resistance dengan indikator kekuatan
│       │   ├── Indicators.tsx # RSI, MACD, EMA20/200, Bollinger, Volume
│       │   ├── TradeSetup.tsx # Rencana LONG/SHORT dengan entry, stop, TP1-3
│       │   ├── CartaCall.tsx  # Narasi analisis dari Claude AI
│       │   └── Footer.tsx     # Waktu generate, expiration, link ke mcptrade.site
│       └── hooks/
│           ├── useSymbol.ts   # Deteksi trading pair dari URL & DOM polling
│           └── useAnalysis.ts # Fetch analisis dari Supabase, kelola loading state
├── dist/                      # Output build (IIFE JS + manifest)
├── vite.config.ts             # Build config: React plugin, IIFE output untuk content script
├── package.json               # React 19, TypeScript, Vite, Tailwind 4
└── .env.local                 # VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY
```

---

## Tech Stack

| Kategori | Teknologi | Kegunaan |
|---|---|---|
| UI Framework | React 19 | Component-based UI |
| Language | TypeScript | Type safety |
| Build Tool | Vite | Bundling ke IIFE untuk content script |
| Styling | CSS custom tokens | Isolasi via Shadow DOM |
| Backend/DB | Supabase REST API | Penyimpanan data analisis |
| AI Provider | Claude (MCP) | Dijalankan di backend, bukan di extension |

**Environment Variables** (`.env.local`):
- `VITE_SUPABASE_URL` — endpoint database
- `VITE_SUPABASE_ANON_KEY` — API key read-only

---

## Alur Data (Data Flow)

```
TradingView dibuka
        ↓
content.tsx
  • Tunggu 1.5s (document_idle + TradingView render)
  • Buat Shadow DOM host (#carta-host, fixed position)
  • Inject CSS ke shadow root
  • Mount React ke shadow container
        ↓
Panel.tsx
  ├── useSymbol()
  │     • Baca simbol dari URL param (?symbol=BTCUSDT)
  │     • Fallback ke DOM attribute [data-symbol-short]
  │     • Polling setiap 800ms untuk deteksi perubahan chart
  │
  └── useAnalysis(symbol)
        • GET /rest/v1/latest_analysis
            ?tradingview_sym=eq.BTCUSDT
            &select=*,support_resistance(*),indicators(*),trade_setups(*)
        • AbortController membatalkan request sebelumnya saat simbol berubah
        ↓
  State machine render:
  • idle       → tidak ada konten
  • loading    → "CARTA READING TERRITORY"
  • success    → Panel analisis lengkap
  • uncharted  → "X is not in CARTA's coverage"
  • error      → "Analysis temporarily unavailable"
```

---

## Komponen UI

| Komponen | Fungsi |
|---|---|
| `Panel.tsx` | Orkestrator utama — mengelola symbol, fetch, visibility toggle |
| `Header.tsx` | Menampilkan simbol aktif dan tombol tutup panel |
| `SignalBar.tsx` | Badge sinyal utama (BUY/SELL/NEUTRAL), confidence %, weekly bias |
| `SRLevels.tsx` | Daftar level support & resistance dengan label STRONG/WEAK |
| `Indicators.tsx` | Grid 6 indikator teknikal: RSI, MACD, EMA 20/200, Bollinger, Volume |
| `TradeSetup.tsx` | Expandable LONG/SHORT plan: entry zone, stop tight/safe, TP1/TP2/TP3 |
| `CartaCall.tsx` | Narasi analisis AI dari Claude |
| `Footer.tsx` | Waktu generate ("2h ago"), status expiration, link ke mcptrade.site |

---

## Type System

```typescript
// Analisis utama dari Supabase
Analysis {
  id, symbol, tradingview_sym, name,
  generated_at, expires_at,
  signal: 'BUY' | 'SELL' | 'NEUTRAL',
  confidence_pct: number,
  weekly_bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL',
  claude_call: string,
  support_resistance: SRLevel[],
  indicators: Indicators,
  trade_setups: TradeSetup[]
}

SRLevel {
  level_type: 'SUPPORT' | 'RESISTANCE',
  strength: 'STRONG' | 'WEAK',
  price: number,
  confluence_note: string | null,
  sort_order: number
}

Indicators {
  rsi_value, rsi_status: 'OVERBOUGHT' | 'OVERSOLD' | 'NEUTRAL',
  macd_cross: 'BULLISH' | 'BEARISH' | 'NONE',
  price_vs_ema20: 'ABOVE' | 'BELOW',
  price_vs_ema200: 'ABOVE' | 'BELOW',
  bb_status: 'SQUEEZE' | 'EXPANSION' | 'NORMAL',
  atr_value,
  volume_status: 'ABOVE_AVG' | 'BELOW_AVG' | 'NORMAL'
}

TradeSetup {
  direction: 'LONG' | 'SHORT',
  grade: 'A' | 'B' | 'C',
  conviction: 'HIGH' | 'MEDIUM' | 'LOW',
  entry_zone_low, entry_zone_high,
  stop_tight, stop_safe,
  risk_pct_tight, risk_pct_safe,
  tp1_price, tp1_rr,
  tp2_price, tp2_rr,
  tp3_price, tp3_rr,
  trigger_note, invalidation, setup_note
}
```

---

## Build & Development

```bash
# Mode dev (preview dengan mock data, port 3000)
yarn dev

# Build extension untuk Chrome
yarn build
# Output: dist/ — siap di-load ke Chrome sebagai extension

# Type check
yarn tsc -b
```

**Cara load ke Chrome:**
1. Buka `chrome://extensions`
2. Aktifkan **Developer mode**
3. Klik **Load unpacked** → pilih folder `dist/`

**Visibilitas Panel:**
- Toggle via tombol `◀/▶ CARTA`
- State disimpan ke `chrome.storage.local.cartaPanelVisible`

---

## Shadow DOM Isolation

Extension menggunakan Shadow DOM untuk mengisolasi CSS dari TradingView agar tidak terjadi konflik styling:

```
document.body
  └── #carta-host  (Shadow Host, fixed position, w/h = 0)
        └── Shadow Root
              ├── <style> (panel.css diinjeksi)
              └── <div id="carta-root"> ← React mount point
```
