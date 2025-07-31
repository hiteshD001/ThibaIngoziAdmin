// import React, { useState } from 'react';
// import {
//     Box,
//     Grid,
//     Paper,
//     Typography,
//     FormControl,
//     InputLabel,
//     Select,
//     MenuItem,
// } from '@mui/material';
// import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';


// const provinces = [
//     { value: 'all', label: 'All Provinces' },
//     { value: 'cape_town', label: 'Cape Town' },
//     { value: 'mid_town', label: 'MidTown' },
//     { value: 'durban', label: 'Durban' },
//     { value: 'other', label: 'Other' },
//     { value: 'santurn', label: 'Santurn' },
// ];


// const dummyChartData = [
//     { name: 'CapeTown', value: 400, color: '#FF6384' },   // Red-pink
//     { name: 'MidTown', value: 300, color: '#36A2EB' },    // Blue
//     { name: 'Durban', value: 300, color: '#FFCE56' },    // Yellow
//     { name: 'Other', value: 200, color: '#4BC0C0' },     // Teal
//     { name: 'Santurn', value: 100, color: '#9966FF' },   // Purple
// ];


// const legendItems = [
//     { label: 'CapeTown', color: '#FF6384' },
//     { label: 'MidTown', color: '#36A2EB' },
//     { label: 'Durban', color: '#FFCE56' },
//     { label: 'Other', color: '#4BC0C0' },
//     { label: 'Santurn', color: '#9966FF' },
// ];


// function PieChartComponent({ data }) {
//     // If no data, display a message or a placeholder
//     if (!data || data.length === 0) {
//         return (
//             <Box sx={{
//                 width: '100%',
//                 height: 300,
//                 display: 'flex',
//                 justifyContent: 'center',
//                 alignItems: 'center',
//                 backgroundColor: '#f5f5f5',
//                 borderRadius: '8px',
//                 border: '1px dashed #ccc'
//             }}>
//                 <Typography variant="h6" color="text.secondary">
//                     No Chart Data Available
//                 </Typography>
//             </Box>
//         );
//     }

//     return (
//         <ResponsiveContainer width="100%" height={300}> {/* Height is crucial for ResponsiveContainer */}
//             <PieChart>
//                 <Pie
//                     data={data}
//                     cx="50%" // Center X position
//                     cy="50%" // Center Y position
//                     outerRadius={100} // Outer radius of the pie
//                     innerRadius={60}  // Inner radius for a donut chart (set to 0 for full pie)
//                     paddingAngle={2} // Space between slices
//                     dataKey="value" // Which key in your data object holds the value
//                     nameKey="name"  // Which key holds the name for tooltip/legend
//                     labelLine={false} // Hide lines for labels
//                     // Optional: Label slices with percentage
//                     label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//                 >
//                     {data.map((entry, index) => (
//                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                     ))}
//                 </Pie>
//                 <Tooltip content={<CustomTooltip />} /> {/* Use your custom tooltip */}
//                 {/* Recharts's own Legend component can be added here if you don't use a custom MUI legend */}
//                 {/* <Legend /> */}
//             </PieChart>
//         </ResponsiveContainer>
//     );
// }

// const CustomPie = () => {
//     const [selectedProvince, setSelectedProvince] = useState('all');

//     const handleProvinceChange = (event) => {
//         setSelectedProvince(event.target.value);
//         // In a real application, you would fetch or filter your
//         // pie chart data here based on the selectedProvince value.
//         console.log("Selected Province:", event.target.value);
//     };

//     return (
//         // This outer Grid item makes the whole section responsive within a larger Grid container
//         <Grid item xs={12} md={6}> {/* Takes full width on small, half width on medium screens */}
//             <Paper
//                 elevation={3} // Adds a shadow effect to the container
//                 sx={{
//                     p: 3, // Padding inside the Paper
//                     borderRadius: '12px', // Rounded corners for the container
//                     height: '100%', // Makes the paper fill available height in its grid item
//                     display: 'flex',
//                     flexDirection: 'column', // Arranges content vertically
//                 }}
//             >
//                 {/* Top Row: Heading (Left) and Dropdown (Right) */}
//                 <Grid container alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
//                     <Grid item>
//                         <Typography variant="h5" component="h2" fontWeight="medium">
//                             Regional Distribution
//                         </Typography>
//                     </Grid>
//                     <Grid item>
//                         <FormControl sx={{ minWidth: 150 }} size="small">
//                             <InputLabel id="province-select-label">Province</InputLabel>
//                             <Select
//                                 labelId="province-select-label"
//                                 value={selectedProvince}
//                                 label="Province"
//                                 onChange={handleProvinceChange}
//                             >
//                                 {provinces.map((province) => (
//                                     <MenuItem key={province.value} value={province.value}>
//                                         {province.label}
//                                     </MenuItem>
//                                 ))}
//                             </Select>
//                         </FormControl>
//                     </Grid>
//                 </Grid>

//                 {/* Middle Section: Pie Chart */}
//                 <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3 }}>
//                     <PieChartComponent data={dummyChartData} />
//                 </Box>

//                 {/* Bottom Section: Legend */}
//                 <Box sx={{
//                     display: 'flex',
//                     flexWrap: 'wrap', // Allows legend items to wrap to next line on small screens
//                     justifyContent: 'center', // Centers legend items
//                     gap: 2, // Space between legend items
//                     pt: 2, // Padding top
//                     borderTop: '1px solid #eee', // Separator line above legend
//                 }}>
//                     {legendItems.map((item, index) => (
//                         <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
//                             <Box sx={{ width: 16, height: 16, borderRadius: '4px', backgroundColor: item.color }} />
//                             <Typography variant="body2">{item.label}</Typography>
//                         </Box>
//                     ))}
//                 </Box>
//             </Paper>
//         </Grid>
//     );
// }

// export default CustomPie;