import { Box, Container, Grid } from "@mui/material";
import {
  Header,
  RecommendedActions,
  RevenueDriversCard,
  RevenueTrendChart,
  SummaryBanner,
  TopRiskFactors,
} from "./_components";
import { getSummaryData } from "./_services/summaryService";
import { getDriversData } from "./_services/driverService";
import { CURRENT_QUARTER_NAME } from "./constants";
import { getRevenueTrendData } from "./_services/revenueTrendService";

export default async function Home() {
  const summaryData = await getSummaryData(CURRENT_QUARTER_NAME);
  const driversData = await getDriversData(CURRENT_QUARTER_NAME);
  const revenueTrendData = await getRevenueTrendData({quarter: CURRENT_QUARTER_NAME, previousMonths: 6});
  return (
    <>
      <Header />
      <Box sx={{ backgroundColor: "#f3f4f6", minHeight: "100vh", py: 4 }}>
        <Container maxWidth="xl">
          <SummaryBanner
            revenue={summaryData?.data?.quaterlyRevenue || 0}
            target={summaryData?.data?.quaterlyTarget || 0}
            percentageToGoal={summaryData?.data?.percentageToGoal}
          />

          {/* Two‑column layout on desktop */}
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {/* Left column – Revenue Drivers (always on top on mobile) */}
            <Grid size={{ xs: 12, md: 4 }}>
              <RevenueDriversCard driversData={driversData?.data || null} />
            </Grid>

            {/* Right column – contains two cards + chart stacked */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Grid container direction="column" spacing={3}>
                {/* Top Risk Factors */}
                <Grid
                  size={12}
                  sx={{ display: "flex", flexDirection: "row", gap: 4 }}
                >
                  <TopRiskFactors
                    items={[
                      { id: 1, text: "23 Enterprise deals stuck over 30 days" },
                      { id: 2, text: "Rep Ankit – Win Rate: 11%" },
                      { id: 3, text: "15 Accounts with no recent activity" },
                    ]}
                  />
                  {/* Recommended Actions */}
                  <RecommendedActions
                    items={[
                      {
                        id: 1,
                        text: "Focus on aging deals in Enterprise segment",
                      },
                      { id: 2, text: "Coach Ankit to improve closing skills" },
                      {
                        id: 3,
                        text: "Increase outreach to inactive accounts",
                      },
                    ]}
                  />
                </Grid>

                {/* Revenue Trend Chart – now below the two right cards */}
                <Grid size={12}>
                  <RevenueTrendChart
                    data={revenueTrendData?.data || []}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
}
