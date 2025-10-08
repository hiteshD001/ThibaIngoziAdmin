import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Box, Typography, TextField, Button, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Grid, InputAdornment, Stack, Select, MenuItem, Chip
} from "@mui/material";
import flaggedBtn from '../../assets/images/flaggedBtn.svg'
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import search from '../../assets/images/search.svg';
import whiteplus from '../../assets/images/whiteplus.svg';
import ViewBtn from '../../assets/images/ViewBtn.svg'

import { useGetUserList } from "../../API Calls/API";
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


const ListOfCrimeReports = () => {
    const [popup, setpopup] = useState(false);
    const nav = useNavigate();
    const [role] = useState(localStorage.getItem("role"));
    const params = useParams();
    const [page, setpage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    const [filter, setfilter] = useState("");
    const [isExporting, setIsExporting] = useState(false);
    const [confirmation, setconfirmation] = useState("");
    let companyId = localStorage.getItem("userID");
    const paramId = role === "company" ? companyId : params.id;
    const [range, setRange] = useState([
        {
            startDate: startOfYear(new Date()),
            endDate: new Date(),
            key: 'selection'
        }
    ]);
    const startDate = range[0].startDate.toISOString();
    const endDate = range[0].endDate.toISOString();

    const UserList = useGetUserList("user list", "passanger", paramId, currentPage, rowsPerPage, filter, "", startDate, endDate);
    const totalUsers = UserList.data?.data?.totalUsers || 0;
    const totalPages = 1;

    const reportList = [
        {
            _id: 1,
            crimeId: "CR-2587",
            location: 'Sandton, Johannesburg Gauteng, 2196',
            shortDescription: "Armed robbery at convenience Store",
            reporter: "John Smith",
            reqReach: 44,
            reqAccept: 30,
            images: [],
            dateReported: 'Today, 09:45 AM',
            status: 'actioned',
        },
        {
            _id: 1,
            crimeId: "CR-2587",
            location: 'Sandton, Johannesburg Gauteng, 2196',
            shortDescription: "Armed robbery at convenience Store",
            reporter: "John Smith",
            reqReach: 44,
            reqAccept: 30,
            images: [],
            dateReported: 'Today, 09:45 AM',
            status: 'pending',
        },
        {
            _id: 1,
            crimeId: "CR-2587",
            location: 'Sandton, Johannesburg Gauteng, 2196',
            shortDescription: "Armed robbery at convenience Store",
            reporter: "John Smith",
            reqReach: 44,
            reqAccept: 30,
            images: [],
            dateReported: 'Today, 09:45 AM',
            status: 'reviewing',
        },
        {
            _id: 1,
            crimeId: "CR-2587",
            location: 'Sandton, Johannesburg Gauteng, 2196',
            shortDescription: "Armed robbery at convenience Store",
            reporter: "John Smith",
            reqReach: 44,
            reqAccept: 30,
            images: [],
            dateReported: 'Today, 09:45 AM',
            status: 'reviewed',
        },
    ]
    const handleExport = async ({ startDate, endDate, format }) => {
        try {
            const { data } = await apiClient.get(`${import.meta.env.VITE_BASEURL}/flagged-reports`, {
                params: {
                    role: "passanger",
                    page: 1,
                    limit: 10000,
                    filter: "",
                    company_id: paramId,
                    startDate,
                    endDate,
                },
            });

            const allUsers = data?.users || [];
            if (!allUsers.length) {
                toast.warning("No User data found for this period.");
                return;
            }

            const exportData = allUsers.map(user => ({
                "User": `${user.first_name || ''} ${user.last_name || ''}` || '',
                "Company Name": user.company_name || '',
                "Contact No.": `${user.mobile_no_country_code || ''}${user.mobile_no || ''}`,
                "Contact Email": user.email || ''
            }));

            if (format === "xlsx") {
                const worksheet = XLSX.utils.json_to_sheet(exportData);
                const columnWidths = Object.keys(exportData[0] || {}).map((key) => ({
                    wch: Math.max(key.length, ...exportData.map((row) => String(row[key] ?? 'NA').length)) + 2
                }));
                worksheet['!cols'] = columnWidths;
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
                XLSX.writeFile(workbook, "User_List.xlsx");
            }
            else if (format === "csv") {
                const worksheet = XLSX.utils.json_to_sheet(exportData);
                const csv = XLSX.utils.sheet_to_csv(worksheet);
                const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'user_list.csv';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
            else if (format === "pdf") {
                const doc = new jsPDF();
                doc.text('User List', 14, 16);
                autoTable(doc, {
                    head: [['User', 'Company Name', 'Contact No.', 'Contact Email']],
                    body: allUsers.map(user => [
                        `${user.first_name || ''} ${user.last_name || ''}` ?? 'NA',
                        user.company_name ?? 'NA',
                        `${user.mobile_no_country_code || ''}${user.mobile_no || ''}` ?? 'NA',
                        user.email ?? 'NA'
                    ]),
                    startY: 20,
                    theme: 'striped',
                    headStyles: { fillColor: '#367BE0' },
                    margin: { top: 20 },
                    styles: { fontSize: 10 },
                });
                doc.save("User_List.pdf");
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
                        <Typography variant="h6" fontWeight={590}>All Crime Reports</Typography>
                        <Typography variant="h6" fontWeight={550}>
                            {UserList.isSuccess ? UserList.data?.data.totalUsers : 0}
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
                            <CustomFilter />
                            <CustomDateRangePicker
                                borderColor={'var(--light-gray)'}
                                value={range}
                                onChange={setRange}
                                icon={calender}
                            />

                            <Button
                                variant="contained"
                                sx={{ height: '40px', width: '150px', borderRadius: '8px' }}
                                onClick={() => nav("/home/crime-reports")}
                                startIcon={<img src={whiteplus} alt='white plus' />}
                            >
                                Add Report
                            </Button>
                            <CustomExportMenu onExport={handleExport} />


                        </Box>

                    </Grid>
                </Grid>

                {reportList.length < 0 ? (
                    <Loader />
                ) : reportList.length > 0 ? (
                    <Box sx={{ px: { xs: 0, md: 2 }, pt: { xs: 0, md: 3 }, backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
                        <TableContainer >
                            <Table sx={{ '& .MuiTableCell-root': { fontSize: '15px' } }}>
                                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                    <TableRow >
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', borderTopLeftRadius: '10px' }}>Crime ID</TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Location</TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Short Description</TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Reporter</TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Request Reached</TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Request Accepted</TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Images</TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Date Reported</TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Status</TableCell>
                                        <TableCell align="center" sx={{ backgroundColor: '#F9FAFB', borderTopRightRadius: '10px', color: '#4B5563' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {reportList.map((user) => (
                                        <TableRow key={user._id}>
                                            <TableCell sx={{ color: 'var(--Blue)' }}>
                                                {user.crimeId}
                                            </TableCell>
                                            <TableCell sx={{ color: '#4B5563' }}>

                                                {user.location || "-"}

                                            </TableCell>
                                            <TableCell sx={{ color: 'black' }}>

                                                {user.shortDescription}

                                            </TableCell>
                                            <TableCell sx={{ color: '#4B5563' }}>

                                                {user.reporter || "-"}

                                            </TableCell>
                                            <TableCell sx={{ color: '#F97316', textAlign: 'center' }}>


                                                {user.reqReach || "-"}

                                            </TableCell>
                                            <TableCell sx={{ color: '#01C971', textAlign: 'center' }}>


                                                {user.reqAccept || "-"}

                                            </TableCell>
                                            <TableCell sx={{ color: '#4B5563' }}>
                                                <Stack direction="row" alignItems="center" gap={1}>
                                                    {[1, 2].map((item) => (
                                                        <Grid size={{ xs: 6, sm: 3 }} key={item}>
                                                            <Box
                                                                component="img"
                                                                src={`https://blocks.astratic.com/img/general-img-landscape.png`}
                                                                alt={`Placeholder ${item}`}
                                                                sx={{ width: '50px', height: 'auto', borderRadius: '6px' }}
                                                            />
                                                        </Grid>
                                                    ))}
                                                </Stack>
                                            </TableCell>
                                            <TableCell sx={{ color: '#4B5563' }}>

                                                {user.dateReported || "-"}

                                            </TableCell>

                                            <TableCell sx={{ color: '#4B5563' }}>
                                                <Chip
                                                    label={user.status}
                                                    sx={{
                                                        backgroundColor:
                                                            user.status === 'actioned' ? '#DCFCE7' :
                                                                user.status === 'reviewing' ? '#FEF9C3' :
                                                                    user.status == 'reviewed' ? '#DBEAFE' :
                                                                        user.status == 'pending' ? '#F3F4F6' :
                                                                            '#FEF9C3',
                                                        '& .MuiChip-label': {
                                                            textTransform: 'capitalize',
                                                            color: user.status === 'actioned' ? 'green' :
                                                                user.status === 'reviewing' ? '#854D0E' :
                                                                    user.status == 'reviewed' ? '#1E40AF' :
                                                                        user.status == 'pending' ? '#1F2937' :

                                                                            'black',
                                                        }
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell >
                                                <Box align="center" sx={{ display: 'flex', flexDirection: 'row' }}>
                                                    <IconButton onClick={() => nav(`/home/crime-reports/crime-report/${user._id}`)}>
                                                        <img src={ViewBtn} alt="flagged button" />
                                                    </IconButton>

                                                </Box>


                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                        </TableContainer>
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
                                        {[5, 10, 15, 20].map((num) => (
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
                        </Grid>
                    </Box>
                ) : (
                    <Typography align="center" color="text.secondary" sx={{ mt: 2 }}>
                        No data found
                    </Typography>
                )}
            </Paper>
            {popup && <ImportSheet setpopup={setpopup} type="user" />}
        </Box>
    );
};

export default ListOfCrimeReports;
