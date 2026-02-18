# THINKING

## Assumptions
- `deals.json` contains numeric amounts under `amount` or `value` or `deal_amount`.
- A deal with a non-null `closed_at` is treated as closed (counted as a win if explicit win flag missing).
- `created_at` / `createdAt` / `opened_at` may appear; code uses any available created timestamp.
- `targets.json` months use `YYYY-MM` strings.

## Data issues found
- Inconsistent field names across files (amount, value, createdAt, created_at, rep_id vs repId).
- No canonical "won/lost" flag in many deals — we fallback to treating closed deals as wins (conservative simplification).
- Timestamps may be missing or malformed; code defensively ignores those records.

## Tradeoffs
- Chose pragmatic, best-effort heuristics instead of strict schema validation so endpoints return useful results immediately.
- Kept computations in-memory and synchronous for simplicity.
- Recommendations are short, templated, and limited to a few items to stay actionable.

## What would break at 10× scale
- Loading full JSON into memory will become a bottleneck and increase memory usage dramatically.
- CPU-heavy aggregations should move to a background job or a proper analytical store (data warehouse).
- Concurrency and caching are needed to avoid repeated heavy computation on every request.

## What AI helped with vs what I decided
- AI (assistant) generated initial heuristics and suggested useful metrics (pipeline, win rate, cycle time).
- I decided on conservative defaults for missing fields and kept implementations defensive and simple.
