import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
    Box, Typography, TextField, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, Grid, InputAdornment, Stack, Select, MenuItem, Chip,
    Tooltip,TableSortLabel,Popover,Divider,Button,List 
} from "@mui/material";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { startOfYear } from "date-fns";
import moment from "moment";
import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable'
import * as XLSX from 'xlsx';
import search from '../../assets/images/search.svg';
import CustomDateRangePicker from "../../common/Custom/CustomDateRangePicker";
import calender from '../../assets/images/calender.svg';
import CustomExportMenu from "../../common/Custom/CustomExport";
import CustomFilter from "../../common/Custom/CustomFilter";
import Loader from "../../common/Loader";
import ViewBtn from '../../assets/images/ViewBtn.svg'
import delBtn from '../../assets/images/delBtn.svg'
import Listtrip from '../../assets/images/Listtrip.svg'
import ImportSheet from "../../common/ImportSheet";
import nouser from "../../assets/images/NoUser.png";
import fileBtn from '../../assets/images/fileBtn.svg'
import arrowup from '../../assets/images/arrowup.svg';
import arrowdown from '../../assets/images/arrowdown.svg';
import arrownuteral from '../../assets/images/arrownuteral.svg';
import { saveScrollPosition, restoreScrollPosition } from "../../common/ScrollPosition";
import { useGetSuspectSightingsList, useSuspectSightPutIsArchived, useGetSuspectSightingsListV2 } from "../../API Calls/API";
import {getImageLink,formatDateTime } from '../../common/commonFn';
import { DeleteConfirm } from "../../common/ConfirmationPOPup";
import { toast } from "react-toastify";

const ListOfSuspectArcheived = () => {
    const [popup, setpopup] = useState(false);
    const nav = useNavigate();
    const [role] = useState(localStorage.getItem("role"));
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
    const rowsPerPage = Number(searchParams.get("rowsPerPage")) || 10;
    const totalUsers = 10;
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("desc");
    const startDate = range[0].startDate.toISOString();
    const endDate = range[0].endDate.toISOString();
    const [archived, setArchived] = useState(true)
    const [isExporting, setIsExporting] = useState(false);
    const [confirmation, setconfirmation] = useState("");
    const location = useLocation();
    const getQueryParams = new URLSearchParams(location.search);
    const changeSortOrder = (e) => {
        const field = e.target.id;

        if (field !== sortBy) {
            setSortBy(field);
            setSortOrder("asc");
        } else {
            setSortOrder(p => p === 'asc' ? 'desc' : 'asc')
        }
    }
    const responseData = useGetSuspectSightingsList("suspect sightings list", role, currentPage, rowsPerPage, filter, locationFilter, startDate, endDate, archived, sortBy, sortOrder,getQueryParams.get("linked_case_type"),getQueryParams.get("linked_case_type_id"));
    const totalData = responseData.data?.data?.totaldata || 0;
    const totalPages = Math.ceil(totalData / rowsPerPage);
    
    const updateTripMutation = useSuspectSightPutIsArchived(
        (id, data) => {
            toast.success("Suspect Sighting Report Archived Successfully")

            responseData.refetch();
        },
        (error) => {
            console.error('Error updating trip:', error);
        }
    );
    const handleExport = async ({ startDate, endDate, exportFormat }) => {
        try {

            const data = responseData.data?.data

            const allUsers = data?.data || [];
            if (!allUsers.length) {
                toast.warning("No Suspect Sightings Report data found for this period.");
                return;
            }

            const exportData = allUsers.map(user => ({
                "Suspect Name": `${user.suspect_id?.first_name || ''} ${user.suspect_id?.last_name || ''}` ?? '',
                "Reporter": `${user.reporter_id?.first_name || ''} ${user.reporter_id?.last_name || ''}` ?? '',
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
                XLSX.writeFile(workbook, "Suspect_Sightings_Report.xlsx");
            }
            else if (exportFormat === "csv") {

                const worksheet = XLSX.utils.json_to_sheet(exportData);
                const csv = XLSX.utils.sheet_to_csv(worksheet);
                const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'Suspect_Sightings_Report.csv';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
            else if (exportFormat === "pdf") {
                const doc = new jsPDF();
                doc.text('Suspect Sightings Report List', 14, 16);
                autoTable(doc, {
                    head: [['Suspect Name', 'Reporter', 'Location.', 'Description', 'Date Reported', 'Status']],
                    body: allUsers.map(user => [
                        `${user.suspect_id?.first_name || ''} ${user.suspect_id?.last_name || ''}` ?? 'NA',
                        `${user.reporter_id?.first_name || ''} ${user.reporter_id?.last_name || ''}` ?? 'NA',
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
                doc.save("Suspect_Sightings_Report.pdf");
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
        updateParams({ locationFilter: filterText })
    };

    // Model Open
    const [suspectSightingModalOpen, setSuspectSightingModalOpen] = useState(false);
    const [suspectSightingModalItems, setSuspectSightingModalItems] = useState([]);
    const [linkedCaseId, setLinkedCaseId] = useState(null);
    const [linkedCaseType, setLinkedCaseType] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);

    const openModal = async (_id,linked_case_type_id,linked_case_type, event) => { 
        const el = document.querySelector(`[data-id="${_id}"]`);        
        setAnchorEl(el);
        setLinkedCaseId(linked_case_type_id)
        setLinkedCaseType(linked_case_type)
        let suspectList = await useGetSuspectSightingsListV2(linked_case_type_id,linked_case_type, role, 1, 3);
        let items = suspectList.data?.data || []

        setSuspectSightingModalItems(items);
        setSuspectSightingModalOpen(true);
        updateParams({
            model: true,
            modelData: encodeURIComponent(JSON.stringify(items)),
            AnchorEl: _id,
        });
    };
    const closeModal = () => {
        setSuspectSightingModalOpen(false);
        setSuspectSightingModalItems([]);
        setAnchorEl(null);
        updateParams({
            model: false,
            modelData: '',
            AnchorEl: '',
        });
    };

    const updateParams = (newParams) => {
        setSearchParams((prev) => {
            const prevParams = Object.fromEntries(prev.entries());

            return {
                ...prevParams,
                ...newParams,
            };
        });
    };
    
    // Hanlde Scroll
    const handleView = (url) => {
        saveScrollPosition("suspectListScroll");
        nav(url);
    };
    const model = searchParams.get("model");
    const AnchorEl  =  searchParams.get("AnchorEl") || null;
    const modelData = searchParams.get("modelData") || "";

    useEffect(() => {
        if (responseData.data?.data.data?.length > 0) {
            restoreScrollPosition("suspectListScroll");
            
            // Model Open
            if ((!responseData.isFetching) && (model === true || model === "true")) {
                const parsedData = JSON.parse(decodeURIComponent(modelData)) || [];
                setSuspectSightingModalItems(parsedData);
                setTimeout(() => {
                    const el = document.querySelector(`[data-id="${AnchorEl}"]`);
                    setAnchorEl(el || null);
                    setSuspectSightingModalOpen(true);
                }, 300);
            }

        }
    }, [responseData.data?.data?.totaldata]);

    return (
        <>
            <Box p={2}>
                <Paper elevation={3} sx={{ backgroundColor: "rgb(253, 253, 253)", padding: 2, borderRadius: '10px' }}>
                    <Grid container justifyContent="space-between" alignItems="center" mb={2}>
                        <Grid size={{ xs: 12, lg: 3 }} sx={{ display: 'flex', flexDirection: 'row', gap: 2, mb: { xs: 1, md: 0 } }}>
                            <Typography variant="h6" fontWeight={590}>Archeived Suspect Sightings</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, lg: 9 }} sx={{ display: 'flex', justifyContent: 'flex-end', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>

                            <TextField
                                variant="outlined"
                                placeholder="Search"
                                value={filter}
                                onChange={(e) => updateParams({ filter: e.target.value })}
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
                            <Box display="flex" sx={{ justifyContent: { xs: 'space-between' } }} gap={2}>
                                <CustomFilter />
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
                            </Box>

                        </Grid>
                    </Grid>

                    <Box sx={{ px: { xs: 0, md: 2 }, pt: { xs: 0, md: 3 }, backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
                        <TableContainer >
                            <Table sx={{ '& .MuiTableCell-root': { fontSize: '15px', minWidth: 150 } }}>
                                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                    <TableRow >
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', borderTopLeftRadius: '10px' }}>
                                            <TableSortLabel
                                                id="suspect_first_name"
                                                active={sortBy === 'suspect_first_name'}
                                                direction={sortOrder}
                                                onClick={changeSortOrder}
                                                IconComponent={() => <img src={sortBy === 'suspect_first_name' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                            >SOS Initiator</TableSortLabel>
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                            <TableSortLabel
                                                id="address"
                                                active={sortBy === 'address'}
                                                direction={sortOrder}
                                                onClick={changeSortOrder}
                                                IconComponent={() => <img src={sortBy === 'address' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                            >Location Reported</TableSortLabel>
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                            <TableSortLabel
                                                id="reporter_first_name"
                                                active={sortBy === 'reporter_first_name'}
                                                direction={sortOrder}
                                                onClick={changeSortOrder}
                                                IconComponent={() => <img src={sortBy === 'reporter_first_name' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                            >Reporter</TableSortLabel>
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                            <TableSortLabel
                                                id="createdAt"
                                                active={sortBy === 'createdAt'}
                                                direction={sortOrder}
                                                onClick={changeSortOrder}
                                                IconComponent={() => <img src={sortBy === 'createdAt' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                            >Date&Time</TableSortLabel>
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', textAlign: 'center' }}>
                                            <TableSortLabel
                                                id="case_number"
                                                active={sortBy === 'case_number'}
                                                direction={sortOrder}
                                                onClick={changeSortOrder}
                                                IconComponent={() => <img src={sortBy === 'case_number' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                            >Linked Case ID</TableSortLabel>
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', textAlign: 'center' }}>
                                            <TableSortLabel
                                                id="reported_users"
                                                active={sortBy === 'reported_users'}
                                                direction={sortOrder}
                                                onClick={changeSortOrder}
                                                IconComponent={() => <img src={sortBy === 'reported_users' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                            >Sightings Reported</TableSortLabel>
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', textAlign: 'center' }}>
                                            <TableSortLabel
                                                id="report_status"
                                                active={sortBy === 'report_status'}
                                                direction={sortOrder}
                                                onClick={changeSortOrder}
                                                IconComponent={() => <img src={sortBy === 'report_status' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                            >Status</TableSortLabel>
                                        </TableCell>

                                        <TableCell align="center" sx={{ backgroundColor: '#F9FAFB', borderTopRightRadius: '10px', color: '#4B5563' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {responseData.isFetching &&
                                        (<TableRow>
                                            <TableCell sx={{ color: '#4B5563', borderBottom: 'none' }} colSpan={10} align="center">
                                                <Loader />
                                            </TableCell>
                                        </TableRow>)
                                    }
                                    {responseData.data?.data.data?.length > 0 ? responseData.data?.data.data.map((obj) => (
                                        <TableRow key={obj._id}>
                                            <TableCell sx={{ color: '#4B5563' }}>
                                                <Link onClick={() => handleView(obj?.suspect_id.role === "driver" ? `/home/total-drivers/driver-information/${obj?.suspect_id._id}` : `/home/total-users/user-information/${obj?.suspect_id._id}`)} className="link2">
                                                    <Stack direction="row" alignItems="center" gap={1}>
                                                        <Avatar
                                                            src={getImageLink(obj?.suspect_id?.selfieImage) || nouser}
                                                            sx={{ '&:hover': { textDecoration: 'none' } }}
                                                            alt="User"
                                                        />
                                                        {obj?.suspect_id?.first_name + ' ' + obj?.suspect_id?.last_name || "-"}
                                                    </Stack>
                                                </Link>
                                            </TableCell>
                                            <TableCell sx={{ color: '#4B5563' }}>

                                                {obj.address || "-"}

                                            </TableCell>
                                            <TableCell sx={{ color: '#4B5563' }}>
                                                <Link onClick={() => handleView(obj?.reporter_id.role === "driver" ? `/home/total-drivers/driver-information/${obj?.reporter_id._id}` : `/home/total-users/user-information/${obj?.reporter_id._id}`)} className="link2">
                                                    <Stack direction="row" alignItems="center" gap={1}>
                                                        <Avatar
                                                            src={getImageLink(obj?.reporter_id?.selfieImage) || nouser}
                                                            sx={{ '&:hover': { textDecoration: 'none' } }}
                                                            alt="User"
                                                        />
                                                        {obj?.reporter_id?.first_name + ' ' + obj?.reporter_id?.last_name || "-"}
                                                    </Stack>
                                                </Link>
                                            </TableCell>
                                            <TableCell sx={{ color: '#4B5563', textAlign: 'center' }}>
                                                {moment(obj.createdAt).isSame(moment(), "day")
                                                    ? `Today, ${moment(obj.createdAt).format("hh:mm A")}`
                                                    : formatDateTime(obj.createdAt,"HH:mm:ss - DD/MM/YYYY")}
                                            </TableCell>
                                            <TableCell sx={{ color: '#367BE0', textAlign: 'center' }}>
                                                <Link onClick={() => handleView(obj?.linked_case_type === 'crimereports' ? `/home/crime-reports/crime-report/${obj?.linked_case_data?._id}` : `/home/capture-reports?location_id=${obj?.linked_case_data?._id}&sosId=${obj?.linked_case_data?.sosNumber}`)} className="link2">
                                                    {(obj?.caseNumberId) || (obj?.linked_case_type === 'crimereports' ?  obj?.linked_case_data?.crime_report_number : obj?.linked_case_data?.sosNumber)}
                                                </Link>
                                            </TableCell>
                                            <TableCell sx={{ color: '#367BE0', textAlign: 'center' }}>
                                                <Link onClick={() => handleView(`/home/total-suspect/suspect-sightings-reported-users/${obj?.linked_case_data?._id}`)} className="link2">
                                                    {obj?.reported_users}
                                                </Link>
                                            </TableCell>
                                            <TableCell sx={{ color: '#4B5563', textAlign: 'center' }}>

                                                <Chip
                                                    label={obj.report_status}
                                                    sx={{
                                                        backgroundColor:
                                                            obj.report_status === 'reviewed' ? '#DCFCE7' :
                                                                obj.report_status === 'new' ? '#FEF9C3' :
                                                                    obj.report_status === 'found' ? '#DBEAFE' :
                                                                        '#FEF9C3',
                                                        '& .MuiChip-label': {
                                                            textTransform: 'capitalize',
                                                            color: obj.report_status === 'reviewed' ? 'green' :
                                                                obj.report_status === 'new' ? '#854D0E' :
                                                                    obj.report_status === 'found' ? '#1E40AF' :
                                                                        'black',
                                                        }
                                                    }}

                                                />

                                            </TableCell>
                                            <TableCell sx={{ textAlign: 'center' }}>
                                                <Box align="center" sx={{ display: 'flex', flexDirection: 'row' }}>
                                                    <Tooltip title="View" arrow placement="top">
                                                        <IconButton onClick={() => handleView(`/home/total-suspect/suspect-information/${obj._id}`)}>
                                                            <img src={ViewBtn} alt="flagged button" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title=" Suspect Sightings Report" arrow placement="top">
                                                        <IconButton data-id={obj?._id} onClick={(e) => openModal(obj?._id,obj?.linked_case_data?._id,obj?.linked_case_type, e)}>
                                                            <img src={fileBtn} alt="button" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete" arrow placement="top">
                                                        <IconButton onClick={() => setconfirmation(obj?._id)}>
                                                            <img src={delBtn} alt="delete button" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Archive" arrow placement="top">
                                                        <IconButton onClick={() => {
                                                            updateTripMutation.mutate({
                                                                id: obj?._id,
                                                                data: { isArchived: false }
                                                            });
                                                        }}>
                                                            <img src={Listtrip} alt="view button" />
                                                        </IconButton>
                                                    </Tooltip>

                                                    {confirmation === obj?._id && (
                                                        <DeleteConfirm id={obj?._id} trip={"suspectSighting"} setconfirmation={setconfirmation} />
                                                    )}
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    )) :
                                        (<TableRow>
                                            <TableCell colSpan={10} align="center">
                                                <Typography align="center" color="text.secondary" sx={{ mt: 2 }}>
                                                    No data found
                                                </Typography>
                                            </TableCell>
                                        </TableRow>)
                                    }
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {!responseData.isFetching && responseData.data?.data.data.length > 0 &&
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
                                                updateParams({ rowsPerPage: Number(e.target.value), currentPage: 1 });
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
                                            onClick={() => updateParams({ currentPage: currentPage - 1 })}
                                        >
                                            <NavigateBeforeIcon fontSize="small" sx={{
                                                color: currentPage === 1 ? '#BDBDBD' : '#1976d2'
                                            }} />
                                        </IconButton>
                                        <IconButton
                                            disabled={currentPage === totalPages}
                                            onClick={() => updateParams({ currentPage: currentPage + 1 })}
                                        >
                                            <NavigateNextIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </Grid>
                            </Grid>
                        }
                    </Box>
                </Paper>
                {popup && <ImportSheet setpopup={setpopup} type="user" />}
            </Box>

            {/* Model Open */}
            <Popover
                open={suspectSightingModalOpen}
                anchorEl={anchorEl}
                onClose={closeModal}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        width: 499,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    }
                }}
            >
                {/* DialogTitle */}
                <Box sx={{ px: 3, pt: 2, pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography fontWeight={600} fontSize={16}>
                        Sightings Reports
                    </Typography>
                    <Chip
                        label={'View All'}
                        sx={{
                            backgroundColor: '#367BE0',
                            color: 'white',

                            '& .MuiChip-label': {
                                color: 'white', // force label text color
                            },

                            '&.MuiChip-clickable:hover': {
                                backgroundColor: '#367BE0', // prevent bg change
                                color: 'white',
                            }
                        }}
                        onClick={() => handleView(`/home/total-suspect/suspect-sightings-reported-users/${linkedCaseId}`)}
                    />
                </Box>

                <Divider />

                {/* Content */}
                <Box sx={{ px: 2, py: 1, maxHeight: 360, overflowY: 'auto' }}>
                    {suspectSightingModalItems.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                            No other users found.
                        </Typography>
                    ) : (
                        <List disablePadding>
                            {suspectSightingModalItems.map((u, idx) => {
                                let fullName = u?.reporter_id?.first_name + u?.reporter_id?.last_name || "-"
                                return (
                                    <Box
                                        key={u?.reporter_id?._id || idx}
                                        sx={{
                                            border: '1px solid #E5E7EB',
                                            borderRadius: '16px',
                                            p: 2,
                                            mb: 1.5,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                                            backgroundColor: '#fff',
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar
                                                src={getImageLink(u?.reporter_id.selfieImage) || nouser}
                                                alt="User"
                                                sx={{ width: 48, height: 48 }}
                                            />
                                            <Typography fontWeight={600} fontSize={15} color="#111827">
                                                {fullName || '-'}
                                            </Typography>
                                        </Box>
                                        <Chip
                                            label={u?.report_status || 'No Report'}
                                            sx={{
                                                backgroundColor:
                                                    u.report_status === 'reviewed' ? '#DCFCE7' :
                                                        u.report_status === 'new' ? '#FEF9C3' :
                                                            u.report_status === 'found' ? '#DBEAFE' :
                                                                '#FEF9C3',
                                                '& .MuiChip-label': {
                                                    textTransform: 'capitalize',
                                                    color: u.report_status === 'reviewed' ? 'green' :
                                                        u.report_status === 'new' ? '#854D0E' :
                                                            u.report_status === 'found' ? '#1E40AF' :
                                                                'black',
                                                }
                                            }}
                                        />
                                    </Box>
                                );
                            })}
                        </List>
                    )}
                </Box>

                <Divider />
                <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button onClick={closeModal} size="small">Close</Button>
                </Box>
            </Popover>
        </>
    );
};

export default ListOfSuspectArcheived;
