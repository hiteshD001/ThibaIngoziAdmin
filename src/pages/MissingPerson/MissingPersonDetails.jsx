import React from 'react';
import {
    Box, Typography, TextField, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, Grid, InputAdornment, Stack, Select, MenuItem, Button,
    Tooltip
} from '@mui/material';
import nouser from "../../assets/images/NoUser.png";
import ViewBtn from '../../assets/images/ViewBtn.svg'

import WhiteTick from '../../assets/images/WhiteTick.svg'
import { AiOutlineEye, AiOutlineCheck } from "react-icons/ai";
import { useGetMissingPersonById, usePutMissingPerson } from '../../API Calls/API';
import { useParams } from 'react-router-dom';
import moment from 'moment';

const MissingPersonDetails = () => {
    // Mock data – replace with actual props or API data
    const suspectName = "John Doe";
    const caseNumber = "CASE-2023-0458";
    const description = "The suspect was seen wearing a black hoodie and jeans, fleeing the scene on foot.";
    const location = "Downtown Street, Sector 12";
    const dateTime = "August 5, 2025 at 10:45 AM";
    const MissingPersons = [
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

    const params = useParams();

    const getMissingPersonById = useGetMissingPersonById("MissingPersonById", params.id);

    const updateMissingPerson = usePutMissingPerson(
        () => {
            console.log("Missing Person Updated Successfully");
            getMissingPersonById.refetch();
        },
        (err) => {
            console.log(err);
        }
    );

    console.log(getMissingPersonById.data?.data)
    const user = getMissingPersonById?.data?.data;


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
                        Missing Person Sighting Details
                    </Typography>
                </Box>

                {/* Suspect Info */}
                <Box mt={2}>
                    <Typography variant="h5" fontWeight={600}>
                        {user?.name}
                    </Typography>
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
                        {user?.description}
                    </Typography>
                </Box>

                {/* Location & Time */}
                <Box mt={3} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <Box>
                        <Typography fontSize={'1rem'} fontWeight={500} color="text.secondary">
                            Location of Sighting
                        </Typography>
                        <Typography fontSize={'1.05rem'} mt={0.5}>
                            {user?.lastSeenLocation}
                        </Typography>
                    </Box>

                    <Box>
                        <Typography fontSize={'1rem'} fontWeight={500} color="text.secondary">
                            Time and Date
                        </Typography>
                        <Typography fontSize={'1.05rem'} mt={0.5}>
                            {user?.createdAt
                                ? moment(user.createdAt).format('MMM D, YYYY - HH:mm A')
                                : '-'}
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
                            {user?.reportedBy}
                        </Typography>
                    </Box>

                    <Box>
                        <Typography fontSize={'1rem'} fontWeight={500} color="text.secondary">
                            Contact Information
                        </Typography>
                        <Typography fontSize={'1.05rem'} mt={0.5}>
                            LAPD Tip Line {user?.contactNumber}
                        </Typography>
                    </Box>
                </Box>
                {/* evidence */}
                <Box mt={4} pb={1} borderBottom="1px solid #e0e0e0">
                    <Typography variant='subtitle1' fontWeight={550}>
                        Evidence
                    </Typography>
                    <Grid container spacing={2} mt={2}>
                        <Grid size={{ xs: 6, sm: 3 }} key={user?._id}>
                            <Box
                                component="img"
                                src={user?.image_missing_person1}
                                alt={`Placeholder ${user?.name}`}
                                sx={{ width: '100%', height: 'auto', borderRadius: '6px' }}
                            />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }} key={user?._id}>
                            <Box
                                component="img"
                                src={user?.image_missing_person2}
                                alt={`Placeholder ${user?.name}`}
                                sx={{ width: '100%', height: 'auto', borderRadius: '6px' }}
                            />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }} key={user?._id}>
                            <Box
                                component="img"
                                src={user?.image_missing_person3}
                                alt={`Placeholder ${user?.name}`}
                                sx={{ width: '100%', height: 'auto', borderRadius: '6px' }}
                            />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }} key={user?._id}>
                            <Box
                                component="img"
                                src={user?.image_missing_person4}
                                alt={`Placeholder ${user?.name}`}
                                sx={{ width: '100%', height: 'auto', borderRadius: '6px' }}
                            />
                        </Grid>

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
                        sx={{ height: '48px', width: '210px', borderRadius: '8px', fontWeight: 500, backgroundColor: user?.MarkFound ? '#b71c1c' : '#259157' }}
                        onClick={() => {
                          
                            updateMissingPerson.mutate({
                                id: user?._id,
                                data: { MarkFound : !user?.MarkFound }
                            })
                        }}
                       
                        startIcon={<img src={WhiteTick} alt="white tick" />}

                    >
                      {user?.MarkFound ? "Mark as Founded" : "Mark as Found"}
                    </Button>
                    <Button
                        variant="contained"
                        sx={{ height: '48px', width: '210px', borderRadius: '8px', fontWeight: 500, backgroundColor:  user?.MarkNotReviewed ? 'var(--Blue)' : '#b71c1c' }}
                        onClick={() => {
                            updateMissingPerson.mutate({
                                id: user?._id,
                                data: { MarkNotReviewed : !user?.MarkNotReviewed }
                            })
                        }}
                        startIcon={<img src={WhiteTick} alt="white tick" />}

                    >
                        {user?.MarkNotReviewed ? "Mark as Reviewed" : "Mark as Review"}
                    </Button>
                </Box>
            </Paper>
            <Paper elevation={3} sx={{ backgroundColor: "rgb(253, 253, 253)", padding: 2, borderRadius: '10px' }}>
                <Typography variant="h6" fontWeight={590}>Missing Person SOS Details</Typography>
                {MissingPersons.length < 0 ? (
                    <Loader />
                ) : MissingPersons.length > 0 ? (
                    <Box sx={{ px: { xs: 0, md: 2 }, pt: { xs: 0, md: 3 }, backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
                        <TableContainer >
                            <Table sx={{ '& .MuiTableCell-root': { fontSize: '15px', } }}>
                                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                    <TableRow >
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', borderTopLeftRadius: '10px' }}>Name</TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Last Seen Location</TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Date</TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', textAlign: 'center' }}>Request Reached</TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', textAlign: 'center' }}>Request Accepted</TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Reported by</TableCell>
                                        <TableCell align="center" sx={{ backgroundColor: '#F9FAFB', borderTopRightRadius: '10px', color: '#4B5563' }}>Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {MissingPersons.map((user) => (
                                        <TableRow key={user._id}>
                                            <TableCell sx={{ color: '#4B5563' }}>
                                                <Stack direction="row" alignItems="center" gap={1}>
                                                    <Avatar
                                                        src={user.profileImage || nouser}
                                                        alt="User"
                                                    />

                                                    {/* {user.first_name} {user.last_name} */}
                                                    {user.name}
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
                                                    <Tooltip title="View" arrow placement="top">
                                                        <IconButton onClick={() => nav(`/home/total-missing-person/person-information/${user._id}`)}>
                                                            <img src={ViewBtn} alt="view button" />
                                                        </IconButton>
                                                    </Tooltip>
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

export default MissingPersonDetails;
