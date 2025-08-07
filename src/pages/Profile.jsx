import {
  Box, Typography, Button, Paper, Grid, FormControl, InputLabel, FormHelperText,
} from "@mui/material";
import { useFormik } from "formik";
import {
  profileValidation_c,
  profileValidation_s,
} from "../common/FormValidation";
import { BootstrapInput } from "../common/BootstrapInput";
import CustomSelect from "../common/Custom/CustomSelect";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetUser, useUpdateUser, useGetCountryList, useGetProvinceList } from "../API Calls/API";
import { toast } from "react-toastify";
import { toastOption } from "../common/ToastOptions";
import Loader from "../common/Loader";
import PhoneInput from "react-phone-input-2";
import GrayPlus from '../assets/images/GrayPlus.svg'
const Profile = () => {
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


      Object.keys(values).forEach(key => {
        if (key !== 'selfieImage' && key !== 'fullImage') {
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
          selfieImage: userinfo.data?.data.user?.selfieImage || "",
          fullImage: userinfo.data?.data.user?.fullImage || "",
          contact_name: userinfo.data?.data.user?.contact_name || "",
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
      {/* <div className="row">
        <div className="col-md-12">
          <div className="theme-table">
            <div className="tab-heading">
              <h3>Profile</h3>
            </div>
            <form>
              <div className="row">
                {role === "super_admin" ? (
                  <>
                    <div className="col-md-6">
                      <input
                        type="text"
                        name="first_name"
                        placeholder="First Name"
                        className="form-control"
                        value={profileForm.values.first_name}
                        onChange={profileForm.handleChange}
                        disabled={!edit}
                      />
                      {profileForm.touched.first_name && (
                        <p className="err">{profileForm.errors.first_name}</p>
                      )}
                    </div>
                    <div className="col-md-6">
                      <input
                        type="text"
                        name="last_name"
                        placeholder="Last Name"
                        className="form-control"
                        value={profileForm.values.last_name}
                        onChange={profileForm.handleChange}
                        disabled={!edit}
                      />
                      {profileForm.touched.last_name && (
                        <p className="err">{profileForm.errors.last_name}</p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="col-md-6">
                    <input
                      type="text"
                      name="contact_name"
                      placeholder="Username"
                      className="form-control"
                      value={profileForm.values.contact_name}
                      onChange={profileForm.handleChange}
                      disabled={!edit}
                    />
                    {profileForm.touched.contact_name && (
                      <p className="err">{profileForm.errors.contact_name}</p>
                    )}
                  </div>
                )}
                <div className="col-md-6">
                  <input
                    type="text"
                    name="email"
                    placeholder="Email"
                    className="form-control"
                    value={profileForm.values.email}
                    onChange={profileForm.handleChange}
                    disabled={!edit}
                  />
                  {profileForm.touched.email && (
                    <p className="err">{profileForm.errors.email}</p>
                  )}
                </div>
                <div className="col-md-6">
                  <PhoneInput
                    country={"za"}
                    disabled={!edit}
                    value={`${profileForm.values.mobile_no_country_code ?? ''}${profileForm.values.mobile_no ?? ''}`}
                    onChange={(phone, countryData) => {
                      const withoutCountryCode = phone.startsWith(countryData.dialCode)
                        ? phone.slice(countryData.dialCode.length).trim()
                        : phone;

                      profileForm.setFieldValue("mobile_no", withoutCountryCode);
                      profileForm.setFieldValue("mobile_no_country_code", `+${countryData.dialCode}`);
                    }}
                    inputClass="form-control"
                  />
                  {profileForm.touched.mobile_no && (
                    <p className="err">{profileForm.errors.mobile_no}</p>
                  )}
                </div>
                <div className="col-md-6">
                  <input
                    type="text"
                    name="street"
                    placeholder="Street"
                    className="form-control"
                    value={profileForm.values.street}
                    onChange={profileForm.handleChange}
                    disabled={!edit}
                  />
                  {profileForm.touched.street && (
                    <p className="err">{profileForm.errors.street}</p>
                  )}
                </div>
                <div className="col-md-6">
                  <select
                    name="country"
                    className="form-control"
                    value={profileForm.values.country}
                    onChange={profileForm.handleChange}
                    disabled={!edit}
                  >
                    <option value="" hidden>Country</option>
                    {countrylist.data?.data.data?.map((country) => (
                      <option key={country._id} value={country._id}>
                        {country.country_name}
                      </option>
                    ))}
                  </select>
                  {profileForm.touched.country && (
                    <p className="err">{profileForm.errors.country}</p>
                  )}
                </div>
                <div className="col-md-6">
                  <select
                    name="province"
                    className="form-control"
                    value={profileForm.values.province}
                    disabled={!profileForm.values.country || !edit}
                    onChange={profileForm.handleChange}
                  >
                    <option value="" hidden>Province</option>
                    {provincelist.data?.data.data?.map((province) => (
                      <option key={province._id} value={province._id}>
                        {province.province_name}
                      </option>
                    ))}
                  </select>
                  {profileForm.touched.province && (
                    <p className="err">{profileForm.errors.province}</p>
                  )}
                </div>
                <div className="col-md-6">
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    className="form-control"
                    value={profileForm.values.city}
                    onChange={profileForm.handleChange}
                    disabled={!edit}
                  />
                  {profileForm.touched.city && (
                    <p className="err">{profileForm.errors.city}</p>
                  )}
                </div>
                <div className="col-md-6">
                  <input
                    type="text"
                    name="suburb"
                    placeholder="Suburb"
                    className="form-control"
                    value={profileForm.values.suburb}
                    onChange={profileForm.handleChange}
                    disabled={!edit}
                  />
                  {profileForm.touched.suburb && (
                    <p className="err">{profileForm.errors.suburb}</p>
                  )}
                </div>

                <div className="col-md-6">
                  <input
                    type="text"
                    name="postal_code"
                    placeholder="Postal Code"
                    className="form-control"
                    value={profileForm.values.postal_code}
                    onChange={profileForm.handleChange}
                    disabled={!edit}
                  />
                  {profileForm.touched.postal_code && (
                    <p className="err">{profileForm.errors.postal_code}</p>
                  )}
                </div>
                {
                  profileForm.values.role == 'super_admin' ? "" : (
                    <div className="col-md-6"></div>
                  )
                }
                <div className="col-md-6">
                  <div className="row">
                    <div className="col-md-6">
                      <label>Selfie Image</label>

                      {profileForm.values.selfieImage instanceof File ? (
                        <div className="form-control mt-2 img-preview-container">
                          <img
                            src={URL.createObjectURL(profileForm.values.selfieImage)}
                            alt="Selfie Preview"
                            className="img-preview"
                            width="100"
                            onLoad={(e) => URL.revokeObjectURL(e.target.src)}
                          />
                        </div>
                      ) : (
                        userinfo.data?.data.user?.selfieImage && (
                          <div className="form-control mt-2 img-preview-container">
                            <img
                              src={userinfo.data?.data.user?.selfieImage}
                              alt="Selfie Image"
                              className="img-preview"
                              width="100"
                            />
                          </div>
                        )
                      )}

                      <div className="custom-file-input">
                        <input
                          type="file"
                          id="selfieImage"
                          accept="image/*"
                          disabled={!edit}
                          onChange={(event) => {
                            const file = event.currentTarget.files[0];
                            profileForm.setFieldValue("selfieImage", file);
                          }}
                        />
                        <label htmlFor="selfieImage">
                          Choose Selfie Image
                        </label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label>Full Image</label>

                      {profileForm.values.fullImage instanceof File ? (
                        <div className="form-control mt-2 img-preview-container">
                          <img
                            src={URL.createObjectURL(profileForm.values.fullImage)}
                            alt="full Image"
                            className="img-preview"
                            width="100"
                            onLoad={(e) => URL.revokeObjectURL(e.target.src)}
                          />
                        </div>
                      ) : (
                        userinfo.data?.data.user?.fullImage && (
                          <div className="form-control mt-2 img-preview-container">
                            <img
                              src={userinfo.data?.data.user?.fullImage}
                              alt="full Image"
                              className="img-preview"
                              width="100"
                            />
                          </div>
                        )
                      )}

                      <div className="custom-file-input">
                        <input
                          type="file"
                          id="fullImage"
                          accept="image/*"
                          disabled={!edit}
                          onChange={(event) => {
                            const file = event.currentTarget.files[0];

                            profileForm.setFieldValue("fullImage", file);
                          }}
                        />
                        <label htmlFor="fullImage">
                          Choose Full Image
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
        <div className="col-md-12 text-end">
          <div className="saveform">
            {edit ? (
              <button
                onClick={profileForm.handleSubmit}
                type="submit"
                className="btn btn-dark"
              >
                {isPending ? <Loader color="white" /> : "Save"}
              </button>
            ) : (
              <button onClick={() => setedit(true)} className="btn btn-dark">
                Edit
              </button>
            )}
          </div>
        </div>
      </div> */}
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










// import { useFormik } from "formik";
// import {
//   profileValidation_c,
//   profileValidation_s,
// } from "../common/FormValidation";
// import { useEffect, useState } from "react";
// import { useQueryClient } from "@tanstack/react-query";
// import { useGetUser, useUpdateUser } from "../API Calls/API";
// import { toast } from "react-toastify";
// import { toastOption } from "../common/ToastOptions";
// import Loader from "../common/Loader";
// import PhoneInput from "react-phone-input-2";

// const Profile = () => {
//   const [role] = useState(localStorage.getItem("role"));
//   const [edit, setedit] = useState(false);
//   const client = useQueryClient();

//   const onSuccess = () => {
//     toast.success("Profile Update Successfully.");
//     client.invalidateQueries("userinfo");
//   }
//   const onError = (error) => {
//     toast.error(error.response.data.message || "Something went Wrong", toastOption)
//   }

//   const { mutate, isPending } = useUpdateUser(onSuccess, onError)
//   const userinfo = useGetUser(localStorage.getItem("userID"))

//   const profileForm = useFormik({
//     initialValues: role === "super_admin" ? super_admin : company,
//     validationSchema:
//       role === "super_admin" ? profileValidation_s : profileValidation_c,
//     onSubmit: (values) => {
//       setedit(false);
//       mutate({ id: localStorage.getItem("userID"), data: values });
//     },
//   });

//   useEffect(() => {
//     profileForm.setValues(
//       role === "super_admin"
//         ? {
//           first_name: userinfo.data?.data.user?.first_name || "",
//           last_name: userinfo.data?.data.user?.last_name || "",
//           email: userinfo.data?.data.user?.email || "",
//           address: userinfo.data?.data.user?.address || "",
//           role: userinfo.data?.data.user?.role || "",
//           mobile_no: userinfo.data?.data.user?.mobile_no || "",
//           mobile_no_country_code: userinfo.data?.data.user?.mobile_no_country_code || "",
//         }
//         : {
//           contact_name: userinfo.data?.data.user?.contact_name || "",
//           email: userinfo.data?.data.user?.email || "",
//           address: userinfo.data?.data.user?.address || "",
//           role: userinfo.data?.data.user?.role || "",
//           mobile_no: userinfo.data?.data.user?.mobile_no || "",
//           mobile_no_country_code: userinfo.data?.data.user?.mobile_no_country_code || "",
//         }
//     );
//   }, [userinfo.data]);

//   return (
//     <div className="container-fluid">
//       <div className="row">
//         <div className="col-md-12">
//           <div className="theme-table">
//             <div className="tab-heading">
//               <h3>Profile </h3>
//             </div>
//             <form>
//               <div className="row">
//                 {role === "super_admin" ? (
//                   <>
//                     <div className="col-md-6">
//                       <input
//                         type="text"
//                         name="first_name"
//                         placeholder="First Name"
//                         className="form-control"
//                         value={profileForm.values.first_name}
//                         onChange={profileForm.handleChange}
//                         disabled={!edit}
//                       />
//                       {profileForm.touched.first_name && (
//                         <p className="err">{profileForm.errors.first_name}</p>
//                       )}
//                     </div>
//                     <div className="col-md-6">
//                       <input
//                         type="text"
//                         name="last_name"
//                         placeholder="Last Name"
//                         className="form-control"
//                         value={profileForm.values.last_name}
//                         onChange={profileForm.handleChange}
//                         disabled={!edit}
//                       />
//                       {profileForm.touched.last_name && (
//                         <p className="err">{profileForm.errors.last_name}</p>
//                       )}
//                     </div>
//                   </>
//                 ) : (
//                   <div className="col-md-6">
//                     <input
//                       type="text"
//                       name="contact_name"
//                       placeholder="Username"
//                       className="form-control"
//                       value={profileForm.values.contact_name}
//                       onChange={profileForm.handleChange}
//                       disabled={!edit}
//                     />
//                     {profileForm.touched.contact_name && (
//                       <p className="err">{profileForm.errors.contact_name}</p>
//                     )}
//                   </div>
//                 )}
//                 <div className="col-md-6">
//                   <input
//                     type="text"
//                     name="email"
//                     placeholder="Email"
//                     className="form-control"
//                     value={profileForm.values.email}
//                     onChange={profileForm.handleChange}
//                     disabled={!edit}
//                   />
//                   {profileForm.touched.email && (
//                     <p className="err">{profileForm.errors.email}</p>
//                   )}
//                 </div>
//                 <div className="col-md-6">
//                   <PhoneInput
//                     country={"za"}
//                     disabled={!edit}
//                     value={`${profileForm.values.mobile_no_country_code ?? ''}${profileForm.values.mobile_no ?? ''}`}
//                     onChange={(phone, countryData) => {
//                       const withoutCountryCode = phone.startsWith(countryData.dialCode)
//                         ? phone.slice(countryData.dialCode.length).trim()
//                         : phone;

//                       profileForm.setFieldValue("mobile_no", withoutCountryCode);
//                       profileForm.setFieldValue("mobile_no_country_code", `+${countryData.dialCode}`);
//                     }}
//                     inputClass="form-control"
//                   />
//                   {profileForm.touched.mobile_no && (
//                     <p className="err">{profileForm.errors.mobile_no}</p>
//                   )}
//                 </div>
//                 <div
//                   className={role === "super_admin" ? "col-md-12" : "col-md-6"}
//                 >
//                   <input
//                     type="text"
//                     name="address"
//                     placeholder="Address"
//                     className="form-control"
//                     value={profileForm.values.address}
//                     onChange={profileForm.handleChange}
//                     disabled={!edit}
//                   />
//                   {profileForm.touched.address && (
//                     <p className="err">{profileForm.errors.address}</p>
//                   )}
//                 </div>
//               </div>
//             </form>
//           </div>
//         </div>
//         <div className="col-md-12 text-end">
//           <div className="saveform">
//             {edit ? (
//               <button
//                 onClick={profileForm.handleSubmit}
//                 type="submit"
//                 className="btn btn-dark"
//               >
//                 {isPending ? <Loader color="white" /> : "Save"}
//               </button>
//             ) : (
//               <button onClick={() => setedit(true)} className="btn btn-dark">
//                 Edit
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Profile;

// const super_admin = {
//   first_name: "",
//   last_name: "",
//   email: "",
//   address: "",
//   role: "",
//   mobile_no: "",
//   mobile_no_country_code: ""
// };
// const company = {
//   contact_name: "",
//   email: "",
//   address: "",
//   role: "",
//   mobile_no: "",
//   mobile_no_country_code: ""
// };
