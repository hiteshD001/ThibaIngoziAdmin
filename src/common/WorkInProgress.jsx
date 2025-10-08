import React from "react";
import { Box, Typography, CircularProgress, Alert } from "@mui/material";
import ConstructionIcon from "@mui/icons-material/Construction";

const WorkInProgress = () => {
    return (
        <Box
            sx={{
                minHeight: "90vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
                textAlign: "center",
            }}
        >
            <ConstructionIcon sx={{ fontSize: 80, color: "primary.main" }} />
            <Typography variant="h4" fontWeight={600}>
                Work in Progress 🚧
            </Typography>
            <Typography variant="body1" color="text.secondary">
                We’re working on this feature. Stay tuned!
            </Typography>


            <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
                This page is under construction. Please check back later.
            </Alert>
        </Box>
    );
};

export default WorkInProgress;
