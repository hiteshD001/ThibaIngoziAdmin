import React from 'react';
import {
    Box, Typography, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Grid, Stack, Button, Chip
} from "@mui/material";
import ViewBtn from '../../assets/images/ViewBtn.svg'
import WhiteTick from '../../assets/images/WhiteTick.svg'

const StolenCarDetails = () => {
    // Mock data – replace with actual props or API data
    const suspectName = "John Doe";
    const caseNumber = "CASE-2023-0458";
    const description = "The suspect was seen wearing a black hoodie and jeans, fleeing the scene on foot.";
    const location = "Downtown Street, Sector 12";
    const dateTime = "August 5, 2025 at 10:45 AM";
    const StolenCars = [
        {
            "_id": 1,
            "name": 'Mohammad Salem',
            "location": 'Sandton, Johannesburg Gauteng,2196',
            "date": '02/05/25',
            "req_accept": '20',
            "req_reached": '30',
            'reportedBy': 'Jane Cooper'
        },
    ]
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
                        Stolen Car Sighting Details
                    </Typography>
                </Box>

                {/* Suspect Info */}
                <Box mt={2}>
                    <Typography variant="h5" fontWeight={600}>
                        {suspectName}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                        <Typography>Vehicle Registration Number:</Typography>
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
                        Incident Details
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
                    {/* <Button
                        variant="outlined"
                        sx={{ height: '48px', width: '210px', borderRadius: '8px', fontWeight: 500, color: 'black', border: '1px solid var(--light-gray)' }}
                        onClick={() => nav("/home/total-companies/add-company")}
                        startIcon={<AiOutlineEye />}
                    >
                        Go to Case Details
                    </Button> */}
                    <Button
                        variant="contained"
                        sx={{ height: '48px', width: '210px', borderRadius: '8px', fontWeight: 500, backgroundColor: '#259157' }}
                        onClick={() => nav("/home/total-companies/add-company")}
                        startIcon={<img src={WhiteTick} alt="white tick" />}

                    >
                        Mark as Found
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
            <Paper elevation={3} sx={{ backgroundColor: "rgb(253, 253, 253)", padding: 2, borderRadius: '10px' }}>
                <Typography variant="h6" fontWeight={590}>Stolen Cars</Typography>
                {StolenCars.length < 0 ? (
                    <Loader />
                ) : StolenCars.length > 0 ? (
                    <Box sx={{ px: { xs: 0, md: 2 }, pt: { xs: 0, md: 3 }, backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
                        <TableContainer >
                            <Table sx={{ '& .MuiTableCell-root': { fontSize: '15px', } }}>
                                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                    <TableRow >
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', borderTopLeftRadius: '10px' }}>Images</TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Last Seen Location</TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Date</TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', textAlign: 'center' }}>Request Reached</TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', textAlign: 'center' }}>Request Accepted</TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Reported by</TableCell>
                                        <TableCell align="center" sx={{ backgroundColor: '#F9FAFB', borderTopRightRadius: '10px', color: '#4B5563' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {StolenCars.map((user) => (
                                        <TableRow key={user._id}>
                                            <TableCell sx={{ color: '#4B5563' }}>
                                                <Stack direction="row" alignItems="center" gap={1}>
                                                    {[1, 2].map((item) => (
                                                        <Grid size={{ xs: 6, sm: 3 }} key={item}>
                                                            <Box
                                                                component="img"
                                                                src={`https://blocks.astratic.com/img/general-img-landscape.png`}
                                                                alt={`Placeholder ${item}`}
                                                                sx={{ width: '50px', height: 'auto', borderRadius: '6px' }}
                                                            />
                                                        </Grid>
                                                    ))}
                                                </Stack>
                                            </TableCell>
                                            <TableCell sx={{ color: '#4B5563' }}>

                                                {user.location || "-"}

                                            </TableCell>
                                            <TableCell sx={{ color: '#4B5563' }}>

                                                {user.date}

                                            </TableCell>
                                            <TableCell sx={{ color: 'var(--orange)', textAlign: 'center' }}>

                                                {user.req_reached || "-"}

                                            </TableCell>
                                            <TableCell sx={{ color: '#01C971', textAlign: 'center' }}>

                                                {user.req_accept || "-"}

                                            </TableCell>
                                            <TableCell sx={{ color: '#4B5563' }}>

                                                {user.reportedBy || "-"}

                                            </TableCell>

                                            <TableCell >
                                                <Box align="center" sx={{ display: 'flex', flexDirection: 'row' }}>
                                                    <IconButton onClick={() => nav(`/home/total-stolen-cars/stolen-car/${user._id}`)}>
                                                        <img src={ViewBtn} alt="view button" />
                                                    </IconButton>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                        </TableContainer>
                    </Box>
                ) : (
                    <Typography align="center" color="text.secondary" sx={{ mt: 2 }}>
                        No data found
                    </Typography>
                )}
            </Paper>
        </Box>
    );
};

export default StolenCarDetails;
