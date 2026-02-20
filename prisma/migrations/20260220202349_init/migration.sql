-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('demo', 'call', 'email');

-- CreateEnum
CREATE TYPE "Segment" AS ENUM ('SMB', 'MidMarket', 'Enterprise');

-- CreateEnum
CREATE TYPE "DealStage" AS ENUM ('ClosedWon', 'Prospecting', 'Negotiation', 'ClosedLost');

-- CreateEnum
CREATE TYPE "Industry" AS ENUM ('SaaS', 'Ecommerce', 'FinTech', 'EdTech', 'Healthcare');

-- CreateTable
CREATE TABLE "Account" (
    "id" SERIAL NOT NULL,
    "account_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "industry" "Industry" NOT NULL,
    "segment" "Segment" NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" SERIAL NOT NULL,
    "activity_id" TEXT NOT NULL,
    "deal_id" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deal" (
    "id" SERIAL NOT NULL,
    "deal_id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "rep_id" TEXT NOT NULL,
    "stage" "DealStage" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "closed_at" TIMESTAMP(3),

    CONSTRAINT "Deal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rep" (
    "id" SERIAL NOT NULL,
    "rep_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Rep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Target" (
    "id" SERIAL NOT NULL,
    "month" TEXT NOT NULL,
    "target" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Target_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_account_id_key" ON "Account"("account_id");

-- CreateIndex
CREATE INDEX "Account_account_id_idx" ON "Account"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "Activity_activity_id_key" ON "Activity"("activity_id");

-- CreateIndex
CREATE INDEX "Activity_activity_id_idx" ON "Activity"("activity_id");

-- CreateIndex
CREATE UNIQUE INDEX "Deal_deal_id_key" ON "Deal"("deal_id");

-- CreateIndex
CREATE INDEX "Deal_deal_id_idx" ON "Deal"("deal_id");

-- CreateIndex
CREATE UNIQUE INDEX "Rep_rep_id_key" ON "Rep"("rep_id");

-- CreateIndex
CREATE INDEX "Rep_rep_id_idx" ON "Rep"("rep_id");

-- CreateIndex
CREATE UNIQUE INDEX "Target_month_key" ON "Target"("month");

-- CreateIndex
CREATE INDEX "Target_month_idx" ON "Target"("month");

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "Deal"("deal_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_rep_id_fkey" FOREIGN KEY ("rep_id") REFERENCES "Rep"("rep_id") ON DELETE RESTRICT ON UPDATE CASCADE;
