import { useEffect, useState, useLayoutEffect } from "react"
import Select from "react-select";
import { useParams } from "react-router-dom"
import { Grid, Typography, Box, FormControl, InputLabel, Button, FormHelperText } from "@mui/material";
import { useFormik } from "formik"
import { sales_agent_e } from "../../common/FormValidation";
import { useQueryClient } from "@tanstack/react-query"
import { useGetAgent, useUpdateSalesAgent, useGetBanksList } from "../../API Calls/API"
import { toast } from "react-toastify"
import { QRCodeCanvas } from "qrcode.react";
import { toastOption } from "../../common/ToastOptions"
import PhoneInput from "react-phone-input-2"
import { BootstrapInput } from "../../common/BootstrapInput";
const AgentInformation = () => {
    const [edit, setEdit] = useState(false)
    const [role] = useState(localStorage.getItem("role"));
    const [banksList, setbanksList] = useState([])
    const params = useParams();
    const client = useQueryClient()
    const bankslist = useGetBanksList()
    const agentForm = useFormik({
        initialValues: {
            referralCode: "",
            enrollAmountDeduction: "",
            accountNumber: "",
            customerCode: "",
            accountType: "",
            accountHolderName: "",
            first_name: "",
            last_name: "",
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
    return (
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
                                        Enroll Amount Deduction
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
                            ) : displayField("Enroll Amount Deduction", agentForm.values.enrollAmountDeduction)}
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
                        <Grid size={{ xs: 12, sm: 6, md: edit ? 6 : 4 }}>
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
                                            value={`https://api.thibaingozi.com/api/referralCode?refferal_code=${agentForm.values.referralCode}`}
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