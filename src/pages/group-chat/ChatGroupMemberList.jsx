import { useEffect, useState } from "react";
import { useGetChatGroupsMembers,useGetChatGroupsMessageList,useGetGroupChatMemberPageData,usePutGroupchatMemberBlock,usePutGroupchatMessageWarning} from "../../API Calls/API";
import {
    Grid, Typography, Select, Box, TextField, InputAdornment, MenuItem,IconButton, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Stack, Avatar, Chip, Paper, Button, Menu,
    Tooltip,TableSortLabel,Skeleton, Dialog, DialogContent
} from "@mui/material";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import search from '../../assets/images/search.svg';
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import ViewBtn from '../../assets/images/ViewBtn.svg'
import { DeleteConfirm } from "../../common/ConfirmationPOPup";
import delBtn from '../../assets/images/delBtn.svg'
import warn_btn from '../../assets/images/warn_btn.svg'
import block_btn from '../../assets/images/block_btn.svg'
import nouser from "../../assets/images/NoUser.png";
import Loader from "../../common/Loader";
import { startOfYear } from "date-fns";
import groupchat_total_users from '../../assets/images/groupchat_total_users.svg'
import groupchat_report from '../../assets/images/groupchat_report.svg'
import groupchat_today_message from '../../assets/images/groupchat_today_message.svg'
import groupchat_active_user from '../../assets/images/groupchat_active_user.svg'
import { saveScrollPosition, restoreScrollPosition } from "../../common/ScrollPosition";
import arrowup from '../../assets/images/arrowup.svg';
import arrowdown from '../../assets/images/arrowdown.svg';
import arrownuteral from '../../assets/images/arrownuteral.svg';
import moment from "moment";
import {getImageLink,formatDateTime } from '../../common/commonFn';
import { toast } from "react-toastify";

const ChatGroupMemberList = () => {

    const params = useParams();
    const group_id = params.id;
    const [searchParams, setSearchParams] = useSearchParams();
    const startDateParam = searchParams.get("startDate") || startOfYear(new Date()).toISOString();
    const endDateParam = searchParams.get("endDate") || new Date().toISOString();
    const [range, setRange] = useState([{
        startDate: new Date(startDateParam),
        endDate: new Date(endDateParam),
        key: 'selection'
    }]);
    const currentPage = Number(searchParams.get("currentPage")) || 1;
    const filter = searchParams.get("filter") || "";
    const locationFilter = searchParams.get("locationFilter") || "";
    const rowsPerPage = Number(searchParams.get("rowsPerPage")) || 5;
    const [confirmation, setconfirmation] = useState("");
    const startDate = range[0].startDate.toISOString();
    const endDate = range[0].endDate.toISOString();
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("desc");
    const nav = useNavigate()
    const changeSortOrder = (e) => {
        const field = e.target.id;

        if (field !== sortBy) {
            setSortBy(field);
            setSortOrder("desc");
        } else {
            setSortOrder(p => p === 'asc' ? 'desc' : 'asc')
        }
    }

    const [searchParamsMember, setSearchParamsMember] = useSearchParams();
    const now = new Date();

    const startDateParamMember = new Date(now);
    startDateParamMember.setHours(0, 0, 0, 0);

    const endDateParamMember = new Date(now);
    endDateParamMember.setHours(23, 59, 59, 999);
    // const startDateParamMember = searchParamsMember.get("startDateMember") || startOfYear(new Date()).toISOString();
    // const endDateParamMember = searchParamsMember.get("endDateMember") || new Date().toISOString();
    const [rangeMember, setRangeMember] = useState([{
        startDate: new Date(startDateParamMember),
        endDate: new Date(endDateParamMember),
        key: 'selection'
    }]);
    const currentPageMember = Number(searchParamsMember.get("currentPageMember")) || 1;
    const filterMember = searchParamsMember.get("filterMember") || "";
    const locationFilterMember = searchParamsMember.get("locationFilterMember") || "";
    const rowsPerPageMember = Number(searchParamsMember.get("rowsPerPageMember")) || 5;
    const startDateMember = rangeMember[0].startDate.toISOString();
    const endDateMember = rangeMember[0].endDate.toISOString();
    const [sortByMember, setSortByMember] = useState("createdAt");
    const [sortOrderMember, setSortOrderMember] = useState("desc");
    const [popup, setpopup] = useState(false);
    const changeSortOrderMember = (e) => {
        const field = e.target.id;

        if (field !== sortBy) {
            setSortByMember(field);
            setSortOrderMember("desc");
        } else {
            setSortOrderMember(p => p === 'asc' ? 'desc' : 'asc')
        }
    }
    const SAPS_Page_API_Data = useGetGroupChatMemberPageData(group_id)
    const SAPS_Page_ObjData = SAPS_Page_API_Data.data?.data || {}

    const SAPS_Wanted_Responce = useGetChatGroupsMembers("group member list", "",group_id, currentPage, rowsPerPage, filter, locationFilter, startDate, endDate, sortBy, sortOrder);
    const totalData = SAPS_Wanted_Responce.data?.data?.totalData || 0;
    const totalPages = Math.ceil(totalData / rowsPerPage);
    
    const SAPS_Members_Responce = useGetChatGroupsMessageList("group message list", "",group_id, currentPageMember, rowsPerPageMember, filterMember, locationFilterMember, startDateMember, endDateMember, sortByMember, sortOrderMember);
    const totalMemberData = SAPS_Members_Responce.data?.data?.totalData || 0;
    const totalMemberPages = Math.ceil(totalMemberData / rowsPerPage);
    
    const updateParams = (newParams) => {
        setSearchParams((prev) => {
            const prevParams = Object.fromEntries(prev.entries());

            return {
                ...prevParams,
                ...newParams,
            };
        });
    };

    const updateMembersParams = (newParams) => {
        setSearchParamsMember((prev) => {
            const prevParams = Object.fromEntries(prev.entries());

            return {
                ...prevParams,
                ...newParams,
            };
        });
    };

    const [isLoading, setIsLoading] = useState(false);

    const [blockPopup, setBlockPopup] = useState(null);
    const [warningPopup, setWarningPopup] = useState(null);

    const blockMutation = usePutGroupchatMemberBlock(
        () => {
            toast.success("Member blocked successfully");
            setBlockPopup(null);
            SAPS_Wanted_Responce.refetch();
            SAPS_Members_Responce.refetch();
        },
        (err) => {
            toast.error(err?.response?.data?.message || "Something went wrong");
        }
    );

    const warningMutation = usePutGroupchatMessageWarning(
        () => {
            toast.success("Warning sent successfully");
            setWarningPopup(null);
            SAPS_Members_Responce.refetch();
        },
        (err) => {
            toast.error(err?.response?.data?.message || "Something went wrong");
        }
    );

    const handleView = (url) => {
        saveScrollPosition("GroupMemberListScroll");
        nav(url);
    };
    useEffect(() => {
        if (SAPS_Wanted_Responce.data?.data?.totalData) {
            restoreScrollPosition("GroupMemberListScroll");
        }
        if (SAPS_Members_Responce.data?.data?.totalData) {
            restoreScrollPosition("GroupMemberListScroll");
        }
    }, [SAPS_Wanted_Responce.data?.data?.totalData,SAPS_Members_Responce.data?.data?.totalData]);


    return (
        <Box>
            <Box p={2}>
                <Grid container spacing={3} mb={2}>
                    <Grid size={{ xs: 12, md: 4, lg: 3 }} sx={{}}>
                        <Box sx={{ backgroundColor: '#FFFFFF', border: '1px solid #EEF0F3', borderRadius: '16px', px: 2.5, py: 2.5 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1.5, mb: 1 }}>
                                <Box sx={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#E8F0FE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <img src={groupchat_total_users} alt="ReportIcon" style={{ width: 40, height: 40, }} />
                                </Box>
                                <Box>

                                    <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px", color: '#6B7280' }}>Total Users</Typography>
                                    {SAPS_Page_API_Data.isFetching ? (
                                        <Skeleton variant="text" width={60} height={40} />
                                    ) : (
                                        <Typography variant="h4" fontWeight={700}>{SAPS_Page_ObjData?.totalUsers}</Typography>
                                    )
                                    }
                                </Box>
                            </Box>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4, lg: 3 }} sx={{}}>
                        <Box sx={{ backgroundColor: '#FFFFFF', border: '1px solid #EEF0F3', borderRadius: '16px', px: 2.5, py: 2.5 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1.5, mb: 1 }}>
                                <Box sx={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#E5F7EC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <img src={groupchat_active_user} alt="ReportIcon" style={{ width: 40, height: 40, }} />
                                </Box>
                                <Box>

                                    <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px", color: '#6B7280' }}>Active Now</Typography>
                                    {SAPS_Page_API_Data.isFetching ? (
                                        <Skeleton variant="text" width={60} height={40} />
                                    ) : (
                                        <Typography variant="h4" fontWeight={700}>{SAPS_Page_ObjData?.activeNow}</Typography>
                                    )
                                    }
                                </Box>
                            </Box>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4, lg: 3 }} sx={{}}>
                        <Box sx={{ backgroundColor: '#FFFFFF', border: '1px solid #EEF0F3', borderRadius: '16px', px: 2.5, py: 2.5 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1.5, mb: 1 }}>
                                <Box sx={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#F1E9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <img src={groupchat_today_message} alt="ReportIcon" style={{ width: 40, height: 40, }} />
                                </Box>
                                <Box>

                                    <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px", color: '#6B7280' }}>Messages Today</Typography>
                                    {SAPS_Page_API_Data.isFetching ? (
                                        <Skeleton variant="text" width={60} height={40} />
                                    ) : (
                                        <Typography variant="h4" fontWeight={700}>{SAPS_Page_ObjData?.messagesToday}</Typography>
                                    )
                                    }
                                </Box>
                            </Box>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4, lg: 3 }} sx={{}}>
                        <Box sx={{ backgroundColor: '#FFFFFF', border: '1px solid #EEF0F3', borderRadius: '16px', px: 2.5, py: 2.5 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1.5, mb: 1 }}>
                                <Box sx={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#FCE7E8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <img src={groupchat_report} alt="ReportIcon" style={{ width: 40, height: 40, }} />
                                </Box>
                                <Box>

                                    <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px", color: '#6B7280' }}>Flagged Reports</Typography>
                                    {SAPS_Page_API_Data.isFetching ? (
                                        <Skeleton variant="text" width={60} height={40} />
                                    ) : (
                                        <Typography variant="h4" fontWeight={700}>{SAPS_Page_ObjData?.flaggedReports}</Typography>
                                    )
                                    }
                                </Box>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
                <Box mb={2}>
                    <Paper elevation={3} sx={{ backgroundColor: "rgb(253, 253, 253)", padding: 2, borderRadius: '10px' }}>
                        <Grid container justifyContent="space-between" alignItems="center" mb={2}>
                            <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', flexDirection: 'row', gap: 2, mb: { xs: 1, md: 0 } }}>
                                <Typography variant="h6" fontWeight={590}>Anonymous User List</Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 8 }} sx={{ display: 'flex', justifyContent: 'flex-end', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                                <TextField
                                    variant="outlined"
                                    placeholder="Search"
                                    value={filter}
                                    onChange={(e) => updateParams({ filter: e.target.value })}
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
                            </Grid>
                        </Grid>

                        {SAPS_Wanted_Responce.isFetching ? (
                            <Loader />
                        ) : SAPS_Wanted_Responce.data?.data.data?.length > 0 ? (
                            <Box sx={{ px: { xs: 0, md: 2 }, pt: { xs: 0, md: 3 }, backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
                                <TableContainer>
                                    <Table sx={{ '& .MuiTableCell-root': { fontSize: '15px' } }}>
                                        <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                            <TableRow >
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', borderTopLeftRadius: '10px', minWidth: 150 }}>
                                                    <TableSortLabel
                                                        id="user_code"
                                                        active={sortBy === 'user_code'}
                                                        direction={sortOrder}
                                                        onClick={changeSortOrder}
                                                        IconComponent={() => <img src={sortBy === 'user_code' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                    >User Code
                                                    </TableSortLabel></TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', minWidth: 150 }}>
                                                    <TableSortLabel
                                                        id="first_name"
                                                        active={sortBy === 'first_name'}
                                                        direction={sortOrder}
                                                        onClick={changeSortOrder}
                                                        IconComponent={() => <img src={sortBy === 'first_name' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                    >Real Name (Admin Only)
                                                    </TableSortLabel></TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', minWidth: 150 }}>
                                                    <TableSortLabel
                                                        id="created_at"
                                                        active={sortBy === 'created_at'}
                                                        direction={sortOrder}
                                                        onClick={changeSortOrder}
                                                        IconComponent={() => <img src={sortBy === 'created_at' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                    >Join Time
                                                    </TableSortLabel></TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', minWidth: 150 }}>
                                                    <TableSortLabel
                                                        id="create_at"
                                                        active={sortBy === 'create_at'}
                                                        direction={sortOrder}
                                                        onClick={changeSortOrder}
                                                        IconComponent={() => <img src={sortBy === 'create_at' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                    >Last Active
                                                    </TableSortLabel></TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', minWidth: 150 }}>
                                                    <TableSortLabel
                                                        id="total_message"
                                                        active={sortBy === 'total_message'}
                                                        direction={sortOrder}
                                                        onClick={changeSortOrder}
                                                        IconComponent={() => <img src={sortBy === 'total_message' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                    >Message Count
                                                    </TableSortLabel></TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', minWidth: 150 }}>
                                                    <TableSortLabel
                                                        id="crime_date"
                                                        active={sortBy === 'crime_date'}
                                                        direction={sortOrder}
                                                        onClick={changeSortOrder}
                                                        IconComponent={() => <img src={sortBy === 'crime_date' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                    >Status
                                                    </TableSortLabel></TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', minWidth: 150 }}>Action</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {SAPS_Wanted_Responce?.data?.data.data.map((user) => (
                                                <TableRow key={user._id}>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        {user.user_code || "-"}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        <Link onClick={() => handleView(user.user?.role === "driver" ? `/home/total-drivers/driver-information/${user.user_id}` : `/home/total-users/user-information/${user.user_id}`)} className="link2">
                                                            <Stack direction="row" alignItems="center" gap={1}>
                                                                <Avatar
                                                                    src={getImageLink(user.user?.selfieImage)}
                                                                    sx={{ '&:hover': { textDecoration: 'none' } }}
                                                                    alt="User"
                                                                />
                                                                {user.user?.first_name + ' ' + user.user?.last_name || "-"}
                                                            </Stack>
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        {moment(user.crime_date).isSame(moment(), "day")
                                                            ? `Today, ${moment(user.crime_date).format("hh:mm A")}`
                                                            : formatDateTime(user.crime_date, "HH:mm:ss - DD/MM/YYYY")}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        {moment(user.crime_date).isSame(moment(), "day")
                                                            ? `Today, ${moment(user.crime_date).format("hh:mm A")}`
                                                            : formatDateTime(user.crime_date, "HH:mm:ss - DD/MM/YYYY")}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        0
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        <Chip
                                                            label={user.status === 'active' ? 'Active' : 'Blocked'}
                                                            sx={{
                                                                backgroundColor:
                                                                    user.status === 'active' ? '#DCFCE7' : '#FEE2E2',
                                                                '& .MuiChip-label': {
                                                                    textTransform: 'capitalize',
                                                                    color: user.status === 'active' ? 'green' : '#DC2626',
                                                                }
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box align="center" sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                                                            <Tooltip title="View" arrow placement="top">
                                                                <IconButton onClick={() => handleView(user.user?.role === "driver" ? `/home/total-drivers/driver-information/${user.user_id}` : `/home/total-users/user-information/${user.user_id}`)}>
                                                                    <img src={ViewBtn} alt="view button" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Block" arrow placement="top">
                                                                <IconButton onClick={() => setBlockPopup(user._id)}>
                                                                    <img src={block_btn} alt="block button" />
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
                                        <Typography variant="body2" component="div">
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
                                                    updateParams({ rowsPerPage: Number(e.target.value), currentPage: 1 });
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
                                                {currentPage} / {totalPages}
                                            </Typography>
                                            <IconButton
                                                disabled={currentPage === 1}
                                                onClick={() => updateParams({ currentPage: currentPage - 1 })}
                                            >
                                                <NavigateBeforeIcon fontSize="small" sx={{
                                                    color: currentPage === 1 ? '#BDBDBD' : '#1976d2'
                                                }} />
                                            </IconButton>
                                            <IconButton
                                                disabled={currentPage === totalPages}
                                                onClick={() => updateParams({ currentPage: currentPage + 1 })}
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
                <Box >
                    <Paper elevation={3} sx={{ backgroundColor: "rgb(253, 253, 253)", padding: 2, borderRadius: '10px' }}>
                        <Grid container justifyContent="space-between" alignItems="center" mb={2}>
                            <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', flexDirection: 'row', gap: 2, mb: { xs: 1, md: 0 } }}>
                                <Typography variant="h6" fontWeight={590}>Message Log</Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 8 }} sx={{ display: 'flex', justifyContent: 'flex-end', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>

                                <TextField
                                    variant="outlined"
                                    placeholder="Search"
                                    value={filterMember}
                                    onChange={(e) => updateMembersParams({ filterMember: e.target.value })}
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
                            </Grid>
                        </Grid>

                        {SAPS_Members_Responce.isFetching ? (
                            <Loader />
                        ) : SAPS_Members_Responce?.data?.data.data?.length > 0 ? (
                            <Box sx={{ px: { xs: 0, md: 2 }, pt: { xs: 0, md: 3 }, backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
                                <TableContainer>
                                    <Table sx={{ '& .MuiTableCell-root': { fontSize: '15px' } }}>
                                        <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                            <TableRow >
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', borderTopLeftRadius: '10px', minWidth: 150 }}>
                                                    <TableSortLabel
                                                        id="message"
                                                        active={sortByMember === 'message'}
                                                        direction={sortOrderMember}
                                                        onClick={changeSortOrderMember}
                                                        IconComponent={() => <img src={sortByMember === 'message' ? sortOrderMember === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                    >Message</TableSortLabel>
                                                </TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', minWidth: 150 }}>
                                                    <TableSortLabel
                                                        id="group_name"
                                                        active={sortByMember === 'group_name'}
                                                        direction={sortOrderMember}
                                                        onClick={changeSortOrderMember}
                                                        IconComponent={() => <img src={sortByMember === 'group_name' ? sortOrderMember === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                    >Group Name</TableSortLabel>
                                                </TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', minWidth: 150 }}>
                                                    <TableSortLabel
                                                        id="user_code"
                                                        active={sortByMember === 'user_code'}
                                                        direction={sortOrderMember}
                                                        onClick={changeSortOrderMember}
                                                        IconComponent={() => <img src={sortByMember === 'user_code' ? sortOrderMember === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                    >User Code</TableSortLabel>
                                                </TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', minWidth: 150 }}>
                                                    <TableSortLabel
                                                        id="first_name"
                                                        active={sortByMember === 'first_name'}
                                                        direction={sortOrderMember}
                                                        onClick={changeSortOrderMember}
                                                        IconComponent={() => <img src={sortByMember === 'first_name' ? sortOrderMember === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                    >Real Name</TableSortLabel>
                                                </TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', minWidth: 150 }}>
                                                    <TableSortLabel
                                                        id="created_at"
                                                        active={sortByMember === 'created_at'}
                                                        direction={sortOrderMember}
                                                        onClick={changeSortOrderMember}
                                                        IconComponent={() => <img src={sortByMember === 'created_at' ? sortOrderMember === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                    >Timestamp</TableSortLabel>
                                                </TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', minWidth: 150 }}>
                                                    <TableSortLabel
                                                        id="flagged"
                                                        active={sortByMember === 'flagged'}
                                                        direction={sortOrderMember}
                                                        onClick={changeSortOrderMember}
                                                        IconComponent={() => <img src={sortByMember === 'flagged' ? sortOrderMember === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                    >Falgged</TableSortLabel>
                                                </TableCell>
                                                <TableCell align="center" sx={{ backgroundColor: '#F9FAFB', borderTopRightRadius: '10px', color: '#4B5563' }}>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {SAPS_Members_Responce?.data?.data.data.map((user) => (
                                                <TableRow key={user._id}>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        {user?.message || "-"}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        {user?.group_name || "-"}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        {user?.user_code || "-"}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        <Stack direction="row" alignItems="center" gap={1}>
                                                            <Avatar
                                                                src={user?.selfieImage || nouser}
                                                                alt="User"
                                                            />

                                                            {user.real_name}

                                                        </Stack>
                                                    </TableCell>
                                                    <TableCell sx={{ color: user.colorCode }}>
                                                        {user.createdAt || "-"}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        <Chip
                                                            label={user.flagged ? 'Yes' : 'No'}
                                                            sx={{
                                                                backgroundColor:
                                                                    user.flagged ? '#DCFCE7' : '#FEE2E2',
                                                                '& .MuiChip-label': {
                                                                    textTransform: 'capitalize',
                                                                    color: user.flagged ? 'green' : '#DC2626',
                                                                }
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box align="center" sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                                                            <Tooltip title="View" arrow placement="top">
                                                                <IconButton onClick={() => handleView()}>
                                                                    <img src={ViewBtn} alt="view button" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Delete" arrow placement="top">
                                                                <IconButton onClick={() => setconfirmation(user._id)}>
                                                                    <img src={delBtn} alt="delete button" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            {confirmation === user._id && (
                                                                <DeleteConfirm
                                                                    id={user._id}
                                                                    setconfirmation={setconfirmation}
                                                                    trip="sapsmember"
                                                                />
                                                            )}
                                                            <Tooltip title="Block" arrow placement="top">
                                                                <IconButton onClick={() => setBlockPopup(user._id)}>
                                                                    <img src={block_btn} alt="block button" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Warning" arrow placement="top">
                                                                <IconButton onClick={() => setWarningPopup(user._id)}>
                                                                    <img src={warn_btn} alt="warn button" />
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
                                        <Typography variant="body2" component="div">
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
                                                value={rowsPerPageMember}
                                                onChange={(e) => {
                                                    updateMembersParams({ rowsPerPageMember: Number(e.target.value), currentPageMember: 1 });
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
                                                {currentPageMember} / {totalMemberPages}
                                            </Typography>
                                            <IconButton
                                                disabled={currentPageMember === 1}
                                                onClick={() => updateMembersParams({ currentPageMember: currentPageMember - 1 })}
                                            >
                                                <NavigateBeforeIcon fontSize="small" sx={{
                                                    color: currentPageMember === 1 ? '#BDBDBD' : '#1976d2'
                                                }} />
                                            </IconButton>
                                            <IconButton
                                                disabled={currentPageMember === totalMemberPages}
                                                onClick={() => updateMembersParams({ currentPageMember: currentPageMember + 1 })}
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

            {blockPopup &&
                <Dialog
                    open={!!blockPopup}
                    onClose={() => setBlockPopup(null)}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{
                        sx: {
                            borderRadius: "24px",
                            padding: "30px",
                            textAlign: "center",
                        },
                    }}
                >
                    <DialogContent sx={{ p: 0 }}>
                        {/* Icon */}
                        <Box display="flex" justifyContent="center" mb={3}>
                            <Box
                                sx={{
                                    width: 100,
                                    height: 100,
                                    borderRadius: "50%",
                                    background: "#FCE7E8",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <img src={block_btn} alt="block" width={40} />
                            </Box>
                        </Box>

                        {/* Title */}
                        <Typography
                            variant="h4"
                            fontWeight={700}
                            sx={{ mb: 2 }}
                        >
                            Block User
                        </Typography>

                        {/* Description */}
                        <Typography
                            sx={{
                                color: "#6B7280",
                                fontSize: "20px",
                                lineHeight: 1.5,
                                mb: 4,
                            }}
                        >
                            Are you sure you want to block this user? They will no longer be able to send messages in this group.
                        </Typography>

                        {/* Buttons */}
                        <Box display="flex" flexDirection="column" gap={2}>
                            <Button
                                variant="contained"
                                fullWidth
                                disabled={blockMutation.isPending}
                                onClick={() => blockMutation.mutate({ id: blockPopup, data: { status: 'block' } })}
                                sx={{
                                    background: "#DC2626",
                                    borderRadius: "12px",
                                    height: 56,
                                    fontSize: "20px",
                                    fontWeight: 600,
                                    textTransform: "none",
                                    "&:hover": {
                                        background: "#b91c1c",
                                    },
                                }}
                            >
                                Block User
                            </Button>

                            <Button
                                variant="outlined"
                                fullWidth
                                onClick={() => setBlockPopup(null)}
                                sx={{
                                    borderRadius: "12px",
                                    height: 56,
                                    color: "#111",
                                    borderColor: "#D1D5DB",
                                    fontSize: "20px",
                                    fontWeight: 500,
                                    textTransform: "none",
                                }}
                            >
                                Cancel
                            </Button>
                        </Box>
                    </DialogContent>
                </Dialog>
            }
            {warningPopup &&
                <Dialog
                    open={!!warningPopup}
                    onClose={() => setWarningPopup(null)}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{
                        sx: {
                            borderRadius: "24px",
                            padding: "30px",
                            textAlign: "center",
                        },
                    }}
                >
                    <DialogContent sx={{ p: 0 }}>
                        {/* Icon */}
                        <Box display="flex" justifyContent="center" mb={3}>
                            <Box
                                sx={{
                                    width: 100,
                                    height: 100,
                                    borderRadius: "50%",
                                    background: "#FFF7E6",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <img src={warn_btn} alt="warning" width={40} />
                            </Box>
                        </Box>

                        {/* Title */}
                        <Typography
                            variant="h4"
                            fontWeight={700}
                            sx={{ mb: 2 }}
                        >
                            Send Warning
                        </Typography>

                        {/* Description */}
                        <Typography
                            sx={{
                                color: "#6B7280",
                                fontSize: "20px",
                                lineHeight: 1.5,
                                mb: 4,
                            }}
                        >
                            Are you sure you want to send a warning to this user for this message?
                        </Typography>

                        {/* Buttons */}
                        <Box display="flex" flexDirection="column" gap={2}>
                            <Button
                                variant="contained"
                                fullWidth
                                disabled={warningMutation.isPending}
                                onClick={() => warningMutation.mutate({ id: warningPopup, data: { flagged: true } })}
                                sx={{
                                    background: "#2F80ED",
                                    borderRadius: "12px",
                                    height: 56,
                                    fontSize: "20px",
                                    fontWeight: 600,
                                    textTransform: "none",
                                    "&:hover": {
                                        background: "#2569d9",
                                    },
                                }}
                            >
                                Send Warning
                            </Button>

                            <Button
                                variant="outlined"
                                fullWidth
                                onClick={() => setWarningPopup(null)}
                                sx={{
                                    borderRadius: "12px",
                                    height: 56,
                                    color: "#111",
                                    borderColor: "#D1D5DB",
                                    fontSize: "20px",
                                    fontWeight: 500,
                                    textTransform: "none",
                                }}
                            >
                                Cancel
                            </Button>
                        </Box>
                    </DialogContent>
                </Dialog>
            }

        </Box>
    )
}

export default ChatGroupMemberList
