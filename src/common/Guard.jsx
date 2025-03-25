/* eslint-disable react/prop-types */
import { Navigate } from "react-router-dom"


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

    if (!auth) {
        return children
    }

    else {
        return <Navigate to="/home" />
    }
}

export const RouteGuard = ({ children }) => {
    if (localStorage.getItem("role") === 'super_admin') {
        return children
    }

    else {
        return <Navigate to="/home" />
    }
}