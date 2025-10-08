import * as React from "react";
import { LineChart } from "@mui/x-charts/LineChart";

export default function CustomChart({ wantedData, capturedData }) {
    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    return (
        <LineChart
            height={400}
            xAxis={[{ data: months, scaleType: "point" }]}
            series={[
                {
                    id: "captured",
                    label: "Captured",
                    data: wantedData,
                    color: "#10B981",
                    area: true,
                    point: { color: "#10B981" }
                },
                {
                    id: "wanted",
                    label: "Wanted",
                    data: capturedData,
                    color: "#E5565A",
                    area: true,
                    point: { color: "red", backgroundColor: 'red' }
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
                "& .MuiLineElement-root": {
                    strokeWidth: 2
                },
                "& .MuiAreaElement-root": {
                    fillOpacity: 0.2
                },
                "& .MuiMarkElement-root": {
                    r: 5
                }
            }}
        />
    );
}
