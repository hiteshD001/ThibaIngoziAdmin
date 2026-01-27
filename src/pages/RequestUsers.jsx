import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import useDebounce from "../hooks/useDebounce";
import {
    Box, Typography, TextField, Button, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, Grid, InputAdornment, Stack, Select, MenuItem,
    Tooltip,
    TableSortLabel,
    Chip,
    FormControl,
    InputLabel,
    Skeleton,
} from "@mui/material";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import search from '../assets/images/search.svg';
import nouser from "../assets/images/NoUser.png";
import { useGetLocationByLocationId, useGetLocationId } from "../API Calls/API";
import Loader from "../common/Loader";
import { startOfYear } from "date-fns";
import arrowup from '../assets/images/arrowup.svg';
import arrowdown from '../assets/images/arrowdown.svg';
import arrownuteral from '../assets/images/arrownuteral.svg';
import moment from 'moment';

const RequestUsers = () => {
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [filter, setFilter] = useState("");
    const debouncedFilter = useDebounce(filter, 500);
    const [sortBy, setSortBy] = useState("first_name");
    const [sortOrder, setSortOrder] = useState("asc");
    const params = useParams();
    const locationPath = useLocation();
    const locationId = params.id;
    const nav = useNavigate();

    // Get location data with pagination and search
    const locationData = useGetLocationId(locationId, page, rowsPerPage, debouncedFilter);
    const location = locationData.data?.data;

    console.log("Full API response:", locationData);
    console.log("Location data:", location);
    console.log("reqReachUsers:", location?.reqReachUsers);
    console.log("reqAcceptUsers:", location?.reqAcceptUsers);

    // Determine which user list to show based on route
    const isReachedUsers = locationPath.pathname.includes('request-reached-users');
    
    // Access user list and pagination data from response
    const userList = isReachedUsers ? location?.reqReachUsers : location?.reqAcceptUsers;
    const paginationData = isReachedUsers ? location?.reqReachUsersPagination : location?.reqAcceptUsersPagination;
    const totalCount = paginationData?.totalUsers || 0;
    const totalPages = paginationData?.totalPages || 0;
    const currentPageFromServer = paginationData?.currentPage || 1;

    const changeSortOrder = (e) => {
        const field = e.target.id;
        if (field !== sortBy) {
            setSortBy(field);
            setSortOrder("asc");
        } else {
            setSortOrder(p => p === 'asc' ? 'desc' : 'asc')
        }
    };

    // Sort users (client-side sorting since API doesn't support sorting yet)
    const sortedUsers = userList ? [...userList].sort((a, b) => {
        let aValue = a[sortBy] || '';
        let bValue = b[sortBy] || '';
        
        if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
        }
        
        if (sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    }) : [];

    // Use server-side paginated data, but apply client-side sorting
    const displayUsers = sortedUsers;

    const handleRowsPerPageChange = (event) => {
        const newRowsPerPage = parseInt(event.target.value, 10);
        setRowsPerPage(newRowsPerPage);
        setPage(1); // Reset to first page when changing rows per page
    };

    const handleBackToHome = () => {
        nav('/home');
    };

    // Reset page when search filter changes
    useEffect(() => {
        setPage(1);
    }, [debouncedFilter]);

    if (locationData.isLoading) {
        return <Loader />;
    }

    const isLoadingData = locationData.isLoading || (locationData.isFetching && !locationData.data);

    return (
        <Box sx={{ px: { xs: 0, md: 2 }, pt: { xs: 0, md: 3 }, backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
            {/* Header */}
            <Grid container justifyContent="space-between" alignItems="center" mb={2}>
                <Grid>
                    <Typography variant="h6"  sx={{ mt: 0.5 }} fontWeight={590}>
                        Total Users : {totalCount} 
                    </Typography>
                </Grid>
            </Grid>

            {/* Search and Table */}
            <Paper elevation={1} sx={{ backgroundColor: "rgb(253, 253, 253)", mb: 2, padding: 2, borderRadius: '10px' }}>
                {/* Search Bar */}
                <Grid container justifyContent="space-between" alignItems="center" mb={2}>
                    <Grid size={{ xs: 12, lg: 3 }} sx={{ display: 'flex', flexDirection: 'row', gap: 2, mb: { xs: 1, md: 0 } }}>
                                                <Typography variant="h6" fontWeight={590}> {isReachedUsers ? 'Request Reached Users' : 'Request Accepted Users'}</Typography>
                                            </Grid>
                    <Grid size={{ xs: 12, md: 8 }}>
                        <TextField
                            variant="outlined"
                            placeholder="Search users..."
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
                    </Grid>
                </Grid>

                {/* Table */}
                <TableContainer>
                    <Table sx={{ '& .MuiTableCell-root': { fontSize: '15px' } }}>
                        <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableRow>
                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', borderTopLeftRadius: '10px' }}>
                                    <TableSortLabel
                                        id="first_name"
                                        active={sortBy === 'first_name'}
                                        direction={sortOrder}
                                        onClick={changeSortOrder}
                                        IconComponent={() => <img src={sortBy === 'first_name' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                    >
                                        User Name
                                    </TableSortLabel>
                                </TableCell>
                                
                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                    Contact
                                </TableCell>
                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                    <TableSortLabel
                                        id="email"
                                        active={sortBy === 'email'}
                                        direction={sortOrder}
                                        onClick={changeSortOrder}
                                        IconComponent={() => <img src={sortBy === 'email' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                    >
                                        Email
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
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoadingData ? (
                                // Loading skeleton
                                Array.from({ length: rowsPerPage }).map((_, index) => (
                                    <TableRow key={`skeleton-${index}`}>
                                        <TableCell sx={{ color: '#4B5563' }}>
                                            <Stack direction="row" alignItems="center" gap={1}>
                                                <Skeleton variant="circular" width={40} height={40} />
                                                <Box>
                                                    <Skeleton variant="text" width={120} height={20} />
                                                    <Skeleton variant="text" width={80} height={16} sx={{ mt: 0.5 }} />
                                                </Box>
                                            </Stack>
                                        </TableCell>
                                        <TableCell sx={{ color: '#4B5563' }}>
                                            <Skeleton variant="text" width={100} height={20} />
                                        </TableCell>
                                        <TableCell sx={{ color: '#4B5563' }}>
                                            <Skeleton variant="text" width={150} height={20} />
                                        </TableCell>
                                        <TableCell sx={{ color: '#4B5563' }}>
                                            <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: '12px' }} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : displayUsers.length > 0 ? (
                                displayUsers.map((user, index) => (
                                    <TableRow key={user._id || index}>
                                        <TableCell sx={{ color: '#4B5563' }}>
                                            <Stack direction="row" alignItems="center" gap={1}>
                                                <Avatar
                                                    src={user.profileImage || nouser}
                                                    sx={{ width: 40, height: 40 }}
                                                    alt="User"
                                                />
                                                <Box>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {user.first_name || '-'} {user.last_name || ''}
                                                    </Typography>
                                                   
                                                </Box>
                                            </Stack>
                                        </TableCell>
                                        
                                        <TableCell sx={{ color: '#4B5563' }}>
                                            <Typography variant="body2">
                                                {user.mobile_no || '-'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ color: '#4B5563' }}>
                                            <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                                                {user.email || '-'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ color: '#4B5563' }}>
                                            <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                                                 <Chip
                                                                        label={user.isEnroll ? "Active" : "Inactive"}
                                                                        sx={{
                                                                            backgroundColor: user.isEnroll ? '#DCFCE7' : '#E5565A1A',
                                                                            '& .MuiChip-label': {
                                                                                textTransform: 'capitalize',
                                                                                fontWeight: 500,
                                                                                color: user.isEnroll ? '#15803D' : '#E5565A',
                                                                            }
                                                                        }}
                                                                    />
                                            </Typography>
                                        </TableCell>
                                        
                                                                
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell sx={{ color: '#4B5563', borderBottom: 'none' }} colSpan={4} align="center">
                                        <Box sx={{ py: 4, textAlign: 'center' }}>
                                            <Avatar
                                                src={nouser}
                                                sx={{ width: 60, height: 60, mb: 2, mx: 'auto' }}
                                            />
                                            <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                                                No {isReachedUsers ? 'reached' : 'accepted'} users found
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {isReachedUsers 
                                                    ? 'No users were reached for this SOS request.'
                                                    : 'No users have accepted this SOS request.'
                                                }
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Pagination */}
            
                    <Grid container sx={{ px: { xs: 0, sm: 1 } }} justifyContent="space-between" alignItems="center" mt={2}>
                        <Grid>
                            <Box display="flex" alignItems="center" gap={2}>
                                <Typography variant="body2">
                                    Rows per page:
                                </Typography>
                                <FormControl size="small" sx={{ minWidth: 80 }}>
                                    <Select
                                        value={rowsPerPage}
                                        onChange={handleRowsPerPageChange}
                                        sx={{
                                            height: '32px',
                                            fontSize: '14px',
                                        }}
                                    >
                                        <MenuItem value={5}>5</MenuItem>
                                        <MenuItem value={10}>10</MenuItem>
                                        <MenuItem value={20}>20</MenuItem>
                                        <MenuItem value={50}>50</MenuItem>
                                        <MenuItem value={100}>100</MenuItem>

                                    </Select>
                                </FormControl>
                            </Box>
                        </Grid>
                        <Grid>
                            <Box display="flex" alignItems="center" gap={{ xs: 1, sm: 2 }}>
                                <Typography variant="body2">
                                    {currentPageFromServer} / {totalPages}
                                </Typography>
                                <IconButton
                                    disabled={!paginationData?.hasPrev}
                                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                                >
                                    <NavigateBeforeIcon fontSize="small" sx={{
                                        color: !paginationData?.hasPrev ? '#BDBDBD !important' : '#1976d2 !important'
                                    }} />
                                </IconButton>
                                <IconButton
                                    disabled={!paginationData?.hasNext}
                                    onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                                >
                                    <NavigateNextIcon fontSize="small" sx={{
                                        color: !paginationData?.hasNext ? '#BDBDBD !important' : '#1976d2 !important'
                                    }} />
                                </IconButton>
                            </Box>
                        </Grid>
                    </Grid>
                
            </Paper>
        </Box>
    );
};

export default RequestUsers;