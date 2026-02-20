import { Card, CardContent, Typography, Divider } from "@mui/material";
import { KpiRowChart } from "./KpiRowChart";

export const RevenueDriversCard = () => {
  return (
    <Card sx={{ maxWidth: 400, borderRadius: 2 }}>
      <CardContent>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Revenue Drivers
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <KpiRowChart
          label="Pipeline Value"
          value="$4.8M"
          change="+12%"
          positive
          data={[10, 12, 11, 14, 16, 15, 18, 20, 17, 16, 19, 22]}
        />

        <KpiRowChart
          label="Win Rate"
          value="18%"
          change="-4%"
          positive={false}
          chartType="bar"
          data={[5, 8, 12, 15, 11, 13, 16, 14, 12, 10, 18]}
        />

        <KpiRowChart
          label="Avg Deal Size"
          value="$21.3K"
          change="+3%"
          positive
          data={[8, 9, 7, 10, 8, 9, 7, 8, 9, 11, 10, 13]}
        />

        <KpiRowChart
          label="Sales Cycle"
          value="45 Days"
          change="+9 Days"
          positive
          data={[20, 22, 25, 30, 28, 26, 29, 24, 23, 27]}
        />
      </CardContent>
    </Card>
  );
};
