import { useState, useRef, useEffect } from "react";
import useDebounce from "../hooks/useDebounce";
import {
  Box, Typography, TextField, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, InputAdornment, Grid, Select, Chip, MenuItem,
  Button,
  Tooltip,
  TableSortLabel
} from "@mui/material";
import calender from '../assets/images/calender.svg';
import CustomExportMenu from "../common/Custom/CustomExport";
import CustomDateRangePicker from '../common/Custom/CustomDateRangePicker';
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import ViewBtn from '../assets/images/ViewBtn.svg'
import delBtn from '../assets/images/delBtn.svg'
import search from "../assets/images/search.svg";
import { startOfYear } from "date-fns";
import { useGetMeetingLinkTripList, useUpdateUserMeetingTripTrip } from "../API Calls/API";
import Loader from "../common/Loader";
import { DeleteConfirm } from "../common/ConfirmationPOPup";
import Listtrip from '../assets/images/Listtrip.svg'
import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable'
import * as XLSX from 'xlsx';
import { toast } from "react-toastify";
import apiClient from "../API Calls/APIClient";
import arrowup from '../assets/images/arrowup.svg';
import arrowdown from '../assets/images/arrowdown.svg';
import arrownuteral from '../assets/images/arrownuteral.svg';
import { saveScrollPosition, restoreScrollPosition } from "../common/ScrollPosition";

const ListOfMeetingLinkTrips = () => {
  const nav = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
	const startDateParam = searchParams.get("startDate") || startOfYear(new Date()).toISOString();
	const endDateParam = searchParams.get("endDate") || new Date().toISOString();

	const [range, setRange] = useState([{
		startDate: new Date(startDateParam),
		endDate: new Date(endDateParam),
		key: 'selection'
	}]);
	const page = Number(searchParams.get("page")) || 1;
	const filter = searchParams.get("filter") || "";
	const rowsPerPage = Number(searchParams.get("rowsPerPage")) || 10;
  const [isArchived, setIsArchived] = useState(true);

  // Sort 1
  const [sortBy, setSortBy] = useState("first_name");
  const [sortOrder, setSortOrder] = useState("asc");
  const role = localStorage.getItem("role");
  const companyId = role === 'company' ? localStorage.getItem("userID") : null;

  const debouncedFilter = useDebounce(filter, 500);

  const changeSortOrder = (e) => {
    const field = e.currentTarget.id;
    if (!field) return;
    if (field !== sortBy) {
      setSortBy(field);
      setSortOrder("asc");
      updateParams({page:1});
    } else {
      setSortOrder((p) => (p === "asc" ? "desc" : "asc"));
      updateParams({page:1});
    }
  };

  const [confirmation, setConfirmation] = useState("");
  const startDate = range[0].startDate.toISOString();
  const endDate = range[0].endDate.toISOString();
  const trip = useGetMeetingLinkTripList("Meeting Link Trip list", page, rowsPerPage, debouncedFilter, startDate, endDate, isArchived, sortBy, sortOrder, companyId);
  const tripList = trip?.data?.data?.tripData || [];
  const totalTrips = trip?.data?.data?.totalMeetingLinkTripData || 0;
  const totalPages = Math.ceil(totalTrips / rowsPerPage);

  const updateMeetingLinkTripMutation = useUpdateUserMeetingTripTrip(
    (id, data) => {

      toast.success("User Archived Successfully")

      trip.refetch();

    },
    (error) => {
      console.error('Error updating trip:', error);
    }
  );

  const handleExport = async ({ startDate, endDate, format: fileFormat }) => {
    try {
      const { data } = await apiClient.get(`${import.meta.env.VITE_BASEURL}/userMeetingTrip`, {
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
        toast.warning("No Meeting Link Trip data found.");
        return;
      }

      const exportData = allUsers.map(user => ({
        "User1": user.user1.first_name || '',
        "User2": user.user2.first_name || '',
        "Started At": user?.createdAt ? format(new Date(user.createdAt), "HH:mm:ss - dd/MM/yyyy") : '',
        "Ended At": user.trip_status === 'ended' && user?.endedAt ? format(new Date(user.endedAt), "HH:mm:ss - dd/MM/yyyy") : '---',
        // "Ended By": user.ended_by || '',
        "Status": user.trip_status || '',
      }));

      if (fileFormat === "xlsx") {
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const columnWidths = Object.keys(exportData[0] || {}).map((key) => ({
          wch: Math.max(key.length, ...exportData.map((row) => String(row[key] ?? 'NA').length)) + 2
        }));
        worksheet['!cols'] = columnWidths;
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Meeting_Link_Trip_List");
        XLSX.writeFile(workbook, "Meeting_Link_Trip_List.xlsx");
      }
      else if (fileFormat === "csv") {
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'Meeting_Link_Trip_List.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      else if (fileFormat === "pdf") {
        const doc = new jsPDF();
        doc.text('Meeting Link TripList', 14, 16);
        autoTable(doc, {
          head: [['User1', 'User2', 'Started At', 'Ended At', 'Status']],
          body: allUsers.map(user => [
            user.user1.first_name ?? 'NA',
            user.user2.first_name ?? 'NA',
            user?.createdAt ? format(new Date(user.createdAt), "HH:mm:ss - dd/MM/yyyy") : 'NA',
            user.trip_status === 'ended' && user?.endedAt ? format(new Date(user.endedAt), "HH:mm:ss - dd/MM/yyyy") : '---',
            user.trip_status ?? 'NA'
          ]),
          startY: 20,
          theme: 'striped',
          headStyles: { fillColor: '#367BE0' },
          margin: { top: 20 },
          styles: { fontSize: 10 },
        });
        doc.save("Meeting_Link_Trip_List.pdf");
      }

    } catch (err) {
      console.error("Error exporting data:", err);
      toast.error("Export failed.");
    }
  };

  const updateParams = (newParams) => {
    setSearchParams({
      page,
      rowsPerPage: rowsPerPage,
      startDate: startDateParam,
      endDate: endDateParam,
      filter,
      ...newParams,
    });
  };
  const handleView = (user) => {
    const [startlat, startlong] = user?.trip_start?.split(",") || [];
    const [endlat, endlong] = user?.trip_end?.split(",") || [];
    saveScrollPosition("meetingArchiveListScroll");
    nav(`/home/total-meeting-links/location?lat=${startlat}&long=${startlong}&end_lat=${endlat}&end_long=${endlong}`)
  };
  // Handle Scroll Event store 
  useEffect(() => {
    if (trip.data?.data?.tripData?.length) {
      restoreScrollPosition("meetingArchiveListScroll");
    }
  }, [trip.data?.data?.tripData?.length]);

  return (
    <Box p={2}>
      <Paper elevation={3} sx={{ backgroundColor: "#fdfdfd", padding: 2, borderRadius: "10px" }}>
        <Grid container justifyContent="space-between" alignItems="center" mb={2}>
          <Grid size={{ xs: 12, md: 3, lg: 4 }} >
            <Typography variant="h6" fontWeight={590}>List of View Archeived</Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 9, lg: 8 }} sx={{ display: "flex", justifyContent: "flex-end", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
            <TextField
              variant="outlined"
              placeholder="Search"
              value={filter}
              onChange={(e) => updateParams({filter:e.target.value})}
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
                onChange={(nextRange) => {
									setRange(nextRange);
									updateParams({
										startDate: new Date(nextRange[0].startDate).toISOString(),
										endDate: new Date(nextRange[0].endDate).toISOString(),
										page: 1,
									});
								}}
                icon={calender}
              />

              <CustomExportMenu onExport={handleExport} />
              {/* <Button
                onClick={() => nav('/home/total-meeting-links/view-archeived')}
                variant="contained"
                sx={{ height: '40px', fontSize: '0.8rem', backgroundColor: '#367BE0', width: '180px', borderRadius: '8px' }}
                startIcon={<img src={ViewBtn} alt="View" />}>
                View Archeived
              </Button> */}
            </Box>
          </Grid>

        </Grid>

        <Box sx={{ px: { xs: 0, md: 2 }, pt: { xs: 0, md: 3 }, backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
          <TableContainer>
            <Table sx={{ '& .MuiTableCell-root': { fontSize: '15px' } }}>
              <TableHead sx={{ borderTopLeftRadius: '10px', backgroundColor: '#f5f5f5', borderTopRightRadius: '10px', }}>
                <TableRow>
                  <TableCell sx={{ color: '#4B5563', borderTopLeftRadius: '10px' }}>
                    <TableSortLabel
                      id="user1_name"
                      active={sortBy === 'user1_name'}
                      direction={sortOrder}
                      onClick={changeSortOrder}
                      IconComponent={() => (
                        <img
                          src={sortBy === 'user1_name' ? (sortOrder === 'asc' ? arrowup : arrowdown) : arrownuteral}
                          style={{ marginLeft: 5 }}
                          alt=""
                        />
                      )}
                    >
                      User 1
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ color: '#4B5563' }}>
                    <TableSortLabel
                      id="user2_name"
                      active={sortBy === 'user2_name'}
                      direction={sortOrder}
                      onClick={changeSortOrder}
                      IconComponent={() => (
                        <img
                          src={sortBy === 'user2_name' ? (sortOrder === 'asc' ? arrowup : arrowdown) : arrownuteral}
                          style={{ marginLeft: 5 }}
                          alt=""
                        />
                      )}
                    >
                      User 2
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ color: '#4B5563' }}>
                    <TableSortLabel
                      id="started_at"
                      active={sortBy === 'started_at'}
                      direction={sortOrder}
                      onClick={changeSortOrder}
                      IconComponent={() => (
                        <img
                          src={sortBy === 'started_at' ? (sortOrder === 'asc' ? arrowup : arrowdown) : arrownuteral}
                          style={{ marginLeft: 5 }}
                          alt=""
                        />
                      )}
                    >
                      Started At
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ color: '#4B5563' }}>
                    <TableSortLabel
                      id="ended_at"
                      active={sortBy === 'ended_at'}
                      direction={sortOrder}
                      onClick={changeSortOrder}
                      IconComponent={() => (
                        <img
                          src={sortBy === 'ended_at' ? (sortOrder === 'asc' ? arrowup : arrowdown) : arrownuteral}
                          style={{ marginLeft: 5 }}
                          alt=""
                        />
                      )}
                    >
                      Ended At
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ color: '#4B5563' }}>
                    <TableSortLabel
                      id="status"
                      active={sortBy === 'status'}
                      direction={sortOrder}
                      onClick={changeSortOrder}
                      IconComponent={() => (
                        <img
                          src={sortBy === 'status' ? (sortOrder === 'asc' ? arrowup : arrowdown) : arrownuteral}
                          style={{ marginLeft: 5 }}
                          alt=""
                        />
                      )}
                    >
                      Status
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center" sx={{ color: '#4B5563' }}>Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {trip.isFetching ?
                  <TableRow>
                    <TableCell sx={{ color: '#4B5563', borderBottom: 'none' }} colSpan={6} align="center">
                      <Loader />
                    </TableCell>
                  </TableRow>
                  : (tripList.length > 0 ?
                    tripList.map((data) => {
                      return (
                        <TableRow key={data._id}>
                          <TableCell>
                            <Link
                              className="link2"
                              to={
                                data.user1.role === "driver"
                                  ? `/home/total-drivers/driver-information/${data.user1._id}`
                                  : data.user1.role === "passanger"
                                    ? `/home/total-meeting-links/user-information/${data.user1._id}`
                                    : "#"
                              }
                            >
                              {data?.user1?.first_name || ""} {data?.user1?.last_name || ""}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Link
                              className="link2"
                              to={
                                data.user2.role === "driver"
                                  ? `/home/total-drivers/driver-information/${data.user2._id}`
                                  : data.user2.role === "passanger"
                                    ? `/home/total-meeting-links/user-information/${data.user2._id}`
                                    : "#"
                              }
                            >
                              {data?.user2?.first_name || ""} {data?.user2?.last_name || ""}
                            </Link>
                          </TableCell>

                          <TableCell>
                            {data?.createdAt
                              ? format(new Date(data.createdAt), "HH:mm:ss - dd/MM/yyyy")
                              : "-"}
                          </TableCell>
                          <TableCell>
                            {data.trip_status === "ended" && data?.endedAt
                              ? format(new Date(data.endedAt), "HH:mm:ss - dd/MM/yyyy")
                              : "---"}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={data.trip_status}
                              sx={{
                                backgroundColor:
                                  data.trip_status === 'ended' ? '#367BE01A' :
                                    data.trip_status === 'started' ? '#E5565A33' :
                                      data.trip_status === 'linked' ? '#DCFCE7' :
                                        '#F3F4F6',
                                '& .MuiChip-label': {
                                  textTransform: 'capitalize',
                                  fontWeight: 500,
                                  color: data.trip_status === 'ended' ? '#367BE0' :
                                    data.trip_status === 'started' ? '#E5565A' :
                                      data.trip_status === 'linked' ? '#166534' :
                                        'black',
                                }
                              }}
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
                              <Tooltip title="View" arrow placement="top">
                                <IconButton
                                  onClick={() =>
                                    handleView(data)
                                  }
                                >
                                  <img src={ViewBtn} alt="view button" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Archive" arrow placement="top">
                                <IconButton
                                  onClick={() => updateMeetingLinkTripMutation.mutate({
                                    id: data._id,
                                    data: {
                                      "userId1": data.user_id1,
                                      "userId2": data.user_id2,
                                      "notification_type": data.notification_type,
                                      "start_by": data.start_by,
                                      "isArchived": false
                                    }
                                  })}
                                >
                                  <img src={Listtrip} alt="view button" />
                                </IconButton>
                              </Tooltip>
                              {role !== 'company' && (
                                <Tooltip title="Delete" arrow placement="top">
                                  <IconButton
                                    onClick={() => setConfirmation(data._id)}
                                  >
                                    <img src={delBtn} alt="delete button" />
                                  </IconButton>
                                </Tooltip>
                              )}


                            </Box>
                            {confirmation === data._id && (
                              <DeleteConfirm id={data._id} setconfirmation={setConfirmation} trip="LinkTrip" />
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
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

          {tripList.length > 0 && !trip.isFetching && <Grid container sx={{ px: { xs: 0, sm: 1 } }} justifyContent="space-between" alignItems="center" mt={2}>
            <Grid >
              <Typography variant="body2">
                Rows per page:&nbsp;
                <Select
                  size="small"
                  value={rowsPerPage}
                  onChange={(e) => {
                    updateParams({rowsPerPage:Number(e.target.value),page:1});
                  }}
                  sx={{
                    border: 'none',
                    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                    '& .MuiSelect-select': { padding: '4px 10px' },
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
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="body2">{page} / {totalPages}</Typography>
                <IconButton
                  disabled={page === 1}
                  onClick={() => updateParams({page:page - 1})}
                >
                  <NavigateBeforeIcon fontSize="small" />
                </IconButton>
                <IconButton
                  disabled={page === totalPages}
                  onClick={() => updateParams({page:page + 1})}
                >
                  <NavigateNextIcon fontSize="small" />
                </IconButton>
              </Box>
            </Grid>
          </Grid>}
        </Box>
      </Paper>
    </Box>
  );
};

export default ListOfMeetingLinkTrips;
