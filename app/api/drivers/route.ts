import deals from '@/app/_data/deals.json';

interface Deal {
  deal_id?: string;
  account_id?: string;
  rep_id?: string;
  amount?: number | null;
  value?: number;
  deal_amount?: number;
  created_at?: string;
  opened_at?: string;
  closed_at?: string | null;
  is_won?: boolean;
  status?: string;
  stage?: string;
}

function getAmount(deal: Deal): number {
  return Number(deal.amount ?? deal.value ?? deal.deal_amount ?? 0) || 0;
}

function parseDate(dateString: string | null | undefined): Date | null {
  if (!dateString) return null;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
}

export async function GET() {
  const pipelineSize = deals
    .filter((deal: Deal) => !deal.closed_at)
    .reduce((sum: number, deal: Deal) => sum + getAmount(deal), 0);

  const closedDeals = deals
    .filter((deal: Deal) => deal.closed_at)
    .map((deal: Deal) => ({ ...deal, amount: getAmount(deal) }));

  const winCount = closedDeals
    .filter((deal: Deal) => deal.is_won || deal.status === 'won' || deal.stage === 'won')
    .length;

  const winRatePercent = closedDeals.length ? (winCount / closedDeals.length) * 100 : null;

  const averageDealSize = closedDeals.length
    ? closedDeals.reduce((sum: number, deal: Deal) => sum + (deal.amount || 0), 0) / closedDeals.length
    : null;

  const salesCycleDays = closedDeals
    .map((deal: Deal) => {
      const createdAt = parseDate(deal.created_at || deal.opened_at);
      const closedAt = parseDate(deal.closed_at);
      return createdAt && closedAt ? (closedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24) : null;
    })
    .filter((days: number | null): days is number => days != null);

  const averageSalesCycleDays = salesCycleDays.length
    ? salesCycleDays.reduce((sum: number, days: number) => sum + days, 0) / salesCycleDays.length
    : null;

  return new Response(
    JSON.stringify({
      pipelineSize,
      winRatePercent,
      averageDealSize,
      averageSalesCycleDays,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}
