import type { DriversApiResponse } from "@/app/_types";

export async function getDriversData(quarter: string): Promise<DriversApiResponse> {
  const url = `/api/drivers?quarter=${encodeURIComponent(quarter)}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch drivers data: ${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  return json as DriversApiResponse;
}
