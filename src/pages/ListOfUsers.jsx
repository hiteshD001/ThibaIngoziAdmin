import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Box, Typography, TextField, Button, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, Grid, InputAdornment, Stack, Select, MenuItem,
} from "@mui/material";
import plus from '../assets/images/plus.svg'
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import search from '../assets/images/search.svg';
import whiteplus from '../assets/images/whiteplus.svg';
import { useGetUserList } from "../API Calls/API";
import Loader from "../common/Loader";
import ViewBtn from '../assets/images/ViewBtn.svg'
import delBtn from '../assets/images/delBtn.svg'
import { DeleteConfirm } from "../common/ConfirmationPOPup";
import ImportSheet from "../common/ImportSheet";
import nouser from "../assets/images/NoUser.png";

const ListOfUsers = () => {
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

    const fetchAllUsers = async () => {
        try {
            const response = await apiClient.get(`${import.meta.env.VITE_BASEURL}/users`, {
                params: {
                    role: "passanger",
                    page: 1,
                    limit: 10000,
                    filter,
                    company_id: paramId,
                },
            });
            return response?.data?.users || [];
        } catch (error) {
            console.error("Error fetching all User data for export:", error);
            toast.error("Failed to fetch User data.");
            return [];
        }
    };

    const handleExport = async () => {
        setIsExporting(true);
        const allUsers = await fetchAllUsers();
        setIsExporting(false);

        if (!allUsers || allUsers.length === 0) {
            toast.warning("No User data to export.");
            return;
        }

        const fileName = "Users_List";

        // Prepare data for export
        const exportData = allUsers.map(user => ({
            "userName": `${user.first_name || ''} ${user.last_name || ''}`,
            "Company": user.company_name || '',
            "Contact No.": `${user.mobile_no_country_code || ''}${user.mobile_no || ''}`,
            "Contact Email": user.email || ''
        }));

        // Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(exportData);

        // Set column widths dynamically
        const columnWidths = Object.keys(exportData[0]).map((key) => ({
            wch: Math.max(
                key.length,
                ...exportData.map((row) => String(row[key] || '').length)
            ) + 2,
        }));
        worksheet['!cols'] = columnWidths;

        // Create workbook and add the worksheet
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, fileName);

        // Trigger download
        XLSX.writeFile(workbook, `${fileName}.xlsx`);
    };
    const UserList = useGetUserList("user list", "passanger", paramId, currentPage, rowsPerPage, filter);
    const totalUsers = UserList.data?.data?.totalUsers || 0;
    const totalPages = Math.ceil(totalUsers / rowsPerPage);
    return (
        <Box p={2}>
            <Paper elevation={3} sx={{ backgroundColor: "rgb(253, 253, 253)", padding: 2, borderRadius: '10px' }}>
                <Grid container justifyContent="space-between" alignItems="center" mb={2}>
                    <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', flexDirection: 'row', gap: 2, mb: { xs: 1, md: 0 } }}>
                        <Typography variant="h6" fontWeight={590}>Total Users</Typography>
                        <Typography variant="h6" fontWeight={550}>
                            {UserList.isSuccess ? UserList.data?.data.totalUsers : 0}
                        </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 8 }} sx={{ display: 'flex', justifyContent: 'flex-end', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>

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
                            <Button
                                startIcon={<img src={plus} alt="plus icon" />}
                                variant="outlined" size="small" sx={{ height: '40px', width: '150px', borderRadius: '8px' }}
                                onClick={() => setpopup(true)}

                            >
                                Import Sheet
                            </Button>
                            <Button
                                variant="contained"
                                sx={{ height: '40px', width: '150px', borderRadius: '8px' }}
                                onClick={() => nav("/home/total-users/add-user")}
                                startIcon={<img src={whiteplus} alt='white plus' />}
                            >
                                Add User
                            </Button>
                        </Box>

                    </Grid>
                </Grid>

                {UserList.isFetching ? (
                    <Loader />
                ) : UserList.data?.data.users?.length > 0 ? (
                    <Box sx={{ px: { xs: 0, md: 2 }, pt: { xs: 0, md: 3 }, backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
                        <TableContainer >
                            <Table sx={{ '& .MuiTableCell-root': { borderBottom: 'none', fontSize: '15px' } }}>
                                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                    <TableRow >
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', borderTopLeftRadius: '10px' }}>User</TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Company</TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Contact No.</TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Contact Email</TableCell>
                                        <TableCell align="center" sx={{ backgroundColor: '#F9FAFB', borderTopRightRadius: '10px', color: '#4B5563' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {UserList.data?.data.users.map((user) => (
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

                                                {user.company_name || "-"}

                                            </TableCell>
                                            <TableCell sx={{ color: '#4B5563' }}>

                                                {`${user?.mobile_no_country_code ?? ""}${user?.mobile_no ?? "-"}`}

                                            </TableCell>
                                            <TableCell sx={{ color: '#4B5563' }}>

                                                {user.email || "-"}

                                            </TableCell>

                                            <TableCell >
                                                <Box align="center" sx={{ display: 'flex', flexDirection: 'row' }}>
                                                    <IconButton onClick={() => nav(`/home/total-users/user-information/${user._id}`)}>
                                                        <img src={ViewBtn} alt="view button" />
                                                    </IconButton>
                                                    <IconButton onClick={() => setconfirmation(user._id)}>
                                                        <img src={delBtn} alt="delete button" />
                                                    </IconButton>
                                                    {confirmation === user._id && (
                                                        <DeleteConfirm id={user._id} setconfirmation={setconfirmation} />
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

export default ListOfUsers;
