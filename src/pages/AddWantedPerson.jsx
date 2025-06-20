import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { toastOption } from "../common/ToastOptions";
import { wantedPersonValidation } from "../common/FormValidation";

import { useFormik } from "formik";

import { useGetCountryList, useGetProvinceList, useRegister } from "../API Calls/API";
import { useQueryClient } from "@tanstack/react-query";

import Loader from "../common/Loader";
import PhoneInput from "react-phone-input-2";

const AddWantedPerson = () => {
    const client = useQueryClient();
    const [role] = useState(localStorage.getItem("role"))
    const nav = useNavigate();

    const wantedForm = useFormik({
        initialValues: formValues1,
        validationSchema: wantedPersonValidation,
        onSubmit: (values) => {
            const formData = new FormData();
            Object.keys(values).forEach((key) => {
                if (key !== "selfieImage" && key !== "fullImage") {
                    if (key === "other_e_hailing_company") {
                        formData.append("other_e_hailing_company", values[key].join(","));
                    } else {
                        formData.append(key, values[key]);
                    }
                }
            });
            if (values.selfieImage) {
                formData.append("selfieImage", values.selfieImage);
            }
            if (values.fullImage) {
                formData.append("fullImage", values.fullImage);
            }
            newdriver.mutate(formData);
        },
    });



    const onSuccess = () => {

        toast.success("Wanted Person added successfully.");
        wantedForm.resetForm();
        client.invalidateQueries("company list");
        nav(role === 'super_admin' ? "/home/total-drivers" : `/home/total-drivers/${localStorage.getItem("userID")}`);
    }
    const onError = (error) => {
        toast.error(error.response.data.message || "Something went Wrong", toastOption)
    }

    const newdriver = useRegister(onSuccess, onError)

    const provincelist = useGetProvinceList(wantedForm.values.country)
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
                                        <h3>Wanted Person Information</h3>
                                    </div>

                                    <input
                                        type="text"
                                        name="full_name"
                                        placeholder="Full Name / Alias"
                                        className="form-control"
                                        value={wantedForm.values.full_name}
                                        onChange={wantedForm.handleChange}
                                    />
                                    {wantedForm.touched.full_name && <p className="err">{wantedForm.errors.full_name}</p>}
                                    <input
                                        type="text"
                                        name="offenses"
                                        placeholder="Known Offenses / Charges"
                                        className="form-control"
                                        value={wantedForm.values.offenses}
                                        onChange={wantedForm.handleChange}
                                    />
                                    {wantedForm.touched.offenses && <p className="err">{wantedForm.errors.offenses}</p>}
                                    <input
                                        type="date"
                                        name="incident_date"
                                        placeholder="Date of Incident"
                                        className="form-control"
                                        value={wantedForm.values.incident_date}
                                        onChange={wantedForm.handleChange}
                                    />
                                    {wantedForm.touched.incident_date && <p className="err">{wantedForm.errors.incident_date}</p>}
                                    <input
                                        type="text"
                                        name="case_number"
                                        placeholder="Case Number"
                                        className="form-control"
                                        value={wantedForm.values.case_number}
                                        onChange={wantedForm.handleChange}
                                    />
                                    {wantedForm.touched.case_number && <p className="err">{wantedForm.errors.case_number}</p>}


                                    <PhoneInput
                                        country={"za"}
                                        value={`${wantedForm.values.mobile_no_country_code ?? ''}${wantedForm.values.mobile_no ?? ''}`}
                                        onChange={(phone, countryData) => {
                                            const withoutCountryCode = phone.startsWith(countryData.dialCode)
                                                ? phone.slice(countryData.dialCode.length).trim()
                                                : phone;

                                            wantedForm.setFieldValue("mobile_no", withoutCountryCode);
                                            wantedForm.setFieldValue("mobile_no_country_code", `+${countryData.dialCode}`);
                                        }}
                                        inputClass="form-control"
                                    />
                                    {wantedForm.touched.mobile_no && (
                                        <p className="err">{wantedForm.errors.mobile_no}</p>
                                    )}
                                    <select
                                        name="status"
                                        className="form-control"
                                        value={wantedForm.values.status}
                                        onChange={wantedForm.handleChange}
                                    >
                                        <option value="" hidden>Status</option>
                                        <option value="Wanted">Wanted</option>
                                        <option value="Captured">Captured</option>
                                    </select>
                                    {wantedForm.touched.status && <p className="err">{wantedForm.errors.status}</p>}

                                    <textarea
                                        name="description"
                                        placeholder="Description (Clothing, Hangouts, Threats, etc.)"
                                        className="form-control"
                                        rows="4"
                                        value={wantedForm.values.description}
                                        onChange={wantedForm.handleChange}
                                    />
                                    {wantedForm.touched.description && <p className="err">{wantedForm.errors.description}</p>}


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
                                        value={wantedForm.values.street}
                                        onChange={wantedForm.handleChange}
                                    />
                                    {wantedForm.touched.street && (
                                        <p className="err">{wantedForm.errors.street}</p>
                                    )}

                                    <select
                                        name="country"
                                        className="form-control"
                                        value={wantedForm.values.country}
                                        onChange={wantedForm.handleChange}
                                    >
                                        <option value="" hidden> Country </option>
                                        {countrylist.data?.data.data?.map((country) => (
                                            <option key={country._id} value={country._id}>
                                                {country.country_name}
                                            </option>
                                        ))}
                                    </select>
                                    {wantedForm.touched.country && (
                                        <p className="err">{wantedForm.errors.country}</p>
                                    )}

                                    <select
                                        name="province"
                                        className="form-control"
                                        value={wantedForm.values.province}
                                        disabled={!wantedForm.values.country}
                                        onChange={wantedForm.handleChange}
                                    >
                                        <option value="" hidden>Province</option>
                                        {provincelist.data?.data.data?.map((province) => (
                                            <option key={province._id} value={province._id}>
                                                {province.province_name}
                                            </option>
                                        ))}
                                    </select>
                                    {wantedForm.touched.province && (
                                        <p className="err">{wantedForm.errors.province}</p>
                                    )}

                                    <input
                                        type="text"
                                        name="city"
                                        placeholder="City"
                                        className="form-control"
                                        value={wantedForm.values.city}
                                        onChange={wantedForm.handleChange}
                                    />
                                    {wantedForm.touched.city && (
                                        <p className="err">{wantedForm.errors.city}</p>
                                    )}

                                    <input
                                        type="text"
                                        name="suburb"
                                        placeholder="Suburb"
                                        className="form-control"
                                        value={wantedForm.values.suburb}
                                        onChange={wantedForm.handleChange}
                                    />
                                    {wantedForm.touched.suburb && (
                                        <p className="err">{wantedForm.errors.suburb}</p>
                                    )}

                                    <input
                                        type="text"
                                        name="postal_code"
                                        placeholder="Postal Code"
                                        className="form-control"
                                        value={wantedForm.values.postal_code}
                                        onChange={wantedForm.handleChange}
                                    />
                                    {wantedForm.touched.postal_code && (
                                        <p className="err">{wantedForm.errors.postal_code}</p>
                                    )}




                                </div>

                                <div className="col-md-12 mt-4">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <label>Image 1</label>

                                                    {wantedForm.values.selfieImage && (
                                                        <div className="form-control mt-2 img-preview-container">
                                                            <img
                                                                src={URL.createObjectURL(wantedForm.values.selfieImage)}
                                                                alt="Selfie Preview"
                                                                className="img-preview"
                                                                width="100"
                                                            />
                                                        </div>
                                                    )}

                                                    <div className="custom-file-input">
                                                        <input type="file" id="selfieImage" accept="image/*"
                                                            onChange={(event) => {
                                                                const file = event.currentTarget.files[0];
                                                                wantedForm.setFieldValue("selfieImage", file);
                                                            }} />
                                                        <label htmlFor="selfieImage">
                                                            {wantedForm.values.selfieImage ? wantedForm.values.selfieImage.name : "Choose Selfie Image"}
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <label>Image 2</label>

                                                    {wantedForm.values.selfieImage && (
                                                        <div className="form-control mt-2 img-preview-container">
                                                            <img
                                                                src={URL.createObjectURL(wantedForm.values.selfieImage)}
                                                                alt="Selfie Preview"
                                                                className="img-preview"
                                                                width="100"
                                                            />
                                                        </div>
                                                    )}

                                                    <div className="custom-file-input">
                                                        <input type="file" id="selfieImage" accept="image/*"
                                                            onChange={(event) => {
                                                                const file = event.currentTarget.files[0];
                                                                wantedForm.setFieldValue("selfieImage", file);
                                                            }} />
                                                        <label htmlFor="selfieImage">
                                                            {wantedForm.values.selfieImage ? wantedForm.values.selfieImage.name : "Choose Selfie Image"}
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <label>Image 3</label>

                                                    {wantedForm.values.selfieImage && (
                                                        <div className="form-control mt-2 img-preview-container">
                                                            <img
                                                                src={URL.createObjectURL(wantedForm.values.selfieImage)}
                                                                alt="Selfie Preview"
                                                                className="img-preview"
                                                                width="100"
                                                            />
                                                        </div>
                                                    )}

                                                    <div className="custom-file-input">
                                                        <input type="file" id="selfieImage" accept="image/*"
                                                            onChange={(event) => {
                                                                const file = event.currentTarget.files[0];
                                                                wantedForm.setFieldValue("selfieImage", file);
                                                            }} />
                                                        <label htmlFor="selfieImage">
                                                            {wantedForm.values.selfieImage ? wantedForm.values.selfieImage.name : "Choose Selfie Image"}
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <label>Image 4</label>

                                                    {wantedForm.values.selfieImage && (
                                                        <div className="form-control mt-2 img-preview-container">
                                                            <img
                                                                src={URL.createObjectURL(wantedForm.values.selfieImage)}
                                                                alt="Selfie Preview"
                                                                className="img-preview"
                                                                width="100"
                                                            />
                                                        </div>
                                                    )}

                                                    <div className="custom-file-input">
                                                        <input type="file" id="selfieImage" accept="image/*"
                                                            onChange={(event) => {
                                                                const file = event.currentTarget.files[0];
                                                                wantedForm.setFieldValue("selfieImage", file);
                                                            }} />
                                                        <label htmlFor="selfieImage">
                                                            {wantedForm.values.selfieImage ? wantedForm.values.selfieImage.name : "Choose Selfie Image"}
                                                        </label>
                                                    </div>
                                                </div>
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
                        <button
                            type="submit"
                            onClick={wantedForm.handleSubmit}
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

export default AddWantedPerson;


const formValues1 = {
    full_name: "",
    offenses: "",
    incident_date: "",
    province: "",
    city: "",
    suburb: "",
    case_number: "",
    contact_number: "",
    description: "",
    status: "",
    images: [],
    mobile_no: "",
    mobile_no_country_code: "",
    street: "",
    province: "",
    city: "",
    suburb: "",
    postal_code: "",
    country: "",
    type: "email_pass",
    fcm_token: "fcm_token",
}

