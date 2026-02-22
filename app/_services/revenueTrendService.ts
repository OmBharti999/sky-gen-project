import type { RevenueTrendApiResponse } from "@/app/_types";
import { REVENUE_TREND_API_URL } from "@/app/constants";

export async function getRevenueTrendData({quarter, previousMonths}:
 {  quarter: string, previousMonths: number }
): Promise<RevenueTrendApiResponse> {
  // If string, it's a quarter name; if number, it's the number of months
  const months = previousMonths;
  const url = `${REVENUE_TREND_API_URL}?quarter=${encodeURIComponent(quarter)}&months=${encodeURIComponent(months)}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(
      `Failed to fetch revenue trend data: ${res.status} ${res.statusText}`,
    );
  }
  const json = await res.json();
  return json as RevenueTrendApiResponse;
}
