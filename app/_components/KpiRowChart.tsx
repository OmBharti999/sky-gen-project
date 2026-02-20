import React from "react";
import { Box, Typography } from "@mui/material";
import { KpiSparkline } from "@/app/_components/KpiSparkline";

type KpiRowProps = {
  label: string;
  value: string;
  change: string;
  positive?: boolean;
  chartType?: "area" | "bar";
  data: number[];
};

export const KpiRowChart: React.FC<KpiRowProps> = ({
  label,
  value,
  change,
  positive = true,
  chartType = "area",
  data,
}) => {
  return (
    <Box mb={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" fontWeight={600}>
          {label}
        </Typography>

        <Box display="flex" gap={2} alignItems="center">
          <Typography variant="body2" fontWeight={600}>
            {value}
          </Typography>

          <Typography
            variant="body2"
            fontWeight={600}
            color={positive ? "success.main" : "error.main"}
          >
            {change}
          </Typography>
        </Box>
      </Box>

      <KpiSparkline
        data={data}
        type={chartType}
        color={positive ? "#2f6fd0" : "#f59e0b"}
      />
    </Box>
  );
};
