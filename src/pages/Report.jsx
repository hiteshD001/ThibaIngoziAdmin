import { useEffect, useState } from "react";
import { useGetChartData, useGetUserList, useGetNotificationType } from "../API Calls/API";
import {
    Grid, Typography, Select, Box, TextField, InputAdornment, MenuItem, FormControl, InputLabel, IconButton, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Stack, Avatar, Chip, Paper,
    Tooltip
} from "@mui/material";
import search from '../assets/images/search.svg';
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import ViewBtn from '../assets/images/ViewBtn.svg'
import nouser from "../assets/images/NoUser.png";
import LocationIcon from '../assets/images/LocationIcon.svg'
import ReportIcon from '../assets/images/ReportsIcon.svg'
import DangerIcon from '../assets/images/DangerIcon.svg'
import CustomDateRangePicker from "../common/Custom/CustomDateRangePicker";
import calender from '../assets/images/calender.svg';
import Loader from "../common/Loader";
import CustomFilter from "../common/Custom/CustomFilter";
import CustomChart from "../common/CustomChart";
import CustomExportMenu from "../common/Custom/CustomExport";
import { useNavigate } from "react-router-dom";
import CustomPie from "../common/Custom/CustomPie";
import { startOfYear } from "date-fns";


const provinces = [
    { value: 'all', label: 'All Provinces' },
    { value: 'cape_town', label: 'Cape Town' },
    { value: 'mid_town', label: 'MidTown' },
    { value: 'durban', label: 'Durban' },
    { value: 'other', label: 'Other' },
    { value: 'santurn', label: 'Santurn' },
];

const SosList = [
    {
        "responder": 'Mohammed Salem',
        "user": 'Mohammed Salem',
        "type": 'Fuel Dilvery(ran out of fuel)',
        "colorCode": '#8E44AD',
        "time": '13:48:55',
        "Location": "Sandton, Johnanburg, 2196",
        "status": 'resolved',
    },
    {
        "responder": 'Mohammed Salem',
        "user": 'Mohammed Salem',
        "type": 'Stolen Cars',
        "colorCode": '#991B1B',
        "time": '13:48:55',
        "Location": "Sandton, Johnanburg, 2196",
        "status": 'pending',
    },
    {
        "responder": 'Mohammed Salem',
        "user": 'Mohammed Salem',
        "type": 'Accident Response',
        "colorCode": '#FB8C00',
        "time": '13:48:55',
        "Location": "Sandton, Johnanburg, 2196",
        "status": 'pending',
    },
    {
        "responder": 'Mohammed Salem',
        "user": 'Mohammed Salem',
        "type": 'Rider Payment Issue',
        "colorCode": '#26A69A',
        "time": '13:48:55',
        "Location": "Sandton, Johnanburg, 2196",
        "status": 'pending',
    },
    {
        "responder": 'Mohammed Salem',
        "user": 'Mohammed Salem',
        "type": 'Physical Assault',
        "colorCode": '#1A237E',
        "time": '13:48:55',
        "Location": "Sandton, Johnanburg, 2196",
        "status": 'resolved',
    },
]

const Report = ({ id }) => {
    const [time, settime] = useState("today");
    const [filter, setfilter] = useState("");
    const [timeTitle, settimeTitle] = useState("Today");
    const [activeUser, setactiveUser] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const notificationTypes = useGetNotificationType();
    const [selectedNotification, setSelectedNotification] = useState("");
    const [selectedProvince, setSelectedProvince] = useState('all');
    const [range, setRange] = useState([
        {
            startDate: startOfYear(new Date()),
            endDate: new Date(),
            key: 'selection'
        }
    ]);
    const [category, setCategory] = useState('');

    const nav = useNavigate();

    const driverList = useGetUserList("driver list", "driver", id);
    const companyList = useGetUserList("company list", "company");
    const chartData = useGetChartData(selectedNotification);

    const handleTimeChange = (e) => {
        settime(e.target.value);
    };

    const handleNotificationChange = (e) => {
        setSelectedNotification(e.target.value);
    };

    useEffect(() => {
        if (notificationTypes.data?.data.length > 0 && !selectedNotification) {
            setSelectedNotification(notificationTypes.data?.data[0]?._id);
        }
    }, [notificationTypes]);

    const handleFilterApply = (filters) => {
    };
    const handleProvinceChange = (event) => {
        setSelectedProvince(event.target.value);
    };
    return (
        <Box>
            <Grid sx={{ backgroundColor: 'white', p: 3, mt: '-25px' }} container justifyContent="space-between" alignItems="center" spacing={2} mb={3}>
                <Grid size={{ xs: 12, md: 5, lg: 6 }}>
                    <Typography variant="h5" fontWeight={550}>
                        Report Dashboard
                    </Typography>
                    <Typography variant="body1" mt={1} color="text.secondary">
                        Monitor SOS activity, trends, and export data for analysis.
                    </Typography>
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
                    <Grid size={{ xs: 12, md: 4 }} sx={{}}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: 5, backgroundColor: '#E0F2FE', borderRadius: '16px', px: 3, py: 5 }}>
                            <Box>
                                <Typography variant="body1">Total Reports</Typography>
                                <Typography variant="h5" fontWeight={600}>1342</Typography>
                            </Box>
                            <Box>
                                <img src={ReportIcon} alt="ReportIcon" />
                            </Box>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }} sx={{}}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: 5, backgroundColor: '#DBEAFE', borderRadius: '16px', px: 3, py: 5 }}>
                            <Box>
                                <Typography variant="body1">Top Locations</Typography>
                                <Typography variant="h5" fontWeight={600}>Cape Town</Typography>
                            </Box>
                            <Box>
                                <img src={LocationIcon} alt="LocationIcon" />
                            </Box>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }} sx={{}}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: 5, backgroundColor: '#FEE2E2', borderRadius: '16px', px: 3, py: 5 }}>
                            <Box>
                                <Typography variant="body1">Critical Incidents</Typography>
                                <Typography variant="h5" fontWeight={600}>24</Typography>
                            </Box>
                            <Box>
                                <img src={DangerIcon} alt="DangerIcon" />
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
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="h6" component="h2" fontWeight="medium">
                                        SOS Requests Over Time
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }} sx={{ mt: { xs: 2, sm: 0 } }}>
                                    <FormControl size="small" sx={{ width: '100%' }}>
                                        <InputLabel>All Categories</InputLabel>
                                        <Select
                                            value={selectedNotification}
                                            onChange={handleNotificationChange}
                                            label="All Categories"
                                        >
                                            <MenuItem value="">All Categories</MenuItem>
                                            {notificationTypes.data?.data?.map((type) => (
                                                <MenuItem key={type._id} value={type._id}>
                                                    {type.display_title}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                            <Box sx={{ minHeight: 400 }}>
                                <CustomChart data={chartData} />
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
                            <CustomPie
                                companyList={companyList}
                                driverList={driverList}
                                activeUser={activeUser}
                                timeTitle={timeTitle}
                            />
                        </Paper>
                    </Grid>
                </Grid>
                <Grid container spacing={3}>
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
                        <Grid container justifyContent="space-between" alignItems="center" mb={2}>
                            <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', flexDirection: 'row', gap: 2, mb: { xs: 1, md: 0 } }}>
                                <Typography variant="h6" fontWeight={590}>Detailed SOS Report</Typography>

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
                                    <FormControl size="small" sx={{ maxWidth: 200 }}>
                                        <InputLabel>All Categories</InputLabel>
                                        <Select
                                            value={selectedNotification}
                                            onChange={handleNotificationChange}
                                            label="All Categories"
                                        >
                                            <MenuItem value="">All Categories</MenuItem>
                                            {notificationTypes.data?.data?.map((type) => (
                                                <MenuItem key={type._id} value={type._id}>
                                                    {type.display_title}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                </Box>

                            </Grid>
                        </Grid>

                        {SosList.length <= 0 ? (
                            <Loader />
                        ) : SosList.length > 0 ? (
                            <Box sx={{ px: { xs: 0, md: 2 }, pt: { xs: 0, md: 3 }, backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
                                <TableContainer >
                                    <Table sx={{ '& .MuiTableCell-root': { borderBottom: 'none', fontSize: '15px' } }}>
                                        <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                            <TableRow >
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', borderTopLeftRadius: '10px' }}>Responder</TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>User</TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Type</TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Time</TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Location</TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Status</TableCell>
                                                <TableCell align="center" sx={{ backgroundColor: '#F9FAFB', borderTopRightRadius: '10px', color: '#4B5563' }}>Action</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {SosList?.map((user) => (
                                                <TableRow key={user._id}>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        <Stack direction="row" alignItems="center" gap={1}>
                                                            <Avatar
                                                                src={user.profileImage || nouser}
                                                                alt="User"
                                                            />

                                                            {user.responder}

                                                        </Stack>
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        <Stack direction="row" alignItems="center" gap={1}>
                                                            <Avatar
                                                                src={user.profileImage || nouser}
                                                                alt="User"
                                                            />

                                                            {user.user || "-"}

                                                        </Stack>
                                                    </TableCell>
                                                    <TableCell sx={{ color: user.colorCode }}>

                                                        {user.type || "-"}

                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>

                                                        {user.time || "-"}

                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>

                                                        {user.Location || "-"}

                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        <Chip
                                                            label={user.status}
                                                            sx={{
                                                                backgroundColor:
                                                                    user.status === 'resolved' ? '#DCFCE7' :
                                                                        user.status === 'pending' ? '#FEF9C3' :
                                                                            '#FEF9C3',
                                                                '& .MuiChip-label': {
                                                                    textTransform: 'capitalize',
                                                                    color: user.status === 'resolved' ? 'green' :
                                                                        user.status === 'pending' ? '#854D0E' :
                                                                            'black',
                                                                }
                                                            }}

                                                        />
                                                    </TableCell>

                                                    <TableCell >
                                                        <Box align="center" sx={{ display: 'flex', flexDirection: 'row' }}>
                                                            <Tooltip title="View" arrow placement="top">
                                                                <IconButton onClick={() => nav(`/home/reports`)}>
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
                                                {[5, 10, 15, 20, 50, 100].map((num) => (
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
                </Grid>
            </Box>
        </Box>

    );
};

export default Report;
