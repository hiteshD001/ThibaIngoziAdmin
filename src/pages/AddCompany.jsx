import { useNavigate } from "react-router-dom";

import { useFormik } from "formik";
import { companyValidation } from "../common/FormValidation";

import { useQueryClient } from "@tanstack/react-query";

import { useRegister } from "../API Calls/API";

import { toast } from "react-toastify";
import { toastOption } from "../common/ToastOptions";

import Loader from "../common/Loader";

const AddCompany = () => {
	const client = useQueryClient();
	const nav = useNavigate();

	const companyForm = useFormik({
		initialValues: {
			email: "",
			password: "",
			company_name: "",
			mobile_no: "",
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
		},
		validationSchema: companyValidation,
		onSubmit: (values) => {
			console.log(values);
			newcompany.mutate(values);
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

									<input
										type="text"
										name="mobile_no"
										placeholder="Mobile No."
										className="form-control"
										value={companyForm.values.mobile_no}
										onChange={companyForm.handleChange}
									/>
									{companyForm.touched.mobile_no && (
										<p className="err">{companyForm.errors.mobile_no}</p>
									)}

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

									<input
										type="text"
										name="province"
										placeholder="Province"
										className="form-control"
										value={companyForm.values.province}
										onChange={companyForm.handleChange}
									/>
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

									<input
										type="text"
										name="country"
										placeholder="Country"
										className="form-control"
										value={companyForm.values.country}
										onChange={companyForm.handleChange}
									/>
									{companyForm.touched.country && (
										<p className="err">{companyForm.errors.country}</p>
									)}
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
