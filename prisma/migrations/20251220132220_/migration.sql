-- CreateTable
CREATE TABLE "gold_stores" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "logo" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gold_stores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gold_types" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'lượng',
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gold_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gold_daily_prices" (
    "id" SERIAL NOT NULL,
    "storeId" INTEGER NOT NULL,
    "goldTypeId" INTEGER NOT NULL,
    "buyPrice" DECIMAL(15,2) NOT NULL,
    "sellPrice" DECIMAL(15,2) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gold_daily_prices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gold_prices" (
    "id" SERIAL NOT NULL,
    "storeId" INTEGER NOT NULL,
    "goldTypeId" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "openBuy" DECIMAL(15,2) NOT NULL,
    "openSell" DECIMAL(15,2) NOT NULL,
    "closeBuy" DECIMAL(15,2) NOT NULL,
    "closeSell" DECIMAL(15,2) NOT NULL,
    "highBuy" DECIMAL(15,2) NOT NULL,
    "highSell" DECIMAL(15,2) NOT NULL,
    "lowBuy" DECIMAL(15,2) NOT NULL,
    "lowSell" DECIMAL(15,2) NOT NULL,
    "avgBuy" DECIMAL(15,2) NOT NULL,
    "avgSell" DECIMAL(15,2) NOT NULL,
    "changeAmount" DECIMAL(15,2) NOT NULL,
    "changePercent" DECIMAL(5,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gold_prices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crawler_logs" (
    "id" SERIAL NOT NULL,
    "storeName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "itemsCount" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crawler_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "gold_stores_code_key" ON "gold_stores"("code");

-- CreateIndex
CREATE INDEX "gold_stores_code_idx" ON "gold_stores"("code");

-- CreateIndex
CREATE INDEX "gold_stores_isActive_idx" ON "gold_stores"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "gold_types_code_key" ON "gold_types"("code");

-- CreateIndex
CREATE INDEX "gold_types_code_idx" ON "gold_types"("code");

-- CreateIndex
CREATE INDEX "gold_types_isActive_idx" ON "gold_types"("isActive");

-- CreateIndex
CREATE INDEX "gold_daily_prices_storeId_goldTypeId_idx" ON "gold_daily_prices"("storeId", "goldTypeId");

-- CreateIndex
CREATE INDEX "gold_daily_prices_timestamp_idx" ON "gold_daily_prices"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "gold_daily_prices_storeId_goldTypeId_timestamp_key" ON "gold_daily_prices"("storeId", "goldTypeId", "timestamp");

-- CreateIndex
CREATE INDEX "gold_prices_storeId_goldTypeId_date_idx" ON "gold_prices"("storeId", "goldTypeId", "date");

-- CreateIndex
CREATE INDEX "gold_prices_date_idx" ON "gold_prices"("date");

-- CreateIndex
CREATE UNIQUE INDEX "gold_prices_storeId_goldTypeId_date_key" ON "gold_prices"("storeId", "goldTypeId", "date");

-- CreateIndex
CREATE INDEX "crawler_logs_storeName_idx" ON "crawler_logs"("storeName");

-- CreateIndex
CREATE INDEX "crawler_logs_status_idx" ON "crawler_logs"("status");

-- CreateIndex
CREATE INDEX "crawler_logs_startedAt_idx" ON "crawler_logs"("startedAt");

-- AddForeignKey
ALTER TABLE "gold_daily_prices" ADD CONSTRAINT "gold_daily_prices_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "gold_stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gold_daily_prices" ADD CONSTRAINT "gold_daily_prices_goldTypeId_fkey" FOREIGN KEY ("goldTypeId") REFERENCES "gold_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gold_prices" ADD CONSTRAINT "gold_prices_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "gold_stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gold_prices" ADD CONSTRAINT "gold_prices_goldTypeId_fkey" FOREIGN KEY ("goldTypeId") REFERENCES "gold_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;
