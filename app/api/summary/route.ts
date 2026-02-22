import { NextResponse } from "next/server";
import { prisma } from "@/app/_lib/prisma";
import { percentageToGoalCalculator } from "@/app/_lib/utils";
import { SummaryApiResponse } from "@/app/_types";
import { FINANCIAL_QUARTERS } from "@/app/constants";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const quarterName = searchParams.get("quarter");

  // Validate quarter name
  if (!quarterName) {
    return NextResponse.json(
      { error: "Quarter parameter is required" },
      { status: 400 },
    );
  }

  const quarter = FINANCIAL_QUARTERS.find((q) => q.name === quarterName);

  if (!quarter) {
    return NextResponse.json(
      { error: "Invalid quarter name" },
      { status: 400 },
    );
  }

  // Fetch Quarterly Revenue
  const revenue = await prisma.deal.findMany({
    where: {
      created_at: {
        gte: new Date(quarter.startDate),
        lte: new Date(quarter.endDate),
      },
      closed_at: {
        gte: new Date(quarter.startDate),
        lte: new Date(quarter.endDate),
        not: null,
      },
    },
    select: {
      amount: true,
    },
  });

  const quaterlyRevenue = revenue.reduce(
    (acc, deal) => acc + (deal?.amount || 0),
    0,
  );

  // Fetch Quarterly Target
  const target = await prisma.target.findMany();

  const quaterlyTarget = target.reduce((acc, target) => {
    if (
      new Date(target?.month) >= quarter.startDate &&
      new Date(target?.month) <= quarter.endDate
    ) {
      return acc + (target.target || 0);
    }
    return acc;
  }, 0);

  const percentageToGoal = percentageToGoalCalculator({
    revenue: quaterlyRevenue,
    target: quaterlyTarget,
  });

  return NextResponse.json<SummaryApiResponse>({
    data: {
      quaterlyRevenue,
      quaterlyTarget,
      quarter,
      percentageToGoal,
    },
    status: "success",
  });
}
