import * as React from "react";
import { BarChart } from "@mui/x-charts/BarChart";

export default function CustomBar({ wantedData, capturedData, sightingData }) {
    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    return (
        <BarChart
            height={400}
            xAxis={[{ data: months, scaleType: "band" }]}
            series={[
                {
                    id: "wanted",
                    label: "Wanted",
                    data: wantedData,
                    color: "#E5565A"
                },
                {
                    id: "captured",
                    label: "Captured",
                    data: capturedData,
                    color: "#10B981"
                },
                {
                    id: "sighting",
                    label: "Sighting",
                    data: sightingData,
                    color: "#F59E0B"
                }
            ]}
            yAxis={[
                {
                    min: 0,
                    max: 300,
                    tickNumber: 7,
                    disableLine: true
                }
            ]}
            grid={{ horizontal: true, vertical: false }}
            slotProps={{
                legend: {
                    direction: 'horizontal',
                    position: {
                        vertical: 'bottom',
                        horizontal: 'center'
                    }
                }
            }}
            sx={{
                "& .MuiBarElement-root": {
                    rx: 4 // rounded bar corners
                }
            }}
        />
    );
}
