import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CustomDateRangePicker from "../../common/Custom/CustomDateRangePicker";
import {
    useGetSalesAgent, useShareAgent, payoutUserUpdate,
    armedSosPayout,
    useDeleteSalesAgent,
    useBulkUploadSalesAgent
} from "../../API Calls/API";
import { useFormik } from "formik";
import PayoutPopup from "../../common/Popup";
import Prev from "../../assets/images/left.png";
import Next from "../../assets/images/right.png";
import nouser from "../../assets/images/NoUser.png";
import search from "../../assets/images/search.png";
import icon from "../../assets/images/icon.png";
import sa1 from '../../assets/images/sa1.svg'
import sa2 from '../../assets/images/sa2.svg'
import sa3 from '../../assets/images/sa3.svg'
import sa4 from '../../assets/images/sa4.svg'
import sa5 from '../../assets/images/sa5.svg'
import plus from '../../assets/images/plus.svg'
import whiteplus from '../../assets/images/whiteplus.svg';
import arrowup from '../../assets/images/arrowup.svg';
import arrowdown from '../../assets/images/arrowdown.svg';
import arrownuteral from '../../assets/images/arrownuteral.svg';
import OutlinedView from '../../assets/images/OutlinedView.svg'
import outlinedDustbin from '../../assets/images/outlinedDustbin.svg'
import OutlinedPay from '../../assets/images/OutlinedPay.svg'
import OutlinedShare from '../../assets/images/OutlinedShare.svg'
import apiClient from "../../API Calls/APIClient";
import * as XLSX from 'xlsx';
import 'jspdf-autotable';
import { toast } from "react-toastify";
import Loader from "../../common/Loader";
import { startOfYear } from "date-fns";
import calender from '../../assets/images/calender.svg';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DeleteSalesAgent } from "../../common/ConfirmationPOPup";
import ImportSheet from "../../common/ImportSheet";
import { FaArrowUp, FaArrowUpLong } from "react-icons/fa6";
import { Avatar, Box, Button, Grid, Select as MuiSelect, IconButton, InputAdornment, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, TextField, Typography, Menu } from "@mui/material";
import CustomExportMenu from "../../common/Custom/CustomExport";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import MoreVertIcon from "@mui/icons-material/MoreVert";

const ListOfSalesAgent = () => {
    const buttonRefs = useRef({});
    const [popup, setpopup] = useState(false)
    const nav = useNavigate();
    const [role] = useState(localStorage.getItem("role"));
    const params = useParams();
    const [page, setpage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [sharingId, setSharingId] = useState(null);
    const [filter, setfilter] = useState("");
    const [isExporting, setIsExporting] = useState(false);
    const [confirmation, setconfirmation] = useState("");
    const [selectedPayoutType, setSelectedPayoutType] = useState('');
    const [selectedUser, setSelectedUser] = useState(null); 

    const [payPopup, setPopup] = useState('')
    const [range, setRange] = useState([
        {
            startDate: startOfYear(new Date()),
            endDate: new Date(),
            key: 'selection'
        }
    ]);
    const fileInputRef = useRef(null);

    const [sortBy, setSortBy] = useState("first_name");
    const [sortOrder, setSortOrder] = useState("asc");

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
    let UserList = useGetSalesAgent(page, rowsPerPage, filter, startDate, endDate, sortBy, sortOrder)
    const agentList = UserList?.data?.data?.data?.influencersData
    const totalPages = UserList?.data?.data?.data?.totalPages
    const queryClient = useQueryClient();
    const [menuUserId, setMenuUserId] = useState(null);

    const handleOpenMenu = (userId, user) => {
        setMenuUserId(userId);
        setSelectedUser(user);
    };

    const handleCloseMenu = () => {
        setMenuUserId(null);
    };


    const { mutate: shareAgent } = useShareAgent(
        (data) => {
            toast.success('Shared successfully');
            console.log("✅ Shared successfully:", data);

            // 🔄 Refetch sales agent list after success
            queryClient.invalidateQueries(["salesAgent"]);
            setSharingId(null); // reset after success
        },
        (error) => {
            toast.error("Error Sharing");
            console.error("❌ Error sharing:", error);
            setSharingId(null); // reset on error too
        }
    );


    const { mutate: bulkUploadAgent } = useBulkUploadSalesAgent(
        (data) => {
            toast.success('Sales agents uploaded successfully');
            console.log("✅ Sales agents uploaded successfully:", data);

            queryClient.invalidateQueries(["salesAgent"]);
            // ❌ remove setImportFile(null);
        },
        (error) => {
            toast.error("Error uploading sales agents");
            console.error("❌ Error uploading sales agents:", error);
            // ❌ remove setImportFile(null);
        }
    );


    const fetchAllUsers = async () => {
        try {
            const response = await apiClient.get(`${import.meta.env.VITE_BASEURL}/influencer`, {
                params: {
                    page: 1,
                    limit: 10000,
                    filter,
                },
            });
            return response?.data?.data?.influencersData || [];
        } catch (error) {
            console.error("Error fetching all Sales agent for export:", error);
            toast.error("Failed to fetch Sales data.");
            return [];
        }
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const allUsers = await fetchAllUsers();
            console.log("allUsers", allUsers)
            setIsExporting(false);

            if (!allUsers || allUsers.length === 0) {
                toast.warning("No Sales Agent data to export.");
                return;
            }

            // ✅ Dynamic file name with timestamp
            const fileName = `Sales_Agent_List_${new Date().toISOString().slice(0, 10)}`;

            // ✅ Prepare data for export
            const exportData = allUsers.map((user, index) => ({
                "Sr. No.": index + 1,
                "User Name": `${user.first_name || ''} ${user.last_name || ''}`,
                "Contact No.": `${user.mobile_no_country_code || ''}${user.mobile_no || ''}`,
                "Email": user.email || '',
                "Enrollement Discount": user.enrollAmountDeduction || '',
                "Referral Code": user.referralCode || '',
                "Enrolment Discount Amount": user.enrolmentDiscountAmount || '',
                "Total Earned Amount": user.totalEarnedAmount || '',
                "Total Commission Earned(30%)": user.commissionEarned || '',
                "Total Paid": user.totalPaid || '',
                "Total Unpaid": user.totalUnPaid || '',
                "Total Users": user.user_id.length || '',
                "Performance Level": user.performanceLevel,
                "Tie": user.tie,
                "Account Holder Name": user.accountHolderName || '',
                "Account Number": user.accountNumber || '',
                "Account Type": user.accountType || '',
                "Bank Name": user?.bankId?.bank_name || '',
                "Branch Code": user?.bankId?.branch_code || '',
            }));

            // ✅ Create worksheet
            const worksheet = XLSX.utils.json_to_sheet(exportData);

            // ✅ Set dynamic column widths
            const columnWidths = Object.keys(exportData[0]).map((key) => ({
                wch: Math.max(
                    key.length,
                    ...exportData.map((row) => String(row[key] || '').length)
                ) + 2,
            }));
            worksheet['!cols'] = columnWidths;

            // ✅ Create workbook and add the worksheet
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "SalesAgents");

            // ✅ Export to Excel
            XLSX.writeFile(workbook, `${fileName}.xlsx`);
            toast.success("Export successful!");
        } catch (error) {
            setIsExporting(false);
            console.error("❌ Error exporting data:", error);
            toast.error("Failed to export data.");
        }
    };

    const handleaddagent = () => nav("/home/total-sales-agent/add-agent")

    const PayoutForm = useFormik({
        initialValues: {
            firstName: '',
            surname: '',
            branchCode: '',
            amount: 0,
            accountNumber: '',
            customerCode: ''
        }
    })

    const parseXmlResponse = (xmlString) => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "text/xml");

        const result = xmlDoc.getElementsByTagName("Result")[0]?.textContent;
        const message = xmlDoc.getElementsByTagName("ResultMessage")[0]?.textContent;

        return { result, message };
    };

    const payoutMutation = armedSosPayout(
        (res) => {
            console.log("🔍 payout API raw response:", res.data);

            let result, message;

            // Case 1: XML response
            if (typeof res.data === "string" && res.data.trim().startsWith("<")) {
                const parsed = parseXmlResponse(res.data);
                result = parsed.result;
                message = parsed.message;
            }
            // Case 2: JSON response
            else if (typeof res.data === "object") {
                result = res.data?.result || res.data?.status || "Success";
                message = res.data?.message || res.data?.title || "";
            }

            if (String(result).toLowerCase() === "success") {
                payoutUpdateMutation.mutate({
                    user_id: PayoutForm.values.customerCode || "", // safer than vehicleInfo
                    type: selectedPayoutType,
                    amount: PayoutForm.values.amount,
                });
                toast.success("Payment successful ✅");
                closePopup();
            } else {
                toast.error(message || "Payment failed ❌");
                console.error("Payment Error:", message, "Raw result:", result);
            }
        },
        (err) => {
            toast.error("Payment failed ❌");
            console.error("Error!", err);
        }
    );



    const payoutUpdateMutation = payoutUserUpdate(
        (res) => {
            toast.success('payment successful');
        },
        (err) => {
            toast.error('payment failed')
        }
    );

    const handleChange = () => {
        payoutMutation.mutate(PayoutForm.values);
    };


    const handlePopup = (event, type, payoutType, agent) => {
        event.stopPropagation();
        if (agent) {
            PayoutForm.setValues({
                firstName: agent.first_name || "",
                surname: agent.last_name || "",
                branchCode: agent.bank?.branch_code || "",
                accountNumber: agent.accountNumber || "",
                customerCode: agent._id || "",
                amount: agent.totalUnPaid || 0,
            });
        }
        setPopup(type);
        setSelectedPayoutType(payoutType);
    };

    const closePopup = () => {
        setPopup('')
    }
    const renderPopup = () => {
        if (!payPopup) return null;

        switch (payPopup) {
            case "payout":
                return (
                    <PayoutPopup
                        yesAction={handleChange}
                        noAction={closePopup}
                    />
                );
            default:
                return null;
        }
    };

    useEffect(() => {
        const data = UserList?.data?.data?.data

        if (data) {
            setMenuUserId(null)
            console.log("working")
            console.log(menuUserId)
        }
    }, [UserList?.data?.data?.data])

    return (
        <Box p={2}>
            <Grid container spacing={2}>

                {/* Cards */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <div className="dash-counter orange dash-sales-data">
                        <div className="d-flex justify-content-between  w-100 ">
                            <div className="">
                                <span>Total Earned Amount</span>
                                <h3>R {UserList.data?.data?.data?.totalEarnedAmount || 0}</h3>
                            </div>
                            <img src={sa1} alt="dash-counter" />

                        </div>
                        <div className="">
                            <div className="d-flex gap-2">
                                <div className="percentage-green">
                                    {/* {companyList?.data?.data?.companiesPercentageFromLastMonth === 0 ? "" : <FaArrowUpLong />} {companyList?.data?.data?.companiesPercentageFromLastMonth?.toFixed(2)} % */}
                                    ↑ 2%
                                </div>
                                <span> from last month</span>
                            </div>
                        </div>
                    </div>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <div className="dash-counter blue dash-sales-data">
                        <div className="d-flex justify-content-between  w-100 ">
                            <div className="">
                                <span>Total Commission Earned(30%)</span>
                                <h3>R {UserList.data?.data?.data?.totalCommissionEarned || 0}</h3>
                            </div>
                            <img src={sa2} alt="dash-counter" />

                        </div>
                        <div className="">
                            <div className="d-flex gap-2">
                                <div className="percentage-green">
                                    {/* {companyList?.data?.data?.companiesPercentageFromLastMonth === 0 ? "" : <FaArrowUpLong />} {companyList?.data?.data?.companiesPercentageFromLastMonth?.toFixed(2)} % */}
                                    ↑ 2%
                                </div>
                                <span> from last month</span>
                            </div>
                        </div>
                    </div>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <div className="dash-counter green dash-sales-data">
                        <div className="d-flex justify-content-between  w-100 ">
                            <div className="">
                                <span>Total Users</span>
                                <h3>R {UserList.data?.data?.data?.grandTotalUsers || 0}</h3>
                            </div>
                            <img src={sa3} alt="dash-counter" />

                        </div>
                        <div className="">
                            <div className="d-flex gap-2">
                                <div className="percentage-green">
                                    {/* {companyList?.data?.data?.companiesPercentageFromLastMonth === 0 ? "" : <FaArrowUpLong />} {companyList?.data?.data?.companiesPercentageFromLastMonth?.toFixed(2)} % */}
                                    ↑ 2%
                                </div>
                                <span> from last month</span>
                            </div>
                        </div>
                    </div>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <div className="dash-counter green2 dash-sales-data">
                        <div className="d-flex justify-content-between  w-100 ">
                            <div className="">
                                <span>Total Paid Amount</span>
                                <h3>R {UserList.data?.data?.data.totalPaid || 0}</h3>
                            </div>
                            <img src={sa4} alt="dash-counter" />

                        </div>
                        <div className="">
                            <div className="d-flex gap-2">
                                <div className="percentage-green">
                                    {/* {companyList?.data?.data?.companiesPercentageFromLastMonth === 0 ? "" : <FaArrowUpLong />} {companyList?.data?.data?.companiesPercentageFromLastMonth?.toFixed(2)} % */}
                                    ↑ 2%
                                </div>
                                <span> from last month</span>
                            </div>
                        </div>
                    </div>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <div className="dash-counter orange dash-sales-data">
                        <div className="d-flex justify-content-between  w-100 ">
                            <div className="">
                                <span>Total Unpaid Amount</span>
                                <h3>R {UserList.data?.data?.data.totalUnpaid || 0}</h3>
                            </div>
                            <img src={sa5} alt="dash-counter" />

                        </div>
                        <div className="">
                            <div className="d-flex gap-2">
                                <div className="percentage-green">
                                    {/* {companyList?.data?.data?.companiesPercentageFromLastMonth === 0 ? "" : <FaArrowUpLong />} {companyList?.data?.data?.companiesPercentageFromLastMonth?.toFixed(2)} % */}
                                    ↑ 2%
                                </div>
                                <span> from last month</span>
                            </div>
                        </div>
                    </div>
                </Grid>

                {/* Filters */}
                <Grid size={{ xs: 12 }}>
                    <Paper
                        elevation={3}
                        sx={{ backgroundColor: "rgb(253, 253, 253)", p: 2, borderRadius: "10px" }}
                    >

                        {/* Headers */}
                        <Grid container justifyContent="space-between" alignItems="center" mb={2}>
                            <Grid
                                size={{ xs: 12, lg: 2.5 }}
                                sx={{ display: "flex", flexDirection: "row", gap: 2, mb: { xs: 1, md: 0 } }}
                            >
                                <Typography variant="h6" fontWeight={590}>
                                    Sales Agent
                                </Typography>
                                <Typography variant="h6" fontWeight={550}>
                                    {UserList.isSuccess && UserList?.data?.data?.data?.totalCount || 0}
                                </Typography>
                            </Grid>

                            <Grid size={{ xs: 12, lg: 9.5 }} sx={{ display: 'flex', justifyContent: 'flex-end', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mt: { xs: 2, lg: 0 } }}>
                                <TextField
                                    variant="outlined"
                                    placeholder="Search"
                                    value={filter}
                                    onChange={(e) => setfilter(e.target.value)}
                                    fullWidth
                                    sx={{
                                        width: "100%",
                                        height: "40px",
                                        borderRadius: "8px",
                                        "& .MuiInputBase-root": {
                                            height: "40px",
                                            fontSize: "14px",
                                        },
                                        "& .MuiOutlinedInput-input": {
                                            padding: "10px 14px",
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

                                <Box display="flex" gap={1} sx={{ justifyContent: { xs: "space-between" } }}>
                                    <CustomDateRangePicker
                                        value={range}
                                        onChange={setRange}
                                        icon={calender}
                                    />
                                    <CustomExportMenu onExport={handleExport} />
                                    <Button variant="outlined" startIcon={<img src={plus} alt="plus icon" />} sx={{ height: '40px', width: '160px', fontSize: '0.8rem', borderRadius: '8px', border: '1px solid var(--Blue)' }} onClick={() => setpopup(true)}>
                                        Import Sheet
                                    </Button>
                                    <Button variant="contained" onClick={handleaddagent} sx={{ height: '40px', fontSize: '0.8rem', width: '150px', borderRadius: '8px' }}
                                        startIcon={<img src={whiteplus} alt='white plus' />}>
                                        Add Agent
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>

                        {/* Table */}
                        <Box sx={{
                            px: { xs: 0, md: 2 },
                            pt: { xs: 0, md: 3 },
                            backgroundColor: "#FFFFFF",
                            borderRadius: "10px",
                        }}
                        >
                            <TableContainer>
                                <Table sx={{ "& .MuiTableCell-root": { fontSize: "15px" } }}>
                                    <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                                        <TableRow>
                                            <TableCell sx={{ backgroundColor: "#F9FAFB", borderTopLeftRadius: '10px', color: "#4B5563" }}>
                                                <TableSortLabel
                                                    id="first_name"
                                                    active={sortBy === 'first_name'}
                                                    direction={sortOrder}
                                                    onClick={changeSortOrder}
                                                    IconComponent={() => <img src={sortBy === 'first_name' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                >
                                                    User
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell sx={{ backgroundColor: "#F9FAFB", color: "#4B5563", width: '10%' }}>
                                                <TableSortLabel
                                                    id="mobile_no_country_code"
                                                    active={sortBy === 'mobile_no_country_code'}
                                                    direction={sortOrder}
                                                    onClick={changeSortOrder}
                                                    IconComponent={() => <img src={sortBy === 'mobile_no_country_code' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                >
                                                    Contact No.
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell sx={{ backgroundColor: "#F9FAFB", color: "#4B5563" }}>
                                                <TableSortLabel
                                                    id="email"
                                                    active={sortBy === 'email'}
                                                    direction={sortOrder}
                                                    onClick={changeSortOrder}
                                                    IconComponent={() => <img src={sortBy === 'email' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                >
                                                    Email
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell sx={{ backgroundColor: "#F9FAFB", color: "#4B5563" }}>
                                                <TableSortLabel
                                                    id="enrollAmountDeduction"
                                                    active={sortBy === 'enrollAmountDeduction'}
                                                    direction={sortOrder}
                                                    onClick={changeSortOrder}
                                                    IconComponent={() => <img src={sortBy === 'enrollAmountDeduction' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                >
                                                    Enrolment Discount %
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell sx={{ backgroundColor: "#F9FAFB", color: "#4B5563" }}>
                                                <TableSortLabel
                                                    id="totalEarnedAmount"
                                                    active={sortBy === 'totalEarnedAmount'}
                                                    direction={sortOrder}
                                                    onClick={changeSortOrder}
                                                    IconComponent={() => <img src={sortBy === 'totalEarnedAmount' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                >
                                                    Total Earned Amount
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                                <TableSortLabel
                                                    id="commissionEarned"
                                                    active={sortBy === 'commissionEarned'}
                                                    direction={sortOrder}
                                                    onClick={changeSortOrder}
                                                    IconComponent={() => <img src={sortBy === 'commissionEarned' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                >
                                                    Total Commission Earned(30%)
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                                <TableSortLabel
                                                    id="totalUnPaid"
                                                    active={sortBy === 'totalUnPaid'}
                                                    direction={sortOrder}
                                                    onClick={changeSortOrder}
                                                    IconComponent={() => <img src={sortBy === 'totalUnPaid' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}

                                                >
                                                    Unpaid Amount
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                                <TableSortLabel
                                                    id="totalPaid"
                                                    active={sortBy === 'totalPaid'}
                                                    direction={sortOrder}
                                                    onClick={changeSortOrder}
                                                    IconComponent={() => <img src={sortBy === 'totalPaid' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                >
                                                    Paid Amount
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                                <TableSortLabel
                                                    id="length"
                                                    active={sortBy === 'length'}
                                                    direction={sortOrder}
                                                    onClick={changeSortOrder}
                                                    IconComponent={() => <img src={sortBy === 'length' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                >
                                                    Total Users
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                                <TableSortLabel
                                                    id="accountNumber"
                                                    active={sortBy === 'accountNumber'}
                                                    direction={sortOrder}
                                                    onClick={changeSortOrder}
                                                    IconComponent={() => <img src={sortBy === 'accountNumber' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                >
                                                    Account Number
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                                <TableSortLabel
                                                    id="bank_name"
                                                    active={sortBy === 'bank_name'}
                                                    direction={sortOrder}
                                                    onClick={changeSortOrder}
                                                    IconComponent={() => <img src={sortBy === 'bank_name' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                >
                                                    Bank Name
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                                <TableSortLabel
                                                    id="branch_code"
                                                    active={sortBy === 'branch_code'}
                                                    direction={sortOrder}
                                                    onClick={changeSortOrder}
                                                    IconComponent={() => <img src={sortBy === 'branch_code' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                >
                                                    Branch Code
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                                <TableSortLabel
                                                    id="sharedStatus"
                                                    active={sortBy === 'sharedStatus'}
                                                    direction={sortOrder}
                                                    onClick={changeSortOrder}
                                                    IconComponent={() => <img src={sortBy === 'sharedStatus' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                >
                                                    Share Status
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                                <TableSortLabel
                                                    id="performanceLevel"
                                                    active={sortBy === 'performanceLevel'}
                                                    direction={sortOrder}
                                                    onClick={changeSortOrder}
                                                    IconComponent={() => <img src={sortBy === 'performanceLevel' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                >
                                                    Performance Level
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                                <TableSortLabel
                                                    id="tie"
                                                    active={sortBy === 'tie'}
                                                    direction={sortOrder}
                                                    onClick={changeSortOrder}
                                                    IconComponent={() => <img src={sortBy === 'tie' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                >
                                                    Tie
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell
                                                align="center"
                                                sx={{ backgroundColor: "#F9FAFB", borderTopRightRadius: '10px', color: "#4B5563" }}
                                            >
                                                Actions
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {UserList.isFetching ?
                                            <TableRow>
                                                <TableCell sx={{ color: '#4B5563', borderBottom: 'none' }} colSpan={16} align="center">
                                                    <Loader />
                                                </TableCell>
                                            </TableRow>
                                            : (agentList?.length > 0 ?
                                                agentList?.map((user) => (
                                                    <TableRow key={user._id}>
                                                        <TableCell sx={{ color: "#4B5563" }}>
                                                            <Stack direction="row" alignItems="center" gap={1.5}>
                                                                <Avatar
                                                                    src={user?.selfieImage || nouser}
                                                                    alt="user"
                                                                    sx={{ width: 32, height: 32 }}
                                                                />
                                                                {user.first_name} {user.last_name}

                                                            </Stack>
                                                        </TableCell>

                                                        <TableCell sx={{ color: "#4B5563" }}>
                                                            {`${user?.mobile_no_country_code ?? ''}${user?.mobile_no ?? ''}`}
                                                        </TableCell>

                                                        <TableCell sx={{ color: "#4B5563" }}>
                                                            {user.email}
                                                        </TableCell>

                                                        <TableCell sx={{ color: "#4B5563" }}>
                                                            {user.enrollAmountDeduction}
                                                        </TableCell>

                                                        <TableCell sx={{ color: "#4B5563" }}>
                                                            {user.totalEarnedAmount}
                                                        </TableCell>

                                                        <TableCell sx={{ color: "#4B5563" }}>
                                                            {user.commissionEarned}
                                                        </TableCell>

                                                        <TableCell sx={{ color: "#4B5563" }}>
                                                            {user.totalUnPaid || 0}
                                                        </TableCell>

                                                        <TableCell sx={{ color: "#4B5563" }}>
                                                            {user.totalPaid || 0}
                                                        </TableCell>

                                                        <TableCell sx={{ color: "#4B5563" }}>
                                                            {user.user_id.length}
                                                        </TableCell>

                                                        <TableCell sx={{ color: "#4B5563" }}>
                                                            {user.accountNumber ?? '-'}
                                                        </TableCell>

                                                        <TableCell sx={{ color: "#4B5563" }}>
                                                            {user.bankId?.bank_name ? user.bankId.bank_name : "-"}
                                                        </TableCell>

                                                        <TableCell sx={{ color: "#4B5563" }}>
                                                            {user.bankId?.branch_code ? user.bankId.branch_code : "-"}
                                                        </TableCell>

                                                        <TableCell sx={{ color: "#4B5563" }}>
                                                            {user.sharedStatus ?? '-'}
                                                        </TableCell>

                                                        <TableCell sx={{ color: "#4B5563" }}>
                                                            {user.performanceLevel ? user.performanceLevel : "-"}
                                                        </TableCell>

                                                        <TableCell sx={{ color: "#4B5563" }}>
                                                            {user.tie ?? '-'}
                                                        </TableCell>

                                                        <TableCell sx={{ backgroundColor: 'white' }}>
                                                            <Box align="center" sx={{ display: 'flex', flexDirection: 'row' }}>
                                                                <IconButton
                                                                    ref={(el) => (buttonRefs.current[user._id] = el)}
                                                                    onClick={() => handleOpenMenu(user._id, user)}
                                                                >
                                                                    <MoreVertIcon />
                                                                </IconButton>


                                                            </Box>
                                                        </TableCell>
                                                        <Menu
                                                            anchorEl={menuUserId ? buttonRefs.current[menuUserId] : null}
                                                            open={Boolean(menuUserId)}
                                                            onClose={handleCloseMenu}
                                                            anchorOrigin={{
                                                                vertical: "bottom",
                                                                horizontal: "right",
                                                            }}
                                                            transformOrigin={{
                                                                vertical: "top",
                                                                horizontal: "right",
                                                            }}
                                                        >
                                                            <MenuItem
                                                                onClick={() => {
                                                                    nav(`/home/total-sales-agent/agent-information/${selectedUser._id}`)
                                                                    handleCloseMenu();
                                                                }}
                                                            >
                                                                <img src={OutlinedView} alt="view button" /> &nbsp; View
                                                            </MenuItem>
                                                            <MenuItem
                                                                onClick={() => {
                                                                    setSharingId(selectedUser?._id);
                                                                    shareAgent({ id: selectedUser?._id, email: selectedUser?.email });
                                                                    handleCloseMenu();
                                                                }}
                                                            >
                                                                <img src={OutlinedShare} alt="edit button" /> &nbsp;   {sharingId === selectedUser?._id ? "Sharing..." : "Share"}
                                                            </MenuItem>
                                                            {selectedUser?.amount >= 10 && (
                                                                <MenuItem
                                                                    onClick={(event) => {
                                                                        handlePopup(event, 'payout', 'sales_agent', selectedUser);
                                                                        handleCloseMenu();
                                                                    }}
                                                                >
                                                                    <img src={OutlinedPay} alt="edit button" /> &nbsp; Pay
                                                                </MenuItem>
                                                            )}
                                                            <MenuItem
                                                                onClick={() => {
                                                                    setconfirmation(selectedUser._id);
                                                                    handleCloseMenu();
                                                                }}
                                                            >
                                                                <img src={outlinedDustbin} alt="dustbin button" /> &nbsp;   Delete
                                                            </MenuItem>
                                                        </Menu>

                                                        {/* <TableCell>
                                                            <Box
                                                                align="center"
                                                                sx={{ display: "flex", flexDirection: "row", gap: 0 }}
                                                            >
                                                                <Tooltip title="View" arrow placement="top">
                                                                    <IconButton onClick={() =>
                                                                        nav(`/home/total-users/user-information/${driver._id}`)
                                                                    }>
                                                                        <img src={ViewBtn} alt="view button" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="Delete" arrow placement="top">
                                                                    <IconButton onClick={() => setconfirmation(driver._id)}>
                                                                        <img src={delBtn} alt="delete button" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="Payout" arrow placement="top">
                                                                    <IconButton onClick={(event) =>
                                                                        handlePopup(event, "payout", "driver", driver)
                                                                    }>
                                                                        <img src={driverPayoutIcon} alt="payout button" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                {confirmation === driver._id && (
                                                                    <DeleteConfirm
                                                                        id={driver._id}
                                                                        setconfirmation={setconfirmation}
                                                                    />
                                                                )}

                                                            </Box>
                                                        </TableCell> */}
                                                    </TableRow>
                                                ))
                                                :
                                                <TableRow>
                                                    <TableCell sx={{ color: '#4B5563', borderBottom: 'none' }} colSpan={16} align="center">
                                                        <Typography align="center" color="text.secondary" sx={{ mt: 2 }}>
                                                            No data found
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>)
                                        }
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            {/* Pagination */}
                            {!UserList.isFetching && agentList?.length > 0 && <Grid
                                container
                                sx={{ px: { xs: 0, sm: 3 } }}
                                justifyContent="space-between"
                                alignItems="center"
                                mt={2}
                            >
                                <Grid >
                                    <Typography variant="body2">
                                        Rows per page:&nbsp;
                                        <MuiSelect
                                            size="small"
                                            sx={{
                                                border: "none",
                                                boxShadow: "none",
                                                outline: "none",
                                                "& .MuiOutlinedInput-notchedOutline": {
                                                    border: "none",
                                                },
                                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                                    border: "none",
                                                },
                                                "& .MuiOutlinedInput-root": {
                                                    boxShadow: "none",
                                                    outline: "none",
                                                },
                                                "& .MuiSelect-select": {
                                                    outline: "none",
                                                },
                                            }}
                                            value={rowsPerPage}
                                            onChange={(e) => {
                                                setRowsPerPage(Number(e.target.value));
                                                setpage(1);
                                            }}
                                        >
                                            {[5, 10, 15, 20].map((num) => (
                                                <MenuItem key={num} value={num}>
                                                    {num}
                                                </MenuItem>
                                            ))}
                                        </MuiSelect>
                                    </Typography>
                                </Grid>

                                <Grid>
                                    <Box display="flex" alignItems="center" gap={{ xs: 1, sm: 2 }}>
                                        <Typography variant="body2">
                                            {page} / {totalPages}
                                        </Typography>
                                        <IconButton
                                            disabled={page === 1}
                                            onClick={() => setpage((prev) => prev - 1)}
                                        >
                                            <NavigateBeforeIcon
                                                fontSize="small"
                                                sx={{
                                                    color: page === 1 ? "#BDBDBD" : "#1976d2",
                                                }}
                                            />
                                        </IconButton>
                                        <IconButton
                                            disabled={page === totalPages}
                                            onClick={() => setpage((prev) => prev + 1)}
                                        >
                                            <NavigateNextIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </Grid>
                            </Grid>}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
            {/* <div className="container-fluid"> */}
            {/* <div className="row"> */}
            {/* <div className="col-md-12"> */}
            {/* <div className="theme-table"> */}
            {/* <div className="row">

            </div> */}
            {/* <div className="tab-heading">
                <div className="count p-2">
                    <h3 className=" text-nowrap">Total Sales Agent</h3>
                    <p >{UserList.isSuccess && UserList?.data?.data?.data?.totalCount || 0}</p>
                </div>
                <div className="tbl-filter">
                    <div className="input-group" style={{ width: '40%' }}>
                        <span className="input-group-text">
                            <img src={search} />
                        </span>
                        <input
                            type="text"
                            value={filter}
                            onChange={(e) => setfilter(e.target.value)}
                            className="form-control"
                            placeholder="Search"
                        />
                        <span className="input-group-text">
                            <img src={icon} />
                        </span>

                    </div>
                    <CustomDateRangePicker
                        value={range}
                        onChange={setRange}
                        icon={calender}

                    />
                    <button
                        onClick={() => nav("/home/total-sales-agent/add-agent")}
                        className="btn btn-primary "
                    >
                        + Add Agent
                    </button>
                    <button className="btn btn-primary" onClick={handleExport}
                        disabled={isExporting}>
                        {isExporting ? 'Exporting...' : '+ Export Sheet'}
                    </button>

                    <button
                        className="btn btn-primary"
                        onClick={() => setpopup(true)}

                    >
                        + Import Sheet

                    </button>
                </div>
                {
                    popup && (
                        <ImportSheet setpopup={setpopup} popup={popup} type="sales-agent" />
                    )
                }
            </div> */}
            {/* {UserList.isFetching ? (
                <Loader />
            ) : (
                <>
                    {agentList?.length > 0 ? (
                        <>
                            <div
                                style={{
                                    width: "100%",
                                    overflowX: "auto",   // enables horizontal scroll
                                    overflowY: "hidden", // hides vertical scroll if not needed

                                }}
                            >
                                <table
                                    id="example"
                                    className="table table-striped nowrap"
                                    style={{ width: "100%" }}
                                >
                                    <thead>
                                        <tr>

                                            <th>User</th>
                                            <th>Contact No.</th>
                                            <th>Email</th>
                                            <th>Enrolment Discount %</th>
                                            <th>Total Earned Amount</th>
                                            <th>Total Commission Earned(30%)</th>
                                            <th>Unpaid Amount</th>
                                            <th>Paid Amount</th>
                                            <th>Total Users</th>
                                            <th>Account Number</th>
                                            <th>Bank Name</th>
                                            <th>Branch Code</th>
                                            <th>Share Status</th>
                                            <th>Performance Level</th>
                                            <th>Tie</th>
                                            <th>&nbsp;</th>
                                            <th>&nbsp;</th>
                                            <th>&nbsp;</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {UserList?.data && agentList?.map((user) => (
                                            <tr key={user._id}>
                                                <td>
                                                    <div
                                                        className={
                                                            (!user.first_name && !user.last_name) ? "prof nodata" : "prof"
                                                        }
                                                    >
                                                        <img
                                                            className="profilepicture"
                                                            src={
                                                                user.selfieImage
                                                                    ? user.selfieImage
                                                                    : nouser
                                                            }
                                                        />
                                                        {user.first_name} {user.last_name}
                                                    </div>
                                                </td>

                                                <td className={!user?.mobile_no ? "nodata" : ""}>
                                                    {`${user?.mobile_no_country_code ?? ''}${user?.mobile_no ?? ''}`}
                                                </td>
                                                <td className={!user.email ? "nodata" : ""}>
                                                    {user.email}
                                                </td>
                                                <td className={!user.enrollAmountDeduction ? "" : ""}>
                                                    {user.enrollAmountDeduction}
                                                </td>
                                                <td className={!user.totalEarnedAmount ? "0" : ""}>
                                                    {user.totalEarnedAmount}
                                                </td>
                                                <td className={!user.commissionEarned ? "0" : ""}>
                                                    {user.commissionEarned}
                                                </td>
                                                <td className={!user.totalUnPaid ? "0" : ""}>
                                                    {user.totalUnPaid}
                                                </td>
                                                <td className={!user.totalPaid ? "0" : ""}>
                                                    {user.totalPaid || 0}
                                                </td>
                                                <td className={!user.user_id ? "0" : ""}>
                                                    {user.user_id.length}
                                                </td>
                                                <td className={!user.accountNumber ? "nodata" : ""}>
                                                    {user.accountNumber}
                                                </td>
                                                <td className={!user.bankId ? "nodata" : ""}>
                                                    {user.bankId?.bank_name ? user.bankId.bank_name : ""}
                                                </td>
                                                <td className={!user.bankId ? "nodata" : ""}>
                                                    {user.bankId?.branch_code ? user.bankId.branch_code : ""}
                                                </td>
                                                <td className={!user.sharedStatus ? "nodata" : ""}>
                                                    {user.sharedStatus}
                                                </td>

                                                <td className={!user.performanceLevel ? "nodata" : ""}>
                                                    {user.performanceLevel ? user.performanceLevel : ""}
                                                </td>
                                                <td className={!user.tie ? "" : ""}>
                                                    {user.tie}
                                                </td>
                                                <td >

                                                    <span
                                                        onClick={() =>
                                                            nav(
                                                                `/home/total-sales-agent/agent-information/${user._id}`
                                                            )
                                                        }
                                                        className="tbl-btn"
                                                        style={{ marginRight: "10px" }}
                                                    >
                                                        view
                                                    </span>
                                                    <span
                                                        onClick={() => {
                                                            setSharingId(user?._id);
                                                            shareAgent({ id: user?._id, email: user?.email });
                                                        }}
                                                        className="tbl-gray ml-2 cursor-pointer"
                                                        style={{ marginRight: "10px" }}
                                                    >
                                                        {sharingId === user?._id ? "Sharing..." : "Share"}
                                                    </span>
                                                    <span
                                                        onClick={(event) => handlePopup(event, 'payout', 'sales_agent')}
                                                        className="tbl-gray ml-2 cursor-pointer"
                                                    >
                                                        Pay
                                                    </span>
                                                    <span
                                                        onClick={() => setconfirmation(user._id)}
                                                        className="tbl-gray"
                                                    >
                                                        Delete
                                                    </span>
                                                    {confirmation === user._id && (
                                                        <DeleteSalesAgent
                                                            id={user._id}
                                                            setconfirmation={setconfirmation}
                                                        />
                                                    )}
                                                </td>

                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                            </div>
                            <div className="pagiation">
                                <div className="pagiation-left">
                                    <button
                                        disabled={page === 1}
                                        onClick={() => setpage((p) => p - 1)}
                                    >
                                        <img src={Prev} /> Prev
                                    </button>
                                </div>
                                <div className="pagiation-right">
                                    <button
                                        disabled={page === UserList?.data?.data?.data?.totalPages}
                                        onClick={() => setpage((p) => p + 1)}
                                    >
                                        Next <img src={Next} />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <p className="no-data-found">No data found</p>
                    )}
                </>
            )} */}
            {/* </div> */}
            {/* </div> */}
            {/* </div> */}
            {payPopup && renderPopup()}
            {/* </div> */}
        </Box>
    );
};

export default ListOfSalesAgent;