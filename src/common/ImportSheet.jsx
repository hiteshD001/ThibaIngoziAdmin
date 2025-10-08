/* eslint-disable react/prop-types */
import { useState, useCallback } from "react";
import {
    Box,
    Typography,
    Button,
    Stack,
    Paper,
    IconButton,
    Divider,
} from "@mui/material";
import import2 from '../assets/images/import2.svg'
import { MdCloudUpload, MdFileDownload, MdClose } from "react-icons/md";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { useFileUpload, useUserFileUpload } from "../API Calls/API";
import Loader from "./Loader";
import { toastOption } from "./ToastOptions";
import Downloads from '../assets/images/Downloads.svg'
const ImportSheet = ({ setpopup, type = "driver" }) => {
    const [file, setFile] = useState(null);
    const [error, seterror] = useState("");
    const [apiError, setApiError] = useState([]);
    const client = useQueryClient();

    const validExcelTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
    ];
    const maxSize = 10 * 1024 * 1024;

    const validateFile = (selectedFile) => {
        if (!validExcelTypes.includes(selectedFile.type)) {
            seterror("Please select a valid Excel file (.xls or .xlsx)");
            setFile(null);
        } else if (selectedFile.size > maxSize) {
            seterror("File size should not exceed 10 MB");
            setFile(null);
        } else {
            seterror("");
            setFile(selectedFile);
        }
    };
    const onDrop = useCallback((acceptedFiles) => {
        const selectedFile = acceptedFiles[0];
        if (selectedFile) validateFile(selectedFile);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
        accept: {
            "application/vnd.ms-excel": [".xls", ".xlsx"],
        },
    });
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            validateFile(selectedFile);
        }
    };
    const onError = (error) => {
        setApiError(error.response.data.errors || []);
        toast.error(error.response.data.message || "Something went wrong", toastOption);
    };

    const onSuccess = () => {
        client.invalidateQueries(type === "driver" ? "driver list" : "user list");
        toast.success(`${type === "driver" ? "Driver" : "User"} imported successfully.`);
        setpopup(false);
    };

    const driverUpload = useFileUpload(onSuccess, onError);
    const userUpload = useUserFileUpload(onSuccess, onError);
    const isPending = type === "driver" ? driverUpload.isPending : userUpload.isPending;

    const handleFileUpload = () => {
        if (file) {
            const formData = new FormData();
            const fieldName = type === "driver" ? "driversSheet" : type === 'sales-agent' ? "file" : "driversSheet";
            formData.append(fieldName, file);
            if (type === "driver") driverUpload.mutate(formData);
            else userUpload.mutate(formData);
        } else {
            alert("Please select a file first!");
        }
    };

    const sampleFileName = type === "driver" ? "Sample_Driver.xlsx" : "Sample_User.xlsx";
    const downloadPath = type === "driver" ? "/assests/Driver.xlsx" : "/assests/Users.xlsx";

    return (
        <Box
            sx={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0,0,0,0.5)",
                zIndex: 1300,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <Paper
                sx={{
                    width: "90%",
                    maxWidth: 500,
                    borderRadius: 2,
                    backgroundColor: "#fff",
                }}
                elevation={4}
            >
                {/* Header */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        px: 3,
                        py: 2,
                        borderBottom: "1px solid #E0E3E7",
                    }}
                >
                    <Typography fontWeight={550} variant="h6">
                        Import File
                    </Typography>
                    <IconButton onClick={() => setpopup(false)}>
                        <MdClose />
                    </IconButton>
                </Box>

                {/* Body */}
                <Box sx={{ px: 3, py: 3 }}>
                    {/* Drag and drop visual box only */}
                    <Typography sx={{ color: 'gray' }} variant="body1" mb={3}>
                        Please choose a file to import.
                    </Typography>
                    <Box
                        {...getRootProps()}
                        sx={{
                            border: "2px dashed var(--light-gray)",
                            borderRadius: 2,
                            p: 3,
                            textAlign: "center",
                            // backgroundColor: "#f5f8ff",
                            mb: 2,
                        }}
                    >
                        <input {...getInputProps()} />
                        <img src={import2} alt="dragNdrop" />
                        <Typography sx={{ color: 'var(--font-gray)' }} variant="body1" fontSize={'1.1rem'} fontWeight={300} mt={1}>
                            {file ? file.name : (isDragActive ? "Drop the file here..." : "Drag & drop your file here")}
                        </Typography>
                        <Typography sx={{ color: 'gray' }} variant="body1" mt={1}>
                            or
                        </Typography>
                        {/* Choose File Button */}
                        <Button
                            variant="contained"
                            sx={{ mt: 2, borderRadius: '10px', backgroundColor: 'var(--Blue)' }}
                            onClick={e => {
                                e.stopPropagation();
                                const input = document.querySelector('input[type=\"file\"]');
                                if (input) input.click();
                            }}
                        >
                            Choose File
                        </Button>
                    </Box>

                    {/* Error */}
                    {error && (
                        <Typography variant="body2" color="error" sx={{ mb: 1 }}>
                            {error}
                        </Typography>
                    )}

                    {/* Download Sample File */}
                    <Stack direction="row" spacing={1} justifyContent={'center'} alignItems="center" sx={{ mb: 2 }}>
                        <a
                            href={downloadPath}
                            download={sampleFileName}
                            style={{
                                textDecoration: "none",
                                fontSize: "14px",
                                display: "flex",
                                alignItems: "center",
                                color: "#1976d2",
                            }}
                        >
                            <img style={{ marginRight: '10px' }} src={Downloads} alt="download icon" />
                            Download Sample .xlsx file

                        </a>
                    </Stack>

                    {/* API Errors */}
                    {apiError.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                            {apiError.map((err, index) => (
                                <Typography
                                    key={index}
                                    variant="body2"
                                    color="error"
                                    sx={{ fontSize: "12px", textAlign: "left" }}
                                >
                                    {err.message} ({err.email})
                                </Typography>
                            ))}
                        </Box>
                    )}

                    {/* Buttons */}
                    <Stack direction="row" spacing={2} justifyContent="flex-end" mt={4} >
                        <Button variant="outlined" sx={{ color: 'black', borderColor: 'var(--font-gray)' }} onClick={() => setpopup(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            sx={{ backgroundColor: 'var(--Blue)' }}
                            onClick={handleFileUpload}
                            disabled={!file || isPending}
                        >
                            {isPending ? <Loader color="white" /> : "Import"}
                        </Button>

                    </Stack>
                </Box>

            </Paper>
        </Box>
    );
};

export default ImportSheet;
