import { useEffect, useLayoutEffect, useState } from 'react'
import { useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import { familyMemberValidation } from "../../common/FormValidation";
import { useQueryClient } from "@tanstack/react-query";
import { useGetRelationshipList, useGetMedicalConditionList, useAddFamilyMember, useGetAllergiesList } from "../../API Calls/API";
import { toast } from "react-toastify";
import { toastOption } from "../../common/ToastOptions";
import Loader from "../../common/Loader";
import PhoneInput from "react-phone-input-2";
import '../../css/company.css'
import { Box, Button, Typography, FormControlLabel, Checkbox,Chip,TextField,Autocomplete, InputLabel, FormControl, FormHelperText, IconButton, Grid, Paper } from "@mui/material";
import GrayPlus from '../../assets/images/GrayPlus.svg'
import CustomSelect from "../../common/Custom/CustomSelect";
import { BootstrapInput } from "../../common/BootstrapInput";


const AddFamilyMember = () => {
	const { id } = useParams();
	const client = useQueryClient();
	const nav = useNavigate();
	const companyForm = useFormik({
		initialValues: {
			first_name:"",
			last_name:"",
			relationship:"",
			passport_no:"",
			medical_aid_name:"",
			medical_plan:"",
			member_number:"",
			allergies:[],
			medical_conditions:[],
			emergency_contacts: [{
				name: "",
				relationship: "",
				mobile_number: "",
			},]

		},
		validationSchema: familyMemberValidation,
		onSubmit: (values) => {
			const formData = new FormData();
			formData.append("user_id", id)
			formData.append("first_name", values.first_name)
			formData.append("last_name", values.last_name)
			formData.append("relationship", values.relationship)
			formData.append("passport_no", values.passport_no)
			formData.append("medical_aid_name", values.medical_aid_name)
			formData.append("medical_plan", values.medical_plan)
			formData.append("member_number", values.member_number)
			formData.append("medical_conditions",  JSON.stringify(values.medical_conditions))
			formData.append("allergies", JSON.stringify(values.allergies))
			formData.append("emergency_contacts", JSON.stringify(values.emergency_contacts))
			
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
		toast.success("Family Member Added Successfully.");
		companyForm.resetForm();
		client.invalidateQueries("family members");
		nav(-1);
	}
	const onError = (error) => {
		toast.error(error.response.data.message || "Something went Wrong", toastOption)
	}
	const relationshiplist = useGetRelationshipList()
	const allergiesList = useGetAllergiesList()
	const medicalConditionsList = useGetMedicalConditionList()
	const newcompany = useAddFamilyMember(onSuccess, onError)
	const handleCancel = () => {
		nav(-1);
	};
	
	return (
		<Box p={2}>
			<form onSubmit={companyForm.handleSubmit}>

				<Paper elevation={0} sx={{ p: 3, borderRadius: '10px' }}>
					<Grid container spacing={3}>
						<Grid size={12}>
							<Typography variant="h6" gutterBottom fontWeight={600}>
								Family Member Information
							</Typography>
						</Grid>
						<Grid size={{ xs: 12, sm: 6 }}>
							<FormControl variant="standard" fullWidth>
								<InputLabel
									shrink
									htmlFor="first_name"
									sx={{
										fontSize: '1.3rem',
										color: 'rgba(0, 0, 0, 0.8)',
										'&.Mui-focused': { color: 'black' }
									}}
								>
									First Name
								</InputLabel>
								<BootstrapInput
									id="first_name"
									name="first_name"
									placeholder="First Name"
									value={companyForm.values.first_name}
									onChange={companyForm.handleChange}
								/>
								{companyForm.touched.first_name && (
									<div style={{ color: 'red', fontSize: 12 }}>
										{companyForm.errors.first_name}
									</div>
								)}
							</FormControl>
						</Grid>
						<Grid size={{ xs: 12, sm: 6 }}>
							<FormControl variant="standard" fullWidth>
								<InputLabel
									shrink
									htmlFor="last_name"
									sx={{
										fontSize: '1.3rem',
										color: 'rgba(0, 0, 0, 0.8)',
										'&.Mui-focused': { color: 'black' }
									}}
								>
									Last Name
								</InputLabel>
								<BootstrapInput
									id="last_name"
									name="last_name"
									placeholder="Last Name"
									value={companyForm.values.last_name}
									onChange={companyForm.handleChange}
								/>
								{companyForm.touched.last_name && (
									<div style={{ color: 'red', fontSize: 12 }}>
										{companyForm.errors.last_name}
									</div>
								)}
							</FormControl>
						</Grid>
						<Grid size={{ xs: 12, sm: 6 }}>
							<CustomSelect
								label="Relationship"
								name="relationship"
								value={companyForm.values.relationship}
								onChange={companyForm.handleChange}
								options={relationshiplist.data?.data.relationships?.map(data => ({
									value: data._id,
									label: data.name
								})) || []}
								error={companyForm.errors.relationship && companyForm.touched.relationship}
								helperText={companyForm.errors.relationship}
							/>
						</Grid>
						<Grid size={{ xs: 12, sm: 6 }}>
							<FormControl variant="standard" fullWidth>
								<InputLabel
									shrink
									htmlFor="passport_no"
									sx={{
										fontSize: '1.3rem',
										color: 'rgba(0, 0, 0, 0.8)',
										'&.Mui-focused': { color: 'black' }
									}}
								>
									Id/Passport Number
								</InputLabel>
								<BootstrapInput
									id="passport_no"
									name="passport_no"
									placeholder="Id/Passport no."
									value={companyForm.values.passport_no}
									onChange={companyForm.handleChange}
								/>
								{companyForm.touched.passport_no && (
									<div style={{ color: 'red', fontSize: 12 }}>
										{companyForm.errors.passport_no}
									</div>
								)}
							</FormControl>
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
				{/* Medical Section */}
				<Paper elevation={0} sx={{ p: 3, mt: 3, mb: 3, borderRadius: '10px' }}>
					<Grid container spacing={3}>

						<Grid size={12}>
							<Typography variant="h6" gutterBottom fontWeight={600}>
								Medical Aid Information
							</Typography>
						</Grid>

						<Grid size={{ xs: 12, sm: 6 }}>
							<FormControl variant="standard" fullWidth >
								<InputLabel shrink htmlFor="medical_aid_name" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
									Medical Aid Name
								</InputLabel>
								<BootstrapInput
									id="medical_aid_name"
									name="medical_aid_name"
									placeholder="Enter Medical Aid Name"
									value={companyForm.values.medical_aid_name}
									onChange={companyForm.handleChange}
								/>
								{companyForm.touched.medical_aid_name && <div style={{ color: 'red', fontSize: 12 }}>{companyForm.errors.medical_aid_name}</div>}
							</FormControl>
						</Grid>
						<Grid size={{ xs: 12, sm: 6 }}>
							<FormControl variant="standard" fullWidth >
								<InputLabel shrink htmlFor="medical_plan" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
									Medical Plan
								</InputLabel>
								<BootstrapInput
									id="medical_plan"
									name="medical_plan"
									placeholder="Enter medical_plan"
									value={companyForm.values.medical_plan}
									onChange={companyForm.handleChange}
								/>
								{companyForm.touched.medical_plan && <div style={{ color: 'red', fontSize: 12 }}>{companyForm.errors.medical_plan}</div>}
							</FormControl>
						</Grid>
						<Grid size={{ xs: 12, sm: 6 }}>
							<FormControl variant="standard" fullWidth >
								<InputLabel shrink htmlFor="member_number" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
									Member Number
								</InputLabel>
								<BootstrapInput
									id="member_number"
									name="member_number"
									placeholder="Member Number"
									value={companyForm.values.member_number}
									onChange={companyForm.handleChange}
								/>
								{companyForm.touched.member_number && <div style={{ color: 'red', fontSize: 12 }}>{companyForm.errors.member_number}</div>}
							</FormControl>
						</Grid>
						<Grid size={{ xs: 12, sm: 6 }}>
							<Typography variant="body1" fontWeight={500} fontSize={"16px"} mb={1}>
								Medical Condition
							</Typography>
							<Autocomplete
								multiple
								freeSolo
								options={medicalConditionsList?.data?.data || []}
								getOptionLabel={(option) =>
									typeof option === "string" ? option : option.medical_conditions_name
								}
								value={
									(companyForm.values.medical_conditions || []).map((name) => {
										const found = medicalConditionsList?.data?.data?.find(
											(item) => item.medical_conditions_name === name
										);
										return found || name;
									})
								}
								onChange={(event, newValue) => {
									const names = newValue.map((item) =>
										typeof item === "string" ? item : item.medical_conditions_name
									);
									companyForm.setFieldValue("medical_conditions", names);
								}}
								isOptionEqualToValue={(option, value) =>
									typeof value === "string"
										? option.medical_conditions_name === value
										: option._id === value._id
								}
								renderTags={(value, getTagProps) =>
									value.map((option, index) => {
										const { key, ...tagProps } = getTagProps({ index });
										const isExisting = typeof option !== "string";
										const label = isExisting ? option.medical_conditions_name : option;
										const bgColor = "#367BE0";

										return (
											<Chip
												key={key}
												{...tagProps}
												label={label}
												size="small"
												sx={{
													backgroundColor: `color-mix(in srgb, ${bgColor} 30%, transparent)`,
													color: bgColor,
													height: "28px",
													borderRadius: "16px",
													fontSize: "12px",
													fontWeight: 400,
													"& .MuiChip-label": { px: "10px" },
													"& .MuiChip-deleteIcon": {
														fontSize: "17px",
														color: "#A7A7A7",
														marginRight: "4px",
													},
												}}
											/>
										);
									})
								}
								renderInput={(params) => (
									<TextField
										{...params}
										placeholder={
											companyForm.values.medical_conditions?.length
												? ""
												: "Search, Select or Type New Medical Condition"
										}
										error={
											companyForm.touched.medical_conditions &&
											Boolean(companyForm.errors.medical_conditions)
										}
										helperText={
											companyForm.touched.medical_conditions
												? companyForm.errors.medical_conditions
												: ""
										}
										sx={{
											"& .MuiOutlinedInput-root": {
												minHeight: "45px",
												height: "auto",
												padding: "5px 40px 5px 8px !important",
												alignItems: "center",
												"& fieldset": { borderColor: "#E0E3E7" },
												"&:hover fieldset": { borderColor: "#1976d2" },
												"&.Mui-focused fieldset": {
													borderColor: "#1976d2",
													borderWidth: "1.5px",
												},
											},
											"& .MuiAutocomplete-input": {
												padding: "6px 4px !important",
												fontSize: "14px",
											},
											"& .MuiAutocomplete-tag": { margin: "2px 4px 2px 0" },
										}}
									/>
								)}
								fullWidth
							/>
						</Grid>

						<Grid size={{ xs: 12, sm: 6 }}>
							<Typography variant="body1" fontWeight={500} fontSize={"16px"} mb={1}>
								Allergies
							</Typography>
							<Autocomplete
								multiple
								freeSolo
								options={allergiesList?.data?.data || []}
								getOptionLabel={(option) =>
									typeof option === "string" ? option : option.allergy_name
								}
								value={
									(companyForm.values.allergies || []).map((name) => {
										const found = allergiesList?.data?.data?.find(
											(item) => item.allergy_name === name
										);
										return found || name;
									})
								}
								onChange={(event, newValue) => {
									const names = newValue.map((item) =>
										typeof item === "string" ? item : item.allergy_name
									);
									companyForm.setFieldValue("allergies", names);
								}}
								isOptionEqualToValue={(option, value) =>
									typeof value === "string"
										? option.allergy_name === value
										: option._id === value._id
								}
								renderTags={(value, getTagProps) =>
									value.map((option, index) => {
										const { key, ...tagProps } = getTagProps({ index });
										const isExisting = typeof option !== "string";
										const label = isExisting ? option.allergy_name : option;
										const bgColor = '#367BE0';

										return (
											<Chip
												key={key}
												{...tagProps}
												label={label}
												size="small"
												sx={{
													backgroundColor: `color-mix(in srgb, ${bgColor} 30%, transparent)`,
													color: bgColor,
													height: "28px",
													borderRadius: "16px",
													fontSize: "12px",
													fontWeight: 400,
													"& .MuiChip-label": { px: "10px" },
													"& .MuiChip-deleteIcon": {
														fontSize: "17px",
														color: "#A7A7A7",
														marginRight: "4px",
													},
												}}
											/>
										);
									})
								}
								renderInput={(params) => (
									<TextField
										{...params}
										placeholder={
											companyForm.values.allergies?.length
												? ""
												: "Search, Select or Type New Allergy"
										}
										error={
											companyForm.touched.allergies &&
											Boolean(companyForm.errors.allergies)
										}
										helperText={
											companyForm.touched.allergies
												? companyForm.errors.allergies
												: ""
										}
										sx={{
											"& .MuiOutlinedInput-root": {
												minHeight: "45px",
												height: "auto",
												padding: "5px 40px 5px 8px !important",
												alignItems: "center",
												"& fieldset": { borderColor: "#E0E3E7" },
												"&:hover fieldset": { borderColor: "#1976d2" },
												"&.Mui-focused fieldset": {
													borderColor: "#1976d2",
													borderWidth: "1.5px",
												},
											},
											"& .MuiAutocomplete-input": {
												padding: "6px 4px !important",
												fontSize: "14px",
											},
											"& .MuiAutocomplete-tag": { margin: "2px 4px 2px 0" },
										}}
									/>
								)}
								fullWidth
							/>
						</Grid>

						{companyForm.values.emergency_contacts.map((contact, index) => (
							<Grid
								container
								spacing={2}
								key={index}
								sx={{
									width: "100%",
									mb: 2,
									p: 2,
									border: "1px solid #e5e7eb",
									borderRadius: "10px",
								}}
							>

								{/* Name */}
								<Grid size={{ xs: 12, sm: 4 }}>
									<FormControl variant="standard" fullWidth>
										<InputLabel
											shrink
											htmlFor={`emergency_contacts.${index}.name`}
										>
											Name
										</InputLabel>

										<BootstrapInput
											name={`emergency_contacts.${index}.name`}
											placeholder="Contact Name"
											value={contact.name}
											onChange={companyForm.handleChange}
										/>
									</FormControl>
								</Grid>


								{/* Relationship */}
								<Grid size={{ xs: 12, sm: 4 }}>
									<FormControl variant="standard" fullWidth>
										<InputLabel shrink>
											Relationship
										</InputLabel>

										<BootstrapInput
											name={`emergency_contacts.${index}.relationship`}
											placeholder="Relationship"
											value={contact.relationship}
											onChange={companyForm.handleChange}
										/>
									</FormControl>
								</Grid>


								{/* Mobile Number */}
								<Grid size={{ xs: 12, sm: 4 }}>
									<FormControl variant="standard" fullWidth>
										<InputLabel shrink>
											Mobile Number
										</InputLabel>

										<BootstrapInput
											name={`emergency_contacts.${index}.mobile_number`}
											placeholder="Mobile Number"
											value={contact.mobile_number}
											onChange={companyForm.handleChange}
										/>
									</FormControl>
								</Grid>


								{/* Remove */}
								{companyForm.values.emergency_contacts.length > 1 && (
									<Grid size={{ xs: 12 }}>
										<Button
											color="error"
											onClick={() => {
												const contacts = [
													...companyForm.values.emergency_contacts,
												];

												contacts.splice(index, 1);

												companyForm.setFieldValue(
													"emergency_contacts",
													contacts
												);
											}}
										>
											Remove Contact
										</Button>
									</Grid>
								)}
							</Grid>
						))}


						{/* Add Contact */}
						<Grid size={{ xs: 12 }}>
							<Button
								variant="outlined"
								onClick={() => {
									companyForm.setFieldValue("emergency_contacts", [
										...companyForm.values.emergency_contacts,
										{
											name: "",
											relationship: "",
											mobile_number: "",
										},
									]);
								}}
							>
								+ Add Emergency Contact
							</Button>
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

export default AddFamilyMember;
