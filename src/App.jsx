import { Route, Routes } from "react-router-dom";
import "./App.css";
// import Layout from "./common/Layout";
import { Login } from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login/>}/>
        <Route path="/reset-password" element={<ResetPassword/>}/>
        {/* <Route path="/" element={<Layout />}>
        </Route> */}
      </Routes>
    </>
  );
}

export default App;