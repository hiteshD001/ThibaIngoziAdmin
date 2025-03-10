import { useNavigate } from "react-router-dom";

import { useFormik } from "formik";
import { companyValidation } from "../common/FormValidation";

import { useQueryClient } from "@tanstack/react-query";

import { useGetCountryList, useGetProvinceList, useRegister } from "../API Calls/API";

import { toast } from "react-toastify";
import { toastOption } from "../common/ToastOptions";

import Loader from "../common/Loader";
import PhoneInput from "react-phone-input-2";

const AddCompany = () => {
	const client = useQueryClient();
	const nav = useNavigate();

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
			selfieImage: "",
			fullImage: ""
		},
		validationSchema: companyValidation,
		onSubmit: (values) => {
			const formData = new FormData();
			Object.keys(values).forEach(key => {
				if (key !== "selfieImage" && key !== "fullImage") {
					formData.append(key, values[key]);
				}
			});
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
		toast.success("Company Added Successfully.");
		companyForm.resetForm();
		client.invalidateQueries("company list");
		nav("/home/total-companies");
	}
	const onError = (error) => {
		toast.error(error.response.data.message || "Something went Wrong", toastOption)
	}

	const newcompany = useRegister(onSuccess, onError)
	const provincelist = useGetProvinceList(companyForm.values.country)
	const countrylist = useGetCountryList()

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

									<input
										type="password"
										name="password"
										placeholder="Password"
										className="form-control"
										value={companyForm.values.password}
										onChange={companyForm.handleChange}
									/>
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
