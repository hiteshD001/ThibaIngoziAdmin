import { useEffect, useState } from "react";
import {
    useGetChartData,
    useGetHotspot,
    useGetUserList,
    useGetNotificationType,
} from "../API Calls/API";
import {
    Grid,
    Typography,
    Select,
    Button,
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions, MenuItem,
    FormControl,
    InputLabel,
    IconButton,
} from "@mui/material";
import LocationIcon from '../assets/images/LocationIcon.svg'
import filter from '../assets/images/filter.svg'
import ReportIcon from '../assets/images/ReportsIcon.svg'
import DangerIcon from '../assets/images/DangerIcon.svg'
import CustomDateRangePicker from "../common/CustomDateRangePicker";
import calender from '../assets/images/calender.svg';
import exportdiv from '../assets/images/exportdiv.svg';
import Loader from "../common/Loader";
import div from '../assets/images/div.svg'
import div2 from '../assets/images/div2.svg'
import div3 from '../assets/images/div3.svg'
import { FaLocationDot } from "react-icons/fa6";
import CustomChart from "../common/CustomChart";
import { useNavigate } from "react-router-dom";

const Notification = () => {
    const [time, settime] = useState("today");
    const [timeTitle, settimeTitle] = useState("Today");
    const [activeUser, setactiveUser] = useState(0);
    const notificationTypes = useGetNotificationType();
    const [selectedNotification, setSelectedNotification] = useState("");
    const [range, setRange] = useState([
        {
            startDate: new Date(),
            endDate: new Date(),
            key: 'selection'
        }
    ]);
    const [category, setCategory] = useState('');

    const nav = useNavigate();

    const handleTimeChange = (e) => {
        settime(e.target.value);
    };

    const handleNotificationChange = (e) => {
        setSelectedNotification(e.target.value);
    };

    useEffect(() => {
        if (notificationTypes.data?.data.length > 0 && !selectedNotification) {
            setSelectedNotification(notificationTypes.data?.data[0]?._id);
        }
    }, [notificationTypes]);




    const handleExport = () => {
        // Add your export logic here
        console.log('Date Range:', dateRange);
        console.log('Category:', category);
        console.log('Format:', exportFormat);
        setOpen(false);
    };


    return (
        <Box>
            <Grid sx={{ backgroundColor: 'white', p: 3, mt: '-25px' }} container justifyContent="space-between" alignItems="center" spacing={2} mb={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="h5" fontWeight={550}>
                        Notfications
                    </Typography>
                    <Typography variant="body1" mt={1} color="text.secondary">
                        Monitor SOS activity, trends, and export data for analysis.
                    </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <Box display="flex" sx={{ justifyContent: { md: 'flex-end', sm: 'space-around' } }} gap={2} flexWrap="wrap">
                        <Box display="flex" sx={{ justifyContent: { md: 'flex-end', sm: 'space-around' } }} gap={2} flexWrap="wrap">
                            <Button variant="outlined" sx={{ color: 'var(--font-gray)', border: '1px solid var(--light-gray)', gap: 1 }}>
                                <img src={filter} alt="filter" />
                                Filter
                            </Button>
                            <CustomDateRangePicker
                                borderColor={'var(--light-gray)'}
                                value={range}
                                onChange={setRange}
                                icon={calender}
                            />

                            <Button
                                sx={{ height: '40px', width: '140px', borderRadius: '8px', border: '1px solid var(--light-gray)', backgroundColor: '#F3F4F6' }}
                                variant="outlined"
                                startIcon={<img src={exportdiv} alt="export" />}
                                size="small"
                                onClick={() => setOpen(true)}
                            >
                                Export
                            </Button>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
            <Box p={2}>
                <Grid container spacing={3}>
                    <Grid size={12}>
                        {/* <CustomPie
                            companyList={companyList}
                            driverList={driverList}
                            activeUser={activeUser}
                            timeTitle={timeTitle}
                        /> */}
                    </Grid>
                </Grid>

            </Box>
        </Box>

    );
};

export default Notification;
