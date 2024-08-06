import log_1 from "../assets/images/logo-1.png";

import { useNavigate } from "react-router-dom";

import { useFormik } from "formik";
// import { loginValidation } from "../common/FormValidation";

import { useMutation } from "@tanstack/react-query";
import { userlogin } from "../API Calls/API";

import { toast } from "react-toastify";
import { toastOption } from "../common/ToastOptions";
import Loader from "../common/Loader";

export const Login = () => {
    const nav = useNavigate()

    const loginForm = useFormik({
        initialValues: {
            email: '',
            password: '',
            fcm_token: "fcm_token"
        },
        // validationSchema: loginValidation,
        onSubmit: (values) => loginfn.mutate(values),
    })

    const loginfn = useMutation({
        mutationKey: ['login'],
        mutationFn: userlogin,
        onError: (error) => toast.error(error.response.data.message || "Something went Wrong", toastOption),
        onSuccess: (res) => {
            console.log(res)
            localStorage.setItem("accessToken", res.data.accessToken)
            localStorage.setItem("userID", res.data.user._id)
            localStorage.setItem("role", res.data.user.role)
            nav("/home")
        }
    })

    return (
        <>
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
                                    <input
                                        type="text"
                                        name="email"
                                        value={loginForm.values.email}
                                        onChange={loginForm.handleChange}
                                        className="form-control"
                                        placeholder="Email"
                                    />
                                    {loginForm.touched.email && <p className="err">{loginForm.errors.email}</p>}
                                    <input
                                        type="password"
                                        name="password"
                                        value={loginForm.values.password}
                                        onChange={loginForm.handleChange}
                                        className="form-control"
                                        placeholder="Password"
                                    />
                                    {loginForm.touched.password && <p className="err">{loginForm.errors.password}</p>}
                                    <div className="forgotpwd text-end">
                                        <a href="#">Forgot Password?</a>
                                    </div>
                                    <button disabled={loginfn.isPending} type="submit" className="btn btn-dark d-block">
                                        {loginfn.isPending ? <Loader color="white" /> :  "Sign In"}
                                    </button>

                                    <div className="keep-signed">
                                        <input type="checkbox" id="signin" />
                                        <label htmlFor="signin">Keep me signed in</label>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <div className="col-md-12 text-center">
                            <div className="copyright">
                                <p>&copy; 2024 Guardian Link</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
