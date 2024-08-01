import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import "../css/reset-password.css";
import { useMutation } from "@tanstack/react-query";
import { resetPassword } from "../API Calls/API";

// import logo from "../assets/images/logo-1.png"
import { toast } from "react-toastify";
import { toastOption } from "../common/ToastOptions";
import { useFormik } from "formik";
import { resetPasswordValidation } from "../common/FormValidation";

const ResetPassword = () => {
    const [showpass, setshowpass] = useState(false);
    const [showconfirmpass, setshowconfirmpass] = useState(false);
    const [p] = useSearchParams()

    const resetPasswordForm = useFormik({
        initialValues: {
            password: "",
            confirmPassword: ""
        },
        validationSchema: resetPasswordValidation,
        onSubmit: (val) => resetpass.mutate({ password: val?.password, token: p.get('token') })
    })

    const resetpass = useMutation({
        mutationKey: ['reset pass', p.get('token')],
        mutationFn: resetPassword,
        onError: (error) => toast.error(error.response.data.message || "Error", toastOption),
        onSuccess: (data) => toast.success(data.data.message, toastOption),
        retry: false
    }
    )

    return (
        <div className="reset-container">
            <div className="wrapper">
                {/* <img className="logo" src={logo} alt="Guardian Link" /> */}
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

                <footer>© 2024 Guardian Link</footer>
            </div>
        </div>
    );
};

export default ResetPassword;