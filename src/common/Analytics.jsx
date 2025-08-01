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

const Analytics = ({ id }) => {
    const [time, settime] = useState("today");
    const [timeTitle, settimeTitle] = useState("Today");
    const [activeUser, setactiveUser] = useState(0);
    const notificationTypes = useGetNotificationType();
    const [selectedNotification, setSelectedNotification] = useState("");

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
        if (notificationTypes?.data?.data?.length > 0 && !selectedNotification) {
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
                <select
                    className="form-select"
                    value={selectedNotification}
                    onChange={handleNotificationChange}
                >
                    <option value="">Select Notification Type</option>
                    {notificationTypes.data?.data?.map((type, index) => (
                        <option key={index} value={type._id}>
                            {type.type}
                        </option>
                    ))}
                </select>
            </div>
            <div className="row">
                <div className="col-md-8">
                    <div className="requests-chart">
                        <div className="chart-heading">
                            <h3>SOS Requests</h3>
                        </div>
                        <CustomChart data={chartData} />
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="hotspot">
                        <h1>Hotspot</h1>
                        <div className="location-list">
                            {hotspot?.isFetching ? (
                                <Loader />
                            ) : hotspot?.data?.data?.length === 0 ? (
                                <p>No data Found</p>
                            ) : (
                                hotspot?.data?.data?.sort((a, b) =>
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
                </div>
            </div>
            <div className="clearfix"></div>
        </div>
    );
};

export default Analytics;
