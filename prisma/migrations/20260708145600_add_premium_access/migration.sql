-- CreateTable
CREATE TABLE "premium_access" (
    "wallet_address" TEXT NOT NULL,
    "last_verified_at" TIMESTAMP(3) NOT NULL,
    "last_balance" DECIMAL(30,0) NOT NULL,
    "session_expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "premium_access_pkey" PRIMARY KEY ("wallet_address")
);
