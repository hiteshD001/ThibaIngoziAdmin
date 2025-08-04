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



const provinces = [
    { value: 'all', label: 'All Provinces' },
    { value: 'cape_town', label: 'Cape Town' },
    { value: 'mid_town', label: 'MidTown' },
    { value: 'durban', label: 'Durban' },
    { value: 'other', label: 'Other' },
    { value: 'santurn', label: 'Santurn' },
];


const dummyChartData = [
    { name: 'CapeTown', value: 400, color: '#FF6384' },   // Red-pink
    { name: 'MidTown', value: 300, color: '#36A2EB' },    // Blue
    { name: 'Durban', value: 300, color: '#FFCE56' },    // Yellow
    { name: 'Other', value: 200, color: '#4BC0C0' },     // Teal
    { name: 'Santurn', value: 100, color: '#9966FF' },   // Purple
];


const legendItems = [
    { label: 'CapeTown', color: '#FF6384' },
    { label: 'MidTown', color: '#36A2EB' },
    { label: 'Durban', color: '#FFCE56' },
    { label: 'Other', color: '#4BC0C0' },
    { label: 'Santurn', color: '#9966FF' },
];

const CustomPie = () => {
    const [selectedProvince, setSelectedProvince] = useState('all');

    const handleProvinceChange = (event) => {
        setSelectedProvince(event.target.value);
        // In a real application, you would fetch or filter your
        // pie chart data here based on the selectedProvince value.
        console.log("Selected Province:", event.target.value);
    };

    return (
        <Paper
            elevation={3}
            sx={{
                p: 3,
                borderRadius: '12px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
            }}
        >

            <Grid container alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                <Grid>
                    <Typography variant="h5" component="h2" fontWeight="medium">
                        Regional Distribution
                    </Typography>
                </Grid>
                <Grid>
                    <FormControl sx={{ minWidth: 150 }} size="small">
                        <InputLabel id="province-select-label">Province</InputLabel>
                        <Select
                            labelId="province-select-label"
                            value={selectedProvince}
                            label="Province"
                            onChange={handleProvinceChange}
                        >
                            {provinces.map((province) => (
                                <MenuItem key={province.value} value={province.value}>
                                    {province.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>

            {/* Middle Section: Pie Chart */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300, mb: 3 }}>
                <PieChart
                    series={[
                        {
                            data: dummyChartData.map(({ name, value, color }) => ({
                                id: name,
                                value,
                                // label: name,
                                color,
                            })),
                            innerRadius: 40,
                            outerRadius: 80,
                        },
                    ]}
                    width={300}
                    height={300}
                />
            </Box>


            {/* Bottom Section: Legend */}
            <Box sx={{
                display: 'flex',
                flexWrap: 'wrap', // Allows legend items to wrap to next line on small screens
                justifyContent: 'center', // Centers legend items
                gap: 2, // Space between legend items
                pt: 2, // Padding top
                borderTop: '1px solid #eee', // Separator line above legend
            }}>
                {legendItems.map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 16, height: 16, borderRadius: '4px', backgroundColor: item.color }} />
                        <Typography variant="body2">{item.label}</Typography>
                    </Box>
                ))}
            </Box>
        </Paper>
    );
}

export default CustomPie;