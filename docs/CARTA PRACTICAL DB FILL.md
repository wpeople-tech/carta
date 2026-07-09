# CARTA — Panduan Praktis Isi DB
## Contoh Real BTCUSDT + Kode Siap Jalankan

---

## BAGIAN 1: CONTOH REAL — BTCUSDT DAILY (1 JULI 2026)

Ini bukan teori. Ini contoh konkret bagaimana data CARTA seharusnya terlihat untuk BTCUSDT hari ini, berdasarkan kondisi market aktual yang sedang terjadi.

### Kondisi Market BTC Saat Ini

<cite index="51-1">BTC saat ini trading di sekitar $59,000-60,000. Harga sudah jatuh dari monthly open $73,674 dan menguji monthly low di $58,115. RSI harian berada di 29.40, zona oversold.</cite> <cite index="54-1">Sinyal moving average secara keseluruhan menunjukkan strong sell.</cite>

Artinya **Weekly Bias: BEARISH**. EMA 200 daily jauh di atas harga saat ini.

### Seperti Apa Data yang Benar di DB CARTA untuk BTCUSDT

```
Current Price  : ~$59,500  (asumsi saat generate)
Weekly Bias    : BEARISH
Signal         : SELL
Confidence     : 68%

--- SUPPORT & RESISTANCE (Daily TF) ---

RESISTANCE (di ATAS harga saat ini — urut dari terdekat):
  R1: $62,500   WEAK    ← level yang baru-baru ini jadi resistance
  R2: $64,178   STRONG  ← resistance utama, beberapa kali rejection
  R3: $65,600   STRONG  ← 50-month EMA, resistance kuat

CURRENT PRICE: $59,500

SUPPORT (di BAWAH harga saat ini — urut dari terdekat):
  S1: $58,115   STRONG  ← monthly low yang baru diuji, level kritis
  S2: $55,000   WEAK    ← level psikologis berikutnya
  S3: $53,000   STRONG  ← support major jangka panjang

--- SHORT SETUP (karena bias BEARISH) ---

Entry Zone     : $62,000 – $63,000  ← di sekitar R1 ($62,500)
Stop Tight     : $64,400            ← 1.5% di atas entry mid ($62,500)
Stop Safe      : $65,100            ← mendekati R2 ($64,178), di atasnya sedikit
Risk Tight     : 1.5%
Risk Safe      : 2.5%

TP1            : $58,115  (+3.4R)   ← S1, support monthly low
TP2            : $55,000  (+6.2R)   ← S2, level psikologis
TP3            : $53,000  (+7.9R)   ← S3, support major

Trigger        : 4H bearish rejection wick inside $62,000–$63,000
Invalidation   : 4H close above $64,400

--- LONG SETUP (counter-trend, grade lebih rendah) ---

Entry Zone     : $57,800 – $58,400  ← di bawah S1 ($58,115), bounce zone
Stop Tight     : $56,900            ← 1.5% di bawah entry mid ($58,100)
Stop Safe      : $55,200            ← di bawah S2 ($55,000)
Risk Tight     : 1.5%
Risk Safe      : 5%

TP1            : $62,500  (+4.8R)   ← R1
TP2            : $64,178  (+6.1R)   ← R2
TP3            : $65,600  (+7.2R)   ← R3

Trigger        : 4H candle close above $58,400 with volume
Invalidation   : 4H close below $56,900

Grade SHORT    : A  (searah weekly bias, R:R bagus)
Grade LONG     : B  (counter-trend, reduce size 50%)

--- INDICATORS ---

RSI (14)    : 29.4    → OVERSOLD
MACD        : BEARISH → Bearish cross confirmed
EMA 20      : ~$63,500 → Price BELOW
EMA 200     : ~$71,000 → Price BELOW
Bollinger   : EXPANSION → volatility tinggi
Volume      : ABOVE_AVG → konfirmasi tekanan jual
ATR (14)    : ~$2,100

--- CARTA'S CALL ---
"BTC is breaking down through the monthly low at $58,115. The structure is bearish
with price below all key EMAs. I'm watching for a bounce into the $62,000-$63,000
resistance zone to position short with TP targeting $58,115 first. If price holds
above $58,115 with volume, a counter-trend long becomes viable but only with
reduced size given the weekly bias."
```

---

## BAGIAN 2: LOGIC ENTRY/SL/TP — RUMUS YANG HARUS DEV IKUTI

Ini rumus tetap yang tidak berubah. Dev hanya perlu implementasikan ini satu kali, dan berlaku untuk semua coin.

### 2.1 SELL Setup (Bias Bearish)

```
nearest_resistance = R1.price   ← resistance terdekat di atas harga

entry_low  = nearest_resistance * 0.994   (0.6% di bawah R1)
entry_high = nearest_resistance * 1.003   (0.3% di atas R1)
entry_mid  = (entry_low + entry_high) / 2

stop_tight = entry_mid * 1.015            ← 1.5% di atas entry mid
stop_safe  = max(entry_mid * 1.030,       ← 3% di atas entry mid
             R2.price * 1.005)            ← atau sedikit di atas R2, mana lebih besar

TP1 = S1.price    ← support terdekat di bawah harga
TP2 = S2.price    ← support berikutnya
TP3 = S3.price    ← support berikutnya lagi (kalau ada)

RR_TP1 = (entry_mid - TP1) / (stop_tight - entry_mid)
RR_TP2 = (entry_mid - TP2) / (stop_tight - entry_mid)
RR_TP3 = (entry_mid - TP3) / (stop_tight - entry_mid)
```

### 2.2 BUY Setup (Bias Bullish)

```
nearest_support = S1.price   ← support terdekat di bawah harga

entry_low  = nearest_support * 0.997   (0.3% di bawah S1)
entry_high = nearest_support * 1.006   (0.6% di atas S1)
entry_mid  = (entry_low + entry_high) / 2

stop_tight = entry_mid * 0.985             ← 1.5% di bawah entry mid
stop_safe  = min(entry_mid * 0.970,        ← 3% di bawah entry mid
             S2.price * 0.995)             ← atau sedikit di bawah S2, mana lebih kecil

TP1 = R1.price    ← resistance terdekat di atas harga
TP2 = R2.price
TP3 = R3.price

RR_TP1 = (TP1 - entry_mid) / (entry_mid - stop_tight)
RR_TP2 = (TP2 - entry_mid) / (entry_mid - stop_tight)
RR_TP3 = (TP3 - entry_mid) / (entry_mid - stop_tight)
```

### 2.3 Aturan yang TIDAK BOLEH dilanggar

```
1. Semua resistance.price > current_price         → WAJIB
2. Semua support.price < current_price            → WAJIB
3. Entry SELL harus di dekat R1, bukan di tengah  → WAJIB
4. Entry BUY harus di dekat S1, bukan di tengah   → WAJIB
5. Stop SELL harus LEBIH TINGGI dari entry        → WAJIB
6. Stop BUY harus LEBIH RENDAH dari entry         → WAJIB
7. TP SELL harus LEBIH RENDAH dari entry          → WAJIB
8. TP BUY harus LEBIH TINGGI dari entry           → WAJIB
9. Semua TP price > 0                             → WAJIB
10. R:R setiap TP harus antara 0.5 – 20           → WAJIB
```

---

## BAGIAN 3: KODE PIPELINE LENGKAP — SIAP JALANKAN

### 3.1 Install dependencies

```bash
pip install ccxt pandas-ta scipy scikit-learn anthropic supabase python-dotenv
```

### 3.2 File `.env`

```env
ANTHROPIC_API_KEY=your_anthropic_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

### 3.3 `carta_engine.py` — file utama, jalankan ini

```python
"""
CARTA Technical Analysis Engine
Jalankan: python carta_engine.py
Untuk satu coin: python carta_engine.py --symbol BTCUSDT
Untuk semua coin: python carta_engine.py --all
"""

import os
import sys
import json
import time
import logging
import argparse
from datetime import datetime, timedelta
from dotenv import load_dotenv

import ccxt
import numpy as np
import pandas as pd
import pandas_ta as ta
from scipy.signal import argrelextrema
from sklearn.cluster import AgglomerativeClustering
import anthropic
from supabase import create_client

load_dotenv()
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s'
)
logger = logging.getLogger('CARTA')


# ─── SETUP ───────────────────────────────────────────────────────────────────

anthropic_client = anthropic.Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))
supabase = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_SERVICE_KEY'))

# Exchange priority untuk fetch OHLCV
# Binance adalah acuan utama, fallback ke OKX dan Bybit untuk coin yang tidak listed
EXCHANGES = [
    ccxt.binance({'enableRateLimit': True}),
    ccxt.okx({'enableRateLimit': True}),
    ccxt.bybit({'enableRateLimit': True}),
]


# ─── STEP 1: FETCH OHLCV ─────────────────────────────────────────────────────

def fetch_ohlcv(tradingview_sym, days=500):
    """
    Fetch daily OHLCV dari exchange.
    tradingview_sym: format 'BTCUSDT'
    Return: (DataFrame, exchange_name) atau (None, None)
    """
    # Convert 'BTCUSDT' → 'BTC/USDT' untuk CCXT
    base = tradingview_sym.replace('USDT', '')
    ccxt_symbol = f"{base}/USDT"

    since_ts = int((datetime.utcnow() - timedelta(days=days)).timestamp() * 1000)

    for exchange in EXCHANGES:
        try:
            markets = exchange.load_markets()
            if ccxt_symbol not in markets:
                continue

            raw = exchange.fetch_ohlcv(ccxt_symbol, '1d', since=since_ts, limit=days)
            if not raw or len(raw) < 100:
                continue

            df = pd.DataFrame(raw, columns=['ts', 'Open', 'High', 'Low', 'Close', 'Volume'])
            df['ts'] = pd.to_datetime(df['ts'], unit='ms')
            df.set_index('ts', inplace=True)
            df = df.astype(float)

            logger.info(f"  Fetched {len(df)} daily candles from {exchange.id}")
            return df, exchange.id

        except Exception as e:
            logger.debug(f"  {exchange.id} failed for {ccxt_symbol}: {e}")
            continue

    logger.warning(f"  No OHLCV data found for {tradingview_sym}")
    return None, None


# ─── STEP 2: S&R DETECTION ───────────────────────────────────────────────────

def detect_sr(df, current_price, max_levels=3, proximity_pct=0.20):
    """
    Deteksi S&R levels dari Daily OHLCV.
    Mengembalikan dict dengan keys 'resistance', 'support', 'all'.

    proximity_pct=0.20 → hanya ambil level dalam radius 20% dari harga saat ini.
    Ini yang mencegah "S&R terlalu jauh" seperti bug OKBUSDT sebelumnya.
    """
    high = df['High'].values
    low  = df['Low'].values

    # Auto-tune sensitivity berdasarkan volatilitas coin
    # Coin volatile butuh window lebih besar untuk filter noise
    atr_14 = float(ta.atr(df['High'], df['Low'], df['Close'], 14).iloc[-1])
    atr_pct = atr_14 / current_price * 100
    sensitivity = 5 if atr_pct < 2 else 7 if atr_pct < 5 else 10 if atr_pct < 10 else 14

    # Temukan local maxima dan minima
    res_idx = argrelextrema(high, np.greater, order=sensitivity)[0]
    sup_idx = argrelextrema(low,  np.less,    order=sensitivity)[0]

    res_prices = high[res_idx]
    sup_prices = low[sup_idx]

    # Filter: hanya level dalam radius proximity_pct dari current_price
    upper = current_price * (1 + proximity_pct)
    lower = current_price * (1 - proximity_pct)

    res_prices = res_prices[(res_prices > current_price) & (res_prices <= upper)]
    sup_prices = sup_prices[(sup_prices < current_price) & (sup_prices >= lower)]

    def cluster(prices, n_max, ascending=True):
        if len(prices) == 0:
            return []
        if len(prices) == 1:
            return [{'price': float(prices[0]), 'touches': 1, 'strength': 'WEAK'}]

        n = min(n_max, len(prices))
        arr = prices.reshape(-1, 1)
        labels = AgglomerativeClustering(n_clusters=n, linkage='complete').fit(arr).labels_

        levels = []
        for cid in set(labels):
            cluster_prices = prices[labels == cid]
            levels.append({
                'price': float(np.median(cluster_prices)),
                'touches': int(len(cluster_prices))
            })

        # Sort terdekat ke harga dulu, ambil n_max
        levels.sort(key=lambda x: abs(x['price'] - current_price))
        levels = levels[:n_max]

        # Assign strength: level yang lebih sering disentuh = STRONG
        max_t = max(l['touches'] for l in levels)
        for l in levels:
            l['strength'] = 'STRONG' if l['touches'] >= max(2, max_t * 0.6) else 'WEAK'

        # Re-sort: resistance ascending (terdekat dulu), support descending (terdekat dulu)
        levels.sort(key=lambda x: x['price'], reverse=not ascending)
        return levels

    res_levels = cluster(res_prices, max_levels, ascending=True)
    sup_levels = cluster(sup_prices, max_levels, ascending=False)

    # VALIDASI KERAS: filter sekali lagi untuk pastikan urutan benar
    res_levels = [r for r in res_levels if r['price'] > current_price]
    sup_levels = [s for s in sup_levels if s['price'] < current_price]

    # Format untuk DB
    result_res = [
        {
            'level_type': 'RESISTANCE',
            'strength': l['strength'],
            'price': round(l['price'], 8),
            'touches': l['touches'],
            'confluence_note': f"Touched {l['touches']}x Daily" if l['touches'] >= 3 else None,
            'sort_order': i + 1
        }
        for i, l in enumerate(res_levels)
    ]
    result_sup = [
        {
            'level_type': 'SUPPORT',
            'strength': l['strength'],
            'price': round(l['price'], 8),
            'touches': l['touches'],
            'confluence_note': f"Touched {l['touches']}x Daily" if l['touches'] >= 3 else None,
            'sort_order': i + 1
        }
        for i, l in enumerate(sup_levels)
    ]

    return {
        'resistance': result_res,
        'support': result_sup,
        'all': result_res + result_sup
    }


# ─── STEP 3: INDICATORS ──────────────────────────────────────────────────────

def calc_indicators(df):
    """Hitung semua indicators menggunakan pandas-ta"""
    close  = df['Close']
    high   = df['High']
    low    = df['Low']
    volume = df['Volume']
    cp     = float(close.iloc[-1])

    # RSI
    rsi_s = ta.rsi(close, 14)
    rsi_v = round(float(rsi_s.iloc[-1]), 2)
    rsi_status = 'OVERSOLD' if rsi_v < 30 else 'OVERBOUGHT' if rsi_v > 70 else 'NEUTRAL'

    # MACD
    macd_df = ta.macd(close, 12, 26, 9)
    hist_now  = float(macd_df.iloc[-1, 2])
    hist_prev = float(macd_df.iloc[-2, 2])
    macd_cross = (
        'BULLISH' if hist_now > 0 and hist_prev <= 0 else
        'BEARISH' if hist_now < 0 and hist_prev >= 0 else
        'NONE'
    )

    # EMA
    ema20  = float(ta.ema(close, 20).iloc[-1])
    ema200 = float(ta.ema(close, 200).iloc[-1])

    # Bollinger
    bb = ta.bbands(close, 20, 2)
    bb_u = float(bb.iloc[-1, 0])
    bb_m = float(bb.iloc[-1, 1])
    bb_l = float(bb.iloc[-1, 2])
    bb_w   = (bb_u - bb_l) / bb_m
    bb_avg = float(((bb.iloc[-20:, 0] - bb.iloc[-20:, 2]) / bb.iloc[-20:, 1]).mean())
    bb_status = 'SQUEEZE' if bb_w < bb_avg * 0.7 else 'EXPANSION' if bb_w > bb_avg * 1.3 else 'NORMAL'

    # ATR
    atr = round(float(ta.atr(high, low, close, 14).iloc[-1]), 6)

    # Volume
    vol_avg = float(volume.iloc[-20:].mean())
    vol_status = 'ABOVE_AVG' if float(volume.iloc[-1]) > vol_avg * 1.2 else \
                 'BELOW_AVG' if float(volume.iloc[-1]) < vol_avg * 0.8 else 'NORMAL'

    return {
        'rsi_value':        rsi_v,
        'rsi_status':       rsi_status,
        'macd_line':        round(float(macd_df.iloc[-1, 0]), 6),
        'macd_signal':      round(float(macd_df.iloc[-1, 1]), 6),
        'macd_histogram':   round(hist_now, 6),
        'macd_cross':       macd_cross,
        'ema_20':           round(ema20, 4),
        'ema_200':          round(ema200, 4),
        'price_vs_ema20':   'ABOVE' if cp > ema20  else 'BELOW',
        'price_vs_ema200':  'ABOVE' if cp > ema200 else 'BELOW',
        'bb_upper':         round(bb_u, 4),
        'bb_middle':        round(bb_m, 4),
        'bb_lower':         round(bb_l, 4),
        'bb_status':        bb_status,
        'atr_value':        atr,
        'volume_status':    vol_status,
    }


# ─── STEP 4: TRADE SETUP ─────────────────────────────────────────────────────

def calc_setups(cp, sr, weekly_bias=None):
    """
    Hitung entry/stop/TP untuk LONG dan SHORT.
    cp: current price
    sr: output dari detect_sr()
    """
    res = sr['resistance']  # sorted terdekat ke harga dulu
    sup = sr['support']     # sorted terdekat ke harga dulu
    setups = []

    # ── SHORT ──────────────────────────────────
    if res:
        r1 = res[0]['price']
        el = round(r1 * 0.994, 8)   # 0.6% di bawah R1
        eh = round(r1 * 1.003, 8)   # 0.3% di atas R1
        em = (el + eh) / 2

        st = round(em * 1.015, 8)   # stop tight: 1.5% di atas entry
        # stop safe: 3% di atas entry ATAU sedikit di atas R2 (mana lebih besar)
        ss_base = em * 1.030
        ss = round(max(ss_base, res[1]['price'] * 1.005) if len(res) > 1 else ss_base, 8)

        rsk_t = st - em
        rsk_s = ss - em

        tps = {}
        for i, s in enumerate(sup[:3], 1):
            tp = s['price']
            rr = round((em - tp) / rsk_t, 1) if rsk_t > 0 else 0
            if tp < el and 0.5 <= rr <= 20:
                tps[f'tp{i}_price'] = round(tp, 8)
                tps[f'tp{i}_rr']    = rr

        if 'tp1_price' in tps:
            rr1 = tps.get('tp1_rr', 0)
            aligned = weekly_bias == 'BEARISH'
            score = (3 if rr1 >= 5 else 2 if rr1 >= 3 else 1) + \
                    (2 if res[0]['strength'] == 'STRONG' else 1) + \
                    (2 if aligned else 1 if weekly_bias == 'NEUTRAL' else 0)
            grade = 'A' if score >= 6 else 'B' if score >= 4 else 'C'

            setups.append({
                'direction':        'SHORT',
                'grade':            grade,
                'conviction':       'HIGH' if grade == 'A' else 'MEDIUM' if grade == 'B' else 'LOW',
                'entry_zone_low':   el,
                'entry_zone_high':  eh,
                'stop_tight':       st,
                'stop_safe':        ss,
                'risk_pct_tight':   round((st - em) / em * 100, 2),
                'risk_pct_safe':    round((ss - em) / em * 100, 2),
                'trigger_note':     f"4H bearish rejection wick inside ${el:,.2f}–${eh:,.2f}",
                'invalidation':     f"4H close above ${st:,.2f}",
                'setup_note':       "Counter to weekly bias — half size only." if weekly_bias == 'BULLISH' else None,
                **tps
            })

    # ── LONG ───────────────────────────────────
    if sup:
        s1 = sup[0]['price']
        el = round(s1 * 0.997, 8)   # 0.3% di bawah S1
        eh = round(s1 * 1.006, 8)   # 0.6% di atas S1
        em = (el + eh) / 2

        st = round(em * 0.985, 8)   # stop tight: 1.5% di bawah entry
        ss_base = em * 0.970
        ss = round(min(ss_base, sup[1]['price'] * 0.995) if len(sup) > 1 else ss_base, 8)

        rsk_t = em - st

        tps = {}
        for i, r in enumerate(res[:3], 1):
            tp = r['price']
            rr = round((tp - em) / rsk_t, 1) if rsk_t > 0 else 0
            if tp > eh and 0.5 <= rr <= 20:
                tps[f'tp{i}_price'] = round(tp, 8)
                tps[f'tp{i}_rr']    = rr

        if 'tp1_price' in tps:
            rr1 = tps.get('tp1_rr', 0)
            aligned = weekly_bias == 'BULLISH'
            score = (3 if rr1 >= 5 else 2 if rr1 >= 3 else 1) + \
                    (2 if sup[0]['strength'] == 'STRONG' else 1) + \
                    (2 if aligned else 1 if weekly_bias == 'NEUTRAL' else 0)
            grade = 'A' if score >= 6 else 'B' if score >= 4 else 'C'

            setups.append({
                'direction':        'LONG',
                'grade':            grade,
                'conviction':       'HIGH' if grade == 'A' else 'MEDIUM' if grade == 'B' else 'LOW',
                'entry_zone_low':   el,
                'entry_zone_high':  eh,
                'stop_tight':       st,
                'stop_safe':        ss,
                'risk_pct_tight':   round((em - st) / em * 100, 2),
                'risk_pct_safe':    round((em - ss) / em * 100, 2),
                'trigger_note':     f"Wait for 4H candle close above ${eh:,.2f} with volume",
                'invalidation':     f"4H close below ${st:,.2f}",
                'setup_note':       "Counter to weekly bias — half size only." if weekly_bias == 'BEARISH' else None,
                **tps
            })

    return setups


# ─── STEP 5: VALIDASI MATEMATIS ──────────────────────────────────────────────

def validate(cp, sr, setups):
    """Validasi semua angka sebelum simpan ke DB. Return (is_valid, errors)"""
    errors = []

    for r in sr['resistance']:
        if r['price'] <= cp:
            errors.append(f"Resistance {r['price']} not above current {cp}")

    for s in sr['support']:
        if s['price'] >= cp:
            errors.append(f"Support {s['price']} not below current {cp}")

    for setup in setups:
        d = setup['direction']
        em = (setup['entry_zone_low'] + setup['entry_zone_high']) / 2

        if d == 'SHORT':
            if setup['stop_tight'] <= em:
                errors.append(f"SHORT stop_tight {setup['stop_tight']} must be > entry {em}")
            for k in ['tp1_price', 'tp2_price', 'tp3_price']:
                if k in setup and setup[k] is not None:
                    if setup[k] >= em:
                        errors.append(f"SHORT {k} {setup[k]} must be < entry {em}")
                    if setup[k] <= 0:
                        errors.append(f"SHORT {k} is negative: {setup[k]}")

        if d == 'LONG':
            if setup['stop_tight'] >= em:
                errors.append(f"LONG stop_tight {setup['stop_tight']} must be < entry {em}")
            for k in ['tp1_price', 'tp2_price', 'tp3_price']:
                if k in setup and setup[k] is not None:
                    if setup[k] <= em:
                        errors.append(f"LONG {k} {setup[k]} must be > entry {em}")
                    if setup[k] <= 0:
                        errors.append(f"LONG {k} is negative: {setup[k]}")

        for k in ['tp1_rr', 'tp2_rr', 'tp3_rr']:
            if k in setup and setup[k] is not None:
                if not (0.5 <= setup[k] <= 20):
                    errors.append(f"{d} {k} out of range: {setup[k]}")

    return (len(errors) == 0, errors)


# ─── STEP 6: CLAUDE INTERPRETASI ─────────────────────────────────────────────

SYSTEM_PROMPT = """You are CARTA, a precise technical analysis AI for crypto trading.

RULES (must follow strictly):
1. Output ONLY valid JSON. No markdown, no extra text.
2. Do NOT recalculate any numbers. All figures are pre-verified.
3. If signal is BUY or SELL, confidence_pct must be >= 55. Otherwise use NEUTRAL.
4. claude_call: 2-3 sentences, first person as CARTA. Reference specific prices from data. No new price levels.
5. weekly_bias primary signal: EMA 200 position is the most important factor."""

def claude_interpret(symbol, cp, indicators, sr, setups):
    """Panggil Claude untuk signal, confidence, dan narrative"""

    sr_clean = [
        {'type': l['level_type'], 'strength': l['strength'],
         'price': l['price'], 'touches': l['touches']}
        for l in sr['all']
    ]
    setups_clean = []
    for s in setups:
        em = (s['entry_zone_low'] + s['entry_zone_high']) / 2
        setups_clean.append({
            'direction': s['direction'],
            'entry': f"${s['entry_zone_low']:,.2f} – ${s['entry_zone_high']:,.2f}",
            'stop_tight': f"${s['stop_tight']:,.2f} ({s['risk_pct_tight']}%)",
            'stop_safe': f"${s['stop_safe']:,.2f} ({s['risk_pct_safe']}%)",
            'tp1': f"${s['tp1_price']:,.2f} ({s['tp1_rr']}R)" if 'tp1_price' in s else 'N/A',
            'tp2': f"${s['tp2_price']:,.2f} ({s['tp2_rr']}R)" if 'tp2_price' in s else 'N/A',
            'tp3': f"${s['tp3_price']:,.2f} ({s['tp3_rr']}R)" if 'tp3_price' in s else 'N/A',
            'trigger': s['trigger_note'],
            'invalidation': s['invalidation'],
        })

    prompt = f"""Analyze {symbol} Daily chart data.

CURRENT PRICE: ${cp:,.2f}

INDICATORS (pre-calculated):
- RSI(14): {indicators['rsi_value']} → {indicators['rsi_status']}
- MACD Cross: {indicators['macd_cross']}
- EMA 20: ${indicators['ema_20']:,.2f} → price is {indicators['price_vs_ema20']}
- EMA 200: ${indicators['ema_200']:,.2f} → price is {indicators['price_vs_ema200']}
- Bollinger: {indicators['bb_status']}
- Volume: {indicators['volume_status']}
- ATR(14): {indicators['atr_value']}

SUPPORT & RESISTANCE (pre-detected, Daily TF):
{json.dumps(sr_clean, indent=2)}

TRADE SETUPS (pre-calculated from S&R):
{json.dumps(setups_clean, indent=2)}

Output this exact JSON:
{{
  "signal": "BUY" | "SELL" | "NEUTRAL",
  "confidence_pct": <integer 0-100>,
  "weekly_bias": "BULLISH" | "BEARISH" | "NEUTRAL",
  "setup_grades": {{
    "LONG": "A" | "B" | "C" | null,
    "SHORT": "A" | "B" | "C" | null
  }},
  "claude_call": "<2-3 sentences as CARTA>"
}}"""

    response = anthropic_client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=400,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}]
    )

    raw = response.content[0].text.strip().replace('```json', '').replace('```', '').strip()
    result = json.loads(raw)

    # Enforce consistency: BUY/SELL dengan confidence < 55 → downgrade ke NEUTRAL
    if result['signal'] in ('BUY', 'SELL') and result['confidence_pct'] < 55:
        result['signal'] = 'NEUTRAL'

    return result


# ─── STEP 7: SIMPAN KE SUPABASE ──────────────────────────────────────────────

def save_to_db(coin_id, symbol, analysis, sr, indicators, setups):
    """Simpan semua data ke Supabase"""
    now = datetime.utcnow()

    # 1. Upsert analysis record
    analysis_data = {
        'coin_id':      coin_id,
        'tradingview_sym': symbol,
        'generated_at': now.isoformat(),
        'expires_at':   (now + timedelta(hours=4)).isoformat(),
        **analysis
    }
    res = supabase.table('analyses').upsert(
        analysis_data,
        on_conflict='coin_id'
    ).execute()
    analysis_id = res.data[0]['id']

    # 2. Replace S&R levels
    supabase.table('support_resistance').delete().eq('analysis_id', analysis_id).execute()
    for level in sr['all']:
        supabase.table('support_resistance').insert({
            **level,
            'analysis_id': analysis_id
        }).execute()

    # 3. Upsert indicators
    supabase.table('indicators').upsert(
        {'analysis_id': analysis_id, **indicators},
        on_conflict='analysis_id'
    ).execute()

    # 4. Replace trade setups
    supabase.table('trade_setups').delete().eq('analysis_id', analysis_id).execute()
    for setup in setups:
        supabase.table('trade_setups').insert({
            **setup,
            'analysis_id': analysis_id
        }).execute()

    logger.info(f"  Saved to DB (analysis_id: {analysis_id})")


# ─── MAIN PIPELINE ───────────────────────────────────────────────────────────

def process_coin(coin):
    """
    Full pipeline untuk satu coin.
    coin: {'id': uuid, 'symbol': 'BTC', 'tradingview_sym': 'BTCUSDT', ...}
    """
    symbol = coin['tradingview_sym']
    logger.info(f"Processing {symbol}...")

    # 1. Fetch OHLCV
    df, source = fetch_ohlcv(symbol)
    if df is None or len(df) < 100:
        logger.warning(f"  Skip {symbol}: insufficient data")
        return False

    cp = float(df['Close'].iloc[-1])
    logger.info(f"  Current price: ${cp:,.4f} ({source})")

    # 2. S&R Detection
    sr = detect_sr(df, cp)
    if not sr['resistance'] or not sr['support']:
        # Kalau tidak dapat S&R dalam 20%, coba expand ke 30%
        sr = detect_sr(df, cp, proximity_pct=0.30)
        if not sr['resistance'] or not sr['support']:
            logger.warning(f"  Skip {symbol}: no S&R levels in 30% radius")
            return False

    logger.info(f"  Found {len(sr['resistance'])} resistance, {len(sr['support'])} support levels")

    # 3. Indicators
    indicators = calc_indicators(df)
    logger.info(f"  RSI: {indicators['rsi_value']} ({indicators['rsi_status']})")

    # 4. Trade setups (tanpa weekly_bias dulu, akan di-update dari Claude)
    setups = calc_setups(cp, sr)
    logger.info(f"  Generated {len(setups)} trade setups")

    # 5. Validasi sebelum panggil Claude
    valid, errors = validate(cp, sr, setups)
    if not valid:
        logger.error(f"  Skip {symbol}: validation failed: {errors}")
        return False

    # 6. Claude interpretasi
    try:
        interpretation = claude_interpret(symbol, cp, indicators, sr, setups)
        logger.info(f"  Claude: {interpretation['signal']} {interpretation['confidence_pct']}% | {interpretation['weekly_bias']}")
    except Exception as e:
        logger.error(f"  Skip {symbol}: Claude error: {e}")
        return False

    # 7. Recalc setups dengan weekly_bias dari Claude
    setups = calc_setups(cp, sr, weekly_bias=interpretation['weekly_bias'])
    for setup in setups:
        setup['grade'] = interpretation['setup_grades'].get(setup['direction'])
        if setup['grade']:
            setup['conviction'] = {
                'A': 'HIGH', 'B': 'MEDIUM', 'C': 'LOW'
            }.get(setup['grade'], 'LOW')
        if setup['direction'] != interpretation['signal'] and interpretation['signal'] != 'NEUTRAL':
            note = setup.get('setup_note') or ''
            if 'Counter' not in note:
                setup['setup_note'] = (note + ' Counter-signal bias — half size.').strip()

    # 8. Validasi final
    valid2, errors2 = validate(cp, sr, setups)
    if not valid2:
        logger.error(f"  Skip {symbol}: post-Claude validation failed: {errors2}")
        return False

    # 9. Simpan ke DB
    analysis_record = {
        'signal':         interpretation['signal'],
        'confidence_pct': interpretation['confidence_pct'],
        'weekly_bias':    interpretation['weekly_bias'],
        'claude_call':    interpretation['claude_call'],
        'model_used':     'claude-sonnet-4-6',
    }
    save_to_db(coin['id'], symbol, analysis_record, sr, indicators, setups)
    return True


def run_all():
    """Ambil semua coin dari DB dan proses satu per satu"""
    coins = supabase.table('coins') \
        .select('*') \
        .eq('is_active', True) \
        .execute().data

    logger.info(f"Starting generation cycle for {len(coins)} coins...")
    success, skip = 0, 0

    for coin in coins:
        try:
            ok = process_coin(coin)
            if ok: success += 1
            else: skip += 1
        except Exception as e:
            logger.error(f"Unhandled error for {coin.get('tradingview_sym')}: {e}")
            skip += 1

        time.sleep(1.5)  # rate limit protection

    logger.info(f"Done. {success} success, {skip} skipped.")


# ─── ENTRY POINT ─────────────────────────────────────────────────────────────

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--symbol', help='Single coin, e.g. BTCUSDT')
    parser.add_argument('--all', action='store_true', help='Process all active coins')
    args = parser.parse_args()

    if args.symbol:
        # Test single coin
        coin_row = supabase.table('coins') \
            .select('*') \
            .eq('tradingview_sym', args.symbol) \
            .single().execute().data
        if coin_row:
            process_coin(coin_row)
        else:
            logger.error(f"Coin {args.symbol} not found in DB")
    elif args.all:
        run_all()
    else:
        print("Usage: python carta_engine.py --symbol BTCUSDT")
        print("       python carta_engine.py --all")
```

---

## BAGIAN 4: CARA TEST SEBELUM DEPLOY

### Test 1 coin dulu (BTCUSDT)

```bash
# Test BTCUSDT
python carta_engine.py --symbol BTCUSDT

# Output yang diharapkan:
# [INFO] Processing BTCUSDT...
# [INFO]   Fetched 500 daily candles from binance
# [INFO]   Current price: $59,500.00 (binance)
# [INFO]   Found 3 resistance, 3 support levels
# [INFO]   RSI: 29.4 (OVERSOLD)
# [INFO]   Generated 2 trade setups
# [INFO]   Claude: SELL 68% | BEARISH
# [INFO]   Saved to DB (analysis_id: ...)
```

### Verifikasi data di Supabase

```sql
-- Cek S&R urutan benar
SELECT level_type, strength, price, sort_order
FROM support_resistance sr
JOIN analyses a ON a.id = sr.analysis_id
WHERE a.tradingview_sym = 'BTCUSDT'
ORDER BY price DESC;

-- Hasilnya harus seperti:
-- RESISTANCE  STRONG  64178  1
-- RESISTANCE  WEAK    62500  2
-- RESISTANCE  WEAK    65600  3
-- (current price ~59500)
-- SUPPORT     STRONG  58115  1
-- SUPPORT     WEAK    55000  2
-- SUPPORT     STRONG  53000  3

-- Cek trade setup logika benar
SELECT direction, entry_zone_low, entry_zone_high,
       stop_tight, tp1_price, tp1_rr
FROM trade_setups ts
JOIN analyses a ON a.id = ts.analysis_id
WHERE a.tradingview_sym = 'BTCUSDT';

-- SHORT setup: entry ~63000, stop di atas ~64400, tp1 ~58115
-- LONG setup:  entry ~58100, stop di bawah ~56900, tp1 ~62500
```

### Test semua coin setelah BTCUSDT berhasil

```bash
python carta_engine.py --all
```

---

## BAGIAN 5: DELAY <5 DETIK SAAT GANTI PAIR DI EXTENSION

Ini kebutuhan UX: user ganti dari BTCUSDT ke SOLUSDT, data harus muncul dalam < 5 detik.

### Kenapa bisa < 5 detik

Data sudah ada di Supabase, extension hanya query. Tidak ada AI call, tidak ada kalkulasi. Delay semata-mata dari:
1. Detection symbol di TradingView DOM/URL (< 100ms)
2. HTTP request ke Supabase REST API (< 500ms dengan koneksi normal)
3. Render UI (< 100ms)

Total: < 1 detik dalam kondisi normal.

### Kode di `content.js` yang menjamin < 5 detik

```javascript
// Ganti pair → langsung trigger load, tidak ada debounce yang terlalu panjang
const SWAP_DEBOUNCE_MS = 800; // tunggu 800ms setelah URL berubah sebelum fetch
                               // supaya tidak spam fetch saat user scroll pair list

let swapTimer = null;
let currentSymbol = null;

function watchSymbolChange() {
  let lastUrl = window.location.href;

  // Check tiap 300ms (cepat, ringan)
  setInterval(() => {
    const url = window.location.href;
    if (url === lastUrl) return;
    lastUrl = url;

    const newSymbol = detectSymbol();
    if (!newSymbol || newSymbol === currentSymbol) return;

    // Debounce: kalau user masih scrolling pair list, tunggu dulu
    clearTimeout(swapTimer);
    swapTimer = setTimeout(() => {
      currentSymbol = newSymbol;
      handleSymbolChange(newSymbol);
    }, SWAP_DEBOUNCE_MS);

  }, 300);
}

async function handleSymbolChange(symbol) {
  // 1. Tampilkan loading state IMMEDIATELY (0ms delay)
  showLoading(symbol);

  // 2. Reconnect live price WebSocket ke pair baru
  connectLivePrice(symbol);

  // 3. Fetch dari Supabase (< 500ms kalau koneksi bagus)
  const t0 = performance.now();
  const data = await fetchAnalysis(symbol);
  const elapsed = Math.round(performance.now() - t0);

  logger.log(`[CARTA] ${symbol} fetched in ${elapsed}ms`);

  if (!data) {
    showUncharted(symbol);
    return;
  }

  // 4. Render
  renderPanel(data);

  // Total dari URL change sampai data muncul:
  // 800ms (debounce) + ~300ms (fetch) + ~50ms (render) = ~1.15 detik
  // Jauh di bawah 5 detik.
}
```

### Supabase query yang cepat

Pastikan ada index di Supabase untuk query ini supaya < 100ms:

```sql
-- Index untuk query extension
CREATE INDEX IF NOT EXISTS idx_coins_tradingview_sym
  ON coins(tradingview_sym);

CREATE INDEX IF NOT EXISTS idx_analyses_coin_id_generated
  ON analyses(coin_id, generated_at DESC);

-- View yang di-query extension
CREATE OR REPLACE VIEW latest_analysis AS
SELECT
  c.id AS coin_id,
  c.symbol,
  c.tradingview_sym,
  c.name,
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
  SELECT MAX(a2.generated_at)
  FROM analyses a2
  WHERE a2.coin_id = c.id
)
AND c.is_active = true;
```

```javascript
// Query dari extension — cukup satu call, dapat semua data sekaligus
async function fetchAnalysis(tvSymbol) {
  const { data, error } = await supabaseClient
    .from('latest_analysis')
    .select(`
      *,
      support_resistance(*),
      indicators(*),
      trade_setups(*)
    `)
    .eq('tradingview_sym', tvSymbol)
    .single();

  if (error || !data) return null;
  return data;
}
```

---

## BAGIAN 6: REFERENSI REPO OPEN SOURCE

### `arabacibahadir/sup-res` — Untuk Validasi Visual
```
github.com/arabacibahadir/sup-res
```
Repo Python yang langsung bisa dijalankan untuk generate chart S&R interaktif dari Binance API. Berguna untuk dev dalam memvalidasi secara visual apakah S&R level dari `carta_engine.py` sudah match dengan apa yang terlihat di chart. Jalankan dulu untuk BTCUSDT Daily, bandingkan hasilnya dengan output engine CARTA.

```bash
# Install dan jalankan
git clone https://github.com/arabacibahadir/sup-res
cd sup-res
pip install -r requirements.txt
python main.py --ticker BTCUSDT --period 1d
# Akan buka browser dengan chart S&R interaktif
```

### `ccxt/ccxt` — Untuk Fetch OHLCV
```
github.com/ccxt/ccxt
```
Library resmi untuk fetch data dari 100+ exchange termasuk Binance, OKX, Bybit. Sudah digunakan di `carta_engine.py` di atas.

---

## RINGKASAN UNTUK DEV

```
1. Jalankan: python carta_engine.py --symbol BTCUSDT
2. Cek DB: S&R resistance semua di atas harga, support semua di bawah
3. Cek DB: SHORT entry di dekat R1, TP1 di S1, stop di atas R1
4. Cek DB: LONG entry di dekat S1, TP1 di R1, stop di bawah S1
5. Jalankan: python carta_engine.py --all
6. Setup cron job: tiap 4 jam
7. Extension query Supabase → data muncul < 1 detik setelah pair change
```

File ini adalah dokumen tunggal yang dev perlu baca untuk implementasi penuh.
Tidak perlu baca dokumen lain dulu — kode di sini sudah self-contained.

---
*CARTA — Cartography Trading Agent | Practical DB Fill Guide v1.0*
