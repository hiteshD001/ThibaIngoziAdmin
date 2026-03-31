import { useEffect, useLayoutEffect, useState } from 'react'
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineDown, AiOutlineUp } from "react-icons/ai";
import { useFormik } from "formik";
import { policeUnitValidation } from "../../common/FormValidation";
import { useQueryClient } from "@tanstack/react-query";
import { useGetCountryList, useGetProvinceList, useAddPoliceUnit, useGetCityList } from "../../API Calls/API";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import { toast } from "react-toastify";
import { toastOption } from "../../common/ToastOptions";
import CreatableSelect from 'react-select/creatable';
import Loader from "../../common/Loader";
import PhoneInput from "react-phone-input-2";
import '../../css/company.css'
import checkedboxIcon from '../../assets/images/checkboxIcon.svg'
import uncheckedIcon from '../../assets/images/UnChecked.svg'
import { Box, Button, Typography, FormControlLabel, Checkbox, InputLabel, FormControl, FormHelperText, IconButton, Grid, Paper } from "@mui/material";
import GrayPlus from '../../assets/images/GrayPlus.svg'
import CustomSelect from "../../common/Custom/CustomSelect";
import { BootstrapInput } from "../../common/BootstrapInput";
import { components } from 'react-select';


const AddPoliceUnit = () => {
	const client = useQueryClient();
	const nav = useNavigate();
	const [showPassword, setShowPassword] = useState(false);
	const companyForm = useFormik({
		initialValues: {
			email: "",
			contact_name: "",
			password: "",
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
			const formData = new FormData();
			formData.append("email", values.email)
			formData.append("contact_name", values.contact_name,)
			formData.append("password", values.password)
			formData.append("police_unit_name", values.police_unit_name)
			formData.append("mobile_no", values.mobile_no)
			formData.append("mobile_no_country_code", values.mobile_no_country_code)
			formData.append("street", values.street)
			formData.append("province", values.province)
			formData.append("city", values.city)
			formData.append("suburb", values.suburb)
			formData.append("postal_code", values.postal_code)
			formData.append("country", values.country)
			if (values.selfieImage) {
				formData.append("selfieImage", values.selfieImage);
			}
			if (values.fullImage) {
				formData.append("fullImage", values.fullImage);
			}
			newcompany.mutate(formData);
		},
	});

	const onSuccess = () => {
		toast.success("Police Unit Added Successfully.");
		companyForm.resetForm();
		client.invalidateQueries("Police Unit");
		nav("/home/police-unit");
	}
	const onError = (error) => {
		toast.error(error.response.data.message || "Something went Wrong", toastOption)
	}

	const newcompany = useAddPoliceUnit(onSuccess, onError)
	const provincelist = useGetProvinceList(companyForm.values.country)
	const cityList = useGetCityList(companyForm.values.province)
	const countrylist = useGetCountryList()

	const handleCancel = () => {
		nav("/home/police-unit");
	};
	const DropdownIndicator = (props) => {
		return (
			<components.DropdownIndicator {...props}>
				{props.selectProps.menuIsOpen ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
			</components.DropdownIndicator>
		);
	};
	return (
		<Box p={2}>
			<form onSubmit={companyForm.handleSubmit}>

				<Paper elevation={0} sx={{ p: 3, borderRadius: '10px' }}>
					<Grid container spacing={3}>
						<Grid size={12}>
							<Typography variant="h6" gutterBottom fontWeight={600}>
								Police Unit Information
							</Typography>
						</Grid>
						<Grid size={{ xs: 12, sm: 6 }}>
							<FormControl variant="standard" fullWidth>
								<InputLabel
									shrink
									htmlFor="police_unit_name"
									sx={{
										fontSize: '1.3rem',
										color: 'rgba(0, 0, 0, 0.8)',
										'&.Mui-focused': { color: 'black' }
									}}
								>
									Police Unit Name
								</InputLabel>
								<BootstrapInput
									id="police_unit_name"
									name="police_unit_name"
									placeholder="Police Unit Name"
									value={companyForm.values.police_unit_name}
									onChange={companyForm.handleChange}
								/>
								{companyForm.touched.police_unit_name && (
									<div style={{ color: 'red', fontSize: 12 }}>
										{companyForm.errors.police_unit_name}
									</div>
								)}
							</FormControl>

						</Grid>
						<Grid size={{ xs: 12, sm: 6 }}>
							<FormControl variant="standard" fullWidth>
								<InputLabel
									shrink
									htmlFor="contact_name"
									sx={{
										fontSize: '1.3rem',
										color: 'rgba(0, 0, 0, 0.8)',
										'&.Mui-focused': { color: 'black' }
									}}
								>
									Contact Name
								</InputLabel>
								<BootstrapInput
									id="contact_name"
									name="contact_name"
									placeholder="Contact Name"
									value={companyForm.values.contact_name}
									onChange={companyForm.handleChange}
								/>
								{companyForm.touched.contact_name && (
									<div style={{ color: 'red', fontSize: 12 }}>
										{companyForm.errors.contact_name}
									</div>
								)}
							</FormControl>
						</Grid>
						<Grid size={{ xs: 12, sm: 6 }}>
							<FormControl variant="standard" fullWidth>
								<InputLabel shrink htmlFor="email" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
									Email
								</InputLabel>
								<BootstrapInput
									id="email"
									name="email"
									placeholder="Enter email"
									value={companyForm.values.email}
									onChange={companyForm.handleChange}
								/>
								{companyForm.touched.email && <div style={{ color: 'red', fontSize: 12 }}>{companyForm.errors.email}</div>}
							</FormControl>
						</Grid>
						<Grid size={{ xs: 12, sm: 6 }}>
							<FormControl variant="standard" fullWidth sx={{ position: 'relative' }}>
								<InputLabel shrink htmlFor="password" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
									Password
								</InputLabel>

								<BootstrapInput
									id="password"
									name="password"
									placeholder="Enter Password"
									type={showPassword ? "text" : "password"}
									value={companyForm.values.password}
									onChange={companyForm.handleChange}
									style={{ paddingRight: 0 }}
								/>
								<IconButton
									onClick={() => setShowPassword(!showPassword)}
									style={{
										position: 'absolute',
										right: 8,
										top: '70%',
										transform: 'translateY(-50%)',
										padding: 0,
										zIndex: 2
									}}
									tabIndex={-1}
								>
									{showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
								</IconButton>

								{companyForm.touched.password && <div style={{ color: 'red', fontSize: 12 }}>{companyForm.errors.password}</div>}
							</FormControl>
						</Grid>
						<Grid size={{ xs: 12, sm: 6 }}>
							<FormControl variant="standard" fullWidth>
								<label style={{ marginBottom: 5 }}>Phone Number</label>
								<PhoneInput
									country="za"
									value={companyForm.values.mobile_no || ""}
									onChange={(value, countryData) => {
										companyForm.setFieldValue("mobile_no", value);
										companyForm.setFieldValue("mobile_no_country_code", `+${countryData.dialCode}`);
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
							{companyForm.touched.mobile_no && <FormHelperText error>{companyForm.errors.mobile_no}</FormHelperText>}

						</Grid>
						<Grid size={12}>
							<Grid container gap={4} sx={{ mt: 1 }}>
								<Grid size={{ xs: 12, sm: 2.5 }}>
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
											onChange={e => companyForm.setFieldValue('selfieImage', e.currentTarget.files[0])}
										/>
										{companyForm.values.selfieImage instanceof File ? (
											<img
												src={URL.createObjectURL(companyForm.values.selfieImage)}
												alt="Selfie Preview"
												style={{ height: 200, width: '100%', objectFit: 'contain', marginBottom: 8 }}
											/>
										) : companyForm.values.selfieImage ? (
											<img
												src={companyForm.values.selfieImage}
												alt="Selfie"
												style={{ height: 200, width: '100%', objectFit: 'contain', marginBottom: 8 }}
											/>
										) : (<><img src={GrayPlus} alt="gray plus" />
											<Typography sx={{ color: '#B0B0B0', fontWeight: 550, mt: 1 }}>Upload</Typography></>
										)}

									</Box>
									{companyForm.touched.selfieImage && companyForm.errors.selfieImage && (
										<FormHelperText error>{companyForm.errors.selfieImage}</FormHelperText>
									)}
								</Grid>
								<Grid size={{ xs: 12, sm: 2.5 }}>
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
											onChange={e => companyForm.setFieldValue('fullImage', e.currentTarget.files[0])}
										/>

										{companyForm.values.fullImage instanceof File ? (
											<img
												src={URL.createObjectURL(companyForm.values.fullImage)}
												alt="Full Preview"
												style={{ height: 200, width: '100%', objectFit: 'contain', marginBottom: 8 }}
											/>
										) : companyForm.values.fullImage ? (
											<img
												src={companyForm.values.fullImage}
												alt="Full Image"
												style={{ height: 200, width: '100%', objectFit: 'contain', marginBottom: 8 }}
											/>
										) : (<><img src={GrayPlus} alt="gray plus" />
											<Typography sx={{ color: '#B0B0B0', fontWeight: 550, mt: 1 }}>Upload</Typography></>
										)
										}

									</Box>
									{companyForm.touched.fullImage && companyForm.errors.fullImage && (
										<FormHelperText error>{companyForm.errors.fullImage}</FormHelperText>
									)}
								</Grid>
							</Grid>
						</Grid>
					</Grid>
				</Paper>
				{/* Address Section */}
				<Paper elevation={0} sx={{ p: 3, mt: 3, mb: 3, borderRadius: '10px' }}>
					<Grid container spacing={3}>

						<Grid size={12}>
							<Typography variant="h6" gutterBottom fontWeight={600}>
								Address
							</Typography>
						</Grid>

						<Grid size={{ xs: 12, sm: 6 }}>
							<CustomSelect
								label="Country"
								name="country"
								value={companyForm.values.country}
								onChange={companyForm.handleChange}
								options={countrylist.data?.data.data?.map(country => ({
									value: country._id,
									label: country.country_name
								})) || []}
								error={companyForm.errors.country && companyForm.touched.country}
								helperText={companyForm.errors.country}
							/>
						</Grid>
						<Grid size={{ xs: 12, sm: 6 }}>
							<CustomSelect
								label="Province"
								name="province"
								value={companyForm.values.province}
								onChange={companyForm.handleChange}
								options={provincelist.data?.data.data?.map(province => ({
									value: province._id,
									label: province.province_name
								})) || []}
								error={companyForm.errors.province && companyForm.touched.province}
								helperText={companyForm.touched.province ? companyForm.errors.province : ''}
								disabled={!companyForm.values.country}
							/>
						</Grid>
						<Grid size={{ xs: 12, sm: 6 }}>
							<CustomSelect
								label="City"
								name="city"
								value={companyForm.values.city}
								onChange={companyForm.handleChange}
								options={cityList.data?.data.data?.map(city => ({
									value: city._id,
									label: city.city_name
								})) || []}
								error={companyForm.errors.city && companyForm.touched.city}
								helperText={companyForm.touched.city ? companyForm.errors.city : ''}
								disabled={!companyForm.values.country || !companyForm.values.province}
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
									value={companyForm.values.suburb}
									onChange={companyForm.handleChange}
								/>
								{companyForm.touched.suburb && <div style={{ color: 'red', fontSize: 12 }}>{companyForm.errors.suburb}</div>}
							</FormControl>
						</Grid>
						<Grid size={{ xs: 12, sm: 6 }}>
							<FormControl variant="standard" fullWidth >
								<InputLabel shrink htmlFor="street" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
									Street
								</InputLabel>
								<BootstrapInput
									id="street"
									name="street"
									placeholder="Street"
									value={companyForm.values.street}
									onChange={companyForm.handleChange}
								/>
								{companyForm.touched.street && <div style={{ color: 'red', fontSize: 12 }}>{companyForm.errors.street}</div>}
							</FormControl>
						</Grid>
						<Grid size={{ xs: 12, sm: 6 }}>
							<FormControl variant="standard" fullWidth>
								<InputLabel shrink htmlFor="postal_code" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
									Postal Code
								</InputLabel>
								<BootstrapInput
									id="postal_code"
									name="postal_code"
									placeholder="Enter Postal Code"
									value={companyForm.values.postal_code}
									onChange={companyForm.handleChange}
								/>
								{companyForm.touched.postal_code && <div style={{ color: 'red', fontSize: 12 }}>{companyForm.errors.postal_code}</div>}
							</FormControl>
						</Grid>
						<Grid size={12} sx={{ mt: 1 }}>
							<Box display="flex" justifyContent="flex-end" gap={2}>
								<Button variant="outlined" sx={{ width: 130, height: 48, borderRadius: '10px', color: 'black', borderColor: '#E0E3E7' }} onClick={handleCancel}>
									Cancel
								</Button>
								<Button
									type="submit"
									variant="contained"
									onClick={companyForm.handleSubmit}
									disabled={newcompany.isPending}
									sx={{ width: 130, height: 48, borderRadius: '10px', backgroundColor: 'var(--Blue)' }}
								>
									{newcompany.isPending ? <Loader color="white" /> : "Save"}
								</Button>
							</Box>
						</Grid>
					</Grid>
				</Paper>
			</form>
		</Box>
	);
};

export default AddPoliceUnit;
