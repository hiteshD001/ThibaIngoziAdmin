/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import useDebounce from "../hooks/useDebounce";
import {
	Box, Typography, TextField, Button, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, InputAdornment, Grid, Select, MenuItem, Chip,
	Tooltip,
	TableSortLabel
} from "@mui/material";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import search from "../assets/images/search.svg";
import calender from '../assets/images/calender.svg';
import CustomExportMenu from "../common/Custom/CustomExport";
import CustomDateRangePicker from '../common/Custom/CustomDateRangePicker';
import ViewBtn from '../assets/images/ViewBtn.svg';
import copassangerBtn from '../assets/images/copassangerBtn.svg';
import delBtn from '../assets/images/delBtn.svg';
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { useGetUser, useGetTripList, usePutUserTrip } from "../API Calls/API";
import { DeleteConfirm } from "../common/ConfirmationPOPup";
import Loader from "../common/Loader";
import Listtrip from '../assets/images/Listtrip.svg'
import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable'
import * as XLSX from 'xlsx';
import { toast } from "react-toastify";
import { startOfYear } from "date-fns";
import apiClient from "../API Calls/APIClient";
import arrowup from '../assets/images/arrowup.svg';
import arrowdown from '../assets/images/arrowdown.svg';
import arrownuteral from '../assets/images/arrownuteral.svg';
import { saveScrollPosition, restoreScrollPosition } from "../common/ScrollPosition";

const ListOfTrips = () => {
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
	const debouncedFilter = useDebounce(filter, 500); // 500ms delay for search
	const [archived, setArchived] = useState(false)
	const [viewcopassenger, setViewcopassenger] = useState([])

	// Sort
	const [sortBy, setSortBy] = useState("createdAt");
	const [sortOrder, setSortOrder] = useState("desc");
	const role = localStorage.getItem("role");

	const changeSortOrder = (e) => {
		const field = e.currentTarget.id;
		if (!field) return;
		if (field !== sortBy) {
			setSortBy(field);
			setSortOrder("asc");
			updateParams({page:1});
			setViewcopassenger([]);
		} else {
			setSortOrder((p) => (p === "asc" ? "desc" : "asc"));
			updateParams({page:1});
			setViewcopassenger([]);
		}
	};

	// Determine companyId based on role
	const companyId = role === 'company' ? localStorage.getItem("userID") : null;

	const [confirmation, setConfirmation] = useState("");
	const startDate = range[0].startDate.toISOString();
	const endDate = range[0].endDate.toISOString();
	const trip = useGetTripList("Trip list", page, rowsPerPage, debouncedFilter, startDate, endDate, archived, sortBy, sortOrder, companyId);
	const tripList = trip?.data?.data?.tripData || [];
	const totalTrips = trip?.data?.data?.totalTripData || 0;
	const totalPages = Math.ceil(totalTrips / rowsPerPage);
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
	const Data = {
		"isArchived": true
	}

	const updateTripMutation = usePutUserTrip(
		(id, data) => {


			toast.success("User Archived Successfully")

			trip.refetch();

		},
		(error) => {
			console.error('Error updating trip:', error);
		}
	);

	const getChipStyle = (status) => {
		switch (status) {
			case 'ended':
				return {
					backgroundColor: '#367BE01A',
					color: '#367BE0',
					fontWeight: 500,
				};
			case 'linked':
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
	const formatEndedBy = (raw) => {
		if (!raw) return "-";
		const value = String(raw).toLowerCase();
		if (value === "admin_super" || value === "admit_super") return "Admin Super";
		if (value === "admin") return "Admin";
		if (value === "passenger") return "Passenger";
		if (value === "driver") return "Driver";
		return value
			.split("_")
			.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
			.join(" ");
	};

	let loginUser = useGetUser(localStorage.getItem("userID"));
	loginUser = loginUser?.data?.data?.user;

	const handleExport = async ({ startDate, endDate, exportFormat: fileFormat }) => {
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
				"Trip Type": user.trip_type?.tripTypeName || '',
				"Started At": user?.createdAt ? format(new Date(user.createdAt), "HH:mm:ss - dd/MM/yyyy") : '',
				"Ended At": user.trip_status === 'ended' && user?.endedAt ? format(new Date(user.endedAt), "HH:mm:ss - dd/MM/yyyy") : '---',
				"Ended By": formatEndedBy(user.ended_by),
				"Status": user.trip_status || '',
			}));
			const exportedByValue = loginUser.role === 'company' ? loginUser.company_name : 'Super Admin';
			if (fileFormat === "xlsx") {
				const worksheet = XLSX.utils.json_to_sheet(exportData);

				// Add "Exported By" info above data
				XLSX.utils.sheet_add_aoa(worksheet, [["Exported By:", exportedByValue]], { origin: "A1" });
				XLSX.utils.sheet_add_aoa(worksheet, [["Generated On:", new Date().toLocaleString()]], { origin: "A2" });
				XLSX.utils.sheet_add_aoa(worksheet, [[]], { origin: "A3" }); // Empty line
				XLSX.utils.sheet_add_json(worksheet, exportData, { origin: "A4", skipHeader: false });

				// Adjust column widths dynamically
				const columnWidths = Object.keys(exportData[0] || {}).map((key) => ({
					wch: Math.max(key.length, ...exportData.map((row) => String(row[key] ?? 'NA').length)) + 2
				}));
				worksheet['!cols'] = columnWidths;

				const workbook = XLSX.utils.book_new();
				XLSX.utils.book_append_sheet(workbook, worksheet, "Trips");
				XLSX.writeFile(workbook, "Trip_List.xlsx");
			} else if (fileFormat === "csv") {
				// Add "Exported By" header at top of CSV
				const headerRows = [
					[`Exported By: ${exportedByValue}`],
					[`Generated On: ${new Date().toLocaleString()}`],
					[]
				];
				const worksheet = XLSX.utils.json_to_sheet(exportData);
				const csvData = XLSX.utils.sheet_to_csv(worksheet);
				const csvHeader = headerRows.map(row => row.join(",")).join("\n") + "\n";
				const csv = csvHeader + csvData;

				const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
				const link = document.createElement('a');
				link.href = URL.createObjectURL(blob);
				link.download = 'Trip_List.csv';
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			} else if (fileFormat === "pdf") {
				const doc = new jsPDF();

				// Header details
				doc.setFontSize(14);
				doc.text('Trip List', 14, 16);
				doc.setFontSize(10);
				doc.text(`Exported By: ${exportedByValue}`, 14, 24);
				doc.text(`Generated On: ${new Date().toLocaleString()}`, 14, 30);

				// Table content
				autoTable(doc, {
					head: [['Driver', 'Passanger', 'Trip Type', 'Started At', 'Ended At', 'Ended By', 'Status']],
					body: allUsers.map(user => [
						user.driver?.first_name ?? 'NA',
						user.passenger?.first_name ?? 'NA',
						user.trip_type?.tripTypeName ?? 'NA',
						format(user.createdAt, "HH:mm:ss - dd/MM/yyyy") ?? 'NA',
						user.trip_status === 'ended' ? format(user.endedAt, "HH:mm:ss - dd/MM/yyyy") : '---',
						user.ended_by ?? 'NA',
						user.trip_status ?? 'NA'
					]),
					startY: 36,
					theme: 'striped',
					headStyles: { fillColor: '#367BE0' },
					styles: { fontSize: 10 },
					margin: { top: 20 }
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
							<Button
								onClick={() => nav('/home/total-linked-trips/view-archeived')}
								variant="contained"
								sx={{ height: '40px', fontSize: '0.8rem', backgroundColor: '#367BE0', width: '180px', borderRadius: '8px' }}
								startIcon={<img src={ViewBtn} alt="View" />}>
								View Archeived
							</Button>
						</Box>
					</Grid>
				</Grid>

				<Box sx={{ px: { xs: 0, md: 2 }, pt: { xs: 0, md: 3 }, backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
					<TableContainer>
						<Table sx={{ '& .MuiTableCell-root': { fontSize: '15px' } }}>
							<TableHead sx={{ backgroundColor: '#f5f5f5' }}>
								<TableRow>
									<TableCell sx={{ color: '#4B5563' }}>
										<TableSortLabel
											id="driver_name"
											active={sortBy === 'driver_name'}
											direction={sortOrder}
											onClick={changeSortOrder}
											IconComponent={() => (
												<img
													src={sortBy === 'driver_name' ? (sortOrder === 'asc' ? arrowup : arrowdown) : arrownuteral}
													style={{ marginLeft: 5 }}
													alt=""
												/>
											)}
										>
											Driver
										</TableSortLabel>
									</TableCell>
									<TableCell sx={{ color: '#4B5563' }}>
										<TableSortLabel
											id="passenger_name"
											active={sortBy === 'passenger_name'}
											direction={sortOrder}
											onClick={changeSortOrder}
											IconComponent={() => (
												<img
													src={sortBy === 'passenger_name' ? (sortOrder === 'asc' ? arrowup : arrowdown) : arrownuteral}
													style={{ marginLeft: 5 }}
													alt=""
												/>
											)}
										>
											Passenger
										</TableSortLabel>
									</TableCell>
									<TableCell sx={{ color: '#4B5563' }}>
										<TableSortLabel
											id="trip_type"
											active={sortBy === 'trip_type'}
											direction={sortOrder}
											onClick={changeSortOrder}
											IconComponent={() => (
												<img
													src={sortBy === 'trip_type' ? (sortOrder === 'asc' ? arrowup : arrowdown) : arrownuteral}
													style={{ marginLeft: 5 }}
													alt=""
												/>
											)}
										>
											Trip Type
										</TableSortLabel>
									</TableCell>
									<TableCell sx={{ color: '#4B5563' }}>
										<TableSortLabel
											id="created_at"
											active={sortBy === 'created_at'}
											direction={sortOrder}
											onClick={changeSortOrder}
											IconComponent={() => (
												<img
													src={sortBy === 'created_at' ? (sortOrder === 'asc' ? arrowup : arrowdown) : arrownuteral}
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
											id="ended_by"
											active={sortBy === 'ended_by'}
											direction={sortOrder}
											onClick={changeSortOrder}
											IconComponent={() => (
												<img
													src={sortBy === 'ended_by' ? (sortOrder === 'asc' ? arrowup : arrowdown) : arrownuteral}
													style={{ marginLeft: 5 }}
													alt=""
												/>
											)}
										>
											Ended By
										</TableSortLabel>
									</TableCell>
									<TableCell sx={{ color: '#4B5563' }}>
										<TableSortLabel
											id="trip_status"
											active={sortBy === 'trip_status'}
											direction={sortOrder}
											onClick={changeSortOrder}
											IconComponent={() => (
												<img
													src={sortBy === 'trip_status' ? (sortOrder === 'asc' ? arrowup : arrowdown) : arrownuteral}
													style={{ marginLeft: 5 }}
													alt=""
												/>
											)}
										>
											Status
										</TableSortLabel>
									</TableCell>
									<TableCell sx={{ color: '#4B5563' }}>Actions</TableCell>
								</TableRow>
							</TableHead>

							<TableBody>
								{trip.isFetching && tripList.length === 0 ? (
									<TableRow>
										<TableCell sx={{ color: '#4B5563', borderBottom: 'none' }} colSpan={7} align="center">
											<Loader />
										</TableCell>
									</TableRow>
								) : tripList.length > 0 ? (
									<>
										{trip.isFetching && (
											<TableRow>
												<TableCell sx={{ color: '#4B5563', borderBottom: 'none' }} colSpan={7} align="center">
													<Loader />
												</TableCell>
											</TableRow>
										)}
										{tripList.map((data) => {
											const [startlat, startlong] = data?.trip_start?.split(",") || [];
											const [endlat, endlong] = data?.trip_end?.split(",") || [];
											const location = { startlat, startlong, endlat, endlong };

											return data?.linkedPassengers?.map((item, i) => (
												<CustomTableRow
													key={`${data._id}-${item?._id ?? i}`}
													id={data._id}
													data={item}
													location={location}
													showcopassenger={i === 0 && data?.linkedPassengers?.length > 1}
													driver={data?.driver}
													tripType={data?.trip_type?.tripTypeName}
													tripstatus={data?.trip_status}
													isCopassenger={i > 0}
													confirmation={confirmation}
													setConfirmation={setConfirmation}
													updateTripMutation={updateTripMutation}
													viewcopassenger={viewcopassenger}
													setViewcopassenger={setViewcopassenger}
												/>
											));
										})}
									</>
								) : (
									<TableRow>
										<TableCell sx={{ color: '#4B5563', borderBottom: 'none' }} colSpan={7} align="center">
											<Typography align="center" color="text.secondary" sx={{ mt: 2 }}>
												No data found
											</Typography>
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</TableContainer>

					{tripList.length > 0 && <Grid container justifyContent="space-between" alignItems="center" mt={2}>
						<Grid item>
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
										<MenuItem key={num} value={num}>{num}</MenuItem>
									))}
								</Select>
							</Typography>
						</Grid>
						<Grid item>
							<Box display="flex" alignItems="center" gap={2}>
								<Typography variant="body2">{page} / {totalPages}</Typography>
								<IconButton disabled={page === 1} onClick={() => updateParams({page:page - 1})}>
									<NavigateBeforeIcon fontSize="small" />
								</IconButton>
								<IconButton disabled={page === totalPages} onClick={() => updateParams({page:page + 1})}>
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

export default ListOfTrips;

const CustomTableRow = ({
	id,
	data,
	driver,
	tripstatus,
	location,
	showcopassenger,
	updateTripMutation,
	confirmation,
	setConfirmation,
	tripType,
	viewcopassenger,
	setViewcopassenger,
	isCopassenger = false
}) => {

	const role = localStorage.getItem("role");
	const nav = useNavigate();

	const handleViewCopassenger = () => {
		if (setViewcopassenger) {
			setViewcopassenger(prev => {
				if (prev && prev.includes(id)) {
					return prev.filter(item => item !== id); // remove id if present
				} else {
					return [...(prev || []), id]; // add id if not present
				}
			});
		}
	}

	if (isCopassenger && !viewcopassenger?.includes(id)) return null;

	const formatDateTime = (value) => {
		if (!value) return null;
		const d = value instanceof Date ? value : new Date(value);
		if (Number.isNaN(d.getTime())) return null;
		return format(d, "HH:mm:ss - dd/MM/yyyy");
	};

	const formatEndedByLocal = (raw) => {
		if (!raw) return "-";
		const value = String(raw).toLowerCase();
		if (value === "admin_super" || value === "admit_super") return "Admin Super";
		if (value === "admin") return "Admin";
		if (value === "passenger") return "Passenger";
		if (value === "driver") return "Driver";
		return value
			.split("_")
			.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
			.join(" ");
	};

	const handleView = (user) => {
		saveScrollPosition("tripListScroll");
		nav(`/home/total-linked-trips/location?lat=${user?.startlat}&long=${user?.startlong}&end_lat=${user?.endlat}&end_long=${user?.endlong}`)
	};
	// Handle Scroll Event store 
	useEffect(() => {
		if (data) {
			restoreScrollPosition("tripListScroll");
		}
	}, [data]);

	return (
		<TableRow key={data._id}>
			<TableCell sx={{ textWrap: 'nowrap' }}>
				{!isCopassenger && <Link className="link2" to={`/home/total-drivers/driver-information/${driver._id}`}>
					{driver.first_name} {driver.last_name}
				</Link>}
			</TableCell>

			<TableCell sx={{ textWrap: 'nowrap' }}>
				<Link className="link2" to={`/home/total-linked-trips/user-information/${data._id}`}>
					{data.first_name} {data.last_name}
				</Link>
			</TableCell>

			<TableCell sx={{ color: '#FF7043' }}>
				{tripType || data?.trip_type?.tripTypeName || "-"}
			</TableCell>

			<TableCell sx={{ textWrap: 'nowrap' }}>
				{formatDateTime(data?.joinedAt) ?? "-"}
			</TableCell>

			<TableCell sx={{ textWrap: 'nowrap' }}>
				{formatDateTime(data?.endedAt) ?? "---"}
			</TableCell>

			<TableCell>
				{formatEndedByLocal(data?.ended_by)}
			</TableCell>

			<TableCell>
				<Chip
					label={tripstatus}
					sx={{
						backgroundColor:
							tripstatus === 'ended' ? '#367BE01A' :
								tripstatus === 'flagged' ? '#F59E0B1A' :
									tripstatus === 'linked' ? '#DCFCE7' :
										'#F3F4F6',
						'& .MuiChip-label': {
							textTransform: 'capitalize',
							fontWeight: 500,
							color: tripstatus === 'ended' ? '#367BE0' :
								tripstatus === 'flagged' ? '#F59E0B' :
									tripstatus === 'started' ? '#166534' :
										'black',
						}
					}}
				/>
			</TableCell>

			<TableCell>
				<Box sx={{
					justifyContent: 'start',
					display: 'flex',
					flexDirection: 'row',
				}}>
					<Tooltip title="VIew" arrow placement="top">
						<IconButton onClick={() => handleView(location)}>
							<img src={ViewBtn} alt="View" />
						</IconButton>
					</Tooltip>

					{showcopassenger && <Tooltip title="View Co-Passengers" arrow placement="top">
						<IconButton onClick={handleViewCopassenger}>
							<img src={copassangerBtn} alt="co-passengers" />
						</IconButton>
					</Tooltip>}

					{!isCopassenger && <Tooltip title="Archive" arrow placement="top">
						<IconButton onClick={() => {
							updateTripMutation.mutate({
								id: id,
								data: { isArchived: true }
							});
						}}>
							<img src={Listtrip} alt="view button" />
						</IconButton>
					</Tooltip>}

					{!isCopassenger && role !== 'company' && (
						<Tooltip title="Delete" arrow placement="top">
							<IconButton onClick={() => setConfirmation(id)}>
								<img src={delBtn} alt="Delete" />
							</IconButton>
						</Tooltip>
					)}

				</Box>
				{confirmation === id && (
					<DeleteConfirm id={id} setconfirmation={setConfirmation} trip="trip" />
				)}
			</TableCell>
		</TableRow>
	)
}