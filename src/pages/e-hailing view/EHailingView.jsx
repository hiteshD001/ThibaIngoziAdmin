/* eslint-disable react-hooks/exhaustive-deps */
import { useRef, useMemo, useEffect, useState, useCallback, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Slide, toast } from 'react-toastify';
import { format } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';

import { ContentCopy, NavigateNext, NavigateBefore, Update } from '@mui/icons-material';
import { Box, Typography, Button, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, Grid, Stack, Select, MenuItem, Tooltip, TableSortLabel, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';

import ViewBtn from '../../assets/images/ViewBtn.svg';
import arrowup from '../../assets/images/arrowup.svg';
import tone from '../../assets/audio/notification.mp3';
import calender from '../../assets/images/calender.svg';
import arrowdown from '../../assets/images/arrowdown.svg';
import arrownuteral from '../../assets/images/arrownuteral.svg';

import { useWebSocket } from '../../API Calls/WebSocketContext';
import { useGetEHailingRecentSos, useGetUser, useGetActiveSosDataEhailing, useUpdateLocationStatus, useGetEHailingChartData } from '../../API Calls/API';

import Loader from '../../common/Loader';
import CustomChart from '../../common/CustomChart';
import { toastOption } from '../../common/ToastOptions';
import HotspotSection from '../../common/HotspotSection';
import { SOSStatusUpdate } from '../../common/ConfirmationPOPup';
import CustomDateRangePicker from '../../common/Custom/CustomDateRangePicker';
import TimeFilter from '../../common/Custom/TimeFilter';

const copyButtonStyles = {
    color: '#4285F4 !important',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
};

// Memoized Active SOS Table Row Component
const ActiveSOSTableRow = memo(({ user, userinfo, nav, copied, handleCopy, setTextToCopy, updatingId, selectedId, status, setStatus, setStatusUpdate, setSelectedId, copyButtonStyles, isNavigatingBack, realtimeUpdates }) => {
    const handleStatusChange = useCallback((e) => {
        setStatus(e.target.value);
        setStatusUpdate(true);
        setSelectedId(user._id);
    }, [setStatus, setStatusUpdate, setSelectedId, user._id]);

    const handleCopyAddress = useCallback((address) => {
        setTextToCopy(address);
        handleCopy();
    }, [setTextToCopy, handleCopy]);

    const handleViewLocation = useCallback(() => {
        nav(`/home/hotspot/location?locationId=${user._id}&lat=${user?.lat}&long=${user?.long}&end_lat=${userinfo?.data?.data?.user?.current_lat}&end_long=${userinfo?.data?.data?.user?.current_long}&req_reach=${user?.req_reach}&req_accept=${user?.req_accept}`);
    }, [nav, user]);

    const handleOtherUserClick = useCallback(() => {
        nav(`/home/total-drivers/driver-information/${user?.otherUser?._id}`, { replace: true });
    }, [nav, user]);

    return (
        <TableRow>
            <TableCell sx={{ color: '#4B5563' }}>
                {user?.sosType === 'ARMED_SOS' ? (
                    <Stack direction="row" alignItems="center" gap={1}>
                        <Avatar alt="User" />
                        {user?.user?.first_name} {user?.user?.last_name}
                    </Stack>
                ) : (
                    user?.role === "driver" ? (
                        <Link to={`/home/total-drivers/driver-information/${user?.user_id}`} className="link"
                            onClick={() => isNavigatingBack.current = true}>
                            <Stack direction="row" alignItems="center" gap={1}>
                                <Avatar
                                    src={user?.selfieImage}
                                    sx={{ '&:hover': { textDecoration: 'none' } }}
                                    alt="User"
                                />
                                {user?.user?.first_name || user?.user_id?.first_name} {user?.user?.last_name || user?.user_id?.last_name}
                            </Stack>
                        </Link>) : (
                        <Link to={`/home/total-users/user-information/${user?.user_id}`} className="link"
                            onClick={() => isNavigatingBack.current = true}>
                            <Stack direction="row" alignItems="center" gap={1}>
                                <Avatar src={user?.selfieImage} alt="User" />
                                {user?.user?.first_name || user?.user_id?.first_name} {user?.user?.last_name || user?.user_id?.last_name}
                            </Stack>
                        </Link>
                    )
                )}
            </TableCell>
            <TableCell sx={{ color: '#4B5563' }}>
                {user?.sosType === 'ARMED_SOS' ? "Armed Response" : (user?.user?.company_name || user?.user_id?.company_name || "-")}
            </TableCell>
            <TableCell sx={{ color: '#4B5563' }}>
                {user?.sosType === 'ARMED_SOS' ? (
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}>
                        {`${user?.armedLocationId?.houseNumber || ''} ${user?.armedLocationId?.street || ''}, ${user?.armedLocationId?.suburb || ''}`}
                        <Tooltip title={copied ? 'Copied!' : 'Copy'} placement="top">
                            <IconButton
                                onClick={() => handleCopyAddress(`${user?.armedLocationId?.houseNumber || ''} ${user?.armedLocationId?.street || ''}, ${user?.armedLocationId?.suburb || ''}`)}
                                sx={copyButtonStyles}
                                aria-label="copy address"
                            >
                                <ContentCopy fontSize="medium" className="copy-btn" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                ) : (
                    user?.address ?
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}>
                            {user?.address}
                            <Tooltip title={copied ? 'Copied!' : 'Copy'} placement="top">
                                <IconButton
                                    onClick={() => handleCopyAddress(`${user?.address} View:https://api.thibaingozi.com/api/?sosId=${user?.deepLinks?.[0]?._id || user?.deepLinks?._id}`)}
                                    sx={copyButtonStyles}
                                    aria-label="copy address"
                                >
                                    <ContentCopy fontSize="medium" className="copy-btn" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                        :
                        "-"
                )}
            </TableCell>
            <TableCell sx={{ color: 'var(--orange)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Link
                        to={`/home/request-reached-users/${user?._id}`}
                        style={{
                            textDecoration: 'none',
                            color: 'var(--orange)',
                            cursor: 'pointer',
                        }}
                    >
                        {user?.req_reach || "0"}
                    </Link>
                    {realtimeUpdates.has(user._id) && (
                        <Update sx={{ fontSize: 16, color: '#4CAF50', animation: 'pulse 1s infinite' }} />
                    )}
                </Box>
            </TableCell>
            <TableCell sx={{ color: '#01C971' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Link
                        to={`/home/request-accepted-users/${user?._id}`}
                        style={{
                            textDecoration: 'none',
                            color: '#01C971',
                            cursor: 'pointer',
                        }}
                    >
                        {user?.req_accept || "0"}
                    </Link>
                    {realtimeUpdates.has(user._id) && (
                        <Update sx={{ fontSize: 16, color: '#4CAF50', animation: 'pulse 1s infinite' }} />
                    )}
                </Box>
            </TableCell>
            <TableCell sx={{ color: user?.type?.bgColor ?? '#4B5563' }}>
                {user?.sosType === 'ARMED_SOS' ? "Armed Response" : (user?.type?.display_title || "-")}
            </TableCell>
            <TableCell sx={{ color: '#4B5563' }}>
                {format(user?.createdAt, "HH:mm:ss - dd/MM/yyyy")}
            </TableCell>
            <TableCell sx={{ color: '#4B5563' }}>
                {user?.deepLinks?.notification_data?.trip?.trip_type_id?.tripTypeName || "-"}
            </TableCell>
            <TableCell sx={{ color: '#4B5563', minWidth: '110px' }}>
                {(!(user?.sosType === 'ARMED_SOS' ? user?.armedSosstatus : user?.help_received)) &&
                    <div className={updatingId === user._id ? "" : "select-container"}>
                        {updatingId === user._id ? (
                            <Box display="flex" justifyContent="center">
                                <Loader size={25} color="#1E73E8" />
                            </Box>
                        ) : (
                            <select
                                name="help_received"
                                className="my-custom-select"
                                value={selectedId === user._id ? status : ""}
                                onChange={handleStatusChange}
                            >
                                <option value="" hidden> Select </option>
                                <option value="help_received"> Help Received </option>
                                <option value="cancel"> Cancel </option>
                            </select>
                        )}
                    </div>
                }
            </TableCell>
            <TableCell>
                <Box align="center" sx={{ display: 'flex', flexDirection: 'row' }}>
                    <Tooltip title="View" arrow placement="top">
                        <IconButton onClick={handleViewLocation}>
                            <img src={ViewBtn} alt="view button" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Other Users" arrow placement="top">
                        <IconButton>
                            <Typography
                                bgcolor="#367be0"
                                color="white"
                                height="100%"
                                px={1}
                                display="flex"
                                alignItems="center"
                                borderRadius={1}
                                onClick={handleOtherUserClick}
                            >
                                Other User
                            </Typography>
                        </IconButton>
                    </Tooltip>
                </Box>
            </TableCell>
        </TableRow>
    );
});

ActiveSOSTableRow.displayName = 'ActiveSOSTableRow';

// Memoized Recent SOS Table Row Component
const RecentSOSTableRow = memo(({ row, copied, handleCopy, setTextToCopy, nav, userinfo, isNavigatingBack }) => {
    const handleCopyAddress = useCallback((address) => {
        setTextToCopy(address);
        handleCopy();
    }, [setTextToCopy, handleCopy]);

    const handleViewLocation = useCallback(() => {
        nav(`/home/hotspot/location?locationId=${row._id}&lat=${row?.lat}&long=${row?.long}&end_lat=${userinfo?.data?.data?.user?.current_lat}&end_long=${userinfo?.data?.data?.user?.current_long}&req_reach=${row?.req_reach}&req_accept=${row?.req_accept}`);
    }, [nav, row, userinfo]);

    return (
        <TableRow key={row?._id}>
            <TableCell sx={{ color: '#4B5563' }}>
                {row.user?.role === "driver" ? (
                    <Link to={`/home/total-drivers/driver-information/${row.user._id}`} className="link"
                        onClick={() => isNavigatingBack.current = true}>
                        <Stack direction="row" alignItems="center" gap={1}>
                            <Avatar src={row?.user?.selfieImage} alt="User" />
                            {row?.user?.first_name || ''} {row?.user?.last_name || ''}
                        </Stack>
                    </Link>
                ) : (
                    <Link to={`/home/total-users/user-information/${row?.user?._id}`} className="link"
                        onClick={() => isNavigatingBack.current = true}>
                        <Stack direction="row" alignItems="center" gap={1}>
                            <Avatar src={row?.user?.selfieImage} alt="User" />
                            {row?.user?.first_name || ''} {row?.user?.last_name || ''}
                        </Stack>
                    </Link>
                )}
            </TableCell>
            <TableCell sx={{ color: '#4B5563' }}>
                {row?.user?.company_name}
            </TableCell>
            <TableCell sx={{ color: '#4B5563' }}>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    {row?.address}
                    <Tooltip title={copied ? 'Copied!' : 'Copy'} placement="top">
                        <IconButton
                            onClick={() => handleCopyAddress(`${row?.address} View:https://api.thibaingozi.com/api/?sosId=${row?.deepLinks._id}`)}
                            sx={copyButtonStyles}
                            aria-label="copy address"
                        >
                            <ContentCopy fontSize="medium" className="copy-btn" />
                        </IconButton>
                    </Tooltip>
                </Box>
            </TableCell>
            <TableCell sx={{ color: 'var(--orange)' }}>
                <Link
                    to={`/home/request-reached-users/${row?._id}`}
                    style={{
                        textDecoration: 'none',
                        color: 'var(--orange)',
                        cursor: 'pointer',
                    }}
                >
                    {row?.req_reach || "0"}
                </Link>
            </TableCell>
            <TableCell sx={{ color: '#01C971' }}>
                <Link
                    to={`/home/request-accepted-users/${row?._id}`}
                    style={{
                        textDecoration: 'none',
                        color: '#01C971',
                        cursor: 'pointer',
                    }}
                >
                    {row?.req_accept || "0"}
                </Link>
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
            <TableCell sx={{ color: row?.type?.bgColor ?? '#4B5563' }}>
                {row?.deepLinks?.notification_data?.trip?.trip_type_id?.tripTypeName || "-"}
            </TableCell>
            <TableCell>
                <Box align="center" sx={{ display: 'flex', flexDirection: 'row' }}>
                    <Tooltip title="View" arrow placement="top">
                        <IconButton onClick={handleViewLocation}>
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
                                        backgroundColor: "#1E73E8",
                                        borderRadius: "8px",
                                        padding: "6px 14px",
                                        whiteSpace: "nowrap",
                                        minWidth: "auto",
                                        "&:hover": { backgroundColor: "#1864c7" },
                                    }}
                                    onClick={() => nav(`/home/total-drivers/driver-information/${row?.otherUser?._id}`, { replace: true })}
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
    );
});

RecentSOSTableRow.displayName = 'RecentSOSTableRow';

// eslint-disable-next-line react/prop-types
const EHialingView = ({ isMapLoaded }) => {


    const nav = useNavigate();
    const queryClient = useQueryClient();

    const isFirstRun = useRef(true);
    const lastFetchTime = useRef(0);
    const audioRef = useRef(new Audio(tone));
    const debounceTimerRef = useRef(null);
    const isNavigatingBack = useRef(false);

    const role = localStorage.getItem("role");

    // Parse ehailingCompanyIds from localStorage into an array
    const rawEhailingCompanyIds = localStorage.getItem("ehailingCompanyIds") || "";
    const ehailingCompanyId = rawEhailingCompanyIds.split(",").filter(Boolean)[0] || "";
    const ehailingCompanyIds = rawEhailingCompanyIds.split(",").filter(Boolean);


    const [status, setStatus] = useState('')
    const [copied, setCopied] = useState(false);
    const [textToCopy, setTextToCopy] = useState('');
    const [selectedId, setSelectedId] = useState("");
    const [updatingId, setUpdatingId] = useState("");
    const [statusUpdate, setStatusUpdate] = useState(false);
    const [time, settime] = useState("today");
    const [realtimeUpdates, setRealtimeUpdates] = useState(new Set()); // Track which SOS IDs have real-time updates
    const [isPlaying, setIsPlaying] = useState(false);
    const [openAudioModal, setOpenAudioModal] = useState(false);

    // pagination
    const [recentPage, setRecentPage] = useState(1);
    const [recentLimit, setRecentLimit] = useState(10);
    const [activePage, setActivePage] = useState(1);
    const [activeLimit, setActiveLimit] = useState(10);

    // Sort
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("desc");

    const [sortBy2, setSortBy2] = useState("createdAt");
    const [sortOrder2, setSortOrder2] = useState("desc");

    // date picker 
    const [rangeSos, setRangeSos] = useState([
        {
            startDate: null,
            endDate: null,
            key: 'selection'
        }
        // {
        //     startDate: startOfYear(new Date()),
        //     endDate: new Date(),
        //     key: 'selection'
        // }
    ]);
    const [range, setRange] = useState([
        {
            startDate: null,
            endDate: null,
            key: 'selection'
        }
        // {
        //     startDate: startOfYear(new Date()),
        //     endDate: new Date(),
        //     key: 'selection'
        // }
    ]);
    const startDate = range[0].startDate?.toISOString();
    const endDate = range[0].endDate?.toISOString();
    const startDateSos = rangeSos[0].startDate?.toISOString();
    const endDateSos = rangeSos[0].endDate?.toISOString();

    const userinfo = useGetUser(localStorage.getItem("userID"));
    const activeSos = useGetActiveSosDataEhailing({ page: activePage, limit: activeLimit, startDate: startDateSos, endDate: endDateSos, sortBy: sortBy2, sortOrder: sortOrder2, companyIds: ehailingCompanyIds });
    const recentSos = useGetEHailingRecentSos({ page: recentPage, limit: recentLimit, startDate, endDate, sortBy, sortOrder, companyIds: ehailingCompanyIds });
    const chartData = useGetEHailingChartData(ehailingCompanyIds, time, range[0]?.startDate, range[0]?.endDate);
    const {
        newSOS,
        requestCounts,
        activeUserLists,
        setActiveUserLists,
        socketRef,
        isConnected
    } = useWebSocket();

    // Subscribe to specific company data for SOS alerts via WebSocket
    useEffect(() => {
        if (isConnected && socketRef?.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({
                type: 'subscribe',
                companyId: ehailingCompanyId
            }));
        }

        return () => {
            // Unsubscribe when leaving the e-Hailing view to revert to global WS
            if (isConnected && socketRef?.current?.readyState === WebSocket.OPEN) {
                socketRef.current.send(JSON.stringify({
                    type: 'unsubscribe'
                }));
            }
        };
    }, [isConnected, ehailingCompanyId, socketRef]);

    // In e-hailing view, always use company-filtered API data — ignore global WebSocket activeUserLists
    const activeUserList = activeSos?.data?.data?.data;
    const prevLengthRef = useRef(activeUserList?.length);
    const notifiedSosIds = useRef(new Set(activeUserLists?.map(u => u._id) || []));

    // Merge API data with real-time WebSocket counts for optimal performance
    const mergedActiveUserList = useMemo(() => {
        if (!Array.isArray(activeUserList)) return [];

        return activeUserList.map(user => ({
            ...user,
            // Use real-time WebSocket counts if available, fallback to API counts
            req_reach: requestCounts[user._id]?.req_reach || user?.req_reach || 0,
            req_accept: requestCounts[user._id]?.req_accept || user?.req_accept || 0
        }));
    }, [activeUserList, requestCounts]);

    const paginatedActiveUserList = useMemo(() => {
        if (!Array.isArray(mergedActiveUserList)) return [];
        return mergedActiveUserList;
    }, [mergedActiveUserList]);

    const onSuccess = useCallback(() => {
        toast.success("Status Updated Successfully.");

        if (activeUserLists?.length > 0 && setActiveUserLists) {
            setActiveUserLists(prev => prev.filter(item => item._id !== selectedId));
        }

        setStatusUpdate(false);
        setSelectedId("");
        setUpdatingId("");
        stopAudio();
        queryClient.refetchQueries(["activeSOS2"], { exact: false });
    }, [activeUserLists, setActiveUserLists, selectedId, queryClient]);

    const onError = useCallback((error) => {
        setUpdatingId("");
        toast.error(error.response.data.message || "Something went Wrong", toastOption);
    }, []);

    const { mutate } = useUpdateLocationStatus(onSuccess, onError);

    const changeSortOrder = useCallback((e) => {
        const field = e.target.id;
        if (field !== sortBy) {
            setSortBy(field);
            setSortOrder("asc");
        } else {
            setSortOrder(p => p === 'asc' ? 'desc' : 'asc')
        }
    }, [sortBy]);

    const changeSortOrder2 = useCallback((e) => {
        const field = e.target.id;
        if (field !== sortBy2) {
            setSortBy2(field);
            setSortOrder2("asc");

        } else {
            setSortOrder2(p => p === 'asc' ? 'desc' : 'asc')
        }
    }, [sortBy2]);

    const stopAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        setIsPlaying(false);
    };

    const handleCopy = useCallback(async () => {
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [textToCopy]);

    const handleUpdate = useCallback(() => {
        setUpdatingId(selectedId);
        const toUpdate = {
            help_received: status,
        };
        mutate({
            id: selectedId,
            data: toUpdate,
        });
        setStatusUpdate(false)
    }, [selectedId, status, mutate]);

    // Optimized pagination change handlers with debouncing
    const handleActivePageChange = useCallback((newPage) => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            setActivePage(newPage);
        }, 150);
    }, []);

    const handleRecentPageChange = useCallback((newPage) => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            setRecentPage(newPage);
        }, 150);
    }, []);

    const handleActiveLimitChange = useCallback((newLimit) => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            setActiveLimit(newLimit);
            setActivePage(1);
        }, 150);
    }, []);

    const handleRecentLimitChange = useCallback((newLimit) => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            setRecentLimit(newLimit);
            setRecentPage(1);
        }, 150);
    }, []);

    const handleCancel = useCallback(() => {
        setSelectedId("");
        setStatusUpdate(false);
        setStatus('')
    }, []);
    const totalActiveItems = activeSos?.data?.data?.totalItems || 0;
    const totalActivePages = Math.ceil(totalActiveItems / activeLimit)
    const totalRecentItems = recentSos?.data?.data?.totalItems || recentSos?.data?.totalItems || 0;
    const totalRecentPages = Math.ceil(totalRecentItems / recentLimit) || 1;


    // Track real-time updates for visual feedback
    useEffect(() => {
        // Add SOS IDs to real-time tracking when they get updated via WebSocket
        Object.keys(requestCounts).forEach(sosId => {
            if (requestCounts[sosId]?.req_reach > 0 || requestCounts[sosId]?.req_accept > 0) {
                setRealtimeUpdates(prev => new Set(prev).add(sosId));
            }
        });
    }, [requestCounts]);

    // Clear real-time indicators after 3 seconds
    useEffect(() => {
        if (realtimeUpdates.size === 0) return;

        const timer = setTimeout(() => {
            setRealtimeUpdates(new Set());
        }, 3000);

        return () => clearTimeout(timer);
    }, [realtimeUpdates]);
    useEffect(() => {
        const hasVisited = sessionStorage.getItem('ehailing-view-visited');
        if (!hasVisited) {
            queryClient.removeQueries({ queryKey: ["activeSOS2"] });
            sessionStorage.setItem('ehailing-view-visited', 'true');
        }

        // Check for audio permission
        const audioEnabled = localStorage.getItem("sosAudioEnabled");
        if (audioEnabled === null) {
            setOpenAudioModal(true);
        }

        return () => {
            // Don't clear cache on unmount to prevent reloading on navigation back
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Optimized debounced refetch function
    const debouncedRefetch = useCallback(() => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(async () => {
            const now = Date.now();
            if (now - lastFetchTime.current < 2000) return;

            lastFetchTime.current = now;

            try {
                const res = await activeSos.refetch();

                if (res?.data?.data?.data) {
                    const newList = res.data.data.data || [];
                    const newIds = newList.filter(item => !notifiedSosIds.current.has(item._id)).map(item => item._id);

                    if (newIds.length > 0) {
                        const playAudio = async () => {
                            try {
                                const isAudioEnabled = localStorage.getItem("sosAudioEnabled") === 'true';
                                if (isAudioEnabled) {
                                    // Stop any existing audio first
                                    if (audioRef.current) {
                                        audioRef.current.pause();
                                        audioRef.current.currentTime = 0;
                                    }

                                    // Create a fresh instance to avoid background suspension issues
                                    audioRef.current = new Audio(tone);
                                    audioRef.current.loop = true;
                                    await audioRef.current.play();
                                    setIsPlaying(true);
                                }
                            } catch (e) {
                                console.error("Audio playback failed:", e);
                            }
                        };

                        playAudio();
                        toast.info("New SOS Alert Received", { autoClose: 2000, hideProgressBar: true, transition: Slide });
                        newIds.forEach(id => notifiedSosIds.current.add(id));
                    }
                }
            } catch (error) {
                console.error("Refetch failed:", error);
            }
        }, 300);
    }, [activeSos]);

    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }

        if (!newSOS.type || newSOS.count === 0) return;

        const handleAlert = async () => {
            try {
                if (activeUserLists?.length > 0) {
                    if (newSOS.sosId && notifiedSosIds.current.has(newSOS.sosId)) return;

                    const playAudio = async () => {
                        try {
                            const isAudioEnabled = localStorage.getItem("sosAudioEnabled") === 'true';

                            if (isAudioEnabled) {
                                // Stop any existing audio first
                                if (audioRef.current) {
                                    audioRef.current.pause();
                                    audioRef.current.currentTime = 0;
                                }

                                // Create fresh instance
                                audioRef.current = new Audio(tone);
                                audioRef.current.loop = true;
                                await audioRef.current.play();
                                setIsPlaying(true);
                            }

                            if (newSOS.sosId) {
                                notifiedSosIds.current.add(newSOS.sosId);
                            } else {
                                activeUserLists.forEach(u => notifiedSosIds.current.add(u._id));
                            }

                        } catch (e) {
                            console.error("Audio playback failed:", e);
                        }
                    }
                    playAudio();
                    toast.info("New SOS Alert Received", { autoClose: 2000, hideProgressBar: true, transition: Slide })
                } else {
                    debouncedRefetch();
                }
            } catch (error) {
                console.error("Alert handling failed:", error);
            }
        };

        handleAlert();
    }, [newSOS.count, activeUserLists, debouncedRefetch]);

    // Optimized activeUserList change detection with debouncing
    useEffect(() => {
        if (!Array.isArray(activeUserList)) return;

        const currentLength = activeUserList.length;
        const previousLength = prevLengthRef.current;

        if (previousLength === null) {
            prevLengthRef.current = currentLength;
            return;
        }

        // Skip refetch if we're navigating back (to prevent continuous loading)
        if (isNavigatingBack.current) {
            isNavigatingBack.current = false;
            prevLengthRef.current = currentLength;
            return;
        }

        // Only refetch if there's an actual change in data length (not just navigation)
        if (previousLength !== currentLength && Math.abs(previousLength - currentLength) > 0) {
            // If the number of active SOS requests decreases (meaning one was resolved)
            // we stop the continuous ringing.
            if (currentLength < previousLength) {
                stopAudio();
            }

            prevLengthRef.current = currentLength;

            // Clear existing timer
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }

            // Debounce refetch to prevent duplicate API calls
            debounceTimerRef.current = setTimeout(() => {
                recentSos.refetch();
            }, 500);
        }

        // Cleanup timer on unmount
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [activeUserList, recentSos]);

    useEffect(() => {
        if (range[0]?.startDate && range[0]?.endDate) {
            settime("")
        }
    }, [range])

    return (
        <Box>
            <style>
                {`
                    @keyframes pulse {
                        0% { opacity: 1; }
                        50% { opacity: 0.5; }
                        100% { opacity: 1; }
                    }
                `}
            </style>

            <Grid sx={{ backgroundColor: 'white', p: 3, mt: '-25px' }} container justifyContent="space-between" alignItems="center" spacing={2} mb={3}>
                <Grid size={{ xs: 12, md: 5, lg: 6 }}>
                    <Typography variant="h5" fontWeight={550}>
                        {role ?? ""} e-Hailing View Overview
                    </Typography>
                    <Typography variant="body1" mt={1} color="text.secondary">
                        Monitor all your e-Hailing-based SOS trip alerts and live incidents.
                    </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 7, lg: 6 }}>
                    <Box display="flex" sx={{ justifyContent: { md: 'flex-end', sm: 'space-around' } }} gap={2} flexWrap="wrap">
                        <Box display="flex" sx={{ justifyContent: { md: 'flex-end', sm: 'space-around' } }} gap={2} flexWrap="wrap">
                            <TimeFilter
                                selected={time}          // current selected time
                                onApply={(value) => {
                                    settime(value)
                                    setRange([{
                                        startDate: null,
                                        endDate: null,
                                        key: 'selection'
                                    }])
                                }}
                            />

                            <CustomDateRangePicker
                                borderColor={'var(--light-gray)'}
                                value={range}
                                onChange={setRange}
                                icon={calender}
                            />
                        </Box>
                    </Box>
                </Grid>
            </Grid>

            <Box className="requests-chart" m={2} sx={{ boxShadow: '6px 6px 54px 0px #0000000D' }}>
                <Box className="row chart-heading">
                    <h3>SOS Requests Over Time</h3>
                </Box>
                <CustomChart data={chartData?.data?.data} />
            </Box>

            <Box p={2}>
                {/* active sos */}
                <Paper elevation={1} sx={{ backgroundColor: "rgb(253, 253, 253)", mb: 4, padding: 2, borderRadius: '10px' }}>
                    <Grid container justifyContent="space-between" alignItems="center" mb={2}>
                        <Grid size={{ xs: 12, lg: 3 }} sx={{ display: 'flex', flexDirection: 'row', gap: 2, mb: { xs: 1, md: 0 }, alignItems: 'center' }}>
                            <Typography variant="h6" fontWeight={590}>Active SOS Alerts</Typography>
                            {isPlaying && (
                                <Button
                                    variant="contained"
                                    color="error"
                                    size="small"
                                    onClick={stopAudio}
                                    sx={{ textTransform: 'none', borderRadius: '8px', minWidth: '100px' }}
                                >
                                    Stop Sound
                                </Button>
                            )}
                        </Grid>
                        <Grid size={{ xs: 12, lg: 9 }} sx={{ display: 'flex', justifyContent: 'flex-end', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mt: { xs: 2, lg: 0 } }}>
                            <CustomDateRangePicker
                                value={rangeSos}
                                onChange={setRangeSos}
                                icon={calender}
                            />
                        </Grid>
                    </Grid>

                    <Box sx={{ pt: { xs: 0, md: 3 }, backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
                        <TableContainer>
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
                                                User
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
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                            Trip Type
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                            Status
                                        </TableCell>
                                        <TableCell align="center" sx={{ backgroundColor: '#F9FAFB', borderTopRightRadius: '10px', color: '#4B5563' }}>
                                            Actions
                                        </TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {activeSos.isPending ?
                                        <TableRow>
                                            <TableCell sx={{ color: '#4B5563', borderBottom: 'none' }} colSpan={9} align="center">
                                                <Loader />
                                            </TableCell>
                                        </TableRow>
                                        : (paginatedActiveUserList?.length > 0 ?
                                            paginatedActiveUserList?.map((user) => (
                                                <ActiveSOSTableRow
                                                    key={user._id}
                                                    user={user}
                                                    userinfo={userinfo}
                                                    nav={nav}
                                                    copied={copied}
                                                    handleCopy={handleCopy}
                                                    setTextToCopy={setTextToCopy}
                                                    updatingId={updatingId}
                                                    selectedId={selectedId}
                                                    status={status}
                                                    setStatus={setStatus}
                                                    setStatusUpdate={setStatusUpdate}
                                                    setSelectedId={setSelectedId}
                                                    copyButtonStyles={copyButtonStyles}
                                                    isNavigatingBack={isNavigatingBack}
                                                    realtimeUpdates={realtimeUpdates}
                                                />
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
                                        onChange={(e) => handleActiveLimitChange(Number(e.target.value))}
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
                                        onClick={() => handleActivePageChange(activePage - 1)}
                                    >
                                        <NavigateBefore fontSize="small" sx={{
                                            color: activePage === 1 ? '#BDBDBD !important' : '#1976d2 !important'
                                        }} />
                                    </IconButton>
                                    <IconButton
                                        disabled={activePage === totalActivePages}
                                        onClick={() => handleActivePageChange(activePage + 1)}
                                    >
                                        <NavigateNext fontSize="small" />
                                    </IconButton>
                                </Box>
                            </Grid>
                        </Grid>}
                    </Box>
                </Paper>

                {/* hotspot */}
                <HotspotSection
                    isMapLoaded={isMapLoaded}
                    hideCategories={true}
                    companyIds={ehailingCompanyIds}
                    ehailing={false}
                />


                {/* recently closed sos */}
                <Paper elevation={1} sx={{ backgroundColor: "rgb(253, 253, 253)", mb: 2, padding: 2, borderRadius: '10px' }}>
                    <Grid container justifyContent="space-between" alignItems="center" mb={2}>
                        <Grid size={{ xs: 12, lg: 4 }} sx={{ display: 'flex', flexDirection: 'row', gap: 2, mb: { xs: 1, md: 0 } }}>
                            <Typography variant="h6" fontWeight={590}>Recently Closed SOS Alerts</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, lg: 8 }} sx={{ display: 'flex', justifyContent: 'flex-end', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mt: { xs: 2, lg: 0 } }}>
                            <CustomDateRangePicker
                                value={range}
                                onChange={setRange}
                                icon={calender}
                            />
                        </Grid>
                    </Grid>

                    <Box sx={{ pt: { xs: 0, md: 3 }, backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
                        <TableContainer>
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
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Trip Type</TableCell>
                                        <TableCell align="center" sx={{ backgroundColor: '#F9FAFB', borderTopRightRadius: '10px', color: '#4B5563' }}>Action</TableCell>
                                        <TableCell align="center" sx={{ backgroundColor: '#F9FAFB', borderTopRightRadius: '10px', color: '#4B5563' }}>                         </TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {recentSos.isFetching ?
                                        <TableRow>
                                            <TableCell sx={{ color: '#4B5563', borderBottom: 'none' }} colSpan={11} align="center">
                                                <Loader />
                                            </TableCell>
                                        </TableRow>
                                        : (recentSos?.data?.data?.items?.length > 0 ?
                                            recentSos?.data?.data?.items?.map((row) => (
                                                <RecentSOSTableRow
                                                    key={row._id}
                                                    row={row}
                                                    copied={copied}
                                                    handleCopy={handleCopy}
                                                    setTextToCopy={setTextToCopy}
                                                    nav={nav}
                                                    userinfo={userinfo}
                                                    isNavigatingBack={isNavigatingBack}
                                                />
                                            ))
                                            :
                                            <TableRow>
                                                <TableCell sx={{ color: '#4B5563', borderBottom: 'none' }} colSpan={11} align="center">
                                                    <Typography align="center" color="text.secondary" sx={{ mt: 2 }}>
                                                        No data found
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>)
                                    }
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {recentSos?.data?.data?.items?.length > 0 && !recentSos.isFetching && <Grid container sx={{ px: { xs: 0, sm: 1 } }} justifyContent="space-between" alignItems="center" mt={2}>
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
                                        onChange={(e) => handleRecentLimitChange(Number(e.target.value))}
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
                                        onClick={() => handleRecentPageChange(recentPage - 1)}
                                    >
                                        <NavigateBefore fontSize="small" sx={{
                                            color: recentPage === 1 ? '#BDBDBD !important' : '#1976d2 !important'
                                        }} />
                                    </IconButton>
                                    <IconButton
                                        disabled={recentPage === totalRecentPages}
                                        onClick={() => handleRecentPageChange(recentPage + 1)}
                                    >
                                        <NavigateNext fontSize="small" />
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

            {/* Audio Permission Modal - First Time Only */}
            <Dialog open={openAudioModal} onClose={() => { }} disableEscapeKeyDown>
                <DialogTitle>Enable Audio Alerts?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Do you want to enable sound notifications for real-time SOS alerts?
                        <br />
                        <Typography variant="caption" color="text.secondary">
                            (You can change this anytime in your Profile)
                        </Typography>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        localStorage.setItem("sosAudioEnabled", "false");
                        setOpenAudioModal(false);
                        toast.info("Audio alerts disabled. You can enable them in Profile.", toastOption);
                    }} color="inherit">
                        No, thanks
                    </Button>
                    <Button onClick={() => {
                        const enableAudio = async () => {
                            try {
                                // Create and play momentarily to "unlock" the audio context/interface
                                const unlockAudio = new Audio(tone);
                                await unlockAudio.play();

                                localStorage.setItem("sosAudioEnabled", "true");
                                setOpenAudioModal(false);
                                toast.success("Audio alerts enabled!", toastOption);
                            } catch (e) {
                                console.error("Permission grant failed", e);
                                localStorage.setItem("sosAudioEnabled", "true");
                                setOpenAudioModal(false);
                            }
                        }
                        enableAudio();
                    }} color="primary" variant="contained" autoFocus>
                        Yes, Enable Audio
                    </Button>
                </DialogActions>
            </Dialog>
        </Box >
    );
};

export default EHialingView