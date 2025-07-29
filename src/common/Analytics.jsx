import { useEffect, useState } from "react";
import {
    useGetChartData,
    useGetHotspot,
    useGetUserList,
    useGetNotificationType,
} from "../API Calls/API";
import {
    Grid,
    Typography,
    Select,
    Button,
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions, MenuItem,
    FormControl,
    InputLabel,
    IconButton,
} from "@mui/material";
import CustomDateRangePicker from "./CustomDateRangePicker";
import calender from '../assets/images/calender.svg';
import exportdiv from '../assets/images/exportdiv.svg';
import Loader from "./Loader";
import div from '../assets/images/div.svg'
import div2 from '../assets/images/div2.svg'
import div3 from '../assets/images/div3.svg'
import { FaLocationDot } from "react-icons/fa6";
import CustomChart from "./CustomChart";
import { useNavigate } from "react-router-dom";

const Analytics = ({ id }) => {
    const [time, settime] = useState("today");
    const [timeTitle, settimeTitle] = useState("Today");
    const [activeUser, setactiveUser] = useState(0);
    const notificationTypes = useGetNotificationType();
    const [selectedNotification, setSelectedNotification] = useState("");
    const [range, setRange] = useState([
        {
            startDate: new Date(),
            endDate: new Date(),
            key: 'selection'
        }
    ]);
    const [category, setCategory] = useState('');

    const nav = useNavigate();

    const driverList = useGetUserList("driver list", "driver", id);
    const companyList = useGetUserList("company list", "company");
    const hotspot = useGetHotspot(time, id, selectedNotification);
    const chartData = useGetChartData(selectedNotification);

    const handleTimeChange = (e) => {
        settime(e.target.value);
    };

    const handleNotificationChange = (e) => {
        setSelectedNotification(e.target.value);
    };

    useEffect(() => {
        if (notificationTypes.data?.data.length > 0 && !selectedNotification) {
            setSelectedNotification(notificationTypes.data?.data[0]?._id);
        }
    }, [notificationTypes]);

    useEffect(() => {
        switch (time) {
            case "today":
                setactiveUser(
                    driverList.data?.data.totalActiveDriversToday || 0
                );
                settimeTitle("Today");
                break;
            case "yesterday":
                setactiveUser(
                    driverList.data?.data.totalActiveDriversYesterday || 0
                );
                settimeTitle("Yesterday");
                break;
            case "this_week":
                setactiveUser(
                    driverList.data?.data.totalActiveDriversThisWeek || 0
                );
                settimeTitle("This Week");
                break;
            case "this_month":
                setactiveUser(
                    driverList.data?.data.totalActiveDriversThisMonth || 0
                );
                settimeTitle("This Month");
                break;
            case "this_year":
                setactiveUser(
                    driverList.data?.data.totalActiveDriversThisYear || 0
                );
                settimeTitle("This Year");
                break;
            default:
                setactiveUser(0);
                settimeTitle("Today");
                break;
        }
    }, [driverList.data, time]);


    const handleExport = () => {
        // Add your export logic here
        console.log('Date Range:', dateRange);
        console.log('Category:', category);
        console.log('Format:', exportFormat);
        setOpen(false);
    };


    return (
        <div>
            <Grid container justifyContent="space-between" alignItems="center" spacing={2} mb={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="h5" fontWeight={550}>
                        Dashboard Overview
                    </Typography>
                    <Typography variant="body1" mt={1} color="text.secondary">
                        Welcome back, Mahene Benzane. Here's what's happening today.
                    </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <Box display="flex" justifyContent="flex-end" gap={2} flexWrap="wrap">
                        <Box display="flex" justifyContent="flex-end" gap={2} flexWrap="wrap">
                            <CustomDateRangePicker
                                value={range}
                                onChange={setRange}
                                icon={calender}
                            />

                            <Button
                                sx={{ height: '40px', width: '140px', borderRadius: '8px' }}
                                variant="outlined"
                                startIcon={<img src={exportdiv} alt="export" />}
                                size="small"
                                onClick={() => setOpen(true)}
                            >
                                Export
                            </Button>
                        </Box>
                    </Box>
                </Grid>
            </Grid>

            <div className="clearfix"></div>

            {localStorage.getItem("role") === "super_admin" && !id ? (
                <div className="row px-2">
                    <div className="col-md-4">
                        <div className="dash-counter orange">
                            <div>
                                <span>Total Companies</span>
                                <h3>{companyList.data?.data.totalUsers || 0}</h3>
                            </div>
                            <img src={div} alt="dash-counter" />
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="dash-counter blue">
                            <div>
                                <span>Active Users</span>
                                <h3>
                                    {driverList.data?.data.totalActiveDrivers || 0}
                                </h3>
                            </div>
                            <img src={div2} alt="dash-counter" />
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="dash-counter green">
                            <div><span>Users Active {timeTitle}</span>
                                <h3>{activeUser}</h3></div>
                            <img src={div3} alt="dash-counter" />

                        </div>
                    </div>
                </div>
            ) : (
                <div className="row">
                    <div className="col-md-6">
                        <div className="dash-counter blue">
                            <span>Active Users</span>
                            <h3>
                                {driverList.data?.data.totalActiveDrivers || 0}
                            </h3>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="dash-counter green">
                            <span>Users Active {timeTitle}</span>
                            <h3>
                                {driverList.data?.data
                                    .totalActiveDriversThisMonth || 0}
                            </h3>
                        </div>
                    </div>
                </div>
            )}

            <div className="clearfix"></div>

            {/* Notification Type Dropdown inside Hotspot Box */}
            <div className="filter-date">

            </div>
            <div className="row">
                <div className="col-md-12">
                    <div className="requests-chart">
                        <div className="row chart-heading">
                            <div className="col-md-9">
                                <h3>SOS Requests Over Time</h3>
                            </div>
                            <div className="col-md-3 d-flex justify-content-end">
                                <select
                                    className="form-select"
                                    value={selectedNotification}
                                    onChange={handleNotificationChange}
                                >
                                    <option value="">All Categories</option>
                                    {notificationTypes.data?.data?.map((type, index) => (
                                        <option key={index} value={type._id}>
                                            {type.type}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <CustomChart data={chartData} />
                    </div>
                </div>
                {/* <div className="col-md-4">
                    <div className="hotspot">
                        <h1>Hotspot</h1>
                        <div className="location-list">
                            {hotspot.isFetching ? (
                                <Loader />
                            ) : hotspot.data?.data.length === 0 ? (
                                <p>No data Found</p>
                            ) : (
                                hotspot.data?.data
                                    .sort((a, b) =>
                                        a.timesCalled > b.timesCalled ? -1 : 1
                                    )
                                    .map((d, index) => (
                                        <div className="location" key={index}>
                                            <span>{d.address || "N/A"}</span>
                                            <span>{d.timesCalled || 0}</span>
                                            <span>
                                                <FaLocationDot
                                                    className="viewlocation"
                                                    onClick={() =>
                                                        nav(
                                                            `/home/hotspot/location?lat=${d.lat}&long=${d.long}`
                                                        )
                                                    }
                                                />
                                            </span>
                                        </div>
                                    ))
                            )}
                        </div>
                    </div>
                </div> */}
            </div>
            {/* <div className="clearfix"></div> */}
        </div>
    );
};

export default Analytics;
