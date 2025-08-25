import { useEffect, useState, useLayoutEffect } from "react";
import { Grid, Paper, Typography, Box } from "@mui/material";
import { useFormik } from "formik";
import {
    profileValidation_c,
    profileValidation_s,
} from "../common/FormValidation";
import Select from "react-select";

import { useQueryClient } from "@tanstack/react-query";
import { useGetUser, useUpdateUser, useGetCountryList, useGetProvinceList, useGetServicesList } from "../API Calls/API";
import { toast } from "react-toastify";
import SingleImagePreview from "../common/SingleImagePreview";
import { toastOption } from "../common/ToastOptions";
import Loader from "../common/Loader";
import PhoneInput from "react-phone-input-2";

const SalesAgentHome = () => {
    const role = localStorage.getItem("role");
    const [time, setTime] = useState("today");
    const [timeTitle, setTimeTitle] = useState("Today");
    const [previewImage, setPreviewImage] = useState(null);
    const [isSingle, setIsSingle] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const client = useQueryClient();
    const [edit, setedit] = useState(false);



    useEffect(() => {
        switch (time) {
            case "today":
                setTimeTitle("Today");
                break;
            case "yesterday":
                setTimeTitle("Yesterday");
                break;
            case "this_week":
                setTimeTitle("This Week");
                break;
            case "this_month":
                setTimeTitle("This Month");
                break;
            case "this_year":
                setTimeTitle("This Year");
                break;
            default:
                setTimeTitle("Today");
                break;
        }
    }, [time]);
    const handleTimeChange = (e) => {
        setTime(e.target.value);
    };
    const onSuccess = () => {
        toast.success("Profile Update Successfully.");
        client.invalidateQueries("userinfo");
    };
    const onError = (error) => {
        toast.error(error.response.data.message || "Something went Wrong", toastOption);
    };
    const { mutate, isPending } = useUpdateUser(onSuccess, onError);
    const userinfo = useGetUser(localStorage.getItem("userID"));
    const profileForm = useFormik({
        initialValues: sales_agent,
        validationSchema: profileValidation_s,
        onSubmit: (values) => {
            setedit(false);
            const formData = new FormData();
            Object.keys(values).forEach((key) => {
                if (key !== "selfieImage" && key !== "fullImage") {
                    formData.append(key, values[key]);
                }
            });
            if (values.selfieImage && values.selfieImage instanceof File) {
                formData.append("selfieImage", values.selfieImage);
            }
            if (values.fullImage && values.fullImage instanceof File) {
                formData.append("fullImage", values.fullImage);
            }
            mutate({ id: localStorage.getItem("userID"), data: formData });
        },

    });

    const countrylist = useGetCountryList();
    const provincelist = useGetProvinceList(profileForm.values.country);

    useEffect(() => {
        console.log(profileForm.values)
        profileForm.setValues({
            first_name: userinfo.data?.data.user?.first_name || "",
            last_name: userinfo.data?.data.user?.last_name || "",
            email: userinfo.data?.data.user?.email || "",
            street: userinfo.data?.data.user?.street || "",
            province: userinfo.data?.data.user?.province || "",
            city: userinfo.data?.data.user?.city || "",
            suburb: userinfo.data?.data.user?.suburb || "",
            postal_code: userinfo.data?.data.user?.postal_code || "",
            country: userinfo.data?.data.user?.country || "",
            role: userinfo.data?.data.user?.role || "",
            mobile_no: userinfo.data?.data.user?.mobile_no || "",
            mobile_no_country_code: userinfo.data?.data.user?.mobile_no_country_code || "",
        });
    }, [userinfo.data]);


    return (
        <>
            <Grid container>
                <Grid size={12}>
                    <Box className='filter-date'>
                        <select
                            className="form-select"
                            value={time}
                            onChange={handleTimeChange}
                        >
                            <option value="today">Today</option>
                            <option value="yesterday">Yesterday</option>
                            <option value="this_week">This week</option>
                            <option value="this_month">This Month</option>
                            <option value="this_year">This Year</option>
                        </select>
                    </Box>
                </Grid>
            </Grid>
            <Grid container spacing={3} px={2}>

                {/* Total Companies */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper
                        elevation={3}
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            // textAlign: "center",
                            bgcolor: "#e3f5ff",
                        }}
                    >
                        <Typography variant="subtitle1" color="text.secondary">
                            Total Commission
                        </Typography>
                        <Typography variant="h4" fontWeight="bold">
                            20
                        </Typography>
                    </Paper>
                </Grid>



                {/* Users Active (time filter) */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper
                        elevation={3}
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            // textAlign: "center",
                            bgcolor: "#e3f5ff",
                        }}
                    >
                        <Typography variant="subtitle1" color="text.secondary" >
                            Total Users
                        </Typography>
                        <Typography variant="h4" fontWeight="bold">
                            34
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
            <div className="container-fluid mt-4">
                <div className="row">
                    <div className="col-md-12">
                        <div className="theme-table">
                            <div className="tab-heading">
                                <h3>Profile</h3>
                            </div>
                            <form>
                                <div className="row">
                                    <div className="col-md-6">
                                        <input
                                            type="text"
                                            name="first_name"
                                            placeholder="First Name"
                                            className="form-control"
                                            value={profileForm.values.first_name}
                                            onChange={profileForm.handleChange}
                                            disabled={!edit}
                                        />
                                        {profileForm.touched.first_name && (
                                            <p className="err">{profileForm.errors.first_name}</p>
                                        )}
                                    </div>
                                    <div className="col-md-6">
                                        <input
                                            type="text"
                                            name="last_name"
                                            placeholder="Last Name"
                                            className="form-control"
                                            value={profileForm.values.last_name}
                                            onChange={profileForm.handleChange}
                                            disabled={!edit}
                                        />
                                        {profileForm.touched.last_name && (
                                            <p className="err">{profileForm.errors.last_name}</p>
                                        )}
                                    </div>
                                    <div className="col-md-6">
                                        <input
                                            type="text"
                                            name="email"
                                            placeholder="Email"
                                            className="form-control"
                                            value={profileForm.values.email}
                                            onChange={profileForm.handleChange}
                                            disabled={!edit}
                                        />
                                        {profileForm.touched.email && (
                                            <p className="err">{profileForm.errors.email}</p>
                                        )}
                                    </div>
                                    <div className="col-md-6">
                                        <PhoneInput
                                            country={"za"}
                                            disabled={!edit}
                                            value={`${profileForm.values.mobile_no_country_code ?? ''}${profileForm.values.mobile_no ?? ''}`}
                                            onChange={(phone, countryData) => {
                                                const withoutCountryCode = phone.startsWith(countryData.dialCode)
                                                    ? phone.slice(countryData.dialCode.length).trim()
                                                    : phone;

                                                profileForm.setFieldValue("mobile_no", withoutCountryCode);
                                                profileForm.setFieldValue("mobile_no_country_code", `+${countryData.dialCode}`);
                                            }}
                                            inputClass="form-control"
                                        />
                                        {profileForm.touched.mobile_no && (
                                            <p className="err">{profileForm.errors.mobile_no}</p>
                                        )}
                                    </div>
                                    <div className="col-md-6">
                                        <input
                                            type="text"
                                            name="street"
                                            placeholder="Street"
                                            className="form-control"
                                            value={profileForm.values.street}
                                            onChange={profileForm.handleChange}
                                            disabled={!edit}
                                        />
                                        {profileForm.touched.street && (
                                            <p className="err">{profileForm.errors.street}</p>
                                        )}
                                    </div>
                                    <div className="col-md-6">
                                        <select
                                            name="country"
                                            className="form-control"
                                            value={profileForm.values.country}
                                            onChange={profileForm.handleChange}
                                            disabled={!edit}
                                        >
                                            <option value="" hidden>Country</option>
                                            {countrylist.data?.data.data?.map((country) => (
                                                <option key={country._id} value={country._id}>
                                                    {country.country_name}
                                                </option>
                                            ))}
                                        </select>
                                        {profileForm.touched.country && (
                                            <p className="err">{profileForm.errors.country}</p>
                                        )}
                                    </div>
                                    <div className="col-md-6">
                                        <select
                                            name="province"
                                            className="form-control"
                                            value={profileForm.values.province}
                                            disabled={!profileForm.values.country || !edit}
                                            onChange={profileForm.handleChange}
                                        >
                                            <option value="" hidden>Province</option>
                                            {provincelist.data?.data.data?.map((province) => (
                                                <option key={province._id} value={province._id}>
                                                    {province.province_name}
                                                </option>
                                            ))}
                                        </select>
                                        {profileForm.touched.province && (
                                            <p className="err">{profileForm.errors.province}</p>
                                        )}
                                    </div>
                                    <div className="col-md-6">
                                        <input
                                            type="text"
                                            name="city"
                                            placeholder="City"
                                            className="form-control"
                                            value={profileForm.values.city}
                                            onChange={profileForm.handleChange}
                                            disabled={!edit}
                                        />
                                        {profileForm.touched.city && (
                                            <p className="err">{profileForm.errors.city}</p>
                                        )}
                                    </div>
                                    <div className="col-md-6">
                                        <input
                                            type="text"
                                            name="suburb"
                                            placeholder="Suburb"
                                            className="form-control"
                                            value={profileForm.values.suburb}
                                            onChange={profileForm.handleChange}
                                            disabled={!edit}
                                        />
                                        {profileForm.touched.suburb && (
                                            <p className="err">{profileForm.errors.suburb}</p>
                                        )}
                                    </div>

                                    <div className="col-md-6">
                                        <input
                                            type="text"
                                            name="postal_code"
                                            placeholder="Postal Code"
                                            className="form-control"
                                            value={profileForm.values.postal_code}
                                            onChange={profileForm.handleChange}
                                            disabled={!edit}
                                        />
                                        {profileForm.touched.postal_code && (
                                            <p className="err">{profileForm.errors.postal_code}</p>
                                        )}
                                    </div>
                                    <div className="col-md-6">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <label>Selfie Image</label>

                                                {profileForm.values.selfieImage instanceof File ? (
                                                    <div className="form-control mt-2 img-preview-container"
                                                        style={{ cursor: "pointer" }}
                                                        onClick={() => openPreview(0)}>
                                                        <img
                                                            src={URL.createObjectURL(profileForm.values.selfieImage)}
                                                            alt="Selfie Preview"
                                                            className="img-preview"
                                                            width="100"
                                                            onLoad={(e) => URL.revokeObjectURL(e.target.src)}
                                                        />
                                                    </div>
                                                ) : (
                                                    userinfo.data?.data.user?.selfieImage && (
                                                        <div className="form-control mt-2 img-preview-container"
                                                            style={{ cursor: "pointer" }}
                                                            onClick={() => openPreview(0)}>
                                                            <img
                                                                src={userinfo.data?.data.user?.selfieImage}
                                                                alt="Selfie Image"
                                                                className="img-preview"
                                                                width="100"
                                                            />
                                                        </div>
                                                    )
                                                )}

                                                <div className="custom-file-input">
                                                    <input
                                                        type="file"
                                                        id="selfieImage"
                                                        accept="image/*"
                                                        disabled={!edit}
                                                        onChange={(event) => {
                                                            const file = event.currentTarget.files[0];
                                                            profileForm.setFieldValue("selfieImage", file);
                                                        }}
                                                    />
                                                    <label htmlFor="selfieImage">
                                                        Choose Selfie Image
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <label>Full Image</label>

                                                {profileForm.values.fullImage instanceof File ? (
                                                    <div className="form-control mt-2 img-preview-container"
                                                        style={{ cursor: "pointer" }}
                                                        onClick={() => openPreview(1)}>
                                                        <img
                                                            src={URL.createObjectURL(profileForm.values.fullImage)}
                                                            alt="full Image"
                                                            className="img-preview"
                                                            width="100"
                                                            onLoad={(e) => URL.revokeObjectURL(e.target.src)}
                                                        />
                                                    </div>
                                                ) : (
                                                    userinfo.data?.data.user?.fullImage && (
                                                        <div className="form-control mt-2 img-preview-container"
                                                            style={{ cursor: "pointer" }}
                                                            onClick={() => openPreview(1)}>
                                                            <img
                                                                src={userinfo.data?.data.user?.fullImage}
                                                                alt="full Image"
                                                                className="img-preview"
                                                                width="100"
                                                            />
                                                        </div>
                                                    )
                                                )}

                                                <div className="custom-file-input">
                                                    <input
                                                        type="file"
                                                        id="fullImage"
                                                        accept="image/*"
                                                        disabled={!edit}
                                                        onChange={(event) => {
                                                            const file = event.currentTarget.files[0];

                                                            profileForm.setFieldValue("fullImage", file);
                                                        }}
                                                    />
                                                    <label htmlFor="fullImage">
                                                        Choose Full Image
                                                    </label>
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
                            {edit ? (
                                <button
                                    onClick={profileForm.handleSubmit}
                                    type="submit"
                                    className="btn btn-dark"
                                >
                                    {isPending ? <Loader color="white" /> : "Save"}
                                </button>
                            ) : (
                                <button onClick={() => setedit(true)} className="btn btn-dark">
                                    Edit
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                <SingleImagePreview
                    show={showPreview}
                    onClose={() => {
                        setShowPreview(false);
                        setPreviewImage(null);
                    }}
                    image={previewImage}
                />
            </div>
        </>

    );
};

export default SalesAgentHome;

const sales_agent = {
    first_name: "",
    last_name: "",
    email: "",
    street: "",
    province: "",
    city: "",
    suburb: "",
    postal_code: "",
    country: "",
    role: "",
    mobile_no: "",
    mobile_no_country_code: "",
};
