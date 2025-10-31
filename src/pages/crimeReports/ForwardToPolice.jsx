import React, { useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { companyValidation } from "../../common/FormValidation";
import { useQueryClient } from "@tanstack/react-query";
import { useGetProvinceList, useGetCityList, useGetCountryList } from "../../API Calls/API";
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
            policeStationName: "",
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
    const countryList = useGetCountryList()
    const provincelist = useGetProvinceList(SapsForm.values.country)
    const cityList = useGetCityList(SapsForm.values.province)
    const nav = useNavigate()

    const caseNumber = "CASE-2023-0458";
    const description = "At approximately 9:30 PM on July 29, 2023, two masked individuals entered the Quick Stop convenience store at 1234 Main Street. Both suspects were armed with what appeared to be handguns.The suspects demanded cash from the register and also took several cartons of cigarettes.The store clerk complied with their demands and was not physically harmed.The suspects fled the scene in what witnesses describe as a dark - colored sedan, possibly a Honda Accord with tinted windows. The entire incident lasted approximately 3 minutes.Store security cameras were operational at the time of the incident.The store owner has been contacted and is arranging to provide the footage to authorities.";
    const location = "Downtown Street, Sector 12";
    const dateTime = "August 5, 2025 at 10:45 AM";
    const reportDate = "August 5, 2025 at 10:45 AM"
    const handleCancel = () => {
        nav("/home/crime-reports");
    };
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
                            {caseNumber}
                        </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 3 }}>

                        <Typography fontSize={'1rem'} fontWeight={500} color="text.secondary">
                            Crime Type:
                        </Typography>
                        <Typography fontSize={'1.05rem'} mt={1}>
                            Assult
                        </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 3 }}>

                        <Typography fontSize={'1rem'} fontWeight={500} color="text.secondary">
                            Location:
                        </Typography>
                        <Typography fontSize={'1.05rem'} mt={1}>
                            {location}
                        </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 3 }}>

                        <Typography fontSize={'1rem'} fontWeight={500} color="text.secondary">
                            Date Reported:
                        </Typography>
                        <Typography fontSize={'1.05rem'} mt={1}>
                            {dateTime}
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
                            SapsForm.handleSubmit
                            nav('/home/crime-reports/confirmation')
                        }}
                        // startIcon={<img src={plane} alt='publish' />}
                        // disabled={newcompany.isPending}
                        sx={{ width: 220, height: 48, borderRadius: '10px', backgroundColor: 'var(--Blue)' }}
                    >
                        {/* {newcompany.isPending ? <Loader color="white" /> : "Save"} */}
                        Proceed to Confirmation
                    </Button>
                </Box>
            </Grid>
        </Box>
    )
}

export default ForwardToPolice
