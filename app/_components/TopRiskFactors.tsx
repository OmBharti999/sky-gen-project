import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Divider,
  Stack,
  Box,
} from "@mui/material";

type RiskItem = {
  id: number;
  text: string;
};

type TopRiskFactorsProps = {
  title?: string;
  items: RiskItem[];
};

export const TopRiskFactors: React.FC<TopRiskFactorsProps> = ({
  title = "Top Risk Factors",
  items,
}) => {
  return (
    <Card
      elevation={1}
      sx={{
        maxWidth: 400,
        borderRadius: 2,
      }}
    >
      <CardContent>
        {/* Title */}
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          {title}
        </Typography>

        <Divider sx={{ mb: 2 }} />

        {/* Risk List */}
        <Stack spacing={2}>
          {items.map((item, index) => (
            <React.Fragment key={item.id}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {/* Orange Dot */}
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: "#f59e0b",
                    mr: 2,
                  }}
                />

                <Typography variant="body2" fontWeight={500}>
                  {item.text}
                </Typography>
              </Box>

              {/* Divider between items (not after last) */}
              {index !== items.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};
