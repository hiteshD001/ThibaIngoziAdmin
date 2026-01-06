import React, { useState } from "react";
import {
    Box, Button, Typography, Dialog, DialogContent, DialogTitle, Grid, FormControl, InputLabel, FormHelperText, IconButton
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useFormik } from "formik";
import { BootstrapInput } from "../../common/BootstrapInput";
import CustomSelect from "../../common/Custom/CustomSelect";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import whitePlus from "../../assets/images/whiteplus.svg";
import GrayPlus from "../../assets/images/GrayPlus.svg";
import { useGetCountryList, useGetProvinceList, useGetRoles, useCreateAdmin, useGetCityList } from "../../API Calls/API";
import CloseIcon from "@mui/icons-material/Close";
import {profileValidation_s } from "../../common/FormValidation";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query"


const AddUser = () => {
    const [open, setOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const client = useQueryClient()

    // ✅ Formik setup
    const profileForm = useFormik({
        initialValues: {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            countryCode: "+91",
            country: "",
            province: "",
            city: "",
            suburb: "",
            streetAddress: "",
            roleId: '',
            postalCode: "",
            profile_img: "",
            password: ""
        },
        validationSchema: profileValidation_s,
        onSubmit: (values) => {
            const formData = new FormData();
            Object.keys(values).forEach((key) => {
                if (key !== "profile_img") {
                    formData.append(key, values[key]);
                }
            });
            if (values.profile_img && values.profile_img instanceof File) {
                formData.append("profile_img", values.profile_img);
            }
            mutate(formData);
        },
    });
    const countrylist = useGetCountryList();
    const cityList = useGetCityList(profileForm.values.province)
    const provincelist = useGetProvinceList(profileForm.values.country);
    const { data: roles, isLoading, isError } = useGetRoles(1, 10000);
    const onSuccess = () => {
        profileForm.resetForm();
        client.invalidateQueries("AdminUsers")
        setOpen(false)
        toast.success("User Created Successfully.");
    };

    const onError = (error) => {
        toast.error(error?.response?.data?.message || "Something went wrong");
    };
    const { mutate } = useCreateAdmin(onSuccess, onError)
    const roleOptions =
        roles?.data?.data?.map((role) => ({
            label: role.name || role.roleName,
            value: role.id,
            description: role.description || "",
        })) || [];

    return (
        <>
            {/* Add User Button */}
            <Button
                startIcon={<img src={whitePlus} alt="add user icon" />}
                size="small"
                sx={{
                    height: "40px",
                    color: "white",
                    width: "150px",
                    borderRadius: "8px",
                    backgroundColor: "var(--Blue)",
                    cursor: "pointer",
                }}
                onClick={() => setOpen(true)}
            >
                Add User
            </Button>

            {/* Add User Modal */}
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle
                    sx={{
                        fontWeight: 600,
                        color: "rgba(0,0,0,0.8)",
                        borderBottom: "1px solid #E5E7EB",
                        mb: 2,
                        p: 1,
                        px: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    Create New Admin User
                    <IconButton
                        onClick={() => setOpen(false)}
                        sx={{
                            color: "#6B7280",
                            "&:hover": { color: "#000" },
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>


                <DialogContent>
                    <form onSubmit={profileForm.handleSubmit}>
                        <Grid container spacing={2}>
                            {/* First Name */}
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <FormControl variant="standard" fullWidth >
                                    <InputLabel shrink htmlFor="firstName" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                        First Name
                                    </InputLabel>
                                    <BootstrapInput
                                        id="firstName"
                                        name="firstName"
                                        placeholder="First Name"
                                        value={profileForm.values.firstName}
                                        onChange={profileForm.handleChange}
                                    />
                                    {profileForm.touched.firstName && <FormHelperText error>{profileForm.errors.firstName}</FormHelperText>}
                                </FormControl>
                            </Grid>

                            {/* Last Name */}
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <FormControl variant="standard" fullWidth >
                                    <InputLabel shrink htmlFor="lastName" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                        Last Name
                                    </InputLabel>
                                    <BootstrapInput
                                        id="lastName"
                                        name="lastName"
                                        placeholder="Last Name"
                                        value={profileForm.values.lastName}
                                        onChange={profileForm.handleChange}

                                    />
                                    {profileForm.touched.lastName && <FormHelperText error>{profileForm.errors.lastName}</FormHelperText>}
                                </FormControl>
                            </Grid>

                            {/* Email */}
                            <Grid size={{ xs: 12, sm: 6 }}>
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
                            </Grid>

                            {/* Phone */}
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <FormControl variant="standard" fullWidth>
                                    <label style={{ marginBottom: 5 }}>Phone Number</label>
                                    <PhoneInput
                                        country={"za"}
                                        value={`${profileForm.values.countryCode ?? ''}${profileForm.values.phone ?? ''}`}
                                        onChange={(phone, countryData) => {
                                            const withoutCountryCode = phone.startsWith(countryData.dialCode)
                                                ? phone.slice(countryData.dialCode.length).trim()
                                                : phone;

                                            profileForm.setFieldValue("phone", withoutCountryCode);
                                            profileForm.setFieldValue("countryCode", `+${countryData.dialCode}`);
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
                                            name: 'phone',
                                            required: true,
                                            autoFocus: false
                                        }}
                                    />
                                    {profileForm.touched.phone && profileForm.errors.phone && (
                                        <FormHelperText error>{profileForm.errors.phone}</FormHelperText>
                                    )}
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <FormControl variant="standard" fullWidth >
                                    <InputLabel shrink htmlFor="password" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                        Password
                                    </InputLabel>
                                    {/* <Box sx={{ position: "relative" }}> */}
                                    <BootstrapInput
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter Password"
                                        value={profileForm.values.password}
                                        onChange={profileForm.handleChange}
                                    />
                                    <IconButton
                                        onClick={() => setShowPassword(!showPassword)}
                                        sx={{
                                            position: "absolute",
                                            right: 10,
                                            top: "70%",
                                            transform: "translateY(-50%)"
                                        }}
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                    {/* </Box> */}

                                    {profileForm.touched.password && <FormHelperText error>{profileForm.errors.password}</FormHelperText>}
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <CustomSelect
                                    label="Role"
                                    name="roleId"
                                    value={profileForm.values.roleId}
                                    onChange={(e) => {
                                        profileForm.setFieldValue("roleId", e.target.value);
                                    }}
                                    options={
                                        isLoading
                                            ? [{ label: "Loading...", value: "" }]
                                            : roleOptions.length > 0
                                                ? roleOptions?.map((role) => ({
                                                    value: role.value,
                                                    label: (
                                                        <Box sx={{ display: "flex", flexDirection: "column" }}>
                                                            <Typography sx={{ fontWeight: 450 }}>
                                                                {role.description ? role.description : role.label}
                                                            </Typography>
                                                        </Box>
                                                    ),
                                                }))
                                                : [{ label: "No Roles Found", value: "" }]
                                    }
                                    error={profileForm.touched.roleId && Boolean(profileForm.errors.roleId)}
                                    helperText={profileForm.touched.roleId && profileForm.errors.roleId}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                                        <CustomSelect
                                                            label="Country"
                                                            name="country"
                                                            value={profileForm.values.country}
                                                            onChange={profileForm.handleChange}
                                                            options={countrylist.data?.data.data?.map(country => ({
                                                                value: country._id,
                                                                label: country.country_name
                                                            })) || []}
                                                            error={profileForm.errors.country && profileForm.touched.country}
                                                            helperText={profileForm.errors.country}
                                                        />
                                                    </Grid>
                                                    <Grid size={{ xs: 12, sm: 6 }}>
                                                        <CustomSelect
                                                            label="Province"
                                                            name="province"
                                                            value={profileForm.values.province}
                                                            onChange={profileForm.handleChange}
                                                            options={provincelist.data?.data.data?.map(province => ({
                                                                value: province._id,
                                                                label: province.province_name
                                                            })) || []}
                                                            error={profileForm.errors.province && profileForm.touched.province}
                                                            helperText={profileForm.touched.province ? profileForm.errors.province : ''}
                                                            disabled={!profileForm.values.country}
                                                        />
                                                    </Grid>
                                                    <Grid size={{ xs: 12, sm: 6 }}>
                                                        <CustomSelect
                                                            label="City"
                                                            name="city"
                                                            value={profileForm.values.city}
                                                            onChange={profileForm.handleChange}
                                                            options={cityList.data?.data.data?.map(city => ({
                                                                value: city._id,
                                                                label: city.city_name
                                                            })) || []}
                                                            error={profileForm.errors.city && profileForm.touched.city}
                                                            helperText={profileForm.touched.city ? profileForm.errors.city : ''}
                                                            disabled={!profileForm.values.country || !profileForm.values.province}
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
                                        placeholder="Suburb"
                                        value={profileForm.values.suburb}
                                        onChange={profileForm.handleChange}
                                    />
                                    {profileForm.touched.suburb && <FormHelperText error>{profileForm.errors.suburb}</FormHelperText>}
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <FormControl variant="standard" fullWidth >
                                    <InputLabel shrink htmlFor="streetAddress" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                        Street
                                    </InputLabel>
                                    <BootstrapInput
                                        id="streetAddress"
                                        name="streetAddress"
                                        placeholder="Street"
                                        value={profileForm.values.streetAddress}
                                        onChange={profileForm.handleChange}
                                    />
                                    {profileForm.touched.streetAddress && <FormHelperText error>{profileForm.errors.streetAddress}</FormHelperText>}
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>

                                <FormControl variant="standard" fullWidth >
                                    <InputLabel shrink htmlFor="postalCode" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                        Postal Code
                                    </InputLabel>
                                    <BootstrapInput
                                        id="postalCode"
                                        name="postalCode"
                                        placeholder="Postal Code"
                                        value={profileForm.values.postalCode}
                                        onChange={profileForm.handleChange}
                                    />
                                    {profileForm.touched.postalCode && <FormHelperText error>{profileForm.errors.postalCode}</FormHelperText>}
                                </FormControl>
                            </Grid>

                            {/* Profile Image */}
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Grid size={{ sm: 12, md: 6 }}>
                                    <label
                                        style={{
                                            marginBottom: "10px",
                                            display: "block",
                                            fontWeight: 500,
                                        }}
                                    >
                                        Profile Image
                                    </label>
                                    <Box
                                        sx={{
                                            border: "2px dashed #E0E3E7",
                                            borderRadius: "12px",
                                            minHeight: 180,
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            cursor: "pointer",
                                            background: "#fafbfc",
                                        }}
                                        component="label"
                                    >
                                        <input
                                            type="file"
                                            accept="image/*"
                                            hidden
                                            name="profile_img"
                                            onChange={(e) =>
                                                profileForm.setFieldValue(
                                                    "profile_img",
                                                    e.currentTarget.files[0]
                                                )
                                            }
                                        />
                                        {profileForm.values.profile_img ? (
                                            <img
                                                src={URL.createObjectURL(profileForm.values.profile_img)}
                                                alt="Preview"
                                                style={{
                                                    height: 200,
                                                    width: "100%",
                                                    objectFit: "contain",
                                                }}
                                            />
                                        ) : (
                                            <>
                                                <img src={GrayPlus} alt="upload" />
                                                <Typography
                                                    sx={{ color: "#B0B0B0", fontWeight: 550, mt: 1 }}
                                                >
                                                    Upload
                                                </Typography>
                                            </>
                                        )}
                                    </Box>
                                </Grid>
                            </Grid>

                            {/* Buttons */}
                            <Grid size={{ xs: 12 }}>

                                <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
                                    <Button
                                        variant="outlined"
                                        sx={{
                                            width: 130,
                                            height: 48,
                                            borderRadius: "8px",
                                            color: "#878787",
                                            fontSize: "16px",
                                            border: "1px solid #D1D5DB",
                                        }}
                                        onClick={() => setOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        sx={{
                                            width: 130,
                                            height: 48,
                                            color: "white",
                                            borderRadius: "8px",
                                            backgroundColor: "var(--Blue)",
                                            fontSize: "16px",
                                        }}
                                    >
                                        Save User
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default AddUser;
