import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { toast } from "react-toastify";
import { toastOption } from "../common/ToastOptions";
import { driverValidation } from "../common/FormValidation";
import {
    Box,
    Button,
    Typography,
    // TextField,
    // Select,
    // MenuItem,
    InputLabel,
    FormControl,
    FormHelperText,
    IconButton,
    Grid,
    Paper,
    Checkbox,
    FormControlLabel,
    FormGroup,
    FormLabel,
} from "@mui/material";
import { useFormik } from "formik";
import checkedboxIcon from '../../assets/images/checkboxIcon.svg'
import uncheckedIcon from '../../assets/images/UnChecked.svg'
import { BootstrapInput } from "../common/BootstrapInput";
import { useGetCountryList, useGetProvinceList, useGetUserList, useRegister, useGeteHailingList } from "../API Calls/API";
import { useQueryClient } from "@tanstack/react-query";
import CustomSelect from "../common/Custom/CustomSelect";
import Loader from "../common/Loader";
import PhoneInput from "react-phone-input-2";
import GrayPlus from '../../assets/images/GrayPlus.svg'
const AddDriver = () => {
    const client = useQueryClient();
    const [role] = useState(localStorage.getItem("role"))
    const nav = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const location = useLocation();
    const companyId = location.state?.companyId;

    const driverForm = useFormik({
        initialValues: role === 'super_admin' ? formValues1 : formValues2,
        validationSchema: driverValidation,
        onSubmit: (values) => {
            const formData = new FormData();
            Object.keys(values).forEach((key) => {
                if (key !== "selfieImage" && key !== "fullImage") {
                    if (key === "other_e_hailing_company") {
                        formData.append("other_e_hailing_company", values[key].join(","));
                    } else {
                        formData.append(key, values[key]);
                    }
                }
            });
            if (values.selfieImage) {
                formData.append("selfieImage", values.selfieImage);
            }
            if (values.fullImage) {
                formData.append("fullImage", values.fullImage);
            }
            newdriver.mutate(formData);
        },
    });


    const handleCompanyChange = (e) => {
        const { name, value } = e.target

        const companyname = companyList.data?.data.users.find((user) => user._id === value)?.company_name

        driverForm.setFieldValue(name, value)
        driverForm.setFieldValue('company_name', companyname)
    }
    const onSuccess = () => {

        toast.success("Driver added successfully.");
        driverForm.resetForm();
        client.invalidateQueries("company list");
        nav(role === 'super_admin' ? "/home/total-drivers" : `/home/total-drivers/${localStorage.getItem("userID")}`);
    }
    const onError = (error) => {
        toast.error(error.response.data.message || "Something went Wrong", toastOption)
    }
    const handleCancel = () => {
        nav("/home/total-drivers");
    };
    const newdriver = useRegister(onSuccess, onError)
    const companyList = useGetUserList("company list", "company")
    const provincelist = useGetProvinceList(driverForm.values.country)
    const countrylist = useGetCountryList()
    const eHailingList = useGeteHailingList()

    const eHailingOptions = eHailingList?.data?.data?.data?.map(item => ({
        label: item.name,
        value: item._id,
    })) || [];
    useEffect(() => {
        if (companyId && companyList?.data?.data?.users?.length) {
            driverForm.setFieldValue('company_id', companyId);

            const matchedCompany = companyList.data.data.users.find(
                (user) => user._id === companyId
            );

            if (matchedCompany) {
                driverForm.setFieldValue('company_name', matchedCompany.company_name);
            }
        }
    }, [companyId, companyList?.data?.data?.users]);
    return (
        <Box p={2}>
            <form onSubmit={driverForm.handleSubmit}>
                <Paper elevation={0} sx={{ p: 3, borderRadius: '10px' }}>
                    <Grid container spacing={3}>
                        {/* User Info Section */}
                        <Grid size={12}>
                            <Typography variant="h6" gutterBottom fontWeight={600}>
                                Driver Information
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl variant="standard" fullWidth >
                                <InputLabel shrink htmlFor="first_name" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                    First Name
                                </InputLabel>
                                <BootstrapInput
                                    id="first_name"
                                    name="first_name"
                                    placeholder="First Name"
                                    value={driverForm.values.first_name}
                                    onChange={driverForm.handleChange}
                                />
                                {driverForm.touched.first_name && <div style={{ color: 'red', fontSize: 12 }}>{driverForm.errors.first_name}</div>}
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl variant="standard" fullWidth >
                                <InputLabel shrink htmlFor="last_name" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                    Last Name
                                </InputLabel>
                                <BootstrapInput
                                    id="last_name"
                                    name="last_name"
                                    placeholder="Last Name"
                                    value={driverForm.values.last_name}
                                    onChange={driverForm.handleChange}
                                />
                                {driverForm.touched.last_name && <div style={{ color: 'red', fontSize: 12 }}>{driverForm.errors.last_name}</div>}
                            </FormControl>
                        </Grid>
                        {role === "super_admin" && (
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <CustomSelect
                                    label="Company Name"
                                    name="company_id"
                                    value={driverForm.values.company_id}
                                    onChange={handleCompanyChange}
                                    options={companyList.data?.data.users.map(user => ({
                                        value: user._id,
                                        label: user.company_name
                                    })) || []}
                                    error={driverForm.errors.company_id}
                                    helperText={driverForm.errors.company_id}
                                />

                            </Grid>
                        )}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl variant="standard" fullWidth>
                                <InputLabel shrink htmlFor="email" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                    Email
                                </InputLabel>
                                <BootstrapInput
                                    id="email"
                                    name="email"
                                    placeholder="Enter email"
                                    value={driverForm.values.email}
                                    onChange={driverForm.handleChange}
                                />
                                {driverForm.touched.email && <div style={{ color: 'red', fontSize: 12 }}>{driverForm.errors.email}</div>}
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl variant="standard" fullWidth sx={{ position: 'relative' }}>
                                <InputLabel shrink htmlFor="password" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                    Password
                                </InputLabel>

                                <BootstrapInput
                                    id="password"
                                    name="password"
                                    placeholder="Enter Password"
                                    type={showPassword ? "text" : "password"}
                                    value={driverForm.values.password}
                                    onChange={driverForm.handleChange}
                                    style={{ paddingRight: 0 }}
                                />
                                <IconButton
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: 8,
                                        top: '70%',
                                        transform: 'translateY(-50%)',
                                        padding: 0,
                                        zIndex: 2
                                    }}
                                    tabIndex={-1}
                                >
                                    {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                                </IconButton>

                                {driverForm.touched.password && <div style={{ color: 'red', fontSize: 12 }}>{driverForm.errors.password}</div>}
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl variant="standard" fullWidth>
                                <label style={{ marginBottom: 5 }}>Phone Number</label>
                                <PhoneInput
                                    country="za"
                                    value={driverForm.values.mobile_no || ""}
                                    onChange={(value, countryData) => {
                                        driverForm.setFieldValue("mobile_no", value);
                                        driverForm.setFieldValue("mobile_no_country_code", `+${countryData.dialCode}`);
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
                            </FormControl>
                            {driverForm.touched.mobile_no && <FormHelperText error>{driverForm.errors.mobile_no}</FormHelperText>}

                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl variant="standard" fullWidth >
                                <InputLabel shrink htmlFor="id_no" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                    ID No
                                </InputLabel>
                                <BootstrapInput
                                    id="id_no"
                                    name="id_no"
                                    placeholder="Enter ID No."
                                    value={driverForm.values.id_no}
                                    onChange={driverForm.handleChange}
                                />
                                {driverForm.touched.id_no && <div style={{ color: 'red', fontSize: 12 }}>{driverForm.errors.id_no}</div>}
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <CustomSelect
                                label="Primary E-hailing Company"
                                name="primary_e_hailing_company"
                                value={driverForm.values.primary_e_hailing_company}
                                onChange={(e) => driverForm.setFieldValue("primary_e_hailing_company", e.target.value)}
                                options={
                                    eHailingOptions.map((option) => ({
                                        value: option.value,
                                        label: option.label,
                                    }))
                                }
                                error={driverForm.touched.primary_e_hailing_company && Boolean(driverForm.errors.primary_e_hailing_company)}
                                helperText={driverForm.touched.primary_e_hailing_company && driverForm.errors.primary_e_hailing_company}
                            />


                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        name="isArmed"
                                        checked={driverForm.values.isArmed}
                                        onChange={(e) => driverForm.setFieldValue("isArmed", e.target.checked)}
                                        icon={<img src={uncheckedIcon} alt='uncheckedIcon' />}
                                        checkedIcon={<img src={checkedboxIcon} alt='checkIcon' />}

                                    />
                                }
                                label="Security"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl component="fieldset" variant="standard" sx={{ width: '100%' }}>
                                <FormLabel sx={{
                                    color: 'var(--font-gray)', '&.Mui-focused': { color: 'black' }, fontWeight: 500, fontSize: '1rem', mb: 1
                                }}>
                                    Other eHailing Platforms
                                </FormLabel>
                                <FormGroup row sx={{ flexWrap: 'wrap', gap: 1 }}>
                                    {eHailingOptions.map((option) => (
                                        <FormControlLabel
                                            key={option.value}
                                            control={
                                                <Checkbox
                                                    checked={driverForm.values.other_e_hailing_company?.includes(option.value)}
                                                    onChange={(e) => {
                                                        const selected = driverForm.values.other_e_hailing_company || [];
                                                        const updated = e.target.checked
                                                            ? [...selected, option.value]
                                                            : selected.filter((id) => id !== option.value);
                                                        driverForm.setFieldValue("other_e_hailing_company", updated);
                                                    }}
                                                    icon={
                                                        <img
                                                            src={uncheckedIcon}
                                                            alt="unchecked"
                                                            style={{ width: 24, height: 24 }}
                                                        />
                                                    }
                                                    checkedIcon={
                                                        <img
                                                            src={checkedboxIcon}
                                                            alt="checked"
                                                            style={{ width: 24, height: 24 }}
                                                        />
                                                    }
                                                    name={option.value}
                                                />
                                            }
                                            label={option.label}
                                        />
                                    ))}
                                </FormGroup>
                            </FormControl>
                        </Grid>

                        <Grid size={12}>
                            <Grid container gap={4} sx={{ mt: 1 }}>
                                <Grid size={{ xs: 12, sm: 2.5 }}>
                                    <label style={{ marginBottom: '10px', display: 'block', fontWeight: 500 }}>Selfie Image</label>
                                    <Box
                                        sx={{
                                            border: '2px dashed #E0E3E7',
                                            borderRadius: '12px',
                                            minHeight: 180,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            position: 'relative',
                                            background: '#fafbfc'
                                        }}
                                        component="label"
                                    >
                                        <input
                                            type="file"
                                            accept="image/*"
                                            hidden
                                            name="selfieImage"
                                            onChange={e => driverForm.setFieldValue('selfieImage', e.currentTarget.files[0])}
                                        />
                                        <img src={GrayPlus} alt="gray plus" />
                                        <Typography sx={{ color: '#B0B0B0', fontWeight: 550, mt: 1 }}>Upload</Typography>
                                        {driverForm.values.selfieImage && (
                                            <Typography sx={{ color: '#4B5563', mt: 1, fontSize: 12 }}>
                                                {driverForm.values.selfieImage.name}
                                            </Typography>
                                        )}
                                    </Box>
                                    {driverForm.touched.selfieImage && driverForm.errors.selfieImage && (
                                        <FormHelperText error>{driverForm.errors.selfieImage}</FormHelperText>
                                    )}
                                </Grid>
                                <Grid size={{ xs: 12, sm: 2.5 }}>
                                    <label style={{ marginBottom: '10px', display: 'block', fontWeight: 500 }}>Full Image</label>
                                    <Box
                                        sx={{
                                            border: '2px dashed #E0E3E7',
                                            borderRadius: '12px',
                                            minHeight: 180,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            position: 'relative',
                                            background: '#fafbfc'
                                        }}
                                        component="label"
                                    >
                                        <input
                                            type="file"
                                            accept="image/*"
                                            hidden
                                            name="fullImage"
                                            onChange={e => driverForm.setFieldValue('fullImage', e.currentTarget.files[0])}
                                        />
                                        <img src={GrayPlus} alt="gray plus" />
                                        <Typography sx={{ color: '#B0B0B0', fontWeight: 550, mt: 1 }}>Upload</Typography>
                                        {driverForm.values.fullImage && (
                                            <Typography sx={{ color: '#4B5563', mt: 1, fontSize: 12 }}>
                                                {driverForm.values.fullImage.name}
                                            </Typography>
                                        )}
                                    </Box>
                                    {driverForm.touched.fullImage && driverForm.errors.fullImage && (
                                        <FormHelperText error>{driverForm.errors.fullImage}</FormHelperText>
                                    )}
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Paper>
                {/* Address Section */}
                <Paper elevation={0} sx={{ p: 3, mt: 3, mb: 3, borderRadius: '10px' }}>
                    <Grid container spacing={3}>

                        <Grid size={12}>
                            <Typography variant="h6" gutterBottom fontWeight={600}>
                                Address
                            </Typography>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <CustomSelect
                                label="Country"
                                name="country"
                                value={driverForm.values.country}
                                onChange={driverForm.handleChange}
                                options={countrylist.data?.data.data?.map(country => ({
                                    value: country._id,
                                    label: country.country_name
                                })) || []}
                                error={driverForm.errors.country && driverForm.touched.country}
                                helperText={driverForm.errors.country}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <CustomSelect
                                label="Province"
                                name="province"
                                value={driverForm.values.province}
                                onChange={driverForm.handleChange}
                                options={provincelist.data?.data.data?.map(province => ({
                                    value: province._id,
                                    label: province.province_name
                                })) || []}
                                error={driverForm.errors.province && driverForm.touched.province}
                                helperText={driverForm.touched.province ? driverForm.errors.province : ''}
                                disabled={!driverForm.values.country}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl variant="standard" fullWidth >
                                <InputLabel shrink htmlFor="city" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                    City
                                </InputLabel>
                                <BootstrapInput
                                    id="city"
                                    name="city"
                                    placeholder="City"
                                    value={driverForm.values.city}
                                    onChange={driverForm.handleChange}
                                />
                                {driverForm.touched.city && <div style={{ color: 'red', fontSize: 12 }}>{driverForm.errors.city}</div>}
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl variant="standard" fullWidth >
                                <InputLabel shrink htmlFor="suburb" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                    Suburb
                                </InputLabel>
                                <BootstrapInput
                                    id="suburb"
                                    name="suburb"
                                    placeholder="Enter Suburb"
                                    value={driverForm.values.suburb}
                                    onChange={driverForm.handleChange}
                                />
                                {driverForm.touched.suburb && <div style={{ color: 'red', fontSize: 12 }}>{driverForm.errors.suburb}</div>}
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl variant="standard" fullWidth >
                                <InputLabel shrink htmlFor="street" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                    Street
                                </InputLabel>
                                <BootstrapInput
                                    id="street"
                                    name="street"
                                    placeholder="Street"
                                    value={driverForm.values.street}
                                    onChange={driverForm.handleChange}
                                />
                                {driverForm.touched.street && <div style={{ color: 'red', fontSize: 12 }}>{driverForm.errors.street}</div>}
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl variant="standard" fullWidth>
                                <InputLabel shrink htmlFor="postal_code" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                    Postal Code
                                </InputLabel>
                                <BootstrapInput
                                    id="postal_code"
                                    name="postal_code"
                                    placeholder="Enter Postal Code"
                                    value={driverForm.values.postal_code}
                                    onChange={driverForm.handleChange}
                                />
                                {driverForm.touched.postal_code && <div style={{ color: 'red', fontSize: 12 }}>{driverForm.errors.postal_code}</div>}
                            </FormControl>
                        </Grid>

                        {/* Actions */}
                        <Grid size={12} sx={{ mt: 1 }}>
                            <Box display="flex" justifyContent="flex-end" gap={2}>
                                <Button variant="outlined" sx={{ width: 130, height: 48, borderRadius: '10px', color: 'black', borderColor: '#E0E3E7' }} onClick={handleCancel}>
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={newdriver.isPending}
                                    sx={{ width: 130, height: 48, borderRadius: '10px', backgroundColor: 'var(--Blue)' }}
                                >
                                    {newdriver.isPending ? <Loader color="white" /> : "Save"}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>
            </form>
        </Box >
    );
};

export default AddDriver;


const formValues1 = {
    company_id: "",
    company_name: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    mobile_no: "",
    mobile_no_country_code: "",
    street: "",
    province: "",
    city: "",
    suburb: "",
    postal_code: "",
    country: "",
    id_no: "",
    role: "driver",
    type: "email_pass",
    fcm_token: "fcm_token",
    isArmed: false,
    selfieImage: "",
    fullImage: "",
    primary_e_hailing_company: "",
    other_e_hailing_company: [],
    // isPaymentToken: false,
}

const formValues2 = {
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    mobile_no: "",
    mobile_no_country_code: "",
    street: "",
    province: "",
    city: "",
    suburb: "",
    postal_code: "",
    country: "",
    id_no: "",
    role: "driver",
    type: "email_pass",
    fcm_token: "fcm_token",
    isArmed: false,
    selfieImage: "",
    fullImage: "",
    primary_e_hailing_company: "",
    other_e_hailing_company: [],
}
