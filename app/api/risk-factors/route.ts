import deals from '../../_data/deals.json';
import reps from '../../_data/reps.json';
import activities from '../../_data/activities.json';
import accounts from '../../_data/accounts.json';

function getAmount(d: any): number { return Number(d.amount ?? d.value ?? d.deal_amount ?? 0) || 0 }
function parseDate(s: any) { if (!s) return null; const d = new Date(s); return isNaN(d.getTime()) ? null : d }

export async function GET() {
  const now = new Date();
  // Stale deals: open deals older than 30 days
  const stale = deals.filter((d: any) => {
    if (d.closed_at) return false;
    const created = parseDate(d.created_at ?? d.opened_at ?? d.createdAt);
    if (!created) return false;
    const ageDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    return ageDays > 30;
  }).map((d: any) => ({ deal: d, ageDays: Math.floor((now.getTime() - (parseDate(d.created_at ?? d.opened_at ?? d.createdAt) || now).getTime()) / (1000*60*60*24)) }));

  // Underperforming reps: win rate below 50% of average
  const repStats: any = {};
  reps.forEach((r: any) => { repStats[r.rep_id || r.id || r.repId || r.name] = { rep: r, closed: 0, won: 0, revenue: 0 } });
  deals.forEach((d: any) => {
    const rid = d.rep_id ?? d.repId ?? d.owner_id ?? d.owner;
    if (!rid) return;
    const key = rid;
    if (!repStats[key]) repStats[key] = { rep: { rep_id: key }, closed: 0, won: 0, revenue: 0 };
    if (d.closed_at) {
      repStats[key].closed += 1;
      // treat closed deals as wins if no explicit flag
      repStats[key].won += (d.is_won ? 1 : 1);
      repStats[key].revenue += getAmount(d);
    }
  });
  const repList = Object.values(repStats).map((s: any) => ({ rep: s.rep, closed: s.closed, won: s.won, revenue: s.revenue, winRate: s.closed ? (s.won / s.closed) * 100 : null }));
  const avgWin = repList.filter((r: any) => r.winRate != null).reduce((a: number, b: any) => a + (b.winRate || 0), 0) / Math.max(1, repList.filter((r: any) => r.winRate != null).length);
  const underperforming = repList.filter((r: any) => r.winRate != null && r.winRate < avgWin * 0.5).slice(0, 10);

  // Low activity accounts: accounts with few activities in the year
  const actByAccount: any = {};
  activities.forEach((a: any) => {
    const aid = a.account_id ?? a.accountId ?? a.account;
    if (!aid) return;
    actByAccount[aid] = (actByAccount[aid] || 0) + 1;
  });
  const lowActivityAccounts = accounts.filter((acc: any) => (actByAccount[acc.account_id] || 0) < 2).slice(0, 50);

  return new Response(JSON.stringify({ staleDeals: stale.slice(0, 100), underperformingReps: underperforming, lowActivityAccounts }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}
