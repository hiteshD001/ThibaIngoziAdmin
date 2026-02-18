/* eslint-disable react/prop-types */
import { useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { toast } from "react-toastify";
import { useForgotPassword, useVerifyCode, useResetPasswordByCode } from "../API Calls/API";
import Loader from "../common/Loader";
import { toastOption } from "../common/ToastOptions";
import { resetPasswordValidation } from "../common/FormValidation";
import logo3 from "../assets/images/logo3.svg";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const ForgotPassword = ({ onBack }) => {
    const [step, setStep] = useState(1); // 1: Email, 2: Code, 3: Reset
    const [email, setEmail] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // API Hooks
    const forgotPassword = useForgotPassword(
        (res) => {
            toast.success(res.data.message || "Verification code sent to your email", toastOption);
            setStep(2);
        },
        (err) => toast.error(err.response?.data?.message || "Failed to send code", toastOption)
    );

    const verifyCode = useVerifyCode(
        (res) => {
            toast.success(res.data.message || "Code verified successfully", toastOption);
            setStep(3);
        },
        (err) => toast.error(err.response?.data?.message || "Invalid verification code", toastOption)
    );

    const resetPassword = useResetPasswordByCode(
        (res) => {
            toast.success(res.data.message || "Password reset successfully", toastOption);
            onBack(); // Go back to login
        },
        (err) => toast.error(err.response?.data?.message || "Failed to reset password", toastOption)
    );

    // Form 1: Email
    const emailForm = useFormik({
        initialValues: { email: "" },
        validationSchema: yup.object({ email: yup.string().email("Invalid email").required("Email is required") }),
        onSubmit: (values) => {
            setEmail(values.email);
            forgotPassword.mutate({ email: values.email });
        },
    });

    // Form 2: Code
    const codeForm = useFormik({
        initialValues: { code: "" },
        validationSchema: yup.object({
            code: yup.string().required("Code is required").length(4, "Code must be 4 digits")
        }),
        onSubmit: (values) => {
            verifyCode.mutate({ email, code: values.code });
        },
    });

    // Form 3: Reset Password
    const resetForm = useFormik({
        initialValues: { password: "", confirmPassword: "" },
        validationSchema: resetPasswordValidation,
        onSubmit: (values) => {
            resetPassword.mutate({ email, newPassword: values.password });
        },
    });

    return (
        <div className="login-box shadow p-4 rounded bg-white col-sm-12 col-md-8 col-lg-5">
            <div className="login-logo text-center">
                <img src={logo3} alt="logo" />
            </div>
            <h6 className="text-center mb-4" style={{ color: "#4B5563", fontWeight: 400 }}>
                {step === 1 ? "Forgot Password" : step === 2 ? "Enter Verification Code" : "Reset Password"}
            </h6>

            {step === 1 && (
                <form onSubmit={emailForm.handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label text-dark" style={{ fontWeight: 500 }}>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            className="form-control"
                            placeholder="Enter your email"
                            value={emailForm.values.email}
                            onChange={emailForm.handleChange}
                            onBlur={emailForm.handleBlur}
                        />
                        {emailForm.touched.email && emailForm.errors.email && (
                            <div className="text-danger small">{emailForm.errors.email}</div>
                        )}
                    </div>
                    <button type="submit" className="btn btn-primary d-block w-100" style={{ backgroundColor: '#367BE0', fontWeight: 700 }} disabled={forgotPassword.isPending}>
                        {forgotPassword.isPending ? <Loader color="white" /> : "Send Code"}
                    </button>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={codeForm.handleSubmit}>
                    <p className="text-center small">Enter the 4-digit code sent to <strong>{email}</strong></p>
                    <div className="mb-3">
                        <label className="form-label text-dark" style={{ fontWeight: 500 }}>Verification Code</label>
                        <input
                            type="text"
                            name="code"
                            className="form-control text-center"
                            placeholder="0000"
                            maxLength={4}
                            value={codeForm.values.code}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, ''); // only numbers
                                codeForm.setFieldValue("code", val);
                            }}
                            onBlur={codeForm.handleBlur}
                        />
                        {codeForm.touched.code && codeForm.errors.code && (
                            <div className="text-danger small">{codeForm.errors.code}</div>
                        )}
                    </div>
                    <button type="submit" className="btn btn-primary d-block w-100" style={{ backgroundColor: '#367BE0', fontWeight: 700 }} disabled={verifyCode.isPending}>
                        {verifyCode.isPending ? <Loader color="white" /> : "Verify Code"}
                    </button>
                    <div className="text-center mt-2">
                        <button type="button" className="btn d-block w-100" onClick={() => setStep(1)} style={{ backgroundColor: 'transparent', border: '1px solid #367BE0', color: '#367BE0', fontWeight: 700 }}>
                            Change Email
                        </button>
                    </div>
                </form>
            )}

            {step === 3 && (
                <form onSubmit={resetForm.handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label text-dark" style={{ fontWeight: 500 }}>New Password</label>
                        <div className="position-relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                className="form-control"
                                placeholder="Enter new password"
                                value={resetForm.values.password}
                                onChange={resetForm.handleChange}
                                onBlur={resetForm.handleBlur}
                            />
                            <span
                                className="position-absolute end-0 top-50 translate-middle-y me-3 cursor-pointer"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ cursor: 'pointer' }}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                        {resetForm.touched.password && resetForm.errors.password && (
                            <div className="text-danger small">{resetForm.errors.password}</div>
                        )}
                    </div>
                    <div className="mb-3">
                        <label className="form-label text-dark" style={{ fontWeight: 500 }}>Confirm Password</label>
                        <div className="position-relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                className="form-control"
                                placeholder="Confirm new password"
                                value={resetForm.values.confirmPassword}
                                onChange={resetForm.handleChange}
                                onBlur={resetForm.handleBlur}
                            />
                            <span
                                className="position-absolute end-0 top-50 translate-middle-y me-3 cursor-pointer"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={{ cursor: 'pointer' }}
                            >
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                        {resetForm.touched.confirmPassword && resetForm.errors.confirmPassword && (
                            <div className="text-danger small">{resetForm.errors.confirmPassword}</div>
                        )}
                    </div>
                    <button type="submit" className="btn btn-primary d-block w-100" style={{ backgroundColor: '#367BE0', fontWeight: 700 }} disabled={resetPassword.isPending}>
                        {resetPassword.isPending ? <Loader color="white" /> : "Reset Password"}
                    </button>
                </form>
            )}

            <div className="text-center mt-3">
                <button className="btn btn-link text-decoration-none" onClick={onBack} style={{ color: '#6B7280' }}>
                    Back to Login
                </button>
            </div>
        </div>
    );
};

export default ForgotPassword;
