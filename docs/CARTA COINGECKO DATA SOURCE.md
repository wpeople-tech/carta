# CARTA — Data Source Decision: CoinGecko & Live Price
**Addendum khusus: marketcap filter dan live price movement**
Status: Reference document untuk dev

---

## 0. PERTANYAAN YANG DIJAWAB DOKUMEN INI

Apakah CoinGecko bisa dipakai untuk dua kebutuhan CARTA berikut:

1. Filter coin dengan marketcap di atas $100 juta
2. Live price movement yang ditampilkan di panel extension (supaya tidak terasa statis)

Jawaban singkat: **ya untuk poin 1, tidak untuk poin 2**. Penjelasan lengkap dan kode implementasinya ada di bawah.

---

## 1. EVALUASI: COINGECKO VS BINANCE WEBSOCKET

Pertimbangan memakai CoinGecko untuk kedua kebutuhan sekaligus masuk akal dari sisi konsistensi satu sumber data. Tapi sebelum diputuskan, ini perbandingan langsung berdasarkan karakteristik teknis masing-masing:

| Aspek | CoinGecko API | Binance WebSocket |
|---|---|---|
| Protokol | REST only, tidak ada WebSocket | WebSocket native, push real-time |
| Update frequency (free tier) | Data di-cache 1-5 menit | Setiap event trade (~sub-detik) |
| Rate limit (free) | 5-15 calls/menit (30 dengan Demo key gratis) | Tidak ada limit praktis untuk 1 koneksi/symbol |
| Cara dapat data terbaru | Harus polling (call ulang tiap interval) | Push otomatis dari server, tidak perlu polling |
| Cocok untuk | Data yang wajar update tiap beberapa menit: marketcap, filter coin, OHLCV historis | Data yang harus terasa hidup tiap detik: live ticker |

### Masalah teknis kalau CoinGecko dipakai untuk live price di panel

Karena REST-only dan rate limit ketat di free tier, satu-satunya cara dapat "live" price adalah polling berulang (misal tiap 5-10 detik). Dengan rate limit 30 calls/menit untuk Demo key, itu setara maksimal 1 call setiap 2 detik, dan itu limit per IP untuk SEMUA user extension yang sedang aktif kalau backend memanggil dari satu server yang sama, bukan per-user.

Kalau dipanggil langsung dari sisi extension (client-side, per user), rate limit-nya jadi per-IP-user yang sebenarnya cukup. Tapi update tiap 5-10 detik secara visual tetap terasa "patah-patah" dibanding WebSocket yang mengalir halus tiap detik. Untuk fitur yang tujuannya memang supaya panel "tidak terasa statis", solusi yang sendirinya patah-patah tiap beberapa detik tidak akan menyelesaikan masalah yang diminta.

### Kesimpulan — pendekatan hybrid, bukan pilih salah satu

CoinGecko dan Binance sebenarnya cocok dipakai untuk dua kebutuhan yang berbeda karakteristiknya, dan keduanya tetap relevan dipakai bersamaan dalam satu sistem yang sama:

- **CoinGecko → untuk filter marketcap >$100M dan data OHLCV historis 365 hari.** Ini exactly tugas yang CoinGecko sudah jalankan sejak awal di MCPTrade (lihat `generate_analysis.py` di repo acuan x-cookie/mcp-trade-k1), dan data marketcap memang secara wajar tidak perlu update tiap detik. Update tiap beberapa jam (sesuai siklus cron job 4 jam) sudah lebih dari cukup. Endpoint yang dipakai: `/coins/markets`, bisa batch sampai 250 coin sekaligus dalam satu call, sangat efisien untuk filter 150+ coin tanpa boros rate limit.

- **Binance WebSocket → khusus untuk live price ticker di panel extension.** Ini satu-satunya bagian dari sistem yang betul-betul butuh update sub-detik supaya terasa hidup. REST API manapun, termasuk CoinGecko, secara struktural tidak didesain untuk use case ini. WebSocket memang dibuat khusus untuk kebutuhan seperti ini.

Pendekatan hybrid ini konsisten dengan prinsip umum di seluruh sistem CARTA: OHLCV untuk generate analysis tetap dari satu sumber acuan yang konsisten, sementara live ticker di sisi client extension secara natural butuh sumber yang berbeda karena kebutuhan real-time-nya berbeda kelas sama sekali.

### Kapan keputusan ini layak ditinjau ulang

Kalau ke depannya CARTA upgrade ke CoinGecko paid plan (Analyst $129/bulan ke atas), update price-nya jadi tiap 30 detik dan rate limit naik jadi 500 calls/menit. Di titik itu CoinGecko jadi lebih masuk akal dipakai juga untuk live price karena limitnya sudah longgar, dan bisa dipertimbangkan untuk menyatukan kembali jadi satu sumber data saja. Tapi untuk fase sekarang dengan free tier, Binance WebSocket tetap pilihan yang lebih solid secara teknis untuk bagian live ticker.

---

## 2. IMPLEMENTASI — COINGECKO UNTUK MARKETCAP FILTER

Update dari logic filter marketcap yang sudah ada di MCPTrade, dioptimalkan untuk batch request supaya hemat rate limit.

```python
import requests
import time

COINGECKO_BASE = "https://api.coingecko.com/api/v3"
# Demo API key gratis (daftar di coingecko.com/en/api/pricing), naikkan limit ke 30 calls/menit
COINGECKO_API_KEY = "YOUR_DEMO_API_KEY"

def fetch_coins_above_marketcap(min_marketcap=100_000_000, vs_currency='usd'):
    """
    Pakai /coins/markets, bisa batch 250 coin per request.
    Jauh lebih hemat rate limit dibanding loop /simple/price per coin satu-satu.
    """
    all_coins = []
    page = 1
    per_page = 250  # maksimum yang diizinkan CoinGecko per request

    while True:
        response = requests.get(
            f"{COINGECKO_BASE}/coins/markets",
            params={
                'vs_currency': vs_currency,
                'order': 'market_cap_desc',
                'per_page': per_page,
                'page': page,
                'sparkline': False
            },
            headers={'x-cg-demo-api-key': COINGECKO_API_KEY}
        )
        response.raise_for_status()
        data = response.json()

        if not data:
            break  # sudah habis semua coin

        # Filter berhenti di sini karena data sudah terurut market_cap_desc,
        # begitu ketemu yang di bawah threshold, sisanya pasti di bawah juga
        page_coins = [c for c in data if c['market_cap'] and c['market_cap'] >= min_marketcap]
        all_coins.extend(page_coins)

        if len(page_coins) < len(data):
            # Ada coin di halaman ini yang sudah di bawah threshold, berarti sudah final
            break

        page += 1
        time.sleep(2)  # jaga rate limit antar page (30 calls/menit = aman di 2 detik/call)

    return all_coins


def map_to_tradingview_symbol(coingecko_coin):
    """
    CoinGecko symbol biasanya lowercase tanpa USDT suffix (misal: 'btc', 'eth').
    Perlu di-map ke format TradingView yang dipakai di kolom tradingview_sym.
    """
    symbol = coingecko_coin['symbol'].upper()
    return f"{symbol}USDT"
```

**Catatan soal rate limit di flow generation:** karena filter marketcap dipanggil sekali per siklus cron job (tiap 4 jam), bukan tiap user buka chart, rate limit 30 calls/menit dari CoinGecko Demo key sama sekali tidak jadi masalah. Untuk cover 150-200 coin dengan batch 250/request, itu cuma butuh 1 request saja per siklus generate.

---

## 3. IMPLEMENTASI — BINANCE WEBSOCKET UNTUK LIVE PRICE

Dipilih karena gratis, tidak butuh API key, real-time, dan sudah jadi sumber data yang sangat umum dipakai untuk live ticker crypto. Latency rendah, koneksi persistent.

```javascript
// content.js — live price di panel extension

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

### CSS untuk live price indicator

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

### Current price marker di S/R list bergerak otomatis

Karena harga sekarang live, baris "CURRENT" di tengah daftar S/R levels juga perlu di-update posisinya secara dinamis berdasarkan harga real-time, bukan harga statis dari hasil generate 4 jam lalu.

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

## 4. RINGKASAN PEMBAGIAN TUGAS

| Sumber Data | Dipakai Untuk | Frekuensi Update | Dijalankan Di |
|---|---|---|---|
| CoinGecko `/coins/markets` | Filter marketcap >$100M | Tiap siklus cron job (4 jam) | Backend (`generate_analysis.py`) |
| CoinGecko (existing flow) | OHLCV historis 365 hari per coin | Tiap siklus cron job (4 jam) | Backend (`generate_analysis.py`) |
| Binance WebSocket `@miniTicker` | Live price ticker di panel | Real-time, sub-detik | Extension (`content.js`, client-side) |

Dua sumber ini tidak saling menggantikan, masing-masing menangani lapisan kebutuhan yang berbeda dalam sistem yang sama.

---

*CARTA — Cartography Trading Agent*
*Data Source Decision: CoinGecko & Live Price v1.0*
