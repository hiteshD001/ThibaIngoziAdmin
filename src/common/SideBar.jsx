import logo4 from "../assets/images/logo4.svg";
import favIcon from "../assets/images/favicon.png";
import openSide from "../assets/images/logout.png";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { getFilteredMenulist } from "./Menulist";
import { LogoutConfirm } from "./ConfirmationPOPup";
import { useGetPermissionsByRoleId } from "../API Calls/API";
import { useMemo } from "react";
import "./../css/SidebarCollaosed.css";

const SideBar = ({ setActive, isActive, sidebarRef, isCollapsed,
    setIsCollapsed }) => {
    const [confirm, setconfirm] = useState(false)
    const role = localStorage.getItem('role')
    const roleId = localStorage.getItem('roleId')

    // Fetch permissions for company role
    const { data: permissionsData } = useGetPermissionsByRoleId(roleId);

    const nav = useNavigate()
    const location = useLocation();

    // Dynamically calculate menulist based on role and permissions
    const menulist = useMemo(() => {
        return getFilteredMenulist(role, permissionsData);
    }, [role, permissionsData]);

    const handleLogout = () => {
        localStorage.clear()
        nav("/")
    }

    const [currentMenu, setcurrentMenu] = useState(
        role === "sales_agent" ? "sales-home" : "home"
    );

    useEffect(() => {
        const currentPath = location.pathname.split("/")
        setcurrentMenu(currentPath[2] ? currentPath[2] : currentPath[1])
    }, [location])

    return (
        <>
            <div ref={sidebarRef} className={`sidebar ${isActive ? "show" : ""} ${isCollapsed ? "collapsed" : ""}`}>
                {isCollapsed && <button class="burger-menu-v" onClick={() => setIsCollapsed(prev => !prev)}>
                        ❯
                    </button>}
                <div className="logo d-flex">
                    {!isCollapsed ? <img src={logo4} alt="logo" /> : <img src={favIcon} alt="logo" />}
                    {!isCollapsed && <button
                        className="burger-menu"
                        onClick={() => setIsCollapsed(prev => !prev)}
                    >
                        ❮
                    </button>}
                </div>

                <ul>
                    {menulist.map(menu =>
                        <li key={menu.name} onClick={() => menu.id === "logout" ? setconfirm(true) : nav(menu.path)}>
                            <span
                                className={`${currentMenu === menu.id ? "active" : ""}`} ><img src={menu.image} />{menu.name}</span>
                        </li>
                    )}
                </ul>
                {confirm && <LogoutConfirm setconfirm={setconfirm} handleLogout={handleLogout} />}
            </div>
        </>
    )
}

export default SideBar