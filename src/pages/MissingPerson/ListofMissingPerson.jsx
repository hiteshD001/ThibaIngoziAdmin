import { useEffect, useState } from "react";
import { useNavigate, Link, useSearchParams, useParams } from "react-router-dom";
import {
    Box, Typography, TextField, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, Grid, InputAdornment, Stack, Select, MenuItem,
    Button,
    Tooltip,
    Chip,
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
import {getImageLink,formatDateTime } from '../../common/commonFn';
import { saveScrollPosition, restoreScrollPosition } from "../../common/ScrollPosition";
import SingleImagePreview from "../../common/SingleImagePreview";

const ListofMissingPerson = () => {
    const [popup, setpopup] = useState(false);
    const nav = useNavigate();
    const params = useParams();
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
    const locationFilter = searchParams.get("locationFilter") || "";
    const rowsPerPage = Number(searchParams.get("rowsPerPage")) || 10;
    const [confirmation, setconfirmation] = useState("");

    // Sort 1
    const [sortBy, setSortBy] = useState("lastSeenLocation");
    const [sortOrder, setSortOrder] = useState("desc");

    const changeSortOrder = (e) => {
        const field = e.target.id;
        if (field !== sortBy) {
            setSortBy(field);
            setSortOrder("asc");
        } else {
            setSortOrder(p => p === 'asc' ? 'desc' : 'asc')
        }
    }

    const handleFilterData = (data) => {

        const params = Object.fromEntries(
            Object.entries(data).filter(
                ([_, value]) => value !== "" && value !== undefined && value !== null
            )
        );

        const filterText = new URLSearchParams(params).toString();
        updateParams({ locationFilter: filterText })
    };

    const MissingPersons = useGetMissingPersonList(
        "MissingPersonList",
        currentPage,
        rowsPerPage,
        filter,
        range[0].startDate,
        range[0].endDate,
        false,
        locationFilter,
        sortBy,
        sortOrder
    );

    const totalUsers = MissingPersons?.data?.data?.totaldata;
    const totalPages = Math.ceil(totalUsers / rowsPerPage);
    
    const achiveMissingPerson = usePatchArchivedMissingPerson(
        () => {
            toast.success("Missing Person archived successfully!")
            MissingPersons.refetch()
        },
        () => toast.error("Failed to archive person.")
    );

    let loginUser = useGetUser(localStorage.getItem("userID"));
    loginUser = loginUser?.data?.data?.user;

    const handleExport = async ({ startDate, endDate, exportFormat: fileFormat }) => {
        try {
            const { data } = await apiClient.get(`${import.meta.env.VITE_BASEURL}/missingPerson`, {params: {}});

            const allUsers = data?.data || [];
            if (!allUsers.length) {
                toast.warning("No Missing Persons data found.");
                return;
            }

            const exportData = allUsers.map(user => ({
                "SOS Id": (user?.sosNumber || ''),
                "Name": (user?.notification_details?.notification_data?.lostPerson?.first_name || "")+" "+(user?.notification_details?.notification_data?.lostPerson?.last_name || ''),
                "Last Seen Location": user.address || '',
                "Date": format(user.createdAt, "HH:mm:ss - dd/MM/yyyy") || '',
                "Request Reached": user.req_reach || '',
                "Request Accepted": user.req_accept || '',
                "Status": user.help_received === "help_received" ? 'Found' : 'Not Found',
                "Reported By": (user?.user_id?.first_name || '') + " "+ (user?.user_id?.last_name || ''),
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
                    head: [["SOS Id", "Name", "Last Seen Location", "Date", "Request Reached", "Request Accepted", "Status", "Reported By"]],
                    body: allUsers.map(user => [
                        (user?.sosNumber || ''),
                        (user?.notification_details?.notification_data?.lostPerson?.first_name || "")+" "+(user?.notification_details?.notification_data?.lostPerson?.last_name || ''),
                        user.address || '',
                        format(user.createdAt, "HH:mm:ss - dd/MM/yyyy") || '',
                        user.req_reach || '',
                        user.req_accept || '',
                        user.help_received === "help_received" ? 'Found' : 'Not Found',
                        (user?.user_id?.first_name || '') + " "+ (user?.user_id?.last_name || ''),
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

    const updateParams = (newParams) => {
        setSearchParams((prev) => {
            const prevParams = Object.fromEntries(prev.entries());

            return {
                ...prevParams,
                ...newParams,
            };
        });
    };

    const [previewImage, setPreviewImage] = useState({
        open: false,
        src: '',
        label: ''
    });
    const handleImageClick = (src, label) => {
        if (src) {
            setPreviewImage({
                open: true,
                src: src instanceof File ? URL.createObjectURL(src) : src,
                label: label
            });
        }
    };
    const handleClosePreview = () => {
        setPreviewImage(prev => ({ ...prev, open: false }));
    };

    const handleView = (url) => {
        saveScrollPosition("missingPersonListScroll");
        nav(url);
    };
    useEffect(() => {
        if (MissingPersons.data?.data?.totaldata) {
            restoreScrollPosition("missingPersonListScroll");
        }
    }, [MissingPersons.data?.data?.totaldata]);

    return (
        <>
            <SingleImagePreview
                show={previewImage.open}
                onClose={handleClosePreview}
                image={previewImage.src ? { src: previewImage.src, label: previewImage.label } : null}
            />
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
                            <CustomFilter onApply={handleFilterData} isSuburbVisible ={false} />
                            <CustomDateRangePicker
                                borderColor={'var(--light-gray)'}
                                value={range}
                                onChange={(nextRange) => {
                                    setRange(nextRange);
                                    updateParams({
                                        startDate: new Date(nextRange[0].startDate).toISOString(),
                                        endDate: new Date(nextRange[0].endDate).toISOString(),
                                    });
                                }}
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
                                            id="sosNumber"
                                            active={sortBy === 'sosNumber'}
                                            direction={sortOrder}
                                            onClick={changeSortOrder}
                                            IconComponent={() => <img src={sortBy === 'sosNumber' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                        >
                                            SOS Id
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                        <TableSortLabel
                                            id="reporter_user"
                                            active={sortBy === 'reporter_user'}
                                            direction={sortOrder}
                                            onClick={changeSortOrder}
                                            IconComponent={() => <img src={sortBy === 'reporter_user' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                        >
                                            Name
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                        <TableSortLabel
                                            id="address"
                                            active={sortBy === 'address'}
                                            direction={sortOrder}
                                            onClick={changeSortOrder}
                                            IconComponent={() => <img src={sortBy === 'address' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
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
                                            id="req_reach"
                                            active={sortBy === 'req_reach'}
                                            direction={sortOrder}
                                            onClick={changeSortOrder}
                                            IconComponent={() => <img src={sortBy === 'req_reach' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                        >
                                            Request Reached
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', textAlign: 'center' }}>
                                        <TableSortLabel
                                            id="req_accept"
                                            active={sortBy === 'req_accept'}
                                            direction={sortOrder}
                                            onClick={changeSortOrder}
                                            IconComponent={() => <img src={sortBy === 'req_accept' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                        >
                                            Request Accepted
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', textAlign: 'center' }}>
                                        <TableSortLabel
                                            id="suspect_reported_users"
                                            active={sortBy === 'suspect_reported_users'}
                                            direction={sortOrder}
                                            onClick={changeSortOrder}
                                            IconComponent={() => <img src={sortBy === 'suspect_reported_users' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                        >Sightings Reported</TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                        <TableSortLabel
                                            id="help_received"
                                            active={sortBy === 'help_received'}
                                            direction={sortOrder}
                                            onClick={changeSortOrder}
                                            IconComponent={() => <img src={sortBy === 'help_received' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                        >
                                            Status
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                        <TableSortLabel
                                            id="first_name"
                                            active={sortBy === 'first_name'}
                                            direction={sortOrder}
                                            onClick={changeSortOrder}
                                            IconComponent={() => <img src={sortBy === 'first_name' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
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
                                        MissingPersons?.data?.data?.data?.map((obj) => (
                                            <TableRow key={obj?._id}>
                                                <TableCell sx={{ color: '#367BE0', textAlign: 'center'  }}>
                                                    <Link onClick={() => handleView(`/home/capture-reports?location_id=${obj?._id}&sosId=${obj?.sosNumber}`)} className="link2">
                                                        {obj?.sosNumber || "-"}
                                                    </Link>
                                                </TableCell>
                                                <TableCell sx={{ color: '#4B5563' }}>
                                                    <Stack direction="row" alignItems="center" gap={1}>
                                                        <Avatar
                                                            src={obj?.notification_details?.notification_data?.lostPerson?.selfieImage || nouser}
                                                            onClick={() => handleImageClick(obj?.notification_details?.notification_data?.lostPerson?.selfieImage,'Image')}
                                                            sx={{cursor:'pointer', '&:hover': { textDecoration: 'none' } }}
                                                            alt="User"
                                                        />
                                                        {(obj?.notification_details?.notification_data?.lostPerson?.first_name || '') + ' ' + (obj?.notification_details?.notification_data?.lostPerson?.last_name || '') || "-"}
                                                    </Stack>
                                                </TableCell>
                                                <TableCell sx={{ color: '#4B5563' }}>

                                                    {obj?.address || "-"}

                                                </TableCell>
                                                <TableCell sx={{ color: '#4B5563' }}>
                                                    {moment(obj.createdAt).isSame(moment(), "day")
                                                        ? `Today, ${moment(obj.createdAt).format("hh:mm A")}`
                                                        : formatDateTime(obj.createdAt, "HH:mm:ss - DD/MM/YYYY")}

                                                </TableCell>
                                                <TableCell sx={{ color: 'var(--orange)' }}>
                                                    <Link
                                                        onClick={() => handleView(`/home/request-reached-users/${obj?._id}`)}
                                                        style={{
                                                            textDecoration: 'none',
                                                            color: 'var(--orange)',
                                                            cursor: 'pointer',
                                                        }}
                                                    >
                                                        {obj?.req_reach || "0"}
                                                    </Link>
                                                </TableCell>
                                                <TableCell sx={{ color: '#01C971' }}>
                                                    <Link
                                                        onClick={() => handleView(`/home/request-accepted-users/${obj?._id}`)}
                                                        style={{
                                                            textDecoration: 'none',
                                                            color: '#01C971',
                                                            cursor: 'pointer',
                                                        }}
                                                    >
                                                        {obj?.req_accept || "0"}
                                                    </Link>
                                                </TableCell>
                                                <TableCell sx={{ color: '#367BE0', textAlign: 'center' }}>
                                                    <Link onClick={() => handleView(`/home/total-suspect/suspect-sightings-reported-users/${obj?._id}`)} className="link2">
                                                        {obj?.suspect_reported_users}
                                                    </Link>
                                                </TableCell>
                                                <TableCell sx={{ color: '#4B5563' }}>
                                                    <Chip
                                                        label={obj?.help_received === 'help_received' ? 'Found' : 'Not Found' || 'Not Found'}
                                                        sx={{
                                                            backgroundColor:
                                                                obj?.help_received !== 'help_received' ? '#FEE2E2' :
                                                                    obj?.help_received === 'help_received' ? '#DCFCE7' :
                                                                                '#4B55631A',
                                                            '& .MuiChip-label': {
                                                                textTransform: 'capitalize',
                                                                color: obj?.help_received !== 'help_received' ? '#DC2626' :
                                                                    obj?.help_received === 'help_received' ? '#166534' :
                                                                                'black',
                                                            }
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ color: '#4B5563' }}>
                                                    <Link onClick={() => handleView(obj?.user_id.role === "driver" ? `/home/total-drivers/driver-information/${obj?.user_id._id}` : `/home/total-users/user-information/${obj?.user_id._id}`)} className="link2">
                                                        <Stack direction="row" alignItems="center" gap={1}>
                                                            <Avatar
                                                                src={obj?.user_id?.selfieImage || nouser}
                                                                sx={{ '&:hover': { textDecoration: 'none' } }}
                                                                alt="User"
                                                            />
                                                            {obj?.user_id?.first_name + ' ' + obj?.user_id?.last_name || "-"}
                                                        </Stack>
                                                    </Link>
                                                </TableCell>

                                                <TableCell >
                                                    <Box align="center" sx={{ display: 'flex', flexDirection: 'row' }}>
                                                        <Tooltip title="View" arrow placement="top">
                                                            <IconButton onClick={() => handleView(`/home/total-missing-person/person-information/${obj._id}`)}>
                                                                <img src={ViewBtn} alt="view button" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Archive" arrow placement="top">
                                                            <IconButton onClick={() => {
                                                                achiveMissingPerson.mutate({
                                                                    id: obj?._id,
                                                                    data: { isArchived: true }
                                                                });
                                                            }}>
                                                                <img src={Listtrip} alt="view button" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Delete" arrow placement="top">
                                                            <IconButton onClick={() => setconfirmation(obj?._id)}>
                                                                <img src={delBtn} alt="Delete" />
                                                            </IconButton>
                                                        </Tooltip>

                                                        {confirmation === obj?._id && (
                                                            <DeleteConfirm
                                                                id={obj?._id}
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
                    {MissingPersons?.data?.data?.data?.length > 0 && <Grid container sx={{ px: { xs: 0, sm: 3 } }} justifyContent="space-between" alignItems="center" mt={2}>
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
        </>
    );
};

export default ListofMissingPerson;
