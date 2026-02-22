import type { DriversApiResponse } from "@/app/_types";
import { DRIVERS_API_URL } from "../constants";

export async function getDriversData(
  quarter: string,
): Promise<DriversApiResponse | null> {
  try {
    const response = await fetch(`${DRIVERS_API_URL}?quarter=${quarter}`);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch drivers data: ${response.status} ${response.statusText}`,
      );
    }
    const json = await response.json();
    return json as DriversApiResponse;
  } catch (error) {
    console.error("Error fetching drivers data:", error);
    return null;
  }
}
