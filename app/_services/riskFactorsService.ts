import type { RiskFactorsApiResponse } from "@/app/_types";
import { RISK_FACTORS_API_URL } from "../constants";

export async function getRiskFactorsData(quarterName: string): Promise<RiskFactorsApiResponse> {
  const url = `${RISK_FACTORS_API_URL}?quarter=${encodeURIComponent(quarterName)}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(
      `Failed to fetch risk factors data: ${res.status} ${res.statusText}`
    );
  }
  const json = await res.json();
  return json as RiskFactorsApiResponse;
}
