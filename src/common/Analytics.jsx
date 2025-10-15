import { useEffect, useState } from "react";
import {
    useGetChartData,
    useGetHotspot,
    useGetUserList,
    useGetNotificationType,
    fetchActiveSosData, fetchRecentSosData, fetchHotspot
} from "../API Calls/API";
import {
    Grid,
    Typography,
    Box,
} from "@mui/material";
import filter from '../assets/images/filter.svg'
import CustomDateRangePicker from "./Custom/CustomDateRangePicker";
import calender from '../assets/images/calender.svg';
import CustomExportMenu from "./Custom/CustomExport";
import Loader from "./Loader";
import div from '../assets/images/div.svg'
import div2 from '../assets/images/div2.svg'
import div3 from '../assets/images/div3.svg'
import { FaLocationDot } from "react-icons/fa6";
import { FaArrowUpLong } from "react-icons/fa6";
import { FaArrowDownLong } from "react-icons/fa6";

import CustomChart from "./CustomChart";
import { useNavigate } from "react-router-dom";
import CustomFilter from "./Custom/CustomFilter";
import { startOfYear } from "date-fns";
import TimeFilter from "./Custom/TimeFilter";

import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable'
import * as XLSX from 'xlsx';
import moment from "moment/moment";
import { format } from "date-fns";

const Analytics = ({ id, activePage,
    activeLimit,
    startDateSos,
    endDateSos,
    filter,
    startDateRec,
    endDateRec,
    recentFilter,
    recentNotification }) => {
    const [time, settime] = useState("today");
    const [timeTitle, settimeTitle] = useState("Today");
    const [activeUser, setactiveUser] = useState(0);
    const [activePercentage, setActivePercentage] = useState(0)
    const [lastActivePercentage, setLastActivePercentage] = useState(0)
    const notificationTypes = useGetNotificationType();
    const [selectedNotification, setSelectedNotification] = useState("all");
    const [range, setRange] = useState([
        {
            startDate: startOfYear(new Date()),
            endDate: new Date(),
            key: 'selection'
        }
    ]);
    const [category, setCategory] = useState('');

    const nav = useNavigate();

    const driverList = useGetUserList("driver list", "driver", id);
    const companyList = useGetUserList("company list", "company");
    const [selected, setSelected] = useState('today');


    const hotspot = useGetHotspot(time, id, selectedNotification);
    const chartData = useGetChartData(id, time, selectedNotification);

    // console.log("chartData", chartData?.data?.data)

    // useEffect(()=>{
    //     if(selectedNotification === 'all'){
    //         setSelectedNotification("all");
    //     }
    // },[selectedNotification])

    const handleTimeChange = (e) => {
        settime(e.target.value);
    };

    const handleNotificationChange = (e) => {
        const value = e.target.value;
        setSelectedNotification(value === "" ? "all" : value);
    };


    useEffect(() => {
        if (notificationTypes?.data?.data?.length > 0 && !selectedNotification) {
            setSelectedNotification(notificationTypes.data?.data[23]?._id);
        }
    }, [notificationTypes]);

    let arrow = null; // Default: no arrow

    if (activePercentage > lastActivePercentage) {
      arrow = <FaArrowUpLong color="green" />;
    } else if (activePercentage < lastActivePercentage) {
      arrow = <FaArrowDownLong color="red" />;
    } else {
      arrow = null; 
    }

    useEffect(() => {
        if (!driverList.data?.data) return;

        switch (time) {
            case "today":
                setactiveUser(driverList?.data?.data?.totalActiveDriversToday || 0);
                settimeTitle("Today");
                setActivePercentage(driverList?.data?.data?.activeUsersPercentageFromToday || 0);
                setLastActivePercentage(driverList?.data?.data?.activeUsersPercentageFromYesterday || 0);
                break;
            case "yesterday":
                setactiveUser(driverList?.data?.data?.totalActiveDriversYesterday || 0);
                settimeTitle("Yesterday");
                setActivePercentage(driverList?.data?.data?.activeUsersPercentageFromYesterday || 0);
                setLastActivePercentage(driverList?.data?.data?.activeUsersPercentageFromYesterday || 0);
                break;
            case "this_week":
                setactiveUser(driverList?.data?.data?.totalActiveDriversThisWeek || 0);
                settimeTitle("Last Week");
                setActivePercentage(driverList?.data?.data?.activeUsersPercentageFromLastWeek || 0);
                setLastActivePercentage(driverList?.data?.data?.activeUsersPercentageFromLastWeeks || 0);
                break;
            case "this_month":
                setactiveUser(driverList?.data?.data?.totalActiveDriversThisMonth || 0);
                settimeTitle("Last Month");
                setActivePercentage(driverList?.data?.data?.activeUsersPercentageFromLastMonth || 0);
                setLastActivePercentage(driverList?.data?.data?.activeUsersPercentageFromLastMonths || 0);
                break;
            case "this_year":
                setactiveUser(driverList?.data?.data?.totalActiveDriversThisYear || 0);
                settimeTitle("Last Year");
                setActivePercentage(driverList?.data?.data?.activeUsersPercentageFromLastYear || 0);
                setLastActivePercentage(driverList.data?.data.activeUsersPercentageFromLastYears || 0);
                break;
            default:
                setactiveUser(driverList?.data?.data?.totalActiveDriversToday || 0);
                setLastActivePercentage(driverList?.data?.data?.activeUsersPercentageFromYesterday || 0);
                settimeTitle("Today");
                setActivePercentage(driverList?.data?.data?.activeUsersPercentageFromYesterday || 0);
                break;
        }
    }, [driverList?.data, time]);

    const [isLoading, setIsLoading] = useState(false);
    const handleExport = async ({ startDate, endDate, exportFormat, location, category }) => {
        try {
            setIsLoading(true);
            const searchKey = "";
            const hotspot = await fetchHotspot({startDate, endDate, category});
            const activeSosData = await fetchActiveSosData({startDate, endDate, category, searchKey, page: 1, limit: 100000});
            const recentSosResponse = await fetchRecentSosData({startDate, endDate, category, searchKey, page: 1, limit: 100000});
            const recentSos = recentSosResponse?.items || []; 
            
            const TotalData = [
                { Type: "Total Companies", Count: (companyList.data?.data.totalUsers || 0), Percentage: companyList?.data?.data?.companiesPercentageFromLastMonth?.toFixed(2) },
                { Type: "Active Users", Count: (driverList?.data?.data.totalActiveDrivers || 0), Percentage: driverList?.data?.data?.activeUsersPercentageFromYesterday?.toFixed(2) },
                { Type: "Users Active "+timeTitle, Count: activeUser, Percentage: activePercentage },
            ];

            const chartDataFinal = chartData?.data?.data;
            const sosData = [];
            chartDataFinal.forEach((item) => {
                sosData.push({
                Month: item.label,
                Resolved: item.resolved,
                Pending: item.pending,
                });
            });

            const sosAlertData = [];
            activeSosData?.map((user) => {
                sosAlertData.push({
                    Driver: user?.user?.first_name+ ' '+user?.user?.last_name,
                    Company: user?.user?.company_name,
                    Address: user?.address,
                    "Request Reached": user?.req_reach || "0",
                    "Request Accept": user?.req_accept || "0",
                    Type: user?.type?.type || "",
                    Time: moment(user?.createdAt).format("HH:mm:ss"),
                    Status: user?.help_received,
                })
            });

            const sosLocationsData = [];
            hotspot?.map((row) => {
                sosLocationsData.push({
                    "Location": row?.address,
                    "Latitude": row?.lat,
                    "Longitude": row?.long,
                    "Total Calls": row?.totalCalls,
                })
            });
            
            const sosClosedData = [];
            recentSos?.map((row) => {
                sosClosedData.push({
                    "User Name": row?.user?.first_name+ ' '+row?.user?.last_name,
                    "Company": row?.user?.company_name,
                    "Last Active Status": row?.createdAt,
                    "Start Time Stamp": format(row?.createdAt, "HH:mm:ss - dd/MM/yyyy"),
                    "End Time Stamp": format(row?.updatedAt, "HH:mm:ss - dd/MM/yyyy"),
                    "Type": row?.type?.type || "",
                    "Status": row?.help_received,
                })
            });

            const autoFitColumns = (data) => {
                return Object.keys(data[0] || {}).map((key) => ({
                wch: Math.max(key.length, ...data.map((row) => String(row[key] ?? "NA").length)) + 2,
                }));
            };

            if(exportFormat == 'xlsx'){
                const workbook = XLSX.utils.book_new();
                const companiesSheet = XLSX.utils.json_to_sheet(TotalData);
                companiesSheet["!cols"] = autoFitColumns(TotalData);
                XLSX.utils.book_append_sheet(workbook, companiesSheet, "Totals");

                // Add SOS sheet
                const sosSheet = XLSX.utils.json_to_sheet(sosData);
                sosSheet["!cols"] = autoFitColumns(sosData);
                XLSX.utils.book_append_sheet(workbook, sosSheet, "SOS Requests Over Time");

                // Add SOS Alert sheet
                const sosAlertSheet = XLSX.utils.json_to_sheet(sosAlertData);
                sosAlertSheet["!cols"] = autoFitColumns(sosAlertData);
                XLSX.utils.book_append_sheet(workbook, sosAlertSheet, "Active SOS Alerts");

                const sosLocationsSheet = XLSX.utils.json_to_sheet(sosLocationsData);
                sosLocationsSheet["!cols"] = autoFitColumns(sosLocationsData);
                XLSX.utils.book_append_sheet(workbook, sosLocationsSheet, "Top SOS Locations");

                const sosClosedSheet = XLSX.utils.json_to_sheet(sosClosedData);
                sosClosedSheet["!cols"] = autoFitColumns(sosClosedData);
                XLSX.utils.book_append_sheet(workbook, sosClosedSheet, "Recently Closed SOS Alerts");

                // Write file
                XLSX.writeFile(workbook, "Dashboard.xlsx");
            }
            if(exportFormat == 'csv'){
                const convertToCSV = (data) => {
                    if (!data || !data.length) return "";
                    const headers = Object.keys(data[0]);
                    const rows = data.map((obj) => headers.map((h) => JSON.stringify(obj[h] ?? "")).join(","));
                    return [headers.join(","), ...rows].join("\n");
                };
                
                const csvSections = [
                    { title: "Totals", data: TotalData },
                    { title: "SOS Requests Over Time", data: sosData },
                    { title: "Active SOS Alerts", data: sosAlertData },
                    { title: "Top SOS Locations", data: sosLocationsData },
                    { title: "Recently Closed SOS Alerts", data: sosClosedData },
                ];
                
                let finalCSV = "";
                csvSections.forEach((section, i) => {
                    finalCSV += `\n\n# ${section.title}\n`;
                    finalCSV += convertToCSV(section.data);
                });
                
                const blob = new Blob([finalCSV], { type: "text/csv;charset=utf-8;" });
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = "Dashboard.csv";
                link.click();     
            }
            if(exportFormat == 'pdf'){
                const doc = new jsPDF("p", "mm", "a4");
                let currentY = 16; // vertical position tracker

                const addSection = (title, data) => {
                    if (!data?.length) return; // skip if no data

                    // Add section title
                    doc.setFontSize(14);
                    doc.setTextColor(40);
                    doc.text(title, 14, currentY);

                    // Convert JSON → table
                    const columns = Object.keys(data[0] || {}).map((key) => ({
                        header: key.replace(/_/g, " ").toUpperCase(),
                        dataKey: key,
                    }));

                    autoTable(doc, {
                        startY: currentY + 6,
                        head: [columns.map((c) => c.header)],
                        body: data.map((row) => columns.map((c) => String(row[c.dataKey] ?? "NA"))),
                        theme: "striped",
                        headStyles: { fillColor: [54, 123, 224], textColor: 255 },
                        styles: { fontSize: 9 },
                        margin: { top: 10 },
                        didDrawPage: (data) => {
                            currentY = data.cursor.y + 10;
                        },
                    });

                    // Add a page break if needed
                    if (currentY > 250) {
                        doc.addPage();
                        currentY = 20;
                    } else {
                        currentY += 10;
                    }
                };

                addSection("Totals", TotalData);
                addSection("SOS Requests Over Time", sosData);
                addSection("Active SOS Alerts", sosAlertData);
                addSection("Top SOS Locations", sosLocationsData);
                addSection("Recently Closed SOS Alerts", sosClosedData);
                
                doc.save("Dashboard.pdf");
            }
        } catch (error) {
            console.error("Export failed:", error);
        } finally {
            setIsLoading(false); // ✅ Trigger loader OFF
        }
    };

    const handleFilterApply = (filters) => {
        console.log('Filters applied:', filters);
    };
    const username = localStorage.getItem("userName")
    const contact_name = localStorage.getItem("contact_name")
    return (
        <Box>
            <Grid sx={{ backgroundColor: 'white', p: 3, mt: '-25px' }} container justifyContent="space-between" alignItems="center" spacing={2} mb={3}>
                <Grid size={{ xs: 12, md: 5, lg: 6 }}>
                    <Typography variant="h5" fontWeight={550}>
                        Dashboard Overview
                    </Typography>
                    <Typography variant="body1" mt={1} color="text.secondary">
                        Welcome back, {username || contact_name}. Here's what's happening today.
                    </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 7, lg: 6 }}>
                    <Box display="flex" sx={{ justifyContent: { md: 'flex-end', sm: 'space-around' } }} gap={2} flexWrap="wrap">
                        <Box display="flex" sx={{ justifyContent: { md: 'flex-end', sm: 'space-around' } }} gap={2} flexWrap="wrap">
                            <TimeFilter
                                selected={time}          // current selected time
                                onApply={(value) => settime(value)}
                            />
                            {/* <CustomFilter onApply={handleFilterApply} /> */}



                            <CustomDateRangePicker
                                borderColor={'var(--light-gray)'}
                                value={range}
                                onChange={setRange}
                                icon={calender}
                            />

                            {/* <CustomExportMenu role={'dashboard'} /> */}
                            <CustomExportMenu role={'dashboard'} onExport={handleExport} />
                        </Box>
                    </Box>
                </Grid>

            </Grid>
            <div>
                {isLoading && <Loader />}
            </div>
            <Box p={2}>
                <div className="clearfix"></div>

                {localStorage.getItem("role") === "super_admin" && !id ? (
                    <div className="row px-2 ">
                        <div className="col-md-4 ">
                            <div className="dash-counter orange ">
                                <div className=" flex-column">
                                    <div className="d-flex justify-content-between  w-100 ">
                                        <div className="">
                                            <span>Total Companies</span>
                                            <h3>{companyList.data?.data.totalUsers || 0}</h3>
                                        </div>
                                        <img src={div} alt="dash-counter" />

                                    </div>
                                    <div className="">
                                        <div className="d-flex gap-2">
                                            <div className="percentage-green">
                                                {companyList?.data?.data?.companiesPercentageFromLastMonth === 0 ? "" : <FaArrowUpLong />} {companyList?.data?.data?.companiesPercentageFromLastMonth?.toFixed(2)} %
                                            </div>
                                            <span> from last month</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        <div className="col-md-4">
                            <div className="dash-counter blue   ">
                                <div className="d-flex flex-column">
                                    <div className="d-flex justify-content-between  w-100 ">
                                        <div>
                                            <span>Active Users</span>
                                            <h3>
                                                {driverList?.data?.data.totalActiveDrivers || 0}
                                            </h3>
                                        </div>
                                        <img src={div2} alt="dash-counter" />
                                    </div>
                                </div>

                                <div className=''>
                                    <div className="d-flex gap-2">
                                        <div className="percentage-green">
                                            {driverList?.data?.data?.activeUsersPercentageFromYesterday === 0 ? "" : <FaArrowDownLong />}
                                            {driverList?.data?.data?.activeUsersPercentageFromYesterday?.toFixed(2)} %
                                        </div>
                                        <span>from yesterday</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 ">

                            <div className="dash-counter green d-flex row">
                                <div className="d-flex justify-content-between  ">

                                    <div><span>Users Active {timeTitle}</span>
                                        <h3>{activeUser}</h3></div>
                                    <img src={div3} alt="dash-counter" />
                                </div>
                                <div className="d-flex gap-2">
                                    <div className="percentage-green">
                                        {arrow} {activePercentage?.toFixed(2)}%
                                        
                                    </div>
                                    <span>from {timeTitle}</span>

                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="row">
                        <div className="col-md-6">
                            <div className="dash-counter blue">
                                <div className="d-flex justify-content-between w-100 ">
                                    <div>
                                        <span>Active Users</span>
                                        <h3>
                                            {driverList?.data?.data.totalActiveDrivers || 0}
                                        </h3>
                                    </div>
                                    <img src={div2} alt="dash-counter" />
                                </div>
                                <div className="">
                                    <span> 12% from last month</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="dash-counter green">
                                <span>Users Active {timeTitle}</span>
                                <h3>
                                    {driverList?.data?.data
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
                                        value={selectedNotification === "all" ? "" : selectedNotification}
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
                            <CustomChart data={chartData?.data?.data} />
                        </div>
                    </div>
                </div>
            </Box>
        </Box>

    );
};

export default Analytics;
