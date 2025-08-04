import { useEffect, useState } from "react";
import {
    useGetNotificationType,
} from "../API Calls/API";
import {
    Grid, Typography, Button, Box, Paper, Chip, TextField, InputAdornment,
} from "@mui/material";
import Captured from '../assets/images/Captured.svg'
import search from '../assets/images/search.svg';
import Wanted from '../assets/images/Wanted.svg'
import CapturedSeen from '../assets/images/CapturedSeen.svg'
import WantedSeen from '../assets/images/WantedSeen.svg'
import filterIcon from '../assets/images/filter.svg'
import CustomDateRangePicker from "../common/CustomDateRangePicker";
import calender from '../assets/images/calender.svg';
import exportdiv from '../assets/images/exportdiv.svg';
import Loader from "../common/Loader";
import CustomFilter from "../common/CustomFilter";
import CustomExportMenu from "../common/CustomExport";


const notificationsObj = {
    "reporting_agency": "Task Force 5",
    "incidents": [
        {
            "id": 1,
            "user_name": "AlertCitizenSA",
            "tag": "wanted",
            "suspect_name": "Thabo Nxumalo",
            "description": "Sighting of Thabo Nxumalo, identified from recent news reports, near the V&A Waterfront. He was seen entering a red Ford Fiesta with tinted windows. Last seen heading towards Green Point.",
            "timestamp": "2025-08-04T11:09:01Z",
            "seen": false,
            "report_time_relative": "15 minutes ago",
            "case_number": "Case #SAPS-2023-0458",
            "location": "Cape Town",
        },
        {
            "id": 2,
            "user_name": "SecureCape",
            "tag": "captured",
            "suspect_name": "Ahmed Rashid",
            "description": "Suspect Ahmed Rashid successfully apprehended by Task Force 5 in a joint operation near Bellville. He was found attempting to flee in a cargo truck. ",
            "timestamp": "2025-08-04T11:09:50Z",
            "seen": false,
            "report_time_relative": "15 minutes ago",
            "case_number": "Case #SAPS-2023-0458",
            "location": "Cape Town",
        },
        {
            "id": 3,
            "user_name": "CCTWatchdog",
            "tag": "wanted",
            "suspect_name": "Lindiwe Mkhize",
            "description": "Possible sighting of Lindiwe Mkhize in the Bo-Kaap area, specifically on Wale Street. She was with another individual, male, unidentifiable.",
            "timestamp": "2025-08-04T11:09:35Z",
            "report_time_relative": "15 minutes ago",
            "seen": true,
            "case_number": "Case #SAPS-2023-0458",
            "location": "Cape Town",
        },

        {
            "id": 4,
            "user_name": "CityGuardian",
            "tag": "captured",
            "suspect_name": "Sipho Dlamini",
            "description": "Sipho Dlamini was captured by Task Force 5 in a pre-dawn raid on a property in Khayelitsha. He resisted arrest but was quickly subdued.",
            "timestamp": "2025-08-04T11:10:10Z",
            "report_time_relative": "15 minutes ago",
            "seen": true,
            "case_number": "Case #SAPS-2023-0458",
            "location": "Cape Town",
        }
    ]
}

const Notification = () => {
    const [filterType, setFilterType] = useState('all');
    const [filter, setfilter] = useState("");
    const filteredIncidents = notificationsObj?.incidents.filter((incident) => {
        if (filterType === 'all') return true;
        return incident.tag === filterType;
    });
    const [range, setRange] = useState([
        {
            startDate: new Date(),
            endDate: new Date(),
            key: 'selection'
        }
    ]);
    const handleFilterApply = (filters) => {
        console.log('Filters applied:', filters);
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
    return (
        <Box>
            <Grid sx={{ backgroundColor: 'white', p: 3, mt: '-25px' }} container justifyContent="space-between" alignItems="center" spacing={2} mb={1}>
                <Grid size={{ xs: 12, md: 4, lg: 6 }}>
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
                </Grid>
                <Grid size={{ xs: 12, md: 8, lg: 6 }}>
                    <Box display="flex" sx={{ justifyContent: { md: 'flex-end', sm: 'space-around' } }} gap={2} flexWrap="wrap">
                        <Box display="flex" sx={{ justifyContent: { md: 'flex-end', sm: 'space-around' } }} gap={2} flexWrap="wrap">

                            <CustomFilter onApply={handleFilterApply} />
                            <CustomDateRangePicker
                                borderColor={'var(--light-gray)'}
                                value={range}
                                onChange={setRange}
                                icon={calender}
                            />

                            <CustomExportMenu />
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
                            onClick={() => setFilterType('all')}
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
                            onClick={() => setFilterType('captured')}
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
                            onClick={() => setFilterType('wanted')}
                        >
                            Wanted
                        </Button>
                    </Grid>
                </Paper>
                {
                    filteredIncidents?.map((incident) => (
                        <Paper key={incident.id} elevation={0} sx={{ backgroundColor: "white", padding: 2, borderRadius: '10px' }}>
                            <Grid container spacing={2} sx={{ display: 'flex', alignItems: 'center' }}>
                                {/* Left section */}
                                <Grid size={{ md: 8, xs: 12 }}>
                                    <Grid container spacing={1} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
                                        <Grid size={1}>
                                            <IconDisplay tag={incident.tag} seen={incident.seen} />
                                        </Grid>
                                        <Grid size={11}>
                                            <Typography fontWeight={600}>{incident.suspect_name}</Typography>
                                            <Typography variant="body1" color="text.secondary">{incident.description}</Typography>
                                            <Box mt={1} sx={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
                                                <Chip label={incident.tag.toUpperCase()} sx={{
                                                    backgroundColor: 'var(--light-gray)',
                                                    color: '#9CA3AF',
                                                    fontWeight: 500,
                                                    '& .MuiChip-label': {
                                                        textTransform: 'capitalize',
                                                        color: '#6B7280'
                                                    }
                                                }} size="small" />
                                                <Typography variant="body2" color="#6B7280" fontWeight={450}>
                                                    • {incident.case_number}
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
                                            {incident.report_time_relative} &nbsp;

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
                                            onClick={() => console.log("View", incident.id)}
                                        >
                                            View
                                        </Button>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Paper>
                    ))
                }

            </Box>
        </Box>

    );
};

export default Notification;
