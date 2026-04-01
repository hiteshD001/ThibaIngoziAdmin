import logo4 from "../assets/images/logo4.svg";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { getFilteredMenulist } from "./Menulist";
import { LogoutConfirm } from "./ConfirmationPOPup";
import { useGetPermissionsByRoleId } from "../API Calls/API";
import { useMemo } from "react";

const SideBar = ({ setActive, isActive, sidebarRef }) => {
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
        <div ref={sidebarRef} className={`sidebar ${isActive ? "show" : ""}`}>
            <div className="logo">
                <img src={logo4} alt="logo" />
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
    )
}

export default SideBar