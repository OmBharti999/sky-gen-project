export const FINANCIAL_QUARTERS = [
  {
    name: "Q1",
    startDate: new Date("2025-04-01"),
    endDate: new Date("2025-06-30"),
  },
  {
    name: "Q2",
    startDate: new Date("2025-07-01"),
    endDate: new Date("2025-09-30"),
  },
  {
    name: "Q3",
    startDate: new Date("2025-10-01"),
    endDate: new Date("2025-12-31"),
  },
  {
    name: "Q4",
    startDate: new Date("2026-01-01"),
    endDate: new Date("2026-03-31"),
  },
];

export const NEXT_APP_URL = process.env.NEXT_APP_URL || "http://localhost:3000";
export const SUMMARY_API_URL = `${NEXT_APP_URL}/api/summary`;