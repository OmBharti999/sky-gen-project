import { NextResponse } from "next/server";
import { prisma } from "@/app/_lib/prisma";
import { subDays } from "date-fns";

export async function GET() {
  try {
    const now = new Date();
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
    const ankitWinRate = totalClosed > 0 ? Math.round((won / totalClosed) * 100) : 0;

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

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error("Risk Factor API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", status: "error" },
      { status: 500 }
    );
  }
}