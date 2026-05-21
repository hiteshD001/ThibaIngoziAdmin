import { useEffect, useState } from "react";
import {useGetNotificationList,useSeenNotification} from "../API Calls/API";
import {
    Grid, Typography, Button, Box, Paper, Chip, TextField, InputAdornment,
} from "@mui/material";
import Captured from '../assets/images/Captured.svg'
import search from '../assets/images/search.svg';
import Wanted from '../assets/images/Wanted.svg'
import CapturedSeen from '../assets/images/CapturedSeen.svg'
import WantedSeen from '../assets/images/WantedSeen.svg'
import filterIcon from '../assets/images/filter.svg'
import CustomDateRangePicker from "../common/Custom/CustomDateRangePicker";
import calender from '../assets/images/calender.svg';
import exportdiv from '../assets/images/exportdiv.svg';
import Loader from "../common/Loader";
import CustomFilter from "../common/Custom/CustomFilter";
import CustomExportMenu from "../common/Custom/CustomExport";
import moment from "moment";
import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable'
import * as XLSX from 'xlsx';
import { startOfYear } from "date-fns";
import { useNavigate, useParams, useSearchParams,Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { saveScrollPosition, restoreScrollPosition } from "../common/ScrollPosition";

const Notification = () => {

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
    const filterType = searchParams.get("filterType") || "all";
    const rowsPerPage = Number(searchParams.get("rowsPerPage")) || 10;
    const locationFilter = searchParams.get("locationFilter") || "";
     const shortText = (text, limit = 50) =>
        text.length > limit ? text.substring(0, limit) + ' ....' : text;
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [role] = useState(localStorage.getItem("role"));
    
    const handleFilterApply = (filters) => {
    };
    const IconDisplay = ({ tag, seen }) => {
        let iconToDisplay;

        if (tag === 'wanted') {
            iconToDisplay = seen ? WantedSeen : Wanted;
        } else if (tag === 'captured') {
            iconToDisplay = seen ? CapturedSeen : Captured;
        } else {
            iconToDisplay = null;
        }

        return (
            <>
                {iconToDisplay && <img src={iconToDisplay} alt={`${tag} icon`} style={{ width: '24px' }} />}
            </>
        );
    };

    // API call
    const Notification_API_Data = useGetNotificationList('notification list',role,currentPage,rowsPerPage,filter,locationFilter,filterType,range[0].startDate.toISOString(), range[0].endDate.toISOString())
    const Notification_List = Notification_API_Data?.data?.data || {}

    const onSuccess = (variables) => {

        Notification_List?.data?.forEach((item) => {
            if (item._id === variables.data._id) {
                item.seen = true;
            }
        });
        queryClient.invalidateQueries(["notification list"]);
        handleView(`/home/total-suspect/suspect-information/${variables.data.notification_data.suspect_sighting_id}`)
        // toast.success("Notification Seen Successfully.");
    };

    const onError = (error) => {
        toast.error(
            error.response.data.message || "Something went Wrong",
            toastOption
        );
    };
    const { mutate } = useSeenNotification(onSuccess, onError);

    const handleSeenNotification = (dataObj) => {
        
        if(!dataObj.seen){
            mutate({ id:dataObj._id, data: {seen:true} });
        }else{
            handleView(`/home/total-suspect/suspect-information/${dataObj.notification_data.suspect_sighting_id}`)
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

    const handleExport = async ({ startDate, endDate, exportFormat }) => {
        try {

            const data = Notification_API_Data?.data?.data

            const allUsers = data?.data || [];
            if (!allUsers.length) {
                toast.warning("No Notification data found for this period.");
                return;
            }

            const exportData = allUsers.map(user => ({
                "Case ID": `${user?.notification_data?.suspect_sighting?.caseNumberId || ''}` || '',
                "Reporter": user?.notification_data?.user?.first_name +' '+ user?.notification_data?.user?.last_name || '',
                "Description": user?.notification_data?.suspect_sighting?.description || '',
                "Date Reported": user?.createdAt || '',
                "Status": user?.linked_case_data?.current_status || ''
            }));

            if (exportFormat === "xlsx") {
                const worksheet = XLSX.utils.json_to_sheet(exportData);
                const columnWidths = Object.keys(exportData[0] || {}).map((key) => ({
                    wch: Math.max(key.length, ...exportData.map((row) => String(row[key] ?? 'NA').length)) + 2
                }));
                worksheet['!cols'] = columnWidths;
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
                XLSX.writeFile(workbook, "Notification_List.xlsx");
            }
            else if (exportFormat === "csv") {

                const worksheet = XLSX.utils.json_to_sheet(exportData);
                const csv = XLSX.utils.sheet_to_csv(worksheet);
                const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'Notification_List.csv';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
            else if (exportFormat === "pdf") {
                const doc = new jsPDF();
                doc.text('Notification List', 14, 16);
                autoTable(doc, {
                    head: [['Case ID', 'Reporter', 'Description', 'Date Reported', 'Status']],
                    body: allUsers.map(user => [
                        `${user?.notification_data?.suspect_sighting?.caseNumberId || ''}` || '',
                        user?.notification_data?.user?.first_name +' '+ user?.notification_data?.user?.last_name || '',
                        user?.notification_data?.suspect_sighting?.description || '',
                        user?.createdAt || '',
                        user?.linked_case_data?.current_status || ''
                    ]),
                    startY: 20,
                    theme: 'striped',
                    headStyles: { fillColor: '#367BE0' },
                    margin: { top: 20 },
                    styles: { fontSize: 10 },
                });
                doc.save("Notification_List.pdf");
            }

        } catch (err) {
            console.error("Error exporting data:", err);
            toast.error("Export failed.");
        }
    };

    const handleView = (url) => {
        saveScrollPosition("notificationListScroll");
        navigate(url);
    };
    useEffect(() => {
        if (Notification_List.data?.data?.totaldata) {
            restoreScrollPosition("notificationListScroll");
        }
    }, [Notification_List.data?.data?.totaldata]);


    return (
        <Box>
            <Grid sx={{ backgroundColor: 'white', p: 3, mt: '-25px' }} container justifyContent="space-between" alignItems="center" spacing={2} mb={1}>
                <Grid size={{ xs: 12, md: 4, lg: 6 }}>
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
                </Grid>
                <Grid size={{ xs: 12, md: 8, lg: 6 }}>
                    <Box display="flex" sx={{ justifyContent: { md: 'flex-end', sm: 'space-around' } }} gap={2} flexWrap="wrap">
                        <Box display="flex" sx={{ justifyContent: { md: 'flex-end', sm: 'space-around' } }} gap={2} flexWrap="wrap">

                            {/* <CustomFilter onApply={handleFilterApply} /> */}
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

                            <CustomExportMenu  onExport={handleExport}/>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
            <Box p={2} sx={{ display: 'flex', gap: 3, flexDirection: 'column' }}>
                <Paper elevation={0} sx={{ backgroundColor: "white", padding: 2, borderRadius: '10px' }}>
                    <Grid container spacing={2} sx={{ display: 'flex', alignItems: 'center' }}>
                        <Button
                            variant={filterType === 'all' ? 'contained' : 'outlined'}
                            sx={{
                                height: 38,
                                borderRadius: '6px',
                                backgroundColor: filterType === 'all' ? 'var(--Blue)' : 'transparent',
                                color: filterType === 'all' ? 'white' : 'black',
                                borderColor: 'var(--light-gray)'
                            }}
                            onClick={() => updateParams({filterType:'all'})}
                        >
                            All
                        </Button>
                        <Button
                            variant={filterType === 'captured' ? 'contained' : 'outlined'}
                            sx={{
                                height: 38,
                                borderRadius: '6px',
                                backgroundColor: filterType === 'captured' ? 'var(--Blue)' : 'transparent',
                                color: filterType === 'captured' ? 'white' : 'black',
                                borderColor: 'var(--light-gray)'
                            }}
                            onClick={() => updateParams({filterType:'captured'})}
                        >
                            Captured
                        </Button>
                        <Button
                            variant={filterType === 'wanted' ? 'contained' : 'outlined'}
                            sx={{
                                height: 38,
                                borderRadius: '6px',
                                backgroundColor: filterType === 'wanted' ? 'var(--Blue)' : 'transparent',
                                color: filterType === 'wanted' ? 'white' : 'black',
                                borderColor: 'var(--light-gray)'
                            }}
                            onClick={() => updateParams({filterType:'wanted'})}
                        >
                            Wanted
                        </Button>
                    </Grid>
                </Paper>
                {
                    Notification_API_Data.isFetching ? (<Loader />):
                    Notification_List?.data?.length > 0 ? 
                    Notification_List?.data?.map((incident) => (
                        <Paper key={incident._id} elevation={0} sx={{ backgroundColor: "white", padding: 2, borderRadius: '10px' }}>
                            <Grid container spacing={2} sx={{ display: 'flex', alignItems: 'center' }}>
                                {/* Left section */}
                                <Grid size={{ md: 8, xs: 12 }}>
                                    <Grid container spacing={1} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
                                        <Grid size={1}>
                                            <IconDisplay tag={incident?.linked_case_data?.current_status} seen={incident?.seen} />
                                        </Grid>
                                        <Grid size={11}>
                                            <Link onClick={()=> handleView(incident?.notification_data?.user?.role === "driver" ? `/home/total-drivers/driver-information/${incident?.notification_data?.user?._id}` : `/home/total-users/user-information/${incident?.notification_data?.user?._id}`)} className="link2">
                                                <Typography fontWeight={600}>{incident?.notification_data?.user?.first_name +' '+ incident?.notification_data?.user?.last_name || ""}</Typography>
                                            </Link>
                                            <Typography variant="body1" color="text.secondary">{shortText(incident?.notification_data?.suspect_sighting?.description) || ''}</Typography>
                                            <Box mt={1} sx={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
                                                <Chip label={incident?.linked_case_data?.current_status.toUpperCase()} sx={{
                                                    backgroundColor: 'var(--light-gray)',
                                                    color: '#9CA3AF',
                                                    fontWeight: 500,
                                                    '& .MuiChip-label': {
                                                        textTransform: 'capitalize',
                                                        color: '#6B7280'
                                                    }
                                                }} size="small" />
                                                <Typography variant="body2" color="#6B7280" fontWeight={450}>
                                                    • Case - {incident?.notification_data?.suspect_sighting?.caseNumberId}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Grid>

                                {/* Right section */}
                                <Grid size={{ md: 4, xs: 12 }} sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                }}>
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Typography variant="body2" color="text.secondary">
                                            {moment(incident?.createdAt).fromNow() || ''} &nbsp;

                                            {incident.seen ?
                                                <Chip
                                                    label="seen"
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: '#9CA3AF',
                                                        color: 'white',
                                                        fontWeight: 500,
                                                        '& .MuiChip-label': {
                                                            textTransform: 'capitalize',
                                                            color: 'white'
                                                        }
                                                    }}
                                                />
                                                :
                                                <Chip label={'new'} sx={{
                                                    backgroundColor: '#EF4444',
                                                    color: 'white',
                                                    fontWeight: 500,
                                                    '& .MuiChip-label': {
                                                        textTransform: 'capitalize',
                                                        color: 'white'
                                                    }
                                                }} size="small" />}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'right', mt: 4 }}>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            sx={{ mt: 2, borderRadius: '6px', border: 'none' }}
                                            onClick={() => handleSeenNotification(incident)}
                                        >
                                            View
                                        </Button>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Paper>
                    )): (
                        <Typography align="center" color="text.secondary" sx={{ mt: 2 }}>
                            No data found
                        </Typography>
                    )
                }

            </Box>
        </Box>

    );
};

export default Notification;
