import { NextResponse } from "next/server";
import { prisma } from "@/app/_lib/prisma";
import { subDays } from "date-fns";
import { FINANCIAL_QUARTERS } from "@/app/constants";
import type { RecommendationsApiResponse } from "@/app/_types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const quarterName = searchParams.get("quarter");

    // Validate quarter name
    if (!quarterName) {
      return NextResponse.json(
        { error: "Quarter parameter is required" },
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

    const now = new Date(quarter.startDate);
    const thirtyDaysAgo = subDays(now, 30);
    const fourteenDaysAgo = subDays(now, 14);

    // 1. Data Retrieval for Dynamic Logic
    const staleEnterpriseCount = await prisma.deal.count({
      where: {
        stage: { in: ["Prospecting", "Negotiation"] },
        created_at: { lt: thirtyDaysAgo },
        Account: { segment: "Enterprise" },
      },
    });

    const reps = await prisma.rep.findMany({
      include: {
        deals: { select: { stage: true } },
      },
    });

    const accountsWithNoActivity = await prisma.account.findMany({
      where: {
        deals: {
          every: {
            activities: {
              none: { timestamp: { gt: fourteenDaysAgo } },
            },
          },
        },
      },
      select: { segment: true },
    });

    // 2. Recommendation Logic
    const recommendations = [];

    // Suggestion for Stale Deals
    if (staleEnterpriseCount > 0) {
      recommendations.push({
        id: "rec-1",
        action: "Focus on aging deals in Enterprise segment",
        detail: `There are ${staleEnterpriseCount} high-value deals stuck for over 30 days.`,
      });
    }

    // Suggestion for Coaching (Finding rep with lowest win rate)
    const repStats = reps
      .map((rep) => {
        const won = rep.deals.filter((d) => d.stage === "ClosedWon").length;
        const total = rep.deals.filter((d) =>
          ["ClosedWon", "ClosedLost"].includes(d.stage),
        ).length;
        return {
          name: rep.name,
          winRate: total > 0 ? (won / total) * 100 : 100,
        };
      })
      .sort((a, b) => a.winRate - b.winRate);

    if (repStats.length > 0 && repStats[0].winRate < 20) {
      recommendations.push({
        id: "rec-2",
        action: `Coach ${repStats[0].name} to improve closing skills`,
        detail: `Current win rate is ${Math.round(repStats[0].winRate)}%, which is below target.`,
      });
    }

    // Suggestion for Inactive Accounts
    if (accountsWithNoActivity.length > 0) {
      const segmentCounts = accountsWithNoActivity.reduce((acc: any, curr) => {
        acc[curr.segment] = (acc[curr.segment] || 0) + 1;
        return acc;
      }, {});

      const topInactiveSegment = Object.keys(segmentCounts).reduce((a, b) =>
        segmentCounts[a] > segmentCounts[b] ? a : b,
      );

      recommendations.push({
        id: "rec-3",
        action: "Increase outreach to inactive accounts",
        detail: `Target the ${topInactiveSegment} segment specifically, as it has the highest concentration of silent accounts.`,
      });
    }

    const response: RecommendationsApiResponse = {
      status: "success",
      data: recommendations,
    };
    return NextResponse.json<RecommendationsApiResponse>(response);
  } catch (error) {
    console.error("Recommendations API Error:", error);
    const response: RecommendationsApiResponse = {
      status: "error",
      error: "Internal Server Error",
    };
    return NextResponse.json<RecommendationsApiResponse>(response, { status: 500 });
  }
}
