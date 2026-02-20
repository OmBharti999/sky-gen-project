import { prisma } from "@/app/_lib/prisma";
import { FINANCIAL_QUARTERS } from "@/app/constants";
import { NextResponse } from "next/server";

export async function GET() {
  const currentQuarter = FINANCIAL_QUARTERS[0]; // Q1
  // Fetch Quarterly Revenue
  const revenue = await prisma.deal.findMany({
    where: {
      created_at: {
        gte: new Date(currentQuarter.startDate),
        lte: new Date(currentQuarter.endDate),
      },
      closed_at: {
        gte: new Date(currentQuarter.startDate),
        lte: new Date(currentQuarter.endDate),
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
      new Date(target?.month) >= currentQuarter.startDate &&
      new Date(target?.month) <= currentQuarter.endDate
    ) {
      return acc + (target.target || 0);
    }
    return acc;
  }, 0);

  return NextResponse.json({
    data: {
      quaterlyRevenue,
      quaterlyTarget,
      currentQuarter,
    },
    status: "success",
  });
}
