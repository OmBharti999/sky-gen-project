export const FINANCIAL_QUARTERS = [
  {
    name: "Q0 2025",
    startDate: new Date("2025-01-01"),
    endDate: new Date("2025-03-31"),
  },
  {
    name: "Q1 2025",
    startDate: new Date("2025-04-01"),
    endDate: new Date("2025-06-30"),
  },
  {
    name: "Q2 2025",
    startDate: new Date("2025-07-01"),
    endDate: new Date("2025-09-30"),
  },
  {
    name: "Q3 2025",
    startDate: new Date("2025-10-01"),
    endDate: new Date("2025-12-31"),
  },
  {
    name: "Q4 2026",
    startDate: new Date("2026-01-01"),
    endDate: new Date("2026-03-31"),
  },
];

export const CURRENT_QUARTER_NAME = FINANCIAL_QUARTERS[3].name; // Assuming current quarter is Q1 2025

export const NEXT_APP_URL = process.env.NEXT_APP_URL || "http://localhost:3000";
export const SUMMARY_API_URL = `${NEXT_APP_URL}/api/summary`;
export const DRIVERS_API_URL = `${NEXT_APP_URL}/api/drivers`;
export const REVENUE_TREND_API_URL = `${NEXT_APP_URL}/api/revenue-trend`;
export const RISK_FACTORS_API_URL = `${NEXT_APP_URL}/api/risk-factors`;
export const RECOMMENDATIONS_API_URL = `${NEXT_APP_URL}/api/recommendations`;