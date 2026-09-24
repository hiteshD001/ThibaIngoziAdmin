import { useState } from 'react'
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { chatGrouValidation } from "../../common/FormValidation";
import { useQueryClient } from "@tanstack/react-query";
import { useGetCountryList, useGetProvinceList, useAddChatGroup, useGetCityList,useGetsurbubList } from "../../API Calls/API";
import { toast } from "react-toastify";
import { toastOption } from "../../common/ToastOptions";
import Loader from "../../common/Loader";
import '../../css/company.css'
import { Box, Button, Typography, InputLabel, FormControl,Grid, Paper } from "@mui/material";
import CustomSelect from "../../common/Custom/CustomSelect";
import { BootstrapInput } from "../../common/BootstrapInput";


const AddChatGroup = () => {
	const client = useQueryClient();
	const nav = useNavigate();
	const companyForm = useFormik({
		initialValues: {
			group_name: "",
			country: "",
			province: "",
			city: "",
			suburb: "",
		},
		validationSchema: chatGrouValidation,
		onSubmit: (values) => {
			console.log("====",values)
			newcompany.mutate(values);
		},
	});	

	const onSuccess = () => {
		toast.success("Chat Group Added Successfully.");
		companyForm.resetForm();
		client.invalidateQueries("chat group");
		nav("/home/chat-group");
	}
	const onError = (error) => {
		toast.error(error.response.data.message || "Something went Wrong", toastOption)
	}

	const newcompany = useAddChatGroup(onSuccess, onError)
	const provincelist = useGetProvinceList(companyForm.values.country)
	const cityList = useGetCityList(companyForm.values.province)
	const suburbList = useGetsurbubList(companyForm.values.city)
	const countrylist = useGetCountryList()

	const handleCancel = () => {
		nav("/home/chat-group");
	};
	
	return (
		<Box p={2}>
			<form onSubmit={companyForm.handleSubmit}>

				<Paper elevation={0} sx={{ p: 3, borderRadius: '10px' }}>
					<Grid container spacing={3}>
						<Grid size={12}>
							<Typography variant="h6" gutterBottom fontWeight={600}>
								Chat Group Information
							</Typography>
						</Grid>
						<Grid container spacing={3}>
						<Grid size={{ xs: 12, sm: 6 }}>
							<FormControl variant="standard" fullWidth>
								<InputLabel
									shrink
									htmlFor="group_name"
									sx={{
										fontSize: '1.3rem',
										color: 'rgba(0, 0, 0, 0.8)',
										'&.Mui-focused': { color: 'black' }
									}}
								>
									Group Name
								</InputLabel>
								<BootstrapInput
									id="group_name"
									name="group_name"
									placeholder="Enter Group Name"
									value={companyForm.values.group_name}
									onChange={companyForm.handleChange}
								/>
								{companyForm.touched.group_name && (
									<div style={{ color: 'red', fontSize: 12 }}>
										{companyForm.errors.group_name}
									</div>
								)}
							</FormControl>

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
							<CustomSelect
								label="Suburb"
								name="suburb"
								value={companyForm.values.suburb}
								onChange={companyForm.handleChange}
								options={suburbList.data?.data.data?.map(suburb => ({
									value: suburb._id,
									label: suburb.surbub_name
								})) || []}
								error={companyForm.errors.suburb && companyForm.touched.suburb}
								helperText={companyForm.touched.suburb ? companyForm.errors.suburb : ''}
								disabled={!companyForm.values.city}
							/>
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
					</Grid>
				</Paper>
			</form>
		</Box>
	);
};

export default AddChatGroup;
