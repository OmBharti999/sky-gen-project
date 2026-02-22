// app/api/revenue-trend/route.ts

import { prisma } from "@/app/_lib/prisma";
import { DealStage } from "@/generated/prisma/enums";
import { NextResponse } from "next/server";
import type { RevenueTrendApiResponse } from "@/app/_types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function getMonthBounds(year: number, month: number) {
  return {
    start: new Date(year, month, 1, 0, 0, 0, 0),
    end: new Date(year, month + 1, 0, 23, 59, 59, 999),
  };
}

/** e.g. (2025, 9) → "Oct" */
function monthLabel(year: number, month: number) {
  return new Date(year, month, 1).toLocaleString("default", { month: "short" });
}

/** "2025-10" style key used to match targets.month */
function monthKey(year: number, month: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

/**
 * Returns the last N calendar months (oldest → newest).
 * e.g. today = Mar 2026, n = 6 → [Oct 25, Nov 25, Dec 25, Jan 26, Feb 26, Mar 26]
 */
function getLastNMonths(n: number) {
  const now = new Date();
  const result: { year: number; month: number }[] = [];

  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push({ year: d.getFullYear(), month: d.getMonth() });
  }

  return result;
}

/** Sum of deal amounts closed in a given window. Returns null if no deals exist at all. */
function revenueInWindow(
  deals: { amount: number | null; closed_at: Date | null }[],
  start: Date,
  end: Date
): number | null {
  const inWindow = deals.filter(
    (d) => d.closed_at !== null && d.closed_at >= start && d.closed_at <= end
  );
  // Return null when there is genuinely no data for that period
  // (e.g. prev-year month is before our dataset starts)
  if (inWindow.length === 0) return null;
  return inWindow.reduce((sum, d) => sum + (d.amount ?? 0), 0);
}

// ── Route ─────────────────────────────────────────────────────────────────────

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const monthsBack = Math.min(
    parseInt(searchParams.get("months") ?? "6", 10),
    12
  );

  if (isNaN(monthsBack) || monthsBack < 1) {
    return NextResponse.json(
      { error: "months must be a positive integer" },
      { status: 400 }
    );
  }

  const buckets = getLastNMonths(monthsBack);

  // Window covering current months + same months 1 year prior (for prevRevenue)
  const currentWindowStart = getMonthBounds(
    buckets[0].year,
    buckets[0].month
  ).start;
  const currentWindowEnd = getMonthBounds(
    buckets[buckets.length - 1].year,
    buckets[buckets.length - 1].month
  ).end;

  const prevWindowStart = new Date(currentWindowStart);
  prevWindowStart.setFullYear(prevWindowStart.getFullYear() - 1);
  const prevWindowEnd = new Date(currentWindowEnd);
  prevWindowEnd.setFullYear(prevWindowEnd.getFullYear() - 1);

  // ── Fetch data ─────────────────────────────────────────────────────────────

  // All ClosedWon deals in current window + prev year window in one query
  const wonDeals = await prisma.deal.findMany({
    where: {
      stage: DealStage.ClosedWon,
      closed_at: {
        gte: prevWindowStart, // covers both current and prev year
        lte: currentWindowEnd,
      },
      amount: { not: null },
    },
    select: { amount: true, closed_at: true },
  });

  // Targets — fetch all and match by month key
  const allTargets = await prisma.target.findMany({
    select: { month: true, target: true },
  });

  const targetMap = new Map(allTargets.map((t) => [t.month, t.target]));

  // ── Build response ─────────────────────────────────────────────────────────

  const data = buckets.map(({ year, month }) => {
    const { start, end } = getMonthBounds(year, month);

    // Same month, previous year
    const { start: prevStart, end: prevEnd } = getMonthBounds(year - 1, month);

    return {
      month: monthLabel(year, month),                          // "Oct"
      revenue: revenueInWindow(wonDeals, start, end),          // current month, null if no deals
      prevRevenue: revenueInWindow(wonDeals, prevStart, prevEnd), // same month last year, null if no data
      target: targetMap.get(monthKey(year, month)) ?? null,    // monthly target, null if not set
    };
  });

  return NextResponse.json<RevenueTrendApiResponse>({ data, status: "success" });
}