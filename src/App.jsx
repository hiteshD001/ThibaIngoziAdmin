import { RouterProvider, createBrowserRouter } from "react-router-dom";

import Layout from "./common/Layout";

import { Login } from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import RequestHardware from "./pages/RequestHardware";
import PaymentSuceed from "./pages/PaymentSuceed";
import PaymentFailed from "./pages/PaymentFailed";
import PaymentExpired from "./pages/PaymentExpired";


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
import ListOfTrips from "./pages/ListofTrips";
import PassangerInformation from "./pages/Passangerinformation";
import ListOfUsers from "./pages/ListOfUsers";
import AddUser from "./pages/AddUser";
import SosInformation from "./pages/SosInformation"
import ArmedSosSplitAmount from "./pages/ArmedSosSplitAmount";

function App() {
    return (
        <>
            <RouterProvider router={router} />
        </>
    );
}

const router = createBrowserRouter([
    {
        path: "/",
        element: <LogGuard><Login /></LogGuard>
    },
    {
        path: "/payment-suceed",
        element: <PaymentSuceed />
    },
    {
        path: "/payment-failed",
        element: <PaymentFailed />
    },
    {
        path: "/payment-expired",
        element: <PaymentExpired />
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
                        path: "driver-information/:id",
                        element: <VehicleInformation />
                    },
                    {
                        path:"sos-information/:id",
                        element:<SosInformation/>
                    }
                ]
            },
            {
                path: "total-trips",
                children: [
                    {
                        path: "",
                        element: <ListOfTrips />
                    },
                    {
                        path: "user-information/:id",
                        element: <PassangerInformation />
                    },
                    {
                        path: "location",
                        element: <GoogleMaps />
                    },
                ]
            },
            {
                path: "total-users",
                children: [
                    {
                        path: "",
                        element: <ListOfUsers />
                    },
                    {
                        path: "add-user",
                        element: <AddUser />
                    },
                    {
                        path: "user-information/:id",
                        element: <PassangerInformation />
                    },
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
            {
                path: "armed-sos-split-amount",
                element: <ArmedSosSplitAmount />
            }
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


])
export default App;
