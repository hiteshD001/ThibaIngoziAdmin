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
import settings from "../assets/images/settings.png";
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

export const superadmin_menulist = (permissionsData) => {
    // Process permissions data if provided
    let activePermissions = [];
    
    if (permissionsData && permissionsData.data && permissionsData.data.data && permissionsData.data.data.permissions) {
        // Extract active permission names from API response
        activePermissions = permissionsData.data.data.permissions
            .filter(permission => permission.status === 'active')
            .map(permission => permission.name);
    }

    // Define all menu items with their required permissions
    const allMenuItems = [
        {
            id: "home",
            name: "Dashboard",
            path: "/home",
            image: Dashboard,
            permission: null // Dashboard is always visible for super admin
        },

        {
            id: "total-companies",
            name: "Total Companies",
            path: "/home/total-companies",
            image: Company,
            add: "Add Company",
            company: "Company Information",
            permission: "Total Companies" // Requires "Company Management" permission
        },
        {
            id: "total-drivers",
            name: "Total Drivers",
            path: "/home/total-drivers",
            image: Driver,
            add: "Add Driver",
            info: "Driver Information",
            company: "Company Information",
            permission: "Total Drivers" // Requires "Driver Management" permission
        },
        {
            id: "total-linked-trips",
            name: "Total Linked Trips",
            path: "/home/total-linked-trips",
            image: Trip,
            company: "Trip Information",
            permission: "Total Linked Trips" // Requires "Trip Management" permission
        },
        {
            id: "total-meeting-links",
            name: "Total Meeting Links",
            path: "/home/total-meeting-links",
            image: MeetingLink,
            company: "Trip Information",
            permission: "Total Meeting Links" // Requires "Meeting Management" permission
        },
        {
            id: "total-users",
            name: "Users",
            path: "/home/total-users",
            image: users,
            add: "Add User",
            company: "User Information",
            permission: "Users" // Requires "User Management" permission
        },
        {
            id: "total-sos-amount",
            name: "Armed Sos Amount",
            path: "/home/total-sos-amount",
            image: ArmedSos,
            company: "Sos Information",
            permission: "Armed Sos Amount" // Requires "SOS Management" permission
        },
        {
            id: "settings",
            name: "Settings",
            path: "/home/settings",
            image: settings,
            permission: "Settings" // Requires "Settings Management" permission
        },
        {
            id: "total-sales-agent",
            name: "Sales Agent",
            path: "/home/total-sales-agent",
            image: salesagent,
            info: "Sales Agent Information",
            permission: "Sales Agent" // Requires "Sales Agent Management" permission
        },
        {
            id: "total-saps-wanted",
            name: "SAPS Wanted",
            path: "/home/total-saps-wanted",
            image: SapsWanted,
            add: "Add Saps Member",
            info: "Suspect Information",
            permission: "SAPS Wanted" // Requires "SAPS Management" permission
        },
        {
            id: "reports",
            name: "Reports",
            path: "/home/reports",
            image: Report,
            permission: "Reports" // Requires "Reports Management" permission
        },
        {
            id: "total-missing-person",
            name: "Missing Persons",
            path: "/home/total-missing-person",
            image: MissingPersonIcon,
            company: "Missing Person Sighting Details",
            permission: "Missing Persons" // Requires "Missing Person Management" permission
        },
        {
            id: "total-stolen-cars",
            name: "Stolen Cars",
            path: "/home/total-stolen-cars",
            image: StolenCarIcon,
            company: "Stolen Car Sighting Details",
            permission: "Stolen Car" // Requires "Stolen Car Management" permission
        },
        {
            id: "crime-reports",
            name: "Crime Reporting",
            path: "/home/crime-reports",
            image: Crime,
            company: "Crime Report",
            add: "Forward To Police Unit",
            permission: "Crime Reporting" // Requires "Crime Management" permission
        },
        {
            id: "total-suspect",
            name: "Suspect Sightings",
            path: "/home/total-suspect",
            image: SuspectIcon,
            company: "Suspect Sighting Details",
            permission: "Suspect Sightings" // Requires "Suspect Management" permission
        },
        {
            id: "flagged-report",
            name: "Flagged Report",
            path: "/home/flagged-report",
            image: Flagged,
            permission: "Flagged Report" // Requires "Flagged Report Management" permission
        },
        {
            id: "change-password",
            name: "Change Password",
            path: "/home/change-password",
            image: changePasswordIcon,
            permission: "Change Password" // Change password is always visible
        },
        {
            id: "logout",
            name: "Logout",
            image: Logout,
            permission: null // Logout is always visible
        }
    ];

    // Filter menu items based on user permissions
    const filteredMenuItems = allMenuItems.filter(item => {
        if (!item.permission) {
            return true;
        }
        return activePermissions.includes(item.permission);
    });

    return filteredMenuItems;
};

export const salesAgent_menulist = (permissionsData) => {
    // Process permissions data if provided
    let activePermissions = [];
    
    if (permissionsData && permissionsData.data && permissionsData.data.data && permissionsData.data.data.permissions) {
        // Extract active permission names from API response
        activePermissions = permissionsData.data.data.permissions
            .filter(permission => permission.status === 'active')
            .map(permission => permission.name);
    }

    // Define all menu items with their required permissions
    const allMenuItems = [
        {
            id: "sales-home",
            name: "Home",
            path: "/sales-home",
            image: Dashboard,
            permission: "Sales Agent" // Home is always visible
        },
        {
            id: "logout",
            name: "Logout",
            image: Logout,
            permission: null // Logout is always visible
        }
    ];

    // Filter menu items based on user permissions
    const filteredMenuItems = allMenuItems.filter(item => {
        if (!item.permission) {
            return true;
        }
        return activePermissions.includes(item.permission);
    });

    return filteredMenuItems;
};

export const Companyadmin_menulist = (permissionsData) => {
    const id = localStorage.getItem("userID");
    
    // Process permissions data if provided
    let activePermissions = [];
    
    if (permissionsData && permissionsData.data && permissionsData.data.data && permissionsData.data.data.permissions) {
        // Extract active permission names from API response
        activePermissions = permissionsData.data.data.permissions
            .filter(permission => permission.status === 'active')
            .map(permission => permission.name);
    }
    

    // Define all menu items with their required permissions
    const allMenuItems = [
        {
            id: "home",
            name: "Home",
            path: "/home",
            image: Dashboard,
            permission: null // Home is always visible
        },
        {
            id: "total-drivers",
            name: "Total Drivers",
            path: `/home/total-drivers/${id}`,
            image: Driver,
            add: "Add Drivers",
            info: "Vehicle Information",
            company: "Company Information",
            permission: "Driver" // Requires "Driver" permission
        },
        {
            id: "total-linked-trips",
            name: "Total Linked Trips",
            path: "/home/total-linked-trips",
            image: Trip,
            company: "Trip Information",
            permission: "Total Linked Trips" // Requires "Trip" permission
        },
        {
            id: "total-meeting-links",
            name: "Total Meeting Links",
            path: "/home/total-meeting-links",
            image: MeetingLink,
            company: "User Information",
            permission: "Total Meeting Links" // Requires "Meeting Links" permission
        },
        {
            id: "total-armed-sos",
            name: "Armed Sos Amount",
            path: "/home/total-sos-amount",
            image: ArmedSos,
            company: "User Information",
            permission: "Armed Sos Amount" // Requires "Armed SOS" permission
        },
        {
            id: "total-users",
            name: "Users",
            path: "/home/total-users",
            image: users,
            company: "User Information",
            permission: "User" // Requires "User" permission
        },
        {
            id: "profile",
            name: "Profile",
            path: "/home/profile",
            image: profile,
            permission: "Profile" // Profile might be always visible
        },
        {
            id: "logout",
            name: "Logout",
            image: Logout,
            permission: null // Logout is always visible
        }
    ];

    // Filter menu items based on user permissions
    const filteredMenuItems = allMenuItems.filter(item => {
        if (!item.permission) {
            return true;
        }
        return activePermissions.includes(item.permission);
    });

    return filteredMenuItems;
};