import Dashboard from '../assets/images/Dashboard.svg'
import Driver from "../assets/images/Driver.svg";
import users from '../assets/images/users.svg'
import MeetingLink from '../assets/images/MeetingLink.svg'
import Report from '../assets/images/Report.svg'
import Trip from '../assets/images/Trip.svg'
import Crime from '../assets/images/crime.svg'
import arrowLeft from "../assets/images/arrow-left.png";
import ArmedSos from '../assets/images/ArmedSos.svg'
import SapsWanted from '../assets/images/SapsWanted.svg'
import salesagent from '../assets/images/salesagent.svg'
// import settings from "../assets/images/settings.png";
import Flagged from '../assets/images/Flagged.svg'
import StolenCarIcon from '../assets/images/StolenCarIcon.svg'
import MissingPersonIcon from '../assets/images/MissingPersonIcon.svg'
import SuspectIcon from '../assets/images/SuspectIcon.svg'
import changePasswordIcon from '../assets/images/changePasswordIcon.svg'
import profile from "../assets/images/profile.png";
import Logout from "../assets/images/Logout.svg";
import Company from "../assets/images/Company.svg";
import trip from "../assets/images/trip.png"
import { useState } from "react";
import WorkInProgress from './WorkInProgress';

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
        add: "Add Company",
        // info: "Company Information",
        company: "Company Information"
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
        id: "total-linked-trips",
        name: "Total Linked Trips",
        path: "/home/total-linked-trips",
        image: Trip,
        company: "User Information"
    },
    {
        id: "total-meeting-links",
        name: "Total Meeting Links",
        path: "/home/total-meeting-links",
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
        id: "total-sales-agent",
        name: "Sales Agent",
        path: "/home/total-sales-agent",
        image: salesagent,
        // submenu: {
        //     name: "List of Sales Agent",
        //     path: "/home/total-sales-agent",
        //     image: arrowLeft
        // },
        // add: "Add Sales Agent",
        info: "Sales Agent Information"
        // company: "",
    },
    {
        id: "total-saps-wanted",
        name: "SAPS Wanted",
        path: "/home/total-saps-wanted",
        image: SapsWanted,
        add: "Add Saps Member",
        info: "Suspect Information",
        // company: "Suspect Information"
    },
    {
        id: "reports",
        name: "Reports",
        path: "/home/reports",
        image: Report
    },
    {
        id: "total-missing-person",
        name: "Missing Persons",
        path: "/home/total-missing-person",
        image: MissingPersonIcon,
        company: "Missing Person Sighting Details"
    },
    {
        id: "total-stolen-cars",
        name: "Stolen Cars",
        path: "/home/total-stolen-cars",
        image: StolenCarIcon,
        company: "Stolen Car Sighting Details"
    },
    {
        id: "crime-reports",
        name: "Crime Reporting",
        path: "/home/crime-reports",
        image: Crime,
        company: "Crime Report",
        add: "Forward To Police Unit",


    },
    {
        id: "total-suspect",
        name: "Suspect Sightings",
        path: "/home/total-suspect",
        image: SuspectIcon,
        company: "Suspect Sighting Details"
    },
    {
        id: "flagged-report",
        name: "Flagged Report",
        path: "/home/flagged-report",
        image: Flagged,
    },
    {
        id: "change-password",
        name: "Change Password",
        path: "/home/change-password",
        image: changePasswordIcon,
    },
    {
        id: "logout",
        name: "Logout",
        image: Logout
    },
]

export const Companyadmin_menulist = () => {
    const id = localStorage.getItem("userID");

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
            id: "total-linked-trips",
            name: "Total Linked Trips",
            path: "/home/total-linked-trips",
            image: Trip,
            company: "User Information"
        },
        {
            id: "total-meeting-links",
            name: "Total Meeting Links",
            path: "/home/total-meeting-links",
            image: MeetingLink,
            company: "User Information"
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