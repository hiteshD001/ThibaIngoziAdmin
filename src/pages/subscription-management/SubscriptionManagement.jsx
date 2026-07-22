import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
    Box, Typography, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Grid, Avatar, Stack, Select, MenuItem, Chip,
    Tooltip,Skeleton,Tabs,Tab,Menu,Dialog, DialogContent, Button,TableSortLabel
} from "@mui/material";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import ViewBtn from '../../assets/images/ViewBtn.svg'
import { useGetSubscriptionTypesOfUsers, useGetSubscriptionPageData, usePutUserSubscriptionStatus } from "../../API Calls/API";
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
import nouser from "../../assets/images/NoUser.png";
import { saveScrollPosition, restoreScrollPosition } from "../../common/ScrollPosition";
import subscription_card_1 from '../../assets/images/subscription_card_1.svg'
import subscription_card_2 from '../../assets/images/subscription_card_2.svg'
import subscription_card_3 from '../../assets/images/subscription_card_3.svg'
import subscription_card_4 from '../../assets/images/subscription_card_4.svg'
import subscription_card_5 from '../../assets/images/subscription_card_5.svg'
import subscription_card_6 from '../../assets/images/subscription_card_6.svg'
import subscription_card_7 from '../../assets/images/subscription_card_7.svg'
import ReloadIcn from '../../assets/images/reloadIcn.svg'
import CancelIcn from '../../assets/images/cancelIcn.svg'
import OutlinedView from '../../assets/images/OutlinedView.svg'
import Outlinedactivitylog from '../../assets/images/Outlinedactivitylog.svg'
import OutlinedPuase from '../../assets/images/OutlinedPuase.svg'
import renew_popupIcn from '../../assets/images/renew_popup.svg'
import cancel_popupIcn from '../../assets/images/cancel_popup.svg'
import puase_popupIcn from '../../assets/images/puase_popup.svg'
import {formatDateTime } from '../../common/commonFn';
import { useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import arrowup from '../../assets/images/arrowup.svg';
import arrowdown from '../../assets/images/arrowdown.svg';
import arrownuteral from '../../assets/images/arrownuteral.svg';
import TransactionHistoryPopup from "./transactionHistory";

const TAB_CONFIG = {
  ACTIVE_SUBSCRIPTION: "Most Active Advance Users",
  SUSPENDED_SUBSCRIPTION: "Suspended Users",
  EXPIRED_SUBSCRIPTION: "Expired Users",
  CANCEL_SUBSCRIPTION: "Cancel Subscription Users",
  SOS_TYPES_REVENUE: "SOS Types Revenue",
};

const SubscriptionManagement = () => {
    const [popup, setpopup] = useState(false);
    const client = useQueryClient();
    const [isRenewPopup, setisRenewPopup] = useState(false);
    const [isCancelPopup, setisCancelPopup] = useState(false);
    const [isPuasePopup, setisPuasePopup] = useState(false);
    const [isActivityLogPopup, setisActivityLogPopup] = useState(false);
    const [isTransactionPopup, setIsTransactionPopup] = useState(false);
    const [isReActivePopup, setisReActivePopup] = useState(false);
    const [selectedPopupObj, setSelectedPopupObj] = useState(null);
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
    const [anchorEl, setAnchorEl] = useState(null);

    // Sort
    const [sortBy, setSortBy] = useState("updatedAt");
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

    const startDate = range[0].startDate.toISOString();
    const endDate = range[0].endDate.toISOString();

    const SAPS_Page_API_Data = useGetSubscriptionPageData(locationFilter,startDate,endDate)
    const SAPS_Page_ObjData = SAPS_Page_API_Data.data?.data || {}
    const UserList = useGetSubscriptionTypesOfUsers("subscription list", role, currentPage, rowsPerPage, filter,tab, startDate, endDate, sortBy, sortOrder,locationFilter);

    const totalpoliceUnitData = UserList.data?.data?.totaldata || 0;
    const totalPages = Math.ceil(totalpoliceUnitData / rowsPerPage);
    const onSuccess = () => {
        toast.success("Subscription Status Updated Successfully.");
        closePopup()
        handleCloseMenu();
        client.invalidateQueries("subscription list");
    };
    const onError = (error) => {
        toast.error(error.response.data.message || "Something went Wrong",);
        closePopup()
        handleCloseMenu();
    };
    const { mutate } = usePutUserSubscriptionStatus(onSuccess, onError);

    const handleFilterApply = (data) => {

        const params = Object.fromEntries(
            Object.entries(data).filter(
                ([_, value]) => value !== "" && value !== undefined && value !== null
            )
        );

        const filterText = new URLSearchParams(params).toString();
        updateParams({locationFilter:filterText})
    };

    const handleExport = async ({ exportFormat }) => {
        try {
            const data = UserList.data?.data

            const allUsers = data?.data || [];
            if (!allUsers.length) {
                toast.warning("No data found for this period.");
                return;
            }
            if(tab === 'SOS_TYPES_REVENUE'){
                const exportData = allUsers.map(user => ({
                    "SOS Type": user?.display_title || '',
                    "Description":user?.descitption || '',
                    "Revenue": `R${Number(user?.totalAmount || 0).toLocaleString()}`,
                   
                }));
    
                if (exportFormat === "xlsx") {
                    const worksheet = XLSX.utils.json_to_sheet(exportData);
                    const columnWidths = Object.keys(exportData[0] || {}).map((key) => ({
                        wch: Math.max(key.length, ...exportData.map((row) => String(row[key] ?? 'NA').length)) + 2
                    }));
                    worksheet['!cols'] = columnWidths;
                    const workbook = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(workbook, worksheet, "Subscriptions");
                    XLSX.writeFile(workbook, "Subscriptions_List.xlsx");
                }
                else if (exportFormat === "csv") {
                    const worksheet = XLSX.utils.json_to_sheet(exportData);
                    const csv = XLSX.utils.sheet_to_csv(worksheet);
                    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = 'Subscriptions_list.csv';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
                else if (exportFormat === "pdf") {
                    const doc = new jsPDF();
                    doc.text('Subscription List', 14, 16);
                    autoTable(doc, {
                        head: [['SOS Type', 'Description', 'Revenue']],
                        body: allUsers.map(user => [
                            `${user?.display_title}` || '',
                            `${user?.descitption  || ''}`,
                            `R${Number(user?.totalAmount || 0).toLocaleString()}`,
                        ]),
                        startY: 20,
                        theme: 'striped',
                        headStyles: { fillColor: '#367BE0' },
                        margin: { top: 20 },
                        styles: { fontSize: 10 },
                    });
                    doc.save("Subscriptions_List.pdf");
                }
            }else{
                const exportData = allUsers.map(user => ({
                    "Subscriber": `${user?.first_name || ''} ${user?.last_name || ''}`.trim(),
                    "Status": user.subscription_status || '',
                    "Start Date": `${user.EnrollStartDate ? formatDateTime(user.EnrollStartDate, "MMM DD, YYYY") : '-'}`,
                    "Expiry Date": `${user.paymentDate ? formatDateTime(user.paymentDate, "MMM DD, YYYY") : '-'}`,
                    "Amount": user.EnrollAmount || '',
                    "Payment Method": user?.subscription?.paymentMethod || ''
                }));
    
                if (exportFormat === "xlsx") {
                    const worksheet = XLSX.utils.json_to_sheet(exportData);
                    const columnWidths = Object.keys(exportData[0] || {}).map((key) => ({
                        wch: Math.max(key.length, ...exportData.map((row) => String(row[key] ?? 'NA').length)) + 2
                    }));
                    worksheet['!cols'] = columnWidths;
                    const workbook = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(workbook, worksheet, "Subscriptions");
                    XLSX.writeFile(workbook, "Subscriptions_List.xlsx");
                }
                else if (exportFormat === "csv") {
                    const worksheet = XLSX.utils.json_to_sheet(exportData);
                    const csv = XLSX.utils.sheet_to_csv(worksheet);
                    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = 'Subscriptions_list.csv';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
                else if (exportFormat === "pdf") {
                    const doc = new jsPDF();
                    doc.text('Subscription List', 14, 16);
                    autoTable(doc, {
                        head: [['Subscriber', 'Status', 'Start Date', 'Expiry Date','Amount','Payment Method']],
                        body: allUsers.map(user => [
                            `${user?.first_name || ''} ${user?.last_name || ''}`.trim(),
                            `${user.subscription_status}` || '',
                            `${user.EnrollStartDate ? formatDateTime(user.EnrollStartDate, "MMM DD, YYYY") : '-'}`,
                            `${user.paymentDate ? formatDateTime(user.paymentDate, "MMM DD, YYYY") : '-'}`,
                            `${user.EnrollAmount}` || '',
                            `${user?.subscription?.paymentMethod}` || ''
                        ]),
                        startY: 20,
                        theme: 'striped',
                        headStyles: { fillColor: '#367BE0' },
                        margin: { top: 20 },
                        styles: { fontSize: 10 },
                    });
                    doc.save("Subscriptions_List.pdf");
                }
            }

        } catch (err) {
            console.error("Error exporting data:", err);
            toast.error("Export failed.");
        }
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

    const openPopup = (Obj,type) => {
        setSelectedPopupObj(Obj);
        if(type === 'puase'){
            setisPuasePopup(true);
        }else if(type === 'renew'){
            setisRenewPopup(true);
        }else if(type === 'cancel'){
            setisCancelPopup(true);
        }else if(type === 'activitylog'){
            setisActivityLogPopup(true);
        }else if(type === 'transactions'){
            setIsTransactionPopup(true);
        }else if(type === 're-active'){
            setisReActivePopup(true);
        }
    };

    const closePopup = () => {
        setisCancelPopup(false);
        setisRenewPopup(false);
        setisPuasePopup(false);
        setisActivityLogPopup(false);
        setisReActivePopup(false);
        setSelectedPopupObj(null);
    };

    const handleOpenMenu = (event,data) => {
        setAnchorEl(event.currentTarget);
        setSelectedPopupObj(data)
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
        setSelectedPopupObj(null)
    };

    const handleConfirmation = (id,data) => {
        mutate({ id:id, data});
    };

    // Handle Scroll Event store 
    const handleView = (report) => {
        saveScrollPosition("subscriptionListScroll");
        nav(`/home/subscription-management/subscription-information/${report._id}`)
    };
    useEffect(() => {
        if (UserList.data?.data.data.length) {
            restoreScrollPosition("subscriptionListScroll");
        }
    }, [UserList.data?.data.data]);

    return (
        <Box>
            <Grid sx={{ backgroundColor: 'white', p: 3, mt: '-25px' }} container justifyContent="space-between" alignItems="center" spacing={2} mb={3}>
                <Grid size={{ xs: 12, md: 5, lg: 6 }}>

                </Grid>

                <Grid size={{ xs: 12, md: 7, lg: 6 }}>
                    <Box display="flex" sx={{ justifyContent: { md: 'flex-end', sm: 'space-around' } }} gap={2} flexWrap="wrap">
                        <Box display="flex" sx={{ justifyContent: { md: 'flex-end', sm: 'space-around' } }} gap={2} flexWrap="wrap">
                            <CustomFilter onApply={handleFilterApply} isSuburbVisible={false} />
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
                        </Box>
                    </Box>
                </Grid>
            </Grid>
            <Box p={2}>
                <Grid container spacing={3} mb={5}>
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4}} sx={{}}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: { xs: 5, lg: 1 }, backgroundColor: '#22C55E1A', borderRadius: '16px', px: 3, py: 5 }}>
                            <Box>
                                <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px" }}>Total Active Subscriptions</Typography>
                                {SAPS_Page_API_Data.isFetching ? (
                                    <Skeleton variant="text" width={60} height={40} />
                                ) : (
                                    <Typography variant="h3" fontWeight={600}>{(SAPS_Page_ObjData?.totalActiveSubscriptions || 0).toFixed(2)}</Typography>
                                )
                                }
                                {SAPS_Page_API_Data.isFetching ? (
                                    <Skeleton variant="text" width={60} height={40} />
                                ) : (
                                    SAPS_Page_ObjData?.percentageObjData.totalActiveSubscriptions > 0 ? (

                                        <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px", color: '#22C55E' }}>+{(SAPS_Page_ObjData?.percentageObjData.totalActiveSubscriptions || 0).toFixed(2)}% from last month</Typography>
                                    ) : SAPS_Page_ObjData?.percentageObjData.totalActiveSubscriptions === 0 ? (
                                        <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px", color: '#22C55E' }}>{(SAPS_Page_ObjData?.percentageObjData.totalActiveSubscriptions || 0).toFixed(2)}% from last month</Typography>
                                    ) : <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px", color: '#e5565a' }}>{(SAPS_Page_ObjData?.percentageObjData.totalActiveSubscriptions || 0).toFixed(2)}% from last month</Typography>

                                )
                                }
                            </Box>
                            <Box>
                                <img src={subscription_card_6} alt="ReportIcon" />
                            </Box>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }} sx={{}}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: { xs: 5, lg: 1 }, backgroundColor: '#EFF6FF', borderRadius: '16px', px: 3, py: 5 }}>
                            <Box>
                                <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px" }}>Total Revenue from Subscriptions</Typography>
                                {SAPS_Page_API_Data.isFetching ? (
                                    <Skeleton variant="text" width={60} height={40} />
                                ) : (
                                    <Typography variant="h3" fontWeight={600}>{(SAPS_Page_ObjData?.totalRevenueFromSubscriptions || 0).toFixed(2)}</Typography>
                                )
                                }
                                {SAPS_Page_API_Data.isFetching ? (
                                    <Skeleton variant="text" width={60} height={40} />
                                ) : (
                                    SAPS_Page_ObjData?.percentageObjData.totalRevenueFromSubscriptions > 0 ? (

                                        <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px", color: '#22C55E' }}>+{(SAPS_Page_ObjData?.percentageObjData.totalRevenueFromSubscriptions || 0).toFixed(2)}% from last month</Typography>
                                    ) : SAPS_Page_ObjData?.percentageObjData.totalRevenueFromSubscriptions === 0 ? (
                                        <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px", color: '#22C55E' }}>{(SAPS_Page_ObjData?.percentageObjData.totalRevenueFromSubscriptions || 0).toFixed(2)}% from last month</Typography>
                                    ) : <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px", color: '#e5565a' }}>{(SAPS_Page_ObjData?.percentageObjData.totalRevenueFromSubscriptions || 0).toFixed(2)}% from last month</Typography>

                                )
                                }
                            </Box>
                            <Box>
                                <img src={subscription_card_7} alt="ReportIcon" />
                            </Box>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }} sx={{}}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: { xs: 5, lg: 1 }, backgroundColor: '#FFF7ED', borderRadius: '16px', px: 3, py: 5 }}>
                            <Box>
                                <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px" }}>Total Expired Subscriptions</Typography>
                                {SAPS_Page_API_Data.isFetching ? (
                                    <Skeleton variant="text" width={60} height={40} />
                                ) : (
                                    <Typography variant="h3" fontWeight={600}>{(SAPS_Page_ObjData?.totalExpiredSubscriptions || 0).toFixed(2)}</Typography>
                                )
                                }
                                {SAPS_Page_API_Data.isFetching ? (
                                    <Skeleton variant="text" width={60} height={40} />
                                ) : (
                                    SAPS_Page_ObjData?.percentageObjData.totalExpiredSubscriptions > 0 ? (

                                        <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px", color: '#22C55E' }}>+{(SAPS_Page_ObjData?.percentageObjData.totalExpiredSubscriptions || 0).toFixed(2)}% from last month</Typography>
                                    ) : SAPS_Page_ObjData?.percentageObjData.totalExpiredSubscriptions === 0 ? (
                                        <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px", color: '#22C55E' }}>{(SAPS_Page_ObjData?.percentageObjData.totalExpiredSubscriptions || 0).toFixed(2)}% from last month</Typography>
                                    ) : <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px", color: '#e5565a' }}>{(SAPS_Page_ObjData?.percentageObjData.totalExpiredSubscriptions || 0).toFixed(2)}% from last month</Typography>

                                )
                                }
                            </Box>
                            <Box>
                                <img src={subscription_card_3} alt="ReportIcon" />
                            </Box>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }} sx={{}}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: { xs: 5, lg: 1 }, backgroundColor: '#FEF2F2', borderRadius: '16px', px: 3, py: 5 }}>
                            <Box>
                                <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px" }}>Suspended Subscriptions</Typography>
                                {SAPS_Page_API_Data.isFetching ? (
                                    <Skeleton variant="text" width={60} height={40} />
                                ) : (
                                    <Typography variant="h3" fontWeight={600}>{(SAPS_Page_ObjData?.suspendedSubscriptions || 0).toFixed(2)}</Typography>
                                )
                                }
                                {SAPS_Page_API_Data.isFetching ? (
                                    <Skeleton variant="text" width={60} height={40} />
                                ) : (
                                    SAPS_Page_ObjData?.percentageObjData.suspendedSubscriptions > 0 ? (

                                        <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px", color: '#22C55E' }}>+{(SAPS_Page_ObjData?.percentageObjData.suspendedSubscriptions || 0).toFixed(2)}% from last month</Typography>
                                    ) : SAPS_Page_ObjData?.percentageObjData.suspendedSubscriptions === 0 ? (
                                        <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px", color: '#22C55E' }}>{(SAPS_Page_ObjData?.percentageObjData.suspendedSubscriptions || 0).toFixed(2)}% from last month</Typography>
                                    ) : <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px", color: '#e5565a' }}>{(SAPS_Page_ObjData?.percentageObjData.suspendedSubscriptions || 0).toFixed(2)}% from last month</Typography>

                                )
                                }
                            </Box>
                            <Box>
                                <img src={subscription_card_1} alt="ReportIcon" />
                            </Box>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }} sx={{}}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: { xs: 5, lg: 1 }, backgroundColor: '#ECFEFF', borderRadius: '16px', px: 3, py: 5 }}>
                            <Box>
                                <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px" }}>Upcoming Renewals</Typography>
                                {SAPS_Page_API_Data.isFetching ? (
                                    <Skeleton variant="text" width={60} height={40} />
                                ) : (
                                    <Typography variant="h3" fontWeight={600}>{(SAPS_Page_ObjData?.upcomingRenewals || 0).toFixed(2)}</Typography>
                                )
                                }
                                {SAPS_Page_API_Data.isFetching ? (
                                    <Skeleton variant="text" width={60} height={40} />
                                ) : (
                                    SAPS_Page_ObjData?.percentageObjData.upcomingRenewals > 0 ? (

                                        <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px", color: '#22C55E' }}>+{(SAPS_Page_ObjData?.percentageObjData.upcomingRenewals || 0).toFixed(2)}% from last month</Typography>
                                    ) : SAPS_Page_ObjData?.percentageObjData.upcomingRenewals === 0 ? (
                                        <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px", color: '#22C55E' }}>{(SAPS_Page_ObjData?.percentageObjData.upcomingRenewals || 0).toFixed(2)}% from last month</Typography>
                                    ) : <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px", color: '#e5565a' }}>{(SAPS_Page_ObjData?.percentageObjData.upcomingRenewals || 0).toFixed(2)}% from last month</Typography>

                                )
                                }
                            </Box>
                            <Box>
                                <img src={subscription_card_5} alt="ReportIcon" />
                            </Box>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }} sx={{}}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: { xs: 5, lg: 1 }, backgroundColor: '#F5F3FF', borderRadius: '16px', px: 3, py: 5 }}>
                            <Box>
                                <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px" }}>Average Subscription Value</Typography>
                                {SAPS_Page_API_Data.isFetching ? (
                                    <Skeleton variant="text" width={60} height={40} />
                                ) : (
                                    <Typography variant="h3" fontWeight={600}>{(SAPS_Page_ObjData?.averageSubscriptionValue || 0).toFixed(2)}</Typography>
                                )
                                }
                                {SAPS_Page_API_Data.isFetching ? (
                                    <Skeleton variant="text" width={60} height={40} />
                                ) : (
                                    SAPS_Page_ObjData?.percentageObjData.averageSubscriptionValue > 0 ? (

                                        <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px", color: '#22C55E' }}>+{(SAPS_Page_ObjData?.percentageObjData.averageSubscriptionValue || 0).toFixed(2)}% from last month</Typography>
                                    ) : SAPS_Page_ObjData?.percentageObjData.averageSubscriptionValue === 0 ? (
                                        <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px", color: '#22C55E' }}>{(SAPS_Page_ObjData?.percentageObjData.averageSubscriptionValue || 0).toFixed(2)}% from last month</Typography>
                                    ) : <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px", color: '#e5565a' }}>{(SAPS_Page_ObjData?.percentageObjData.averageSubscriptionValue || 0).toFixed(2)}% from last month</Typography>

                                )
                                }
                            </Box>
                            <Box>
                                <img src={subscription_card_2} alt="ReportIcon" />
                            </Box>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }} sx={{}}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: { xs: 5, lg: 1 }, backgroundColor: '#367BE01A', borderRadius: '16px', px: 3, py: 5 }}>
                            <Box>
                                <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px" }}>Total SOS Types Revenue</Typography>
                                {SAPS_Page_API_Data.isFetching ? (
                                    <Skeleton variant="text" width={60} height={40} />
                                ) : (
                                    <Typography variant="h3" fontWeight={600}>{(SAPS_Page_ObjData?.totalSOSTypesRevenue || 0).toFixed(2)}</Typography>
                                )
                                }
                                {SAPS_Page_API_Data.isFetching ? (
                                    <Skeleton variant="text" width={60} height={40} />
                                ) : (
                                    SAPS_Page_ObjData?.percentageObjData.totalSOSTypesRevenue > 0 ? (

                                        <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px", color: '#22C55E' }}>+{(SAPS_Page_ObjData?.percentageObjData.totalSOSTypesRevenue || 0).toFixed(2)}% from last month</Typography>
                                    ) : SAPS_Page_ObjData?.percentageObjData.totalSOSTypesRevenue === 0 ? (
                                        <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px", color: '#22C55E' }}>{(SAPS_Page_ObjData?.percentageObjData.totalSOSTypesRevenue || 0).toFixed(2)}% from last month</Typography>
                                    ) : <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px", color: '#e5565a' }}>{(SAPS_Page_ObjData?.percentageObjData.totalSOSTypesRevenue || 0).toFixed(2)}% from last month</Typography>

                                )
                                }
                            </Box>
                            <Box>
                                <img src={subscription_card_4} alt="ReportIcon" />
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
                        <Tab label="Subscriptions" value="ACTIVE_SUBSCRIPTION"/>
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
                                <CustomExportMenu onExport={handleExport} />
                            </Box>

                        </Grid>
                    </Grid>
                    <Box sx={{ px: { xs: 0, md: 2 }, pt: { xs: 0, md: 3 }, backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
                        <TableContainer >
                            {tab !== 'SOS_TYPES_REVENUE' && <Table sx={{ '& .MuiTableCell-root': { fontSize: '15px' } }}>
                                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                    <TableRow >
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', borderTopLeftRadius: '10px' }}>
                                            <TableSortLabel
                                                id="first_name"
                                                active={sortBy === 'first_name'}
                                                direction={sortOrder}
                                                onClick={changeSortOrder}
                                                IconComponent={() => <img src={sortBy === 'first_name' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                            >Subscriber</TableSortLabel></TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                            <TableSortLabel
                                                id="subscription_status"
                                                active={sortBy === 'subscription_status'}
                                                direction={sortOrder}
                                                onClick={changeSortOrder}
                                                IconComponent={() => <img src={sortBy === 'subscription_status' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                            >Status</TableSortLabel></TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                            <TableSortLabel
                                                id="EnrollStartDate"
                                                active={sortBy === 'EnrollStartDate'}
                                                direction={sortOrder}
                                                onClick={changeSortOrder}
                                                IconComponent={() => <img src={sortBy === 'EnrollStartDate' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                            >Start Date</TableSortLabel></TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                            <TableSortLabel
                                                id="paymentDate"
                                                active={sortBy === 'paymentDate'}
                                                direction={sortOrder}
                                                onClick={changeSortOrder}
                                                IconComponent={() => <img src={sortBy === 'paymentDate' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                            >Expiry Date</TableSortLabel></TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                            <TableSortLabel
                                                id="EnrollAmount"
                                                active={sortBy === 'EnrollAmount'}
                                                direction={sortOrder}
                                                onClick={changeSortOrder}
                                                IconComponent={() => <img src={sortBy === 'EnrollAmount' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                            >Amount Paid</TableSortLabel></TableCell>
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
                                                                report.subscription_status === 'inactive' ? 'InActive' :
                                                                    report.subscription_status === 'expired' ? 'Expired' :
                                                                        report.subscription_status == 'suspended' ? 'Suspended' :
                                                                            report.subscription_status == 'cancel' ? 'Cancel' : '-'
                                                            }
                                                            sx={{
                                                                backgroundColor:
                                                                    report.subscription_status === 'active' ? '#DCFCE7' :
                                                                        report.subscription_status === 'inactive' ? '#E5393533' :
                                                                        report.subscription_status === 'expired' ? '#E5393533' :
                                                                            report.subscription_status == 'suspended' ? '#FFA72633' :
                                                                                report.subscription_status == 'cancel' ? '#dac9e9' : '#FEF9C3',
                                                                '& .MuiChip-label': {
                                                                    textTransform: 'capitalize',
                                                                    color: report.subscription_status === 'active' ? 'green' :
                                                                        report.subscription_status === 'inactive' ? '#E53935' :
                                                                        report.subscription_status === 'expired' ? '#E53935' :
                                                                            report.subscription_status == 'suspended' ? '#FFA726' :
                                                                                report.subscription_status == 'cancel' ? '#4a4358' : 'black',
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

                                                        {report?.subscriptions?.paymentMethod}

                                                    </TableCell>
                                                    {tab !== 'ACTIVE_SUBSCRIPTION' && (<TableCell >
                                                        <Box align="center" sx={{ display: 'flex', flexDirection: 'row' }}>
                                                            <Tooltip title="View" arrow placement="top">
                                                                <IconButton onClick={() => handleView(report)}>
                                                                    <img src={ViewBtn} alt="flagged button" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            {tab === 'EXPIRED_SUBSCRIPTION' && <Tooltip title="Renew" arrow placement="top">
                                                                <IconButton onClick={() => openPopup(report,'renew')}>
                                                                    <img src={ReloadIcn} alt="Renew button" />
                                                                </IconButton>
                                                            </Tooltip>}
                                                            {(tab === 'SUSPENDED_SUBSCRIPTION' || tab === 'EXPIRED_SUBSCRIPTION') && <Tooltip title="Cancel" arrow placement="top">
                                                                <IconButton onClick={() => openPopup(report, 'cancel')}>
                                                                    <img src={CancelIcn} alt="Cancel button" />
                                                                </IconButton>
                                                            </Tooltip>}
                                                            {tab === 'SUSPENDED_SUBSCRIPTION' &&
                                                                <Tooltip title="Re-Active" arrow placement="top">
                                                                    <IconButton onClick={() => openPopup(report, 're-active')}>
                                                                        <img src={ReloadIcn} alt="Re-Active button" />
                                                                    </IconButton>
                                                                </Tooltip>}
                                                        </Box>
                                                    </TableCell>)}
                                                    {tab === 'ACTIVE_SUBSCRIPTION' &&
                                                        (
                                                            <>
                                                            <TableCell
                                                                sx={{
                                                                    position: 'sticky',
                                                                    right: 0,
                                                                    backgroundColor: 'white',
                                                                    zIndex: 1
                                                                }}
                                                            >
                                                                <Box align="center" sx={{ display: 'flex', flexDirection: 'row' }}>
                                                                    <IconButton onClick={(e) => handleOpenMenu(e,report)}>
                                                                        <MoreVertIcon />
                                                                    </IconButton>

                                                                </Box>
                                                            </TableCell>
                                                            <Menu
                                                                anchorEl={anchorEl}
                                                                open={Boolean(anchorEl)}
                                                                onClose={handleCloseMenu}
                                                                anchorOrigin={{
                                                                    vertical: "bottom",
                                                                    horizontal: "right",
                                                                }}
                                                                transformOrigin={{
                                                                    vertical: "top",
                                                                    horizontal: "right",
                                                                }}
                                                                slotProps={{
                                                                    paper: {
                                                                        sx: {
                                                                            border: "1px solid #E5E7EB",
                                                                            borderRadius: "10px",
                                                                            boxShadow: "0px 4px 12px rgba(0,0,0,0.08)", // lighter shadow
                                                                        },
                                                                    },
                                                                }}
                                                            >
                                                                <MenuItem
                                                                    onClick={() => {
                                                                        openPopup(selectedPopupObj,'transactions')
                                                                    }}
                                                                >
                                                                    <img src={OutlinedView} alt="view button" /> &nbsp; View Transactions
                                                                </MenuItem>
                                                                <MenuItem
                                                                    onClick={() => {
                                                                        openPopup(selectedPopupObj,'puase')
                                                                    }}
                                                                >
                                                                    <img src={OutlinedPuase} alt="Puase button" /> &nbsp; Suspend
                                                                </MenuItem>
                                                                <MenuItem
                                                                    onClick={() => {
                                                                        openPopup(selectedPopupObj,'activitylog')
                                                                    }}
                                                                >
                                                                    <img src={Outlinedactivitylog} alt="Activity log" /> &nbsp; Activity Log
                                                                </MenuItem>
                                                            </Menu>
                                                            </>
                                                        )
                                                    }
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
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', borderTopLeftRadius: '10px' }}>
                                            <TableSortLabel
                                                id="display_title"
                                                active={sortBy === 'display_title'}
                                                direction={sortOrder}
                                                onClick={changeSortOrder}
                                                IconComponent={() => <img src={sortBy === 'display_title' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                            >SOS Type</TableSortLabel></TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Description</TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                            <TableSortLabel
                                                id="totalAmount"
                                                active={sortBy === 'totalAmount'}
                                                direction={sortOrder}
                                                onClick={changeSortOrder}
                                                IconComponent={() => <img src={sortBy === 'totalAmount' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                            >Revenue</TableSortLabel></TableCell>
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
            
            {isRenewPopup &&
                <Dialog
                    open={isRenewPopup}
                    onClose={() => setisRenewPopup(false)}
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
                                    background: "#EAF2FF",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <img src={renew_popupIcn} alt="renew" width={50} />
                            </Box>
                        </Box>

                        {/* Title */}
                        <Typography
                            variant="h4"
                            fontWeight={700}
                            sx={{ mb: 2 }}
                        >
                            Renew Subscription
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
                            Are you sure you want to renew  subscription for the
                            2 Months Entry Plan? A renewal fee of <b>R500</b> will be charged.
                        </Typography>

                        {/* Buttons */}
                        <Box display="flex" flexDirection="column" gap={2}>
                            <Button
                                variant="contained"
                                fullWidth
                                onClick={() => handleConfirmation(selectedPopupObj?._id,{type:'active',})}
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
                                Renew Now
                            </Button>

                            <Button
                                variant="outlined"
                                fullWidth
                                onClick={() => setisRenewPopup(false)}
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
            {isCancelPopup &&
                <Dialog
                    open={isCancelPopup}
                    onClose={() => setisCancelPopup(false)}
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
                                    background: "#EAF2FF",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <img src={cancel_popupIcn} alt="renew" width={50} />
                            </Box>
                        </Box>

                        {/* Title */}
                        <Typography
                            variant="h4"
                            fontWeight={700}
                            sx={{ mb: 2 }}
                        >
                            Cancel Subscription
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
                            Are you sure you want to cancel  subscription? The user will immediately lose access to Thiba Ingozi features linked to this plan
                        </Typography>

                        {/* Buttons */}
                        <Box display="flex" flexDirection="column" gap={2}>
                            <Button
                                variant="contained"
                                fullWidth
                                onClick={() => handleConfirmation(selectedPopupObj?._id,{type:'cancel'})}
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
                                Confirm Cancellation
                            </Button>

                            <Button
                                variant="outlined"
                                fullWidth
                                onClick={() => setisCancelPopup(false)}
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
            {isPuasePopup &&
                <Dialog
                    open={isPuasePopup}
                    onClose={() => setisPuasePopup(false)}
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
                                    background: "#EAF2FF",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <img src={puase_popupIcn} alt="puase" width={50} />
                            </Box>
                        </Box>

                        {/* Title */}
                        <Typography
                            variant="h4"
                            fontWeight={700}
                            sx={{ mb: 2 }}
                        >
                            Puase User Account
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
                            Are you sure you want to pause  account? The user will not be able to access Thiba Ingozi features.
                        </Typography>

                        {/* Buttons */}
                        <Box display="flex" flexDirection="column" gap={2}>
                            <Button
                                variant="contained"
                                fullWidth
                                onClick={() => handleConfirmation(selectedPopupObj?._id,{type:'suspended'})}
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
                                Puase User Account
                            </Button>

                            <Button
                                variant="outlined"
                                fullWidth
                                onClick={() => setisPuasePopup(false)}
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
            {isReActivePopup &&
                <Dialog
                    open={isReActivePopup}
                    onClose={() => setisReActivePopup(false)}
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
                                    background: "#EAF2FF",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <img src={puase_popupIcn} alt="puase" width={50} />
                            </Box>
                        </Box>

                        {/* Title */}
                        <Typography
                            variant="h4"
                            fontWeight={700}
                            sx={{ mb: 2 }}
                        >
                            Re-Active User Account
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
                            Are you sure you want to re-active account? The user will Thiba Ingozi features.
                        </Typography>

                        {/* Buttons */}
                        <Box display="flex" flexDirection="column" gap={2}>
                            <Button
                                variant="contained"
                                fullWidth
                                onClick={() => handleConfirmation(selectedPopupObj?._id,{type:'re-active'})}
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
                               Re-Active User Account
                            </Button>

                            <Button
                                variant="outlined"
                                fullWidth
                                onClick={() => setisReActivePopup(false)}
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
            {isActivityLogPopup &&
                <Dialog
                    open={isActivityLogPopup}
                    onClose={() => setisActivityLogPopup(false)}
                    maxWidth="md"
                    fullWidth
                    PaperProps={{
                        sx: {
                            borderRadius: "14px",
                            p: 3,
                            maxWidth: 540,
                        },
                    }}
                >
                    <DialogContent sx={{ p: 0 }}>
                        {/* Title */}
                        <Typography
                            sx={{
                                fontSize: "32px",
                                fontWeight: 700,
                                color: "#111827",
                                mb: 1,
                            }}
                        >
                            Activity Log
                        </Typography>

                        {/* Subtitle */}
                        <Typography
                            sx={{
                                fontSize: "16px",
                                color: "#6B7280",
                                mb: 3,
                            }}
                        >
                            Recent activity for <strong>{selectedPopupObj?.first_name + ' ' + selectedPopupObj?.last_name}</strong>.
                        </Typography>

                        {/* Activity List */}
                        <Box
                            component="ul"
                            sx={{
                                pl: 3,
                                mb: 4,
                                color: "#374151",
                                "& li": {
                                    mb: 1.2,
                                    fontSize: "17px",
                                    lineHeight: 1.6,
                                },
                            }}
                        >
                            {selectedPopupObj?.notifications?.map(data =>
                                <>
                                    <li>{moment(data.createdAt).format("DD MMM, YYYY")} – {moment(data?.createdAt).format("hh:mm A")} → {data?.notification_data?.type}</li>
                                </>
                            )
                            }
                        </Box>

                        {/* Buttons */}
                        <Box
                            display="flex"
                            justifyContent="flex-end"
                            gap={2}
                        >
                            <Button
                                variant="outlined"
                                onClick={() => setisActivityLogPopup(false)}
                                sx={{
                                    textTransform: "none",
                                    borderRadius: "8px",
                                    minWidth: 90,
                                    height: 40,
                                    color: "#374151",
                                    borderColor: "#D1D5DB",
                                }}
                            >
                                Cancel
                            </Button>

                            {/* <Button
                                variant="contained"
                                sx={{
                                    textTransform: "none",
                                    borderRadius: "8px",
                                    minWidth: 130,
                                    height: 40,
                                    background: "#2563EB",
                                    "&:hover": {
                                        background: "#1D4ED8",
                                    },
                                }}
                            >
                                View Full Log
                            </Button> */}
                        </Box>
                    </DialogContent>
                </Dialog>
            }
            
            {isTransactionPopup && <TransactionHistoryPopup open={isTransactionPopup} onClose={() => setIsTransactionPopup(false)} user={selectedPopupObj} />}                                  

        </Box>
    );
}
export default SubscriptionManagement;
