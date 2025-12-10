import { useEffect, useState, useLayoutEffect } from "react";
import Select from "react-select";
import { Grid, Typography, Box, FormControl, InputLabel, FormHelperText, Tooltip, Button } from "@mui/material";
import { useFormik } from "formik";
import { sales_agent_e } from "../common/FormValidation";
import { BootstrapInput } from '../common/BootstrapInput'
import { useQueryClient } from "@tanstack/react-query";
import { QRCodeCanvas } from "qrcode.react";
import { useGetAgent, useUpdateSalesAgent, useGetBanksList, armedSosPayout, payoutUserUpdate } from "../API Calls/API";
import { toast } from "react-toastify";
import { toastOption } from "../common/ToastOptions";
import PhoneInput from "react-phone-input-2";
import Loader from "../common/Loader";
import { useGetUserByInfluncer } from "../API Calls/API";
import { startOfYear } from "date-fns";
import { useNavigate, useParams } from "react-router-dom";

import sa2 from '../assets/images/sa2.svg'
import sa3 from '../assets/images/sa3.svg'
import sa4 from '../assets/images/sa4.svg'
import sales1 from '../assets/images/sales1.svg'
import sa5 from '../assets/images/sa5.svg'
import sales3 from '../assets/images/sales3.svg'
import sales5 from '../assets/images/sales5.svg'
import sales6 from '../assets/images/sales6.svg'
import payIcon from '../assets/images/payIcon.svg';
import PayoutPopup from "../common/Popup";
// import search from "../assets/images/search.svg";
// import nouser from "../assets/images/NoUser.png";
// import calender from '../assets/images/calender.svg';
// import arrowup from '../assets/images/arrowup.svg';
// import arrowdown from '../assets/images/arrowdown.svg';
// import arrownuteral from '../assets/images/arrownuteral.svg';
// import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
// import NavigateNextIcon from "@mui/icons-material/NavigateNext";
// import ViewBtn from '../assets/images/ViewBtn.svg'
// import Prev from "../assets/images/left.png";
// import Next from "../assets/images/right.png";
// import CustomExportMenu from "../common/Custom/CustomExport";
// import CustomDateRangePicker from "../common/Custom/CustomDateRangePicker";
// import apiClient from "../API Calls/APIClient";
// import Prev from "../../assets/images/left.png";
// import { useFormik } from "formik";

const SalesAgentHome = () => {
    // const nav = useNavigate()
    const role = localStorage.getItem("role");
    // const [rowsPerPage, setRowsPerPage] = useState(5);
    // const [currentPage, setCurrentPage] = useState(1);
    const [time, setTime] = useState("today");
    const [timeTitle, setTimeTitle] = useState("Today");
    const [banksList, setbanksList] = useState([])
    const client = useQueryClient();
    const [edit, setedit] = useState(false);
    const bankslist = useGetBanksList()
    // const [tieModalOpen, setTieModalOpen] = useState(false);
    // const [tieUsers, setTieUsers] = useState([]);
    const [page, setpage] = useState(1);
    const [payPopup, setPopup] = useState("");
    const [selectedPayoutType, setSelectedPayoutType] = useState('');
    // const [tieData, setTieData] = useState(true)
    // const [filter, setfilter] = useState("");
    // const [sortBy, setSortBy] = useState("first_name");
    // const [sortOrder, setSortOrder] = useState("asc");
    // const changeSortOrder = (e) => {
    //     const field = e.target.id;
    //     if (field !== sortBy) {
    //         setSortBy(field);
    //         setSortOrder("asc");
    //     } else {
    //         setSortOrder(p => p === 'asc' ? 'desc' : 'asc')
    //     }
    // }
    useEffect(() => {
        switch (time) {
            case "today":
                setTimeTitle("Today");
                break;
            case "yesterday":
                setTimeTitle("Yesterday");
                break;
            case "this_week":
                setTimeTitle("This Week");
                break;
            case "this_month":
                setTimeTitle("This Month");
                break;
            case "this_year":
                setTimeTitle("This Year");
                break;
            default:
                setTimeTitle("Today");
                break;
        }
    }, [time]);
    const handleTimeChange = (e) => {
        setTime(e.target.value);
    };
    const onSuccess = () => {
        toast.success("Profile Update Successfully.");
        client.invalidateQueries("agent", { exact: 'false' });
    };
    const onError = (error) => {
        toast.error(error.response.data.message || "Something went Wrong", toastOption);
    };
    const { mutate } = useUpdateSalesAgent(onSuccess, onError)
    const params = useParams();

    const [range, setRange] = useState([
        {
            startDate: startOfYear(new Date()),
            endDate: new Date(),
            key: 'selection'
        }
    ]);

    const startDate = range[0].startDate.toISOString();
    const endDate = range[0].endDate.toISOString();

    const userinfo = useGetAgent(localStorage.getItem("userID"));
    console.log("userinfo", userinfo?.data?.data)
    const listOfSalesAgentUsers = useGetUserByInfluncer(page, 10, startDate, endDate, userinfo?.data?.data?.data?._id)
    // const totalUsers = listOfSalesAgentUsers.data?.data?.data?.totalCount || 0;
    // const totalPages = Math.ceil(totalUsers / rowsPerPage);

    const profileForm = useFormik({
        initialValues: sales_agent,
        validationSchema: sales_agent_e,
        onSubmit: (values) => {
            setedit(false);
            mutate({
                id: localStorage.getItem("userID"),
                data: values,
            });
        },

    });

    const PayoutForm = useFormik({
        initialValues: {
            firstName: '',
            surname: '',
            branchCode: '',
            amount: 0,
            accountNumber: '',
            customerCode: ''
        }
    });

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
                        user_id: userinfo.data?.data?.data._id,
                        type: selectedPayoutType,
                        amount: userinfo.data?.data?.data.totalUnPaid,
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
            userinfo.refetch()
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

        // Check if user has bank details
        const hasBankDetails = userinfo?.data?.data?.data?.bank?.bank_name == '' || 
                              userinfo?.data?.data?.data?.branchCode == '' || 
                              userinfo?.data?.data?.data?.accountNumber == '' || 
                              userinfo?.data?.data?.data?.accountType == ''|| 
                              userinfo?.data?.data?.data?.customerCode == '';
        
        if (hasBankDetails) {
            toast.error("Please add your bank details before withdrawing funds. Click the Edit button to update your banking information.");
            return;
        }

        PayoutForm.setValues({
            user_id: userinfo.data?.data?.data?._id || "",
            firstName: userinfo.data?.data?.data?.first_name || "",
            surname: userinfo.data?.data?.data?.last_name || "",
            // branchCode: userinfo.data?.data?.data.bankId?.branch_code || "",
            bank_name: userinfo.data?.data?.data.bank?.bank_name || "",
            branchCode: userinfo.data?.data?.data.bank?.branch_code || "",
            accountNumber: userinfo.data?.data?.data?.accountNumber || "",
            customerCode: userinfo.data?.data?.data?.customerCode || "",
            amount: userinfo.data?.data?.data?.totalUnPaid || 0,
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

    const handleCancel = () => {
        const data = userinfo.data?.data?.data;
        if (data) {
            profileForm.resetForm({ values: data });
        }
        setedit(false);
    };

    const getTrendData = (type) => {
        let stat;

        // For transaction types (earned, commission, paid, unpaid)
        if (type !== "user") {
            stat = userinfo.data?.data?.data?.monthlyStats?.find(
                (item) => item.transactionType === type
            );
        } else if (type == "userAll") {
            stat = userinfo.data?.data?.data?.allUserStats;
        } else {
            stat = userinfo.data?.data?.data?.userStats;
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

    useEffect(() => {
        const data = userinfo?.data?.data
        if (data) {
            setAgentformvalues({ form: profileForm, data: userinfo?.data?.data?.data })
        }
    }, [userinfo?.data])

    useLayoutEffect(() => {
        if (Array.isArray(bankslist)) {
            const filteredServices = bankslist.filter(service => service);

            const groupedOptions = [
                {
                    label: "Banks",
                    options: filteredServices.map((service) => ({
                        label: service.bank_name,
                        value: service._id,
                    })),
                }
            ];

            setbanksList(groupedOptions);
        }
    }, [bankslist]);

    const displayField = (label, value) => (
        <Box mb={3}>
            <Typography sx={{ fontSize: '1.1rem', fontWeight: 400, mb: 1 }}>{label}</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ ml: 0.5 }}>
                {value || "-"}
            </Typography>
        </Box>
    );
    return (
        <>
            {/* <Grid container>
                <Grid size={12}>
                    <Box className='filter-date'>
                        <select
                            className="form-select"
                            value={time}
                            onChange={handleTimeChange}
                        >
                            <option value="today">Today</option>
                            <option value="yesterday">Yesterday</option>
                            <option value="this_week">This week</option>
                            <option value="this_month">This Month</option>
                            <option value="this_year">This Year</option>
                        </select>
                    </Box>
                </Grid>
            </Grid> */}

            <Grid container px={2} spacing={3} my={5} alignItems="stretch">
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>

                    <Box sx={{ height: "100%", backgroundColor: '#e3f5ff', borderRadius: '16px', }}>
                        <Box sx={{ display: 'flex', height: "100%", flexDirection: 'row', justifyContent: 'space-between', gap: 2, px: 3, py: 3 }}>
                            <Box>
                                <Typography variant="body1" sx={{ color: '#878787' }}>Total Earned Amount</Typography>
                                <Typography variant="h4" fontWeight={650}>R {userinfo?.data?.data?.data?.totalEarnedAmount}</Typography>
                                <Typography variant="body1" sx={{ color: '#878787' }}>
                                    <span style={{ color: earned.color, fontWeight: 500 }}>{earned.arrow}{earned.percent}%</span> from last month
                                </Typography>
                            </Box>
                            <Box>
                                <img src={sales1} alt="ReportIcon" />
                            </Box>
                        </Box>
                    </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6, lg: 4 }}>

                    <Box sx={{ height: "100%", backgroundColor: '#e9efff', borderRadius: '16px', }}>
                        <Box sx={{ display: 'flex', height: "100%", flexDirection: 'row', justifyContent: 'space-between', gap: 2, px: 3, py: 3 }}>
                            <Box>
                                <Typography variant="body1" sx={{ color: '#878787' }}>Total Commission Earned</Typography>
                                <Typography variant="h4" fontWeight={650}>R {userinfo?.data?.data?.data?.totalCommission}</Typography>
                                <Typography variant="body1" sx={{ color: '#878787' }}>
                                    <span style={{ color: commission.color, fontWeight: 500 }}>{commission.arrow}{commission.percent}%</span> from last month
                                </Typography>
                            </Box>
                            <Box>
                                <img src={sa2} alt="ReportIcon" />
                            </Box>
                        </Box>
                    </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6, lg: 4 }}>

                    <Box sx={{ height: "100%", backgroundColor: '#fff3e5', borderRadius: '16px', }}>
                        <Box sx={{ display: 'flex', height: "100%", flexDirection: 'row', justifyContent: 'space-between', gap: 2, px: 3, py: 3 }}>
                            <Box>
                                <Typography variant="body1" sx={{ color: '#878787' }}>Total Commission Unpaid</Typography>
                                <Typography variant="h4" fontWeight={650}>R {userinfo?.data?.data?.data?.totalUnPaid}</Typography>
                                <Typography variant="body1" sx={{ color: '#878787' }}>
                                    <span style={{ color: unpaid.color, fontWeight: 500 }}>{unpaid.arrow}{unpaid.percent}%</span> from last month
                                </Typography>
                            </Box>
                            <Box>
                                <img src={sa5} alt="ReportIcon" />
                            </Box>
                        </Box>
                    </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6, lg: 4 }}>

                    <Box sx={{ height: "100%", backgroundColor: '#0d94881a', borderRadius: '16px', }}>
                        <Box sx={{ display: 'flex', height: "100%", flexDirection: 'row', justifyContent: 'space-between', gap: 2, px: 3, py: 3 }}>
                            <Box>
                                <Typography variant="body1" sx={{ color: '#878787' }}>Total Commission Paid</Typography>
                                <Typography variant="h4" fontWeight={650}>R {userinfo?.data?.data?.data?.totalPaid}</Typography>
                                <Typography variant="body1" sx={{ color: '#878787' }}>
                                    <span style={{ color: paid.color, fontWeight: 500 }}>{paid.arrow}{paid.percent}%</span> from last month
                                </Typography>
                            </Box>
                            <Box>
                                <img src={sa4} alt="ReportIcon" />
                            </Box>
                        </Box>
                    </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6, lg: 4 }}>

                    <Box sx={{ height: "100%", backgroundColor: '#eaf8ec', borderRadius: '16px', }}>
                        <Box sx={{ display: 'flex', height: "100%", flexDirection: 'row', justifyContent: 'space-between', gap: 2, px: 3, py: 3 }}>
                            <Box>
                                <Typography variant="body1" sx={{ color: '#878787' }}>My Total Users</Typography>
                                <Typography variant="h4" fontWeight={650}>R {userinfo?.data?.data?.data?.user_id?.length}</Typography>
                                <Typography variant="body1" sx={{ color: '#878787' }}>
                                    <span style={{ color: user.color, fontWeight: 500 }}>{user.arrow}{user.percent}%</span> from last month
                                </Typography>
                            </Box>
                            <Box>
                                <img src={sa3} alt="ReportIcon" />
                            </Box>
                        </Box>
                    </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6, lg: 4 }}>

                    <Box sx={{ height: "100%", backgroundColor: '#F59E0B1A', borderRadius: '16px', }}>
                        <Box sx={{ display: 'flex', height: "100%", flexDirection: 'row', justifyContent: 'space-between', gap: 2, px: 3, py: 3 }}>
                            <Box>
                                <Typography variant="body1" sx={{ color: '#878787' }}>Performance Level</Typography>
                                <Typography variant="h4" fontWeight={650}>R {userinfo?.data?.data?.data.performanceLevel ?? 0}</Typography>
                                <Typography variant="body1" sx={{ color: '#878787' }}>
                                    {/* <span style={{ color: '#16A34A', fontWeight: 500 }}>+8%</span>  */}
                                    Level 1 Performer
                                </Typography>
                            </Box>
                            <Box>
                                <img src={sales3} alt="ReportIcon" />
                            </Box>
                        </Box>
                    </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6, lg: 4 }}>

                    <Box sx={{ height: "100%", backgroundColor: '#6b72801a', borderRadius: '16px', }}>
                        <Box sx={{ display: 'flex', height: "100%", flexDirection: 'row', justifyContent: 'space-between', gap: 2, px: 3, py: 3 }}>
                            <Box>
                                <Typography variant="body1" sx={{ color: '#878787' }}>Tie</Typography>
                                <Typography variant="h4" fontWeight={650}>R {userinfo?.data?.data?.data?.tie ?? 0}</Typography>
                                <Typography variant="body1" sx={{ color: '#878787' }}>
                                    {/* <span style={{ color: '#16A34A', fontWeight: 500 }}>+8%</span>  */}
                                    No linked users
                                </Typography>
                            </Box>
                            <Box>
                                <img src={sales5} alt="ReportIcon" />
                            </Box>
                        </Box>
                    </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6, lg: 4 }}>

                    <Box sx={{ height: "100%", backgroundColor: '#367be01a', borderRadius: '16px', }}>
                        <Box sx={{ display: 'flex', height: "100%", flexDirection: 'row', justifyContent: 'space-between', gap: 2, px: 3, py: 3 }}>
                            <Box>
                                <Typography variant="body1" sx={{ color: '#878787' }}>Total Sales agent Users</Typography>
                                <Typography variant="h4" fontWeight={650}>R {userinfo?.data?.data?.data?.grandTotalUsers ?? 0}</Typography>
                                <Typography variant="body1" sx={{ color: '#878787' }}>
                                    <span style={{ color: userAll.color, fontWeight: 500 }}>{userAll.arrow}{userAll.percent}%</span> from last month
                                </Typography>
                            </Box>
                            <Box>
                                <img src={sales6} alt="ReportIcon" />
                            </Box>
                        </Box>
                    </Box>
                </Grid>
            </Grid>

            <Box p={2}>
                <Box
                    elevation={0}
                    sx={{
                        p: 3,
                        borderRadius: '16px',
                        mb: 3,
                        backgroundColor: '#fdfdfd',
                        boxShadow: 'rgba(0, 0, 0, 0.1) -3px 4px 23px',
                    }}
                >
                    <form>
                        <Grid container spacing={edit ? 3 : 1}>
                            <Grid size={12} sx={{ borderBottom: "1px solid #E5E7EB", marginBottom: "20px" }}>
                                <Typography variant="h6" gutterBottom fontWeight={600}>
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
                                            value={profileForm.values.first_name}
                                            onChange={profileForm.handleChange}
                                            disabled={role == 'sales_agent'}
                                        />
                                        {profileForm.touched.first_name && <FormHelperText error>{profileForm.errors.first_name}</FormHelperText>}
                                    </FormControl>
                                ) : displayField("First Name", profileForm.values.first_name)}
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
                                            value={profileForm.values.last_name}
                                            onChange={profileForm.handleChange}
                                            disabled={role == 'sales_agent'}

                                        />
                                        {profileForm.touched.last_name && <FormHelperText error>{profileForm.errors.last_name}</FormHelperText>}
                                    </FormControl>
                                ) : displayField("Last Name", profileForm.values.last_name)}
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
                                            value={profileForm.values.password}
                                            onChange={profileForm.handleChange}

                                        />
                                        {profileForm.touched.password && <FormHelperText error>{profileForm.errors.password}</FormHelperText>}
                                    </FormControl>
                                ) : displayField("Password", profileForm.values.password)}
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
                                            value={profileForm.values.email}
                                            onChange={profileForm.handleChange}
                                            disabled={role == 'sales_agent'}
                                        />
                                        {profileForm.touched.email && <FormHelperText error>{profileForm.errors.email}</FormHelperText>}
                                    </FormControl>
                                ) : displayField("Email", profileForm.values.email)}
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: edit ? 6 : 4 }}>
                                {edit ? (
                                    <FormControl variant="standard" fullWidth>
                                        <label>Phone Number</label>
                                        <PhoneInput
                                            country={"za"}
                                            value={`${profileForm.values.mobile_no_country_code ?? ''}${profileForm.values.mobile_no ?? ''}`}
                                            onChange={(phone, countryData) => {
                                                const withoutCountryCode = phone.startsWith(countryData.dialCode)
                                                    ? phone.slice(countryData.dialCode.length).trim()
                                                    : phone;

                                                profileForm.setFieldValue("mobile_no", withoutCountryCode);
                                                profileForm.setFieldValue("mobile_no_country_code", `+${countryData.dialCode}`);
                                            }}
                                            disabled={role == 'sales_agent'}
                                            
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
                                        {profileForm.touched.mobile_no && profileForm.errors.mobile_no && (
                                            <FormHelperText error>{profileForm.errors.mobile_no}</FormHelperText>
                                        )}
                                    </FormControl>
                                ) : displayField("Phone Number", `${profileForm.values.mobile_no_country_code ?? ''}${profileForm.values.mobile_no ?? ''}`)}
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
                                            value={profileForm.values.enrollAmountDeduction}
                                            onChange={profileForm.handleChange}
                                            disabled={role == 'sales_agent'}
                                        />
                                        {profileForm.touched.enrollAmountDeduction && <FormHelperText error>{profileForm.errors.enrollAmountDeduction}</FormHelperText>}
                                    </FormControl>
                                ) : displayField("Enrolment Discount %", profileForm.values.enrollAmountDeduction)}
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
                                            value={profileForm.values.accountNumber}
                                            onChange={profileForm.handleChange}
                                        />
                                        {profileForm.touched.accountNumber && <FormHelperText error>{profileForm.errors.accountNumber}</FormHelperText>}
                                    </FormControl>
                                ) : displayField("Account Number", profileForm.values.accountNumber)}
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: edit ? 6 : 4 }}>
                                {edit ? (
                                    <FormControl variant="standard" fullWidth >
                                        <InputLabel shrink htmlFor="customerCode" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                            Branch Code
                                        </InputLabel>
                                        <BootstrapInput
                                            id="customerCode"
                                            name="customerCode"
                                            placeholder="Enter Branch Code"
                                            value={profileForm.values.customerCode}
                                            onChange={profileForm.handleChange}
                                        />
                                        {profileForm.touched.customerCode && <FormHelperText error>{profileForm.errors.customerCode}</FormHelperText>}
                                    </FormControl>
                                ) : displayField("Branch Code", profileForm.values.customerCode)}
                            </Grid>
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
                                            value={profileForm.values.accountType}
                                            onChange={profileForm.handleChange}
                                        />
                                        {profileForm.touched.accountType && <FormHelperText error>{profileForm.errors.accountType}</FormHelperText>}
                                    </FormControl>
                                ) : displayField("Account Type", profileForm.values.accountType)}
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
                                            value={profileForm.values.accountHolderName}
                                            onChange={profileForm.handleChange}
                                        />
                                        {profileForm.touched.accountHolderName && <FormHelperText error>{profileForm.errors.accountHolderName}</FormHelperText>}
                                    </FormControl>
                                ) : displayField("Account Holder Name", profileForm.values.accountHolderName)}
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: edit ? 6 : 4 }}>
                                {edit ? (
                                    <FormControl variant="standard" fullWidth >
                                        <InputLabel shrink htmlFor="bankName" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' }, marginBottom: '5%' }}>
                                            Bank Name
                                        </InputLabel>
                                        <Select
                                            name="bankId"
                                            options={banksList}
                                            placeholder="Select Bank"
                                            classNamePrefix="select"
                                            className="form-control"
                                            value={banksList
                                                .flatMap((group) => group.options)
                                                .find((option) => option.value == profileForm?.values?.bankId)}
                                            onChange={(selectedOption) => {
                                                profileForm.setFieldValue("bankId", selectedOption?.value || "");
                                            }}
                                            styles={{
                                                option: (base, state) => ({
                                                    ...base,
                                                    backgroundColor: state.isSelected
                                                        ? "white"
                                                        : state.isFocused
                                                            ? "#e6e6e6"
                                                            : "white",
                                                    color: "black",
                                                }),
                                                valueContainer: (base) => ({
                                                    ...base,
                                                    maxHeight: "50px",
                                                    overflowY: "auto",
                                                }),
                                            }}
                                        />
                                    </FormControl>
                                ) : displayField("Bank ID", profileForm.values.bankId)}
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: edit ? 6 : 4 }}>
                                <Box display="flex" flexDirection="column" gap={1}>
                                    {/* QR Code */}
                                    {profileForm.values.referralCode && (
                                        <>
                                            <Typography sx={{ fontSize: '1.1rem', fontWeight: 400, mb: 1 }}>Referral Code</Typography>
                                            <QRCodeCanvas
                                                value={`https://api.thibaingozi.com/api/referralCode?refferal_code=${profileForm.values.referralCode}`}
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
                                                variant="contained"
                                                sx={{ width: 130, height: 48, borderRadius: '10px', backgroundColor: 'var(--Blue)' }}
                                                onClick={() => {
                                                    profileForm.handleSubmit()
                                                }}
                                            >
                                                Save
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                sx={{ width: 130, height: 48, borderRadius: '10px', border: '1px solid black', color: 'black' }}
                                                onClick={handleCancel}
                                            >
                                                Cancel
                                            </Button>
                                        </>
                                    ) : (
                                        // userinfo?.data?.data?.data?.bank?.bank_name === ''  || 
                                        // userinfo?.data?.data?.data?.branchCode  === '' || 
                                        // userinfo?.data?.data?.data?.accountNumber === '' || 
                                        // userinfo?.data?.data?.data?.accountType === '' || 
                                        // userinfo?.data?.data?.data?.customerCode === '' ? (
                                            <Button
                                                variant="contained"
                                                sx={{ width: 130, height: 48, borderRadius: '10px', backgroundColor: 'var(--Blue)' }}
                                                onClick={() => setedit(true)}
                                            >
                                                Edit
                                            </Button>
                                        // ) : null
                                    )}
                                </Box>
                            </Grid>
                        </Grid>
                    </form>
                </Box>
            </Box>

             <Box p={2}>
                
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
                            R {userinfo?.data?.data?.data.totalUnPaid || 0}
                        </Typography>
                    </Box>
                    <Tooltip
                        title={
                            userinfo?.data?.data?.data.totalUnPaid >= 10 
                                ? "Click to withdraw"
                                : "Minimum unpaid amount is 10 to payout"
                        }
                        arrow
                    >
                        <span>
                            <Button
                                variant="contained"
                                color="primary"
                                disabled={userinfo?.data?.data?.data.totalUnPaid < 10}
                                onClick={(event) => handlePopup(event, 'payout', 'sales_agent')}
                                sx={{ height: '40px', gap: '10px', backgroundColor: 'var(--Blue)' }}
                            >
                                <img src={payIcon} alt="payIcon" />
                                Withdraw
                            </Button>
                        </span>
                    </Tooltip>

                    {renderPopup()}
                </Box>
            </Box>
            </Box>
            


            {payPopup && renderPopup()}

            {/* <Box sx={{ backgroundColor: "rgb(253, 253, 253)", boxShadow: "-3px 4px 23px rgba(0, 0, 0, 0.1)", mt: 3, padding: 0, borderRadius: '10px' }}>
                <Grid container justifyContent="space-between" alignItems="center" p={2}>
                    <Grid size={{ xs: 12, lg: 6 }} sx={{ display: 'flex', flexDirection: 'row', gap: 2, mb: { xs: 1, md: 0 } }}>
                        <Typography variant="h6" fontWeight={590} sx={{ pl: 2 }}>Total Users</Typography>
                        <Typography variant="body2" sx={{ p: 0.8, borderRadius: '50px', color: '#4B5563', backgroundColor: '#F3F4F6' }}>{listOfSalesAgentUsers.isSuccess && listOfSalesAgentUsers.data?.data?.data?.influencersData?.length || 0} total</Typography>
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
                {listOfSalesAgentUsers.data?.data?.data?.influencersData ? (
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
                                        {listOfSalesAgentUsers.isFetching ?
                                            <TableRow>
                                                <TableCell sx={{ color: '#4B5563', borderBottom: 'none' }} colSpan={5} align="center">
                                                    <Loader />
                                                </TableCell>
                                            </TableRow>
                                            : (listOfSalesAgentUsers.data?.data?.data?.influencersData?.length > 0 ?
                                                listOfSalesAgentUsers.data?.data?.data?.influencersData?.map((user) => (
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
                                                                    <IconButton onClick={() => nav(`/sales-home/user-information/${user._id}`)}>
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
            </Box> */}

            {/* {tieData && (
                <Box sx={{ backgroundColor: "rgb(253, 253, 253)", boxShadow: "-3px 4px 23px rgba(0, 0, 0, 0.1)", mt: 3, padding: 0, borderRadius: '10px' }}>
                    <Grid container justifyContent="space-between" alignItems="center" p={2}>
                        <Grid size={{ xs: 12, lg: 6 }} sx={{ display: 'flex', flexDirection: 'row', gap: 2, mb: { xs: 1, md: 0 } }}>
                            <Typography variant="h6" fontWeight={590} sx={{ pl: 2 }}>Tie Users</Typography>
                            <Typography variant="body2" sx={{ p: 0.8, borderRadius: '50px', color: '#4B5563', backgroundColor: '#F3F4F6' }}>{userinfo?.data?.data?.data?.tieUserData?.length || 0} total</Typography>
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
                    {userinfo?.data?.data?.data?.tieUserData?.length > 0 ? (
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
                                            {userinfo?.isFetching ?
                                                <TableRow>
                                                    <TableCell sx={{ color: '#4B5563', borderBottom: 'none' }} colSpan={5} align="center">
                                                        <Loader />
                                                    </TableCell>
                                                </TableRow>
                                                : (
                                                    userinfo?.data?.data?.data?.tieUserData?.map((user, index) => (
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
            )} */}
        </>

    );
};

export default SalesAgentHome;

const sales_agent = {
    referralCode: "",
    enrollAmountDeduction: "",
    password: "",
    accountNumber: "",
    customerCode: "",
    accountType: "",
    accountHolderName: "",
    first_name: "",
    last_name: "",
    bankId: "",
    email: "",
    // role: "",
    mobile_no: "",
    mobile_no_country_code: "",
};
const setAgentformvalues = ({ ...props }) => {
    const { form, data } = props;
    let newdata = {};

    Object.keys(form.values).forEach((key) => {
        if (key === 'images') {
            newdata = { ...newdata, [key]: Array.from({ length: 5 }, (_, i) => data?.[`image_${i + 1}`] || null).filter(Boolean) };
        } else if (key === 'company_id') {
            newdata = { ...newdata, [key]: data?.company_id?._id ?? '' };
        } else if (key === 'bankId' && data?.[key] && typeof data[key] === 'object') {
            // Extract just the ID from the bank object
            newdata = { ...newdata, [key]: data[key]._id ?? '' };
        } else {
            newdata = { ...newdata, [key]: data?.[key] ?? '' };
        }
    });

    form.setValues(newdata);
};