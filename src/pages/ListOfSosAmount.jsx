import {
    Box,
    Button,
    IconButton,
    InputAdornment,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    TablePagination,
    Grid,
    Select,
    MenuItem
} from "@mui/material";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { useState } from "react";
import plus from '../assets/images/plus.svg'
import { useNavigate } from "react-router-dom";
import search from '../assets/images/search.svg'
import ViewBtn from '../assets/images/ViewBtn.svg'
import delBtn from '../assets/images/delBtn.svg'
import whiteplus from '../assets/images/whiteplus.svg'
import { useGetSoSAmountList } from "../API Calls/API";
import { DeleteSosAmount } from "../common/ConfirmationPOPup";
import Loader from "../common/Loader";

const ListOfSosAmount = () => {
    const nav = useNavigate();
    const [role] = useState(localStorage.getItem("role"));
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filter, setFilter] = useState("");
    const [confirmation, setConfirmation] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const sosList = useGetSoSAmountList("ArmedSOSAmount List", page + 1, rowsPerPage, filter);
    const totalPages = Math.ceil(sosList.length / rowsPerPage);
    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <Box p={2}>
            <Paper elevation={3} sx={{ backgroundColor: "rgb(252, 252, 252)", padding: 3, borderRadius: '10px' }}>
                <Grid container display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Grid size={{ xs: 12, md: 4 }} sx={{ mb: { xs: 2, md: 0 } }}>
                        <Typography variant="h6" fontWeight={550}>List of SOS Amount</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 8 }} sx={{ display: 'flex', justifyContent: 'flex-end', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                        <TextField
                            variant="outlined"
                            placeholder="Search"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
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
                            {role === "super_admin" && (
                                <Button variant="outlined" size="small" sx={{ height: '40px', width: '150px', borderRadius: '8px' }} onClick={() => nav("add-service")} startIcon={<img src={plus} alt="plus icon" />}>
                                    Add Service
                                </Button>
                            )}
                            <Button sx={{ height: '40px', width: '150px', borderRadius: '8px' }} variant="contained" onClick={() => nav("add-sos")} startIcon={<img src={whiteplus} alt='white plus' />}>
                                Add SOS
                            </Button>
                        </Box>
                    </Grid>
                </Grid>


                {!sosList.data ? (
                    <Loader />
                ) : sosList.data?.data?.length ? (
                    <Box sx={{ px: 3, pt: 3, backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
                        <TableContainer >
                            <Table>
                                <TableHead >
                                    <TableRow>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', borderTopLeftRadius: '10px', color: '#4B5563' }}>Armed SOS Amount</TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Driver Split Amount</TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Company Split Amount</TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Currency</TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Type</TableCell>
                                        <TableCell align="center" sx={{ backgroundColor: '#F9FAFB', borderTopRightRadius: '10px', color: '#4B5563' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {sosList.data.data.map((data) => (
                                        <TableRow key={data._id}>
                                            <TableCell sx={{ color: '#4B5563' }}>{data.amount}</TableCell>
                                            <TableCell sx={{ color: '#4B5563' }}>{data.driverSplitAmount ?? 0}</TableCell>
                                            <TableCell sx={{ color: '#4B5563' }}>{data.companySplitAmount ?? 0}</TableCell>
                                            <TableCell sx={{ color: '#4B5563' }}>{data.currency || "-"}</TableCell>
                                            <TableCell sx={{ color: '#4B5563' }}>{data.notificationTypeId?.type || "-"}</TableCell>
                                            <TableCell align="center" sx={{ display: 'flex', flexDirection: 'row' }}>
                                                <IconButton onClick={() => nav(`/home/total-sos-amount/sos-amount/${data._id}`)}>
                                                    <img src={ViewBtn} alt="view button" />
                                                </IconButton>
                                                <IconButton onClick={() => setConfirmation(data._id)}>
                                                    <img src={delBtn} alt="delete button" />
                                                </IconButton>
                                                {confirmation === data._id && (
                                                    <DeleteSosAmount id={data._id} setconfirmation={setConfirmation} />
                                                )}

                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            <Grid container justifyContent="space-between" alignItems="center" mt={2}>
                                <Grid >
                                    <Typography variant="body2">
                                        Rows per page:&nbsp;
                                        <Select
                                            size="small"
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
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Typography variant="body2">
                                            {currentPage} / {totalPages}
                                        </Typography>
                                        <IconButton
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage((prev) => prev - 1)}
                                        >
                                            <ArrowBackIosNewIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            disabled={currentPage === totalPages}
                                            onClick={() => setCurrentPage((prev) => prev + 1)}
                                        >
                                            <ArrowForwardIosIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </Grid>
                            </Grid>
                        </TableContainer>
                    </Box>
                ) : (
                    <Typography align="center" color="text.secondary" sx={{ mt: 2 }}>
                        No data found
                    </Typography>
                )}
            </Paper>
        </Box>
    );
};

export default ListOfSosAmount;
