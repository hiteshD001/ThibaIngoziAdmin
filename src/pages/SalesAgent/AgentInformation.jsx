import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Grid, Select, Typography, Box, FormControl, InputLabel, Button, FormHelperText, TextField, Table, TableBody, InputAdornment, TableContainer, TableHead, TableRow, TableCell, TableSortLabel, MenuItem, IconButton, Stack, Avatar, Tooltip } from "@mui/material";
import { useFormik } from "formik"
import { sales_agent_e } from "../../common/FormValidation";
import { useQueryClient } from "@tanstack/react-query"
import { useGetAgent, useUpdateSalesAgent, useGetBanksList, useGetUserByInfluncer, armedSosPayout, payoutUserUpdate } from "../../API Calls/API"
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { toast } from "react-toastify"
import { QRCodeCanvas } from "qrcode.react";
import { toastOption } from "../../common/ToastOptions"
import PhoneInput from "react-phone-input-2"
import PayoutPopup from "../../common/Popup";
import nouser from "../../assets/images/NoUser.png";
import Loader from "../../common/Loader";
import { startOfYear } from "date-fns";
import { BootstrapInput } from "../../common/BootstrapInput";
import calender from '../../assets/images/calender.svg';
import CustomDateRangePicker from "../../common/Custom/CustomDateRangePicker";
import sales1 from '../../assets/images/sales1.svg'
import search from "../../assets/images/search.svg";
import sa5 from '../../assets/images/sa5.svg'
import sa3 from '../../assets/images/sa3.svg'
import sales4 from '../../assets/images/sales4.svg'
import sales2 from '../../assets/images/sales2.svg'
import sales3 from '../../assets/images/sales3.svg'
import sales5 from '../../assets/images/sales5.svg'
import sales6 from '../../assets/images/sales6.svg'
import arrowup from '../../assets/images/arrowup.svg';
import arrowdown from '../../assets/images/arrowdown.svg';
import arrownuteral from '../../assets/images/arrownuteral.svg';
import payIcon from '../../assets/images/payIcon.svg';
import CustomExportMenu from '../../common/Custom/CustomExport'
import apiClient from '../../API Calls/APIClient'
import CustomSelect from '../../common/Custom/CustomSelect'
import ViewBtn from '../../assets/images/ViewBtn.svg'


const AgentInformation = () => {
    const [edit, setEdit] = useState(false)
    // const [role] = useState(localStorage.getItem("role"));
    const nav = useNavigate();
    const params = useParams();
    const [page, setpage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    const [filter, setfilter] = useState("");
    const client = useQueryClient()
    const bankslist = useGetBanksList()
    const [payPopup, setPopup] = useState('')
    const [selectedPayoutType, setSelectedPayoutType] = useState('');
    const [tieUsers, setTieUsers] = useState([]);
    const [tieData, setTieData] = useState(true)
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
    // console.log("tieUsers", tieUsers);
    const agentForm = useFormik({
        initialValues: {
            referralCode: "",
            enrollAmountDeduction: "",
            first_name: "",
            last_name: "",
            accountNumber: "",
            customerCode: "",
            accountType: "",
            accountHolderName: "",
            bankId: "",
            email: "",
            mobile_no: "",
            mobile_no_country_code: "",
        },
        validationSchema: sales_agent_e,
        onSubmit: (values) => {
            setEdit(false);
            mutate({
                id: params.id,
                data: values,
            });
        },
    });
    const [range, setRange] = useState([
        {
            startDate: startOfYear(new Date()),
            endDate: new Date(),
            key: 'selection'
        }
    ]);
    const startDate = range[0].startDate.toISOString();
    const endDate = range[0].endDate.toISOString();
    const driverList = useGetUserByInfluncer(page, 10, startDate, endDate, params.id)
    const totalUsers = driverList.data?.data?.data?.totalCount || 0;
    const totalPages = Math.ceil(totalUsers / rowsPerPage);
    // console.log('test',driverList.data?.data?.data?.influencersData)
    const UserInfo = useGetAgent(params.id)
    const onSuccess = () => {
        toast.success("Agent Updated Successfully.");
        client.invalidateQueries("agent", { exact: false })
    }
    const onError = (error) => { toast.error(error.response.data.message || "Something went Wrong", toastOption) }

    const { mutate } = useUpdateSalesAgent(onSuccess, onError)

    const handleCancel = () => {
        const data = UserInfo.data?.data?.data;
        if (data) {
            agentForm.resetForm({ values: data });
        }
        setEdit(false);
    };
    useEffect(() => {
        const data = UserInfo.data?.data
        if (data) {
            setAgentformvalues({ form: agentForm, data: UserInfo.data?.data?.data })
        }
    }, [UserInfo.data])
    const displayField = (label, value) => (
        <Box mb={3}>
            <Typography sx={{ fontSize: '1.1rem', fontWeight: 400, mb: 1 }}>{label}</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ ml: 0.5 }}>
                {value || "-"}
            </Typography>
        </Box>
    );
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
            // Extract JSON data from Axios response
            const responseData = res.data;
    
            if (responseData?.success === true && responseData?.data?.payouts?.length > 0) {
                const payout = responseData.data.payouts[0];
    
                if (payout.status === 'pending' || payout.status === 'processing') {
                    payoutUpdateMutation.mutate({
                        user_id: UserInfo.data?.data?.data._id,
                        type: selectedPayoutType,
                        amount: UserInfo.data?.data?.data.totalUnPaid,
                    });
                    toast.success('Payment request created successfully. Status: ' + payout.status);
                    closePopup();
                } else if (payout.status === 'completed') {
                    toast.success('Payment completed successfully');
                } else {
                    toast.error(`Payment failed. Status: ${payout.status}`);
                    console.error("Payment Error:", payout);
                }
    
            } else {
                toast.error('Payment failed');
                console.error("Payment Error:", responseData);
            }
        },
    
        (err) => {
            toast.error('Payment failed');
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

    const handlePopup = (event, type, payoutType) => {
        event.stopPropagation();

        PayoutForm.setValues({
            user_id: UserInfo.data?.data?.data?._id || "",
            firstName: UserInfo.data?.data?.data?.first_name || "",
            surname: UserInfo.data?.data?.data?.last_name || "",
            // branchCode: UserInfo.data?.data?.data.bankId?.branch_code || "",
            bank_name: UserInfo.data?.data?.data.bank?.bank_name || "",
            branchCode: UserInfo.data?.data?.data.bank?.branch_code || "",
            accountNumber: UserInfo.data?.data?.data?.accountNumber || "",
            customerCode: UserInfo.data?.data?.data?.customerCode || "",
            amount: UserInfo.data?.data?.data?.totalUnPaid || 0,
        });

        setPopup(type);
        setSelectedPayoutType(payoutType);
    };

    const closePopup = (event) => {
        // event.stopPropagation();
        setPopup('')
    }
    const renderPopup = () => {
        switch (payPopup) {
            case 'payout':
                return <PayoutPopup yesAction={handleChange} noAction={closePopup} />;
            default:
                return null;
        }
    };
    // console.log('test',UserInfo.data?.data?.data)

    const handleExport = async ({ startDate, endDate, format }) => {
        try {
            const { data } = await apiClient.get(`${import.meta.env.VITE_BASEURL}/users`, {
                params: {
                    role: "passanger",
                    page: 1,
                    limit: 10000,
                    filter: "",
                    company_id: paramId,
                    startDate,
                    endDate,
                },
            });

            const allUsers = data?.users || [];
            if (!allUsers.length) {
                toast.warning("No User data found for this period.");
                return;
            }

            const exportData = allUsers.map(user => ({
                "User": `${user.first_name || ''} ${user.last_name || ''}` || '',
                "Company Name": user.company_name || '',
                "Contact No.": `${user.mobile_no_country_code || ''}${user.mobile_no || ''}`,
                "Contact Email": user.email || ''
            }));

            if (format === "xlsx") {
                const worksheet = XLSX.utils.json_to_sheet(exportData);
                const columnWidths = Object.keys(exportData[0] || {}).map((key) => ({
                    wch: Math.max(key.length, ...exportData.map((row) => String(row[key] ?? 'NA').length)) + 2
                }));
                worksheet['!cols'] = columnWidths;
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
                XLSX.writeFile(workbook, "User_List.xlsx");
            }
            else if (format === "csv") {
                const worksheet = XLSX.utils.json_to_sheet(exportData);
                const csv = XLSX.utils.sheet_to_csv(worksheet);
                const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'user_list.csv';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
            else if (format === "pdf") {
                const doc = new jsPDF();
                doc.text('User List', 14, 16);
                autoTable(doc, {
                    head: [['User', 'Company Name', 'Contact No.', 'Contact Email']],
                    body: allUsers.map(user => [
                        `${user.first_name || ''} ${user.last_name || ''}` ?? 'NA',
                        user.company_name ?? 'NA',
                        `${user.mobile_no_country_code || ''}${user.mobile_no || ''}` ?? 'NA',
                        user.email ?? 'NA'
                    ]),
                    startY: 20,
                    theme: 'striped',
                    headStyles: { fillColor: '#367BE0' },
                    margin: { top: 20 },
                    styles: { fontSize: 10 },
                });
                doc.save("User_List.pdf");
            }

        } catch (err) {
            console.error("Error exporting data:", err);
            toast.error("Export failed.");
        }
    };

    const getTrendData = (type) => {
        let stat;
      
        // For transaction types (earned, commission, paid, unpaid)
        if (type !== "user") {
          stat = UserInfo.data?.data?.data?.monthlyStats?.find(
            (item) => item.transactionType === type
          );
        } else if(type == "userAll"){
            stat = UserInfo.data?.data?.data?.allUserStats;
        } else {
            stat = UserInfo.data?.data?.data?.userStats;
        }
      
        const percent = stat?.percentageChange ?? 0;
      
        let arrow = "→";
        let color = "#6c757d";
      
        if (stat?.trend === "up") {
          arrow = "↑";
          color = "green";
        } else if (stat?.trend === "down") {
          arrow = "↓";
          color = "red";
        }
      
        return { arrow, color, percent };
    };      
    const earned = getTrendData("earned");
    const commission = getTrendData("commission");
    const unpaid = getTrendData("unpaid");
    const paid = getTrendData("paid");
    const user = getTrendData("user");
    const userAll = getTrendData("userAll");

    return (
        <Box p={2}>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                    <Box sx={{ height: "100%", backgroundColor: '#EFF6FF', borderRadius: '16px' }}>
                        <Box sx={{ display: 'flex', height: "100%", flexDirection: 'row', justifyContent: 'space-between', gap: 2, px: 2, py: 2 }}>
                            <Box>
                                <Typography variant="body1" sx={{ color: '#878787' }}>Total Earned Amount</Typography>
                                <Typography variant="h4" fontWeight={600}>
                                    R {UserInfo.data?.data?.data.totalEarnedAmount || 0}
                                </Typography>
                                <div className="d-flex gap-2 align-items-center">
                                    <div style={{ color: earned.color, fontWeight: 600 }}>
                                        {earned.arrow} {earned.percent}%
                                    </div>
                                    <span> from last month</span>
                                </div>
                            </Box>
                            <Box>
                                <img src={sales1} alt="Sales Agent 1" />
                            </Box>
                        </Box>
                    </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                    <Box sx={{ height: "100%", backgroundColor: '#EAF8EC', borderRadius: '16px' }}>
                        <Box sx={{ display: 'flex', height: "100%", flexDirection: 'row', justifyContent: 'space-between', gap: 2, px: 2, py: 2 }}>
                            <Box>
                                <Typography variant="body1" sx={{ color: '#878787' }}>Total Paid Commission</Typography>
                                <Typography variant="h4" fontWeight={600}>
                                    R {UserInfo.data?.data?.data.totalPaid || 0}
                                </Typography>
                                <div className="d-flex gap-2 align-items-center">
                                    <div style={{ color: paid.color, fontWeight: 600 }}>
                                        {paid.arrow} {paid.percent}%
                                    </div>
                                    <span> from last month</span>
                                </div>
                            </Box>
                            <Box>
                                <img src={sa5} alt="Sales Agent 2" />
                            </Box>
                        </Box>
                    </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                    <Box sx={{ height: "100%", backgroundColor: '#EA580C1A', borderRadius: '16px' }}>
                        <Box sx={{ display: 'flex', height: "100%", flexDirection: 'row', justifyContent: 'space-between', gap: 2, px: 2, py: 2 }}>
                            <Box>
                                <Typography variant="body1" sx={{ color: '#878787' }}>Total Unpaid Commission</Typography>
                                <Typography variant="h4" fontWeight={600}>
                                    R {UserInfo.data?.data?.data.totalUnPaid || 0}
                                </Typography>
                                <div className="d-flex gap-2 align-items-center">
                                    <div style={{ color: unpaid.color, fontWeight: 600 }}>
                                        {unpaid.arrow} {unpaid.percent}%
                                    </div>
                                    <span> from last month</span>
                                </div>
                            </Box>
                            <Box>
                                <img src={sa5} alt="Sales Agent 2" />
                            </Box>
                        </Box>
                    </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                    <Box sx={{ height: "100%", backgroundColor: '#EAF8EC', borderRadius: '16px' }}>
                        <Box sx={{ display: 'flex', height: "100%", flexDirection: 'row', justifyContent: 'space-between', gap: 2, px: 2, py: 2 }}>
                            <Box>
                                <Typography variant="body1" sx={{ color: '#878787' }}>My Total Users</Typography>
                                <Typography variant="h4" fontWeight={600}>
                                    {/* {UserInfo.data?.data?.data?.user_id.length || 0} */}
                                    {driverList.isSuccess && driverList.data?.data?.data?.influencersData?.length || 0}
                                </Typography>
                                <div className="d-flex gap-2 align-items-center">
                                    <div style={{ color: user.color, fontWeight: 600 }}>
                                        {user.arrow} {user.percent}%
                                    </div>
                                    <span> from last month</span>
                                </div>
                            </Box>
                            <Box>
                                <img src={sa3} alt="Sales Agent 3" />
                            </Box>
                        </Box>
                    </Box>
                </Grid>
                
                <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                    <Box sx={{ height: "100%", backgroundColor: '#0D94881A', borderRadius: '16px' }}>
                        <Box sx={{ display: 'flex', height: "100%", flexDirection: 'row', justifyContent: 'space-between', gap: 2, px: 2, py: 2 }}>
                            <Box>
                                <Typography variant="body1" sx={{ color: '#878787' }}>Total Commission Earned(30%)</Typography>
                                <Typography variant="h4" fontWeight={600}>
                                    R {(
                                        (UserInfo.data?.data?.data?.totalPaid || 0) +
                                        (UserInfo.data?.data?.data?.totalUnPaid || 0)
                                    ).toFixed(3) || 0}

                                </Typography>
                                <div className="d-flex gap-2 align-items-center">
                                    <div style={{ color: commission.color, fontWeight: 600 }}>
                                        {commission.arrow} {commission.percent}%
                                    </div>
                                    <span> from last month</span>
                                </div>
                            </Box>
                            <Box>
                                <img src={sales2} alt="Sales Agent 5" />
                            </Box>
                        </Box>
                    </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                    <Box sx={{ height: "100%", backgroundColor: '#F59E0B1A', borderRadius: '16px' }}>
                        <Box sx={{ display: 'flex', height: "100%", flexDirection: 'row', justifyContent: 'space-between', gap: 2, px: 2, py: 2 }}>
                            <Box>
                                <Typography variant="body1" sx={{ color: '#878787' }}>Performance Level</Typography>
                                <Typography variant="h4" fontWeight={600}>
                                    {UserInfo.data?.data?.data?.performanceLevel || 0}
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#F59E0B' }}>
                                    Level 1 Performer
                                </Typography>
                            </Box>
                            <Box>
                                <img src={sales3} alt="Sales Agent 6" />
                            </Box>
                        </Box>
                    </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                    <Box sx={{ height: "100%", backgroundColor: '#6B72801A', borderRadius: '16px' }}>
                        <Box sx={{ display: 'flex', height: "100%", flexDirection: 'row', justifyContent: 'space-between', gap: 2, px: 2, py: 2 }}>
                            <Box>
                                <Typography variant="body1" sx={{ color: '#878787' }}>Tie</Typography>
                                <Typography variant="h4" fontWeight={600}>
                                    {UserInfo.data?.data?.data?.tie || 0}
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#4B5563' }}>
                                    No linked users
                                </Typography>
                            </Box>
                            <Box>
                                <img src={sales5} alt="Sales Agent 7" />
                            </Box>
                        </Box>
                    </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                    <Box sx={{ height: "100%", backgroundColor: '#367BE01A', borderRadius: '16px' }}>
                        <Box sx={{ display: 'flex', height: "100%", flexDirection: 'row', justifyContent: 'space-between', gap: 2, px: 2, py: 2 }}>
                            <Box>
                                <Typography variant="body1" sx={{ color: '#878787' }}>Total Sales Agent Users</Typography>
                                <Typography variant="h4" fontWeight={600}>
                                    {UserInfo.data?.data?.data?.grandTotalUsers || 0}
                                </Typography>
                                <div className="d-flex gap-2 align-items-center">
                                    <div style={{ color: userAll.color, fontWeight: 600 }}>
                                        {userAll.arrow} {userAll.percent}%
                                    </div>
                                    <span> from last month</span>
                                </div>
                            </Box>
                            <Box>
                                <img src={sales6} alt="Sales Agent 8" />
                            </Box>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
            {/* profile infromation */}
            <Box sx={{ backgroundColor: "rgb(253, 253, 253)", p: 3, borderRadius: '10px', boxShadow: "-3px 4px 23px rgba(0, 0, 0, 0.1)", mb: 3, mt: 3 }}>
                <form>
                    <Grid container spacing={edit ? 3 : 1}>
                        <Grid size={12} sx={{
                            borderBottom: "1px solid #E5E7EB",
                            display: "inline-block",
                            paddingBottom: "4px",
                            marginBottom: "20px"
                        }}>
                            <Typography
                                variant="h6"
                                gutterBottom
                                fontWeight={600}

                            >
                                Profile Information
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: edit ? 6 : 4 }}>
                            {edit ? (
                                <FormControl variant="standard" fullWidth >
                                    <InputLabel shrink htmlFor="first_name" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                        First Name
                                    </InputLabel>
                                    <BootstrapInput
                                        id="first_name"
                                        name="first_name"
                                        placeholder="First Name"
                                        value={agentForm.values.first_name}
                                        onChange={agentForm.handleChange}
                                    />
                                    {agentForm.touched.first_name && <FormHelperText error>{agentForm.errors.first_name}</FormHelperText>}
                                </FormControl>
                            ) : displayField("First Name", agentForm.values.first_name)}
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: edit ? 6 : 4 }}>
                            {edit ? (
                                <FormControl variant="standard" fullWidth >
                                    <InputLabel shrink htmlFor="last_name" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                        Last Name
                                    </InputLabel>
                                    <BootstrapInput
                                        id="last_name"
                                        name="last_name"
                                        placeholder="Last Name"
                                        value={agentForm.values.last_name}
                                        onChange={agentForm.handleChange}

                                    />
                                    {agentForm.touched.last_name && <FormHelperText error>{agentForm.errors.last_name}</FormHelperText>}
                                </FormControl>
                            ) : displayField("Last Name", agentForm.values.last_name)}
                        </Grid>
                        {/* <Grid size={{ xs: 12, sm: 6, md: edit ? 6 : 4 }}>
                                {edit ? (
                                    <FormControl variant="standard" fullWidth >
                                        <InputLabel shrink htmlFor="password" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                            Password
                                        </InputLabel>
                                        <BootstrapInput
                                            id="password"
                                            name="password"
                                            placeholder="Password"
                                            value={agentForm.values.password}
                                            onChange={agentForm.handleChange}

                                        />
                                        {agentForm.touched.password && <FormHelperText error>{agentForm.errors.password}</FormHelperText>}
                                    </FormControl>
                                ) : displayField("Password", agentForm.values.password)}
                            </Grid> */}
                        <Grid size={{ xs: 12, sm: 6, md: edit ? 6 : 4 }}>
                            {edit ? (
                                <FormControl variant="standard" fullWidth>
                                    <InputLabel shrink htmlFor="email" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                        Email
                                    </InputLabel>
                                    <BootstrapInput
                                        id="email"
                                        name="email"
                                        placeholder="Email"
                                        value={agentForm.values.email}
                                        onChange={agentForm.handleChange}

                                    />
                                    {agentForm.touched.email && <FormHelperText error>{agentForm.errors.email}</FormHelperText>}
                                </FormControl>
                            ) : displayField("Email", agentForm.values.email)}
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: edit ? 6 : 4 }}>
                            {edit ? (
                                <FormControl variant="standard" fullWidth>
                                    <label>Phone Number</label>
                                    <PhoneInput
                                        country={"za"}
                                        value={`${agentForm.values.mobile_no_country_code ?? ''}${agentForm.values.mobile_no ?? ''}`}
                                        onChange={(phone, countryData) => {
                                            const withoutCountryCode = phone.startsWith(countryData.dialCode)
                                                ? phone.slice(countryData.dialCode.length).trim()
                                                : phone;

                                            agentForm.setFieldValue("mobile_no", withoutCountryCode);
                                            agentForm.setFieldValue("mobile_no_country_code", `+${countryData.dialCode}`);
                                        }}
                                        inputStyle={{
                                            width: '100%',
                                            height: '46px',
                                            borderRadius: '6px',
                                            border: '1px solid #E0E3E7',
                                            fontSize: '16px',
                                            paddingLeft: '48px',
                                            background: '#fff',
                                            outline: 'none',
                                            boxShadow: 'none',
                                            borderColor: '#E0E3E7',
                                        }}
                                        buttonStyle={{
                                            borderRadius: '6px 0 0 6px',
                                            border: '1px solid #E0E3E7',
                                            background: '#fff'
                                        }}
                                        containerStyle={{
                                            height: '46px',
                                            width: '100%',
                                            marginBottom: '8px'
                                        }}
                                        specialLabel=""
                                        inputProps={{
                                            name: 'mobile_no',
                                            required: true,
                                            autoFocus: false
                                        }}
                                    />
                                    {agentForm.touched.mobile_no && agentForm.errors.mobile_no && (
                                        <FormHelperText error>{agentForm.errors.mobile_no}</FormHelperText>
                                    )}
                                </FormControl>
                            ) : displayField("Phone Number", `${agentForm.values.mobile_no_country_code ?? ''}${agentForm.values.mobile_no ?? ''}`)}
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: edit ? 6 : 4 }}>
                            {edit ? (
                                <FormControl variant="standard" fullWidth >
                                    <InputLabel shrink htmlFor="enrollAmountDeduction" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                        Enrolment Discount %
                                    </InputLabel>
                                    <BootstrapInput
                                        id="enrollAmountDeduction"
                                        name="enrollAmountDeduction"
                                        placeholder="Enter Enroll Amount Deduction"
                                        value={agentForm.values.enrollAmountDeduction}
                                        onChange={agentForm.handleChange}
                                    />
                                    {agentForm.touched.enrollAmountDeduction && <FormHelperText error>{agentForm.errors.enrollAmountDeduction}</FormHelperText>}
                                </FormControl>
                            ) : displayField("Enrolment Discount %", agentForm.values.enrollAmountDeduction)}
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: edit ? 6 : 4 }}>
                            {edit ? (
                                <FormControl variant="standard" fullWidth >
                                    <InputLabel shrink htmlFor="accountNumber" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                        Account Number
                                    </InputLabel>
                                    <BootstrapInput
                                        id="accountNumber"
                                        name="accountNumber"
                                        placeholder="Enter Account Number"
                                        value={agentForm.values.accountNumber}
                                        onChange={agentForm.handleChange}
                                    />
                                    {agentForm.touched.accountNumber && <FormHelperText error>{agentForm.errors.accountNumber}</FormHelperText>}
                                </FormControl>
                            ) : displayField("Account Number", agentForm.values.accountNumber)}
                        </Grid>
                        {/* <Grid size={{ xs: 12, sm: 6, md: edit ? 6 : 4 }}>
                            {edit ? (
                                <FormControl variant="standard" fullWidth >
                                    <InputLabel shrink htmlFor="customerCode" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                        Branch Code
                                    </InputLabel>
                                    <BootstrapInput
                                        id="customerCode"
                                        name="customerCode"
                                        placeholder="Enter Branch Code"
                                        value={agentForm.values.customerCode}
                                        onChange={agentForm.handleChange}
                                    />
                                    {agentForm.touched.customerCode && <FormHelperText error>{agentForm.errors.customerCode}</FormHelperText>}
                                </FormControl>
                            ) : displayField("Branch Code", agentForm.values.customerCode)}
                        </Grid> */}
                        <Grid size={{ xs: 12, sm: 6, md: edit ? 6 : 4 }}>
                            {edit ? (
                                <FormControl variant="standard" fullWidth >
                                    <InputLabel shrink htmlFor="accountType" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                        Account Type
                                    </InputLabel>
                                    <BootstrapInput
                                        id="accountType"
                                        name="accountType"
                                        placeholder="Enter Account Type"
                                        value={agentForm.values.accountType}
                                        onChange={agentForm.handleChange}
                                    />
                                    {agentForm.touched.accountType && <FormHelperText error>{agentForm.errors.accountType}</FormHelperText>}
                                </FormControl>
                            ) : displayField("Account Type", agentForm.values.accountType)}
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: edit ? 6 : 4 }}>
                            {edit ? (
                                <FormControl variant="standard" fullWidth >
                                    <InputLabel shrink htmlFor="accountHolderName" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                        Account Holder Name
                                    </InputLabel>
                                    <BootstrapInput
                                        id="accountHolderName"
                                        name="accountHolderName"
                                        placeholder="Enter Account Holder Name"
                                        value={agentForm.values.accountHolderName}
                                        onChange={agentForm.handleChange}
                                    />
                                    {agentForm.touched.accountHolderName && <FormHelperText error>{agentForm.errors.accountHolderName}</FormHelperText>}
                                </FormControl>
                            ) : displayField("Account Holder Name", agentForm.values.accountHolderName)}
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: edit ? 6 : 4 }}>
                            {edit ? (
                                <CustomSelect
                                    label="Bank Name"
                                    name="bankId"
                                    value={agentForm.values.bankId}
                                    onChange={(e) => {
                                        const selectedBank = bankslist?.find(bank => bank._id === e.target.value);
                                        agentForm.setValues({
                                            ...agentForm.values,
                                            bankId: e.target.value,
                                            customerCode: selectedBank?.branch_code || ''
                                        });
                                    }}
                                    options={bankslist?.map(bank => ({
                                        value: bank._id,
                                        label: bank.bank_name
                                    })) || []}
                                    error={agentForm.errors.bankId && agentForm.touched.bankId}
                                    helperText={agentForm.errors.bankId}
                                />

                            ) : displayField("Bank Name", bankslist?.find(bank => bank._id === agentForm.values.bankId)?.bank_name || "-")}
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: edit ? 6 : 4 }}>
                            <Box display="flex" flexDirection="column" gap={1}>
                                {/* QR Code */}
                                {agentForm.values.referralCode && (
                                    <>
                                        <Typography sx={{ fontSize: '1.1rem', fontWeight: 400, mb: 1 }}>Referral Code</Typography>
                                        <QRCodeCanvas
                                            value={`https://dev-api.thibaingozi.com/api/referralCode?referral_code=${agentForm.values.referralCode}`}
                                            size={128}
                                            bgColor="#ffffff"
                                            fgColor="#000000"
                                            level="H"
                                        /></>
                                )}
                            </Box>
                        </Grid>
                        <Grid size={12}>
                            <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
                                {edit ? (
                                    <>
                                        <Button
                                            variant="outlined"
                                            sx={{ width: 130, height: 48, borderRadius: '8px', color: '#878787', fontSize: '16px', fontWeight: 400, border: '1px solid #D1D5DB' }}
                                            onClick={handleCancel}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="contained"
                                            sx={{ width: 130, height: 48, borderRadius: '8px', color: 'white', backgroundColor: 'var(--Blue)', fontSize: '16px', fontWeight: 400, }}
                                            onClick={() => {
                                                agentForm.handleSubmit()
                                            }}
                                        >
                                            Save
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        variant="contained"
                                        sx={{ width: 130, height: 48, borderRadius: '10px', backgroundColor: 'var(--Blue)' }}
                                        onClick={() => setEdit(true)}
                                    >
                                        Edit
                                    </Button>
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Box>

            {/* <div className="theme-table" style={{ marginTop: '20px' }}>
                <div className="tab-heading">
                    <div className="count">
                        <h3>Total Users</h3>
                        <p>{driverList.isSuccess && driverList.data?.data?.data?.influencersData?.length || 0}</p>
                    </div>
                    <div className="tbl-filter">
                        <CustomDateRangePicker
                            value={range}
                            onChange={setRange}
                            icon={calender}
                        />
                    </div>
                </div>
                {driverList.isFetching ? (
                    <Loader />
                ) : (
                    <>
                        {driverList.data?.data?.data?.influencersData ? (
                            <>
                                <table
                                    id="example"
                                    className="table table-striped nowrap"
                                    style={{ width: "100%" }}
                                >
                                    <thead>
                                        <tr>
                                            <th>User name</th>
                                            <th>Driver ID</th>
                                            <th>Company</th>
                                            <th>Contact No.</th>
                                            <th>Contact Email</th>
                                            <th>&nbsp;</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {driverList?.data && driverList.data?.data?.data?.influencersData?.map((driver) => (
                                            <tr key={driver._id}>
                                                <td>
                                                    <div
                                                        className={
                                                            (!driver.first_name && !driver.last_name) ? "prof nodata" : "prof"
                                                        }
                                                    >
                                                        <img
                                                            className="profilepicture"
                                                            src={
                                                                driver.selfieImage
                                                                    ? driver.selfieImage
                                                                    : nouser
                                                            }
                                                        />
                                                        {driver.first_name} {driver.last_name}
                                                    </div>
                                                </td>
                                                <td className={!driver.id_no ? "nodata" : ""}>
                                                    {driver.id_no}
                                                </td>
                                                <td className={!driver.company_name ? "companynamenodata" : ""}>
                                                    {driver.company_name}
                                                </td>
                                                <td className={!driver?.mobile_no ? "nodata" : ""}>
                                                    {`${driver?.mobile_no_country_code ?? ''}${driver?.mobile_no ?? ''}`}
                                                </td>
                                                <td className={!driver.email ? "nodata" : ""}>
                                                    {driver.email}
                                                </td>
                                                <td>
                                                    <span
                                                        onClick={() =>
                                                            nav(
                                                                `/home/total-drivers/driver-information/${driver._id}`
                                                            )
                                                        }
                                                        className="tbl-btn"
                                                    >
                                                        view
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
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
                                            disabled={page === driverList.data?.data?.data?.totalPages}
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
                )}

            </div> */}

            <Box sx={{ backgroundColor: "rgb(253, 253, 253)", boxShadow: "-3px 4px 23px rgba(0, 0, 0, 0.1)", mt: 3, padding: 0, borderRadius: '10px' }}>
                <Grid container justifyContent="space-between" alignItems="center" p={2}>
                    <Grid size={{ xs: 12, lg: 6 }} sx={{ display: 'flex', flexDirection: 'row', gap: 2, mb: { xs: 1, md: 0 } }}>
                        <Typography variant="h6" fontWeight={590} sx={{ pl: 2 }}>Total Users</Typography>
                        <Typography variant="body2" sx={{ p: 0.8, borderRadius: '50px', color: '#4B5563', backgroundColor: '#F3F4F6' }}>{driverList.isSuccess && driverList.data?.data?.data?.influencersData?.length || 0} total</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, lg: 6 }} sx={{ display: 'flex', justifyContent: 'flex-end', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>

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
                        />
                        <Box display="flex" sx={{ justifyContent: { xs: 'space-between' } }} gap={2}>
                            <CustomExportMenu onExport={handleExport} />
                            <CustomDateRangePicker
                                value={range}
                                onChange={setRange}
                                icon={calender}
                            />
                        </Box>

                    </Grid>
                </Grid>
                {driverList.data?.data?.data?.influencersData ? (
                    <>
                        <Box sx={{ px: { xs: 0, md: 2 }, pt: { xs: 0, md: 3 }, backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
                            <TableContainer >
                                <Table sx={{ '& .MuiTableCell-root': { borderBottom: 'none', fontSize: '15px' } }}>
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
                                                    User
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', borderTopLeftRadius: '10px' }}>
                                                <TableSortLabel
                                                    id="id_no"
                                                    active={sortBy === 'id_no'}
                                                    direction={sortOrder}
                                                    onClick={changeSortOrder}
                                                    IconComponent={() => <img src={sortBy === 'id_no' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                >
                                                    Driver ID
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
                                                    id="mobile_no_country_code"
                                                    active={sortBy === 'mobile_no_country_code'}
                                                    direction={sortOrder}
                                                    onClick={changeSortOrder}
                                                    IconComponent={() => <img src={sortBy === 'mobile_no_country_code' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                >
                                                    Contact No.
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
                                                    Contact Email
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell align="center" sx={{ backgroundColor: '#F9FAFB', borderTopRightRadius: '10px', color: '#4B5563' }}>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {driverList.isFetching ?
                                            <TableRow>
                                                <TableCell sx={{ color: '#4B5563', borderBottom: 'none' }} colSpan={5} align="center">
                                                    <Loader />
                                                </TableCell>
                                            </TableRow>
                                            : (driverList.data?.data?.data?.influencersData?.length > 0 ?
                                                driverList.data?.data?.data?.influencersData?.map((user) => (
                                                    <TableRow key={user._id}>
                                                        <TableCell sx={{ color: '#4B5563' }}>
                                                            <Stack direction="row" alignItems="center" gap={1}>
                                                                <Avatar
                                                                    src={user?.selfieImage || nouser}
                                                                    alt="User"
                                                                />
                                                                {user.first_name} {user.last_name}
                                                            </Stack>
                                                        </TableCell>
                                                        <TableCell sx={{ color: '#4B5563' }}>
                                                            {user.id_no || "-"}
                                                        </TableCell>
                                                        <TableCell sx={{ color: '#4B5563' }}>
                                                            {user.company_name || "-"}
                                                        </TableCell>
                                                        <TableCell sx={{ color: '#4B5563' }}>
                                                            {`${user?.mobile_no_country_code ?? ""}${user?.mobile_no ?? "-"}`}
                                                        </TableCell>
                                                        <TableCell sx={{ color: '#4B5563' }}>
                                                            {user.email || "-"}
                                                        </TableCell>
                                                        <TableCell >
                                                            <Box align="center" sx={{ display: 'flex', flexDirection: 'row' }}>
                                                                <Tooltip title="View" arrow placement="top">
                                                                    <IconButton onClick={() => nav(`/home/total-users/user-information/${user._id}`)}>
                                                                        <img src={ViewBtn} alt="view button" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </Box>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                                :
                                                <TableRow>
                                                    <TableCell sx={{ color: '#4B5563', borderBottom: 'none' }} colSpan={5} align="center">
                                                        <Typography align="center" color="text.secondary" sx={{ mt: 2 }}>
                                                            No data found
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>)
                                        }
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <Grid container sx={{ px: { xs: 1, sm: 3 }, pb: 2 }} justifyContent="space-between" alignItems="center" mt={2}>
                                <Grid>
                                    <Box display="flex" alignItems="center">
                                        <Typography variant="body2">
                                            Rows per page:&nbsp;
                                        </Typography>
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
                                                setRowsPerPage(Number(e.target.value));
                                                setCurrentPage(1);
                                            }}
                                        >
                                            {[5, 10, 15, 20,50,100].map((num) => (
                                                <MenuItem key={num} value={num}>
                                                    {num}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </Box>
                                </Grid>
                                <Grid>
                                    <Box display="flex" alignItems="center" gap={{ xs: 1, sm: 2 }}>
                                        <Typography variant="body2">
                                            {currentPage} / {totalPages}
                                        </Typography>
                                        <IconButton
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage((prev) => prev - 1)}
                                        >
                                            <NavigateBeforeIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            disabled={currentPage === totalPages}
                                            onClick={() => setCurrentPage((prev) => prev + 1)}
                                        >
                                            <NavigateNextIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>

                    </>
                ) : (
                    <Typography align="center" color="text.secondary" sx={{ mt: 2, p: 2 }}>
                        No data found
                    </Typography>
                )}
            </Box>

            {tieData && (
                <Box sx={{ backgroundColor: "rgb(253, 253, 253)", boxShadow: "-3px 4px 23px rgba(0, 0, 0, 0.1)", mt: 3, padding: 0, borderRadius: '10px' }}>
                    <Grid container justifyContent="space-between" alignItems="center" p={2}>
                        <Grid size={{ xs: 12, lg: 6 }} sx={{ display: 'flex', flexDirection: 'row', gap: 2, mb: { xs: 1, md: 0 } }}>
                            <Typography variant="h6" fontWeight={590} sx={{ pl: 2 }}>Tie Users</Typography>
                            <Typography variant="body2" sx={{ p: 0.8, borderRadius: '50px', color: '#4B5563', backgroundColor: '#F3F4F6' }}>{UserInfo?.data?.data?.data?.tieUserData?.length || 0} total</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, lg: 6 }} sx={{ display: 'flex', justifyContent: 'flex-end', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
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
                            />
                            <Box display="flex" sx={{ justifyContent: { xs: 'space-between' } }} gap={2}>
                                <CustomExportMenu onExport={handleExport} />
                                <CustomDateRangePicker
                                    value={range}
                                    onChange={setRange}
                                    icon={calender}
                                />
                            </Box>

                        </Grid>
                    </Grid>
                    {UserInfo?.data?.data?.data?.tieUserData?.length > 0 ? (
                        <>
                            <Box sx={{ px: { xs: 0, md: 2 }, pt: { xs: 0, md: 3 }, backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
                                <TableContainer >
                                    <Table sx={{ '& .MuiTableCell-root': { borderBottom: 'none', fontSize: '15px' } }}>
                                        <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                            <TableRow >
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', borderTopLeftRadius: '10px' }}>
                                                    <TableSortLabel
                                                        id="index"
                                                        active={sortBy === 'index'}
                                                        direction={sortOrder}
                                                        onClick={changeSortOrder}
                                                        IconComponent={() => <img src={sortBy === 'index' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                    >
                                                        No.
                                                    </TableSortLabel>
                                                </TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', borderTopLeftRadius: '10px' }}>
                                                    <TableSortLabel
                                                        id="first_name"
                                                        active={sortBy === 'first_name'}
                                                        direction={sortOrder}
                                                        onClick={changeSortOrder}
                                                        IconComponent={() => <img src={sortBy === 'first_name' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                    >
                                                        Name
                                                    </TableSortLabel>
                                                </TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', borderTopLeftRadius: '10px' }}>
                                                    <TableSortLabel
                                                        id="salesCount"
                                                        active={sortBy === 'salesCount'}
                                                        direction={sortOrder}
                                                        onClick={changeSortOrder}
                                                        IconComponent={() => <img src={sortBy === 'salesCount' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                    >
                                                        Users
                                                    </TableSortLabel>
                                                </TableCell>


                                                <TableCell align="center" sx={{ backgroundColor: '#F9FAFB', borderTopRightRadius: '10px', color: '#4B5563' }}>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>

                                        <TableBody>
                                            {UserInfo?.isFetching ?
                                                <TableRow>
                                                    <TableCell sx={{ color: '#4B5563', borderBottom: 'none' }} colSpan={5} align="center">
                                                        <Loader />
                                                    </TableCell>
                                                </TableRow>
                                                : (
                                                    UserInfo?.data?.data?.data?.tieUserData?.map((user, index) => (
                                                        <TableRow key={user._id}>
                                                            <TableCell sx={{ color: '#4B5563' }}>
                                                                {index + 1}
                                                            </TableCell>
                                                            <TableCell sx={{ color: '#4B5563' }}>
                                                                <Stack direction="row" alignItems="center" gap={1}>
                                                                    <Avatar
                                                                        src={user?.selfieImage || nouser}
                                                                        alt="User"
                                                                    />
                                                                    {user.first_name} {user.last_name}
                                                                </Stack>
                                                            </TableCell>
                                                            <TableCell sx={{ color: '#4B5563' }}>
                                                                {user.user.salesCount || "-"}
                                                            </TableCell>
                                                            <TableCell >
                                                                <Box align="center" sx={{ display: 'flex', flexDirection: 'row' }}>
                                                                    <Tooltip title="View" arrow placement="top">
                                                                        <IconButton onClick={() => nav(`/home/total-sales-agent/agent-information/${user._id}`)}>
                                                                            <img src={ViewBtn} alt="view button" />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </Box>
                                                            </TableCell>
                                                        </TableRow>
                                                    )))
                                            }
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                <Grid container sx={{ px: { xs: 1, sm: 3 }, pb: 2 }} justifyContent="space-between" alignItems="center" mt={2}>
                                    <Grid>
                                        <Box display="flex" alignItems="center">
                                            <Typography variant="body2">
                                                Rows per page:&nbsp;
                                            </Typography>
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
                                                    setRowsPerPage(Number(e.target.value));
                                                    setCurrentPage(1);
                                                }}
                                            >
                                                {[5, 10, 15, 20,50,100].map((num) => (
                                                    <MenuItem key={num} value={num}>
                                                        {num}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </Box>
                                    </Grid>
                                    <Grid>
                                        <Box display="flex" alignItems="center" gap={{ xs: 1, sm: 2 }}>
                                            <Typography variant="body2">
                                                {currentPage} / {totalPages}
                                            </Typography>
                                            <IconButton
                                                disabled={currentPage === 1}
                                                onClick={() => setCurrentPage((prev) => prev - 1)}
                                            >
                                                <NavigateBeforeIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                disabled={currentPage === totalPages}
                                                onClick={() => setCurrentPage((prev) => prev + 1)}
                                            >
                                                <NavigateNextIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>
                        </>
                    ) : (
                        <Typography align="center" color="text.secondary" sx={{ mt: 2, p: 2 }}>
                            No data found
                        </Typography>
                    )}
                </Box>
            )}

            {/* payout module */}
            <Box sx={{ backgroundColor: "rgb(253, 253, 253)", boxShadow: "-3px 4px 23px rgba(0, 0, 0, 0.1)", mt: 3, padding: 0, borderRadius: '10px', p: 2 }}>
                <Box sx={{ borderBottom: '1px solid #E5E7EB' }}>
                    <Typography variant="h6" gutterBottom fontWeight={550}>
                        Payout
                    </Typography>
                </Box>
                <Box
                    sx={{
                        p: 2,
                        mt: 3,
                        borderRadius: 2,
                        border: '1px solid #E5E7EB',
                        backgroundColor: "#F9FAFB",
                        display: "flex",
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexDirection: "row",
                        gap: 2,
                        width: "100%",
                    }}
                >
                    <Box>
                        <Typography variant="body1" mb={1} sx={{ color: 'var(--font-gray)' }} fontWeight={500}>
                            Total Amount
                        </Typography>

                        <Typography variant="h5" sx={{ fontWeight: 500 }}>
                            R {UserInfo.data?.data?.data.totalUnPaid || 0}
                        </Typography>
                    </Box>
                    <Tooltip
                        title={
                            UserInfo.data?.data?.data.totalUnPaid >= 10
                            ? "Click to pay"
                            : "Minimum unpaid amount is 10 to payout"
                        }
                        arrow
                        >
                        <span>
                            <Button
                                variant="contained"
                                color="primary"
                                disabled={UserInfo.data?.data?.data.totalUnPaid < 10}
                                onClick={(event) => handlePopup(event, 'payout', 'sales_agent')}
                                sx={{ height: '40px', gap: '10px', backgroundColor: 'var(--Blue)' }}
                                >
                                <img src={payIcon} alt="payIcon" />
                                Pay
                            </Button>
                        </span>
                    </Tooltip>

                    {renderPopup()}
                </Box>
            </Box>
        </Box>
    )
}

export default AgentInformation


const setAgentformvalues = ({ ...props }) => {
    const { form, data } = props;
    let newdata = {};

    Object.keys(form.values).forEach((key) => {
        if (key === 'images') {
            newdata = { ...newdata, [key]: Array.from({ length: 5 }, (_, i) => data?.[`image_${i + 1}`] || null).filter(Boolean) };
        } else if (key === 'company_id') {
            newdata = { ...newdata, [key]: data?.company_id?._id ?? '' };
        } else {
            newdata = { ...newdata, [key]: data?.[key] ?? '' };
        }
    });

    form.setValues(newdata);
};