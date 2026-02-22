import { RECOMMENDATIONS_API_URL } from "@/app/constants";
import type { RecommendationsApiResponse } from "@/app/_types";

export async function getRecommendationsData(
  quarter: string,
): Promise<RecommendationsApiResponse> {
  const url = `${RECOMMENDATIONS_API_URL}?quarter=${encodeURIComponent(quarter)}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(
      `Failed to fetch recommendations data: ${res.status} ${res.statusText}`,
    );
  }
  const json = await res.json();
  return json as RecommendationsApiResponse;
}
