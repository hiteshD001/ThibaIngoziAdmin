import { useEffect, useState } from "react";
import {
    Paper,
    Box,
    Typography,
    Chip,
    Grid,
    Button,
    Avatar,
    FormControl,InputLabel,Checkbox,TextField,InputAdornment,Autocomplete,IconButton,FormHelperText
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { usePutCapture,useGetCommentsList,useGetRoleByIdWithCompanyId } from "../../API Calls/API";
import { BootstrapInput } from "../../common/BootstrapInput";
import { toast } from "react-toastify";
import { toastOption } from "../../common/ToastOptions";
import { useQueryClient } from "@tanstack/react-query";
import SingleImagePreview from "../../common/SingleImagePreview";
import { useFormik } from "formik";
import { captureValidation } from "../../common/FormValidation";
import GrayPlus from '../../assets/images/GrayPlus.svg'
import CustomSelect from "../../common/Custom/CustomSelect";
import unChecked from "../../assets/images/UnChecked.svg";
import search from "../../assets/images/search.png";
import checked from "../../assets/images/checkboxIcon.svg";
import Loader from "../../common/Loader";

const AddCaptureReport = () => {
    const client = useQueryClient();
    const [role] = useState(localStorage.getItem("role"))
    const role_user_id = localStorage.getItem("userID")
    const role_user_name = localStorage.getItem("userName")
    const nav = useNavigate();
    const location = useLocation();
    const getQueryParams = new URLSearchParams(location.search);
    const [filter, setFilter] = useState("");
    const [selectedUsers, setSelectedUsers] = useState(null);
    const [inputValue, setInputValue] = useState("");
    const locationId = getQueryParams.get("location_id")
    const driverForm = useFormik({
        initialValues: {
            user_id: "",
            capture_by_id: role_user_id,
            location_id:locationId,
            arrival_comment_id: "",
            assessment_comment_id: "",
            contact_attempt_comment_id: "",
            resolution_comment_id: "",
            closure_comment_id: "",
            evidence_images: [],
            otherComments: "",
        },
        validationSchema: captureValidation,
        onSubmit: (values) => {
            const formData = new FormData();
            
            formData.append("user_id", values.user_id);
            formData.append("arrival_comment_id", values.arrival_comment_id);
            formData.append("assessment_comment_id", values.assessment_comment_id);
            formData.append("contact_attempt_comment_id", values.contact_attempt_comment_id);
            formData.append("resolution_comment_id", values.resolution_comment_id);
            formData.append("closure_comment_id", values.closure_comment_id);
            formData.append("otherComments", values.otherComments);
            formData.append("location_id", values.location_id);

            // ✅ Append each image under the same key (backend receives array)
            if (values.evidence_images?.length > 0) {
                values.evidence_images.forEach((img) => {
                    formData.append("evidence_image", img);
                });
            }
            newdriver.mutate(formData);
        },
    });
    useEffect(() => {
        const timeout = setTimeout(() => {
            setFilter(inputValue);
        }, 400);
        return () => clearTimeout(timeout);
    }, [inputValue]);
    // Now use the API hook after form is initialized
    const { data: roleData } = useGetRoleByIdWithCompanyId(
        driverForm.values.user_id,
        filter // Pass the search filter to the API
    );

    const companyUsers = roleData?.data?.allUsers || [];

    const onSuccess = () => {
        toast.success("Capture Report Save Successfully.");
        driverForm.resetForm();
        setSelectedUsers(null);
        setInputValue("");
        client.invalidateQueries("capture report list");
        nav(`/home/capture-reports?location_id=${locationId}`);
    }
    const onError = (error) => {
        toast.error(error.response.data.message || "Something went Wrong", toastOption)
    }
    const handleCancel = () => {
        nav(`/home/capture-reports?location_id=${locationId}`);
    };
    const newdriver = usePutCapture(onSuccess, onError)
    const commentList = useGetCommentsList()
    
     const handleImageChange = (e) => {
        const files = Array.from(e.currentTarget.files);
        if (!files.length) return;

        const existing = driverForm.values.evidence_images || [];
        const merged = [...existing, ...files];
        driverForm.setFieldValue("evidence_images", merged);

        // Reset input so same file can be re-selected if removed
        e.target.value = "";
    };
    const handleRemoveImage = (index) => {
        const updated = driverForm.values.evidence_images.filter((_, i) => i !== index);
        driverForm.setFieldValue("evidence_images", updated);
    };
    
    return (
        <Box p={2}>
            <form onSubmit={driverForm.handleSubmit}>
                <Paper elevation={0} sx={{ p: 3, borderRadius: '10px' }}>
                    <Grid container spacing={3}>
                        {/* User Info Section */}
                        <Grid size={12}>
                            <Typography variant="h6" gutterBottom fontWeight={600}>
                                Capture Report
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography variant="body1" fontWeight={500} fontSize={"16px"} mb={1}>
                                Reponder
                            </Typography>
                            <Autocomplete
                                options={companyUsers || []}
                                getOptionLabel={(option) =>
                                    `${option.first_name || "-"} ${option.last_name || "-"}`
                                }
                                value={selectedUsers}
                                onInputChange={(event, newInputValue) => {
                                    setInputValue(newInputValue);
                                }}
                                onChange={(event, newValue) => {
                                    setSelectedUsers(newValue);
                                    driverForm.setFieldValue(
                                        "user_id",
                                        newValue?._id || ""
                                    );
                                }}
                                isOptionEqualToValue={(option, value) => option._id === value._id}
                                renderOption={(props, option) => (
                                    <Box
                                        component="li"
                                        {...props}
                                        sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                                    >
                                        <Avatar src={option.profileImage} sx={{ width: 32, height: 32 }}>
                                            {option.first_name?.[0]?.toUpperCase() || "U"}
                                        </Avatar>
                                        <Typography fontSize="14px">
                                            {option.first_name} {option.last_name}
                                        </Typography>
                                    </Box>
                                )}
                                renderInput={(params) => (
                                    <TextField {...params} placeholder="Search & Select User"
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                height: "45px", // ✅ height
                                                // borderRadius: "8px",

                                                "& fieldset": {
                                                    borderColor: "#E0E3E7", // ✅ normal border
                                                },
                                                "&:hover fieldset": {
                                                    borderColor: "#1976d2", // ✅ hover border
                                                },
                                                "&.Mui-focused fieldset": {
                                                    borderColor: "#1976d2", // ✅ focus border
                                                    borderWidth: "1.5px",
                                                },
                                            },
                                            "& .MuiInputBase-input": {
                                                padding: "10px 12px", // inner padding
                                                fontSize: "14px",
                                            },
                                        }} />
                                )}
                                fullWidth
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl variant="standard" fullWidth >
                                <InputLabel shrink htmlFor="capture_by" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                    Captured By
                                </InputLabel>
                                <BootstrapInput
                                    id="capture_by"
                                    name="capture_by"
                                    placeholder="Captured By"
                                    disabled
                                    value={role_user_name}
                                    // onChange={driverForm.handleChange}
                                />
                                {/* {driverForm.touched.capture_by && <div style={{ color: 'red', fontSize: 12 }}>{driverForm.errors.capture_by}</div>} */}
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <CustomSelect
                                label="Arrival Comments"
                                name="arrival_comment_id"
                                value={driverForm.values.arrival_comment_id}
                                onChange={driverForm.handleChange}
                                options={commentList.data?.data.arrival?.map(data => ({
                                    value: data._id,
                                    label: data.comment
                                })) || []}
                                error={driverForm.errors.arrival_comment_id && driverForm.touched.arrival_comment_id}
                                helperText={driverForm.touched.arrival_comment_id ? driverForm.errors.arrival_comment_id : ''}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <CustomSelect
                                label="Assessment Comments"
                                name="assessment_comment_id"
                                value={driverForm.values.assessment_comment_id}
                                onChange={driverForm.handleChange}
                                options={commentList.data?.data.assessment?.map(data => ({
                                    value: data._id,
                                    label: data.comment
                                })) || []}
                                error={driverForm.errors.assessment_comment_id && driverForm.touched.assessment_comment_id}
                                helperText={driverForm.touched.assessment_comment_id ? driverForm.errors.assessment_comment_id : ''}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <CustomSelect
                                label="Contact Attempt Comments"
                                name="contact_attempt_comment_id"
                                value={driverForm.values.contact_attempt_comment_id}
                                onChange={driverForm.handleChange}
                                options={commentList.data?.data.contact_attempt?.map(data => ({
                                    value: data._id,
                                    label: data.comment
                                })) || []}
                                error={driverForm.errors.contact_attempt_comment_id && driverForm.touched.contact_attempt_comment_id}
                                helperText={driverForm.touched.contact_attempt_comment_id ? driverForm.errors.contact_attempt_comment_id : ''}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <CustomSelect
                                label="Resolutions Comments"
                                name="resolution_comment_id"
                                value={driverForm.values.resolution_comment_id}
                                onChange={driverForm.handleChange}
                                options={commentList.data?.data.resolution?.map(data => ({
                                    value: data._id,
                                    label: data.comment
                                })) || []}
                                error={driverForm.errors.resolution_comment_id && driverForm.touched.resolution_comment_id}
                                helperText={driverForm.touched.resolution_comment_id ? driverForm.errors.resolution_comment_id : ''}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <CustomSelect
                                label="Closure Comments"
                                name="closure_comment_id"
                                value={driverForm.values.closure_comment_id}
                                onChange={driverForm.handleChange}
                                options={commentList.data?.data.closure?.map(data => ({
                                    value: data._id,
                                    label: data.comment
                                })) || []}
                                error={driverForm.errors.closure_comment_id && driverForm.touched.closure_comment_id}
                                helperText={driverForm.touched.closure_comment_id ? driverForm.errors.closure_comment_id : ''}
                            />
                        </Grid>

                        <Grid size={12}>
                            <Grid container gap={4} sx={{ mt: 1 }}>
                                <Grid size={{ xs: 12, sm: 2.5 }}>
                                    <label style={{ marginBottom: '10px', display: 'block', fontWeight: 500 }}>Images (Optional)</label>
                                    <Box
                                        sx={{
                                            border: '2px dashed #E0E3E7',
                                            borderRadius: '12px',
                                            minHeight: 180,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            position: 'relative',
                                            background: '#fafbfc'
                                        }}
                                        component="label"
                                    >
                                        <input
                                            type="file"
                                            accept="image/*"
                                            hidden
                                            name="evidence_image"
                                            onChange={handleImageChange}
                                        />
                                        <img src={GrayPlus} alt="gray plus" />
                                        <Typography sx={{ color: '#B0B0B0', fontWeight: 550, mt: 1 }}>Upload</Typography>
                                        {driverForm.values.evidence_image && (
                                            <Typography sx={{ color: '#4B5563', mt: 1, fontSize: 12 }}>
                                                {driverForm.values.evidence_image.name}
                                            </Typography>
                                        )}
                                    </Box>
                                    {driverForm.touched.evidence_image && driverForm.errors.evidence_image && (
                                        <FormHelperText error>{driverForm.errors.evidence_image}</FormHelperText>
                                    )}
                                </Grid>
                                 {driverForm.values.evidence_images.map((img, index) => (
                                    <Grid size={{ xs: 12, sm: 2.5 }} key={index}>
                                        <Box
                                            sx={{
                                                border: "1px solid #E0E3E7",
                                                borderRadius: "12px",
                                                minHeight: 180,
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                position: "relative",
                                                overflow: "hidden",
                                                background: "#fafbfc",
                                            }}
                                        >
                                            <img
                                                src={URL.createObjectURL(img)}
                                                alt={`Evidence-${index}`}
                                                style={{
                                                    width: "100%",
                                                    height: "180px",
                                                    objectFit: "cover",
                                                    borderRadius: "12px",
                                                }}
                                            />
                                            {/* ✅ Remove button */}
                                            <IconButton
                                                size="small"
                                                onClick={() => handleRemoveImage(index)}
                                                sx={{
                                                    position: "absolute",
                                                    top: 4,
                                                    right: 4,
                                                    backgroundColor: "rgba(0,0,0,0.5)",
                                                    color: "white",
                                                    "&:hover": {
                                                        backgroundColor: "rgba(0,0,0,0.75)",
                                                    },
                                                }}
                                            >
                                                <CloseIcon fontSize="small" />
                                            </IconButton>
                                            <Typography
                                                sx={{
                                                    fontSize: 11,
                                                    color: "#6B7280",
                                                    mt: 0.5,
                                                    px: 1,
                                                    textAlign: "center",
                                                    wordBreak: "break-all",
                                                }}
                                            >
                                                {img.name}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl variant="standard" fullWidth >
                                <InputLabel shrink htmlFor="otherComments" sx={{ fontSize: '16px',fontWeight:700, color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                    Other comments (Optional)
                                </InputLabel>
                                <BootstrapInput
                                    id="otherComments"
                                    name="otherComments"
                                    placeholder="Provide additional context here..."
                                    value={driverForm.values.otherComments}
                                    onChange={driverForm.handleChange}
                                />
                                {driverForm.touched.otherComments && <div style={{ color: 'red', fontSize: 12 }}>{driverForm.errors.otherComments}</div>}
                            </FormControl>
                        </Grid>
                    </Grid>
                </Paper>

                <Paper elevation={0} sx={{ p: 3, mt: 3, mb: 3, borderRadius: '10px' }}>
                    <Grid container spacing={3}>
                        {/* Actions */}
                        <Grid size={12} sx={{ mt: 1 }}>
                            <Box display="flex" justifyContent="flex-end" gap={2}>
                                <Button variant="outlined" sx={{ width: 130, height: 48, borderRadius: '10px', color: 'black', borderColor: '#E0E3E7' }} onClick={handleCancel}>
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={newdriver.isPending}
                                    sx={{ width: 130, height: 48, borderRadius: '10px', backgroundColor: 'var(--Blue)' }}
                                >
                                    {newdriver.isPending ? <Loader color="white" /> : "Save"}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>
            </form>
        </Box >
    );
};

export default AddCaptureReport;