// src/components/HotspotSection.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { FaLocationDot } from 'react-icons/fa6'; // Updated to fa6 for newer icons if available
import { useNavigate } from 'react-router-dom';

// Import your API hooks
import { useGetHotspot, useGetNotificationType } from '../API Calls/API';

// Import your Loader component
import Loader from './Loader'; // Assuming you have a Loader component
import { startOfYear } from "date-fns";
import calender from '../assets/images/calender.svg';
import CustomDateRangePicker from "./Custom/CustomDateRangePicker";
// Import the Hotspot Map component
import HotspotMap from './HotspotMap';

function HotspotSection({ isMapLoaded, hideCategories = false }) {
  const nav = useNavigate();
  const [selectedNotification, setSelectedNotification] = useState("all");
  const [time, setTime] = useState(new Date().toISOString());
  const [id, setId] = useState("");
  const [range, setRange] = useState([
    {
      startDate: startOfYear(new Date()),
      endDate: new Date(),
      key: 'selection'
    }
  ]);
  const startDate = range[0].startDate.toISOString();
  const endDate = range[0].endDate.toISOString();

  const notificationTypes = useGetNotificationType();

  const hotspot = useGetHotspot(startDate, endDate, id, selectedNotification);

  const handleNotificationChange = (event) => {
    setSelectedNotification(event.target.value);
  };

  // Placeholder for a simple Loader component
  const CustomLoader = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <Loader /> {/* Use your actual Loader component here */}
    </Box>
  );
  const groupHotspotsByProvince = (data = []) => {
    const grouped = {};

    data?.forEach((item) => {
      const provinceId = item?.province?._id || "";
      if (!provinceId) return;

      // console.log(groupedHotspots);
      if (!grouped[provinceId]) {
        grouped[provinceId] = {
          province: item?.province?.province_name,
          locations: [],
        };
      }

      grouped[provinceId].locations.push({
        lat: item.lat,
        long: item.long,
        address: item.address,
        totalCalls: item.totalCalls,
      });
    });

    return Object.values(grouped);
  };
  const groupedHotspots = groupHotspotsByProvince(hotspot?.data?.data);

  const [expanded, setExpanded] = useState(null); // Track which accordion is open
  const handleAccordionChange = (panel) => (_, isExpanded) => {
    setExpanded(isExpanded ? panel : null);
  };

  const formatAddress = (address) => {
    if (!address || typeof address !== "string") return "";

    return address
      .split(",")
      .map(part => part.trim())
      .join(", ");
  };


  return (
    <Paper elevation={1} sx={{ backgroundColor: "rgb(253, 253, 253)", mb: 4, padding: 2, borderRadius: '10px' }}>
      <Grid container spacing={3}>
        {/* Top Left Heading */}
        <Grid size={12} justifyContent="space-between" alignItems="center" sx={{ display: 'flex', flexDirection: 'row', p: 1 }}>
          <Typography variant="h6" fontWeight={590}>  SOS Hotspot Map</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
            <CustomDateRangePicker
              value={range}
              onChange={setRange}
              icon={calender}
            />
            {!hideCategories && <FormControl size="small" sx={{ minWidth: '170px' }}>
              <InputLabel>All Categories</InputLabel>
              <Select
                value={selectedNotification}
                onChange={handleNotificationChange}
                label="All Categories"
              >
                <MenuItem value="all">All Categories</MenuItem>
                {notificationTypes.data?.data?.map((type) => (
                  <MenuItem key={type._id} value={type._id}>
                    {type.display_title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>}
          </Box>
        </Grid>
        {/* Google Map (md:8) */}
        <Grid size={{ xs: 12, md: 8, borderRadius: '16px' }}>
          <HotspotMap hotspots={hotspot.data?.data} isMapLoaded={isMapLoaded} />
        </Grid>

        {/* Hotspot List and Category Dropdown (md:4) */}
        <Grid size={{ xs: 12, md: 4 }} sx={{ backgroundColor: 'rgb(244, 245, 247)', borderRadius: '16px', p: 2 }}>
          <Typography variant="h6" fontWeight={500} gutterBottom>
            Top Sos Locations
          </Typography>
          <Box
            sx={{
              maxHeight: 'calc(100vh - 265px)',
              overflowY: 'auto',
              '&::-webkit-scrollbar': {
                width: 0,
                background: 'transparent'
              },
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
            }}
          >
            {hotspot.isFetching ? (
              <CustomLoader />
            ) : hotspot?.data?.data?.length === 0 ? (
              <Typography sx={{ mt: 2 }}>No data Found</Typography>
            ) : (
              groupedHotspots.map((group, index) => {
                const panelId = `panel-${index}`;
                return (
                  <Accordion
                    key={panelId}
                    expanded={expanded === panelId}
                    onChange={handleAccordionChange(panelId)}
                    sx={{
                      "&.MuiAccordion-root::before": {
                        display: "none"
                      },
                    }}
                  >
                    <AccordionSummary
                      // expandIcon={<ExpandMoreIcon />}
                      sx={{
                        background: "rgb(244, 245, 247)",
                        padding: 0,
                        borderBottom: "none",
                        "& .MuiAccordionSummary-content": {
                          alignItems: "center",
                          justifyContent: "space-between",
                        },
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {group?.province || "Unknown Province"}
                        </Typography>
                        <Typography fontSize="0.875rem" fontWeight="400" color='#4B5563'>
                          Vehicle
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          borderRadius: "50%",
                          padding: "1px",
                          height: "35px",
                          display: "flex",
                          minWidth: "35px",
                          justifyContent: "center",
                          alignItems: "center",
                          cursor: "pointer",
                          fontWeight: "bold",
                          backgroundColor:
                            (group.locations.length || 0) > 70 ? "#E5565A26" : "#F9731626",
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            mx: 1,
                            fontWeight: "bold",
                            color: (group.locations.length || 0) > 70 ? "red" : "orange",
                          }}
                        >
                          {group.locations.length || 0}
                        </Typography>
                      </Box>
                      {/* {group.locations.length} */}
                    </AccordionSummary>

                    <AccordionDetails>
                      {group.locations.map((d, i) => (
                        <Box
                          key={i}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: 1,
                            borderBottom: "1px solid #eee",
                            "&:last-child": { borderBottom: "none" },
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ textWrap: "wrap", flexGrow: 1, pr: 2, color: "#333" }}
                          >
                            {formatAddress(d.address) || "N/A"}
                          </Typography>

                          <Box
                            sx={{
                              borderRadius: "50%",
                              padding: "1px",
                              height: "35px",
                              display: "flex",
                              minWidth: "35px",
                              justifyContent: "center",
                              alignItems: "center",
                              cursor: "pointer",
                              fontWeight: "bold",
                              backgroundColor:
                                (d.totalCalls || 0) > 70 ? "#E5565A26" : "#F9731626",
                            }}
                            onClick={() =>
                              nav(`/home/hotspot/location?lat=${d.lat}&long=${d.long}`)
                            }
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                mx: 1,
                                fontWeight: "bold",
                                color: (d.totalCalls || 0) > 70 ? "red" : "orange",
                              }}
                            >
                              {d.totalCalls || 0}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </AccordionDetails>
                  </Accordion>
                );
              })

              // hotspot?.data?.data?.sort((a, b) =>
              //     a.timesCalled > b.timesCalled ? -1 : 1
              // )
              //     .map((d, index) => (
              //         <Box
              //             key={index}
              //             sx={{
              //                 display: 'flex',
              //                 justifyContent: 'space-between',
              //                 alignItems: 'center',
              //                 padding: 1,
              //                 borderBottom: '1px solid #eee',
              //                 '&:last-child': { borderBottom: 'none' },
              //             }}
              //         >
              //              <Typography variant="body2" sx={{ flexGrow: 1 }}>{d.address || "N/A"}</Typography>
              //             <Box sx={{
              //                 borderRadius: '50%',
              //                 padding: '1px',
              //                 height: '35px',
              //                 display: 'flex',
              //                 minWidth: '35px',
              //                 justifyContent: 'center', alignItems: 'center', cursor: 'pointer', fontWeight: 'bold', backgroundColor: (d.timesCalled || 0) > 70 ? '#E5565A26' : '#F9731626',
              //             }} onClick={() =>
              //                 nav(
              //                     `/home/hotspot/location?lat=${d.lat}&long=${d.long}`
              //                 )
              //             }>
              //                 <Typography variant="body2" sx={{ mx: 1, fontWeight: 'bold', color: (d.timesCalled || 0) > 70 ? 'red' : 'orange', }}>{d.timesCalled || 0}</Typography>

              //             </Box>
              //         </Box>
              //     ))
            )}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}

export default HotspotSection;