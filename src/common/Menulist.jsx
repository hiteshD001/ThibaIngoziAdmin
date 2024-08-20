import home from "../assets/images/home.png";
import drivers from "../assets/images/drivers.png";
import arrowLeft from "../assets/images/arrow-left.png";
import settings from "../assets/images/settings.png";
import profile from "../assets/images/profile.png";
import logout from "../assets/images/logout.png";
import comapnies from "../assets/images/companies.png";
import hardware from "../assets/images/hardware.png";
import { useEffect, useState } from "react";

export const superadmin_menulist = [
    {
        id: "home",
        name: "Home",
        path: "/home",
        image: home
    },
    {
        id: "total-companies",
        name: "Total Companies",
        path: "/home/total-companies",
        image: comapnies,
        submenu: {
            name: "List of Companies",
            path: "/home/total-companies",
            image: arrowLeft
        },
        add: "Add Company"
    },
    {
        id: "total-drivers",
        name: "Total Drivers",
        path: "/home/total-drivers",
        image: drivers,
        submenu: {
            name: "List of Drivers",
            path: "/home/total-drivers",
            image: arrowLeft
        },
        add: "Add Drivers",
        info: "Vehicle Information",
        company: "Company Information"
    },
    {
        id: "hardware-management",
        name: "Hardware Management",
        path: "/home/hardware-management",
        image: hardware
    },
    {
        id: "settings",
        name: "Settings",
        path: "",
        image: settings
    },
    {
        id: "profile",
        name: "Profile",
        path: "/home/profile",
        image: profile
    },
    {
        id: "logout",
        name: "Logout",
        image: logout
    },
]

export const Companyadmin_menulist = () => {
    const [id, setid] = useState("")

    const menulist = [
        {
            id: "home",
            name: "Home",
            path: "/home",
            image: home
        },
        {
            id: "total-drivers",
            name: "Total Drivers",
            path: `/home/total-drivers/${id}`,
            image: drivers,
            submenu: {
                name: "List of Drivers",
                path: `/home/total-drivers/${id}`,
                image: arrowLeft
            },
            add: "Add Drivers",
            info: "Vehicle Information",
            company: "Company Information"

        },
        {
            id: "settings",
            name: "Settings",
            path: "",
            image: settings
        },
        {
            id: "profile",
            name: "Profile",
            path: "/home/profile",
            image: profile
        },
        {
            id: "logout",
            name: "Logout",
            image: logout
        },
    ]

    useEffect(() => {
        setid(localStorage.getItem("userID"))
    },[])

    return menulist
} 