import { Route, Routes } from "react-router-dom";
import "./App.css";
// import Layout from "./common/Layout";
import { Login } from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import RequestHardware from "./pages/RequestHardware";
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/request-hardware" element={<RequestHardware />}></Route>
      </Routes>
    </>
  );
}

export default App;
