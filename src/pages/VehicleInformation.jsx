import { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";

import { useFormik } from "formik";
import { vehicleValidation } from "../common/FormValidation";
import PayoutPopup from "../common/Popup";
import { useQueryClient } from "@tanstack/react-query";
import {
    useGetCountryList,
    useGetProvinceList,
    useGetUser,
    useGetUserList,
    useUpdateUser,
    useGeteHailingList,
    useGetCityList,
    useUpdateVehicle,
    useGetVehicleTypeList
} from "../API Calls/API";
import vehicleIcon from '../assets/images/vehicleIcon.svg'
import vehicleIcon2 from '../assets/images/vehicleIcon2.svg'
import vehicleIcon3 from '../assets/images/vehicleIcon3.svg'
import vehicleIcon4 from '../assets/images/vehicleIcon4.svg'
import vehicleIcon5 from '../assets/images/vehicleIcon5.svg'
import vehicleIcon6 from '../assets/images/vehicleIcon6.svg'
import camera from '../assets/images/camera.svg'
import CustomSelect from "../common/Custom/CustomSelect";
import GrayPlus from '../assets/images/GrayPlus.svg'
import checkedboxIcon from '../assets/images/checkboxIcon.svg'
import uncheckedIcon from '../assets/images/UnChecked.svg'
import payIcon from '../assets/images/payIcon.svg';
import {
    TextField, Select, MenuItem, FormControl, InputLabel, Checkbox, FormControlLabel, Typography, Grid, Alert, Paper, IconButton, Box, FormLabel, FormGroup, Button, FormHelperText, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Chip,
} from "@mui/material";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { BootstrapInput } from "../common/BootstrapInput";
import { toast } from "react-toastify";
import { toastOption } from "../common/ToastOptions";
import ImagePreviewModal from "../common/ImagePreviewModal";
import PhoneInput from "react-phone-input-2";
import SingleImagePreview from "../common/SingleImagePreview";

const VehicleInformation = () => {
    const [editInfo, setEditInfo] = useState(false);
    const [editAddress, setEditAddress] = useState(false);
    const [editEmergency, setEditEmergency] = useState(false);
    const [editVehicle, setEditVehicle] = useState(false);
    const [role] = useState(localStorage.getItem("role"));
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    const params = useParams();
    const client = useQueryClient();
    const CompanyId = localStorage.getItem("userID");
    const [selectedPayoutType, setSelectedPayoutType] = useState('');
    const [payPopup, setPopup] = useState('')
    const [previewImage, setPreviewImage] = useState({
           open: false,
           src: '',
           label: ''
         });


    const driverform = useFormik({
        initialValues: {
            first_name: "",
            last_name: "",
            company_id: "",
            company_name: '',
            email: "",
            mobile_no: "",
            mobile_no_country_code: "",
            street: "",
            province: "",
            city: "",
            suburb: "",
            postal_code: "",
            country: "",
            isArmed: "",
            selfieImage: null,
            fullImage: null,
            hijakingPass: "",
            hijakingId: "",
            primary_e_hailing_company: "",
            other_e_hailing_company: [],
            passport_no: "",
            isPaymentToken: "",
            accountNumber: "",
            customerCode: "",
            accountType: "",
            account_holder_name: "",
            bankId: "",
            subscription_status: "",
            EnrollStartDate: "",
            paymentDate: "",
            EnrollType: "",
            isEnroll:""
        },
        validationSchema: vehicleValidation,
        onSubmit: (values) => {
            const formData = new FormData();

            Object.keys(values).forEach((key) => {
                if (key !== "selfieImage" && key !== "fullImage") {
                    if (key === "other_e_hailing_company") {
                        const cleanedIds = (Array.isArray(values[key]) ? values[key] : [])
                            .filter(id => typeof id === 'string' && /^[a-f\d]{24}$/i.test(id)); // Only valid ObjectIDs
                        formData.append("other_e_hailing_company", cleanedIds.join(","));
                    } else {
                        formData.append(key, values[key]);
                    }
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

    const vehicleForm = useFormik({
        initialValues: {
            vehicle_id: "",
            vehicle_name: "",
            type: "",
            reg_no: "",
            license_number: '',
            images: [],
        },
        onSubmit: (values) => {
            const formData = new FormData();
            Object.keys(values).forEach((key) => {
                if (key === 'images') {
                    values[key].forEach(file => {
                        if (file instanceof File) {
                            formData.append('images', file);
                        }
                    });
                } else {
                    formData.append(key, values[key]);
                }
            });
            mutateVehicle({ id: values.vehicle_id, data: formData });
        }
    });

    const emergencyform = useFormik({
        initialValues: {
            emergency_contact_1_contact: "",
            emergency_contact_1_email: "",
            emergency_contact_2_contact: "",
            emergency_contact_2_email: "",
            emergency_contact_2_country_code: "",
            emergency_contact_1_country_code: "",
        },
        onSubmit: (values) => {
            const formData = new FormData();
            Object.keys(values).forEach((key) => {
                formData.append(key, values[key]);
            });
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

    const vehicleInfo = useGetUser(params.id);
    const companyList = useGetUserList("company list", "company");
    const onSuccess = () => {
        toast.success("User Updated Successfully.");
        client.invalidateQueries("driver list");
    };
    const onError = (error) => {
        toast.error(
            error.response.data.message || "Something went Wrong",
            toastOption
        );
    };

    const { mutate } = useUpdateUser(onSuccess, onError);
    const { mutate: mutateVehicle } = useUpdateVehicle(onSuccess, onError)

    const provincelist = useGetProvinceList(driverform.values.country);
    const countrylist = useGetCountryList();
    const cityList = useGetCityList(driverform.values.province)
    const vehicleTypeList = useGetVehicleTypeList()


    useEffect(() => {
        const data = vehicleInfo.data?.data;

        if (data) {
            const user = data?.user;
            setdriverformvalues({
                form: driverform,
                data: {
                    ...user,
                    other_e_hailing_company: user.other_e_hailing_company
                        ? user.other_e_hailing_company.split(",").filter(Boolean)
                        : [],
                },
            });
            setdriverformvalues({ form: emergencyform, data: data.user });

            const vehicleData = data.vehicle?.[0];

            if (vehicleData) {
                vehicleForm.setValues({
                    vehicle_id: vehicleData._id || "",
                    vehicle_name: vehicleData.vehicle_name || "",
                    type: vehicleData.type || "",
                    reg_no: vehicleData.reg_no || "",
                    license_number: vehicleData.license_number || "",
                    images: [
                        vehicleData.image_front_side,
                        vehicleData.image_back_side,
                        vehicleData.image_left_side,
                        vehicleData.image_right_side,
                        vehicleData.image_car_number_plate,
                        vehicleData.image_driver_license,
                    ].filter(Boolean),
                });
            }
            // console.log('driver', driverform.values)
        }
    }, [vehicleInfo.data]);

    const resetDriverForm = () => {
        const data = vehicleInfo.data?.data;
        if (!data) return;

        const user = data.user;
        setdriverformvalues({
            form: driverform,
            data: {
                ...user,
                other_e_hailing_company: user.other_e_hailing_company
                    ? user.other_e_hailing_company.split(",").filter(Boolean)
                    : [],
            },
        });

        setdriverformvalues({ form: emergencyform, data: user });

        const vehicleData = data.vehicle?.[0];
        if (vehicleData) {
            vehicleForm.setValues({
                vehicle_id: vehicleData._id || "",
                vehicle_name: vehicleData.vehicle_name || "",
                type: vehicleData.type || "",
                reg_no: vehicleData.reg_no || "",
                license_number: vehicleData.license_number || "",
                images: [
                    vehicleData.image_front_side,
                    vehicleData.image_back_side,
                    vehicleData.image_left_side,
                    vehicleData.image_right_side,
                    vehicleData.image_car_number_plate,
                    vehicleData.image_driver_license,
                ].filter(Boolean),
            });
        }
    };

    const handleChange = () => {
        payoutMutation.mutate(PayoutForm.values);
    };


    const handlePopup = (event, type, payoutType) => {
        event.stopPropagation();
        PayoutForm.setValues({
            firstName: vehicleInfo?.data?.data?.user?.first_name || "",
            surname: vehicleInfo?.data?.data?.user?.last_name || "",
            branchCode: vehicleInfo?.data?.data?.user?.bankId?.branch_code || "",
            accountNumber: vehicleInfo?.data?.data?.user?.accountNumber || "",
            customerCode: vehicleInfo?.data?.data?.user?.customerCode || "",
            amount: vehicleInfo?.data?.data.totalDriverAmount || 0,
        });
        setPopup(type);
        setSelectedPayoutType(payoutType);
    };

    const closePopup = (event) => {
        // event.stopPropagation();
        setPopup('')
    }
    const renderPopup = () => {
        switch (payPopup) {
            case 'payout':
                return <PayoutPopup yesAction={handleChange} noAction={closePopup} />;
            default:
                return null;
        }
    };
    const eHailingList = useGeteHailingList()

    const eHailingOptions = eHailingList?.data?.data?.data?.map(item => ({
        label: item.name,
        value: item._id,
    })) || [];

    const selectedCompanyLabel = eHailingOptions.find(
        option => option.value === driverform.values.primary_e_hailing_company
    )?.label || '-';


    const displayField = (label, value) => (
        <Box mb={3}>
            <Typography sx={{ fontSize: '1.1rem', fontWeight: 400, mb: 1 }}>{label}</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ ml: 0.5 }}>
                {value || "-"}
            </Typography>
        </Box>
    );
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
                                Driver Information
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
                            {
                                editInfo ? (
                                    <CustomSelect
                                        label="Company Name"
                                        name="company_id"
                                        value={driverform.values.company_id || ''}
                                        onChange={e => {
                                            const selectedId = e.target.value;
                                            const selectedCompany = companyList.data?.data.users.find(
                                                (user) => user?._id === selectedId
                                            );
                                            driverform.setFieldValue("company_id", selectedCompany?._id || null);
                                            driverform.setFieldValue("company_id", selectedCompany?._id || null);
                                            driverform.setFieldValue("company_name", selectedCompany?.company_name || "");

                                        }}
                                        options={companyList?.data?.data?.users?.map(user => ({
                                            value: user?._id,
                                            label: user?.company_name
                                        })) || []}
                                        error={driverform.errors.company_id}
                                        disabled={role !== "super_admin" || !editInfo}

                                    />
                                ) : displayField("Company Name", driverform.values.company_name)
                            }
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
                        <Grid size={{ xs: 12, sm: 6, md: editInfo ? 6 : 4 }}>
                            {
                                editInfo ? (<FormControl variant="standard" fullWidth>
                                    <InputLabel
                                        shrink
                                        htmlFor="hijakingId"
                                        sx={{
                                            fontSize: '1.3rem',
                                            color: 'rgba(0, 0, 0, 0.8)',
                                            '&.Mui-focused': { color: 'black' },
                                        }}
                                    >
                                        Device IMEI Number
                                    </InputLabel>
                                    <BootstrapInput
                                        id="hijakingId"
                                        name="hijakingId"
                                        placeholder="Device IMEI number"
                                        value={driverform.values.hijakingId}
                                        onChange={driverform.handleChange}

                                    />
                                    {driverform.touched.hijakingId && driverform.errors.hijakingId && (
                                        <FormHelperText error>{driverform.errors.hijakingId}</FormHelperText>
                                    )}
                                </FormControl>) : (displayField("Device IMEI Number", driverform.values.hijakingId))
                            }
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: editInfo ? 6 : 4 }}>
                            {
                                editInfo ? (
                                    <CustomSelect
                                        label="Primary E-hailing Company"
                                        name="primary_e_hailing_company"
                                        value={driverform.values.primary_e_hailing_company}
                                        onChange={(e) => driverform.setFieldValue("primary_e_hailing_company", e.target.value)}
                                        options={
                                            eHailingOptions.map((option) => ({
                                                value: option.value,
                                                label: option.label,
                                            }))
                                        }
                                        error={driverform.touched.primary_e_hailing_company && Boolean(driverform.errors.primary_e_hailing_company)}
                                        helperText={driverform.touched.primary_e_hailing_company && driverform.errors.primary_e_hailing_company}
                                    />) : (
                                    displayField("Primary E-hailing Company", selectedCompanyLabel)
                                )
                            }
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: editInfo ? 6 : 4 }}>
                            {editInfo ? (<FormControl variant="standard" fullWidth>
                                <InputLabel
                                    shrink
                                    htmlFor="hijakingPass"
                                    sx={{
                                        fontSize: '1.3rem',
                                        color: 'rgba(0, 0, 0, 0.8)',
                                        '&.Mui-focused': { color: 'black' },
                                    }}
                                >
                                    Device Password
                                </InputLabel>
                                <BootstrapInput
                                    id="hijakingPass"
                                    name="hijakingPass"
                                    placeholder="Device Password"
                                    value={driverform.values.hijakingPass}
                                    onChange={driverform.handleChange}
                                />
                                <FormHelperText sx={{ mt: 1, fontSize: '13px' }}>
                                    <strong>Note:</strong> Password should be the last 6 digits of the IMEI number.
                                </FormHelperText>
                            </FormControl>) : (displayField("Device Password", driverform.values.hijakingPass))}
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: editInfo ? 6 : 4 }}>
                            {
                                editInfo ? (
                                    <FormControl component="fieldset" variant="standard" sx={{ width: '100%' }}>
                                        <FormLabel sx={{
                                            color: 'var(--font-gray)', '&.Mui-focused': { color: 'black' }, fontWeight: 500, fontSize: '1rem', mb: 1
                                        }}>
                                            Other eHailing Platforms
                                        </FormLabel>
                                        <FormGroup row sx={{ flexWrap: 'wrap', gap: 1 }}>
                                            {eHailingOptions.map((option) => (
                                                <FormControlLabel
                                                    key={option.value}
                                                    control={
                                                        <Checkbox
                                                            checked={driverform.values.other_e_hailing_company?.includes(option.value)}
                                                            onChange={(e) => {
                                                                const selected = driverform.values.other_e_hailing_company || [];
                                                                const updated = e.target.checked
                                                                    ? [...selected, option.value]
                                                                    : selected.filter((id) => id !== option.value);
                                                                driverform.setFieldValue("other_e_hailing_company", updated);
                                                            }}
                                                            icon={
                                                                <img
                                                                    src={uncheckedIcon}
                                                                    alt="unchecked"
                                                                    style={{ width: 24, height: 24 }}
                                                                />
                                                            }
                                                            checkedIcon={
                                                                <img
                                                                    src={checkedboxIcon}
                                                                    alt="checked"
                                                                    style={{ width: 24, height: 24 }}
                                                                />
                                                            }
                                                            name={option.value}
                                                        />
                                                    }
                                                    label={option.label}
                                                />
                                            ))}
                                        </FormGroup>
                                    </FormControl>
                                ) : (
                                    displayField(
                                        "Other eHailing Platforms",
                                        eHailingOptions
                                            .filter((opt) =>
                                                (driverform.values.other_e_hailing_company || []).includes(opt.value)
                                            )
                                            .map((opt) => opt.label)
                                            .join(", ") || "-"
                                    )
                                )
                            }
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: editInfo ? 6 : 4 }}>
                            {editInfo ? (<FormControlLabel
                                control={
                                    <Checkbox
                                        name="isArmed"
                                        checked={driverform.values.isArmed}
                                        onChange={(e) => driverform.setFieldValue("isArmed", e.target.checked)}
                                        icon={<img src={uncheckedIcon} alt='uncheckedIcon' />}
                                        checkedIcon={<img src={checkedboxIcon} alt='checkIcon' />} />
                                }
                                label="Security"
                            />) : (displayField("Security", driverform.values.isArmed ? 'Enabled' : "Disabled"))}
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: editInfo ? 6 : 4 }}>
                            {editInfo ? (
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            name="subscription_status"
                                            checked={driverform.values.isEnroll}
                                            onChange={(e) => driverform.setFieldValue("isEnroll", e.target.checked ? 'active' : 'inactive')}
                                            icon={<img src={uncheckedIcon} alt='uncheckedIcon' />}
                                            checkedIcon={<img src={checkedboxIcon} alt='checkIcon' />} />
                                    }
                                    label="Subscription Status"
                                />
                            ) : (displayField("Subscription Status", <Chip
                                label={driverform.values.isEnroll ? "Active" : "Inactive"}
                                sx={{
                                     backgroundColor: driverform.values.isEnroll ? '#DCFCE7' : '#E5565A1A',
                                    '& .MuiChip-label': {
                                        textTransform: 'capitalize',
                                        fontWeight: 500,
                                        color: driverform.values.isEnroll ? '#15803D' : '#E5565A',
                                    }
                                }}
                            />))}
                            

                        </Grid>
                        
                        {/* Enrolment Information Row */}
                        <Grid size={{ xs: 12, sm: 4, md: 4 }}>
                            {displayField("Start Enrolment", driverform.values.EnrollStartDate ? new Date(driverform.values.EnrollStartDate).toLocaleDateString() : 'N/A')}
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4, md: 4 }}>
                            {displayField("End Enrolment", driverform.values.paymentDate ? new Date(driverform.values.paymentDate).toLocaleDateString() : 'N/A')}
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4, md: 4 }}>
                            {displayField("Enrolment Type", driverform.values.EnrollType || 'N/A')}
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
                                                style={{ height: 200, width: '100%', objectFit: 'contain', marginBottom: 8,cursor: 'pointer' }}
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
                                                style={{ height: 200, width: '100%', objectFit: 'contain', marginBottom: 8,cursor: 'pointer' }}
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
                                  <Grid size={{ xs: 12, sm: 4, md: 2.5 }}>
                                    <label style={{ marginBottom: '10px', display: 'block', fontWeight: 500 }}>verification Selfie Image</label>
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
                                            name="verificationSelfieImage"
                                            disabled={!editInfo}
                                            onChange={e => driverform.setFieldValue('verificationSelfieImage', e.currentTarget.files[0])}
                                        />
                                        {driverform.values.verificationSelfieImage instanceof File ? (
                                            <img
                                                src={URL.createObjectURL(driverform.values.verificationSelfieImage)}
                                                alt="Full Preview"
                                                style={{ height: 200, width: '100%', objectFit: 'contain', marginBottom: 8 ,cursor: 'pointer'}}
                                                onClick={() => handleImageClick(driverform.values.verificationSelfieImage, 'verification Selfie Image')}
                                            />
                                        ) : driverform.values.verificationSelfieImage ? (
                                            <img
                                                src={driverform.values.verificationSelfieImage}
                                                alt="verification Selfie Image"
                                                style={{ height: 200, width: '100%', objectFit: 'contain', marginBottom: 8 ,cursor: 'pointer'}}
                                                onClick={() => handleImageClick(driverform.values.verificationSelfieImage, 'verification Selfie Image')}
                                            />
                                        ) : (<><img src={GrayPlus} alt="gray plus" />
                                            <Typography sx={{ color: '#B0B0B0', fontWeight: 550, mt: 1 }}>Upload</Typography></>
                                        )
                                        }

                                    </Box>
                                    {driverform.touched.verificationSelfieImage && driverform.errors.verificationSelfieImage && (
                                        <FormHelperText error>{driverform.errors.verificationSelfieImage}</FormHelperText>
                                    )}
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid size={12}>
                            <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
                                {editInfo  ? (
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
                                                resetDriverForm();
                                                setEditInfo(false);
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    </>
                                ) : (
                                    role !== "company" && (
                                        <Button
                                            variant="contained"
                                            sx={{ width: 130, height: 48, borderRadius: '10px', backgroundColor: 'var(--Blue)' }}
                                            onClick={() => setEditInfo(true)}
                                        >
                                            Edit
                                        </Button>
                                    )
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                </form>

            </Paper>

            {/* Address */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: '10px', mb: 3 }}>
                <form>
                    <Grid container spacing={editAddress ? 3 : 1}>
                        <Grid size={12}>
                            <Typography variant="h6" gutterBottom fontWeight={600}>
                                Address
                            </Typography>
                        </Grid>

                        <Grid size={{ xs: 12, sm: editAddress ? 6 : 4 }}>
                            {editAddress ? (
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
                                    disabled={!editAddress}
                                />
                            ) : displayField("Country", countrylist.data?.data.data?.find(c => c._id === driverform.values.country)?.country_name)}
                        </Grid>
                        <Grid size={{ xs: 12, sm: editAddress ? 6 : 4 }}>
                            {editAddress ? (
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
                                    disabled={!driverform.values.country || !editAddress}
                                />
                            ) : displayField("Province", provincelist.data?.data.data?.find(p => p._id === driverform.values.province)?.province_name)}
                        </Grid>
                        <Grid size={{ xs: 12, sm: editAddress ? 6 : 4 }}>
                            {editAddress ? (
                                <CustomSelect
                                    label="City"
                                    name="city"
                                    value={driverform.values.city}
                                    onChange={driverform.handleChange}
                                    disabled={!editAddress}
                                    options={cityList?.data?.data.data?.map(city => ({
                                        value: city._id,
                                        label: city.city_name
                                    })) || []}
                                    error={driverform.errors.city && driverform.touched.city}
                                    helperText={driverform.touched.city ? driverform.errors.city : ''}
                                />
                            ) : displayField("City", cityList?.data?.data.data?.find(p => p._id === driverform.values.city)?.city_name)}
                        </Grid>
                        <Grid size={{ xs: 12, sm: editAddress ? 6 : 4 }}>
                            {editAddress ? (
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
                                        disabled={!editAddress}
                                    />
                                    {driverform.touched.suburb && <FormHelperText error>{driverform.errors.suburb}</FormHelperText>}
                                </FormControl>
                            ) : displayField("Suburb", driverform.values.suburb)}
                        </Grid>
                        <Grid size={{ xs: 12, sm: editAddress ? 6 : 4 }}>
                            {editAddress ? (
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
                                        disabled={!editAddress}
                                    />
                                    {driverform.touched.street && <FormHelperText error>{driverform.errors.street}</FormHelperText>}
                                </FormControl>
                            ) : displayField("Street", driverform.values.street)}
                        </Grid>
                        <Grid size={{ xs: 12, sm: editAddress ? 6 : 4 }}>
                            {editAddress ? (
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
                                        disabled={!editAddress}
                                    />
                                    {driverform.touched.postal_code && <FormHelperText error>{driverform.errors.postal_code}</FormHelperText>}
                                </FormControl>
                            ) : displayField("Postal Code", driverform.values.postal_code)}
                        </Grid>
                        <Grid size={12}>
                            <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
                                {editAddress ? (
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
                                                resetDriverForm();
                                                setEditAddress(false);
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    </>
                                ) : (
                                    role !== "company" && (
                                        <Button
                                            variant="contained"
                                            sx={{ width: 130, height: 48, borderRadius: '10px', backgroundColor: 'var(--Blue)' }}
                                            onClick={() => setEditAddress(true)}
                                        >
                                            Edit
                                        </Button>
                                    )
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Paper>

            {/* emergency */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: '10px', mb: 3 }}>
                <form>
                    <Grid container spacing={editEmergency ? 3 : 1}>
                        <Grid size={12}>
                            <Typography variant="h6" gutterBottom fontWeight={600}>
                                Emergency Contact
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            {editEmergency ? (
                                <FormControl variant="standard" fullWidth >
                                    <InputLabel shrink htmlFor="emergency_contact_1_email" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                        Emergency Contact 1 Email
                                    </InputLabel>
                                    <BootstrapInput
                                        id="emergency_contact_1_email"
                                        name="emergency_contact_1_email"
                                        placeholder="emergencycontact@gu.link"
                                        value={emergencyform.values.emergency_contact_1_email}
                                        onChange={emergencyform.handleChange}
                                    />
                                </FormControl>
                            ) : displayField("Email", emergencyform.values.emergency_contact_1_email)}
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            {editEmergency ? (
                                <FormControl variant="standard" fullWidth>
                                    <label style={{ marginBottom: 5 }}>Contact Number 1</label>
                                    <PhoneInput
                                        country={"za"}
                                        value={`${emergencyform.values.emergency_contact_1_country_code ?? ''}${emergencyform.values.emergency_contact_1_contact ?? ''}`}
                                        onChange={(phone, countryData) => {
                                            const withoutCountryCode = phone.startsWith(countryData.dialCode)
                                                ? phone.slice(countryData.dialCode.length).trim()
                                                : phone;

                                            emergencyform.setFieldValue("emergency_contact_1_contact", withoutCountryCode);
                                            emergencyform.setFieldValue("emergency_contact_1_country_code", `+${countryData.dialCode}`);
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
                                    {/* {driverform.touched.mobile_no && driverform.errors.mobile_no && (
                                        <FormHelperText error>{driverform.errors.mobile_no}</FormHelperText>
                                    )} */}
                                </FormControl>
                            ) : displayField("Contact Number 1", `${emergencyform.values.emergency_contact_1_country_code ?? ''} ${emergencyform.values.emergency_contact_1_contact ?? ''}`)}

                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            {editEmergency ? (
                                <FormControl variant="standard" fullWidth >
                                    <InputLabel shrink htmlFor="emergency_contact_2_email" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                        Emergency Contact 2 Email
                                    </InputLabel>
                                    <BootstrapInput
                                        id="emergency_contact_2_email"
                                        name="emergency_contact_2_email"
                                        placeholder="emergencycontact@gu.link"
                                        value={emergencyform.values.emergency_contact_2_email}
                                        onChange={emergencyform.handleChange}
                                    />
                                </FormControl>
                            ) : displayField("Email 2", emergencyform.values.emergency_contact_2_email)}
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            {editEmergency ? (
                                <FormControl variant="standard" fullWidth>
                                    <label style={{ marginBottom: 5 }}>Contact Number 2</label>
                                    <PhoneInput
                                        country={"za"}
                                        value={`${emergencyform.values.emergency_contact_2_country_code ?? ''}${emergencyform.values.emergency_contact_2_contact ?? ''}`}
                                        onChange={(phone, countryData) => {
                                            const withoutCountryCode = phone.startsWith(countryData.dialCode)
                                                ? phone.slice(countryData.dialCode.length).trim()
                                                : phone;

                                            emergencyform.setFieldValue("emergency_contact_2_contact", withoutCountryCode);
                                            emergencyform.setFieldValue("emergency_contact_2_country_code", `+${countryData.dialCode}`);
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
                                    {/* {driverform.touched.mobile_no && driverform.errors.mobile_no && (
                                        <FormHelperText error>{driverform.errors.mobile_no}</FormHelperText>
                                    )} */}
                                </FormControl>
                            ) : displayField("Contact Number 2", `${emergencyform.values.emergency_contact_2_country_code ?? ''} ${emergencyform.values.emergency_contact_2_contact ?? ''}`)}
                        </Grid>
                        <Grid size={12}>
                            <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
                                {editEmergency ? (
                                    <>
                                        <Button
                                            variant="contained"
                                            sx={{ width: 130, height: 48, borderRadius: '10px', backgroundColor: 'var(--Blue)' }}
                                            onClick={() => {
                                                emergencyform.handleSubmit()
                                                setEditEmergency(false);
                                            }}
                                        >
                                            Save
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            sx={{ width: 130, height: 48, borderRadius: '10px' }}
                                            onClick={() => {
                                                resetDriverForm();
                                                setEditEmergency(false);
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    </>
                                ) : (
                                    role !== "company" && (
                                        <Button
                                            variant="contained"
                                            sx={{ width: 130, height: 48, borderRadius: '10px', backgroundColor: 'var(--Blue)' }}
                                            onClick={() => setEditEmergency(true)}
                                        >
                                            Edit
                                        </Button>
                                    )
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Paper>

            {/* vehicle information */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: '10px', mb: 3 }}>
                <form>
                    <Grid container spacing={editVehicle ? 3 : 1}>
                        <Grid size={12}>
                            <Typography variant="h6" gutterBottom fontWeight={600}>
                                Vehicle Information
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: editVehicle ? 6 : 4 }}>
                            {editVehicle ? (
                                <FormControl variant="standard" fullWidth>
                                    <InputLabel
                                        shrink
                                        htmlFor="vehicle_name"
                                        sx={{
                                            fontSize: '1.3rem',
                                            color: 'rgba(0, 0, 0, 0.8)',
                                            '&.Mui-focused': { color: 'black' },
                                        }}
                                    >
                                        Vehicle Name
                                    </InputLabel>
                                    <BootstrapInput
                                        id="vehicle_name"
                                        name="vehicle_name"
                                        placeholder="Vehicle Name"
                                        value={vehicleForm.values.vehicle_name}
                                        onChange={vehicleForm.handleChange}
                                        disabled={!editVehicle}
                                    />
                                    {vehicleForm.touched?.vehicle_name && (
                                        <FormHelperText error>{vehicleForm.errors?.vehicle_name}</FormHelperText>
                                    )}
                                </FormControl>
                            ) : (
                                displayField("Vehicle Name", vehicleForm.values.vehicle_name)
                            )}
                        </Grid>

                        <Grid size={{ xs: 12, sm: editVehicle ? 6 : 4 }}>
                            {editVehicle ? (
                                <CustomSelect
                                    label="Vehicle Type"
                                    name="type"
                                    value={vehicleForm.values.type}
                                    onChange={vehicleForm.handleChange}
                                    disabled={!editVehicle}
                                    options={vehicleTypeList?.data?.data?.map(vehicle => ({
                                        value: vehicle._id,
                                        label: vehicle.vehicleTypeName
                                    })) || []}
                                    error={vehicleForm.errors.type && vehicleForm.touched.type}
                                    helperText={vehicleForm.touched.type ? vehicleForm.errors.type : ''}
                                />
                            ) : displayField("Vehicle Type", vehicleTypeList?.data?.data?.find(p => p._id === vehicleForm.values.type)?.vehicleTypeName)}
                        </Grid>

                        <Grid size={{ xs: 12, sm: editVehicle ? 6 : 4 }}>
                            {editVehicle ? (
                                <FormControl variant="standard" fullWidth>
                                    <InputLabel
                                        shrink
                                        htmlFor="reg_no"
                                        sx={{
                                            fontSize: '1.3rem',
                                            color: 'rgba(0, 0, 0, 0.8)',
                                            '&.Mui-focused': { color: 'black' },
                                        }}
                                    >
                                        Vehicle Registration No.
                                    </InputLabel>
                                    <BootstrapInput
                                        id="reg_no"
                                        name="reg_no"
                                        placeholder="Vehicle Registration No."
                                        value={vehicleForm.values.reg_no}
                                        onChange={vehicleForm.handleChange}
                                        disabled={!editVehicle}
                                    />
                                    {vehicleForm.touched?.reg_no && (
                                        <FormHelperText error>{vehicleForm.errors?.reg_no}</FormHelperText>
                                    )}
                                </FormControl>
                            ) : (
                                displayField("Vehicle Registration No.", vehicleForm.values.reg_no)
                            )}
                        </Grid>
                        <Grid size={{ xs: 12, sm: editVehicle ? 6 : 4 }}>
                            {editVehicle ? (
                                <FormControl variant="standard" fullWidth>
                                    <InputLabel
                                        shrink
                                        htmlFor="license_number"
                                        sx={{
                                            fontSize: '1.3rem',
                                            color: 'rgba(0, 0, 0, 0.8)',
                                            '&.Mui-focused': { color: 'black' },
                                        }}
                                    >
                                        Driving License Number
                                    </InputLabel>
                                    <BootstrapInput
                                        id="license_number"
                                        name="license_number"
                                        placeholder="Driving License Number"
                                        value={vehicleForm.values.license_number}
                                        onChange={vehicleForm.handleChange}
                                    />
                                    {vehicleForm.touched?.license_number && (
                                        <FormHelperText error>{vehicleForm.errors?.license_number}</FormHelperText>
                                    )}
                                </FormControl>
                            ) : (
                                displayField("Driving License Number", vehicleForm.values.license_number)
                            )}
                        </Grid>
                        {(vehicleForm?.values?.images?.length > 0 || editVehicle) && (
                            <Grid size={12}>
                                <Typography sx={{ fontSize: '1.1rem', fontWeight: 400, mb: 1 }}>
                                    Add Car Images
                                </Typography>
                                <Grid container pt={2} spacing={2}>
                                    {[
                                        { label: "Front Side", img: vehicleIcon },
                                        { label: "Back Side", img: vehicleIcon2 },
                                        { label: "Left Side", img: vehicleIcon3 },
                                        { label: "Right Side", img: vehicleIcon4 },
                                        { label: "Car Number Plate", img: vehicleIcon5 },
                                        { label: "License DISC Image", img: vehicleIcon6 },
                                    ].map((item, index) => (
                                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} key={index}>
                                            <Typography
                                                variant="subtitle2"
                                                color="textSecondary"
                                                align="center"
                                                gutterBottom
                                            >
                                                {item.label}
                                            </Typography>

                                            <Box
                                                sx={{
                                                    border: '1px solid #E5E7EB',
                                                    borderRadius: '12px',
                                                    p: 2,
                                                    minHeight: 250,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: editVehicle ? 'pointer' : 'default',
                                                    position: 'relative',
                                                }}
                                            >
                                                {vehicleForm.values.images[index] ? (
                                                    <img
                                                        src={
                                                            vehicleForm.values.images[index] instanceof File
                                                                ? URL.createObjectURL(vehicleForm.values.images[index])
                                                                : vehicleForm.values.images[index]
                                                        }
                                                        alt={item.label}
                                                        style={{
                                                            maxHeight: 200,
                                                            maxWidth: '100%',
                                                            borderRadius: 4,
                                                            cursor : 'pointer'
                                                        }}
                                                        onClick={() => handleImageClick(vehicleForm.values.images[index], item.label)}
                                                    />
                                                ) : (
                                                    <Box textAlign="center">
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                gap: 1,
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                            }}
                                                        >
                                                            <img src={item.img} alt="vehicle image" height={50} width={50} />
                                                            <Box
                                                                sx={{
                                                                    p: 1,
                                                                    display: 'flex',
                                                                    flexDirection: 'row',
                                                                    gap: 1,
                                                                    justifyContent: 'center',
                                                                    alignItems: 'center',
                                                                    backgroundColor: '#367BE0',
                                                                    borderRadius: '8px',
                                                                }}
                                                            >
                                                                <img src={camera} alt="camera" />
                                                                <Typography sx={{ color: 'white' }} variant="body2">
                                                                    Upload
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </Box>
                                                )}

                                                {/* File input overlay only if edit mode is on */}
                                                {editVehicle && (
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        style={{
                                                            opacity: 0,
                                                            position: 'absolute',
                                                            top: 0,
                                                            left: 0,
                                                            width: '100%',
                                                            height: '100%',
                                                            cursor: 'pointer',
                                                        }}
                                                        onChange={(e) => {
                                                            const file = e.target.files[0];
                                                            if (file) {
                                                                const updatedImages = [...vehicleForm.values.images];
                                                                updatedImages[index] = file;
                                                                vehicleForm.setFieldValue("images", updatedImages);
                                                            }
                                                        }}
                                                    />
                                                )}
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Grid>
                        )}


                        <Grid size={12}>
                            <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
                                {editVehicle ? (
                                    <>
                                        <Button
                                            variant="contained"
                                            sx={{ width: 130, height: 48, borderRadius: '10px', backgroundColor: 'var(--Blue)' }}
                                            onClick={() => {
                                                // Save logic for emergency contact (if needed, call submithandler or a separate handler)
                                                vehicleForm.handleSubmit()
                                                setEditVehicle(false);
                                            }}
                                        >
                                            Save
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            sx={{ width: 130, height: 48, borderRadius: '10px' }}
                                            onClick={() => {
                                                resetDriverForm();
                                                setEditVehicle(false);
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    </>
                                ) : (
                                    role !== "company" && (
                                        <Button
                                            variant="contained"
                                            sx={{ width: 130, height: 48, borderRadius: '10px', backgroundColor: 'var(--Blue)' }}
                                            onClick={() => {
                                                if (!vehicleForm.values.vehicle_id) {
                                                    toast.error("No vehicle found.");
                                                    return;
                                                }
                                                setEditVehicle(true);
                                            }}
                                        >
                                            Edit
                                        </Button>
                                    )
                                )}
                            </Box>
                        </Grid>

                    </Grid>
                </form>
            </Paper >

            {/* armed sos table */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: '10px', mb: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                    Armed SOS
                </Typography>
                <Box sx={{ px: { xs: 0, md: 2 }, pt: { xs: 0, md: 3 }, backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
                    <TableContainer
                        component={Paper}
                        sx={{ mt: 2, borderRadius: 2, overflowX: "auto" }}
                    >
                        <Table sx={{ '& .MuiTableCell-root': { borderBottom: 'none', fontSize: '15px' } }}>
                            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableRow>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', borderTopLeftRadius: '10px' }}>Armed User</TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Responder</TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Status</TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Radius</TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Armed Location</TableCell>
                                    <TableCell align="center" sx={{ backgroundColor: '#F9FAFB', borderTopRightRadius: '10px', color: '#4B5563' }}>Action</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {vehicleInfo?.data?.data?.armedSos?.length > 0 ? (
                                    vehicleInfo.data.data.armedSos.map((sos, index) => (
                                        <TableRow key={index} hover>
                                            <TableCell>
                                                {sos.armedUserId
                                                    ? `${sos.armedUserId.first_name || ""} ${sos.armedUserId.last_name || ""}`
                                                    : "Unknown"}
                                            </TableCell>

                                            <TableCell>
                                                {sos?.responders?.length > 0 ? (
                                                    sos.responders.map((responder, i) => (
                                                        <Box key={i}>
                                                            {responder?.armedUserId?.first_name}{" "}
                                                            {responder?.armedUserId?.last_name}
                                                        </Box>
                                                    ))
                                                ) : (
                                                    <Typography variant="body2" color="text.secondary">
                                                        -
                                                    </Typography>
                                                )}
                                            </TableCell>

                                            <TableCell>{sos?.armedSosstatus || "-"}</TableCell>

                                            <TableCell>{sos?.armedLocationId?.armedRadius || "-"}</TableCell>

                                            <TableCell>
                                                {sos.armedLocationId ? (
                                                    `${sos.armedLocationId.city || ""}, ${sos.armedLocationId.street || ""}, ${sos.armedLocationId.suburb || ""}`
                                                ) : (
                                                    "Unknown"
                                                )}
                                            </TableCell>

                                            <TableCell align="center">
                                                <Button
                                                    component={NavLink}
                                                    to={`/home/total-drivers/sos-information/${sos._id}`}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ textTransform: "none" }}
                                                >
                                                    View
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            <Typography variant="body2" color="text.secondary">
                                                No data found
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Grid container justifyContent="space-between" alignItems="center" mt={2}>
                        <Grid>
                            <Typography variant="body2">
                                Rows per page:&nbsp;
                                <Select
                                    size="small"
                                    sx={{
                                        border: 'none',
                                        boxShadow: 'none',
                                        outline: 'none',
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            border: 'none',
                                        },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            border: 'none',
                                        },
                                        '& .MuiOutlinedInput-root': {
                                            boxShadow: 'none',
                                            outline: 'none',
                                        },
                                        '& .MuiSelect-select': {
                                            outline: 'none',
                                        },
                                    }}
                                    value={rowsPerPage}
                                    onChange={(e) => {
                                        setRowsPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                >
                                    {[5, 10, 15, 20,50,100].map((num) => (
                                        <MenuItem key={num} value={num}>
                                            {num}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </Typography>
                        </Grid>
                        <Grid>
                            <Box display="flex" alignItems="center" gap={{ xs: 1, sm: 2 }}>
                                <Typography variant="body2">
                                    {currentPage} / {1}
                                </Typography>
                                <IconButton
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage((prev) => prev - 1)}
                                >
                                    <NavigateBeforeIcon fontSize="small" sx={{
                                        color: currentPage === 1 ? '#BDBDBD' : '#1976d2'
                                    }} />
                                </IconButton>
                                <IconButton
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage((prev) => prev + 1)}
                                >
                                    <NavigateNextIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
            {/* payout module */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: '10px', mb: 3 }}>
                <Box sx={{ borderBottom: '1px solid #E5E7EB' }}>
                    <Typography variant="h6" gutterBottom fontWeight={550}>
                        Driver Payout
                    </Typography>
                </Box>
                <Box
                    sx={{
                        p: 3,
                        mt: 3,
                        borderRadius: 2,
                        border: '1px solid #E5E7EB',
                        backgroundColor: "#F9FAFB",
                        display: "flex",
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexDirection: "row",
                        gap: 2,
                        width: "100%",
                    }}
                >
                    <Box>
                        <Typography variant="body1" mb={1} sx={{ color: 'var(--font-gray)' }} fontWeight={500}>
                            Total Driver Amount
                        </Typography>

                        <Typography variant="h5" sx={{ fontWeight: 500 }}>
                            R{driverform.data?.data.totalDriverAmount || 0}
                        </Typography>
                    </Box>

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={(event) => handlePopup(event, "payout", "driver")}
                        sx={{ height: '40px', gap: '10px', backgroundColor: 'var(--Blue)' }}
                    >
                        <img src={payIcon} alt="payIcon" />
                        Pay Driver
                    </Button>

                    {renderPopup()}
                </Box>
            </Paper>
        </Box >
        </>
    );
};

export default VehicleInformation;

const setdriverformvalues = ({ ...props }) => {
    const { form, data } = props;
    let newdata = {};
    Object.keys(form.values).forEach((key) => {
        if (key === 'images') {
            newdata = { ...newdata, [key]: Array.from({ length: 5 }, (_, i) => data?.[`image_${i + 1}`] || null).filter(Boolean) };
        }
        else if (key === 'company_id') {
            newdata = { ...newdata, [key]: data?.company_id?._id ?? '' };
        } else if (key === 'EnrollStartDate' || key === 'paymentDate' || key === 'EnrollType') {
            // Handle enrolment fields
            newdata = { ...newdata, [key]: data?.[key] || '' };
        } else {
            newdata = { ...newdata, [key]: data?.[key] ?? '' };
        }
    });
    form.setValues(newdata)
};
