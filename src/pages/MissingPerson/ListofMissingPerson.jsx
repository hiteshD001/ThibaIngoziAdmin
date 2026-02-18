import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box, Typography, TextField, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, Grid, InputAdornment, Stack, Select, MenuItem,
    Button,
    Tooltip,
    TableSortLabel,
} from "@mui/material";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import search from '../../assets/images/search.svg';
import CustomDateRangePicker from "../../common/Custom/CustomDateRangePicker";
import calender from '../../assets/images/calender.svg';
import CustomExportMenu from "../../common/Custom/CustomExport";
import CustomFilter from "../../common/Custom/CustomFilter";
import Loader from "../../common/Loader";
import ViewBtn from '../../assets/images/ViewBtn.svg'
import ImportSheet from "../../common/ImportSheet";
import nouser from "../../assets/images/NoUser.png";
import { startOfYear } from "date-fns";
import moment from "moment";
import { useGetUser, useDeleteMissingPerson, useGetMissingPersonList, usePatchArchivedMissingPerson } from "../../API Calls/API";
import Listtrip from '../../assets/images/Listtrip.svg'
import delBtn from '../../assets/images/delBtn.svg'
import { DeleteConfirm } from "../../common/ConfirmationPOPup";
import { toast } from "react-toastify";
import arrowup from '../../assets/images/arrowup.svg';
import arrowdown from '../../assets/images/arrowdown.svg';
import arrownuteral from '../../assets/images/arrownuteral.svg';
import apiClient from "../../API Calls/APIClient";
import { format } from "date-fns";
import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable'
import * as XLSX from 'xlsx';
// const MissingPersons = [
//     {
//         "_id": 1,
//         "name": 'Mohammad Salem',
//         "location": 'Sandton, Johannesburg Gauteng,2196',
//         "date": '02/05/25',
//         "req_accept": '20',
//         "req_reached": '30',
//         'reportedBy': 'Jane Cooper'
//     },
//     {
//         "_id": 2,
//         "name": 'Mohammad Salem',
//         "location": 'Sandton, Johannesburg Gauteng,2196',
//         "date": '02/05/25',
//         "req_accept": '20',
//         "req_reached": '30',
//         'reportedBy': 'Jane Cooper'
//     },
//     {
//         "_id": 3,
//         "name": 'Mohammad Salem',
//         "location": 'Sandton, Johannesburg Gauteng,2196',
//         "date": '02/05/25',
//         "req_accept": '20',
//         "req_reached": '30',
//         'reportedBy': 'Jane Cooper'
//     },
//     {
//         "_id": 4,
//         "name": 'Mohammad Salem',
//         "location": 'Sandton, Johannesburg Gauteng,2196',
//         "date": '02/05/25',
//         "req_accept": '20',
//         "req_reached": '30',
//         'reportedBy': 'Jane Cooper'
//     },
//     {
//         "_id": 5,
//         "name": 'Mohammad Salem',
//         "location": 'Sandton, Johannesburg Gauteng,2196',
//         "date": '02/05/25',
//         "req_accept": '20',
//         "req_reached": '30',
//         'reportedBy': 'Jane Cooper'
//     },
// ]

const ListofMissingPerson = () => {
    const [popup, setpopup] = useState(false);
    const nav = useNavigate();
    const [range, setRange] = useState([
        {
            startDate: startOfYear(new Date()),
            endDate: new Date(),
            key: 'selection'
        }
    ]);

    const [locationFilters, setLocationFilters] = useState({
        country: "",
        province: "",
        city: "",
        suburb: "",
    });


    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [filter, setfilter] = useState("");
    const [confirmation, setconfirmation] = useState("");

    // Sort 1
    const [sortBy, setSortBy] = useState("lastSeenLocation");
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


    const MissingPersons = useGetMissingPersonList(
        "MissingPersonList",
        currentPage,
        rowsPerPage,
        filter,
        range[0].startDate,
        range[0].endDate,
        false,
        locationFilters.country,
        locationFilters.province,
        locationFilters.city,
        locationFilters.suburb,
        sortBy,
        sortOrder
    );

    const totalUsers = MissingPersons?.data?.data?.total;
    const totalPages = Math.ceil(totalUsers / rowsPerPage);

    const achiveMissingPerson = usePatchArchivedMissingPerson(
        () => {
            toast.success("Person archived successfully!")
            MissingPersons.refetch()
        },
        () => toast.error("Failed to archive person.")
    );

    let loginUser = useGetUser(localStorage.getItem("userID"));
    loginUser = loginUser?.data?.data?.user;
    const handleExport = async ({ startDate, endDate, exportFormat: fileFormat }) => {
        try {
            const { data } = await apiClient.get(`${import.meta.env.VITE_BASEURL}/missingPerson`, {
                params: {
                    page: 1,
                    limit: 10000,
                    filter: "",
                    startDate,
                    endDate,
                },
            });

            const allUsers = data?.data || [];
            if (!allUsers.length) {
                toast.warning("No Missing Persons data found.");
                return;
            }

            const exportData = allUsers.map(user => ({
                "Name": user.name || '',
                "Last Seen Location": user.lastSeenLocation || '',
                "Date": format(user.date, "HH:mm:ss - dd/MM/yyyy") || '',
                "Request Reached": user.requestReached || '',
                "Request Accepted": user.requestAccepted || '',
                "Status": user.status || '',
                "Reported By": user.reportedBy || '',
            }));
            const exportedByValue = loginUser.role === 'company' ? loginUser.company_name : 'Super Admin';
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

                XLSX.utils.book_append_sheet(workbook, worksheet, "Missing_Persons_List");
                XLSX.writeFile(workbook, "Missing_Persons_List.xlsx");
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
                link.download = 'Missing_Persons_List.csv';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }

            else if (fileFormat === "pdf") {
                const doc = new jsPDF();

                // Title
                doc.setFontSize(14);
                doc.text('Meeting Link Trip List', 14, 16);

                // Exported By line
                doc.setFontSize(10);
                doc.text(`Exported By: ${exportedByValue}`, 14, 24);

                // Table
                autoTable(doc, {
                    startY: 30,
                    head: [["Name", "Last Seen Location", "Date", "Request Reached", "Request Accepted", "Status", "Reported By"]],
                    body: allUsers.map(user => [
                        user.name || '',
                        user.lastSeenLocation || '',
                        format(user.date, "HH:mm:ss - dd/MM/yyyy") || '',
                        user.requestReached || '',
                        user.requestAccepted || '',
                        user.status || '',
                        user.reportedBy || '',
                    ]),
                    theme: 'striped',
                    headStyles: { fillColor: [54, 123, 224], textColor: 255 },
                    styles: { fontSize: 10 },
                    margin: { top: 20 },
                });

                doc.save("Missing_Persons_List.pdf");
            }

        } catch (err) {
            console.error("Error exporting data:", err);
            toast.error("Export failed.");
        }
    };

    return (
        <Box p={2}>
            <Paper elevation={3} sx={{ backgroundColor: "rgb(253, 253, 253)", padding: 2, borderRadius: '10px' }}>
                <Grid container justifyContent="space-between" alignItems="center" mb={2}>
                    <Grid size={{ xs: 12, lg: 3 }} sx={{ display: 'flex', flexDirection: 'row', gap: 2, mb: { xs: 1, md: 0 } }}>
                        <Typography variant="h6" fontWeight={590}>Missing Persons</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, lg: 9 }} sx={{ display: 'flex', mt: { xs: 2, lg: 0 }, justifyContent: 'flex-end', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>

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
                        <Box display="flex" sx={{ justifyContent: { xs: 'space-between' } }} gap={2}>
                            <CustomFilter onApply={(filters) => setLocationFilters(filters)} />
                            <CustomDateRangePicker
                                borderColor={'var(--light-gray)'}
                                value={range}
                                onChange={setRange}
                                icon={calender}
                            />
                            <CustomExportMenu onExport={handleExport} />
                            <Button
                                onClick={() => nav('/home/total-missing-person/view-archeived-person')}
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
                        <Table sx={{ '& .MuiTableCell-root': { fontSize: '15px', } }}>

                            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableRow >
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', borderTopLeftRadius: '10px' }}>
                                        <TableSortLabel
                                            id="name"
                                            active={sortBy === 'name'}
                                            direction={sortOrder}
                                            onClick={changeSortOrder}
                                            IconComponent={() => <img src={sortBy === 'name' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                        >
                                            Name
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                        <TableSortLabel
                                            id="lastSeenLocation"
                                            active={sortBy === 'lastSeenLocation'}
                                            direction={sortOrder}
                                            onClick={changeSortOrder}
                                            IconComponent={() => <img src={sortBy === 'lastSeenLocation' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                        >
                                            Last Seen Location
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                        <TableSortLabel
                                            id="createdAt"
                                            active={sortBy === 'createdAt'}
                                            direction={sortOrder}
                                            onClick={changeSortOrder}
                                            IconComponent={() => <img src={sortBy === 'createdAt' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                        >
                                            Date
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', textAlign: 'center' }}>
                                        <TableSortLabel
                                            id="requestReached"
                                            active={sortBy === 'requestReached'}
                                            direction={sortOrder}
                                            onClick={changeSortOrder}
                                            IconComponent={() => <img src={sortBy === 'requestReached' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                        >
                                            Request Reached
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', textAlign: 'center' }}>
                                        <TableSortLabel
                                            id="requestAccepted"
                                            active={sortBy === 'requestAccepted'}
                                            direction={sortOrder}
                                            onClick={changeSortOrder}
                                            IconComponent={() => <img src={sortBy === 'requestAccepted' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                        >
                                            Request Accepted
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                        <TableSortLabel
                                            id="status"
                                            active={sortBy === 'status'}
                                            direction={sortOrder}
                                            onClick={changeSortOrder}
                                            IconComponent={() => <img src={sortBy === 'status' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                        >
                                            Status
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                        <TableSortLabel
                                            id="reportedBy"
                                            active={sortBy === 'reportedBy'}
                                            direction={sortOrder}
                                            onClick={changeSortOrder}
                                            IconComponent={() => <img src={sortBy === 'reportedBy' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                        >
                                            Reported by
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell align="center" sx={{ backgroundColor: '#F9FAFB', borderTopRightRadius: '10px', color: '#4B5563' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {MissingPersons.isFetching ?
                                    <TableRow>
                                        <TableCell sx={{ color: '#4B5563', borderBottom: 'none' }} colSpan={8} align="center">
                                            <Loader />
                                        </TableCell>
                                    </TableRow>
                                    : (MissingPersons?.data?.data?.data?.length > 0 ?
                                        MissingPersons?.data?.data?.data?.map((user) => (
                                            <TableRow key={user?._id}>
                                                <TableCell sx={{ color: '#4B5563' }}>
                                                    <Stack direction="row" alignItems="center" gap={1}>
                                                        <Avatar
                                                            src={user.profileImage || nouser}
                                                            alt="User"
                                                        />

                                                        {/* {user.first_name} {user.last_name} */}
                                                        {user?.name}
                                                    </Stack>
                                                </TableCell>
                                                <TableCell sx={{ color: '#4B5563' }}>

                                                    {user?.lastSeenLocation || "-"}

                                                </TableCell>
                                                <TableCell sx={{ color: '#4B5563' }}>

                                                    {moment(user?.createdAt).format("DD/MM/YYYY")}

                                                </TableCell>
                                                <TableCell sx={{ color: 'var(--orange)', textAlign: 'center' }}>

                                                    {user?.requestReached || "-"}

                                                </TableCell>

                                                <TableCell sx={{ color: '#01C971', textAlign: 'center' }}>

                                                    {user?.requestAccepted || "-"}

                                                </TableCell>
                                                <TableCell sx={{ color: 'var(--orange)', textAlign: 'start' }}>

                                                    {user?.status || "-"}

                                                </TableCell>
                                                <TableCell sx={{ color: '#4B5563' }}>

                                                    {user?.reportedBy || "-"}

                                                </TableCell>

                                                <TableCell >
                                                    <Box align="center" sx={{ display: 'flex', flexDirection: 'row' }}>
                                                        <Tooltip title="View" arrow placement="top">
                                                            <IconButton onClick={() => nav(`/home/total-missing-person/person-information/${user._id}`)}>
                                                                <img src={ViewBtn} alt="view button" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Archive" arrow placement="top">
                                                            <IconButton onClick={() => {
                                                                achiveMissingPerson.mutate({
                                                                    id: user?._id,
                                                                    data: { isArchived: true }
                                                                });
                                                            }}>
                                                                <img src={Listtrip} alt="view button" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Delete" arrow placement="top">
                                                            <IconButton onClick={() => setconfirmation(user?._id)}>
                                                                <img src={delBtn} alt="Delete" />
                                                            </IconButton>
                                                        </Tooltip>

                                                        {confirmation === user?._id && (
                                                            <DeleteConfirm
                                                                id={user?._id}
                                                                setconfirmation={setconfirmation}
                                                                trip="missingPerson"
                                                            />
                                                        )}
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                        :
                                        <TableRow>
                                            <TableCell sx={{ color: '#4B5563', borderBottom: 'none' }} colSpan={8} align="center">
                                                <Typography align="center" color="text.secondary" sx={{ mt: 2 }}>
                                                    No data found
                                                </Typography>
                                            </TableCell>
                                        </TableRow>)
                                }
                            </TableBody>
                        </Table>

                    </TableContainer>

                    {MissingPersons?.data?.data?.data?.length > 0 && MissingPersons.isFetching && <Grid container sx={{ px: { xs: 0, sm: 3 } }} justifyContent="space-between" alignItems="center" mt={2}>
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
    );
};

export default ListofMissingPerson;
