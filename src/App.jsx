import { RouterProvider, createBrowserRouter } from "react-router-dom";

import Layout from "./common/Layout";
import Report from "./pages/Report";
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
import AddSosAmount from "./pages/AddSosAmount";
import ArmedSosAmount from "./pages/ArmedSosAmount";
import ListOfSosAmount from "./pages/ListOfSosAmount";
import "react-phone-input-2/lib/style.css";
import "./App.css";
import { useJsApiLoader } from "@react-google-maps/api";
import { AuthGuard, LogGuard, RouteGuard } from "./common/Guard";
import ListOfTrips from "./pages/ListofTrips";
import PassangerInformation from "./pages/Passangerinformation";
import ListOfUsers from "./pages/ListOfUsers";
import AddUser from "./pages/AddUser";
import SosInformation from "./pages/SosInformation"
import ArmedSosDetails from "./pages/SosInformation";
import Notification from "./pages/Notification";
import AddService from "./pages/AddService";
import ListOfMeetingLinkTrips from "./pages/ListOfMeetingLinkTrip";
import ChangePassword from "./pages/ChangePassword";

import GoogleMaps from "./common/GoogleMaps";

// Define your map loader options once here
const mapLoaderOptions = {
    id: 'google-map-script-main',
    googleMapsApiKey: import.meta.env.VITE_MAP_API_KEY,
};

function App() {
    const { isLoaded, loadError } = useJsApiLoader(mapLoaderOptions);

    if (loadError) {
        return (
            <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
                Error loading Google Maps: {loadError.message}
            </div>
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
                    element: <Home isMapLoaded={isLoaded} />
                },
                {
                    path: 'reports',
                    element: <Report />
                },
                {
                    path: 'notification',
                    element: <Notification />
                },
                {
                    path: "change-password",
                    element: <ChangePassword />
                },
                {
                    path: "hotspot/location",
                    element: <GoogleMaps isMapLoaded={isLoaded} />
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
                            path: "sos-information/:id",
                            element: <SosInformation />
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
                            element: <GoogleMaps isMapLoaded={isLoaded} />
                        },
                    ]
                },
                {
                    path: "total-meeting-link-trips",
                    children: [
                        {
                            path: "",
                            element: <ListOfMeetingLinkTrips />
                        },
                        {
                            path: "user-information/:id",
                            element: <PassangerInformation />
                        },
                        {
                            path: "location",
                            element: <GoogleMaps isMapLoaded={isLoaded} />
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
                    path: "total-sos-amount",
                    children: [
                        {
                            path: "",
                            element: <ListOfSosAmount />
                        },
                        {
                            path: "add-sos",
                            element: <AddSosAmount />
                        },
                        {
                            path: "add-service",
                            element: <AddService />
                        },
                        {
                            path: "sos-amount/:id",
                            element: <ArmedSosAmount />
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
    return (
        <>
            <RouterProvider router={router} />
        </>
    );
}


export default App;
