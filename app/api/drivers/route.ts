import deals from '../../_data/deals.json';

function getAmount(d: any): number { return Number(d.amount ?? d.value ?? d.deal_amount ?? 0) || 0 }
function parseDate(s: any) { if (!s) return null; const d = new Date(s); return isNaN(d.getTime()) ? null : d }

export async function GET() {
  const pipeline = deals.filter((d: any) => !d.closed_at).reduce((s: number, d: any) => s + getAmount(d), 0);

  const closed = deals.filter((d: any) => d.closed_at).map((d: any) => ({ ...d, amount: getAmount(d) }));
  const winCount = closed.filter((d: any) => (d.is_won ?? d.status === 'won' ?? d.stage === 'won') || true).length; // best-effort
  const winRate = closed.length ? (winCount / closed.length) * 100 : null;

  const avgDealSize = closed.length ? closed.reduce((s: number, d: any) => s + d.amount, 0) / closed.length : null;

  const cycleDays = closed
    .map((d: any) => {
      const created = parseDate(d.created_at ?? d.opened_at ?? d.createdAt);
      const closedAt = parseDate(d.closed_at);
      return created && closedAt ? (closedAt.getTime() - created.getTime()) / (1000 * 60 * 60 * 24) : null;
    })
    .filter((n: any) => n != null);
  const avgCycle = cycleDays.length ? cycleDays.reduce((s: number, n: number) => s + n, 0) / cycleDays.length : null;

  return new Response(JSON.stringify({ pipelineSize: pipeline, winRatePercent: winRate, averageDealSize: avgDealSize, averageSalesCycleDays: avgCycle }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}
