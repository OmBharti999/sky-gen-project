import { prisma } from "@/app/_lib/prisma";
import { DriversApiResponse } from "@/app/_types";
import { FINANCIAL_QUARTERS } from "@/app/constants";
import { DealStage } from "@/generated/prisma/enums";
import { daDK } from "@mui/material/locale";
import { NextResponse } from "next/server";

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Splits a quarter into 3 monthly buckets for sparkline data.
 * e.g. Q1 2025 (Apr–Jun) → [{Apr}, {May}, {Jun}]
 */
function getMonthlyBuckets(start: Date, end: Date) {
  const buckets: { label: string; start: Date; end: Date }[] = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    const bucketStart = new Date(cursor);
    const bucketEnd = new Date(
      cursor.getFullYear(),
      cursor.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );
    buckets.push({
      label: bucketStart.toLocaleString("default", {
        month: "short",
        year: "2-digit",
      }),
      start: bucketStart,
      end: bucketEnd > end ? new Date(end) : bucketEnd,
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return buckets;
}

/** Percentage change from prev to current. Returns null when prev is 0 or missing. */
function pctChange(current: number, prev: number | null): number | null {
  if (prev === null || prev === 0) return null;
  return ((current - prev) / prev) * 100;
}

/** Average days between created_at and closed_at for a set of deals. */
function avgCycleDays(
  deals: { created_at: Date; closed_at: Date | null }[],
): number {
  const withClose = deals.filter((d) => d.closed_at !== null);
  if (withClose.length === 0) return 0;
  return (
    withClose.reduce(
      (sum, d) =>
        sum +
        (d.closed_at!.getTime() - d.created_at.getTime()) /
          (1000 * 60 * 60 * 24),
      0,
    ) / withClose.length
  );
}

// ── Route ─────────────────────────────────────────────────────────────────────

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const quarterName = searchParams.get("quarter");

  if (!quarterName) {
    return NextResponse.json(
      { error: "quarter parameter is required" },
      { status: 400 },
    );
  }

  const quarterIndex = FINANCIAL_QUARTERS.findIndex(
    (q) => q.name === quarterName,
  );

  if (quarterIndex === -1) {
    return NextResponse.json(
      { error: "Invalid quarter name" },
      { status: 400 },
    );
  }

  const quarter = FINANCIAL_QUARTERS[quarterIndex];
  const prevQuarter =
    quarterIndex > 0 ? FINANCIAL_QUARTERS[quarterIndex - 1] : null;

  const buckets = getMonthlyBuckets(quarter.startDate, quarter.endDate);

  // ── 1. PIPELINE VALUE ──────────────────────────────────────────────────────
  //
  // All open (not closed) deals regardless of quarter — represents current
  // pipeline health. Sparkline shows cumulative open pipeline value as of each
  // month end (deals created on or before that date).

  const allOpenDeals = await prisma.deal.findMany({
    where: {
      stage: { notIn: [DealStage.ClosedWon, DealStage.ClosedLost] },
    },
    select: { amount: true, created_at: true },
  });

  const pipelineValue = allOpenDeals.reduce(
    (sum, d) => sum + (d.amount ?? 0),
    0,
  );

  const pipelineSparkline = buckets.map((b) => ({
    label: b.label,
    value: allOpenDeals
      .filter((d) => d.created_at <= b.end)
      .reduce((sum, d) => sum + (d.amount ?? 0), 0),
  }));

  // Previous quarter snapshot: open deals that existed before prev quarter end
  const prevPipelineValue = prevQuarter
    ? allOpenDeals
        .filter((d) => d.created_at <= prevQuarter.endDate)
        .reduce((sum, d) => sum + (d.amount ?? 0), 0)
    : null;

  // ── 2. WIN RATE ────────────────────────────────────────────────────────────
  //
  // Win rate = ClosedWon / (ClosedWon + ClosedLost) for deals closed this quarter.
  // Delta is absolute percentage points (e.g. 18% - 22% = -4pp → shown as "-4%").

  const closedThisQ = await prisma.deal.findMany({
    where: {
      stage: { in: [DealStage.ClosedWon, DealStage.ClosedLost] },
      closed_at: { gte: quarter.startDate, lte: quarter.endDate },
    },
    select: { stage: true, closed_at: true },
  });

  const wonThisQCount = closedThisQ.filter(
    (d) => d.stage === DealStage.ClosedWon,
  ).length;
  const winRateValue =
    closedThisQ.length > 0 ? (wonThisQCount / closedThisQ.length) * 100 : 0;

  const winRateSparkline = buckets.map((b) => {
    const inMonth = closedThisQ.filter(
      (d) => d.closed_at! >= b.start && d.closed_at! <= b.end,
    );
    const wonInMonth = inMonth.filter(
      (d) => d.stage === DealStage.ClosedWon,
    ).length;
    return {
      label: b.label,
      value: inMonth.length > 0 ? (wonInMonth / inMonth.length) * 100 : 0,
    };
  });

  let prevWinRate: number | null = null;
  if (prevQuarter) {
    const closedPrevQ = await prisma.deal.findMany({
      where: {
        stage: { in: [DealStage.ClosedWon, DealStage.ClosedLost] },
        closed_at: { gte: prevQuarter.startDate, lte: prevQuarter.endDate },
      },
      select: { stage: true },
    });
    const wonPrevQ = closedPrevQ.filter(
      (d) => d.stage === DealStage.ClosedWon,
    ).length;
    prevWinRate =
      closedPrevQ.length > 0 ? (wonPrevQ / closedPrevQ.length) * 100 : 0;
  }

  // ── 3. AVG DEAL SIZE ───────────────────────────────────────────────────────
  //
  // Average amount of Closed Won deals in the quarter.
  // Delta is relative % change vs previous quarter.

  const wonThisQ = await prisma.deal.findMany({
    where: {
      stage: DealStage.ClosedWon,
      closed_at: { gte: quarter.startDate, lte: quarter.endDate },
      amount: { not: null },
    },
    select: { amount: true, closed_at: true },
  });

  const avgDealSizeValue =
    wonThisQ.length > 0
      ? wonThisQ.reduce((s, d) => s + (d.amount ?? 0), 0) / wonThisQ.length
      : 0;

  const avgDealSizeSparkline = buckets.map((b) => {
    const inMonth = wonThisQ.filter(
      (d) => d.closed_at! >= b.start && d.closed_at! <= b.end,
    );
    return {
      label: b.label,
      value:
        inMonth.length > 0
          ? inMonth.reduce((s, d) => s + (d.amount ?? 0), 0) / inMonth.length
          : 0,
    };
  });

  let prevAvgDealSize: number | null = null;
  if (prevQuarter) {
    const wonPrevQ = await prisma.deal.findMany({
      where: {
        stage: DealStage.ClosedWon,
        closed_at: { gte: prevQuarter.startDate, lte: prevQuarter.endDate },
        amount: { not: null },
      },
      select: { amount: true },
    });
    prevAvgDealSize =
      wonPrevQ.length > 0
        ? wonPrevQ.reduce((s, d) => s + (d.amount ?? 0), 0) / wonPrevQ.length
        : 0;
  }

  // ── 4. SALES CYCLE ─────────────────────────────────────────────────────────
  //
  // Average days from created_at → closed_at for Closed Won deals.
  // Delta is absolute day difference (e.g. +9 Days means slower this quarter).

  const salesCycleDeals = await prisma.deal.findMany({
    where: {
      stage: DealStage.ClosedWon,
      closed_at: { gte: quarter.startDate, lte: quarter.endDate },
    },
    select: { created_at: true, closed_at: true },
  });

  const salesCycleValue = avgCycleDays(salesCycleDeals);

  const salesCycleSparkline = buckets.map((b) => {
    const inMonth = salesCycleDeals.filter(
      (d) => d.closed_at! >= b.start && d.closed_at! <= b.end,
    );
    return { label: b.label, value: avgCycleDays(inMonth) };
  });

  let prevSalesCycleValue: number | null = null;
  if (prevQuarter) {
    const prevSalesCycleDeals = await prisma.deal.findMany({
      where: {
        stage: DealStage.ClosedWon,
        closed_at: { gte: prevQuarter.startDate, lte: prevQuarter.endDate },
      },
      select: { created_at: true, closed_at: true },
    });
    prevSalesCycleValue = avgCycleDays(prevSalesCycleDeals);
  }

  const responseData = {
    quarter: quarterName,

    pipeline: {
      // Total open pipeline value in dollars
      value: pipelineValue,
      // Relative % change vs previous quarter (e.g. +12 → "+12%")
      delta: pctChange(pipelineValue, prevPipelineValue),
      // 3 monthly data points for sparkline
      sparkline: pipelineSparkline,
    },

    winRate: {
      // 0–100 percentage
      value: winRateValue,
      // Absolute pp difference (e.g. -4 → "-4%")
      delta: prevWinRate !== null ? winRateValue - prevWinRate : null,
      sparkline: winRateSparkline,
    },

    avgDealSize: {
      // Raw dollars
      value: avgDealSizeValue,
      // Relative % change (e.g. +3 → "+3%")
      delta: pctChange(avgDealSizeValue, prevAvgDealSize),
      sparkline: avgDealSizeSparkline,
    },

    salesCycle: {
      // Days (float)
      value: salesCycleValue,
      // Absolute day difference — positive means slower (e.g. +9 → "+9 Days")
      delta:
        prevSalesCycleValue !== null
          ? salesCycleValue - prevSalesCycleValue
          : null,
      sparkline: salesCycleSparkline,
    },
  };
  // ── Response ───────────────────────────────────────────────────────────────

  return NextResponse.json<DriversApiResponse>({
    data: responseData,
    status: "success",
  });
}
