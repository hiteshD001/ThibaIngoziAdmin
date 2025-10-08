import React from 'react';
import {
    Paper,
    Box,
    Typography,
    Chip,
    Grid,
    Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import WhiteTick from '../../assets/images/WhiteTick.svg'
import forward from '../../assets/images/forward.svg'
import { AiOutlineEye, AiOutlineCheck } from "react-icons/ai";

const CrimeReport = () => {
    // Mock data – replace with actual props or API data
    const nav = useNavigate()
    const suspectName = "John Doe";
    const caseNumber = "CASE-2023-0458";
    const description = "At approximately 9:30 PM on July 29, 2023, two masked individuals entered the Quick Stop convenience store at 1234 Main Street. Both suspects were armed with what appeared to be handguns.The suspects demanded cash from the register and also took several cartons of cigarettes.The store clerk complied with their demands and was not physically harmed.The suspects fled the scene in what witnesses describe as a dark - colored sedan, possibly a Honda Accord with tinted windows. The entire incident lasted approximately 3 minutes.Store security cameras were operational at the time of the incident.The store owner has been contacted and is arranging to provide the footage to authorities.";
    const location = "Downtown Street, Sector 12";
    const dateTime = "August 5, 2025 at 10:45 AM";
    const reportDate = "August 5, 2025 at 10:45 AM"

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
                        Crime Report #CR-2096
                    </Typography>
                </Box>

                {/* Suspect Info */}
                <Box mt={2}>
                    <Typography variant="h5" fontWeight={600}>
                        {suspectName}
                    </Typography>
                </Box>

                {/* Subtitle */}
                <Box mt={4} pb={1} borderBottom="1px solid #e0e0e0">
                    <Typography variant='subtitle1' fontWeight={550}>
                        Sighting Details
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
                <Box sx={{ mt: 2 }}>
                    <Typography fontSize={'1rem'} fontWeight={500} color="text.secondary">
                        Report Submitted
                    </Typography>
                    <Typography fontSize={'1.05rem'} mt={0.5}>
                        {reportDate}
                    </Typography>

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
                        variant="contained"
                        sx={{ height: '48px', width: '210px', borderRadius: '8px', fontWeight: 500, backgroundColor: '#259157' }}
                        onClick={() => nav("/home/total-companies/add-company")}
                        startIcon={<img src={WhiteTick} alt="white tick" />}

                    >
                        Mark as Reviewed
                    </Button>
                    <Button
                        variant="contained"
                        sx={{ height: '48px', width: '240px', borderRadius: '8px', fontWeight: 500, backgroundColor: 'var(--Blue)' }}
                        onClick={() => nav("/home/crime-reports/forward-to-police")}
                        startIcon={<img src={forward} alt="forward" />}

                    >
                        Forward to Police Unit
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default CrimeReport;
