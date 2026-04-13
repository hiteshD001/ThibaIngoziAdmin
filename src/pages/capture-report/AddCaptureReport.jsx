import { useEffect, useState } from "react";
import {
    Paper,
    Box,
    Typography,
    Chip,
    Grid,
    Button
} from '@mui/material';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { usePutCapture,useGetCommentsList } from "../../API Calls/API";
import { toast } from "react-toastify";
import { toastOption } from "../../common/ToastOptions";
import { useQueryClient } from "@tanstack/react-query";
import SingleImagePreview from "../../common/SingleImagePreview";
import { useFormik } from "formik";
import { captureValidation } from "../../common/FormValidation";

const AddCaptureReport = () => {
    const client = useQueryClient();
    const [role] = useState(localStorage.getItem("role"))
    const nav = useNavigate();
    const location = useLocation();

    const driverForm = useFormik({
        initialValues: formValues1,
        validationSchema: captureValidation,
        onSubmit: (values) => {
            const formData = new FormData();
            
            if (values.evidence_image) {
                formData.append("evidence_image", values.evidence_image);
            }
            newdriver.mutate(formData);
        },
    });


    const handleCompanyChange = (e) => {
        const { name, value } = e.target

        const companyname = companyList.data?.data.users.find((user) => user._id === value)?.company_name

        driverForm.setFieldValue(name, value)
        driverForm.setFieldValue('company_name', companyname)
    }
    const onSuccess = () => {

        toast.success("Driver added successfully.");
        driverForm.resetForm();
        client.invalidateQueries("company list");
        nav(role === 'super_admin' ? "/home/total-drivers" : `/home/total-drivers/${localStorage.getItem("userID")}`);
    }
    const onError = (error) => {
        toast.error(error.response.data.message || "Something went Wrong", toastOption)
    }
    const handleCancel = () => {
        nav("/home/capture-reports");
    };
    const newdriver = usePutCapture(onSuccess, onError)
    const commentList = useGetCommentsList()
    

    return (
        <Box p={2}>
            <form onSubmit={driverForm.handleSubmit}>
                <Paper elevation={0} sx={{ p: 3, borderRadius: '10px' }}>
                    <Grid container spacing={3}>
                        {/* User Info Section */}
                        <Grid size={12}>
                            <Typography variant="h6" gutterBottom fontWeight={600}>
                                Driver Information
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl variant="standard" fullWidth >
                                <InputLabel shrink htmlFor="responder" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                    Responder
                                </InputLabel>
                                <BootstrapInput
                                    id="responder"
                                    name="responder"
                                    placeholder="Responder"
                                    value={driverForm.values.responder}
                                    onChange={driverForm.handleChange}
                                />
                                {driverForm.touched.responder && <div style={{ color: 'red', fontSize: 12 }}>{driverForm.errors.responder}</div>}
                            </FormControl>
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
                                    value={driverForm.values.capture_by}
                                    onChange={driverForm.handleChange}
                                />
                                {driverForm.touched.capture_by && <div style={{ color: 'red', fontSize: 12 }}>{driverForm.errors.capture_by}</div>}
                            </FormControl>
                        </Grid>

                        <Grid size={12}>
                            <Grid container gap={4} sx={{ mt: 1 }}>
                                <Grid size={{ xs: 12, sm: 2.5 }}>
                                    <label style={{ marginBottom: '10px', display: 'block', fontWeight: 500 }}>Selfie Image</label>
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
                                            onChange={e => driverForm.setFieldValue('evidence_image', e.currentTarget.files[0])}
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
                            </Grid>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <CustomSelect
                                label="Province"
                                name="province"
                                // value={driverForm.values.province}
                                // onChange={driverForm.handleChange}
                                options={commentList.data?.data.arrival?.map(province => ({
                                    value: province._id,
                                    label: province.comment
                                })) || []}
                                error={driverForm.errors.province && driverForm.touched.province}
                                helperText={driverForm.touched.province ? driverForm.errors.province : ''}
                                disabled={!driverForm.values.country}
                            />
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


const formValues1 = {
    otherComments: "",
    arrival_comment_id: "",
    assessment_comment_id: "",
    contact_attempt_comment_id: "",
    resolution_comment_id: "",
    closure_comment_id: "",
    location_id: "",
    capture_by_id: ""
}