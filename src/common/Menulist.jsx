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
import settings from "../assets/images/setting-2.svg";
import eHailing from "../assets/images/eHailing.svg";
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

const userId = localStorage.getItem('userID')

export const allMenuItems = [
    {
        id: "home",
        name: "Dashboard",
        path: "/home",
        image: Dashboard,
        permission: "Dashboard" // Standardized permission name
    },

    {
        id: "total-companies",
        name: "Total Companies",
        path: "/home/total-companies",
        image: Company,
        add: "Add Company",
        company: "Company Information",
        permission: "Total Companies"
    },
    {
        id: "total-drivers",
        name: "Total Drivers",
        path: `/home/total-drivers`,
        image: Driver,
        add: "Add Driver",
        info: "Driver Information",
        company: "Company Information",
        permission: "Total Drivers"
    },
    {
        id: "total-linked-trips",
        name: "Total Linked Trips",
        path: "/home/total-linked-trips",
        image: Trip,
        company: "Trip Information",
        permission: "Total Linked Trips"
    },
    {
        id: "total-meeting-links",
        name: "Total Meeting Links",
        path: "/home/total-meeting-links",
        image: MeetingLink,
        company: "Trip Information",
        permission: "Total Meeting Links"
    },
    {
        id: "total-users",
        name: "Users",
        path: "/home/total-users",
        image: users,
        add: "Add User",
        company: "User Information",
        permission: "Users"
    },
    {
        id: "total-sos-amount",
        name: "Armed Sos Amount",
        path: "/home/total-sos-amount",
        image: ArmedSos,
        company: "Sos Information",
        permission: "Armed Sos Amount"
    },
    {
        id: "total-sales-agent",
        name: "Sales Agent",
        path: "/home/total-sales-agent",
        image: salesagent,
        info: "Sales Agent Information",
        permission: "Sales Agent"
    },
    {
        id: "total-missing-person",
        name: "Missing Persons",
        path: "/home/total-missing-person",
        image: MissingPersonIcon,
        company: "Missing Person Sighting Details",
        permission: "Missing Persons"
    },
    {
        id: "total-stolen-cars",
        name: "Stolen Cars",
        path: "/home/total-stolen-cars",
        image: StolenCarIcon,
        company: "Stolen Car Sighting Details",
        permission: "Stolen Cars"
    },
    {
        id: "crime-reports",
        name: "Crime Reporting",
        path: "/home/crime-reports",
        image: Crime,
        company: "Crime Report",
        add: "Forward To Police Unit",
        permission: "Crime Reporting"
    },
    {
        id: "total-suspect",
        name: "Suspect Sightings",
        path: "/home/total-suspect",
        image: SuspectIcon,
        company: "Suspect Sighting Details",
        permission: "Suspect Sightings"
    },
    {
        id: "settings",
        name: "Settings",
        path: "/home/settings",
        image: settings,
        permission: "Settings"
    },
    {
        id: "flagged-report",
        name: "Flagged Report",
        path: "/home/flagged-report",
        image: Flagged,
        permission: "Flagged Report"
    },
    {
        id: "change-password",
        name: "Change Password",
        path: "/home/change-password",
        image: changePasswordIcon,
        permission: "Change Password"
    },
    {
        id: "e-hailing-view",
        name: "e-Hailing View",
        path: "/home/e-hailing-view",
        image: eHailing,
        company: "e-Hailing Views",
        permission: "e-Hailing View"
    },
    {
        id: "logout",
        name: "Logout",
        image: Logout,
        permission: null
    },
];

export const superadmin_menulist = (permissionsData) => {
    let activePermissions = [];
    if (permissionsData && permissionsData.data && permissionsData.data.data && permissionsData.data.data.permissions) {
        activePermissions = permissionsData.data.data.permissions
            .filter(permission => permission.status === 'active')
            .map(permission => permission.name);
    }
    return allMenuItems.filter(item => !item.permission || activePermissions.includes(item.permission));
};

export const salesAgent_menulist = (permissionsData) => {
    let activePermissions = [];
    if (permissionsData && permissionsData.data && permissionsData.data.data && permissionsData.data.data.permissions) {
        activePermissions = permissionsData.data.data.permissions
            .filter(permission => permission.status === 'active')
            .map(permission => permission.name);
    }
    return allMenuItems.filter(item => !item.permission || activePermissions.includes(item.permission));
};

export const Companyadmin_menulist = (permissionsData) => {
    const userId = localStorage.getItem('userID');
    let activePermissions = [];
    if (permissionsData && permissionsData.data && permissionsData.data.data && permissionsData.data.data.permissions) {
        activePermissions = permissionsData.data.data.permissions
            .filter(permission => permission.status === 'active')
            .map(permission => permission.name);
    }
    return allMenuItems.filter(item => !item.permission || activePermissions.includes(item.permission)).map(item => {
        if (item.id === "total-drivers") {
            return { ...item, path: `/home/total-drivers/${userId}` };
        }
        return item;
    });
};

export const passenger_menulist = (permissionsData) => {
    let activePermissions = [];
    if (permissionsData && permissionsData.data && permissionsData.data.data && permissionsData.data.data.permissions) {
        activePermissions = permissionsData.data.data.permissions
            .filter(permission => permission.status === 'active')
            .map(permission => permission.name);
    }
    return allMenuItems.filter(item => !item.permission || activePermissions.includes(item.permission));
};

export const driver_menulist = (permissionsData) => {
    let activePermissions = [];
    if (permissionsData && permissionsData.data && permissionsData.data.data && permissionsData.data.data.permissions) {
        activePermissions = permissionsData.data.data.permissions
            .filter(permission => permission.status === 'active')
            .map(permission => permission.name);
    }
    return allMenuItems.filter(item => !item.permission || activePermissions.includes(item.permission));
};

/**
 * Centralized function to get the filtered menu list for any role
 */
export const getFilteredMenulist = (role, permissionsData) => {
    let activePermissions = ["Dashboard"]; // Dashboard is always permitted

    if (permissionsData && permissionsData.data && permissionsData.data.data && permissionsData.data.data.permissions) {
        const apiPermissions = permissionsData.data.data.permissions
            .filter(permission => permission.status === 'active')
            .map(permission => permission.name);
        activePermissions = [...new Set([...activePermissions, ...apiPermissions])];
    } else if (Array.isArray(permissionsData)) {
        activePermissions = [...new Set([...activePermissions, ...permissionsData])];
    }

    const permissionsArg = {
        data: { data: { permissions: activePermissions.map(p => ({ name: p, status: 'active' })) } }
    };

    if (role === 'super_admin') return superadmin_menulist(permissionsArg);
    if (role === 'company') return Companyadmin_menulist(permissionsArg);
    if (role === 'sales_agent') return salesAgent_menulist(permissionsArg);
    if (role === 'passenger' || role === 'Passanger') return passenger_menulist(permissionsArg);
    if (role === 'driver' || role === 'Driver') return driver_menulist(permissionsArg);

    return allMenuItems.filter(item => {
        if (item.id === "logout") return true;
        if (!item.permission) return true;
        return activePermissions.includes(item.permission);
    });
};