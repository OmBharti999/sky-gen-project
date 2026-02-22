import { prisma } from "@/app/_lib/prisma";
import { FINANCIAL_QUARTERS } from "@/app/constants";
import { DealStage } from "@/generated/prisma/enums";
import { NextResponse } from "next/server";

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

  const pipeLineDeals = await prisma.deal.findMany({
    where: {
      closed_at: null,
      stage: {
        notIn: [DealStage.ClosedWon, DealStage.ClosedLost],
      },
    },
    orderBy: {
      created_at: "asc",
    },
  });

  // const pileLineDealsPreviousAggregate = await prisma.deal.aggregate({
  //   where: {
  //     closed_at: null,
  //     stage: {
  //       notIn: [DealStage.ClosedWon, DealStage.ClosedLost],
  //     },
  //     created_at: {
  //       lte: quarter.startDate,
  //     },
  //   },
  //   _count: true,
  // });
  //     }

  const closedDeals = await prisma.deal.findMany({
    where: {
      stage: {
        in: [DealStage.ClosedWon, DealStage.ClosedLost],
      },
      closed_at: {
        gte: quarter.startDate,
        lte: quarter.endDate,
      },
    },
    orderBy: {
      closed_at: "asc",
    },
  });

  const allDeals = await prisma.deal.findMany({
    where: {
      created_at: {
        gte: quarter.startDate,
        lte: quarter.endDate,
      },
    },
    orderBy: {
      created_at: "asc",
    },
  });

  const salesCycleDeals = await prisma.deal.findMany({
    where: {
      closed_at: {
        gte: quarter.startDate,
        lte: quarter.endDate,
      },
    },
    orderBy: {
      closed_at: "asc",
    },
  });

  return new Response(
    JSON.stringify({
      pipeLineDeals,
      closedDeals,
      allDeals,
      salesCycleDeals,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}
