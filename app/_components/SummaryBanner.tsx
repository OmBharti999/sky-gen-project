import React from "react";
import { Box, Typography, Divider } from "@mui/material";

interface Props {
  label?: string;
  revenue: number;
  target: number;
}

/**
 * SummaryBanner displays a banner with a label, revenue, target, and
 * a percentage to the target.
 *
 * @param {string} [label="QTD Revenue"] - Label to display
 * @param {number} revenue - Revenue to display
 * @param {number} target - Target to display
 * @returns {React.ReactNode} - A React component displaying the banner
 */
export const SummaryBanner = ({
  label = "QTD Revenue",
  revenue,
  target,
}: Props) => {
  const percentage = Math.round(((revenue - target) / target) * 100);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(to right, #cfe3ff, #e8f1ff)",
        padding: "12px 24px",
        borderRadius: "4px",
        width: "100%",
        color: "black",
      }}
    >
      {/* Revenue */}
      <Typography variant="h6" fontWeight={600}>
        {label}:
        <Box component="span" fontWeight={800} ml={1}>
          ${revenue.toLocaleString()}
        </Box>
      </Typography>

      {/* Divider */}
      <Divider
        orientation="vertical"
        flexItem
        sx={{ mx: 3, borderColor: "#b0c4de" }}
      />

      {/* Target */}
      <Typography variant="h6" fontWeight={500}>
        Target:
        <Box component="span" ml={1}>
          ${target.toLocaleString()}
        </Box>
      </Typography>

      {/* Percentage */}
      <Typography
        variant="h6"
        ml={3}
        fontWeight={600}
        color={percentage < 0 ? "error.main" : "success.main"}
      >
        {percentage}% to Goal
      </Typography>
    </Box>
  );
};
