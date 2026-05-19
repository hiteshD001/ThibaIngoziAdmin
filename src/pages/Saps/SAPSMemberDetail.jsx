import { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import { useFormik } from "formik";
import { SAPSMemberEditValidation } from "../../common/FormValidation";
import { useQueryClient } from "@tanstack/react-query";
import {
    useGetCountryList,
    useGetProvinceList,
    useSAPSMemberEdit,
    useGetCityList,useGetPoliceUnitsByCity, useGetSAPSMemberById} from "../../API Calls/API";
import CustomSelect from "../../common/Custom/CustomSelect";
import GrayPlus from '../../assets/images/GrayPlus.svg'
import {
    Select, MenuItem, FormControl, InputLabel, Checkbox, FormControlLabel, Typography, Grid, Paper, IconButton, Box, FormLabel, FormGroup, Button, FormHelperText,
    Chip, Radio, RadioGroup, CircularProgress,
} from "@mui/material";
import { BootstrapInput } from "../../common/BootstrapInput";
import { toast } from "react-toastify";
import { toastOption } from "../../common/ToastOptions";
import PhoneInput from "react-phone-input-2";
import SingleImagePreview from "../../common/SingleImagePreview";
import Loader from "../../common/Loader";

const SAPSMemberDetail = () => {
    const [editInfo, setEditInfo] = useState(false);
    const params = useParams();
    const client = useQueryClient();
    const infoDataObj = useGetSAPSMemberById(params.id);
    const [previewImage, setPreviewImage] = useState({
        open: false,
        src: '',
        label: ''
    });

    const driverform = useFormik({
        initialValues: {
            first_name: "",
            last_name: "",
            email: "",
            mobile_no: "",
            mobile_no_country_code: "",
            street: "",
            province: "",
            city: "",
            police_unit_id: "",
            suburb: "",
            postal_code: "",
            country: "",
            passport_no: "",
            selfieImage: "",
            fullImage: "",
        },
        validationSchema: SAPSMemberEditValidation,
        onSubmit: (values) => {
            const formData = new FormData();

            Object.keys(values).forEach((key) => {
                if (key !== "selfieImage" && key !== "fullImage") {
                    formData.append(key, values[key]);
                }
            });

            if (values.selfieImage && values.selfieImage instanceof File) {
                formData.append("selfieImage", values.selfieImage);
            }

            if (values.fullImage && values.fullImage instanceof File) {
                formData.append("fullImage", values.fullImage);
            }

            mutate({ id: params.id, data: formData });
        }

    });

    const handleImageClick = (src, label) => {
        if (src) {
            setPreviewImage({
                open: true,
                src: src instanceof File ? URL.createObjectURL(src) : src,
                label: label
            });
        }
    };

    const handleClosePreview = () => {
        setPreviewImage(prev => ({ ...prev, open: false }));
    };

    const onSuccess = () => {
        toast.success("SAPS Member Updated Successfully.");
        client.invalidateQueries("saps member list");
    };
    const onError = (error) => {
        toast.error(
            error.response.data.message || "Something went Wrong",
            toastOption
        );
    };
    
    const { mutate } = useSAPSMemberEdit(onSuccess, onError);

    const countrylist = useGetCountryList();
    const provincelist = useGetProvinceList(driverform?.values?.country);
    const cityList = useGetCityList(driverform?.values?.province)
    const policeStationList = useGetPoliceUnitsByCity(driverform?.values?.city)


    useEffect(() => {
        const data = infoDataObj.data?.data;
        if (data) {
            driverform.setValues({
                last_name: data.last_name || "",
                first_name: data.first_name || "",
                mobile_no_country_code: data.mobile_no_country_code || "",
                passport_no: data.passport_no || "",
                police_unit_id: data.police_unit_id._id || "",
                mobile_no: String(data.mobile_no || ""),
                email: data.email || "",
                street: data.street || "",
                suburb: data.suburb || "",
                postal_code: data.postal_code || "",
                country: data.country?._id || data.country || "",
                province: data.province?._id || data.province || "",
                city: data.city?._id || data.city || "",
                selfieImage: data?.selfieImage || "",
                fullImage: data?.fullImage || "",
            });
        }
    }, [infoDataObj.data]);

    const displayField = (label, value) => (
        <Box mb={3}>
            <Typography sx={{ fontSize: '1.1rem', fontWeight: 400, mb: 1 }}>{label}</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ ml: 0.5 }}>
                {value || "-"}
            </Typography>
        </Box>
    );

    if (infoDataObj.isLoading) {
        return (
            <Box
                p={2}
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'start',
                    minHeight: '60vh',
                }}
            >
                <Loader />
            </Box>
        );
    }

    return (
        <>
            <SingleImagePreview
                show={previewImage.open}
                onClose={handleClosePreview}
                image={previewImage.src ? { src: previewImage.src, label: previewImage.label } : null}
            />
            <Box p={2}>
                {/* driver information */}
                <Paper elevation={0} sx={{ p: 3, borderRadius: '10px', mb: 3 }}>
                    <form>
                        <Grid container spacing={editInfo ? 3 : 1}>
                            <Grid size={12}>
                                <Typography variant="h6" gutterBottom fontWeight={600}>
                                    SAPS Member Information
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: editInfo ? 6 : 4 }}>
                                {editInfo ? (
                                    <FormControl variant="standard" fullWidth >
                                        <InputLabel shrink htmlFor="first_name" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                            First Name
                                        </InputLabel>
                                        <BootstrapInput
                                            id="first_name"
                                            name="first_name"
                                            placeholder="First Name"
                                            value={driverform.values.first_name}
                                            onChange={driverform.handleChange}

                                        />
                                        {driverform.touched.first_name && <FormHelperText error>{driverform.errors.first_name}</FormHelperText>}
                                    </FormControl>
                                ) : displayField("First Name", driverform.values.first_name)}
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: editInfo ? 6 : 4 }}>
                                {editInfo ? (
                                    <FormControl variant="standard" fullWidth >
                                        <InputLabel shrink htmlFor="last_name" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                            Last Name
                                        </InputLabel>
                                        <BootstrapInput
                                            id="last_name"
                                            name="last_name"
                                            placeholder="Last Name"
                                            value={driverform.values.last_name}
                                            onChange={driverform.handleChange}

                                        />
                                        {driverform.touched.last_name && <FormHelperText error>{driverform.errors.last_name}</FormHelperText>}
                                    </FormControl>
                                ) : displayField("Last Name", driverform.values.last_name)}
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: editInfo ? 6 : 4 }}>
                                {editInfo ? (
                                    <FormControl variant="standard" fullWidth>
                                        <label style={{ marginBottom: 5 }}>Phone Number</label>
                                        <PhoneInput
                                            country={"za"}

                                            value={`${driverform.values.mobile_no_country_code ?? ''}${driverform.values.mobile_no ?? ''}`}
                                            onChange={(phone, countryData) => {
                                                const withoutCountryCode = phone.startsWith(countryData.dialCode)
                                                    ? phone.slice(countryData.dialCode.length).trim()
                                                    : phone;

                                                driverform.setFieldValue("mobile_no", withoutCountryCode);
                                                driverform.setFieldValue("mobile_no_country_code", `+${countryData.dialCode}`);
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
                                        {driverform.touched.mobile_no && driverform.errors.mobile_no && (
                                            <FormHelperText error>{driverform.errors.mobile_no}</FormHelperText>
                                        )}
                                    </FormControl>
                                ) : displayField("Phone Number", `${driverform.values.mobile_no_country_code ?? ''}${driverform.values.mobile_no ?? ''}`)}
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: editInfo ? 6 : 4 }}>
                                {editInfo ? (
                                    <FormControl variant="standard" fullWidth>
                                        <InputLabel shrink htmlFor="email" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                            Email
                                        </InputLabel>
                                        <BootstrapInput
                                            id="email"
                                            name="email"
                                            placeholder="Email"
                                            value={driverform.values.email}
                                            onChange={driverform.handleChange}

                                        />
                                        {driverform.touched.email && <FormHelperText error>{driverform.errors.email}</FormHelperText>}
                                    </FormControl>
                                ) : displayField("Email", driverform.values.email)}
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: editInfo ? 6 : 4 }}>
                                {
                                    editInfo ? (<FormControl variant="standard" fullWidth>
                                        <InputLabel
                                            shrink
                                            htmlFor="passport_no"
                                            sx={{
                                                fontSize: '1.3rem',
                                                color: 'rgba(0, 0, 0, 0.8)',
                                                '&.Mui-focused': { color: 'black' },
                                            }}
                                        >
                                            Passport Number
                                        </InputLabel>
                                        <BootstrapInput
                                            id="passport_no"
                                            name="passport_no"
                                            placeholder="Passport number"
                                            value={driverform.values.passport_no}
                                            onChange={driverform.handleChange}

                                        />
                                        {driverform.touched.passport_no && driverform.errors.passport_no && (
                                            <FormHelperText error>{driverform.errors.passport_no}</FormHelperText>
                                        )}
                                    </FormControl>
                                    ) : displayField("Passport Number", driverform.values.passport_no)
                                }
                            </Grid>
                            <Grid size={12}>
                                <Grid container gap={4} sx={{ mt: 1 }}>
                                    <Grid size={{ xs: 12, sm: 4, md: 2.5 }}>
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
                                                cursor: editInfo ? 'pointer' : 'not-allowed',
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
                                                disabled={!editInfo}
                                                onChange={e => driverform.setFieldValue('selfieImage', e.currentTarget.files[0])}
                                            />
                                            {driverform.values.selfieImage instanceof File ? (
                                                <img
                                                    src={URL.createObjectURL(driverform.values.selfieImage)}
                                                    alt="Selfie Preview"
                                                    style={{ height: 200, width: '100%', objectFit: 'contain', marginBottom: 8 }}
                                                />
                                            ) : driverform.values.selfieImage ? (
                                                <img
                                                    src={driverform.values.selfieImage}
                                                    alt="Selfie"
                                                    style={{ height: 200, width: '100%', objectFit: 'contain', marginBottom: 8, cursor: 'pointer' }}
                                                    onClick={() => handleImageClick(driverform.values.selfieImage, 'Selfie Image')}
                                                />
                                            ) : (<><img src={GrayPlus} alt="gray plus" />
                                                <Typography sx={{ color: '#B0B0B0', fontWeight: 550, mt: 1 }}>Upload</Typography></>
                                            )}
                                        </Box>
                                        {driverform.touched.selfieImage && driverform.errors.selfieImage && (
                                            <FormHelperText error>{driverform.errors.selfieImage}</FormHelperText>
                                        )}
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 4, md: 2.5 }}>
                                        <label style={{ marginBottom: '10px', display: 'block', fontWeight: 500 }}>Full Image</label>
                                        <Box
                                            sx={{
                                                border: '2px dashed #E0E3E7',
                                                borderRadius: '12px',
                                                minHeight: 180,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: editInfo ? 'pointer' : 'not-allowed',
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
                                                disabled={!editInfo}
                                                onChange={e => driverform.setFieldValue('fullImage', e.currentTarget.files[0])}
                                            />
                                            {driverform.values.fullImage instanceof File ? (
                                                <img
                                                    src={URL.createObjectURL(driverform.values.fullImage)}
                                                    alt="Full Preview"
                                                    style={{ height: 200, width: '100%', objectFit: 'contain', marginBottom: 8 }}
                                                />
                                            ) : driverform.values.fullImage ? (
                                                <img
                                                    src={driverform.values.fullImage}
                                                    alt="Full Image"
                                                    style={{ height: 200, width: '100%', objectFit: 'contain', marginBottom: 8, cursor: 'pointer' }}
                                                    onClick={() => handleImageClick(driverform.values.fullImage, 'Full Image')}
                                                />
                                            ) : (<><img src={GrayPlus} alt="gray plus" />
                                                <Typography sx={{ color: '#B0B0B0', fontWeight: 550, mt: 1 }}>Upload</Typography></>
                                            )
                                            }

                                        </Box>
                                        {driverform.touched.fullImage && driverform.errors.fullImage && (
                                            <FormHelperText error>{driverform.errors.fullImage}</FormHelperText>
                                        )}
                                    </Grid>
                                    
                                </Grid>
                            </Grid>
                            <Grid size={12}>
                                <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
                                    {editInfo ? (
                                        <>
                                            <Button
                                                variant="contained"
                                                sx={{ width: 130, height: 48, borderRadius: '10px', backgroundColor: 'var(--Blue)' }}
                                                onClick={() => {
                                                    driverform.handleSubmit()
                                                    setEditInfo(false);
                                                }}
                                            >
                                                Save
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                sx={{ width: 130, height: 48, borderRadius: '10px' }}
                                                onClick={() => {
                                                    setEditInfo(false);
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            variant="contained"
                                            sx={{ width: 130, height: 48, borderRadius: '10px', backgroundColor: 'var(--Blue)' }}
                                            onClick={() => setEditInfo(true)}
                                        >
                                            Edit
                                        </Button>
                                    )}
                                </Box>
                            </Grid>
                        </Grid>
                    </form>

                </Paper>

                {/* Address */}
                <Paper elevation={0} sx={{ p: 3, borderRadius: '10px', mb: 3 }}>
                    <form>
                        <Grid container spacing={editInfo ? 3 : 1}>
                            <Grid size={12}>
                                <Typography variant="h6" gutterBottom fontWeight={600}>
                                    Address
                                </Typography>
                            </Grid>

                            <Grid size={{ xs: 12, sm: editInfo ? 6 : 4 }}>
                                {editInfo ? (
                                    <CustomSelect
                                        label="Country"
                                        name="country"
                                        value={driverform.values.country}
                                        onChange={driverform.handleChange}
                                        options={countrylist.data?.data.data?.map(country => ({
                                            value: country._id,
                                            label: country.country_name
                                        })) || []}
                                        error={driverform.errors.country}
                                        helperText={driverform.errors.country}
                                        disabled={!editInfo}
                                    />
                                ) : displayField("Country", countrylist.data?.data.data?.find(c => c._id === driverform.values.country)?.country_name)}
                            </Grid>
                            <Grid size={{ xs: 12, sm: editInfo ? 6 : 4 }}>
                                {editInfo ? (
                                    <CustomSelect
                                        label="Province"
                                        name="province"
                                        value={driverform.values.province}
                                        onChange={driverform.handleChange}
                                        options={provincelist.data?.data.data?.map(province => ({
                                            value: province._id,
                                            label: province.province_name
                                        })) || []}
                                        error={driverform.errors.province}
                                        helperText={driverform.errors.province}
                                        disabled={!driverform.values.country || !editInfo}
                                    />
                                ) : displayField("Province", provincelist.data?.data.data?.find(p => p._id === driverform.values.province)?.province_name)}
                            </Grid>
                            <Grid size={{ xs: 12, sm: editInfo ? 6 : 4 }}>
                                {editInfo ? (
                                    <CustomSelect
                                        label="City"
                                        name="city"
                                        value={driverform.values.city}
                                        onChange={driverform.handleChange}
                                        disabled={!editInfo}
                                        options={cityList?.data?.data.data?.map(city => ({
                                            value: city._id,
                                            label: city.city_name
                                        })) || []}
                                        error={driverform.errors.city && driverform.touched.city}
                                        helperText={driverform.touched.city ? driverform.errors.city : ''}
                                    />
                                ) : displayField("City", cityList?.data?.data.data?.find(p => p._id === driverform.values.city)?.city_name)}
                            </Grid>
                            <Grid size={{ xs: 12, sm: editInfo ? 6 : 4 }}>
                                {editInfo ? (
                                    <CustomSelect
                                        label="Police Unit"
                                        name="police_unit_id"
                                        value={driverform.values.police_unit_id}
                                        onChange={driverform.handleChange}
                                        disabled={!editInfo}
                                        options={policeStationList?.data?.data?.map(policeObj => ({
                                            value: policeObj._id,
                                            label: policeObj.police_unit_name
                                        })) || []}
                                        error={driverform.errors.police_unit_id && driverform.touched.police_unit_id}
                                        helperText={driverform.touched.police_unit_id ? driverform.errors.police_unit_id : ''}
                                    />
                                ) : displayField("Police Unit", policeStationList?.data?.data?.find(p => p._id === driverform.values.police_unit_id)?.police_unit_name)}
                            </Grid>
                            <Grid size={{ xs: 12, sm: editInfo ? 6 : 4 }}>
                                {editInfo ? (
                                    <FormControl variant="standard" fullWidth >
                                        <InputLabel shrink htmlFor="suburb" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                            Suburb
                                        </InputLabel>
                                        <BootstrapInput
                                            id="suburb"
                                            name="suburb"
                                            placeholder="Suburb"
                                            value={driverform.values.suburb}
                                            onChange={driverform.handleChange}
                                            disabled={!editInfo}
                                        />
                                        {driverform.touched.suburb && <FormHelperText error>{driverform.errors.suburb}</FormHelperText>}
                                    </FormControl>
                                ) : displayField("Suburb", driverform.values.suburb)}
                            </Grid>
                            <Grid size={{ xs: 12, sm: editInfo ? 6 : 4 }}>
                                {editInfo ? (
                                    <FormControl variant="standard" fullWidth >
                                        <InputLabel shrink htmlFor="street" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                            Street
                                        </InputLabel>
                                        <BootstrapInput
                                            id="street"
                                            name="street"
                                            placeholder="Street"
                                            value={driverform.values.street}
                                            onChange={driverform.handleChange}
                                            disabled={!editInfo}
                                        />
                                        {driverform.touched.street && <FormHelperText error>{driverform.errors.street}</FormHelperText>}
                                    </FormControl>
                                ) : displayField("Street", driverform.values.street)}
                            </Grid>
                            <Grid size={{ xs: 12, sm: editInfo ? 6 : 4 }}>
                                {editInfo ? (
                                    <FormControl variant="standard" fullWidth >
                                        <InputLabel shrink htmlFor="postal_code" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                            Postal Code
                                        </InputLabel>
                                        <BootstrapInput
                                            id="postal_code"
                                            name="postal_code"
                                            placeholder="Postal Code"
                                            value={driverform.values.postal_code}
                                            onChange={driverform.handleChange}
                                            disabled={!editInfo}
                                        />
                                        {driverform.touched.postal_code && <FormHelperText error>{driverform.errors.postal_code}</FormHelperText>}
                                    </FormControl>
                                ) : displayField("Postal Code", driverform.values.postal_code)}
                            </Grid>
                            <Grid size={12}>
                                <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
                                    {editInfo ? (
                                        <>
                                            <Button
                                                variant="contained"
                                                sx={{ width: 130, height: 48, borderRadius: '10px', backgroundColor: 'var(--Blue)' }}
                                                onClick={() => {
                                                    driverform.handleSubmit()
                                                    setEditAddress(false);
                                                }}
                                            >
                                                Save
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                sx={{ width: 130, height: 48, borderRadius: '10px' }}
                                                onClick={() => {
                                                    setEditInfo(false);
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            variant="contained"
                                            sx={{ width: 130, height: 48, borderRadius: '10px', backgroundColor: 'var(--Blue)' }}
                                            onClick={() => setEditInfo(true)}
                                        >
                                            Edit
                                        </Button>

                                    )}
                                </Box>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>
            </Box >
        </>
    );
};

export default SAPSMemberDetail;