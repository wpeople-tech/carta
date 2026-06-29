-- =================================================================
-- latest_analysis VIEW
-- =================================================================
-- Diquery oleh extension via PostgREST:
--   GET /rest/v1/latest_analysis
--     ?tradingview_sym=eq.BINANCE:BTCUSDT
--     &select=*,support_resistance(*),indicators(*),trade_setups(*)
--
-- View ini expose satu baris per coin (analisis terbaru yang belum expired).
-- Kolom-kolomnya exact match dengan interface Analysis di types.ts.
-- support_resistance, indicators, trade_setups di-resolve PostgREST
-- via FK ke analyses.id — karena itu id (dari analyses) harus di-expose.
-- =================================================================

CREATE OR REPLACE VIEW latest_analysis AS
SELECT
  -- FK yang dipakai PostgREST untuk resolve embedded relations
  a.id,

  -- Field yang dibutuhkan interface Analysis (types.ts)
  c.symbol,
  c.tradingview_sym,
  c.name,
  a.generated_at,
  a.expires_at,
  a.signal,
  a.confidence_pct,
  a.weekly_bias,
  a.claude_call,

  -- Harga terkini (dari analyses, di-update oleh refresh-prices cron)
  a.current_price,
  a.price_change_24h
FROM analyses a
JOIN coins c ON c.coin_id = a.coin_id
WHERE
  -- Hanya return yang belum expired
  a.expires_at > now()
  -- Hanya coin yang aktif
  AND c.is_active = true
  -- Hanya analisis terbaru per coin
  AND a.generated_at = (
    SELECT MAX(a2.generated_at)
    FROM analyses a2
    WHERE a2.coin_id = a.coin_id
      AND a2.expires_at > now()
  );

-- =================================================================
-- RLS: allow anonymous read (untuk PostgREST anon key dari extension)
-- Jalankan jika RLS aktif di project Supabase kamu.
-- =================================================================

-- Izinkan anon read view latest_analysis
GRANT SELECT ON latest_analysis TO anon;

-- Izinkan anon read tabel-tabel yang di-embed via FK
GRANT SELECT ON analyses          TO anon;
GRANT SELECT ON support_resistance TO anon;
GRANT SELECT ON indicators        TO anon;
GRANT SELECT ON trade_setups      TO anon;
GRANT SELECT ON coins             TO anon;

-- =================================================================
-- RLS policies untuk tabel utama (jika RLS enabled)
-- =================================================================

-- analyses
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon can read analyses"
  ON analyses FOR SELECT TO anon USING (true);

-- support_resistance
ALTER TABLE support_resistance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon can read support_resistance"
  ON support_resistance FOR SELECT TO anon USING (true);

-- indicators
ALTER TABLE indicators ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon can read indicators"
  ON indicators FOR SELECT TO anon USING (true);

-- trade_setups
ALTER TABLE trade_setups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon can read trade_setups"
  ON trade_setups FOR SELECT TO anon USING (true);

-- coins
ALTER TABLE coins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon can read coins"
  ON coins FOR SELECT TO anon USING (true);
