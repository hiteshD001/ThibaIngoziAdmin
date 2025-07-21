import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { toastOption } from "../common/ToastOptions";
import { useFormik } from "formik";
import { useCreateNotificationType } from "../API Calls/API";
import { useQueryClient } from "@tanstack/react-query";
import * as Yup from "yup";
import Loader from "../common/Loader";
import { BootstrapInput } from "../common/BootstrapInput";
import {
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Divider, Grid,
    FormControl, InputLabel
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
        <Box px={3} sx={{ height: '90vh' }}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: '10px', pb: 25 }}>
                <Box
                    sx={{
                        p: 1,
                        mb: 3,
                        borderBottom: '1px solid #E5E7EB'
                    }}
                >
                    <Typography variant="h6" fontWeight={550} color="black">
                        Add New Service
                    </Typography>
                </Box>

                <form onSubmit={serviceForm.handleSubmit}>
                    <Grid container display="flex" flexDirection="column" gap={2}>
                        <Grid size={{ xs: 5 }}>
                            <FormControl variant="standard" fullWidth sx={{ mb: 2 }}>
                                <InputLabel
                                    shrink
                                    htmlFor="bootstrap-input-name"
                                    sx={{
                                        fontSize: '1.3rem',
                                        mb: 10,
                                        color: 'rgba(0, 0, 0, 0.6)',
                                        '&.Mui-focused': {
                                            color: 'black',
                                        },
                                    }}
                                >
                                    Service name:
                                </InputLabel>
                                <BootstrapInput
                                    name="type"
                                    id="bootstrap-input-name"
                                    placeholder="Enter service name"
                                    value={serviceForm.values.type}
                                    onChange={serviceForm.handleChange}
                                    onBlur={serviceForm.handleBlur}
                                />
                                {serviceForm.touched.type && !serviceForm.isSubmitting && (
                                    <div style={{ color: 'red', fontSize: 12 }}>{serviceForm.errors.type}</div>
                                )}
                            </FormControl>
                        </Grid>

                        <Grid display={'flex'} justifyContent={'flex-end'} gap={2} size={{ xs: 12 }}>
                            <Button
                                variant="contained"
                                onClick={() => serviceForm.resetForm()}
                                sx={{
                                    backgroundColor: 'white', color: 'var(--font-gray)', boxShadow: 'none', border: '1px solid var(--light-gray)', width: '130px', height: '48px', borderRadius: '10px', '&:hover': {
                                        boxShadow: 'none'
                                    }
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                type="submit"
                                sx={{ backgroundColor: 'var(--Blue)', width: '130px', height: '48px', borderRadius: '10px' }}
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
