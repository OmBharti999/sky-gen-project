export interface Quarter {
  name: string;
  startDate: Date;
  endDate: Date;
}

export interface SummaryData {
  quaterlyRevenue: number;
  quaterlyTarget: number;
  currentQuarter: Quarter;
  percentageToGoal: number | null;
}

export interface SummaryApiResponse {
  data: SummaryData;
  status: "success";
}
