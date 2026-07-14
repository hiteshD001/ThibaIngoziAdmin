import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
    Box, Typography, TextField, Button, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Grid, InputAdornment, Avatar, Stack, Select, MenuItem, Chip,
    Tooltip,Skeleton,Tabs,Tab
} from "@mui/material";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import search from '../../assets/images/search.svg';
import ViewBtn from '../../assets/images/ViewBtn.svg'
import delBtn from '../../assets/images/delBtn.svg'
import whiteplus from '../../assets/images/whiteplus.svg';
import { useGetSubscriptionTypesOfUsers, usePutIsArchived, useGetSAPSWantedPageData } from "../../API Calls/API";
import Loader from "../../common/Loader";
import CustomFilter from '../../common/Custom/CustomFilter'
import ImportSheet from "../../common/ImportSheet";
import CustomExportMenu from '../../common/Custom/CustomExport'
import CustomDateRangePicker from "../../common/Custom/CustomDateRangePicker";
import calender from '../../assets/images/calender.svg';
import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable'
import * as XLSX from 'xlsx';
import { toast } from "react-toastify";
import { startOfYear } from "date-fns";
import { DeleteConfirm } from "../../common/ConfirmationPOPup";
import nouser from "../../assets/images/NoUser.png";
import moment from "moment";
import { saveScrollPosition, restoreScrollPosition } from "../../common/ScrollPosition";
import SapsIcon1 from '../../assets/images/SapsIcon1.svg'
import SapsIcon2 from '../../assets/images/SapsIcon2.svg'
import SapsIcon3 from '../../assets/images/SapsIcon3.svg'
import SapsIcon4 from '../../assets/images/SapsIcon4.svg'
import SapsIcon5 from '../../assets/images/SapsIcon5.svg'
import SapsIcon6 from '../../assets/images/SapsIcon6.svg'
import ReloadIcn from '../../assets/images/reloadIcn.svg'
import CancelIcn from '../../assets/images/cancelIcn.svg'
import {formatDateTime } from '../../common/commonFn';

const TAB_CONFIG = {
  ACTIVE_SUBSCRIPTION: "Most Active Advance Users",
  SUSPENDED_SUBSCRIPTION: "Suspended Users",
  EXPIRED_SUBSCRIPTION: "Expired Users",
  CANCEL_SUBSCRIPTION: "Cancel Subscription Users",
  SOS_TYPES_REVENUE: "SOS Types Revenue",
};

const SubscriptionManagement = () => {
    const [popup, setpopup] = useState(false);
    const nav = useNavigate();
    const [role] = useState(localStorage.getItem("role"));
    const params = useParams();
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
    const rowsPerPage = Number(searchParams.get("rowsPerPage")) || 10;
    const [isExporting, setIsExporting] = useState(false);
    const [confirmation, setconfirmation] = useState("");
    const [archived, setArchived] = useState(false)

    const SAPS_Page_API_Data = useGetSAPSWantedPageData()
    const SAPS_Page_ObjData = SAPS_Page_API_Data.data?.data || {}
    
    // Sort
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("asc");
    const [tab, setTab] = useState('ACTIVE_SUBSCRIPTION');
    const [SubHeader, setSubHeader] = useState(TAB_CONFIG.ACTIVE_SUBSCRIPTION);
    const handleTabsSelection = (event, newValue) => {
        setTab(newValue);
        setSubHeader(TAB_CONFIG[newValue]);
    };

    const changeSortOrder = (e) => {
        const field = e.target.id;

        if (field !== sortBy) {
            setSortBy(field);
            setSortOrder("asc");
        } else {
            setSortOrder(p => p === 'asc' ? 'desc' : 'asc')
        }
    }

    let companyId = localStorage.getItem("userID");
    const paramId = role === "company" ? companyId : params.id;
    const startDate = range[0].startDate.toISOString();
    const endDate = range[0].endDate.toISOString();

    const UserList = useGetSubscriptionTypesOfUsers("police unit list", "company", currentPage, rowsPerPage, filter,tab, startDate, endDate, sortBy, sortOrder);

    const totalpoliceUnitData = UserList.data?.data?.totaldata || 0;
    const totalPages = Math.ceil(totalpoliceUnitData / rowsPerPage);

    const updateTripMutation = usePutIsArchived(
        (id, data) => {
            toast.success("Crime Report Archived Successfully")

            UserList.refetch();
        },
        (error) => {
            console.error('Error updating trip:', error);
        }
    );


    const handleExport = async ({ startDate, endDate, exportFormat }) => {
        try {
            const data = UserList.data?.data

            const allUsers = data?.data || [];

            if (!allUsers.length) {
                toast.warning("No Police Unit data found for this period.");
                return;
            }

            const exportData = allUsers.map(user => ({
                "Police Unit": `${user.police_unit_name || ''}` || '',
                "Contact Name": user.contact_name || '',
                "Contact No.": `${user.mobile_no_country_code || ''}${user.mobile_no || ''}`,
                "Contact Email": user.email || ''
            }));

            if (exportFormat === "xlsx") {
                const worksheet = XLSX.utils.json_to_sheet(exportData);
                const columnWidths = Object.keys(exportData[0] || {}).map((key) => ({
                    wch: Math.max(key.length, ...exportData.map((row) => String(row[key] ?? 'NA').length)) + 2
                }));
                worksheet['!cols'] = columnWidths;
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, "Police_Units");
                XLSX.writeFile(workbook, "Ploice_Unit_List.xlsx");
            }
            else if (exportFormat === "csv") {
                const worksheet = XLSX.utils.json_to_sheet(exportData);
                const csv = XLSX.utils.sheet_to_csv(worksheet);
                const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'Ploice_Unit_list.csv';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
            else if (exportFormat === "pdf") {
                const doc = new jsPDF();
                doc.text('Police Unit List', 14, 16);
                autoTable(doc, {
                    head: [['Police Unit', 'Contact Name', 'Contact No.', 'Contact Email']],
                    body: allUsers.map(user => [
                        `${user.police_unit_name || ''}` ?? 'NA',
                        user.contact_name ?? 'NA',
                        `${user.mobile_no_country_code || ''}${user.mobile_no || ''}` ?? 'NA',
                        user.email ?? 'NA'
                    ]),
                    startY: 20,
                    theme: 'striped',
                    headStyles: { fillColor: '#367BE0' },
                    margin: { top: 20 },
                    styles: { fontSize: 10 },
                });
                doc.save("Ploice_Unit_List.pdf");
            }

        } catch (err) {
            console.error("Error exporting data:", err);
            toast.error("Export failed.");
        }
    };

    const handleFilterData = (data) => {

        const params = Object.fromEntries(
            Object.entries(data).filter(
                ([_, value]) => value !== "" && value !== undefined && value !== null
            )
        );

        const filterText = new URLSearchParams(params).toString();
        updateParams({locationFilter:filterText})
    };

    const updateParams = (newParams) => {
        setSearchParams({
            currentPage,
            rowsPerPage: rowsPerPage,
            startDate: startDateParam,
            endDate: endDateParam,
            filter,
            locationFilter,
            ...newParams,
        });
    };

    // Handle Scroll Event store 
    const handleView = (report) => {
        saveScrollPosition("subscriptionListScroll");
        // nav(`/home/police-unit/police-unit-information/${report._id}`)
    };
    useEffect(() => {
        if (UserList.data?.data.data.length) {
            restoreScrollPosition("subscriptionListScroll");
        }
    }, [UserList.data?.data.data]);

    return (
        <Box>
            <Box p={2}>
                <Grid container spacing={3} mb={5}>
                    <Grid size={{ xs: 12, md: 4, lg: 3 }} sx={{}}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: { xs: 5, lg: 1 }, backgroundColor: '#367BE01A', borderRadius: '16px', px: 3, py: 5 }}>
                            <Box>
                                <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px" }}>Users Reached</Typography>
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
                    <Grid size={{ xs: 12, md: 4, lg: 3 }} sx={{}}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: { xs: 5, lg: 1 }, backgroundColor: '#22C55E1A', borderRadius: '16px', px: 3, py: 5 }}>
                            <Box>
                                <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px" }}>Social Shares</Typography>
                                {SAPS_Page_API_Data.isFetching ? (
                                    <Skeleton variant="text" width={60} height={40} />
                                ) : (
                                    <Typography variant="h3" fontWeight={600}>{SAPS_Page_ObjData?.socialShares}</Typography>
                                )
                                }
                                {SAPS_Page_API_Data.isFetching ? (
                                    <Skeleton variant="text" width={60} height={40} />
                                ) : (
                                    SAPS_Page_ObjData?.percentageObjData.socialShares > 0 ? (

                                        <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px", color: '#22C55E' }}>+{SAPS_Page_ObjData?.percentageObjData.socialShares}% from last month</Typography>
                                    ) : SAPS_Page_ObjData?.percentageObjData.socialShares === 0 ? (
                                        <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px", color: '#22C55E' }}>{SAPS_Page_ObjData?.percentageObjData.socialShares}% from last month</Typography>
                                    ) : <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px", color: '#e5565a' }}>{SAPS_Page_ObjData?.percentageObjData.socialShares}% from last month</Typography>

                                )
                                }
                            </Box>
                            <Box>
                                <img src={SapsIcon2} alt="ReportIcon" />
                            </Box>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4, lg: 3 }} >
                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: { xs: 5, lg: 1 }, backgroundColor: '#F973161A', borderRadius: '16px', px: 2, py: 5 }}>
                            <Box>
                                <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px" }}>Sighting Submissions</Typography>
                                {SAPS_Page_API_Data.isFetching ? (
                                    <Skeleton variant="text" width={60} height={40} />
                                ) : (
                                    <Typography variant="h3" fontWeight={600}>{SAPS_Page_ObjData?.sightingSubmissions}</Typography>
                                )
                                }
                                {SAPS_Page_API_Data.isFetching ? (
                                    <Skeleton variant="text" width={60} height={40} />
                                ) : (
                                    SAPS_Page_ObjData?.percentageObjData.sightingSubmissions > 0 ? (

                                        <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px", color: '#22C55E' }}>+{SAPS_Page_ObjData?.percentageObjData.sightingSubmissions}% from last month</Typography>
                                    ) : SAPS_Page_ObjData?.percentageObjData.sightingSubmissions === 0 ? (
                                        <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px", color: '#22C55E' }}>{SAPS_Page_ObjData?.percentageObjData.sightingSubmissions}% from last month</Typography>
                                    ) : <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px", color: '#e5565a' }}>{SAPS_Page_ObjData?.percentageObjData.sightingSubmissions}% from last month</Typography>

                                )
                                }
                            </Box>
                            <Box>
                                <img src={SapsIcon3} alt="ReportIcon" />
                            </Box>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4, lg: 3 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: { xs: 5, lg: 1 }, backgroundColor: '#A855F71A', borderRadius: '16px', px: 3, py: 5 }}>
                            <Box>
                                <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px" }}>Avg Alert Open Rate</Typography>
                                {SAPS_Page_API_Data.isFetching ? (
                                    <Skeleton variant="text" width={60} height={40} />
                                ) : (
                                    <Typography variant="h3" fontWeight={600}>{SAPS_Page_ObjData?.avgAlertOpenRate}</Typography>
                                )
                                }
                                {SAPS_Page_API_Data.isFetching ? (
                                    <Skeleton variant="text" width={60} height={40} />
                                ) : (
                                    SAPS_Page_ObjData?.percentageObjData.avgAlertOpenRate > 0 ? (

                                        <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px", color: '#22C55E' }}>+{SAPS_Page_ObjData?.percentageObjData.avgAlertOpenRate}% from last month</Typography>
                                    ) : SAPS_Page_ObjData?.percentageObjData.avgAlertOpenRate === 0 ? (
                                        <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px", color: '#22C55E' }}>{SAPS_Page_ObjData?.percentageObjData.avgAlertOpenRate}% from last month</Typography>
                                    ) : <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px", color: '#e5565a' }}>{SAPS_Page_ObjData?.percentageObjData.avgAlertOpenRate}% from last month</Typography>
                                )
                                }
                            </Box>
                            <Box>
                                <img src={SapsIcon4} alt="LocationIcon" />
                            </Box>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4, lg: 3 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: { xs: 5, lg: 1 }, backgroundColor: '#F973161A', borderRadius: '16px', px: 3, py: 5 }}>
                            <Box>
                                <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px" }}>Wanted People</Typography>
                                {SAPS_Page_API_Data.isFetching ? (
                                    <Skeleton variant="text" width={60} height={40} />
                                ) : (
                                    <Typography variant="h3" fontWeight={600}>{SAPS_Page_ObjData?.wantedPeople}</Typography>
                                )
                                }
                                {SAPS_Page_API_Data.isFetching ? (
                                    <Skeleton variant="text" width={60} height={40} />
                                ) : (
                                    SAPS_Page_ObjData?.percentageObjData.wantedPeople > 0 ? (
                                        <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px", color: '#22C55E' }}>+{SAPS_Page_ObjData?.percentageObjData.wantedPeople}% from last month</Typography>
                                    ) : SAPS_Page_ObjData?.percentageObjData.wantedPeople === 0 ? (
                                        <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px", color: '' }}>{SAPS_Page_ObjData?.percentageObjData.wantedPeople}% from last month</Typography>
                                    ) : <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px", color: '#e5565a' }}>{SAPS_Page_ObjData?.percentageObjData.wantedPeople}% from last month</Typography>

                                )
                                }
                            </Box>
                            <Box>
                                <img src={SapsIcon5} alt="DangerIcon" />
                            </Box>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4, lg: 3 }} sx={{}}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: { xs: 5, lg: 1 }, backgroundColor: '#0D94881A', borderRadius: '16px', px: 3, py: 5 }}>
                            <Box>
                                <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px" }}>Captured People</Typography>
                                {SAPS_Page_API_Data.isFetching ? (
                                    <Skeleton variant="text" width={60} height={40} />
                                ) : (
                                    <Typography variant="h3" fontWeight={600}>{SAPS_Page_ObjData?.capturedPeople}</Typography>
                                )
                                }
                                {SAPS_Page_API_Data.isFetching ? (
                                    <Skeleton variant="text" width={60} height={40} />
                                ) : (
                                    SAPS_Page_ObjData?.percentageObjData.capturedPeople > 0 ? (
                                        <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px", color: '#22C55E' }}>+{SAPS_Page_ObjData?.percentageObjData.capturedPeople}% from last month</Typography>
                                    ) : SAPS_Page_ObjData?.percentageObjData.capturedPeople === 0 ? (
                                        <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px", color: '#22C55E' }}>{SAPS_Page_ObjData?.percentageObjData.capturedPeople}% from last month</Typography>
                                    ) : (<Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px", color: '#e5565a' }}>{SAPS_Page_ObjData?.percentageObjData.capturedPeople}% from last month</Typography>)

                                )
                                }
                            </Box>
                            <Box>
                                <img src={SapsIcon6} alt="DangerIcon" />
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
                <Paper elevation={3} sx={{ backgroundColor: "rgb(253, 253, 253)", padding: 2, borderRadius: '10px',marginBottom:'2%' }}>
                    <Tabs
                        value={tab}
                        onChange={handleTabsSelection}
                        textColor="primary"
                        indicatorColor="primary"
                        variant="scrollable"
                        scrollButtons="auto"
                    >
                        <Tab label="Active Subscriptions" value="ACTIVE_SUBSCRIPTION"/>
                        <Tab label="Suspended Subscriptions" value="SUSPENDED_SUBSCRIPTION" />
                        <Tab label="Expired Subscriptions" value="EXPIRED_SUBSCRIPTION"/>
                        <Tab label="Cancel Subscriptions" value="CANCEL_SUBSCRIPTION"/>
                        <Tab label="SOS Types Revenue" value="SOS_TYPES_REVENUE"/>
                    </Tabs>
                </Paper>
                <Paper elevation={3} sx={{ backgroundColor: "rgb(253, 253, 253)", padding: 2, borderRadius: '10px' }}>
                    <Grid container justifyContent="space-between" alignItems="center" mb={2}>
                        <Grid size={{ xs: 12, lg: 3 }} sx={{ display: 'flex', flexDirection: 'row', gap: 2, mb: { xs: 1, md: 0 } }}>
                            <Typography variant="h6" fontWeight={590}>{SubHeader}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, lg: 9 }} sx={{ display: 'flex', justifyContent: 'flex-end', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mt: { xs: 2, lg: 0 } }}>

                            {/* <TextField
                                variant="outlined"
                                placeholder="Search"
                                value={filter}
                                onChange={(e) => updateParams({filter:e.target.value})}
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
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: 'var(--light-gray)',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'var(--light-gray)',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: 'var(--light-gray)',
                                        },
                                    },
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <img src={search} alt="search icon" />
                                        </InputAdornment>
                                    ),
                                }}
                            /> */}
                            <Box display="flex" sx={{ justifyContent: { xs: 'space-between' } }} gap={1}>
                                {/* <CustomFilter onApply={handleFilterData} isSuburbVisible ={false} />
                                <CustomDateRangePicker
                                    borderColor={'var(--light-gray)'}
                                    value={range}
                                    onChange={(nextRange) => {
                                        setRange(nextRange);
                                        updateParams({
                                            startDate: new Date(nextRange[0].startDate).toISOString(),
                                            endDate: new Date(nextRange[0].endDate).toISOString(),
                                        });
                                    }}
                                    icon={calender}
                                />

                                <Button variant="contained" onClick={() => nav("/home/police-unit/add-police-unit")} sx={{ height: '40px', fontSize: '0.8rem', width: '150px', borderRadius: '8px' }}
                                    startIcon={<img src={whiteplus} alt='white plus' />}>
                                    Add Police Unit
                                </Button> */}
                                <CustomExportMenu onExport={handleExport} />
                            </Box>

                        </Grid>
                    </Grid>
                    <Box sx={{ px: { xs: 0, md: 2 }, pt: { xs: 0, md: 3 }, backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
                        <TableContainer >
                            {tab !== 'SOS_TYPES_REVENUE' && <Table sx={{ '& .MuiTableCell-root': { fontSize: '15px' } }}>
                                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                    <TableRow >
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', borderTopLeftRadius: '10px' }}>Subscriber</TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Status</TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Start Date</TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Expiry Date</TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Amount Paid</TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Payment Method</TableCell>
                                        <TableCell align="center" sx={{ backgroundColor: '#F9FAFB', borderTopRightRadius: '10px', color: '#4B5563' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {UserList.isFetching ?
                                        (<TableRow>
                                            <TableCell sx={{ color: '#4B5563', borderBottom: 'none' }} colSpan={10} align="center">
                                                <Loader />
                                            </TableCell>
                                        </TableRow>)
                                        : (UserList.data?.data.data?.length > 0 ?
                                            UserList.data?.data.data.map((report) => (

                                                <TableRow key={report._id}>
                                                    <TableCell sx={{ color: 'var(--Blue)' }}>
                                                        <Stack direction="row" alignItems="center" gap={1}>
                                                            <Avatar
                                                                src={report?.selfieImage || nouser}
                                                                alt="User"
                                                            />

                                                            {report.first_name} {report.last_name}
                                                        </Stack>
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        <Chip
                                                            label={
                                                                report.subscription_status === 'active' ? 'Active' :
                                                                    report.subscription_status === 'inactive' ? 'Expired' :
                                                                        report.subscription_status == 'suspended' ? 'Suspended' :
                                                                            report.isCancelEnroll ? 'Cancel' : '-'
                                                            }
                                                            sx={{
                                                                backgroundColor:
                                                                    report.subscription_status === 'active' ? '#DCFCE7' :
                                                                        report.subscription_status === 'inactive' ? '#E5393533' :
                                                                            report.subscription_status == 'suspended' ? '#FFA72633' :
                                                                                report.isCancelEnroll ? '#F3F4F6' :
                                                                                    '#FEF9C3',
                                                                '& .MuiChip-label': {
                                                                    textTransform: 'capitalize',
                                                                    color: report.subscription_status === 'active' ? 'green' :
                                                                        report.subscription_status === 'inactive' ? '#E53935' :
                                                                            report.subscription_status == 'suspended' ? '#FFA726' :
                                                                                report.isCancelEnroll ? '#1F2937' :
                                                                                    'black',
                                                                }
                                                            }}
                                                        />
                                                    </TableCell>
                                                     <TableCell sx={{ color: '#4B5563' }}>
                                                        {report.EnrollStartDate ? formatDateTime(report.EnrollStartDate, "MMM DD, YYYY") : '-'}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        {report.paymentDate ? formatDateTime(report.paymentDate, "MMM DD, YYYY") : '-'}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>

                                                        {report?.EnrollAmount || "-"}

                                                    </TableCell>
                                                    <TableCell sx={{ color: 'black' }}>

                                                        {report?.subscription?.paymentMethod}

                                                    </TableCell>
                                                    <TableCell >
                                                        <Box align="center" sx={{ display: 'flex', flexDirection: 'row' }}>
                                                            <Tooltip title="View" arrow placement="top">
                                                                <IconButton onClick={() => handleView(report)}>
                                                                    <img src={ViewBtn} alt="flagged button" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Delete" arrow placement="top">
                                                                <IconButton onClick={() => setconfirmation(report?._id)}>
                                                                    <img src={delBtn} alt="delete button" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Renew" arrow placement="top">
                                                                <IconButton onClick={() => setconfirmation(report?._id)}>
                                                                    <img src={ReloadIcn} alt="Renew button" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Cancel" arrow placement="top">
                                                                <IconButton onClick={() => setconfirmation(report?._id)}>
                                                                    <img src={CancelIcn} alt="Cancel button" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            {confirmation === report?._id && (
                                                                <DeleteConfirm id={report?._id} trip={"policeUnit"} setconfirmation={setconfirmation} />
                                                            )}
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
                            </Table>}

                            {tab === 'SOS_TYPES_REVENUE' && <Table sx={{ '& .MuiTableCell-root': { fontSize: '15px' } }}>
                                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                    <TableRow >
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', borderTopLeftRadius: '10px' }}>SOS Type</TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Description</TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Revenue</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {UserList.isFetching ?
                                        (<TableRow>
                                            <TableCell sx={{ color: '#4B5563', borderBottom: 'none' }} colSpan={10} align="center">
                                                <Loader />
                                            </TableCell>
                                        </TableRow>)
                                        : (UserList.data?.data.data?.length > 0 ?
                                            UserList.data?.data.data.map((report) => (
                                                
                                                <TableRow key={report._id}>
                                                    <TableCell sx={{ color: '#0E0E0E',fontWeight:500 }}>
                                                        {report.display_title}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        {report?.descitption || '-'}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        R{Number(report?.totalAmount || 0).toLocaleString()}
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
                            </Table>}

                        </TableContainer>

                        {!UserList.isFetching && UserList.data?.data.data.length > 0 &&
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
                            </Grid>}
                    </Box>
                </Paper>
                {popup && <ImportSheet setpopup={setpopup} type="user" />}
            </Box>
        </Box>
    );
}
export default SubscriptionManagement;
