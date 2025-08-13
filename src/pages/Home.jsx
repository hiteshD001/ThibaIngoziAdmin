import { Link, useNavigate } from "react-router-dom";
import {
    // useGetActiveSOS,
    useGetRecentSOS,
    useGetUser,
    useGetActiveSosData,
    useUpdateLocationStatus, useGetNotificationType,
} from "../API Calls/API";
import {
    Box, Typography, TextField, Button, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, Grid, InputAdornment, Stack, Select, MenuItem, FormControl, InputLabel
} from "@mui/material";
import { startOfYear } from "date-fns";
import calender from '../assets/images/calender.svg';
import CustomDateRangePicker from "../common/Custom/CustomDateRangePicker";
import search from '../assets/images/search.svg';
import ViewBtn from '../assets/images/ViewBtn.svg'
import { useWebSocket } from "../API Calls/WebSocketContext";
import nouser from "../assets/images/NoUser.png";
import CustomPagination from "../common/Custom/CustomPagination";
import { format } from "date-fns";
import HotspotSection from "../common/HotspotSection";
import Loader from "../common/Loader";
import Analytics from "../common/Analytics";
import { SOSStatusUpdate } from "../common/ConfirmationPOPup";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { toastOption } from "../common/ToastOptions";
import moment from "moment/moment";
import { useQueryClient } from "@tanstack/react-query";


const Home = ({ isMapLoaded }) => {
    // filters
    const [filter, setfilter] = useState("");
    const [recentFilter, setRecentFilter] = useState("");
    const [statusUpdate, setStatusUpdate] = useState(false);
    const [status, setStatus] = useState('')
    // const [activeUsers, setActiveUsers] = useState([])
    const [selectedId, setSelectedId] = useState("");
    const [selectedNotification, setSelectedNotification] = useState("all");
    const [recentNotification, setRecentNotification] = useState("all")
    // const { isConnected, activeUserList } = useWebSocket();
    const queryClient = useQueryClient();
    const notificationTypes = useGetNotificationType();
    // Recent SOS pagination
    const [recentPage, setRecentPage] = useState(1);
    const [recentLimit, setRecentLimit] = useState(20);
    // Active SOS pagination
    const [activePage, setActivePage] = useState(1);
    const [activeLimit, setActiveLimit] = useState(20);
    // date picker 
    const [rangeSos, setRangeSos] = useState([
        {
            startDate: startOfYear(new Date()),
            endDate: new Date(),
            key: 'selection'
        }
    ]);
    const [range, setRange] = useState([
        {
            startDate: startOfYear(new Date()),
            endDate: new Date(),
            key: 'selection'
        }
    ]);
    const startDate = range[0].startDate.toISOString();
    const endDate = range[0].endDate.toISOString();
    const startDateSos = range[0].startDate.toISOString();
    const endDateSos = range[0].endDate.toISOString();

    const nav = useNavigate();
    const userId = localStorage.getItem("userID");
    const role = localStorage.getItem("role");

    const { data: recentSos, isFetching, refetch: refetchRecentSOS } = useGetRecentSOS(recentPage, recentLimit, startDate, endDate, recentFilter, recentNotification);
    const activeUserList = useGetActiveSosData(activePage, activeLimit, startDateSos, endDateSos, filter, selectedNotification);
    // const activeSOS = useGetActiveSOS();

    const onSuccess = () => {
        toast.success("Status Updated Successfully.");
        setStatusUpdate(false);
        setSelectedId("");
        queryClient.refetchQueries(["activeSOS2"], { exact: false });
    };
    const onError = (error) => {
        toast.error(
            error.response.data.message || "Something went Wrong",
            toastOption
        );
    };

    const handleNotificationChange = (e) => {
        setSelectedNotification(e.target.value);
    };
    const handleRecentNotificationChange = (e) => {
        setRecentNotification(e.target.value)
    }
    // useEffect(() => {
    //     if (notificationTypes.data?.data.length > 0 && !selectedNotification) {
    //         setSelectedNotification(notificationTypes.data?.data[0]?._id);
    //     }
    // }, [notificationTypes]);


    // const getUniqueById = (array) => {
    //     const map = new Map();
    //     array.forEach(item => {
    //         map.set(item._id, item);
    //     });
    //     return [...map.values()];
    // };

    // useEffect(() => {
    //     setActiveUsers(prev => {
    //         const combined = [...prev, ...activeSOS || []];
    //         return getUniqueById(combined);
    //     });
    // }, [activeSOS]);

    const { mutate } = useUpdateLocationStatus(onSuccess, onError);
    const userinfo = useGetUser(localStorage.getItem("userID"));

    const handleUpdate = () => {
        const toUpdate = {
            help_received: status,
        };
        mutate({
            id: selectedId,
            data: toUpdate,
        });
        setStatusUpdate(false)
    };
    const handleCancel = () => {
        setSelectedId("");
        setStatusUpdate(false);
        setStatus('')
    };

    useEffect(() => {
        if (activeUserList) {
            refetchRecentSOS();
            queryClient.invalidateQueries(['chartData'], { exact: false });
            queryClient.invalidateQueries(['hotspot'], { exact: false });
        }
    }, [activeUserList?.length]);


    return (
        <Box>
            <Analytics id={role !== "super_admin" ? userId : null} />
            <Box p={2}>
                {/* active sos */}
                <Paper elevation={1} sx={{ backgroundColor: "rgb(253, 253, 253)", mb: 4, padding: 2, borderRadius: '10px' }}>
                    <Grid container justifyContent="space-between" alignItems="center" mb={2}>
                        <Grid size={{ xs: 12, lg: 3 }} sx={{ display: 'flex', flexDirection: 'row', gap: 2, mb: { xs: 1, md: 0 } }}>
                            <Typography variant="h6" fontWeight={590}>Active SOS Alerts</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, lg: 9 }} sx={{ display: 'flex', justifyContent: 'flex-end', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mt: { xs: 2, lg: 0 } }}>
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
                                <CustomDateRangePicker
                                    value={range}
                                    onChange={setRange}
                                    icon={calender}
                                />
                                <FormControl size="small" sx={{ maxWidth: 200 }}>
                                    <InputLabel>All Categories</InputLabel>
                                    <Select
                                        value={selectedNotification}
                                        onChange={handleNotificationChange}
                                        label="All Categories"
                                    >
                                        <MenuItem value="all">All Categories</MenuItem>
                                        {notificationTypes.data?.data?.map((type) => (
                                            <MenuItem key={type._id} value={type._id}>
                                                {type.type}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>


                                <Button
                                    sx={{ height: '40px', width: '100px', borderRadius: '8px' }}
                                    onClick={() => nav("/home")}
                                >
                                    View All
                                </Button>
                            </Box>

                        </Grid>
                    </Grid>

                    {activeUserList?.length > 0 ? (
                        <Box sx={{ px: { xs: 0, md: 2 }, pt: { xs: 0, md: 3 }, backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
                            <TableContainer >
                                <Table sx={{ '& .MuiTableCell-root': { borderBottom: 'none', fontSize: '15px' } }}>
                                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                        <TableRow >
                                            <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', borderTopLeftRadius: '10px' }}>Driver</TableCell>
                                            <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Company</TableCell>
                                            <TableCell sx={{
                                                backgroundColor: '#F9FAFB',
                                                color: '#4B5563',
                                            }}>Address</TableCell>
                                            <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Request reached</TableCell>
                                            <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Request Accept</TableCell>
                                            <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Type</TableCell>
                                            <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Time</TableCell>
                                            <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Status</TableCell>
                                            <TableCell align="center" sx={{ backgroundColor: '#F9FAFB', borderTopRightRadius: '10px', color: '#4B5563' }}>Location</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {activeUserList?.map((user) => (
                                            <TableRow key={user._id}>
                                                <TableCell sx={{ color: '#4B5563' }}>
                                                    {
                                                        user?.user_id?.role === "driver" ? (
                                                            <Link to={`/home/total-drivers/driver-information/${user?.user_id._id}`} className="link">
                                                                <Stack direction="row" alignItems="center" gap={1}>
                                                                    <Avatar
                                                                        src={
                                                                            user?.user_id
                                                                                ?.selfieImage ||
                                                                            nouser
                                                                        }
                                                                        alt="User"
                                                                    />

                                                                    {user?.user_id?.first_name || ''} {user?.user_id?.last_name || ''}
                                                                </Stack>
                                                            </Link>) : (
                                                            <Link to={`/home/total-users/user-information/${user?.user_id._id}`} className="link">
                                                                <Stack direction="row" alignItems="center" gap={1}>
                                                                    <Avatar
                                                                        src={
                                                                            user?.user_id
                                                                                ?.selfieImage ||
                                                                            nouser
                                                                        }
                                                                        alt="User"
                                                                    />

                                                                    {user?.user_id?.first_name || ''} {user?.user_id?.last_name || ''}
                                                                </Stack>
                                                            </Link>
                                                        )

                                                    }
                                                </TableCell>
                                                <TableCell sx={{ color: '#4B5563' }}>
                                                    {user?.user_id?.company_name}
                                                </TableCell>
                                                <TableCell sx={{
                                                    color: '#4B5563',
                                                }}>
                                                    {user?.address}
                                                </TableCell>
                                                <TableCell sx={{ color: '#4B5563' }}>
                                                    {user?.req_reach || "0"}
                                                </TableCell>
                                                <TableCell sx={{ color: '#4B5563' }}>
                                                    {user?.req_accept || "0"}
                                                </TableCell>
                                                <TableCell sx={{ color: '#4B5563' }}>
                                                    {user?.type?.type || "-"}
                                                </TableCell>
                                                <TableCell sx={{ color: '#4B5563' }}>
                                                    {moment(user?.createdAt).format('HH:mm:ss')}
                                                </TableCell>
                                                <TableCell sx={{ color: '#4B5563', minWidth: '110px' }}>
                                                    {!user?.help_received &&
                                                        <div className="select-container">
                                                            <select
                                                                name="help_received"
                                                                className="my-custom-select"
                                                                onChange={(e) => {
                                                                    setStatus(e.target.value);
                                                                    setStatusUpdate(true);
                                                                    setSelectedId(row._id);
                                                                }}
                                                            >
                                                                <option value="" hidden> Select </option>
                                                                <option value="help_received"> Help Received </option>
                                                                <option value="cancel"> Cancel </option>
                                                            </select>
                                                        </div>
                                                    }
                                                </TableCell>
                                                <TableCell >
                                                    <Box align="center" sx={{ display: 'flex', flexDirection: 'row' }}>
                                                        <IconButton onClick={() => nav(`/home/hotspot/location?locationId=${user?._id}&lat=${user?.lat}&long=${user?.long}&end_lat=${userinfo?.data?.data?.user?.current_lat}&end_long=${userinfo?.data?.data?.user?.current_long}&req_reach=${user?.req_reach}&req_accept=${user?.req_accept}`)}>
                                                            <img src={ViewBtn} alt="view button" />
                                                        </IconButton>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                            </TableContainer>
                            <CustomPagination
                                page={activePage}
                                setPage={setActivePage}
                                limit={activeLimit}
                                setLimit={setActiveLimit}
                                totalPages={activeUserList?.data?.totalPages || 1}
                                totalItems={activeUserList?.data?.totalItems || 0}
                            />
                        </Box>
                    ) : (
                        <Typography align="center" color="text.secondary" sx={{ mt: 2 }}>
                            No data found
                        </Typography>
                    )}
                </Paper>
                <HotspotSection isMapLoaded={isMapLoaded} />
                {/* recently closed sos */}
                <Paper elevation={1} sx={{ backgroundColor: "rgb(253, 253, 253)", mb: 2, padding: 2, borderRadius: '10px' }}>
                    <Grid container justifyContent="space-between" alignItems="center" mb={2}>
                        <Grid size={{ xs: 12, lg: 4 }} sx={{ display: 'flex', flexDirection: 'row', gap: 2, mb: { xs: 1, md: 0 } }}>
                            <Typography variant="h6" fontWeight={590}>Recently Closed SOS Alerts</Typography>

                        </Grid>
                        <Grid size={{ xs: 12, lg: 8 }} sx={{ display: 'flex', justifyContent: 'flex-end', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mt: { xs: 2, lg: 0 } }}>
                            <TextField
                                variant="outlined"
                                placeholder="Search"
                                value={recentFilter}
                                onChange={(e) => setRecentFilter(e.target.value)}
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
                                <CustomDateRangePicker
                                    value={rangeSos}
                                    onChange={setRangeSos}
                                    icon={calender}
                                />
                                <FormControl size="small" sx={{ maxWidth: 200 }}>
                                    <InputLabel>All Categories</InputLabel>

                                    <Select
                                        value={recentNotification}
                                        onChange={handleRecentNotificationChange}
                                        label="All Categories"
                                    >
                                        <MenuItem value="all">All Categories</MenuItem>
                                        {notificationTypes.data?.data?.map((type) => (
                                            <MenuItem key={type._id} value={type._id}>
                                                {type.type}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <Button
                                    sx={{ height: '40px', width: '100px', borderRadius: '8px' }}
                                    onClick={() => nav("/home")}

                                >
                                    View All
                                </Button>
                            </Box>

                        </Grid>
                    </Grid>
                    {
                        isFetching ? (
                            <Loader />) :
                            recentSos?.data?.items?.length > 0 ? (
                                <Box sx={{ px: { xs: 0, md: 2 }, pt: { xs: 0, md: 3 }, backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
                                    <TableContainer >
                                        <Table sx={{ '& .MuiTableCell-root': { borderBottom: 'none', fontSize: '15px' } }}>
                                            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                                <TableRow >
                                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', borderTopLeftRadius: '10px' }}>User</TableCell>
                                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Company</TableCell>
                                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Last Active Status</TableCell>
                                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Start Time Stamp</TableCell>
                                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>End Time Stamp</TableCell>
                                                    <TableCell align="center" sx={{ backgroundColor: '#F9FAFB', borderTopRightRadius: '10px', color: '#4B5563' }}>Action</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {recentSos?.data?.items?.map((row) => (
                                                    <TableRow key={row?._id}>
                                                        <TableCell sx={{ color: '#4B5563' }}>
                                                            {
                                                                row.user_id?.role === "driver" ? (
                                                                    <Link to={`/home/total-drivers/driver-information/${row.user_id._id}`} className="link">
                                                                        <Stack direction="row" alignItems="center" gap={1}>

                                                                            <Avatar
                                                                                src={
                                                                                    row?.user_id
                                                                                        ?.selfieImage ||
                                                                                    nouser
                                                                                }
                                                                                alt="User"
                                                                            />

                                                                            {row?.user_id?.first_name || ''} {row?.user_id?.last_name || ''}
                                                                        </Stack>

                                                                    </Link>) : (
                                                                    <Link to={`/home/total-users/user-information/${row.user_id._id}`} className="link">
                                                                        <Stack direction="row" alignItems="center" gap={1}>

                                                                            <Avatar
                                                                                src={
                                                                                    row?.user_id
                                                                                        ?.selfieImage ||
                                                                                    nouser
                                                                                }
                                                                                alt="User"
                                                                            />

                                                                            {row?.user_id?.first_name || ''} {row?.user_id?.last_name || ''}
                                                                        </Stack>
                                                                    </Link>
                                                                )
                                                            }
                                                        </TableCell>
                                                        <TableCell sx={{ color: '#4B5563' }}>
                                                            {row?.user_id?.company_name}
                                                        </TableCell>
                                                        <TableCell sx={{ color: '#4B5563' }}>

                                                            {row?.address}
                                                        </TableCell>
                                                        <TableCell sx={{ color: '#4B5563' }}>
                                                            {format(row?.createdAt, "HH:mm:ss - dd/MM/yyyy")}
                                                        </TableCell>
                                                        <TableCell sx={{ color: '#4B5563' }}>
                                                            {format(row?.updatedAt, "HH:mm:ss - dd/MM/yyyy")}
                                                        </TableCell>

                                                        <TableCell >
                                                            <Box align="center" sx={{ display: 'flex', flexDirection: 'row' }}>
                                                                <IconButton onClick={() => nav(`total-drivers/driver-information/${row?.user_id?._id}`)}>
                                                                    <img src={ViewBtn} alt="view button" />
                                                                </IconButton>
                                                            </Box>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>

                                    </TableContainer>
                                    <CustomPagination
                                        page={page}
                                        setPage={setPage}
                                        limit={limit}
                                        setLimit={setLimit}
                                        totalPages={recentSos?.data?.totalPages || 1}
                                        totalItems={recentSos?.data?.totalItems || 0}
                                    />
                                </Box>
                            ) : (
                                <Typography align="center" color="text.secondary" sx={{ mt: 2 }}>
                                    No data found
                                </Typography>
                            )}
                </Paper>
            </Box>
            {statusUpdate && (
                <SOSStatusUpdate
                    handleCancel={handleCancel}
                    handleUpdate={handleUpdate}
                />
            )}
        </Box>
    );
};

export default Home;