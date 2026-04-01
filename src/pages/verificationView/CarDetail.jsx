import React from "react";
import {
  Box,
  Paper,
  Typography,
  Divider,
} from "@mui/material";


const CarDetail = ({vehicleDetails}) => {

  const defaultPhotos = [
    { label: "Front Side", src: vehicleDetails.image_front_side },
    { label: "Back Side",  src: vehicleDetails.image_back_side },
    { label: "Right Side", src: vehicleDetails.image_right_side },
    { label: "Left Side",  src: vehicleDetails.image_left_side },
    { label: "Car Number Plate",  src: vehicleDetails.image_car_number_plate },
    { label: "License Disc Image",  src: vehicleDetails.image_driver_license },
  ];
  const parts = vehicleDetails?.reg_no.match(/.{1,2}/g) || ["AB", "99", "YZ", "GP"];
  let car = {}
  let photos = "" 
  const {
    vehicle = vehicleDetails.vehicle_name,
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
                // width: "100%",
                width: "332.33px",
                height: "192px",
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
