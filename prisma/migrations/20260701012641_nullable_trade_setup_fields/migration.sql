-- Make all numeric and text fields in trade_setups nullable.
-- direction, grade, conviction remain NOT NULL (always determined).

ALTER TABLE "trade_setups" ALTER COLUMN "entry_zone_low"  DROP NOT NULL;
ALTER TABLE "trade_setups" ALTER COLUMN "entry_zone_high" DROP NOT NULL;
ALTER TABLE "trade_setups" ALTER COLUMN "stop_tight"      DROP NOT NULL;
ALTER TABLE "trade_setups" ALTER COLUMN "stop_safe"       DROP NOT NULL;
ALTER TABLE "trade_setups" ALTER COLUMN "risk_pct_tight"  DROP NOT NULL;
ALTER TABLE "trade_setups" ALTER COLUMN "risk_pct_safe"   DROP NOT NULL;
ALTER TABLE "trade_setups" ALTER COLUMN "tp1_price"       DROP NOT NULL;
ALTER TABLE "trade_setups" ALTER COLUMN "tp1_rr"          DROP NOT NULL;
ALTER TABLE "trade_setups" ALTER COLUMN "tp2_price"       DROP NOT NULL;
ALTER TABLE "trade_setups" ALTER COLUMN "tp2_rr"          DROP NOT NULL;
ALTER TABLE "trade_setups" ALTER COLUMN "trigger_note"    DROP NOT NULL;
ALTER TABLE "trade_setups" ALTER COLUMN "invalidation"    DROP NOT NULL;
