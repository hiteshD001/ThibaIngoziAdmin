import React, { useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { useQueryClient } from "@tanstack/react-query";
import { useGetProvinceList, useGetCityList, useGetPoliceUnitsByCity, useAddWantedSAPS, useGetSAPSMemberByPoliceUnitId } from "../../API Calls/API";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import { toast } from "react-toastify";
import { toastOption } from "../../common/ToastOptions";
import PhoneInput from "react-phone-input-2";
import '../../css/company.css'
import plane from '../../assets/images/plane.svg'
import { MdClose } from "react-icons/md";
import { Box, Button, Typography, InputLabel, FormControl, FormHelperText, IconButton, Grid, Paper } from "@mui/material";
import GrayPlus from '../../assets/images/GrayPlus.svg'
import CustomSelect from "../../common/Custom/CustomSelect";
import { BootstrapInput } from "../../common/BootstrapInput";
import { components } from 'react-select';
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs from "dayjs";
import SAPSWantedMap from "../../common/SAPSWantedMap";
import { SAPSWantedEditValidation } from "../../common/FormValidation";

const AddSapsWanted = () => {
    const client = useQueryClient();
    const nav = useNavigate();
    const SapsForm = useFormik({
        initialValues: {
            full_name: "",
            aliases: "",
            case_number: "",
            crime_date: "",
            last_know_location: "",
            known_offenses: "",
            province: "",
            city: "",
            suburb: "",
            police_unit_id: "",
            investigating_officer: "",
            contact_number: "",
            crime_information_description: "",
            current_status: "",
            selfieImage: [],
            fullImage: ""
        },
        validationSchema: SAPSWantedEditValidation,
        onSubmit: (values) => {
            const formData = new FormData();

            Object.keys(values).forEach((key) => {
                if (key === "selfieImage" || key === "fullImage") {
                    return;
                }

                formData.append(key, values[key]);
            });

            if (values.selfieImages?.length > 0) {
                values.selfieImages.forEach((file) => {
                    formData.append("evidence_image", file);
                });
            }

            if (values.fullImage) {
                formData.append("profile_image", values.fullImage);
            }
            newcompany.mutate(formData);
        },
    });

    const onSuccess = () => {
        toast.success("Wanted Criminal Added Successfully.");
        SapsForm.resetForm();
        client.invalidateQueries("company list");
        nav("/home/total-saps-wanted");
    }
    const onError = (error) => {
        toast.error(error.response.data.message || "Something went Wrong", toastOption)
    }
    const newcompany = useAddWantedSAPS(onSuccess, onError)
    const provincelist = useGetProvinceList('673361a0041c365bf8edae16')
    const cityList = useGetCityList(SapsForm.values.province)
    const policeStation = useGetPoliceUnitsByCity(SapsForm.values.city)
    const investigatingOfficerList = useGetSAPSMemberByPoliceUnitId(SapsForm.values.police_unit_id)

    const handleCancel = () => {
        nav("/home/total-saps-wanted");
    };
    const DropdownIndicator = (props) => {
        return (
            <components.DropdownIndicator {...props}>
                {props.selectProps.menuIsOpen ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
            </components.DropdownIndicator>
        );
    };

    const status = [{
        _id: "captured",
        status_name: "captured"
    }, {
        _id: "wanted",
        status_name: "wanted"
    }]

    const handleLocationChange = (data) => {
        SapsForm.setFieldValue(
            "last_know_location",
            data.address
        );

        SapsForm.setFieldValue(
            "lat",
            data.lat
        );

        SapsForm.setFieldValue(
            "long",
            data.long
        );
    };

    return (
        <Box p={2}>
            <form onSubmit={SapsForm.handleSubmit}>
                {/* Basic Info Section */}
                <Paper elevation={0} sx={{ p: 3, borderRadius: '10px' }}>
                    <Grid container spacing={3}>
                        <Grid size={12}>
                            <Typography variant="h6" gutterBottom fontWeight={600}>
                                Basic Information
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl variant="standard" fullWidth>
                                <InputLabel
                                    shrink
                                    htmlFor="first_name"
                                    sx={{
                                        fontSize: '1.3rem',
                                        color: 'rgba(0, 0, 0, 0.8)',
                                        '&.Mui-focused': { color: 'black' }
                                    }}
                                >
                                    Full Name
                                </InputLabel>
                                <BootstrapInput
                                    id="full_name"
                                    name="full_name"
                                    placeholder="Full Name"
                                    value={SapsForm.values.full_name}
                                    onChange={SapsForm.handleChange}
                                />
                                {SapsForm.touched.full_name && (
                                    <div style={{ color: 'red', fontSize: 12 }}>
                                        {SapsForm.errors.full_name}
                                    </div>
                                )}
                            </FormControl>

                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl variant="standard" fullWidth>
                                <InputLabel
                                    shrink
                                    htmlFor="aliases"
                                    sx={{
                                        fontSize: '1.3rem',
                                        color: 'rgba(0, 0, 0, 0.8)',
                                        '&.Mui-focused': { color: 'black' }
                                    }}
                                >
                                    Aliases
                                </InputLabel>
                                <BootstrapInput
                                    id="aliases"
                                    name="aliases"
                                    placeholder="Enter Aliases"
                                    value={SapsForm.values.aliases}
                                    onChange={SapsForm.handleChange}
                                />
                                {SapsForm.touched.aliases && (
                                    <div style={{ color: 'red', fontSize: 12 }}>
                                        {SapsForm.errors.aliases}
                                    </div>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl variant="standard" fullWidth >
                                <InputLabel
                                    shrink
                                    htmlFor="case_number"
                                    sx={{
                                        fontSize: '1.3rem',
                                        color: 'rgba(0, 0, 0, 0.8)',
                                        '&.Mui-focused': { color: 'black' }
                                    }}
                                >
                                    Case Number
                                </InputLabel>
                                <BootstrapInput
                                    id="case_number"
                                    name="case_number"
                                    placeholder="Enter Case Number"
                                    value={SapsForm.values.case_number}
                                    onChange={SapsForm.handleChange}
                                />
                                {SapsForm.touched.case_number && (
                                    <div style={{ color: 'red', fontSize: 12 }}>
                                        {SapsForm.errors.case_number}
                                    </div>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl variant="standard" fullWidth>
                                <InputLabel shrink htmlFor="known_offenses" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                    Known Offenses / Charges
                                </InputLabel>
                                <BootstrapInput
                                    id="known_offenses"
                                    name="known_offenses"
                                    placeholder="Enter known offenses/charges"
                                    value={SapsForm.values.known_offenses}
                                    onChange={SapsForm.handleChange}
                                />
                                {SapsForm.touched.known_offenses && <div style={{ color: 'red', fontSize: 12 }}>{SapsForm.errors.known_offenses}</div>}
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl variant="standard" fullWidth>
                                <label style={{ marginBottom: "10px", fontWeight: 500, fontSize: "16px", lineHeight: 1 }}>Date of Crime</label>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DateTimePicker
                                        label="Date of Crime"
                                        value={SapsForm.values.crime_date || null}
                                        onChange={(newValue) => {
                                            SapsForm.setFieldValue("crime_date", newValue);
                                        }}
                                        maxDateTime={dayjs()}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                size: "small",
                                                sx: {
                                                    height: 44,
                                                    mt: "3px",

                                                    "& .MuiInputBase-root": {
                                                        height: 44, // ✅ main container height
                                                    },

                                                    "& .MuiInputBase-input": {
                                                        height: "44px !important",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        padding: "0 14px",
                                                        boxSizing: "border-box",
                                                    },

                                                    "& .MuiOutlinedInput-notchedOutline": {
                                                        borderColor: "#E0E3E7 !important",
                                                    },

                                                    "&:hover .MuiOutlinedInput-notchedOutline": {
                                                        borderColor: "#E0E3E7 !important",
                                                    },

                                                    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                                        borderColor: "#E0E3E7 !important",
                                                    },

                                                    "& .MuiOutlinedInput-root": {
                                                        boxShadow: "none",
                                                    },

                                                    "& .MuiSvgIcon-root": {
                                                        fontSize: "18px", // calendar icon size
                                                    },
                                                },
                                                error:
                                                    SapsForm.touched.crime_date &&
                                                    Boolean(SapsForm.errors.crime_date),
                                                helperText:
                                                    SapsForm.touched.crime_date &&
                                                    SapsForm.errors.crime_date,
                                            },
                                        }}
                                    />
                                </LocalizationProvider>
                            </FormControl>
                        </Grid>
                        
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <label style={{ marginBottom: '10px', display: 'block', fontWeight: 500 }}>Profile Image</label>
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
                                    name="fullImage"
                                    onChange={e => SapsForm.setFieldValue('fullImage', e.currentTarget.files[0])}
                                />
                                {SapsForm.values.fullImage instanceof File ? (
                                    <img
                                        src={URL.createObjectURL(SapsForm.values.fullImage)}
                                        alt="Selfie Preview"
                                        style={{ height: 200, width: '100%', objectFit: 'contain', marginBottom: 8 }}
                                    />
                                ) : SapsForm.values.fullImage ? (
                                    <img
                                        src={SapsForm.values.fullImage}
                                        alt="Selfie"
                                        style={{ height: 200, width: '100%', objectFit: 'contain', marginBottom: 8 }}
                                    />
                                ) : (<><img src={GrayPlus} alt="gray plus" />
                                    <Typography sx={{ color: '#B0B0B0', fontWeight: 550, mt: 1 }}>Upload</Typography></>
                                )}
                            </Box>
                            {SapsForm.touched.fullImage && SapsForm.errors.fullImage && (
                                <FormHelperText error>{SapsForm.errors.fullImage}</FormHelperText>
                            )}

                        </Grid>
                    </Grid>
                </Paper>
                {/* Address Section */}
                <Paper elevation={0} sx={{ p: 3, mt: 3, mb: 3, borderRadius: '10px' }}>
                    <Grid container spacing={3}>

                        <Grid size={12}>
                            <Typography variant="h6" gutterBottom fontWeight={600}>
                                Location and Officer Info
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <CustomSelect
                                label="Province"
                                name="province"
                                value={SapsForm.values.province}
                                onChange={SapsForm.handleChange}
                                options={provincelist.data?.data.data?.map(province => ({
                                    value: province._id,
                                    label: province.province_name
                                })) || []}
                                error={SapsForm.errors.province && SapsForm.touched.province}
                                helperText={SapsForm.touched.province ? SapsForm.errors.province : ''}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <CustomSelect
                                label="City"
                                name="city"
                                value={SapsForm.values.city}
                                onChange={SapsForm.handleChange}
                                options={cityList.data?.data.data?.map(city => ({
                                    value: city._id,
                                    label: city.city_name
                                })) || []}
                                error={SapsForm.errors.city && SapsForm.touched.city}
                                helperText={SapsForm.touched.city ? SapsForm.errors.city : ''}
                                disabled={!SapsForm.values.province}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl variant="standard" fullWidth >
                                <InputLabel shrink htmlFor="suburb" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                    Suburb
                                </InputLabel>
                                <BootstrapInput
                                    id="suburb"
                                    name="suburb"
                                    placeholder="Enter Suburb"
                                    value={SapsForm.values.suburb}
                                    onChange={SapsForm.handleChange}
                                />
                                {SapsForm.touched.suburb && <div style={{ color: 'red', fontSize: 12 }}>{SapsForm.errors.suburb}</div>}
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl variant="standard" fullWidth >
                                <InputLabel shrink htmlFor="contact_number" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                    Contact Number
                                </InputLabel>
                                <BootstrapInput
                                    id="contact_number"
                                    name="contact_number"
                                    placeholder="Enter Contact Number"
                                    value={SapsForm.values.contact_number}
                                    onChange={SapsForm.handleChange}
                                />
                                {SapsForm.touched.contact_number && <div style={{ color: 'red', fontSize: 12 }}>{SapsForm.errors.contact_number}</div>}
                            </FormControl>

                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <CustomSelect
                                label="Police Station Name"
                                name="police_unit_id"
                                value={SapsForm.values.police_unit_id}
                                onChange={SapsForm.handleChange}
                                options={policeStation.data?.data.map(city => ({
                                    value: city._id,
                                    label: city.police_unit_name
                                })) || []}
                                error={SapsForm.errors.police_unit_id && SapsForm.touched.police_unit_id}
                                helperText={SapsForm.touched.police_unit_id ? SapsForm.errors.police_unit_id : ''}
                                disabled={!SapsForm.values.city}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <CustomSelect
                                label="Investigating Officer / Tip-off Line"
                                name="investigating_officer"
                                value={SapsForm.values.investigating_officer}
                                onChange={SapsForm.handleChange}
                                options={investigatingOfficerList.data?.data.map(city => ({
                                    value: city._id,
                                    label: city.first_name + ' ' + city.last_name
                                })) || []}
                                error={SapsForm.errors.investigating_officer && SapsForm.touched.investigating_officer}
                                helperText={SapsForm.touched.investigating_officer ? SapsForm.errors.investigating_officer : ''}
                                disabled={!SapsForm.values.police_unit_id}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl variant="standard" fullWidth>
                                <InputLabel shrink htmlFor="last_know_location" sx={{ marginBottom:"10px",fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                    Last Known Location
                                </InputLabel>
                                <SAPSWantedMap
                                    lat={9.1021}
                                    long={18.2812}
                                    address={''}
                                    isMapLoaded={true}
                                    onLocationChange={handleLocationChange}
                                />
                                {SapsForm.touched.last_know_location && <div style={{ color: 'red', fontSize: 12 }}>{SapsForm.errors.last_know_location}</div>}
                            </FormControl>
                        </Grid>
                    </Grid>
                </Paper>
                {/* evidence Section */}
                <Paper elevation={0} sx={{ p: 3, mt: 3, mb: 3, borderRadius: '10px' }}>
                    <Grid container spacing={3}>

                        <Grid size={12}>
                            <Typography variant="h6" gutterBottom fontWeight={600}>
                                Evidence & Additional Info
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <FormControl variant="standard" fullWidth >
                                <InputLabel shrink htmlFor="crime_information_description" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                    Crime Information and Description
                                </InputLabel>
                                <BootstrapInput
                                    id="crime_information_description"
                                    name="crime_information_description"
                                    multiline
                                    rows={3}
                                    placeholder="Include Clothing description, known hangouts , threats or other relevant information"
                                    value={SapsForm.values.crime_information_description}
                                    onChange={SapsForm.handleChange}
                                />
                                {SapsForm.touched.crime_information_description && <div style={{ color: 'red', fontSize: 12 }}>{SapsForm.errors.crime_information_description}</div>}
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <CustomSelect
                                label="Current Status"
                                name="current_status"
                                value={SapsForm.values.current_status}
                                onChange={SapsForm.handleChange}
                                options={status.map(status => ({
                                    value: status._id,
                                    label: status.status_name
                                })) || []}
                                error={SapsForm.errors.current_status && SapsForm.touched.current_status}
                                helperText={SapsForm.touched.current_status ? SapsForm.errors.current_status : ''}
                            />
                        </Grid>

                        <Grid size={12}>
                            <Grid container gap={4} sx={{ mt: 1 }}>
                                <Grid size={{ xs: 12 }}>
                                    <label style={{ marginBottom: '10px', display: 'block', fontWeight: 500 }}>Evidence and Photos(Up to 4 photos)</label>
                                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                                        {[1, 2, 3, 4].map((item, index) => (
                                            <Box key={index}>
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
                                                        background: '#fafbfc',
                                                        width: 200 // optional fixed width for layout
                                                    }}
                                                    component="label"
                                                >
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        hidden
                                                        name={`selfieImage-${index}`}
                                                        onChange={e => {
                                                            const files = [...(SapsForm.values.selfieImages || [])];
                                                            files[index] = e.currentTarget.files[0];
                                                            SapsForm.setFieldValue('selfieImages', files);
                                                        }}
                                                    />

                                                    {SapsForm.values.selfieImages?.[index] instanceof File ? (
                                                        <img
                                                            src={URL.createObjectURL(SapsForm.values.selfieImages[index])}
                                                            alt="Selfie Preview"
                                                            style={{ height: 200, width: '100%', objectFit: 'contain', marginBottom: 8 }}
                                                        />
                                                    ) : SapsForm.values.selfieImages?.[index] ? (
                                                        <img
                                                            src={SapsForm.values.selfieImages[index]}
                                                            alt="Selfie"
                                                            style={{ height: 200, width: '100%', objectFit: 'contain', marginBottom: 8 }}
                                                        />
                                                    ) : (
                                                        <>
                                                            <img src={GrayPlus} alt="gray plus" />
                                                            <Typography sx={{ color: '#B0B0B0', fontWeight: 550, mt: 1 }}>Upload</Typography>
                                                        </>
                                                    )}
                                                </Box>

                                                {SapsForm.touched.selfieImages?.[index] && SapsForm.errors.selfieImages?.[index] && (
                                                    <FormHelperText error>{SapsForm.errors.selfieImages[index]}</FormHelperText>
                                                )}
                                            </Box>
                                        ))}
                                    </Box>
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* Actions */}
                        <Grid size={12} sx={{ mt: 1 }}>
                            <Box display="flex" justifyContent="flex-end" gap={2}>
                                <Button variant="outlined" sx={{ width: 130, height: 48, borderRadius: '10px', color: 'black', borderColor: '#E0E3E7' }} onClick={handleCancel}>
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    onClick={SapsForm.handleSubmit}
                                    // disabled={newcompany.isPending}
                                    sx={{ width: 130, height: 48, borderRadius: '10px', backgroundColor: 'var(--Blue)' }}
                                >
                                    {/* {newcompany.isPending ? <Loader color="white" /> : "Save"} */}
                                    Save
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>
            </form>
        </Box>
    );
};

export default AddSapsWanted;
