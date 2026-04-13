import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Divider,
} from "@mui/material";
import nouser from "../../assets/images/NoUser.png";
import SingleImagePreview from "../../common/SingleImagePreview";

const UserImages = ({ user }) => {

  const defaultPhotos = [
    { label: "Selfie Image", src: user.selfieImage},
    { label: "Full Image", src: user.fullImage},
    { label: "Verification Image", src: user.VerificationImage},
  ];

  const [previewImage, setPreviewImage] = useState({
    open: false,
    src: '',
    label: ''
  });
  const carPhotos = defaultPhotos;

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
            User Images
          </Typography>
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
        </Box>
      </Paper>
    </>
  );
}
export default UserImages
