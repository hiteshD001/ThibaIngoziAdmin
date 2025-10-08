import React, { useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { companyValidation } from "../../common/FormValidation";
import { useQueryClient } from "@tanstack/react-query";
import { useGetProvinceList, useGetCityList } from "../../API Calls/API";
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


const AddSapsWanted = () => {
    const client = useQueryClient();
    const nav = useNavigate();
    const SapsForm = useFormik({
        initialValues: {
            full_name: "",
            aliases: "",
            caseNumber: "",
            crimDate: "",
            lastLocation: "",
            charges: "",
            province: "",
            city: "",
            suburb: "",
            policeStationName: "",
            officerContact: "",
            mobile_no: "",
            mobile_no_country_code: "+27",
            description: "",
            status: "",
            photos: [],
        },
        // validationSchema: companyValidation,
        onSubmit: (values) => {
            const formData = new FormData();
            Object.keys(values).forEach(key => {
                if (key !== "photos") {
                    if (key === "securityCompany") {
                        values[key]?.forEach(id => {
                            formData.append("securityCompany[]", id);
                        });
                    } else {
                        formData.append(key, values[key]);
                    }
                }
            });
            if (values.selfieImage) {
                formData.append("selfieImage", values.selfieImage);
            }
            if (values.services && values.services.length > 0) {
                values.services.forEach((serviceId) => {
                    if (serviceId) {
                        formData.append("companyService[]", serviceId);
                    }
                });
            }

            if (values.fullImage) {
                formData.append("fullImage", values.fullImage);
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
    // const newcompany = useRegister(onSuccess, onError)
    const provincelist = useGetProvinceList(SapsForm.values.country)
    const cityList = useGetCityList(SapsForm.values.province)

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
    const policeStation = [
        {
            _id: 1,
            policeStation_name: 'Police Station 1'
        },
        {
            _id: 2,
            policeStation_name: 'Police Station 2'
        }
    ]
    const status = [{
        _id: 1,
        status_name: "Captured"
    }, {
        _id: 2,
        status_name: "Wanted"
    }]
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
                                    id="first_name"
                                    name="first_name"
                                    placeholder="First Name"
                                    value={SapsForm.values.first_name}
                                    onChange={SapsForm.handleChange}
                                />
                                {SapsForm.touched.first_name && (
                                    <div style={{ color: 'red', fontSize: 12 }}>
                                        {SapsForm.errors.first_name}
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
                                    htmlFor="caseNumber"
                                    sx={{
                                        fontSize: '1.3rem',
                                        color: 'rgba(0, 0, 0, 0.8)',
                                        '&.Mui-focused': { color: 'black' }
                                    }}
                                >
                                    Case Number
                                </InputLabel>
                                <BootstrapInput
                                    id="caseNumber"
                                    name="caseNumber"
                                    placeholder="Enter Case Number"
                                    value={SapsForm.values.caseNumber}
                                    onChange={SapsForm.handleChange}
                                />
                                {SapsForm.touched.caseNumber && (
                                    <div style={{ color: 'red', fontSize: 12 }}>
                                        {SapsForm.errors.caseNumber}
                                    </div>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl variant="standard" fullWidth>
                                <InputLabel shrink htmlFor="charges" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                    Known Offenses / Charges
                                </InputLabel>
                                <BootstrapInput
                                    id="charges"
                                    name="charges"
                                    placeholder="Enter known offenses/charges"
                                    value={SapsForm.values.charges}
                                    onChange={SapsForm.handleChange}
                                />
                                {SapsForm.touched.charges && <div style={{ color: 'red', fontSize: 12 }}>{SapsForm.errors.charges}</div>}
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl variant="standard" fullWidth>
                                <InputLabel shrink htmlFor="lastLocation" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                    Last Known Location
                                </InputLabel>
                                <BootstrapInput
                                    id="lastLocation"
                                    name="lastLocation"
                                    placeholder="Enter Last Known Location"
                                    value={SapsForm.values.lastLocation}
                                    onChange={SapsForm.handleChange}
                                />
                                {SapsForm.touched.lastLocation && <div style={{ color: 'red', fontSize: 12 }}>{SapsForm.errors.lastLocation}</div>}
                            </FormControl>
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
                                disabled={!SapsForm.values.country}
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
                                disabled={!SapsForm.values.country || !SapsForm.values.province}
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
                                <InputLabel shrink htmlFor="officerContact" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                    Investigating Officer / Tip-off Line
                                </InputLabel>
                                <BootstrapInput
                                    id="officerContact"
                                    name="officerContact"
                                    placeholder="Contact Number"
                                    value={SapsForm.values.officerContact}
                                    onChange={SapsForm.handleChange}
                                />
                                {SapsForm.touched.officerContact && <div style={{ color: 'red', fontSize: 12 }}>{SapsForm.errors.officerContact}</div>}
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl variant="standard" fullWidth>
                                <label style={{ marginBottom: 5 }}>Contact Number</label>
                                <PhoneInput
                                    country="za"
                                    value={SapsForm.values.mobile_no || ""}
                                    onChange={(value, countryData) => {
                                        SapsForm.setFieldValue("mobile_no", value);
                                        SapsForm.setFieldValue("mobile_no_country_code", `+${countryData.dialCode}`);
                                    }}
                                    inputStyle={{
                                        width: '100%',
                                        height: '46px',
                                        borderRadius: '6px',
                                        border: '1px solid #E0E3E7',
                                        fontSize: '16px',
                                        paddingLeft: '48px',
                                        background: '#fff',
                                        outline: 'none',
                                        boxShadow: 'none',
                                        borderColor: '#E0E3E7',
                                    }}
                                    buttonStyle={{
                                        borderRadius: '6px 0 0 6px',
                                        border: '1px solid #E0E3E7',
                                        background: '#fff'
                                    }}
                                    containerStyle={{
                                        height: '46px',
                                        width: '100%',
                                        marginBottom: '8px'
                                    }}
                                    specialLabel=""
                                    inputProps={{
                                        name: 'mobile_no',
                                        required: true,
                                        autoFocus: false
                                    }}
                                />
                            </FormControl>
                            {SapsForm.touched.mobile_no && <FormHelperText error>{SapsForm.errors.mobile_no}</FormHelperText>}

                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <CustomSelect
                                label="Police Station Name"
                                name="policeStationName"
                                value={SapsForm.values.policeStationName}
                                onChange={SapsForm.handleChange}
                                options={policeStation.map(city => ({
                                    value: city._id,
                                    label: city.policeStation_name
                                })) || []}
                                error={SapsForm.errors.policeStationName && SapsForm.touched.policeStationName}
                                helperText={SapsForm.touched.policeStationName ? SapsForm.errors.policeStationName : ''}
                            />
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
                                <InputLabel shrink htmlFor="description" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                    Crime Information and Description
                                </InputLabel>
                                <BootstrapInput
                                    id="description"
                                    name="description"
                                    multiline
                                    rows={3}
                                    placeholder="Include Clothing description, known hangouts , threats or other relevant information"
                                    value={SapsForm.values.description}
                                    onChange={SapsForm.handleChange}
                                />
                                {SapsForm.touched.description && <div style={{ color: 'red', fontSize: 12 }}>{SapsForm.errors.description}</div>}
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <CustomSelect
                                label="Current Status"
                                name="status"
                                value={SapsForm.values.status}
                                onChange={SapsForm.handleChange}
                                options={status.map(status => ({
                                    value: status._id,
                                    label: status.status_name
                                })) || []}
                                error={SapsForm.errors.status && SapsForm.touched.status}
                                helperText={SapsForm.touched.status ? SapsForm.errors.status : ''}
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
            <Grid size={12} sx={{ mt: 1 }}>
                <Box display="flex" justifyContent="flex-end" gap={2}>
                    <Button variant="outlined" sx={{ width: 130, height: 48, borderRadius: '10px', color: '#4B5563', borderColor: '#E0E3E7' }} onClick={handleCancel}>
                        <IconButton >
                            <MdClose />
                        </IconButton>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        onClick={SapsForm.handleSubmit}
                        startIcon={<img src={plane} alt='publish' />}
                        // disabled={newcompany.isPending}
                        sx={{ width: 200, height: 48, borderRadius: '10px', backgroundColor: 'var(--Blue)' }}
                    >
                        {/* {newcompany.isPending ? <Loader color="white" /> : "Save"} */}
                        Publish
                    </Button>
                </Box>
            </Grid>
        </Box>
    );
};

export default AddSapsWanted;
