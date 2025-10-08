import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import SideBar from "./SideBar";
import { useState, useRef, useEffect } from "react";
import { IoIosMenu } from "react-icons/io";

function Layout() {
    const [isActive, setActive] = useState(false);
    const sidebarRef = useRef();
    // Close sidebar when clicking outside (on small screens)
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (window.innerWidth < 992 && isActive && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setActive(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isActive]);
    return (
        <div className={`dashboard ${isActive ? "active" : ""}`}>
            <div className="main-app">
                <SideBar setActive={setActive} isActive={isActive} sidebarRef={sidebarRef} />
                <div className="content">
                    <Navbar setActive={setActive} isActive={isActive} />
                    <div className="outlet">
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
}
export default Layout;