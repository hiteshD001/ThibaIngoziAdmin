import { useState } from "react";
// import logo from "../../../assets/Images/layout/logo.svg";
import "../css/reset-password.css";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showpass, setshowpass] = useState(false);
  const [showconfirmpass, setshowconfirmpass] = useState(false);

  const [err, seterr] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      seterr("Password does not match");
    } else {
      seterr("");
      setPassword("");
      setConfirmPassword("");
      console.log(password);
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
        <footer>© 2024 Guardian Link</footer>
      </div>
    </div>
  );
};

export default ResetPassword;
