import { useState } from "react"

import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import { Avatar, Box, FormControl, Grid, IconButton, InputAdornment, Link, MenuItem, Paper, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, TextField, Tooltip, Typography } from "@mui/material"

import Loader from "../../common/Loader"

import icon1 from "../../assets/images/CG_1.svg"
import icon2 from "../../assets/images/CG_2.svg"
import icon3 from "../../assets/images/CG_3.svg"
import icon4 from "../../assets/images/CG_4.svg"
import search from "../../assets/images/search.svg"
import ViewBtn from "../../assets/images/ViewBtn.svg"
import delBtn from "../../assets/images/delBtn.svg"
import flaggedBtn from "../../assets/images/flaggedBtn.svg"
import warningBtn from "../../assets/images/warningBtn.svg"
import profile from "../../assets/images/driver-profile.png"
import arrowup from "../../assets/images/arrowup.svg"
import arrowdown from "../../assets/images/arrowdown.svg"
import arrownuteral from "../../assets/images/arrownuteral.svg"
import { formatSmartDate, timeAgo } from "../../utils/DateFormatter";
import { format } from "date-fns";

const ArchievedChats = () => {

    const [userSearch, setUserSearch] = useState("");
    const [userCategory, setUserCategory] = useState("all")
    const [messageSearch, setMessageSearch] = useState("");
    const [messageCategory, setMessageCategory] = useState("all")

    const [userPage, setUserPage] = useState(1);
    const [userLimit, setUserLimit] = useState(10);
    const [messagePage, setMessagePage] = useState(1);
    const [messageLimit, setMessageLimit] = useState(10);

    const [sortUserBy, setSortUserBy] = useState("createdAt");
    const [sortUserOrder, setSortUserOrder] = useState("desc");
    const [sortMessageBy, setSortMessageBy] = useState("createdAt");
    const [sortMessageOrder, setSortMessageOrder] = useState("desc");


    const users = userData?.data?.data;
    const messages = messageData?.data?.data;


    const totalusers = users?.total
    const totalRecentPages = Math.ceil(totalusers / userLimit)

    const totalmessages = users?.total
    const totalRecentPages2 = Math.ceil(totalmessages / userLimit)


    const changeSortUserOrder = (e) => {
        const field = e.target.id;
        if (field !== sortUserBy) {
            setSortUserBy(field);
            setSortUserOrder("asc");
        } else {
            setSortUserOrder(p => p === 'asc' ? 'desc' : 'asc')
        }
    }

    const changeSortUserOrder2 = (e) => {
        const field = e.target.id;
        if (field !== sortMessageBy) {
            setSortMessageBy(field);
            setSortMessageOrder("asc");
        } else {
            setSortMessageOrder(p => p === 'asc' ? 'desc' : 'asc')
        }
    }

    const getFlagColor = (status) => {
        switch (status) {
            case "active":
                return { bg: "#DCFCE7", text: "#166534" }

            case "warned":
                return { bg: "#FEF9C3", text: "#CA8A04" }

            case "blocked":
                return { bg: "#FEE2E2", text: "#DC2626" }

            case "inactive":
                return { bg: "#F3F4F6", text: "#4B5563" }

            case "yes":
                return { bg: "#FEE2E2", text: "#DC2626" }

            case "no":
                return { bg: "#F3F4F6", text: "#4B5563" }

            default:
                return { bg: "#F3F4F6", text: "#4B5563" }
        }
    }

    return (
        <Box>
            <Grid container spacing={3} p={2}>
                {cards.map(item =>
                    <Grid key={item._id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: "center",
                                flexDirection: 'row',
                                gap: 2,
                                backgroundColor: '#FFFFFF',
                                borderRadius: '8px',
                                p: 2,
                                boxShadow: '6px 6px 54px 0px #0000000D'
                            }}
                        >
                            <Box><img src={item.img} alt="ReportIcon" /></Box>
                            <Box>
                                <Typography variant="body2">{item.title}</Typography>
                                <Typography variant="h5" fontSize={"1.25rem"} fontWeight={700}>{item.count}</Typography>
                            </Box>
                        </Box>
                    </Grid>
                )}

                <Grid size={{ xs: 12 }}>
                    <Paper elevation={1} sx={{ backgroundColor: "rgb(253, 253, 253)", mb: 2, padding: 2, borderRadius: '10px' }}>
                        <Grid container justifyContent="space-between" alignItems="center" mb={2}>
                            <Grid size={{ xs: 12, lg: 4 }} sx={{ display: 'flex', flexDirection: 'row', gap: 2, mb: { xs: 1, md: 0 } }}>
                                <Typography variant="h6" fontWeight={590}>Anonymous User List</Typography>
                            </Grid>
                            <Grid size={{ xs: 12, lg: 8 }} sx={{ display: 'flex', justifyContent: 'flex-end', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mt: { xs: 2, lg: 0 } }}>
                                <TextField
                                    variant="outlined"
                                    placeholder="Search"
                                    value={userSearch}
                                    onChange={(e) => setUserSearch(e.target.value)}
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
                                    <FormControl size="small" sx={{ maxWidth: 200 }}>
                                        <Select
                                            value={userCategory}
                                            onChange={(e) => setUserCategory(e.target.value)}
                                        >
                                            <MenuItem value="all">All Users</MenuItem>
                                            {categories.map((type) => (
                                                <MenuItem key={type._id} value={type._id}>
                                                    {type.title}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>

                            </Grid>
                        </Grid>
                        <Box sx={{ backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
                            <TableContainer>
                                <Table sx={{ '& .MuiTableCell-root': { fontSize: '15px' } }}>

                                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                        <TableRow>
                                            <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', borderTopLeftRadius: '10px' }}>
                                                <TableSortLabel
                                                    id="user_code"
                                                    active={sortUserBy === 'user_code'}
                                                    direction={sortUserOrder}
                                                    onClick={changeSortUserOrder}
                                                    IconComponent={() => <img src={sortUserBy === 'user_code' ? sortUserOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                >
                                                    User Code
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                                <TableSortLabel
                                                    id="first_name"
                                                    active={sortUserBy === 'first_name'}
                                                    direction={sortUserOrder}
                                                    onClick={changeSortUserOrder}
                                                    IconComponent={() => <img src={sortUserBy === 'first_name' ? sortUserOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                >
                                                    Real Name (Admin Only)
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                                <TableSortLabel
                                                    id="join_time"
                                                    active={sortUserBy === 'join_time'}
                                                    direction={sortUserOrder}
                                                    onClick={changeSortUserOrder}
                                                    IconComponent={() => <img src={sortUserBy === 'join_time' ? sortUserOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                >
                                                    Join Time
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                                <TableSortLabel
                                                    id="last_active"
                                                    active={sortUserBy === 'last_active'}
                                                    direction={sortUserOrder}
                                                    onClick={changeSortUserOrder}
                                                    IconComponent={() => <img src={sortUserBy === 'last_active' ? sortUserOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                >
                                                    Last Active
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                                <TableSortLabel
                                                    id="messages_count"
                                                    active={sortUserBy === 'messages_count'}
                                                    direction={sortUserOrder}
                                                    onClick={changeSortUserOrder}
                                                    IconComponent={() => <img src={sortUserBy === 'messages_count' ? sortUserOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                >
                                                    Message Count
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                                <TableSortLabel
                                                    id="status"
                                                    active={sortUserBy === 'status'}
                                                    direction={sortUserOrder}
                                                    onClick={changeSortUserOrder}
                                                    IconComponent={() => <img src={sortUserBy === 'status' ? sortUserOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                >
                                                    Status
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell align="center" sx={{ backgroundColor: '#F9FAFB', borderTopRightRadius: '10px', color: '#4B5563' }}>Action</TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {userData.isFetching ?
                                            <TableRow>
                                                <TableCell sx={{ color: '#4B5563', borderBottom: 'none' }} colSpan={7} align="center">
                                                    <Loader />
                                                </TableCell>
                                            </TableRow>
                                            : (users?.data?.length > 0 ?
                                                users?.data?.map((row) => (
                                                    <TableRow key={row?._id}>
                                                        <TableCell sx={{ color: '#4B5563' }}>
                                                            <Link to={"#"} className="link">
                                                                {row?.user?.user_code}
                                                            </Link>
                                                        </TableCell>

                                                        <TableCell sx={{ color: '#4B5563' }}>
                                                            <Stack direction="row" alignItems="center" gap={1}>
                                                                <Avatar src={row?.user?.selfieImage} alt="User" />
                                                                {row?.user?.first_name || ''} {row?.user?.last_name || ''}
                                                            </Stack>
                                                        </TableCell>

                                                        <TableCell sx={{ color: '#4B5563' }}>
                                                            {formatSmartDate(row?.join_time)}
                                                        </TableCell>

                                                        <TableCell sx={{ color: '#4B5563' }}>
                                                            {timeAgo(row?.last_active)}
                                                        </TableCell>

                                                        <TableCell sx={{ color: '#4B5563' }}>
                                                            {row?.messages_count}
                                                        </TableCell>

                                                        <TableCell sx={{ color: '#4B5563' }}>
                                                            <Typography
                                                                sx={{
                                                                    marginX: "auto",
                                                                    width: "fit-content",
                                                                    borderRadius: "6rem",
                                                                    padding: "0.4rem 0.8rem",
                                                                    textTransform: "capitalize",
                                                                    bgcolor: getFlagColor(row?.status)?.bg,
                                                                    color: getFlagColor(row?.status)?.text
                                                                }}
                                                            >
                                                                {row?.status}
                                                            </Typography>
                                                        </TableCell>

                                                        <TableCell>
                                                            <Box align="center" sx={{ display: 'flex', flexDirection: 'row' }}>
                                                                <Tooltip title="View" arrow placement="top">
                                                                    <IconButton>
                                                                        <img src={ViewBtn} alt="view button" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="" arrow placement="top">
                                                                    <IconButton>
                                                                        <img src={warningBtn} alt="view button" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="" arrow placement="top">
                                                                    <IconButton>
                                                                        <img src={flaggedBtn} alt="view button" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </Box>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                                :
                                                <TableRow>
                                                    <TableCell sx={{ color: '#4B5563', borderBottom: 'none' }} colSpan={7} align="center">
                                                        <Typography align="center" color="text.secondary" sx={{ mt: 2 }}>
                                                            No data found
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>)
                                        }
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            {users?.data?.length > 0 && !userData.isFetching && <Grid container sx={{ px: { xs: 0, sm: 1 } }} justifyContent="space-between" alignItems="center" mt={2}>
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
                                            value={userLimit}
                                            onChange={(e) => {
                                                setUserLimit(Number(e.target.value));
                                                setUserPage(1);
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
                                            {userPage} / {totalRecentPages}
                                        </Typography>
                                        <IconButton
                                            disabled={userPage === 1}
                                            onClick={() => setUserPage((prev) => prev - 1)}
                                        >
                                            <NavigateBeforeIcon fontSize="small" sx={{
                                                color: userPage === 1 ? '#BDBDBD !important' : '#1976d2 !important'
                                            }} />
                                        </IconButton>
                                        <IconButton
                                            disabled={userPage === totalRecentPages}
                                            onClick={() => setUserPage((prev) => prev + 1)}
                                        >
                                            <NavigateNextIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </Grid>
                            </Grid>}
                        </Box>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <Paper elevation={1} sx={{ backgroundColor: "rgb(253, 253, 253)", mb: 2, padding: 2, borderRadius: '10px' }}>
                        <Grid container justifyContent="space-between" alignItems="center" mb={2}>
                            <Grid size={{ xs: 12, lg: 4 }} sx={{ display: 'flex', flexDirection: 'row', gap: 2, mb: { xs: 1, md: 0 } }}>
                                <Typography variant="h6" fontWeight={590}>Message Log</Typography>
                            </Grid>
                            <Grid size={{ xs: 12, lg: 8 }} sx={{ display: 'flex', justifyContent: 'flex-end', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mt: { xs: 2, lg: 0 } }}>
                                <TextField
                                    variant="outlined"
                                    placeholder="Search"
                                    value={messageSearch}
                                    onChange={(e) => setMessageSearch(e.target.value)}
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
                                    <FormControl size="small" sx={{ maxWidth: 200 }}>
                                        <Select
                                            value={messageCategory}
                                            onChange={(e) => setMessageCategory(e.target.value)}
                                        >
                                            <MenuItem value="all">All Messages</MenuItem>
                                            {categories.map((type) => (
                                                <MenuItem key={type._id} value={type._id}>
                                                    {type.title}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>

                            </Grid>
                        </Grid>
                        <Box sx={{ backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
                            <TableContainer>
                                <Table sx={{ '& .MuiTableCell-root': { fontSize: '15px' } }}>

                                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                        <TableRow>
                                            <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                                <TableSortLabel
                                                    id="message"
                                                    active={sortMessageBy === 'message'}
                                                    direction={sortMessageOrder}
                                                    onClick={changeSortUserOrder2}
                                                    IconComponent={() => <img src={sortMessageBy === 'message' ? sortMessageOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                >
                                                    Message
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', borderTopLeftRadius: '10px' }}>
                                                <TableSortLabel
                                                    id="user_code"
                                                    active={sortMessageBy === 'user_code'}
                                                    direction={sortMessageOrder}
                                                    onClick={changeSortUserOrder2}
                                                    IconComponent={() => <img src={sortMessageBy === 'user_code' ? sortMessageOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                >
                                                    User Code
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                                <TableSortLabel
                                                    id="first_name"
                                                    active={sortMessageBy === 'first_name'}
                                                    direction={sortMessageOrder}
                                                    onClick={changeSortUserOrder2}
                                                    IconComponent={() => <img src={sortMessageBy === 'first_name' ? sortMessageOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                >
                                                    Real Name (Admin Only)
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                                <TableSortLabel
                                                    id="timestamp"
                                                    active={sortMessageBy === 'timestamp'}
                                                    direction={sortMessageOrder}
                                                    onClick={changeSortUserOrder2}
                                                    IconComponent={() => <img src={sortMessageBy === 'timestamp' ? sortMessageOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                >
                                                    Timestamp
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                                <TableSortLabel
                                                    id="flagged"
                                                    active={sortMessageBy === 'flagged'}
                                                    direction={sortMessageOrder}
                                                    onClick={changeSortUserOrder2}
                                                    IconComponent={() => <img src={sortMessageBy === 'flagged' ? sortMessageOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                                >
                                                    Flagged
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell align="center" sx={{ backgroundColor: '#F9FAFB', borderTopRightRadius: '10px', color: '#4B5563' }}>Action</TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {messageData.isFetching ?
                                            <TableRow>
                                                <TableCell sx={{ color: '#4B5563', borderBottom: 'none' }} colSpan={6} align="center">
                                                    <Loader />
                                                </TableCell>
                                            </TableRow>
                                            : (messages?.data?.length > 0 ?
                                                messages?.data?.map((row) => (
                                                    <TableRow key={row?._id}>
                                                        <TableCell sx={{ color: '#4B5563' }}>
                                                            {row?.message}
                                                        </TableCell>

                                                        <TableCell sx={{ color: '#4B5563' }}>
                                                            {row?.user?.user_code}
                                                        </TableCell>

                                                        <TableCell sx={{ color: '#4B5563' }}>
                                                            <Stack direction="row" alignItems="center" gap={1}>
                                                                <Avatar src={row?.user?.selfieImage} alt="User" />
                                                                {row?.user?.first_name || ''} {row?.user?.last_name || ''}
                                                            </Stack>
                                                        </TableCell>

                                                        <TableCell sx={{ color: '#4B5563' }}>
                                                            {format(row?.timestamp, "HH:mm aa")}
                                                        </TableCell>

                                                        <TableCell sx={{ color: '#4B5563' }}>
                                                            <Typography
                                                                sx={{
                                                                    marginX: "auto",
                                                                    width: "fit-content",
                                                                    borderRadius: "6rem",
                                                                    padding: "0.4rem 0.8rem",
                                                                    textTransform: "capitalize",
                                                                    bgcolor: getFlagColor(row?.flagged)?.bg,
                                                                    color: getFlagColor(row?.flagged)?.text
                                                                }}
                                                            >
                                                                {row?.flagged}
                                                            </Typography>
                                                        </TableCell>

                                                        <TableCell>
                                                            <Box align="center" sx={{ display: 'flex', flexDirection: 'row' }}>
                                                                <Tooltip title="View" arrow placement="top">
                                                                    <IconButton>
                                                                        <img src={ViewBtn} alt="view button" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="Delete" arrow placement="top">
                                                                    <IconButton>
                                                                        <img src={delBtn} alt="Delete button" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </Box>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                                :
                                                <TableRow>
                                                    <TableCell sx={{ color: '#4B5563', borderBottom: 'none' }} colSpan={6} align="center">
                                                        <Typography align="center" color="text.secondary" sx={{ mt: 2 }}>
                                                            No data found
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>)
                                        }
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            {messages?.data?.length > 0 && !messageData.isFetching && <Grid container sx={{ px: { xs: 0, sm: 1 } }} justifyContent="space-between" alignItems="center" mt={2}>
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
                                            value={messageLimit}
                                            onChange={(e) => {
                                                setMessageLimit(Number(e.target.value));
                                                setMessagePage(1);
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
                                            {messagePage} / {totalRecentPages2}
                                        </Typography>
                                        <IconButton
                                            disabled={messagePage === 1}
                                            onClick={() => setMessagePage((prev) => prev - 1)}
                                        >
                                            <NavigateBeforeIcon fontSize="small" sx={{
                                                color: messagePage === 1 ? '#BDBDBD !important' : '#1976d2 !important'
                                            }} />
                                        </IconButton>
                                        <IconButton
                                            disabled={messagePage === totalRecentPages2}
                                            onClick={() => setMessagePage((prev) => prev + 1)}
                                        >
                                            <NavigateNextIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </Grid>
                            </Grid>}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    )
}

export default ArchievedChats

const userData = {
    isFetching: false,
    data: {
        data: {
            data: [
                {
                    _id: 1,
                    user: {
                        user_code: "User#4532",
                        selfieImage: profile,
                        first_name: "John",
                        last_name: "smith",
                    },
                    join_time: "2026-02-04T08:12:00",
                    last_active: "2025-12-31T23:59:59",
                    messages_count: 24,
                    status: "active"
                },
                {
                    _id: 2,
                    user: {
                        user_code: "User#4532",
                        selfieImage: profile,
                        first_name: "John",
                        last_name: "smith",
                    },
                    join_time: "2026-02-04T08:12:00",
                    last_active: "2025-12-31T23:59:59",
                    messages_count: 24,
                    status: "warned"
                },
                {
                    _id: 3,
                    user: {
                        user_code: "User#4532",
                        selfieImage: profile,
                        first_name: "John",
                        last_name: "smith",
                    },
                    join_time: "2026-02-04T08:12:00",
                    last_active: "2025-12-31T23:59:59",
                    messages_count: 24,
                    status: "blocked"
                },
                {
                    _id: 4,
                    user: {
                        user_code: "User#4532",
                        selfieImage: profile,
                        first_name: "John",
                        last_name: "smith",
                    },
                    join_time: "2026-02-04T08:12:00",
                    last_active: "2025-12-31T23:59:59",
                    messages_count: 24,
                    status: "inactive"
                },
                {
                    _id: 5,
                    user: {
                        user_code: "User#4532",
                        selfieImage: profile,
                        first_name: "John",
                        last_name: "smith",
                    },
                    join_time: "2026-02-04T08:12:00",
                    last_active: "2025-12-31T23:59:59",
                    messages_count: 24,
                    status: "active"
                },
            ],
            total: 5
        }
    }
}

const messageData = {
    isFetching: false,
    data: {
        data: {
            data: [
                {
                    _id: 1,
                    user: {
                        user_code: "User#4532",
                        selfieImage: profile,
                        first_name: "John",
                        last_name: "smith",
                    },
                    message: "Suspicious activity near Main Road and 3rd Avenue. Two men looking into parked cars.",
                    timestamp: "2026-02-04T08:12:00",
                    flagged: "yes"
                },
                {
                    _id: 2,
                    user: {
                        user_code: "User#4532",
                        selfieImage: profile,
                        first_name: "John",
                        last_name: "smith",
                    },
                    message: "Suspicious activity near Main Road and 3rd Avenue. Two men looking into parked cars.",
                    timestamp: "2026-02-04T08:12:00",
                    flagged: "no"
                },
                {
                    _id: 3,
                    user: {
                        user_code: "User#4532",
                        selfieImage: profile,
                        first_name: "John",
                        last_name: "smith",
                    },
                    message: "Suspicious activity near Main Road and 3rd Avenue. Two men looking into parked cars.",
                    timestamp: "2026-02-04T08:12:00",
                    flagged: "yes"
                },
                {
                    _id: 4,
                    user: {
                        user_code: "User#4532",
                        selfieImage: profile,
                        first_name: "John",
                        last_name: "smith",
                    },
                    message: "Suspicious activity near Main Road and 3rd Avenue. Two men looking into parked cars.",
                    timestamp: "2026-02-04T08:12:00",
                    flagged: "no"
                },
                {
                    _id: 5,
                    user: {
                        user_code: "User#4532",
                        selfieImage: profile,
                        first_name: "John",
                        last_name: "smith",
                    },
                    message: "Suspicious activity near Main Road and 3rd Avenue. Two men looking into parked cars.",
                    timestamp: "2026-02-04T08:12:00",
                    flagged: "yes"
                },
            ],
            total: 5
        }
    }
}

const cards = [
    {
        _id: 1,
        img: icon1,
        title: "Total Users",
        count: 342
    },
    {
        _id: 2,
        img: icon2,
        title: "Active Now",
        count: 87
    },
    {
        _id: 3,
        img: icon3,
        title: "Messages Today",
        count: 156
    },
    {
        _id: 4,
        img: icon4,
        title: "Flagged Reports",
        count: 3
    },
]

const categories = [
    {
        _id: 1,
        title: "Category 1"
    },
    {
        _id: 2,
        title: "Category 2"
    },
    {
        _id: 3,
        title: "Category 3"
    },
]