import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { toast } from "react-toastify";
import { toastOption } from "../common/ToastOptions";
import { driverValidation } from "../common/FormValidation";
import { useFormik } from "formik";
import {
    useGetCountryList,
    useGetProvinceList,
    useGetUserList,
    useRegister
} from "../API Calls/API";
import { useQueryClient } from "@tanstack/react-query";
import Loader from "../common/Loader";
import PhoneInput from "react-phone-input-2";
import {
    Box,
    Button,
    Typography,
    TextField,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    FormHelperText,
    IconButton,
    Grid,
    Paper,
} from "@mui/material";
import { BootstrapInput } from "../common/BootstrapInput";

const AddUser = () => {
    const client = useQueryClient();
    const [role] = useState(localStorage.getItem("role"));
    const nav = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const companyId = localStorage.getItem("userID");

    const onSuccess = () => {
        toast.success("User added successfully.");
        UserForm.resetForm();
        client.invalidateQueries("user list");
        nav("/home/total-users");
    };

    const onError = (error) => {
        toast.error(error.response?.data?.message || "Something went wrong", toastOption);
    };
    const UserForm = useFormik({
        initialValues:
            role === "super_admin"
                ? formValues1
                : { ...formValues2, company_id: companyId },
        validationSchema: driverValidation,
        onSubmit: (values) => {
            const formData = new FormData();
            Object.keys(values).forEach((key) => {
                if (key !== "selfieImage" && key !== "fullImage") {
                    formData.append(key, values[key]);
                }
            });
            if (values.selfieImage) {
                formData.append("selfieImage", values.selfieImage);
            }
            if (values.fullImage) {
                formData.append("fullImage", values.fullImage);
            }
            newUser.mutate(formData);
        },
    });
    const newUser = useRegister(onSuccess, onError);
    const companyList = useGetUserList("company list", "company");
    const countrylist = useGetCountryList();
    const provincelist = useGetProvinceList(UserForm?.values?.country);

    const handleCompanyChange = (e) => {
        const { name, value } = e.target;
        const companyname = companyList.data?.data.users.find(
            (user) => user._id === value
        )?.company_name;
        UserForm.setFieldValue(name, value);
        UserForm.setFieldValue("company_name", companyname);
    };
    const handleCancel = () => {
        nav("/home/total-users");
    };
    useEffect(() => {
        if (role !== "super_admin" && companyList.data?.data?.users?.length) {
            const matchedCompany = companyList.data.data.users.find(
                (user) => user._id === companyId
            );
            if (matchedCompany) {
                UserForm.setFieldValue("company_name", matchedCompany.company_name);
            }
        }
    }, [companyList.data, companyId, role]);

    return (
        <Paper elevation={3} sx={{ p: 3, borderRadius: '10px' }}>
            <form onSubmit={UserForm.handleSubmit}>
                <Grid container spacing={2}>
                    {/* User Info Section */}
                    <Grid size={12}>
                        <Typography variant="h6" gutterBottom fontWeight={600}>
                            User Information
                        </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <FormControl variant="standard" fullWidth sx={{ mb: 3 }}>
                            <InputLabel shrink htmlFor="first_name" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                First Name
                            </InputLabel>
                            <BootstrapInput
                                id="first_name"
                                name="first_name"
                                placeholder="First Name"
                                value={UserForm.values.first_name}
                                onChange={UserForm.handleChange}
                            />
                            {UserForm.touched.first_name && <div style={{ color: 'red', fontSize: 12 }}>{UserForm.errors.first_name}</div>}
                        </FormControl>

                        <FormControl variant="standard" fullWidth sx={{ mb: 3 }}>
                            <InputLabel shrink htmlFor="last_name" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                Last Name
                            </InputLabel>
                            <BootstrapInput
                                id="last_name"
                                name="last_name"
                                placeholder="Last Name"
                                value={UserForm.values.last_name}
                                onChange={UserForm.handleChange}
                            />
                            {UserForm.touched.last_name && <div style={{ color: 'red', fontSize: 12 }}>{UserForm.errors.last_name}</div>}
                        </FormControl>

                        {role === "super_admin" && (
                            <FormControl fullWidth sx={{ mb: 3 }} error={!!UserForm.errors.company_id && UserForm.touched.company_id}>
                                <InputLabel>Company Name</InputLabel>
                                <Select
                                    name="company_id"
                                    value={UserForm.values.company_id}
                                    label="Company Name"
                                    onChange={handleCompanyChange}
                                >
                                    {companyList.data?.data.users.map((user) => (
                                        <MenuItem key={user._id} value={user._id}>
                                            {user.company_name}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <FormHelperText>{UserForm.errors.company_id}</FormHelperText>
                            </FormControl>
                        )}

                        <FormControl variant="standard" fullWidth sx={{ mb: 3 }}>
                            <InputLabel shrink htmlFor="email" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                Email
                            </InputLabel>
                            <BootstrapInput
                                id="email"
                                name="email"
                                placeholder="Email"
                                value={UserForm.values.email}
                                onChange={UserForm.handleChange}
                            />
                            {UserForm.touched.email && <div style={{ color: 'red', fontSize: 12 }}>{UserForm.errors.email}</div>}
                        </FormControl>

                        <FormControl variant="standard" fullWidth sx={{ mb: 3 }}>
                            <InputLabel shrink htmlFor="password" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                Password
                            </InputLabel>
                            <BootstrapInput
                                id="password"
                                name="password"
                                placeholder="Password"
                                type={showPassword ? "text" : "password"}
                                value={UserForm.values.password}
                                onChange={UserForm.handleChange}
                                endAdornment={
                                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                                    </IconButton>
                                }
                            />
                            {UserForm.touched.password && <div style={{ color: 'red', fontSize: 12 }}>{UserForm.errors.password}</div>}
                        </FormControl>

                        <Box sx={{ mb: 3 }}>
                            <PhoneInput
                                country="za"
                                value={`${UserForm.values.mobile_no_country_code ?? ""}${UserForm.values.mobile_no ?? ""}`}
                                onChange={(phone, countryData) => {
                                    const withoutCountryCode = phone.startsWith(countryData.dialCode)
                                        ? phone.slice(countryData.dialCode.length).trim()
                                        : phone;
                                    UserForm.setFieldValue("mobile_no", withoutCountryCode);
                                    UserForm.setFieldValue("mobile_no_country_code", `+${countryData.dialCode}`);
                                }}
                                inputClass="form-control"
                            />
                            {UserForm.touched.mobile_no && <FormHelperText error>{UserForm.errors.mobile_no}</FormHelperText>}
                        </Box>

                        <FormControl variant="standard" fullWidth sx={{ mb: 3 }}>
                            <InputLabel shrink htmlFor="id_no" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                ID No
                            </InputLabel>
                            <BootstrapInput
                                id="id_no"
                                name="id_no"
                                placeholder="ID No"
                                value={UserForm.values.id_no}
                                onChange={UserForm.handleChange}
                            />
                            {UserForm.touched.id_no && <div style={{ color: 'red', fontSize: 12 }}>{UserForm.errors.id_no}</div>}
                        </FormControl>
                    </Grid>

                    {/* Address Section */}
                    <Grid size={12}>
                        <Typography variant="h6" gutterBottom fontWeight={600}>
                            Address
                        </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <FormControl variant="standard" fullWidth sx={{ mb: 3 }}>
                            <InputLabel shrink htmlFor="street" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                Street
                            </InputLabel>
                            <BootstrapInput
                                id="street"
                                name="street"
                                placeholder="Street"
                                value={UserForm.values.street}
                                onChange={UserForm.handleChange}
                            />
                            {UserForm.touched.street && <div style={{ color: 'red', fontSize: 12 }}>{UserForm.errors.street}</div>}
                        </FormControl>

                        <FormControl fullWidth sx={{ mb: 3 }} error={!!UserForm.errors.country && UserForm.touched.country}>
                            <InputLabel>Country</InputLabel>
                            <Select
                                name="country"
                                value={UserForm.values.country}
                                onChange={UserForm.handleChange}
                                label="Country"
                            >
                                {countrylist.data?.data.data?.map((country) => (
                                    <MenuItem key={country._id} value={country._id}>
                                        {country.country_name}
                                    </MenuItem>
                                ))}
                            </Select>
                            <FormHelperText>{UserForm.errors.country}</FormHelperText>
                        </FormControl>

                        <FormControl fullWidth sx={{ mb: 3 }}>
                            <InputLabel>Province</InputLabel>
                            <Select
                                name="province"
                                value={UserForm.values.province}
                                onChange={UserForm.handleChange}
                                disabled={!UserForm.values.country}
                            >
                                {provincelist.data?.data.data?.map((province) => (
                                    <MenuItem key={province._id} value={province._id}>
                                        {province.province_name}
                                    </MenuItem>
                                ))}
                            </Select>
                            {UserForm.touched.province && <FormHelperText error>{UserForm.errors.province}</FormHelperText>}
                        </FormControl>

                        <FormControl variant="standard" fullWidth sx={{ mb: 3 }}>
                            <InputLabel shrink htmlFor="city" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                City
                            </InputLabel>
                            <BootstrapInput
                                id="city"
                                name="city"
                                placeholder="City"
                                value={UserForm.values.city}
                                onChange={UserForm.handleChange}
                            />
                            {UserForm.touched.city && <div style={{ color: 'red', fontSize: 12 }}>{UserForm.errors.city}</div>}
                        </FormControl>

                        <FormControl variant="standard" fullWidth sx={{ mb: 3 }}>
                            <InputLabel shrink htmlFor="suburb" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                Suburb
                            </InputLabel>
                            <BootstrapInput
                                id="suburb"
                                name="suburb"
                                placeholder="Suburb"
                                value={UserForm.values.suburb}
                                onChange={UserForm.handleChange}
                            />
                            {UserForm.touched.suburb && <div style={{ color: 'red', fontSize: 12 }}>{UserForm.errors.suburb}</div>}
                        </FormControl>

                        <FormControl variant="standard" fullWidth>
                            <InputLabel shrink htmlFor="postal_code" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                Postal Code
                            </InputLabel>
                            <BootstrapInput
                                id="postal_code"
                                name="postal_code"
                                placeholder="Postal Code"
                                value={UserForm.values.postal_code}
                                onChange={UserForm.handleChange}
                            />
                            {UserForm.touched.postal_code && <div style={{ color: 'red', fontSize: 12 }}>{UserForm.errors.postal_code}</div>}
                        </FormControl>
                    </Grid>

                    {/* Actions */}
                    <Grid size={12}>
                        <Box display="flex" justifyContent="flex-end" gap={2}>
                            <Button variant="outlined" sx={{ width: 130, height: 48, borderRadius: '10px' }} onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                disabled={newUser.isPending}
                                sx={{ width: 130, height: 48, borderRadius: '10px' }}
                            >
                                {newUser.isPending ? <Loader color="white" /> : "Save"}
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </form>
        </Paper>

    );
};

export default AddUser;

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
    role: "passanger",
    type: "email_pass",
    fcm_token: "fcm_token",
    selfieImage: "",
    fullImage: "",
};

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
    role: "passanger",
    type: "email_pass",
    fcm_token: "fcm_token",
    selfieImage: "",
    fullImage: "",
};
