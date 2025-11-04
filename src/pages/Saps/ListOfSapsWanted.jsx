import { useEffect, useState } from "react";
import { useGetChartData, useGetUserList, useGetNotificationType } from "../../API Calls/API";
import {
    Grid, Typography, Select, Box, TextField, InputAdornment, MenuItem, FormControl, InputLabel, IconButton, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Stack, Avatar, Chip, Paper, Button, Menu,
    Tooltip
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import plus from '../../assets/images/plus.svg'
import whiteplus from '../../assets/images/whiteplus.svg';
import MoreVertIcon from "@mui/icons-material/MoreVert";
import search from '../../assets/images/search.svg';
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import ViewBtn from '../../assets/images/ViewBtn.svg'
import { DeleteConfirm } from "../../common/ConfirmationPOPup";
import OutlinedView from '../../assets/images/OutlinedView.svg'
import outlinedDustbin from '../../assets/images/outlinedDustbin.svg'
import outlinedEdit from '../../assets/images/outlinedEdit.svg'
import delBtn from '../../assets/images/delBtn.svg'
import nouser from "../../assets/images/NoUser.png";
import CustomDateRangePicker from "../../common/Custom/CustomDateRangePicker";
import calender from '../../assets/images/calender.svg';
import Loader from "../../common/Loader";
import CustomFilter from "../../common/Custom/CustomFilter";
import CustomChart from "../../common/Custom/CustomChart2";
import { startOfYear } from "date-fns";
import CustomExportMenu from "../../common/Custom/CustomExport";
import CustomPie from "../../common/Custom/CustomPie";
import SapsIcon1 from '../../assets/images/SapsIcon1.svg'
import SapsIcon2 from '../../assets/images/SapsIcon2.svg'
import SapsIcon3 from '../../assets/images/SapsIcon3.svg'
import SapsIcon4 from '../../assets/images/SapsIcon4.svg'
import SapsIcon5 from '../../assets/images/SapsIcon5.svg'
import SapsIcon6 from '../../assets/images/SapsIcon6.svg'
import SapsIcon7 from '../../assets/images/SapsIcon7.svg'
import SapsIcon8 from '../../assets/images/SapsIcon8.svg'
import SapsIcon9 from '../../assets/images/SapsIcon9.svg'

import CustomBar from "../../common/Custom/CustomBar";



const Wanted = [
    {
        "suspect": 'Mohammed Salem',
        "aliases": 'Johnny, Mike',
        "CaseNumber": '1234566',
        "Officer": 'Watson',
        "PoliceStation": 'Midrand police station',
        "Crimedate": "10/02/2024",
        "Reportdate": "10/04/2024",
        "Captureddate": "10/05/2024",
        "status": 'captured',
        "SightingReported": '04',
        "lastLocation": "Los Angeles",
        "contactNo": 'LAPD Tip Line: +21120073660',
        "req_reach": '04',
        "req_accpet": '04',
    },
    {
        "suspect": 'Mohammed Salem',
        "aliases": 'Johnny, Mike',
        "CaseNumber": '1234566',
        "Officer": 'Watson',
        "PoliceStation": 'Midrand police station',
        "Crimedate": "10/02/2024",
        "Reportdate": "10/04/2024",
        "Captureddate": "10/05/2024",
        "status": 'wanted',
        "SightingReported": '04',
        "lastLocation": "Los Angeles",
        "contactNo": 'LAPD Tip Line: +21120073660',
        "req_reach": '04',
        "req_accpet": '04',
    }, {
        "suspect": 'Mohammed Salem',
        "aliases": 'Johnny, Mike',
        "CaseNumber": '1234566',
        "Officer": 'Watson',
        "PoliceStation": 'Midrand police station',
        "Crimedate": "10/02/2024",
        "Reportdate": "10/04/2024",
        "Captureddate": "10/05/2024",
        "status": 'captured',
        "SightingReported": '04',
        "lastLocation": "Los Angeles",
        "contactNo": 'LAPD Tip Line: +21120073660',
        "req_reach": '04',
        "req_accpet": '04',
    }, {
        "suspect": 'Mohammed Salem',
        "aliases": 'Johnny, Mike',
        "CaseNumber": '1234566',
        "Officer": 'Watson',
        "PoliceStation": 'Midrand police station',
        "Crimedate": "10/02/2024",
        "Reportdate": "10/04/2024",
        "Captureddate": "10/05/2024",
        "status": 'wanted',
        "SightingReported": '04',
        "lastLocation": "Los Angeles",
        "contactNo": 'LAPD Tip Line: +21120073660',
        "req_reach": '04',
        "req_accpet": '04',
    },

]
const Saps = [
    {
        "user": 'Mohammed Salem',
        "PoliceStation": 'Mohammed Salem',
        "ContactNo": '+1234334343',
        "ContactName": 'test@gmail.com',
    },
    {
        "user": 'Mohammed Salem',
        "PoliceStation": 'Mohammed Salem',
        "ContactNo": '+1234334343',
        "ContactName": 'test@gmail.com',
    },
    {
        "user": 'Mohammed Salem',
        "PoliceStation": 'Mohammed Salem',
        "ContactNo": '+1234334343',
        "ContactName": 'test@gmail.com',
    },
    {
        "user": 'Mohammed Salem',
        "PoliceStation": 'Mohammed Salem',
        "ContactNo": '+1234334343',
        "ContactName": 'test@gmail.com',
    },

]
const provinces = [
    { value: 'all', label: 'All Provinces' },
    { value: 'cape_town', label: 'Cape Town' },
    { value: 'mid_town', label: 'MidTown' },
    { value: 'durban', label: 'Durban' },
    { value: 'other', label: 'Other' },
    { value: 'santurn', label: 'Santurn' },
];
const wantedData = [150, 180, 200, 200, 200, 180, 220, 180, 160, 180, 180, 190];
const capturedData = [20, 60, 100, 130, 130, 90, 100, 130, 120, 110, 80, 70];
const sightingData = [10, 40, 90, 120, 100, 70, 150, 130, 110, 90, 60, 50];
const ListOfSapsWanted = () => {
    const [filter, setfilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [confirmation, setconfirmation] = useState("");
    const [selectedProvince, setSelectedProvince] = useState('all');
    const [range, setRange] = useState([
        {
            startDate: startOfYear(new Date()),
            endDate: new Date(),
            key: 'selection'
        }
    ]);
    const nav = useNavigate()

    const handleFilterApply = (filters) => {
        console.log('Filters applied:', filters);
    };
    const [anchorEl, setAnchorEl] = useState(null);

    const handleOpenMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };
    const handleProvinceChange = (event) => {
        setSelectedProvince(event.target.value);
        console.log("Selected Province:", event.target.value);
    };
    return (
        <Box>
            <Grid sx={{ backgroundColor: 'white', p: 3, mt: '-25px' }} container justifyContent="space-between" alignItems="center" spacing={2} mb={3}>
                <Grid size={{ xs: 12, md: 5, lg: 6 }}>

                </Grid>

                <Grid size={{ xs: 12, md: 7, lg: 6 }}>
                    <Box display="flex" sx={{ justifyContent: { md: 'flex-end', sm: 'space-around' } }} gap={2} flexWrap="wrap">
                        <Box display="flex" sx={{ justifyContent: { md: 'flex-end', sm: 'space-around' } }} gap={2} flexWrap="wrap">
                            <CustomFilter onApply={handleFilterApply} />
                            <CustomDateRangePicker
                                borderColor={'var(--light-gray)'}
                                value={range}
                                onChange={setRange}
                                icon={calender}
                            />

                            <CustomExportMenu role='dashboard' />
                        </Box>
                    </Box>
                </Grid>
            </Grid>
            <Box p={2}>
                <Grid container spacing={3} mb={5}>
                    <Grid size={{ xs: 12, md: 4, lg: 3 }} sx={{}}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: { xs: 5, lg: 3 }, backgroundColor: '#367BE01A', borderRadius: '16px', px: 3, py: 5 }}>
                            <Box>
                                <Typography variant="body2">Users Reached</Typography>
                                <Typography variant="h5" fontWeight={600}>24,567</Typography>
                            </Box>
                            <Box>
                                <img src={SapsIcon1} alt="ReportIcon" />
                            </Box>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4, lg: 3 }} sx={{}}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: { xs: 5, lg: 3 }, backgroundColor: '#22C55E1A', borderRadius: '16px', px: 3, py: 5 }}>
                            <Box>
                                <Typography variant="body2">Social Shares</Typography>
                                <Typography variant="h5" fontWeight={600}>1342</Typography>
                            </Box>
                            <Box>
                                <img src={SapsIcon2} alt="ReportIcon" />
                            </Box>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4, lg: 3 }} >
                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: { xs: 5, lg: 1 }, backgroundColor: '#F973161A', borderRadius: '16px', px: 2, py: 5 }}>
                            <Box>
                                <Typography variant="body2">Sighting Submissions</Typography>
                                <Typography variant="h5" fontWeight={600}>1342</Typography>
                            </Box>
                            <Box>
                                <img src={SapsIcon3} alt="ReportIcon" />
                            </Box>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4, lg: 3 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: { xs: 5, lg: 1 }, backgroundColor: '#A855F71A', borderRadius: '16px', px: 3, py: 5 }}>
                            <Box>
                                <Typography variant="body2">Avg Alert Open Rate</Typography>
                                <Typography variant="h5" fontWeight={600}>Cape Town</Typography>
                            </Box>
                            <Box>
                                <img src={SapsIcon4} alt="LocationIcon" />
                            </Box>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4, lg: 3 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: { xs: 5, lg: 3 }, backgroundColor: '#F973161A', borderRadius: '16px', px: 3, py: 5 }}>
                            <Box>
                                <Typography variant="body2">Wanted People</Typography>
                                <Typography variant="h5" fontWeight={600}>44</Typography>
                            </Box>
                            <Box>
                                <img src={SapsIcon5} alt="DangerIcon" />
                            </Box>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4, lg: 3 }} sx={{}}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: { xs: 5, lg: 3 }, backgroundColor: '#0D94881A', borderRadius: '16px', px: 3, py: 5 }}>
                            <Box>
                                <Typography variant="body2">Captured People</Typography>
                                <Typography variant="h5" fontWeight={600}>24</Typography>
                            </Box>
                            <Box>
                                <img src={SapsIcon6} alt="DangerIcon" />
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
                <Grid container spacing={3} mb={5}>
                    <Grid size={{ xs: 12, md: 6 }}>
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
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="h6" component="h2" fontWeight="medium">
                                        Captured Vs Wanted By SAPS
                                    </Typography>
                                </Grid>

                            </Grid>
                            <Box sx={{ minHeight: 400 }}>
                                <CustomChart wantedData={wantedData} capturedData={capturedData} />
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
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

                            <Grid container alignItems="center" justifyContent="space-between" sx={{ mb: 3, gap: 1 }}>
                                <Grid size={{ xs: 12, sm: 7 }}>
                                    <Typography variant="h6" component="h2" fontWeight="medium">
                                        Incident Distribution by Location
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 12, md: 4.5 }} sx={{ mt: { xs: 2, sm: 0 } }}>
                                    <FormControl sx={{ width: '100%' }} size="small">
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
                            <CustomPie />
                        </Paper>
                    </Grid>
                </Grid>
                <Grid container spacing={3} mb={5}>
                    <Grid size={{ xs: 12, md: 8.5 }}>
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
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="h6" component="h2" fontWeight="medium">
                                        Criminal Captured Vs Wanted Vs Sightings
                                    </Typography>
                                </Grid>

                            </Grid>
                            <Box sx={{ minHeight: 400 }}>
                                <CustomBar
                                    wantedData={wantedData}
                                    capturedData={capturedData}
                                    sightingData={sightingData}
                                />
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, md: 3.5 }}>
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

                            <Grid container alignItems="center" justifyContent="space-between" sx={{ mb: 3, gap: 1 }}>
                                <Grid size={{ xs: 12, }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                        <Typography variant="h6" component="h2" fontWeight="medium">
                                            Recent Activity
                                        </Typography>
                                        <Box sx={{ backgroundColor: '#F9FAFB', px: 1, py: 2, borderRadius: '8px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                                                <img src={SapsIcon7} alt="ReportIcon" />
                                                <Box>
                                                    <Typography variant="body1" color="initial">New Alert Created</Typography>
                                                    <Typography variant="body2" sx={{ color: '#64748B ' }}>2 mins ago</Typography>
                                                </Box>
                                            </Box>
                                            <NavigateNextIcon />
                                        </Box>
                                        <Box sx={{ backgroundColor: '#F9FAFB', px: 1, py: 2, borderRadius: '8px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                                                <img src={SapsIcon8} alt="ReportIcon" />
                                                <Box>
                                                    <Typography variant="body1" color="initial">Sightings Reported(152)</Typography>
                                                    <Typography variant="body2" sx={{ color: '#64748B ' }}>15 mins ago</Typography>
                                                </Box>
                                            </Box>
                                            <NavigateNextIcon />
                                        </Box>
                                        <Box sx={{ backgroundColor: '#F9FAFB', px: 1, py: 2, borderRadius: '8px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                                                <img src={SapsIcon9} alt="ReportIcon" />
                                                <Box>
                                                    <Typography variant="body1" color="initial">Alert Shared 50 Times</Typography>
                                                    <Typography variant="body2" sx={{ color: '#64748B ' }}>2 mins ago</Typography>
                                                </Box>
                                            </Box>
                                            <NavigateNextIcon />
                                        </Box>
                                    </Box>
                                </Grid>

                            </Grid>

                        </Paper>
                    </Grid>
                </Grid>
                <Box p={2}>
                    <Paper elevation={3} sx={{ backgroundColor: "rgb(253, 253, 253)", padding: 2, borderRadius: '10px' }}>
                        <Grid container justifyContent="space-between" alignItems="center" mb={2}>
                            <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', flexDirection: 'row', gap: 2, mb: { xs: 1, md: 0 } }}>
                                <Typography variant="h6" fontWeight={590}>List of SAPS Wanted</Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 8 }} sx={{ display: 'flex', justifyContent: 'flex-end', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>

                                <TextField
                                    variant="outlined"
                                    placeholder="Search"
                                    value={filter}
                                    onChange={(e) => setfilter(e.target.value)}
                                    fullWidth
                                    sx={{
                                        width: '60%',
                                        height: '40px',
                                        borderRadius: '8px',
                                        '& .MuiInputBase-root': {
                                            height: '40px',
                                            fontSize: '14px',
                                        },
                                        '& .MuiOutlinedInput-input': {
                                            padding: '10px 14px',
                                        },
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <img src={search} alt="search icon" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <Box display="flex" sx={{ justifyContent: { xs: 'space-between' } }} gap={1}>
                                    <Button
                                        variant="contained"
                                        sx={{ height: '40px', width: '100px', borderRadius: '8px' }}
                                        onClick={() => nav("/home/total-saps-wanted/add-wanted")}
                                        startIcon={<img src={whiteplus} alt='white plus' />}
                                    >
                                        Add
                                    </Button>

                                </Box>

                            </Grid>
                        </Grid>

                        {Wanted.length <= 0 ? (
                            <Loader />
                        ) : Wanted.length > 0 ? (
                            <Box sx={{ px: { xs: 0, md: 2 }, pt: { xs: 0, md: 3 }, backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
                                <TableContainer>
                                    <Table sx={{ '& .MuiTableCell-root': { fontSize: '15px' } }}>
                                        <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                            <TableRow >
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', borderTopLeftRadius: '10px', minWidth: 150 }}>Suspect Name</TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', minWidth: 150 }}>Aliases</TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', minWidth: 150 }}>Case Number</TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', minWidth: 150 }}>Investigation Officer</TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', minWidth: 150 }}>Police Station</TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', minWidth: 150 }}>Date of Crime</TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', minWidth: 150 }}>Date  Reported</TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', minWidth: 150 }}>Captured Date</TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Status</TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', minWidth: 150 }}>Sightings Reported</TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', minWidth: 150 }}>Last Known Location</TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', minWidth: 150 }}>Contact Info</TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Request Reached</TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Request Accepted</TableCell>
                                                <TableCell
                                                    sx={{
                                                        position: 'sticky',
                                                        right: 0,
                                                        zIndex: 1,
                                                        backgroundColor: '#F9FAFB', color: '#4B5563'
                                                    }}
                                                >Action</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {Wanted?.map((user) => (
                                                <TableRow key={user._id}>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        <Stack direction="row" alignItems="center" gap={1}>
                                                            <Avatar
                                                                src={user.profileImage || nouser}
                                                                alt="User"
                                                            />

                                                            {user.suspect}

                                                        </Stack>
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        {user.aliases || "-"}
                                                    </TableCell>
                                                    <TableCell sx={{ color: user.colorCode }}>
                                                        {user.CaseNumber || "-"}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        {user.Officer || "-"}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        {user.PoliceStation || "-"}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        {user.Crimedate || "-"}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        {user.Reportdate || "-"}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        {user.Captureddate || "-"}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        <Chip
                                                            label={user.status}
                                                            sx={{
                                                                backgroundColor:
                                                                    user.status === 'captured' ? '#DCFCE7' :
                                                                        user.status === 'wanted' ? '#DC26261A' :
                                                                            '#FEF9C3',
                                                                '& .MuiChip-label': {
                                                                    textTransform: 'capitalize',
                                                                    color: user.status === 'captured' ? 'green' :
                                                                        user.status === 'wanted' ? '#DC2626' :
                                                                            'black',
                                                                }
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#367BE0' }}>
                                                        {user.SightingReported || "-"}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        {user.lastLocation || "-"}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        {user.contactNo || "-"}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#F97316', textAlign: 'center' }}>
                                                        {user.req_reach || "-"}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#01C971', textAlign: 'center' }}>
                                                        {user.req_accpet || "-"}
                                                    </TableCell>
                                                    <TableCell
                                                        sx={{
                                                            position: 'sticky',
                                                            right: 0,
                                                            backgroundColor: 'white',
                                                            zIndex: 1
                                                        }}
                                                    >
                                                        <Box align="center" sx={{ display: 'flex', flexDirection: 'row' }}>
                                                            <IconButton onClick={handleOpenMenu}>
                                                                <MoreVertIcon />
                                                            </IconButton>

                                                        </Box>
                                                    </TableCell>
                                                    <Menu
                                                        anchorEl={anchorEl}
                                                        open={Boolean(anchorEl)}
                                                        onClose={handleCloseMenu}
                                                        anchorOrigin={{
                                                            vertical: "bottom",
                                                            horizontal: "right",
                                                        }}
                                                        transformOrigin={{
                                                            vertical: "top",
                                                            horizontal: "right",
                                                        }}
                                                    >
                                                        <MenuItem
                                                            onClick={() => {
                                                                handleCloseMenu();
                                                                nav(`/home/total-saps-wanted/wanted-information&${user._id}`)
                                                            }}
                                                        >
                                                            <img src={OutlinedView} alt="view button" /> &nbsp; View
                                                        </MenuItem>
                                                        <MenuItem
                                                            onClick={() => {
                                                                handleCloseMenu();
                                                                onEdit();
                                                            }}
                                                        >
                                                            <img src={outlinedEdit} alt="edit button" /> &nbsp;   Edit
                                                        </MenuItem>
                                                        <MenuItem
                                                            onClick={() => {
                                                                handleCloseMenu();
                                                                onDelete();
                                                            }}
                                                        >
                                                            <img src={outlinedDustbin} alt="dustbin button" /> &nbsp;   Delete
                                                        </MenuItem>
                                                    </Menu>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>

                                </TableContainer>
                                <Grid container sx={{ px: { xs: 0, sm: 3 } }} justifyContent="space-between" alignItems="center" mt={2}>
                                    <Grid>
                                        <Typography variant="body2">
                                            Rows per page:&nbsp;
                                            <Select
                                                size="small"
                                                sx={{
                                                    border: 'none',
                                                    boxShadow: 'none',
                                                    outline: 'none',
                                                    '& .MuiOutlinedInput-notchedOutline': {
                                                        border: 'none',
                                                    },
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                        border: 'none',
                                                    },
                                                    '& .MuiOutlinedInput-root': {
                                                        boxShadow: 'none',
                                                        outline: 'none',
                                                    },
                                                    '& .MuiSelect-select': {
                                                        outline: 'none',
                                                    },
                                                }}
                                                value={rowsPerPage}
                                                onChange={(e) => {
                                                    setRowsPerPage(Number(e.target.value));
                                                    setCurrentPage(1);
                                                }}
                                            >
                                                {[5, 10, 15, 20,50,100].map((num) => (
                                                    <MenuItem key={num} value={num}>
                                                        {num}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </Typography>
                                    </Grid>
                                    <Grid>
                                        <Box display="flex" alignItems="center" gap={{ xs: 1, sm: 2 }}>
                                            <Typography variant="body2">
                                                {currentPage} / {2}
                                            </Typography>
                                            <IconButton
                                                disabled={currentPage === 1}
                                                onClick={() => setCurrentPage((prev) => prev - 1)}
                                            >
                                                <NavigateBeforeIcon fontSize="small" sx={{
                                                    color: currentPage === 1 ? '#BDBDBD' : '#1976d2'
                                                }} />
                                            </IconButton>
                                            <IconButton
                                                disabled={currentPage === 2}
                                                onClick={() => setCurrentPage((prev) => prev + 1)}
                                            >
                                                <NavigateNextIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>
                        ) : (
                            <Typography align="center" color="text.secondary" sx={{ mt: 2 }}>
                                No data found
                            </Typography>
                        )}


                    </Paper>
                </Box>
                <Box p={2}>
                    <Paper elevation={3} sx={{ backgroundColor: "rgb(253, 253, 253)", padding: 2, borderRadius: '10px' }}>
                        <Grid container justifyContent="space-between" alignItems="center" mb={2}>
                            <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', flexDirection: 'row', gap: 2, mb: { xs: 1, md: 0 } }}>
                                <Typography variant="h6" fontWeight={590}>SAPS Members</Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 8 }} sx={{ display: 'flex', justifyContent: 'flex-end', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>

                                <TextField
                                    variant="outlined"
                                    placeholder="Search"
                                    value={filter}
                                    onChange={(e) => setfilter(e.target.value)}
                                    fullWidth
                                    sx={{
                                        width: '100%',
                                        height: '40px',
                                        borderRadius: '8px',
                                        '& .MuiInputBase-root': {
                                            height: '40px',
                                            fontSize: '14px',
                                        },
                                        '& .MuiOutlinedInput-input': {
                                            padding: '10px 14px',
                                        },
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <img src={search} alt="search icon" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <Box display="flex" sx={{ justifyContent: { xs: 'space-between' } }} gap={1}>
                                    <Button
                                        startIcon={<img src={plus} alt="plus icon" />}
                                        variant="outlined" size="small" sx={{ height: '40px', width: '150px', borderRadius: '8px' }}
                                    // onClick={() => setpopup(true)}

                                    >
                                        Import Sheet
                                    </Button>
                                    <Button
                                        variant="contained"
                                        sx={{ height: '40px', width: '200px', borderRadius: '8px' }}
                                        onClick={() => nav("/home/total-saps-wanted/add-saps-member")}
                                        startIcon={<img src={whiteplus} alt='white plus' />}
                                    >
                                        Add Saps Member
                                    </Button>
                                </Box>

                            </Grid>
                        </Grid>

                        {Saps.length <= 0 ? (
                            <Loader />
                        ) : Saps.length > 0 ? (
                            <Box sx={{ px: { xs: 0, md: 2 }, pt: { xs: 0, md: 3 }, backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
                                <TableContainer>
                                    <Table sx={{ '& .MuiTableCell-root': { fontSize: '15px' } }}>
                                        <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                            <TableRow >
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', borderTopLeftRadius: '10px', minWidth: 150 }}>User</TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', minWidth: 150 }}>Police Station Name</TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', minWidth: 150 }}>Contact No.</TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', minWidth: 150 }}>Contact Email</TableCell>
                                                <TableCell align="center" sx={{ backgroundColor: '#F9FAFB', borderTopRightRadius: '10px', color: '#4B5563' }}>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {Saps?.map((user) => (
                                                <TableRow key={user._id}>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        <Stack direction="row" alignItems="center" gap={1}>
                                                            <Avatar
                                                                src={user.profileImage || nouser}
                                                                alt="User"
                                                            />

                                                            {user.user}

                                                        </Stack>
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        {user.PoliceStation || "-"}
                                                    </TableCell>
                                                    <TableCell sx={{ color: user.colorCode }}>
                                                        {user.ContactNo || "-"}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        {user.ContactName || "-"}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box align="center" sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                                                            <Tooltip title="View" arrow placement="top">
                                                                <IconButton onClick={() => nav(`/home/total-saps-wanted`)}>
                                                                    <img src={ViewBtn} alt="view button" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Delete" arrow placement="top">
                                                                <IconButton onClick={() => setconfirmation(user._id)}>
                                                                    <img src={delBtn} alt="delete button" />
                                                                </IconButton>
                                                            </Tooltip>

                                                        </Box>
                                                    </TableCell>

                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>

                                </TableContainer>
                                <Grid container sx={{ px: { xs: 0, sm: 3 } }} justifyContent="space-between" alignItems="center" mt={2}>
                                    <Grid>
                                        <Typography variant="body2">
                                            Rows per page:&nbsp;
                                            <Select
                                                size="small"
                                                sx={{
                                                    border: 'none',
                                                    boxShadow: 'none',
                                                    outline: 'none',
                                                    '& .MuiOutlinedInput-notchedOutline': {
                                                        border: 'none',
                                                    },
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                        border: 'none',
                                                    },
                                                    '& .MuiOutlinedInput-root': {
                                                        boxShadow: 'none',
                                                        outline: 'none',
                                                    },
                                                    '& .MuiSelect-select': {
                                                        outline: 'none',
                                                    },
                                                }}
                                                value={rowsPerPage}
                                                onChange={(e) => {
                                                    setRowsPerPage(Number(e.target.value));
                                                    setCurrentPage(1);
                                                }}
                                            >
                                                {[5, 10, 15, 20,50,100].map((num) => (
                                                    <MenuItem key={num} value={num}>
                                                        {num}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </Typography>
                                    </Grid>
                                    <Grid>
                                        <Box display="flex" alignItems="center" gap={{ xs: 1, sm: 2 }}>
                                            <Typography variant="body2">
                                                {currentPage} / {2}
                                            </Typography>
                                            <IconButton
                                                disabled={currentPage === 1}
                                                onClick={() => setCurrentPage((prev) => prev - 1)}
                                            >
                                                <NavigateBeforeIcon fontSize="small" sx={{
                                                    color: currentPage === 1 ? '#BDBDBD' : '#1976d2'
                                                }} />
                                            </IconButton>
                                            <IconButton
                                                disabled={currentPage === 2}
                                                onClick={() => setCurrentPage((prev) => prev + 1)}
                                            >
                                                <NavigateNextIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>
                        ) : (
                            <Typography align="center" color="text.secondary" sx={{ mt: 2 }}>
                                No data found
                            </Typography>
                        )}


                    </Paper>
                </Box>
            </Box>
        </Box>
    )
}

export default ListOfSapsWanted
