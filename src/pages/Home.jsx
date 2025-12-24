import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    // useGetActiveSOS,
    useGetRecentSOS,
    useGetUser,
    useGetActiveSosData,
    useUpdateLocationStatus, useGetNotificationType,
} from "../API Calls/API";
import {
    Box, Typography, TextField, Button, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, Grid, InputAdornment, Stack, Select, MenuItem, FormControl, InputLabel,
    Tooltip,
    TableSortLabel,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Switch
} from "@mui/material";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { useRef } from "react";
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
import { Slide, toast } from "react-toastify";
import { toastOption } from "../common/ToastOptions";
import moment from "moment/moment";
import { useQueryClient } from "@tanstack/react-query";
import { FaLocationDot } from "react-icons/fa6";
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CloseIcon from '@mui/icons-material/Close';
import arrowup from '../assets/images/arrowup.svg';
import arrowdown from '../assets/images/arrowdown.svg';
import arrownuteral from '../assets/images/arrownuteral.svg';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import tone from "../assets/audio/notification.mp3"
import { enable2FA } from "../API Calls/authAPI";
import QRCode from 'qrcode';

const copyButtonStyles = {
    color: '#4285F4 !important',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
};

const audio = new Audio(tone);

const Home = ({ isMapLoaded, }) => {
    // filters
    const [filter, setfilter] = useState("");
    const [recentFilter, setRecentFilter] = useState("");
    const [statusUpdate, setStatusUpdate] = useState(false);
    const [status, setStatus] = useState('')
    // const [activeUsers, setActiveUsers] = useState([])
    const [selectedId, setSelectedId] = useState("");
    const [selectedNotification, setSelectedNotification] = useState("all");
    const [recentNotification, setRecentNotification] = useState("all")
    const { newSOS } = useWebSocket();
    const location = useLocation();

    const queryClient = useQueryClient();
    const notificationTypes = useGetNotificationType();
    // Recent SOS pagination
    const [recentPage, setRecentPage] = useState(1);
    const [recentLimit, setRecentLimit] = useState(10);
    // Active SOS pagination
    const [activePage, setActivePage] = useState(1);
    const [activeLimit, setActiveLimit] = useState(10);

    // 2FA
    const [showQRCode, setShowQRCode] = useState(false);
    const [qrCodeData, setQrCodeData] = useState(null);
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    const [is2FALoading, setIs2FALoading] = useState(false);

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
    const startDateSos = rangeSos[0].startDate.toISOString();
    const endDateSos = rangeSos[0].endDate.toISOString();

    // Sort
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("desc");

    const [sortBy2, setSortBy2] = useState("createdAt");
    const [sortOrder2, setSortOrder2] = useState("desc");

    const changeSortOrder = (e) => {
        const field = e.target.id;
        if (field !== sortBy) {
            setSortBy(field);
            setSortOrder("asc");
        } else {
            setSortOrder(p => p === 'asc' ? 'desc' : 'asc')
        }
    }

    const changeSortOrder2 = (e) => {
        const field = e.target.id;
        if (field !== sortBy2) {
            setSortBy2(field);
            setSortOrder2("asc");

        } else {
            setSortOrder2(p => p === 'asc' ? 'desc' : 'asc')
        }
    }

    const nav = useNavigate();
    const userId = localStorage.getItem("userID");
    const role = localStorage.getItem("role");

    const { data: recentSos, isFetching, refetch: refetchRecentSOS } = useGetRecentSOS(recentPage, recentLimit, startDate, endDate, recentFilter, recentNotification, sortBy, sortOrder);
    const activeSos = useGetActiveSosData(activePage, activeLimit, startDateSos, endDateSos, filter, selectedNotification, sortBy2, sortOrder2);
    const activeUserList = activeSos?.data?.data?.data

    const prevLengthRef = useRef(activeUserList?.length);

    const handle2FAToggle = async (e) => {
        const newValue = e.target.checked;
        setIs2FALoading(true);

        if (newValue) {
            // ENABLE 2FA
            const response = await enable2FA();

            if (!response?.secret || !response?.otpauthUrl) {
                throw new Error("Invalid 2FA setup response");
            }

            const qrCodeDataUrl = await QRCode.toDataURL(response.otpauthUrl);

            setQrCodeData({
                secret: response.secret,
                otpauthUrl: response.otpauthUrl,
                qrCodeDataUrl,
            });

            setShowQRCode(true);
            setIs2FAEnabled(true);
            queryClient.invalidateQueries("user", { exact: false });
        }
        setIs2FALoading(false);
    };

    useEffect(() => {
        if (!Array.isArray(activeUserList)) return;

        const currentLength = activeUserList.length;
        const previousLength = prevLengthRef.current;

        // First run setup
        if (previousLength === null) {
            prevLengthRef.current = currentLength;
            return;
        }

        // Trigger only when count changes
        if (previousLength !== currentLength) {
            prevLengthRef.current = currentLength;   // update stored length
            refetchRecentSOS();
            queryClient.invalidateQueries(['chartData'], { exact: false });
            queryClient.invalidateQueries(['hotspot'], { exact: false });
        }
    }, [activeUserList?.length, refetchRecentSOS]);

    // Refetch active SOS when we receive new SOS notification from WebSocket
    useEffect(() => {
        if (!newSOS || newSOS === 0) return;

        const fetchData = async () => {
            try {
                const res = await activeSos.refetch();
                if (res?.data?.status === 200 && !activeSos.isPending) {
                    // await audio.play().catch(() => { });
                    // toast.info("New SOS Alert Received", { autoClose: 2000, hideProgressBar: true, transition: Slide })
                }
            } catch (error) {
                console.error("Refetch failed:", error);
            }
        };

        fetchData();
    }, [newSOS]);

    useEffect(() => {
        const status = userinfo?.data?.data?.user?.company_id?.twoFactorAuth?.enabled

        if (!status && location?.state?.from === "login") {
            setShowQRCode(true);
        }
    }, [])


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

    const [textToCopy, setTextToCopy] = useState('')

    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
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

    const totalActiveItems = activeSos?.data?.data?.totalItems || 0
    const totalActivePages = Math.ceil(totalActiveItems / activeLimit)
    const totalRecentItems = recentSos?.data?.totalItems
    const totalRecentPages = Math.ceil(totalRecentItems / recentLimit)

    return (
        <Box>
            <Analytics
                id={role !== "super_admin" ? userId : null}
                activePage={activePage}
                activeLimit={activeLimit}
                startDateSos={startDateSos}
                endDateSos={endDateSos}
                filter={filter}
                startDate={startDate}
                endDate={endDate}
                recentFilter={recentFilter}
                recentNotification={recentNotification} />

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
                                    value={rangeSos}
                                    onChange={setRangeSos}
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
                                                {type.display_title}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>


                                <Button
                                    sx={{ height: '40px', width: '100px', borderRadius: '8px' }}
                                    onClick={() => {

                                        setfilter("");
                                        setSelectedNotification("all");
                                        setRangeSos([
                                            {
                                                startDate: startOfYear(new Date()),
                                                endDate: new Date(),
                                                key: 'selection'
                                            }
                                        ]);
                                        setActivePage(1);
                                        setActiveLimit(20);
                                        setSortBy2("createdAt");
                                        setSortOrder2("desc");

                                        nav("/home");
                                    }}
                                >
                                    View All
                                </Button>
                            </Box>

                        </Grid>
                    </Grid>

                    {/* {activeUserList?.length > 0 ? ( */}
                    <Box sx={{ px: { xs: 0, md: 2 }, pt: { xs: 0, md: 3 }, backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
                        <TableContainer >
                            <Table sx={{ '& .MuiTableCell-root': { fontSize: '15px' } }}>

                                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                    <TableRow >
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', borderTopLeftRadius: '10px' }}>
                                            <TableSortLabel
                                                id="first_name"
                                                active={sortBy2 === 'first_name'}
                                                direction={sortOrder2}
                                                onClick={changeSortOrder2}
                                                IconComponent={() => <img src={sortBy2 === 'first_name' ? sortOrder2 === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                            >
                                                Driver
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                            <TableSortLabel
                                                id="company_name"
                                                active={sortBy2 === 'company_name'}
                                                direction={sortOrder2}
                                                onClick={changeSortOrder2}
                                                IconComponent={() => <img src={sortBy2 === 'company_name' ? sortOrder2 === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                            >
                                                Company
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                            <TableSortLabel
                                                id="address"
                                                active={sortBy2 === 'address'}
                                                direction={sortOrder2}
                                                onClick={changeSortOrder2}
                                                IconComponent={() => <img src={sortBy2 === 'address' ? sortOrder2 === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                            >
                                                Address
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                            <TableSortLabel
                                                id="req_reach"
                                                active={sortBy2 === 'req_reach'}
                                                direction={sortOrder2}
                                                onClick={changeSortOrder2}
                                                IconComponent={() => <img src={sortBy2 === 'req_reach' ? sortOrder2 === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                            >
                                                Request reached
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                            <TableSortLabel
                                                id="req_accept"
                                                active={sortBy2 === 'req_accept'}
                                                direction={sortOrder2}
                                                onClick={changeSortOrder2}
                                                IconComponent={() => <img src={sortBy2 === 'req_accept' ? sortOrder2 === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                            >
                                                Request Accepted
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                            <TableSortLabel
                                                id="type"
                                                active={sortBy2 === 'type'}
                                                direction={sortOrder2}
                                                onClick={changeSortOrder2}
                                                IconComponent={() => <img src={sortBy2 === 'type' ? sortOrder2 === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                            >
                                                Type
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                            <TableSortLabel
                                                id="createdAt"
                                                active={sortBy2 === 'createdAt'}
                                                direction={sortOrder2}
                                                onClick={changeSortOrder2}
                                                IconComponent={() => <img src={sortBy2 === 'createdAt' ? sortOrder2 === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                            >
                                                Time
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Status</TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Trip Type</TableCell>
                                        <TableCell align="center" sx={{ backgroundColor: '#F9FAFB', borderTopRightRadius: '10px', color: '#4B5563' }}>Location</TableCell>
                                        <TableCell align="center" sx={{ backgroundColor: '#F9FAFB', borderTopRightRadius: '10px', color: '#4B5563' }}>    </TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {activeSos.isPending ?
                                        <TableRow>
                                            <TableCell sx={{ color: '#4B5563', borderBottom: 'none' }} colSpan={9} align="center">
                                                <Loader />
                                            </TableCell>
                                        </TableRow>
                                        : (activeUserList?.length > 0 ?
                                            activeUserList?.map((user) => (
                                                <TableRow key={user._id}>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        {
                                                            user?.user?.role === "driver" ? (
                                                                <Link to={`/home/total-drivers/driver-information/${user?.user?._id}`} className="link">
                                                                    <Stack direction="row" alignItems="center" gap={1}>
                                                                        <Avatar
                                                                            src={
                                                                                user?.user
                                                                                    ?.selfieImage ||
                                                                                nouser
                                                                            }
                                                                            sx={{ '&:hover': { textDecoration: 'none' } }}
                                                                            alt="User"
                                                                        />

                                                                        {user?.user?.first_name || ''} {user?.user?.last_name || ''}
                                                                    </Stack>
                                                                </Link>) : (
                                                                <Link to={`/home/total-users/user-information/${user?.user?._id}`} className="link">
                                                                    <Stack direction="row" alignItems="center" gap={1}>
                                                                        <Avatar
                                                                            src={
                                                                                user?.user
                                                                                    ?.selfieImage ||
                                                                                nouser
                                                                            }
                                                                            alt="User"
                                                                        />

                                                                        {user?.user?.first_name || ''} {user?.user?.last_name || ''}
                                                                    </Stack>
                                                                </Link>
                                                            )

                                                        }
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        {user?.user?.company_name}
                                                    </TableCell>
                                                    <TableCell sx={{
                                                        color: '#4B5563',
                                                    }} >
                                                        {user?.address ?
                                                            <Box sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'space-between',
                                                            }}>
                                                                {user?.address}

                                                                <Tooltip title={copied ? 'Copied!' : 'Copy'} placement="top">
                                                                    <IconButton
                                                                        onClick={() => {
                                                                            setTextToCopy(`${user?.address} View:https://api.thibaingozi.com/api/?sosId=${user?.deepLinks[0]?._id}`);
                                                                            handleCopy();
                                                                        }}
                                                                        sx={copyButtonStyles}
                                                                        aria-label="copy address"
                                                                    >
                                                                        <ContentCopyIcon fontSize="medium" className="copy-btn" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </Box>
                                                            :
                                                            "-"
                                                        }
                                                    </TableCell>
                                                    <TableCell sx={{ color: 'var(--orange)' }}>
                                                        {user?.req_reach || "0"}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#01C971' }}>
                                                        {user?.req_accept || "0"}
                                                    </TableCell>
                                                    <TableCell sx={{ color: user?.type?.bgColor ?? '#4B5563' }}>
                                                        {user?.type?.display_title || "-"}
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
                                                                        setSelectedId(user._id);
                                                                    }}
                                                                >
                                                                    <option value="" hidden> Select </option>
                                                                    <option value="help_received"> Help Received </option>
                                                                    <option value="cancel"> Cancel </option>
                                                                </select>
                                                            </div>
                                                        }
                                                    </TableCell>
                                                    <TableCell sx={{ color: user?.type?.bgColor ?? '#4B5563' }}>
                                                        {user?.deepLinks[0]?.notification_data?.trip?.trip_type_id?.tripTypeName || "-"}
                                                    </TableCell>
                                                    <TableCell >
                                                        <Box align="center" sx={{ display: 'flex', flexDirection: 'row' }}>
                                                            <Tooltip title="View" arrow placement="top">
                                                                <IconButton onClick={() => nav(`/home/hotspot/location?locationId=${user?._id}&lat=${user?.lat}&long=${user?.long}&end_lat=${userinfo?.data?.data?.user?.current_lat}&end_long=${userinfo?.data?.data?.user?.current_long}&req_reach=${user?.req_reach}&req_accept=${user?.req_accept}`)}>
                                                                    <img src={ViewBtn} alt="view button" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                    </TableCell>
                                                    {user?.type?.type === "linked_sos" ? (
                                                        <TableCell>
                                                            <Box align="center" sx={{ display: "flex", justifyContent: "center" }}>
                                                                {user?.otherUser?._id ? (
                                                                    <Tooltip title="Other User" arrow placement="top">
                                                                        <Button
                                                                            variant="contained"
                                                                            sx={{
                                                                                display: "flex",
                                                                                alignItems: "center",
                                                                                gap: "6px",
                                                                                textTransform: "none",
                                                                                fontWeight: 500,
                                                                                fontSize: "14px",
                                                                                color: "#fff",
                                                                                backgroundColor: "#1E73E8", // same as your image blue
                                                                                borderRadius: "8px",
                                                                                padding: "6px 14px",
                                                                                whiteSpace: "nowrap",
                                                                                minWidth: "auto",
                                                                                "&:hover": { backgroundColor: "#1864c7" },
                                                                            }}
                                                                            onClick={() =>
                                                                                nav(`total-drivers/driver-information/${user?.otherUser?._id}`)
                                                                            }
                                                                        >
                                                                            Other User
                                                                        </Button>
                                                                    </Tooltip>
                                                                ) : (
                                                                    "-"
                                                                )}
                                                            </Box>
                                                        </TableCell>
                                                    ) : <TableCell sx={{ textAlign: 'center' }}>-</TableCell>}
                                                </TableRow>
                                            ))
                                            :
                                            <TableRow>
                                                <TableCell sx={{ color: '#4B5563', borderBottom: 'none' }} colSpan={9} align="center">
                                                    <Typography align="center" color="text.secondary" sx={{ mt: 2 }}>
                                                        No data found
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>)
                                    }
                                </TableBody>
                            </Table>

                        </TableContainer>

                        {activeUserList?.length > 0 && !activeSos.isPending && <Grid container sx={{ px: { xs: 0, sm: 1 } }} justifyContent="space-between" alignItems="center" mt={2}>
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
                                        value={activeLimit}
                                        onChange={(e) => {
                                            setActiveLimit(Number(e.target.value));
                                            setActivePage(1);
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
                                        {activePage} / {totalActivePages}
                                    </Typography>
                                    <IconButton
                                        disabled={activePage === 1}
                                        onClick={() => setActivePage((prev) => prev - 1)}
                                    >
                                        <NavigateBeforeIcon fontSize="small" sx={{
                                            color: activePage === 1 ? '#BDBDBD !important' : '#1976d2 !important'
                                        }} />
                                    </IconButton>
                                    <IconButton
                                        disabled={activePage === totalActivePages}
                                        onClick={() => setActivePage((prev) => prev + 1)}
                                    >
                                        <NavigateNextIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            </Grid>
                        </Grid>}
                    </Box>
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
                                    value={range}
                                    onChange={setRange}
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
                                                {type.display_title}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <Button
                                    sx={{ height: '40px', width: '100px', borderRadius: '8px' }}
                                    onClick={() => {
                                        setRecentFilter("");
                                        setRecentNotification("all");
                                        setRange([
                                            {
                                                startDate: startOfYear(new Date()),
                                                endDate: new Date(),
                                                key: "selection",
                                            },
                                        ]);
                                        setRecentPage(1);
                                        setRecentLimit(20);
                                        setSortBy("createdAt");
                                        setSortOrder("desc");

                                        nav("/home");
                                    }}

                                >
                                    View All
                                </Button>
                            </Box>

                        </Grid>
                    </Grid>
                    <Box sx={{ px: { xs: 0, md: 2 }, pt: { xs: 0, md: 3 }, backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
                        <TableContainer >
                            <Table sx={{ '& .MuiTableCell-root': { fontSize: '15px' } }}>

                                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                    <TableRow >
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', borderTopLeftRadius: '10px' }}>
                                            <TableSortLabel
                                                id="first_name"
                                                active={sortBy === 'first_name'}
                                                direction={sortOrder}
                                                onClick={changeSortOrder}
                                                IconComponent={() => <img src={sortBy === 'first_name' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                            >
                                                User Name
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                            <TableSortLabel
                                                id="company_name"
                                                active={sortBy === 'company_name'}
                                                direction={sortOrder}
                                                onClick={changeSortOrder}
                                                IconComponent={() => <img src={sortBy === 'company_name' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                            >
                                                Company
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                            <TableSortLabel
                                                id="address"
                                                active={sortBy === 'address'}
                                                direction={sortOrder}
                                                onClick={changeSortOrder}
                                                IconComponent={() => <img src={sortBy === 'address' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                            >
                                                Last Active Status
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                            <TableSortLabel
                                                id="req_reach"
                                                active={sortBy === 'req_reach'}
                                                direction={sortOrder}
                                                onClick={changeSortOrder}
                                                IconComponent={() => <img src={sortBy === 'req_reach' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                            >
                                                Request reached
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                            <TableSortLabel
                                                id="req_accept"
                                                active={sortBy === 'req_accept'}
                                                direction={sortOrder}
                                                onClick={changeSortOrder}
                                                IconComponent={() => <img src={sortBy === 'req_accept' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                            >
                                                Request Accepted
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                            <TableSortLabel
                                                id="createdAt"
                                                active={sortBy === 'createdAt'}
                                                direction={sortOrder}
                                                onClick={changeSortOrder}
                                                IconComponent={() => <img src={sortBy === 'createdAt' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                            >
                                                Start Time Stamp
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                            <TableSortLabel
                                                id="updatedAt"
                                                active={sortBy === 'updatedAt'}
                                                direction={sortOrder}
                                                onClick={changeSortOrder}
                                                IconComponent={() => <img src={sortBy === 'updatedAt' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                            >
                                                End Time Stamp
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                            <TableSortLabel
                                                id="type"
                                                active={sortBy === 'type'}
                                                direction={sortOrder}
                                                onClick={changeSortOrder}
                                                IconComponent={() => <img src={sortBy === 'type' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                            >
                                                Type
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                            Status
                                        </TableCell>
                                        <TableCell align="center" sx={{ backgroundColor: '#F9FAFB', borderTopRightRadius: '10px', color: '#4B5563' }}>Action</TableCell>
                                        <TableCell align="center" sx={{ backgroundColor: '#F9FAFB', borderTopRightRadius: '10px', color: '#4B5563' }}>                         </TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {isFetching ?
                                        <TableRow>
                                            <TableCell sx={{ color: '#4B5563', borderBottom: 'none' }} colSpan={7} align="center">
                                                <Loader />
                                            </TableCell>
                                        </TableRow>
                                        : (recentSos?.data?.items?.length > 0 ?
                                            recentSos?.data?.items?.map((row) => (
                                                <TableRow key={row?._id}>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        {
                                                            row.user?.role === "driver" ? (
                                                                <Link to={`/home/total-drivers/driver-information/${row.user._id}`} className="link">
                                                                    <Stack direction="row" alignItems="center" gap={1}>

                                                                        <Avatar
                                                                            src={
                                                                                row?.user
                                                                                    ?.selfieImage ||
                                                                                nouser
                                                                            }
                                                                            alt="User"
                                                                        />

                                                                        {row?.user?.first_name || ''} {row?.user?.last_name || ''}
                                                                    </Stack>

                                                                </Link>) : (
                                                                <Link to={`/home/total-users/user-information/${row?.user?._id}`} className="link">
                                                                    <Stack direction="row" alignItems="center" gap={1}>

                                                                        <Avatar
                                                                            src={
                                                                                row?.user
                                                                                    ?.selfieImage ||
                                                                                nouser
                                                                            }
                                                                            alt="User"
                                                                        />

                                                                        {row?.user?.first_name || ''} {row?.user?.last_name || ''}
                                                                    </Stack>
                                                                </Link>
                                                            )
                                                        }
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        {row?.user?.company_name}
                                                    </TableCell>
                                                    <TableCell sx={{
                                                        color: '#4B5563',
                                                    }} >
                                                        <Box sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between'
                                                        }}>
                                                            {row?.address}

                                                            <Tooltip title={copied ? 'Copied!' : 'Copy'} placement="top">
                                                                <IconButton
                                                                    onClick={() => {
                                                                        setTextToCopy(`${row?.address} View:https://api.thibaingozi.com/api/?sosId=${row?.deepLinks._id}`);
                                                                        handleCopy();
                                                                    }}
                                                                    sx={copyButtonStyles}
                                                                    aria-label="copy address"
                                                                >
                                                                    <ContentCopyIcon fontSize="medium" className="copy-btn" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell sx={{ color: 'var(--orange)' }}>
                                                        {row?.req_reach || "0"}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#01C971' }}>
                                                        {row?.req_accept || "0"}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        {format(row?.createdAt, "HH:mm:ss - dd/MM/yyyy")}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        {format(row?.updatedAt, "HH:mm:ss - dd/MM/yyyy")}
                                                    </TableCell>
                                                    <TableCell sx={{ color: row?.type?.bgColor ?? '#4B5563' }}>
                                                        {row?.type?.display_title}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        {row?.help_received}
                                                    </TableCell>
                                                    <TableCell >
                                                        <Box align="center" sx={{ display: 'flex', flexDirection: 'row' }}>
                                                            <Tooltip title="View" arrow placement="top">
                                                                <IconButton onClick={() => nav(`/home/hotspot/location?locationId=${row?._id}&lat=${row?.lat}&long=${row?.long}&end_lat=${userinfo?.data?.data?.user?.current_lat}&end_long=${userinfo?.data?.data?.user?.current_long}&req_reach=${row?.req_reach}&req_accept=${row?.req_accept}`)}>
                                                                    <img src={ViewBtn} alt="view button" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                    </TableCell>
                                                    {row?.type?.type === "linked_sos" ? (
                                                        <TableCell>
                                                            <Box align="center" sx={{ display: "flex", justifyContent: "center" }}>
                                                                {row?.otherUser?._id ? (
                                                                    <Tooltip title="Other User" arrow placement="top">
                                                                        <Button
                                                                            variant="contained"
                                                                            sx={{
                                                                                display: "flex",
                                                                                alignItems: "center",
                                                                                gap: "6px",
                                                                                textTransform: "none",
                                                                                fontWeight: 500,
                                                                                fontSize: "14px",
                                                                                color: "#fff",
                                                                                backgroundColor: "#1E73E8", // same as your image blue
                                                                                borderRadius: "8px",
                                                                                padding: "6px 14px",
                                                                                whiteSpace: "nowrap",
                                                                                minWidth: "auto",
                                                                                "&:hover": { backgroundColor: "#1864c7" },
                                                                            }}
                                                                            onClick={() =>
                                                                                nav(`total-drivers/driver-information/${row?.otherUser?._id}`)
                                                                            }
                                                                        >
                                                                            Other User
                                                                        </Button>
                                                                    </Tooltip>
                                                                ) : (
                                                                    "-"
                                                                )}
                                                            </Box>
                                                        </TableCell>
                                                    ) : <TableCell sx={{ textAlign: 'center' }}>-</TableCell>}
                                                </TableRow>
                                            ))
                                            :
                                            <TableRow>
                                                <TableCell sx={{ color: '#4B5563', borderBottom: 'none' }} colSpan={7} align="center">
                                                    <Typography align="center" color="text.secondary" sx={{ mt: 2 }}>
                                                        No data found
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>)
                                    }
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {recentSos?.data?.items?.length > 0 && !isFetching && <Grid container sx={{ px: { xs: 0, sm: 1 } }} justifyContent="space-between" alignItems="center" mt={2}>
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
                                        value={recentLimit}
                                        onChange={(e) => {
                                            setRecentLimit(Number(e.target.value));
                                            setRecentPage(1);
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
                                        {recentPage} / {totalRecentPages}
                                    </Typography>
                                    <IconButton
                                        disabled={recentPage === 1}
                                        onClick={() => setRecentPage((prev) => prev - 1)}
                                    >
                                        <NavigateBeforeIcon fontSize="small" sx={{
                                            color: recentPage === 1 ? '#BDBDBD !important' : '#1976d2 !important'
                                        }} />
                                    </IconButton>
                                    <IconButton
                                        disabled={recentPage === totalRecentPages}
                                        onClick={() => setRecentPage((prev) => prev + 1)}
                                    >
                                        <NavigateNextIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            </Grid>
                        </Grid>}
                    </Box>
                </Paper>
            </Box >
            {statusUpdate && (
                <SOSStatusUpdate
                    handleCancel={handleCancel}
                    handleUpdate={handleUpdate}
                />
            )}


            {/* 2FA POPUP */}
            <Dialog open={showQRCode} onClose={() => { }} maxWidth="sm" fullWidth>
                {!is2FAEnabled ?
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", p: 2, gap: 1, position: "relative" }}>
                        <Box onClick={() => setShowQRCode(false)} ><CloseIcon sx={{ position: "absolute", top: "10px", right: "10px", cursor: "pointer" }} /></Box>
                        <WarningAmberIcon sx={{ fontSize: "5rem", color: "rgb(214, 116, 55)" }} />
                        <DialogTitle sx={{ textAlign: "center" }}>Your 2 step authentication is disabled. Turn it on to secure your account</DialogTitle>

                        <Box sx={{ display: "flex", alignItems: "center", width: "100%", p: 2, border: "1px solid black", borderRadius: "1rem" }}>
                            <Box sx={{ width: "100%" }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                                    Two-Factor Authentication (2FA)
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Add an extra layer of security to your account
                                </Typography>
                            </Box>
                            <Switch
                                checked={is2FAEnabled}
                                onClick={handle2FAToggle}
                                disabled={is2FALoading || !userinfo.data}
                                slotProps={{ input: { 'aria-label': 'controlled' } }}
                                color="primary"
                            />
                        </Box>
                    </Box>
                    :
                    <>
                        <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
                        <DialogContent sx={{ textAlign: 'center' }}>
                            <Typography variant="body1" paragraph>
                                Scan the QR code below with your authenticator app:
                            </Typography>

                            {qrCodeData?.qrCodeDataUrl ? (
                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    my: 2,
                                    p: 2,
                                    bgcolor: 'white',
                                    borderRadius: 1,
                                    border: '1px solid #e0e0e0'
                                }}>
                                    <img
                                        src={qrCodeData.qrCodeDataUrl}
                                        alt="2FA QR Code"
                                        style={{
                                            width: 200,
                                            height: 200,
                                            objectFit: 'contain'
                                        }}
                                    />
                                </Box>
                            ) : (
                                <Box>Generating QR code...</Box>
                            )}

                            {qrCodeData?.secret && (
                                <Box sx={{ mt: 2, mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                                    <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                        {qrCodeData.secret}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                        Or enter this code manually: <strong>{qrCodeData.secret}</strong>
                                    </Typography>
                                </Box>
                            )}

                            <Typography variant="body2" color="text.secondary">
                                After scanning, you&apos;ll be asked to enter a verification code from your authenticator app.
                            </Typography>
                        </DialogContent>
                        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                            <Button
                                variant="contained"
                                onClick={() => {
                                    setShowQRCode(false);
                                    setIs2FAEnabled(true);
                                    toast.success('Two-factor authentication has been enabled', toastOption);
                                }}
                            >
                                I&apos;ve set up my authenticator app
                            </Button>
                        </DialogActions>
                    </>
                }
            </Dialog>
        </Box >
    );
};

export default Home;