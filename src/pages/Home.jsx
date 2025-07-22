import { Link, NavLink } from "react-router-dom";
import {
    Box,
    Grid,
    Typography,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TableContainer,
    Paper,
    Select,
    MenuItem,
    TextField,
    Button,
    IconButton,
    FormControl,
    InputLabel,
    Avatar
} from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

import {
    useGetActiveSOS,
    useGetRecentSOS,
    useGetUser,
    useUpdateLocationStatus,
    useGetNotificationType,
} from "../API Calls/API";
import { useWebSocket } from "../API Calls/WebSocketContext";
import ViewBtn from '../assets/images/ViewBtn.svg'
import nouser from "../assets/images/NoUser.png";

import { format } from "date-fns";

import Loader from "../common/Loader";
import Analytics from "../common/Analytics";
import { SOSStatusUpdate } from "../common/ConfirmationPOPup";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { toastOption } from "../common/ToastOptions";
import moment from "moment/moment";
import { useQueryClient } from "@tanstack/react-query";

const Home = () => {
    const recentSOS = useGetRecentSOS();
    const activeSOS = useGetActiveSOS();
    const [statusUpdate, setStatusUpdate] = useState(false);
    const [status, setStatus] = useState('')
    const [activeUsers, setActiveUsers] = useState([])
    const [selectedId, setSelectedId] = useState("");
    const { isConnected, activeUserList } = useWebSocket();
    const queryClient = useQueryClient();
    const notificationTypes = useGetNotificationType();
    const [selectedNotification, setSelectedNotification] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const totalPages = Math.ceil(activeUsers.length / rowsPerPage);
    const paginatedData = activeUsers.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );
    const onSuccess = () => {
        toast.success("Status Updated Successfully.");
        setStatusUpdate(false);
        setSelectedId("");
        queryClient.refetchQueries(["activeSOS"]);
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

    useEffect(() => {
        if (notificationTypes.data?.data.length > 0 && !selectedNotification) {
            setSelectedNotification(notificationTypes.data?.data[0]?._id);
        }
    }, [notificationTypes]);
    const getUniqueById = (array) => {
        const map = new Map();
        array.forEach(item => {
            map.set(item._id, item); // or item.id depending on your data
        });
        return [...map.values()];
    };

    useEffect(() => {
        setActiveUsers([])
        setActiveUsers(prev => {
            const combined = [...prev, ...activeUserList || [], ...activeSOS || []];
            return getUniqueById(combined);
        });
    }, [activeUserList, activeSOS]);
    useEffect(() => {
        setActiveUsers([])
        setActiveUsers(prev => {
            const combined = [...prev, ...activeUserList || [], ...activeSOS || []];
            return getUniqueById(combined);
        });
    }, [activeUserList, activeSOS]);

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
    return (
        <Box className="container-fluid">
            <Analytics />
            {/* Recently closed sos */}
            <Box sx={{ mb: 4 }} >
                <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>

                    <Grid container alignItems="center" justifyContent="space-between" mb={2}>
                        <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: { xs: 'center', md: 'start' } }}>
                            <Typography variant="h6" gutterBottom>
                                Recent Closed SOS
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 8 }}>
                            <Grid container spacing={2} alignItems="center" sx={{ justifyContent: { xs: 'space-around', md: 'flex-end' }, mt: { xs: 2, md: 0 } }}>
                                <Grid >
                                    <TextField
                                        placeholder="Search..."
                                        variant="outlined"
                                        size="small"
                                        sx={{ borderRadius: 1 }}
                                    />
                                </Grid>
                                <Grid >
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
                                                    {type.type}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid>
                                    <Button variant="text" sx={{ color: '#367BE0' }}>
                                        View All
                                    </Button>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                    {recentSOS.isFetching ? (
                        <Loader />
                    ) : recentSOS.data?.data?.length > 0 ? (
                        <>

                            <TableContainer sx={{ maxHeight: 440, overflowX: "auto" }}>
                                <Table stickyHeader sx={{ minWidth: 650 }}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ backgroundColor: '#F9FAFB' }}>User</TableCell>
                                            <TableCell sx={{ backgroundColor: '#F9FAFB' }}>Company</TableCell>
                                            <TableCell sx={{ backgroundColor: '#F9FAFB' }}>Last Active Status</TableCell>
                                            <TableCell sx={{ backgroundColor: '#F9FAFB' }}>Start Time Stamp</TableCell>
                                            <TableCell sx={{ backgroundColor: '#F9FAFB' }}>End Time Stamp</TableCell>
                                            <TableCell sx={{ backgroundColor: '#F9FAFB' }}>Type</TableCell>
                                            <TableCell sx={{ backgroundColor: '#F9FAFB' }}>Status</TableCell>
                                            <TableCell sx={{ backgroundColor: '#F9FAFB' }} />
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {recentSOS.data.data.map((row) => (
                                            <TableRow key={row._id}>
                                                <TableCell>
                                                    <Box
                                                        display="flex"
                                                        alignItems="center"
                                                        gap={1}
                                                        className={!row.user_id?.username ? "nodata" : ""}
                                                    >
                                                        <Avatar
                                                            src={row.user_id?.selfieImage || nouser}
                                                            alt={row.user_id?.username || "N/A"}
                                                            sx={{ width: 32, height: 32 }}
                                                        />
                                                        <Typography variant="body2">
                                                            {row.user_id?.username}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>

                                                <TableCell
                                                    className={!row.user_id?.company_name ? "companynamenodata" : ""}
                                                >
                                                    {row.user_id?.company_name}
                                                </TableCell>

                                                <TableCell className={!row.address ? "nodata" : ""}>
                                                    {row.address}
                                                </TableCell>

                                                <TableCell className={!row.createdAt ? "nodata" : ""}>
                                                    {moment(row.createdAt).format("HH:mm:ss - DD/MM/YYYY")}
                                                </TableCell>

                                                <TableCell className={!row.updatedAt ? "nodata" : ""}>
                                                    {moment(row.updatedAt).format("HH:mm:ss - DD/MM/YYYY")}
                                                </TableCell>
                                                <TableCell>{row.type?.type || '-'}</TableCell>
                                                <TableCell>
                                                    <Select
                                                        size="small"
                                                        value={status && selectedId === row._id ? status : ''}
                                                        displayEmpty
                                                        sx={{
                                                            borderRadius: '20px',
                                                            backgroundColor: '#367BE01A',
                                                            border: 'none',
                                                            '& .MuiSelect-icon': {
                                                                display:
                                                                    'inline',
                                                            },
                                                        }}
                                                        onChange={(e) => {
                                                            setStatus(e.target.value);
                                                            setStatusUpdate(true);
                                                            setSelectedId(row._id);
                                                        }}
                                                    >
                                                        <MenuItem value="" disabled>
                                                            Select
                                                        </MenuItem>
                                                        <MenuItem value="help_received">Help Received</MenuItem>
                                                        <MenuItem value="cancel">Cancel</MenuItem>
                                                    </Select>
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        component={Link}
                                                        to={`total-drivers/driver-information/${row.user_id._id}`}
                                                        size="small"
                                                    >
                                                        <img src={ViewBtn} alt="view" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            <Grid container justifyContent="space-between" alignItems="center" mt={2}>
                                <Grid >
                                    <Typography variant="body2">
                                        Rows per page:&nbsp;
                                        <Select
                                            size="small"
                                            value={rowsPerPage}
                                            onChange={(e) => {
                                                setRowsPerPage(Number(e.target.value));
                                                setCurrentPage(1);
                                            }}
                                        >
                                            {[5, 10, 15, 20].map((num) => (
                                                <MenuItem key={num} value={num}>
                                                    {num}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </Typography>
                                </Grid>
                                <Grid>
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Typography variant="body2">
                                            {currentPage} / {totalPages}
                                        </Typography>
                                        <IconButton
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage((prev) => prev - 1)}
                                        >
                                            <ArrowBackIosNewIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            disabled={currentPage === totalPages}
                                            onClick={() => setCurrentPage((prev) => prev + 1)}
                                        >
                                            <ArrowForwardIosIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </Grid>
                            </Grid>
                        </>
                    ) : (
                        <Typography className="no-data-found">No Recent SOS</Typography>
                    )}
                </Paper>

            </Box>
            {/* active sos alerts */}
            <Box sx={{ mb: 4 }}>
                <Paper sx={{ p: 2, borderRadius: '10px' }}>
                    <Grid container alignItems="center" justifyContent="space-between" mb={2}>
                        <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: { xs: 'center', md: 'start' } }}>
                            <Typography variant="h6">Active SOS Alerts</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 8 }}>
                            <Grid container spacing={2} alignItems="center" sx={{ justifyContent: { xs: 'space-around', md: 'flex-end' }, mt: { xs: 2, md: 0 } }}>
                                <Grid >
                                    <TextField
                                        placeholder="Search..."
                                        variant="outlined"
                                        size="small"
                                        sx={{ borderRadius: 1 }}
                                    />
                                </Grid>
                                <Grid >
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
                                                    {type.type}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid>
                                    <Button variant="text" sx={{ color: '#367BE0' }}>
                                        View All
                                    </Button>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>

                    {activeUsers.length > 0 ? (
                        <>
                            <TableContainer sx={{ maxHeight: 440, overflowX: "auto" }}>
                                <Table stickyHeader sx={{ minWidth: 650 }}>
                                    <TableHead >
                                        <TableRow >
                                            <TableCell sx={{ backgroundColor: '#F9FAFB' }}>Driver</TableCell>
                                            <TableCell sx={{ backgroundColor: '#F9FAFB' }}>Company</TableCell>
                                            <TableCell sx={{ backgroundColor: '#F9FAFB' }}>Address</TableCell>
                                            <TableCell sx={{ backgroundColor: '#F9FAFB' }}>Request reached</TableCell>
                                            <TableCell sx={{ backgroundColor: '#F9FAFB' }}>Request Accept</TableCell>
                                            <TableCell sx={{ backgroundColor: '#F9FAFB' }}>Type</TableCell>
                                            <TableCell sx={{ backgroundColor: '#F9FAFB' }}>Time</TableCell>
                                            <TableCell sx={{ backgroundColor: '#F9FAFB' }}>Status</TableCell>
                                            <TableCell sx={{ backgroundColor: '#F9FAFB' }}>Location</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {paginatedData.map((row) => (
                                            <TableRow key={row._id}>
                                                <TableCell>
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        <img
                                                            src={row.user_id?.profileImage || nouser}
                                                            alt="Profile"
                                                            style={{ width: 30, height: 30, borderRadius: '50%' }}
                                                        />
                                                        {row.user_id?.username || 'N/A'}
                                                    </Box>
                                                </TableCell>
                                                <TableCell>{row.user_id?.company_name || '-'}</TableCell>
                                                <TableCell>{row.address || '-'}</TableCell>
                                                <TableCell>{row.req_reach}</TableCell>
                                                <TableCell>{row.req_accept}</TableCell>
                                                <TableCell>{row.type?.type || '-'}</TableCell>
                                                <TableCell>{moment(row?.createdAt).format('HH:mm:ss')}</TableCell>
                                                <TableCell>
                                                    <Select
                                                        size="small"
                                                        value={status && selectedId === row._id ? status : ''}
                                                        displayEmpty
                                                        sx={{
                                                            borderRadius: '20px',
                                                            backgroundColor: '#367BE01A',
                                                            border: 'none',
                                                            '& .MuiSelect-icon': {
                                                                display:
                                                                    'inline',
                                                            },
                                                        }}
                                                        onChange={(e) => {
                                                            setStatus(e.target.value);
                                                            setStatusUpdate(true);
                                                            setSelectedId(row._id);
                                                        }}
                                                    >
                                                        <MenuItem value="" disabled>
                                                            Select
                                                        </MenuItem>
                                                        <MenuItem value="help_received">Help Received</MenuItem>
                                                        <MenuItem value="cancel">Cancel</MenuItem>
                                                    </Select>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <NavLink
                                                        to={`/home/hotspot/location?locationId=${row?._id}&lat=${row?.lat}&long=${row?.long}&end_lat=${userinfo?.data?.data?.user?.current_lat}&end_long=${userinfo?.data?.data?.user?.current_long}&req_reach=${row?.req_reach}&req_accept=${row?.req_accept}`}
                                                    >
                                                        <img src={ViewBtn} alt="view" />
                                                    </NavLink>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            <Grid container justifyContent="space-between" alignItems="center" mt={2}>
                                <Grid >
                                    <Typography variant="body2">
                                        Rows per page:&nbsp;
                                        <Select
                                            size="small"
                                            value={rowsPerPage}
                                            onChange={(e) => {
                                                setRowsPerPage(Number(e.target.value));
                                                setCurrentPage(1);
                                            }}
                                        >
                                            {[5, 10, 15, 20].map((num) => (
                                                <MenuItem key={num} value={num}>
                                                    {num}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </Typography>
                                </Grid>
                                <Grid>
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Typography variant="body2">
                                            {currentPage} / {totalPages}
                                        </Typography>
                                        <IconButton
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage((prev) => prev - 1)}
                                        >
                                            <ArrowBackIosNewIcon fontSize="small" />
                                        </IconButton>

                                        <IconButton
                                            disabled={currentPage === totalPages}
                                            onClick={() => setCurrentPage((prev) => prev + 1)}
                                        >
                                            <ArrowForwardIosIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </Grid>
                            </Grid>
                        </>
                    ) : (
                        <Typography variant="body1" color="text.secondary">
                            No Active SOS
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
