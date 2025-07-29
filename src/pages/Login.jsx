import logo3 from "../assets/images/logo3.svg";

import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { loginValidation } from "../common/FormValidation";
import { toast } from "react-toastify";
import { toastOption } from "../common/ToastOptions";
import Loader from "../common/Loader";
import { useUserLogin } from "../API Calls/API";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useState } from "react";

export const Login = () => {
    const nav = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword((prevShowPassword) => !prevShowPassword);
    };

    const loginForm = useFormik({
        initialValues: {
            email: '',
            password: '',
            fcm_token: "fcm_token"
        },
        validationSchema: loginValidation,
        onSubmit: (values) => loginfn.mutate(values),
    });

    const onError = (error) => {
        toast.error(error.response.data.message || "Something went Wrong", toastOption);
    };
    const onSuccess = (res) => {
        toast.success("Logged In successfully.");
        localStorage.clear();
        localStorage.setItem("accessToken", res.data.accessToken);
        localStorage.setItem("userID", res.data.user._id);
        localStorage.setItem("role", res.data.user.role);
        nav("/home");
    };

    const loginfn = useUserLogin(onSuccess, onError);

    return (
        <div className="login-page">
            <div className="container">
                <div className="row">
                    <div className="col-md-12  d-flex justify-content-center align-items-center">
                        <div className="login-box shadow p-4 rounded bg-white col-sm-12 col-md-8 col-lg-5">
                            <div className="login-logo">
                                <img src={logo3} alt="logo" />
                            </div>
                            <h6 className="text-center  mb-4"
                                style={{ color: "#4B5563" }}>Log in to stay safe and connected</h6>
                            <form onSubmit={loginForm.handleSubmit}>
                                <div className="mb-0">
                                    <label htmlFor="email" style={{ paddingLeft: '5px' }} className="form-label text-dark">
                                        Email or Username
                                    </label>
                                    <input
                                        type="text"
                                        id="email"
                                        name="email"
                                        value={loginForm.values.email}
                                        onChange={loginForm.handleChange}
                                        className="form-control placeholder-gray"
                                        placeholder="Enter your email"
                                    />

                                    {loginForm.touched.email && (
                                        <p className="err">{loginForm.errors.email}</p>
                                    )}
                                </div>

                                <div className="password-field">
                                    <label htmlFor="password" style={{ paddingLeft: '5px' }} className="form-label text-dark">
                                        Password
                                    </label>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={loginForm.values.password}
                                        onChange={loginForm.handleChange}
                                        className="form-control placeholder-gray"
                                        placeholder="Password"
                                    />
                                    <span onClick={togglePasswordVisibility} className="password-toggle-icon">
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </span>
                                </div>
                                {loginForm.touched.password && <p className="err">{loginForm.errors.password}</p>}

                                <div className="forgotpwd text-end">
                                    <a href="#">Forgot Password?</a>
                                </div>

                                <button
                                    disabled={loginfn.isPending}
                                    type="submit"
                                    className="btn btn-primary d-block w-100"
                                    style={{ backgroundColor: '#367BE0' }}
                                >
                                    {loginfn.isPending ? <Loader color="white" /> : "Log In"}
                                </button>


                                {/* <div className="keep-signed">
                                    <input type="checkbox" id="signin" />
                                    <label htmlFor="signin">Keep me signed in</label>
                                </div> */}
                            </form>
                        </div>
                    </div>
                    {/* <div className="col-md-12 text-center">
                        <div className="copyright">
                            <p>&copy; 2025 Thiba Ingozi</p>
                        </div>
                    </div> */}
                </div>
            </div>
        </div>
    );
};