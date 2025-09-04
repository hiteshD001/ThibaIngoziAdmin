import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useResetPassword } from "../API Calls/API";

import { toast } from "react-toastify";
import { toastOption } from "../common/ToastOptions";

import { useFormik } from "formik";
import { resetPasswordValidation } from "../common/FormValidation";

import "../css/reset-password.css";

const ResetPassword = () => {
    const [showpass, setshowpass] = useState(false);
    const [showconfirmpass, setshowconfirmpass] = useState(false);
    const [p] = useSearchParams();
    const [resetSuccessful, setResetSuccessful] = useState(false);
    const resetPasswordForm = useFormik({
        initialValues: {
            password: "",
            confirmPassword: ""
        },
        validationSchema: resetPasswordValidation,
        onSubmit: (val) => {
            const token = p.get('token') ? p.get('token') : localStorage.getItem('accessToken');
            
            // const token = localStorage.getItem('accessToken')

            console.log("tokennnn",token)
            if (!token) {
                toast.error("Invalid or expired reset link", toastOption);
                return;
            }
            resetpass.mutate({ password: val.password, token });
        }
    })


    const resetpass = useResetPassword(
        (data) => {
            
            setResetSuccessful(true);
            console.log("data",data?.message)
            toast.success(data?.message, toastOption);

        },
        (error) => toast.error(error.response.data.message || "Error", toastOption), 
    );

    
    if (resetSuccessful) {

        return (
            <div className="reset-container">
                <div className="wrapper">
                    <h2>Password Reset Successful</h2>
                    <div className="success-message">
                        <p>Your password has been successfully reset.</p>
                        <p>
                            You can now login with your new password.{" "}
                            {/* <Link to={`https://admin.thibaingozi.com/`} className="login-link">
                                Login
                            </Link> */}
                        </p>
                    </div>
                    <footer>© 2025 Thiba Ingozi</footer>
                </div>
            </div>
        );
    }

    return (
        <div className="reset-container">
            <div className="wrapper">
                <h2>Reset Password</h2>
                <form className="form" onSubmit={resetPasswordForm.handleSubmit}>
                    <span>
                        <input
                            name="password"
                            type={showpass ? "text" : "password"}
                            placeholder="New Password"
                            value={resetPasswordForm.values.password}
                            onChange={resetPasswordForm.handleChange}
                        />
                        <i
                            onClick={() => setshowpass(!showpass)}
                            className={`fa ${showpass ? "fa-eye" : "fa-eye-slash"} showpass-icon`}
                        />
                        {resetPasswordForm.touched.password && <p className="err">{resetPasswordForm.errors.password}</p>}
                    </span>
                    <span>
                        <input
                            name="confirmPassword"
                            type={showconfirmpass ? "text" : "password"}
                            placeholder="Confirm new password"
                            value={resetPasswordForm.values.confirmPassword}
                            onChange={resetPasswordForm.handleChange}
                        />
                        <i
                            onClick={() => setshowconfirmpass(!showconfirmpass)}
                            className={`fa ${showconfirmpass ? "fa-eye" : "fa-eye-slash"} showpass-icon`}
                        />
                        {resetPasswordForm.touched.confirmPassword && <p className="err">{resetPasswordForm.errors.confirmPassword}</p>}
                    </span>
                    <button disabled={resetpass.isPending} className={`button ${resetpass.isPending && "load"}`} type="submit">
                        Reset
                    </button>
                </form>

                <footer>© 2025 Thiba Ingozi</footer>
            </div>
        </div>
    );
};

export default ResetPassword;