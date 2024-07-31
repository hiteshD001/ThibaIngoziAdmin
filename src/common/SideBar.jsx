import logo1 from "../assets/images/logo-1.png";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { menulist } from "./Menulist";

const SideBar = () => {
    const [currentMenu, setcurrentMenu] = useState("home")

    const location = useLocation();
    const nav = useNavigate()

    useEffect(() => {
        const currentPath = location.pathname.split("/")
        setcurrentMenu(currentPath[2] ? currentPath[2] : currentPath[1])
    }, [location])

    return (
        <div className="sidebar">
            <div className="logo">
                <a href="dashboard.html"><img src={logo1} alt="logo" /></a>
            </div>

            <ul>
                {menulist.map(menu =>
                    <li key={menu.name} onClick={() => menu.id === "logout" ? nav("/") : nav(menu.path)}>
                        <span 
                        className={`${currentMenu === menu.id ? "active" : ""}${menu.name === "Logout" ? " logout" : ""}`} ><img src={menu.image} />{menu.name}</span>
                        {menu.submenu && <ul>
                            <li onClick={() => nav(menu.submenu.path)}><span><img src={menu.submenu.image} />{menu.submenu.name}</span></li>
                        </ul>}
                    </li>
                )}
            </ul>
        </div>
    )
}

export default SideBar