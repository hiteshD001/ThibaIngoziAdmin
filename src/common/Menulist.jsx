import Dashboard from '../assets/images/Dashboard.svg'
import Driver from "../assets/images/Driver.svg";
import users from '../assets/images/users.svg'
import MeetingLink from '../assets/images/MeetingLink.svg'
import Report from '../assets/images/Report.svg'
import Trip from '../assets/images/Trip.svg'
import arrowLeft from "../assets/images/arrow-left.png";
import ArmedSos from '../assets/images/ArmedSos.svg'
// import settings from "../assets/images/settings.png";
import profile from "../assets/images/profile.png";
import Logout from "../assets/images/Logout.svg";
import Company from "../assets/images/Company.svg";
import trip from "../assets/images/trip.png"
import { useState } from "react";

export const superadmin_menulist = [
    {
        id: "home",
        name: "Dashboard",
        path: "/home",
        image: Dashboard
    },

    {
        id: "total-companies",
        name: "Total Companies",
        path: "/home/total-companies",
        image: Company,
        add: "Add Company"
    },
    {
        id: "total-drivers",
        name: "Total Drivers",
        path: "/home/total-drivers",
        image: Driver,
        add: "Add Driver",
        info: "Driver Information",
        company: "Company Information"
    },
    {
        id: "total-trips",
        name: "Total Trips",
        path: "/home/total-trips",
        image: Trip,
        company: "User Information"
    },
    {
        id: "total-meeting-link-trips",
        name: "Total Meeting Link Trips",
        path: "/home/total-meeting-link-trips",
        image: MeetingLink,
        company: "User Information"
    },
    {
        id: "total-users",
        name: "Users",
        path: "/home/total-users",
        image: users,
        add: "Add User",
        company: "User Information"
    },
    {
        id: "total-sos-amount",
        name: "Armed Sos Amount",
        path: "/home/total-sos-amount",
        image: ArmedSos,
        company: "Sos Information"
    },
    {
        id: "change-password",
        name: "Change Password",
        path: "/home/change-password",
        image: Dashboard,
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
        id: "report",
        name: "Reports",
        path: "/home/reports",
        image: Report
    },
    {
        id: "logout",
        name: "Logout",
        image: Logout
    },
]

export const Companyadmin_menulist = () => {
    const [id] = useState(localStorage.getItem("userID"))

    return [
        {
            id: "home",
            name: "Home",
            path: "/home",
            image: Dashboard
        },
        {
            id: "total-drivers",
            name: "Total Drivers",
            path: `/home/total-drivers/${id}`,
            image: Driver,
            add: "Add Drivers",
            info: "Vehicle Information",
            company: "Company Information"

        },
        {
            id: "total-sos-amount",
            name: "Armed Sos Amount",
            path: "/home/total-sos-amount",
            image: ArmedSos,
            company: "Sos Information"
        },
        // {
        //     id: "total-armed-sos",
        //     name: "Armed Sos Amount",
        //     path: "/home/total-sos-amount",
        //     image: ArmedSos,
        //     company: "User Information"
        // },
        {
            id: "total-users",
            name: "Users",
            path: "/home/total-users",
            image: users,
            company: "User Information"
        },
        // {
        //     id: "profile",
        //     name: "Profile",
        //     path: "/home/profile",
        //     image: profile
        // },
        {
            id: "logout",
            name: "Logout",
            image: Logout
        },

    ]
} 