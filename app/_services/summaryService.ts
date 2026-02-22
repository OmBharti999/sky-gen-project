import { SummaryApiResponse } from "@/app/_types";
import { SUMMARY_API_URL } from "@/app/constants";

export async function getSummaryData(
  currentQuarterName: string,
): Promise<SummaryApiResponse | null> {
  try {
    const response = await fetch(
      `${SUMMARY_API_URL}?quarter=${currentQuarterName}`,
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching summary data:", error);
    return null;
  }
}
