import { useState, useRef } from "react";
import {
  Box, Typography, TextField, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, InputAdornment, Grid, Select, Chip, MenuItem
} from "@mui/material";
import calender from '../assets/images/calender.svg';
import CustomExportMenu from "../common/Custom/CustomExport";
import CustomDateRangePicker from '../common/Custom/CustomDateRangePicker';
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { useNavigate, Link } from "react-router-dom";
import { format } from "date-fns";
import ViewBtn from '../assets/images/ViewBtn.svg'
import delBtn from '../assets/images/delBtn.svg'
import search from "../assets/images/search.svg";
import { useGetMeetingLinkTripList } from "../API Calls/API";
import Loader from "../common/Loader";
import { DeleteConfirm } from "../common/ConfirmationPOPup";
import Listtrip from '../assets/images/Listtrip.svg'

const ListOfMeetingLinkTrips = () => {
  const nav = useNavigate();
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filter, setFilter] = useState("");
  const [range, setRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }
  ]);

  const [confirmation, setConfirmation] = useState("");

  const trip = useGetMeetingLinkTripList("Meeting Link Trip list", page, rowsPerPage, filter);
  const tripList = trip?.data?.data?.tripData || [];
  const totalTrips = trip?.data?.data?.totalTrips || 0;
  const totalPages = Math.ceil(totalTrips / rowsPerPage);

  return (
    <Box p={2}>
      <Paper elevation={3} sx={{ backgroundColor: "#fdfdfd", padding: 2, borderRadius: "10px" }}>
        <Grid container justifyContent="space-between" alignItems="center" mb={2}>
          <Grid size={{ xs: 12, md: 3, lg: 4 }} >
            <Typography variant="h6" fontWeight={590}>List of Meeting Link Trips</Typography>
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

              <CustomExportMenu />
            </Box>
          </Grid>

        </Grid>

        {trip.isFetching ? (
          <Loader />
        ) : tripList.length > 0 ? (
          <Box sx={{ px: { xs: 0, md: 2 }, pt: { xs: 0, md: 3 }, backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
            <TableContainer>
              <Table sx={{ '& .MuiTableCell-root': { fontSize: '15px' } }}>
                <TableHead sx={{ borderTopLeftRadius: '10px', backgroundColor: '#f5f5f5', borderTopRightRadius: '10px', }}>
                  <TableRow>
                    <TableCell sx={{ color: '#4B5563', borderTopLeftRadius: '10px' }}>User 1</TableCell>
                    <TableCell sx={{ color: '#4B5563' }}>User 2</TableCell>

                    <TableCell sx={{ color: '#4B5563' }}>Started At</TableCell>
                    <TableCell sx={{ color: '#4B5563' }}>Ended At</TableCell>
                    <TableCell sx={{ color: '#4B5563' }}>Status</TableCell>
                    {/* <TableCell sx={{ color: '#4B5563' }}>Ended By</TableCell> */}
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
                          <Link
                            className="link2"
                            to={
                              data.user1.role === "driver"
                                ? `/home/total-drivers/driver-information/${data.user1._id}`
                                : data.user1.role === "passanger"
                                  ? `/home/total-meeting-link-trips/user-information/${data.user1._id}`
                                  : "#"
                            }
                          >
                            {data.user1.first_name}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Link
                            className="link2"
                            to={
                              data.user2.role === "driver"
                                ? `/home/total-drivers/driver-information/${data.user2._id}`
                                : data.user2.role === "passanger"
                                  ? `/home/total-meeting-link-trips/user-information/${data.user2._id}`
                                  : "#"
                            }
                          >
                            {data.user2.first_name}
                          </Link>
                        </TableCell>

                        <TableCell>{format(data.createdAt, "HH:mm:ss - dd/MM/yyyy")}</TableCell>
                        <TableCell>
                          {data.trip_status === "ended"
                            ? format(data.endedAt, "HH:mm:ss - dd/MM/yyyy")
                            : "---"}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={data.trip_status}
                            sx={{
                              backgroundColor:
                                data.trip_status === 'ended' ? '#367BE01A' :
                                  data.trip_status === 'started' ? '#DCFCE7' :
                                    data.trip_status === 'flagged' ? '#FFF4E5' :
                                      '#F3F4F6',
                            }}
                            className={
                              data.trip_status === 'ended' ? 'chip-ended' :
                                data.trip_status === 'started' ? 'chip-started' :
                                  data.trip_status === 'flagged' ? 'chip-flagged' :
                                    'chip-default'
                            }
                          />
                        </TableCell>
                        {/* <TableCell>
                          {data.trip_status === "ended"
                            ? format(data.endedAt, "HH:mm:ss - dd/MM/yyyy")
                            : "---"}
                        </TableCell> */}
                        <TableCell >
                          <Box sx={{
                            justifyContent: 'center',
                            display: 'flex',
                            flexDirection: 'row',
                          }}>
                            <IconButton
                              onClick={() =>
                                nav(`/home/total-meeting-link-trips/location?lat=${startlat}&long=${startlong}&end_lat=${endlat}&end_long=${endlong}`)
                              }
                            >
                              <img src={ViewBtn} alt="view button" />
                            </IconButton>
                            <IconButton
                              onClick={() =>
                                nav(`/home/total-meeting-link-trips/location?lat=${startlat}&long=${startlong}&end_lat=${endlat}&end_long=${endlong}`)
                              }
                            >
                              <img src={Listtrip} alt="view button" />
                            </IconButton>
                            <IconButton
                              onClick={() => setConfirmation(data._id)}
                            >
                              <img src={delBtn} alt="delete button" />
                            </IconButton>

                          </Box>
                          {confirmation === data._id && (
                            <DeleteConfirm id={data._id} setconfirmation={setConfirmation} trip="LinkTrip" />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <Grid container sx={{ px: { xs: 0, sm: 1 } }} justifyContent="space-between" alignItems="center" mt={2}>
              <Grid >
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
                      <MenuItem key={num} value={num}>
                        {num}
                      </MenuItem>
                    ))}
                  </Select>
                </Typography>
              </Grid>

              <Grid>
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography variant="body2">{page} / {totalPages}</Typography>
                  <IconButton
                    disabled={page === 1}
                    onClick={() => setPage((prev) => prev - 1)}
                  >
                    <NavigateBeforeIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    disabled={page === totalPages}
                    onClick={() => setPage((prev) => prev + 1)}
                  >
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

export default ListOfMeetingLinkTrips;
