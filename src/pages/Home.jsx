import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
    // useGetActiveSOS,
    useGetRecentSOS,
    useGetUser,
    useGetActiveSosData,
    useUpdateLocationStatus, useGetNotificationType,useGetCaptureReportListV2,useGetCrimeReportList
} from "../API Calls/API";
import {
    Box, Typography, TextField, Button, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, Grid, InputAdornment, Stack, Select, MenuItem, FormControl, InputLabel,
    Tooltip,
    TableSortLabel,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    List,
    ListItemButton,
    ListItemText,
    Divider,
    Switch,
    Chip,
    CircularProgress,Popover 
} from "@mui/material";
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { useRef, useMemo } from "react";
import { startOfYear } from "date-fns";
import calender from '../assets/images/calender.svg';
import CustomDateRangePicker from "../common/Custom/CustomDateRangePicker";
import search from '../assets/images/search.svg';
import ViewBtn from '../assets/images/ViewBtn.svg'
import fileBtn from '../assets/images/fileBtn.svg'
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
import { useMaps } from "../contexts/MapsContext";
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
import { saveScrollPosition, restoreScrollPosition } from "../common/ScrollPosition";

const copyButtonStyles = {
    color: '#4285F4 !important',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
};


const Home = () => {
    const { isLoaded: isMapLoaded } = useMaps();
    const [searchParams, setSearchParams] = useSearchParams();
    const filter = searchParams.get("filter") || "";
    // Active SOS pagination
    const startDateParam = searchParams.get("startDate") || startOfYear(new Date()).toISOString();
    const endDateParam = searchParams.get("endDate") || new Date().toISOString();
    const [rangeSos, setRangeSos] = useState([{
        startDate: new Date(startDateParam),
        endDate: new Date(endDateParam),
        key: 'selection'
    }]);
    const activePage = Number(searchParams.get("activePage")) || 1;
    const activeLimit = Number(searchParams.get("activeLimit")) || 10;
    const selectedNotification = searchParams.get("selectedNotification") || "all"
    // Recent Filter And Pagination
    const [recentSearchParams, setRecentSearchParams] = useSearchParams();
    const startDateRecentParam = recentSearchParams.get("startDate") || startOfYear(new Date()).toISOString();
    const endDateRecentParam = recentSearchParams.get("endDate") || new Date().toISOString();
    const recentNotification = searchParams.get("recentNotification") || "all"

    const [range, setRange] = useState([{
        startDate: new Date(startDateRecentParam),
        endDate: new Date(endDateRecentParam),
        key: 'selection'
    }]);
    const recentFilter = recentSearchParams.get("recentFilter") || "";
    const recentPage = Number(recentSearchParams.get("recentPage")) || 1;
    const recentLimit = Number(recentSearchParams.get("recentLimit")) || 10;

    const [debouncedFilter, setDebouncedFilter] = useState("");
    const [debouncedRecentFilter, setDebouncedRecentFilter] = useState("");
    const [statusUpdate, setStatusUpdate] = useState(false);

    // Audio Permission Modal (First Time Only)
    const [openAudioModal, setOpenAudioModal] = useState(false);
    useEffect(() => {
        const audioPref = localStorage.getItem("sosAudioEnabled");
        if (audioPref === null) {
            setOpenAudioModal(true);
        }
    }, []);

    // debounce Active SOS search
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedFilter(filter.trim());
        }, 1000);
        return () => clearTimeout(handler);
    }, [filter]);

    // debounce Recently Closed SOS search
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedRecentFilter(recentFilter.trim());
        }, 1000);
        return () => clearTimeout(handler);
    }, [recentFilter]);

    const [status, setStatus] = useState('')
    // const [activeUsers, setActiveUsers] = useState([])
    const [selectedId, setSelectedId] = useState("");
    const [updatingId, setUpdatingId] = useState(""); // Track which ID is being updated
    const { newSOS, requestCounts, activeUserLists, setActiveUserLists } = useWebSocket();
    const location = useLocation();

    const queryClient = useQueryClient();
    const notificationTypes = useGetNotificationType();

    // Audio Control
    const audioRef = useRef(new Audio(tone));
    const [isPlaying, setIsPlaying] = useState(false);

    // 2FA
    const [showQRCode, setShowQRCode] = useState(false);
    const [qrCodeData, setQrCodeData] = useState(null);
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    const [is2FALoading, setIs2FALoading] = useState(false);

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
        const field = e.currentTarget.id;
        if (!field) return;
        if (field !== sortBy) {
            setSortBy(field);
            setSortOrder("asc");
            updateRecentParams({ recentPage: 1 });
        } else {
            setSortOrder(p => p === 'asc' ? 'desc' : 'asc');
            updateRecentParams({ recentPage: 1 });
        }
    }

    const changeSortOrder2 = (e) => {
        const field = e.currentTarget.id;
        if (!field) return;
        if (field !== sortBy2) {
            setSortBy2(field);
            setSortOrder2("asc");
            updateParams({ activePage: 1 });
        } else {
            setSortOrder2(p => p === 'asc' ? 'desc' : 'asc');
            updateParams({ activePage: 1 });
        }
    }

    const nav = useNavigate();
    const userId = localStorage.getItem("userID");
    const role = localStorage.getItem("role");
    const userinfo = useGetUser(localStorage.getItem("userID"));

    const [otherUsersModalOpen, setOtherUsersModalOpen] = useState(false);
    const [otherUsersModalItems, setOtherUsersModalItems] = useState([]);

    const normalizeOtherUsers = (otherUser) => {
        if (!otherUser) return [];
        if (Array.isArray(otherUser)) return otherUser.filter(Boolean);
        return [otherUser];
    };

    const getOtherUserId = (u) => u?._id || u?.user_id?._id || u?.user_id || u?.id;
    const getOtherUserRole = (u) => u?.role || u?.user?.role || u?.user_id?.role;
    const getOtherUserName = (u) => {
        const first = u?.first_name || u?.user?.first_name || u?.user_id?.first_name || "";
        const last = u?.last_name || u?.user?.last_name || u?.user_id?.last_name || "";
        const full = `${first} ${last}`.trim();
        return full || u?.phone || u?.email || getOtherUserId(u) || "Unknown user";
    };
    const getOtherUserRoute = (u) => {
        const id = getOtherUserId(u);
        if (!id) return null;
        return getOtherUserRole(u) === "driver"
            ? `/home/total-drivers/driver-information/${id}`
            : `/home/total-users/user-information/${id}`;
    };

    const openOtherUsersModal = (otherUser, type,selectedId) => {
        const items = normalizeOtherUsers(otherUser);
        setOtherUsersModalItems(items);
        setOtherUsersModalOpen(true);
        
        if (type == 'ACTIVE') {
            updateParams({
                modal: true,
                type: type,
                selectedUser:selectedId,
                modalData: encodeURIComponent(JSON.stringify(items)),
            });
        }
        if (type == 'RECENT') {
            updateRecentParams({
                modal: true,
                type: type,
                selectedUser:selectedId,
                modalData: encodeURIComponent(JSON.stringify(items)),
            });
        }
    };
    const closeOtherUsersModal = () => {
        setOtherUsersModalOpen(false);
        setOtherUsersModalItems([]);
    };

    const { data: recentSos, isFetching, refetch: refetchRecentSOS } = useGetRecentSOS({
        page: recentPage,
        limit: recentLimit,
        startDate,
        endDate,
        searchKey: debouncedRecentFilter,
        type: recentNotification,
        sortBy,
        sortOrder
    });

    const activeSos = useGetActiveSosData({
        page: activePage,
        limit: activeLimit,
        startDate: startDateSos,
        endDate: endDateSos,
        searchKey: debouncedFilter,
        type: selectedNotification,
        sortBy: sortBy2,
        sortOrder: sortOrder2
    });
    const defaultStartDate = startOfYear(new Date()).toISOString();
    const isFilterActive = useMemo(() => {
        if (filter && filter.trim().length > 0) return true;
        if (selectedNotification !== "all") return true;
        if (sortBy2 !== "createdAt" || sortOrder2 !== "desc") return true;
        // Check if date range has been changed from the default
        const defaultStart = startOfYear(new Date()).toISOString().split('T')[0];
        const currentStart = startDateSos.split('T')[0];
        const defaultEnd = new Date().toISOString().split('T')[0];
        const currentEnd = endDateSos.split('T')[0];
        if (currentStart !== defaultStart || currentEnd !== defaultEnd) return true;
        return false;
    }, [filter, selectedNotification, startDateSos, endDateSos, sortBy2, sortOrder2]);

    // Use WebSocket data by default; switch to API data when a filter is active
    const activeUserList = isFilterActive
        ? activeSos?.data?.data?.data
        : (activeUserLists?.length > 0 ? activeUserLists : activeSos?.data?.data?.data);

    // Apply pagination slicing for display
    const paginatedActiveUserList = useMemo(() => {
        if (!Array.isArray(activeUserList)) return [];
        // Only slice if using WebSocket data (client-side pagination)
        // API data is already paginated server-side
        if (!isFilterActive && activeUserLists?.length > 0) {
            const startIndex = (activePage - 1) * activeLimit;
            const endIndex = startIndex + activeLimit;
            return activeUserList.slice(startIndex, endIndex);
        }
        return activeUserList;
    }, [activeUserList, activePage, activeLimit, activeUserLists, isFilterActive]);

    const prevLengthRef = useRef(activeUserList?.length);

    const notifiedSosIds = useRef(new Set(activeUserLists?.map(u => u._id) || []));
    const lastFetchTime = useRef(0);
    const sosSyncTimerRef = useRef(null);
    const sosSyncInFlightRef = useRef(false);
    const sosSyncQueuedRef = useRef(false);
    const handledSosEventRef = useRef("");
    const latestActiveUsersRef = useRef(activeUserLists || []);
    const activeSosRefetchRef = useRef(activeSos?.refetch);

    useEffect(() => {
        latestActiveUsersRef.current = activeUserLists || [];
    }, [activeUserLists]);

    useEffect(() => {
        activeSosRefetchRef.current = activeSos?.refetch;
    }, [activeSos]);

    const scheduleActiveSosSync = useMemo(() => {
        const runner = () => {
            if (sosSyncInFlightRef.current) {
                sosSyncQueuedRef.current = true;
                return;
            }
            if (sosSyncTimerRef.current) {
                clearTimeout(sosSyncTimerRef.current);
            }
            sosSyncTimerRef.current = setTimeout(async () => {
                const elapsed = Date.now() - lastFetchTime.current;
                const waitRemaining = Math.max(0, 1200 - elapsed);
                if (waitRemaining > 0) {
                    sosSyncTimerRef.current = setTimeout(runner, waitRemaining);
                    return;
                }

                lastFetchTime.current = Date.now();
                sosSyncInFlightRef.current = true;
                try {
                    const refetchFn = activeSosRefetchRef.current;
                    if (!refetchFn) return;
                    const res = await refetchFn();
                    if (res?.data?.data?.data && setActiveUserLists && latestActiveUsersRef.current.length > 0) {
                        const refetched = res.data.data.data;
                        const byId = {};
                        refetched.forEach((item) => { byId[item._id] = item; });
                        setActiveUserLists((prev) =>
                            prev.map((item) => (byId[item._id] ? { ...item, ...byId[item._id] } : item))
                        );
                    }
                } catch (err) {
                    console.error("Coalesced active SOS sync failed:", err);
                } finally {
                    sosSyncInFlightRef.current = false;
                    if (sosSyncQueuedRef.current) {
                        sosSyncQueuedRef.current = false;
                        runner();
                    }
                }
            }, 400);
        };
        return runner;
    }, [setActiveUserLists]);

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
        if (!newSOS.type || newSOS.count === 0) return;
        const eventKey = `${newSOS.type || ""}:${newSOS.sosId || ""}:${newSOS.count}`;
        if (handledSosEventRef.current === eventKey) return;
        handledSosEventRef.current = eventKey;

        const handleAlert = async () => {
            try {
                // If we have WebSocket data, we trust the NEW_SOS signal
                // WE REMOVED THROTTLING HERE to ensure audio plays for every alert
                if (activeUserLists?.length > 0) {

                    // Check if the specific new SOS ID has already been notified
                    if (newSOS.sosId && notifiedSosIds.current.has(newSOS.sosId)) {
                        return;
                    }

                    const playAudio = async () => {
                        try {
                            // Respect user preference for audio
                            const isAudioEnabled = localStorage.getItem("sosAudioEnabled") === 'true';

                            if (isAudioEnabled && audioRef.current) {
                                audioRef.current.loop = true; // Ensure play once
                                audioRef.current.currentTime = 0;
                                await audioRef.current.play();
                            }
                            setIsPlaying(true);

                            // Mark as notified
                            if (newSOS.sosId) {
                                notifiedSosIds.current.add(newSOS.sosId);
                            } else {
                                // If generic update, mark all current as notified to prevent replay
                                activeUserLists.forEach(u => notifiedSosIds.current.add(u._id));
                            }

                        } catch (e) {
                            console.error("Audio playback failed:", e);
                        }
                    }
                    playAudio();
                    toast.info("New SOS Alert Received", { autoClose: 2000, hideProgressBar: true, transition: Slide });
                    scheduleActiveSosSync();
                } else {
                    scheduleActiveSosSync();
                }
            } catch (error) {
                console.error("Refetch failed:", error);
            }
        };

        handleAlert();
    }, [newSOS.count, newSOS.type, newSOS.sosId, activeUserLists, scheduleActiveSosSync]);

    useEffect(() => {
        return () => {
            if (sosSyncTimerRef.current) clearTimeout(sosSyncTimerRef.current);
        };
    }, []);

    // Stop audio helper
    const stopAudio = () => {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
    };

    useEffect(() => {
        if (!Array.isArray(activeUserList)) return;

        // NOTE: We do NOT auto-sync notifiedSosIds here anymore
        // because it prevents the alert sound from playing for new SOS.
        // IDs are now added to notifiedSosIds only after the alert plays.

        const currentLength = activeUserList.length;
        const previousLength = prevLengthRef.current;

        // First run setup
        if (previousLength === null || previousLength === undefined) {
            prevLengthRef.current = currentLength;
            return;
        }

        // Trigger only when count changes
        if (previousLength !== currentLength) {
            // If the number of active SOS requests decreases (meaning one was resolved)
            // we stop the continuous ringing.
            if (currentLength < previousLength) {
                stopAudio();
            }

            prevLengthRef.current = currentLength;   // update stored length
            refetchRecentSOS();
            queryClient.invalidateQueries(['chartData'], { exact: false });
            queryClient.invalidateQueries(['hotspot'], { exact: false });
        }
    }, [activeUserList, refetchRecentSOS]); // Removed activeUserList.length to track content updates

    useEffect(() => {
        const status = userinfo?.data?.data?.user?.twoFactorAuth?.enabled

        if (status === false && location?.state?.from === "login") {
            setShowQRCode(true);
        }
    }, [userinfo?.data?.data?.user?.twoFactorAuth?.enabled])


    const onSuccess = () => {
        toast.success("Status Updated Successfully.");

        // Optimistically update the local activeUserLists if available (WebSocket source)
        if (activeUserLists?.length > 0 && setActiveUserLists) {
            setActiveUserLists(prev => prev.filter(item => item._id !== selectedId));
        }

        setStatusUpdate(false);
        setSelectedId("");
        setUpdatingId(""); // Clear loader
        stopAudio(); // Stop sound when status is updated
        queryClient.refetchQueries(["activeSOS2"], { exact: false });
    };
    const onError = (error) => {
        setUpdatingId(""); // Clear loader
        toast.error(
            error.response.data.message || "Something went Wrong",
            toastOption
        );
    };

    const handleNotificationChange = (e) => {
        updateParams({ selectedNotification: e.target.value })
    };
    const handleRecentNotificationChange = (e) => {
        updateRecentParams({ recentNotification: e.target.value })
    }

    // const [textToCopy, setTextToCopy] = useState('')

    const [copied, setCopied] = useState(false);

    const handleCopy = async (textToCopy) => {
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

    const getImageLink = (name) => {
        if (!name) return undefined;
        return `https://gaurdianlink.blob.core.windows.net/gaurdianlink/${name}`;
    }

    // Calculate total items: use activeUserList length for WebSocket data, activeSos data for API
    const totalActiveItems = isFilterActive
        ? (activeSos?.data?.data?.totalItems || 0)
        : (activeUserLists?.length > 0 ? (activeUserList?.length || 0) : (activeSos?.data?.data?.totalItems || 0));
    const totalActivePages = Math.ceil(totalActiveItems / activeLimit) || 1;
    const recentSosItems = recentSos?.data?.items ?? recentSos?.data?.data?.items ?? [];
    const totalRecentItems = recentSos?.data?.totalItems ?? recentSos?.data?.data?.totalItems ?? 0;
    const totalRecentPages = Math.ceil(totalRecentItems / recentLimit)

    // Update Active Sos Params
    const updateParams = (newParams) => {
        setSearchParams({
            activePage,
            activeLimit,
            startDate: startDateParam,
            endDate: endDateParam,
            filter,
            selectedNotification,
            ...newParams,
        });
    };

    // Update Recent Sos Params
    const updateRecentParams = (newParams) => {
        setRecentSearchParams({
            recentPage,
            recentLimit,
            startDate: startDateRecentParam,
            endDate: endDateRecentParam,
            recentFilter,
            recentNotification,
            ...newParams,
        });
    };

    const [captureReportModalOpen, setCaptureReportModalOpen] = useState(false);
    const [captureReportModalItems, setCaptureReportModalItems] = useState([]);
    const [locationId, setLocationId] = useState(null);
    const [sosNumberPath, setSosNumberPath] = useState('');
    const [captureReportAnchorEl, setCaptureReportAnchorEl] = useState(null);

    const openCaptureReportModal = async (location_id,event,type,sosNumPath='') => {
        
        const el = document.querySelector(`[data-id="${location_id}"]`);
    
        setCaptureReportAnchorEl(el);
        setLocationId(location_id)
        setSosNumberPath(sosNumPath)
        let captureList = await  useGetCaptureReportListV2(location_id, role, 1, 3);
        let items = captureList.data?.data || [] 
        
        setCaptureReportModalItems(items);
        setCaptureReportModalOpen(true);
        
        if (type == 'ACTIVE') {
            updateParams({
                capturemodal: true,
                capturetype: type,
                capturemodalData: encodeURIComponent(JSON.stringify(items)),
                AnchorEl: location_id,
                location_id:location_id,
                sosNumPath:sosNumPath
            });
        }
        
        if (type == 'RECENT') {
            updateRecentParams({
                capturemodal: true,
                capturetype: type,
                capturemodalData: encodeURIComponent(JSON.stringify(items)),
                AnchorEl: location_id,
                location_id:location_id,
                sosNumPath:sosNumPath
            });
        }

    };
    const closeCaptureReportModal = () => {
        setCaptureReportModalOpen(false);
        setCaptureReportModalItems([]);
        setCaptureReportAnchorEl(null);
            updateParams({
                capturemodal: false,
                capturetype: '',
                capturemodalData: '',
                AnchorEl: '',
                location_id:'',
                sosNumPath:''
            });
            updateRecentParams({
                capturemodal: false,
                capturetype: type,
                capturemodalData:'',
                AnchorEl:'',
                location_id:'',
                sosNumPath:''
            });
    };

    // Active Crime Report 
    const [searchParamsCrimeReportActive, setSearchParamsCrimeReportActive] = useSearchParams();
    const startDateParamCrimeActive = searchParamsCrimeReportActive.get("startDate") || startOfYear(new Date()).toISOString();
    const endDateParamCrimeActive = searchParamsCrimeReportActive.get("endDate") || new Date().toISOString();
    const [rangeCrimeActive, setRangeCrimeActive] = useState([{
        startDate: new Date(startDateParamCrimeActive),
        endDate: new Date(endDateParamCrimeActive),
        key: 'selection'
    }]);
    const currentPageCrimeActive = Number(searchParamsCrimeReportActive.get("currentPageCrimeActive")) || 1;
    const filterCrimeActive = searchParamsCrimeReportActive.get("filterCrimeActive") || "";
    const rowsPerPageCrimeActive = Number(searchParamsCrimeReportActive.get("rowsPerPageCrimeActive")) || 5;

    // Sort
    const [sortByCrimeActive, setSortByCrimeActive] = useState("createdAt");
    const [sortOrderCrimeActive, setSortOrderCrimeActive] = useState("desc");

    const changeSortOrderCrimeActive = (e) => {
        const field = e.target.id;

        if (field !== sortByCrimeActive) {
            setSortByCrimeActive(field);
            setSortOrderCrimeActive("asc");
        } else {
            setSortOrderCrimeActive(p => p === 'asc' ? 'desc' : 'asc')
        }
    }
    const startDateFilterCrimeActive = rangeCrimeActive[0].startDate.toISOString();
    const endDateFilterCrimeActive = rangeCrimeActive[0].endDate.toISOString();
    const shortText = (text, limit = 30) =>
        text.length > limit ? text.substring(0, limit) + '...' : text;
    const updateParamsCrimeActive = (newParams) => {
        setSearchParamsCrimeReportActive({
            currentPageCrimeActive,
            rowsPerPageCrimeActive,
            startDateCrimeActive: startDateParamCrimeActive,
            endDateCrimeActive: endDateParamCrimeActive,
            filterCrimeActive,
            ...newParams,
        });
    };
    const crimeActiveList = useGetCrimeReportList("crime report list", role, currentPageCrimeActive, rowsPerPageCrimeActive, filterCrimeActive,'', startDateFilterCrimeActive, endDateFilterCrimeActive, false,sortByCrimeActive, sortOrderCrimeActive,'pending');
    const totalCrimeReportActiveData = crimeActiveList.data?.data?.totalCrimeReportData || 0;
    const totalPagesCrimeActive = Math.ceil(totalCrimeReportActiveData / rowsPerPageCrimeActive);

    // Recent Crime Report 
    const [searchParamsCrimeReportRecent, setSearchParamsCrimeReportRecent] = useSearchParams();
    const startDateParamCrimeRecent = searchParamsCrimeReportRecent.get("startDate") || startOfYear(new Date()).toISOString();
    const endDateParamCrimeRecent = searchParamsCrimeReportRecent.get("endDate") || new Date().toISOString();
    const [rangeCrimeRecent, setRangeCrimeRecent] = useState([{
        startDate: new Date(startDateParamCrimeRecent),
        endDate: new Date(endDateParamCrimeRecent),
        key: 'selection'
    }]);
    const currentPageCrimeRecent = Number(searchParamsCrimeReportRecent.get("currentPageCrimeRecent")) || 1;
    const filterCrimeRecent = searchParamsCrimeReportRecent.get("filterCrimeRecent") || "";
    const rowsPerPageCrimeRecent = Number(searchParamsCrimeReportRecent.get("rowsPerPageCrimeRecent")) || 10;

    // Sort
    const [sortByCrimeRecent, setSortByCrimeRecent] = useState("createdAt");
    const [sortOrderCrimeRecent, setSortOrderCrimeRecent] = useState("desc");

    const changeSortOrderCrimeRecent = (e) => {
        const field = e.target.id;

        if (field !== sortByCrimeRecent) {
            setSortByCrimeRecent(field);
            setSortOrderCrimeRecent("asc");
        } else {
            setSortOrderCrimeRecent(p => p === 'asc' ? 'desc' : 'asc')
        }
    }
    const startDateFilterCrimeRecent = rangeCrimeRecent[0].startDate.toISOString();
    const endDateFilterCrimeRecent = rangeCrimeRecent[0].endDate.toISOString();
    const updateParamsCrimeRecent = (newParams) => {
        setSearchParamsCrimeReportRecent({
            currentPageCrimeRecent,
            rowsPerPageCrimeRecent,
            startDateCrimeRecent: startDateParamCrimeRecent,
            endDateCrimeRecent: endDateParamCrimeRecent,
            filterCrimeRecent,
            ...newParams,
        });
    };
    const crimeRecentList = useGetCrimeReportList("crime report list", role, currentPageCrimeRecent, rowsPerPageCrimeRecent, filterCrimeRecent,'', startDateFilterCrimeRecent, endDateFilterCrimeRecent, false,sortByCrimeRecent, sortOrderCrimeRecent,'reviewed,reviewing,With SAPS');
    const totalCrimeReportRecentData = crimeRecentList.data?.data?.totalCrimeReportData || 0;
    const totalPagesCrimeRecent = Math.ceil(totalCrimeReportRecentData / rowsPerPageCrimeRecent);

    const activemodal = searchParams.get("modal");
    const recentmodal = recentSearchParams.get("modal");
    const modalData = searchParams.get("modalData") || "";
    const modalrecentData = recentSearchParams.get("modalData") || '';
    // Capture Model Open 
    const activecapturemodal = searchParams.get("capturemodal");
    const recentcapturemodal = recentSearchParams.get("capturemodal");
    const captureAnchorIndex  =  searchParams.get("AnchorEl") || null;
    const capturemodalData = searchParams.get("capturemodalData") || "";
    const capturemodalrecentData = recentSearchParams.get("capturemodalData") || '';
    const captureRecentAnchorIndex  =  recentSearchParams.get("AnchorEl")|| null;

    // Handle Scroll Event store 
    const handleView = (url) => {
        saveScrollPosition('homePageScroll');
        nav(url)
    };

    useEffect(() => {  
        if (paginatedActiveUserList.length && recentSos?.data?.items.length) {
            restoreScrollPosition("homePageScroll");
            setLocationId(recentSearchParams.get("location_id")|| null)
            setSosNumberPath( recentSearchParams.get("sosNumPath") || null) 
            if ((paginatedActiveUserList.length > 0) && (activemodal === true || activemodal === "true")) {
                setOtherUsersModalOpen(true);
                const parsedData = JSON.parse(decodeURIComponent(modalData)) || [];
                setOtherUsersModalItems(parsedData);
            }
            if ((recentSos?.data?.items.length > 0) && (recentmodal === true || recentmodal === "true")) {
                setOtherUsersModalOpen(true);
                const parsedData = JSON.parse(decodeURIComponent(modalrecentData)) || [];
                setOtherUsersModalItems(parsedData);
            }
            // Capture Model
            if ((paginatedActiveUserList.length > 0) && (!activeSos.isFetching) && (activecapturemodal === true || activecapturemodal === "true")) {
                const parsedData = JSON.parse(decodeURIComponent(capturemodalData)) || [];
                 setCaptureReportModalItems(parsedData);
                 setTimeout(() => {
                    const el = document.querySelector(`[data-id="${captureAnchorIndex}"]`);
                     setCaptureReportAnchorEl(el || null);
                     setCaptureReportModalOpen(true);
                 }, 300);
            }
            if ((recentSos?.data?.items.length > 0) && (!isFetching) && (recentcapturemodal === true || recentcapturemodal === "true")) {
                const parsedData = JSON.parse(decodeURIComponent(capturemodalrecentData)) || [];
                setCaptureReportModalItems(parsedData);
                setTimeout(() => {
                    const el = document.querySelector(`[data-id="${captureRecentAnchorIndex}"]`);
                    setCaptureReportAnchorEl(el || null);
                    setCaptureReportModalOpen(true);
                }, 300);
            }          
        }
    }, [paginatedActiveUserList, recentSos]);

    return (
        <>
            {(activeSos.isFetching || crimeActiveList.isFetching || isFetching || crimeRecentList.isFetching) && (
                <Box
                    sx={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0, 0, 0, 0.34)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 9999
                    }}
                >
                    <Loader color="white" />
                </Box>
            )}
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
                            <TextField
                                variant="outlined"
                                placeholder="Search"
                                value={filter}
                                onChange={(e) => updateParams({ filter: e.target.value })}
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
                                    onChange={(nextRange) => {
                                        setRangeSos(nextRange);
                                        updateParams({
                                            startDate: nextRange[0].startDate.toISOString(),
                                            endDate: nextRange[0].endDate.toISOString(),
                                            page: 1,
                                        });
                                    }}
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
                                    sx={{ height: '40px',width:'187px', borderRadius: '8px',border:"1px solid #367BE0" }}
                                    onClick={() => nav(`/home/capture-reports`)}
                                >
                                    View Incident Reports 
                                </Button>       
                                <Button
                                    sx={{ height: '40px', width: '100px', borderRadius: '8px',border:"1px solid #367BE0" }}
                                    onClick={() => {
                                        updateParams({ filter: "", activeLimit: 20, activePage: 1, selectedNotification: "all" });
                                        setRangeSos([
                                            {
                                                startDate: startOfYear(new Date()),
                                                endDate: new Date(),
                                                key: 'selection'
                                            }
                                        ]);

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
                                                id="sosNumber"
                                                active={sortBy2 === 'sosNumber'}
                                                direction={sortOrder2}
                                                onClick={changeSortOrder2}
                                                IconComponent={() => <img src={sortBy2 === 'sosNumber' ? sortOrder2 === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} alt="" />}
                                            >
                                                SOS ID
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563'}}>
                                            <TableSortLabel
                                                id="username"
                                                active={sortBy2 === 'username'}
                                                direction={sortOrder2}
                                                onClick={changeSortOrder2}
                                                IconComponent={() => <img src={sortBy2 === 'username' ? sortOrder2 === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} alt="" />}
                                            >
                                                User
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                            <TableSortLabel
                                                id="company"
                                                active={sortBy2 === 'company'}
                                                direction={sortOrder2}
                                                onClick={changeSortOrder2}
                                                IconComponent={() => <img src={sortBy2 === 'company' ? sortOrder2 === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} alt="" />}
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
                                                IconComponent={() => <img src={sortBy2 === 'address' ? sortOrder2 === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} alt="" />}
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
                                                IconComponent={() => <img src={sortBy2 === 'req_reach' ? sortOrder2 === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} alt="" />}
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
                                                IconComponent={() => <img src={sortBy2 === 'req_accept' ? sortOrder2 === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} alt="" />}
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
                                                IconComponent={() => <img src={sortBy2 === 'type' ? sortOrder2 === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} alt="" />}
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
                                                IconComponent={() => <img src={sortBy2 === 'createdAt' ? sortOrder2 === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} alt="" />}
                                            >
                                                Time
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Status</TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Trip Type</TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', borderTopRightRadius: '10px', color: '#4B5563' }}>Location</TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {activeSos.isFetching ?
                                        <TableRow>
                                            <TableCell sx={{ color: '#4B5563', borderBottom: 'none' }} colSpan={10} align="center">
                                                <Loader />
                                            </TableCell>
                                        </TableRow>
                                        : (paginatedActiveUserList?.length > 0 ?
                                            paginatedActiveUserList?.map((user) => (
                                                <TableRow key={user._id}>
                                                    <TableCell sx={{ color: 'var(--Blue)' }}>
                                                        {user?.sosNumber}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        {
                                                            user?.sosType === 'ARMED_SOS' ? (
                                                                <Stack direction="row" alignItems="center" gap={1}>
                                                                    <Avatar
                                                                        src={nouser} // No selfie field mentioned for armedUserId, using default or check armedUserId.selfieImage?
                                                                        alt="User"
                                                                    />
                                                                    {user?.user?.fullName}
                                                                </Stack>
                                                            ) : (
                                                                user?.role === "driver" ? (
                                                                    // <Link to={`/home/total-drivers/driver-information/${user?.user_id?._id || user?.user_id}`} className="link">
                                                                        <Stack direction="row" sx={{"cursor":'pointer'}} alignItems="center" gap={1} onClick={()=>handleView(`/home/total-drivers/driver-information/${user?.user_id?._id || user?.user_id}`)}>
                                                                            <Avatar
                                                                                src={getImageLink(user?.user_id?.selfieImage)}
                                                                                sx={{ '&:hover': { textDecoration: 'none' } }}
                                                                                alt="User"
                                                                            />

                                                                            {user?.user?.first_name || user?.user_id?.first_name} {user?.user?.last_name || user?.user_id?.last_name}
                                                                        </Stack>
                                                                    // </Link>
                                                                ) : (
                                                                    // <Link to={`/home/total-users/user-information/${user?.user_id?._id || user?.user_id}`} className="link">
                                                                        <Stack direction="row" sx={{"cursor":'pointer'}} alignItems="center" gap={1} onClick={()=>handleView(`/home/total-users/user-information/${user?.user_id?._id || user?.user_id}`)}>
                                                                            <Avatar
                                                                                src={getImageLink(user?.user_id?.selfieImage)}
                                                                                alt="User"
                                                                            />

                                                                            {user?.user?.first_name || user?.user_id?.first_name} {user?.user?.last_name || user?.user_id?.last_name}
                                                                        </Stack>
                                                                    // </Link>
                                                                )
                                                            )
                                                        }
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        {user?.sosType === 'ARMED_SOS' ? "Armed Response" : (user?.user?.company_name || user?.user_id?.company_name || "-")}
                                                    </TableCell>
                                                    <TableCell sx={{
                                                        color: '#4B5563',
                                                    }} >
                                                        {user?.sosType === 'ARMED_SOS' ? (
                                                            <Box sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'space-between',
                                                            }}>
                                                                {`${user?.armedLocationId?.houseNumber || ''} ${user?.armedLocationId?.street || ''}, ${user?.armedLocationId?.suburb || ''}`}
                                                                <Box sx={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'space-between',
                                                                }}>

                                                                    <Tooltip title={copied ? 'Copied!' : 'Copy'} placement="top">
                                                                        <IconButton
                                                                            onClick={() => {
                                                                                // setTextToCopy(`${user?.armedLocationId?.houseNumber || ''} ${user?.armedLocationId?.street || ''}, ${user?.armedLocationId?.suburb || ''}`);
                                                                                handleCopy(`${user?.armedLocationId?.houseNumber || ''} ${user?.armedLocationId?.street || ''}, ${user?.armedLocationId?.suburb || ''}`);
                                                                            }}
                                                                            sx={copyButtonStyles}
                                                                            aria-label="copy address"
                                                                        >
                                                                            <ContentCopyIcon fontSize="medium" className="copy-btn" />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                    <Typography sx={{ fontSize: "25px" }}>
                                                                        <Tooltip title={copied ? 'Copied!' : `Copy Coordinates`} placement="top">
                                                                            <IconButton
                                                                                onClick={() => {
                                                                                    // setTextToCopy(`${user?.lat},${user?.long}`);
                                                                                    handleCopy(`${user?.lat},${user?.long}`);
                                                                                }}
                                                                                sx={copyButtonStyles}
                                                                                aria-label="copy coordinate"
                                                                            >
                                                                                🌍
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                    </Typography>
                                                                </Box>
                                                            </Box>
                                                        ) : (
                                                            user?.address ?
                                                                <Box sx={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'space-between',
                                                                }}>
                                                                    {user?.address}
                                                                        <Box sx={{
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'space-between'
                                                                        }}>
                                                                            <Tooltip title={copied ? 'Copied!' : 'Copy'} placement="top">
                                                                                <IconButton
                                                                                    onClick={() => {
                                                                                        // setTextToCopy(`${user?.address} View:https://api.thibaingozi.com/api/?sosId=${user?.deepLinks?.[0]?._id}`);
                                                                                        handleCopy(`${user?.address} View:https://api.thibaingozi.com/api/?sosId=${user?.deepLinks?.[0]?._id}`);
                                                                                    }}
                                                                                    sx={copyButtonStyles}
                                                                                    aria-label="copy address"
                                                                                >
                                                                                    <ContentCopyIcon fontSize="medium" className="copy-btn" />
                                                                                </IconButton>
                                                                            </Tooltip>
                                                                            <Typography sx={{  fontSize: "25px" }}>
                                                                                <Tooltip title={copied ? 'Copied!' : `Copy Coordinates`} placement="top">
                                                                                    <IconButton
                                                                                        onClick={() => {
                                                                                            // setTextToCopy(`${user?.lat},${user?.long}`);
                                                                                            handleCopy(`${user?.lat},${user?.long}`);
                                                                                        }}
                                                                                        sx={copyButtonStyles}
                                                                                        aria-label="copy coordinate"
                                                                                    >
                                                                                        🌍
                                                                                    </IconButton>
                                                                                </Tooltip>
                                                                            </Typography>
                                                                        </Box>
                                                                </Box>
                                                                :
                                                                "-"
                                                        )}
                                                    </TableCell>
                                                    <TableCell sx={{ color: 'var(--orange)' }}>
                                                        <Link
                                                            onClick={() =>  handleView(`/home/request-reached-users/${user?._id}`)}
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
                                                            onClick={() =>  handleView(`/home/request-accepted-users/${user?._id}`)}
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
                                                        {user?.createdAt ? format(new Date(user.createdAt), "HH:mm:ss - dd/MM/yyyy") : "-"}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563', minWidth: '110px' }}>
                                                        {(!(user?.sosType === 'ARMED_SOS' ? user?.armedSosstatus : user?.help_received)) &&
                                                            <div className={updatingId === user._id ? "" : "select-container"}>
                                                                {updatingId === user._id ? (
                                                                    <Box display="flex" justifyContent="center">
                                                                        {/* Use custom loader matching the theme */}
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
                                                    <TableCell sx={{ color: user?.type?.bgColor ?? '#4B5563' }}>
                                                        {user?.deepLinks?.notification_data?.trip?.trip_type_id?.tripTypeName || "-"}
                                                    </TableCell>
                                                    <TableCell >
                                                        <Box align="center" sx={{ display: 'flex', flexDirection: 'row', alignItems: "center", gap: 2 }}>
                                                            <Tooltip title="View" arrow placement="top">
                                                                <IconButton onClick={() =>  handleView(`/home/hotspot/location?locationId=${user?._id}&lat=${user?.lat}&long=${user?.long}&end_lat=${userinfo?.data?.data?.user?.current_lat}&end_long=${userinfo?.data?.data?.user?.current_long}&req_reach=${user?.req_reach}&req_accept=${user?.req_accept}`)}>
                                                                    <img src={ViewBtn} alt="view button" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            {user?.type?.type === "linked_sos" && normalizeOtherUsers(user?.otherUser).length > 0 && (
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
                                                                            padding: "5px 14px",
                                                                            whiteSpace: "nowrap",
                                                                            minWidth: "auto",
                                                                            "&:hover": { backgroundColor: "#1864c7" },
                                                                        }}
                                                                        onClick={() => openOtherUsersModal(user?.otherUser, 'ACTIVE',user?._id)}
                                                                    >
                                                                        Other Users
                                                                    </Button>
                                                                </Tooltip>
                                                            )}
                                                            <Tooltip title="View Report" arrow placement="top">
                                                                <IconButton data-id={user?._id} onClick={(e) => openCaptureReportModal(user?._id, e,'ACTIVE',user?.sosNumber)}>
                                                                    <img src={fileBtn} alt="button" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                    </TableCell>
                                                    {/* {user?.type?.type === "linked_sos" ? (
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
                                                    ) : <TableCell sx={{ textAlign: 'center' }}>-</TableCell>} */}
                                                </TableRow>
                                            ))
                                            :
                                            <TableRow>
                                                <TableCell sx={{ color: '#4B5563', borderBottom: 'none' }} colSpan={10} align="center">
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
                                            updateParams({ activeLimit: Number(e.target.value), activePage: 1 });
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
                                        onClick={() => updateParams({ activePage: activePage - 1 })}
                                    >
                                        <NavigateBeforeIcon fontSize="small" sx={{
                                            color: activePage === 1 ? '#BDBDBD !important' : '#1976d2 !important'
                                        }} />
                                    </IconButton>
                                    <IconButton
                                        disabled={activePage === totalActivePages}
                                        onClick={() => updateParams({ activePage: activePage + 1 })}
                                    >
                                        <NavigateNextIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            </Grid>
                        </Grid>}
                    </Box>
                </Paper>
                
                {/* Active Crime Report */}
                <Paper elevation={1} sx={{ backgroundColor: "rgb(253, 253, 253)", mb: 4, padding: 2, borderRadius: '10px' }}>
                    <Grid container justifyContent="space-between" alignItems="center" mb={2}>
                        <Grid size={{ xs: 12, lg: 3 }} sx={{ display: 'flex', flexDirection: 'row', gap: 2, mb: { xs: 1, md: 0 }, alignItems: 'center' }}>
                            <Typography variant="h6" fontWeight={590}>Active Crime Report</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, lg: 9 }} sx={{ display: 'flex', justifyContent: 'flex-end', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mt: { xs: 2, lg: 0 } }}>
                            <TextField
                                variant="outlined"
                                placeholder="Search"
                                value={filter}
                                onChange={(e) => updateParamsCrimeActive({ filterCrimeActive: e.target.value })}
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
                                    value={rangeCrimeActive}
                                    onChange={(nextRange) => {
                                        setRangeCrimeActive(nextRange);
                                        updateParamsCrimeActive({
                                            startDateCrimeActive: nextRange[0].startDate.toISOString(),
                                            endDateCrimeActive: nextRange[0].endDate.toISOString(),
                                            currentPageCrimeActive: 1,
                                        });
                                    }}
                                    icon={calender}
                                />
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
                                                id="crime_report_number"
                                                active={sortByCrimeActive === 'crime_report_number'}
                                                direction={sortOrderCrimeActive}
                                                onClick={changeSortOrderCrimeActive}
                                                IconComponent={() => <img src={sortByCrimeActive === 'crime_report_number' ? sortOrderCrimeActive === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                            >Crime ID</TableSortLabel>
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                            <TableSortLabel
                                                id="address"
                                                active={sortByCrimeActive === 'address'}
                                                direction={sortOrderCrimeActive}
                                                onClick={changeSortOrderCrimeActive}
                                                IconComponent={() => <img src={sortByCrimeActive === 'address' ? sortOrderCrimeActive === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                            >Location</TableSortLabel>
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                            <TableSortLabel
                                                id="description"
                                                active={sortByCrimeActive === 'description'}
                                                direction={sortOrderCrimeActive}
                                                onClick={changeSortOrderCrimeActive}
                                                IconComponent={() => <img src={sortByCrimeActive === 'description' ? sortOrderCrimeActive === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                            >Short Description</TableSortLabel>
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                            <TableSortLabel
                                                id="first_name"
                                                active={sortByCrimeActive === 'first_name'}
                                                direction={sortOrderCrimeActive}
                                                onClick={changeSortOrderCrimeActive}
                                                IconComponent={() => <img src={sortByCrimeActive === 'first_name' ? sortOrderCrimeActive === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                            >Reporter</TableSortLabel>
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                            <TableSortLabel
                                                id="requestReached"
                                                active={sortByCrimeActive === 'requestReached'}
                                                direction={sortOrderCrimeActive}
                                                onClick={changeSortOrderCrimeActive}
                                                IconComponent={() => <img src={sortByCrimeActive === 'requestReached' ? sortOrderCrimeActive === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                            >Request Reached</TableSortLabel>
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                            <TableSortLabel
                                                id="requestAccepted"
                                                active={sortByCrimeActive === 'requestAccepted'}
                                                direction={sortOrderCrimeActive}
                                                onClick={changeSortOrderCrimeActive}
                                                IconComponent={() => <img src={sortByCrimeActive === 'requestAccepted' ? sortOrderCrimeActive === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                            >Request Accepted</TableSortLabel>
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                            Images
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                            <TableSortLabel
                                                id="createdAt"
                                                active={sortBy === 'createdAt'}
                                                direction={sortOrderCrimeActive}
                                                onClick={changeSortOrderCrimeActive}
                                                IconComponent={() => <img src={sortBy === 'createdAt' ? sortOrderCrimeActive === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                            >Date Reported</TableSortLabel>
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                            <TableSortLabel
                                                id="report_status"
                                                active={sortByCrimeActive === 'report_status'}
                                                direction={sortOrderCrimeActive}
                                                onClick={changeSortOrderCrimeActive}
                                                IconComponent={() => <img src={sortByCrimeActive === 'report_status' ? sortOrderCrimeActive === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                            >Status</TableSortLabel>
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                            Sighting Reported
                                        </TableCell>
                                        <TableCell align="center" sx={{ backgroundColor: '#F9FAFB', borderTopRightRadius: '10px', color: '#4B5563' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {crimeActiveList.isFetching ?
                                        (<TableRow>
                                            <TableCell sx={{ color: '#4B5563', borderBottom: 'none' }} colSpan={10} align="center">
                                                <Loader />
                                            </TableCell>
                                        </TableRow>)
                                        : (crimeActiveList.data?.data.crimeReportData?.length > 0 ?
                                            crimeActiveList.data?.data.crimeReportData.map((report) => (

                                                <TableRow key={report._id}>
                                                    <TableCell sx={{ color: 'var(--Blue)' }}>
                                                        {report.crime_report_number}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>

                                                        {report.address || "-"}

                                                    </TableCell>
                                                    <TableCell sx={{ color: 'black' }}>

                                                        {shortText(report.description)}

                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        {/* <Link to={report.user?.role === "driver" ? `/home/total-drivers/driver-information/${report.user_id}` : `/home/total-users/user-information/${report.user_id}`} className="link2"> */}
                                                            <Stack direction="row" gap={1}  sx={{"cursor":'pointer'}} alignItems="center" onClick={()=>handleView(report.user?.role === "driver" ? `/home/total-drivers/driver-information/${report.user_id}` : `/home/total-users/user-information/${report.user_id}`)}>
                                                                <Avatar
                                                                    src={getImageLink(report.user?.selfieImage)}
                                                                    sx={{ '&:hover': { textDecoration: 'none' } }}
                                                                    alt="User"
                                                                />
                                                                {report.user?.first_name + ' ' + report.user?.last_name || "-"}
                                                            </Stack>
                                                        {/* </Link> */}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#F97316', textAlign: 'center' }}>
                                                        <Link style={{
                                                            textDecoration: 'none',
                                                            color: 'var(--orange)',
                                                            cursor: 'pointer',
                                                        }}  onClick={()=>handleView(`/home/crime-reports/request-reached-users/${report?._id}`)}>{report?.requestReached || "0"}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#01C971', textAlign: 'center' }}>
                                                        <Link style={{
                                                            textDecoration: 'none',
                                                            color: '#01C971',
                                                            cursor: 'pointer',
                                                        }} onClick={()=>handleView(`/home/crime-reports/request-reached-users/${report?._id}`)} state={{ isAccepted: true }}
                                                        >
                                                            {report?.requestAccepted || "0"}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        <Stack direction="row" alignItems="center" spacing={1}>
                                                            {report.evidence_image.slice(0, 2).map((item, index) => (
                                                                <Box
                                                                    key={index}
                                                                    component="img"
                                                                    src={item}
                                                                    onClick={() => handleImageClick(item, `evidence-${index + 1}`)}
                                                                    alt={`evidence-${index}`}
                                                                    sx={{
                                                                        width: "32px",
                                                                        height: "32px",
                                                                        objectFit: 'cover',
                                                                        borderRadius: '6px',
                                                                        cursor: 'pointer',
                                                                        border: '1px solid #E5E7EB'
                                                                    }}
                                                                />
                                                            ))}
                                                            {report.evidence_image.length > 2 && (
                                                                <Box
                                                                    sx={{
                                                                        width: 32,
                                                                        height: 32,
                                                                        backgroundColor: '#D1D5DB',
                                                                        borderRadius: '6px',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        fontSize: '14px',
                                                                        color: '#374151',
                                                                        cursor: 'pointer',
                                                                        fontWeight: 500
                                                                    }}
                                                                    onClick={() => handleView(`/home/crime-reports/crime-report/${report._id}`)}
                                                                >
                                                                    +{report.evidence_image.length - 2}
                                                                </Box>
                                                            )}
                                                        </Stack>
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        {moment(report.createdAt).isSame(moment(), "day")
                                                            ? `Today, ${moment(report.createdAt).format("hh:mm A")}`
                                                            : moment(report.createdAt).format("HH:mm:ss - DD/MM/YYYY")}
                                                    </TableCell>

                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        <Chip
                                                            label={report.report_status}
                                                            sx={{
                                                                backgroundColor:
                                                                    report.report_status === 'With SAPS' ? '#DCFCE7' :
                                                                        report.report_status === 'reviewing' ? '#FEF9C3' :
                                                                            report.report_status == 'reviewed' ? '#DBEAFE' :
                                                                                report.report_status == 'pending' ? '#F3F4F6' :
                                                                                    '#FEF9C3',
                                                                '& .MuiChip-label': {
                                                                    textTransform: 'capitalize',
                                                                    color: report.report_status === 'With SAPS' ? 'green' :
                                                                        report.report_status === 'reviewing' ? '#854D0E' :
                                                                            report.report_status == 'reviewed' ? '#1E40AF' :
                                                                                report.report_status == 'pending' ? '#1F2937' :

                                                                                    'black',
                                                                }
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#01C971', textAlign: 'center' }}>
                                                        <Link style={{
                                                            textDecoration: 'none',
                                                            color: '#01C971',
                                                            cursor: 'pointer',
                                                        }} onClick={() => handleView(`/home/total-suspect?linked_case_type=crimereports&linked_case_type_id=${report?._id}`)} state={{ isAccepted: true }}>
                                                            {report.suspect_reported_users}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell >
                                                        <Box align="center" sx={{ display: 'flex', flexDirection: 'row' }}>
                                                            <Tooltip title="View" arrow placement="top">
                                                                <IconButton onClick={() => handleView(`/home/crime-reports/crime-report/${report._id}`)}>
                                                                    <img src={ViewBtn} alt="flagged button" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>


                                                    </TableCell>
                                                </TableRow>
                                            )) : (
                                                <TableRow>
                                                    <TableCell colSpan={10} align="center">
                                                        <Typography align="center" color="text.secondary" sx={{ mt: 2 }}>
                                                            No data found
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                    }
                                </TableBody>
                            </Table>

                        </TableContainer>

                        {!crimeActiveList.isFetching && crimeActiveList.data?.data.crimeReportData.length > 0 &&
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
                                        value={rowsPerPageCrimeActive}
                                        onChange={(e) => {
                                            updateParamsCrimeActive({rowsPerPageCrimeActive:Number(e.target.value),currentPage:1});
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
                                        {currentPageCrimeActive} / {totalPagesCrimeActive}
                                    </Typography>
                                    <IconButton
                                        disabled={currentPageCrimeActive === 1}
                                        onClick={() => updateParamsCrimeActive({currentPageCrimeActive:currentPageCrimeActive - 1})}
                                    >
                                        <NavigateBeforeIcon fontSize="small" sx={{
                                            color: currentPageCrimeActive === 1 ? '#BDBDBD' : '#1976d2'
                                        }} />
                                    </IconButton>
                                    <IconButton
                                        disabled={currentPageCrimeActive === totalPagesCrimeActive}
                                        onClick={() => updateParamsCrimeActive({currentPageCrimeActive:currentPageCrimeActive + 1})}
                                    >
                                        <NavigateNextIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            </Grid>
                        </Grid>}
                    </Box>
                </Paper>

                <HotspotSection />


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
                                onChange={(e) => updateRecentParams({ recentFilter: e.target.value })}
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
                                    onChange={(nextRange) => {
                                        setRange(nextRange);
                                        updateRecentParams({
                                            startDate: nextRange[0].startDate.toISOString(),
                                            endDate: nextRange[0].endDate.toISOString(),
                                            page: 1,
                                        });
                                    }}
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
                                    sx={{ height: '40px',width:'187px', borderRadius: '8px',border:"1px solid #367BE0" }}
                                    onClick={() => nav(`/home/capture-reports`)}
                                >
                                    View Incident Reports 
                                </Button> 
                                <Button
                                    sx={{ height: '40px', width: '100px', borderRadius: '8px',border:"1px solid #367BE0" }}
                                    onClick={() => {
                                        updateRecentParams({ recentFilter: "", recentLimit: 20, recentPage: 1, recentNotification: 'all' });
                                        setRange([
                                            {
                                                startDate: startOfYear(new Date()),
                                                endDate: new Date(),
                                                key: "selection",
                                            },
                                        ]);
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
                                                id="sosNumber"
                                                active={sortBy2 === 'sosNumber'}
                                                direction={sortOrder2}
                                                onClick={changeSortOrder2}
                                                IconComponent={() => <img src={sortBy2 === 'sosNumber' ? sortOrder2 === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} alt="" />}
                                            >
                                                SOS ID
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563'}}>
                                            <TableSortLabel
                                                id="username"
                                                active={sortBy === 'username'}
                                                direction={sortOrder}
                                                onClick={changeSortOrder}
                                                IconComponent={() => <img src={sortBy === 'username' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} alt="" />}
                                            >
                                                User Name
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                            <TableSortLabel
                                                id="company"
                                                active={sortBy === 'company'}
                                                direction={sortOrder}
                                                onClick={changeSortOrder}
                                                IconComponent={() => <img src={sortBy === 'company' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} alt="" />}
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
                                                IconComponent={() => <img src={sortBy === 'address' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} alt="" />}
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
                                                IconComponent={() => <img src={sortBy === 'req_reach' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} alt="" />}
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
                                                IconComponent={() => <img src={sortBy === 'req_accept' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} alt="" />}
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
                                                IconComponent={() => <img src={sortBy === 'createdAt' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} alt="" />}
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
                                                IconComponent={() => <img src={sortBy === 'updatedAt' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} alt="" />}
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
                                                IconComponent={() => <img src={sortBy === 'type' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} alt="" />}
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
                                    {isFetching ?
                                        <TableRow>
                                            <TableCell sx={{ color: '#4B5563', borderBottom: 'none' }} colSpan={12} align="center">
                                                <Loader />
                                            </TableCell>
                                        </TableRow>
                                        : (recentSosItems?.length > 0 ?
                                            recentSosItems?.map((row) => (
                                                <TableRow key={row?._id}>
                                                    <TableCell sx={{ color: 'var(--Blue)' }}>
                                                        {row?.sosNumber}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        {
                                                            row.user?.role === "driver" ? (
                                                                // <Link to={`/home/total-drivers/driver-information/${row.user._id}`} className="link">
                                                                    <Stack direction="row" sx={{"cursor":'pointer'}} alignItems="center" gap={1} onClick={()=>handleView(`/home/total-drivers/driver-information/${row.user._id}`)}>

                                                                        <Avatar
                                                                            src={
                                                                                row?.user
                                                                                    ?.selfieImage ||
                                                                                nouser
                                                                            }
                                                                            alt="User"
                                                                        />

                                                                        {row?.user?.first_name} {row?.user?.last_name}
                                                                    </Stack>

                                                                // </Link>
                                                            ) : (
                                                                // <Link to={`/home/total-users/user-information/${row?.user?._id}`} className="link">
                                                                    <Stack direction="row" sx={{"cursor":'pointer'}} alignItems="center" gap={1} onClick={()=>handleView(`/home/total-users/user-information/${row?.user?._id}`)}>

                                                                        <Avatar
                                                                            src={
                                                                                row?.user
                                                                                    ?.selfieImage ||
                                                                                nouser
                                                                            }
                                                                            alt="User"
                                                                        />

                                                                        {row?.user?.first_name} {row?.user?.last_name}
                                                                    </Stack>
                                                                // </Link>
                                                            )
                                                        }
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        {row?.user?.company_name || row?.company?.company_name || "-"}
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

                                                        <Box sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between'
                                                        }}>
                                                            <Tooltip title={copied ? 'Copied!' : 'Copy'} placement="top">
                                                                <IconButton
                                                                    onClick={() => {
                                                                        // setTextToCopy(`${row?.address} View:https://api.thibaingozi.com/api/?sosId=${row?.deepLinks._id}`);
                                                                        handleCopy(`${row?.address} View:https://api.thibaingozi.com/api/?sosId=${row?.deepLinks._id}`);
                                                                    }}
                                                                    sx={copyButtonStyles}
                                                                    aria-label="copy address"
                                                                >
                                                                    <ContentCopyIcon fontSize="medium" className="copy-btn" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Typography sx={{ fontSize: "25px" }}>
                                                                <Tooltip title={copied ? 'Copied!' : `Copy Coordinates`} placement="top">
                                                                    <IconButton
                                                                        onClick={() => {
                                                                            // setTextToCopy(`${row?.lat},${row?.long}`);
                                                                            handleCopy(`${row?.lat},${row?.long}`);
                                                                        }}
                                                                        sx={copyButtonStyles}
                                                                        aria-label="copy coordinate"
                                                                    >
                                                                        🌍
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </Typography>
                                                        </Box>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell sx={{ color: 'var(--orange)' }}>
                                                        <Link
                                                            onClick={() =>  handleView(`/home/request-reached-users/${row?._id}`)}
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
                                                            onClick={() =>  handleView(`/home/request-accepted-users/${row?._id}`)}
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
                                                        {row?.help_received === "help_received" ? "Help Received" : row?.help_received === 'cancel' ? "Cancel" : "-"}
                                                    </TableCell>
                                                    <TableCell sx={{ color: row?.type?.bgColor ?? '#4B5563' }}>
                                                        {row?.deepLinks?.notification_data?.trip?.trip_type_id?.tripTypeName || "-"}
                                                    </TableCell>
                                                    <TableCell >
                                                        <Box align="center" sx={{ display: 'flex', flexDirection: 'row' }}>
                                                            <Tooltip title="View" arrow placement="top">
                                                                <IconButton onClick={() => handleView(`/home/hotspot/location?locationId=${row?._id}&lat=${row?.lat}&long=${row?.long}&end_lat=${userinfo?.data?.data?.user?.current_lat}&end_long=${userinfo?.data?.data?.user?.current_long}&req_reach=${row?.req_reach}&req_accept=${row?.req_accept}`)}>
                                                                    <img src={ViewBtn} alt="view button" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="View Report" arrow placement="top">
                                                                {/* <IconButton onClick={() => nav(`/home/capture-reports?location_id=${row?._id}`)}> */}
                                                                <IconButton data-id={row?._id} onClick={(e) => openCaptureReportModal(row?._id, e,"RECENT",row?.sosNumber)}>
                                                                    <img src={fileBtn} alt="button" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                    </TableCell>
                                                    {row?.type?.type === "linked_sos" ? (
                                                        <TableCell>
                                                            <Box align="center" sx={{ display: "flex", justifyContent: "center" }}>
                                                                {normalizeOtherUsers(row?.otherUser).length > 0 ? (
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
                                                                            onClick={() => openOtherUsersModal(row?.otherUser, "RECENT",row?._Id)}
                                                                        >
                                                                            Other Users
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
                                                <TableCell sx={{ color: '#4B5563', borderBottom: 'none' }} colSpan={12} align="center">
                                                    <Typography align="center" color="text.secondary" sx={{ mt: 2 }}>
                                                        No data found
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>)
                                    }
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {recentSosItems?.length > 0 && !isFetching && <Grid container sx={{ px: { xs: 0, sm: 1 } }} justifyContent="space-between" alignItems="center" mt={2}>
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
                                            updateRecentParams({ recentLimit: Number(e.target.value), recentPage: 1 });
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
                                        onClick={() => updateRecentParams({ recentPage: recentPage - 1 })}
                                    >
                                        <NavigateBeforeIcon fontSize="small" sx={{
                                            color: recentPage === 1 ? '#BDBDBD !important' : '#1976d2 !important'
                                        }} />
                                    </IconButton>
                                    <IconButton
                                        disabled={recentPage === totalRecentPages}
                                        onClick={() => updateRecentParams({ recentPage: recentPage + 1 })}
                                    >
                                        <NavigateNextIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            </Grid>
                        </Grid>}
                    </Box>
                </Paper>

                {/* Recently Crime Report */}
                 <Paper elevation={1} sx={{ backgroundColor: "rgb(253, 253, 253)", mb: 4, padding: 2, borderRadius: '10px' }}>
                    <Grid container justifyContent="space-between" alignItems="center" mb={2}>
                        <Grid size={{ xs: 12, lg: 3 }} sx={{ display: 'flex', flexDirection: 'row', gap: 2, mb: { xs: 1, md: 0 }, alignItems: 'center' }}>
                            <Typography variant="h6" fontWeight={590}>Recently Closed Crime Report</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, lg: 9 }} sx={{ display: 'flex', justifyContent: 'flex-end', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mt: { xs: 2, lg: 0 } }}>
                            <TextField
                                variant="outlined"
                                placeholder="Search"
                                value={filter}
                                onChange={(e) => updateParamsCrimeRecent({ filterCrimeRecent: e.target.value })}
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
                                    value={rangeCrimeRecent}
                                    onChange={(nextRange) => {
                                        setRangeCrimeRecent(nextRange);
                                        updateParamsCrimeRecent({
                                            startDateCrimeRecent: nextRange[0].startDate.toISOString(),
                                            endDateCrimeRecent: nextRange[0].endDate.toISOString(),
                                            currentPageCrimeRecent: 1,
                                        });
                                    }}
                                    icon={calender}
                                />
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
                                                id="crime_report_number"
                                                active={sortByCrimeRecent === 'crime_report_number'}
                                                direction={sortOrderCrimeRecent}
                                                onClick={changeSortOrderCrimeRecent}
                                                IconComponent={() => <img src={sortByCrimeRecent === 'crime_report_number' ? sortOrderCrimeRecent === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                            >Crime ID</TableSortLabel>
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                            <TableSortLabel
                                                id="address"
                                                active={sortByCrimeRecent === 'address'}
                                                direction={sortOrderCrimeRecent}
                                                onClick={changeSortOrderCrimeRecent}
                                                IconComponent={() => <img src={sortByCrimeRecent === 'address' ? sortOrderCrimeRecent === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                            >Location</TableSortLabel>
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                            <TableSortLabel
                                                id="description"
                                                active={sortByCrimeRecent === 'description'}
                                                direction={sortOrderCrimeRecent}
                                                onClick={changeSortOrderCrimeRecent}
                                                IconComponent={() => <img src={sortByCrimeRecent === 'description' ? sortOrderCrimeRecent === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                            >Short Description</TableSortLabel>
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                            <TableSortLabel
                                                id="first_name"
                                                active={sortByCrimeRecent === 'first_name'}
                                                direction={sortOrderCrimeRecent}
                                                onClick={changeSortOrderCrimeRecent}
                                                IconComponent={() => <img src={sortByCrimeRecent === 'first_name' ? sortOrderCrimeRecent === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                            >Reporter</TableSortLabel>
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                            <TableSortLabel
                                                id="requestReached"
                                                active={sortByCrimeRecent === 'requestReached'}
                                                direction={sortOrderCrimeRecent}
                                                onClick={changeSortOrderCrimeRecent}
                                                IconComponent={() => <img src={sortByCrimeRecent === 'requestReached' ? sortOrderCrimeRecent === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                            >Request Reached</TableSortLabel>
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                            <TableSortLabel
                                                id="requestAccepted"
                                                active={sortByCrimeRecent === 'requestAccepted'}
                                                direction={sortOrderCrimeRecent}
                                                onClick={changeSortOrderCrimeRecent}
                                                IconComponent={() => <img src={sortByCrimeRecent === 'requestAccepted' ? sortOrderCrimeRecent === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                            >Request Accepted</TableSortLabel>
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                            Images
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                            <TableSortLabel
                                                id="createdAt"
                                                active={sortByCrimeRecent === 'createdAt'}
                                                direction={sortOrderCrimeRecent}
                                                onClick={changeSortOrderCrimeRecent}
                                                IconComponent={() => <img src={sortByCrimeRecent === 'createdAt' ? sortOrderCrimeRecent === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                            >Date Reported</TableSortLabel>
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                            <TableSortLabel
                                                id="report_status"
                                                active={sortByCrimeRecent === 'report_status'}
                                                direction={sortOrderCrimeRecent}
                                                onClick={changeSortOrderCrimeRecent}
                                                IconComponent={() => <img src={sortByCrimeRecent === 'report_status' ? sortOrderCrimeRecent === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                            >Status</TableSortLabel>
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                            Sighting Reported
                                        </TableCell>
                                        <TableCell align="center" sx={{ backgroundColor: '#F9FAFB', borderTopRightRadius: '10px', color: '#4B5563' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {crimeRecentList.isFetching ?
                                        (<TableRow>
                                            <TableCell sx={{ color: '#4B5563', borderBottom: 'none' }} colSpan={10} align="center">
                                                <Loader />
                                            </TableCell>
                                        </TableRow>)
                                        : (crimeRecentList.data?.data.crimeReportData?.length > 0 ?
                                            crimeRecentList.data?.data.crimeReportData.map((report) => (

                                                <TableRow key={report._id}>
                                                    <TableCell sx={{ color: 'var(--Blue)' }}>
                                                        {report.crime_report_number}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>

                                                        {report.address || "-"}

                                                    </TableCell>
                                                    <TableCell sx={{ color: 'black' }}>

                                                        {shortText(report.description)}

                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        {/* <Link to={report.user?.role === "driver" ? `/home/total-drivers/driver-information/${report.user_id}` : `/home/total-users/user-information/${report.user_id}`} className="link2"> */}
                                                            <Stack direction="row" gap={1}  sx={{"cursor":'pointer'}} alignItems="center" onClick={()=>handleView(report.user?.role === "driver" ? `/home/total-drivers/driver-information/${report.user_id}` : `/home/total-users/user-information/${report.user_id}`)}>
                                                                <Avatar
                                                                    src={getImageLink(report.user?.selfieImage)}
                                                                    sx={{ '&:hover': { textDecoration: 'none' } }}
                                                                    alt="User"
                                                                />
                                                                {report.user?.first_name + ' ' + report.user?.last_name || "-"}
                                                            </Stack>
                                                        {/* </Link> */}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#F97316', textAlign: 'center' }}>
                                                        <Link style={{
                                                            textDecoration: 'none',
                                                            color: 'var(--orange)',
                                                            cursor: 'pointer',
                                                        }}  onClick={()=>handleView(`/home/crime-reports/request-reached-users/${report?._id}`)}>{report?.requestReached || "0"}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#01C971', textAlign: 'center' }}>
                                                        <Link style={{
                                                            textDecoration: 'none',
                                                            color: '#01C971',
                                                            cursor: 'pointer',
                                                        }}  onClick={()=>handleView(`/home/crime-reports/request-reached-users/${report?._id}`)} state={{ isAccepted: true }}
                                                        >
                                                            {report?.requestAccepted || "0"}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        <Stack direction="row" alignItems="center" spacing={1}>
                                                            {report.evidence_image.slice(0, 2).map((item, index) => (
                                                                <Box
                                                                    key={index}
                                                                    component="img"
                                                                    src={item}
                                                                    onClick={() => handleImageClick(item, `evidence-${index + 1}`)}
                                                                    alt={`evidence-${index}`}
                                                                    sx={{
                                                                        width: "32px",
                                                                        height: "32px",
                                                                        objectFit: 'cover',
                                                                        borderRadius: '6px',
                                                                        cursor: 'pointer',
                                                                        border: '1px solid #E5E7EB'
                                                                    }}
                                                                />
                                                            ))}
                                                            {report.evidence_image.length > 2 && (
                                                                <Box
                                                                    sx={{
                                                                        width: 32,
                                                                        height: 32,
                                                                        backgroundColor: '#D1D5DB',
                                                                        borderRadius: '6px',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        fontSize: '14px',
                                                                        color: '#374151',
                                                                        cursor: 'pointer',
                                                                        fontWeight: 500
                                                                    }}
                                                                    onClick={() => handleView(`/home/crime-reports/crime-report/${report._id}`)}
                                                                >
                                                                    +{report.evidence_image.length - 2}
                                                                </Box>
                                                            )}
                                                        </Stack>
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        {moment(report.createdAt).isSame(moment(), "day")
                                                            ? `Today, ${moment(report.createdAt).format("hh:mm A")}`
                                                            : moment(report.createdAt).format("HH:mm:ss - DD/MM/YYYY")}
                                                    </TableCell>

                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        <Chip
                                                            label={report.report_status}
                                                            sx={{
                                                                backgroundColor:
                                                                    report.report_status === 'With SAPS' ? '#DCFCE7' :
                                                                        report.report_status === 'reviewing' ? '#FEF9C3' :
                                                                            report.report_status == 'reviewed' ? '#DBEAFE' :
                                                                                report.report_status == 'pending' ? '#F3F4F6' :
                                                                                    '#FEF9C3',
                                                                '& .MuiChip-label': {
                                                                    textTransform: 'capitalize',
                                                                    color: report.report_status === 'With SAPS' ? 'green' :
                                                                        report.report_status === 'reviewing' ? '#854D0E' :
                                                                            report.report_status == 'reviewed' ? '#1E40AF' :
                                                                                report.report_status == 'pending' ? '#1F2937' :

                                                                                    'black',
                                                                }
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#01C971', textAlign: 'center' }}>
                                                        <Link style={{
                                                            textDecoration: 'none',
                                                            color: '#01C971',
                                                            cursor: 'pointer',
                                                        }} onClick={() => handleView(`/home/total-suspect?linked_case_type=crimereports&linked_case_type_id=${report?._id}`)} state={{ isAccepted: true }}>
                                                            {report.suspect_reported_users}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell >
                                                        <Box align="center" sx={{ display: 'flex', flexDirection: 'row' }}>
                                                            <Tooltip title="View" arrow placement="top">
                                                                <IconButton onClick={() => handleView(`/home/crime-reports/crime-report/${report._id}`)}>
                                                                    <img src={ViewBtn} alt="flagged button" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>


                                                    </TableCell>
                                                </TableRow>
                                            )) : (
                                                <TableRow>
                                                    <TableCell colSpan={10} align="center">
                                                        <Typography align="center" color="text.secondary" sx={{ mt: 2 }}>
                                                            No data found
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                    }
                                </TableBody>
                            </Table>

                        </TableContainer>

                        {!crimeRecentList.isFetching && crimeRecentList.data?.data.crimeReportData.length > 0 &&
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
                                        value={rowsPerPageCrimeRecent}
                                        onChange={(e) => {
                                            updateParamsCrimeRecent({rowsPerPageCrimeRecent:Number(e.target.value),currentPage:1});
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
                                        {currentPageCrimeRecent} / {totalPagesCrimeRecent}
                                    </Typography>
                                    <IconButton
                                        disabled={currentPageCrimeRecent === 1}
                                        onClick={() => updateParamsCrimeRecent({currentPageCrimeRecent:currentPageCrimeRecent - 1})}
                                    >
                                        <NavigateBeforeIcon fontSize="small" sx={{
                                            color: currentPageCrimeRecent === 1 ? '#BDBDBD' : '#1976d2'
                                        }} />
                                    </IconButton>
                                    <IconButton
                                        disabled={currentPageCrimeRecent === totalPagesCrimeRecent}
                                        onClick={() => updateParamsCrimeRecent({currentPageCrimeRecent:currentPageCrimeRecent + 1})}
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
                                if (audioRef.current) {
                                    audioRef.current.currentTime = 0;
                                    await audioRef.current.play();
                                }
                                localStorage.setItem("sosAudioEnabled", "true");
                                setOpenAudioModal(false);
                                toast.success("Audio alerts enabled!", toastOption);
                            } catch (e) {
                                console.error("Permission grant failed", e);
                                // Fallback: still save as true, user might click again later
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

            <Dialog
                open={otherUsersModalOpen}
                onClose={closeOtherUsersModal}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle>Other Users</DialogTitle>
                <DialogContent dividers>
                    {otherUsersModalItems.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                            No other users found.
                        </Typography>
                    ) : (
                        <List disablePadding>
                            {otherUsersModalItems.map((u, idx) => {
                                const order = u.role != 'driver' && u.order ? u.order : 1
                                const route = getOtherUserRoute(u);
                                const label = getOtherUserName(u);
            
                                return (
                                    <>
                                        {u.role === 'driver' && (
                                            <Box
                                                key={getOtherUserId(u) || idx}
                                                sx={{
                                                    border: '1px solid #E5E7EB',
                                                    borderRadius: '16px',
                                                    p: 2,
                                                    mb: 2,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                                                    backgroundColor: u.role === 'driver' ? '#FFF9C4' : '#fff',
                                                }}
                                            >
                                                {/* Left Side */}
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Avatar
                                                        src={u?.selfieImage || nouser}
                                                        alt="User"
                                                        sx={{
                                                            width: 56,
                                                            height: 56
                                                        }}
                                                    />

                                                    <ListItemButton
                                                        disabled={!route}
                                                        onClick={() => {
                                                            if (!route) return;
                                                            closeOtherUsersModal();
                                                            // nav(route);
                                                            handleView(route)
                                                        }}
                                                        sx={{
                                                            borderRadius: 2,
                                                            p: 0,
                                                            minWidth: '180px'
                                                        }}
                                                    >
                                                        <ListItemText
                                                            primary={label}
                                                            secondary={'Driver'}
                                                            primaryTypographyProps={{
                                                                fontWeight: 600,
                                                                fontSize: '18px',
                                                                color: '#111827'
                                                            }}
                                                            secondaryTypographyProps={{
                                                                fontSize: '14px',
                                                                color: '#9B6C2D'
                                                            }}
                                                        />
                                                    </ListItemButton>
                                                </Box>

                                                {/* Right Side View Button */}
                                                <Tooltip title="View" arrow placement="top">
                                                    <span>
                                                        <IconButton
                                                            size="small"
                                                            disabled={!route}
                                                            onClick={() => {
                                                                if (!route) return;
                                                                closeOtherUsersModal();
                                                                // nav(route);
                                                                handleView(route)
                                                            }}
                                                            sx={{
                                                                backgroundColor: '#1E73E8',
                                                                color: '#fff',
                                                                px: 3,
                                                                py: 1,
                                                                borderRadius: '20px',
                                                                "&:hover": {
                                                                    backgroundColor: '#1565C0'
                                                                }
                                                            }}
                                                        >
                                                            <VisibilityOutlinedIcon fontSize="small" />
                                                        </IconButton>
                                                    </span>
                                                </Tooltip>
                                            </Box>
                                        )}
                                    </>
                                );
                            })}
                            {otherUsersModalItems.some((u) => u.role !== 'driver') && (
                                <Typography variant="h6" my={1} fontWeight={590}>
                                    Linked Passengers
                                </Typography>
                            )}
                            {otherUsersModalItems.map((u, idx) => {
                                const order = u.role != 'driver' && u.order ? u.order : 1
                                const route = getOtherUserRoute(u);
                                const label = getOtherUserName(u);

                                return (
                                    <>
                                        {u.role != 'driver' && (
                                            <>

                                                <Box
                                                    key={getOtherUserId(u) || idx}
                                                    sx={{
                                                        border: '1px solid #E5E7EB',
                                                        borderRadius: '16px',
                                                        p: 2,
                                                        mb: 2,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                                                        backgroundColor: u.role === 'driver' ? '#FFF9C4' : '#fff',
                                                    }}
                                                >
                                                    {/* Left Side */}
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Avatar
                                                            src={u?.selfieImage || nouser}
                                                            alt="User"
                                                            sx={{
                                                                width: 56,
                                                                height: 56
                                                            }}
                                                        />

                                                        <ListItemButton
                                                            disabled={!route}
                                                            onClick={() => {
                                                                if (!route) return;
                                                                closeOtherUsersModal();
                                                                // nav(route);
                                                                handleView(route)
                                                            }}
                                                            sx={{
                                                                borderRadius: 2,
                                                                p: 0,
                                                                minWidth: '180px'
                                                            }}
                                                        >
                                                            <ListItemText
                                                                primary={label}
                                                                secondary={order > 1 ? `Co-Passenger${order}` : `Passenger1`}
                                                                primaryTypographyProps={{
                                                                    fontWeight: 600,
                                                                    fontSize: '18px',
                                                                    color: '#111827'
                                                                }}
                                                                secondaryTypographyProps={{
                                                                    fontSize: '14px',
                                                                    color: '#6B7280'
                                                                }}
                                                            />
                                                        </ListItemButton>
                                                    </Box>

                                                    {/* Right Side View Button */}
                                                    <Tooltip title="View" arrow placement="top">
                                                        <span>
                                                            <IconButton
                                                                size="small"
                                                                disabled={!route}
                                                                onClick={() => {
                                                                    if (!route) return;
                                                                    closeOtherUsersModal();
                                                                    // nav(route);
                                                                    handleView(route)
                                                                }}
                                                                sx={{
                                                                    backgroundColor: '#1E73E8',
                                                                    color: '#fff',
                                                                    px: 3,
                                                                    py: 1,
                                                                    borderRadius: '20px',
                                                                    "&:hover": {
                                                                        backgroundColor: '#1565C0'
                                                                    }
                                                                }}
                                                            >
                                                                <VisibilityOutlinedIcon fontSize="small" />
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                </Box>
                                            </>
                                        )}
                                    </>
                                );
                            })}
                        </List>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={()=>{closeOtherUsersModal(),updateRecentParams({modal: false,modalData: null}),updateParams({modal: false,modalData: null})}}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* View Capture Report */}
            <Popover
                open={captureReportModalOpen}
                anchorEl={captureReportAnchorEl}
                onClose={closeCaptureReportModal}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        width: 499,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    }
                }}
            >
                {/* DialogTitle */}
                <Box sx={{ px: 3, pt: 2, pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography fontWeight={600} fontSize={16}>
                        Incident Reports (Multi-Report)
                    </Typography>
                    <Chip
                        label={'View All'}
                        sx={{
                            backgroundColor: '#367BE0',
                            color: 'white',

                            '& .MuiChip-label': {
                                color: 'white', // force label text color
                            },

                            '&.MuiChip-clickable:hover': {
                                backgroundColor: '#367BE0', // prevent bg change
                                color: 'white',
                            }
                        }}
                        onClick={() => handleView(`/home/capture-reports?location_id=${locationId}&sosId=${sosNumberPath}`)}
                    />
                </Box>

                <Divider />

                {/* Content */}
                <Box sx={{ px: 2, py: 1, maxHeight: 360, overflowY: 'auto' }}>
                    {captureReportModalItems.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                            No other users found.
                        </Typography>
                    ) : (
                        <List disablePadding>
                            {captureReportModalItems.map((u, idx) => {
                                let fullName = u?.user?.first_name + u?.user?.last_name ||  "-"
                                return (
                                    <Box
                                        key={getOtherUserId(u._id) || idx}
                                        sx={{
                                            border: '1px solid #E5E7EB',
                                            borderRadius: '16px',
                                            p: 2,
                                            mb: 1.5,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                                            backgroundColor: '#fff',
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar
                                                src={getImageLink(u?.user.selfieImage) || nouser}
                                                alt="User"
                                                sx={{ width: 48, height: 48 }}
                                            />
                                            <Typography fontWeight={600} fontSize={15} color="#111827">
                                                {fullName || '-'}
                                            </Typography>
                                        </Box>
                                        <Chip
                                            label={u?.capture_report?.report_status || 'No Report'}
                                            sx={{
                                                backgroundColor:
                                                    u?.capture_report?.report_status === 'View Report'
                                                        ? '#367BE01A' : '#4B55631A',
                                                '& .MuiChip-label': {
                                                    color: u?.capture_report?.report_status === 'View Report'
                                                        ? '#367BE0' : '#4B5563',
                                                }
                                            }}
                                        />
                                    </Box>
                                );
                            })}
                        </List>
                    )}
                </Box>

                <Divider />
                <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button onClick={closeCaptureReportModal} size="small">Close</Button>
                </Box>
            </Popover>
        </Box >
        </>
    );
};

export default Home;