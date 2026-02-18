import deals from '../../_data/deals.json';
import reps from '../../_data/reps.json';
import accounts from '../../_data/accounts.json';
import activities from '../../_data/activities.json';

function parseDate(s: any) { if (!s) return null; const d = new Date(s); return isNaN(d.getTime()) ? null : d }
function getAmount(d: any): number { return Number(d.amount ?? d.value ?? d.deal_amount ?? 0) || 0 }

export async function GET() {
  const now = new Date();
  const staleDeals = deals.filter((d: any) => !d.closed_at && (() => {
    const c = parseDate(d.created_at ?? d.opened_at ?? d.createdAt);
    if (!c) return false;
    return ((now.getTime() - c.getTime()) / (1000*60*60*24)) > 30;
  })());

  // low win-rate reps (best effort)
  const repStats: any = {};
  reps.forEach((r: any) => repStats[r.rep_id ?? r.id ?? r.name] = { rep: r, closed: 0, won: 0 });
  deals.forEach((d: any) => {
    const rid = d.rep_id ?? d.repId ?? d.owner_id ?? d.owner;
    if (!rid) return;
    if (!repStats[rid]) repStats[rid] = { rep: { rep_id: rid }, closed: 0, won: 0 };
    if (d.closed_at) { repStats[rid].closed += 1; repStats[rid].won += (d.is_won ? 1 : 1); }
  });
  const repList = Object.values(repStats).map((s: any) => ({ rep: s.rep, winRate: s.closed ? (s.won / s.closed) * 100 : null }));
  repList.sort((a: any, b: any) => (a.winRate ?? 0) - (b.winRate ?? 0));

  const actByAccount: any = {};
  activities.forEach((a: any) => { const aid = a.account_id ?? a.accountId ?? a.account; if (!aid) return; actByAccount[aid] = (actByAccount[aid] || 0) + 1; });
  const lowActivity = accounts.filter((acc: any) => (actByAccount[acc.account_id] || 0) < 2).slice(0, 10);

  const recs: string[] = [];
  if (staleDeals.length) recs.push(`Focus on ${Math.min(staleDeals.length,5)} stale deals older than 30 days`);
  if (repList.length) recs.push(`Coach low-win-rate reps: ${repList.slice(0,3).map((r:any)=>r.rep.name||r.rep.rep_id).join(', ')}`);
  if (lowActivity.length) recs.push(`Increase activity for ${Math.min(lowActivity.length,3)} low-activity accounts`);
  if (recs.length < 3) recs.push('Review pipeline qualification criteria');

  return new Response(JSON.stringify({ recommendations: recs }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}
