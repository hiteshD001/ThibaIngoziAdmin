import { RouterProvider, createBrowserRouter, HashRouter } from "react-router-dom";

import Layout from "./common/Layout";

import { Login } from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import RequestHardware from "./pages/RequestHardware";
import PaymentSuceed from "./pages/PaymentSuceed";
import Home from "./pages/Home";
import ListOfCompanies from "./pages/ListOfCompanies";
import AddCompany from "./pages/AddCompany";
import ListOfDrivers from "./pages/ListOfDrivers";
import AddDriver from "./pages/AddDriver";
import VehicleInformation from "./pages/VehicleInformation";
import HardwareManagement from "./pages/HardwareManagement";
import Profile from "./pages/Profile";

import "react-phone-input-2/lib/style.css";
import "./App.css";
import { AuthGuard, LogGuard, RouteGuard } from "./common/Guard";
import GoogleMaps from "./common/GoogleMaps";

function App() {
    return (
         <HashRouter>
            <RouterProvider router={router} />
        </HashRouter>
    );
}

const router = createBrowserRouter([
    {
        path: "/",
        element: <LogGuard><Login /></LogGuard>
    },
    {
        path: "/home",
        element: <AuthGuard><Layout /></AuthGuard>,
        children: [
            {
                path: "",
                element: <Home />
            },
            {
                path: "hotspot/location",
                element: <GoogleMaps />
            },
            {
                path: "total-companies",
                children: [
                    {
                        path: "",
                        element: <RouteGuard><ListOfCompanies /></RouteGuard>
                    },
                    {
                        path: "add-company",
                        element: <RouteGuard><AddCompany /></RouteGuard>
                    }
                ]
            },
            {
                path: "total-drivers",
                children: [
                    {
                        path: "",
                        element: <ListOfDrivers />
                    },
                    {
                        path: ":id",
                        element: <ListOfDrivers />
                    },
                    {
                        path: "add-driver",
                        element: <AddDriver />
                    },
                    {
                        path: "vehicle-information/:id",
                        element: <VehicleInformation />
                    }
                ]
            },
            {
                path: "hardware-management",
                element: <RouteGuard><HardwareManagement /></RouteGuard>
            },
            {
                path: "profile",
                element: <Profile />
            },
        ]
    },
    {
        path: "/reset-password",
        element: <ResetPassword />
    },
    {
        path: "/request-hardware",
        element: <RequestHardware />
    },
    {
        path: "/payment-suceed",
        element: <PaymentSuceed />
    },

])
export default App;
