import type { RevenueTrendApiResponse } from "@/app/_types";
import { REVENUE_TREND_API_URL } from "@/app/constants";

export async function getRevenueTrendData(
  months: number = 6,
): Promise<RevenueTrendApiResponse> {
  const url = `${REVENUE_TREND_API_URL}?months=${encodeURIComponent(months)}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(
      `Failed to fetch revenue trend data: ${res.status} ${res.statusText}`,
    );
  }
  const json = await res.json();
  return json as RevenueTrendApiResponse;
}
