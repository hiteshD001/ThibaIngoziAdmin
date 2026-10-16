import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
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

const formatDate = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d.getTime())) return String(date);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const RISK_LEVELS = {
  0: { text: "0 Very High Risk", tone: RED },
  1: { text: "1 High Risk", tone: RED },
  2: { text: "2 Medium Risk", tone: { bg: "#F9731626", color: "#EA580C", border: "#F9731626" } },
  3: { text: "3 Low Risk", tone: { bg: "#F59E0B26", color: "#D97706", border: "#F59E0B26" } },
  4: { text: "4 Very Low Risk", tone: { bg: "#84CC1626", color: "#65A30D", border: "#84CC1626" } },
  5: { text: "5 Minimal Risk", tone: GREEN },
};
const RISK_UNKNOWN = { text: "Unknown", tone: { bg: "#F3F4F6", color: "#6B7280", border: "#E5E7EB" } };

const getRiskBadge = (score) => {
  const level = score === "" || score == null ? undefined : RISK_LEVELS[Number(score)];
  const { text, tone } = level || RISK_UNKNOWN;
  return { badge: text, tone, iconTone: tone, plainBadge: true };
};

const buildRows =(data = {}) => [
  {
    icon: PhoneAndroidOutlinedIcon,
    label: "Phone Number Verified",
    badge: data.mobile_number_verified ? "Passed" : "Failed",
    tone: data.mobile_number_verified ? GREEN : RED,
  },
  {
    icon: BadgeOutlinedIcon,
    label: "Identity Match",
    badge: data.mobile_number_verified ? "Passed" : "Failed",
    tone: data.mobile_number_verified ? GREEN : RED,
  },
  {
    icon: SignalCellularAltOutlinedIcon,
    label: "RICA / network status",
    badge: data.rica_network_status ? "Verified" : "Not Verified",
    tone: data.rica_network_status ? GREEN : RED,
  },
  {
    icon: SimCardOutlinedIcon,
    label: "IMEI/Phone Number Match",
    badge: data.IMEI_number_is_match ? "Pass" : "Fail",
    tone: data.IMEI_number_is_match ? GREEN : RED,
  },
  {
    icon: HomeOutlinedIcon,
    label: "Address recorded",
    badge: data.address_recorded ? "Confirmed" : "Not Recorded",
    tone: data.address_recorded ? GREEN : RED,
  },
  { icon: WifiTetheringOutlinedIcon, label: "Network", value: data.network || "-" },
  { icon: TaskOutlinedIcon, label: "Verification reference", value: data.verification_reference || "-" },
  { icon: CalendarMonthOutlinedIcon, label: "Verified on", value: formatDate(data.verified_on) },
  { icon: SyncOutlinedIcon, label: "Last Sim Swap Date", value: formatDate(data.swapDate) },
  { icon: SmartphoneOutlinedIcon, label: "Device Description", value: data.device || "-" },
  { icon: SimCardOutlinedIcon, label: "SIM Identifier (IMSI)", value: data.imsi || "-" },
  { icon: WarningAmberOutlinedIcon, label: "Risk Score", ...getRiskBadge(data.score) },
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

export default function NetworkIdentity({ user }) {
  const isVerified = !!user?.isUerNetworkIdentify;
  const rows = buildRows(user?.networkIdentify);
  const pdfUrl = user?.networkIdentify?.pdfUrl;

  return (
    <Paper
      elevation={2}
      sx={{ backgroundColor: "#FFFFFF", p: 2, borderRadius: "12px", fontFamily: "Montserrat" }}
    >
      {/* Verified / Not verified banner */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
          py: 0.75,
          mb: isVerified ? 2 : 0,
          borderRadius: "8px",
          backgroundColor: isVerified ? "#ECFDF3" : RED.bg,
          border: `1px solid ${isVerified ? "#A7F3D0" : RED.border}`,
        }}
      >
        {isVerified ? (
          <CheckCircleIcon sx={{ fontSize: 16, color: "#166534" }} />
        ) : (
          <CancelIcon sx={{ fontSize: 16, color: RED.color }} />
        )}
        <Typography fontSize="12px" fontWeight={600} color={isVerified ? "#166534" : RED.color}>
          {isVerified ? "Network Identity Verified" : "Network Identity Not Verified"}
        </Typography>
      </Box>

      {isVerified && (<>

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
                <Badge text={row.plainBadge ? row.badge : '✓ ' + row.badge} tone={row.tone} />
              ) : (
                <Typography fontSize="10px" fontWeight={600} color="#4B5563" sx={{ maxWidth: "55%", textAlign: "right", whiteSpace: "normal", wordBreak: "break-word" }}>
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
          cursor: pdfUrl ? "pointer" : "default",
        }}
        onClick={() => pdfUrl && window.open(pdfUrl, "_blank", "noopener,noreferrer")}
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
      </>)}
    </Paper>
  );
}
