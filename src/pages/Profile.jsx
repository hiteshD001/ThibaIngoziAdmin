import {
  Box, Typography, Button, Paper, Grid, FormControl, InputLabel, FormHelperText, Chip
} from "@mui/material";
import { useFormik } from "formik";
import {
  profileValidation_c,
  profileValidation_s,
} from "../common/FormValidation";
import { BootstrapInput } from "../common/BootstrapInput";
import CustomSelect from "../common/Custom/CustomSelect";
import { useEffect, useState, useLayoutEffect } from "react";
import CircularProgress from '@mui/material/CircularProgress';
import { useQueryClient } from "@tanstack/react-query";
import { useGetUser, useUpdateUser, useGetCountryList, useGetProvinceList, useGetServicesList, useGetCityList } from "../API Calls/API";
import { toast } from "react-toastify";
import SingleImagePreview from "../common/SingleImagePreview";
import { toastOption } from "../common/ToastOptions";
import Loader from "../common/Loader";
import PhoneInput from "react-phone-input-2";
import GrayPlus from '../assets/images/GrayPlus.svg'
import DeleteIcon from '../assets/images/DeleteIcon.svg'
import { enable2FA } from "../API Calls/authAPI";
import { Switch, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { QRCodeSVG } from 'qrcode.react';
import QRCode from 'qrcode';


const Profile = () => {
  const [servicesList, setServicesList] = useState({});
  const [previewImage, setPreviewImage] = useState({
    open: false,
    src: '',
    label: ''
  });
  const [isSingle, setIsSingle] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [GrpservicesList, setGrpservicesList] = useState([]);
  const [role] = useState(localStorage.getItem("role"));
  const [edit, setEdit] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [is2FALoading, setIs2FALoading] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);
  const client = useQueryClient();

  const onSuccess = () => {
    toast.success("Profile Update Successfully.");
    client.invalidateQueries("userinfo");
  };
  const onError = (error) => {
    toast.error(error.response.data.message || "Something went Wrong", toastOption);
  };

  const { mutate, isPending } = useUpdateUser(onSuccess, onError);
  const userinfo = useGetUser(localStorage.getItem("userID"), role, {
    onSuccess: (data) => {

    }
  });

  const profileForm = useFormik({
    initialValues: role === "super_admin" ? super_admin : company,
    validationSchema:
      role === "super_admin" ? profileValidation_s : profileValidation_c,
    onSubmit: (values) => {

      setEdit(false);
      const formData = new FormData();


      Object.keys(values).forEach((key) => {
        if (key === "services" && Array.isArray(values.services)) {
          values.services.forEach((id) => formData.append("companyService[]", id));
        } else if (key !== "selfieImage" && key !== "fullImage" && key !== "verificationSelfieImage") {
          formData.append(key, values[key]);
        }
      });

      if (values.selfieImage && values.selfieImage instanceof File) {
        formData.append("selfieImage", values.selfieImage);
      }

      if (values.fullImage && values.fullImage instanceof File) {
        formData.append("fullImage", values.fullImage);
      }

      if (values.verificationSelfieImage && values.verificationSelfieImage instanceof File) {
        formData.append("verificationSelfieImage", values.verificationSelfieImage);
      }

      mutate({ id: localStorage.getItem("userID"), data: formData });
    },

  });

  const countrylist = useGetCountryList();
  const cityList = useGetCityList(profileForm.values.province)
  const provincelist = useGetProvinceList(profileForm.values.country);

  useEffect(() => {
    profileForm.setValues(
      role === "super_admin"
        ? {
          first_name: userinfo.data?.data.user?.first_name || "",
          last_name: userinfo.data?.data.user?.last_name || "",
          selfieImage: userinfo.data?.data.user?.selfieImage || "",
          fullImage: userinfo.data?.data.user?.fullImage || "",
          verificationSelfieImage: userinfo.data?.data.user?.verificationSelfieImage || "",
          email: userinfo.data?.data.user?.email || "",
          street: userinfo.data?.data.user?.street || "",
          province: userinfo.data?.data.user?.province || "",
          city: userinfo.data?.data.user?.city || "",
          suburb: userinfo.data?.data.user?.suburb || "",
          postal_code: userinfo.data?.data.user?.postal_code || "",
          country: userinfo.data?.data.user?.country || "",
          role: userinfo.data?.data.user?.role || "",
          mobile_no: userinfo.data?.data.user?.mobile_no || "",
          mobile_no_country_code: userinfo.data?.data.user?.mobile_no_country_code || "",
        }
        : {
          isArmed: userinfo.data?.data.user?.isArmed || false,
          isPaymentToken: userinfo.data?.data.user?.isPaymentToken || false,
          isEnrollToken: userinfo.data?.data.user?.isEnrollToken || false,
          selfieImage: userinfo.data?.data.user?.selfieImage || "",
          fullImage: userinfo.data?.data.user?.fullImage || "",
          verificationSelfieImage: userinfo.data?.data.user?.verificationSelfieImage || "",
          contact_name: userinfo.data?.data.user?.contact_name || "",
          services: userinfo?.data?.data.user?.services
            ?.filter(s => s.serviceId?.isService)
            .map(s => s.serviceId._id) || [],
          email: userinfo.data?.data.user?.email || "",
          street: userinfo.data?.data.user?.street || "",
          province: userinfo.data?.data.user?.province || "",
          city: userinfo.data?.data.user?.city || "",
          suburb: userinfo.data?.data.user?.suburb || "",
          postal_code: userinfo.data?.data.user?.postal_code || "",
          country: userinfo.data?.data.user?.country || "",
          role: userinfo.data?.data.user?.role || "",
          mobile_no: userinfo.data?.data.user?.mobile_no || "",
          mobile_no_country_code: userinfo.data?.data.user?.mobile_no_country_code || "",
        }
    );

    // Update 2FA status when user data is loaded
    if (userinfo.data?.data?.user) {
      const twoFactorAuthEnabled = userinfo.data?.data?.user?.twoFactorAuth?.enabled ?? false;
      setIs2FAEnabled(Boolean(twoFactorAuthEnabled));
    }
  }, [userinfo.data, edit]);

  const serviceslist = useGetServicesList()
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
        }
      ];

      setGrpservicesList(groupedOptions ?? [])
    }
  }, [serviceslist])

  const displayField = (label, value) => (
    <Box mb={3}>
      <Typography sx={{ fontSize: '1.1rem', fontWeight: 400, mb: 1 }}>{label}</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ ml: 0.5 }}>
        {value || "-"}
      </Typography>
    </Box>
  );
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

  const handleQRCodeClose = () => {
    setShowCloseConfirmation(true);
  };

  const handleCloseConfirmation = (shouldClose) => {
    setShowCloseConfirmation(false);

    if (shouldClose) {
      // User selected "Yes" - close the dialog
      setShowQRCode(false);
    }
    // User selected "No" - do nothing, stay on the QR code dialog
  };

  const handle2FAToggle = async (e) => {
    const newValue = e.target.checked;
    setIs2FALoading(true);

    try {
      console.log(newValue ? 'Enabling 2FA...' : 'Disabling 2FA...');
      const response = await enable2FA(newValue);

      if (!response || !response.success) {
        throw new Error(newValue ? 'Failed to initialize 2FA setup' : 'Failed to disable 2FA');
      }

      if (newValue) {
        const { secret, otpauthUrl } = response;

        if (!secret || !otpauthUrl) {
          throw new Error('Invalid 2FA setup data received');
        }

        try {
          // Generate QR code data URL only when enabling 2FA
          const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl, {
            errorCorrectionLevel: 'H',
            margin: 2,
            width: 200,
            type: 'image/png'
          });

          setQrCodeData({
            secret,
            otpauthUrl,
            qrCodeDataUrl
          });
          setQrCodeUrl(otpauthUrl);
          setShowQRCode(true);
          setIs2FAEnabled(true);
        } catch (error) {
          console.error('Error generating QR code:', error);
          throw new Error('Failed to generate QR code');
        }
      } else {
        // Handle successful disable
        setIs2FAEnabled(false);
        setQrCodeData(null);
        setQrCodeUrl('');
        toast.success('2FA has been disabled successfully', { ...toastOption, autoClose: 3000 });

      }
    } catch (error) {
      console.error('2FA toggle error:', error);
      toast.error(
        error.response?.data?.message || error.message || 'Failed to update 2FA settings',
        toastOption
      );
      // Revert the switch on error
      setIs2FAEnabled(!newValue);
    } finally {
      setIs2FALoading(false);
    }
  };

  return (
    <>
      <SingleImagePreview
        show={previewImage.open}
        onClose={handleClosePreview}
        image={previewImage.src ? { src: previewImage.src, label: previewImage.label } : null}
      />
      <Box p={3}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: '10px', mb: 3 }}>
          <form>
            <Grid container spacing={edit ? 3 : 1}>
              <Grid size={12}>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Profile Information
                </Typography>
              </Grid>
              {role === "super_admin" ? (
                <>
                  <Grid size={{ xs: 12, sm: 6, md: edit ? 6 : 4 }}>
                    {edit ? (
                      <FormControl variant="standard" fullWidth >
                        <InputLabel shrink htmlFor="first_name" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                          First Name
                        </InputLabel>
                        <BootstrapInput
                          id="first_name"
                          name="first_name"
                          placeholder="First Name"
                          value={profileForm.values.first_name}
                          onChange={profileForm.handleChange}

                        />
                        {profileForm.touched.first_name && <FormHelperText error>{profileForm.errors.first_name}</FormHelperText>}
                      </FormControl>
                    ) : displayField("First Name", profileForm.values.first_name)}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: edit ? 6 : 4 }}>
                    {edit ? (
                      <FormControl variant="standard" fullWidth >
                        <InputLabel shrink htmlFor="last_name" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                          Last Name
                        </InputLabel>
                        <BootstrapInput
                          id="last_name"
                          name="last_name"
                          placeholder="Last Name"
                          value={profileForm.values.last_name}
                          onChange={profileForm.handleChange}

                        />
                        {profileForm.touched.last_name && <FormHelperText error>{profileForm.errors.last_name}</FormHelperText>}
                      </FormControl>
                    ) : displayField("Last Name", profileForm.values.last_name)}
                  </Grid></>) : (
                <Grid size={{ xs: 12, sm: 6, md: edit ? 6 : 4 }}>
                  {edit ? (
                    <FormControl variant="standard" fullWidth >
                      <InputLabel shrink htmlFor="contact_name" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                        First Name
                      </InputLabel>
                      <BootstrapInput
                        id="contact_name"
                        name="contact_name"
                        placeholder="Username"
                        value={profileForm.values.contact_name}
                        onChange={profileForm.handleChange}
                        disabled={!edit}
                      />
                      {profileForm.touched.contact_name && <FormHelperText error>{profileForm.errors.contact_name}</FormHelperText>}
                    </FormControl>
                  ) : displayField("User Name", profileForm.values.contact_name)}
                </Grid>
              )}
              <Grid size={{ xs: 12, sm: 6, md: edit ? 6 : 4 }}>
                {edit ? (
                  <FormControl variant="standard" fullWidth>
                    <InputLabel shrink htmlFor="email" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                      Email
                    </InputLabel>
                    <BootstrapInput
                      id="email"
                      name="email"
                      placeholder="Email"
                      value={profileForm.values.email}
                      onChange={profileForm.handleChange}

                    />
                    {profileForm.touched.email && <FormHelperText error>{profileForm.errors.email}</FormHelperText>}
                  </FormControl>
                ) : displayField("Email", profileForm.values.email)}
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: edit ? 6 : 4 }}>
                {edit ? (
                  <FormControl variant="standard" fullWidth>
                    <label style={{ marginBottom: 5 }}>Phone Number</label>
                    <PhoneInput
                      country={"za"}

                      value={`${profileForm.values.mobile_no_country_code ?? ''}${profileForm.values.mobile_no ?? ''}`}
                      onChange={(phone, countryData) => {
                        const withoutCountryCode = phone.startsWith(countryData.dialCode)
                          ? phone.slice(countryData.dialCode.length).trim()
                          : phone;

                        profileForm.setFieldValue("mobile_no", withoutCountryCode);
                        profileForm.setFieldValue("mobile_no_country_code", `+${countryData.dialCode}`);
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
                    {profileForm.touched.mobile_no && profileForm.errors.mobile_no && (
                      <FormHelperText error>{profileForm.errors.mobile_no}</FormHelperText>
                    )}
                  </FormControl>
                ) : displayField("Phone Number", `${profileForm.values.mobile_no_country_code ?? ''}${profileForm.values.mobile_no ?? ''}`)}
              </Grid>

              <Grid size={{ xs: 12, sm: edit ? 6 : 4 }}>
                {edit ? (
                  <CustomSelect
                    label="Country"
                    name="country"
                    value={profileForm.values.country}
                    onChange={profileForm.handleChange}
                    options={countrylist.data?.data.data?.map(country => ({
                      value: country._id,
                      label: country.country_name
                    })) || []}
                    error={profileForm.errors.country}
                    helperText={profileForm.errors.country}
                    disabled={!edit}
                  />
                ) : displayField("Country", countrylist.data?.data.data?.find(c => c._id === profileForm.values.country)?.country_name)}
              </Grid>
              <Grid size={{ xs: 12, sm: edit ? 6 : 4 }}>
                {edit ? (
                  <CustomSelect
                    label="Province"
                    name="province"
                    value={profileForm.values.province}
                    onChange={profileForm.handleChange}
                    options={provincelist.data?.data.data?.map(province => ({
                      value: province._id,
                      label: province.province_name
                    })) || []}
                    error={profileForm.errors.province}
                    helperText={profileForm.errors.province}
                    disabled={!profileForm.values.country || !edit}
                  />
                ) : displayField("Province", provincelist.data?.data.data?.find(p => p._id === profileForm.values.province)?.province_name)}
              </Grid>
              <Grid size={{ xs: 12, sm: edit ? 6 : 4 }}>
                {edit ? (
                  <CustomSelect
                    label="City"
                    name="city"
                    value={profileForm.values.city}
                    onChange={profileForm.handleChange}
                    options={cityList?.data?.data.data?.map(city => ({
                      value: city._id,
                      label: city.city_name
                    })) || []}
                    error={profileForm.errors.city && profileForm.touched.city}
                    helperText={profileForm.touched.city ? profileForm.errors.city : ''}
                  />
                ) : displayField("City", cityList?.data?.data.data?.find(p => p._id === profileForm.values.city)?.city_name)}
              </Grid>
              <Grid size={{ xs: 12, sm: edit ? 6 : 4 }}>
                {edit ? (
                  <FormControl variant="standard" fullWidth >
                    <InputLabel shrink htmlFor="suburb" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                      Suburb
                    </InputLabel>
                    <BootstrapInput
                      id="suburb"
                      name="suburb"
                      placeholder="Suburb"
                      value={profileForm.values.suburb}
                      onChange={profileForm.handleChange}
                      disabled={!edit}
                    />
                    {profileForm.touched.suburb && <FormHelperText error>{profileForm.errors.suburb}</FormHelperText>}
                  </FormControl>
                ) : displayField("Suburb", profileForm.values.suburb)}
              </Grid>
              <Grid size={{ xs: 12, sm: edit ? 6 : 4 }}>
                {edit ? (
                  <FormControl variant="standard" fullWidth >
                    <InputLabel shrink htmlFor="street" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                      Street
                    </InputLabel>
                    <BootstrapInput
                      id="street"
                      name="street"
                      placeholder="Street"
                      value={profileForm.values.street}
                      onChange={profileForm.handleChange}
                      disabled={!edit}
                    />
                    {profileForm.touched.street && <FormHelperText error>{profileForm.errors.street}</FormHelperText>}
                  </FormControl>
                ) : displayField("Street", profileForm.values.street)}
              </Grid>
              <Grid size={{ xs: 12, sm: edit ? 6 : 4 }}>
                {edit ? (
                  <FormControl variant="standard" fullWidth >
                    <InputLabel shrink htmlFor="postal_code" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                      Postal Code
                    </InputLabel>
                    <BootstrapInput
                      id="postal_code"
                      name="postal_code"
                      placeholder="Postal Code"
                      value={profileForm.values.postal_code}
                      onChange={profileForm.handleChange}
                      disabled={!edit}
                    />
                    {profileForm.touched.postal_code && <FormHelperText error>{profileForm.errors.postal_code}</FormHelperText>}
                  </FormControl>
                ) : displayField("Postal Code", profileForm.values.postal_code)}
              </Grid>
              {
                role == 'company' && (
                  <>
                    <Grid size={{ xs: 12, sm: edit ? 6 : 4 }}>
                      <div style={{ display: 'flex', flexDirection: 'row', gap: '5px' }}>
                        <input
                          type="checkbox"
                          name="isEnrollToken"
                          id="isEnrollToken"
                          disabled
                          className="form-check-input"
                          checked={profileForm.values.isEnrollToken}
                          onChange={(e) => profileForm.setFieldValue("isEnrollToken", e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="isEnrollToken">
                          Pay subscription
                        </label>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'row', gap: '5px' }}>
                        <input
                          type="checkbox"
                          name="isArmed"
                          id="isArmed"
                          disabled
                          className="form-check-input"
                          checked={profileForm.values.isArmed}
                          onChange={(e) => profileForm.setFieldValue("isArmed", e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="isArmed">
                          Security
                        </label>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'row', gap: '5px' }}>
                        <input
                          type="checkbox"
                          name="isPaymentToken"
                          disabled
                          id="isPaymentToken"
                          className="form-check-input"
                          checked={profileForm.values.isPaymentToken}
                          onChange={(e) => profileForm.setFieldValue("isPaymentToken", e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="isPaymentToken">
                          Is All Sos payment
                        </label>
                      </div>
                    </Grid>
                    <Grid size={{ xs: 12, sm: edit ? 6 : 4 }}>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {GrpservicesList
                          .flatMap(group => group.options)
                          .filter(option => profileForm.values.services?.includes(option.value))
                          .map(option => (
                            <Chip key={option.value} label={option.label} />
                          ))}
                      </Box>
                    </Grid>
                  </>
                )
              }

              {/* images */}
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
                        cursor: edit ? 'pointer' : 'not-allowed',
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
                        disabled={!edit}

                      />
                      {profileForm.values.selfieImage instanceof File ? (
                        <img
                          src={URL.createObjectURL(profileForm.values.selfieImage)}
                          alt="Selfie Preview"
                          style={{ height: 200, width: '100%', objectFit: 'contain', marginBottom: 8, cursor: 'pointer' }}
                          onClick={() => handleImageClick(profileForm.values.selfieImage, 'Selfie Image')}
                        />
                      ) : profileForm.values.selfieImage ? (
                        <img
                          src={profileForm.values.selfieImage}
                          alt="Selfie"
                          style={{ height: 200, width: '100%', objectFit: 'contain', marginBottom: 8, cursor: 'pointer' }}
                          onClick={() => handleImageClick(profileForm.values.selfieImage, 'Selfie Image')}
                        />
                      ) : (<><img src={GrayPlus} alt="gray plus" />
                        <Typography sx={{ color: '#B0B0B0', fontWeight: 550, mt: 1 }}>Upload</Typography></>
                      )}
                    </Box>
                    {profileForm.touched.selfieImage && profileForm.errors.selfieImage && (
                      <FormHelperText error>{profileForm.errors.selfieImage}</FormHelperText>
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
                        cursor: edit ? 'pointer' : 'not-allowed',
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
                        disabled={!edit}
                        onChange={e => profileForm.setFieldValue('fullImage', e.currentTarget.files[0])}
                      />
                      {profileForm.values.fullImage instanceof File ? (
                        <img
                          src={URL.createObjectURL(profileForm.values.fullImage)}
                          alt="Full Preview"
                          style={{ height: 200, width: '100%', objectFit: 'contain', marginBottom: 8, cursor: 'pointer' }}
                          onClick={() => handleImageClick(profileForm.values.fullImage, 'Full Image')}
                        />
                      ) : profileForm.values.fullImage ? (
                        <img
                          src={profileForm.values.fullImage}
                          alt="Full Image"
                          style={{ height: 200, width: '100%', objectFit: 'contain', marginBottom: 8, cursor: 'pointer' }}
                          onClick={() => handleImageClick(profileForm.values.fullImage, 'Full Image')}
                        />
                      ) : (<><img src={GrayPlus} alt="gray plus" />
                        <Typography sx={{ color: '#B0B0B0', fontWeight: 550, mt: 1 }}>Upload</Typography></>
                      )
                      }

                    </Box>
                    {profileForm.touched.fullImage && profileForm.errors.fullImage && (
                      <FormHelperText error>{profileForm.errors.fullImage}</FormHelperText>
                    )}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4, md: 2.5 }}>
                    <label style={{ marginBottom: '10px', display: 'block', fontWeight: 500 }}>Verification Selfie Image</label>
                    <Box
                      sx={{
                        border: '2px dashed #E0E3E7',
                        borderRadius: '12px',
                        minHeight: 180,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: edit ? 'pointer' : 'not-allowed',
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
                        disabled={!edit}
                        onChange={e => {
                          profileForm.setFieldValue('verificationSelfieImage', e.currentTarget.files[0])
                          setPreviewImage({
                            open: false,
                            src: '',
                            label: ''
                          });

                        }}
                      />
                      {profileForm.values.verificationSelfieImage instanceof File ? (
                        <img
                          src={URL.createObjectURL(profileForm.values.verificationSelfieImage)}
                          alt="Verification Selfie Image"
                          style={{ height: 200, width: '100%', objectFit: 'contain', marginBottom: 8, cursor: 'pointer' }}
                          onClick={() => handleImageClick(profileForm.values.verificationSelfieImage, 'Verification Selfie Image')}
                        />
                      ) : profileForm.values.verificationSelfieImage ? (
                        <img
                          src={profileForm.values.verificationSelfieImage}
                          alt="Verification Selfie Image"
                          style={{ height: 200, width: '100%', objectFit: 'contain', marginBottom: 8, cursor: 'pointer' }}
                          onClick={() => handleImageClick(profileForm.values.verificationSelfieImage, 'Verification Selfie Image')}
                        />
                      ) : (<><img src={GrayPlus} alt="gray plus" />
                        <Typography sx={{ color: '#B0B0B0', fontWeight: 550, mt: 1 }}>Upload</Typography></>
                      )
                      }

                    </Box>
                    {profileForm.touched.verificationSelfieImage && profileForm.errors.verificationSelfieImage && (
                      <FormHelperText error>{profileForm.errors.verificationSelfieImage}</FormHelperText>
                    )}
                  </Grid>
                </Grid>
              </Grid>
              {/* 2FA Toggle */}
              <Grid item xs={12} sx={{ mt: 4, mb: 2 }}>
                <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Two-Factor Authentication (2FA)
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Add an extra layer of security to your account
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center">
                      {is2FALoading && <CircularProgress size={24} sx={{ mr: 2 }} />}
                      <Switch
                        checked={is2FAEnabled}
                        onChange={handle2FAToggle}
                        disabled={is2FALoading}
                        color="primary"
                      />
                    </Box>
                  </Box>
                </Paper>
              </Grid>

              {/* 2FA Setup Dialog */}
              <Dialog open={showQRCode} onClose={handleQRCodeClose} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  Set Up Two-Factor Authentication
                  <IconButton
                    aria-label="close"
                    onClick={handleQRCodeClose}
                    sx={{
                      color: (theme) => theme.palette.grey[500],
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                </DialogTitle>
                <DialogContent sx={{ textAlign: 'center' }}>
                  <Typography variant="body1" paragraph>
                    Scan the QR code below with your authenticator app:
                  </Typography>

                  {qrCodeData?.qrCodeDataUrl ? (
                    <Box sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      my: 2,
                      p: 2,
                      bgcolor: 'white',
                      borderRadius: 1,
                      border: '1px solid #e0e0e0'
                    }}>
                      <img
                        src={qrCodeData.qrCodeDataUrl}
                        alt="2FA QR Code"
                        style={{
                          width: 200,
                          height: 200,
                          objectFit: 'contain'
                        }}
                      />
                    </Box>
                  ) : (
                    <Box>Generating QR code...</Box>
                  )}

                  {qrCodeData?.secret && (
                    <Box sx={{ mt: 2, mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                        {qrCodeData.secret}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Or enter this code manually: <strong>{qrCodeData.secret}</strong>
                      </Typography>
                    </Box>
                  )}

                  <Typography variant="body2" color="text.secondary">
                    After scanning, you&apos;ll be asked to enter a verification code from your authenticator app.
                  </Typography>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                  <Button
                    variant="contained"
                    onClick={() => {
                      setShowQRCode(false);
                      setIs2FAEnabled(true);
                      toast.success('Two-factor authentication has been enabled', toastOption);
                    }}
                  >
                    I&apos;ve set up my authenticator app
                  </Button>
                </DialogActions>
              </Dialog>

              {/* Close Confirmation Dialog */}
              <Dialog open={showCloseConfirmation} onClose={() => setShowCloseConfirmation(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ display: 'flex', flexDirection: 'row', gap: 1.5 }}>
                  <img src={DeleteIcon} alt="DeleteIcon" />
                  Confirm Close
                </DialogTitle>
                <DialogContent>
                  <Typography>Are you sure you want to close without completing 2FA setup?</Typography>
                </DialogContent>
                <DialogActions>
                  <Button sx={{ color: 'black', border: '1px solid rgb(175, 179, 189)' }} variant="outlined" onClick={() => handleCloseConfirmation(false)}>
                    No
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleCloseConfirmation(true)}
                    sx={{
                      backgroundColor: '#EB5757',
                    }}
                  >
                    Yes
                  </Button>
                </DialogActions>
              </Dialog>

              {/* save /edit button */}
              <Grid size={12}>
                <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
                  {edit ? (
                    <>
                      <Button
                        variant="contained"
                        sx={{ width: 130, height: 48, borderRadius: '10px', backgroundColor: 'var(--Blue)' }}
                        onClick={() => {
                          profileForm.handleSubmit()
                        }}
                      >
                        Save
                      </Button>
                      <Button
                        variant="outlined"
                        sx={{ width: 130, height: 48, borderRadius: '10px' }}
                        onClick={() => {
                          setEdit(false);
                        }}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    role !== 'company' && (
                      <Button
                        variant="contained"
                        sx={{ width: 130, height: 48, borderRadius: '10px', backgroundColor: 'var(--Blue)' }}
                        onClick={() => setEdit(true)}
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

      </Box>
    </>
  );
};

export default Profile;

const super_admin = {
  first_name: "",
  last_name: "",
  email: "",
  street: "",
  province: "",
  city: "",
  suburb: "",
  postal_code: "",
  country: "",
  role: "",
  mobile_no: "",
  mobile_no_country_code: "",
};
const company = {
  services: [],
  isEnrollToken: false,
  isArmed: false,
  isPaymentToken: false,
  contact_name: "",
  email: "",
  street: "",
  province: "",
  city: "",
  suburb: "",
  postal_code: "",
  country: "",
  role: "",
  mobile_no: "",
  mobile_no_country_code: "",
}; 