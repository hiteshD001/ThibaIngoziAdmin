import { useEffect, useState, useLayoutEffect } from "react";
import Select from "react-select";
import { Grid, Paper, Typography, Box, FormControl, InputLabel, Button, FormHelperText, Modal, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import { useFormik } from "formik";
import { sales_agent_e } from "../common/FormValidation";
import { BootstrapInput } from '../common/BootstrapInput'
import { useQueryClient } from "@tanstack/react-query";
import { QRCodeCanvas } from "qrcode.react";
import { useGetAgent, useUpdateSalesAgent, useGetBanksList } from "../API Calls/API";
import { toast } from "react-toastify";
import { toastOption } from "../common/ToastOptions";
import PhoneInput from "react-phone-input-2";
import Loader from "../common/Loader";
import { useGetUserByInfluncer } from "../API Calls/API";
import { startOfYear } from "date-fns";
import { useParams } from "react-router-dom";
import nouser from "../assets/images/NoUser.png";
import Prev from "../assets/images/left.png";
import Next from "../assets/images/right.png";
// import Prev from "../../assets/images/left.png";
// import { useFormik } from "formik";

const SalesAgentHome = () => {
    const role = localStorage.getItem("role");
    const [time, setTime] = useState("today");
    const [timeTitle, setTimeTitle] = useState("Today");
    const [banksList, setbanksList] = useState([])
    const client = useQueryClient();
    const [edit, setedit] = useState(false);
    const bankslist = useGetBanksList()
    const [tieModalOpen, setTieModalOpen] = useState(false);
    const [tieUsers, setTieUsers] = useState([]);
    const [page, setpage] = useState(1);
    const [tieData, setTieData] = useState(true)
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
    const listOfSalesAgentUsers = useGetUserByInfluncer(page, 10, startDate, endDate, userinfo?.data?.data?.data?._id)

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

    const handleTieClick = () => {
        const tieUserData = userinfo?.data?.data?.data?.tieUserData;
        setTieUsers(tieUserData)

        setTieData(true)

        console.log("Tie clicked:", tieUserData);

        if (tieUserData && Array.isArray(tieUserData)) {
            setTieUsers(tieUserData);
            setTieModalOpen(true);
        } else {
            toast.info("No tie user data available");
        }
    };

    const handleCancel = () => {
        const data = userinfo?.data?.data?.data;
        if (data) {
            profileForm.resetForm({ values: data });
        }
        setedit(false);
    };
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
            <Grid container spacing={3} px={2}>

                {/* Total Companies */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper
                        elevation={3}
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            // textAlign: "center",
                            bgcolor: "#e3f5ff",
                        }}
                    >
                        <Typography variant="subtitle1" color="text.secondary">
                            Total Commission Earned
                        </Typography>
                        <Typography variant="h4" fontWeight="bold">
                            R.{userinfo?.data?.data?.data?.totalCommission}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper
                        elevation={3}
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            // textAlign: "center",
                            bgcolor: "#e3f5ff",
                        }}
                    >
                        <Typography variant="subtitle1" color="text.secondary">
                            Total Commission Unpaid
                        </Typography>
                        <Typography variant="h4" fontWeight="bold">
                            R.{userinfo?.data?.data?.data?.totalUnPaid}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper
                        elevation={3}
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            // textAlign: "center",
                            bgcolor: "#e3f5ff",
                        }}
                    >
                        <Typography variant="subtitle1" color="text.secondary">
                            Total Commission Unpaid
                        </Typography>
                        <Typography variant="h4" fontWeight="bold">
                            R.{userinfo?.data?.data?.data?.totalUnPaid}
                        </Typography>
                    </Paper>
                </Grid>
                 <Grid size={{ xs: 12, md: 4 }}>
                    <Paper
                        elevation={3}
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            // textAlign: "center",
                            bgcolor: "#e3f5ff",
                        }}
                    >
                        <Typography variant="subtitle1" color="text.secondary">
                            Total Commission Unpaid
                        </Typography>
                        <Typography variant="h4" fontWeight="bold">
                            R.{userinfo?.data?.data?.data?.totalUnPaid}
                        </Typography>
                    </Paper>
                </Grid>




                {/* Users Active (time filter) */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper
                        elevation={3}
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            // textAlign: "center",
                            bgcolor: "#e3f5ff",
                        }}
                    >
                        <Typography variant="subtitle1" color="text.secondary" >
                            My Total Users
                        </Typography>
                        <Typography variant="h4" fontWeight="bold">
                            {userinfo?.data?.data?.data?.user_id?.length}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }} >
                    <Paper
                        elevation={3}
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            // textAlign: "center",
                            bgcolor: "#e3f5ff",

                        }}

                    >
                        <Typography variant="subtitle1" color="text.secondary" >
                            Performance Level
                        </Typography>
                        <Typography variant="h4" fontWeight="bold" >
                            {userinfo?.data?.data?.data.performanceLevel}
                        </Typography>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper
                        elevation={3}
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            // textAlign: "center",
                            bgcolor: "#e3f5ff",
                            cursor: "pointer"
                        }}
                        // onClick={handleTieClick}
                    >
                        <Typography variant="subtitle1" color="text.secondary" >
                            Tie
                        </Typography>
                        <Typography variant="h4" fontWeight="bold">
                            {userinfo?.data?.data?.data?.tie}
                        </Typography>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper
                        elevation={3}
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            // textAlign: "center",
                            bgcolor: "#e3f5ff",
                            cursor: "pointer"
                        }}
                        // onClick={handleTieClick}
                    >
                        <Typography variant="subtitle1" color="text.secondary" >
                        Total Sales agent Users 
                        </Typography>
                        <Typography variant="h4" fontWeight="bold">
                            {userinfo?.data?.data?.data?.grandTotalUsers}
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>


            <Box p={2}>
                <Box elevation={0} sx={{ p: 3, borderRadius: '16px', mb: 3, backgroundColor: '#f7f9fb' }}>
                    <form>
                        <Grid container spacing={edit ? 3 : 1}>
                            <Grid size={12}>
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
                            {/* <Grid size={12}>
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
                                        // <Button
                                        //     variant="contained"
                                        //     sx={{ width: 130, height: 48, borderRadius: '10px', backgroundColor: 'var(--Blue)' }}
                                        //     onClick={() => setedit(true)}
                                        // >
                                        //     Edit
                                        // </Button>
                                    )}
                                </Box>
                            </Grid> */}
                        </Grid>
                    </form>
                </Box>
            </Box>

            {/* <div className="theme-table" style={{ marginTop: '20px' }}>
                <div className="tab-heading">
                    <div className="count">
                        <h3>Total Users</h3>
                        <p>{listOfSalesAgentUsers.isSuccess && listOfSalesAgentUsers.data?.data?.data?.influencersData?.length || 0}</p>
                    </div>
                    <div className="tbl-filter">
                        
                        <button
                                    onClick={() => nav("/home/total-drivers/add-driver")}
                                    className="btn btn-primary"
                                >
                                    + Add Driver
                                </button>
                                <button className="btn btn-primary" onClick={handleExport}
                                    disabled={isExportingDrivers}>
                                    {isExportingDrivers ? 'Exporting...' : '+ Export Sheet'}
                                </button>

                        <button className="btn btn-primary" onClick={() => setpopup(true)}>
                                    + Import Sheet
                                </button>
                    </div>
                </div>
                {listOfSalesAgentUsers.isFetching ? (
                    <Loader />
                ) : (
                    <>
                        {listOfSalesAgentUsers.data?.data?.data?.influencersData ? (
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
                                        {listOfSalesAgentUsers?.data && listOfSalesAgentUsers.data?.data?.data?.influencersData?.map((driver) => (
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
                                                                onClick={() => setconfirmation(driver._id)}
                                                                className="tbl-gray"
                                                            >
                                                                Delete
                                                            </span>
                                                            {confirmation === driver._id && (
                                                                <DeleteConfirm
                                                                    id={driver._id}
                                                                    setconfirmation={setconfirmation}
                                                                />
                                                            )}
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
                                            disabled={page === listOfSalesAgentUsers.data?.data?.data?.totalPages}
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