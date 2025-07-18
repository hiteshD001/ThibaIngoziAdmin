import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { toastOption } from "../common/ToastOptions";
import { useFormik } from "formik";
import { useCreateNotificationType } from "../API Calls/API";
import { useQueryClient } from "@tanstack/react-query";
import * as Yup from "yup";
import Loader from "../common/Loader";

import {
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Divider, Grid,
} from "@mui/material";

const AddService = () => {
    const client = useQueryClient();
    const nav = useNavigate();

    const onSuccess = () => {
        toast.success("Service added successfully.");
        serviceForm.resetForm();
        client.invalidateQueries("NotificationType List");
        nav("/home/total-sos-amount");
    };

    const onError = (error) => {
        toast.error(error?.response?.data?.message || "Something went wrong", toastOption);
    };

    const newService = useCreateNotificationType(onSuccess, onError);

    const serviceForm = useFormik({
        initialValues: {
            type: "",
        },
        validationSchema: Yup.object({
            type: Yup.string().required("Service name is required"),
        }),
        onSubmit: (values) => {
            const payload = {
                type: values.type,
                isService: true,
            };
            newService.mutate(payload);
        },
    });

    return (
        <Box p={3} sx={{ height: '100vh' }}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: '10px' }}>
                <Box
                    sx={{
                        p: 1,
                        mb: 3,
                        borderBottom: '1px solid #E5E7EB'
                    }}
                >
                    <Typography variant="h6" color="black">
                        Add New Service
                    </Typography>
                </Box>

                <form onSubmit={serviceForm.handleSubmit}>
                    <Grid container display="flex" flexDirection="column" gap={2}>
                        <Grid size={{ xs: 5 }}>
                            <TextField
                                label="Service Name"
                                name="type"
                                placeholder="Enter service name"
                                fullWidth
                                value={serviceForm.values.type}
                                onChange={serviceForm.handleChange}
                                onBlur={serviceForm.handleBlur}
                                error={serviceForm.touched.type && Boolean(serviceForm.errors.type)}
                                helperText={serviceForm.touched.type && serviceForm.errors.type}
                            />
                        </Grid>

                        <Grid display={'flex'} justifyContent={'flex-end'} size={{ xs: 12 }}>
                            <Button
                                variant="contained"
                                type="submit"
                                disabled={newService.isPending}
                            >
                                {newService.isPending ? <Loader color="white" /> : "Save"}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Box>
    );
};

export default AddService;
