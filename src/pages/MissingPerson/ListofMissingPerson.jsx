import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box, Typography, TextField, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, Grid, InputAdornment, Stack, Select, MenuItem,
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
const MissingPersons = [
    {
        "_id": 1,
        "name": 'Mohammad Salem',
        "location": 'Sandton, Johannesburg Gauteng,2196',
        "date": '02/05/25',
        "req_accept": '20',
        "req_reached": '30',
        "date": '02/05/25',
        'reportedBy': 'Jane Cooper'
    },
    {
        "_id": 2,
        "name": 'Mohammad Salem',
        "location": 'Sandton, Johannesburg Gauteng,2196',
        "date": '02/05/25',
        "req_accept": '20',
        "req_reached": '30',
        'reportedBy': 'Jane Cooper'
    },
    {
        "_id": 3,
        "name": 'Mohammad Salem',
        "location": 'Sandton, Johannesburg Gauteng,2196',
        "date": '02/05/25',
        "req_accept": '20',
        "req_reached": '30',
        'reportedBy': 'Jane Cooper'
    },
    {
        "_id": 4,
        "name": 'Mohammad Salem',
        "location": 'Sandton, Johannesburg Gauteng,2196',
        "date": '02/05/25',
        "req_accept": '20',
        "req_reached": '30',
        'reportedBy': 'Jane Cooper'
    },
    {
        "_id": 5,
        "name": 'Mohammad Salem',
        "location": 'Sandton, Johannesburg Gauteng,2196',
        "date": '02/05/25',
        "req_accept": '20',
        "req_reached": '30',
        'reportedBy': 'Jane Cooper'
    },
]

const ListofMissingPerson = () => {
    const [popup, setpopup] = useState(false);
    const nav = useNavigate();
    const [range, setRange] = useState([
        {
            startDate: new Date(),
            endDate: new Date(),
            key: 'selection'
        }
    ]);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    const [filter, setfilter] = useState("");
    const totalUsers = 10;
    const totalPages = Math.ceil(totalUsers / rowsPerPage);
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
                            <CustomFilter />
                            <CustomDateRangePicker
                                borderColor={'var(--light-gray)'}
                                value={range}
                                onChange={setRange}
                                icon={calender}
                            />
                            <CustomExportMenu />
                        </Box>

                    </Grid>
                </Grid>

                {MissingPersons.length < 0 ? (
                    <Loader />
                ) : MissingPersons.length > 0 ? (
                    <Box sx={{ px: { xs: 0, md: 2 }, pt: { xs: 0, md: 3 }, backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
                        <TableContainer >
                            <Table sx={{ '& .MuiTableCell-root': { fontSize: '15px', } }}>
                                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                    <TableRow >
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', borderTopLeftRadius: '10px' }}>User</TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Last Seen Location</TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Date</TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', textAlign: 'center' }}>Request Reached</TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', textAlign: 'center' }}>Request Accepted</TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Reported by</TableCell>
                                        <TableCell align="center" sx={{ backgroundColor: '#F9FAFB', borderTopRightRadius: '10px', color: '#4B5563' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {MissingPersons.map((user) => (
                                        <TableRow key={user._id}>
                                            <TableCell sx={{ color: '#4B5563' }}>
                                                <Stack direction="row" alignItems="center" gap={1}>
                                                    <Avatar
                                                        src={user.profileImage || nouser}
                                                        alt="User"
                                                    />

                                                    {/* {user.first_name} {user.last_name} */}
                                                    {user.name}
                                                </Stack>
                                            </TableCell>
                                            <TableCell sx={{ color: '#4B5563' }}>

                                                {user.location || "-"}

                                            </TableCell>
                                            <TableCell sx={{ color: '#4B5563' }}>

                                                {user.date}

                                            </TableCell>
                                            <TableCell sx={{ color: 'var(--orange)', textAlign: 'center' }}>

                                                {user.req_reached || "-"}

                                            </TableCell>
                                            <TableCell sx={{ color: '#01C971', textAlign: 'center' }}>

                                                {user.req_accept || "-"}

                                            </TableCell>
                                            <TableCell sx={{ color: '#4B5563' }}>

                                                {user.reportedBy || "-"}

                                            </TableCell>

                                            <TableCell >
                                                <Box align="center" sx={{ display: 'flex', flexDirection: 'row' }}>
                                                    <IconButton onClick={() => nav(`/home/total-missing-person/person-information/${user._id}`)}>
                                                        <img src={ViewBtn} alt="view button" />
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

export default ListofMissingPerson;
