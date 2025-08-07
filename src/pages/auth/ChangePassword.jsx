import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useGetCompanyList, useChangePassword } from "../../API Calls/API";

import { toast } from "react-toastify";
import { toastOption } from "../../common/ToastOptions";

import { useFormik } from "formik";
import { changePasswordValidation } from "../../common/FormValidation";

import "../../css/reset-password.css";

const ChangePassword = () => {
    const [showpass, setshowpass] = useState(false);
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
        <div className="reset-container changePass-container">
            <div className="wrapper">
                <h2>Change Password</h2>
                <form className="form" onSubmit={changePasswordForm.handleSubmit}>
                    <span style={{ marginBottom: '5px', marginLeft: '6px' }}>
                        <select
                            name="company_id"
                            className="form-control"
                            value={changePasswordForm.values.company_id}
                            onChange={changePasswordForm.handleChange}
                            required
                            style={{ paddingBlock: '10px' }}
                        >
                            <option value="">Select Company</option>
                            {companyList.data?.data.users.map((user) => (
                                <option key={user._id} value={user._id}>
                                    {user.company_name}
                                </option>
                            ))}
                        </select>
                        {changePasswordForm.touched.company_id && <p className="err">{changePasswordForm.errors.company_id}</p>}
                    </span>
                    <span>
                        <input
                            name="newPassword"
                            type={showpass ? "text" : "password"}
                            placeholder="New Password"
                            value={changePasswordForm.values.newPassword}
                            onChange={changePasswordForm.handleChange}
                        />
                        <i
                            onClick={() => setshowpass(!showpass)}
                            className={`fa ${showpass ? "fa-eye" : "fa-eye-slash"} showpass-icon`}
                        />
                        {changePasswordForm.touched.newPassword && <p className="err">{changePasswordForm.errors.newPassword}</p>}
                    </span>
                    <span>
                        <input
                            name="confirmPassword"
                            type={showconfirmpass ? "text" : "password"}
                            placeholder="Confirm new password"
                            value={changePasswordForm.values.confirmPassword}
                            onChange={changePasswordForm.handleChange}
                        />
                        <i
                            onClick={() => setshowconfirmpass(!showconfirmpass)}
                            className={`fa ${showconfirmpass ? "fa-eye" : "fa-eye-slash"} showpass-icon`}
                        />
                        {changePasswordForm.touched.confirmPassword && <p className="err">{changePasswordForm.errors.confirmPassword}</p>}
                    </span>
                    <button disabled={changePassword.isPending} className={`button ${changePassword.isPending && "load"}`} type="submit">
                        Submit
                    </button>
                </form>

                {/* <footer>© 2025 Thiba Ingozi</footer> */}
            </div>
        </div>
    );
};

export default ChangePassword;