import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { toast } from "react-toastify";
import { toastOption } from "../../common/ToastOptions";
import { Box, Paper, Grid, Typography, FormControl, InputLabel, IconButton, Button, FormHelperText } from "@mui/material";
import { BootstrapInput } from "../../common/BootstrapInput";
import { sales_agent_e } from "../../common/FormValidation";

import { useFormik } from "formik";

import { useCreateSalesAgent } from "../../API Calls/API";
import { useQueryClient } from "@tanstack/react-query";
import CustomSelect from '../../common/Custom/CustomSelect'
import Loader from "../../common/Loader";
import PhoneInput from "react-phone-input-2";

const AddAgent = () => {
    const client = useQueryClient();
    const [role] = useState(localStorage.getItem("role"));
    const nav = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const generateReferralCode = () => {
        const prefix = "cgc"; // fixed prefix
        const randomStr = Math.random().toString(36).substring(2, 8); // random 6 chars
        return prefix + randomStr;
    };
    const onSuccess = () => {
        toast.success("Sales Agent added successfully.");
        UserForm.resetForm();
        client.invalidateQueries("salesAgent");
        nav("/home/total-sales-agent");
    };
    const UserForm = useFormik({
        initialValues: formValues1,
        validationSchema: sales_agent_e,
        onSubmit: (values) => {
            if (!values.referralCode) {
                values.referralCode = generateReferralCode();
            }
            newAgent.mutate(values); // send plain JSON
        },
    });

    const onError = (error) => {
        toast.error(error.response?.data?.message || "Something went wrong", toastOption);
    };
    const handleCancel = () => {
        nav("/home/total-sales-agent");
    };
    const newAgent = useCreateSalesAgent(onSuccess, onError);

    return (
        <Box p={2}>
            <form onSubmit={UserForm.handleSubmit}>
                <Box elevation={0} sx={{ p: 3, borderRadius: '16px', mb: 3, backgroundColor: '#f7f9fb' }}>
                    <Grid container spacing={3}>
                        <Grid size={12}>
                            <Typography variant="h6" gutterBottom fontWeight={600}>
                                Sales Agent Information
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
                                <label>Phone Number</label>
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
                                <InputLabel shrink htmlFor="enrollAmountDeduction" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                    Enroll Amount Deduction
                                </InputLabel>
                                <BootstrapInput
                                    id="enrollAmountDeduction"
                                    name="enrollAmountDeduction"
                                    type="number"
                                    placeholder="Enter Enroll Amount Deduction"
                                    value={UserForm.values.enrollAmountDeduction}
                                    onChange={UserForm.handleChange}
                                />
                                {UserForm.touched.enrollAmountDeduction && <FormHelperText error>{UserForm.errors.enrollAmountDeduction}</FormHelperText>}
                            </FormControl>
                        </Grid>

                        <Grid size={12} sx={{ mt: 1 }}>
                            <Box display="flex" justifyContent="flex-end" gap={2}>
                                <Button variant="outlined" sx={{ width: 130, height: 48, borderRadius: '10px', color: 'black', borderColor: '#E0E3E7' }} onClick={handleCancel}>
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={newAgent.isPending}
                                    sx={{ width: 130, height: 48, borderRadius: '10px', backgroundColor: 'var(--Blue)' }}
                                >
                                    {newAgent.isPending ? <Loader color="white" /> : "Save"}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </form>
        </Box>
    );
};

export default AddAgent;



const formValues1 = {
    referralCode: "",
    enrollAmountDeduction: "",
    password: "",
    first_name: "",
    last_name: "",
    email: "",
    mobile_no: "",
    mobile_no_country_code: "",
}

