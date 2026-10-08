import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PhoneAndroidOutlinedIcon from "@mui/icons-material/PhoneAndroidOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import SignalCellularAltOutlinedIcon from "@mui/icons-material/SignalCellularAltOutlined";
import SimCardOutlinedIcon from "@mui/icons-material/SimCardOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import WifiTetheringOutlinedIcon from "@mui/icons-material/WifiTetheringOutlined";
import TaskOutlinedIcon from "@mui/icons-material/TaskOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import SyncOutlinedIcon from "@mui/icons-material/SyncOutlined";
import SmartphoneOutlinedIcon from "@mui/icons-material/SmartphoneOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const GREEN = { bg: "#ECFDF3", color: "#166534", border: "#BBF7D0" };
const RED = { bg: "#EF444426", color: "#EF4444", border: "#EF444426" };
const NEUTRAL = { bg: "#367BE026", color: "#367BE0", border: "#E2E8F0" };

const rows = [
  { icon: PhoneAndroidOutlinedIcon, label: "Phone Number Verified", badge: "Passed", tone: GREEN },
  { icon: BadgeOutlinedIcon, label: "Identity Match", badge: "Passed", tone: GREEN },
  { icon: SignalCellularAltOutlinedIcon, label: "RICA / network status", badge: "Verified", tone: GREEN },
  { icon: SimCardOutlinedIcon, label: "IMEI/Phone Number Match", badge: "Pass", tone: GREEN },
  { icon: HomeOutlinedIcon, label: "Address recorded", badge: "Confirmed", tone: GREEN },
  { icon: WifiTetheringOutlinedIcon, label: "Network", value: "Vodacom" },
  { icon: TaskOutlinedIcon, label: "Verification reference", value: "TI-DRV-20384" },
  { icon: CalendarMonthOutlinedIcon, label: "Verified on", value: "29 Sep 2026" },
  { icon: SyncOutlinedIcon, label: "Last Sim Swap Date", value: "10 Oct 2026" },
  { icon: SmartphoneOutlinedIcon, label: "Device Description", value: "iPhone 15 Pro Max" },
  { icon: SimCardOutlinedIcon, label: "SIM Identifier (IMSI)", value: "X4325" },
  { icon: WarningAmberOutlinedIcon, label: "Risk Score", badge: "Very High Risk", tone: RED, iconTone: RED },
];

const Badge = ({ text, tone }) => (
  <Box
    sx={{
      px: 0.75,
      py: "1px",
      borderRadius: "9999px",
      backgroundColor: tone.bg,
      border: `1px solid ${tone.border}`,
      color: tone.color,
      fontSize: "9px",
      fontWeight: 500,
      whiteSpace: "nowrap",
    }}
  >
    {text}
  </Box>
);

export default function NetworkIdentity() {
  return (
    <Paper
      elevation={2}
      sx={{ backgroundColor: "#FFFFFF", p: 2, borderRadius: "12px", fontFamily: "Montserrat" }}
    >
      {/* Verified banner */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
          py: 0.75,
          mb: 2,
          borderRadius: "8px",
          backgroundColor: "#ECFDF3",
          border: "1px solid #A7F3D0",
        }}
      >
        <CheckCircleIcon sx={{ fontSize: 16, color: '#166534' }} />
        <Typography fontSize="12px" fontWeight={600} color="#166534">
          Network Identity Verified
        </Typography>
      </Box>

      {/* Check rows */}
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        {rows.map((row, index) => {
          const Icon = row.icon;
          const iconTone = row.iconTone || NEUTRAL;
          return (
            <Box
              key={row.label}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                py: 1,
                borderBottom: index < rows.length - 1 ? "1px solid #F1F5F9" : "none",
              }}
            >
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "6px",
                  backgroundColor: iconTone.bg,
                  border: `1px solid ${iconTone.border}`,
                }}
              >
                <Icon sx={{ fontSize: 15, color: iconTone.color }} />
              </Box>
              <Typography fontSize="12px" fontWeight={500} color="#0E0E0E" sx={{ flex: 1 }}>
                {row.label}
              </Typography>
              {row.badge ? (
                <Badge text={'✓ ' + row.badge} tone={row.tone} />
              ) : (
                <Typography fontSize="10px" fontWeight={600} color="#4B5563" sx={{ whiteSpace: "nowrap" }}>
                  {row.value}
                </Typography>
              )}
            </Box>
          );
        })}
      </Box>

      {/* Print compliance record */}
      <Box
        sx={{
          mt: 2,
          p: 1.5,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          borderRadius: "10px",
          backgroundColor: "#F3F4F6",
          cursor: "pointer",
        }}
      >
        <Box
          sx={{
            width: 28,
            height: 28,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "6px",
            backgroundColor: "#fff",
            border: "1px solid #E2E8F0",
          }}
        >
          <DescriptionOutlinedIcon sx={{ fontSize: 16, color: "#64748B" }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography fontSize="12px" fontWeight={400} color="#0E0E0E">
            Print Compliance Record
          </Typography>
          <Typography fontSize="9px" color="#94A3B8">
            Ready to share with your platform or regulator.
          </Typography>
        </Box>
        <ChevronRightIcon sx={{ fontSize: 18, color: "#94A3B8" }} />
      </Box>
    </Paper>
  );
}
