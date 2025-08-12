import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useGetCompanyList, useChangePassword } from "../API Calls/API";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { toast } from "react-toastify";
import { toastOption } from "../common/ToastOptions";

import { useFormik } from "formik";
import { changePasswordValidation } from "../common/FormValidation";
import CustomSelect from "../common/Custom/CustomSelect";
import "../css/reset-password.css";
import { BootstrapInput } from "../common/BootstrapInput";
import { Box, Paper, Grid, FormControl, InputLabel, IconButton, Button, Typography } from "@mui/material";

const ChangePassword = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showconfirmpass, setshowconfirmpass] = useState(false);
    const [p] = useSearchParams()
    const [resetSuccessful, setResetSuccessful] = useState(false);
    // const companyList = useGetUserList("company list", "company");
    const companyList = useGetCompanyList("company list", "company");
    const changePasswordForm = useFormik({
        initialValues: {
            company_id: "",
            newPassword: "",
            confirmPassword: ""
        },
        validationSchema: changePasswordValidation,
        onSubmit: (val) => {
            if (!val.company_id) {
                toast.error("Please select a company", toastOption);
                return;
            }
            changePassword.mutate({
                newPassword: val.newPassword,
                user_id: val.company_id
            });
        }
    })


    const changePassword = useChangePassword(
        (data) => {
            setResetSuccessful(true);
            toast.success(data.data.message, toastOption);
            changePasswordForm.resetForm();
        },
        (error) => toast.error(error.response?.data?.message || "Error", toastOption)
    );

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '90vh' }}>
            <Paper
                elevation={3}
                sx={{ backgroundColor: "rgb(253, 253, 253)", p: 4, maxWidth: 500, borderRadius: "10px" }}
            >
                <Grid container spacing={3}>
                    <Grid size={12}>
                        <Typography textAlign={'center'} variant="h6" fontWeight={550} color="initial">
                            Change Password
                        </Typography>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <CustomSelect
                            label="Select Company"
                            name="company_id"
                            value={changePasswordForm.values.company_id}
                            onChange={changePasswordForm.handleChange}
                            options={companyList.data?.data.users.map(user => ({
                                value: user._id,
                                label: user.company_name
                            })) || []}
                            error={changePasswordForm.errors.company_id}
                            helperText={changePasswordForm.errors.company_id}
                        />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <FormControl variant="standard" fullWidth sx={{ position: 'relative' }}>
                            <InputLabel shrink htmlFor="newPassword" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                New Password
                            </InputLabel>

                            <BootstrapInput
                                id="newPassword"
                                name="newPassword"
                                placeholder="Enter New Password"
                                type={showPassword ? "text" : "password"}
                                value={changePasswordForm.values.newPassword}
                                onChange={changePasswordForm.handleChange}
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

                            {changePasswordForm.touched.password && <div style={{ color: 'red', fontSize: 12 }}>{changePasswordForm.errors.password}</div>}
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <FormControl variant="standard" fullWidth sx={{ position: 'relative' }}>
                            <InputLabel shrink htmlFor="confirmPassword" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                Confirm Password
                            </InputLabel>

                            <BootstrapInput
                                id="confirmPassword"
                                name="confirmPassword"
                                placeholder="Confirm new password"
                                type={showconfirmpass ? "text" : "password"}
                                value={changePasswordForm.values.confirmPassword}
                                onChange={changePasswordForm.handleChange}
                                style={{ paddingRight: 0 }}
                            />
                            <IconButton
                                onClick={() => setshowconfirmpass(!showconfirmpass)}
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
                                {showconfirmpass ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                            </IconButton>

                            {changePasswordForm.touched.password && <div style={{ color: 'red', fontSize: 12 }}>{changePasswordForm.errors.password}</div>}
                        </FormControl>
                    </Grid>

                    <Grid size={12}>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={changePassword.isPending}
                            sx={{ width: '100%', height: 48, borderRadius: '10px', backgroundColor: 'var(--Blue)' }}
                        >
                            {changePassword.isPending ? <Loader color="white" /> : "Submit"}
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </Box>

    );
};

export default ChangePassword;