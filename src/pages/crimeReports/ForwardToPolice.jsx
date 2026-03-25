import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { companyValidation } from "../../common/FormValidation";
import { useQueryClient } from "@tanstack/react-query";
import { useGetProvinceList, useGetCityList, useGetCountryList, useGetPoliceUnitsByCity } from "../../API Calls/API";
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
const ForwardToPolice = () => {
    const SapsForm = useFormik({
        initialValues: {
            country: "",
            province: "",
            city: "",
            suburb: "",
            police_unit_name: "",
        },
        // validationSchema: companyValidation,
        onSubmit: (values) => {
            const formData = new FormData();
            Object.keys(values).forEach(key => {
                formData.append(key, values[key]);

            });
            newcompany.mutate(formData);
        },
    });
    const countryList = useGetCountryList()
    const provincelist = useGetProvinceList(SapsForm.values.country)
    const cityList = useGetCityList(SapsForm.values.province)
    const policeStation = useGetPoliceUnitsByCity(SapsForm.values.city);

    const location = useLocation();
    const data = location.state?.details;
    const nav = useNavigate()
    const handleCancel = () => {
        nav("/home/crime-reports");
    };
    useEffect(() => {
        const police_unit = data?.crimeReportAssignPoliceUnit?.police_unit_id     
        if (police_unit) {
            SapsForm.setValues({
                country:police_unit.country,
                province:police_unit.province,
                city:police_unit.city,
                suburb:police_unit.suburb,
                police_unit_name: police_unit._id || "",
            });
        }
    }, []);
    return (
        <Box px={2} sx={{ height: '100vh' }}>
            <Paper elevation={0} sx={{ p: 3, mt: 3, mb: 3, borderRadius: '10px' }}>
                <Grid container spacing={3}>
                    <Grid size={12} sx={{ borderBottom: '1px solid var(--light-gray)' }}>
                        <Typography variant="h6" gutterBottom fontWeight={600}>
                            Group Information
                        </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <CustomSelect
                            label="Country"
                            name="country"
                            value={SapsForm.values.country}
                            onChange={SapsForm.handleChange}
                            options={countryList?.data?.data.data?.map(country => ({
                                value: country._id,
                                label: country.country_name
                            })) || []}
                            error={SapsForm.errors.country && SapsForm.touched.country}
                            helperText={SapsForm.touched.country ? SapsForm.errors.country : ''}
                        />
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
                        <CustomSelect
                            label="Police Station Name"
                            name="police_unit_name"
                            value={SapsForm.values.police_unit_name}
                            onChange={SapsForm.handleChange}
                            options={policeStation.data?.data?.map(city => ({
                                value: city._id,
                                label: city.police_unit_name
                            })) || []}
                            error={SapsForm.errors.police_unit_name && SapsForm.touched.police_unit_name}
                            helperText={SapsForm.touched.police_unit_name ? SapsForm.errors.police_unit_name : ''}
                        />
                    </Grid>
                </Grid>
            </Paper>
            <Paper elevation={0} sx={{ p: 3, mt: 3, mb: 3, borderRadius: '10px' }}>
                <Grid size={12} sx={{ borderBottom: '1px solid var(--light-gray)' }}>
                    <Typography variant="h6" gutterBottom fontWeight={600}>
                        Report Summary
                    </Typography>
                </Grid>
                <Grid container mt={3} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <Grid size={{ xs: 12, sm: 3 }}>
                        <Typography fontSize={'1rem'} fontWeight={500} color="text.secondary">
                            Report Number:
                        </Typography>
                        <Typography fontSize={'1.05rem'} mt={1}>
                            {data?.crime_report_number}
                        </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 3 }}>

                        <Typography fontSize={'1rem'} fontWeight={500} color="text.secondary">
                            Crime Type:
                        </Typography>
                        <Typography fontSize={'1.05rem'} mt={1}>
                            {data?.crime_type_id?.crimeType}
                        </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 3 }}>

                        <Typography fontSize={'1rem'} fontWeight={500} color="text.secondary">
                            Location:
                        </Typography>
                        <Typography fontSize={'1.05rem'} mt={1}>
                            {data?.address}
                        </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 3 }}>

                        <Typography fontSize={'1rem'} fontWeight={500} color="text.secondary">
                            Date Reported:
                        </Typography>
                        <Typography fontSize={'1.05rem'} mt={1}>
                            {data?.submittedDate}
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>
            <Grid size={12} sx={{ mt: 1 }}>
                <Box display="flex" justifyContent="flex-end" gap={2}>
                    <Button variant="outlined" sx={{ width: 130, height: 48, borderRadius: '10px', color: 'var(--font-gray)', borderColor: '#E0E3E7' }} onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        onClick={() => {
                            // SapsForm.handleSubmit
                            nav('/home/crime-reports/confirmation', {
                                state: { details: data, police_unit_details: SapsForm.values.police_unit_name }
                            })
                        }}

                        sx={{ width: 220, height: 48, borderRadius: '10px', backgroundColor: 'var(--Blue)' }}
                    >
                        Proceed to Confirmation
                    </Button>
                </Box>
            </Grid>
        </Box>
    )
}

export default ForwardToPolice
