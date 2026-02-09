import logo3 from "../assets/images/logo3.svg";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { loginValidation_salesAgent } from "../common/FormValidation";
import { toast } from "react-toastify";
import { toastOption } from "../common/ToastOptions";
import Loader from "../common/Loader";
import { useUserLogin, useGetPermissionsByRoleId } from "../API Calls/API";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useState, useEffect } from "react";
import TwoFactorAuth from "../components/TwoFactorAuth";
import ForgotPassword from "../components/ForgotPassword";

export const Login = () => {
    const nav = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [show2FA, setShow2FA] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [tempToken, setTempToken] = useState('');
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [roleId, setRoleId] = useState(null);

    const { data: permissionsData, isLoading: permissionsLoading } = useGetPermissionsByRoleId(roleId);

    console.log("permissionsData:", permissionsData);
    console.log("permissionsLoading:", permissionsLoading);

    // Handle permissions data when it arrives
    useEffect(() => {
        console.log("permissionsData in useEffect:", permissionsData);
        console.log("permissionsData structure:", JSON.stringify(permissionsData, null, 2));
        
        if (permissionsData) {
            if (permissionsData.data) {
                console.log("permissionsData.data:", permissionsData.data);
                if (permissionsData.data.success && permissionsData.data.data.permissions) {
                    console.log("Found permissions array:", permissionsData.data.data.permissions);
                    // Store only active permissions
                    const activePermissions = permissionsData.data.data.permissions
                        .filter(permission => permission.status === 'active')
                        .map(permission => permission.name);
                    localStorage.setItem("userPermissions", JSON.stringify(activePermissions));
                    console.log("Stored permissions:", activePermissions);
                    
                    // Also log current localStorage for verification
                    const storedPermissions = localStorage.getItem("userPermissions");
                    console.log("Current localStorage permissions:", storedPermissions);
                } else {
                    console.warn("Permissions API response structure unexpected:", permissionsData.data);
                }
            } else if (permissionsData.error) {
                console.error("Permissions API error:", permissionsData.error);
            }
        }
    }, [permissionsData]);

    const togglePasswordVisibility = () => {
        setShowPassword((prevShowPassword) => !prevShowPassword);
    };

    const loginForm = useFormik({
        initialValues: {
            email: "",
            password: "",
            isWeb: true

        },
        validationSchema: loginValidation_salesAgent,
        onSubmit: (values) => {
            loginfn.mutate(values);
        },
    });

    const onError = (error) => {
        toast.error(error.response.data.message || "Something went Wrong", toastOption);
    };
    const onSuccess = (res) => {
        if (res.data.requires2FA) {
            setTempToken(res.data.tempToken);
            setLoginData({ email: loginForm.values.email, password: loginForm.values.password, isWeb: loginForm.values.isWeb });
            setShow2FA(true);
        } else {
            handleLoginSuccess(res);
        }
    };

    const handleLoginSuccess = (res) => {
        toast.success("Logged In successfully.");
        console.log(res, "res");
        localStorage.clear();
        localStorage.setItem("accessToken", res.data.accessToken);
        localStorage.setItem('currentlat', res.data.user.current_lat);
        localStorage.setItem('currentlong', res.data.user.current_long);
        localStorage.setItem("userID", res.data.user._id);
        localStorage.setItem("userName", res.data.user.first_name + " " + res.data.user.last_name);
        localStorage.setItem("role", res.data.user.role);
        localStorage.setItem("selfiImage", res.data.user.selfieImage);
        localStorage.setItem("contact_name", res.data.user.contact_name);
        localStorage.setItem("roleId", res.data.user.roleId);
        
        // Set roleId to trigger permissions fetch
        if (res.data.user.roleId) {
            console.log("Setting roleId:", res.data.user.roleId);
            setRoleId(res.data.user.roleId);
            
            // Delay navigation to allow permissions to be fetched
            setTimeout(() => {
                if (res.data.role === "sales_agent") {
                    nav("/sales-home", { state: { from: "login" } });
                } else {
                    nav("/home", { state: { from: "login" } });
                }
            }, 1000); // 1 second delay
        } else {
            // Navigate immediately if no roleId
            if (res.data.role === "sales_agent") {
                nav("/sales-home", { state: { from: "login" } });
            } else {
                nav("/home", { state: { from: "login" } });
            }
        }
    };

    const handle2FABack = () => {
        setShow2FA(false);
        loginForm.resetForm();
    };

    const loginfn = useUserLogin(onSuccess, onError);

    return (
        <div className="login-page">
            <div className="container">
                <div className="row">
                    <div className="col-md-12  d-flex justify-content-center align-items-center">
                        {show2FA ? (
                            <TwoFactorAuth
                                tempToken={tempToken}
                                email={loginData.email}
                                onVerificationSuccess={handleLoginSuccess}
                                onBack={handle2FABack}
                            />
                        ) : showForgotPassword ? (
                            <ForgotPassword onBack={() => setShowForgotPassword(false)} />
                        ) : (
                            <div className="login-box shadow p-4 rounded bg-white col-sm-12 col-md-8 col-lg-5">
                                <div className="login-logo">
                                    <img src={logo3} alt="logo" />
                                </div>
                                <h6 className="text-center  mb-4"
                                    style={{ color: "#4B5563", fontWeight: 400 }}>Log in to stay safe and connected</h6>
                                <form onSubmit={loginForm.handleSubmit}>
                                    <div className="mb-0">
                                        <label htmlFor="email" style={{ paddingLeft: '5px', fontWeight: 500 }} className="form-label text-dark">
                                            Email or Username
                                        </label>
                                        <input
                                            type="text"
                                            id="email"
                                            name="email"
                                            value={loginForm.values.email}
                                            onChange={loginForm.handleChange}
                                            className="form-control placeholder-gray"
                                            placeholder="Enter your email or username"
                                        />

                                        {loginForm.touched.email && (
                                            <p className="err">{loginForm.errors.email}</p>
                                        )}
                                    </div>

                                    <div className="password-field">
                                        <label htmlFor="password" style={{ paddingLeft: '5px', fontWeight: 500 }} className="form-label text-dark">
                                            Password
                                        </label>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={loginForm.values.password}
                                            onChange={loginForm.handleChange}
                                            className="form-control placeholder-gray"
                                            placeholder="Enter your password"
                                        />
                                        <span onClick={togglePasswordVisibility} className="password-toggle-icon">
                                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                                        </span>
                                    </div>
                                    {loginForm.touched.password && <p className="err">{loginForm.errors.password}</p>}

                                    <div className="forgotpwd text-end">
                                        <span role="button" className="text-primary cursor-pointer" onClick={() => setShowForgotPassword(true)} style={{ cursor: "pointer" }}>
                                            Forgot Password?
                                        </span>
                                    </div>

                                    <button
                                        disabled={loginfn.isPending}
                                        type="submit"
                                        className="btn btn-primary d-block w-100"
                                        style={{ backgroundColor: '#367BE0', fontWeight: 700 }}
                                    >
                                        {loginfn.isPending ? <Loader color="white" /> : "Log In"}
                                    </button>


                                    {/* <div className="keep-signed">
                                        <input type="checkbox" id="signin" />
                                        <label htmlFor="signin">Keep me signed in</label>
                                    </div> */}
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};