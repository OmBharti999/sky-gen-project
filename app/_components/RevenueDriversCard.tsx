import { Card, CardContent, Typography, Divider } from "@mui/material";
import { KpiRowChart } from "./KpiRowChart";
import type { DriversData } from "@/app/_types";

interface RevenueDriversCardProps {
  driversData: DriversData | null;
}

const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value.toFixed(0)}`;
};

const formatDelta = (value: number | null | undefined) => {
  if (value == null) return null;
  return value > 0 ? `+${value.toFixed(1)}` : `${value.toFixed(1)}`;
};

export const RevenueDriversCard = ({
  driversData,
}: RevenueDriversCardProps) => {
  const pipelineSparklineData = driversData?.pipeline.sparkline.map(
    (p) => p.value,
  ) || [];
  const winRateSparklineData = driversData?.winRate.sparkline.map(
    (p) => p.value,
  ) || [];
  const avgDealSizeSparklineData = driversData?.avgDealSize.sparkline.map(
    (p) => p.value,
  ) || [];
  const salesCycleSparklineData = driversData?.salesCycle.sparkline.map(
    (p) => p.value,
  ) || [];

  const pipelineDelta = formatDelta(driversData?.pipeline.delta);
  const winRateDelta = formatDelta(driversData?.winRate.delta);
  const avgDealSizeDelta = formatDelta(driversData?.avgDealSize.delta);
  const salesCycleDelta = formatDelta(driversData?.salesCycle.delta);

  return (
    <Card sx={{ maxWidth: 400, borderRadius: 2 }}>
      <CardContent>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Revenue Drivers
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <KpiRowChart
          label="Pipeline Value"
          value={formatCurrency(driversData?.pipeline.value || 0)}
          change={pipelineDelta || "N/A"}
          positive={
            driversData?.pipeline.delta != null &&
            driversData?.pipeline.delta >= 0
          }
          data={pipelineSparklineData}
        />

        <KpiRowChart
          label="Win Rate"
          value={`${driversData?.winRate.value.toFixed(1) || 0}%`}
          change={winRateDelta ? `${winRateDelta}%` : "N/A"}
          positive={
            driversData?.winRate.delta != null &&
            driversData?.winRate.delta >= 0
          }
          chartType="bar"
          data={winRateSparklineData}
        />

        <KpiRowChart
          label="Avg Deal Size"
          value={formatCurrency(driversData?.avgDealSize.value || 0)}
          change={avgDealSizeDelta ? `${avgDealSizeDelta}%` : "N/A"}
          positive={
            driversData?.avgDealSize.delta != null &&
            driversData?.avgDealSize.delta >= 0
          }
          data={avgDealSizeSparklineData}
        />

        <KpiRowChart
          label="Sales Cycle"
          value={`${driversData?.salesCycle.value.toFixed(0) || 0} Days`}
          change={salesCycleDelta ? `${salesCycleDelta} Days` : "N/A"}
          positive={
            driversData?.salesCycle.delta != null &&
            driversData.salesCycle.delta <= 0
          }
          data={salesCycleSparklineData}
        />
      </CardContent>
    </Card>
  );
};
