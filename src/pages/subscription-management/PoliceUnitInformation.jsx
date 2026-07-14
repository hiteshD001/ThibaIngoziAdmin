import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Typography, TextField, Button, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, Grid, InputAdornment, Stack, Select as MuiSelect, MenuItem, Checkbox, FormControlLabel, Divider, FormGroup, FormControl, InputLabel, Tooltip, TableSortLabel } from "@mui/material";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import { useRef } from "react";
import { startOfYear } from "date-fns";
import { useFormik } from "formik";
import Select from "react-select";
import checkedboxIcon from '../../assets/images/checkboxIcon.svg'
import uncheckedIcon from '../../assets/images/UnChecked.svg'
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { components } from 'react-select';
import { policeUnitValidation } from "../../common/FormValidation";
import {
    useGetPoliceUnitById,
    usePoliceUnitEdit,
    useGetCountryList,
    useGetProvinceList,
    useGetCityList,
} from "../../API Calls/API";
import CustomSelect from "../../common/Custom/CustomSelect";
import { BootstrapInput } from "../../common/BootstrapInput";
import PhoneInput from "react-phone-input-2";
import GrayPlus from '../../assets/images/GrayPlus.svg';
import ImportSheet from "../../common/ImportSheet";
import { toastOption } from "../../common/ToastOptions";

const PoliceUnitInformation = () => {
    // useStates
    const [edit, setedit] = useState(false);
    const [isArmedLocal, setIsArmedLocal] = useState(false);
    const [popup, setpopup] = useState(false);
    const client = useQueryClient();
    const nav = useNavigate();
    const params = useParams();

    // react queries
    const companyInfo = useGetPoliceUnitById(params.id);

    // companyedit
    const CompanyForm = useFormik({
        initialValues: {
            email: "",
            contact_name: "",
            police_unit_name: "",
            mobile_no: "",
            mobile_no_country_code: "+27",
            street: "",
            province: "",
            city: "",
            suburb: "",
            postal_code: "",
            country: "",
        },
        validationSchema: policeUnitValidation,
        onSubmit: (values) => {
            setedit(false);
            const formData = new FormData();
            Object.entries(values).forEach(([key, value]) => {
                if (key === "selfieImage") {
                    if (value instanceof File) {
                        formData.append("selfieImage", value);
                    }
                } else if (key === "fullImage") {
                    if (value instanceof File) {
                        formData.append("fullImage", value);
                    }
                } else {
                    formData.append(key, value);
                }
            });

            mutate({ id: params.id, data: formData });
        },
    });

    const provincelist = useGetProvinceList(CompanyForm.values.country)
    const cityList = useGetCityList(CompanyForm.values.province)
    const countrylist = useGetCountryList()

    // set company values
    useEffect(() => {
        const user = companyInfo.data?.data;
        if (user) {
            CompanyForm.setValues({
                police_unit_name: user.police_unit_name || "",
                mobile_no: String(user.mobile_no || ""),
                contact_name: user.contact_name || "",
                email: user.email || "",
                street: user.street || "",
                suburb: user.suburb || "",
                postal_code: user.postal_code || "",
                country: user.country?._id || user.country || "",
                province: user.province?._id || user.province || "",
                city: user.city?._id || user.city || "",
                selfieImage: user?.selfieImage || "",
                fullImage: user?.fullImage || "",
            });
        }
    }, [companyInfo.data?.data, edit]);

    const displayField = (label, value) => (
        <Box mb={3}>
            <Typography sx={{ fontSize: '1.1rem', fontWeight: 400, mb: 1 }}>{label}</Typography>
        </Box>
    );


    const onSuccess = () => {
        client.invalidateQueries(["police_unit", params.id]);
        toast.success("Police Unit Updated Successfully.");
    };
    const onError = (error) => {
        toast.error(error.response?.data?.message || "Something went Wrong", toastOption);
    };

    const { mutate } = usePoliceUnitEdit(onSuccess, onError);

    const DropdownIndicator = (props) => {
        return (
            <components.DropdownIndicator {...props}>
                {props.selectProps.menuIsOpen ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
            </components.DropdownIndicator>
        );
    };

    return (
        <Box p={2}>
            <Box>
                <Paper
                    elevation={3}
                    sx={{ backgroundColor: "rgb(253, 253, 253)", p: 3, borderRadius: "10px", mb: 2 }}
                >
                    <Box sx={{ borderBottom: '1px solid var(--light-gray)', mb: 3 }}>
                        <Typography variant="h6" fontWeight={550} mb={1}>
                            Police Unit Information
                        </Typography>
                    </Box>

                    <Grid container spacing={2}>
                        {/* Company Name */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Typography sx={{ pb: 1 }} variant="body1" color="text.secondary">
                                Police Unit Name
                            </Typography>
                            {edit ? (
                                <TextField
                                    fullWidth
                                    size="small"
                                    name="police_unit_name"
                                    placeholder="Company Name"
                                    value={CompanyForm.values.police_unit_name}
                                    onChange={CompanyForm.handleChange}
                                    error={CompanyForm.touched.police_unit_name && Boolean(CompanyForm.errors.police_unit_name)}
                                    helperText={CompanyForm.touched.police_unit_name && CompanyForm.errors.police_unit_name}
                                />
                            ) : (
                                <Typography >{companyInfo.data?.data.police_unit_name}</Typography>
                            )}
                        </Grid>

                        {/* Contact Name */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Typography sx={{ pb: 1 }} variant="body1" color="text.secondary">
                                Contact Name
                            </Typography>
                            {edit ? (
                                <TextField
                                    fullWidth
                                    size="small"
                                    name="contact_name"
                                    placeholder="Contact Name"
                                    value={CompanyForm.values.contact_name}
                                    onChange={CompanyForm.handleChange}
                                    error={CompanyForm.touched.contact_name && Boolean(CompanyForm.errors.contact_name)}
                                    helperText={CompanyForm.touched.contact_name && CompanyForm.errors.contact_name}
                                />
                            ) : (
                                <Typography >{companyInfo.data?.data.contact_name || "-"}</Typography>
                            )}
                        </Grid>

                        {/* Contact Email */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Typography sx={{ pb: 1 }} variant="body1" color="text.secondary">
                                Contact Email
                            </Typography>
                            {edit ? (
                                <TextField
                                    fullWidth
                                    size="small"
                                    name="email"
                                    placeholder="Contact Email"
                                    value={CompanyForm.values.email}
                                    onChange={CompanyForm.handleChange}
                                    error={CompanyForm.touched.email && Boolean(CompanyForm.errors.email)}
                                    helperText={CompanyForm.touched.email && CompanyForm.errors.email}
                                />
                            ) : (
                                <Typography>{companyInfo.data?.data.email}</Typography>
                            )}
                        </Grid>

                        {/* Contact No */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Typography sx={{ pb: 1 }} variant="body1" color="text.secondary">
                                Contact Number
                            </Typography>
                            {edit ? (
                                // Use PhoneInput logic if preferred or simple TextField as placeholder
                                <Box>
                                    <PhoneInput
                                        country="za"
                                        value={String(CompanyForm.values.mobile_no || "")}
                                        onChange={(value, countryData) => {
                                            CompanyForm.setFieldValue("mobile_no", value);
                                            CompanyForm.setFieldValue("mobile_no_country_code", `+${countryData.dialCode}`);
                                        }}
                                        inputStyle={{
                                            width: '100%',
                                            height: '40px', // Match size='small' height
                                            borderRadius: '4px',
                                            border: '1px solid #c4c4c4',
                                            fontSize: '16px',
                                            paddingLeft: '48px',
                                            background: '#fff',
                                        }}
                                        buttonStyle={{
                                            borderRadius: '4px 0 0 4px',
                                            border: '1px solid #c4c4c4',
                                            background: '#fff'
                                        }}
                                        containerStyle={{
                                            height: '40px',
                                            width: '100%',
                                        }}
                                    />
                                    {CompanyForm.touched.mobile_no && CompanyForm.errors.mobile_no && (
                                        <Typography color="error" variant="caption" display="block" sx={{ mt: 0.5 }}>
                                            {CompanyForm.errors.mobile_no}
                                        </Typography>
                                    )}
                                </Box>
                            ) : (
                                <Typography >{companyInfo.data?.data.mobile_no}</Typography>
                            )}
                        </Grid>

                        {/* Images Section (Only in Edit mode or if existing) */}
                        <Grid size={12}>
                            <Grid container gap={4} sx={{ mt: 1 }}>
                                <Grid size={{ xs: 12, sm: 2.5 }}>
                                    <label style={{ marginBottom: '10px', display: 'block', fontWeight: 500, color: 'rgba(0, 0, 0, 0.6)' }}>Selfie Image</label>
                                    {edit ? (
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
                                                name="selfieImage"
                                                onChange={e => CompanyForm.setFieldValue('selfieImage', e.currentTarget.files[0])}
                                            />
                                            {CompanyForm.values.selfieImage instanceof File ? (
                                                <img
                                                    src={URL.createObjectURL(CompanyForm.values.selfieImage)}
                                                    alt="Selfie Preview"
                                                    style={{ height: 200, width: '100%', objectFit: 'contain', marginBottom: 8 }}
                                                />
                                            ) : CompanyForm.values.selfieImage ? (
                                                <img
                                                    src={CompanyForm.values.selfieImage}
                                                    alt="Selfie"
                                                    style={{ height: 200, width: '100%', objectFit: 'contain', marginBottom: 8 }}
                                                />
                                            ) : (<><img src={GrayPlus} alt="gray plus" />
                                                <Typography sx={{ color: '#B0B0B0', fontWeight: 550, mt: 1 }}>Upload</Typography></>
                                            )}
                                        </Box>
                                    ) : (
                                        CompanyForm.values.selfieImage ? (
                                            <img
                                                src={CompanyForm.values.selfieImage}
                                                alt="Selfie"
                                                style={{ height: 180, width: '100%', objectFit: 'contain', borderRadius: '12px', border: '1px solid #E0E3E7' }}
                                            />
                                        ) : <Typography>-</Typography>
                                    )}
                                </Grid>
                                <Grid size={{ xs: 12, sm: 2.5 }}>
                                    <label style={{ marginBottom: '10px', display: 'block', fontWeight: 500, color: 'rgba(0, 0, 0, 0.6)' }}>Full Image</label>
                                    {edit ? (
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
                                                onChange={e => CompanyForm.setFieldValue('fullImage', e.currentTarget.files[0])}
                                            />

                                            {CompanyForm.values.fullImage instanceof File ? (
                                                <img
                                                    src={URL.createObjectURL(CompanyForm.values.fullImage)}
                                                    alt="Full Preview"
                                                    style={{ height: 200, width: '100%', objectFit: 'contain', marginBottom: 8 }}
                                                />
                                            ) : CompanyForm.values.fullImage ? (
                                                <img
                                                    src={CompanyForm.values.fullImage}
                                                    alt="Full Image"
                                                    style={{ height: 200, width: '100%', objectFit: 'contain', marginBottom: 8 }}
                                                />
                                            ) : (<><img src={GrayPlus} alt="gray plus" />
                                                <Typography sx={{ color: '#B0B0B0', fontWeight: 550, mt: 1 }}>Upload</Typography></>
                                            )
                                            }
                                        </Box>
                                    ) : (
                                        CompanyForm.values.fullImage ? (
                                            <img
                                                src={CompanyForm.values.fullImage}
                                                alt="Full"
                                                style={{ height: 180, width: '100%', objectFit: 'contain', borderRadius: '12px', border: '1px solid #E0E3E7' }}
                                            />
                                        ) : <Typography>-</Typography>
                                    )}
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>


                    {/* Save / Edit */}
                    <Box mt={3} textAlign="right">
                        {!edit && (
                            <Button variant="contained" sx={{ width: 120, height: 45, borderRadius: '10px', backgroundColor: 'var(--Blue)' }} onClick={() => setedit(true)}>
                                Edit
                            </Button>
                        )}
                    </Box>
                </Paper>

                {/* Address Section */}
                <Paper elevation={3} sx={{ backgroundColor: "rgb(253, 253, 253)", p: 3, borderRadius: "10px", mb: 2 }}>
                    <Grid container spacing={2}>
                        <Grid size={12}>
                            <Typography variant="h6" fontWeight={550} mb={1}>
                                Address
                            </Typography>
                        </Grid>

                        {/* Country */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography sx={{ pb: 1 }} variant="body1" color="text.secondary">Country</Typography>
                            {edit ? (
                                <CustomSelect
                                    name="country"
                                    value={CompanyForm.values.country}
                                    onChange={CompanyForm.handleChange}
                                    options={countrylist.data?.data.data?.map(country => ({
                                        value: country._id,
                                        label: country.country_name
                                    })) || []}
                                    error={CompanyForm.touched.country && Boolean(CompanyForm.errors.country)}
                                    helperText={CompanyForm.touched.country && CompanyForm.errors.country}
                                />
                            ) : (
                                displayField(companyInfo.data?.data.country?.country_name)
                            )}
                        </Grid>

                        {/* Province */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography sx={{ pb: 1 }} variant="body1" color="text.secondary">Province</Typography>
                            {edit ? (
                                <CustomSelect
                                    name="province"
                                    value={CompanyForm.values.province}
                                    onChange={CompanyForm.handleChange}
                                    options={provincelist.data?.data.data?.map(province => ({
                                        value: province._id,
                                        label: province.province_name
                                    })) || []}
                                    disabled={!CompanyForm.values.country}
                                    error={CompanyForm.touched.province && Boolean(CompanyForm.errors.province)}
                                    helperText={CompanyForm.touched.province && CompanyForm.errors.province}
                                />
                            ) : (
                                displayField(companyInfo.data?.data.province?.province_name)
                            )}
                        </Grid>

                        {/* City */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography sx={{ pb: 1 }} variant="body1" color="text.secondary">City</Typography>
                            {edit ? (
                                <CustomSelect
                                    name="city"
                                    value={CompanyForm.values.city}
                                    onChange={CompanyForm.handleChange}
                                    options={cityList.data?.data.data?.map(city => ({
                                        value: city._id,
                                        label: city.city_name
                                    })) || []}
                                    disabled={!CompanyForm.values.country || !CompanyForm.values.province}
                                    error={CompanyForm.touched.city && Boolean(CompanyForm.errors.city)}
                                    helperText={CompanyForm.touched.city && CompanyForm.errors.city}
                                />
                            ) : (
                                displayField(companyInfo.data?.data.city?.city_name)
                            )}
                        </Grid>

                        {/* Suburb */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography sx={{ pb: 1 }} variant="body1" color="text.secondary">Suburb</Typography>
                            {edit ? (
                                <Box>
                                    <BootstrapInput
                                        id="suburb"
                                        name="suburb"
                                        placeholder="Enter Suburb"
                                        value={CompanyForm.values.suburb}
                                        onChange={CompanyForm.handleChange}
                                        error={CompanyForm.touched.suburb && Boolean(CompanyForm.errors.suburb)}
                                    />
                                    {CompanyForm.touched.suburb && CompanyForm.errors.suburb && (
                                        <Typography color="error" variant="caption" display="block" sx={{ mt: 0.5 }}>{CompanyForm.errors.suburb}</Typography>
                                    )}
                                </Box>
                            ) : (
                                <Typography>{companyInfo.data?.data.suburb || "-"}</Typography>
                            )}
                        </Grid>

                        {/* Street */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography sx={{ pb: 1 }} variant="body1" color="text.secondary">Street</Typography>
                            {edit ? (
                                <Box>
                                    <BootstrapInput
                                        id="street"
                                        name="street"
                                        placeholder="Street"
                                        value={CompanyForm.values.street}
                                        onChange={CompanyForm.handleChange}
                                        error={CompanyForm.touched.street && Boolean(CompanyForm.errors.street)}
                                    />
                                    {CompanyForm.touched.street && CompanyForm.errors.street && (
                                        <Typography color="error" variant="caption" display="block" sx={{ mt: 0.5 }}>{CompanyForm.errors.street}</Typography>
                                    )}
                                </Box>
                            ) : (
                                <Typography>{companyInfo.data?.data.street || "-"}</Typography>
                            )}

                        </Grid>

                        {/* Postal Code */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography sx={{ pb: 1 }} variant="body1" color="text.secondary">Postal Code</Typography>
                            {edit ? (
                                <Box>
                                    <BootstrapInput
                                        id="postal_code"
                                        name="postal_code"
                                        placeholder="Enter Postal Code"
                                        value={CompanyForm.values.postal_code}
                                        onChange={CompanyForm.handleChange}
                                        error={CompanyForm.touched.postal_code && Boolean(CompanyForm.errors.postal_code)}
                                    />
                                    {CompanyForm.touched.postal_code && CompanyForm.errors.postal_code && (
                                        <Typography color="error" variant="caption" display="block" sx={{ mt: 0.5 }}>{CompanyForm.errors.postal_code}</Typography>
                                    )}
                                </Box>
                            ) : (
                                <Typography>{companyInfo.data?.data.postal_code || "-"}</Typography>
                            )}

                        </Grid>
                    </Grid>
                    {edit && (
                        <Grid size={12} sx={{ mt: 1 }}>
                            <Box display="flex" justifyContent="flex-end" gap={2}>
                                <Button variant="outlined" sx={{ width: 130, height: 48, borderRadius: '10px', color: 'black', borderColor: '#E0E3E7' }} onClick={() => setedit(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={() => {
                                        //  console.log("errors:", CompanyForm.errors);
                                        CompanyForm.handleSubmit();
                                    }}
                                    sx={{ width: 130, height: 48, borderRadius: '10px', backgroundColor: 'var(--Blue)' }}
                                >
                                    Save
                                </Button>
                            </Box>
                        </Grid>
                    )}
                </Paper>
            </Box>
            {popup && <ImportSheet setpopup={setpopup} type="driver" />}
        </Box>
    );
};

export default PoliceUnitInformation;
