import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
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
import { useGetUserFamilMembers } from "../../API Calls/API";
import Loader from "../../common/Loader";
import ImportSheet from "../../common/ImportSheet";
import { startOfYear } from "date-fns";
import { DeleteConfirm } from "../../common/ConfirmationPOPup";
import nouser from "../../assets/images/NoUser.png";
import { saveScrollPosition, restoreScrollPosition } from "../../common/ScrollPosition";

const FamilyMembers = ({ userDetail }) => {
    const [popup, setpopup] = useState(false);
    const nav = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const startDateParam = searchParams.get("startDate") || startOfYear(new Date()).toISOString();
    const endDateParam = searchParams.get("endDate") || new Date().toISOString();
    const currentPage = Number(searchParams.get("currentPage")) || 1;
    const filter = searchParams.get("filter") || "";
    const locationFilter = searchParams.get("locationFilter") || "";
    const rowsPerPage = Number(searchParams.get("rowsPerPage")) || 10;
    const [confirmation, setconfirmation] = useState("");
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

    const UserList = useGetUserFamilMembers("family members",userDetail);
    
    const totalpoliceUnitData = UserList.data?.data?.user?.length || 0;
    const totalPages = Math.ceil(totalpoliceUnitData / rowsPerPage);

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
    const handleView = (url) => {
        saveScrollPosition("familyMemberScroll");
        // nav(`/home/total-users/user-information/${userDetail}/family-member-information/${report._id}`)
        nav(url)
    };
    useEffect(() => {
        if (UserList.data?.data.user) {
            restoreScrollPosition("familyMemberScroll");
        }
    }, [UserList.data?.data.user]);

    return (
        <Box p={2}>
            <Paper elevation={3} sx={{ backgroundColor: "rgb(253, 253, 253)", padding: 2, borderRadius: '10px' }}>
                <Grid container justifyContent="space-between" alignItems="center" mb={2}>
                    <Grid size={{ xs: 12, lg: 3 }} sx={{ display: 'flex', flexDirection: 'row', gap: 2, mb: { xs: 1, md: 0 } }}>
                        <Typography variant="h6" fontWeight={590}>Family Members</Typography>
                        <Typography variant="h6" fontWeight={550}>
                            {UserList.isSuccess ? UserList.data?.data?.totalpoliceUnitData : 0}
                        </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, lg: 9 }} sx={{ display: 'flex', justifyContent: 'flex-end', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mt: { xs: 2, lg: 0 } }}>
                        <Box display="flex" sx={{ justifyContent: { xs: 'space-between' } }} >
                            <Button variant="contained" onClick={() => nav(`/home/total-users/user-information/${userDetail}/add-family-member`)} sx={{  borderRadius: '8px' }}
                                startIcon={<img src={whiteplus} alt='white plus' />}>
                                Add Family Membre
                            </Button>
                        </Box>

                    </Grid>
                </Grid>
                <Box sx={{ px: { xs: 0, md: 2 }, pt: { xs: 0, md: 3 }, backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
                    <TableContainer >
                        <Table sx={{ '& .MuiTableCell-root': { fontSize: '15px' } }}>
                            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableRow >
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', borderTopLeftRadius: '10px' }}>Name</TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Relationship</TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Face Matched</TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Status</TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Image</TableCell>
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
                                    : (UserList.data?.data.user?.length > 0 ?
                                        UserList.data?.data.user.map((report) => (

                                            <TableRow key={report._id}>
                                                <TableCell>
                                                    {report.first_name || ""} {report.last_name || ""}
                                                </TableCell>
                                                <TableCell sx={{ color: '#4B5563' }}>

                                                    {report?.relationship?.name || "-"}

                                                </TableCell>
                                                <TableCell sx={{ color: '#367BE0', textAlign: 'center' }}>
                                                    <Link onClick={() => handleView(`/home/total-users/user-information/${userDetail}/family-member-information/face-scan-users/${report?._id}`)} state={{ type: "MedicalAidDetails" }} className="link2">
                                                        {report?.countOfUserScanMedicalDetails || 0}
                                                    </Link>
                                                </TableCell>
                                                <TableCell sx={{ color: '#4B5563' }}>
                                                    <Chip
                                                        label={report.faceVerify ? 'Verified' : 'Not Verified'}
                                                        sx={{
                                                            backgroundColor:
                                                                report.faceVerify ? '#DCFCE7' : '#FEE2E2',
                                                            '& .MuiChip-label': {
                                                                textTransform: 'capitalize',
                                                                color: report.faceVerify ? '#166534' : '#EF4444',
                                                            }
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ color: '#4B5563' }}>
                                                    <Stack direction="row" alignItems="center" spacing={1}>
                                                            <Box
                                                                component="img"
                                                                src={report?.faceVerify ? report.verificationSelfieImage : report?.selfieImage || nouser}
                                                                alt={`Family Member`}
                                                                sx={{
                                                                    width: "50px",
                                                                    height: "52px",
                                                                    objectFit: 'cover',
                                                                    borderRadius: '6px',
                                                                    cursor:'pointer',
                                                                    border: '1px solid #E5E7EB'
                                                                }}
                                                            />
                                                    </Stack>
                                                </TableCell>
                                                <TableCell >
                                                    <Box align="center">
                                                        <Tooltip title="View" arrow placement="top">
                                                            <IconButton onClick={() => handleView(`/home/total-users/user-information/${userDetail}/family-member-information/${report._id}`)}>
                                                                <img src={ViewBtn} alt="flagged button" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Delete" arrow placement="top">
                                                            <IconButton onClick={() => setconfirmation(report?._id)}>
                                                                <img src={delBtn} alt="delete button" />
                                                            </IconButton>
                                                        </Tooltip>

                                                        {confirmation === report?._id && (
                                                            <DeleteConfirm id={report?._id} trip={"familymember"} setconfirmation={setconfirmation} />
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

                    {!UserList.isFetching && UserList.data?.data.user.length > 0 &&
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

export default FamilyMembers;
