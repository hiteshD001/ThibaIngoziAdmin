import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import "../css/reset-password.css";
import { useMutation } from "@tanstack/react-query";
import { resetPassword } from "../API Calls/API";

// import logo from "../assets/images/logo-1.png"
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as yup from "yup"

const ResetPassword = () => {
    const [showpass, setshowpass] = useState(false);
    const [showconfirmpass, setshowconfirmpass] = useState(false);
    const [p] = useSearchParams()

    const resetValidation = yup.object({
        password: yup.string()
            .required("Password is Required")
            .min(8, "Password must be at least 8 characters")
            .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
            .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
            .matches(/[0-9]/, 'Password must contain at least one number')
            .matches(/[!@#$%^&*]/, 'Password must contain at least one special character'),

        confirmPassword: yup.string()
            .required("Confirm Password is Required")
            .oneOf([yup.ref('password'), null], 'Passwords must match')
    })

    const resetForm = useFormik({
        initialValues: {
            password: "",
            confirmPassword: ""
        },
        validationSchema: resetValidation,
        onSubmit: (val) => resetpass.mutate({ password: val?.password, token: p.get('token') })
    })

    const resetpass = useMutation({
        mutationKey: ['reset pass', p.get('token')],
        mutationFn: resetPassword,
        onError: (error) => toast.error(error.response.data.message || "Error", toastOption),
        onSuccess: (data) => toast.success(data.data.message, toastOption),
        retry: false
    })

    return (
        <div className="reset-container">
            <div className="wrapper">
                {/* <img className="logo" src={logo} alt="Guardian Link" /> */}
                <h2>Reset Password</h2>
                <form className="form" onSubmit={resetForm.handleSubmit}>
                    <span>
                        <input
                            id="password"
                            name="password"
                            type={showpass ? "text" : "password"}
                            placeholder="New Password"
                            value={resetForm.values.password}
                            onChange={resetForm.handleChange}
                        />
                        <i
                            onClick={() => setshowpass(!showpass)}
                            className={`fa ${showpass ? "fa-eye" : "fa-eye-slash"} showpass-icon`}
                        />
                        {resetForm.touched.password && <p className="err">{resetForm.errors.password}</p>}
                    </span>
                    <span>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showconfirmpass ? "text" : "password"}
                            placeholder="Confirm new password"
                            value={resetForm.values.confirmPassword}
                            onChange={resetForm.handleChange}
                        />
                        <i
                            onClick={() => setshowconfirmpass(!showconfirmpass)}
                            className={`fa ${showconfirmpass ? "fa-eye" : "fa-eye-slash"} showpass-icon`}
                        />
                        {resetForm.touched.confirmPassword && <p className="err">{resetForm.errors.confirmPassword}</p>}
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

const toastOption = {
    autoClose: false,
    position: "top-center",
    hideProgressBar: true,
    closeOnClick: true
}