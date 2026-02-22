import { NextResponse } from "next/server";
import { prisma } from "@/app/_lib/prisma";
import { subDays } from "date-fns";
import type { RiskFactorsApiResponse } from "@/app/_types";
import { FINANCIAL_QUARTERS } from "@/app/constants";

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

    // 1. Stale Enterprise Deals (Stuck > 30 days)
    const staleEnterpriseDealsCount = await prisma.deal.count({
      where: {
        stage: { in: ["Prospecting", "Negotiation"] },
        created_at: { lt: thirtyDaysAgo },
        Account: { segment: "Enterprise" },
      },
    });

    // 2. Specific Rep Performance: Ankit (R1)
    // Calculating Win Rate: (Won / (Won + Lost)) * 100
    const ankitDeals = await prisma.deal.findMany({
      where: { rep_id: "R1" },
      select: { stage: true },
    });

    const won = ankitDeals.filter((d) => d.stage === "ClosedWon").length;
    const lost = ankitDeals.filter((d) => d.stage === "ClosedLost").length;
    const totalClosed = won + lost;
    const ankitWinRate =
      totalClosed > 0 ? Math.round((won / totalClosed) * 100) : 0;

    // 3. Low Activity Accounts (No activity in last 14 days)
    const lowActivityAccountsCount = await prisma.account.count({
      where: {
        deals: {
          every: {
            activities: {
              none: {
                timestamp: { gt: fourteenDaysAgo },
              },
            },
          },
        },
      },
    });

    const response: RiskFactorsApiResponse = {
      status: "success",
      data: [
        {
          id: "risk-1",
          label: `${staleEnterpriseDealsCount} Enterprise deals stuck over 30 days`,
          severity: "high",
        },
        {
          id: "risk-2",
          label: `Rep Ankit – Win Rate: ${ankitWinRate}%`,
          severity: "medium",
        },
        {
          id: "risk-3",
          label: `${lowActivityAccountsCount} Accounts with no recent activity`,
          severity: "low",
        },
      ],
    };
    return NextResponse.json<RiskFactorsApiResponse>(response);
  } catch (error) {
    console.error("Risk Factor API Error:", error);
    const response: RiskFactorsApiResponse = {
      status: "error",
      error: "Internal Server Error",
    };
    return NextResponse.json<RiskFactorsApiResponse>(response, { status: 500 });
  }
}
