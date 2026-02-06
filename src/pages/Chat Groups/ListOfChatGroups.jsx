import { Box, Button, Grid, IconButton, InputAdornment, MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, TextField, Tooltip, Typography } from "@mui/material";
import CustomFilter from "../../common/Custom/CustomFilter";
import CustomDateRangePicker from "../../common/Custom/CustomDateRangePicker";
import plus from '../../assets/images/whiteplus.svg'

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import search from '../../assets/images/search.svg';
import calender from '../../assets/images/calender.svg';
import Loader from "../../common/Loader";
import ViewOut from '../../assets/images/view_out.svg'
import ViewBtn from '../../assets/images/ViewBtn.svg'
import { startOfYear } from "date-fns";
import arrowup from '../../assets/images/arrowup.svg';
import arrowdown from '../../assets/images/arrowdown.svg';
import arrownuteral from '../../assets/images/arrownuteral.svg';

// import { usePatchArchivedchatGroup } from "../../API Calls/API";
import Listtrip from '../../assets/images/Listtrip.svg'
import delBtn from '../../assets/images/delBtn.svg'
import { DeleteConfirm } from "../../common/ConfirmationPOPup";

const ListOfChatGroups = () => {

    const nav = useNavigate();

    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [confirmation, setconfirmation] = useState("");
    const [filter, setfilter] = useState("");
    const [sortBy, setSortBy] = useState("group_name");
    const [sortOrder, setSortOrder] = useState("asc");
    const [range, setRange] = useState([
        {
            startDate: startOfYear(new Date()),
            endDate: new Date(),
            key: 'selection'
        }
    ]);


    const changeSortOrder = (e) => {
        const field = e.target.id;
        if (field !== sortBy) {
            setSortBy(field);
            setSortOrder("asc");
        } else {
            setSortOrder(p => p === 'asc' ? 'desc' : 'asc')
        }
    }

    // const chatgroupData = useGetChatGroupList(
    //     "missingVehicle",
    //     currentPage,
    //     rowsPerPage,
    //     filter,
    //     range[0].startDate,
    //     range[0].endDate,
    //     false,
    //     "", "", "", "",
    //     sortBy,
    //     sortOrder
    // );

    const chatGroup = chatgroupData?.data?.data;

    console.log(chatGroup?.total, chatGroup)

    const totalPages = Math.ceil(chatGroup?.total / rowsPerPage);

    // const achivechatGroup = usePatchArchivedchatGroup(
    //     () => {
    //         toast.success("Person archived successfully!")
    //         chatgroupData.refetch()
    //     },
    //     () => toast.error("Failed to archive person.")
    // );

    return (
        <Box p={2}>
            <Paper elevation={3} sx={{ backgroundColor: "rgb(253, 253, 253)", padding: 2, borderRadius: '10px' }}>
                <Grid container justifyContent="space-between" alignItems="center" mb={2}>
                    <Grid size={{ xs: 12, lg: 3 }} sx={{ display: 'flex', flexDirection: 'row', gap: 2, mb: { xs: 1, md: 0 } }}>
                        <Typography variant="h6" fontWeight={590}>Chat Groups</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, lg: 9 }} sx={{ display: 'flex', justifyContent: 'flex-end', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>

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
                            <Button
                                onClick={() => nav('/home/chat-groups/add-chat-group')}
                                variant="contained"
                                sx={{ height: '40px', fontSize: '0.8rem', backgroundColor: '#367BE0', width: '180px', borderRadius: '8px' }}
                                startIcon={<img src={plus} alt="plus icon" />}
                            >
                                Create New Group
                            </Button>
                            <Button
                                onClick={() => nav('/home/chat-groups/view-archeived-chats')}
                                variant="outlined"
                                sx={{ height: '40px', width: '160px', fontSize: '0.8rem', borderRadius: '8px', border: '1px solid var(--Blue)' }}
                                startIcon={<img src={ViewOut} alt="View" />}
                            >
                                View Archeived
                            </Button>
                        </Box>

                    </Grid>
                </Grid>

                <Box sx={{ px: { xs: 0, md: 2 }, pt: { xs: 0, md: 3 }, backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
                    <TableContainer>
                        <Table sx={{ '& .MuiTableCell-root': { fontSize: '15px', } }}>

                            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableRow>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                        <TableSortLabel
                                            id="group_name"
                                            active={sortBy === 'group_name'}
                                            direction={sortOrder}
                                            onClick={changeSortOrder}
                                            IconComponent={() => <img src={sortBy === 'group_name' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                        >
                                            Group Name
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                        <TableSortLabel
                                            id="no_of_user"
                                            active={sortBy === 'no_of_user'}
                                            direction={sortOrder}
                                            onClick={changeSortOrder}
                                            IconComponent={() => <img src={sortBy === 'no_of_user' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                        >
                                            No. of Users
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                        <TableSortLabel
                                            id="messages_today"
                                            active={sortBy === 'messages_today'}
                                            direction={sortOrder}
                                            onClick={changeSortOrder}
                                            IconComponent={() => <img src={sortBy === 'messages_today' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                        >
                                            Messages Today
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', textAlign: 'center' }}>
                                        <TableSortLabel
                                            id="resports_flagged"
                                            active={sortBy === 'resports_flagged'}
                                            direction={sortOrder}
                                            onClick={changeSortOrder}
                                            IconComponent={() => <img src={sortBy === 'resports_flagged' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                        >
                                            Reports Flagged
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell align="center" sx={{ backgroundColor: '#F9FAFB', borderTopRightRadius: '10px', color: '#4B5563' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {chatgroupData.isFetching ?
                                    <TableRow>
                                        <TableCell sx={{ color: '#4B5563', borderBottom: 'none' }} colSpan={6} align="center">
                                            <Loader />
                                        </TableCell>
                                    </TableRow>
                                    : (chatGroup?.data.length > 0 ?
                                        chatGroup?.data.map((chat) => (
                                            <TableRow key={chat._id}>
                                                <TableCell sx={{ color: '#4B5563' }}>{chat?.group_name || "-"}</TableCell>
                                                <TableCell sx={{ color: '#4B5563' }}>{chat?.no_of_user || "-"}</TableCell>
                                                <TableCell sx={{ color: '#4B5563' }}>{chat?.messages_today || "-"}</TableCell>
                                                <TableCell sx={{ color: '#4B5563', textAlign: 'center' }}>
                                                    <Typography
                                                        sx={{ color: chat?.resports_flagged ? '#DC2626' : '#4B5563', bgcolor: chat?.resports_flagged ? "#FEE2E2" : "#F3F4F6", width: "fit-content", marginX: "auto", borderRadius: "50%", padding: "0.5rem 1rem" }}
                                                    >
                                                        {chat.resports_flagged}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell >
                                                    <Box align="center" sx={{ display: 'flex', flexDirection: 'row', width: "100%", justifyContent: "center" }}>
                                                        <Tooltip title="View" arrow placement="top">
                                                            <IconButton onClick={() => nav(`/home/chat-groups/chat-group/${chat._id}`)}>
                                                                <img src={ViewBtn} alt="view button" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Archive" arrow placement="top">
                                                            <IconButton
                                                            // onClick={() => {
                                                            //     achivechatGroup.mutate({
                                                            //         id: chat?._id,
                                                            //         data: { isArchived: true }
                                                            //     });
                                                            // }}
                                                            >
                                                                <img src={Listtrip} alt="view button" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Delete" arrow placement="top">
                                                            <IconButton onClick={() => setconfirmation(chat?._id)}>
                                                                <img src={delBtn} alt="Delete" />
                                                            </IconButton>
                                                        </Tooltip>

                                                        {confirmation === chat?._id && (
                                                            <DeleteConfirm
                                                                id={chat?._id}
                                                                setconfirmation={setconfirmation}
                                                                trip="missingVehicle"
                                                            />
                                                        )}
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

                    {!chatgroupData.isFetching && chatGroup?.data.length > 0 && <Grid container sx={{ px: { xs: 0, sm: 3 } }} justifyContent="space-between" alignItems="center" mt={2}>
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
            </Paper >
        </Box >
    )
}

export default ListOfChatGroups


const chatgroupData = {
    isFetching: false,
    data: {
        data: {
            data: [
                {
                    _id: 1,
                    group_name: "Bryanston Surburb Chat",
                    no_of_user: 342,
                    messages_today: 156,
                    resports_flagged: 3
                },
                {
                    _id: 2,
                    group_name: "Sandton City Chat",
                    no_of_user: 342,
                    messages_today: 156,
                    resports_flagged: 0
                },
                {
                    _id: 3,
                    group_name: "Bryanston Surburb Chat",
                    no_of_user: 342,
                    messages_today: 156,
                    resports_flagged: 4
                },
                {
                    _id: 4,
                    group_name: "Sandton City Chat",
                    no_of_user: 342,
                    messages_today: 156,
                    resports_flagged: 0
                },
                {
                    _id: 5,
                    group_name: "Bryanston Surburb Chat",
                    no_of_user: 342,
                    messages_today: 156,
                    resports_flagged: 1
                },
                {
                    _id: 6,
                    group_name: "Sandton City Chat",
                    no_of_user: 342,
                    messages_today: 156,
                    resports_flagged: 0
                },
            ],
            total: 6
        }
    }
}