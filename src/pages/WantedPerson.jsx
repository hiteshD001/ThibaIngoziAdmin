import { useState } from "react";
import { useParams } from "react-router-dom";

import { useFormik } from "formik";
import { wantedPersonValidation } from "../common/FormValidation";
import { useQueryClient } from "@tanstack/react-query";
import {
    useGetCountryList,
    useGetProvinceList,
    useUpdateUser,
} from "../API Calls/API";

import { toast } from "react-toastify";
import { toastOption } from "../common/ToastOptions";
import PhoneInput from "react-phone-input-2";

const WantedPerson = () => {
    const [edit, setedit] = useState(false);
    const params = useParams();
    const client = useQueryClient();


    const wantedForm = useFormik({
        initialValues: {
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
        },
        validationSchema: wantedPersonValidation,
        onSubmit: (values) => {
            setedit(false);
            const formData = new FormData();

            Object.keys(values).forEach((key) => {
                if (key !== "images") {
                    formData.append(key, values[key]);
                }
            });

            if (Array.isArray(values.images)) {
                values.images.forEach((file) => {
                    if (file instanceof File) {
                        formData.append("images", file);
                    }
                });
            }

            mutate({ id: params.id, data: formData });
        },
    });



    const onSuccess = () => {
        toast.success("User Updated Successfully.");
        client.invalidateQueries("driver list");
    };
    const onError = (error) => {
        toast.error(
            error.response.data.message || "Something went Wrong",
            toastOption
        );
    };

    const { mutate } = useUpdateUser(onSuccess, onError);

    const provincelist = useGetProvinceList(wantedForm.values.country);
    const countrylist = useGetCountryList();


    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-md-12">
                    <div className="theme-table">
                        <div className="tab-heading">
                            <h3>Wanted Person Information</h3>
                        </div>
                        <form>
                            <div className="row">
                                <div className="col-md-6">
                                    <input
                                        type="text"
                                        name="full_name"
                                        placeholder="Full Name / Alias"
                                        className="form-control"
                                        value={wantedForm.values.full_name}
                                        onChange={wantedForm.handleChange}
                                        disabled={!edit}
                                    />
                                    {wantedForm.touched.full_name && <p className="err">{wantedForm.errors.full_name}</p>}

                                </div>
                                <div className="col-md-6">
                                    <input
                                        type="text"
                                        name="offenses"
                                        placeholder="Known Offenses / Charges"
                                        className="form-control"
                                        value={wantedForm.values.offenses}
                                        onChange={wantedForm.handleChange}
                                        disabled={!edit}
                                    />
                                    {wantedForm.touched.offenses && <p className="err">{wantedForm.errors.offenses}</p>}

                                </div>
                                <div className="col-md-6">
                                    <input
                                        type="date"
                                        name="incident_date"
                                        placeholder="Date of Incident"
                                        className="form-control"
                                        value={wantedForm.values.incident_date}
                                        onChange={wantedForm.handleChange}
                                        disabled={!edit}

                                    />
                                    {wantedForm.touched.incident_date && <p className="err">{wantedForm.errors.incident_date}</p>}


                                </div>

                                <div className="col-md-6">
                                    <input
                                        type="text"
                                        name="case_number"
                                        placeholder="Case Number"
                                        className="form-control"
                                        value={wantedForm.values.case_number}
                                        onChange={wantedForm.handleChange}
                                        disabled={!edit}

                                    />
                                    {wantedForm.touched.case_number && <p className="err">{wantedForm.errors.case_number}</p>}

                                </div>
                                <div className="col-md-6">
                                    <PhoneInput
                                        country={"za"}
                                        disabled={!edit}
                                        value={`${wantedForm.values
                                            .mobile_no_country_code ?? ""
                                            }${wantedForm.values.mobile_no ?? ""}`}
                                        onChange={(phone, countryData) => {
                                            const withoutCountryCode =
                                                phone.startsWith(
                                                    countryData.dialCode
                                                )
                                                    ? phone
                                                        .slice(
                                                            countryData
                                                                .dialCode
                                                                .length
                                                        )
                                                        .trim()
                                                    : phone;

                                            wantedForm.setFieldValue(
                                                "mobile_no",
                                                withoutCountryCode
                                            );
                                            wantedForm.setFieldValue(
                                                "mobile_no_country_code",
                                                `+${countryData.dialCode}`
                                            );
                                        }}
                                        inputClass="form-control"
                                    />
                                    {wantedForm.touched.mobile_no && (
                                        <p className="err">
                                            {wantedForm.errors.mobile_no}
                                        </p>
                                    )}

                                </div>
                                <div className="col-md-6">
                                    <textarea
                                        name="description"
                                        placeholder="Description (Clothing, Hangouts, Threats, etc.)"
                                        className="form-control"
                                        disabled={!edit}
                                        rows="4"
                                        value={wantedForm.values.description}
                                        onChange={wantedForm.handleChange}
                                    />
                                    {wantedForm.touched.description && <p className="err">{wantedForm.errors.description}</p>}
                                </div>
                                <div className="col-md-6">
                                    <select
                                        name="status"
                                        className="form-control"
                                        value={wantedForm.values.status}
                                        onChange={wantedForm.handleChange}
                                        disabled={!edit}

                                    >
                                        <option value="" hidden>Status</option>
                                        <option value="Wanted">Wanted</option>
                                        <option value="Captured">Captured</option>
                                    </select>
                                    {wantedForm.touched.status && <p className="err">{wantedForm.errors.status}</p>}

                                </div>

                                <div className="col-md-12">
                                    <div className="row">
                                        {[0, 1, 2, 3].map((index) => (
                                            <div className="col-md-3" key={index}>
                                                <div className="row">
                                                    <div className="col-md-12">
                                                        <label>Image {index + 1}</label>

                                                        {/* Preview */}
                                                        {wantedForm.values.images?.[index] instanceof File ? (
                                                            <div className="form-control mt-2 img-preview-container">
                                                                <img
                                                                    src={URL.createObjectURL(wantedForm.values.images[index])}
                                                                    alt={`Preview ${index + 1}`}
                                                                    className="img-preview"
                                                                    width="100"
                                                                    onLoad={(e) => URL.revokeObjectURL(e.target.src)}
                                                                />
                                                            </div>
                                                        ) : wantedForm.data?.data?.user?.images?.[index] ? (
                                                            <div className="form-control mt-2 img-preview-container">
                                                                <img
                                                                    src={wantedForm.data.data.user.images[index]}
                                                                    alt={`Image ${index + 1}`}
                                                                    className="img-preview"
                                                                    width="100"
                                                                />
                                                            </div>
                                                        ) : null}

                                                        {/* File input */}
                                                        <div className="custom-file-input">
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                disabled={!edit}
                                                                onChange={(event) => {
                                                                    const file = event.currentTarget.files[0];
                                                                    const newImages = [...(wantedForm.values.images || [])];
                                                                    newImages[index] = file;
                                                                    wantedForm.setFieldValue("images", newImages);
                                                                }}
                                                            />
                                                            <label>Choose Image {index + 1}</label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>


                            </div>
                        </form>
                    </div>

                    <div className="theme-table">
                        <div className="tab-heading">
                            <h3>Address</h3>
                        </div>
                        <form>
                            <div className="row">
                                <div className="col-md-6">
                                    <input
                                        type="text"
                                        name="street"
                                        placeholder="Street"
                                        className="form-control"
                                        value={wantedForm.values.street}
                                        onChange={wantedForm.handleChange}
                                        disabled={!edit}
                                    />
                                    {wantedForm.touched.street && (
                                        <p className="err">
                                            {wantedForm.errors.street}
                                        </p>
                                    )}
                                </div>

                                <div className="col-md-6">
                                    <select
                                        name="country"
                                        className="form-control"
                                        value={wantedForm.values.country}
                                        onChange={wantedForm.handleChange}
                                        disabled={!edit}
                                    >
                                        <option value="" hidden>
                                            {" "}
                                            Country{" "}
                                        </option>
                                        {countrylist.data?.data.data?.map(
                                            (country) => (
                                                <option
                                                    key={country._id}
                                                    value={country._id}
                                                >
                                                    {country.country_name}
                                                </option>
                                            )
                                        )}
                                    </select>
                                    {wantedForm.touched.country && (
                                        <p className="err">
                                            {wantedForm.errors.country}
                                        </p>
                                    )}
                                </div>

                                <div className="col-md-6">
                                    <select
                                        name="province"
                                        className="form-control"
                                        disabled={
                                            !wantedForm.values.country || !edit
                                        }
                                        value={wantedForm.values.province}
                                        onChange={wantedForm.handleChange}
                                    >
                                        <option value="" hidden>
                                            Province
                                        </option>
                                        {provincelist.data?.data.data?.map(
                                            (province) => (
                                                <option
                                                    key={province._id}
                                                    value={province._id}
                                                >
                                                    {province.province_name}
                                                </option>
                                            )
                                        )}
                                    </select>
                                    {wantedForm.touched.province && (
                                        <p className="err">
                                            {wantedForm.errors.province}
                                        </p>
                                    )}
                                </div>

                                <div className="col-md-6">
                                    <input
                                        type="text"
                                        name="city"
                                        placeholder="City"
                                        className="form-control"
                                        value={wantedForm.values.city}
                                        onChange={wantedForm.handleChange}
                                        disabled={!edit}
                                    />
                                    {wantedForm.touched.city && (
                                        <p className="err">
                                            {wantedForm.errors.city}
                                        </p>
                                    )}
                                </div>

                                <div className="col-md-6">
                                    <input
                                        type="text"
                                        name="suburb"
                                        placeholder="Suburb"
                                        className="form-control"
                                        value={wantedForm.values.suburb}
                                        onChange={wantedForm.handleChange}
                                        disabled={!edit}
                                    />
                                    {wantedForm.touched.suburb && (
                                        <p className="err">
                                            {wantedForm.errors.suburb}
                                        </p>
                                    )}
                                </div>

                                <div className="col-md-6">
                                    <input
                                        type="text"
                                        name="postal_code"
                                        placeholder="Postal Code"
                                        className="form-control"
                                        value={wantedForm.values.postal_code}
                                        onChange={wantedForm.handleChange}
                                        disabled={!edit}
                                    />
                                    {wantedForm.touched.postal_code && (
                                        <p className="err">
                                            {wantedForm.errors.postal_code}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>




                    <div className="col-md-12 text-end">
                        <div className="saveform">
                            {edit ? (
                                <button
                                    type="submit"
                                    onClick={wantedForm.handleSubmit}
                                    className="btn btn-dark"
                                >
                                    Save
                                </button>
                            ) : (
                                <button
                                    onClick={() => setedit(true)}
                                    className="btn btn-dark"
                                >
                                    Edit
                                </button>
                            )}
                        </div>
                    </div>


                </div>


            </div>
        </div >
    );
};

export default WantedPerson;

const setwantedFormvalues = ({ ...props }) => {
    const { form, data } = props;

    let newdata = {};

    Object.keys(form.values).forEach((key) => {
        if (key === "images") {
            newdata = {
                ...newdata,
                [key]: Array.from(
                    { length: 5 },
                    (_, i) => data?.[`image_${i + 1}`] || null
                ).filter(Boolean),
            };
        } else {
            newdata = { ...newdata, [key]: data?.[key] ?? "" };
        }
    });
    form.setValues(newdata);
};
