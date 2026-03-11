import logo4 from "../assets/images/logo4.svg";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { superadmin_menulist, Companyadmin_menulist, salesAgent_menulist, passenger_menulist, driver_menulist, allMenuItems } from "./Menulist";
import { LogoutConfirm } from "./ConfirmationPOPup";
import { useGetPermissionsByRoleId } from "../API Calls/API";
import { useMemo } from "react";

const SideBar = ({ setActive, isActive, sidebarRef }) => {
    const [confirm, setconfirm] = useState(false)
    const role = localStorage.getItem('role')
    const roleId = localStorage.getItem('roleId')

    // Fetch permissions for company role
    const { data: permissionsData } = useGetPermissionsByRoleId(roleId);
    console.log("super-")
    // Dynamically calculate menulist based on role and permissions
    const menulist = useMemo(() => {
        if (role === 'super_admin') return superadmin_menulist(permissionsData);
        if (role === 'company') return Companyadmin_menulist(permissionsData);
        if (role === 'sales_agent') return salesAgent_menulist(permissionsData);
        if (role === 'passenger' || role === 'Passanger') return passenger_menulist(permissionsData);
        if (role === 'driver' || role === 'Driver') return driver_menulist(permissionsData);

        // Fallback for custom roles or any other roles not explicitly mentioned above
        let activePermissions = [];
        if (permissionsData?.data?.data?.permissions) {
            activePermissions = permissionsData.data.data.permissions
                .filter(permission => permission.status === 'active')
                .map(permission => permission.name);
        }

        return allMenuItems.filter(item => {
            // Logout must always be visible regardless of permissions
            if (item.id === "logout") {
                return true;
            }
            if (!item.permission) {
                return true;
            }
            return activePermissions.includes(item.permission);
        });
    }, [role, permissionsData]);

    const [currentMenu, setcurrentMenu] = useState(
        role === "sales_agent" ? "sales-home" : "home"
    );

    const location = useLocation();
    const nav = useNavigate()

    const handleLogout = () => {
        localStorage.clear()
        nav("/")
    }

    useEffect(() => {
        const currentPath = location.pathname.split("/")
        setcurrentMenu(currentPath[2] ? currentPath[2] : currentPath[1])
    }, [location])
    console.log(menulist, "menulist-menulist")

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