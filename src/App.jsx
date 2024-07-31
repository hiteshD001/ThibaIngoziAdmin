import { RouterProvider, createBrowserRouter } from "react-router-dom";

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

import "./App.css";

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
        element: <Login />
    },
    {
        path: "/home",
        element: <Layout />,
        children: [
            {
                path: "",
                element: <Home />
            },
            {
                path: "total-companies",
                children: [
                    {
                        path: "",
                        element: <ListOfCompanies />
                    },
                    {
                        path: "add-company",
                        element: <AddCompany />
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
                        path: "add-driver",
                        element: <AddDriver />
                    },
                    {
                        path: "vehicle-information",
                        element: <VehicleInformation />
                    }
                ]
            },
            {
                path: "hardware-management",
                element: <HardwareManagement />
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
