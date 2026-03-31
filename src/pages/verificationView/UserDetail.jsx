import React from "react";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Chip,
  Divider,
} from "@mui/material";
import BadgeIcon from "@mui/icons-material/BadgeOutlined";
import PhoneIcon from "@mui/icons-material/PhoneOutlined";
import EmailIcon from "@mui/icons-material/EmailOutlined";
import LocationOnIcon from "@mui/icons-material/LocationOnOutlined";

export default function UserDetail({ user}) {
  const {
    name = `${user.first_name} ${user.last_name}`,
    location = user.address ? user.address : "Johannesburg, South Africa",
    status = "Active User",
    avatarUrl = user.fullImage,
  } = user || {};
 
  const contactItems = [
    {
      icon: <BadgeIcon sx={{ fontSize: 18, color: "#6B7280" }} />,
      label: "ID / PASSPORT NUMBER",
      value: user.id_no,
    },
    {
      icon: <PhoneIcon sx={{ fontSize: 18, color: "#6B7280" }} />,
      label: "PHONE NUMBER",
      value: user?.mobile_no ,
    },
    {
      icon: <EmailIcon sx={{ fontSize: 18, color: "#6B7280" }} />,
      label: "EMAIL ADDRESS",
      value: user.email,
    },
  ];

  return (
    <Paper
      elevation={2}
      sx={{
        maxWidth: 260,
        borderRadius: "12px",
        overflow: "hidden",
        backgroundColor: "#FFFFFF",
      }}
    >
      {/* Blue header banner + avatar */}
      <Box sx={{ position: "relative", height: 90, backgroundColor: "#3B82F6" }}>
        <Avatar
          src={avatarUrl}
          alt={name}
          sx={{
            width: 64,
            height: 64,
            position: "absolute",
            bottom: -20,
            left: 16,
            border: "3px solid #FFFFFF",
          }}
        />
      </Box>

      {/* Name + status + location */}
      <Box sx={{ pt: 4, px: 2, pb: 2 }}>
        {/* Active User chip — right-aligned near avatar */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 0.5 }}>
          <Chip
            label={status}
            size="small"
            sx={{
              backgroundColor: "#EFF6FF",
              color: "#2563EB",
              fontWeight: 500,
              fontSize: "0.7rem",
              height: 22,
              borderRadius: "6px",
            }}
          />
        </Box>

        <Typography fontWeight={700} fontSize="1rem" color="text.primary">
          {name}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.3, mt: 0.3 }}>
          <LocationOnIcon sx={{ fontSize: 13, color: "#9CA3AF" }} />
          <Typography fontSize="0.78rem" color="text.secondary">
            {location}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: "#F3F4F6" }} />

      {/* Contact rows */}
      <Box sx={{ px: 2, py: 1.5 }}>
        {contactItems.map((item, index) => (
          <Box
            key={item.label}
            sx={{
              display: "flex",
              alignItems: "flex-start",
              gap: 1.5,
              py: 1.2,
              borderBottom:
                index < contactItems.length - 1
                  ? "1px solid #F3F4F6"
                  : "none",
            }}
          >
            {/* Icon box */}
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: "8px",
                border: "1px solid #E5E7EB",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {item.icon}
            </Box>
            <Box>
              <Typography
                fontSize="0.65rem"
                fontWeight={600}
                color="text.secondary"
                letterSpacing="0.05em"
                textTransform="uppercase"
              >
                {item.label}
              </Typography>
              <Typography fontSize="0.82rem" fontWeight={500} color="text.primary">
                {item.value}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
