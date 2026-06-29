-- CreateEnum
CREATE TYPE "Signal" AS ENUM ('BUY', 'SELL', 'NEUTRAL');

-- CreateEnum
CREATE TYPE "WeeklyBias" AS ENUM ('BULLISH', 'BEARISH', 'NEUTRAL');

-- CreateEnum
CREATE TYPE "LevelType" AS ENUM ('SUPPORT', 'RESISTANCE');

-- CreateEnum
CREATE TYPE "Strength" AS ENUM ('STRONG', 'WEAK');

-- CreateEnum
CREATE TYPE "Direction" AS ENUM ('LONG', 'SHORT');

-- CreateEnum
CREATE TYPE "Grade" AS ENUM ('A', 'B', 'C');

-- CreateEnum
CREATE TYPE "Conviction" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "RsiStatus" AS ENUM ('OVERBOUGHT', 'OVERSOLD', 'NEUTRAL');

-- CreateEnum
CREATE TYPE "MacdCross" AS ENUM ('BULLISH', 'BEARISH', 'NONE');

-- CreateEnum
CREATE TYPE "PriceVsEma" AS ENUM ('ABOVE', 'BELOW');

-- CreateEnum
CREATE TYPE "BbStatus" AS ENUM ('SQUEEZE', 'EXPANSION', 'NORMAL');

-- CreateEnum
CREATE TYPE "VolumeStatus" AS ENUM ('ABOVE_AVG', 'BELOW_AVG', 'NORMAL');

-- CreateTable
CREATE TABLE "coins" (
    "coin_id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tradingview_sym" TEXT NOT NULL,
    "image_url" TEXT,
    "marketcap_usd" DOUBLE PRECISION,
    "market_cap_rank" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coins_pkey" PRIMARY KEY ("coin_id")
);

-- CreateTable
CREATE TABLE "analyses" (
    "id" TEXT NOT NULL,
    "coin_id" TEXT NOT NULL,
    "current_price" DOUBLE PRECISION NOT NULL,
    "price_change_24h" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "signal" "Signal" NOT NULL,
    "confidence_pct" INTEGER NOT NULL,
    "weekly_bias" "WeeklyBias" NOT NULL,
    "claude_call" TEXT NOT NULL,
    "signal_prev" "Signal",
    "trend_prev" TEXT,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_resistance" (
    "id" SERIAL NOT NULL,
    "analysis_id" TEXT NOT NULL,
    "level_type" "LevelType" NOT NULL,
    "strength" "Strength" NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "confluence_note" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "support_resistance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "indicators" (
    "id" SERIAL NOT NULL,
    "analysis_id" TEXT NOT NULL,
    "rsi_value" DOUBLE PRECISION NOT NULL,
    "rsi_status" "RsiStatus" NOT NULL,
    "macd_line" DOUBLE PRECISION,
    "macd_signal" DOUBLE PRECISION,
    "macd_histogram" DOUBLE PRECISION,
    "macd_cross" "MacdCross" NOT NULL,
    "ema20" DOUBLE PRECISION,
    "ema200" DOUBLE PRECISION,
    "price_vs_ema20" "PriceVsEma" NOT NULL,
    "price_vs_ema200" "PriceVsEma" NOT NULL,
    "bb_upper" DOUBLE PRECISION,
    "bb_middle" DOUBLE PRECISION,
    "bb_lower" DOUBLE PRECISION,
    "bb_status" "BbStatus" NOT NULL,
    "atr_value" DOUBLE PRECISION,
    "volume_status" "VolumeStatus" NOT NULL,

    CONSTRAINT "indicators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trade_setups" (
    "id" SERIAL NOT NULL,
    "analysis_id" TEXT NOT NULL,
    "direction" "Direction" NOT NULL,
    "grade" "Grade" NOT NULL,
    "conviction" "Conviction" NOT NULL,
    "entry_zone_low" DOUBLE PRECISION NOT NULL,
    "entry_zone_high" DOUBLE PRECISION NOT NULL,
    "stop_tight" DOUBLE PRECISION NOT NULL,
    "stop_safe" DOUBLE PRECISION NOT NULL,
    "risk_pct_tight" DOUBLE PRECISION NOT NULL,
    "risk_pct_safe" DOUBLE PRECISION NOT NULL,
    "tp1_price" DOUBLE PRECISION NOT NULL,
    "tp1_rr" DOUBLE PRECISION NOT NULL,
    "tp2_price" DOUBLE PRECISION NOT NULL,
    "tp2_rr" DOUBLE PRECISION NOT NULL,
    "tp3_price" DOUBLE PRECISION,
    "tp3_rr" DOUBLE PRECISION,
    "trigger_note" TEXT NOT NULL,
    "invalidation" TEXT NOT NULL,
    "setup_note" TEXT,

    CONSTRAINT "trade_setups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cron_state" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL DEFAULT '{}',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cron_state_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "coins_tradingview_sym_key" ON "coins"("tradingview_sym");

-- CreateIndex
CREATE INDEX "analyses_coin_id_generated_at_idx" ON "analyses"("coin_id", "generated_at" DESC);

-- CreateIndex
CREATE INDEX "support_resistance_analysis_id_idx" ON "support_resistance"("analysis_id");

-- CreateIndex
CREATE UNIQUE INDEX "indicators_analysis_id_key" ON "indicators"("analysis_id");

-- CreateIndex
CREATE INDEX "trade_setups_analysis_id_idx" ON "trade_setups"("analysis_id");

-- AddForeignKey
ALTER TABLE "analyses" ADD CONSTRAINT "analyses_coin_id_fkey" FOREIGN KEY ("coin_id") REFERENCES "coins"("coin_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_resistance" ADD CONSTRAINT "support_resistance_analysis_id_fkey" FOREIGN KEY ("analysis_id") REFERENCES "analyses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "indicators" ADD CONSTRAINT "indicators_analysis_id_fkey" FOREIGN KEY ("analysis_id") REFERENCES "analyses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade_setups" ADD CONSTRAINT "trade_setups_analysis_id_fkey" FOREIGN KEY ("analysis_id") REFERENCES "analyses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
