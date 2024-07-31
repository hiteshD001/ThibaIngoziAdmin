import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import SideBar from "./SideBar";




function Layout() {
    return (
        <div className="dashboard">
            <div className="main-app">
                <SideBar />
                <div className="content">
                    <Navbar />
                    <Outlet />
                </div>
            </div>
        </div>
    );
}

export default Layout;