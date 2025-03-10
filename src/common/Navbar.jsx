// import bell from "../assets/images/bell.png";
// import search from "../assets/images/search.png"
// import icon from "../assets/images/icon.png"
import { useEffect, useState } from "react";
import { Companyadmin_menulist, superadmin_menulist } from "./Menulist";
import { useLocation, useNavigate } from "react-router-dom";

const Navbar = () => {
    const [menulist] = useState(localStorage.getItem("role") === 'super_admin' ? superadmin_menulist : Companyadmin_menulist())
    const [currentMenu, setCurrentMenu] = useState("Home")

    const location = useLocation()
    const nav = useNavigate();

    useEffect(() => {
        const Menu = location.pathname.split("/")[2] ? location.pathname.split("/")[2] : location.pathname.split("/")[1]
        setCurrentMenu(menulist.filter(menu => menu.id === Menu)[0])
    }, [location])


    return (
        <header>
            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-6">
                        <div className="breadcrumb">
                            <span>Dashboards</span>
                            <span>/</span>
                            <span onClick={() => nav(currentMenu.submenu.path)}>{currentMenu?.submenu && (currentMenu.submenu ? currentMenu.submenu.name : currentMenu.name)}</span>
                            {location.pathname.split("/").length > 3 && <>
                                <span>/</span>
                                <span>
                                    {location.pathname.split("/")[3] === "driver-information" ? currentMenu.info
                                        : location.pathname.split("/")[3] === "add-driver" || location.pathname.split("/")[3] === "add-company" ? currentMenu.add
                                            : currentMenu?.company}
                                </span>
                            </>}
                        </div>
                    </div>
                    <div className="col-md-6 text-end">
                        <div className="header-noti">
                            {/* <div className="header-search">
                                <div className="input-group">
                                    <span className="input-group-text"><img src={search} /></span>
                                    <input type="text" className="form-control" placeholder="Search" />
                                    <span className="input-group-text"><img src={icon} /></span>
                                </div>
                            </div> */}
                            {/* <div className="dropdown">
                                <button className="btn btn-secondary dropdown-toggle" id="dropdownMenuButton1" onClick={() => setopen(p => !p)}>
                                    <img src={bell} />
                                </button>
                                <ul className={`dropdown-menu ${open && "show"}`} aria-labelledby="dropdownMenuButton1">
                                    <li><a className="dropdown-item" href="#">Action</a></li>
                                    <li><a className="dropdown-item" href="#">Another action</a></li>
                                    <li><a className="dropdown-item" href="#">Something else here</a></li>
                                </ul>
                            </div> */}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Navbar