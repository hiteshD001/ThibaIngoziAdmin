import { useEffect, useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useFormik } from "formik";
import { SosAmount } from "../../common/FormValidation";
import Select from "react-select";
import { useGetSoSAmount, useUpdateSosAmount, useGetServicesList } from "../../API Calls/API";
import { toast } from "react-toastify";
import { toastOption } from "../../common/ToastOptions";
import { useQueryClient } from "@tanstack/react-query";
import {
    Paper,
    Typography,
    Button,
    Box,
    Grid,
    FormControl,
    InputLabel,
} from "@mui/material";
import { BootstrapInput } from "../../common/BootstrapInput";
import Loader from "../../common/Loader";

const ArmedSosAmount = () => {
    const { id } = useParams();
    const [edit, setEdit] = useState(false);
    const client = useQueryClient();
    const [servicesList, setServicesList] = useState([]);
    const { data, refetch } = useGetSoSAmount(id);
    const serviceslist = useGetServicesList();

    useEffect(() => {
        refetch();
    }, [id, refetch]);

    const sosForm = useFormik({
        initialValues: {
            amount: 0,
            driverSplitAmount: 0,
            companySplitAmount: 0,
            currency: "",
            notificationTypeId: "",
        },
        validationSchema: SosAmount,
        onSubmit: (values) => {
            const updatedValues = {
                notificationTypeId: values.notificationTypeId,
                amount: Number(values.amount),
                driverSplitAmount: Number(values.driverSplitAmount),
                companySplitAmount: Number(values.companySplitAmount),
                currency: values.currency,
            };
            mutate({ id, data: updatedValues });
            setEdit(false);
        },
    });

    const onSuccess = () => {
        toast.success("SOS amount updated successfully.");
        client.invalidateQueries("ArmedSOSAmount List");
    };
    const onError = (error) => {
        toast.error(error.response?.data?.message || "Something went wrong", toastOption);
    };
    const { mutate, isPending } = useUpdateSosAmount(onSuccess, onError);

    useEffect(() => {
        if (data?.data) {
            const values = data?.data?.data;
            sosForm.setValues({
                notificationTypeId: values?.notificationTypeId || '',
                amount: values?.amount || 0,
                driverSplitAmount: values?.driverSplitAmount || 0,
                companySplitAmount: values?.companySplitAmount || 0,
                currency: values?.currency || "",
            });
        }
    }, [data?.data]);

    useLayoutEffect(() => {
        if (Array.isArray(serviceslist)) {
            const filteredServices = serviceslist.filter(service => service.isService);
            const groupedOptions = [
                {
                    label: "Services",
                    options: filteredServices.map((service) => ({
                        label: service.type,
                        value: service._id,
                    })),
                },
            ];
            setServicesList(groupedOptions);
        }
    }, [serviceslist]);

    const displayField = (label, value) => (
        <Box mb={3}>
            <Typography sx={{ fontSize: '1.1rem', fontWeight: 500, mb: 1 }}>{label}</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ ml: 0.5 }}>
                {value || "-"}
            </Typography>
        </Box>
    );

    return (
        <Box px={3} sx={{ height: '90vh' }}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: '10px' }}>
                <Box sx={{ p: 1, mb: 3, borderBottom: '1px solid #E5E7EB' }}>
                    <Typography variant="h6" fontWeight={550} color="black">
                        SOS Information
                    </Typography>
                </Box>

                <form onSubmit={sosForm.handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            {edit ? (
                                <FormControl variant="standard" fullWidth sx={{ mb: 3 }}>
                                    <InputLabel
                                        shrink
                                        htmlFor="amount"
                                        sx={{
                                            fontSize: '1.3rem',
                                            color: 'rgba(0, 0, 0, 0.8)',
                                            '&.Mui-focused': {
                                                color: 'black',
                                            },
                                        }}
                                    >
                                        Amount:
                                    </InputLabel>
                                    <BootstrapInput
                                        type="number"
                                        name="amount"
                                        id="amount"
                                        placeholder="Amount"
                                        value={sosForm.values.amount}
                                        onChange={sosForm.handleChange}
                                    />
                                    {sosForm.touched.amount && <div style={{ color: 'red', fontSize: 12 }}>{sosForm.errors.amount}</div>}
                                </FormControl>
                            ) : displayField("Amount", sosForm.values.amount)}

                            {edit ? (
                                <FormControl variant="standard" fullWidth sx={{ mb: 3 }}>
                                    <InputLabel shrink htmlFor="driverSplitAmount" sx={{
                                        fontSize: '1.3rem',
                                        color: 'rgba(0, 0, 0, 0.8)',
                                        '&.Mui-focused': {
                                            color: 'black',
                                        },
                                    }}>
                                        Driver Split Amount:
                                    </InputLabel>
                                    <BootstrapInput
                                        type="number"
                                        name="driverSplitAmount"
                                        placeholder="Driver Split Amount"
                                        value={sosForm.values.driverSplitAmount}
                                        onChange={sosForm.handleChange}
                                    />
                                    {sosForm.touched.driverSplitAmount && <div style={{ color: 'red', fontSize: 12 }}>{sosForm.errors.driverSplitAmount}</div>}
                                </FormControl>
                            ) : displayField("Driver Split Amount", sosForm.values.driverSplitAmount)}

                            {edit ? (
                                <FormControl variant="standard" fullWidth sx={{ mb: 3 }}>
                                    <InputLabel shrink htmlFor="companySplitAmount" sx={{
                                        fontSize: '1.3rem',
                                        color: 'rgba(0, 0, 0, 0.8)',
                                        '&.Mui-focused': {
                                            color: 'black',
                                        },
                                    }}>
                                        Company Split Amount:
                                    </InputLabel>
                                    <BootstrapInput
                                        type="number"
                                        name="companySplitAmount"
                                        placeholder="Company Split Amount"
                                        value={sosForm.values.companySplitAmount}
                                        onChange={sosForm.handleChange}
                                    />
                                    {sosForm.touched.companySplitAmount && <div style={{ color: 'red', fontSize: 12 }}>{sosForm.errors.companySplitAmount}</div>}
                                </FormControl>
                            ) : displayField("Company Split Amount", sosForm.values.companySplitAmount)}
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            {edit ? (
                                <FormControl variant="standard" fullWidth sx={{ mb: 3 }}>
                                    <InputLabel shrink htmlFor="currency" sx={{
                                        fontSize: '1.3rem',
                                        color: 'rgba(0, 0, 0, 0.8)',
                                        '&.Mui-focused': {
                                            color: 'black',
                                        },
                                    }}>
                                        Currency:
                                    </InputLabel>
                                    <BootstrapInput
                                        type="text"
                                        name="currency"
                                        placeholder="Currency"
                                        value={sosForm.values.currency}
                                        onChange={sosForm.handleChange}
                                    />
                                    {sosForm.touched.currency && <div style={{ color: 'red', fontSize: 12 }}>{sosForm.errors.currency}</div>}
                                </FormControl>
                            ) : displayField("Currency", sosForm.values.currency)}

                            {edit ? (
                                <FormControl variant="standard" fullWidth sx={{ mb: 2 }}>
                                    <label
                                        htmlFor="notificationTypeId"
                                        style={{
                                            fontSize: '1rem',
                                            color: 'rgba(0, 0, 0, 0.8)',
                                            fontWeight: 500,
                                            marginBottom: '6px',
                                            display: 'block'
                                        }}
                                    >
                                        Select Service:
                                    </label>
                                    <Select
                                        name="notificationTypeId"
                                        options={servicesList}
                                        placeholder="Select Service"
                                        classNamePrefix="select"
                                        value={servicesList
                                            .flatMap((group) => group.options)
                                            .find((option) => option.value === sosForm.values.notificationTypeId)}
                                        onChange={(selectedOption) => {
                                            sosForm.setFieldValue("notificationTypeId", selectedOption?.value || "");
                                        }}
                                        styles={{
                                            control: (base, state) => ({
                                                ...base,
                                                backgroundColor: "white",
                                                height: '45px',
                                                border:
                                                    state.isFocused ? "1px solid #E0E3E7 !important" : "1px solid #E0E3E7 !important",
                                                boxShadow: state.isFocused ? "0 0 0 2px rgba(25, 118, 210, 0.25)" : "none",
                                                "&:hover": {
                                                    border: "1px solid #E0E3E7!important",
                                                },
                                            }),
                                            option: (base, state) => ({
                                                ...base,
                                                backgroundColor: state.isSelected ? "#f0f0f0" : state.isFocused ? "#f9f9f9" : "white",
                                                color: "black",
                                            }),
                                            valueContainer: (base) => ({
                                                ...base,
                                                maxHeight: "50px",
                                                overflowY: "auto",
                                            }),
                                        }}
                                    />
                                    {sosForm.touched.notificationTypeId && sosForm.errors.notificationTypeId && (
                                        <div style={{ color: 'red', fontSize: 12 }}>{sosForm.errors.notificationTypeId}</div>
                                    )}
                                </FormControl>
                            ) : displayField(
                                "Service",
                                servicesList
                                    .flatMap((group) => group.options)
                                    .find((opt) => opt.value === sosForm.values.notificationTypeId)?.label || "-"
                            )}
                        </Grid>
                    </Grid>

                    <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
                        {edit ? (
                            <>
                                <Button
                                    variant="outlined"
                                    onClick={() => setEdit(false)}
                                    sx={{ width: '130px', height: '48px', borderRadius: '10px' }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    sx={{ backgroundColor: 'var(--Blue)', width: '130px', height: '48px', borderRadius: '10px' }}
                                    disabled={isPending}
                                >
                                    {isPending ? <Loader color="white" /> : "Save"}
                                </Button>
                            </>
                        ) : (
                            <Button
                                variant="contained"
                                onClick={() => setEdit(true)}
                                sx={{ backgroundColor: 'var(--Blue)', width: '130px', height: '48px', borderRadius: '10px' }}
                            >
                                Edit
                            </Button>
                        )}
                    </Box>
                </form>
            </Paper>
        </Box>
    );
};

export default ArmedSosAmount;
