import { useEffect, useState } from "react";
import { useGetChatGroupsMembers,useGetChatGroupsMessageList,useGetSAPSWantedPageData} from "../../API Calls/API";
import {
    Grid, Typography, Select, Box, TextField, InputAdornment, MenuItem, FormControl, InputLabel, IconButton, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Stack, Avatar, Chip, Paper, Button, Menu,
    Tooltip,TableSortLabel,Skeleton
} from "@mui/material";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import plus from '../../assets/images/plus.svg'
import whiteplus from '../../assets/images/whiteplus.svg';
import MoreVertIcon from "@mui/icons-material/MoreVert";
import search from '../../assets/images/search.svg';
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable'
import * as XLSX from 'xlsx';
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
import { saveScrollPosition, restoreScrollPosition } from "../../common/ScrollPosition";
import arrowup from '../../assets/images/arrowup.svg';
import arrowdown from '../../assets/images/arrowdown.svg';
import arrownuteral from '../../assets/images/arrownuteral.svg';
import apiClient from "../../API Calls/APIClient";
import moment from "moment";
import {getImageLink,formatDateTime } from '../../common/commonFn';
import { toast } from "react-toastify";
import ImportSheet from "../../common/ImportSheet";

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
    const [confirmationwanted, setconfirmationwanted] = useState("");
    const [selectedProvince, setSelectedProvince] = useState('all');
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
    const [sapsWantedPageFilter, setSapsWantedPageFilter] = useState("");
    const handleFilterApply = (data) => {

        const params = Object.fromEntries(
            Object.entries(data).filter(
                ([_, value]) => value !== "" && value !== undefined && value !== null
            )
        );

        const filterText = new URLSearchParams(params).toString();
        setSapsWantedPageFilter(filterText)
    };
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedWantedObj, setSelectedWantedObj] = useState(null);

    const handleOpenMenu = (event,selectedObj) => {
        setAnchorEl(event.currentTarget);
        setSelectedWantedObj(selectedObj)
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
        setSelectedWantedObj(null);
    };
    const handleProvinceChange = (event) => {
        setSelectedProvince(event.target.value);
    };

    const [searchParamsMember, setSearchParamsMember] = useSearchParams();
    const startDateParamMember = searchParamsMember.get("startDateMember") || startOfYear(new Date()).toISOString();
    const endDateParamMember = searchParamsMember.get("endDateMember") || new Date().toISOString();
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
    const SAPS_Page_API_Data = useGetSAPSWantedPageData(sapsWantedPageFilter)
    const SAPS_Page_ObjData = SAPS_Page_API_Data.data?.data || {}

    const chartData = SAPS_Page_ObjData?.CriminalCapturedVsWantedVsSightings || [];

    const SAPS_Wanted_Responce = useGetChatGroupsMembers("group member list", "",group_id, currentPage, rowsPerPage, filter, locationFilter, startDate, endDate, sortBy, sortOrder);
    const totalData = SAPS_Wanted_Responce.data?.data?.totaldata || 0;
    const totalPages = Math.ceil(totalData / rowsPerPage);
    
    const SAPS_Members_Responce = useGetChatGroupsMessageList("group message list", "",group_id, currentPageMember, rowsPerPageMember, filterMember, locationFilterMember, startDateMember, endDateMember, sortByMember, sortOrderMember);
    const totalMemberData = SAPS_Members_Responce.data?.data?.totaldata || 0;
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

    const handleView = (url) => {
        saveScrollPosition("GroupMemberListScroll");
        nav(url);
    };
    useEffect(() => {
        if (SAPS_Wanted_Responce.data?.data?.totaldata) {
            restoreScrollPosition("GroupMemberListScroll");
        }
        if (SAPS_Members_Responce.data?.data?.totaldata) {
            restoreScrollPosition("GroupMemberListScroll");
        }
    }, [SAPS_Wanted_Responce.data?.data?.totaldata,SAPS_Members_Responce.data?.data?.totaldata]);


    return (
        <Box>
            <Grid sx={{ backgroundColor: 'white', p: 3, mt: '-25px' }} container justifyContent="space-between" alignItems="center" spacing={2} mb={3}>
                <Grid size={{ xs: 12, md: 5, lg: 6 }}>

                </Grid>
            </Grid>
            <Box p={2}>
                <Grid container spacing={3} mb={5}>
                    <Grid size={{ xs: 12, md: 4, lg: 3 }} sx={{}}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: { xs: 5, lg: 1 }, backgroundColor: '#367BE01A', borderRadius: '16px', px: 3, py: 5 }}>
                            <Box>
                                <Typography variant="body2" fontWeight={400} sx={{fontSize:"14px"}}>Users Reached</Typography>
                                {SAPS_Page_API_Data.isFetching ? (
                                        <Skeleton variant="text" width={60} height={40} />
                                    ) : (
                                        <Typography variant="h3" fontWeight={600}>{SAPS_Page_ObjData?.usersReached}</Typography>
                                    )
                                }
                                {SAPS_Page_API_Data.isFetching ? (
                                    <Skeleton variant="text" width={60} height={40} />
                                ) : (
                                    SAPS_Page_ObjData?.percentageObjData.usersReached > 0 ? (

                                        <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px", color: '#22C55E' }}>+{SAPS_Page_ObjData?.percentageObjData.usersReached}% from last month</Typography>
                                    ) : SAPS_Page_ObjData?.percentageObjData.usersReached === 0 ? (
                                        <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px", color: '#22C55E' }}>{SAPS_Page_ObjData?.percentageObjData.usersReached}% from last month</Typography>
                                    ) : <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px", color: '#e5565a' }}>{SAPS_Page_ObjData?.percentageObjData.usersReached}% from last month</Typography>

                                )
                                }
                            </Box>
                            <Box>
                                <img src={SapsIcon1} alt="ReportIcon" />
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
                <Box p={2}>
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
                                    onChange={(e) => updateParams({filter:e.target.value})}
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
                                                        id="full_name"
                                                        active={sortBy === 'full_name'}
                                                        direction={sortOrder}
                                                        onClick={changeSortOrder}
                                                        IconComponent={() => <img src={sortBy === 'full_name' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                    >User Code
                                                    </TableSortLabel></TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', minWidth: 150 }}>
                                                    <TableSortLabel
                                                        id="aliases"
                                                        active={sortBy === 'aliases'}
                                                        direction={sortOrder}
                                                        onClick={changeSortOrder}
                                                        IconComponent={() => <img src={sortBy === 'aliases' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                    >Real Name (Admin Only)
                                                    </TableSortLabel></TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', minWidth: 150 }}>
                                                    <TableSortLabel
                                                        id="case_number"
                                                        active={sortBy === 'case_number'}
                                                        direction={sortOrder}
                                                        onClick={changeSortOrder}
                                                        IconComponent={() => <img src={sortBy === 'case_number' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                    >Join Time
                                                    </TableSortLabel></TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', minWidth: 150 }}>
                                                    <TableSortLabel
                                                        id="investigating_officer_name"
                                                        active={sortBy === 'investigating_officer_name'}
                                                        direction={sortOrder}
                                                        onClick={changeSortOrder}
                                                        IconComponent={() => <img src={sortBy === 'investigating_officer_name' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                    >Last Active
                                                    </TableSortLabel></TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', minWidth: 150 }}>
                                                    <TableSortLabel
                                                        id="police_unit_id"
                                                        active={sortBy === 'police_unit_id'}
                                                        direction={sortOrder}
                                                        onClick={changeSortOrder}
                                                        IconComponent={() => <img src={sortBy === 'police_unit_id' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
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
                                                        <Stack direction="row" alignItems="center" gap={1}>
                                                            <Avatar
                                                                src={user?.user?.profile_image || nouser}
                                                                alt="User"
                                                            />
                                                            {user?.user?.first_name} {user?.user?.last_name}
                                                        </Stack>
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        {moment(user.crime_date).isSame(moment(), "day")
                                                            ? `Today, ${moment(user.crime_date).format("hh:mm A")}`
                                                            : formatDateTime(user.crime_date,"HH:mm:ss - DD/MM/YYYY")}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        {moment(user.crime_date).isSame(moment(), "day")
                                                            ? `Today, ${moment(user.crime_date).format("hh:mm A")}`
                                                            : formatDateTime(user.crime_date,"HH:mm:ss - DD/MM/YYYY")}
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
                                                                <IconButton onClick={() => handleView(`/home/total-saps-wanted/saps-member-inforamtion/${user._id}`)}>
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
                                                    updateParams({rowsPerPage:Number(e.target.value),currentPage:1});
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
                                                onClick={() => updateParams({currentPage:currentPage - 1})}
                                            >
                                                <NavigateBeforeIcon fontSize="small" sx={{
                                                    color: currentPage === 1 ? '#BDBDBD' : '#1976d2'
                                                }} />
                                            </IconButton>
                                            <IconButton
                                                disabled={currentPage === totalPages}
                                                onClick={() => updateParams({currentPage:currentPage + 1})}
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
                                <Typography variant="h6" fontWeight={590}>Message Log</Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 8 }} sx={{ display: 'flex', justifyContent: 'flex-end', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>

                                <TextField
                                    variant="outlined"
                                    placeholder="Search"
                                    value={filterMember}
                                    onChange={(e) => updateMembersParams({filterMember:e.target.value})}
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
                                                        id="first_name"
                                                        active={sortByMember === 'first_name'}
                                                        direction={sortOrderMember}
                                                        onClick={changeSortOrderMember}
                                                        IconComponent={() => <img src={sortByMember === 'first_name' ? sortOrderMember === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                    >Message</TableSortLabel>
                                                </TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', minWidth: 150 }}>
                                                    <TableSortLabel
                                                        id="police_unit"
                                                        active={sortByMember === 'police_unit'}
                                                        direction={sortOrderMember}
                                                        onClick={changeSortOrderMember}
                                                        IconComponent={() => <img src={sortByMember === 'police_unit' ? sortOrderMember === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                    >Group Name</TableSortLabel>
                                                </TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', minWidth: 150 }}>
                                                    <TableSortLabel
                                                        id="mobile_no"
                                                        active={sortByMember === 'mobile_no'}
                                                        direction={sortOrderMember}
                                                        onClick={changeSortOrderMember}
                                                        IconComponent={() => <img src={sortByMember === 'mobile_no' ? sortOrderMember === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                    >User Code</TableSortLabel>
                                                </TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', minWidth: 150 }}>
                                                    <TableSortLabel
                                                        id="email"
                                                        active={sortByMember === 'email'}
                                                        direction={sortOrderMember}
                                                        onClick={changeSortOrderMember}
                                                        IconComponent={() => <img src={sortByMember === 'email' ? sortOrderMember === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                    >Real Name</TableSortLabel>
                                                </TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', minWidth: 150 }}>
                                                    <TableSortLabel
                                                        id="email"
                                                        active={sortByMember === 'email'}
                                                        direction={sortOrderMember}
                                                        onClick={changeSortOrderMember}
                                                        IconComponent={() => <img src={sortByMember === 'email' ? sortOrderMember === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                    >Timestamp</TableSortLabel>
                                                </TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', minWidth: 150 }}>
                                                    <TableSortLabel
                                                        id="email"
                                                        active={sortByMember === 'email'}
                                                        direction={sortOrderMember}
                                                        onClick={changeSortOrderMember}
                                                        IconComponent={() => <img src={sortByMember === 'email' ? sortOrderMember === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
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
                                                                <IconButton onClick={() => handleView(`/home/total-saps-wanted/saps-member-inforamtion/${user._id}`)}>
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
                                                    updateMembersParams({rowsPerPageMember:Number(e.target.value),currentPageMember:1});
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
                                                onClick={() => updateMembersParams({currentPageMember:currentPageMember - 1})}
                                            >
                                                <NavigateBeforeIcon fontSize="small" sx={{
                                                    color: currentPageMember === 1 ? '#BDBDBD' : '#1976d2'
                                                }} />
                                            </IconButton>
                                            <IconButton
                                                disabled={currentPageMember === totalMemberPages}
                                                onClick={() => updateMembersParams({currentPageMember:currentPageMember + 1})}
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
                {popup && <ImportSheet setpopup={setpopup} type="saps-member" />}
            </Box>
        </Box>
    )
}

export default ChatGroupMemberList
