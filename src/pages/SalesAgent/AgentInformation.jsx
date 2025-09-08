import { useEffect, useState, useLayoutEffect } from "react"
import Select from "react-select";
import { useParams } from "react-router-dom"
import { Grid, Typography, Box, FormControl, InputLabel, Button, FormHelperText } from "@mui/material";
import { useFormik } from "formik"
import { sales_agent_e } from "../../common/FormValidation";
import { useQueryClient } from "@tanstack/react-query"
import { useGetAgent, useUpdateSalesAgent, useGetBanksList, useGetUserByInfluncer, armedSosPayout, payoutUserUpdate } from "../../API Calls/API"
import { toast } from "react-toastify"
import { QRCodeCanvas } from "qrcode.react";
import { toastOption } from "../../common/ToastOptions"
import PhoneInput from "react-phone-input-2"
import PayoutPopup from "../../common/Popup";
import Prev from "../../assets/images/left.png";
import Next from "../../assets/images/right.png";
import nouser from "../../assets/images/NoUser.png";
import Loader from "../../common/Loader";
import { startOfYear } from "date-fns";
import { BootstrapInput } from "../../common/BootstrapInput";
import calender from '../../assets/images/calender.svg';
import CustomDateRangePicker from "../../common/Custom/CustomDateRangePicker";
const AgentInformation = () => {
    const [edit, setEdit] = useState(false)
    // const [role] = useState(localStorage.getItem("role"));
    const [banksList, setbanksList] = useState([])
    const params = useParams();
    const [page, setpage] = useState(1);
    const [filter, setfilter] = useState("");
    const client = useQueryClient()
    const bankslist = useGetBanksList()
    const [payPopup, setPopup] = useState('')
    const [selectedPayoutType, setSelectedPayoutType] = useState('');
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
            const { result, message } = parseXmlResponse(res.data);

            if (result === "Success") {
                payoutUpdateMutation.mutate({
                    user_id: UserInfo.data?.data?.data._id,
                    type: selectedPayoutType,
                    amount: UserInfo.data?.data?.data.totalUnPaid,
                });
                toast.success('Payment successful');
                closePopup();
            } else {
                toast.error(message || 'Payment failed');
                console.error("Payment Error:", message);
            }
        },

        (err) => {
            toast.error('payment failed')
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
            firstName: UserInfo.data?.data?.data?.first_name || "",
            surname: UserInfo.data?.data?.data?.last_name || "",
            branchCode: UserInfo.data?.data?.data.bankId?.branch_code || "",
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
    return (
        <Box p={2}>
            <Box elevation={0} sx={{ p: 3, borderRadius: '16px', mb: 3, backgroundColor: '#f7f9fb' }}>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                    Profile Information
                </Typography>
                <div className="row">
                    <div className="col-md-4">
                        <div className="dash-counter">
                            <span>Total Earned Commission</span>
                            <h3>{UserInfo.data?.data?.data.totalCommission || 0}</h3>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="dash-counter">
                            <span>Total Unpaid Commission</span>
                            <h3>{UserInfo.data?.data?.data.totalUnPaid || 0}</h3>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="dash-counter">
                            <span>Total Users</span>
                            <h3>{UserInfo.data?.data?.data?.user_id.length || 0}</h3>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="dash-counter">
                            <span>Total Earned Amount</span>
                            <h3>{UserInfo.data?.data?.data?.totalEarnedAmount || 0}</h3>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="dash-counter">
                            <span>Total Commission Earned(30%)</span>
                            <h3>{UserInfo.data?.data?.data?.commissionEarned || 0}</h3>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="dash-counter">
                            <span>Performance Level</span>
                            <h3>{UserInfo.data?.data?.data?.performanceLevel || 0}</h3>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="dash-counter">
                            <span>Tie</span>
                            <h3>{UserInfo.data?.data?.data?.tie || 0}</h3>
                        </div>
                    </div>
                </div>
                <form>
                    <Grid container spacing={edit ? 3 : 1}>
                        <Grid size={12}>
                            <Typography variant="h6" gutterBottom fontWeight={600}>
                                Basic Information
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
                                        Customer Code
                                    </InputLabel>
                                    <BootstrapInput
                                        id="customerCode"
                                        name="customerCode"
                                        placeholder="Enter Customer Code"
                                        value={agentForm.values.customerCode}
                                        onChange={agentForm.handleChange}
                                    />
                                    {agentForm.touched.customerCode && <FormHelperText error>{agentForm.errors.customerCode}</FormHelperText>}
                                </FormControl>
                            ) : displayField("Customer Code", agentForm.values.customerCode)}
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
                                <FormControl variant="standard" fullWidth >
                                    <label style={{ marginBottom: 0 }}>Bank ID</label>
                                    <Select
                                        name="bankId"
                                        options={banksList}
                                        placeholder="Select Bank"
                                        classNamePrefix="select"
                                        // className="form-control"
                                        value={banksList
                                            .flatMap((group) => group.options)
                                            .find((option) => option.value == agentForm?.values?.bankId)}
                                        onChange={(selectedOption) => {
                                            agentForm.setFieldValue("bankId", selectedOption?.value || "");
                                        }}
                                        styles={{
                                            control: (base, state) => ({
                                                ...base,
                                                minHeight: "45px",   // 👈 decrease container height
                                                height: "45px",
                                            }),
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
                                                padding: "0 10px",   // 👈 tighter padding
                                                height: "45px",
                                                maxHeight: "38px",
                                                overflowY: "auto",
                                            }),
                                        }}
                                    />
                                    {agentForm.touched.bankId && <FormHelperText error>{agentForm.errors.bankId}</FormHelperText>}
                                </FormControl>
                            ) : displayField("Bank ID", agentForm.values.bankId)}
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: edit ? 6 : 4 }}>
                            <Box display="flex" flexDirection="column" gap={1}>
                                {/* QR Code */}
                                {agentForm.values.referralCode && (
                                    <>
                                        <Typography sx={{ fontSize: '1.1rem', fontWeight: 400, mb: 1 }}>Referral Code</Typography>
                                        <QRCodeCanvas
                                            value={`https://api.thibaingozi.com/api/referralCode?referral_code=${agentForm.values.referralCode}`}
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
                                                agentForm.handleSubmit()
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
            <div className="theme-table" style={{ marginTop: '20px' }}>
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
                        {/* <button
                                    onClick={() => nav("/home/total-drivers/add-driver")}
                                    className="btn btn-primary"
                                >
                                    + Add Driver
                                </button>
                                <button className="btn btn-primary" onClick={handleExport}
                                    disabled={isExportingDrivers}>
                                    {isExportingDrivers ? 'Exporting...' : '+ Export Sheet'}
                                </button> */}

                        {/* <button className="btn btn-primary" onClick={() => setpopup(true)}>
                                    + Import Sheet
                                </button> */}
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
                                                {/* <td>
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
                                                        </td> */}
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

            </div>
            <div className="theme-table payout-section">
                <div className="payout-info">
                    <div className="tab-heading">
                        <h3>Payout</h3>
                    </div>
                    <h4 className="payout-amount">Amount: {UserInfo.data?.data?.data.totalUnPaid || 0}</h4>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={(event) => handlePopup(event, 'payout', 'sales_agent')}
                    // disabled={edit}
                >
                    Pay
                </button>
                {renderPopup()}
            </div>
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
        }
        else {
            newdata = { ...newdata, [key]: data?.[key] ?? '' };
        }

    });

    form.setValues(newdata)
}