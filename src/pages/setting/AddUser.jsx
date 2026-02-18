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
import { useGetCountryList, useGetProvinceList, useGetRoles, useCreateAdmin, useGetCityList, useRegister } from "../../API Calls/API";
import CloseIcon from "@mui/icons-material/Close";
import { profileValidation_s } from "../../common/FormValidation";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query"


const AddUser = () => {
    const [open, setOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const client = useQueryClient()
    const [role, setRole] = useState()

    // ✅ Formik setup
    const profileForm = useFormik({
        initialValues: {
            first_name: "",
            last_name: "",
            email: "",
            mobile_no: "",
            mobile_no_country_code: "+91",
            country: "",
            province: "",
            city: "",
            suburb: "",
            street: "",
            roleId: '',
            postal_code: "",
            fullImage: "",
            password: "",
            role: "",
            type: "email_pass"
        },
        validationSchema: profileValidation_s,
        onSubmit: (values) => {
            const formData = new FormData();
            Object.keys(values).forEach((key) => {
                if (key !== "fullImage") {
                    formData.append(key, values[key]);
                }
            });
            if (values.fullImage && values.fullImage instanceof File) {
                formData.append("fullImage", values.fullImage);
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
        // client.invalidateQueries("AdminUsers")
        setOpen(false)
        toast.success("User Created Successfully.");
    };

    const onError = (error) => {
        console.error("API Error:", error);
        toast.error(error?.response?.data?.message || "Something went wrong");
    };
    const { mutate } = useRegister(onSuccess, onError)
    const roleOptions =
        roles?.data?.data?.map((role) => ({
            label: role.name || role.roleName,
            value: role._id, // Fixed: use _id instead of id
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
                            </Grid>

                            {/* Last Name */}
                            <Grid size={{ xs: 12, sm: 6 }}>
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
                                        value={profileForm.values.mobile_no}
                                        onChange={(phone, countryData) => {
                                            profileForm.setFieldValue("mobile_no", phone);
                                            profileForm.setFieldValue("mobile_no_country_code", `+${countryData.dialCode}`);
                                        }}
                                        inputStyle={{
                                            width: '100%',
                                            height: '46px',
                                            borderRadius: '6px',
                                            border: '1px solid #E0E3E7',
                                        }}
                                        containerStyle={{
                                            height: '46px',
                                            width: '100%',
                                            marginBottom: '8px'
                                        }}
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
                                        const selectedRole = roleOptions.find(role => role.value === e.target.value);
                                        setRole(selectedRole?.label || '');
                                        profileForm.setFieldValue("role", selectedRole?.label || '');
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
                                    <InputLabel shrink htmlFor="street" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                        Street
                                    </InputLabel>
                                    <BootstrapInput
                                        id="street"
                                        name="street"
                                        placeholder="Street"
                                        value={profileForm.values.street}
                                        onChange={profileForm.handleChange}
                                    />
                                    {profileForm.touched.street && <FormHelperText error>{profileForm.errors.street}</FormHelperText>}
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>

                                <FormControl variant="standard" fullWidth >
                                    <InputLabel shrink htmlFor="postal_code" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                        Postal Code
                                    </InputLabel>
                                    <BootstrapInput
                                        id="postal_code"
                                        name="postal_code"
                                        placeholder="Postal Code"
                                        value={profileForm.values.postal_code}
                                        onChange={profileForm.handleChange}
                                    />
                                    {profileForm.touched.postal_code && <FormHelperText error>{profileForm.errors.postal_code}</FormHelperText>}
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
                                            name="fullImage"
                                            onChange={(e) =>
                                                profileForm.setFieldValue(
                                                    "fullImage",
                                                    e.currentTarget.files[0]
                                                )
                                            }
                                        />
                                        {profileForm.values.fullImage ? (
                                            <img
                                                src={URL.createObjectURL(profileForm.values.fullImage)}
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
