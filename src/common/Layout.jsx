import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import SideBar from "./SideBar";
import { useState } from "react";
import { IoIosMenu } from "react-icons/io";

function Layout() {
    const [isActive, setActive] = useState(false);
    return (
        <div className={`dashboard ${isActive ? "active" : ""}`}>
            <div className="toggle">
                <a href="#" onClick={() => setActive(!isActive)}><IoIosMenu className="menuicon"/></a>
            </div>
            <div className="main-app">
                <SideBar setActive={setActive} />
                <div className="content">

                    <Navbar />
                    <div className="outlet">
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
}
export default Layout;