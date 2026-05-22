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
import Loader from '../Loader';

const CustomPie = (data,isLoading) => {
   const chartData = data?.data?.map((item, index) => ({
        id: item.city_name,
        name: item.city_name,
        value: item.wanted_count,
        color: [
            '#3B82F6',
            '#6366F1',
            '#8B5CF6',
            '#A855F7',
            '#0EA5E9',
            '#D1D5DB',
        ][index % 6],
    }));
    
    return (
        <Box>

            {/* Middle Section: Pie Chart */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300, mb: 3 }}>
                {!chartData.length ?
                    (<Loader />): 
                    <PieChart
                        series={[
                            {
                                data: chartData.map(({ name, value, color }) => ({
                                    id: name,
                                    value,
                                    color,
                                })),
                            },
                        ]}
                        width={300}
                        height={300}
                    />
                }
            </Box>


            {/* Bottom Section: Legend */}
            <Box sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: 2,
                pt: 2,
            }}>
                {chartData.map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 16, height: 16, borderRadius: '4px', backgroundColor: item.color }} />
                        <Typography variant="body2">{item.name}</Typography>
                    </Box>
                ))}
            </Box>
        </Box >
    );
}

export default CustomPie;