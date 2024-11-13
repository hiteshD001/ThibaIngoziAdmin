import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { toast } from "react-toastify";
import { toastOption } from "../common/ToastOptions";

import { driverValidation } from "../common/FormValidation";

import { useFormik } from "formik";

import { useGetCountryList, useGetProvinceList, useGetUserList, useRegister } from "../API Calls/API";
import { useQueryClient } from "@tanstack/react-query";

import Loader from "../common/Loader";

const AddDriver = () => {
    const client = useQueryClient();
    const [role] = useState(localStorage.getItem("role"))
    const nav = useNavigate();

    const driverForm = useFormik({
        initialValues: role === 'super_admin' ? formValues1 : formValues2,
        validationSchema: driverValidation,
        onSubmit: (values) => {
            newdriver.mutate(values);
        },
    });

    const onSuccess = () => {
        toast.success("Driver added successfully.");
        driverForm.resetForm();
        client.invalidateQueries("company list");
        nav(role === 'super_admin' ? "/home/total-drivers" : `/home/total-drivers/${localStorage.getItem("userID")}`);
    }
    const onError = (error) => {
        toast.error(error.response.data.message || "Something went Wrong", toastOption)
    }

    const newdriver = useRegister(onSuccess, onError)
    const companyList = useGetUserList("company list", "company")
    const provincelist = useGetProvinceList()
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
                                        <h3>Driver Information</h3>
                                    </div>

                                    <input
                                        type="text"
                                        name="first_name"
                                        placeholder="First Name"
                                        className="form-control"
                                        value={driverForm.values.first_name}
                                        onChange={driverForm.handleChange}
                                    />
                                    {driverForm.touched.first_name && (
                                        <p className="err">{driverForm.errors.first_name}</p>
                                    )}
                                    <input
                                        type="text"
                                        name="last_name"
                                        placeholder="Last Name"
                                        className="form-control"
                                        value={driverForm.values.last_name}
                                        onChange={driverForm.handleChange}
                                    />
                                    {driverForm.touched.last_name && (
                                        <p className="err">{driverForm.errors.last_name}</p>
                                    )}
                                    {role === 'super_admin' && <>
                                        <select
                                            name="company_id"
                                            className="form-control"
                                            value={driverForm.values.company_id}
                                            onChange={driverForm.handleChange}
                                        >
                                            <option value="" hidden>
                                                Company Name
                                            </option>
                                            {companyList.data?.data.users.map((user) => (
                                                <option key={user._id} value={user._id}>
                                                    {user.company_name}
                                                </option>
                                            ))}
                                        </select>
                                        {driverForm.touched.company_id && (
                                            <p className="err">{driverForm.errors.company_id}</p>
                                        )}
                                    </>}
                                    <input
                                        type="text"
                                        name="email"
                                        placeholder="Email"
                                        className="form-control"
                                        value={driverForm.values.email}
                                        onChange={driverForm.handleChange}
                                    />
                                    {driverForm.touched.email && (
                                        <p className="err">{driverForm.errors.email}</p>
                                    )}

                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="Password"
                                        className="form-control"
                                        value={driverForm.values.password}
                                        onChange={driverForm.handleChange}
                                    />
                                    {driverForm.touched.password && (
                                        <p className="err">{driverForm.errors.password}</p>
                                    )}

                                    <input
                                        type="text"
                                        name="mobile_no"
                                        placeholder="Mobile No."
                                        className="form-control"
                                        value={driverForm.values.mobile_no}
                                        onChange={driverForm.handleChange}
                                    />
                                    {driverForm.touched.mobile_no && (
                                        <p className="err">{driverForm.errors.mobile_no}</p>
                                    )}

                                    <input
                                        type="text"
                                        name="id_no"
                                        placeholder="ID No."
                                        className="form-control"
                                        value={driverForm.values.id_no}
                                        onChange={driverForm.handleChange}
                                    />
                                    {driverForm.touched.id_no && (
                                        <p className="err">{driverForm.errors.id_no}</p>
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
                                        value={driverForm.values.street}
                                        onChange={driverForm.handleChange}
                                    />
                                    {driverForm.touched.street && (
                                        <p className="err">{driverForm.errors.street}</p>
                                    )}

                                    <select
                                        name="province"
                                        className="form-control"
                                        value={driverForm.values.province}
                                        onChange={driverForm.handleChange}
                                    >
                                        <option value="" hidden>Province</option>
                                        {provincelist.data?.data.data?.map((province) => (
                                            <option key={province._id} value={province._id}>
                                                {province.province_name}
                                            </option>
                                        ))}
                                    </select>
                                    {driverForm.touched.province && (
                                        <p className="err">{driverForm.errors.province}</p>
                                    )}

                                    <input
                                        type="text"
                                        name="city"
                                        placeholder="City"
                                        className="form-control"
                                        value={driverForm.values.city}
                                        onChange={driverForm.handleChange}
                                    />
                                    {driverForm.touched.city && (
                                        <p className="err">{driverForm.errors.city}</p>
                                    )}

                                    <input
                                        type="text"
                                        name="suburb"
                                        placeholder="Suburb"
                                        className="form-control"
                                        value={driverForm.values.suburb}
                                        onChange={driverForm.handleChange}
                                    />
                                    {driverForm.touched.suburb && (
                                        <p className="err">{driverForm.errors.suburb}</p>
                                    )}

                                    <input
                                        type="text"
                                        name="postal_code"
                                        placeholder="Postal Code"
                                        className="form-control"
                                        value={driverForm.values.postal_code}
                                        onChange={driverForm.handleChange}
                                    />
                                    {driverForm.touched.postal_code && (
                                        <p className="err">{driverForm.errors.postal_code}</p>
                                    )}

                                    <select
                                        name="country"
                                        className="form-control"
                                        value={driverForm.values.country}
                                        onChange={driverForm.handleChange}
                                    >
                                        <option value="" hidden> Country </option>
                                        {countrylist.data?.data.data?.map((country) => (
                                            <option key={country._id} value={country._id}>
                                                {country.country_name}
                                            </option>
                                        ))}
                                    </select>
                                    {driverForm.touched.country && (
                                        <p className="err">{driverForm.errors.country}</p>
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
                            onClick={driverForm.handleSubmit}
                            className="btn btn-dark"
                            disabled={newdriver.isPending}
                        >
                            {newdriver.isPending ? <Loader color="white" /> : "Save"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddDriver;


const formValues1 = {
    company_id: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    mobile_no: "",
    street: "",
    province: "",
    city: "",
    suburb: "",
    postal_code: "",
    country: "",
    id_no: "",
    role: "driver",
    type: "email_pass",
    fcm_token: "fcm_token",
}

const formValues2 = {
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    mobile_no: "",
    street: "",
    province: "",
    city: "",
    suburb: "",
    postal_code: "",
    country: "",
    id_no: "",
    role: "driver",
    type: "email_pass",
    fcm_token: "fcm_token",
}