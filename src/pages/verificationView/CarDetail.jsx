import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Divider,
} from "@mui/material";
import nouser from "../../assets/images/NoUser.png";
import SingleImagePreview from "../../common/SingleImagePreview";

const CarDetail = ({ vehicleDetails }) => {
  const isAllEmpty = (obj) => {
    return Object.values(obj).every(
      value => value === undefined || value === null || value === ""
    );
  };
  const defaultPhotos = [
    { label: "Front Side", src: vehicleDetails.image_front_side},
    { label: "Back Side", src: vehicleDetails.image_back_side},
    { label: "Right Side", src: vehicleDetails.image_right_side},
    { label: "Left Side", src: vehicleDetails.image_left_side},
    { label: "Car Number Plate", src: vehicleDetails.image_car_number_plate},
    { label: "License Disc Image", src: vehicleDetails.image_driver_license},
    { label: "Live Car Photo", src: vehicleDetails.image_vehicle_live},
  ];
  const parts = vehicleDetails?.reg_no.match(/.{1,2}/g) || ["AB", "99", "YZ", "GP"];
  let car = {}
  let photos = ""
  const {
    vehicle = vehicleDetails.vehicle_name,
    regNo = vehicleDetails?.reg_no,
  } = car || {};

  const carPhotos = photos || defaultPhotos;
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
          borderRadius: "12px",
          overflow: "hidden",
          backgroundColor: "#FFFFFF",
          font:'Montserrat',
          fontFamily:'Montserrat'
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
              <Typography fontSize="14px" color="#4B5563">
                Vehicle
              </Typography>
              <Typography fontSize="14px" fontWeight={700}>
                {vehicle}
              </Typography>
            </Box>
            <Box>
              <Typography fontSize="14px" color="#4B5563" mb={0.4}>
                Reg No.
              </Typography>
              {/* <RegPlate plate={regNo} /> */}

              {regNo && <Box sx={{ display: "flex", gap: 0, borderRadius: "4px", backgroundColor: "#FACC15", }}>
                {/* {parts.map((part, i) => ( */}
                <Box

                  sx={{
                    px: 0.6,
                    py: 0.1,
                    minWidth: 24,
                    textAlign: "center",
                  }}
                >
                  <Typography fontSize="14px" fontWeight={700} color="#854D0E">
                    {regNo}
                  </Typography>
                </Box>
                {/* ))}  */}
              </Box>}
            </Box>
          </Box>
        </Box>

        {/* 2x2 photo grid */}
        {!isAllEmpty(vehicleDetails) ? <Box
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
                fontSize="14px"
                color="#4B5563"
                fontWeight={500}
                mb={0.8}
              >
                {photo.label}
              </Typography>
              <Box
                component="img"
                src={photo.src ? photo.src : nouser}
                alt={photo.label}
                onClick={() => handleImageClick(photo.src,photo.label)}
                sx={{
                  // width: "100%",
                  width: photo.src ? "332.33px" : '100',
                  height: "192px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  border: "1px solid #E5E7EB",
                  display: "block",
                  cursor: 'pointer'
                }}
              />
            </Box>
          ))}
        </Box> : 
        <Box sx={{display:"flex",justifyContent:"center", gap: 2,
            p: 3,}}>
         No Car Details
        </Box>
        }
      </Paper>
    </>
  );
}
export default CarDetail
