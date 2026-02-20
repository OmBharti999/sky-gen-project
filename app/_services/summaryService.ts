import { SUMMARY_API_URL } from "../constants";

interface Quarter {
  name: string;
  startDate: Date;
  endDate: Date;
}

interface SummaryData {
  quaterlyRevenue: number;
  quaterlyTarget: number;
  currentQuarter: Quarter;
}

interface ApiResponse {
  data: SummaryData;
  status: string;
}

export async function getSummaryData(): Promise<ApiResponse | null> {
  try {
    const response = await fetch(SUMMARY_API_URL);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching summary data:", error);
    return null;
  }
}
