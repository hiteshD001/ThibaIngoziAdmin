import { lazy, Suspense, useMemo } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Layout from "./common/Layout";
import Loader from "./common/Loader";
import "react-phone-input-2/lib/style.css";
import "./App.css";
import { AuthGuard, LogGuard, RouteGuard, SalesGuard } from "./common/Guard";
import { MapsProvider } from "./contexts/MapsContext";
import { WebSocketProvider } from "./API Calls/WebSocketContext";

const Report = lazy(() => import("./pages/Report"));
const Login = lazy(() => import("./pages/Login").then((m) => ({ default: m.Login })));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const RequestHardware = lazy(() => import("./pages/RequestHardware"));
const PaymentSuceed = lazy(() => import("./pages/PaymentSuceed"));
const PaymentFailed = lazy(() => import("./pages/PaymentFailed"));
const PaymentExpired = lazy(() => import("./pages/PaymentExpired"));
const Home = lazy(() => import("./pages/Home"));
const ListOfCompanies = lazy(() => import("./pages/ListOfCompanies"));
const AddCompany = lazy(() => import("./pages/AddCompany"));
const ListOfDrivers = lazy(() => import("./pages/ListOfDrivers"));
const AddDriver = lazy(() => import("./pages/AddDriver"));
const FlaggedReport = lazy(() => import("./pages/FlaggedReport"));
const VehicleInformation = lazy(() => import("./pages/VehicleInformation"));
const HardwareManagement = lazy(() => import("./pages/HardwareManagement"));
const Profile = lazy(() => import("./pages/Profile"));
const AddSosAmount = lazy(() => import("./pages/AddSosAmount"));
const ArmedSosAmount = lazy(() => import("./pages/ArmedSosAmount"));
const ListOfSosAmount = lazy(() => import("./pages/ListOfSosAmount"));
const ListOfTrips = lazy(() => import("./pages/ListofTrips"));
const PassangerInformation = lazy(() => import("./pages/Passangerinformation"));
const ListOfUsers = lazy(() => import("./pages/ListOfUsers"));
const AddUser = lazy(() => import("./pages/AddUser"));
const SosInformation = lazy(() => import("./pages/SosInformation"));
const AddService = lazy(() => import("./pages/AddService"));
const ListOfMeetingLinkTrips = lazy(() => import("./pages/ListOfMeetingLinkTrip"));
const ChangePassword = lazy(() => import("./pages/ChangePassword"));
const ListofMissingPerson = lazy(() => import("./pages/MissingPerson/ListofMissingPerson"));
const MissingPersonDetails = lazy(() => import("./pages/MissingPerson/MissingPersonDetails"));
const CompanyInformation = lazy(() => import("./pages/CompanyInformation"));
const NotificationDetail = lazy(() => import("./pages/NotificationDetail"));
const Notfication = lazy(() => import("./pages/Notification"));
const ListOfStolenCars = lazy(() => import("./pages/StolenCars/ListOfStolenCars"));
const StolenCarDetails = lazy(() => import("./pages/StolenCars/StolenCarDetails"));
const SuspectDetail = lazy(() => import("./pages/suspect/SuspectDetail"));
const ListOfSuspect = lazy(() => import("./pages/suspect/ListOfSuspect"));
const ListOfSapsWanted = lazy(() => import("./pages/Saps/ListOfSapsWanted"));
const GoogleMaps = lazy(() => import("./common/GoogleMaps"));
const WantedInformation = lazy(() => import("./pages/Saps/WantedInformation"));
const AddSapsMember = lazy(() => import("./pages/Saps/AddSapsMember"));
const AddSapsWanted = lazy(() => import("./pages/Saps/AddSapsWanted"));
const ListOfCrimeReports = lazy(() => import("./pages/crimeReports/ListOfCrimeReports"));
const ListOfArcheivedCrimeReports = lazy(() => import("./pages/crimeReports/ListOfArcheivedCrimeReports"));
const CrimeReport = lazy(() => import("./pages/crimeReports/CrimeReport"));
const ForwardToPolice = lazy(() => import("./pages/crimeReports/ForwardToPolice"));
const WorkInProgress = lazy(() => import("./common/WorkInProgress"));
const Confirmation = lazy(() => import("./pages/crimeReports/Confirmation"));
const ListOfViewArcheived = lazy(() => import("./pages/ListOfViewArcheived"));
const ListOfViewArcheivedMeeting = lazy(() => import("./pages/ListOfViewArcheivedMeeting"));
const ListOfViewArcheivedMissingPerson = lazy(() => import("./pages/ListOfViewArcheivedMissingPerson"));
const ListOfViewArcheivedMissingVehicale = lazy(() => import("./pages/ListOfViewArcheivedMissingVehicale"));
const ListOfSalesAgent = lazy(() => import("./pages/SalesAgent/ListOfSalesAgent"));
const AddAgent = lazy(() => import("./pages/SalesAgent/AddAgent"));
const AgentInformation = lazy(() => import("./pages/SalesAgent/AgentInformation"));
const SalesAgentHome = lazy(() => import("./pages/SalesAgentHome"));
const Reset2FAPage = lazy(() => import("./pages/Reset2FAPage"));
const RequestUsers = lazy(() => import("./pages/RequestUsers"));
const AdminSetting = lazy(() => import("./pages/setting/AdminSetting"));
const EHailingView = lazy(() => import("./pages/e-hailing view/EHailingView"));
const VerificationView = lazy(() => import("./pages/verificationView/VerificationView"));
const ListOfPoliceUnits = lazy(() => import("./pages/police-unit/ListOfPoliceUnits"));
const AddPoliceUnit = lazy(() => import("./pages/police-unit/AddPoliceUnit"));
const PoliceUnitInformation = lazy(() => import("./pages/police-unit/PoliceUnitInformation"));
const CrimeReportRequestUsers = lazy(() => import("./pages/crimeReports/CrimeReportRequestUsers"));

function App() {
    const router = useMemo(
        () =>
            createBrowserRouter([
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
                    path: '/sales-home',
                    element: <AuthGuard><Layout /></AuthGuard>,
                    children: [
                        {
                            path: "",
                            element: <SalesGuard><SalesAgentHome /></SalesGuard>
                        },
                        {
                            path: "user-information/:id",
                            element: <PassangerInformation />
                        }
                    ]
                },
                {
                    path: "/home",
                    element: <AuthGuard><MapsProvider><WebSocketProvider><Layout /></WebSocketProvider></MapsProvider></AuthGuard>,
                    children: [
                        {
                            path: "",
                            element: <Home />
                        },
                        {
                            path: "verification-view",
                            element: <VerificationView />
                        },
                        {
                            path: 'reports',
                            element: <WorkInProgress />
                        },
                        {
                            path: 'notification',
                            element: <WorkInProgress />
                        },
                        {
                            path: 'notification/:id',
                            element: <NotificationDetail />
                        },
                        {
                            path: "change-password",
                            element: <ChangePassword />
                        },
                        {
                            path: "hotspot/location",
                            element: <GoogleMaps />
                        },
                        {
                            path: "request-reached-users/:id",
                            element: <RequestUsers />
                        },
                        {
                            path: "request-accepted-users/:id",
                            element: <RequestUsers />
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
                                },
                                {
                                    path: "company-information/:id",
                                    element: <RouteGuard><CompanyInformation /></RouteGuard>
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
                            path: "total-linked-trips",
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
                                {
                                    path: "view-archeived",
                                    element: <ListOfViewArcheived />
                                },
                            ]
                        },
                        {
                            path: "total-meeting-links",
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
                                    element: <GoogleMaps />
                                },
                                {
                                    path: "view-archeived",
                                    element: <ListOfViewArcheivedMeeting />
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
                            path: "total-missing-person",
                            children: [
                                {
                                    path: "",
                                    element: <ListofMissingPerson />
                                    // element: <WorkInProgress />

                                },
                                {
                                    path: 'person-information/:id',
                                    element: <MissingPersonDetails />
                                },
                                {
                                    path: "view-archeived-person",
                                    element: <ListOfViewArcheivedMissingPerson />
                                },

                            ]
                        },
                        {
                            path: "total-sales-agent",
                            children: [
                                {
                                    path: "",
                                    element: <ListOfSalesAgent />
                                },
                                {
                                    path: "add-agent",
                                    element: <AddAgent />
                                },
                                {
                                    path: "agent-information/:id",
                                    element: <AgentInformation />
                                },
                            ]
                        },
                        {
                            path: "total-saps-wanted",
                            children: [
                                {
                                    path: "",
                                    // element: <ListOfSapsWanted />
                                    element: <WorkInProgress />

                                },
                                {
                                    path: 'add-wanted',
                                    element: <AddSapsWanted />
                                },
                                {
                                    path: "wanted-inforamtion/:id",
                                    element: <WantedInformation />
                                },
                                {
                                    path: 'add-saps-member',
                                    element: <AddSapsMember />
                                }
                            ]
                        },
                        {
                            path: "total-stolen-cars",
                            children: [
                                {
                                    path: "",
                                    element: <ListOfStolenCars />
                                    // element: <WorkInProgress />

                                },
                                {
                                    path: 'stolen-car/:id',
                                    element: <StolenCarDetails />
                                },
                                {
                                    path: "view-archeived-vehicale",
                                    element: <ListOfViewArcheivedMissingVehicale />
                                },
                            ]
                        },
                        {
                            path: "total-suspect",
                            children: [
                                {
                                    path: "",
                                    // element: <ListOfSuspect />
                                    element: <WorkInProgress />

                                },
                                {
                                    path: 'suspect-information/:id',
                                    element: <SuspectDetail />
                                },
                            ]
                        },
                        {
                            path: "flagged-report",
                            children: [
                                {
                                    path: "",
                                    // element: <FlaggedReport />
                                    element: <WorkInProgress />

                                },
                            ]
                        },
                        {
                            path: "crime-reports",
                            children: [
                                {
                                    path: "",
                                    element: <ListOfCrimeReports />
                                },
                                {
                                    path: "crime-report/:id",
                                    element: <CrimeReport />
                                }, {
                                    path: 'forward-to-police',
                                    // element: <WorkInProgress />
                                    element: <ForwardToPolice />
                                }, {
                                    path: 'confirmation',
                                    element: <Confirmation />
                                },
                                {
                                    path: "view-archeived-crime-report",
                                    element: <ListOfArcheivedCrimeReports />
                                },
                                {
                                    path: "request-reached-users/:id",
                                    element: <CrimeReportRequestUsers />
                                },
                                {
                                    path: "request-accepted-users/:id",
                                    element: <CrimeReportRequestUsers />
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
                            path: 'work-in-progress',
                            element: <WorkInProgress />
                        },
                        {
                            path: "settings",
                            element: <AdminSetting />
                        },
                        {
                            path: "e-hailing-view",
                            element: <EHailingView />
                        },
                        {
                            path: "police-unit",
                            children: [
                                {
                                    path: "",
                                    element: <ListOfPoliceUnits />
                                },
                                {
                                    path: "add-police-unit",
                                    element: <RouteGuard><AddPoliceUnit /></RouteGuard>
                                },
                                {
                                    path: "police-unit-information/:id",
                                    element: <RouteGuard><PoliceUnitInformation /></RouteGuard>
                                }
                            ]
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
                    path: '/reset-2fa',
                    element: <Reset2FAPage />
                }


            ]),
        []
    );
    return (
        <Suspense fallback={<Loader />}>
            <RouterProvider router={router} />
        </Suspense>
    );
}


export default App;