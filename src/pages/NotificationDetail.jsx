import React from 'react';
import {
    Paper, Box, Typography, Chip, Button, Grid
} from '@mui/material';
import WhiteTick from '../assets/images/WhiteTick.svg'
import { AiOutlineEye, AiOutlineCheck } from "react-icons/ai";

const NotificationDetail = () => {
    // Mock data – replace with actual props or API data
    const suspectName = "John Doe";
    const caseNumber = "CASE-2023-0458";
    const description = "The suspect was seen wearing a black hoodie and jeans, fleeing the scene on foot.";
    const location = "Downtown Street, Sector 12";
    const dateTime = "August 5, 2025 at 10:45 AM";

    return (
        <Box px={2} sx={{ display: 'flex', gap: 3, flexDirection: 'column' }}>
            <Paper
                elevation={0}
                sx={{
                    backgroundColor: "white",
                    padding: 2,
                    borderRadius: '10px',
                }}
            >
                {/* Title */}
                <Box pb={1} borderBottom="1px solid #e0e0e0">
                    <Typography variant='h6' fontWeight={550}>
                        Suspect Sighting Details
                    </Typography>
                </Box>

                {/* Suspect Info */}
                <Box mt={2}>
                    <Typography variant="h5" fontWeight={600}>
                        {suspectName}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                        <Typography>Case Number:</Typography>
                        <Chip
                            label={caseNumber}
                            color="primary"
                            size="small"
                            sx={{
                                backgroundColor: '#DBEAFE',
                                color: '#9CA3AF',
                                fontWeight: 500,
                                '& .MuiChip-label': {
                                    textTransform: 'capitalize',
                                    color: '#367BE0'
                                }
                            }}
                        />
                    </Box>
                </Box>

                {/* Subtitle */}
                <Box mt={4} pb={1} borderBottom="1px solid #e0e0e0">
                    <Typography variant='subtitle1' fontWeight={550}>
                        Sighting Detail
                    </Typography>
                </Box>

                {/* Description */}
                <Box mt={2}>
                    <Typography fontSize={'1rem'} fontWeight={500} color="text.secondary">
                        Description
                    </Typography>
                    <Typography variant="body1" mt={1} sx={{ backgroundColor: '#F9FAFB', borderRadius: '6px', p: 1.5 }}>
                        {description}
                    </Typography>
                </Box>

                {/* Location & Time */}
                <Box mt={3} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <Box>
                        <Typography fontSize={'1rem'} fontWeight={500} color="text.secondary">
                            Location of Sighting
                        </Typography>
                        <Typography fontSize={'1.05rem'} mt={0.5}>
                            {location}
                        </Typography>
                    </Box>

                    <Box>
                        <Typography fontSize={'1rem'} fontWeight={500} color="text.secondary">
                            Time and Date
                        </Typography>
                        <Typography fontSize={'1.05rem'} mt={0.5}>
                            {dateTime}
                        </Typography>
                    </Box>
                </Box>

                {/* report information */}
                <Box mt={4} pb={1} borderBottom="1px solid #e0e0e0">
                    <Typography variant='subtitle1' fontWeight={550}>
                        Reporter Information
                    </Typography>
                </Box>
                <Box mt={3} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <Box>
                        <Typography fontSize={'1rem'} fontWeight={500} color="text.secondary">
                            Reporter Name
                        </Typography>
                        <Typography fontSize={'1.05rem'} mt={1}>
                            John Doe
                        </Typography>
                    </Box>

                    <Box>
                        <Typography fontSize={'1rem'} fontWeight={500} color="text.secondary">
                            Contact Information
                        </Typography>
                        <Typography fontSize={'1.05rem'} mt={0.5}>
                            LAPD Tip Line +27 12 007 3660
                        </Typography>
                    </Box>
                </Box>
                {/* evidence */}
                <Box mt={4} pb={1} borderBottom="1px solid #e0e0e0">
                    <Typography variant='subtitle1' fontWeight={550}>
                        Evidence
                    </Typography>
                    <Grid container spacing={2} mt={2}>
                        {[1, 2, 3, 4].map((item) => (
                            <Grid size={{ xs: 6, sm: 3 }} key={item}>
                                <Box
                                    component="img"
                                    src={`https://blocks.astratic.com/img/general-img-landscape.png`}
                                    alt={`Placeholder ${item}`}
                                    sx={{ width: '100%', height: 'auto', borderRadius: '6px' }}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </Box>
                <Box sx={{ mt: 4, display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', gap: 2 }}>
                    <Button
                        variant="outlined"
                        sx={{ height: '48px', width: '210px', borderRadius: '8px', fontWeight: 500, color: 'black', border: '1px solid var(--light-gray)' }}
                        onClick={() => nav("/home/total-companies/add-company")}
                        startIcon={<AiOutlineEye />}
                    >
                        Go to Case Details
                    </Button>
                    <Button
                        variant="contained"
                        sx={{ height: '48px', width: '210px', borderRadius: '8px', fontWeight: 500, backgroundColor: '#259157' }}
                        onClick={() => nav("/home/total-companies/add-company")}
                        startIcon={<img src={WhiteTick} alt="white tick" />}
                    >
                        Mark as Captured
                    </Button>
                    <Button
                        variant="contained"
                        sx={{ height: '48px', width: '210px', borderRadius: '8px', fontWeight: 500, backgroundColor: 'var(--Blue)' }}
                        onClick={() => nav("/home/total-companies/add-company")}
                        startIcon={<img src={WhiteTick} alt="white tick" />}

                    >
                        Mark as Reviewed
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default NotificationDetail;
