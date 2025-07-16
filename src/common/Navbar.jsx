// import bell from "../assets/images/bell.png";
// import search from "../assets/images/search.png"
// import icon from "../assets/images/icon.png"
import { useEffect, useState } from "react";
import { Companyadmin_menulist, superadmin_menulist } from "./Menulist";
import { useLocation, useNavigate } from "react-router-dom";
import { IoIosMenu } from "react-icons/io";
const Navbar = ({ setActive, isActive }) => {
    const [menulist] = useState(localStorage.getItem("role") === 'super_admin' ? superadmin_menulist : Companyadmin_menulist())
    const [currentMenu, setCurrentMenu] = useState("Home")

    const location = useLocation()
    const nav = useNavigate();

    useEffect(() => {
        const Menu = location.pathname.split("/")[2] ? location.pathname.split("/")[2] : location.pathname.split("/")[1]
        setCurrentMenu(menulist.filter(menu => menu.id === Menu)[0])
    }, [location])


    return (
        <header className="navbar shadow-sm px-3 py-2 d-flex justify-content-between align-items-center">

            <div className="d-flex align-items-center breadcrumb">
                <button className="btn d-lg-none me-3" onClick={() => setActive(true)}>
                    <IoIosMenu size={24} />
                </button>
                <h5 className="mb-0">Dashboard</h5>
            </div>
            {/* <div className="breadcrumb">
                            <span>Dashboards</span>
                            <span>/</span>
                            <span onClick={() => nav(currentMenu.submenu.path)}>{currentMenu?.submenu && (currentMenu.submenu ? currentMenu.submenu.name : currentMenu.name)}</span>
                            {location.pathname.split("/").length > 3 && <>
                                <span>/</span>
                                <span>
                                    {location.pathname.split("/")[3] === "driver-information" ? currentMenu?.info
                                        : location.pathname.split("/")[3] === "add-driver" || location.pathname.split("/")[3] === "add-company" ? currentMenu?.add
                                            : currentMenu?.company}
                                </span>
                            </>}
                        </div> */}

            {/* <div className="col-md-6 text-end">
                        <div className="header-noti">
                            Profile
                        </div>
                    </div> */}

        </header>
    )
}

export default Navbar