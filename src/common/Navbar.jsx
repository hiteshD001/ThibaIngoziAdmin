// import bell from "../assets/images/bell.png";
// import search from "../assets/images/search.png"
// import icon from "../assets/images/icon.png"
import { useEffect, useState } from "react";
import { Avatar, Box, Divider, Typography, IconButton } from "@mui/material";
import { useGetUser } from "../API Calls/API";
import notificationIcon from '../assets/images/notificationIcon.svg';
import { Companyadmin_menulist, superadmin_menulist } from "./Menulist";
import { useLocation, useNavigate } from "react-router-dom";
import { IoIosMenu } from "react-icons/io";
import { IoArrowBack } from "react-icons/io5";
const Navbar = ({ setActive, isActive }) => {
    const [role] = useState(localStorage.getItem("role"))
    const [menulist] = useState(role === 'super_admin' ? superadmin_menulist : Companyadmin_menulist())
    const [pageTitle, setPageTitle] = useState("Dashboard");
    const [isSubMenu, setIsSubMenu] = useState(false);
    const [currentMenu, setCurrentMenu] = useState("Home")
    const [userId, setUserID] = useState("");

    const location = useLocation()
    const nav = useNavigate();
    const { data } = useGetUser(userId, { enabled: !!userId });
    const user = data?.data?.user

    useEffect(() => {
        const pathParts = location.pathname.split("/").filter(part => part);
        if (pathParts.length > 2) {
            setIsSubMenu(true);
            const menuId = pathParts[1];
            const subMenuId = pathParts[2];
            const currentMenu = menulist.find(menu => menu.id === menuId);

            if (currentMenu) {
                let subTitle = '';
                if (subMenuId === "driver-information" || subMenuId === "vehicle-information") {
                    subTitle = currentMenu.info;
                } else if (subMenuId.startsWith("add-")) {
                    subTitle = currentMenu.add;
                } else {
                    subTitle = currentMenu.company;
                }
                setPageTitle(subTitle || currentMenu.name);
            }
        } else {
            setIsSubMenu(false);
            const menuId = pathParts.length > 1 ? pathParts[1] : pathParts[0];
            const currentMenu = menulist.find(menu => menu.id === menuId);
            setPageTitle(currentMenu ? currentMenu.name : "Dashboard");
        }

    }, [location, menulist]);

    useEffect(() => {
        const storedId = localStorage.getItem('userID');
        if (storedId) {
            setUserID(storedId);
        }
    }, []);
    const handleProfileClick = () => {
        nav('/home/profile');
    };
    return (
        <header className="navbar shadow-sm px-3 py-2 d-flex justify-content-between align-items-center">

            {/* --- DYNAMIC BREADCRUMB / TITLE --- */}
            <div className="d-flex align-items-center breadcrumb">
                {isSubMenu ? (
                    <IconButton onClick={() => nav(-1)} className="me-2">
                        <IoArrowBack size={24} />
                    </IconButton>
                ) : (
                    <button className="btn d-lg-none me-3" onClick={() => setActive(true)}>
                        <IoIosMenu size={24} />
                    </button>
                )}
                <Typography variant="h5" fontWeight={600} className="mb-0">
                    {pageTitle}
                </Typography>
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

            {/* --- Profile Section --- */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pr: 2 }}>
                <img src={notificationIcon} alt="notification" style={{ cursor: 'pointer' }} />

                <Divider orientation="vertical" flexItem sx={{ bgcolor: 'grey.300' }} />

                <Box
                    sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
                    onClick={handleProfileClick} // Open menu on click
                >
                    {
                        role == 'super_admin' ? (
                            <Typography variant="body1" component="span" sx={{ color: 'text.primary' }}>
                                {user?.first_name} {user?.last_name}
                            </Typography>
                        ) : (
                            <Typography variant="body1" component="span" sx={{ color: 'text.primary' }}>
                                {user?.contact_name}
                            </Typography>
                        )
                    }

                    <Avatar
                        alt={user?.first_name}
                        src={user?.selfieImage}
                        // src={...} // Add a src for the user's profile photo if available
                        sx={{ width: 32, height: 32 }}
                    />

                </Box>
            </Box>


        </header>
    )
}

export default Navbar