import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams,Link } from "react-router-dom";
import {
    Box, Typography, Avatar, TextField, Button, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Grid, InputAdornment, Stack, Select, MenuItem, Chip,
    Tooltip,TableSortLabel
} from "@mui/material";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import search from '../../assets/images/search.svg';
import ViewBtn from '../../assets/images/ViewBtn.svg'
import delBtn from '../../assets/images/delBtn.svg'
import Listtrip from '../../assets/images/Listtrip.svg'
import SingleImagePreview from "../../common/SingleImagePreview";
import { useGetCrimeReportList, usePutIsArchived } from "../../API Calls/API";
import Loader from "../../common/Loader";
import CustomFilter from '../../common/Custom/CustomFilter'
import ImportSheet from "../../common/ImportSheet";
import CustomExportMenu from '../../common/Custom/CustomExport'
import CustomDateRangePicker from "../../common/Custom/CustomDateRangePicker";
import calender from '../../assets/images/calender.svg';
import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable'
import * as XLSX from 'xlsx';
import { toast } from "react-toastify";
import apiClient from '../../API Calls/APIClient'
import { startOfYear } from "date-fns";
import { DeleteConfirm } from "../../common/ConfirmationPOPup";
import moment from "moment";
import arrowup from '../../assets/images/arrowup.svg';
import arrowdown from '../../assets/images/arrowdown.svg';
import arrownuteral from '../../assets/images/arrownuteral.svg';
import { saveScrollPosition, restoreScrollPosition } from "../../common/ScrollPosition";

const ListOfCrimeReports = () => {
    const [popup, setpopup] = useState(false);
    const nav = useNavigate();
    const [role] = useState(localStorage.getItem("role"));
    const params = useParams();const [searchParams, setSearchParams] = useSearchParams();
    const startDateParam = searchParams.get("startDate") || startOfYear(new Date()).toISOString();
    const endDateParam = searchParams.get("endDate") || new Date().toISOString();
    const [range, setRange] = useState([{
        startDate: new Date(startDateParam),
        endDate: new Date(endDateParam),
        key: 'selection'
    }]);
    const currentPage = Number(searchParams.get("currentPage")) || 1;
    const filter = searchParams.get("filter") || "";
    const rowsPerPage = Number(searchParams.get("rowsPerPage")) || 10;
    const locationFilter = searchParams.get("locationFilter") || "";
    const [isExporting, setIsExporting] = useState(false);
    const [confirmation, setconfirmation] = useState("");
    const [archived, setArchived] = useState(false)

    // Sort
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("desc");

    const changeSortOrder = (e) => {
        const field = e.target.id;

        if (field !== sortBy) {
            setSortBy(field);
            setSortOrder("asc");
        } else {
            setSortOrder(p => p === 'asc' ? 'desc' : 'asc')
        }
    }

    let companyId = localStorage.getItem("userID");
    const paramId = role === "company" ? companyId : params.id;
    const startDate = range[0].startDate.toISOString();
    const endDate = range[0].endDate.toISOString();

    const UserList = useGetCrimeReportList("crime report list", role, currentPage, rowsPerPage, filter,locationFilter, startDate, endDate, archived,sortBy, sortOrder);
    const totalCrimeReportData = UserList.data?.data?.totalCrimeReportData || 0;
    const totalPages = Math.ceil(totalCrimeReportData / rowsPerPage);

    const updateTripMutation = usePutIsArchived(
        (id, data) => {
            toast.success("Crime Report Archived Successfully")

            UserList.refetch();
        },
        (error) => {
            console.error('Error updating trip:', error);
        }
    );
    const shortText = (text, limit = 30) =>
        text.length > limit ? text.substring(0, limit) + '...' : text;

    const handleExport = async ({ startDate, endDate, exportFormat }) => {
        try {
            
            const data  = UserList.data?.data

            const allUsers = data?.crimeReportData || [];
            if (!allUsers.length) {
                toast.warning("No Crime Report data found for this period.");
                return;
            }

            const exportData = allUsers.map(user => ({
                "Crime ID": `${user.crime_report_number || ''}` || '',
                "Reporter": user.user?.first_name || '',
                "Location": `${user.address || ''}`,
                "Description": user.description || '',
                "Date Reported": user.createdAt || '',
                "Status": user.report_status || ''
            }));
            
            if (exportFormat === "xlsx") {
                const worksheet = XLSX.utils.json_to_sheet(exportData);
                const columnWidths = Object.keys(exportData[0] || {}).map((key) => ({
                    wch: Math.max(key.length, ...exportData.map((row) => String(row[key] ?? 'NA').length)) + 2
                }));
                worksheet['!cols'] = columnWidths;
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
                XLSX.writeFile(workbook, "Crime_Report_List.xlsx");
            }
            else if (exportFormat === "csv") {
                
                const worksheet = XLSX.utils.json_to_sheet(exportData);
                const csv = XLSX.utils.sheet_to_csv(worksheet);
                const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'Crime_Report_List.csv';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
            else if (exportFormat === "pdf") {
                const doc = new jsPDF();
                doc.text('Crime Report List', 14, 16);
                autoTable(doc, {
                    head: [['Crime ID', 'Reporter', 'Location.', 'Description','Date Reported','Status']],
                    body: allUsers.map(user => [
                        user.crime_report_number ?? 'NA',
                        `${user.user?.first_name || ''} ${user.user?.last_name || ''}` ?? 'NA',
                        `${user.address || ''}` ?? 'NA',
                        user.description ?? 'NA',
                        user.createdAt ?? 'NA',
                        user.report_status ?? 'NA'
                    ]),
                    startY: 20,
                    theme: 'striped',
                    headStyles: { fillColor: '#367BE0' },
                    margin: { top: 20 },
                    styles: { fontSize: 10 },
                });
                doc.save("Crime_Report_List.pdf");
            }

        } catch (err) {
            console.error("Error exporting data:", err);
            toast.error("Export failed.");
        }
    };

    const handleFilterData = (data) => {

        const params = Object.fromEntries(
            Object.entries(data).filter(
                ([_, value]) => value !== "" && value !== undefined && value !== null
            )
        );

        const filterText = new URLSearchParams(params).toString();
        updateParams({locationFilter:filterText})
    };

    const updateParams = (newParams) => {
        setSearchParams({
            currentPage,
            rowsPerPage: rowsPerPage,
            startDate: startDateParam,
            endDate: endDateParam,
            filter,
            locationFilter,
            ...newParams,
        });
    };
    const getImageLink = (name) => {
        if (!name) return undefined;
        return `https://gaurdianlink.blob.core.windows.net/gaurdianlink/${name}`;
    }

    const [previewImage, setPreviewImage] = useState({
        open: false,
        src: '',
        label: ''
    });
    const handleImageClick = (src, label) => {
        if (src) {
            setPreviewImage({
                open: true,
                src: src instanceof File ? URL.createObjectURL(src) : src,
                label: label
            });
        }
    };

    const handleClosePreview = () => {
        setPreviewImage(prev => ({ ...prev, open: false }));
    };

    // Handle Scroll Event store 
    const handleView = (url) => {
        saveScrollPosition("crimeListScroll");
        nav(url);
    };
    useEffect(() => {
        if (UserList.data?.data?.totalCrimeReportData) {
            restoreScrollPosition("crimeListScroll");
        }
    }, [UserList.data?.data?.totalCrimeReportData]);

    return (
        <>
            <SingleImagePreview
                show={previewImage.open}
                onClose={handleClosePreview}
                image={previewImage.src ? { src: previewImage.src, label: previewImage.label } : null}
            />
        <Box p={2}>
            <Paper elevation={3} sx={{ backgroundColor: "rgb(253, 253, 253)", padding: 2, borderRadius: '10px' }}>
                <Grid container justifyContent="space-between" alignItems="center" mb={2}>
                    <Grid size={{ xs: 12, lg: 3 }} sx={{ display: 'flex', flexDirection: 'row', gap: 2, mb: { xs: 1, md: 0 } }}>
                        <Typography variant="h6" fontWeight={590}>All Crime Reports</Typography>
                        <Typography variant="h6" fontWeight={550}>
                            {UserList.isSuccess ? UserList.data?.data?.totalCrimeReportData : 0}
                        </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, lg: 9 }} sx={{ display: 'flex', justifyContent: 'flex-end', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mt: { xs: 2, lg: 0 } }}>

                        <TextField
                            variant="outlined"
                            placeholder="Search"
                            value={filter}
                            onChange={(e) => updateParams({filter:e.target.value})}
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
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: 'var(--light-gray)',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'var(--light-gray)',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'var(--light-gray)',
                                    },
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
                            <CustomFilter onApply={handleFilterData} isSuburbVisible ={false} />
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
                                onClick={() => nav('/home/crime-reports/view-archeived-crime-report')}
                                variant="contained"
                                sx={{ height: '40px', fontSize: '0.8rem', backgroundColor: '#367BE0', width: '180px', borderRadius: '8px' }}
                                startIcon={<img src={ViewBtn} alt="View" />}>
                                View Archeived
                            </Button>
                        </Box>

                    </Grid>
                </Grid>
                <Box sx={{ px: { xs: 0, md: 2 }, pt: { xs: 0, md: 3 }, backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
                    <TableContainer >
                        <Table sx={{ '& .MuiTableCell-root': { fontSize: '15px' } }}>
                            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableRow >
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', borderTopLeftRadius: '10px' }}>
                                            <TableSortLabel
                                                id="crime_report_number"
                                                active={sortBy === 'crime_report_number'}
                                                direction={sortOrder}
                                                onClick={changeSortOrder}
                                                IconComponent={() => <img src={sortBy === 'crime_report_number' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                            >Crime ID</TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                        <TableSortLabel
                                                id="address"
                                                active={sortBy === 'address'}
                                                direction={sortOrder}
                                                onClick={changeSortOrder}
                                                IconComponent={() => <img src={sortBy === 'address' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                            >Location</TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                        <TableSortLabel
                                                id="description"
                                                active={sortBy === 'description'}
                                                direction={sortOrder}
                                                onClick={changeSortOrder}
                                                IconComponent={() => <img src={sortBy === 'description' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                            >Short Description</TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                        <TableSortLabel
                                                id="first_name"
                                                active={sortBy === 'first_name'}
                                                direction={sortOrder}
                                                onClick={changeSortOrder}
                                                IconComponent={() => <img src={sortBy === 'first_name' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                            >Reporter</TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                        <TableSortLabel
                                                id="requestReached"
                                                active={sortBy === 'requestReached'}
                                                direction={sortOrder}
                                                onClick={changeSortOrder}
                                                IconComponent={() => <img src={sortBy === 'requestReached' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                            >Request Reached</TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                        <TableSortLabel
                                                id="requestAccepted"
                                                active={sortBy === 'requestAccepted'}
                                                direction={sortOrder}
                                                onClick={changeSortOrder}
                                                IconComponent={() => <img src={sortBy === 'requestAccepted' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                            >Request Accepted</TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                       Images
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                        <TableSortLabel
                                                id="createdAt"
                                                active={sortBy === 'createdAt'}
                                                direction={sortOrder}
                                                onClick={changeSortOrder}
                                                IconComponent={() => <img src={sortBy === 'createdAt' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                            >Date Reported</TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                        <TableSortLabel
                                                id="report_status"
                                                active={sortBy === 'report_status'}
                                                direction={sortOrder}
                                                onClick={changeSortOrder}
                                                IconComponent={() => <img src={sortBy === 'report_status' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                            >Status</TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                       <TableSortLabel
                                                id="sighting_reported"
                                                active={sortBy === 'sighting_reported'}
                                                direction={sortOrder}
                                                onClick={changeSortOrder}
                                                IconComponent={() => <img src={sortBy === 'sighting_reported' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                            >Sighting Reported</TableSortLabel>
                                    </TableCell>
                                    <TableCell align="center" sx={{ backgroundColor: '#F9FAFB', borderTopRightRadius: '10px', color: '#4B5563' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {UserList.isFetching ?
                                    (<TableRow>
                                        <TableCell sx={{ color: '#4B5563', borderBottom: 'none' }} colSpan={10} align="center">
                                            <Loader />
                                        </TableCell>
                                    </TableRow>)
                                    : (UserList.data?.data.crimeReportData?.length > 0 ?
                                        UserList.data?.data.crimeReportData.map((report) => (

                                            <TableRow key={report._id}>
                                                <TableCell sx={{ color: 'var(--Blue)' }}>
                                                    {report.crime_report_number}
                                                </TableCell>
                                                <TableCell sx={{ color: '#4B5563' }}>

                                                    {report.address || "-"}

                                                </TableCell>
                                                <TableCell sx={{ color: 'black' }}>

                                                    {shortText(report.description)}

                                                </TableCell>
                                                <TableCell sx={{ color: '#4B5563' }}>
                                                    <Link onClick={()=> handleView(report.user?.role === "driver" ? `/home/total-drivers/driver-information/${report.user_id}` : `/home/total-users/user-information/${report.user_id}`)} className="link2">
                                                        <Stack direction="row" alignItems="center" gap={1}>
                                                            <Avatar
                                                                src={getImageLink(report.user?.selfieImage)}
                                                                sx={{ '&:hover': { textDecoration: 'none' } }}
                                                                alt="User"
                                                            />
                                                            {report.user?.first_name + ' ' + report.user?.last_name || "-"}
                                                        </Stack>
                                                    </Link>
                                                </TableCell>
                                                <TableCell sx={{ color: '#F97316', textAlign: 'center' }}>
                                                    <Link style={{
                                                                textDecoration: 'none',
                                                                color: 'var(--orange)',
                                                                cursor: 'pointer',
                                                            }} onClick={()=> handleView(`/home/crime-reports/request-reached-users/${report?._id}`)}>{report?.requestReached || "0"}
                                                    </Link>
                                                </TableCell>
                                                <TableCell sx={{ color: '#01C971', textAlign: 'center' }}>
                                                    <Link style={{
                                                        textDecoration: 'none',
                                                        color: '#01C971',
                                                        cursor: 'pointer',
                                                    }} onClick={()=> handleView(`/home/crime-reports/request-reached-users/${report?._id}`)} state={{ isAccepted: true }}
>
                                                        {report?.requestAccepted || "0"}
                                                    </Link>
                                                </TableCell>
                                                <TableCell sx={{ color: '#4B5563' }}>
                                                    <Stack direction="row" alignItems="center" spacing={1}>
                                                        {report.evidence_image.slice(0, 2).map((item, index) => (
                                                            <Box
                                                                key={index}
                                                                component="img"
                                                                src={item}
                                                                onClick={() => handleImageClick(item,`evidence-${index+1}`)}
                                                                alt={`evidence-${index}`}
                                                                sx={{
                                                                    width: "32px",
                                                                    height: "32px",
                                                                    objectFit: 'cover',
                                                                    borderRadius: '6px',
                                                                    cursor:'pointer',
                                                                    border: '1px solid #E5E7EB'
                                                                }}
                                                            />
                                                        ))}
                                                        {report.evidence_image.length > 2 && (
                                                            <Box
                                                                sx={{
                                                                    width: 32,
                                                                    height: 32,
                                                                    backgroundColor: '#D1D5DB',
                                                                    borderRadius: '6px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    fontSize: '14px',
                                                                    color: '#374151',
                                                                    cursor: 'pointer',
                                                                    fontWeight: 500
                                                                }}
                                                                onClick={() => handleView(`/home/crime-reports/crime-report/${report._id}`)}
                                                            >
                                                                +{report.evidence_image.length - 2}
                                                            </Box>
                                                        )}
                                                    </Stack>
                                                </TableCell>
                                                <TableCell sx={{ color: '#4B5563' }}>
                                                    {moment(report.createdAt).isSame(moment(), "day")
                                                        ? `Today, ${moment(report.createdAt).format("hh:mm A")}`
                                                        : moment(report.createdAt).format("HH:mm:ss - DD/MM/YYYY")}
                                                </TableCell>

                                                <TableCell sx={{ color: '#4B5563' }}>
                                                    <Chip
                                                        label={report.report_status}
                                                        sx={{
                                                            backgroundColor:
                                                                report.report_status === 'With SAPS' ? '#DCFCE7' :
                                                                    report.report_status === 'reviewing' ? '#FEF9C3' :
                                                                        report.report_status == 'reviewed' ? '#DBEAFE' :
                                                                            report.report_status == 'pending' ? '#F3F4F6' :
                                                                                '#FEF9C3',
                                                            '& .MuiChip-label': {
                                                                textTransform: 'capitalize',
                                                                color: report.report_status === 'With SAPS' ? 'green' :
                                                                    report.report_status === 'reviewing' ? '#854D0E' :
                                                                        report.report_status == 'reviewed' ? '#1E40AF' :
                                                                            report.report_status == 'pending' ? '#1F2937' :

                                                                                'black',
                                                            }
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ color: '#01C971', textAlign: 'center' }}>
                                                    <Link style={{
                                                        textDecoration: 'none',
                                                        color: '#01C971',
                                                        cursor: 'pointer',
                                                    }} onClick={()=> handleView(`/home/total-suspect?linked_case_type=crimereports&linked_case_type_id=${report?._id}`)} state={{ isAccepted: true }}>
                                                    {report.suspect_reported_users}
                                                    </Link>
                                                </TableCell>
                                                <TableCell >
                                                    <Box align="center" sx={{ display: 'flex', flexDirection: 'row' }}>
                                                        <Tooltip title="View" arrow placement="top">
                                                            <IconButton onClick={() => handleView(`/home/crime-reports/crime-report/${report._id}`)}>
                                                                <img src={ViewBtn} alt="flagged button" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Delete" arrow placement="top">
                                                            <IconButton onClick={() => setconfirmation(report?._id)}>
                                                                <img src={delBtn} alt="delete button" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Archive" arrow placement="top">
                                                            <IconButton onClick={() => {
                                                                updateTripMutation.mutate({
                                                                    id: report?._id,
                                                                    data: { isArchived: true }
                                                                });
                                                            }}>
                                                                <img src={Listtrip} alt="view button" />
                                                            </IconButton>
                                                        </Tooltip>

                                                        {confirmation === report?._id && (
                                                            <DeleteConfirm id={report?._id} trip={"crimeReport"} setconfirmation={setconfirmation} />
                                                        )}
                                                    </Box>


                                                </TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={10} align="center">
                                                    <Typography align="center" color="text.secondary" sx={{ mt: 2 }}>
                                                        No data found
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                }
                            </TableBody>
                        </Table>

                    </TableContainer>

                    {!UserList.isFetching && UserList.data?.data.crimeReportData.length > 0 &&
                        <Grid container sx={{ px: { xs: 0, sm: 3 } }} justifyContent="space-between" alignItems="center" mt={2}>
                            <Grid>
                                <Typography variant="body2">
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
                        </Grid>}
                </Box>
            </Paper>
            {popup && <ImportSheet setpopup={setpopup} type="user" />}
        </Box>
        </>
    );
}
export default ListOfCrimeReports;
