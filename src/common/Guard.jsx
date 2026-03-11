/* eslint-disable react/prop-types */
import { Navigate } from "react-router-dom"
import { getFilteredMenulist } from "./Menulist"


export const AuthGuard = ({ children }) => {
    const auth = localStorage.getItem("accessToken")

    if (auth) {
        return children
    }

    else {
        return <Navigate to="/" />
    }
}

export const LogGuard = ({ children }) => {
    const auth = localStorage.getItem("accessToken")
    const role = localStorage.getItem("role")
    const storedPermissions = JSON.parse(localStorage.getItem("userPermissions") || "[]")

    if (!auth) {
        return children
    }

    const menulist = getFilteredMenulist(role, storedPermissions);
    const firstRoute = menulist.find(item => item.id !== "logout")?.path || "/home";

    return <Navigate to={firstRoute} />
}

export const RouteGuard = ({ children }) => {
    if (localStorage.getItem("role") === 'super_admin') {
        return children
    }

    else {
        return <Navigate to="/home" />
    }
}
export const SalesGuard = ({ children }) => {
    if (localStorage.getItem('role') === 'sales_agent') {
        return children
    }
    else {
        return <Navigate to='/sales-home' />
    }
}