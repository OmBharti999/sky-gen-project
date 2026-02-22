"use client";

// app/_components/QuarterSwitcher.tsx
// Drop this anywhere in the Header or SummaryBanner to let users switch quarters.
// It pushes ?quarter=Q3+2025 to the URL which triggers a full server re-render.

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { FINANCIAL_QUARTERS, CURRENT_QUARTER_NAME } from "@/app/constants";
import type { QuarterName } from "@/app/_types";

export const QuarterSwitcher: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentParam = searchParams.get("quarter");
  const activeQuarter: QuarterName = FINANCIAL_QUARTERS.some(
    (q) => q.name === currentParam,
  )
    ? (currentParam as QuarterName)
    : CURRENT_QUARTER_NAME;

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("quarter", value);
    router.push(`?${params.toString()}`);
  }

  return (
    <FormControl size="small" sx={{ minWidth: 140 }}>
      <InputLabel sx={{ color: "rgba(255,255,255,0.6)" }}>Quarter</InputLabel>
      <Select
        value={activeQuarter}
        label="Quarter"
        onChange={(e) => handleChange(e.target.value)}
        sx={{
          color: "#fff",
          ".MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(255,255,255,0.2)",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(255,255,255,0.4)",
          },
          ".MuiSvgIcon-root": { color: "rgba(255,255,255,0.6)" },
        }}
      >
        {FINANCIAL_QUARTERS.map((q) => (
          <MenuItem key={q.name} value={q.name}>
            {q.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
