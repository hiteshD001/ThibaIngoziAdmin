import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import toggles from "../assets/images/bar.png";
import SideBar from "./SideBar";
import React from "react";


    



    function Layout() {
        const [isActive, setActive] = React.useState(false);
        return (
            <div className={`dashboard ${isActive ? "active" : ""}`}>
                <div className="toggle">
                    <a href="#" onClick={() => setActive(!isActive)}><img src={toggles} alt="toggles" /></a>
                    
                </div>
                <div className="main-app">
                    <SideBar />
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