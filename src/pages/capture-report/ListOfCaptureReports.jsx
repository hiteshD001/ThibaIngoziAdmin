import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, Link} from "react-router-dom";
import {
    Box, Typography, TextField, Avatar, Button, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Grid, InputAdornment, Stack, Select, MenuItem, Chip,
    Tooltip,Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from "@mui/material";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import search from '../../assets/images/search.svg';
import ViewBtn from '../../assets/images/ViewBtn.svg'
import delBtn from '../../assets/images/delBtn.svg'
import Listtrip from '../../assets/images/Listtrip.svg'
import { useGetCaptureReportList, useCaptureIsArchived } from "../../API Calls/API";
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
import { startOfYear } from "date-fns";
import { DeleteConfirm } from "../../common/ConfirmationPOPup";
import whiteplus from '../../assets/images/whiteplus.svg';
import {getImageLink,formatDateTime,calculteTime } from '../../common/commonFn';
import SingleImagePreview from "../../common/SingleImagePreview";
import fileBtn from '../../assets/images/fileBtn.svg'

const ListOfCaptureReports = () => {
    const [popup, setpopup] = useState(false);
    const nav = useNavigate();
    const [role] = useState(localStorage.getItem("role"));
    const params = useParams();
    const [page, setpage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [filter, setfilter] = useState("");
    const [isExporting, setIsExporting] = useState(false);
    const [confirmation, setconfirmation] = useState("");
    const [locationFilter, setlocationFilter] = useState("");
    const location = useLocation();
    const getQueryParams = new URLSearchParams(location.search);
    const [archived, setArchived] = useState(false)
    const [openSummaryModel, setOpenSummaryModel] = useState(false);
    const [summaryReportData, setSummaryReportData] = useState({});
   
    // Sort
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("asc");

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
    const [range, setRange] = useState([
        {
            startDate: startOfYear(new Date()),
            endDate: new Date(),
            key: 'selection'
        }
    ]);
    const startDate = range[0].startDate.toISOString();
    const endDate = range[0].endDate.toISOString();
    
    const UserList = useGetCaptureReportList("capture report list", getQueryParams.get("location_id"), role, currentPage, rowsPerPage, filter, startDate, endDate, archived,sortBy, sortOrder);
    const totalData = UserList.data?.data?.totalData || 0;
    const totalPages = Math.ceil(totalData / rowsPerPage);

    const updateTripMutation = useCaptureIsArchived(
        (id, data) => {
            toast.success("Capture Report Archived Successfully")

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

            const allUsers = data?.data || [];
            if (!allUsers.length) {
                toast.warning("No Capture Report data found for this period.");
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
        setlocationFilter(filterText)
    };

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

    const openSummaryReportModel = (dataObj) => {
        
        setSummaryReportData(dataObj);
        setOpenSummaryModel(true);
    };
    const closeOtherUsersModal = () => {
        setOpenSummaryModel(false);
        setSummaryReportData([]);
    };

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
                        <Typography variant="h6" fontWeight={590}>All Incident Reports</Typography>
                        <Typography variant="h6" fontWeight={550}>
                            {UserList.isSuccess ? UserList.data?.data?.totalData : 0}
                        </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, lg: 9 }} sx={{ display: 'flex', justifyContent: 'flex-end', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mt: { xs: 2, lg: 0 } }}>

                        <TextField
                            variant="outlined"
                            placeholder="Search"
                            value={filter}
                            onChange={(e) => setfilter(e.target.value)}
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
                            <CustomFilter onApply={handleFilterData} />
                            <CustomDateRangePicker
                                borderColor={'var(--light-gray)'}
                                value={range}
                                onChange={setRange}
                                icon={calender}
                            />

                            <Button
                                variant="contained"
                                sx={{ height: '40px', width: '150px', borderRadius: '8px' }}
                                onClick={() => nav(`/home/capture-reports/save?location_id=${getQueryParams.get("location_id")}`)}
                                startIcon={<img src={whiteplus} alt='white plus' />}
                            >
                               Capture Report
                            </Button>
                            <CustomExportMenu onExport={handleExport} />
                            <Button
                                onClick={() => nav(`/home/capture-reports/view-archeived-capture-report?location_id=${getQueryParams.get("location_id")}`)}
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
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', borderTopLeftRadius: '10px' }}>SOS ID</TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Responder</TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Captured By</TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Reported Date</TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Capture Location</TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Distance</TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>ETA</TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Trigger</TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Arrival</TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Response Time</TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Responded</TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Assessment</TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Media</TableCell>
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
                                    : (UserList.data?.data.data?.length > 0 ?
                                        UserList.data?.data.data.map((report) => (
                                            
                                            <TableRow key={report._id}>
                                                <TableCell sx={{ color: 'var(--Blue)' }}>
                                                    {report?.location?.sosNumber || '-'}
                                                </TableCell>
                                                <TableCell sx={{ color: '#4B5563' }}>
                                                    {
                                                        report?.user?.role === "driver" ? (
                                                            <Link to={`/home/total-drivers/driver-information/${report?.user?._id}`} className="link">
                                                                <Stack direction="row" alignItems="center" gap={1}>
                                                                    <Avatar
                                                                        src={getImageLink(report?.user?.selfieImage)}
                                                                        sx={{ '&:hover': { textDecoration: 'none' } }}
                                                                        alt="User"
                                                                    />

                                                                    {report?.user?.first_name} {report?.user?.last_name}
                                                                </Stack>
                                                            </Link>) : (
                                                            <Link to={`/home/total-users/user-information/${report?.user?._id || report?._id}`} className="link">
                                                                <Stack direction="row" alignItems="center" gap={1}>
                                                                    <Avatar
                                                                        src={getImageLink(report?.user?.selfieImage)}
                                                                        alt="User"
                                                                    />

                                                                    {report?.user?.first_name} {report?.user?.last_name}
                                                                </Stack>
                                                            </Link>
                                                        )
                                                    }
                                                </TableCell>
                                                <TableCell sx={{ color: '#4B5563' }}>
                                                    {report?.capture_by ?
                                                        (report?.capture_by?.role === "driver" ? (
                                                            <Link to={`/home/total-drivers/driver-information/${report?.capture_by?._id}`} className="link">
                                                                <Stack direction="row" alignItems="center" gap={1}>
                                                                    <Avatar
                                                                        src={getImageLink(report?.capture_by?.selfieImage)}
                                                                        sx={{ '&:hover': { textDecoration: 'none' } }}
                                                                        alt="User"
                                                                    />

                                                                    {report?.capture_by?.first_name} {report?.capture_by?.last_name}
                                                                </Stack>
                                                            </Link>) : (
                                                            <Link to={`/home/total-users/user-information/${report?.capture_by?._id || report?._id}`} className="link">
                                                                <Stack direction="row" alignItems="center" gap={1}>
                                                                    <Avatar
                                                                        src={getImageLink(report?.capture_by?.selfieImage)}
                                                                        alt="User"
                                                                    />

                                                                    {report?.capture_by?.first_name} {report?.capture_by?.last_name}
                                                                </Stack>
                                                            </Link>
                                                        )) : '-'
                                                    }
                                                </TableCell>
                                                <TableCell sx={{ color: '#4B5563' }}>

                                                    {formatDateTime(report.createdAt,"DD/MM/YYYY") || "-"}

                                                </TableCell>
                                                <TableCell sx={{ color: '#4B5563' }}>

                                                    {report.address || "-"}

                                                </TableCell>
                                                <TableCell sx={{ color: 'black' }}>

                                                    {report.distance}

                                                </TableCell>
                                                <TableCell sx={{ color: 'black' }}>

                                                    {report.eta || "-"}

                                                </TableCell>
                                                <TableCell sx={{ color: 'black' }}>

                                                    {formatDateTime(report.createdAt,"HH:mm:ss") || "-"}

                                                </TableCell>
                                                <TableCell sx={{ color: 'black' }}>

                                                    {report.arrival || "-"}

                                                </TableCell>
                                                <TableCell sx={{ color: 'black' }}>

                                                    {calculteTime(report.createdAt,report.arrival) || "-"}

                                                </TableCell>
                                                <TableCell sx={{ color: 'black' }}>

                                                    {report.isRespond ? 'Yes' : 'No'}

                                                </TableCell>
                                                <TableCell sx={{ color: '#4B5563' }}>
                                                    <Chip
                                                        label={report?.capture_report?.report_status || 'No Report'}
                                                        sx={{
                                                            backgroundColor:
                                                                report?.capture_report?.report_status === 'No Report' ? '#4B55631A' :
                                                                    report?.capture_report?.report_status === 'View Report' ? '#367BE01A' :
                                                                                '#4B55631A',
                                                            '& .MuiChip-label': {
                                                                textTransform: 'capitalize',
                                                                color: report?.capture_report?.report_status === 'No Report' ? '#4B5563' :
                                                                    report?.capture_report?.report_status === 'View Report' ? '#367BE0' :
                                                                                'black',
                                                            }
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ color: '#4B5563' }}>
                                                    <Stack direction="row" alignItems="center" spacing={1}>
                                                        {report?.capture_report?.evidence_image.slice(0, 2).map((item, index) => (
                                                            <Box
                                                                key={index}
                                                                component="img"
                                                                src={getImageLink(item)}
                                                                onClick={() => handleImageClick(getImageLink(item), `Evidence-${index + 1}`)}
                                                                alt={`evidence-${index}`}
                                                                sx={{
                                                                    width: "32px",
                                                                    height: "32px",
                                                                    objectFit: 'cover',
                                                                    borderRadius: '6px',
                                                                    cursor: 'pointer',
                                                                    border: '1px solid #E5E7EB'
                                                                }}
                                                            />
                                                        ))}
                                                        {report?.capture_report?.evidence_image.length > 2 && (
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
                                                                onClick={() => nav(`/home/capture-reports/${report._id}`)}
                                                            >
                                                                +{report.evidence_image.length - 2}
                                                            </Box>
                                                        )}
                                                    </Stack>
                                                </TableCell>
                                                
                                                <TableCell >
                                                    <Box align="center" sx={{ display: 'flex', flexDirection: 'row' }}>
                                                        {report?.capture_report?._id && <Tooltip title="View" arrow placement="top">
                                                            <IconButton onClick={() => nav(`/home/capture-reports/${report?.capture_report?._id}`)}>
                                                                <img src={ViewBtn} alt="flagged button" />
                                                            </IconButton>
                                                        </Tooltip>}
                                                        {/* <Tooltip title="Delete" arrow placement="top">
                                                            <IconButton onClick={() => setconfirmation(report?._id)}>
                                                                <img src={delBtn} alt="delete button" />
                                                            </IconButton>
                                                        </Tooltip> */}
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
                                                        <Tooltip title="Capture Report" arrow placement="top">
                                                            <IconButton onClick={()=>{openSummaryReportModel(report)}}>
                                                                <img src={fileBtn} alt=" button" />
                                                            </IconButton>
                                                        </Tooltip>

                                                        {confirmation === report?._id && (
                                                            <DeleteConfirm id={report?._id} trip={"captureReport"} setconfirmation={setconfirmation} />
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

                    {!UserList.isFetching && UserList.data?.data.data.length > 0 &&
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
                                            setRowsPerPage(Number(e.target.value));
                                            setCurrentPage(1);
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
                                        onClick={() => setCurrentPage((prev) => prev - 1)}
                                    >
                                        <NavigateBeforeIcon fontSize="small" sx={{
                                            color: currentPage === 1 ? '#BDBDBD' : '#1976d2'
                                        }} />
                                    </IconButton>
                                    <IconButton
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage((prev) => prev + 1)}
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

            <Dialog
                open={openSummaryModel}
                onClose={closeOtherUsersModal}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{textAlign:"center"}}>Case Report</DialogTitle>
                <DialogContent dividers>
                    <Box>
                        <Box mt={3}>
                            <Grid container spacing={4}>
                                <Grid item xs={12} md={6}>
                                    <Box mb={2}>
                                        <Typography fontSize="1rem" fontWeight={700} color="#4b5563">
                                            Arrival Comments
                                        </Typography>
                                        <Typography fontSize="1.05rem" mt={1}>
                                            {summaryReportData?.capture_report?.comments?.arrival?.comment || '-'}
                                        </Typography>
                                    </Box>

                                    <Box mb={2}>
                                        <Typography fontSize="1rem" fontWeight={700} color="#4b5563">
                                            Contact Attempt Comments
                                        </Typography>
                                        <Typography fontSize="1.05rem" mt={1}>
                                            {summaryReportData?.capture_report?.comments?.contact_attempt?.comment || '-'}
                                        </Typography>
                                    </Box>

                                    <Box>
                                        <Typography fontSize="1rem" fontWeight={700} color="#4b5563">
                                            Closure Comments
                                        </Typography>
                                        <Typography fontSize="1.05rem" mt={1}>
                                            {summaryReportData?.capture_report?.comments?.closure?.comment || '-'}
                                        </Typography>
                                    </Box>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Box mb={2}>
                                        <Typography fontSize="1rem" fontWeight={700} color="#4b5563">
                                            Assessment Comments
                                        </Typography>
                                        <Typography fontSize="1.05rem" mt={1}>
                                            {summaryReportData?.capture_report?.comments?.assessment?.comment || '-'}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography fontSize="1rem" fontWeight={700} color="#4b5563">
                                            Resolutions Comments
                                        </Typography>
                                        <Typography fontSize="1.05rem" mt={1}>
                                            {summaryReportData?.capture_report?.comments?.resolution?.comment || '-'}
                                        </Typography>
                                    </Box>
                                </Grid>

                            </Grid>
                        </Box>
                        {/* Description */}
                        <Box my={2}>
                            <Typography fontSize={'1rem'} fontWeight={500} color="text.secondary">
                                Other Comments (Optional)
                            </Typography>
                            <Typography variant="body1" mt={1} sx={{ backgroundColor: '#F9FAFB', borderRadius: '6px', p: 1.5 }}>
                                {summaryReportData?.capture_report?.otherComments}

                            </Typography>
                        </Box>

                        <Box sx={{ mt: 2 }}>
                            <Typography fontSize={'1rem'} fontWeight={500} color="text.secondary">
                                Time and Date
                            </Typography>
                            <Typography fontSize={'1.05rem'} mt={0.5}>
                                {formatDateTime(summaryReportData?.capture_report?.createdAt,'MMM DD YYYY HH:mm A') || '-'}
                            </Typography>

                        </Box>

                        <Box mt={4} pb={1} borderBottom="1px solid #e0e0e0">
                            <Typography variant='subtitle1' fontWeight={550}>
                                Images
                            </Typography>
                            <Grid container spacing={2} mt={2}>
                                {summaryReportData?.capture_report?.evidence_image?.map((item, index) => (
                                    <Grid size={{ xs: 1, sm: 3 }} key={index}>
                                        <Box
                                            component="img"
                                            src={item}
                                            onClick={() => handleImageClick(item, `Evidence-${index + 1}`)}
                                            alt={`Placeholder ${index}`}
                                            sx={{ width: "100%", maxWidth: "241px", height: "160px", objectFit: "cover", border: "1px solid #E5E7EB", borderRadius: "6px", cursor: "pointer" }}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeOtherUsersModal}>Close</Button>
                </DialogActions>
            </Dialog>

        </>
    );
}
export default ListOfCaptureReports;
