import { useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { useFormik } from "formik";
import { useParams } from 'react-router-dom';
import {useGetProvinceList,useSAPSWantedEdit,useGetCityList,useGetPoliceUnitsByCity,useGetSAPSWantedById,useGetSAPSMemberByPoliceUnitId} from "../../API Calls/API";
import {
    Select, FormControl, InputLabel, FormControlLabel, Typography, Grid, Paper, IconButton, Box, FormLabel, FormGroup, Button, FormHelperText,
    Chip,CircularProgress,
} from "@mui/material";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import CustomSelect from "../../common/Custom/CustomSelect";
import GrayPlus from '../../assets/images/GrayPlus.svg'
import { BootstrapInput } from "../../common/BootstrapInput";
import { toastOption } from "../../common/ToastOptions";
import SingleImagePreview from "../../common/SingleImagePreview";
import Loader from "../../common/Loader";
import SAPSWantedMap from "../../common/SAPSWantedMap";
import {getImageLink,formatDateTime } from '../../common/commonFn';
import { SAPSWantedEditValidation } from "../../common/FormValidation";

const WantedInformation = () => {
    const params = useParams();
    const client = useQueryClient();
    const [editInfo, setEditInfo] = useState(false);
    const infoDataObj = useGetSAPSWantedById(params.id);
    const [previewImage, setPreviewImage] = useState({
        open: false,
        src: '',
        label: ''
    });

    const driverform = useFormik({
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
            profile_image: "",
            evidence_image: [],
        },
        validationSchema: SAPSWantedEditValidation,
        onSubmit: (values) => {
            const formData = new FormData();

            Object.keys(values).forEach((key) => {
                if (key !== "profile_image" && key !== "fullImage") {
                    formData.append(key, values[key]);
                }
            });

            if (values.profile_image && values.profile_image instanceof File) {
                formData.append("profile_image", values.profile_image);
            }

            if (values.evidence_image?.length > 0) {
                values.evidence_image.forEach((file) => {
                    formData.append("evidence_image", file);
                });
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
        setEditInfo(false);
        toast.success("SAPS Wanted Updated Successfully.");
        client.invalidateQueries("saps wanted list");
    };
    const onError = (error) => {
        toast.error(
            error.response.data.message || "Something went Wrong",
            toastOption
        );
    };

    const { mutate } = useSAPSWantedEdit(onSuccess, onError);

    const provincelist = useGetProvinceList('673361a0041c365bf8edae16');
    const cityList = useGetCityList(driverform?.values?.province)
    const policeStationList = useGetPoliceUnitsByCity(driverform?.values?.city)
    const investigatingOfficerList = useGetSAPSMemberByPoliceUnitId(driverform.values.police_unit_id)
   
    useEffect(() => {
        const data = infoDataObj.data?.data;
        if (data) {
            driverform.setValues({
                aliases: data.aliases || "",
                full_name: data.full_name || "",
                case_number: data.case_number || "",
                passport_no: data.passport_no || "",
                police_unit_id: data?.police_unit_id?._id || "",
                known_offenses: data.known_offenses || "",
                contact_number: data.contact_number || "",
                suburb: data.suburb || "",
                province: data.province?._id || data.province || "",
                city: data.city?._id || data.city || "",
                profile_image: data?.profile_image || "",
                crime_date: data.crime_date || "",
                investigating_officer: data.investigating_officer._id || "",
                last_know_location: data.last_know_location || "",
                lat: parseFloat(data.lat) || 0,
                long: parseFloat(data.long) || 0,
                crime_information_description: data.crime_information_description || "",
                current_status: data.current_status || "",
                evidence_image: data.evidence_image || [1,2,3,4],
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

    const handleLocationChange = (data) => {
        driverform.setFieldValue(
            "last_know_location",
            data.address
        );

        driverform.setFieldValue(
            "lat",
            data.lat
        );

        driverform.setFieldValue(
            "long",
            data.long
        );
    };

    const status = [{
        _id: "captured",
        status_name: "captured"
    }, {
        _id: "wanted",
        status_name: "wanted"
    }]

    return (
        <>
            <SingleImagePreview
                show={previewImage.open}
                onClose={handleClosePreview}
                image={previewImage.src ? { src: previewImage.src, label: previewImage.label } : null}
            />
            <Box p={2}>
                <Paper elevation={0} sx={{ p: 3, borderRadius: '10px', mb: 3 }}>
                    <form>
                        <Grid container spacing={editInfo ? 3 : 1}>
                            <Grid size={12}>
                                <Typography variant="h6" gutterBottom fontWeight={600}>
                                    SAPS Wanted Information
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: editInfo ? 6 : 4 }}>
                                {editInfo ? (
                                    <FormControl variant="standard" fullWidth >
                                        <InputLabel shrink htmlFor="full_name" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                            Full Name
                                        </InputLabel>
                                        <BootstrapInput
                                            id="full_name"
                                            name="full_name"
                                            placeholder="Full Name"
                                            value={driverform.values.full_name}
                                            onChange={driverform.handleChange}

                                        />
                                        {driverform.touched.full_name && <FormHelperText error>{driverform.errors.full_name}</FormHelperText>}
                                    </FormControl>
                                ) : displayField("Full Name", driverform.values.full_name)}
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: editInfo ? 6 : 4 }}>
                                {editInfo ? (
                                    <FormControl variant="standard" fullWidth >
                                        <InputLabel shrink htmlFor="aliases" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                            Aliases
                                        </InputLabel>
                                        <BootstrapInput
                                            id="aliases"
                                            name="aliases"
                                            placeholder="Aliases"
                                            value={driverform.values.aliases}
                                            onChange={driverform.handleChange}

                                        />
                                        {driverform.touched.aliases && <FormHelperText error>{driverform.errors.aliases}</FormHelperText>}
                                    </FormControl>
                                ) : displayField("Aliases", driverform.values.aliases)}
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: editInfo ? 6 : 4 }}>
                                {editInfo ? (
                                    <FormControl variant="standard" fullWidth >
                                        <InputLabel shrink htmlFor="case_number" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                            Case Number
                                        </InputLabel>
                                        <BootstrapInput
                                            id="case_number"
                                            name="case_number"
                                            placeholder="Case Number"
                                            value={driverform.values.case_number}
                                            onChange={driverform.handleChange}

                                        />
                                        {driverform.touched.case_number && <FormHelperText error>{driverform.errors.case_number}</FormHelperText>}
                                    </FormControl>
                                ) : displayField("Case Number", driverform.values.case_number)}
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: editInfo ? 6 : 4 }}>
                                {editInfo ? (
                                    <FormControl variant="standard" fullWidth>
                                        <InputLabel shrink htmlFor="known_offenses" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                            Known Offenses / Charges
                                        </InputLabel>
                                        <BootstrapInput
                                            id="known_offenses"
                                            name="known_offenses"
                                            placeholder="known_offenses"
                                            value={driverform.values.known_offenses}
                                            onChange={driverform.handleChange}

                                        />
                                        {driverform.touched.known_offenses && <FormHelperText error>{driverform.errors.known_offenses}</FormHelperText>}
                                    </FormControl>
                                ) : displayField("Known Offenses / Charges", driverform.values.known_offenses)}
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: editInfo ? 6 : 4 }}>
                                {editInfo ? (
                                    <FormControl variant="standard" fullWidth>
                                        <label style={{ marginBottom: "10px", fontWeight: 500, fontSize: "16px", lineHeight: 1 }}>Date of Crime</label>
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DateTimePicker
                                                label="Date of Crime"
                                                value={driverform.values.crime_date ? dayjs(driverform.values.crime_date) : null}
                                                onChange={(newValue) => {
                                                    driverform.setFieldValue("crime_date", newValue);
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
                                                                height: 44,
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
                                                            driverform.touched.crime_date &&
                                                            Boolean(driverform.errors.crime_date),
                                                        helperText:
                                                            driverform.touched.crime_date &&
                                                            driverform.errors.crime_date,
                                                    },
                                                }}
                                            />
                                        </LocalizationProvider>
                                    </FormControl>
                                ) : displayField("Date Of Crime",formatDateTime(driverform.values.crime_date,"DD-MM-YYYY HH:mm:ss"))}
                            </Grid>
                            <Grid size={12}>
                                <Grid container gap={4} sx={{ mt: 1 }}>
                                    <Grid size={{ xs: 12, sm: 4, md: 2.5 }}>
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
                                                name="profile_image"
                                                disabled={!editInfo}
                                                onChange={e => driverform.setFieldValue('profile_image', e.currentTarget.files[0])}
                                            />
                                            {driverform.values.profile_image instanceof File ? (
                                                <img
                                                    src={URL.createObjectURL(driverform.values.profile_image)}
                                                    alt="Selfie Preview"
                                                    style={{ height: 200, width: '100%', objectFit: 'contain', marginBottom: 8 }}
                                                />
                                            ) : driverform.values.profile_image ? (
                                                <img
                                                    src={driverform.values.profile_image}
                                                    alt="Selfie"
                                                    style={{ height: 200, width: '100%', objectFit: 'contain', marginBottom: 8, cursor: 'pointer' }}
                                                    onClick={() => handleImageClick(driverform.values.profile_image, 'Profile Image')}
                                                />
                                            ) : (<><img src={GrayPlus} alt="gray plus" />
                                                <Typography sx={{ color: '#B0B0B0', fontWeight: 550, mt: 1 }}>Upload</Typography></>
                                            )}
                                        </Box>
                                        {driverform.touched.profile_image && driverform.errors.profile_image && (
                                            <FormHelperText error>{driverform.errors.profile_image}</FormHelperText>
                                        )}
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </form>

                </Paper>

                {/* Location and Officer Info */}
                <Paper elevation={0} sx={{ p: 3, borderRadius: '10px', mb: 3 }}>
                    <form>
                        <Grid container spacing={editInfo ? 3 : 1}>
                            <Grid size={12}>
                                <Typography variant="h6" gutterBottom fontWeight={600}>
                                    Location and Officer Info
                                </Typography>
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
                                        disabled={!editInfo}
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
                                    <CustomSelect
                                        label="Investigating Officer / Tip-off Line"
                                        name="investigating_officer"
                                        value={driverform.values.investigating_officer}
                                        onChange={driverform.handleChange}
                                        disabled={!editInfo}
                                        options={investigatingOfficerList?.data?.data?.map(policeObj => ({
                                            value: policeObj._id,
                                            label: `${policeObj.first_name} ${policeObj.last_name}`,
                                        })) || []}
                                        error={driverform.errors.investigating_officer && driverform.touched.investigating_officer}
                                        helperText={driverform.touched.investigating_officer ? driverform.errors.investigating_officer : ''}
                                    />
                                    
                                ) : (
                                    displayField(
                                        "Investigating Officer / Tip-off Line",
                                        investigatingOfficerList?.data?.data?.find(
                                            (p) => p._id === driverform.values.investigating_officer
                                        )
                                            ? `${investigatingOfficerList?.data?.data?.find(
                                                (p) => p._id === driverform.values.investigating_officer
                                            )?.first_name} ${investigatingOfficerList?.data?.data?.find(
                                                (p) =>
                                                    p._id ===
                                                    driverform.values.investigating_officer
                                            )?.last_name || ""
                                            }`
                                            : "-"
                                    )
                                ) }
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
                                        <InputLabel shrink htmlFor="contact_number" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                            Contact Number
                                        </InputLabel>
                                        <BootstrapInput
                                            id="contact_number"
                                            name="contact_number"
                                            placeholder="contact_number"
                                            value={driverform.values.contact_number}
                                            onChange={driverform.handleChange}
                                            disabled={!editInfo}
                                        />
                                        {driverform.touched.contact_number && <FormHelperText error>{driverform.errors.contact_number}</FormHelperText>}
                                    </FormControl>
                                ) : displayField("Contact Number", driverform.values.contact_number)}
                            </Grid>
                            <Grid size={{ xs: 12, sm: editInfo ? 6 : 4 }}>
                                <FormControl variant="standard" fullWidth>
                                    <InputLabel shrink htmlFor="last_know_location" sx={{ marginBottom: "10px", fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                        Last Known Location
                                    </InputLabel>
                                    <SAPSWantedMap
                                        lat={driverform.values.lat}
                                        long={driverform.values.long}
                                        address={driverform.values.last_know_location}
                                        isMapLoaded={true}
                                        onLocationChange={handleLocationChange}
                                    />
                                    {driverform.touched.last_know_location && <div style={{ color: 'red', fontSize: 12 }}>{driverform.errors.last_know_location}</div>}
                                </FormControl>

                            </Grid>
                        </Grid>
                    </form>
                </Paper>

                {/* Evidence & Additional Info */}
                <Paper elevation={0} sx={{ p: 3, borderRadius: '10px', mb: 3 }}>
                    <form>
                        <Grid container spacing={editInfo ? 3 : 1}>
                            <Grid size={12}>
                                <Typography variant="h6" gutterBottom fontWeight={600}>
                                    Evidence & Additional Info
                                </Typography>
                            </Grid>
                            <Grid size={{xs: 12}}>
                                {editInfo ? (
                                    <FormControl variant="standard" fullWidth >
                                        <InputLabel shrink htmlFor="crime_information_description" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                            Crime Information and Description
                                        </InputLabel>
                                        <BootstrapInput
                                            id="crime_information_description"
                                            name="crime_information_description"
                                            placeholder="Include Clothing description, known hangouts , threats or other relevant information"
                                            multiline
                                            rows={3}
                                            value={driverform.values.crime_information_description}
                                            onChange={driverform.handleChange}
                                            disabled={!editInfo}
                                        />
                                        {driverform.touched.crime_information_description && <FormHelperText error>{driverform.errors.crime_information_description}</FormHelperText>}
                                    </FormControl>
                                ) : displayField("Crime Information and Description", driverform.values.crime_information_description)}
                            </Grid>
                            <Grid size={{ xs: 6}}>
                                {editInfo ? (
                                    <CustomSelect
                                        label="Current Status"
                                        name="current_status"
                                        value={driverform.values.current_status}
                                        onChange={driverform.handleChange}
                                        options={status.map(status => ({
                                            value: status._id,
                                            label: status.status_name
                                        })) || []}
                                        error={driverform.errors.current_status}
                                        helperText={driverform.errors.current_status}
                                        disabled={!editInfo}
                                    />
                                ) : displayField("Current Status", status.find(p => p._id === driverform.values.current_status)?.status_name)}
                            </Grid>
                            <Grid size={12}>
                                <Grid container gap={4} sx={{ mt: 1 }}>
                                    <Grid size={{ xs: 12, sm: 4, md: 2.5 }}>
                                        <label
                                            style={{
                                                marginBottom: '10px',
                                                display: 'block',
                                                fontWeight: 500
                                            }}
                                        >
                                            Evidence and Photos
                                        </label>
                                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                                            {[1, 2, 3, 4].map((item, index) => {

                                                const image = driverform.values.evidence_image?.[index];

                                                return (
                                                    <Box key={index} mb={2}>
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
                                                                background: '#fafbfc',
                                                                width: 200 // optional fixed width for layout
                                                            }}
                                                            component="label"
                                                        >
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                hidden
                                                                disabled={!editInfo}
                                                                onChange={(e) => {
                                                                    const file = e.currentTarget.files[0];
                                                                    if (file) {
                                                                        const files = [
                                                                            ...(driverform.values.evidence_image || [])
                                                                        ];
                                                                        files[index] = file;
                                                                        driverform.setFieldValue(
                                                                            "evidence_image",
                                                                            files
                                                                        );
                                                                    }
                                                                }}
                                                            />

                                                            {image instanceof File ? (
                                                                <img
                                                                    src={URL.createObjectURL(image)}
                                                                    alt={`Evidence ${index + 1}`}
                                                                    style={{
                                                                        height: 200,
                                                                        width: '100%',
                                                                        objectFit: 'contain',
                                                                        marginBottom: 8
                                                                    }}
                                                                />
                                                            ) : image ? (
                                                                <img
                                                                    src={image}
                                                                    alt={`Evidence ${index + 1}`}
                                                                    style={{
                                                                        height: 200,
                                                                        width: '100%',
                                                                        objectFit: 'contain',
                                                                        marginBottom: 8,
                                                                        cursor: 'pointer'
                                                                    }}
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        handleImageClick(
                                                                            image,
                                                                            `Evidence ${index + 1}`
                                                                        );
                                                                    }}
                                                                />
                                                            ) : (
                                                                <>
                                                                    <img
                                                                        src={GrayPlus}
                                                                        alt="gray plus"
                                                                    />

                                                                    <Typography
                                                                        sx={{
                                                                            color: '#B0B0B0',
                                                                            fontWeight: 550,
                                                                            mt: 1
                                                                        }}
                                                                    >
                                                                        Upload
                                                                    </Typography>
                                                                </>
                                                            )}
                                                        </Box>
                                                    </Box>
                                                );
                                            })}

                                            {driverform.touched.evidence_image &&
                                                driverform.errors.evidence_image && (
                                                    <FormHelperText error>
                                                        {driverform.errors.evidence_image}
                                                    </FormHelperText>
                                                )}
                                        </Box> 
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>

                {/* Save Button */}
                <Grid size={12}>
                    <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
                        {editInfo ? (
                            <>
                                <Button
                                    variant="contained"
                                    sx={{ width: 130, height: 48, borderRadius: '10px', backgroundColor: 'var(--Blue)' }}
                                    onClick={() => {
                                        driverform.handleSubmit()
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
            </Box >
        </>
    )
}

export default WantedInformation
