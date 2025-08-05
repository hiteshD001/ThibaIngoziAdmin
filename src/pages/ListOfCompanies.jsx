import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, TextField, Button, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, Grid, InputAdornment, Stack, Select, MenuItem,
} from "@mui/material";
// import plus from '../assets/images/plus.svg'
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import whiteplus from '../assets/images/whiteplus.svg';
import ViewBtn from '../assets/images/ViewBtn.svg'
import delBtn from '../assets/images/delBtn.svg'
// import icon from "../assets/images/icon.png";
import search from '../assets/images/search.svg';
// import Prev from "../assets/images/left.png";
// import Next from "../assets/images/right.png";
import nouser from "../assets/images/NoUser.png";

import { useGetUserList } from "../API Calls/API";
import { DeleteConfirm } from "../common/ConfirmationPOPup";
import Loader from "../common/Loader";

const ListOfCompanies = () => {
  const nav = useNavigate();

  const [filter, setfilter] = useState("");
  const [confirmation, setconfirmation] = useState("");

  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const companyList = useGetUserList("company list", "company", "", currentPage, rowsPerPage, filter)
  const totalCompany = companyList.data?.data?.totalUsers || 0;
  const totalPages = Math.ceil(totalCompany / rowsPerPage);
  return (
    <Box p={2}>
      <Paper elevation={3} sx={{ backgroundColor: "rgb(253, 253, 253)", padding: 2, borderRadius: '10px' }}>
        <Grid container justifyContent="space-between" alignItems="center" mb={2}>
          <Grid size={{ xs: 12, md: 5 }} sx={{ display: 'flex', flexDirection: 'row', gap: 2, mb: { xs: 1, md: 0 } }}>
            <Typography variant="h6" fontWeight={590}>Onboarded Companies</Typography>
            <Typography variant="h6" fontWeight={550}>
              {companyList.isSuccess ? companyList.data?.data.totalUsers : 0}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 7 }} sx={{ display: 'flex', justifyContent: 'flex-end', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>

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
        {companyList.isFetching ? (
          <Loader />
        ) : companyList.data?.data.users?.length > 0 ? (
          <Box sx={{ px: { xs: 0, md: 2 }, pt: { xs: 0, md: 3 }, backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
            <TableContainer >
              <Table sx={{ '& .MuiTableCell-root': { fontSize: '15px' } }}>
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow >
                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', borderTopLeftRadius: '10px' }}>Company</TableCell>
                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>User name</TableCell>
                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Contact No.</TableCell>
                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Contact Email</TableCell>
                    <TableCell align="center" sx={{ backgroundColor: '#F9FAFB', borderTopRightRadius: '10px', color: '#4B5563' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {companyList.data?.data.users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell sx={{ color: '#4B5563' }}>

                        {user.company_name || "-"}

                      </TableCell>
                      <TableCell sx={{ color: '#4B5563' }}>
                        <Stack direction="row" alignItems="center" gap={1}>
                          <Avatar
                            src={user.profileImage || nouser}
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

                      <TableCell >
                        <Box sx={{
                          justifyContent: 'center',
                          display: 'flex',
                          flexDirection: 'row',
                        }}>
                          <IconButton onClick={() =>
                            nav(`/home/total-companies/company-information/${user?._id}`)
                          }>
                            <img src={ViewBtn} alt="view button" />
                          </IconButton>
                          <IconButton onClick={() => setconfirmation(user?._id)}>
                            <img src={delBtn} alt="delete button" />
                          </IconButton>
                          {confirmation === user?._id && (
                            <DeleteConfirm id={user?._id} setconfirmation={setconfirmation} />
                          )}
                        </Box>


                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

            </TableContainer>
            <Grid container sx={{ px: { xs: 0, sm: 1 } }} justifyContent="space-between" alignItems="center" mt={2}>
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
                    {[5, 10, 15, 20].map((num) => (
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

export default ListOfCompanies;
