import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { toastOption } from "../common/ToastOptions";
import { useLayoutEffect, useState } from "react";
import { SosAmount } from "../common/FormValidation";
import { useGetServicesList, useCreateSosAmount } from "../API Calls/API";
import { useFormik } from "formik";
import { useQueryClient } from "@tanstack/react-query";
import Loader from "../common/Loader";
import { BootstrapInput } from "../common/BootstrapInput";
import {
    Paper,
    Typography,
    Button,
    Box,
    Grid,
    FormControl,
    InputLabel,
    TextField
} from "@mui/material";
import Select from "react-select";

const AddSosAmount = () => {
    const client = useQueryClient();
    const [servicesList, setServicesList] = useState([]);
    const nav = useNavigate();
    const serviceslist = useGetServicesList();

    const sosform = {
        amount: "",
        driverSplitAmount: "",
        companySplitAmount: "",
        currency: "",
        notificationTypeId: ""
    };

    const onSuccess = () => {
        toast.success("Sos added successfully.");
        Sosform.resetForm();
        client.invalidateQueries("ArmedSOSAmount List");
        nav("/home/total-sos-amount");
    };

    const onError = (error) => {
        toast.error(error.response?.data?.message || "Something went wrong", toastOption);
    };

    const newSos = useCreateSosAmount(onSuccess, onError);

    const Sosform = useFormik({
        initialValues: sosform,
        validationSchema: SosAmount,
        onSubmit: (values) => {
            const payload = {
                amount: Number(values.amount),
                driverSplitAmount: Number(values.driverSplitAmount),
                companySplitAmount: Number(values.companySplitAmount),
                currency: values.currency,
                notificationTypeId: values.notificationTypeId,
            };
            newSos.mutate(payload);
        },
    });

    useLayoutEffect(() => {
        if (Array.isArray(serviceslist)) {
            const filteredServices = serviceslist.filter(service => service);
            const groupedOptions = [
                {
                    label: "Services",
                    options: filteredServices.map((service) => ({
                        label: service.type,
                        value: service._id,
                    })),
                }
            ];
            setServicesList(groupedOptions);
        }
    }, [serviceslist]);

    return (
        <Box px={3} sx={{ height: '90vh' }}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: '10px' }}>
                <Box sx={{ p: 1, mb: 3, borderBottom: '1px solid #E5E7EB' }}>
                    <Typography variant="h6" fontWeight={550} color="black">
                        Sos Information
                    </Typography>
                </Box>

                <form onSubmit={Sosform.handleSubmit}>
                    <Grid container spacing={{ xs: 0, sm: 3 }}>
                        <Grid size={{ xs: 12, sm: 6 }}>
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
                                    value={Sosform.values.amount}
                                    onChange={Sosform.handleChange}
                                />
                                {Sosform.touched.amount && <div style={{ color: 'red', fontSize: 12 }}>{Sosform.errors.amount}</div>}
                            </FormControl>

                            <FormControl variant="standard" fullWidth sx={{ mb: 3 }}>
                                <InputLabel
                                    shrink
                                    htmlFor="driverSplitAmount"
                                    sx={{
                                        fontSize: '1.3rem',

                                        color: 'rgba(0, 0, 0, 0.8)',
                                        '&.Mui-focused': {
                                            color: 'black',
                                        },
                                    }}
                                >Driver Split Amount:
                                </InputLabel>
                                <BootstrapInput
                                    id='driverSplitAmount'
                                    type="number"
                                    name="driverSplitAmount"
                                    placeholder="Driver Split Amount"
                                    value={Sosform.values.driverSplitAmount}
                                    onChange={Sosform.handleChange}
                                />
                                {Sosform.touched.driverSplitAmount && <div style={{ color: 'red', fontSize: 12 }}>{Sosform.errors.driverSplitAmount}</div>}
                            </FormControl>

                            <FormControl variant="standard" fullWidth sx={{ mb: 3 }}>
                                <InputLabel
                                    shrink
                                    htmlFor="companySplitAmount"
                                    sx={{
                                        fontSize: '1.3rem',

                                        color: 'rgba(0, 0, 0, 0.8)',
                                        '&.Mui-focused': {
                                            color: 'black',
                                        },
                                    }}
                                >Company Split Amount:
                                </InputLabel>
                                <BootstrapInput
                                    id='companySplitAmount'
                                    type="number"
                                    name="companySplitAmount"
                                    placeholder="Company Split Amount"
                                    value={Sosform.values.companySplitAmount}
                                    onChange={Sosform.handleChange}
                                />
                                {Sosform.touched.companySplitAmount && <div style={{ color: 'red', fontSize: 12 }}>{Sosform.errors.companySplitAmount}</div>}
                            </FormControl>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>

                            <FormControl variant="standard" fullWidth sx={{ mb: 3 }}>
                                <InputLabel
                                    shrink
                                    htmlFor="currency"
                                    sx={{
                                        fontSize: '1.3rem',

                                        color: 'rgba(0, 0, 0, 0.8)',
                                        '&.Mui-focused': {
                                            color: 'black',
                                        },
                                    }}
                                >Currency:
                                </InputLabel>
                                <BootstrapInput
                                    id='currency'
                                    type="text"
                                    name="currency"
                                    placeholder="Currency"
                                    value={Sosform.values.currency}
                                    onChange={Sosform.handleChange}
                                />
                                {Sosform.touched.currency && <div style={{ color: 'red', fontSize: 12 }}>{Sosform.errors.currency}</div>}
                            </FormControl>

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
                                    id="notificationTypeId"
                                    name="notificationTypeId"
                                    options={servicesList}
                                    placeholder="Select Service"
                                    classNamePrefix="select"
                                    value={
                                        Sosform.values.notificationTypeId
                                            ? servicesList.flatMap((group) => group.options).find((option) => option.value === Sosform.values.notificationTypeId)
                                            : null
                                    }
                                    onChange={(selectedOption) => {
                                        Sosform.setFieldValue("notificationTypeId", selectedOption?.value || "");
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
                                            backgroundColor: state.isSelected
                                                ? "#f0f0f0"
                                                : state.isFocused
                                                    ? "#f9f9f9"
                                                    : "white",
                                            color: "black",
                                        }),
                                        valueContainer: (base) => ({
                                            ...base,
                                            maxHeight: "50px",
                                            overflowY: "auto",
                                        }),
                                    }}
                                />

                                {Sosform.touched.notificationTypeId && Sosform.errors.notificationTypeId && (
                                    <div style={{ color: 'red', fontSize: 12 }}>{Sosform.errors.notificationTypeId}</div>
                                )}
                            </FormControl>
                        </Grid>
                    </Grid>

                    <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
                        <Button
                            variant="contained"
                            onClick={() => Sosform.resetForm()}
                            sx={{
                                backgroundColor: 'white', color: 'var(--font-gray)', boxShadow: 'none', border: '1px solid var(--light-gray)', width: '130px', height: '48px', borderRadius: '10px', '&:hover': {
                                    boxShadow: 'none'
                                }
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            sx={{ backgroundColor: 'var(--Blue)', width: '130px', height: '48px', borderRadius: '10px' }}
                            disabled={newSos.isPending}
                        >
                            {newSos.isPending ? <Loader color="white" /> : "Save"}
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Box>
    );
};

export default AddSosAmount;
