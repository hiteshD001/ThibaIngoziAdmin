import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
    Box, Typography, TextField, Button, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Grid, InputAdornment, Avatar, Stack, Select, MenuItem, Chip,
    Tooltip
} from "@mui/material";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import search from '../../assets/images/search.svg';
import ViewBtn from '../../assets/images/ViewBtn.svg'
import delBtn from '../../assets/images/delBtn.svg'
import whiteplus from '../../assets/images/whiteplus.svg';
import { useGetPoliceUnits, usePutIsArchived } from "../../API Calls/API";
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
import nouser from "../../assets/images/NoUser.png";
import { saveScrollPosition, restoreScrollPosition } from "../../common/ScrollPosition";


const ListOfPoliceUnits = () => {
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
    const [isExporting, setIsExporting] = useState(false);
    const [confirmation, setconfirmation] = useState("");
    const [archived, setArchived] = useState(false)

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
    const paramId = role === "company" ? companyId : params.id;
    const startDate = range[0].startDate.toISOString();
    const endDate = range[0].endDate.toISOString();

    const UserList = useGetPoliceUnits("police unit list", "company", currentPage, rowsPerPage, filter,locationFilter, startDate, endDate, sortBy, sortOrder);


    const totalpoliceUnitData = UserList.data?.data?.totalpoliceUnitData || 0;
    const totalPages = Math.ceil(totalpoliceUnitData / rowsPerPage);

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
            const data = UserList.data?.data

            const allUsers = data?.policeUnitData || [];

            if (!allUsers.length) {
                toast.warning("No Police Unit data found for this period.");
                return;
            }

            const exportData = allUsers.map(user => ({
                "Police Unit": `${user.police_unit_name || ''}` || '',
                "Contact Name": user.contact_name || '',
                "Contact No.": `${user.mobile_no_country_code || ''}${user.mobile_no || ''}`,
                "Contact Email": user.email || ''
            }));

            if (exportFormat === "xlsx") {
                const worksheet = XLSX.utils.json_to_sheet(exportData);
                const columnWidths = Object.keys(exportData[0] || {}).map((key) => ({
                    wch: Math.max(key.length, ...exportData.map((row) => String(row[key] ?? 'NA').length)) + 2
                }));
                worksheet['!cols'] = columnWidths;
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, "Police_Units");
                XLSX.writeFile(workbook, "Ploice_Unit_List.xlsx");
            }
            else if (exportFormat === "csv") {
                const worksheet = XLSX.utils.json_to_sheet(exportData);
                const csv = XLSX.utils.sheet_to_csv(worksheet);
                const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'Ploice_Unit_list.csv';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
            else if (exportFormat === "pdf") {
                const doc = new jsPDF();
                doc.text('Police Unit List', 14, 16);
                autoTable(doc, {
                    head: [['Police Unit', 'Contact Name', 'Contact No.', 'Contact Email']],
                    body: allUsers.map(user => [
                        `${user.police_unit_name || ''}` ?? 'NA',
                        user.contact_name ?? 'NA',
                        `${user.mobile_no_country_code || ''}${user.mobile_no || ''}` ?? 'NA',
                        user.email ?? 'NA'
                    ]),
                    startY: 20,
                    theme: 'striped',
                    headStyles: { fillColor: '#367BE0' },
                    margin: { top: 20 },
                    styles: { fontSize: 10 },
                });
                doc.save("Ploice_Unit_List.pdf");
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

    // Handle Scroll Event store 
    const handleView = (report) => {
        saveScrollPosition("policeUnitListScroll");
        nav(`/home/police-unit/police-unit-information/${report._id}`)
    };
    useEffect(() => {
        if (UserList.data?.data.policeUnitData.length) {
            restoreScrollPosition("policeUnitListScroll");
        }
    }, [UserList.data?.data.policeUnitData]);

    return (
        <Box p={2}>
            <Paper elevation={3} sx={{ backgroundColor: "rgb(253, 253, 253)", padding: 2, borderRadius: '10px' }}>
                <Grid container justifyContent="space-between" alignItems="center" mb={2}>
                    <Grid size={{ xs: 12, lg: 3 }} sx={{ display: 'flex', flexDirection: 'row', gap: 2, mb: { xs: 1, md: 0 } }}>
                        <Typography variant="h6" fontWeight={590}>Police Units</Typography>
                        <Typography variant="h6" fontWeight={550}>
                            {UserList.isSuccess ? UserList.data?.data?.totalpoliceUnitData : 0}
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

                            <Button variant="contained" onClick={() => nav("/home/police-unit/add-police-unit")} sx={{ height: '40px', fontSize: '0.8rem', width: '150px', borderRadius: '8px' }}
                                startIcon={<img src={whiteplus} alt='white plus' />}>
                                Add Police Unit
                            </Button>
                            <CustomExportMenu onExport={handleExport} />
                            {/* <Button
                                onClick={() => nav('/home/crime-reports/view-archeived-crime-report')}
                                variant="contained"
                                sx={{ height: '40px', fontSize: '0.8rem', backgroundColor: '#367BE0', width: '180px', borderRadius: '8px' }}
                                startIcon={<img src={ViewBtn} alt="View" />}>
                                View Archeived
                            </Button> */}
                        </Box>

                    </Grid>
                </Grid>
                <Box sx={{ px: { xs: 0, md: 2 }, pt: { xs: 0, md: 3 }, backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
                    <TableContainer >
                        <Table sx={{ '& .MuiTableCell-root': { fontSize: '15px' } }}>
                            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableRow >
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', borderTopLeftRadius: '10px' }}>Police Unit</TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Contact Name</TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Email</TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Contact No.</TableCell>
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
                                    : (UserList.data?.data.policeUnitData?.length > 0 ?
                                        UserList.data?.data.policeUnitData.map((report) => (

                                            <TableRow key={report._id}>
                                                <TableCell sx={{ color: 'var(--Blue)' }}>
                                                    {report.police_unit_name}
                                                </TableCell>
                                                <TableCell sx={{ color: '#4B5563' }}>
                                                    <Stack direction="row" alignItems="center" gap={1}>
                                                        <Avatar
                                                            src={report?.selfieImage || nouser}
                                                            alt="User"
                                                        />

                                                        {report?.contact_name || "-"}

                                                    </Stack>
                                                </TableCell>
                                                <TableCell sx={{ color: '#4B5563' }}>

                                                    {report.email || "-"}

                                                </TableCell>
                                                <TableCell sx={{ color: 'black' }}>

                                                    {report.mobile_no_country_code}-{report.mobile_no}

                                                </TableCell>
                                                <TableCell >
                                                    <Box align="center" sx={{ display: 'flex', flexDirection: 'row' }}>
                                                        <Tooltip title="View" arrow placement="top">
                                                            <IconButton onClick={() => handleView(report)}>
                                                                <img src={ViewBtn} alt="flagged button" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Delete" arrow placement="top">
                                                            <IconButton onClick={() => setconfirmation(report?._id)}>
                                                                <img src={delBtn} alt="delete button" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        {/* <Tooltip title="Archive" arrow placement="top">
                                                            <IconButton onClick={() => {
                                                                updateTripMutation.mutate({
                                                                    id: report?._id,
                                                                    data: { isArchived: true }
                                                                });
                                                            }}>
                                                                <img src={Listtrip} alt="view button" />
                                                            </IconButton>
                                                        </Tooltip> */}

                                                        {confirmation === report?._id && (
                                                            <DeleteConfirm id={report?._id} trip={"policeUnit"} setconfirmation={setconfirmation} />
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

                    {!UserList.isFetching && UserList.data?.data.policeUnitData.length > 0 &&
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
    );
}
export default ListOfPoliceUnits;
