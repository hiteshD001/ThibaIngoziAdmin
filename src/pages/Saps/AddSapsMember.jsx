import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { toast } from "react-toastify";
import { toastOption } from "../../common/ToastOptions";
import { SAPSMemberValidation } from "../../common/FormValidation";
import { useFormik } from "formik";
import {
    useGetCountryList,
    useGetProvinceList,
    useAddSAPSMember,
    useGetCityList,useGetPoliceUnitsByCity
} from "../../API Calls/API";
import { useQueryClient } from "@tanstack/react-query";
import Loader from "../../common/Loader";
import PhoneInput from "react-phone-input-2";
import {
    Box, Button, Typography, InputLabel, FormControl, FormHelperText, IconButton, Grid, Paper,
} from "@mui/material";
import GrayPlus from '../../assets/images/GrayPlus.svg'
import CustomSelect from "../../common/Custom/CustomSelect";
import { BootstrapInput } from "../../common/BootstrapInput";

const AddSapsMember = () => {
    const client = useQueryClient();
    const [role] = useState(localStorage.getItem("role"));
    const nav = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const companyId = localStorage.getItem("userID");

    const onSuccess = () => {
        toast.success("SAPS Member added successfully.");
        UserForm.resetForm();
        client.invalidateQueries("saps member list");
        nav("/home/total-saps-wanted");
    };

    const onError = (error) => {
        toast.error(error.response?.data?.message || "Something went wrong", toastOption);
    };
    const UserForm = useFormik({
        initialValues: {
            first_name: "",
            last_name: "",
            email: "",
            password: "",
            mobile_no: "",
            mobile_no_country_code: "",
            street: "",
            province: "",
            city: "",
            police_unit_id: "",
            suburb: "",
            postal_code: "",
            country: "",
            passport_no: "",
            selfieImage: "",
            fullImage: "",
        },
        validationSchema: SAPSMemberValidation,
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
    const newUser = useAddSAPSMember(onSuccess, onError);

    const countrylist = useGetCountryList();
    const provincelist = useGetProvinceList(UserForm?.values?.country);
    const cityList = useGetCityList(UserForm?.values?.province)
    const policeStationList = useGetPoliceUnitsByCity(UserForm?.values?.city)

    const handleCancel = () => {
        nav("/home/total-saps-wanted");
    };

    return (
        <Box p={2}>
            <form onSubmit={UserForm.handleSubmit}>
                {/* User Info Section */}
                <Paper elevation={0} sx={{ p: 3, borderRadius: '10px' }}>
                    <Grid container spacing={3}>
                        <Grid size={12}>
                            <Typography variant="h6" gutterBottom fontWeight={600}>
                                SAPS Member Information
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
                                    value={UserForm.values.first_name}
                                    onChange={UserForm.handleChange}
                                />
                                {UserForm.touched.first_name && <div style={{ color: 'red', fontSize: 12 }}>{UserForm.errors.first_name}</div>}
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
                                    value={UserForm.values.last_name}
                                    onChange={UserForm.handleChange}
                                />
                                {UserForm.touched.last_name && <div style={{ color: 'red', fontSize: 12 }}>{UserForm.errors.last_name}</div>}
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl variant="standard" fullWidth>
                                <InputLabel shrink htmlFor="email" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                    Email
                                </InputLabel>
                                <BootstrapInput
                                    id="email"
                                    name="email"
                                    placeholder="Enter email"
                                    value={UserForm.values.email}
                                    onChange={UserForm.handleChange}
                                />
                                {UserForm.touched.email && <div style={{ color: 'red', fontSize: 12 }}>{UserForm.errors.email}</div>}
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
                                    value={UserForm.values.password}
                                    onChange={UserForm.handleChange}
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

                                {UserForm.touched.password && <div style={{ color: 'red', fontSize: 12 }}>{UserForm.errors.password}</div>}
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl variant="standard" fullWidth>
                                <label style={{ marginBottom: 5 }}>Phone Number</label>
                                <PhoneInput
                                    country="za"
                                    value={UserForm.values.mobile_no || ""}
                                    onChange={(value, countryData) => {
                                        UserForm.setFieldValue("mobile_no", value);
                                        UserForm.setFieldValue("mobile_no_country_code", `+${countryData.dialCode}`);
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
                            {UserForm.touched.mobile_no && <FormHelperText error>{UserForm.errors.mobile_no}</FormHelperText>}

                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl variant="standard" fullWidth >
                                <InputLabel shrink htmlFor="passport_no" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                    ID/Passport Number
                                </InputLabel>
                                <BootstrapInput
                                    id="passport_no"
                                    name="passport_no"
                                    placeholder="Enter ID/Passport Number."
                                    value={UserForm.values.passport_no}
                                    onChange={UserForm.handleChange}
                                />
                                {UserForm.touched.passport_no && <div style={{ color: 'red', fontSize: 12 }}>{UserForm.errors.passport_no}</div>}
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
                                            onChange={e => UserForm.setFieldValue('selfieImage', e.currentTarget.files[0])}
                                        />
                                        {UserForm.values.selfieImage instanceof File ? (
                                            <img
                                                src={URL.createObjectURL(UserForm.values.selfieImage)}
                                                alt="Selfie Preview"
                                                style={{ height: 200, width: '100%', objectFit: 'contain', marginBottom: 8 }}
                                            />
                                        ) : UserForm.values.selfieImage ? (
                                            <img
                                                src={UserForm.values.selfieImage}
                                                alt="Selfie"
                                                style={{ height: 200, width: '100%', objectFit: 'contain', marginBottom: 8 }}
                                            />
                                        ) : (<><img src={GrayPlus} alt="gray plus" />
                                            <Typography sx={{ color: '#B0B0B0', fontWeight: 550, mt: 1 }}>Upload</Typography></>
                                        )}
                                    </Box>
                                    {UserForm.touched.selfieImage && UserForm.errors.selfieImage && (
                                        <FormHelperText error>{UserForm.errors.selfieImage}</FormHelperText>
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
                                            onChange={e => UserForm.setFieldValue('fullImage', e.currentTarget.files[0])}
                                        />
                                        {UserForm.values.fullImage instanceof File ? (
                                            <img
                                                src={URL.createObjectURL(UserForm.values.fullImage)}
                                                alt="Selfie Preview"
                                                style={{ height: 200, width: '100%', objectFit: 'contain', marginBottom: 8 }}
                                            />
                                        ) : UserForm.values.fullImage ? (
                                            <img
                                                src={UserForm.values.fullImage}
                                                alt="Selfie"
                                                style={{ height: 200, width: '100%', objectFit: 'contain', marginBottom: 8 }}
                                            />
                                        ) : (<><img src={GrayPlus} alt="gray plus" />
                                            <Typography sx={{ color: '#B0B0B0', fontWeight: 550, mt: 1 }}>Upload</Typography></>
                                        )}
                                    </Box>
                                    {UserForm.touched.fullImage && UserForm.errors.fullImage && (
                                        <FormHelperText error>{UserForm.errors.fullImage}</FormHelperText>
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
                                value={UserForm.values.country}
                                onChange={UserForm.handleChange}
                                options={countrylist.data?.data.data?.map(country => ({
                                    value: country._id,
                                    label: country.country_name
                                })) || []}
                                error={UserForm.errors.country && UserForm.touched.country}
                                helperText={UserForm.errors.country}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <CustomSelect
                                label="Province"
                                name="province"
                                value={UserForm.values.province}
                                onChange={UserForm.handleChange}
                                options={provincelist.data?.data.data?.map(province => ({
                                    value: province._id,
                                    label: province.province_name
                                })) || []}
                                error={UserForm.errors.province && UserForm.touched.province}
                                helperText={UserForm.touched.province ? UserForm.errors.province : ''}
                                disabled={!UserForm.values.country}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <CustomSelect
                                label="City"
                                name="city"
                                value={UserForm.values.city}
                                onChange={UserForm.handleChange}
                                options={cityList.data?.data.data?.map(city => ({
                                    value: city._id,
                                    label: city.city_name
                                })) || []}
                                error={UserForm.errors.city && UserForm.touched.city}
                                helperText={UserForm.touched.city ? UserForm.errors.city : ''}
                                disabled={!UserForm.values.country || !UserForm.values.province}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <CustomSelect
                                label="Police Station Name"
                                name="police_unit_id"
                                value={UserForm.values.police_unit_id}
                                onChange={UserForm.handleChange}
                                options={policeStationList.data?.data.map(police => ({
                                    value: police._id,
                                    label: police.police_unit_name
                                })) || []}
                                error={UserForm.errors.police_unit_id}
                                helperText={UserForm.errors.police_unit_id}
                                 disabled={!UserForm.values.city}
                            />
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
                                    value={UserForm.values.suburb}
                                    onChange={UserForm.handleChange}
                                />
                                {UserForm.touched.suburb && <div style={{ color: 'red', fontSize: 12 }}>{UserForm.errors.suburb}</div>}
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
                                    value={UserForm.values.street}
                                    onChange={UserForm.handleChange}
                                />
                                {UserForm.touched.street && <div style={{ color: 'red', fontSize: 12 }}>{UserForm.errors.street}</div>}
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
                                    value={UserForm.values.postal_code}
                                    onChange={UserForm.handleChange}
                                />
                                {UserForm.touched.postal_code && <div style={{ color: 'red', fontSize: 12 }}>{UserForm.errors.postal_code}</div>}
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
                                    disabled={newUser.isPending}
                                    sx={{ width: 130, height: 48, borderRadius: '10px', backgroundColor: 'var(--Blue)' }}
                                >
                                    {newUser.isPending ? <Loader color="white" /> : "Save"}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>
            </form>
        </Box >

    );
};

export default AddSapsMember;