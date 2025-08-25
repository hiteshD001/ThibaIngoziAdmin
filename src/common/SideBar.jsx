import logo1 from "../assets/images/logo-1.png";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { superadmin_menulist, Companyadmin_menulist, salesAgent_menulist } from "./Menulist";
import { LogoutConfirm } from "./ConfirmationPOPup";

const SideBar = () => {
    const [confirm, setconfirm] = useState(false)
    const role = localStorage.getItem('role')
    const [menulist] = useState(() => {
        if (role === 'super_admin') return superadmin_menulist;
        if (role === 'company_admin') return Companyadmin_menulist();
        if (role === 'sales_agent') return salesAgent_menulist;

        return [];
    });
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

    return (
        <div className="sidebar">
            <div className="logo">
                <img src={logo1} alt="logo" />
            </div>

            <ul>
                {menulist.map(menu =>
                    <li key={menu.name} onClick={() => menu.id === "logout" ? setconfirm(true) : nav(menu.path)}>
                        <span
                            className={`${currentMenu === menu.id ? "active" : ""}${menu.name === "Logout" ? " logout" : ""}`} ><img src={menu.image} />{menu.name}</span>
                        {menu.submenu && <ul>
                            <li onClick={() => nav(menu.submenu.path)}><span><img src={menu.submenu.image} />{menu.submenu.name}</span></li>
                        </ul>}
                    </li>
                )}
            </ul>
            {confirm && <LogoutConfirm setconfirm={setconfirm} handleLogout={handleLogout} />}
        </div>
    )
}

export default SideBar