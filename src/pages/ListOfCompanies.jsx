import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useDebounce from "../hooks/useDebounce";
import {
  Box, Typography, TextField, Button, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, Grid, InputAdornment, Stack, Select, MenuItem,
  Tooltip,
  TableSortLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
// import plus from '../assets/images/plus.svg'
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import whiteplus from '../assets/images/whiteplus.svg';
import ViewBtn from '../assets/images/ViewBtn.svg'
import delBtn from '../assets/images/delBtn.svg'
// import icon from "../assets/images/icon.png";
import search from '../assets/images/search.svg';
import arrowup from '../assets/images/arrowup.svg';
import arrowdown from '../assets/images/arrowdown.svg';
import arrownuteral from '../assets/images/arrownuteral.svg';
// import Prev from "../assets/images/left.png";
// import Next from "../assets/images/right.png";
import nouser from "../assets/images/NoUser.png";
import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable'
import * as XLSX from 'xlsx';
import { toast } from "react-toastify";
import CustomExportMenu from '../common/Custom/CustomExport'
import { useGetUserList } from "../API Calls/API";
import { DeleteConfirm } from "../common/ConfirmationPOPup";
import Loader from "../common/Loader";
import CustomDateRangePicker from "../common/Custom/CustomDateRangePicker";
import apiClient from '../API Calls/APIClient'
import calender from '../assets/images/calender.svg';
import { startOfYear } from "date-fns";


const ListOfCompanies = () => {
  const nav = useNavigate();
  const [range, setRange] = useState([
    {
      startDate: startOfYear(new Date()),
      endDate: new Date(),
      key: 'selection'
    }
  ]);

  // Sort
  const [sortBy, setSortBy] = useState("company_name");
  const [sortOrder, setSortOrder] = useState("asc");

  const changeSortOrder = (e) => {
    const field = e.target.id;

    if (field !== sortBy) {
      setSortBy(field);
      setSortOrder("asc");
    } else {
      setSortOrder(p => p === 'asc' ? 'desc' : 'asc')
    }
  }

  const [filter, setfilter] = useState("");
  const debouncedFilter = useDebounce(filter, 500); // 500ms delay for search
  const [confirmation, setconfirmation] = useState("");
  const [status, setStatus] = useState("");
  const [statusUpdate, setStatusUpdate] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [statusConfirmation, setStatusConfirmation] = useState({ show: false, userId: null, newStatus: null });

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const startDate = range[0].startDate.toISOString();
  const endDate = range[0].endDate.toISOString();
  const companyList = useGetUserList("company list", "company", "", currentPage, rowsPerPage, debouncedFilter, "", startDate, endDate, sortBy, sortOrder)
  const totalCompany = companyList.data?.data?.totalUsers || 0;
  const totalPages = Math.ceil(totalCompany / rowsPerPage);

  const handleStatusUpdate = async () => {
    const { userId, newStatus } = statusConfirmation;
    
    try {
      const response = await apiClient.put(`${import.meta.env.VITE_BASEURL}/users/${userId}`, {
        isActive : newStatus === 'true'
      });
      
      if (response.data) {
        toast.success(`Company status updated successfully`);
        // Refetch the company list to get updated data
        companyList.refetch();
      }
    } catch (error) {
      toast.error('Failed to update company status');
      console.error('Error updating company status:', error);
    } finally {
      setStatusConfirmation({ show: false, userId: null, newStatus: null });
    }
  };


  const handleExport = async ({ startDate, endDate, format }) => {
    try {
      const { data } = await apiClient.get(`${import.meta.env.VITE_BASEURL}/users`, {
        params: {
          role: "company",
          page: 1,
          limit: 10000,
          filter: "",
          company_id: "",
          startDate,
          endDate,
        },
      });

      const allUsers = data?.users || [];
      if (!allUsers.length) {
        toast.warning("No company data found for this period.");
        return;
      }

      const exportData = allUsers.map(user => ({
        "Company": user.company_name || '',
        "Contact Name": user.contact_name || '',
        "Contact No.": `${user.mobile_no_country_code || ''}${user.mobile_no || ''}`,
        "Contact Email": user.email || ''
      }));

      if (format === "xlsx") {
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const columnWidths = Object.keys(exportData[0] || {}).map((key) => ({
          wch: Math.max(key.length, ...exportData.map((row) => String(row[key] ?? 'NA').length)) + 2
        }));
        worksheet['!cols'] = columnWidths;
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Companies");
        XLSX.writeFile(workbook, "Companies_List.xlsx");
      }
      else if (format === "csv") {
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'company_list.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      else if (format === "pdf") {
        const doc = new jsPDF();
        doc.text('Company List', 14, 16);
        autoTable(doc, {
          head: [['Company', 'Contact Name', 'Contact No.', 'Contact Email']],
          body: allUsers.map(user => [
            user.company_name ?? 'NA',
            user.contact_name ?? 'NA',
            `${user.mobile_no_country_code || ''}${user.mobile_no || ''}` ?? 'NA',
            user.email ?? 'NA'
          ]),
          startY: 20,
          theme: 'striped',
          headStyles: { fillColor: '#367BE0' },
          margin: { top: 20 },
          styles: { fontSize: 10 },
        });
        doc.save("Companies_List.pdf");
      }

    } catch (err) {
      console.error("Error exporting data:", err);
      toast.error("Export failed.");
    }
  };
  return (
    <Box p={2}>
      <Paper elevation={3} sx={{ backgroundColor: "rgb(253, 253, 253)", padding: 2, borderRadius: '10px' }}>
        <Grid container justifyContent="space-between" alignItems="center" mb={2}>
          <Grid size={{ xs: 12, lg: 3 }} sx={{ display: 'flex', flexDirection: 'row', gap: 2, mb: { xs: 1, md: 0 } }}>
            <Typography variant="h6" fontWeight={590}>Onboarded Companies</Typography>
            <Typography variant="h6" fontWeight={550}>
              {/* {companyList.isSuccess ? companyList.data?.data.totalUsers : 0} */}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, lg: 9 }} sx={{ display: 'flex', justifyContent: 'flex-end', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mt: { xs: 2, lg: 0 } }}>

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
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <img src={search} alt="search icon" />
                  </InputAdornment>
                ),
              }}
            />
            <Box display="flex" sx={{ justifyContent: { xs: 'space-between' } }} gap={1}>
              <CustomDateRangePicker
                value={range}
                onChange={setRange}
                icon={calender}
              />
              <CustomExportMenu onExport={handleExport} />
              <Button
                variant="contained"
                sx={{ height: '40px', width: '170px', borderRadius: '8px', fontWeight: 400 }}
                onClick={() => nav("/home/total-companies/add-company")}
                startIcon={<img src={whiteplus} alt='white plus' />}
              >
                Add Company
              </Button>

            </Box>

          </Grid>
        </Grid>
        <Box sx={{ px: { xs: 0, md: 2 }, pt: { xs: 0, md: 3 }, backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
          <TableContainer >
            <Table sx={{ '& .MuiTableCell-root': { fontSize: '15px' } }}>

              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow >
                  <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', borderTopLeftRadius: '10px' }}>
                    <TableSortLabel
                      id="company_name"
                      active={sortBy === 'company_name'}
                      direction={sortOrder}
                      onClick={changeSortOrder}
                      IconComponent={() => <img src={sortBy === 'company_name' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                    >
                      Company
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
                      User name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                    <TableSortLabel
                      id="mobile_no"
                      active={sortBy === 'mobile_no'}
                      direction={sortOrder}
                      onClick={changeSortOrder}
                      IconComponent={() => <img src={sortBy === 'mobile_no' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                    >
                      Contact No.
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                    <TableSortLabel
                      id="email"
                      active={sortBy === 'email'}
                      direction={sortOrder}
                      onClick={changeSortOrder}
                      IconComponent={() => <img src={sortBy === 'email' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                    >
                      Contact Email
                    </TableSortLabel>
                  </TableCell>
                  {localStorage.getItem('role') === 'super_admin' && (
                    <TableCell align="center" sx={{ backgroundColor: '#F9FAFB', borderTopRightRadius: '10px', color: '#4B5563' }}>Status</TableCell>
                  )}
                  <TableCell align="center" sx={{ backgroundColor: '#F9FAFB', borderTopRightRadius: '10px', color: '#4B5563' }}>Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {companyList.isFetching ?
                  <TableRow>
                    <TableCell sx={{ color: '#4B5563', borderBottom: 'none' }} colSpan={5} align="center">
                      <Loader />
                    </TableCell>
                  </TableRow>
                  : (companyList.data?.data.users?.length > 0 ?
                    companyList.data?.data.users.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell sx={{ color: '#4B5563' }}>

                          {user.company_name || "-"}

                        </TableCell>
                        <TableCell sx={{ color: '#4B5563' }}>
                          <Stack direction="row" alignItems="center" gap={1}>
                            <Avatar
                              src={user?.selfieImage || nouser}
                              alt="User"
                            />

                            {user.contact_name || "-"}

                          </Stack>
                        </TableCell>

                        <TableCell sx={{ color: '#4B5563' }}>

                          {`${user?.mobile_no_country_code ?? ""}${user?.mobile_no ?? "-"}`}

                        </TableCell>
                        <TableCell sx={{ color: '#4B5563' }}>

                          {user.email || "-"}

                        </TableCell>


                        <TableCell sx={{ color: '#4B5563', minWidth: '110px' }}>
                          {localStorage.getItem('role') === 'super_admin' && (
                            <div className="select-container">
                              <select
                                name="active"
                                className="my-custom-select"
                                style={{
                                  width: '100px',
                                  padding: '7px',
                                }}
                                value={user?.isActive === true ? true : false}
                                onChange={(e) => {
                                  const newStatus = e.target.value;
                                  if (newStatus === "") return; // Don't show confirmation for placeholder
                                  
                                  setStatus(newStatus);
                                  setSelectedId(user._id);
                                  setStatusConfirmation({ show: true, userId: user._id, newStatus });
                                }}
                              >
                                <option value="" hidden> Select </option>
                                <option value="true"> Active  </option>
                                <option value="false"> Inactive </option>
                              </select>
                            </div>
                          )}
                        </TableCell>

                        <TableCell >
                          <Box sx={{
                            justifyContent: 'center',
                            display: 'flex',
                            flexDirection: 'row',
                          }}>
                            <Tooltip title="View" arrow placement="top">
                              <IconButton onClick={() =>
                                nav(`/home/total-companies/company-information/${user?._id}`)
                              }>
                                <img src={ViewBtn} alt="view button" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete" arrow placement="top">
                              <IconButton onClick={() => setconfirmation(user?._id)}>
                                <img src={delBtn} alt="delete button" />
                              </IconButton>
                            </Tooltip>
                            {confirmation === user?._id && (
                              <DeleteConfirm id={user?._id} setconfirmation={setconfirmation} />
                            )}
                          </Box>

                          {statusConfirmation.show && statusConfirmation.userId === user._id && (
                            <Dialog open={true} onClose={() => setStatusConfirmation({ show: false, userId: null, newStatus: null })} maxWidth="xs" fullWidth>
                              <DialogTitle sx={{ display: 'flex', flexDirection: 'row', gap: 1.5 }}>
                                <Typography variant="h6">Status</Typography>
                              </DialogTitle>
                              <DialogContent>
                                <Typography>{`Are you sure you want to set this company to ${statusConfirmation.newStatus === 'true' ? 'active' : 'inactive'}?`}</Typography>
                              </DialogContent>
                              <DialogActions>
                                <Button
                                  sx={{ borderRadius: '8px', color: 'black', border: '1px solid rgb(175, 179, 189)' }}
                                  variant="outlined"
                                  onClick={() => setStatusConfirmation({ show: false, userId: null, newStatus: null })}
                                >
                                  No
                                </Button>
                                <Button
                                  variant="contained"
                                  onClick={handleStatusUpdate}
                                  sx={{ backgroundColor: '#EB5757', borderRadius: '8px' }}
                                >
                                  Yes
                                </Button>
                              </DialogActions>
                            </Dialog>
                          )}


                        </TableCell>
                      </TableRow>
                    ))
                    :
                    <TableRow>
                      <TableCell sx={{ color: '#4B5563', borderBottom: 'none' }} colSpan={5} align="center">
                        <Typography align="center" color="text.secondary" sx={{ mt: 2 }}>
                          No data found
                        </Typography>
                      </TableCell>
                    </TableRow>)
                }
              </TableBody>
            </Table>

          </TableContainer>

          {!companyList.isFetching && companyList.data?.data.users?.length > 0 && <Grid container sx={{ px: { xs: 0, sm: 1 } }} justifyContent="space-between" alignItems="center" mt={2}>
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
                    color: currentPage === 1 ? '#BDBDBD !important' : '#1976d2 !important'
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
  );
};

export default ListOfCompanies;
