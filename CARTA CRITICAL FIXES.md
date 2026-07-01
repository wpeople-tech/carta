# CARTA — Critical Fixes & Architecture Overhaul
**Addendum to CARTA_DEV_BRIEF.md**
Status: URGENT — blocks production launch
Trigger: Bug report dari live testing OKBUSDT, June 22 2026

---

## 0. RINGKASAN EKSEKUTIF

Testing pertama di pair OKBUSDT menemukan data yang secara fundamental salah, bukan sekedar bug kecil:

1. Support muncul di atas resistance (urutan terbalik)
2. Take profit price negatif dengan R-multiple 69R–97R (mustahil secara matematis)
3. S/R levels terlalu jauh dari harga saat ini untuk dipakai sebagai entry/stop yang masuk akal
4. Tidak ada live price movement, panel terasa statis
5. Symbol detection hanya bekerja kalau persis format Binance/OKX

Root cause utama: **generation logic saat ini mengandalkan Claude untuk menghitung angka secara langsung** (S/R level, harga TP, R-multiple) tanpa validasi matematis apapun di belakangnya. LLM itu kuat untuk reasoning dan narrative, tapi tidak reliable untuk perhitungan presisi tinggi yang berulang ribuan kali (150+ coin × beberapa kali sehari). Sedikit kesalahan kalkulasi yang biasa terjadi pada LLM akan selalu lolos tanpa ada lapisan yang mengoreksinya.

Solusi yang diajukan di dokumen ini: **pisahkan "menghitung angka" dari "menginterpretasi angka"**. Library matematis yang sudah teruji (TA-Lib, scipy) menghitung semua angka pasti. Claude hanya membaca angka yang sudah benar dan menulis signal, grading, dan narrative. Ini menghilangkan kelas bug yang ditemukan di screenshot secara permanen, bukan menambal satu per satu.

---

## 1. ANALISA BUG DARI SCREENSHOT

Sebelum solusi, ini breakdown lengkap apa yang salah dan kenapa.

### Bug 1 — S/R levels terbalik

```
Screenshot menunjukkan:
Weak Resistance     $89
Weak Resistance     $87
Strong Resistance   $49
Strong Support       $181
Weak Support         $165
Weak Support          $104
```

Resistance seharusnya di atas harga saat ini dan urut turun mendekati harga. Support seharusnya di bawah harga dan urut turun menjauhi harga. Di screenshot, angka resistance ($89, $87, $49) lebih kecil dari angka support ($181, $165, $104) — kebalik total.

**Root cause:** Saat Claude generate JSON output untuk S/R levels, tidak ada validasi yang memastikan `resistance.price > current_price > support.price`. Kemungkinan Claude salah assign `level_type` ke value yang salah, atau parsing response dari Claude di backend salah mapping field.

### Bug 2 — TP price negatif, R-multiple mustahil

```
TP1   $-70.415846    ·  +69.7079222684471R
TP2   $-170.959743   ·  +97.4910911758259R
```

R-multiple dihitung dengan formula `(target_price - entry_price) / (entry_price - stop_price)`. Kalau formula ini diberikan ke Claude untuk dihitung secara mental dalam satu response generation bersama puluhan angka lain, kemungkinan salah hitung sangat tinggi — apalagi tidak ada unit test atau assertion yang menangkap hasil yang jelas tidak masuk akal sebelum disimpan ke DB.

**Root cause:** Tidak ada post-generation validation. Begitu Claude mengeluarkan angka, langsung disimpan ke Supabase tanpa dicek apakah angkanya make sense.

### Bug 3 — S/R terlalu jauh dari harga saat ini

Ini yang user highlight secara spesifik. Untuk pair dengan signal SELL, harusnya:
- Entry ada di sekitar resistance terdekat (zona dimana harga kemungkinan reject turun)
- Stop loss sedikit di atas resistance itu
- TP1, TP2, dst mengarah ke level support di bawahnya secara berurutan

Kalau S/R levels yang dihasilkan melompat jauh dari harga saat ini (selisih bisa berkali-kali lipat harga), entry zone yang dihasilkan juga ikut tidak masuk akal, dan trade setup secara keseluruhan tidak bisa dipakai untuk trading real.

**Root cause:** Tidak ada constraint pada Claude soal seberapa jauh level S/R boleh berjarak dari harga saat ini. Claude generate angka yang menurutnya "kelihatan masuk akal" tanpa batasan numerik yang jelas berdasarkan struktur data historis yang sebenarnya.

### Bug 4 — Tidak ada live price movement

Panel terlihat seperti screenshot statis, tidak ada indikasi bahwa harga bergerak real-time meskipun marketing CARTA bilang "real-time analysis".

### Bug 5 — Symbol detection terbatas ke satu exchange

Saat ini logic hanya bisa membaca format `EXCHANGE:SYMBOLUSDT` dari URL TradingView untuk exchange tertentu. User ingin ini bekerja di **semua exchange** yang ada di TradingView selama pair-nya vs USDT, tidak hardcoded ke Binance/Bybit/OKX saja.

---

## 2. ARSITEKTUR BARU — PEMISAHAN MATEMATIKA DAN NARASI

Ini adalah perubahan paling penting di dokumen ini. Arsitektur lama dan baru dibandingkan:

### Arsitektur LAMA (bermasalah)

```
OHLCV Data → Claude (hitung S/R + hitung TP + hitung R:R + tulis narrative) → Supabase
```

Semua angka dan narasi keluar dari satu kotak hitam yang sama. Tidak ada cara memvalidasi sebelum data masuk ke production.

### Arsitektur BARU (yang diajukan)

```
OHLCV Data (365 hari, dari CoinGecko/exchange API)
       │
       ▼
┌─────────────────────────────────────────────┐
│  LAYER 1 — MATEMATIKA (Python, deterministic) │
│                                               │
│  TA-Lib          → RSI, MACD, EMA, BB, ATR    │
│  scipy + sklearn → S/R level detection        │
│  Custom formula  → Entry/Stop/TP/R:R          │
│  Assertion layer → Validasi semua angka       │
└─────────────────────────────────────────────┘
       │
       │  (angka sudah pasti benar, terstruktur, lolos validasi)
       ▼
┌─────────────────────────────────────────────┐
│  LAYER 2 — INTERPRETASI (Claude via MCP)      │
│                                               │
│  Input: angka yang SUDAH BENAR dari Layer 1   │
│  Output:                                      │
│    - signal (BUY/SELL/NEUTRAL)                │
│    - confidence_pct                           │
│    - grade (A/B/C)                            │
│    - claude_call (narrative 2-3 kalimat)      │
│    - weekly_bias                              │
│                                               │
│  Claude TIDAK menghitung angka apapun.        │
│  Claude hanya membaca dan menginterpretasi.   │
└─────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────┐
│  LAYER 3 — VALIDASI SEBELUM SIMPAN            │
│                                               │
│  - resistance > current_price > support?      │
│  - entry_zone berada dekat level S/R terkait? │
│  - TP price > 0?                              │
│  - R-multiple dalam rentang wajar (0.5–15R)?  │
│  - Jika gagal validasi → reject, log error,   │
│    skip coin ini di siklus generate ini       │
└─────────────────────────────────────────────┘
       │
       ▼
   Supabase (hanya data yang sudah tervalidasi)
```

**Kenapa ini menghilangkan semua bug di atas secara permanen:**

- Bug 1 (S/R terbalik) → tidak mungkin terjadi lagi karena S/R dihitung oleh algoritma clustering yang secara matematis mengurutkan level berdasarkan posisi relatif terhadap harga, bukan oleh Claude yang menebak urutan
- Bug 2 (TP negatif, R-multiple mustahil) → tidak mungkin lolos karena Layer 3 secara eksplisit reject data yang TP-nya negatif atau R-multiple di luar rentang wajar sebelum sempat masuk ke Supabase
- Bug 3 (S/R terlalu jauh) → algoritma clustering dibatasi untuk hanya mengambil level dalam radius tertentu dari harga saat ini (lihat section 3.2)

---

## 3. IMPLEMENTASI LAYER 1 — MATEMATIKA

### 3.1 Indicator Calculation (TA-Lib)

TA-Lib adalah library C dengan Python binding yang sudah jadi standar industri selama 20+ tahun. Formula RSI, MACD, EMA, Bollinger Bands, ATR di TA-Lib identik dengan formula yang dipakai TradingView, sehingga angka yang keluar akan match dengan apa yang user lihat di chart mereka.

```python
import talib
import numpy as np

def calculate_indicators(ohlcv_df):
    """
    ohlcv_df: pandas DataFrame dengan kolom Open, High, Low, Close, Volume
    Return: dict semua indicator values, sudah final, tidak perlu dihitung ulang oleh Claude
    """
    close = ohlcv_df['Close'].values
    high = ohlcv_df['High'].values
    low = ohlcv_df['Low'].values
    volume = ohlcv_df['Volume'].values

    # RSI
    rsi = talib.RSI(close, timeperiod=14)
    rsi_value = round(float(rsi[-1]), 2)
    rsi_status = (
        'OVERSOLD' if rsi_value < 30 else
        'OVERBOUGHT' if rsi_value > 70 else
        'NEUTRAL'
    )

    # MACD
    macd_line, macd_signal, macd_hist = talib.MACD(close, fastperiod=12, slowperiod=26, signalperiod=9)
    macd_cross = (
        'BULLISH' if macd_hist[-1] > 0 and macd_hist[-2] <= 0 else
        'BEARISH' if macd_hist[-1] < 0 and macd_hist[-2] >= 0 else
        'NONE'
    )

    # EMA
    ema_20 = talib.EMA(close, timeperiod=20)
    ema_200 = talib.EMA(close, timeperiod=200)
    current_price = close[-1]

    # Bollinger Bands
    bb_upper, bb_middle, bb_lower = talib.BBANDS(close, timeperiod=20, nbdevup=2, nbdevdn=2)
    bb_width = (bb_upper[-1] - bb_lower[-1]) / bb_middle[-1]
    bb_width_avg = np.mean((bb_upper[-20:] - bb_lower[-20:]) / bb_middle[-20:])
    bb_status = (
        'SQUEEZE' if bb_width < bb_width_avg * 0.7 else
        'EXPANSION' if bb_width > bb_width_avg * 1.3 else
        'NORMAL'
    )

    # ATR
    atr = talib.ATR(high, low, close, timeperiod=14)

    # Volume
    volume_avg_20 = np.mean(volume[-20:])
    volume_status = (
        'ABOVE_AVG' if volume[-1] > volume_avg_20 * 1.2 else
        'BELOW_AVG' if volume[-1] < volume_avg_20 * 0.8 else
        'NORMAL'
    )

    return {
        'rsi_value': rsi_value,
        'rsi_status': rsi_status,
        'macd_line': round(float(macd_line[-1]), 6),
        'macd_signal': round(float(macd_signal[-1]), 6),
        'macd_histogram': round(float(macd_hist[-1]), 6),
        'macd_cross': macd_cross,
        'ema_20': round(float(ema_20[-1]), 8),
        'ema_200': round(float(ema_200[-1]), 8),
        'price_vs_ema20': 'ABOVE' if current_price > ema_20[-1] else 'BELOW',
        'price_vs_ema200': 'ABOVE' if current_price > ema_200[-1] else 'BELOW',
        'bb_upper': round(float(bb_upper[-1]), 8),
        'bb_middle': round(float(bb_middle[-1]), 8),
        'bb_lower': round(float(bb_lower[-1]), 8),
        'bb_status': bb_status,
        'atr_value': round(float(atr[-1]), 6),
        'volume_status': volume_status,
    }
```

**Instalasi:**
```bash
pip install TA-Lib
# Jika gagal compile di server, gunakan wheel prebuilt:
pip install TA-Lib-binary
```

### 3.2 Support & Resistance Detection

Pendekatan: deteksi pivot points (local high/low) dari data historis, lalu cluster level yang berdekatan menggunakan `AgglomerativeClustering`. Ini pendekatan yang sama dipakai di package open-source `day0market/support_resistance` (referensi: github.com/day0market/support_resistance), prinsipnya kita adaptasi langsung untuk use case CARTA.

```python
import numpy as np
from sklearn.cluster import AgglomerativeClustering
from scipy.signal import argrelextrema

def detect_support_resistance(ohlcv_df, current_price, max_levels_each_side=2, proximity_pct=0.15):
    """
    ohlcv_df: pandas DataFrame dengan kolom High, Low, Close
    current_price: harga saat ini
    max_levels_each_side: berapa banyak level support dan resistance yang diambil
    proximity_pct: radius maksimum dari harga saat ini (0.15 = level harus dalam radius 15%)
                   INI YANG MENJAWAB KELUHAN "S/R terlalu jauh dari harga saat ini"

    Return: list of dict {level_type, strength, price, confluence_note}
    """
    high = ohlcv_df['High'].values
    low = ohlcv_df['Low'].values

    # 1. Deteksi pivot points (local maxima untuk resistance, local minima untuk support)
    order = 5  # jumlah candle di kiri-kanan untuk dianggap local extremum
    resistance_idx = argrelextrema(high, np.greater, order=order)[0]
    support_idx = argrelextrema(low, np.less, order=order)[0]

    resistance_pivots = high[resistance_idx]
    support_pivots = low[support_idx]

    # 2. FILTER WAJIB: hanya ambil pivot dalam radius proximity_pct dari harga saat ini
    #    Ini secara langsung memperbaiki Bug 3 (S/R terlalu jauh)
    resistance_pivots = resistance_pivots[
        (resistance_pivots > current_price) &
        (resistance_pivots < current_price * (1 + proximity_pct))
    ]
    support_pivots = support_pivots[
        (support_pivots < current_price) &
        (support_pivots > current_price * (1 - proximity_pct))
    ]

    def cluster_levels(pivots, n_clusters_max):
        """Cluster pivot points yang berdekatan jadi satu level, hitung berapa kali level itu 'disentuh'"""
        if len(pivots) == 0:
            return []

        pivots_reshaped = pivots.reshape(-1, 1)
        n_clusters = min(n_clusters_max, len(pivots))

        if len(pivots) == 1:
            return [{'price': float(pivots[0]), 'touches': 1}]

        clustering = AgglomerativeClustering(
            n_clusters=n_clusters,
            linkage='average'
        ).fit(pivots_reshaped)

        levels = []
        for cluster_id in set(clustering.labels_):
            cluster_prices = pivots[clustering.labels_ == cluster_id]
            levels.append({
                'price': float(np.median(cluster_prices)),
                'touches': len(cluster_prices)  # makin sering disentuh, makin kuat levelnya
            })

        return levels

    resistance_levels = cluster_levels(resistance_pivots, max_levels_each_side)
    support_levels = cluster_levels(support_pivots, max_levels_each_side)

    # 3. SORT WAJIB: resistance dari yang TERDEKAT ke harga saat ini, lalu menjauh
    #    Ini secara langsung memperbaiki Bug 1 (S/R terbalik)
    resistance_levels.sort(key=lambda x: x['price'])  # ascending, terdekat ke current price duluan
    support_levels.sort(key=lambda x: x['price'], reverse=True)  # descending, terdekat ke current price duluan

    # 4. Tentukan strength berdasarkan jumlah touches (semakin sering disentuh historis, semakin kuat)
    def classify_strength(levels):
        if not levels:
            return []
        touches = [l['touches'] for l in levels]
        median_touch = np.median(touches)
        for l in levels:
            l['strength'] = 'STRONG' if l['touches'] >= median_touch else 'WEAK'
        return levels

    resistance_levels = classify_strength(resistance_levels)
    support_levels = classify_strength(support_levels)

    # 5. Build output final dengan ASSERTION yang menjamin urutan benar
    result = []
    for i, level in enumerate(resistance_levels):
        assert level['price'] > current_price, \
            f"FATAL: resistance {level['price']} tidak di atas current_price {current_price}"
        result.append({
            'level_type': 'RESISTANCE',
            'strength': level['strength'],
            'price': round(level['price'], 8),
            'confluence_note': f"Touched {level['touches']}x in 365d" if level['touches'] > 2 else None,
            'sort_order': i + 1
        })

    for i, level in enumerate(support_levels):
        assert level['price'] < current_price, \
            f"FATAL: support {level['price']} tidak di bawah current_price {current_price}"
        result.append({
            'level_type': 'SUPPORT',
            'strength': level['strength'],
            'price': round(level['price'], 8),
            'confluence_note': f"Touched {level['touches']}x in 365d" if level['touches'] > 2 else None,
            'sort_order': i + 1
        })

    return result
```

**Instalasi:**
```bash
pip install scikit-learn scipy numpy
```

**Catatan penting soal `proximity_pct`:** Nilai 0.15 (15%) adalah starting point yang masuk akal untuk timeframe Daily, tapi sebaiknya di-tuning lagi setelah lihat hasil di beberapa coin dengan volatilitas berbeda (BTC vs altcoin kecil punya karakteristik berbeda). Kalau untuk coin tertentu hasil S/R kosong karena tidak ada pivot dalam radius, fallback ke radius lebih lebar (misal 25%) khusus untuk coin itu, dengan catatan di confluence_note.

### 3.3 Trade Setup Calculation (Entry/Stop/TP/R:R)

Ini bagian paling kritis karena di sinilah Bug 2 (TP negatif, R-multiple mustahil) berasal. Formula dipisah total dari Claude, dihitung murni matematis berdasarkan S/R levels yang sudah benar dari section 3.2.

```python
def calculate_trade_setup(current_price, sr_levels, direction='LONG'):
    """
    sr_levels: output dari detect_support_resistance() di atas
    direction: 'LONG' atau 'SHORT'

    Logic untuk LONG:
      - Entry zone: di sekitar support terdekat (level dimana harga kemungkinan bounce naik)
      - Stop: di bawah support itu
      - TP1, TP2, TP3: mengarah ke resistance levels di atasnya, berurutan

    Logic untuk SHORT (yang user contohkan di requirement):
      - Entry zone: di sekitar resistance terdekat (level dimana harga kemungkinan reject turun)
      - Stop: di atas resistance itu
      - TP1, TP2, TP3: mengarah ke support levels di bawahnya, berurutan
    """
    resistances = sorted(
        [l for l in sr_levels if l['level_type'] == 'RESISTANCE'],
        key=lambda x: x['price']
    )
    supports = sorted(
        [l for l in sr_levels if l['level_type'] == 'SUPPORT'],
        key=lambda x: x['price'],
        reverse=True
    )

    if direction == 'LONG':
        if not supports:
            return None  # tidak ada support dalam radius, skip setup ini

        nearest_support = supports[0]['price']

        entry_low = nearest_support * 0.998
        entry_high = nearest_support * 1.005
        stop_tight = nearest_support * 0.986   # 1.4% di bawah support
        stop_safe = nearest_support * 0.972    # 2.8% di bawah support

        targets = resistances[:3]  # ambil sampai 3 resistance terdekat sebagai TP1/TP2/TP3

    else:  # SHORT
        if not resistances:
            return None

        nearest_resistance = resistances[0]['price']

        entry_low = nearest_resistance * 0.995
        entry_high = nearest_resistance * 1.002
        stop_tight = nearest_resistance * 1.011   # 1.1% di atas resistance
        stop_safe = nearest_resistance * 1.022    # 2.2% di atas resistance

        targets = supports[:3]

    entry_mid = (entry_low + entry_high) / 2
    risk_tight = abs(entry_mid - stop_tight)
    risk_safe = abs(entry_mid - stop_safe)

    risk_pct_tight = round(abs(entry_mid - stop_tight) / entry_mid * 100, 2)
    risk_pct_safe = round(abs(entry_mid - stop_safe) / entry_mid * 100, 2)

    tp_data = {}
    for i, target in enumerate(targets[:3]):
        tp_price = target['price']
        reward = abs(tp_price - entry_mid)
        rr_ratio = round(reward / risk_tight, 1) if risk_tight > 0 else 0

        # ASSERTION WAJIB: tolak data yang tidak masuk akal
        # Ini secara langsung memperbaiki Bug 2 (TP negatif, R mustahil)
        assert tp_price > 0, f"FATAL: TP{i+1} price negatif: {tp_price}"
        assert 0 < rr_ratio <= 15, f"FATAL: R-multiple di luar rentang wajar: {rr_ratio}R"

        tp_data[f'tp{i+1}_price'] = round(tp_price, 8)
        tp_data[f'tp{i+1}_rr'] = rr_ratio

    # Trigger & invalidation text (template, bukan dari Claude)
    if direction == 'LONG':
        trigger_note = f"Wait for 4H candle close above ${round(entry_high, 4)}"
        invalidation = f"4H close below ${round(stop_tight, 4)}"
    else:
        trigger_note = f"4H bearish rejection wick inside ${round(entry_low,4)}–${round(entry_high,4)} zone"
        invalidation = f"4H close above ${round(stop_tight, 4)}"

    return {
        'direction': direction,
        'entry_zone_low': round(entry_low, 8),
        'entry_zone_high': round(entry_high, 8),
        'stop_tight': round(stop_tight, 8),
        'stop_safe': round(stop_safe, 8),
        'risk_pct_tight': risk_pct_tight,
        'risk_pct_safe': risk_pct_safe,
        'trigger_note': trigger_note,
        'invalidation': invalidation,
        **tp_data
    }
```

**Kenapa formula ini langsung menjawab requirement spesifik user** ("kalau bias sell maka harus entry di resistance dan stop loss diatasnya dan TP1 dst di support 1 dst"): logic `SHORT` di atas persis mengimplementasikan itu — entry dianchor ke `nearest_resistance`, stop di atas resistance, TP mengarah berurutan ke `supports[0]`, `supports[1]`, `supports[2]`.

### 3.4 Validation Layer (Layer 3)

Lapisan terakhir sebelum data masuk ke Supabase. Setiap analisis HARUS lolos semua check ini, kalau tidak, coin tersebut di-skip untuk siklus generate ini (lebih baik tidak menampilkan apa-apa daripada menampilkan data yang salah).

```python
def validate_analysis(current_price, sr_levels, trade_setups):
    """
    Return: (is_valid: bool, errors: list[str])
    """
    errors = []

    resistances = [l for l in sr_levels if l['level_type'] == 'RESISTANCE']
    supports = [l for l in sr_levels if l['level_type'] == 'SUPPORT']

    # Check 1: semua resistance di atas current_price
    for r in resistances:
        if r['price'] <= current_price:
            errors.append(f"Resistance {r['price']} tidak di atas current_price {current_price}")

    # Check 2: semua support di bawah current_price
    for s in supports:
        if s['price'] >= current_price:
            errors.append(f"Support {s['price']} tidak di bawah current_price {current_price}")

    # Check 3: tidak ada overlap antara resistance dan support
    if resistances and supports:
        min_resistance = min(r['price'] for r in resistances)
        max_support = max(s['price'] for s in supports)
        if max_support >= min_resistance:
            errors.append(f"Support {max_support} overlap dengan resistance {min_resistance}")

    # Check 4: trade setup TP harus positif dan R-multiple wajar
    for setup in trade_setups:
        for key in ['tp1_price', 'tp2_price', 'tp3_price']:
            if key in setup and setup[key] is not None and setup[key] <= 0:
                errors.append(f"{setup['direction']} {key} negatif: {setup[key]}")

        for key in ['tp1_rr', 'tp2_rr', 'tp3_rr']:
            if key in setup and setup[key] is not None:
                if not (0 < setup[key] <= 15):
                    errors.append(f"{setup['direction']} {key} di luar rentang wajar: {setup[key]}")

    # Check 5: entry zone harus dekat dengan S/R terkait (bukan di tempat acak)
    for setup in trade_setups:
        entry_mid = (setup['entry_zone_low'] + setup['entry_zone_high']) / 2
        distance_pct = abs(entry_mid - current_price) / current_price * 100
        if distance_pct > 20:
            errors.append(
                f"{setup['direction']} entry zone {distance_pct:.1f}% dari current price, "
                f"terlalu jauh untuk dipakai sebagai setup wajar"
            )

    return (len(errors) == 0, errors)


# Pemakaian di generate_analysis.py:
is_valid, errors = validate_analysis(current_price, sr_levels, trade_setups)

if not is_valid:
    logger.warning(f"Skip {symbol}: {errors}")
    continue  # lanjut ke coin berikutnya, JANGAN simpan data yang gagal validasi
else:
    supabase.table('analyses').upsert(analysis_data).execute()
```

---

## 4. PERAN CLAUDE SETELAH RESTRUKTUR (LAYER 2)

Claude tetap krusial di sistem ini, perannya berubah jadi lebih fokus dan jauh lebih reliable: **membaca angka yang sudah pasti benar, lalu menginterpretasi**. Ini jenis tugas yang Claude sangat kuat di dalamnya, dibanding "menghitung 15 angka presisi tinggi sekaligus tanpa salah".

```python
def generate_claude_interpretation(symbol, current_price, indicators, sr_levels, trade_setups):
    """
    Claude TIDAK diminta menghitung apapun.
    Claude hanya diberikan angka yang sudah final, dan diminta untuk:
    1. Menentukan signal (BUY/SELL/NEUTRAL)
    2. Menentukan confidence_pct
    3. Grading tiap trade setup (A/B/C)
    4. Menulis claude_call (narrative 2-3 kalimat)
    5. Menentukan weekly_bias
    """

    prompt = f"""You are CARTA, a technical analysis agent. You will be given PRE-CALCULATED, VERIFIED data for {symbol}. Do NOT recalculate any numbers. Your job is only to interpret what is given and provide a trading signal, confidence score, setup grades, and a brief narrative.

CURRENT PRICE: ${current_price}

INDICATORS (already calculated, do not recompute):
{json.dumps(indicators, indent=2)}

SUPPORT/RESISTANCE LEVELS (already calculated, do not recompute):
{json.dumps(sr_levels, indent=2)}

TRADE SETUPS (already calculated, do not recompute):
{json.dumps(trade_setups, indent=2)}

Based ONLY on interpreting the above data, respond in this exact JSON format:
{{
  "signal": "BUY" | "SELL" | "NEUTRAL",
  "confidence_pct": <integer 0-100>,
  "weekly_bias": "BULLISH" | "BEARISH" | "NEUTRAL",
  "setup_grades": {{
    "LONG": "A" | "B" | "C" | null,
    "SHORT": "A" | "B" | "C" | null
  }},
  "claude_call": "<2-3 sentence narrative interpreting the setup, written in first person as CARTA>"
}}

IMPORTANT: Output ONLY the JSON, no other text. Do not include any numbers in claude_call that aren't already present in the data above — describe and interpret, don't invent new figures."""

    response = anthropic_client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=600,
        messages=[{"role": "user", "content": prompt}]
    )

    result = json.loads(response.content[0].text)

    # Validasi tambahan: pastikan confidence_pct dan signal konsisten
    # (signal BUY/SELL dengan confidence_pct < 50 itu kontradiktif)
    if result['signal'] in ('BUY', 'SELL') and result['confidence_pct'] < 50:
        result['signal'] = 'NEUTRAL'  # downgrade otomatis kalau tidak konsisten

    return result
```

**Catatan penting soal "Claude harus berikan analisanya secara akurat":** poin ini sekarang sudah otomatis terjamin secara struktural, bukan karena Claude "berusaha lebih akurat", tapi karena Claude secara harfiah tidak diberi kesempatan untuk menghitung angka apapun yang bisa salah. Semua angka presisi sudah final sebelum sampai ke Claude. Ini pendekatan yang jauh lebih robust dibanding sekedar "tulis prompt yang lebih hati-hati", karena tidak bergantung pada konsistensi LLM dalam menghitung — yang notabene tetap LLM, walau dengan prompting sebaik apapun, secara fundamental tidak didesain untuk presisi numerik berulang.

---

## 5. LIVE PRICE MOVEMENT DI EXTENSION

User minta panel tidak terasa statis, dengan live price movement untuk pair yang sedang dianalisa. Ini dipisah total dari sistem analisis (yang tetap refresh tiap 4 jam) — live price murni untuk visual feedback bahwa harga bergerak, sumbernya langsung dari exchange, real-time, tanpa backend tambahan.

### Sumber: Binance WebSocket `@miniTicker` stream

Dipilih karena: gratis, tidak butuh API key, real-time, dan sudah jadi sumber data yang sangat umum dipakai untuk live ticker crypto. Latency rendah, koneksi persistent.

```javascript
// content.js — tambahan untuk live price

let priceWS = null;
let lastPrice = null;

function connectLivePrice(symbol) {
  // Tutup koneksi lama kalau ada (saat user ganti pair)
  if (priceWS) {
    priceWS.close();
  }

  const wsSymbol = symbol.toLowerCase(); // binance pakai lowercase: btcusdt
  const wsUrl = `wss://stream.binance.com:9443/ws/${wsSymbol}@miniTicker`;

  priceWS = new WebSocket(wsUrl);

  priceWS.onopen = () => {
    console.log(`[CARTA] Live price connected: ${symbol}`);
  };

  priceWS.onmessage = (event) => {
    const data = JSON.parse(event.data);
    const newPrice = parseFloat(data.c);  // 'c' = close price (harga terkini)
    const priceChangeDirection = lastPrice
      ? (newPrice > lastPrice ? 'up' : newPrice < lastPrice ? 'down' : 'same')
      : 'same';

    updateLivePriceUI(newPrice, priceChangeDirection);
    lastPrice = newPrice;
  };

  priceWS.onerror = (err) => {
    console.error('[CARTA] WebSocket error:', err);
  };

  priceWS.onclose = () => {
    // Reconnect otomatis setelah 3 detik kalau koneksi putus tanpa disengaja
    setTimeout(() => {
      if (currentSymbol === symbol) connectLivePrice(symbol);
    }, 3000);
  };
}

function updateLivePriceUI(price, direction) {
  const priceEl = document.querySelector('.carta-live-price');
  if (!priceEl) return;

  priceEl.textContent = `$${formatPrice(price)}`;
  priceEl.classList.remove('carta-price-up', 'carta-price-down');

  // Flash hijau/merah sesaat untuk indikasi pergerakan, lalu balik normal
  if (direction === 'up') {
    priceEl.classList.add('carta-price-up');
  } else if (direction === 'down') {
    priceEl.classList.add('carta-price-down');
  }

  setTimeout(() => {
    priceEl.classList.remove('carta-price-up', 'carta-price-down');
  }, 600);

  // Update juga posisi relatif terhadap S/R levels (current price row di panel)
  updateCurrentPriceRow(price);
}

// Panggil saat symbol berubah (di dalam watchSymbolChange callback yang sudah ada)
function loadAnalysis(symbol) {
  showLoading(symbol);
  connectLivePrice(symbol);  // ← tambahan baris ini

  fetchAnalysis(symbol).then(data => {
    if (!data) {
      showUncharted(symbol);
      return;
    }
    renderPanel(data);
  });
}
```

### CSS tambahan untuk live price indicator

```css
.carta-live-price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  background: var(--carta-ink);
  border-bottom: 1px solid var(--carta-border);
}

.carta-live-price-label {
  font-size: 9px;
  color: #888;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 5px;
}

.carta-live-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #4ADE80;
  animation: carta-live-pulse 1.5s infinite;
}

@keyframes carta-live-pulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.5); }
  50% { opacity: 0.6; box-shadow: 0 0 0 4px rgba(74, 222, 128, 0); }
}

.carta-live-price {
  font-family: var(--carta-mono);
  font-size: 14px;
  font-weight: 600;
  color: var(--carta-bg);
  transition: color 0.3s;
}

.carta-price-up {
  color: #4ADE80 !important;
}

.carta-price-down {
  color: #F87171 !important;
}
```

### Tambahan: current price marker di S/R list bergerak otomatis

Karena harga sekarang live, baris "CURRENT" di tengah daftar S/R levels juga perlu di-update posisinya secara dinamis berdasarkan harga real-time, bukan harga statis dari hasil generate 4 jam lalu:

```javascript
function updateCurrentPriceRow(livePrice) {
  const currentRow = document.querySelector('.carta-sr-row--current');
  if (!currentRow) return;

  // Cari level support/resistance terdekat dari livePrice yang sedang di-render
  const allLevels = window.cartaCurrentSRLevels; // disimpan saat renderSRLevels() dipanggil
  if (!allLevels) return;

  const nearestSupport = allLevels
    .filter(l => l.level_type === 'SUPPORT' && l.price < livePrice)
    .sort((a, b) => b.price - a.price)[0];

  if (nearestSupport) {
    const distPct = ((livePrice - nearestSupport.price) / nearestSupport.price * 100).toFixed(1);
    currentRow.querySelector('.carta-sr-current-label').textContent = `CURRENT · $${formatPrice(livePrice)}`;
    currentRow.querySelector('.carta-sr-current-dist').textContent = `+${distPct}% from support`;
  }
}
```

---

## 6. UNIVERSAL USDT DETECTION (SEMUA EXCHANGE)

User minta: extension harus bekerja untuk semua coin marketcap >$100M yang vs USDT, **tidak peduli exchange apa** yang sedang dibuka di TradingView (Binance, Bybit, OKX, Coinbase, Kraken, dll), selama format pair-nya berakhir USDT.

### Logic deteksi yang diperbaiki

Logic lama hanya cek `endsWith('USDT')` setelah strip prefix, yang sebenarnya sudah cukup universal — tapi masalahnya ternyata ada di edge case format penulisan exchange yang berbeda-beda. Contoh dari screenshot: `OKX:OKBUSDT`. Ini sebenarnya sudah tercover oleh logic lama. Yang BELUM tercover:

- Beberapa exchange pakai separator berbeda: `OKX:OKB/USDT` (dengan slash, bukan langsung digabung)
- Beberapa nama coin mengandung "USDT" sebagai bagian nama (jarang, tapi perlu di-guard)
- Futures/perpetual pairs kadang punya suffix tambahan: `BTCUSDT.P` atau `BTCUSDTPERP`

```javascript
function detectSymbol() {
  const urlParams = new URLSearchParams(window.location.search);
  const symbolParam = urlParams.get('symbol');

  if (!symbolParam) {
    return detectSymbolFromDOM();
  }

  const decoded = decodeURIComponent(symbolParam);

  // Strip exchange prefix: "OKX:OKBUSDT" → "OKBUSDT"
  // Bekerja untuk SEMUA exchange karena hanya split di ':', tidak hardcode nama exchange manapun
  let raw = decoded.includes(':') ? decoded.split(':')[1] : decoded;

  // Handle slash separator: "OKB/USDT" → "OKBUSDT"
  raw = raw.replace('/', '');

  // Strip suffix futures/perpetual: "BTCUSDT.P" → "BTCUSDT", "BTCUSDTPERP" → "BTCUSDT"
  raw = raw.replace(/\.P$/, '').replace(/PERP$/, '');

  raw = raw.toUpperCase();

  // Validasi akhir: harus berakhir USDT dan punya base currency yang masuk akal (minimal 2 karakter sebelum USDT)
  if (raw.endsWith('USDT') && raw.length > 4) {
    return raw; // contoh hasil akhir: "BTCUSDT", "OKBUSDT", "SOLUSDT"
  }

  return null;
}

function detectSymbolFromDOM() {
  // Fallback kalau URL tidak punya parameter symbol
  // TradingView render symbol di beberapa tempat berbeda tergantung versi UI mereka,
  // jadi kita coba beberapa selector sebagai fallback chain
  const selectors = [
    '[data-symbol-short]',
    '.chart-markup-table .title-wrapper',
    'div[class*="symbolName"]'
  ];

  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el) {
      const text = (el.getAttribute('data-symbol-short') || el.textContent || '').toUpperCase();
      const match = text.match(/([A-Z0-9]+USDT)\b/);
      if (match) return match[1];
    }
  }

  return null;
}
```

**Poin penting soal "tidak perlu exchange Binance/Bybit dll":** logic di atas memang sudah tidak hardcode ke exchange manapun — `split(':')[1]` bekerja sama untuk `BINANCE:`, `BYBIT:`, `OKX:`, `COINBASE:`, `KRAKEN:`, atau exchange apapun lain yang ada di TradingView, karena yang diambil hanya bagian setelah titik dua, apapun nama exchange-nya. Yang penting hanya hasil akhirnya berakhiran `USDT`.

### Konsekuensi penting untuk Layer 1 (backend generation)

Karena symbol yang sama (misal `BTCUSDT`) bisa muncul dari banyak exchange berbeda di TradingView, tapi **data analisis di Supabase tetap satu per coin** (bukan per exchange). Artinya:

- Database tetap simpan `tradingview_sym: 'BTCUSDT'` saja, tanpa exchange prefix
- OHLCV data untuk generate analysis sebaiknya diambil dari **satu sumber acuan yang konsisten** (disarankan Binance, karena volume dan liquiditasnya biasanya jadi acuan harga paling representatif), bukan dari exchange yang kebetulan sedang dibuka user
- User yang buka chart `OKX:BTCUSDT` dan user yang buka `BYBIT:BTCUSDT` akan melihat analisis yang sama persis, karena keduanya match ke `tradingview_sym: 'BTCUSDT'` yang sama di database

Ini sudah benar secara desain dari awal (lihat CARTA_DEV_BRIEF.md section 6), poin ini hanya konfirmasi ulang supaya tidak ada miskomunikasi soal kenapa data tidak per-exchange.

---

## 7. UPDATE REQUIREMENTS FILE PYTHON

```txt
# requirements.txt tambahan untuk backend generation

TA-Lib==0.4.32
scikit-learn==1.5.2
scipy==1.14.1
numpy==1.26.4
pandas==2.2.3
anthropic>=0.40.0
supabase>=2.9.0
```

---

## 8. UPDATED generate_analysis.py — FLOW LENGKAP

Ini gambaran flow akhir setelah semua perbaikan digabung jadi satu, menggantikan logic lama yang sepenuhnya bergantung pada Claude untuk hitung angka.

```python
def generate_analysis_for_coin(coin_symbol, ohlcv_df, current_price):
    """
    Flow lengkap generate analysis untuk satu coin.
    Dipanggil oleh cron job setiap 4 jam untuk semua coin yang lolos filter marketcap >$100M.
    """

    # LAYER 1 — Matematika (deterministic, tidak ada AI di sini)
    indicators = calculate_indicators(ohlcv_df)
    sr_levels = detect_support_resistance(ohlcv_df, current_price)

    trade_setups = []
    long_setup = calculate_trade_setup(current_price, sr_levels, direction='LONG')
    short_setup = calculate_trade_setup(current_price, sr_levels, direction='SHORT')

    if long_setup:
        trade_setups.append(long_setup)
    if short_setup:
        trade_setups.append(short_setup)

    # LAYER 3 — Validasi SEBELUM Claude dipanggil (hemat API call kalau data sudah jelas salah)
    is_valid, errors = validate_analysis(current_price, sr_levels, trade_setups)
    if not is_valid:
        logger.warning(f"Skip {coin_symbol} (pre-Claude validation failed): {errors}")
        return None

    # LAYER 2 — Interpretasi oleh Claude (hanya membaca, tidak menghitung)
    interpretation = generate_claude_interpretation(
        coin_symbol, current_price, indicators, sr_levels, trade_setups
    )

    # Gabungkan grade dari Claude ke masing-masing trade setup
    for setup in trade_setups:
        setup['grade'] = interpretation['setup_grades'].get(setup['direction'])
        setup['conviction'] = (
            'HIGH' if setup['grade'] == 'A' else
            'MEDIUM' if setup['grade'] == 'B' else
            'LOW'
        )
        if setup['direction'] != interpretation['signal']:
            # Tandai counter-trend setup dengan note otomatis (bukan dari Claude)
            setup['setup_note'] = f"Counter to {interpretation['signal']} bias. Half size only."

    analysis_record = {
        'symbol': coin_symbol,
        'generated_at': datetime.utcnow().isoformat(),
        'expires_at': (datetime.utcnow() + timedelta(hours=4)).isoformat(),
        'signal': interpretation['signal'],
        'confidence_pct': interpretation['confidence_pct'],
        'weekly_bias': interpretation['weekly_bias'],
        'claude_call': interpretation['claude_call'],
    }

    # LAYER 3 (final check) — Validasi sekali lagi setelah semua digabung, sebelum simpan
    is_valid_final, errors_final = validate_analysis(current_price, sr_levels, trade_setups)
    if not is_valid_final:
        logger.error(f"Skip {coin_symbol} (post-Claude validation failed): {errors_final}")
        return None

    return {
        'analysis': analysis_record,
        'sr_levels': sr_levels,
        'indicators': indicators,
        'trade_setups': trade_setups
    }


def run_generation_cycle():
    """Dipanggil oleh cron job setiap 4 jam"""
    coins = fetch_coins_above_marketcap(min_marketcap=100_000_000)

    success_count = 0
    skip_count = 0

    for coin in coins:
        try:
            ohlcv = fetch_ohlcv_binance(coin['tradingview_sym'], days=365)
            current_price = ohlcv['Close'].iloc[-1]

            result = generate_analysis_for_coin(coin['tradingview_sym'], ohlcv, current_price)

            if result is None:
                skip_count += 1
                continue

            save_to_supabase(coin['id'], result)
            success_count += 1

        except Exception as e:
            logger.error(f"Error processing {coin['tradingview_sym']}: {e}")
            skip_count += 1
            continue

    logger.info(f"Generation cycle done: {success_count} success, {skip_count} skipped")
```

---

## 9. TESTING CHECKLIST TAMBAHAN

Sebelum redeploy, validasi khusus untuk semua bug yang ditemukan:

- [ ] Generate analysis untuk OKBUSDT ulang, screenshot hasil baru, compare manual: resistance harus semua di atas current price, support semua di bawah
- [ ] Cek 10 coin random, pastikan tidak ada TP price negatif
- [ ] Cek 10 coin random, pastikan semua R-multiple antara 0.5R sampai 15R
- [ ] Cek entry zone untuk SHORT setup: harus dekat resistance terdekat, bukan harga acak
- [ ] Cek entry zone untuk LONG setup: harus dekat support terdekat
- [ ] Buka extension, buka chart `OKX:OKBUSDT`, lihat live price bergerak naik/turun dengan flash warna
- [ ] Ganti pair ke `BYBIT:SOLUSDT`, pastikan live price WebSocket reconnect ke pair baru
- [ ] Buka chart di 3 exchange berbeda untuk symbol yang sama (misal `BINANCE:BTCUSDT`, `OKX:BTCUSDT`, `BYBIT:BTCUSDT`), pastikan ketiganya menampilkan data analisis yang identik
- [ ] Coba buka chart futures/perpetual (`BTCUSDT.P` atau serupa), pastikan tetap ter-detect dengan benar
- [ ] Jalankan satu siklus generate penuh (150+ coin), cek log berapa yang ter-skip karena validasi gagal — kalau terlalu banyak yang skip, perlu tuning `proximity_pct` di section 3.2

---

## 10. RINGKASAN PERUBAHAN UNTUK DEV

| Area | Sebelum | Sesudah |
|---|---|---|
| S/R Level | Dihitung oleh Claude | Dihitung oleh `scipy` + `AgglomerativeClustering`, Claude hanya baca |
| Indicator (RSI/MACD/EMA/dst) | Dihitung oleh Claude | Dihitung oleh `TA-Lib`, Claude hanya baca |
| Entry/Stop/TP/R:R | Dihitung oleh Claude | Dihitung oleh formula Python deterministic, Claude hanya baca |
| Validasi data | Tidak ada | 3 lapis validasi (pre-Claude, post-Claude, sebelum simpan ke DB) |
| Live price | Tidak ada | Binance WebSocket `@miniTicker`, reconnect otomatis per pair |
| Symbol detection | Terbatas, kemungkinan hardcode beberapa exchange | Universal, bekerja untuk exchange manapun selama format `EXCHANGE:SYMBOLUSDT` |
| Peran Claude | Hitung angka + tulis narrative | Hanya interpretasi: signal, confidence, grading, narrative |

Perubahan ini scope-nya cukup besar (bukan sekedar patch kecil) karena akar masalahnya ada di arsitektur generation, bukan di satu baris kode yang salah. Tapi dengan pemisahan matematika dan interpretasi ini, kelas bug yang sama (angka salah, urutan terbalik, nilai mustahil) tidak akan muncul lagi di masa depan, karena setiap angka sekarang punya jalur deterministic yang bisa diverifikasi, bukan tergantung pada LLM untuk konsisten menghitung dengan benar setiap saat.

---

*CARTA — Cartography Trading Agent*
*Critical Fixes Addendum v1.0 | Built on MCPTrade | Powered by Anthropic Claude*
