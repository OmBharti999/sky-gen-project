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
import { CURRENT_QUARTER_NAME, FINANCIAL_QUARTERS } from "./constants";
import { getRevenueTrendData } from "./_services/revenueTrendService";
import { getRiskFactorsData } from "./_services/riskFactorsService";
import { getRecommendationsData } from "./_services/recommendationsService";
import type { QuarterName } from "./_types";

type HomeProps = {
  searchParams: Promise<{ quarter?: string }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const { quarter: quarterParam } = await searchParams;

  // Validate the query param against known quarters — fall back to current
  const quarter: QuarterName = FINANCIAL_QUARTERS.some(
    (q) => q.name === quarterParam,
  )
    ? (quarterParam as QuarterName)
    : CURRENT_QUARTER_NAME;

  const [
    summaryData,
    driversData,
    revenueTrendData,
    riskFactorsData,
    recommendationsData,
  ] = await Promise.all([
    getSummaryData(quarter),
    getDriversData(quarter),
    getRevenueTrendData({ quarter, previousMonths: 6 }),
    getRiskFactorsData(quarter),
    getRecommendationsData(quarter),
  ]);

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

          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <RevenueDriversCard driversData={driversData?.data || null} />
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              <Grid container direction="column" spacing={3}>
                <Grid
                  size={12}
                  sx={{ display: "flex", flexDirection: "row", gap: 4 }}
                >
                  <TopRiskFactors items={riskFactorsData?.data || []} />
                  <RecommendedActions items={recommendationsData?.data || []} />
                </Grid>

                <Grid size={12}>
                  <RevenueTrendChart data={revenueTrendData?.data || []} />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
}
