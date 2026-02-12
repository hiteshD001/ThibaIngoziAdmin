/* eslint-disable react-hooks/exhaustive-deps */
import { useRef, useMemo, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Slide, toast } from 'react-toastify';
import { startOfYear, format } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';

import { ContentCopy, NavigateNext, NavigateBefore } from '@mui/icons-material';
import { Box, Typography, Button, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, Grid, Stack, Select, MenuItem, Tooltip, TableSortLabel } from '@mui/material';

import ViewBtn from '../../assets/images/ViewBtn.svg';
import arrowup from '../../assets/images/arrowup.svg';
import tone from '../../assets/audio/notification.mp3';
import calender from '../../assets/images/calender.svg';
import arrowdown from '../../assets/images/arrowdown.svg';
import arrownuteral from '../../assets/images/arrownuteral.svg';

import { useWebSocket } from '../../API Calls/WebSocketContext';
import { useGetRecentSOS, useGetUser, useGetActiveSosData, useUpdateLocationStatus, useGetChartData } from '../../API Calls/API';

import Loader from '../../common/Loader';
import CustomChart from '../../common/CustomChart';
import { toastOption } from '../../common/ToastOptions';
import HotspotSection from '../../common/HotspotSection';
import { SOSStatusUpdate } from '../../common/ConfirmationPOPup';
import CustomDateRangePicker from '../../common/Custom/CustomDateRangePicker';

const copyButtonStyles = {
    color: '#4285F4 !important',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
};

// eslint-disable-next-line react/prop-types
const EHialingView = ({ isMapLoaded }) => {


    const nav = useNavigate();
    const queryClient = useQueryClient();

    const isFirstRun = useRef(true);
    const lastFetchTime = useRef(0);
    const audioRef = useRef(new Audio(tone));

    const role = localStorage.getItem("role");
    const userId = localStorage.getItem("userID");


    const [status, setStatus] = useState('')
    const [copied, setCopied] = useState(false);
    const [textToCopy, setTextToCopy] = useState('');
    const [selectedId, setSelectedId] = useState("");
    const [updatingId, setUpdatingId] = useState("");
    const [statusUpdate, setStatusUpdate] = useState(false);

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

    const userinfo = useGetUser(localStorage.getItem("userID"));
    const activeSos = useGetActiveSosData(activePage, activeLimit, startDateSos, endDateSos, "", "", sortBy2, sortOrder2);
    const recentSos = useGetRecentSOS(recentPage, recentLimit, startDate, endDate, "", "", sortBy, sortOrder);
    const chartData = useGetChartData(role !== "super_admin" ? userId : null, null, range[0]?.startDate, range[0]?.endDate, "");
    const {
        newSOS,
        requestCounts,
        activeUserLists,
        setActiveUserLists
    } = useWebSocket();

    const activeUserList = activeUserLists?.length > 0 ? activeUserLists : activeSos?.data?.data?.data;
    const prevLengthRef = useRef(activeUserList?.length);
    const notifiedSosIds = useRef(new Set(activeUserLists?.map(u => u._id) || []));
    const paginatedActiveUserList = useMemo(() => {
        if (!Array.isArray(activeUserList)) return [];
        if (activeUserLists?.length > 0) {
            const startIndex = (activePage - 1) * activeLimit;
            const endIndex = startIndex + activeLimit;
            return activeUserList.slice(startIndex, endIndex);
        }
        return activeUserList;
    }, [activeUserList, activePage, activeLimit, activeUserLists]);

    const onSuccess = () => {
        toast.success("Status Updated Successfully.");

        if (activeUserLists?.length > 0 && setActiveUserLists) {
            setActiveUserLists(prev => prev.filter(item => item._id !== selectedId));
        }

        setStatusUpdate(false);
        setSelectedId("");
        setUpdatingId("");
        stopAudio();
        queryClient.refetchQueries(["activeSOS2"], { exact: false });
    };

    const onError = (error) => {
        setUpdatingId("");
        toast.error(error.response.data.message || "Something went Wrong", toastOption);
    };

    const { mutate } = useUpdateLocationStatus(onSuccess, onError);

    const changeSortOrder = (e) => {
        const field = e.target.id;
        if (field !== sortBy) {
            setSortBy(field);
            setSortOrder("asc");
        } else {
            setSortOrder(p => p === 'asc' ? 'desc' : 'asc')
        }
    };

    const changeSortOrder2 = (e) => {
        const field = e.target.id;
        if (field !== sortBy2) {
            setSortBy2(field);
            setSortOrder2("asc");

        } else {
            setSortOrder2(p => p === 'asc' ? 'desc' : 'asc')
        }
    };

    const stopAudio = () => {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
    };

    const handleCopy = async () => {
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleUpdate = () => {
        setUpdatingId(selectedId);
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

    const totalActiveItems = activeUserLists?.length > 0 ? (activeUserList?.length || 0) : (activeSos?.data?.data?.totalItems || 0);
    const totalActivePages = Math.ceil(totalActiveItems / activeLimit)
    const totalRecentItems = recentSos?.data?.totalItems
    const totalRecentPages = Math.ceil(totalRecentItems / recentLimit)


    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }

        if (!newSOS.type || newSOS.count === 0) return;

        const handleAlert = async () => {
            try {
                if (activeUserLists?.length > 0) {
                    console.log('[Home Alert Effect] Using WebSocket data path');

                    if (newSOS.sosId && notifiedSosIds.current.has(newSOS.sosId)) return;

                    const playAudio = async () => {
                        try {
                            const isAudioEnabled = localStorage.getItem("sosAudioEnabled") === 'true';

                            if (isAudioEnabled && audioRef.current) {
                                audioRef.current.loop = false;
                                audioRef.current.currentTime = 0;
                                await audioRef.current.play();
                                console.log('[Home Alert Effect] Audio played');
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
                    const now = Date.now();
                    if (now - lastFetchTime.current < 2000) return;

                    lastFetchTime.current = now;

                    const res = await activeSos.refetch();

                    if (res?.data?.data?.data) {
                        const newList = res.data.data.data || [];

                        let hasNew = false;
                        const newIds = [];

                        for (const item of newList) {
                            if (!notifiedSosIds.current.has(item._id)) {
                                hasNew = true;
                                newIds.push(item._id);
                            }
                        }

                        if (hasNew) {
                            const playAudio = async () => {
                                try {
                                    const isAudioEnabled = localStorage.getItem("sosAudioEnabled") === 'true';

                                    if (isAudioEnabled && audioRef.current) {
                                        audioRef.current.loop = false;
                                        audioRef.current.currentTime = 0;
                                        await audioRef.current.play();
                                    }
                                } catch (e) {
                                    console.error("Audio playback failed:", e);
                                }
                            }
                            playAudio();
                            toast.info("New SOS Alert Received", { autoClose: 2000, hideProgressBar: true, transition: Slide });

                            newIds.forEach(id => notifiedSosIds.current.add(id));
                        }
                    }
                }
            } catch (error) {
                console.error("Refetch failed:", error);
            }
        };

        handleAlert();
    }, [newSOS.count]);

    useEffect(() => {
        if (!Array.isArray(activeUserList)) return;

        const currentLength = activeUserList.length;
        const previousLength = prevLengthRef.current;

        if (previousLength === null) {
            prevLengthRef.current = currentLength;
            return;
        }

        if (previousLength !== currentLength) {
            prevLengthRef.current = currentLength;
            recentSos.refetch();
            queryClient.invalidateQueries(['chartData'], { exact: false });
            queryClient.invalidateQueries(['hotspot'], { exact: false });
        }
    }, [activeUserList, recentSos.refetch]);

    return (
        <Box>

            <Grid sx={{ backgroundColor: 'white', p: 3, mt: '-25px' }} container justifyContent="space-between" alignItems="center" spacing={2} mb={3}>
                <Grid size={{ xs: 12, md: 5, lg: 6 }}>
                    <Typography variant="h5" fontWeight={550}>
                        e-Hailing View Overview
                    </Typography>
                    <Typography variant="body1" mt={1} color="text.secondary">
                        Monitor all Bolt-based trips, SOS alerts, and live incidents
                    </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 7, lg: 6 }}>
                    <Box display="flex" sx={{ justifyContent: { md: 'flex-end', sm: 'space-around' } }} gap={2} flexWrap="wrap">
                        <Box display="flex" sx={{ justifyContent: { md: 'flex-end', sm: 'space-around' } }} gap={2} flexWrap="wrap">
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
                                                <TableRow key={user._id}>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        {
                                                            user?.sosType === 'ARMED_SOS' ? (
                                                                <Stack direction="row" alignItems="center" gap={1}>
                                                                    <Avatar alt="User" />
                                                                    {user?.user?.first_name} {user?.user?.last_name}
                                                                </Stack>
                                                            ) : (
                                                                user?.role === "driver" ? (
                                                                    <Link to={`/home/total-drivers/driver-information/${user?._id}`} className="link">
                                                                        <Stack direction="row" alignItems="center" gap={1}>
                                                                            <Avatar
                                                                                src={user?.selfieImage}
                                                                                sx={{ '&:hover': { textDecoration: 'none' } }}
                                                                                alt="User"
                                                                            />
                                                                            {user?.user?.first_name || user?.user_id?.first_name} {user?.user?.last_name || user?.user_id?.last_name}
                                                                        </Stack>
                                                                    </Link>) : (
                                                                    <Link to={`/home/total-users/user-information/${user?._id}`} className="link">
                                                                        <Stack direction="row" alignItems="center" gap={1}>
                                                                            <Avatar src={user?.selfieImage} alt="User" />
                                                                            {user?.user?.first_name || user?.user_id?.first_name} {user?.user?.last_name || user?.user_id?.last_name}
                                                                        </Stack>
                                                                    </Link>
                                                                )
                                                            )
                                                        }
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
                                                                        onClick={() => {
                                                                            setTextToCopy(`${user?.armedLocationId?.houseNumber || ''} ${user?.armedLocationId?.street || ''}, ${user?.armedLocationId?.suburb || ''}`);
                                                                            handleCopy();
                                                                        }}
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
                                                                            onClick={() => {
                                                                                setTextToCopy(`${user?.address} View:https://api.thibaingozi.com/api/?sosId=${user?.deepLinks?.[0]?._id}`);
                                                                                handleCopy();
                                                                            }}
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
                                                        <Link
                                                            to={`/home/request-reached-users/${user?._id}`}
                                                            style={{
                                                                textDecoration: 'none',
                                                                color: 'var(--orange)',
                                                                cursor: 'pointer',
                                                            }}
                                                        >
                                                            {requestCounts[user?._id]?.req_reach || user?.req_reach || "0"}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#01C971' }}>
                                                        <Link
                                                            to={`/home/request-accepted-users/${user?._id}`}
                                                            style={{
                                                                textDecoration: 'none',
                                                                color: '#01C971',
                                                                cursor: 'pointer',
                                                            }}
                                                        >
                                                            {requestCounts[user?._id]?.req_accept || user?.req_accept || "0"}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell sx={{ color: user?.type?.bgColor ?? '#4B5563' }}>
                                                        {user?.sosType === 'ARMED_SOS' ? "Armed Response" : (user?.type?.display_title || "-")}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        {format(user?.createdAt, 'HH:mm:ss')}
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
                                                                )}
                                                            </div>
                                                        }
                                                    </TableCell>
                                                    <TableCell >
                                                        <Box align="center" sx={{ display: 'flex', flexDirection: 'row' }}>
                                                            <Tooltip title="View" arrow placement="top">
                                                                <IconButton onClick={() => nav(`/home/hotspot/location?locationId=${user?._id}&lat=${user?.lat}&long=${user?.long}&end_lat=${userinfo?.data?.data?.user?.current_lat}&end_long=${userinfo?.data?.data?.user?.current_long}&req_reach=${user?.req_reach}&req_accept=${user?.req_accept}`)}>
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
                                                                    >
                                                                        Other User
                                                                    </Typography>
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                    </TableCell>
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
                                        <NavigateBefore fontSize="small" sx={{
                                            color: activePage === 1 ? '#BDBDBD !important' : '#1976d2 !important'
                                        }} />
                                    </IconButton>
                                    <IconButton
                                        disabled={activePage === totalActivePages}
                                        onClick={() => setActivePage((prev) => prev + 1)}
                                    >
                                        <NavigateNext fontSize="small" />
                                    </IconButton>
                                </Box>
                            </Grid>
                        </Grid>}
                    </Box>
                </Paper>

                {/* hotspot */}
                <HotspotSection isMapLoaded={isMapLoaded} hideCategories={true} />


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
                                        : (recentSos?.data?.items?.length > 0 ?
                                            recentSos?.data?.items?.map((row) => (
                                                <TableRow key={row?._id}>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        {
                                                            row.user?.role === "driver" ? (
                                                                <Link to={`/home/total-drivers/driver-information/${row.user._id}`} className="link">
                                                                    <Stack direction="row" alignItems="center" gap={1}>
                                                                        <Avatar src={row?.user?.selfieImage} alt="User" />
                                                                        {row?.user?.first_name || ''} {row?.user?.last_name || ''}
                                                                    </Stack>
                                                                </Link>
                                                            ) : (
                                                                <Link to={`/home/total-users/user-information/${row?.user?._id}`} className="link">
                                                                    <Stack direction="row" alignItems="center" gap={1}>
                                                                        <Avatar src={row?.user?.selfieImage} alt="User" />
                                                                        {row?.user?.first_name || ''} {row?.user?.last_name || ''}
                                                                    </Stack>
                                                                </Link>
                                                            )
                                                        }
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
                                                                    onClick={() => {
                                                                        setTextToCopy(`${row?.address} View:https://api.thibaingozi.com/api/?sosId=${row?.deepLinks._id}`);
                                                                        handleCopy();
                                                                    }}
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

                        {recentSos?.data?.items?.length > 0 && !recentSos.isFetching && <Grid container sx={{ px: { xs: 0, sm: 1 } }} justifyContent="space-between" alignItems="center" mt={2}>
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
                                        <NavigateBefore fontSize="small" sx={{
                                            color: recentPage === 1 ? '#BDBDBD !important' : '#1976d2 !important'
                                        }} />
                                    </IconButton>
                                    <IconButton
                                        disabled={recentPage === totalRecentPages}
                                        onClick={() => setRecentPage((prev) => prev + 1)}
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
        </Box >
    );
};

export default EHialingView