import { useEffect, useLayoutEffect, useState } from 'react'
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineDown, AiOutlineUp } from "react-icons/ai";
import { useFormik } from "formik";
import { companyValidation } from "../common/FormValidation";
import { useQueryClient } from "@tanstack/react-query";
import { useGetCountryList, useGetProvinceList, useGetServicesList, useRegister, useGetSecurityList, useCreateNotificationType } from "../API Calls/API";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import { toast } from "react-toastify";
import { toastOption } from "../common/ToastOptions";
import CreatableSelect from 'react-select/creatable';
import Loader from "../common/Loader";
import PhoneInput from "react-phone-input-2";
import '../css/company.css'
import checkedboxIcon from '../assets/images/checkboxIcon.svg'
import uncheckedIcon from '../assets/images/UnChecked.svg'
import { Box, Button, Typography, FormControlLabel, Checkbox, InputLabel, FormControl, FormHelperText, IconButton, Grid, Paper } from "@mui/material";
import GrayPlus from '../assets/images/GrayPlus.svg'
import CustomSelect from "../common/CustomSelect";
import { BootstrapInput } from "../common/BootstrapInput";
import { components } from 'react-select';


const AddCompany = () => {
	const client = useQueryClient();
	const nav = useNavigate();
	const [showPassword, setShowPassword] = useState(false);


	const companyForm = useFormik({
		initialValues: {
			email: "",
			password: "",
			company_name: "",
			mobile_no: "",
			mobile_no_country_code: "+27",
			street: "",
			province: "",
			city: "",
			suburb: "",
			postal_code: "",
			country: "",
			id_no: "",
			company_bio: "",
			contact_name: "",
			role: "company",
			type: "email_pass",
			isArmed: false,
			isPaymentToken: false,
			selfieImage: "",
			fullImage: "",
			services: [],
			isEnrollToken: false,
			securityCompany: [],
		},
		validationSchema: companyValidation,
		onSubmit: (values) => {
			const formData = new FormData();
			Object.keys(values).forEach(key => {
				if (key !== "selfieImage" && key !== "fullImage" && key !== "services") {
					if (key === "securityCompany") {
						values[key]?.forEach(id => {
							formData.append("securityCompany[]", id);
						});
					} else {
						formData.append(key, values[key]);
					}
				}
			});
			if (values.selfieImage) {
				formData.append("selfieImage", values.selfieImage);
			}
			if (values.services && values.services.length > 0) {
				values.services.forEach((serviceId) => {
					if (serviceId) {
						formData.append("companyService[]", serviceId);
					}
				});
			}

			if (values.fullImage) {
				formData.append("fullImage", values.fullImage);
			}
			newcompany.mutate(formData);
		},
	});

	const onSuccess = () => {
		toast.success("Company Added Successfully.");
		companyForm.resetForm();
		client.invalidateQueries("company list");
		nav("/home/total-companies");
	}
	const onError = (error) => {
		toast.error(error.response.data.message || "Something went Wrong", toastOption)
	}

	const [servicesList, setServicesList] = useState([])
	const newcompany = useRegister(onSuccess, onError)
	const provincelist = useGetProvinceList(companyForm.values.country)
	const countrylist = useGetCountryList()
	const serviceslist = useGetServicesList()
	const securityList = useGetSecurityList()
	const createService = useCreateNotificationType();
	const securityCompanyOptions = securityList?.data?.data?.company?.map((item) => ({
		label: item.company_name,
		value: item._id,
	})) || [];

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

			setServicesList(groupedOptions);
		}
	}, [serviceslist]);

	useEffect(() => {
		if (companyForm.values.isArmed === true || companyForm.values.isArmed === "true") {
			companyForm.setFieldValue("securityCompany", []);
		}
	}, [companyForm.values.isArmed]);

	const handleCancel = () => {
		nav("/home/total-companies");
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
				{/* company Info Section */}
				<Paper elevation={0} sx={{ p: 3, borderRadius: '10px' }}>
					<Grid container spacing={3}>
						<Grid size={12}>
							<Typography variant="h6" gutterBottom fontWeight={600}>
								Company Information
							</Typography>
						</Grid>
						<Grid size={{ xs: 12, sm: 6 }}>
							<FormControl variant="standard" fullWidth>
								<InputLabel
									shrink
									htmlFor="company_name"
									sx={{
										fontSize: '1.3rem',
										color: 'rgba(0, 0, 0, 0.8)',
										'&.Mui-focused': { color: 'black' }
									}}
								>
									Company Name
								</InputLabel>
								<BootstrapInput
									id="company_name"
									name="company_name"
									placeholder="Company Name"
									value={companyForm.values.company_name}
									onChange={companyForm.handleChange}
								/>
								{companyForm.touched.company_name && (
									<div style={{ color: 'red', fontSize: 12 }}>
										{companyForm.errors.company_name}
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
							<FormControl variant="standard" fullWidth >
								<InputLabel
									shrink
									htmlFor="company_bio"
									sx={{
										fontSize: '1.3rem',
										color: 'rgba(0, 0, 0, 0.8)',
										'&.Mui-focused': { color: 'black' }
									}}
								>
									Company Reg No.
								</InputLabel>
								<BootstrapInput
									id="company_bio"
									name="company_bio"
									placeholder="Company Reg No."
									value={companyForm.values.company_bio}
									onChange={companyForm.handleChange}
								/>
								{companyForm.touched.company_bio && (
									<div style={{ color: 'red', fontSize: 12 }}>
										{companyForm.errors.company_bio}
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
						<Grid size={{ xs: 12, sm: 6 }}>
							<FormControl variant="standard" fullWidth>
								<label style={{ marginBottom: 6 }}>Select or Create Services</label>
								<CreatableSelect
									isMulti
									name="services"
									options={servicesList}
									classNamePrefix="select"
									placeholder="Select or Create Services"
									className="add-company-services"
									components={{ DropdownIndicator }}
									value={servicesList
										.flatMap((group) => group.options)
										.filter((option) => companyForm.values.services?.includes(option.value))}
									onChange={(selectedOptions) => {
										const selectedValues = selectedOptions?.map((option) => option.value) || [];
										companyForm.setFieldValue("services", selectedValues);
									}}
									isValidNewOption={(inputValue, selectValue, selectOptions) => {
										const existingOptions = servicesList.flatMap(group => group.options);
										return (
											inputValue.trim().length > 0 &&
											!existingOptions.some(
												(option) => option.label.toLowerCase() === inputValue.trim().toLowerCase()
											)
										);
									}}
									onCreateOption={async (inputValue) => {
										try {
											const res = await createService.mutateAsync({
												type: inputValue,
												isService: true
											});

											if (res?.data?._id) {
												const newOption = {
													label: res.data.type,
													value: res.data._id,
												};

												setServicesList(prev => {
													const updated = [...prev];
													updated[0].options.push(newOption);
													return updated;
												});

												companyForm.setFieldValue("services", [
													...(companyForm.values.services || []),
													res.data._id
												]);
											}
										} catch (err) {
											console.error("Error creating service", err);
										}
									}}
									styles={{
										valueContainer: (base) => ({
											...base,
											cursor: 'pointer',
											flexWrap: 'wrap',
											maxHeight: '42px',
											overflowY: 'auto',
										}),
										multiValue: (base) => ({
											...base,
											margin: '2px',
											borderRadius: '8px',
											border: '1px solid var(--icon-gray)',
										}),
										multiValueLabel: (base) => ({
											...base,
											color: 'black',
											backgroundColor: 'white',
											borderBottomLeftRadius: '8px',
											borderTopLeftRadius: '8px',
											fontWeight: 500,
											fontSize: 13,
										}),
										multiValueRemove: (base) => ({
											...base,
											color: 'black',
											backgroundColor: 'white',
											borderBottomRightRadius: '8px',
											borderTopRightRadius: '8px',
											backgroundColor: 'white',
											':hover': {
												backgroundColor: 'white',
												color: 'black',
											},
										}),
									}}
								/>
								{companyForm.touched.services && companyForm.errors.services && (
									<p className="err">{companyForm.errors.services}</p>
								)}
							</FormControl>
						</Grid>
						<Grid size={{ xs: 12, sm: 6 }}>
							<FormControl variant="standard" fullWidth>
								<InputLabel shrink htmlFor="id_no" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
									ID No
								</InputLabel>
								<BootstrapInput
									id="id_no"
									name="id_no"
									placeholder="Enter ID No."
									value={companyForm.values.id_no}
									onChange={companyForm.handleChange}
								/>
								{companyForm.touched.id_no && <div style={{ color: 'red', fontSize: 12 }}>{companyForm.errors.id_no}</div>}
							</FormControl>
						</Grid>
						<Grid size={{ xs: 12, md: 6 }}>
							<FormControl variant="standard" fullWidth>
								<label style={{ marginBottom: 6 }}>Security Companies</label>
								<Select
									isMulti
									name="securityCompany"
									options={securityCompanyOptions}
									classNamePrefix="select"
									placeholder="Security Companies"
									components={{ DropdownIndicator }}
									isDisabled={companyForm.values.isArmed === true || companyForm.values.isArmed === "true"}
									className="add-company-services"
									value={securityCompanyOptions.filter(option =>
										companyForm.values.securityCompany?.includes(option.value)
									)}
									onChange={(selectedOptions) => {
										const selectedValues = selectedOptions?.map((option) => option.value) || [];
										companyForm.setFieldValue("securityCompany", selectedValues);
									}}
									styles={{
										control: (base, state) => ({
											...base,

											backgroundColor: state.isDisabled ? 'white' : base.backgroundColor,
											opacity: state.isDisabled ? 1 : base.opacity,
											color: 'black',
											cursor: 'pointer',
										}),
										valueContainer: (base) => ({
											...base,
											flexWrap: 'wrap',
											maxHeight: '42px',
											overflowY: 'auto',
										}),
										multiValue: (base) => ({
											...base,
											margin: '2px',
											borderRadius: '8px',
											border: '1px solid var(--icon-gray)',
										}),
										multiValueLabel: (base) => ({
											...base,
											color: 'black',
											backgroundColor: 'white',
											borderBottomLeftRadius: '8px',
											borderTopLeftRadius: '8px',
											fontWeight: 500,
											fontSize: 13,
										}),
										multiValueRemove: (base) => ({
											...base,
											color: 'black',
											backgroundColor: 'white',
											borderBottomRightRadius: '8px',
											borderTopRightRadius: '8px',
											backgroundColor: 'white',
											':hover': {
												backgroundColor: 'white',
												color: 'black',
											},
										}),
									}}
								/>
							</FormControl>
						</Grid>
						<Grid size={{ xs: 12 }}>
							<FormControlLabel
								control={
									<Checkbox
										name="isEnrollToken"
										checked={companyForm.values.isEnrollToken}
										onChange={(e) => companyForm.setFieldValue("isEnrollToken", e.target.checked)}
										icon={<img src={uncheckedIcon} alt='uncheckedIcon' />}
										checkedIcon={<img src={checkedboxIcon} alt='checkIcon' />}

									/>
								}
								label="	Pay subscription"
							/>
							<FormControlLabel
								control={
									<Checkbox
										name="isArmed"
										checked={companyForm.values.isArmed}
										onChange={(e) => companyForm.setFieldValue("isArmed", e.target.checked)}
										icon={<img src={uncheckedIcon} alt='uncheckedIcon' />}
										checkedIcon={<img src={checkedboxIcon} alt='checkIcon' />}

									/>
								}
								label="Security"
							/>
							<FormControlLabel
								control={
									<Checkbox
										name="isPaymentToken"
										checked={companyForm.values.isPaymentToken}
										onChange={(e) => companyForm.setFieldValue("isPaymentToken", e.target.checked)}
										icon={<img src={uncheckedIcon} alt='uncheckedIcon' />}
										checkedIcon={<img src={checkedboxIcon} alt='checkIcon' />}

									/>
								}
								label="	Is All Sos payment"
							/>
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
							<FormControl variant="standard" fullWidth >
								<InputLabel shrink htmlFor="city" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
									City
								</InputLabel>
								<BootstrapInput
									id="city"
									name="city"
									placeholder="City"
									value={companyForm.values.city}
									onChange={companyForm.handleChange}
								/>
								{companyForm.touched.city && <div style={{ color: 'red', fontSize: 12 }}>{companyForm.errors.city}</div>}
							</FormControl>
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

						{/* Actions */}
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

export default AddCompany;
