import { useState } from "react";
import { useLocation } from "react-router-dom";
import "../css/reset-password.css";
import axios from "axios";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showpass, setshowpass] = useState(false);
  const [showconfirmpass, setshowconfirmpass] = useState(false);
  const [err, seterr] = useState("");
  const [message, setMessage] = useState("");

  const location = useLocation();

  const getTokenFromUrl = () => {
    const params = new URLSearchParams(location.search);
    return params.get("token");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = getTokenFromUrl();
    if (!token) {
      setMessage("Invalid or missing token");
      return;
    }

    if (password !== confirmPassword) {
      seterr("Password does not match");
    } else {
      seterr("");
      setPassword("");
      setConfirmPassword("");
      console.log(password);
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/users/reset-password/${token}`,
        { newPassword: password }
      );
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || "An error occurred");
    }
  };

  return (
    <div className="reset-container">
      <div className="wrapper">
        <div className="logo">
          {/* <img src={logo} alt="Guardian Link" /> */}
        </div>
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
            <p className="icon" onClick={() => setshowpass(!showpass)}>
              {showconfirmpass ? (
                <i className="fa fa-solid fa-eye-slash"></i>
              ) : (
                <i className="fa fa-eye"></i>
              )}
            </p>
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
            <p
              className="icon"
              onClick={() => setshowconfirmpass(!showconfirmpass)}
            >
              {showconfirmpass ? (
                <i className="fa fa-eye-slash"></i>
              ) : (
                <i className="fa fa-eye"></i>
              )}
            </p>
          </span>
          <p className="err">{err}</p>
          <button onClick={handleSubmit} className="button" type="submit">
            Reset
          </button>
        </form>
        {message && <p>{message}</p>}

        <footer>© 2024 Guardian Link</footer>
      </div>
    </div>
  );
};

export default ResetPassword;
