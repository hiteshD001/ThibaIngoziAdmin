import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Divider,
  IconButton,
} from "@mui/material";
import { useGetTestSosTransactions } from "../../API Calls/API";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const LIMIT = 4;

const formatDateTime = (date) => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";
  const day = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return `${day} at ${time}`;
};

export default function TestTransaction({ user }) {
  const [page, setPage] = useState(1);
  const { data: response, isFetching } = useGetTestSosTransactions(user?.user_id, page, LIMIT);

  const result = response?.data;
  const total = result?.totaldata || 0;
  const totalPages = result?.totalPages || 1;
  const transactions = (result?.data || []).map((item) => ({
    title: item.test_device_type || "Panic Button Hardware Test",
    date: formatDateTime(item.createdAt),
    status: item.status === "success" ? "Success" : "Failed",
  }));
  const rangeStart = total ? (page - 1) * LIMIT + 1 : 0;
  const rangeEnd = Math.min(page * LIMIT, total);

  return (
    <>
      <Paper
        elevation={2}
        sx={{ backgroundColor: "#FFFFFF", p: 2, borderRadius: "12px", fontFamily: "Montserrat" }}
      >
        <Box
          sx={{
            px: 3,
            py: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #E5E7EB",
            fontFamily: 'Montserrat'
          }}
        >
          <Typography variant="h6" fontWeight={600} fontSize="1.1rem">
            Test Transactions
          </Typography>
          <Box sx={{ px: 3, backgroundColor: "#F9FAFB", borderRadius: "10px", p: 1 }}>
            <Typography fontSize="12px" fontWeight={400} color="#94A3B8">
              Last updated: Just now
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ borderColor: "#F3F4F6" }} />
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          {!isFetching && transactions.length === 0 && (
            <Typography fontSize="13px" color="#6B7280" fontFamily="Montserrat" sx={{ px: 3, py: 2 }}>
              No test transactions found.
            </Typography>
          )}
          {transactions.map((item, index) => (
            <React.Fragment key={index}>
              <Box
                sx={{
                  px: 3,
                  py: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontFamily: "Montserrat",
                }}
              >
                <Box>
                  <Typography fontSize="15px" fontWeight={600} color="#111827" fontFamily="Montserrat">
                    {item.title}
                  </Typography>
                  <Typography fontSize="13px" fontWeight={400} color="#6B7280" mt={0.5} fontFamily="Montserrat">
                    {item.date}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    borderRadius: "999px",
                    backgroundColor: item.status === "Success" ? "#E8F7EE" : "#FDE8EC",
                  }}
                >
                  <Typography
                    fontSize="12px"
                    fontWeight={500}
                    color={item.status === "Success" ? "#166534" : "#DC2626"}
                    fontFamily="Montserrat"
                  >
                    {item.status}
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ borderColor: "#F3F4F6" }} />
            </React.Fragment>
          ))}
          <Box
            sx={{
              px: 3,
              py: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography fontSize="13px" fontWeight={400} color="#6B7280" fontFamily="Montserrat">
              {rangeStart}-{rangeEnd} of {total}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, color: "#6B7280" }}>
              <IconButton size="small" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeftIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                <ChevronRightIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Paper>
    </>
  );
}
