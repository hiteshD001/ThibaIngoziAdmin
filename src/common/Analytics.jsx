import { useEffect, useState } from "react";
import {
    useGetChartData,
    useGetHotspot,
    useGetUserList,
    useGetNotificationType,
} from "../API Calls/API";
import Loader from "./Loader";
import { FaLocationDot } from "react-icons/fa6";
import CustomChart from "./CustomChart";
import { useNavigate } from "react-router-dom";
import { Grid, Box, Typography, Paper } from "@mui/material";

const Analytics = ({ id }) => {
    const [time, settime] = useState("today");
    const [timeTitle, settimeTitle] = useState("Today");
    const [activeUser, setactiveUser] = useState(0);
    const notificationTypes = useGetNotificationType();
    const [selectedNotification, setSelectedNotification] = useState("all");

    const nav = useNavigate();

    const driverList = useGetUserList("driver list", "driver", id);
    const companyList = useGetUserList("company list", "company");


    const hotspot = useGetHotspot(time, id, selectedNotification);
    const chartData = useGetChartData(id, time, selectedNotification);

    const handleTimeChange = (e) => {
        settime(e.target.value);
    };

    const handleNotificationChange = (e) => {
        setSelectedNotification(e.target.value);
    };

    useEffect(() => {
        if (notificationTypes?.data?.data?.length > 0 && !selectedNotification) {
            setSelectedNotification(notificationTypes.data?.data[23]?._id);
        }
    }, [notificationTypes]);

    useEffect(() => {
        console.log('test', driverList)
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

    return (
        <div>
            <div className="row">
                <div className="col-md-12">
                    <div className="filter-date">
                        <select
                            className="form-select"
                            value={time}
                            onChange={handleTimeChange}
                        >
                            <option value="today">Today</option>
                            <option value="yesterday">Yesterday</option>
                            <option value="this_week">This week</option>
                            <option value="this_month">This Month</option>
                            <option value="this_year">This Year</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="clearfix"></div>

            {localStorage.getItem("role") === "super_admin" && !id ? (
                <div className="row">
                    <div className="col-md-4">
                        <div className="dash-counter">
                            <span>Total Companies</span>
                            <h3>{companyList.data?.data.totalUsers || 0}</h3>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="dash-counter">
                            <span>Active Users</span>
                            <h3>
                                {driverList.data?.data.totalActiveDrivers || 0}
                            </h3>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="dash-counter">
                            <span>Users Active {timeTitle}</span>
                            <h3>{activeUser}</h3>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="row">
                    <div className="col-md-6">
                        <div className="dash-counter">
                            <span>Active Users</span>
                            <h3>
                                {driverList.data?.data.totalActiveDrivers || 0}
                            </h3>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="dash-counter">
                            <span>Users Active {timeTitle}</span>
                            <h3>
                                {activeUser || 0}
                            </h3>
                        </div>
                    </div>
                </div>
            )}

            <div className="clearfix"></div>

            {/* Notification Type Dropdown inside Hotspot Box */}
            <div className="filter-date">
                <select
                    className="form-select"
                    value={selectedNotification}
                    onChange={handleNotificationChange}
                >
                    <option value="all">All</option>
                    {
                        notificationTypes?.data?.data && Array.isArray(notificationTypes?.data?.data) && notificationTypes.data.data.map((type, index) => (
                            <option key={index} value={type._id}>
                                {type.type}
                            </option>
                        ))
                    }
                </select>
            </div>
            <Grid container spacing={2} mb={4}>
                {/* SOS Requests Chart */}
                <Grid size={{ xs: 12, md: 8 }} sx={{ backgroundColor: '#f7f9fb', borderRadius: '16px' }}>
                    <Box sx={{ p: 2, height: "100%" }}>
                        <Box mb={2}>
                            <Typography variant="h6" fontWeight="bold">
                                SOS Requests
                            </Typography>
                        </Box>
                        <CustomChart data={chartData} />
                    </Box>
                </Grid>

                {/* Hotspot Section */}
                <Grid size={{ xs: 12, md: 4 }} sx={{ backgroundColor: 'rgb(229, 236, 246)', borderRadius: '16px' }}>
                    <Box sx={{ p: 2, height: "100%" }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Hotspot
                        </Typography>
                        <Box
                            sx={{
                                maxHeight: 400,
                                overflowY: "auto",
                            }}
                        >
                            {hotspot?.isFetching ? (
                                <Loader />
                            ) : hotspot?.data?.data?.length === 0 ? (
                                <Typography>No data Found</Typography>
                            ) : (
                                hotspot?.data?.data &&
                                Array.isArray(hotspot.data.data) &&
                                hotspot.data.data
                                    .sort((a, b) =>
                                        a.timesCalled > b.timesCalled ? -1 : 1
                                    )
                                    .map((d, index) => (
                                        <Box
                                            key={index}
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                p: 1,
                                                gap: 2,
                                                // borderBottom: "1px solid #eee",
                                            }}
                                        >
                                            <Typography variant="body2">
                                                {d.address || "N/A"}
                                            </Typography>
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 1,
                                                }}
                                            >
                                                <Typography variant="body2">
                                                    {d.timesCalled || 0}
                                                </Typography>
                                                <FaLocationDot
                                                    className="viewlocation"
                                                    style={{ cursor: "pointer", color: "#1976d2" }}
                                                    onClick={() =>
                                                        nav(
                                                            `/home/hotspot/location?lat=${d.lat}&long=${d.long}`
                                                        )
                                                    }
                                                />
                                            </Box>
                                        </Box>
                                    ))
                            )}
                        </Box>
                    </Box>
                </Grid>
            </Grid>
            <div className="clearfix"></div>
        </div>
    );
};

export default Analytics;
