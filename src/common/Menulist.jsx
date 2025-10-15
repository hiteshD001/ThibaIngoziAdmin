import home from "../assets/images/home.png";
import drivers from "../assets/images/drivers.png";
import arrowLeft from "../assets/images/arrow-left.png";
// import settings from "../assets/images/settings.png";
import profile from "../assets/images/profile.png";
import logout from "../assets/images/logout.png";
import comapnies from "../assets/images/companies.png";
import hardware from "../assets/images/hardware.png";
import trip from "../assets/images/trip.png"
import { useState } from "react";

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
        id: "total-trips",
        name: "Total Linked Trips",
        path: "/home/total-trips",
        image: trip,
        submenu: {
            name: "List of Linked Trips",
            path: "/home/total-trips",
            image: arrowLeft
        },
        company: "User Information"
    },
    {
        id: "total-meeting-link-trips",
        name: "Total Meeting Links",
        path: "/home/total-meeting-link-trips",
        image: trip,
        submenu: {
            name: "List of Meeting Links",
            path: "/home/total-meeting-link-trips",
            image: arrowLeft
        },
        company: "User Information"
    },
    {
        id: "total-users",
        name: "Users",
        path: "/home/total-users",
        image: drivers,
        submenu: {
            name: "List of Users",
            path: "/home/total-users",
            image: arrowLeft
        },
        company: "User Information"
    },
    {
        id: "total-sos-amount",
        name: "Armed Sos Amount",
        path: "/home/total-sos-amount",
        image: drivers,
        submenu: {
            name: "List of Sos Amounts",
            path: "/home/total-sos-amount",
            image: arrowLeft
        },
        company: "Sos Information"
    },
    {
        id: "total-sales-agent",
        name: "Sales Agent",
        path: "/home/total-sales-agent",
        image: drivers,
        submenu: {
            name: "List of Sales Agent",
            path: "/home/total-sales-agent",
            image: arrowLeft
        },
        add: "Add Sales Agent",
        info: "Sales Agent Information"
        // company: "",
    },
    {
        id: "change-password",
        name: "Change Password",
        path: "/home/change-password",
        image: home,
        info: "Company Change Password",
    },

    // {
    //     id: "hardware-management",
    //     name: "Hardware Management",
    //     path: "/home/hardware-management",
    //     image: hardware
    // },
    // {
    //     id: "settings",
    //     name: "Settings",
    //     path: "",
    //     image: settings
    // },
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

export const salesAgent_menulist = [
    {
        id: "sales-home",
        name: "Home",
        path: "/sales-home",
        image: home
    },
    {
        id: "logout",
        name: "Logout",
        image: logout
    },
]

export const Companyadmin_menulist = () => {
    const id = localStorage.getItem("userID");

    return [
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
        // {
        //     id: "total-armed-sos",
        //     name: "Armed Sos Amount",
        //     path: "/home/total-sos-amount",
        //     image: drivers,
        //     submenu: {
        //         name: "List of Sos Amounts",
        //         path: "/home/total-sos-amount",
        //         image: arrowLeft
        //     },
        //     company: "User Information"
        // },
        {
            id: "total-users",
            name: "Users",
            path: "/home/total-users",
            image: drivers,
            submenu: {
                name: "List of Users",
                path: "/home/total-users",
                image: arrowLeft
            },
            company: "User Information"
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
} 