import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, Typography, Box, Tabs, Tab, Card, Button, Divider, IconButton, } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import * as XLSX from 'xlsx';
import { useGetUserWiseTransactionHistory } from "../../API Calls/API";
import {formatDateTime } from '../../common/commonFn';
import { toast } from "react-toastify";

// const transactions = [
//   {
//     title: "Medical Emergency Assistance",
//     amount: "-R 5.00",
//     status: "Success",
//     payment: "Card Payment",
//     txn: "REP001235",
//     date: "5 Jan 2025, 10:30 AM",
//     color: "#FDECEC",
//     icon: <FavoriteIcon sx={{ color: "#E53935" }} />,
//   },
//   {
//     title: "Accident response",
//     amount: "+R 5.00",
//     status: "Success",
//     payment: "Card Payment",
//     txn: "REP001235",
//     date: "5 Jan 2025, 10:30 AM",
//     color: "#EAF8EE",
//     icon: <DirectionsCarIcon sx={{ color: "#F39C12" }} />,
//   },
//   {
//     title: "Rider Payment Issue",
//     amount: "-R 5.00",
//     status: "Success",
//     payment: "Card Payment",
//     txn: "REP001235",
//     date: "5 Jan 2025, 10:30 AM",
//     color: "#FDECEC",
//     icon: <ErrorOutlineIcon sx={{ color: "#26A69A" }} />,
//   },
//   {
//     title: "Mechanical breakdown",
//     amount: "-R 300",
//     status: "Failed",
//     payment: "Card Payment",
//     txn: "REP001235",
//     date: "5 Jan 2025, 10:30 AM",
//     color: "#EAF8EE",
//     icon: <BuildIcon sx={{ color: "#F4C542" }} />,
//   },
// ];

export default function TransactionHistoryPopup({ open, onClose, user }) {
    const [tab, setTab] = useState(0);

    const UserList = useGetUserWiseTransactionHistory("subscription transaction list",tab === 0 ? 'weekly' : tab === 1 ? 'monthly' : 'all' ,user?._id);
    const transactions = UserList.data?.data?.data || [];
    const totalSOSSpend = UserList.data?.data?.totalSOSSpend || 0;
    const totalEnrolmentReceived = user?.influencer?.totalEarnedAmount || 0;
    
    // Handle Export
    const handleExport = async () => {
        try {
            const allUsers = transactions || [];
            if (!allUsers.length) {
                toast.warning("No data found for this period.");
                return;
            }

            const exportData = allUsers.map(user => ({
                "Title": `${user?.notificationType?.display_title || ''}`.trim(),
                "Amount": `-R ${user?.amount || 0}`,
                "Payment Method": `${user.paymentMethod}`,
                "Date": `${formatDateTime(user.createdAt,"MMM DD, YYYY")}`,
               
            }));

            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const columnWidths = Object.keys(exportData[0] || {}).map((key) => ({
                wch: Math.max(key.length, ...exportData.map((row) => String(row[key] ?? 'NA').length)) + 2
            }));
            worksheet['!cols'] = columnWidths;
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "transactions");
            XLSX.writeFile(workbook, "transactions_List.xlsx");

        } catch (err) {
            console.error("Error exporting data:", err);
            toast.error("Export failed.");
        }
    };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          p: 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography fontWeight={700} fontSize={24}>
          Transaction History - {user?.first_name} {user?.last_name}
        </Typography>

        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>

        <Tabs
          value={tab}
          onChange={(e, v) => setTab(v)}
          centered
          sx={{
            mb: 3,
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
            },
          }}
        >
          <Tab label="Weekly" />
          <Tab label="Monthly" />
          <Tab label="All Time" />
        </Tabs>

        <Box
          display="flex"
          gap={2}
          mb={3}
        >
          <Card
            sx={{
              flex: 1,
              p: 2,
              borderRadius: 3,
            }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <ArrowDownwardIcon color="success" />
              <Typography variant="body2">
                Total Enrolment Received
              </Typography>
            </Box>

            <Typography
              color="success.main"
              fontWeight={700}
              fontSize={24}
            >
              R {Number(totalEnrolmentReceived || 0).toLocaleString()}
            </Typography>
          </Card>

          <Card
            sx={{
              flex: 1,
              p: 2,
              borderRadius: 3,
            }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <ArrowUpwardIcon color="error" />
              <Typography variant="body2">
                Total SOS Spend
              </Typography>
            </Box>

            <Typography
              color="error.main"
              fontWeight={700}
              fontSize={24}
            >
                R {Number(totalSOSSpend || 0).toLocaleString()}
            </Typography>
          </Card>
        </Box>

        <Box
          sx={{
            maxHeight: 380,
            overflow: "auto",
          }}
        >
          {transactions.length > 0 ? transactions.map((item, index) => (
            <Card
              key={index}
              sx={{
                p: 2,
                mb: 2,
                // background: item.color,
                background: '#FEE2E2',
                borderRadius: 3,
                boxShadow: "none",
              }}
            >
              <Box display="flex" justifyContent="space-between">

                <Box display="flex" gap={2} >

                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: "50%",
                      bgcolor: "#fff",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <img src={item.icon} height={'40px'} width={'40px'} alt="ReportIcon" />
                  </Box>

                  <Box>
                    <Typography fontWeight={700}>
                      {item?.notificationType?.display_title}
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {formatDateTime(item.createdAt,"MMM DD, YYYY")}
                    </Typography>
                  </Box>

                </Box>

                <Box textAlign="right">

                  <Typography
                    fontWeight={700}
                    // color={item.amount.includes("+") ? "success.main" : "error.main"}
                    color={"error.main"}
                  >
                    -R {item.amount || 0}
                  </Typography>

                  <Typography
                    variant="caption"
                    color={item.status === "Success"? "success.main": "error.main"}
                  >
                    {item.status}
                  </Typography>

                </Box>

              </Box>

              <Divider sx={{ my: 1.5 }} />

              <Box
                display="flex"
                justifyContent="space-between"
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  {item.paymentMethod}
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  TXN: {item.paymentRef || '-'}
                </Typography>
              </Box>
            </Card>
          )) : <Box display="flex" justifyContent="center" alignItems="center" width="100%" height="100%" gap={1}><Typography> No Data Found</Typography></Box>}

        </Box>

        <Button
          fullWidth
          startIcon={<DownloadIcon />}
          variant="contained"
          sx={{
            mt: 2,
            borderRadius: 3,
            height: 52,
            textTransform: "none",
            fontWeight: 600,
          }}
          onClick={handleExport}
        >
          Download Statement
        </Button>

      </DialogContent>
    </Dialog>
  );
}