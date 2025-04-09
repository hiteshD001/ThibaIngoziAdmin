import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { toast } from "react-toastify";
import { toastOption } from "../common/ToastOptions";

import { driverValidation } from "../common/FormValidation";

import { useFormik } from "formik";

import { useGetCountryList, useGetProvinceList, useRegister } from "../API Calls/API";
import { useQueryClient } from "@tanstack/react-query";

import Loader from "../common/Loader";
import PhoneInput from "react-phone-input-2";

const AddUser = () => {
    const client = useQueryClient();
    const [role] = useState(localStorage.getItem("role"));
    const nav = useNavigate();
    const [showPassword, setShowPassword] = useState(false);


    const userform = {
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        mobile_no: "",
        mobile_no_country_code: "",
        street: "",
        province: "",
        city: "",
        suburb: "",
        postal_code: "",
        country: "",
        id_no: "",
        role: "passanger",
        type: "email_pass",
        fcm_token: "fcm_token",
        selfieImage: "",
        fullImage: ""
    };

    const onSuccess = () => {
        toast.success("User added successfully.");
        UserForm.resetForm();
        client.invalidateQueries("user list");
        nav("/home/total-users");
    };

    const onError = (error) => {
        toast.error(error.response?.data?.message || "Something went wrong", toastOption);
    };

    const newUser = useRegister(onSuccess, onError);



    const UserForm = useFormik({
        initialValues: userform,
        validationSchema: driverValidation,
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
            newUser.mutate(formData);
        },
    });
    const countrylist = useGetCountryList();
    const provincelist = useGetProvinceList(UserForm.values.country);

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-md-12">
                    <div className="theme-table">
                        <form>
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="tab-heading">
                                        <h3>User Information</h3>
                                    </div>

                                    <input
                                        type="text"
                                        name="first_name"
                                        placeholder="First Name"
                                        className="form-control"
                                        value={UserForm.values.first_name}
                                        onChange={UserForm.handleChange}
                                    />
                                    {UserForm.touched.first_name && (
                                        <p className="err">{UserForm.errors.first_name}</p>
                                    )}
                                    <input
                                        type="text"
                                        name="last_name"
                                        placeholder="Last Name"
                                        className="form-control"
                                        value={UserForm.values.last_name}
                                        onChange={UserForm.handleChange}
                                    />
                                    {UserForm.touched.last_name && (
                                        <p className="err">{UserForm.errors.last_name}</p>
                                    )}
                                    <input
                                        type="text"
                                        name="email"
                                        placeholder="Email"
                                        className="form-control"
                                        value={UserForm.values.email}
                                        onChange={UserForm.handleChange}
                                    />
                                    {UserForm.touched.email && (
                                        <p className="err">{UserForm.errors.email}</p>
                                    )}

                                    <div className="position-relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            placeholder="Password"
                                            className="form-control"
                                            value={UserForm.values.password}
                                            onChange={UserForm.handleChange}
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
                                    {UserForm.touched.password && (
                                        <p className="err">{UserForm.errors.password}</p>
                                    )}

                                    <PhoneInput
                                        country={"za"} // Set default country
                                        value={`${UserForm.values.mobile_no_country_code ?? ''}${UserForm.values.mobile_no ?? ''}`}
                                        onChange={(phone, countryData) => {
                                            const withoutCountryCode = phone.startsWith(countryData.dialCode)
                                                ? phone.slice(countryData.dialCode.length).trim()
                                                : phone;

                                            UserForm.setFieldValue("mobile_no", withoutCountryCode);
                                            UserForm.setFieldValue("mobile_no_country_code", `+${countryData.dialCode}`);
                                        }}
                                        inputClass="form-control"
                                    />
                                    {UserForm.touched.mobile_no && (
                                        <p className="err">{UserForm.errors.mobile_no}</p>
                                    )}

                                    {/* <input
                                        type="text"
                                        name="mobile_no"
                                        placeholder="Mobile No."
                                        className="form-control"
                                        value={userform.values.mobile_no}
                                        onChange={userform.handleChange}
                                    />
                                    {userform.touched.mobile_no && (
                                        <p className="err">{userform.errors.mobile_no}</p>
                                    )} */}

                                    <input
                                        type="text"
                                        name="id_no"
                                        placeholder="ID No."
                                        className="form-control"
                                        value={UserForm.values.id_no}
                                        onChange={UserForm.handleChange}
                                    />
                                    {UserForm.touched.id_no && (
                                        <p className="err">{UserForm.errors.id_no}</p>
                                    )}
                                    <div className="row">
                                        <div className="col-md-6">
                                            <label>Selfie Image</label>

                                            {UserForm.values.selfieImage && (
                                                <div className="form-control mt-2 img-preview-container">
                                                    <img
                                                        src={URL.createObjectURL(UserForm.values.selfieImage)}
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
                                                        UserForm.setFieldValue("selfieImage", file);
                                                    }} />
                                                <label htmlFor="selfieImage">
                                                    {UserForm.values.selfieImage ? UserForm.values.selfieImage.name : "Choose Selfie Image"}
                                                </label>
                                            </div>


                                        </div>

                                        <div className="col-md-6">
                                            <label>Full Image</label>

                                            {UserForm.values.fullImage && (
                                                <div className="form-control img-preview-container mt-2">
                                                    <img
                                                        src={URL.createObjectURL(UserForm.values.fullImage)}
                                                        alt="Full Image Preview"
                                                        className="img-preview"
                                                        width="100"
                                                    />
                                                </div>
                                            )}

                                            <div className="custom-file-input">
                                                <input type="file" id="fullImage" accept="image/*"
                                                    onChange={(event) => {
                                                        const file = event.currentTarget.files[0];
                                                        UserForm.setFieldValue("fullImage", file);
                                                    }} />
                                                <label htmlFor="fullImage">
                                                    {UserForm.values.fullImage ? UserForm.values.fullImage.name : "Choose Full Image"}
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
                                        value={UserForm.values.street}
                                        onChange={UserForm.handleChange}
                                    />
                                    {UserForm.touched.street && (
                                        <p className="err">{UserForm.errors.street}</p>
                                    )}

                                    <select
                                        name="country"
                                        className="form-control"
                                        value={UserForm.values.country}
                                        onChange={UserForm.handleChange}
                                    >
                                        <option value="" hidden> Country </option>
                                        {countrylist.data?.data.data?.map((country) => (
                                            <option key={country._id} value={country._id}>
                                                {country.country_name}
                                            </option>
                                        ))}
                                    </select>
                                    {UserForm.touched.country && (
                                        <p className="err">{UserForm.errors.country}</p>
                                    )}

                                    <select
                                        name="province"
                                        className="form-control"
                                        value={UserForm.values.province}
                                        disabled={!UserForm.values.country}
                                        onChange={UserForm.handleChange}
                                    >
                                        <option value="" hidden>Province</option>
                                        {provincelist.data?.data.data?.map((province) => (
                                            <option key={province._id} value={province._id}>
                                                {province.province_name}
                                            </option>
                                        ))}
                                    </select>
                                    {UserForm.touched.province && (
                                        <p className="err">{UserForm.errors.province}</p>
                                    )}

                                    <input
                                        type="text"
                                        name="city"
                                        placeholder="City"
                                        className="form-control"
                                        value={UserForm.values.city}
                                        onChange={UserForm.handleChange}
                                    />
                                    {UserForm.touched.city && (
                                        <p className="err">{UserForm.errors.city}</p>
                                    )}

                                    <input
                                        type="text"
                                        name="suburb"
                                        placeholder="Suburb"
                                        className="form-control"
                                        value={UserForm.values.suburb}
                                        onChange={UserForm.handleChange}
                                    />
                                    {UserForm.touched.suburb && (
                                        <p className="err">{UserForm.errors.suburb}</p>
                                    )}

                                    <input
                                        type="text"
                                        name="postal_code"
                                        placeholder="Postal Code"
                                        className="form-control"
                                        value={UserForm.values.postal_code}
                                        onChange={UserForm.handleChange}
                                    />
                                    {UserForm.touched.postal_code && (
                                        <p className="err">{UserForm.errors.postal_code}</p>
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
                            onClick={UserForm.handleSubmit}
                            className="btn btn-dark"
                            disabled={newUser.isPending}
                        >
                            {newUser.isPending ? <Loader color="white" /> : "Save"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddUser;



