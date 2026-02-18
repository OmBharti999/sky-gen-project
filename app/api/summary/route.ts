import accounts from '../../_data/accounts.json';
import deals from '../../_data/deals.json';
import targets from '../../_data/targets.json';

function getAmount(d: any): number {
  return Number(d.amount ?? d.value ?? d.deal_amount ?? 0) || 0;
}

function parseDate(s: any) {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function quarterRangeFor(date = new Date()) {
  const year = date.getFullYear();
  const q = Math.floor(date.getMonth() / 3) + 1;
  const startMonth = (q - 1) * 3;
  const start = new Date(year, startMonth, 1);
  const end = new Date(year, startMonth + 3, 1);
  return { year, q, start, end };
}

export async function GET() {
  const now = new Date();
  const { start, end } = quarterRangeFor(now);
  const prev = new Date(start);
  prev.setMonth(prev.getMonth() - 3);
  const prevRange = quarterRangeFor(prev);

  const currentRevenue = deals
    .filter((d: any) => {
      const c = parseDate(d.closed_at);
      return c && c >= start && c < end;
    })
    .reduce((s: number, d: any) => s + getAmount(d), 0);

  const prevRevenue = deals
    .filter((d: any) => {
      const c = parseDate(d.closed_at);
      return c && c >= prevRange.start && c < prevRange.end;
    })
    .reduce((s: number, d: any) => s + getAmount(d), 0);

  // Sum monthly targets for quarter
  const monthKeys: string[] = [];
  for (let m = start.getMonth(); m < end.getMonth(); m++) {
    const mm = `${start.getFullYear()}-${String(m + 1).padStart(2, '0')}`;
    monthKeys.push(mm);
  }
  const targetQuarter = targets
    .filter((t: any) => monthKeys.includes(t.month))
    .reduce((s: number, t: any) => s + Number(t.target ?? 0), 0);

  const gapPct = targetQuarter ? ((targetQuarter - currentRevenue) / targetQuarter) * 100 : null;
  const changePct = prevRevenue ? ((currentRevenue - prevRevenue) / Math.max(prevRevenue, 1)) * 100 : null;

  return new Response(JSON.stringify({
    currentQuarterRevenue: currentRevenue,
    target: targetQuarter,
    gapPercent: gapPct,
    changePercentQoQ: changePct
  }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}
