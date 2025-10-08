import React from "react";
import {
    Dialog,
    DialogContent,
    IconButton,
    Typography,
    Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";


const SingleImagePreview = ({ show, onClose, image }) => {
    if (!image) return null;

    return (
        <Dialog
            open={show}
            onClose={onClose}
            fullWidth
            maxWidth="md"
            PaperProps={{
                sx: {
                    bgcolor: "transparent",
                    boxShadow: "none",
                },
            }}

        >
            <DialogContent
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    p: 3,
                    bgcolor: "#f7f7f7",
                }}
            >
                {/* Close Button */}
                <IconButton
                    onClick={onClose}
                    sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        color: "white",
                        bgcolor: "#f7f7f7",
                        // "&:hover": { bgcolor: "rgba(0,0,0,0.6)" },
                    }}
                >
                    <CloseIcon />
                </IconButton>
                {/* Label */}
                <Typography variant="h6" sx={{ color: "black", mb: 2 }}>
                    {image.label}
                </Typography>

                {/* Image */}
                <Box
                    component="img"
                    src={image.src}
                    alt={image.label}
                    sx={{
                        maxHeight: "80vh",
                        maxWidth: "100%",
                        borderRadius: 2,
                        boxShadow: 3,
                    }}
                />
            </DialogContent>
        </Dialog>
    );
};

export default SingleImagePreview;
