import React, { useState } from "react";
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
import nouser from "../../assets/images/NoUser.png";
import SingleImagePreview from "../../common/SingleImagePreview";
import phoneIcn from '../../assets/images/phoneIcn.svg'
import emailIcn from '../../assets/images/emailIcn.svg'
import badgeIdIcn from '../../assets/images/badgeId.svg'

export default function UserDetail({ user}) {
  const {
    name = `${user.first_name} ${user.last_name}`,
    location = user.address ? user.address : "Johannesburg, South Africa",
    status = user.isActive ? "Verified" : "Not Verified",
    avatarUrl = user.selfieImage ? user.selfieImage : nouser ,
  } = user || {};
 
  const contactItems = [
    {
      icon: <img src={badgeIdIcn} alt="confirmation icon" />,
      label: "ID / PASSPORT NUMBER",
      value: user.id_no,
    },
    {
      icon: <img src={phoneIcn} alt="confirmation icon" />,
      label: "PHONE NUMBER",
      value: user?.mobile_no ,
    },
    {
      icon: <img src={emailIcn} alt="confirmation icon" />,
      label: "EMAIL ADDRESS",
      value: user.email,
    },
  ];

  const [previewImage, setPreviewImage] = useState({
    open: false,
    src: '',
    label: ''
  });

  const handleImageClick = (src, label) => {
    if (src) {
      setPreviewImage({
        open: true,
        src: src instanceof File ? URL.createObjectURL(src) : src,
        label: label
      });
    }
  };

  const handleClosePreview = () => {
    setPreviewImage(prev => ({ ...prev, open: false }));
  };

  return (
    <>
      <SingleImagePreview
        show={previewImage.open}
        onClose={handleClosePreview}
        image={previewImage.src ? { src: previewImage.src, label: previewImage.label } : null}
      />
      <Paper
        elevation={2}
        sx={{
          // maxWidth: 260,
          borderRadius: "12px",
          overflow: "hidden",
          backgroundColor: "#FFFFFF",
          font:'Montserrat'
        }}
      >
        {/* Blue header banner + avatar */}
        <Box sx={{ position: "relative", height: 90, backgroundColor: "#3B82F6" }}>
          <Avatar
            src={avatarUrl}
            alt={name}
            onClick={() => handleImageClick(avatarUrl, 'Selfie Image')}
            sx={{
              width: 64,
              height: 64,
              position: "absolute",
              bottom: -20,
              left: 16,
              border: "3px solid #FFFFFF",
              cursor: 'pointer'
            }}
          />
        </Box>

        {/* Name + status + location */}
        <Box sx={{ pt: 4, px: 2}}>
          {/* Active User chip — right-aligned near avatar */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 0.5 }}>
            <Chip
              label={status}
              size="small"
              sx={{
                backgroundColor:`${user.isActive ? "#DCFCE7" : '#FEE2E2'} `,
                color: `${user.isActive ? "#10B981" : "#E5565A"} `,
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

        {/* Contact rows */}
        <Box sx={{ px: 2, py: 1.5 }}>
          {contactItems.map((item, index) => (
            <Box
              key={item.label}
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: '16px',
                p: 1.2,
                my: 1.2,
                border:
                  index < contactItems.length - 1
                    ? "1px solid #F1F5F9"
                    : "none",
                borderRadius: "8px",
                backgroundColor:'#F8FAFC' 
              }}
            >
              {/* Icon box */}
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: "8px",
                  border: "1px solid #E5E7EB",
                  backgroundColor:'white', 
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
                  fontSize="12px"
                  fontWeight={500}
                  color="#64748B"
                  letterSpacing="0.3px"
                  textTransform="uppercase"
                >
                  {item.label}
                </Typography>
                <Typography fontSize="14px" fontWeight={500} letterSpacing="0px" color="#0E0E0E" sx={{wordBreak: "break-word",overflowWrap: "break-word"}}>
                  {item.value}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Paper>
    </>
  );
}
