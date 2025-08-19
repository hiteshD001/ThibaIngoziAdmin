import { useState } from "react";
import {
  Box, Typography, TextField, Button, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, InputAdornment, Grid, Select, MenuItem, Chip
} from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import { format } from "date-fns";
import search from "../assets/images/search.svg";
import calender from '../assets/images/calender.svg';
import CustomExportMenu from "../common/Custom/CustomExport";
import CustomDateRangePicker from '../common/Custom/CustomDateRangePicker';
import ViewBtn from '../assets/images/ViewBtn.svg';
import delBtn from '../assets/images/delBtn.svg';
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { useGetTripList } from "../API Calls/API";
import { DeleteConfirm } from "../common/ConfirmationPOPup";
import Loader from "../common/Loader";
import Listtrip from '../assets/images/Listtrip.svg'
import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable'
import * as XLSX from 'xlsx';
import { toast } from "react-toastify";
import { startOfYear } from "date-fns";
import apiClient from "../API Calls/APIClient";

const ListOfTrips = () => {
  const nav = useNavigate();
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filter, setFilter] = useState("");
  const [range, setRange] = useState([
    {
      startDate: startOfYear(new Date()),
      endDate: new Date(),
      key: 'selection'
    }
  ]);
  const [confirmation, setConfirmation] = useState("");
  const startDate = range[0].startDate.toISOString();
  const endDate = range[0].endDate.toISOString();
  const trip = useGetTripList("Trip list", page, rowsPerPage, filter, startDate, endDate);
  const tripList = trip?.data?.data?.tripData || [];
  const totalTrips = trip?.data?.data?.totalTripData || 0;
  const totalPages = Math.ceil(totalTrips / rowsPerPage);

  const getChipStyle = (status) => {
    switch (status) {
      case 'ended':
        return {
          backgroundColor: '#367BE01A',
          color: '#367BE0',
          fontWeight: 500,
        };
      case 'started':
        return {
          backgroundColor: '#DCFCE7',
          color: '#166534',
          fontWeight: 500,
        };
      case 'flagged':
        return {
          backgroundColor: '#FFF4E5',
          color: '#B26A00',
          fontWeight: 500,
        };
      default:
        return {
          backgroundColor: '#F3F4F6',
          color: '#4B5563',
          fontWeight: 500,
        };
    }
  };

  const handleExport = async ({ startDate, endDate, format: fileFormat }) => {
    try {
      const { data } = await apiClient.get(`${import.meta.env.VITE_BASEURL}/userTrip`, {
        params: {
          page: 1,
          limit: 10000,
          filter: "",
          startDate,
          endDate,
        },
      });

      const allUsers = data?.tripData || [];
      if (!allUsers.length) {
        toast.warning("No trip data found for this period.");
        return;
      }

      const exportData = allUsers.map(user => ({
        "Driver": user.driver.first_name || '',
        "Passanger": user.passenger.first_name || '',
        "Started At": format(user.createdAt, "HH:mm:ss - dd/MM/yyyy") || '',
        "Ended At": user.trip_status === 'ended' ? format(user.endedAt, "HH:mm:ss - dd/MM/yyyy") : '---',
        "Ended By": user.ended_by || '',
        "Status": user.trip_status || '',
      }));

      if (fileFormat === "xlsx") {
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const columnWidths = Object.keys(exportData[0] || {}).map((key) => ({
          wch: Math.max(key.length, ...exportData.map((row) => String(row[key] ?? 'NA').length)) + 2
        }));
        worksheet['!cols'] = columnWidths;
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Trips");
        XLSX.writeFile(workbook, "Trip_List.xlsx");
      }
      else if (fileFormat === "csv") {
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'Trip_list.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      else if (fileFormat === "pdf") {
        const doc = new jsPDF();
        doc.text('Trip List', 14, 16);
        autoTable(doc, {
          head: [['Driver', 'Passanger', 'Started At', 'Ended At', 'Ended By', 'Status']],
          body: allUsers.map(user => [
            user.driver.first_name ?? 'NA',
            user.passenger.first_name ?? 'NA',
            format(user.createdAt, "HH:mm:ss - dd/MM/yyyy") ?? 'NA',
            user.trip_status === 'ended' ? format(user.endedAt, "HH:mm:ss - dd/MM/yyyy") : '---',
            user.ended_by ?? 'NA',
            user.trip_status ?? 'NA'
          ]),
          startY: 20,
          theme: 'striped',
          headStyles: { fillColor: '#367BE0' },
          margin: { top: 20 },
          styles: { fontSize: 10 },
        });
        doc.save("Trip_List.pdf");
      }

    } catch (err) {
      console.error("Error exporting data:", err);
      toast.error("Export failed.");
    }
  };
  return (
    <Box p={2}>
      <Paper elevation={3} sx={{ backgroundColor: "#fdfdfd", padding: 2, borderRadius: "10px" }}>
        <Grid container justifyContent="space-between" alignItems="center" mb={2}>
          <Grid size={{ xs: 12, md: 3, lg: 4 }} >
            <Typography variant="h6" fontWeight={590}>List of Trips</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 9, lg: 8 }} sx={{ display: "flex", justifyContent: "flex-end", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>

            <TextField
              variant="outlined"
              placeholder="Search"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              fullWidth
              sx={{
                width: "100%",
                height: "40px",
                borderRadius: "8px",
                '& .MuiInputBase-root': { height: '40px', fontSize: '14px' },
                '& .MuiOutlinedInput-input': { padding: '10px 14px' },
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
              <CustomDateRangePicker
                value={range}
                onChange={setRange}
                icon={calender}
              />
              <CustomExportMenu onExport={handleExport} />
              <Button variant="contained" sx={{ height: '40px', fontSize: '0.8rem', backgroundColor: '#367BE0', width: '180px', borderRadius: '8px' }}
                startIcon={<img src={ViewBtn} alt="View" />}>
                View Archeived
              </Button>
            </Box>
          </Grid>
        </Grid>

        {trip.isFetching ? (
          <Loader />
        ) : tripList.length > 0 ? (
          <Box sx={{ px: { xs: 0, md: 2 }, pt: { xs: 0, md: 3 }, backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
            <TableContainer>
              <Table sx={{ '& .MuiTableCell-root': { fontSize: '15px' } }}>
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell sx={{ color: '#4B5563' }}>Driver</TableCell>
                    <TableCell sx={{ color: '#4B5563' }}>Passenger</TableCell>

                    <TableCell sx={{ color: '#4B5563' }}>Started At</TableCell>
                    <TableCell sx={{ color: '#4B5563' }}>Ended At</TableCell>
                    <TableCell sx={{ color: '#4B5563' }}>Ended By</TableCell>
                    <TableCell sx={{ color: '#4B5563' }}>Status</TableCell>
                    <TableCell align="center" sx={{ color: '#4B5563' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tripList.map((data) => {
                    const [startlat, startlong] = data?.trip_start?.split(",") || [];
                    const [endlat, endlong] = data?.trip_end?.split(",") || [];

                    return (
                      <TableRow key={data._id}>
                        <TableCell>
                          <Link className="link2" to={`/home/total-drivers/driver-information/${data.driver._id}`}>
                            {data.driver.first_name}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Link className="link2" to={`/home/total-trips/user-information/${data.passenger._id}`}>
                            {data.passenger.first_name}
                          </Link>
                        </TableCell>

                        <TableCell>{format(data?.createdAt, "HH:mm:ss - dd/MM/yyyy")}</TableCell>
                        <TableCell>{data?.trip_status === 'ended' ? format(data.endedAt, "HH:mm:ss - dd/MM/yyyy") : '---'}</TableCell>
                        <TableCell>{data?.ended_by}</TableCell>
                        <TableCell>
                          <Chip
                            label={data.trip_status}
                            sx={{
                              backgroundColor:
                                data.trip_status === 'ended' ? '#367BE01A' :
                                  data.trip_status === 'flagged' ? '#F59E0B1A' :
                                    data.trip_status === 'started' ? '#DCFCE7' :
                                      '#F3F4F6',
                              '& .MuiChip-label': {
                                textTransform: 'capitalize',
                                fontWeight: 500,
                                color: data.trip_status === 'ended' ? '#367BE0' :
                                  data.trip_status === 'flagged' ? '#F59E0B' :
                                    data.trip_status === 'started' ? '#166534' :
                                      'black',
                              }
                            }}
                          />


                        </TableCell>
                        <TableCell>
                          <Box sx={{
                            justifyContent: 'center',
                            display: 'flex',
                            flexDirection: 'row',
                          }}>
                            <IconButton onClick={() => nav(`/home/total-trips/location?lat=${startlat}&long=${startlong}&end_lat=${endlat}&end_long=${endlong}`)}>
                              <img src={ViewBtn} alt="View" />
                            </IconButton>
                            <IconButton
                              onClick={() =>
                                nav(`/home/total-meeting-link-trips/location?lat=${startlat}&long=${startlong}&end_lat=${endlat}&end_long=${endlong}`)
                              }
                            >
                              <img src={Listtrip} alt="view button" />
                            </IconButton>
                            <IconButton onClick={() => setConfirmation(data._id)}>
                              <img src={delBtn} alt="Delete" />
                            </IconButton>
                          </Box>
                          {confirmation === data._id && (
                            <DeleteConfirm id={data._id} setconfirmation={setConfirmation} trip="trip" />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <Grid container justifyContent="space-between" alignItems="center" mt={2}>
              <Grid item>
                <Typography variant="body2">
                  Rows per page:&nbsp;
                  <Select
                    size="small"
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setPage(1);
                    }}
                    sx={{
                      border: 'none',
                      '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                      '& .MuiSelect-select': { padding: '4px 10px' },
                    }}
                  >
                    {[5, 10, 15, 20].map((num) => (
                      <MenuItem key={num} value={num}>{num}</MenuItem>
                    ))}
                  </Select>
                </Typography>
              </Grid>
              <Grid item>
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography variant="body2">{page} / {totalPages}</Typography>
                  <IconButton disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                    <NavigateBeforeIcon fontSize="small" />
                  </IconButton>
                  <IconButton disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                    <NavigateNextIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Grid>
            </Grid>
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

export default ListOfTrips;



