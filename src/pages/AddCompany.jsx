import { useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useFormik } from "formik";
import { companyValidation } from "../common/FormValidation";

import { useQueryClient } from "@tanstack/react-query";

import { useGetCountryList, useGetProvinceList, useGetServicesList, useRegister, useGetSecurityList, useCreateNotificationType } from "../API Calls/API";

import { toast } from "react-toastify";
import { toastOption } from "../common/ToastOptions";
import CreatableSelect from 'react-select/creatable';
import Loader from "../common/Loader";
import PhoneInput from "react-phone-input-2";
import { useLayoutEffect, useState } from "react";
import '../css/company.css'

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


	return (
		<div className="container-fluid">
			<div className="row">
				<div className="col-md-12">
					<div className="theme-table">

						<form>
							<div className="row">
								<div className="col-md-6">
									<div className="tab-heading">
										<h3>Company Information</h3>
									</div>


									<input
										type="text"
										name="company_name"
										placeholder="Company Name"
										className="form-control"
										value={companyForm.values.company_name}
										onChange={companyForm.handleChange}
									/>
									{companyForm.touched.company_name && (
										<p className="err">{companyForm.errors.company_name}</p>
									)}

									<input
										type="text"
										name="contact_name"
										placeholder="Contact Name"
										className="form-control"
										value={companyForm.values.contact_name}
										onChange={companyForm.handleChange}
									/>
									{companyForm.touched.contact_name && (
										<p className="err">{companyForm.errors.company_name}</p>
									)}

									<input
										type="text"
										name="company_bio"
										placeholder="Company Reg No."
										className="form-control"
										value={companyForm.values.company_bio}
										onChange={companyForm.handleChange}
									/>
									{companyForm.touched.company_bio && (
										<p className="err">{companyForm.errors.company_bio}</p>
									)}

									<input
										type="text"
										name="email"
										placeholder="Email"
										className="form-control"
										value={companyForm.values.email}
										onChange={companyForm.handleChange}
									/>
									{companyForm.touched.email && (
										<p className="err">{companyForm.errors.email}</p>
									)}

									<div className="position-relative">
										<input
											type={showPassword ? "text" : "password"}
											name="password"
											placeholder="Password"
											className="form-control"
											value={companyForm.values.password}
											onChange={companyForm.handleChange}
										/>
										<span
											onClick={() => setShowPassword(!showPassword)}
											style={{
												position: "absolute",
												right: "10px",
												top: "50%",
												transform: "translateY(-50%)",
												cursor: "pointer",
												userSelect: "none"
											}}
										>
											{showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
										</span>
									</div>
									{companyForm.touched.password && (
										<p className="err">{companyForm.errors.password}</p>
									)}

									<PhoneInput
										country={"za"} // Set default country
										value={`${companyForm.values.mobile_no_country_code ?? ''}${companyForm.values.mobile_no ?? ''}`}
										onChange={(phone, countryData) => {
											const withoutCountryCode = phone.startsWith(countryData.dialCode)
												? phone.slice(countryData.dialCode.length).trim()
												: phone;

											companyForm.setFieldValue("mobile_no", withoutCountryCode);
											companyForm.setFieldValue("mobile_no_country_code", `+${countryData.dialCode}`);
										}}
										inputClass="form-control"
									/>
									{companyForm.touched.mobile_no && (
										<p className="err">{companyForm.errors.mobile_no}</p>
									)}
									<CreatableSelect
										isMulti
										name="services"
										options={servicesList}
										classNamePrefix="select"
										placeholder="Select or Create Services"
										className="form-control add-company-services"
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
												flexWrap: 'wrap',
												maxHeight: '50px',
												overflowY: 'auto',
											}),
											multiValue: (base) => ({
												...base,
												margin: '2px',
											}),
										}}
									/>



									{companyForm.touched.services && companyForm.errors.services && (
										<p className="err">{companyForm.errors.services}</p>
									)}


									{/* <input
										type="text"
										name="mobile_no"
										placeholder="Mobile No."
										className="form-control"
										value={companyForm.values.mobile_no}
										onChange={companyForm.handleChange}
									/>
									{companyForm.touched.mobile_no && (
										<p className="err">{companyForm.errors.mobile_no}</p>
									)} */}

									<input
										type="text"
										name="id_no"
										placeholder="ID No."
										className="form-control"
										value={companyForm.values.id_no}
										onChange={companyForm.handleChange}
									/>
									{companyForm.touched.id_no && (
										<p className="err">{companyForm.errors.id_no}</p>
									)}
									<div className=" form-checkbox form-control">
										<input
											type="checkbox"
											name="isEnrollToken"
											id="isEnrollToken"
											className="form-check-input"
											checked={companyForm.values.isEnrollToken}
											onChange={(e) => companyForm.setFieldValue("isEnrollToken", e.target.checked)}
										/>
										<label className="form-check-label" htmlFor="isEnrollToken">
											Pay subscription
										</label>
									</div>
									<div className="row">
										<div className="col-md-6">
											<label>Selfie Image</label>



											{/* Preview Image */}
											{companyForm.values.selfieImage && (
												<div className="form-control img-preview-container mt-2">
													<img
														src={URL.createObjectURL(companyForm.values.selfieImage)}
														alt="Selfie Preview"
														className="img-preview"
													/>
												</div>
											)}
											{/* Custom File Input */}
											<div className="custom-file-input">
												<input
													type="file"
													id="selfieImage"
													accept="image/*"
													onChange={(event) => {
														const file = event.currentTarget.files[0];
														companyForm.setFieldValue("selfieImage", file);
													}}
												/>
												<label htmlFor="selfieImage">
													{companyForm.values.selfieImage ? companyForm.values.selfieImage.name : "Choose Selfie Image"}
												</label>
											</div>
										</div>

										<div className="col-md-6">
											<label>Full Image</label>



											{/* Preview Image */}
											{companyForm.values.fullImage && (
												<div className="form-control img-preview-container mt-2">
													<img
														src={URL.createObjectURL(companyForm.values.fullImage)}
														alt="Full Image Preview"
														className="img-preview"
													/>
												</div>
											)}
											{/* Custom File Input */}
											<div className="custom-file-input">
												<input
													type="file"
													id="fullImage"
													accept="image/*"
													onChange={(event) => {
														const file = event.currentTarget.files[0];
														companyForm.setFieldValue("fullImage", file);
													}}
												/>
												<label htmlFor="fullImage">
													{companyForm.values.fullImage ? companyForm.values.fullImage.name : "Choose Full Image"}
												</label>
											</div>
										</div>

									</div>

								</div>

								<div className="col-md-6">
									<div className="tab-heading">
										<h3>Address</h3>
									</div>


									<input
										type="text"
										name="street"
										placeholder="Street"
										className="form-control"
										value={companyForm.values.street}
										onChange={companyForm.handleChange}
									/>
									{companyForm.touched.street && (
										<p className="err">{companyForm.errors.street}</p>
									)}

									<select
										name="country"
										className="form-control"
										value={companyForm.values.country}
										onChange={companyForm.handleChange}
									>
										<option value="" hidden> Country </option>
										{countrylist.data?.data.data?.map((country) => (
											<option key={country._id} value={country._id}>
												{country.country_name}
											</option>
										))}
									</select>
									{companyForm.touched.country && (
										<p className="err">{companyForm.errors.country}</p>
									)}

									<select
										name="province"
										className="form-control"
										disabled={!companyForm.values.country}
										value={companyForm.values.province}
										onChange={companyForm.handleChange}
									>
										<option value="" hidden>Province</option>
										{provincelist.data?.data.data?.map((province) => (
											<option key={province._id} value={province._id}>
												{province.province_name}
											</option>
										))}
									</select>
									{companyForm.touched.province && (
										<p className="err">{companyForm.errors.province}</p>
									)}

									<input
										type="text"
										name="city"
										placeholder="City"
										className="form-control"
										value={companyForm.values.city}
										onChange={companyForm.handleChange}
									/>
									{companyForm.touched.city && (
										<p className="err">{companyForm.errors.city}</p>
									)}

									<input
										type="text"
										name="suburb"
										placeholder="Suburb"
										className="form-control"
										value={companyForm.values.suburb}
										onChange={companyForm.handleChange}
									/>
									{companyForm.touched.suburb && (
										<p className="err">{companyForm.errors.suburb}</p>
									)}

									<input
										type="text"
										name="postal_code"
										placeholder="Postal Code"
										className="form-control"
										value={companyForm.values.postal_code}
										onChange={companyForm.handleChange}
									/>
									{companyForm.touched.postal_code && (
										<p className="err">{companyForm.errors.postal_code}</p>
									)}
									<div className=" form-checkbox form-control">
										<input
											type="checkbox"
											name="isArmed"
											id="isArmed"
											className="form-check-input"
											checked={companyForm.values.isArmed}
											onChange={(e) => companyForm.setFieldValue("isArmed", e.target.checked)}
										/>
										<label className="form-check-label" htmlFor="isArmed">
											Security
										</label>
									</div>
									<Select
										isMulti
										name="securityCompany"
										options={securityCompanyOptions}
										classNamePrefix="select"
										placeholder="Security Companies"
										isDisabled={companyForm.values.isArmed === true || companyForm.values.isArmed === "true"}
										className="form-control add-company-services"
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
												cursor: 'default',
											}),
											valueContainer: (base) => ({
												...base,
												flexWrap: 'wrap',
												maxHeight: '50px',
												overflowY: 'auto',
											}),
											multiValue: (base) => ({
												...base,
												margin: '2px',
											}),
										}}
									/>

									{companyForm.touched.services && companyForm.errors.services && (
										<p className="err">{companyForm.errors.services}</p>
									)}
									<div className=" form-checkbox form-control">
										<input
											type="checkbox"
											name="isPaymentToken"
											id="isPaymentToken"
											className="form-check-input"
											checked={companyForm.values.isPaymentToken}
											onChange={(e) => companyForm.setFieldValue("isPaymentToken", e.target.checked)}
										/>
										<label className="form-check-label" htmlFor="isPaymentToken">
											Is All Sos payment
										</label>
									</div>
								</div>
							</div>
						</form>
					</div>
				</div>
				<div className="col-md-12 text-end">
					<div className="saveform">
						<button
							type="submit"
							onClick={companyForm.handleSubmit}
							className="btn btn-dark"
							disabled={newcompany.isPending}
						>
							{newcompany.isPending ? <Loader color="white" /> : "Save"}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AddCompany;
