import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
    Box, Typography, TextField, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, Grid, InputAdornment, Stack, Select, MenuItem, Chip,
    Tooltip, TableSortLabel,
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
import { getImageLink, formatDateTime } from '../../common/commonFn';
import { DeleteConfirm } from "../../common/ConfirmationPOPup";
import { toast } from "react-toastify";

const SuspectRequestUsers = () => {

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
    const rowsPerPage = Number(searchParams.get("rowsPerPage")) || 10;
    const totalUsers = 10;
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("desc");
    const startDate = range[0].startDate.toISOString();
    const endDate = range[0].endDate.toISOString();
    const [archived, setArchived] = useState(false)
    const [confirmation, setconfirmation] = useState("");
    const changeSortOrder = (e) => {
        const field = e.target.id;

        if (field !== sortBy) {
            setSortBy(field);
            setSortOrder("asc");
        } else {
            setSortOrder(p => p === 'asc' ? 'desc' : 'asc')
        }
    }
    const responseData = useGetSuspectSightingsList("suspect sightings list", role, currentPage, rowsPerPage, filter, '', startDate, endDate, archived, sortBy, sortOrder,'', params.id);
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

    const updateParams = (newParams) => {
        setSearchParams({
            currentPage,
            rowsPerPage: rowsPerPage,
            startDate: startDateParam,
            endDate: endDateParam,
            filter,
            ...newParams,
        });
    };

    // Hanlde Scroll
    const handleView = (url) => {
        saveScrollPosition("suspectSightingReportUsersListScroll");
        nav(url);
    };

    useEffect(() => {
        if (responseData.data?.data?.totaldata) {
            restoreScrollPosition("suspectSightingReportUsersListScroll");
        }
    }, [responseData.data?.data?.totaldata]);

    return (
        <>
            <Box p={2}>
                <Paper elevation={3} sx={{ backgroundColor: "rgb(253, 253, 253)", padding: 2, borderRadius: '10px' }}>
                    <Grid container justifyContent="space-between" alignItems="center" mb={2}>
                        <Grid size={{ xs: 12, lg: 3 }} sx={{ display: 'flex', flexDirection: 'row', gap: 2, mb: { xs: 1, md: 0 } }}>
                            <Typography variant="h6" fontWeight={590}>Suspect Sightings Report</Typography>
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
                            </Box>

                        </Grid>
                    </Grid>

                    <Box sx={{ px: { xs: 0, md: 2 }, pt: { xs: 0, md: 3 }, backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
                        <TableContainer >
                            <Table sx={{ '& .MuiTableCell-root': { fontSize: '15px', minWidth: 150 } }}>
                                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                    <TableRow >
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', textAlign: 'center',borderTopLeftRadius: '10px' }}>
                                            <TableSortLabel
                                                id="case_number"
                                                active={sortBy === 'case_number'}
                                                direction={sortOrder}
                                                onClick={changeSortOrder}
                                                IconComponent={() => <img src={sortBy === 'case_number' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                            >Linked Case ID</TableSortLabel>
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
                                                id="address"
                                                active={sortBy === 'address'}
                                                direction={sortOrder}
                                                onClick={changeSortOrder}
                                                IconComponent={() => <img src={sortBy === 'address' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                            >Location Reported</TableSortLabel>
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
                                            
                                            <TableCell sx={{ color: '#367BE0', textAlign: 'center' }}>
                                                <Link onClick={() => handleView(obj?.linked_case_type === 'crimereports' ? `/home/crime-reports/crime-report/${obj?.linked_case_data?._id}` : `/home/capture-reports?location_id=${obj?.linked_case_data?._id}&sosId=${obj?.linked_case_data?.sosNumber}`)} className="link2">
                                                    {obj?.linked_case_type === 'crimereports' ? obj?.linked_case_data?.crime_report_number : obj?.linked_case_data?.sosNumber || "-"}
                                                </Link>
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
                                            <TableCell sx={{ color: '#4B5563' }}>
                                                {obj.address || "-"}
                                            </TableCell>
                                            <TableCell sx={{ color: '#4B5563', textAlign: 'center' }}>
                                                {moment(obj.createdAt).isSame(moment(), "day")
                                                    ? `Today, ${moment(obj.createdAt).format("hh:mm A")}`
                                                    : formatDateTime(obj.createdAt, "HH:mm:ss - DD/MM/YYYY")}
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
                                                   
                                                    <Tooltip title="Delete" arrow placement="top">
                                                        <IconButton onClick={() => setconfirmation(obj?._id)}>
                                                            <img src={delBtn} alt="delete button" />
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
        </>
    );

};

export default SuspectRequestUsers;