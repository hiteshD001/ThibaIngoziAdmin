import React, { useState } from 'react'
import {
    Box, Typography, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Grid, Stack, MenuItem, Tabs, Tab, Avatar, Chip, Menu
} from "@mui/material";
import home3 from '../../assets/images/home3.svg'
import home4 from '../../assets/images/home4.svg'
import home5 from '../../assets/images/home5.svg'
import home6 from '../../assets/images/home6.svg'
// import MoreVertIcon from "@mui/icons-material/MoreVert";
// import resend from '../../assets/images/resend.svg'
// import log from '../../assets/images/log.svg'
// import resendConfirm from '../../assets/images/resendConfirm.svg'
// import declineConfirm from '../../assets/images/declineConfirm.svg'
// import declineIcon from '../../assets/images/declineIcon.svg';
// import TransactionModal from '../../components/subscription/TransactionModal';
import { toast } from 'react-toastify';
// import view from '../../assets/images/view.svg'
import { useNavigate } from 'react-router-dom';
import home7 from '../../assets/images/home7.svg'
import home8 from '../../assets/images/home8.svg'
// import ConfirmationPopUp from '../../common/ConfirmationPopUp';
// import pauseConfirm from '../../assets/images/pauseConfirm.svg'
import { startOfYear } from "date-fns";
// import LogModal from '../../components/subscription/LogModal';
import { FiltersBar } from '../../common/FilterBar';
import { useGetSubUser, useGetSubAnalytics, useUpdateStatus } from '../../API Calls/API';
import { formatDate } from '../../utils/DateFormatter';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';
import ExportToCSV from '../../components/ExportToCsv';
import { useQueryClient } from '@tanstack/react-query';
import PersonIcon from '@mui/icons-material/Person';
import CustomPagination from '../../common/custom/CustomPagination';



const ListOfSubscription = () => {
    const [tab, setTab] = useState(0);
    const [suburb, setSuburb] = useState("");
    const [country, setCountry] = useState('')
    const [province, setProvince] = useState('')
    const [city, setCity] = useState('')
    const [userId, setUserId] = useState('')
    const [logId, setLogId] = useState('')
    const [statusId, setStatusId] = useState('')
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    const [openPopup, setOpenPopup] = useState(null);
    const [openLog, setOpenLog] = useState(false);
    const [openTransaction, setOpenTransaction] = useState(false);
    const [selectedUserStatus, setSelectedUserStatus] = useState(null)
    const [transactions, setTransactions] = useState([])
    const queryClient = useQueryClient()

    const [anchorEl, setAnchorEl] = useState(null);
    const [name, setName] = useState('')

    const nav = useNavigate()
    const [range, setRange] = useState([
        {
            startDate: startOfYear(new Date()),
            endDate: new Date(),
            key: 'selection'
        }
    ]);
    const startDate = range[0].startDate.toISOString();
    const endDate = range[0].endDate.toISOString();
    const typeMap = ['Active', 'Suspended', 'Expired'];
    const type = typeMap[tab];
    const { data: subUser, isLoading } = useGetSubUser(currentPage, rowsPerPage, startDate, endDate, type, country, province)
    const { data: subAnalytics } = useGetSubAnalytics(startDate, endDate, country, province)
    const { mutate: pauseUser } = useUpdateStatus()

    const totalUsers = subUser?.pagination?.totalCount;
    const totalPages = Math.ceil(totalUsers / rowsPerPage);
    const handleOpen = (type) => setOpenPopup(type);
    const handleClose = () => setOpenPopup(null);

    const handleConfirm = () => {
        if (openPopup === "pause") {
            if (userId) {
                const newStatus =
                    selectedUserStatus === "Active" ? "Paused" : "Active";

                pauseUser(
                    { userId: statusId, body: { status: newStatus } },
                    {
                        onSuccess: () => {
                            toast.success(
                                `User ${newStatus === "Active" ? "activated" : "paused"} successfully`
                            );
                            queryClient.invalidateQueries(["subscriptions"], { exact: false });
                            setAnchorEl(null)
                        },
                        onError: (error) =>
                            toast.error(error.response?.data?.message || "Error"),
                    }
                );
            }
        }
        else if (openPopup === "reset") {
            toast.success("User password reset ");
        }
        else if (openPopup === "renew") {
            toast.success("Subscription renewd");
        }
        else if (openPopup === "cancel") {
            toast.success("Subscription cancelled");
        }
        handleClose();
    };
    const PercentageChange = ({ flag, value }) => {
        const isUp = flag === 'up';
        return (
            <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', color: isUp ? '#16A34A' : 'red', fontWeight: 500 }}>
                {isUp ? (
                    <ArrowUpward sx={{ color: '#16A34A', fontSize: 18, mr: 0.3 }} />
                ) : (
                    <ArrowDownward sx={{ color: 'red', fontSize: 18, mr: 0.3 }} />
                )}
                {value || 0}%
                <Typography sx={{ color: '#878787' }}>&nbsp;vs last month</Typography>
            </Box>
        );
    };
    const exportColumns = [
        {
            label: "Subscriber",
            accessor: (user) =>
                `${user?.User?.firstName || ""} ${user?.User?.lastName || ""}`.trim() ||
                "-",
        },
        {
            label: "Status",
            accessor: (user) => user?.status || "-",
        },
        {
            label: "Start Date",
            accessor: (user) => formatDate(user?.start_date) || "-",
        },
        {
            label: "Expiry Date",
            accessor: (user) => formatDate(user?.end_date) || "-",
        },
        {
            label: "Amount Paid",
            accessor: (user) => user?.amountPaid || "-",
        },
        {
            label: "Payment Method",
            accessor: (user) => user?.paymentMethod || "-",
        },
    ];

    return (
        <>
            <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row', gap: 1, flexWrap: "wrap", }}>
                <FiltersBar
                    range={range}
                    setRange={setRange}
                    setSuburb={setSuburb}
                    setCountry={setCountry}
                    setProvince={setProvince}
                    setCity={setCity}
                    show={{ primaryPlatform: false, userType: false, role: false }}
                />
            </Box>
            <Grid container spacing={3} my={5}>
                {/* Total Active Subscriptions */}
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                    <Box sx={{ height: "100%", backgroundColor: '#ECFDF5', borderRadius: '16px' }}>
                        <Box sx={{ display: 'flex', height: "100%", flexDirection: 'row', justifyContent: 'space-between', gap: 2, px: 3, py: 3 }}>
                            <Box>
                                <Typography variant="body1" sx={{ color: '#878787' }}>Total Active Subscriptions</Typography>
                                <Typography variant="h4" fontWeight={600}>
                                    {subAnalytics?.data?.total_active_subscriptions?.total_active_subscriptions_count ?? 0}
                                </Typography>

                                <PercentageChange
                                    flag={subAnalytics?.data?.total_active_subscriptions?.flag}
                                    value={subAnalytics?.data?.total_active_subscriptions?.percentage_change}
                                />
                            </Box>
                            <Box>
                                <img src={home3} alt="ReportIcon" />
                            </Box>
                        </Box>
                    </Box>
                </Grid>

                {/* Total Revenue from Subscriptions */}
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                    <Box sx={{ height: "100%", backgroundColor: '#EFF6FF', borderRadius: '16px' }}>
                        <Box sx={{ display: 'flex', height: "100%", flexDirection: 'row', justifyContent: 'space-between', gap: 2, px: 3, py: 3 }}>
                            <Box>
                                <Typography variant="body1" sx={{ color: '#878787' }}>Total Revenue from Subscriptions</Typography>
                                <Typography variant="h4" fontWeight={600}>
                                    R {subAnalytics?.data?.total_revenue_from_subscription?.total_revenue_from_subscriptions ?? 0}
                                </Typography>

                                <PercentageChange
                                    flag={subAnalytics?.data?.total_revenue_from_subscription?.flag}
                                    value={subAnalytics?.data?.total_revenue_from_subscription?.percentage_change}
                                />
                            </Box>
                            <Box>
                                <img src={home4} alt="RevenueIcon" />
                            </Box>
                        </Box>
                    </Box>
                </Grid>

                {/* Total Expired Subscriptions */}
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                    <Box sx={{ height: "100%", backgroundColor: '#FFF7ED', borderRadius: '16px' }}>
                        <Box sx={{ display: 'flex', height: "100%", flexDirection: 'row', justifyContent: 'space-between', gap: 2, px: 3, py: 3 }}>
                            <Box>
                                <Typography variant="body1" sx={{ color: '#878787' }}>Total Expired Subscriptions</Typography>
                                <Typography variant="h4" fontWeight={600}>
                                    {subAnalytics?.data?.total_expired_subscriptions?.total_expired_subscriptions_count ?? 0}
                                </Typography>
                                <PercentageChange
                                    flag={subAnalytics?.data?.total_expired_subscriptions?.flag}
                                    value={subAnalytics?.data?.total_expired_subscriptions?.percentage_change}
                                />
                            </Box>
                            <Box>
                                <img src={home5} alt="ExpiredIcon" />
                            </Box>
                        </Box>
                    </Box>
                </Grid>

                {/* Suspended Subscriptions */}
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                    <Box sx={{ height: "100%", backgroundColor: '#FEF2F2', borderRadius: '16px' }}>
                        <Box sx={{ display: 'flex', height: "100%", flexDirection: 'row', justifyContent: 'space-between', gap: 2, px: 3, py: 3 }}>
                            <Box>
                                <Typography variant="body1" sx={{ color: '#878787' }}>Suspended Subscriptions</Typography>
                                <Typography variant="h4" fontWeight={600}>
                                    {subAnalytics?.data?.total_suspended_subscription?.total_suspended_subscription_count ?? 0}
                                </Typography>

                                <PercentageChange
                                    flag={subAnalytics?.data?.total_suspended_subscription?.flag}
                                    value={subAnalytics?.data?.total_suspended_subscription?.percentage_change}
                                />
                            </Box>
                            <Box>
                                <img src={home6} alt="SuspendedIcon" />
                            </Box>
                        </Box>
                    </Box>
                </Grid>

                {/* Upcoming Renewals */}
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                    <Box sx={{ height: "100%", backgroundColor: '#ECFEFF', borderRadius: '16px' }}>
                        <Box sx={{ display: 'flex', height: "100%", flexDirection: 'row', justifyContent: 'space-between', gap: 2, px: 3, py: 3 }}>
                            <Box>
                                <Typography variant="body1" sx={{ color: '#878787' }}>Upcoming Renewals</Typography>
                                <Typography variant="h4" fontWeight={600}>
                                    {subAnalytics?.data?.upcoming_renewals?.upcoming_renewals_count ?? 0}
                                </Typography>
                                <PercentageChange
                                    flag={subAnalytics?.data?.upcoming_renewals?.flag}
                                    value={subAnalytics?.data?.upcoming_renewals?.percentage_change}
                                />
                            </Box>
                            <Box>
                                <img src={home7} alt="RenewalIcon" />
                            </Box>
                        </Box>
                    </Box>
                </Grid>

                {/* Average Subscription Value */}
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                    <Box sx={{ height: "100%", backgroundColor: '#F5F3FF', borderRadius: '16px' }}>
                        <Box sx={{ display: 'flex', height: "100%", flexDirection: 'row', justifyContent: 'space-between', gap: 2, px: 3, py: 3 }}>
                            <Box>
                                <Typography variant="body1" sx={{ color: '#878787' }}>Average Subscription Value</Typography>
                                <Typography variant="h4" fontWeight={600}>
                                    R{subAnalytics?.data?.average_subscription_revenue?.averageSubscriptionValueAllTime ?? 0}
                                </Typography>

                                <PercentageChange
                                    flag={subAnalytics?.data?.average_subscription_revenue?.flag}
                                    value={subAnalytics?.data?.average_subscription_revenue?.percentage_change}
                                />
                            </Box>
                            <Box>
                                <img src={home8} alt="AverageIcon" />
                            </Box>
                        </Box>
                    </Box>
                </Grid>
            </Grid>

            <Tabs
                value={tab}
                onChange={(e, newValue) => setTab(newValue)}
                textColor="primary"
                indicatorColor="primary"
                sx={{ mt: 4, borderBottom: '1px solid #E5E7EB' }}

            >
                <Tab label='Active Subscriptions' />
                <Tab label='Suspended Subscriptions' />
                <Tab label='Expired Subscriptions' />
            </Tabs>
            <Box sx={{ backgroundColor: "rgb(253, 253, 253)", boxShadow: "-3px 4px 23px rgba(0, 0, 0, 0.1)", mt: 3, padding: 0, borderRadius: '10px' }}>
                <Grid container justifyContent="space-between" alignItems="center" p={3}>
                    <Grid size={{ xs: 12, lg: 6 }} sx={{ display: 'flex', flexDirection: 'row', gap: 2, mb: { xs: 1, md: 0 } }}>
                        <Typography variant="h6" fontWeight={590} sx={{ pl: 2 }}>
                            {tab === 0
                                ? "Most Active Advance Users"
                                : tab === 1
                                    ? "Suspended Users"
                                    : "Expired Users"}
                        </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, lg: 6 }} sx={{ display: 'flex', justifyContent: 'flex-end', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                        <Box display="flex" sx={{ justifyContent: { xs: 'space-between' } }} gap={2}>
                            <ExportToCSV
                                fileName="Subscription Users"
                                columns={exportColumns}
                                apiEndpoint="/super-admin/subscriptions/"
                                params={{ type }}
                            />
                        </Box>

                    </Grid>
                </Grid>

                {isLoading ? (
                    <Typography align="center" color="text.secondary" sx={{ mt: 1, pb: 2 }}>Loading....</Typography>
                ) : Array.isArray(subUser?.data) && subUser?.data?.length > 0 ? (
                    <>
                        <TableContainer >
                            <Table sx={{ '& .MuiTableCell-root': { fontSize: '15px', } }}>
                                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                    <TableRow >
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#878787', borderTopLeftRadius: '10px' }}>Subscriber</TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#878787' }}>Status</TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#878787' }}>Start Date</TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#878787' }}>Expiry Date</TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#878787' }}>Amount Paid</TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#878787' }}>Payment Method</TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#878787' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {subUser?.data?.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell sx={{ color: '#4B5563' }}>
                                                <Stack direction="row" alignItems="center" gap={1}>

                                                    <Avatar src={user?.User?.profile_img || undefined} alt="User" >
                                                        <PersonIcon />
                                                    </Avatar>

                                                    {user?.User?.firstName || user?.User?.lastName ? `${user?.User?.firstName || ""} ${user?.User?.lastName || ""}`.trim() : "-"}
                                                </Stack>
                                            </TableCell>
                                            <TableCell sx={{ color: '#4B5563' }}>
                                                <Chip
                                                    label={user.status}
                                                    sx={{
                                                        backgroundColor:
                                                            user.status === 'Active' ? '#DCFCE7' :
                                                                user.status === 'Expired' ? '#DC26261A' :
                                                                    user.status === 'Suspended' ? '#FFA72633' :
                                                                        '#FEF9C3',
                                                        '& .MuiChip-label': {
                                                            textTransform: 'capitalize',
                                                            fontWeight: 500,
                                                            color: user.status === 'Active' ? '#166534' :
                                                                user.status === 'Expired' ? '#DC2626' :
                                                                    user.status === 'Suspended' ? '#FFA726' :
                                                                        'black',
                                                        }
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ color: '#878787 ' }}>
                                                {formatDate(user.start_date) || "-"}
                                            </TableCell>
                                            <TableCell sx={{ color: '#878787 ' }}>
                                                {formatDate(user.end_date) || "-"}
                                                {/* {user.expiryDate || "-"} */}
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 500 }}>
                                                {user.amountPaid || "-"}
                                            </TableCell>
                                            <TableCell sx={{ color: '#878787 ' }}>
                                                {user.paymentMethod || "-"}
                                            </TableCell>
                                            {/* <TableCell>
                                                <Box
                                                    align="center"
                                                    sx={{ display: "flex", flexDirection: "row", gap: 1 }}>
                                                    {user.status === 'Active' ?
                                                        (
                                                            <>
                                                                <IconButton
                                                                    onClick={(e) => {
                                                                        setUserId(user?.user_id)
                                                                        setLogId(user.user_id)
                                                                        setStatusId(user.id)
                                                                        setName(`${user?.User?.firstName || ""} ${user?.User?.lastName || ""}`);
                                                                        setAnchorEl(e.currentTarget)
                                                                        setSelectedUserStatus(user.status)
                                                                    }}
                                                                >
                                                                    <MoreVertIcon />
                                                                </IconButton>
                                                            </>
                                                        ) : (<>
                                                            <IconButton
                                                                onClick={() => {
                                                                    nav(`/home/subscription/subscription-information/${user.id}`);
                                                                    setAnchorEl(null);
                                                                    setUserId(user.id)
                                                                }}
                                                            >
                                                                <img src={view} alt="view button" />
                                                            </IconButton>
                                                            {
                                                                user.status === 'expired' && (<IconButton
                                                                    onClick={() => {
                                                                        handleOpen("renew")
                                                                        setName(`${user?.User?.firstName || ""} ${user?.User?.lastName || ""}`);
                                                                    }}
                                                                >
                                                                    <img src={resend} alt="resend button" />
                                                                </IconButton>)
                                                            }
                                                            <IconButton
                                                                onClick={() => {
                                                                    handleOpen("cancel")
                                                                    setName(`${user?.User?.firstName || ""} ${user?.User?.lastName || ""}`);
                                                                }}
                                                            >
                                                                <img src={declineIcon} alt="cancel button" />
                                                            </IconButton>
                                                        </>)
                                                    }
                                                </Box>

                                            </TableCell> */}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {/* <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={() => setAnchorEl(null)}
                            >
                                <MenuItem
                                    sx={{ gap: 1 }}
                                    onClick={() => {
                                        setOpenTransaction(true);
                                        setAnchorEl(null);
                                    }}
                                >
                                    <img src={view} alt="view button" />
                                    <Typography variant='body1'>View Transactions</Typography>
                                </MenuItem>
                                <MenuItem
                                    sx={{ gap: 1 }}
                                    onClick={() => {
                                        handleOpen("pause");
                                        setAnchorEl(null);
                                    }}
                                >
                                    <img src={pause} alt="pause button" />
                                    <Typography variant='body1'>{selectedUserStatus === 'Active' ? 'Pause' : "Activate"}</Typography>
                                </MenuItem>
                                <MenuItem
                                    sx={{ gap: 1 }}
                                    onClick={() => {
                                        handleOpen("renew")
                                        setAnchorEl(null);
                                    }}
                                >
                                    <img src={resend} alt="resend button" />
                                    <Typography variant='body1'>Renew</Typography>
                                </MenuItem>
                                <MenuItem
                                    sx={{ gap: 1 }}
                                    onClick={() => {
                                        setOpenLog(true);
                                        setAnchorEl(null);
                                    }}
                                >
                                    <img src={log} alt=" log button" />
                                    Activity Log
                                </MenuItem>
                            </Menu> */}
                            {/* <ConfirmationPopUp
                                open={openPopup === "pause"}
                                onClose={handleClose}
                                onConfirm={handleConfirm}
                                title="Pause User Account"
                                message={`Are you sure you want to pause ${name}'s account? The user will not be able to request advances or withdrawals until reactivated.`}
                                BtnText={'Pause Account'}
                                icon={pauseConfirm}
                            />
                            <ConfirmationPopUp
                                open={openPopup === "renew"}
                                onClose={handleClose}
                                onConfirm={handleConfirm}
                                title="Renew Subscription"
                                message={`Are you sure you want to renew ${name}’s subscription for the 2 Months Entry Plan? A renewal fee of R500 will be charged.`}
                                BtnText={'Renew Now'}
                                icon={resendConfirm}
                            />
                            <ConfirmationPopUp
                                open={openPopup === "cancel"}
                                onClose={handleClose}
                                onConfirm={handleConfirm}
                                title="Cancel Subscription"
                                message={`Are you sure you want to cancel ${name}’s subscription? The user will immediately lose access to advances and withdrawals linked to this plan.`}
                                BtnText={'Confirm Cancellation'}
                                icon={declineConfirm}
                            />
                            <LogModal
                                open={openLog}
                                onClose={() => {
                                    setOpenLog(false)
                                    setUserId('')
                                }}
                                logId={logId}
                            />
                            <TransactionModal
                                open={openTransaction}
                                onClose={() => {
                                    setOpenTransaction(false)
                                    setUserId('');
                                }}
                                id={userId}
                            /> */}
                        </TableContainer>
                        <CustomPagination totalPages={totalPages} setCurrentPage={setCurrentPage} setRowsPerPage={setRowsPerPage} rowsPerPage={rowsPerPage} currentPage={currentPage} />
                    </>
                ) : (
                    <Typography align="center" color="text.secondary" sx={{ mt: 1, pb: 2 }}>
                        No data found
                    </Typography>
                )}
            </Box>
        </>
    )
}

export default ListOfSubscription
