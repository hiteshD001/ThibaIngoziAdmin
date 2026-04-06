import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import useDebounce from "../hooks/useDebounce";
import {
    Box, Typography, TextField, Button, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, Grid, InputAdornment, Stack, Select, MenuItem,
    Tooltip,
    TableSortLabel,
    Chip,
} from "@mui/material";
import plus from '../assets/images/plus.svg'
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import search from '../assets/images/search.svg';
import whiteplus from '../assets/images/whiteplus.svg';
import { useGetUser, useGetUserList } from "../API Calls/API";
import { useQueryClient } from "@tanstack/react-query";
import Loader from "../common/Loader";
import ViewBtn from '../assets/images/ViewBtn.svg'
import delBtn from '../assets/images/delBtn.svg'
import { DeleteConfirm } from "../common/ConfirmationPOPup";
import ImportSheet from "../common/ImportSheet";
import nouser from "../assets/images/NoUser.png";
import CustomExportMenu from '../common/Custom/CustomExport'
import CustomDateRangePicker from "../common/Custom/CustomDateRangePicker";
import calender from '../assets/images/calender.svg';
import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable'
import * as XLSX from 'xlsx';
import { toast } from "react-toastify";
import apiClient from '../API Calls/APIClient'
import { startOfYear, startOfDay, endOfDay } from "date-fns";
import arrowup from '../assets/images/arrowup.svg';
import arrowdown from '../assets/images/arrowdown.svg';
import arrownuteral from '../assets/images/arrownuteral.svg';
import { saveScrollPosition, restoreScrollPosition } from "../common/ScrollPosition";

const ListOfUsers = () => {
    const [popup, setpopup] = useState(false);
    const nav = useNavigate();
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
    const [role] = useState(localStorage.getItem("role"));
    const params = useParams();
    const client = useQueryClient();
    const [page, setpage] = useState(1);
    const debouncedFilter = useDebounce(filter, 500); // 500ms delay for search
    const [isExporting, setIsExporting] = useState(false);
    const [confirmation, setconfirmation] = useState("");
    let companyId = localStorage.getItem("userID");
    const paramId = role === "company" ? companyId : params.id;
    const [isRange, setIsRange] = useState(false);

    // Calculate startDate and endDate reactively from range state
    // Use startOfDay/endOfDay to normalize to local day boundaries before converting to ISO
    const startDate = isRange ? "" : (range[0]?.startDate ? startOfDay(range[0].startDate).toISOString() : "");
    const endDate = isRange ? "" : (range[0]?.endDate ? endOfDay(range[0].endDate).toISOString() : "");

    // Sort 1
    const [sortBy, setSortBy] = useState("first_name");
    const [sortOrder, setSortOrder] = useState("asc");

    // Save/restore filter state using React Query cache
    useEffect(() => {
        const savedState = client.getQueryData(['userListFilters']);
        if (savedState) {
            updateParams({filter:savedState.filter || ""});
            setSortBy(savedState.sortBy || "first_name");
            setSortOrder(savedState.sortOrder || "asc");
            setRange(savedState.range
                    ? [
                        {
                            startDate: new Date(savedState.range[0].startDate),
                            endDate: new Date(savedState.range[0].endDate),
                            key: "selection"
                        }
                    ]
                    : [
                        {
                            startDate: new Date(startDateParam),
                            endDate: new Date(endDateParam),
                            key: "selection"
                        }
                    ]
            );
        }
    }, [client]);

    useEffect(() => {
        client.setQueryData(['userListFilters'], {
            filter: debouncedFilter,
            sortBy,
            sortOrder,
            range
        });
    }, [debouncedFilter, sortBy, sortOrder, range, client]);

    const changeSortOrder = (e) => {
        const field = e.target.id;
        if (field !== sortBy) {
            setSortBy(field);
            setSortOrder("asc");
        } else {
            setSortOrder(p => p === 'asc' ? 'desc' : 'asc')
        }
    }

    // Handle date range changes from date picker
    const handleDateRangeChange = (newRange) => {
        setRange(newRange);
        updateParams({
            startDate: new Date(newRange[0].startDate).toISOString(),
            endDate: new Date(newRange[0].endDate).toISOString(),
        });
        setIsRange(false); // Reset isRange when specific dates are selected
    }

    const UserList = useGetUserList("user list", "passanger", paramId, currentPage, rowsPerPage, debouncedFilter, "", startDate, endDate, sortBy, sortOrder);
    const totalUsers = UserList.data?.data?.totalUsers || 0;
    const totalPages = Math.ceil(totalUsers / rowsPerPage);
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
    let loginUser = useGetUser(localStorage.getItem("userID"));
    loginUser = loginUser?.data?.data?.user;
    const handleExport = async ({ startDate, endDate, exportFormat }) => {
        let format = exportFormat;
        try {
            const { data } = await apiClient.get(`${import.meta.env.VITE_BASEURL}/users`, {
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
            const exportedByValue = loginUser.role === 'company' ? loginUser.company_name : 'Super Admin';
            if (format === "xlsx") {
                const workbook = XLSX.utils.book_new();

                // Add "Exported By" header row
                const headerRow = [["Exported By", exportedByValue], []]; // blank row after header

                // Prepare sheet data with header
                const worksheetData = [
                    ...headerRow,
                    Object.keys(exportData[0] || {}),
                    ...exportData.map(obj => Object.values(obj))
                ];

                const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

                // Auto-fit column widths
                const columnWidths = Object.keys(exportData[0] || {}).map((key) => ({
                    wch: Math.max(key.length, ...exportData.map((row) => String(row[key] ?? 'NA').length)) + 2
                }));
                worksheet['!cols'] = columnWidths;

                XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
                XLSX.writeFile(workbook, "User_List.xlsx");
            }

            else if (format === "csv") {
                // Add "Exported By" header to CSV
                const headers = Object.keys(exportData[0] || {});
                const csvRows = exportData.map(row =>
                    headers.map(h => JSON.stringify(row[h] ?? '')).join(',')
                );
                const csv = `Exported By,${exportedByValue}\n\n${headers.join(',')}\n${csvRows.join('\n')}`;

                const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'User_List.csv';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }

            else if (format === "pdf") {
                const doc = new jsPDF();

                // Title
                doc.setFontSize(14);
                doc.text('User List', 14, 16);

                // Exported By line
                doc.setFontSize(10);
                doc.text(`Exported By: ${exportedByValue}`, 14, 24);

                // Add user data as table
                autoTable(doc, {
                    startY: 30,
                    head: [['User', 'Company Name', 'Contact No.', 'Contact Email']],
                    body: allUsers.map(user => [
                        `${user.first_name || ''} ${user.last_name || ''}` || 'NA',
                        user.company_name || 'NA',
                        `${user.mobile_no_country_code || ''}${user.mobile_no || ''}` || 'NA',
                        user.email || 'NA'
                    ]),
                    theme: 'striped',
                    headStyles: { fillColor: [54, 123, 224], textColor: 255 },
                    styles: { fontSize: 10 },
                    margin: { top: 20 },
                });

                doc.save("User_List.pdf");
            }

        } catch (err) {
            console.error("Error exporting data:", err);
            toast.error("Export failed.");
        }
    };
    // Handle Scroll Event store 
    const handleView = (user) => {
        saveScrollPosition("userListScroll");
        nav(`/home/total-users/user-information/${user._id}`)
    };
    useEffect(() => {
        if (UserList.data?.data?.users?.length) {
            restoreScrollPosition("userListScroll");
        }
    }, [UserList.data?.data?.users]);
    return (
        <Box p={2}>
            <Paper elevation={3} sx={{ backgroundColor: "rgb(253, 253, 253)", padding: 2, borderRadius: '10px' }}>
                <Grid container justifyContent="space-between" alignItems="center" mb={2}>
                    <Grid size={{ xs: 12, lg: 2.5 }} sx={{ display: 'flex', flexDirection: 'row', gap: 2, mb: { xs: 1, md: 0 } }}>
                        <Typography variant="h6" fontWeight={590}>Total Users</Typography>
                        <Typography variant="h6" fontWeight={550}>
                            {UserList.isSuccess ? UserList.data?.data.totalUsers : 0}
                        </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, lg: 9.5 }} sx={{ display: 'flex', justifyContent: 'flex-end', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mt: { xs: 2, lg: 0 } }}>

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
                                value={range}
                                onChange={handleDateRangeChange}
                                icon={calender}
                            />
                            <CustomExportMenu onExport={handleExport} />
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
                            <Button variant="outlined" onClick={() => {
                                updateParams({filter:"",rowsPerPage:10,currentPage:1});
                                setSortBy("username");
                                setSortOrder("asc");
                                setIsRange(true)

                                client.removeQueries(['userListFilters']);
                            }} sx={{ height: '40px', fontSize: '0.8rem', width: '120px', borderRadius: '8px', border: '1px solid var(--Blue)' }}>
                                View All
                            </Button>

                        </Box>

                    </Grid>
                </Grid>

                <Box sx={{ px: { xs: 0, md: 2 }, pt: { xs: 0, md: 3 }, backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
                    <TableContainer >
                        <Table sx={{ '& .MuiTableCell-root': { borderBottom: 'none', fontSize: '15px' } }}>
                            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableRow >
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', borderTopLeftRadius: '10px' }}>
                                        <TableSortLabel
                                            id="username"
                                            active={sortBy === 'username'}
                                            direction={sortOrder}
                                            onClick={changeSortOrder}
                                            IconComponent={() => <img src={sortBy === 'username' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                        >
                                            User
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                        <TableSortLabel
                                            id="company_name"
                                            active={sortBy === 'company_name'}
                                            direction={sortOrder}
                                            onClick={changeSortOrder}
                                            IconComponent={() => <img src={sortBy === 'company_name' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                        >
                                            Company
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                        <TableSortLabel
                                            id="mobile_no"
                                            active={sortBy === 'mobile_no'}
                                            direction={sortOrder}
                                            onClick={changeSortOrder}
                                            IconComponent={() => <img src={sortBy === 'mobile_no' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                        >
                                            Contact No.
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                        <TableSortLabel
                                            id="email"
                                            active={sortBy === 'email'}
                                            direction={sortOrder}
                                            onClick={changeSortOrder}
                                            IconComponent={() => <img src={sortBy === 'email' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                        >
                                            Contact Email
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                        <TableSortLabel
                                            id="subscription_status"
                                            active={sortBy === 'subscription_status'}
                                            direction={sortOrder}
                                            onClick={changeSortOrder}
                                            IconComponent={() => <img src={sortBy === 'subscription_status' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                        >
                                            Subscription Status
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                        <TableSortLabel
                                            id="tag_connection"
                                            active={sortBy === 'tag_connection'}
                                            direction={sortOrder}
                                            onClick={changeSortOrder}
                                            IconComponent={() => <img src={sortBy === 'tag_connection' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}

                                        >
                                            Tag Connection
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                        <TableSortLabel
                                            id="tag_disconnection"
                                            active={sortBy === 'tag_disconnection'}
                                            direction={sortOrder}
                                            onClick={changeSortOrder}
                                            IconComponent={() => <img src={sortBy === 'tag_disconnection' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                        >
                                            Tag Disconnection
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell align="center" sx={{ backgroundColor: '#F9FAFB', borderTopRightRadius: '10px', color: '#4B5563' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {UserList.isFetching ?
                                    <TableRow>
                                        <TableCell sx={{ color: '#4B5563', borderBottom: 'none' }} colSpan={8} align="center">
                                            <Loader />
                                        </TableCell>
                                    </TableRow>
                                    : (UserList.data?.data.users?.length > 0 ?
                                        UserList.data?.data.users.map((user) => (
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

                                                <TableCell sx={{ color: "#4B5563" }}>
                                                    <Chip
                                                        label={user.isEnroll ? "active" : "inactive"}
                                                        sx={{
                                                            backgroundColor: user?.isEnroll ? '#DCFCE7' : '#E5565A1A',
                                                            '& .MuiChip-label': {
                                                                textTransform: 'capitalize',
                                                                fontWeight: 500,
                                                                color: user?.isEnroll ? '#15803D' : '#E5565A',
                                                            }
                                                        }}
                                                    />
                                                </TableCell>

                                                <TableCell sx={{ color: '#4B5563' }}>
                                                    {user.tag_connection || "-"}
                                                </TableCell>

                                                <TableCell sx={{ color: '#4B5563' }}>
                                                    {user.tag_disconnection || "-"}
                                                </TableCell>

                                                <TableCell >
                                                    <Box align="center" sx={{ display: 'flex', flexDirection: 'row' }}>
                                                        <Tooltip title="View" arrow placement="top">
                                                            <IconButton onClick={() => handleView(user)}>
                                                                <img src={ViewBtn} alt="view button" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        {role !== 'company' && (
                                                            <Tooltip title="Delete" arrow placement="top">
                                                                <IconButton onClick={() => setconfirmation(user._id)}>
                                                                    <img src={delBtn} alt="delete button" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )}

                                                        {confirmation === user._id && (
                                                            <DeleteConfirm id={user._id} setconfirmation={setconfirmation} />
                                                        )}
                                                    </Box>


                                                </TableCell>
                                            </TableRow>
                                        ))
                                        :
                                        <TableRow>
                                            <TableCell sx={{ color: '#4B5563', borderBottom: 'none' }} colSpan={8} align="center">
                                                <Typography justifyContent="center" alignItems="center" color="text.secondary" sx={{ mt: 2 }}>
                                                    No data found
                                                </Typography>
                                            </TableCell>
                                        </TableRow>)
                                }
                            </TableBody>
                        </Table>

                    </TableContainer>

                    {!UserList.isFetching && UserList.data?.data.users?.length > 0 && <Grid container sx={{ px: { xs: 0, sm: 3 } }} justifyContent="space-between" alignItems="center" mt={2}>
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
};

export default ListOfUsers;
