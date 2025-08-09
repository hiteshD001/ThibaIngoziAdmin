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
import { useQueryClient } from "@tanstack/react-query";
import { useGetUser, useUpdateUser, useGetCountryList, useGetProvinceList, useGetServicesList } from "../API Calls/API";
import { toast } from "react-toastify";
import { toastOption } from "../common/ToastOptions";
import Loader from "../common/Loader";
import PhoneInput from "react-phone-input-2";
import GrayPlus from '../assets/images/GrayPlus.svg'
const Profile = () => {
  const [servicesList, setServicesList] = useState({});
  const [GrpservicesList, setGrpservicesList] = useState([]);
  const [role] = useState(localStorage.getItem("role"));
  const [edit, setedit] = useState(false);
  const client = useQueryClient();

  const onSuccess = () => {
    toast.success("Profile Update Successfully.");
    client.invalidateQueries("userinfo");
  };
  const onError = (error) => {
    toast.error(error.response.data.message || "Something went Wrong", toastOption);
  };

  const { mutate, isPending } = useUpdateUser(onSuccess, onError);
  const userinfo = useGetUser(localStorage.getItem("userID"));

  const profileForm = useFormik({
    initialValues: role === "super_admin" ? super_admin : company,
    validationSchema:
      role === "super_admin" ? profileValidation_s : profileValidation_c,
    onSubmit: (values) => {
      setedit(false);
      const formData = new FormData();


      Object.keys(values).forEach((key) => {
        if (key === "services" && Array.isArray(values.services)) {
          values.services.forEach((id) => formData.append("companyService[]", id));
        } else if (key !== "selfieImage" && key !== "fullImage") {
          formData.append(key, values[key]);
        }
      });

      if (values.selfieImage && values.selfieImage instanceof File) {
        formData.append("selfieImage", values.selfieImage);
      }

      if (values.fullImage && values.fullImage instanceof File) {
        formData.append("fullImage", values.fullImage);
      }

      mutate({ id: localStorage.getItem("userID"), data: formData });
    },
  });

  const countrylist = useGetCountryList();
  const provincelist = useGetProvinceList(profileForm.values.country);

  useEffect(() => {
    profileForm.setValues(
      role === "super_admin"
        ? {
          first_name: userinfo.data?.data.user?.first_name || "",
          last_name: userinfo.data?.data.user?.last_name || "",
          selfieImage: userinfo.data?.data.user?.selfieImage || "",
          fullImage: userinfo.data?.data.user?.fullImage || "",
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
  return (
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
                <FormControl variant="standard" fullWidth >
                  <InputLabel shrink htmlFor="city" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                    City
                  </InputLabel>
                  <BootstrapInput
                    id="city"
                    name="city"
                    placeholder="City"
                    value={profileForm.values.city}
                    onChange={profileForm.handleChange}
                    disabled={!edit}
                  />
                  {profileForm.touched.city && <FormHelperText error>{profileForm.errors.city}</FormHelperText>}
                </FormControl>
              ) : displayField("City", profileForm.values.city)}
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
                      onChange={e => profileForm.setFieldValue('selfieImage', e.currentTarget.files[0])}
                    />
                    {profileForm.values.selfieImage instanceof File ? (
                      <img
                        src={URL.createObjectURL(profileForm.values.selfieImage)}
                        alt="Selfie Preview"
                        style={{ height: 200, width: '100%', objectFit: 'contain', marginBottom: 8 }}
                      />
                    ) : profileForm.values.selfieImage ? (
                      <img
                        src={profileForm.values.selfieImage}
                        alt="Selfie"
                        style={{ height: 200, width: '100%', objectFit: 'contain', marginBottom: 8 }}
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
                        style={{ height: 200, width: '100%', objectFit: 'contain', marginBottom: 8 }}
                      />
                    ) : profileForm.values.fullImage ? (
                      <img
                        src={profileForm.values.fullImage}
                        alt="Full Image"
                        style={{ height: 200, width: '100%', objectFit: 'contain', marginBottom: 8 }}
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
              </Grid>
            </Grid>
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
                        setedit(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="contained"
                    sx={{ width: 130, height: 48, borderRadius: '10px', backgroundColor: 'var(--Blue)' }}
                    onClick={() => setedit(true)}
                  >
                    Edit
                  </Button>
                )}
              </Box>
            </Grid>

          </Grid>
        </form>
      </Paper>

    </Box>
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