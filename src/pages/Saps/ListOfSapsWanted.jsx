import { useEffect, useState } from "react";
import { useGetSAPSWantedList,useGetSAPSMemberList,useGetProvinceList,useGetSAPSWantedPageData,useGetSAPSWantedPageListv2,useGetSAPSWantedListv2,useGetSAPSMemberListv2,useGetSAPSWantedByCity} from "../../API Calls/API";
import {
    Grid, Typography, Select, Box, TextField, InputAdornment, MenuItem, FormControl, InputLabel, IconButton, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Stack, Avatar, Chip, Paper, Button, Menu,
    Tooltip,TableSortLabel,Skeleton
} from "@mui/material";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import plus from '../../assets/images/plus.svg'
import whiteplus from '../../assets/images/whiteplus.svg';
import MoreVertIcon from "@mui/icons-material/MoreVert";
import search from '../../assets/images/search.svg';
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable'
import * as XLSX from 'xlsx';
import ViewBtn from '../../assets/images/ViewBtn.svg'
import { DeleteConfirm } from "../../common/ConfirmationPOPup";
import OutlinedView from '../../assets/images/OutlinedView.svg'
import outlinedDustbin from '../../assets/images/outlinedDustbin.svg'
import outlinedEdit from '../../assets/images/outlinedEdit.svg'
import delBtn from '../../assets/images/delBtn.svg'
import nouser from "../../assets/images/NoUser.png";
import CustomDateRangePicker from "../../common/Custom/CustomDateRangePicker";
import calender from '../../assets/images/calender.svg';
import Loader from "../../common/Loader";
import CustomFilter from "../../common/Custom/CustomFilter";
import CustomChart from "../../common/Custom/CustomChart2";
import { startOfYear } from "date-fns";
import CustomExportMenu from "../../common/Custom/CustomExport";
import CustomPie from "../../common/Custom/CustomPie";
import SapsIcon1 from '../../assets/images/SapsIcon1.svg'
import SapsIcon2 from '../../assets/images/SapsIcon2.svg'
import SapsIcon3 from '../../assets/images/SapsIcon3.svg'
import SapsIcon4 from '../../assets/images/SapsIcon4.svg'
import SapsIcon5 from '../../assets/images/SapsIcon5.svg'
import SapsIcon6 from '../../assets/images/SapsIcon6.svg'
import SapsIcon7 from '../../assets/images/SapsIcon7.svg'
import SapsIcon8 from '../../assets/images/SapsIcon8.svg'
import SapsIcon9 from '../../assets/images/SapsIcon9.svg'
import CustomBar from "../../common/Custom/CustomBar";
import { saveScrollPosition, restoreScrollPosition } from "../../common/ScrollPosition";
import arrowup from '../../assets/images/arrowup.svg';
import arrowdown from '../../assets/images/arrowdown.svg';
import arrownuteral from '../../assets/images/arrownuteral.svg';
import apiClient from "../../API Calls/APIClient";
import moment from "moment";
import {getImageLink,formatDateTime } from '../../common/commonFn';
import { toast } from "react-toastify";
import ImportSheet from "../../common/ImportSheet";

const ListOfSapsWanted = () => {

    const params = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const startDateParam = searchParams.get("startDate") || startOfYear(new Date()).toISOString();
    const endDateParam = searchParams.get("endDate") || new Date().toISOString();
    const [range, setRange] = useState([{
        startDate: new Date(startDateParam),
        endDate: new Date(endDateParam),
        key: 'selection'
    }]);
    const currentPage = Number(searchParams.get("currentPage")) || 1;
    const filter = searchParams.get("filter") || "";
    const locationFilter = searchParams.get("locationFilter") || "";
    const rowsPerPage = Number(searchParams.get("rowsPerPage")) || 5;
    const [confirmation, setconfirmation] = useState("");
    const [confirmationwanted, setconfirmationwanted] = useState("");
    const [selectedProvince, setSelectedProvince] = useState('all');
    const startDate = range[0].startDate.toISOString();
    const endDate = range[0].endDate.toISOString();
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("desc");
    const nav = useNavigate()
    const changeSortOrder = (e) => {
        const field = e.target.id;

        if (field !== sortBy) {
            setSortBy(field);
            setSortOrder("desc");
        } else {
            setSortOrder(p => p === 'asc' ? 'desc' : 'asc')
        }
    }
    const [sapsWantedPageFilter, setSapsWantedPageFilter] = useState("");
    const handleFilterApply = (data) => {

        const params = Object.fromEntries(
            Object.entries(data).filter(
                ([_, value]) => value !== "" && value !== undefined && value !== null
            )
        );

        const filterText = new URLSearchParams(params).toString();
        setSapsWantedPageFilter(filterText)
    };
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedWantedObj, setSelectedWantedObj] = useState(null);

    const handleOpenMenu = (event,selectedObj) => {
        setAnchorEl(event.currentTarget);
        setSelectedWantedObj(selectedObj)
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
        setSelectedWantedObj(null);
    };
    const handleProvinceChange = (event) => {
        setSelectedProvince(event.target.value);
    };

    const [searchParamsMember, setSearchParamsMember] = useSearchParams();
    const startDateParamMember = searchParamsMember.get("startDateMember") || startOfYear(new Date()).toISOString();
    const endDateParamMember = searchParamsMember.get("endDateMember") || new Date().toISOString();
    const [rangeMember, setRangeMember] = useState([{
        startDate: new Date(startDateParamMember),
        endDate: new Date(endDateParamMember),
        key: 'selection'
    }]);
    const currentPageMember = Number(searchParamsMember.get("currentPageMember")) || 1;
    const filterMember = searchParamsMember.get("filterMember") || "";
    const locationFilterMember = searchParamsMember.get("locationFilterMember") || "";
    const rowsPerPageMember = Number(searchParamsMember.get("rowsPerPageMember")) || 5;
    const startDateMember = rangeMember[0].startDate.toISOString();
    const endDateMember = rangeMember[0].endDate.toISOString();
    const [sortByMember, setSortByMember] = useState("createdAt");
    const [sortOrderMember, setSortOrderMember] = useState("desc");
    const [popup, setpopup] = useState(false);
    const changeSortOrderMember = (e) => {
        const field = e.target.id;

        if (field !== sortBy) {
            setSortByMember(field);
            setSortOrderMember("desc");
        } else {
            setSortOrderMember(p => p === 'asc' ? 'desc' : 'asc')
        }
    }
    // APIS Calls

    const provincelist = useGetProvinceList('673361a0041c365bf8edae16')
    const SAPS_Page_API_Data = useGetSAPSWantedPageData(sapsWantedPageFilter)
    const SAPS_Page_ObjData = SAPS_Page_API_Data.data?.data || {}

    const chartData = SAPS_Page_ObjData?.CriminalCapturedVsWantedVsSightings || [];

    const wantedData = chartData.map((obj) => obj.wanted);
    const capturedData = chartData.map((obj) => obj.captured);
    const sightingData = chartData.map((obj) => obj.sightings);

    const SAPS_Wanted_By_City = useGetSAPSWantedByCity(selectedProvince)

    const SAPS_Wanted_Responce = useGetSAPSWantedList("saps wanted list", "", currentPage, rowsPerPage, filter, locationFilter, startDate, endDate, sortBy, sortOrder);
    const totalData = SAPS_Wanted_Responce.data?.data?.totaldata || 0;
    const totalPages = Math.ceil(totalData / rowsPerPage);
    
    const SAPS_Members_Responce = useGetSAPSMemberList("saps member list", "", currentPageMember, rowsPerPageMember, filterMember, locationFilterMember, startDateMember, endDateMember, sortByMember, sortOrderMember);
    const totalMemberData = SAPS_Members_Responce.data?.data?.totaldata || 0;
    const totalMemberPages = Math.ceil(totalMemberData / rowsPerPage);
    
    const updateParams = (newParams) => {
        setSearchParams((prev) => {
            const prevParams = Object.fromEntries(prev.entries());

            return {
                ...prevParams,
                ...newParams,
            };
        });
    };

    const updateMembersParams = (newParams) => {
        setSearchParamsMember((prev) => {
            const prevParams = Object.fromEntries(prev.entries());

            return {
                ...prevParams,
                ...newParams,
            };
        });
    };

    const handleExport = async ({ startDate, endDate, exportFormat:fileFormat }) => {
        try {
            const { data } = await apiClient.get(`${import.meta.env.VITE_BASEURL}/saps-wanted`, { params: {} });

            const allUsers = data?.data || [];
            if (!allUsers.length) {
                toast.warning("No SAPS Wanted data found.");
                return;
            }

            const exportData = allUsers.map(user => ({
                "Suspect Name": (user?.full_name || ''),
                "Aliases": (user?.aliases || ''),
                "Case Number": user?.case_number || '',
                "Investigation Officer": user?.investigating_officer || '',
                "Police Station": user?.police_unit_id?.police_unit_name || '',
                "Date Of Crime": formatDateTime(user?.crime_date, "HH:mm:ss - DD/MM/yyyy") || '',
                "Captured Date": formatDateTime(user?.captured_date, "HH:mm:ss - DD/MM/yyyy") || '',
                "Request Reached": user?.requestReached || '',
                "Request Accepted": user?.requestAccepted || '',
                "Status": user?.current_status || '',
                "Last Known Location": (user?.last_know_location|| ''),
                "Contact Info": (user?.contact_number || ''),
                "Date Reported": formatDateTime(user?.createdAt, "HH:mm:ss - DD/MM/yyyy") || '',
            }));
            const exportedByValue = 'Thiba Ingozi';
            if (fileFormat === "xlsx") {
                const workbook = XLSX.utils.book_new();

                // Header row for Exported By
                const headerRow = [["Exported By", exportedByValue], []]; // blank row after header

                // Prepare sheet data
                const worksheetData = [
                    ...headerRow,
                    Object.keys(exportData[0] || {}),
                    ...exportData.map(obj => Object.values(obj))
                ];

                const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

                // Auto-fit columns
                const columnWidths = Object.keys(exportData[0] || {}).map((key) => ({
                    wch: Math.max(key.length, ...exportData.map((row) => String(row[key] ?? 'NA').length)) + 2
                }));
                worksheet['!cols'] = columnWidths;

                XLSX.utils.book_append_sheet(workbook, worksheet, "SAPS_Wanted_List");
                XLSX.writeFile(workbook, "SAPS_Wanted_List.xlsx");
            }

            else if (fileFormat === "csv") {
                const headers = Object.keys(exportData[0] || {});
                const csvRows = exportData.map(row =>
                    headers.map(h => JSON.stringify(row[h] ?? '')).join(',')
                );

                const csv = `Exported By,${exportedByValue}\n\n${headers.join(',')}\n${csvRows.join('\n')}`;

                const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'SAPS_Wanted_List.csv';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }

            else if (fileFormat === "pdf") {
                const doc = new jsPDF();

                // Title
                doc.setFontSize(14);
                doc.text('SAPS Wanted List', 14, 16);

                // Exported By line
                doc.setFontSize(10);
                doc.text(`Exported By: ${exportedByValue}`, 14, 24);

                // Table
                autoTable(doc, {
                    startY: 20,
                    head: [["Suspect Name","Aliases","Case Number","Investigation Officer","Police Station","Date Of Crime","Captured Date","Request Reached","Request Accepted","Status","Last Known Location","Contact Info","Date Reported"]],
                    body: allUsers.map(user => [
                        (user?.full_name || ''),
                        (user?.aliases || ''),
                        user?.case_number || '',
                        user?.investigating_officer || '',
                        user?.police_unit_id?.police_unit_name || '',
                        formatDateTime(user?.crime_date, "HH:mm:ss - DD/MM/yyyy") || '',
                        formatDateTime(user?.captured_date, "HH:mm:ss - DD/MM/yyyy") || '',
                        user?.requestReached || '',
                        user?.requestAccepted || '',
                        user?.current_status || '',
                        user?.last_know_location || '',
                        (user?.contact_number || ''),
                        formatDateTime(user?.createdAt, "HH:mm:ss - DD/MM/yyyy") || '',
                    ]),
                    theme: "grid",
                    headStyles: {
                        fillColor: [54, 123, 224],
                        textColor: 255,
                        fontStyle: "bold",
                        halign: "center",
                        valign: "middle",
                    },

                    styles: {
                        fontSize: 7,
                        cellPadding: 2,
                        overflow: "linebreak",
                        valign: "middle",
                    },

                    columnStyles: {
                        0: { cellWidth: 22 }, // Suspect Name
                        1: { cellWidth: 20 }, // Aliases
                        2: { cellWidth: 22 }, // Case Number
                        3: { cellWidth: 28 }, // Investigation Officer
                        4: { cellWidth: 25 }, // Police Station
                        5: { cellWidth: 28 }, // Date Of Crime
                        6: { cellWidth: 28 }, // Captured Date
                        7: { cellWidth: 18 }, // Request Reached
                        8: { cellWidth: 18 }, // Request Accepted
                        9: { cellWidth: 18 }, // Status
                        10: { cellWidth: 35 }, // Last Known Location
                        11: { cellWidth: 24 }, // Contact Info
                        12: { cellWidth: 28 }, // Date Reported
                    },
                    margin: {
                        top: 28,
                        left: 10,
                        right: 10,
                    },

                    tableWidth: "wrap",
                });

                doc.save("SAPS_Wanted_List.pdf");
            }

        } catch (err) {
            console.error("Error exporting data:", err);
            toast.error("Export failed.");
        }
    };

    const handleExportMember = async ({ startDate, endDate, exportFormat:fileFormat }) => {
        try {
            const { data } = await apiClient.get(`${import.meta.env.VITE_BASEURL}/saps-member`, { params: {} });

            const allUsers = data?.data || [];
            if (!allUsers.length) {
                toast.warning("No SAPS Member data found.");
                return;
            }

            const exportData = allUsers.map(user => ({
                "Name": (user?.first_name || "") + " " + (user?.last_name || ''),
                "Police Station Name": user?.police_unit_id?.police_unit_name || '',
                "Contact No.": user.mobile_no_country_code+'-' + user.mobile_no || '',
                "Email": user.email || "",
                "Date": formatDateTime(user.createdAt, "HH:mm:ss - DD/MM/yyyy") || '',
            }));
            const exportedByValue = 'Thiba Ingozi';
            if (fileFormat === "xlsx") {
                const workbook = XLSX.utils.book_new();

                // Header row for Exported By
                const headerRow = [["Exported By", exportedByValue], []];

                // Prepare sheet data
                const worksheetData = [
                    ...headerRow,
                    Object.keys(exportData[0] || {}),
                    ...exportData.map(obj => Object.values(obj))
                ];

                const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

                // Auto-fit columns
                const columnWidths = Object.keys(exportData[0] || {}).map((key) => ({
                    wch: Math.max(key.length, ...exportData.map((row) => String(row[key] ?? 'NA').length)) + 2
                }));
                worksheet['!cols'] = columnWidths;

                XLSX.utils.book_append_sheet(workbook, worksheet, "SAPS_Member_List");
                XLSX.writeFile(workbook, "SAPS_Member_List.xlsx");
            }

            else if (fileFormat === "csv") {
                const headers = Object.keys(exportData[0] || {});
                const csvRows = exportData.map(row =>
                    headers.map(h => JSON.stringify(row[h] ?? '')).join(',')
                );

                const csv = `Exported By,${exportedByValue}\n\n${headers.join(',')}\n${csvRows.join('\n')}`;

                const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'SAPS_Member_List.csv';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }

            else if (fileFormat === "pdf") {
                const doc = new jsPDF();

                // Title
                doc.setFontSize(14);
                doc.text('SAPS Member List', 14, 16);

                // Exported By line
                doc.setFontSize(10);
                doc.text(`Exported By: ${exportedByValue}`, 14, 24);

                // Table
                autoTable(doc, {
                    startY: 30,
                    head: [["Name","Police Station Name","Contact No.","Email","Date",]],
                    body: allUsers.map(user => [
                        (user?.first_name || '') + " " + (user?.last_name || ''),
                        (user?.police_unit_id?.police_unit_name || ''),
                        (user.mobile_no_country_code+'-' + user.mobile_no || ''),
                        user.email || "",
                        formatDateTime(user.createdAt,"HH:mm:ss - DD/MM/yyyy") || '',
                    ]),
                    theme: 'striped',
                    headStyles: { fillColor: [54, 123, 224], textColor: 255 },
                    styles: { fontSize: 10 },
                    margin: { top: 20 },
                });

                doc.save("SAPS_Member_List.pdf");
            }

        } catch (err) {
            console.error("Error exporting data:", err);
            toast.error("Export failed.");
        }
    };
    const [isLoading, setIsLoading] = useState(false);
    
    const handleExportSAPSWantedPage = async ({ startDate, endDate, exportFormat , locationWiseFilter }) => {
        try {
            setIsLoading(true);
            let totalCountsOfPage = await useGetSAPSWantedPageListv2(locationWiseFilter,startDate,endDate);
            let SAPS_Member_Export_API = await useGetSAPSMemberListv2(locationWiseFilter,startDate,endDate);
            let SAPS_Wanted_Export_API = await useGetSAPSWantedListv2(locationWiseFilter,startDate,endDate); 

            const TotalData = [
                { Type: "Users Reached", Count:totalCountsOfPage.usersReached, Percentage: (0).toFixed(2) },
                { Type: "Social Shares", Count: totalCountsOfPage.socialShares, Percentage: (0).toFixed(2) },
                { Type: "Sighting Submissions", Count: totalCountsOfPage.sightingSubmissions, Percentage: (0).toFixed(2) },
                { Type: "Avg Alert Open Rate", Count: totalCountsOfPage.avgAlertOpenRate, Percentage: (0).toFixed(2) },
                { Type: "Wanted People", Count: totalCountsOfPage.wantedPeople, Percentage: (0).toFixed(2) },
                { Type: "Captured People", Count: totalCountsOfPage.capturedPeople, Percentage: (0).toFixed(2) },
            ];

            const sosData = [];
            for (let index = 0; index< 12; index++) {
                sosData.push({
                    ["Month"]:moment().month(index).format("MMMM") ,
                    ["Criminal Captured"]: capturedData[index],
                    Wanted: wantedData[index],
                    Sightings: sightingData[index],
                });
            }

            const SAPS_Member_Export_Data = [];
            SAPS_Member_Export_API?.map((user) => {
                SAPS_Member_Export_Data.push({
                    "Name": (user?.first_name || "") + " " + (user?.last_name || ''),
                    "Police Station Name": user?.police_unit_id.police_unit_name || '',
                    "Contact No.": user.mobile_no_country_code + '-' + user.mobile_no || '',
                    "Email": user.email || "",
                    "Date": formatDateTime(user.createdAt, "HH:mm:ss - DD/MM/yyyy") || '',
                })
            });


            const SAPS_Wanted_Export_Data = [];
            SAPS_Wanted_Export_API?.map((user) => {
                SAPS_Wanted_Export_Data.push({
                    "Suspect Name": (user?.full_name || ''),
                    "Aliases": (user?.aliases || ''),
                    "Case Number": user?.case_number || '',
                    "Investigation Officer": user?.investigating_officer || '',
                    "Police Station": user?.police_unit_id?.police_unit_name || '',
                    "Date Of Crime": formatDateTime(user?.crime_date, "HH:mm:ss - DD/MM/yyyy") || '',
                    "Captured Date": formatDateTime(user?.captured_date, "HH:mm:ss - DD/MM/yyyy") || '',
                    "Request Reached": user?.requestReached || '',
                    "Request Accepted": user?.requestAccepted || '',
                    "Status": user?.current_status || '',
                    "Last Known Location": (user?.last_know_location || ''),
                    "Contact Info": (user?.contact_number || ''),
                    "Date Reported": formatDateTime(user?.createdAt, "HH:mm:ss - DD/MM/yyyy") || '',
                })
            });

            const autoFitColumns = (data) => {
                return Object.keys(data[0] || {}).map((key) => ({
                    wch: Math.max(key.length, ...data.map((row) => String(row[key] ?? "NA").length)) + 2,
                }));
            };

            const exportedByValue = 'Thiba Ingozi';
            if (exportFormat === 'xlsx') {
                const workbook = XLSX.utils.book_new();
                // Determine user name
                const exportedByLabel = "Exported By";
                function addSheetWithHeader(sheetName,data) {
                    // Convert data to sheet first
                    const sheet = XLSX.utils.json_to_sheet(data, { origin: "A3" });
                    // This starts your data table at row 3

                    // Add the "Exported By" label and name in first row
                    XLSX.utils.sheet_add_aoa(sheet, [[exportedByLabel, exportedByValue]], { origin: "A1" });

                    // Adjust column widths
                    sheet["!cols"] = autoFitColumns(data);

                    // Optionally freeze top 2 rows (so header stays visible)
                    sheet["!freeze"] = { xSplit: 0, ySplit: 2 };

                    XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
                }

                addSheetWithHeader("Totals", TotalData);
                addSheetWithHeader("CapturedWantedSightings", sosData);
                addSheetWithHeader("List of SAPS Wanted", SAPS_Wanted_Export_Data);
                addSheetWithHeader("SAPS Members", SAPS_Member_Export_Data);

                XLSX.writeFile(workbook, "SAPS_Wanted_Page.xlsx");
            }
            if (exportFormat === 'csv') {
                // Convert JSON to CSV
                const convertToCSV = (data) => {
                    if (!data || !data.length) return "";
                    const headers = Object.keys(data[0]);
                    const rows = data.map(obj =>
                        headers.map(h => JSON.stringify(obj[h] ?? "")).join(",")
                    );
                    return [headers.join(","), ...rows].join("\n");
                };

                const csvSections = [
                    { title:"Totals", data:TotalData},
                    { title:"Criminal Captured Vs Wanted Vs Sightings", data:sosData},
                    { title:"List of SAPS Wanted", data:SAPS_Wanted_Export_Data},
                    { title:"SAPS Members", data:SAPS_Member_Export_Data},
                ];

                let finalCSV = "";

                csvSections.forEach((section, i) => {
                    // Section header
                    finalCSV += `\n\n# ${section.title}\n`;

                    // "Exported By" row + blank line
                    finalCSV += `Exported By,${exportedByValue}\n\n`;

                    // Add actual table
                    finalCSV += convertToCSV(section.data);
                });

                // Download CSV file
                const blob = new Blob([finalCSV], { type: "text/csv;charset=utf-8;" });
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = "SAPS_Wanted_Page.csv";
                link.click();
            }
            if (exportFormat === 'pdf') {

                const doc = new jsPDF("p", "mm", "a4");
                let currentY = 16;

                const addSection = (title, data) => {

                    if (!data?.length) return;

                    // ONLY for SAPS Wanted section
                    if (title === "List of SAPS Wanted") {
                        doc.addPage("a4", "landscape");
                        currentY = 20;
                    }

                    // Add section title
                    doc.setFontSize(14);
                    doc.setTextColor(40);
                    doc.text(title, 14, currentY);
                    currentY += 8;

                    // Exported By
                    doc.setFontSize(10);
                    doc.setTextColor(80);
                    doc.text(`Exported By: ${exportedByValue}`, 80, currentY);

                    currentY += 6;

                    // Columns
                    const columns = Object.keys(data[0] || {}).map((key) => ({
                        header: key.replace(/_/g, " ").toUpperCase(),
                        dataKey: key,
                    }));

                    // Table
                    autoTable(doc, {
                        startY: currentY,
                        head: [columns.map((c) => c.header)],
                        body: data.map((row) =>
                            columns.map((c) => String(row[c.dataKey] ?? "NA"))
                        ),

                        theme: "striped",

                        headStyles: {
                            fillColor: [54, 123, 224],
                            textColor: 255,
                            fontSize: title === "List of SAPS Wanted" ? 6 : 7,
                            halign: "center",
                            valign: "middle",
                        },

                        styles: {
                            fontSize: title === "List of SAPS Wanted" ? 6 : 9,
                            overflow: "linebreak",
                            cellPadding: 2,
                        },

                        tableWidth: "auto",

                        columnStyles:
                            title === "List of SAPS Wanted"
                                ? {
                                    0: { cellWidth: 22 },
                                    1: { cellWidth: 25 },
                                    2: { cellWidth: 24 },
                                    3: { cellWidth: 28 },
                                }
                                : {},

                        margin: { top: 10 },

                        didDrawPage: (data) => {
                            currentY = data.cursor.y + 10;
                        },
                    });

                    // After SAPS Wanted -> back to portrait
                    if (title === "List of SAPS Wanted") {
                        doc.addPage("a4", "portrait");
                        currentY = 20;
                    }

                    // Normal spacing
                    if (currentY > 250) {
                        doc.addPage();
                        currentY = 20;
                    } else {
                        currentY += 10;
                    }
                };

                addSection("Totals", TotalData);

                addSection(
                    "Criminal Captured Vs Wanted Vs Sightings",
                    sosData
                );

                addSection(
                    "List of SAPS Wanted",
                    SAPS_Wanted_Export_Data
                );

                addSection(
                    "SAPS Members",
                    SAPS_Member_Export_Data
                );

                doc.save("SAPS_Wanted_Page.pdf");
            }
        } catch (error) {
            console.error("Export failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleView = (url) => {
        saveScrollPosition("SAPSWantedListScroll");
        nav(url);
    };
    useEffect(() => {
        if (SAPS_Wanted_Responce.data?.data?.totaldata) {
            restoreScrollPosition("SAPSWantedListScroll");
        }
        if (SAPS_Members_Responce.data?.data?.totaldata) {
            restoreScrollPosition("SAPSWantedListScroll");
        }
    }, [SAPS_Wanted_Responce.data?.data?.totaldata,SAPS_Members_Responce.data?.data?.totaldata]);


    return (
        <Box>
            <Grid sx={{ backgroundColor: 'white', p: 3, mt: '-25px' }} container justifyContent="space-between" alignItems="center" spacing={2} mb={3}>
                <Grid size={{ xs: 12, md: 5, lg: 6 }}>

                </Grid>

                <Grid size={{ xs: 12, md: 7, lg: 6 }}>
                    <Box display="flex" sx={{ justifyContent: { md: 'flex-end', sm: 'space-around' } }} gap={2} flexWrap="wrap">
                        <Box display="flex" sx={{ justifyContent: { md: 'flex-end', sm: 'space-around' } }} gap={2} flexWrap="wrap">
                            <CustomFilter onApply={handleFilterApply} isSuburbVisible ={false} />
                            <CustomExportMenu role={'saps-wanted'}  onExport={handleExportSAPSWantedPage} loading={isLoading}/>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
            <Box p={2}>
                <Grid container spacing={3} mb={5}>
                    <Grid size={{ xs: 12, md: 4, lg: 3 }} sx={{}}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: { xs: 5, lg: 1 }, backgroundColor: '#367BE01A', borderRadius: '16px', px: 3, py: 5 }}>
                            <Box>
                                <Typography variant="body2" fontWeight={400} sx={{fontSize:"14px"}}>Users Reached</Typography>
                                {SAPS_Page_API_Data.isFetching ? (
                                        <Skeleton variant="text" width={60} height={40} />
                                    ) : (
                                        <Typography variant="h3" fontWeight={600}>{SAPS_Page_ObjData?.usersReached}</Typography>
                                    )
                                }
                                {SAPS_Page_API_Data.isFetching ? (
                                    <Skeleton variant="text" width={60} height={40} />
                                ) : (
                                    SAPS_Page_ObjData?.percentageObjData.usersReached > 0 ? (

                                        <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px", color: '#22C55E' }}>+{SAPS_Page_ObjData?.percentageObjData.usersReached}% from last month</Typography>
                                    ) : SAPS_Page_ObjData?.percentageObjData.usersReached === 0 ? (
                                        <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px", color: '#22C55E' }}>{SAPS_Page_ObjData?.percentageObjData.usersReached}% from last month</Typography>
                                    ) : <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px", color: '#e5565a' }}>-{SAPS_Page_ObjData?.percentageObjData.usersReached}% from last month</Typography>

                                )
                                }
                            </Box>
                            <Box>
                                <img src={SapsIcon1} alt="ReportIcon" />
                            </Box>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4, lg: 3 }} sx={{}}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: { xs: 5, lg: 1 }, backgroundColor: '#22C55E1A', borderRadius: '16px', px: 3, py: 5 }}>
                            <Box>
                                <Typography variant="body2" fontWeight={400} sx={{fontSize:"14px"}}>Social Shares</Typography>
                                {SAPS_Page_API_Data.isFetching ? (
                                        <Skeleton variant="text" width={60} height={40} />
                                    ) : (
                                        <Typography variant="h3" fontWeight={600}>{SAPS_Page_ObjData?.socialShares}</Typography>
                                    )
                                }
                                {SAPS_Page_API_Data.isFetching ? (
                                    <Skeleton variant="text" width={60} height={40} />
                                ) : (
                                    SAPS_Page_ObjData?.percentageObjData.socialShares > 0 ? (

                                        <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px", color: '#22C55E' }}>+{SAPS_Page_ObjData?.percentageObjData.socialShares}% from last month</Typography>
                                    ) : SAPS_Page_ObjData?.percentageObjData.socialShares === 0 ? (
                                        <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px", color: '#22C55E' }}>{SAPS_Page_ObjData?.percentageObjData.socialShares}% from last month</Typography>
                                    ) : <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px", color: '#e5565a' }}>-{SAPS_Page_ObjData?.percentageObjData.socialShares}% from last month</Typography>

                                )
                                }
                            </Box>
                            <Box>
                                <img src={SapsIcon2} alt="ReportIcon" />
                            </Box>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4, lg: 3 }} >
                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: { xs: 5, lg: 1 }, backgroundColor: '#F973161A', borderRadius: '16px', px: 2, py: 5 }}>
                            <Box>
                                <Typography variant="body2" fontWeight={400} sx={{fontSize:"14px"}}>Sighting Submissions</Typography>
                                {SAPS_Page_API_Data.isFetching ? (
                                        <Skeleton variant="text" width={60} height={40} />
                                    ) : (
                                        <Typography variant="h3" fontWeight={600}>{SAPS_Page_ObjData?.sightingSubmissions}</Typography>
                                    )
                                }
                                {SAPS_Page_API_Data.isFetching ? (
                                    <Skeleton variant="text" width={60} height={40} />
                                ) : (
                                    SAPS_Page_ObjData?.percentageObjData.sightingSubmissions > 0 ? (

                                        <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px", color: '#22C55E' }}>+{SAPS_Page_ObjData?.percentageObjData.sightingSubmissions}% from last month</Typography>
                                    ) : SAPS_Page_ObjData?.percentageObjData.sightingSubmissions === 0 ? (
                                        <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px", color: '#22C55E' }}>{SAPS_Page_ObjData?.percentageObjData.sightingSubmissions}% from last month</Typography>
                                    ) : <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px", color: '#e5565a' }}>-{SAPS_Page_ObjData?.percentageObjData.sightingSubmissions}% from last month</Typography>

                                )
                                }
                            </Box>
                            <Box>
                                <img src={SapsIcon3} alt="ReportIcon" />
                            </Box>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4, lg: 3 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: { xs: 5, lg: 1 }, backgroundColor: '#A855F71A', borderRadius: '16px', px: 3, py: 5 }}>
                            <Box>
                                <Typography variant="body2" fontWeight={400} sx={{fontSize:"14px"}}>Avg Alert Open Rate</Typography>
                                {SAPS_Page_API_Data.isFetching ? (
                                        <Skeleton variant="text" width={60} height={40} />
                                    ) : (
                                        <Typography variant="h3" fontWeight={600}>{SAPS_Page_ObjData?.avgAlertOpenRate}</Typography>
                                    )
                                }
                                {SAPS_Page_API_Data.isFetching ? (
                                    <Skeleton variant="text" width={60} height={40} />
                                ) : (
                                    SAPS_Page_ObjData?.percentageObjData.avgAlertOpenRate > 0 ? (

                                        <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px", color: '#22C55E' }}>+{SAPS_Page_ObjData?.percentageObjData.avgAlertOpenRate}% from last month</Typography>
                                    ) : SAPS_Page_ObjData?.percentageObjData.avgAlertOpenRate === 0 ? (
                                        <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px", color: '#22C55E' }}>{SAPS_Page_ObjData?.percentageObjData.avgAlertOpenRate}% from last month</Typography>
                                    ) : <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px", color: '#e5565a' }}>-{SAPS_Page_ObjData?.percentageObjData.avgAlertOpenRate}% from last month</Typography>
                                )
                                }
                            </Box>
                            <Box>
                                <img src={SapsIcon4} alt="LocationIcon" />
                            </Box>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4, lg: 3 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: { xs: 5, lg: 1 }, backgroundColor: '#F973161A', borderRadius: '16px', px: 3, py: 5 }}>
                            <Box>
                                <Typography variant="body2" fontWeight={400} sx={{fontSize:"14px"}}>Wanted People</Typography>
                                {SAPS_Page_API_Data.isFetching ? (
                                        <Skeleton variant="text" width={60} height={40} />
                                    ) : (
                                        <Typography variant="h3" fontWeight={600}>{SAPS_Page_ObjData?.wantedPeople}</Typography>
                                    )
                                }
                                {SAPS_Page_API_Data.isFetching ? (
                                    <Skeleton variant="text" width={60} height={40} />
                                ) : (
                                    SAPS_Page_ObjData?.percentageObjData.wantedPeople > 0 ? (
                                        <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px", color: '#22C55E' }}>+{SAPS_Page_ObjData?.percentageObjData.wantedPeople}% from last month</Typography>
                                    ) : SAPS_Page_ObjData?.percentageObjData.wantedPeople === 0 ? (
                                        <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px", color: '' }}>{SAPS_Page_ObjData?.percentageObjData.wantedPeople}% from last month</Typography>
                                    ) : <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px", color: '#e5565a' }}>-{SAPS_Page_ObjData?.percentageObjData.wantedPeople}% from last month</Typography>

                                )
                                }
                            </Box>
                            <Box>
                                <img src={SapsIcon5} alt="DangerIcon" />
                            </Box>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4, lg: 3 }} sx={{}}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: { xs: 5, lg: 1 }, backgroundColor: '#0D94881A', borderRadius: '16px', px: 3, py: 5 }}>
                            <Box>
                                <Typography variant="body2" fontWeight={400} sx={{fontSize:"14px"}}>Captured People</Typography>
                                {SAPS_Page_API_Data.isFetching ? (
                                    <Skeleton variant="text" width={60} height={40} />
                                ) : (
                                    <Typography variant="h3" fontWeight={600}>{SAPS_Page_ObjData?.capturedPeople}</Typography>
                                )
                                }
                                {SAPS_Page_API_Data.isFetching ? (
                                    <Skeleton variant="text" width={60} height={40} />
                                ) : (
                                    SAPS_Page_ObjData?.percentageObjData.capturedPeople > 0 ? (
                                        <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px", color: '#22C55E' }}>+{SAPS_Page_ObjData?.percentageObjData.capturedPeople}% from last month</Typography>
                                    ) : SAPS_Page_ObjData?.percentageObjData.capturedPeople === 0 ? (
                                        <Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px", color: '#22C55E' }}>{SAPS_Page_ObjData?.percentageObjData.capturedPeople}% from last month</Typography>
                                    ) : (<Typography variant="body2" fontWeight={400} sx={{ fontSize: "14px", color: '#e5565a' }}>-{SAPS_Page_ObjData?.percentageObjData.capturedPeople}% from last month</Typography>)

                                )
                                }
                            </Box>
                            <Box>
                                <img src={SapsIcon6} alt="DangerIcon" />
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
                <Grid container spacing={3} mb={5}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper
                            elevation={3}
                            sx={{
                                p: 3,
                                borderRadius: '12px',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            <Grid container alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="h6" component="h2" fontWeight="medium">
                                        Captured Vs Wanted By SAPS
                                    </Typography>
                                </Grid>

                            </Grid>
                            <Box sx={{ minHeight: 400 }}>
                                <CustomChart wantedData={wantedData} capturedData={capturedData} />
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper
                            elevation={3}
                            sx={{
                                p: 3,
                                borderRadius: '12px',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >

                            <Grid container alignItems="center" justifyContent="space-between" sx={{ mb: 3, gap: 1 }}>
                                <Grid size={{ xs: 12, sm: 7 }}>
                                    <Typography variant="h6" component="h2" fontWeight="medium">
                                        Incident Distribution by Location
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 12, md: 4.5 }} sx={{ mt: { xs: 2, sm: 0 } }}>
                                    <FormControl sx={{ width: '100%' }} size="small">
                                        <InputLabel id="province-select-label">Province</InputLabel>
                                        <Select
                                            labelId="province-select-label"
                                            value={selectedProvince}
                                            label="Province"
                                            onChange={handleProvinceChange}
                                        >   
                                            {provincelist.data?.data.data?.map((province) => (
                                                <MenuItem key={province._id} value={province._id}>
                                                    {province.province_name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                            <CustomPie data={SAPS_Wanted_By_City?.data?.data || []} isLoading={SAPS_Wanted_By_City.isFetching} />
                        </Paper>
                    </Grid>
                </Grid>
                <Grid container spacing={3} mb={5}>
                    <Grid size={{ xs: 12, md: 8.5 }}>
                        <Paper
                            elevation={3}
                            sx={{
                                p: 3,
                                borderRadius: '12px',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            <Grid container alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="h6" component="h2" fontWeight="medium">
                                        Criminal Captured Vs Wanted Vs Sightings
                                    </Typography>
                                </Grid>

                            </Grid>
                            <Box sx={{ minHeight: 400 }}>
                                <CustomBar
                                    wantedData={wantedData}
                                    capturedData={capturedData}
                                    sightingData={sightingData}
                                />
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, md: 3.5 }}>
                        <Paper
                            elevation={3}
                            sx={{
                                p: 3,
                                borderRadius: '12px',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >

                            <Grid container alignItems="center" justifyContent="space-between" sx={{ mb: 3, gap: 1 }}>
                                <Grid size={{ xs: 12, }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                        <Typography variant="h6" component="h2" fontWeight="medium">
                                            Recent Activity
                                        </Typography>
                                        <Box sx={{ backgroundColor: '#F9FAFB', px: 1, py: 2, borderRadius: '8px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                                                <img src={SapsIcon7} alt="ReportIcon" />
                                                <Box>
                                                    <Typography variant="body1" color="initial">New Alert Created</Typography>
                                                    <Typography variant="body2" sx={{ color: '#64748B ' }}>{SAPS_Page_ObjData?.recentActivity?.newAlertCreated ? moment(SAPS_Page_ObjData?.recentActivity?.newAlertCreated).fromNow() : ''}</Typography>
                                                </Box>
                                            </Box>
                                            <NavigateNextIcon />
                                        </Box>
                                        <Box sx={{ backgroundColor: '#F9FAFB', px: 1, py: 2, borderRadius: '8px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                                                <img src={SapsIcon8} alt="ReportIcon" />
                                                <Box>
                                                    <Typography variant="body1" color="initial">Sightings Reported{SAPS_Page_ObjData?.recentActivity?.sightingsReportedTotal ? `(${SAPS_Page_ObjData?.recentActivity?.sightingsReportedTotal})`: '(0)'}</Typography>
                                                    <Typography variant="body2" sx={{ color: '#64748B ' }}>{SAPS_Page_ObjData?.recentActivity?.sightingsReportedTime ? moment(SAPS_Page_ObjData?.recentActivity?.sightingsReportedTime).fromNow() : ''}</Typography>
                                                </Box>
                                            </Box>
                                            <NavigateNextIcon />
                                        </Box>
                                        <Box sx={{ backgroundColor: '#F9FAFB', px: 1, py: 2, borderRadius: '8px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                                                <img src={SapsIcon9} alt="ReportIcon" />
                                                <Box>
                                                    <Typography variant="body1" color="initial">Alert Shared {SAPS_Page_ObjData?.recentActivity?.alertSharedTimesTotal ? `(${SAPS_Page_ObjData?.recentActivity?.alertSharedTimesTotal})`: '(0)'} Times</Typography>
                                                    <Typography variant="body2" sx={{ color: '#64748B ' }}>{SAPS_Page_ObjData?.recentActivity?.alertSharedTimes ? moment(SAPS_Page_ObjData?.recentActivity?.alertSharedTimes).fromNow() : ''}</Typography>
                                                </Box>
                                            </Box>
                                            <NavigateNextIcon />
                                        </Box>
                                    </Box>
                                </Grid>

                            </Grid>

                        </Paper>
                    </Grid>
                </Grid>
                <Box p={2}>
                    <Paper elevation={3} sx={{ backgroundColor: "rgb(253, 253, 253)", padding: 2, borderRadius: '10px' }}>
                        <Grid container justifyContent="space-between" alignItems="center" mb={2}>
                            <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', flexDirection: 'row', gap: 2, mb: { xs: 1, md: 0 } }}>
                                <Typography variant="h6" fontWeight={590}>List of SAPS Wanted</Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 8 }} sx={{ display: 'flex', justifyContent: 'flex-end', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>

                                <TextField
                                    variant="outlined"
                                    placeholder="Search"
                                    value={filter}
                                    onChange={(e) => updateParams({filter:e.target.value})}
                                    fullWidth
                                    sx={{
                                        width: '60%',
                                        height: '40px',
                                        borderRadius: '8px',
                                        '& .MuiInputBase-root': {
                                            height: '40px',
                                            fontSize: '14px',
                                        },
                                        '& .MuiOutlinedInput-input': {
                                            padding: '10px 14px',
                                        },
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <img src={search} alt="search icon" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <Box display="flex" sx={{ justifyContent: { xs: 'space-between' } }} gap={1}>
                                    <CustomDateRangePicker
                                        borderColor={'var(--light-gray)'}
                                        value={range}
                                        onChange={(nextRange) => {
                                            setRange(nextRange);
                                            updateParams({
                                                startDate: new Date(nextRange[0].startDate).toISOString(),
                                                endDate: new Date(nextRange[0].endDate).toISOString(),
                                            });
                                        }}
                                        icon={calender}
                                    />
                                    <CustomExportMenu onExport={handleExport} />
                                    <Button
                                        variant="contained"
                                        sx={{ height: '40px', width: '100px', borderRadius: '8px' }}
                                        onClick={() => nav("/home/total-saps-wanted/add-wanted")}
                                        startIcon={<img src={whiteplus} alt='white plus' />}
                                    >
                                        Add
                                    </Button>

                                </Box>

                            </Grid>
                        </Grid>

                        {SAPS_Wanted_Responce.isFetching ? (
                            <Loader />
                        ) : SAPS_Wanted_Responce.data?.data.data?.length > 0 ? (
                            <Box sx={{ px: { xs: 0, md: 2 }, pt: { xs: 0, md: 3 }, backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
                                <TableContainer>
                                    <Table sx={{ '& .MuiTableCell-root': { fontSize: '15px' } }}>
                                        <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                            <TableRow >
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', borderTopLeftRadius: '10px', minWidth: 150 }}>
                                                    <TableSortLabel
                                                        id="full_name"
                                                        active={sortBy === 'full_name'}
                                                        direction={sortOrder}
                                                        onClick={changeSortOrder}
                                                        IconComponent={() => <img src={sortBy === 'full_name' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                    >Suspect Name
                                                    </TableSortLabel></TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', minWidth: 150 }}>
                                                    <TableSortLabel
                                                        id="aliases"
                                                        active={sortBy === 'aliases'}
                                                        direction={sortOrder}
                                                        onClick={changeSortOrder}
                                                        IconComponent={() => <img src={sortBy === 'aliases' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                    >Aliases
                                                    </TableSortLabel></TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', minWidth: 150 }}>
                                                    <TableSortLabel
                                                        id="case_number"
                                                        active={sortBy === 'case_number'}
                                                        direction={sortOrder}
                                                        onClick={changeSortOrder}
                                                        IconComponent={() => <img src={sortBy === 'case_number' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                    >Case Number
                                                    </TableSortLabel></TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', minWidth: 150 }}>
                                                    <TableSortLabel
                                                        id="investigating_officer_name"
                                                        active={sortBy === 'investigating_officer_name'}
                                                        direction={sortOrder}
                                                        onClick={changeSortOrder}
                                                        IconComponent={() => <img src={sortBy === 'investigating_officer_name' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                    >Investigation Officer
                                                    </TableSortLabel></TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', minWidth: 150 }}>
                                                    <TableSortLabel
                                                        id="police_unit_id"
                                                        active={sortBy === 'police_unit_id'}
                                                        direction={sortOrder}
                                                        onClick={changeSortOrder}
                                                        IconComponent={() => <img src={sortBy === 'police_unit_id' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                    >Police Station
                                                    </TableSortLabel></TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', minWidth: 150 }}>
                                                    <TableSortLabel
                                                        id="crime_date"
                                                        active={sortBy === 'crime_date'}
                                                        direction={sortOrder}
                                                        onClick={changeSortOrder}
                                                        IconComponent={() => <img src={sortBy === 'crime_date' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                    >Date of Crime
                                                    </TableSortLabel></TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', minWidth: 150 }}>
                                                    <TableSortLabel
                                                        id="createdAt"
                                                        active={sortBy === 'createdAt'}
                                                        direction={sortOrder}
                                                        onClick={changeSortOrder}
                                                        IconComponent={() => <img src={sortBy === 'createdAt' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                    >Date Reported
                                                    </TableSortLabel></TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', minWidth: 150 }}>
                                                    <TableSortLabel
                                                        id="captured_date"
                                                        active={sortBy === 'captured_date'}
                                                        direction={sortOrder}
                                                        onClick={changeSortOrder}
                                                        IconComponent={() => <img src={sortBy === 'captured_date' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                    >Captured Date
                                                    </TableSortLabel></TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                                    <TableSortLabel
                                                        id="current_status"
                                                        active={sortBy === 'current_status'}
                                                        direction={sortOrder}
                                                        onClick={changeSortOrder}
                                                        IconComponent={() => <img src={sortBy === 'current_status' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                    >Status
                                                    </TableSortLabel></TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', minWidth: 150 }}>
                                                    <TableSortLabel
                                                        id="suspect_reported_users"
                                                        active={sortBy === 'suspect_reported_users'}
                                                        direction={sortOrder}
                                                        onClick={changeSortOrder}
                                                        IconComponent={() => <img src={sortBy === 'suspect_reported_users' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                    >Sightings Reported
                                                    </TableSortLabel></TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', minWidth: 150 }}>
                                                    <TableSortLabel
                                                        id="last_know_location"
                                                        active={sortBy === 'last_know_location'}
                                                        direction={sortOrder}
                                                        onClick={changeSortOrder}
                                                        IconComponent={() => <img src={sortBy === 'last_know_location' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                    >Last Known Location
                                                    </TableSortLabel></TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', minWidth: 150 }}>
                                                    <TableSortLabel
                                                        id="contact_number"
                                                        active={sortBy === 'contact_number'}
                                                        direction={sortOrder}
                                                        onClick={changeSortOrder}
                                                        IconComponent={() => <img src={sortBy === 'contact_number' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                    >Contact Info
                                                    </TableSortLabel></TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                                    <TableSortLabel
                                                        id="requestReached"
                                                        active={sortBy === 'requestReached'}
                                                        direction={sortOrder}
                                                        onClick={changeSortOrder}
                                                        IconComponent={() => <img src={sortBy === 'requestReached' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                    >Request Reached
                                                    </TableSortLabel></TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                                    <TableSortLabel
                                                        id="requestAccepted"
                                                        active={sortBy === 'requestAccepted'}
                                                        direction={sortOrder}
                                                        onClick={changeSortOrder}
                                                        IconComponent={() => <img src={sortBy === 'requestAccepted' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                    >Request Accepted
                                                    </TableSortLabel></TableCell>
                                                <TableCell
                                                    sx={{
                                                        position: 'sticky',
                                                        right: 0,
                                                        zIndex: 1,
                                                        backgroundColor: '#F9FAFB', color: '#4B5563'
                                                    }}
                                                >Action</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {SAPS_Wanted_Responce?.data?.data.data.map((user) => (
                                                <TableRow key={user._id}>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        <Stack direction="row" alignItems="center" gap={1}>
                                                            <Avatar
                                                                src={user?.profile_image || nouser}
                                                                alt="User"
                                                            />
                                                            {user.full_name}
                                                        </Stack>
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        {user.aliases || "-"}
                                                    </TableCell>
                                                    <TableCell sx={{ color: user.colorCode }}>
                                                        {user.case_number || "-"}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        {user.investigating_officer || "-"}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        {user?.police_unit_id?.police_unit_name || "-"}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        {moment(user.crime_date).isSame(moment(), "day")
                                                            ? `Today, ${moment(user.crime_date).format("hh:mm A")}`
                                                            : formatDateTime(user.crime_date,"HH:mm:ss - DD/MM/YYYY")}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        {moment(user.createdAt).isSame(moment(), "day")
                                                            ? `Today, ${moment(user.createdAt).format("hh:mm A")}`
                                                            : formatDateTime(user.createdAt,"HH:mm:ss - DD/MM/YYYY")}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        {moment(user.captured_date).isSame(moment(), "day")
                                                            ? `Today, ${moment(user.captured_date).format("hh:mm A")}`
                                                            : formatDateTime(user.captured_date,"HH:mm:ss - DD/MM/YYYY") || '-'}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        <Chip
                                                            label={user.current_status}
                                                            sx={{
                                                                backgroundColor:
                                                                    user.current_status === 'captured' ? '#DCFCE7' :
                                                                        user.current_status === 'wanted' ? '#DC26261A' :
                                                                            '#FEF9C3',
                                                                '& .MuiChip-label': {
                                                                    textTransform: 'capitalize',
                                                                    color: user.current_status === 'captured' ? 'green' :
                                                                        user.current_status === 'wanted' ? '#DC2626' :
                                                                            'black',
                                                                }
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#367BE0' }}>
                                                        <Link style={{
                                                            textDecoration: 'none',
                                                            color: '#01C971',
                                                            cursor: 'pointer',
                                                        }} onClick={() => handleView(`/home/total-suspect?linked_case_type=sapswanted&linked_case_type_id=${user?._id}`)} state={{ isAccepted: true }}>
                                                            {user?.suspect_reported_users}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        {user.last_know_location || "-"}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        {user.contact_number || "-"}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#F97316', textAlign: 'center' }}>
                                                        <Link style={{
                                                            textDecoration: 'none',
                                                            color: '#F97316',
                                                            cursor: 'pointer',
                                                        }} onClick={() => handleView(`/home/total-saps-wanted/request-reached-users/${user?._id}`)} state={{ isAccepted: false }}>
                                                            {user.requestReached || "0"}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#01C971', textAlign: 'center' }}>
                                                        <Link style={{
                                                            textDecoration: 'none',
                                                            color: '#01C971',
                                                            cursor: 'pointer',
                                                        }} onClick={() => handleView(`/home/total-saps-wanted/request-reached-users/${user?._id}`)} state={{ isAccepted: true }}>
                                                            {user.requestAccepted || "0"}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell
                                                        sx={{
                                                            position: 'sticky',
                                                            right: 0,
                                                            backgroundColor: 'white',
                                                            zIndex: 1
                                                        }}
                                                    >
                                                        <Box align="center" sx={{ display: 'flex', flexDirection: 'row' }}>
                                                            <IconButton onClick={(e) => handleOpenMenu(e, user)}>
                                                                <MoreVertIcon />
                                                            </IconButton>

                                                        </Box>
                                                    </TableCell>
                                                    <Menu
                                                        anchorEl={anchorEl}
                                                        open={Boolean(anchorEl)}
                                                        onClose={handleCloseMenu}
                                                        anchorOrigin={{
                                                            vertical: "bottom",
                                                            horizontal: "right",
                                                        }}
                                                        transformOrigin={{
                                                            vertical: "top",
                                                            horizontal: "right",
                                                        }}
                                                    >
                                                        <MenuItem
                                                            onClick={() => {
                                                                handleCloseMenu();
                                                                handleView(`/home/total-saps-wanted/wanted-inforamtion/${selectedWantedObj?._id}`)
                                                            }}
                                                        >
                                                            <img src={OutlinedView} alt="view button" /> &nbsp; View
                                                        </MenuItem>
                                                        <MenuItem
                                                            onClick={() => {
                                                                handleCloseMenu();
                                                                handleView(`/home/total-saps-wanted/wanted-inforamtion/${selectedWantedObj?._id}`)
                                                            }}
                                                        >
                                                            <img src={outlinedEdit} alt="edit button" /> &nbsp;   Edit
                                                        </MenuItem>
                                                        <MenuItem
                                                            onClick={() => {
                                                                handleCloseMenu();
                                                                setconfirmationwanted(selectedWantedObj?._id)
                                                            }}
                                                        >
                                                            <img src={outlinedDustbin} alt="dustbin button" /> &nbsp;   Delete
                                                        </MenuItem>
                                                        
                                                    </Menu>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>

                                </TableContainer>
                                <Grid container sx={{ px: { xs: 0, sm: 3 } }} justifyContent="space-between" alignItems="center" mt={2}>
                                    <Grid>
                                        <Typography variant="body2" component="div">
                                            Rows per page:&nbsp;
                                            <Select
                                                size="small"
                                                sx={{
                                                    border: 'none',
                                                    boxShadow: 'none',
                                                    outline: 'none',
                                                    '& .MuiOutlinedInput-notchedOutline': {
                                                        border: 'none',
                                                    },
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                        border: 'none',
                                                    },
                                                    '& .MuiOutlinedInput-root': {
                                                        boxShadow: 'none',
                                                        outline: 'none',
                                                    },
                                                    '& .MuiSelect-select': {
                                                        outline: 'none',
                                                    },
                                                }}
                                                value={rowsPerPage}
                                                onChange={(e) => {
                                                    updateParams({rowsPerPage:Number(e.target.value),currentPage:1});
                                                }}
                                            >
                                                {[5, 10, 15, 20, 50, 100].map((num) => (
                                                    <MenuItem key={num} value={num}>
                                                        {num}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </Typography>
                                    </Grid>
                                    <Grid>
                                        <Box display="flex" alignItems="center" gap={{ xs: 1, sm: 2 }}>
                                            <Typography variant="body2">
                                                {currentPage} / {totalPages}
                                            </Typography>
                                            <IconButton
                                                disabled={currentPage === 1}
                                                onClick={() => updateParams({currentPage:currentPage - 1})}
                                            >
                                                <NavigateBeforeIcon fontSize="small" sx={{
                                                    color: currentPage === 1 ? '#BDBDBD' : '#1976d2'
                                                }} />
                                            </IconButton>
                                            <IconButton
                                                disabled={currentPage === totalPages}
                                                onClick={() => updateParams({currentPage:currentPage + 1})}
                                            >
                                                <NavigateNextIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </Grid>
                                </Grid>
                                    {confirmationwanted && (
                                        <DeleteConfirm
                                            id={confirmationwanted}
                                            setconfirmation={setconfirmationwanted}
                                            trip="sapswanted"
                                        />
                                    )}
                            </Box>
                        ) : (
                            <Typography align="center" color="text.secondary" sx={{ mt: 2 }}>
                                No data found
                            </Typography>
                        )}


                    </Paper>
                </Box>
                <Box p={2}>
                    <Paper elevation={3} sx={{ backgroundColor: "rgb(253, 253, 253)", padding: 2, borderRadius: '10px' }}>
                        <Grid container justifyContent="space-between" alignItems="center" mb={2}>
                            <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', flexDirection: 'row', gap: 2, mb: { xs: 1, md: 0 } }}>
                                <Typography variant="h6" fontWeight={590}>SAPS Members</Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 8 }} sx={{ display: 'flex', justifyContent: 'flex-end', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>

                                <TextField
                                    variant="outlined"
                                    placeholder="Search"
                                    value={filterMember}
                                    onChange={(e) => updateMembersParams({filterMember:e.target.value})}
                                    fullWidth
                                    sx={{
                                        width: '100%',
                                        height: '40px',
                                        borderRadius: '8px',
                                        '& .MuiInputBase-root': {
                                            height: '40px',
                                            fontSize: '14px',
                                        },
                                        '& .MuiOutlinedInput-input': {
                                            padding: '10px 14px',
                                        },
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <img src={search} alt="search icon" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <Box display="flex" sx={{ justifyContent: { xs: 'space-between' } }} gap={1}>
                                    <CustomDateRangePicker
                                        borderColor={'var(--light-gray)'}
                                        value={rangeMember}
                                        onChange={(nextRange) => {
                                            setRangeMember(nextRange);
                                            updateMembersParams({
                                                startDateMember: new Date(nextRange[0].startDate).toISOString(),
                                                endDateMember: new Date(nextRange[0].endDate).toISOString(),
                                            });
                                        }}
                                        icon={calender}
                                    />
                                    <CustomExportMenu onExport={handleExportMember} />
                                    <Button
                                        startIcon={<img src={plus} alt="plus icon" />}
                                        variant="outlined" size="small" sx={{ height: '40px', width: '150px', borderRadius: '8px' }}
                                        onClick={() => setpopup(true)}

                                    >
                                        Import Sheet
                                    </Button>
                                    <Button
                                        variant="contained"
                                        sx={{ height: '40px', width: '200px', borderRadius: '8px' }}
                                        onClick={() => nav("/home/total-saps-wanted/add-saps-member")}
                                        startIcon={<img src={whiteplus} alt='white plus' />}
                                    >
                                        Add Saps Member
                                    </Button>
                                </Box>

                            </Grid>
                        </Grid>

                        {SAPS_Members_Responce.isFetching ? (
                            <Loader />
                        ) : SAPS_Members_Responce?.data?.data.data?.length > 0 ? (
                            <Box sx={{ px: { xs: 0, md: 2 }, pt: { xs: 0, md: 3 }, backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
                                <TableContainer>
                                    <Table sx={{ '& .MuiTableCell-root': { fontSize: '15px' } }}>
                                        <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                            <TableRow >
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', borderTopLeftRadius: '10px', minWidth: 150 }}>
                                                    <TableSortLabel
                                                        id="first_name"
                                                        active={sortByMember === 'first_name'}
                                                        direction={sortOrderMember}
                                                        onClick={changeSortOrderMember}
                                                        IconComponent={() => <img src={sortByMember === 'first_name' ? sortOrderMember === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                    >User</TableSortLabel>
                                                </TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', minWidth: 150 }}>
                                                    <TableSortLabel
                                                        id="police_unit"
                                                        active={sortByMember === 'police_unit'}
                                                        direction={sortOrderMember}
                                                        onClick={changeSortOrderMember}
                                                        IconComponent={() => <img src={sortByMember === 'police_unit' ? sortOrderMember === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                    >Police Station Name</TableSortLabel>
                                                </TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', minWidth: 150 }}>
                                                    <TableSortLabel
                                                        id="mobile_no"
                                                        active={sortByMember === 'mobile_no'}
                                                        direction={sortOrderMember}
                                                        onClick={changeSortOrderMember}
                                                        IconComponent={() => <img src={sortByMember === 'mobile_no' ? sortOrderMember === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                    >Contact No.</TableSortLabel>
                                                </TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', minWidth: 150 }}>
                                                    <TableSortLabel
                                                        id="email"
                                                        active={sortByMember === 'email'}
                                                        direction={sortOrderMember}
                                                        onClick={changeSortOrderMember}
                                                        IconComponent={() => <img src={sortByMember === 'email' ? sortOrderMember === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                    >Contact Email</TableSortLabel>
                                                </TableCell>
                                                <TableCell align="center" sx={{ backgroundColor: '#F9FAFB', borderTopRightRadius: '10px', color: '#4B5563' }}>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {SAPS_Members_Responce?.data?.data.data.map((user) => (
                                                <TableRow key={user._id}>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        <Stack direction="row" alignItems="center" gap={1}>
                                                            <Avatar
                                                                src={user?.selfieImage || nouser}
                                                                alt="User"
                                                            />

                                                            {user.first_name} {user.last_name}

                                                        </Stack>
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        {user?.police_unit_id?.police_unit_name || "-"}
                                                    </TableCell>
                                                    <TableCell sx={{ color: user.colorCode }}>
                                                        {user.mobile_no_country_code+' '+user.mobile_no || "-"}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        {user.email || "-"}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box align="center" sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                                                            <Tooltip title="View" arrow placement="top">
                                                                <IconButton onClick={() => handleView(`/home/total-saps-wanted/saps-member-inforamtion/${user._id}`)}>
                                                                    <img src={ViewBtn} alt="view button" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Delete" arrow placement="top">
                                                                <IconButton onClick={() => setconfirmation(user._id)}>
                                                                    <img src={delBtn} alt="delete button" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            {confirmation === user._id && (
                                                                <DeleteConfirm
                                                                    id={user._id}
                                                                    setconfirmation={setconfirmation}
                                                                    trip="sapsmember"
                                                                />
                                                            )}

                                                        </Box>
                                                    </TableCell>

                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>

                                </TableContainer>
                                <Grid container sx={{ px: { xs: 0, sm: 3 } }} justifyContent="space-between" alignItems="center" mt={2}>
                                    <Grid>
                                        <Typography variant="body2" component="div">
                                            Rows per page:&nbsp;
                                            <Select
                                                size="small"
                                                sx={{
                                                    border: 'none',
                                                    boxShadow: 'none',
                                                    outline: 'none',
                                                    '& .MuiOutlinedInput-notchedOutline': {
                                                        border: 'none',
                                                    },
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                        border: 'none',
                                                    },
                                                    '& .MuiOutlinedInput-root': {
                                                        boxShadow: 'none',
                                                        outline: 'none',
                                                    },
                                                    '& .MuiSelect-select': {
                                                        outline: 'none',
                                                    },
                                                }}
                                                value={rowsPerPageMember}
                                                onChange={(e) => {
                                                    updateMembersParams({rowsPerPageMember:Number(e.target.value),currentPageMember:1});
                                                }}
                                            >
                                                {[5, 10, 15, 20, 50, 100].map((num) => (
                                                    <MenuItem key={num} value={num}>
                                                        {num}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </Typography>
                                    </Grid>
                                    <Grid>
                                        <Box display="flex" alignItems="center" gap={{ xs: 1, sm: 2 }}>
                                            <Typography variant="body2">
                                                {currentPageMember} / {totalMemberPages}
                                            </Typography>
                                            <IconButton
                                                disabled={currentPageMember === 1}
                                                onClick={() => updateMembersParams({currentPageMember:currentPageMember - 1})}
                                            >
                                                <NavigateBeforeIcon fontSize="small" sx={{
                                                    color: currentPageMember === 1 ? '#BDBDBD' : '#1976d2'
                                                }} />
                                            </IconButton>
                                            <IconButton
                                                disabled={currentPageMember === totalMemberPages}
                                                onClick={() => updateMembersParams({currentPageMember:currentPageMember + 1})}
                                            >
                                                <NavigateNextIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>
                        ) : (
                            <Typography align="center" color="text.secondary" sx={{ mt: 2 }}>
                                No data found
                            </Typography>
                        )}


                    </Paper>
                </Box>
                {popup && <ImportSheet setpopup={setpopup} type="saps-member" />}
            </Box>
        </Box>
    )
}

export default ListOfSapsWanted
