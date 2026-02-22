import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Divider,
  Stack,
  Box,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { Recommendation } from "@/app/_types";

type RecommendedActionsProps = {
  title?: string;
  items: Recommendation[];
};

export const RecommendedActions: React.FC<RecommendedActionsProps> = ({
  title = "Recommended Actions",
  items,
}) => {
  return (
    <Card
      elevation={1}
      sx={{
        maxWidth: 400,
        borderRadius: 2,
        backgroundColor: "#f9fafb",
      }}
    >
      <CardContent>
        {/* Title */}
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          {title}
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <Stack spacing={2}>
          {items.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              All systems clear! No urgent actions recommended.
            </Typography>
          ) : (
            items.map((item, index) => (
              <React.Fragment key={item.id}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  {/* Orange Check Circle */}
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      backgroundColor: "#f59e0b",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mr: 2,
                    }}
                  >
                    <CheckIcon
                      sx={{
                        fontSize: 14,
                        color: "#fff",
                      }}
                    />
                  </Box>

                  <Typography variant="body2" fontWeight={500}>
                    {item.action}
                  </Typography>
                </Box>

                {index !== items.length - 1 && <Divider />}
              </React.Fragment>
            ))
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};
