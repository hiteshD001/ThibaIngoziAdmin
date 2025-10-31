import React, { useState } from 'react';
import {
    Box,
    Grid,
    Paper,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';






const dummyChartData = [
    { name: 'CapeTown', value: 400, color: '#3B82F6' },   // Red-pink
    { name: 'MidTown', value: 300, color: '#6366F1' },    // Blue
    { name: 'Durban', value: 300, color: '#8B5CF6' },    // Yellow
    { name: 'Johannesburg', value: 200, color: '#A855F7' },     // Teal
    { name: 'Santurn', value: 100, color: '#0EA5E9' },   // Purple
    { name: 'Other', value: 100, color: '#D1D5DB' },
];


const legendItems = [
    { label: 'CapeTown', color: '#3B82F6' },
    { label: 'MidTown', color: '#6366F1' },
    { label: 'Durban', color: '#8B5CF6' },
    { label: 'Johannesburg', color: '#A855F7' },
    { label: 'Santurn', color: '#0EA5E9' },
    { label: 'Other', color: '#D1D5DB' },
];

const CustomPie = (selectedProvince) => {
    return (
        <Box>

            {/* Middle Section: Pie Chart */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300, mb: 3 }}>
                <PieChart
                    series={[
                        {
                            data: dummyChartData.map(({ name, value, color }) => ({
                                id: name,
                                value,
                                color,
                            })),
                        },
                    ]}
                    width={300}
                    height={300}
                />
            </Box>


            {/* Bottom Section: Legend */}
            <Box sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: 2,
                pt: 2,
            }}>
                {legendItems.map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 16, height: 16, borderRadius: '4px', backgroundColor: item.color }} />
                        <Typography variant="body2">{item.label}</Typography>
                    </Box>
                ))}
            </Box>
        </Box >
    );
}

export default CustomPie;