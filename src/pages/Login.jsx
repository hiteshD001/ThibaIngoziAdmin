import "../css/style.css";
import log_1 from "../assets/images/logo-1.png";
import { useNavigate } from "react-router-dom";

export const Login = () => {
  const nav = useNavigate()

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
                <form action="dashboard.html" method="">
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    placeholder="Email"
                  />
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    placeholder="Password"
                  />
                  <div className="forgotpwd text-end">
                    <a href="#">Forgot Password?</a>
                  </div>
                  <button onClick={() => nav("/home")} type="submit" className="btn btn-dark d-block">
                    Sign In
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
