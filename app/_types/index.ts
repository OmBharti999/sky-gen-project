export interface Quarter {
  name: string;
  startDate: Date;
  endDate: Date;
}

export interface SummaryData {
  quaterlyRevenue: number;
  quaterlyTarget: number;
  quarter: Quarter;
  percentageToGoal: number | null;
  qoqChange: number | null;
}

export interface SummaryApiResponse {
  data: SummaryData;
  status: "success";
}

// ── Drivers API types ───────────────────────────────────────────────────────
export interface SparklinePoint {
  label: string;
  value: number;
}

export interface MetricWithSparkline {
  value: number;
  delta: number | null;
  sparkline: SparklinePoint[];
}

export interface DriversData {
  quarter: string;
  pipeline: MetricWithSparkline;
  winRate: MetricWithSparkline;
  avgDealSize: MetricWithSparkline;
  salesCycle: MetricWithSparkline;
}

export interface DriversApiResponse {
  data: DriversData;
  status: "success";
}

// ── Revenue Trend API types ─────────────────────────────────────────────────
export interface RevenueTrendDataPoint {
  month: string;
  revenue: number | null;
  prevRevenue: number | null;
  target: number | null;
}

export interface RevenueTrendApiResponse {
  data: RevenueTrendDataPoint[];
  status: "success";
}

// ── Risk Factors API types ──────────────────────────────────────────────────
export type RiskSeverity = "high" | "medium" | "low";

export interface RiskFactor {
  id: string;
  label: string;
  severity: RiskSeverity;
}

export interface RiskFactorsApiResponse {
  status: "success" | "error";
  data?: RiskFactor[];
  error?: string;
}

// ── Recommendations API types ────────────────────────────────────────────────
export interface Recommendation {
  id: string;
  action: string;
  detail: string;
}

export interface RecommendationsApiResponse {
  status: "success" | "error";
  data?: Recommendation[];
  error?: string;
}
