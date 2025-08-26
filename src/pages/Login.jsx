import log_1 from "../assets/images/logo-1.png";
import {
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio
} from "@mui/material";
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
            email: "",
            password: "",
            fcm_token: "fcm_token",
            role: "sales_agent",
        },
        validationSchema: loginValidation,
        onSubmit: (values) => {
            let payload = { ...values };

            // ❌ remove role if not sales_agent
            if (values.role !== "sales_agent") {
                delete payload.role;
            }
            loginfn.mutate(payload);
        },
    });

    const onError = (error) => {
        toast.error(error.response.data.message || "Something went Wrong", toastOption);
    };
    const onSuccess = (res) => {
        toast.success("Logged In successfully.");
        localStorage.clear();
        localStorage.setItem("accessToken", res.data.accessToken);
        localStorage.setItem('currentlat', res.data.user.current_lat)
        localStorage.setItem('currentlong', res.data.user.current_long)
        localStorage.setItem("userID", res.data.user._id);
        res.data.user.role ? localStorage.setItem("role", res.data.user.role) : localStorage.setItem('role', 'sales_agent');
        if(res.data.user.role){
            nav("/home");
        } else {
           nav('/sales-home') 
        }
    };

    const loginfn = useUserLogin(onSuccess, onError);

    return (
        <div className="login-page">
            <div className="container">
                <div className="row">
                    <div className="col-lg-8 col-md-10 offset-lg-2 offset-md-1">
                        <div className="login-box">
                            <div className="login-logo">
                                <img src={log_1} alt="logo" />
                            </div>
                            <h1 className="text-center">Sign In</h1>
                            <form onSubmit={loginForm.handleSubmit}>
                                <FormControl component="fieldset" className="my-3">
                                    <FormLabel component="legend">Select Role</FormLabel>
                                    <RadioGroup
                                        row
                                        name="role"
                                        value={loginForm.values.role}
                                        onChange={loginForm.handleChange}
                                    >
                                        <FormControlLabel
                                            value="sales_agent"
                                            control={<Radio />}
                                            label="Sales Agent"
                                        />
                                        <FormControlLabel
                                            value="super_admin"
                                            control={<Radio />}
                                            label="Super Admin / Company Admin"
                                        />
                                    </RadioGroup>
                                </FormControl>
                                <input
                                    type="text"
                                    name="email"
                                    value={loginForm.values.email}
                                    onChange={loginForm.handleChange}
                                    className="form-control"
                                    placeholder="Email"
                                />
                                {loginForm.touched.email && <p className="err">{loginForm.errors.email}</p>}

                                <div className="password-field">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={loginForm.values.password}
                                        onChange={loginForm.handleChange}
                                        className="form-control"
                                        placeholder="Password"
                                    />
                                    <span onClick={togglePasswordVisibility} className="password-toggle-icon">
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </span>
                                </div>
                                {loginForm.touched.password && <p className="err">{loginForm.errors.password}</p>}

                                {/* <div className="forgotpwd text-end">
                                    <a href="#">Forgot Password?</a>
                                </div> */}



                                <button disabled={loginfn.isPending} type="submit" className="btn btn-dark d-block">
                                    {loginfn.isPending ? <Loader color="white" /> : "Sign In"}
                                </button>

                                {/* <div className="keep-signed">
                                    <input type="checkbox" id="signin" />
                                    <label htmlFor="signin">Keep me signed in</label>
                                </div> */}
                            </form>
                        </div>
                    </div>
                    <div className="col-md-12 text-center">
                        <div className="copyright">
                            <p>&copy; 2025 Thiba Ingozi</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};