import { useEffect } from "react";
import {
    Dialog,
    DialogContent,
    IconButton,
    Typography,
    Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const ImagePreviewModal = ({ images, currentIndex, show, onClose, onNext, onPrev }) => {
    // Keyboard navigation
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowRight") onNext();
            if (e.key === "ArrowLeft") onPrev();
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [onClose, onNext, onPrev]);

    if (!show || !images.length) return null;

    const { label, src } = images[currentIndex];

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
                    p: 2,
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
                    {label}
                </Typography>

                {/* Image */}
                <Box
                    component="img"
                    src={src}
                    alt={label}
                    sx={{
                        maxHeight: "80vh",
                        maxWidth: "100%",
                        borderRadius: 2,
                        boxShadow: 3,
                    }}
                />

                {/* Prev Button */}
                <IconButton
                    onClick={onPrev}
                    sx={{
                        position: "absolute",
                        left: 16,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "white",
                        // bgcolor: "rgba(0,0,0,0.4)",
                        // "&:hover": { bgcolor: "rgba(0,0,0,0.6)" },
                    }}
                >
                    <ArrowBackIosNewIcon />
                </IconButton>

                {/* Next Button */}
                <IconButton
                    onClick={onNext}
                    sx={{
                        position: "absolute",
                        right: 16,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "white",
                        // bgcolor: "rgba(0,0,0,0.4)",
                        // "&:hover": { bgcolor: "rgba(0,0,0,0.6)" },
                    }}
                >
                    <ArrowForwardIosIcon />
                </IconButton>
            </DialogContent>
        </Dialog>
    );
};

export default ImagePreviewModal;
