import React from "react";
import {
  Box,
  Paper,
  Typography,
  Divider,
} from "@mui/material";

const defaultPhotos = [
  { label: "Front Side", src: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&q=80" },
  { label: "Back Side",  src: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&q=80" },
  { label: "Right Side", src: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&q=80" },
  { label: "Left Side",  src: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&q=80" },
];

const CarDetail = () => {
  const parts = ["AB", "99", "YZ", "GP"];
  // const colors = ["#FACC15", "#FACC15", "#FACC15", "#22C55E"];
  let car = {}
  let photos = "" 
  const {
    vehicle = "Toyota Corolla Cross",
    regNo = "AB 99 YZ GP",
  } = car || {};

  const carPhotos = photos || defaultPhotos;

  return (
    <Paper
      elevation={2}
      sx={{
        borderRadius: "12px",
        overflow: "hidden",
        backgroundColor: "#FFFFFF",
      }}
    >
      {/* Header row */}
      <Box
        sx={{
          px: 3,
          py: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #E5E7EB",
        }}
      >
        <Typography variant="h6" fontWeight={600} fontSize="1rem">
          Car Details
        </Typography>

        {/* Vehicle + Reg */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          <Box sx={{ textAlign: "right" }}>
            <Typography fontSize="0.7rem" color="text.secondary">
              Vehicle
            </Typography>
            <Typography fontSize="0.82rem" fontWeight={500}>
              {vehicle}
            </Typography>
          </Box>
          <Box>
            <Typography fontSize="0.7rem" color="text.secondary" mb={0.4}>
              Reg No.
            </Typography>
            {/* <RegPlate plate={regNo} /> */}

             <Box sx={{ display: "flex", gap: 0,borderRadius: "4px",backgroundColor: "#FACC15", }}>
               {parts.map((part, i) => (
        <Box
          
          sx={{
            px: 0.6,
            py: 0.1,
            minWidth: 24,
            textAlign: "center",
          }}
          >
          <Typography fontSize="0.7rem" fontWeight={700} color="#854D0E">
            {part}
          </Typography>
        </Box>
      ))} 
    </Box>
          </Box>
        </Box>
      </Box>

      {/* 2x2 photo grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 2,
          p: 3,
        }}
      >
        {carPhotos.map((photo) => (
          <Box key={photo.label}>
            <Typography
              fontSize="0.8rem"
              color="text.secondary"
              fontWeight={500}
              mb={0.8}
            >
              {photo.label}
            </Typography>
            <Box
              component="img"
              src={photo.src}
              alt={photo.label}
              sx={{
                width: "100%",
                height: 130,
                objectFit: "cover",
                borderRadius: "8px",
                border: "1px solid #E5E7EB",
                display: "block",
              }}
            />
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
export default CarDetail
