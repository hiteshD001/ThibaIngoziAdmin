import { Link, NavLink, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import {
    useGetActiveSOS,
    useGetRecentSOS,
    useGetUser,
    useUpdateLocationStatus, useGetNotificationType,
} from "../API Calls/API";
import {
    Box, Typography, TextField, Button, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, Grid, InputAdornment, Stack, Select, MenuItem, FormControl, InputLabel
} from "@mui/material";

import search from '../assets/images/search.svg';
import ViewBtn from '../assets/images/ViewBtn.svg'
import { useWebSocket } from "../API Calls/WebSocketContext";
import nouser from "../assets/images/NoUser.png";
import CustomPagination from "../common/CustomPagination";
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
    const [filter, setfilter] = useState("");
    const [statusUpdate, setStatusUpdate] = useState(false);
    const [status, setStatus] = useState('')
    const [activeUsers, setActiveUsers] = useState([])
    const [selectedId, setSelectedId] = useState("");
    const [selectedNotification, setSelectedNotification] = useState("");
    const { isConnected, activeUserList } = useWebSocket();
    const queryClient = useQueryClient();
    const notificationTypes = useGetNotificationType();
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const nav = useNavigate();
    const { data: recentSos, isFetching, refetch } = useGetRecentSOS(page, limit);
    const activeSOS = useGetActiveSOS();
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
            map.set(item._id, item);
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
        if (activeUserList?.length > 0) {
            refetch();
            console.log('refetched')
        }
    }, [activeUserList?.length]);

    // active user list pagination
    // const [activePage, setActivePage] = useState(1);
    // const [activeLimit, setActiveLimit] = useState(10);
    // useEffect(() => {
    //     const maxPage = Math.max(
    //         1,
    //         Math.ceil((activeUserList?.length || 0) / activeLimit)
    //     );
    //     if (activePage > maxPage) setActivePage(maxPage);
    // }, [activeUserList, activeLimit]);
    // const paginatedActive = useMemo(() => {
    //     const start = (activePage - 1) * activeLimit;
    //     return activeUserList?.slice(start, start + activeLimit) || [];
    // }, [activeUserList, activePage, activeLimit]);

    return (
        <Box p={2}>
            <Analytics />
            <Paper elevation={1} sx={{ backgroundColor: "rgb(253, 253, 253)", mb: 4, padding: 2, borderRadius: '10px' }}>
                <Grid container justifyContent="space-between" alignItems="center" mb={2}>
                    <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', flexDirection: 'row', gap: 2, mb: { xs: 1, md: 0 } }}>
                        <Typography variant="h6" fontWeight={590}>Active SOS Alerts</Typography>
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
                {isConnected && activeUserList?.length > 0 ? (
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
                                                <Stack direction="row" alignItems="center" gap={1}>
                                                    <Avatar
                                                        src={
                                                            user?.user_id
                                                                ?.selfieImage || user?.user_id.fullImage ||
                                                            nouser
                                                        }
                                                        alt="User"
                                                    />

                                                    {user?.user_id?.username}
                                                </Stack>
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
                    </Box>
                ) : (
                    <Typography align="center" color="text.secondary" sx={{ mt: 2 }}>
                        No data found
                    </Typography>
                )}
            </Paper>
            <Paper elevation={1} sx={{ backgroundColor: "rgb(253, 253, 253)", mb: 2, padding: 2, borderRadius: '10px' }}>
                <Grid container justifyContent="space-between" alignItems="center" mb={2}>
                    <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', flexDirection: 'row', gap: 2, mb: { xs: 1, md: 0 } }}>
                        <Typography variant="h6" fontWeight={590}>Recently Closed SOS Alerts</Typography>
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
                                                        <Stack direction="row" alignItems="center" gap={1}>

                                                            <Avatar
                                                                src={
                                                                    row?.user_id
                                                                        ?.selfieImage ||
                                                                    nouser
                                                                }
                                                                alt="User"
                                                            />

                                                            {row?.user_id?.username}
                                                        </Stack>
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
                                                        {moment(row?.updatedAt).format("HH:mm:ss - dd/MM/yyyy")}
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



{/* <div className="row">
    <div className="col-md-12">
        <div className="theme-table">
            <div className="tab-heading">
                {" "}
                <h3>Active SOS Alerts</h3>{" "}
            </div>

            {isConnected && activeUserList?.length > 0 ? (
                <>
                    <table
                        id="example"
                        className="table table-striped nowrap"
                        style={{ width: "100%" }}
                    >
                        <thead>
                            <tr>
                                <th>Driver</th>
                                <th style={{ width: "10%" }}>Company</th>
                                <th>Address</th>
                                <th style={{ width: "9%" }}>Request reached</th>
                                <th style={{ width: "9%" }}>Request Accept</th>
                                <th style={{ width: "9%" }}>Type</th>
                                <th style={{ width: "11%" }}>Time</th>
                                <th style={{ width: "11%" }}>Status</th>
                                <th style={{ width: "10%" }}>Location</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeUserList.map((row) => (
                                <tr key={row._id}>
                                    <td>
                                        <div
                                            className={
                                                !row.user_id?.username
                                                    ? "prof nodata"
                                                    : "prof"
                                            }
                                        >
                                            <img
                                                className="profilepicture"
                                                src={
                                                    row.user_id
                                                        ?.selfieImage || row.user_id.fullImage ||
                                                    nouser
                                                }
                                            />
                                            {row.user_id?.username}
                                        </div>
                                    </td>

                                    <td
                                        className={
                                            !row.user_id?.company_name
                                                ? "companynamenodata"
                                                : ""
                                        }
                                    >
                                        {row.user_id?.company_name}
                                    </td>

                                    <td
                                        className={
                                            !row.address ? "nodata" : ""
                                        }
                                    >
                                        {row.address}
                                    </td>

                                    <td>{row.req_reach}</td>

                                    <td>{row.req_accept}</td>
                                    <td>{row.type?.type || "-"}</td>
                                    <td>{moment(row?.createdAt).format('HH:mm:ss')}</td>
                                    <td>
                                        {!row?.help_received && <select
                                            name="help_received"
                                            className="form-control"
                                            onChange={(e) => {
                                                setStatus(e.target.value);
                                                setStatusUpdate(true);
                                                setSelectedId(row._id);
                                            }}
                                        >
                                            <option value="" hidden> Select </option>
                                            <option value="help_received"> Help Received </option>
                                            <option value="cancel"> Cancel </option>
                                        </select>}
                                    </td>
                                    <td>
                                        <NavLink
                                            type="button"
                                            to={``}
                                            className="tbl-btn"
                                        >
                                            view
                                        </NavLink>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            ) : (
                <p className="no-data-found">No Active SOS</p>
            )}
        </div>
    </div>
</div> */}


{/* <div className="row">
    <div className="col-md-12">
        <div className="theme-table">
            <div className="tab-heading">
                <h3>Recently Closed SOS Alerts</h3>
            </div>

            {isFetching ? (
                <Loader />
            ) : recentSos?.data?.items?.length > 0 ? (
                <>
                    <table
                        id="example"
                        className="table table-striped nowrap"
                        style={{ width: "100%" }}
                    >
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Company</th>
                                <th>Last Active Status</th>
                                <th>Start Time Stamp</th>
                                <th>End Time Stamp</th>
                                <th>&nbsp;</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentSos?.data?.items?.map((row) => (
                                <tr key={row._id}>
                                    <td>
                                        <div
                                            className={
                                                !row.user_id?.username
                                                    ? "prof nodata"
                                                    : "prof"
                                            }
                                        >
                                            <img
                                                className="profilepicture"
                                                src={
                                                    row.user_id
                                                        ?.selfieImage ||
                                                    nouser
                                                }
                                            />
                                            {row.user_id?.username}
                                        </div>
                                    </td>

                                    <td
                                        className={
                                            !row.user_id?.company_name
                                                ? "companynamenodata"
                                                : ""
                                        }
                                    >
                                        {row.user_id?.company_name}
                                    </td>

                                    <td
                                        className={
                                            !row.address ? "nodata" : ""
                                        }
                                    >
                                        {row.address}
                                    </td>

                                    <td
                                        className={
                                            !row.createdAt
                                                ? "nodata"
                                                : ""
                                        }
                                    >
                                        {format(row.createdAt, "HH:mm:ss - dd/MM/yyyy")}
                                    </td>
                                    <td
                                        className={
                                            !row.updatedAt
                                                ? "nodata"
                                                : ""
                                        }
                                    >
                                        {moment(row?.updatedAt).format("HH:mm:ss - dd/MM/yyyy")}
                                      
                                    </td>
                                    <td>
                                        <Link
                                            to={`total-drivers/driver-information/${row.user_id._id}`}
                                            className="tbl-btn"
                                        >
                                            view
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                </>
            ) : (
                <p className="no-data-found">No Recent SOS</p>
            )}
        </div>
    </div>
</div> */}