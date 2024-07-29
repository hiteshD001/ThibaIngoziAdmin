import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import "../css/reset-password.css";
import { useMutation } from "@tanstack/react-query";
import { resetPassword } from "../API Calls/API";

import { toast } from "react-toastify";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showpass, setshowpass] = useState(false);
  const [showconfirmpass, setshowconfirmpass] = useState(false);
  const [err, seterr] = useState("");
  const [p] = useSearchParams()

  const resetpass = useMutation({
    mutationKey: ['reset pass', p.get('token')],
    mutationFn: resetPassword,
    onError: (data) => toast.error(data.error.response?.data?.message || "Error", toastOption),
   onSuccess: (data) => toast.success(data.data.message, toastOption)
  })

  // const getTokenFromUrl = () => {
  //   const params = new URLSearchParams(location.search);
  //   console.log(params)
  //   return params.get("token");
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // const token = p.get('token')
    if (password !== confirmPassword) {
      seterr("Password does not match");
    }

    // else if (!token) {
    //   toast.error("Invalid or missing token", toastOption)
    //   return;
    // }

    else {

      seterr(""); setPassword(""); setConfirmPassword("");
      resetpass.mutate({ password, token: p.get('token') });
    }
  };
  return (
    <div className="reset-container">
      <div className="wrapper">
        {/* <img className="logo" src={logo} alt="Guardian Link" /> */}
        <h2>Reset Password</h2>
        <form className="form">
          <span style={{ display: "flex", alignItems: "center" }}>
            <input
              id="password"
              type={showpass ? "text" : "password"}
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <i
              onClick={() => setshowpass(!showpass)}
              className={`fa ${showpass ? "fa-eye" : "fa-eye-slash"} showpass-icon`}
            />
          </span>
          <span style={{ display: "flex", alignItems: "center" }}>
            <input
              id="confirmPassword"
              type={showconfirmpass ? "text" : "password"}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <i
              onClick={() => setshowconfirmpass(!showconfirmpass)}
              className={`fa ${showconfirmpass ? "fa-eye" : "fa-eye-slash"} showpass-icon`}
            />
          </span>
          <p className="err">{err}</p>
          <button disabled={resetpass.isPending} onClick={handleSubmit} className={`button ${resetpass.isPending && "load"}`} type="submit">
            Reset
          </button>
        </form>
        {/* {message && <p className="err">{message}</p>} */}

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