import { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";

import { useFormik } from "formik";
import { vehicleValidation } from "../common/FormValidation";
import PayoutPopup from "../common/Popup";
import { useQueryClient } from "@tanstack/react-query";
import {
    useGetCountryList,
    useGetProvinceList,
    useGetUser,
    useGetUserList,
    useUpdateUser,
    useGeteHailingList,
    useGetBanksList
} from "../API Calls/API";
import SingleImagePreview from "../common/SingleImagePreview";
import { toast } from "react-toastify";
import { toastOption } from "../common/ToastOptions";
import ImagePreviewModal from "../common/ImagePreviewModal";
import PhoneInput from "react-phone-input-2";

const VehicleInformation = () => {
    const [edit, setedit] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isSingle, setIsSingle] = useState(false);
    const [role] = useState(localStorage.getItem("role"));
    const params = useParams();
    const client = useQueryClient();
    const CompanyId = localStorage.getItem("userID");

    const [payPopup, setPopup] = useState('')


    const driverform = useFormik({
        initialValues: {
            first_name: "",
            last_name: "",
            company_id: "",
            company_name: '',
            email: "",
            mobile_no: "",
            mobile_no_country_code: "",
            street: "",
            province: "",
            city: "",
            suburb: "",
            postal_code: "",
            country: "",
            isArmed: "",
            selfieImage: null,
            fullImage: null,
            hijakingPass: "",
            hijakingId: "",
            primary_e_hailing_company: "",
            other_e_hailing_company: [],
            passport_no: "",
            isPaymentToken: "",
            accountNumber: "",
            customerCode: "",
            accountType: "",
            account_holder_name: "",
            bankId: "",
        },
        validationSchema: vehicleValidation,
        onSubmit: (values) => {
            setedit(false);
            const formData = new FormData();

            Object.keys(values).forEach((key) => {
                if (key !== "selfieImage" && key !== "fullImage") {
                    if (key === "other_e_hailing_company") {
                        const cleanedIds = (Array.isArray(values[key]) ? values[key] : [])
                            .filter(id => typeof id === 'string' && /^[a-f\d]{24}$/i.test(id)); // Only valid ObjectIDs
                        formData.append("other_e_hailing_company", cleanedIds.join(","));
                    } else {
                        formData.append(key, values[key]);
                    }
                }
            });

            if (values.selfieImage && values.selfieImage instanceof File) {
                formData.append("selfieImage", values.selfieImage);
            }

            if (values.fullImage && values.fullImage instanceof File) {
                formData.append("fullImage", values.fullImage);
            }

            mutate({ id: params.id, data: formData });
        }

    });


    const vehicleForm = useFormik({
        initialValues: {
            vehicle_name: "",
            type: "",
            reg_no: "",
            images: [],
        },
    });

    const emergencyform = useFormik({
        initialValues: {
            emergency_contact_1_contact: "",
            emergency_contact_1_email: "",
            emergency_contact_2_contact: "",
            emergency_contact_2_email: "",
            emergency_contact_2_country_code: "",
            emergency_contact_1_country_code: "",
        },
    });

    const vehicleInfo = useGetUser(params.id);
    const companyList = useGetUserList("company list", "company");
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

    const provincelist = useGetProvinceList(driverform.values.country);
    const countrylist = useGetCountryList();

    useEffect(() => {
        const data = vehicleInfo.data?.data;

        if (data) {
            const user = data.user;
            // driverform.values.bankId = 
            data.user.bankId = data.user.bankId ? data.user.bankId._id: null;
            // data.user.account_holder_name = data.user.accountHolderName;
            setdriverformvalues({
                form: driverform,
                data: {
                    ...user,
                    other_e_hailing_company: user.other_e_hailing_company
                        ? user.other_e_hailing_company.split(",").filter(Boolean)
                        : [],
                },
            });
            setdriverformvalues({ form: emergencyform, data: data.user });

            const vehicleData = data.vehicle?.[0];

            if (vehicleData) {
                vehicleForm.setValues({
                    vehicle_name: vehicleData.vehicle_name || "",
                    type: vehicleData.type || "",
                    reg_no: vehicleData.reg_no || "",
                    images: [
                        vehicleData.image_front_side,
                        vehicleData.image_back_side,
                        vehicleData.image_left_side,
                        vehicleData.image_right_side,
                        vehicleData.image_car_number_plate,
                        vehicleData.image_driver_license,
                    ].filter(Boolean),
                });
            }
            // console.log('driver', driverform.values)
        }
    }, [vehicleInfo.data]);
    const handleChange = () => {
        alert('in progress')
    };

    const handlePopup = (event, type) => {
        event.stopPropagation();
        setPopup(type);
    };

    const closePopup = (event) => {
        // event.stopPropagation();
        setPopup('')
    }
    const renderPopup = () => {
        switch (payPopup) {
            case 'payout':
                return <PayoutPopup yesAction={handleChange} noAction={closePopup} />;
            default:
                return null;
        }
    };
    const eHailingList = useGeteHailingList()

    const eHailingOptions = eHailingList?.data?.data?.data?.map(item => ({
        label: item.name,
        value: item._id,
    })) || [];


    const imageList = [
        { label: "Front Side", src: vehicleForm.values.images[0] },
        { label: "Back Side", src: vehicleForm.values.images[1] },
        { label: "Left Side", src: vehicleForm.values.images[2] },
        { label: "Right Side", src: vehicleForm.values.images[3] },
        { label: "Car Number Plate", src: vehicleForm.values.images[4] },
        { label: "License DISC Image", src: vehicleForm.values.images[5] },
    ].filter(img => img.src);

    const openPreview = (index) => {
        if (index === 6) {
            // Selfie
            const image =
                driverform.values.selfieImage instanceof File
                    ? { label: "Selfie Image", src: URL.createObjectURL(driverform.values.selfieImage) }
                    : { label: "Selfie Image", src: vehicleInfo.data?.data.user?.selfieImage };

            setPreviewImage(image);
            setIsSingle(true);
            setShowPreview(true);
            return;
        }
        if (index === 7) {
            // Full
            const image =
                driverform.values.fullImage instanceof File
                    ? { label: "Full Image", src: URL.createObjectURL(driverform.values.fullImage) }
                    : { label: "Full Image", src: vehicleInfo.data?.data.user?.fullImage };

            setPreviewImage(image);
            setIsSingle(true);
            setShowPreview(true);
            return;
        }

        // Vehicle Images
        setCurrentIndex(index);
        setIsSingle(false);
        setShowPreview(true);
    };
    const bankList = useGetBanksList();
    const nextImage = () => setCurrentIndex((i) => (i + 1) % imageList.length);
    const prevImage = () => setCurrentIndex((i) => (i - 1 + imageList.length) % imageList.length);
    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-md-12">
                    <div className="theme-table">
                        <div className="tab-heading">
                            <h3>Driver Information</h3>
                        </div>
                        <form>
                            <div className="row">
                                <div className="col-md-6">
                                    <input
                                        type="text"
                                        name="first_name"
                                        placeholder="Name"
                                        className="form-control"
                                        value={driverform.values.first_name}
                                        onChange={driverform.handleChange}
                                        disabled={!edit}
                                    />
                                    {driverform.touched.first_name && (
                                        <p className="err">
                                            {driverform.errors.first_name}
                                        </p>
                                    )}
                                </div>
                                <div className="col-md-6">
                                    <input
                                        type="text"
                                        name="last_name"
                                        placeholder="Surname"
                                        className="form-control"
                                        value={driverform.values.last_name}
                                        onChange={driverform.handleChange}
                                        disabled={!edit}
                                    />
                                    {driverform.touched.last_name && (
                                        <p className="err">
                                            {driverform.errors.last_name}
                                        </p>
                                    )}
                                </div>
                                <div className="col-md-6">
                                    <select
                                        name="company_id"
                                        className="form-control"
                                        value={driverform.values.company_id ?? ""}
                                        onChange={(e) => {
                                            const selectedId = e.target.value;
                                            const selectedCompany = companyList.data?.data.users.find(
                                                (user) => user?._id == selectedId
                                            );
                                            driverform.setFieldValue("company_id", selectedCompany?._id || null);
                                            driverform.setFieldValue("company_name", selectedCompany?.company_name || "");

                                        }}
                                        disabled={role !== "super_admin" || !edit}
                                    >
                                        <option value="" hidden>Others</option>
                                        {companyList.data?.data.users.map((user) => (
                                            <option key={user._id} value={user?._id}>
                                                {user.company_name}
                                            </option>
                                        ))}
                                    </select>
                                    {driverform.touched.company_id && (
                                        <p className="err">
                                            {driverform.errors.company_id}
                                        </p>
                                    )}
                                </div>
                                {/* <div className="col-md-6">
                                    <input
                                        type="text"
                                        name="company_name"
                                        placeholder="Company Name"
                                        className="form-control"
                                        value={vehicleForm.values.company_name}
                                        onChange={vehicleForm.handleChange}
                                        disabled={!edit}
                                    />
                                    {vehicleForm.touched.company_name && <p className="err">{vehicleForm.errors.company_name}</p>}
                                </div> */}
                                <div className="col-md-6">
                                    <input
                                        type="text"
                                        name="email"
                                        placeholder="Email"
                                        className="form-control"
                                        value={driverform.values.email}
                                        onChange={driverform.handleChange}
                                        disabled={!edit}
                                    />
                                    {driverform.touched.email && (
                                        <p className="err">
                                            {driverform.errors.email}
                                        </p>
                                    )}
                                </div>
                                <div className="col-md-6">
                                    <PhoneInput
                                        country={"za"}
                                        disabled={!edit}
                                        value={`${driverform.values
                                            .mobile_no_country_code ?? ""
                                            }${driverform.values.mobile_no ?? ""}`}
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

                                            driverform.setFieldValue(
                                                "mobile_no",
                                                withoutCountryCode
                                            );
                                            driverform.setFieldValue(
                                                "mobile_no_country_code",
                                                `+${countryData.dialCode}`
                                            );
                                        }}
                                        inputClass="form-control"
                                    />
                                    {driverform.touched.mobile_no && (
                                        <p className="err">
                                            {driverform.errors.mobile_no}
                                        </p>
                                    )}
                                    {/* <input
                                        type="text"
                                        name="mobile_no"
                                        placeholder="Mobile No."
                                        className="form-control"
                                        value={driverform.values.mobile_no}
                                        onChange={driverform.handleChange}
                                        disabled={!edit}
                                    />
                                    {driverform.touched.mobile_no && <p className="err">{driverform.errors.mobile_no}</p>} */}
                                </div>
                                <div className="col-md-6">
                                    <input
                                        type="text"
                                        name="passport_no"
                                        placeholder="Passport number"
                                        className="form-control"
                                        value={driverform.values.passport_no}
                                        onChange={driverform.handleChange}
                                        disabled={!edit}
                                    />
                                    {driverform.touched.passport_no && (
                                        <p className="err">
                                            {driverform.errors.passport_no}
                                        </p>
                                    )}
                                </div>
                                <div className="col-md-6">
                                    <input
                                        type="text"
                                        name="hijakingId"
                                        placeholder="Device IMEI number"
                                        className="form-control"
                                        value={driverform.values.hijakingId}
                                        onChange={driverform.handleChange}
                                        disabled={!edit}
                                    />
                                    {driverform.touched.hijakingId && (
                                        <p className="err">
                                            {driverform.errors.hijakingId}
                                        </p>
                                    )}
                                </div>
                                <div className="col-md-6">
                                    <input
                                        type="text"
                                        name="hijakingPass"
                                        placeholder="Device Password"
                                        style={{ marginBottom: '0px' }}
                                        className="form-control"
                                        value={driverform.values.hijakingPass}
                                        onChange={driverform.handleChange}
                                        disabled={!edit}
                                    />
                                    <div
                                        className="alert  mt-1 mb-1 mb-0 py-1 px-3"
                                        style={{ fontSize: "13px" }}
                                    >
                                        <strong>Note:</strong> Password should be the last 6 digits of the IMEI number.
                                    </div>
                                    {/* {driverform.touched.hijakingPass && (
                                        <p className="err">
                                            {driverform.errors.hijakingPass}
                                        </p>
                                    )} */}
                                </div>
                                <div className="col-md-6">
                                    <div className=" form-checkbox form-control">
                                        <input
                                            type="checkbox"
                                            name="isArmed"
                                            id="isArmed"
                                            className="form-check-input"
                                            checked={driverform.values.isArmed}
                                            onChange={(e) =>
                                                driverform.setFieldValue(
                                                    "isArmed",
                                                    e.target.checked
                                                )
                                            }
                                            disabled={!edit}
                                        />
                                        <label
                                            className="form-check-label"
                                            htmlFor="isArmed"
                                        >
                                            Security
                                        </label>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-checkbox form-control">
                                        <input
                                            type="checkbox"
                                            name="isPaymentToken"
                                            id="isPaymentToken"
                                            className="form-check-input"
                                            checked={driverform.values.isPaymentToken}
                                            onChange={(e) =>
                                                driverform.setFieldValue(
                                                    "isPaymentToken",
                                                    e.target.checked
                                                )
                                            }
                                            disabled={!edit}
                                        />
                                        <label
                                            className="form-check-label"
                                            htmlFor="isPaymentToken"
                                        >
                                            Sos Payment
                                        </label>
                                    </div>
                                </div>
                                <div className="col-md-6">

                                    <select
                                        name="primary_e_hailing_company"
                                        className="form-control"
                                        value={driverform.values.primary_e_hailing_company}
                                        onChange={(e) => {
                                            driverform.setFieldValue("primary_e_hailing_company", e.target.value);
                                        }}
                                        disabled={!edit}
                                    >
                                        <option value="" hidden>Select E-Hailing Company</option>
                                        {eHailingOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>

                                    {/* Validation Error */}
                                    {driverform.touched.primary_e_hailing_company && (
                                        <p className="err">{driverform.errors.primary_e_hailing_company}</p>
                                    )}


                                </div>
                                <div className="col-md-6">
                                    <label>Other eHailing platforms</label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', paddingTop: '10px' }}>
                                        {eHailingOptions.map((option) => (
                                            <div
                                                key={option.value}
                                                style={{ display: "flex", alignItems: "center", marginBottom: "4px" }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    value={option.value}
                                                    disabled={!edit}
                                                    className="form-check-input"
                                                    checked={driverform.values.other_e_hailing_company?.includes(option.value)}
                                                    onChange={(e) => {
                                                        const selected = driverform.values.other_e_hailing_company || [];
                                                        const updated = e.target.checked
                                                            ? [...selected, option.value]
                                                            : selected.filter(id => id !== option.value);
                                                        driverform.setFieldValue("other_e_hailing_company", updated);
                                                    }}
                                                />
                                                <span style={{ marginLeft: "8px" }}>{option.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* <div className="col-md-6">
                                    <div className="alert p-2 mb-2" style={{ fontSize: '14px' }}>
                                        <strong>Note:</strong> Password should be last 6 digits of IMEI number.
                                    </div>
                                </div> */}

                                <div className="col-md-12">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <label>Selfie Image</label>

                                                    {driverform.values
                                                        .selfieImage instanceof File ? (
                                                        <div className="form-control mt-2 img-preview-container"
                                                            style={{ cursor: "pointer" }}
                                                            onClick={() => openPreview(6)}>
                                                            <img
                                                                src={URL.createObjectURL(
                                                                    driverform.values
                                                                        .selfieImage
                                                                )}
                                                                alt="Selfie Preview"
                                                                className="img-preview"
                                                                width="100"
                                                                onLoad={(e) =>
                                                                    URL.revokeObjectURL(
                                                                        e.target.src
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    ) : (
                                                        vehicleInfo.data?.data.user
                                                            ?.selfieImage && (
                                                            <div className="form-control mt-2 img-preview-container"
                                                                style={{ cursor: "pointer" }}
                                                                onClick={() => openPreview(6)}>
                                                                <img
                                                                    src={
                                                                        vehicleInfo.data
                                                                            ?.data.user
                                                                            ?.selfieImage
                                                                    }
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
                                                                const file =
                                                                    event.currentTarget
                                                                        .files[0];
                                                                driverform.setFieldValue(
                                                                    "selfieImage",
                                                                    file
                                                                );
                                                            }}
                                                        />
                                                        <label htmlFor="selfieImage">
                                                            Choose Selfie Image
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <label>Full Image</label>

                                                    {driverform.values
                                                        .fullImage instanceof File ? (
                                                        <div className="form-control mt-2 img-preview-container"
                                                            style={{ cursor: "pointer" }}
                                                            onClick={() => openPreview(7)}>
                                                            <img
                                                                src={URL.createObjectURL(
                                                                    driverform.values
                                                                        .fullImage
                                                                )}
                                                                alt="full Image"
                                                                className="img-preview"
                                                                width="100"
                                                                onLoad={(e) =>
                                                                    URL.revokeObjectURL(
                                                                        e.target.src
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    ) : (
                                                        vehicleInfo.data?.data.user
                                                            ?.fullImage && (
                                                            <div className="form-control mt-2 img-preview-container"
                                                                style={{ cursor: "pointer" }}
                                                                onClick={() => openPreview(7)}>
                                                                <img
                                                                    src={
                                                                        vehicleInfo.data
                                                                            ?.data.user
                                                                            ?.fullImage
                                                                    }
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
                                                                const file =
                                                                    event.currentTarget
                                                                        .files[0];
                                                                driverform.setFieldValue(
                                                                    "fullImage",
                                                                    file
                                                                );
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
                                        value={driverform.values.street}
                                        onChange={driverform.handleChange}
                                        disabled={!edit}
                                    />
                                    {driverform.touched.street && (
                                        <p className="err">
                                            {driverform.errors.street}
                                        </p>
                                    )}
                                </div>

                                <div className="col-md-6">
                                    <select
                                        name="country"
                                        className="form-control"
                                        value={driverform.values.country}
                                        onChange={driverform.handleChange}
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
                                    {driverform.touched.country && (
                                        <p className="err">
                                            {driverform.errors.country}
                                        </p>
                                    )}
                                </div>

                                <div className="col-md-6">
                                    <select
                                        name="province"
                                        className="form-control"
                                        disabled={
                                            !driverform.values.country || !edit
                                        }
                                        value={driverform.values.province}
                                        onChange={driverform.handleChange}
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
                                    {driverform.touched.province && (
                                        <p className="err">
                                            {driverform.errors.province}
                                        </p>
                                    )}
                                </div>

                                <div className="col-md-6">
                                    <input
                                        type="text"
                                        name="city"
                                        placeholder="City"
                                        className="form-control"
                                        value={driverform.values.city}
                                        onChange={driverform.handleChange}
                                        disabled={!edit}
                                    />
                                    {driverform.touched.city && (
                                        <p className="err">
                                            {driverform.errors.city}
                                        </p>
                                    )}
                                </div>

                                <div className="col-md-6">
                                    <input
                                        type="text"
                                        name="suburb"
                                        placeholder="Suburb"
                                        className="form-control"
                                        value={driverform.values.suburb}
                                        onChange={driverform.handleChange}
                                        disabled={!edit}
                                    />
                                    {driverform.touched.suburb && (
                                        <p className="err">
                                            {driverform.errors.suburb}
                                        </p>
                                    )}
                                </div>

                                <div className="col-md-6">
                                    <input
                                        type="text"
                                        name="postal_code"
                                        placeholder="Postal Code"
                                        className="form-control"
                                        value={driverform.values.postal_code}
                                        onChange={driverform.handleChange}
                                        disabled={!edit}
                                    />
                                    {driverform.touched.postal_code && (
                                        <p className="err">
                                            {driverform.errors.postal_code}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="theme-table">
                        <div className="tab-heading">
                            <h3>Vehicle Information</h3>
                        </div>
                        <form>
                            <div className="row">
                                <div className="col-md-6">
                                    <input
                                        type="text"
                                        name="vehicle_name"
                                        placeholder="Vehicle Name"
                                        className="form-control"
                                        value={vehicleForm.values.vehicle_name}
                                        onChange={vehicleForm.handleChange}
                                        disabled
                                    />
                                </div>
                                <div className="col-md-6">
                                    <input
                                        type="text"
                                        name="type"
                                        placeholder="Vehicle Type"
                                        className="form-control"
                                        value={vehicleForm.values.type}
                                        onChange={vehicleForm.handleChange}
                                        disabled
                                    />
                                </div>
                                <div className="col-md-6">
                                    <input
                                        type="text"
                                        name="reg_no"
                                        placeholder="Vehicle Registration No."
                                        className="form-control"
                                        value={vehicleForm.values.reg_no}
                                        onChange={vehicleForm.handleChange}
                                        disabled
                                    />
                                </div>
                                {vehicleForm.values.images &&
                                    vehicleForm?.values?.images?.length > 0 && (
                                        <div className="col-md-12">
                                            <div className="vehiclpic">
                                                <span className="fw-bold">
                                                    Vehicle Images
                                                </span>
                                                <div className="row">
                                                    {[
                                                        { label: "Front Side" },
                                                        { label: "Back Side" },
                                                        { label: "Left Side" },
                                                        { label: "Right Side" },
                                                        {
                                                            label: "Car Number Plate",
                                                        },
                                                        {
                                                            label: "License DISC Image",
                                                        },
                                                    ].map(
                                                        (item, index) =>
                                                            vehicleForm.values
                                                                .images[
                                                            index
                                                            ] && (
                                                                <div
                                                                    key={index}
                                                                    className="col-6 col-md-4 mb-3 text-center"
                                                                >
                                                                    <h6 className="text-muted">
                                                                        {
                                                                            item.label
                                                                        }
                                                                    </h6>
                                                                    <div
                                                                        className="border rounded p-3 d-flex flex-column align-items-center justify-content-center"
                                                                        style={{
                                                                            minHeight:
                                                                                "250px",
                                                                            backgroundColor:
                                                                                "#f5f5f5",
                                                                            cursor: "pointer"
                                                                        }}
                                                                        onClick={() => openPreview(index)}
                                                                    >
                                                                        <img
                                                                            src={
                                                                                vehicleForm
                                                                                    .values
                                                                                    .images[
                                                                                index
                                                                                ]
                                                                            }
                                                                            alt={
                                                                                item.label
                                                                            }
                                                                            className="img-fluid rounded"
                                                                            style={{
                                                                                maxHeight:
                                                                                    "200px",
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                            </div>
                        </form>
                    </div>

                    <div className="theme-table">
                        <div className="tab-heading">
                            <h3>Emergency Contact</h3>
                        </div>
                        <form>
                            <div className="row">
                                <div className="col-md-6">
                                    <input
                                        type="text"
                                        name="emergency_contact_1_email"
                                        placeholder="emergencycontact@gu.link"
                                        className="form-control"
                                        value={
                                            emergencyform.values
                                                .emergency_contact_1_email
                                        }
                                        onChange={emergencyform.handleChange}
                                        disabled
                                    />
                                </div>
                                <div className="col-md-6">
                                    {/* <input
                                        type="text"
                                        name="emergency_contact_1_contact"
                                        placeholder="Contact No."
                                        className="form-control"
                                        value={emergencyform.values.emergency_contact_1_contact}
                                        onChange={emergencyform.handleChange}
                                        disabled
                                    /> */}
                                    <PhoneInput
                                        country={"za"}
                                        disabled={!edit}
                                        value={`${emergencyform.values
                                            .emergency_contact_1_country_code ??
                                            ""
                                            }${emergencyform.values
                                                ?.emergency_contact_1_contact ??
                                            ""
                                            }`}
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

                                            emergencyform.setFieldValue(
                                                "mobile_no",
                                                withoutCountryCode
                                            );
                                            emergencyform.setFieldValue(
                                                "mobile_no_country_code",
                                                `+${countryData.dialCode}`
                                            );
                                        }}
                                        inputClass="form-control"
                                    />
                                </div>
                                <div className="col-md-6">
                                    <input
                                        type="text"
                                        name="emergency_contact_2_email"
                                        placeholder="emergencycontact@gu.link"
                                        className="form-control"
                                        value={
                                            emergencyform.values
                                                ?.emergency_contact_2_email
                                        }
                                        onChange={emergencyform.handleChange}
                                        disabled
                                    />
                                </div>
                                <div className="col-md-6">
                                    {/* <input
                                        type="text"
                                        name="emergency_contact_2_contact"
                                        placeholder="Contact No."
                                        className="form-control"
                                        value={`${emergencyform.values.emergency_contact_2_country_code} ${emergencyform.values.emergency_contact_2_contact}`}
                                        onChange={emergencyform.handleChange}
                                        disabled
                                    /> */}
                                    <PhoneInput
                                        country={"za"}
                                        disabled={!edit}
                                        value={`${emergencyform.values
                                            .emergency_contact_2_country_code ??
                                            ""
                                            }${emergencyform.values
                                                .emergency_contact_2_contact ??
                                            ""
                                            }`}
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

                                            emergencyform.setFieldValue(
                                                "mobile_no",
                                                withoutCountryCode
                                            );
                                            emergencyform.setFieldValue(
                                                "mobile_no_country_code",
                                                `+${countryData.dialCode}`
                                            );
                                        }}
                                        inputClass="form-control"
                                    />
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="theme-table">
                        <div className="tab-heading">
                            <h3>Bank Details</h3>
                        </div>
                        <form>
                        <div className="row mt-4">
                                <div className="col-md-6">
                                    <input
                                        type="text"
                                        name="accountNumber"
                                        placeholder="Account Number"
                                        className="form-control"
                                        value={driverform.values.accountNumber}
                                        onChange={driverform.handleChange}
                                        disabled={!edit}
                                    />
                                    {driverform.touched.accountNumber && (
                                        <p className="err">{driverform.errors.accountNumber}</p>
                                    )}
                                    <input
                                        type="text"
                                        name="customerCode"
                                        placeholder="Customer Code"
                                        className="form-control"
                                        value={driverform.values.customerCode}
                                        onChange={driverform.handleChange}
                                        disabled={!edit}
                                    />
                                    {driverform.touched.customerCode && (
                                        <p className="err">{driverform.errors.customerCode}</p>
                                    )}
                                    <input
                                        type="text"
                                        name="accountType"
                                        placeholder="Account Type"
                                        className="form-control"
                                        value={driverform.values.accountType}
                                        onChange={driverform.handleChange}
                                        disabled={!edit}
                                    />
                                    {driverform.touched.accountType && (
                                        <p className="err">{driverform.errors.accountType}</p>
                                    )}
                                </div>
                                <div className="col-md-6">
                                    <input
                                        type="text"
                                        name="account_holder_name"
                                        placeholder="Account Holder Name"
                                        className="form-control"
                                        value={driverform.values.account_holder_name}
                                        onChange={driverform.handleChange}
                                        disabled={!edit}
                                    />
                                    {driverform.touched.account_holder_name && (
                                        <p className="err">{driverform.errors.account_holder_name}</p>
                                    )}
                                    <select
                                        name="bankId"
                                        className="form-control"
                                        value={driverform.values.bankId}
                                        onChange={driverform.handleChange}
                                        disabled={!edit}
                                    >
                                        <option value="" hidden>Bank</option>
                                        {bankList?.map((bank) => (
                                            <option key={bank._id} value={bank._id}>
                                                {bank.bank_name}
                                            </option>
                                        ))}
                                    </select>
                                    {driverform.touched.bankId && (
                                        <p className="err">{driverform.errors.bankId}</p>
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
                                    onClick={driverform.handleSubmit}
                                    className="btn btn-dark"
                                >
                                    Save
                                </button>
                            ) : (
                                <button
                                    onClick={() => setedit(true)}
                                    className="btn btn-dark"
                                    disabled={CompanyId !== driverform.values.company_id && role !== 'super_admin'}
                                >
                                    Edit
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="theme-table">
                        <div className="tab-heading">
                            <h3>Armed SOS</h3>
                        </div>

                        <table
                            className="table table-striped nowrap"
                            style={{ width: "100%" }}
                        >
                            <thead>
                                <tr>
                                    <th>Armed User</th>
                                    <th>Responder</th>
                                    <th>Status</th>
                                    <th>Radius</th>
                                    <th>Armed Location</th>
                                    <th>&nbsp;</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vehicleInfo?.data?.data?.armedSos?.length > 0 ? (
                                    vehicleInfo.data.data.armedSos.map((sos, index) => (
                                        <tr key={index}>
                                            <td>
                                                {sos.armedUserId
                                                    ? `${sos.armedUserId.first_name || ""} ${sos.armedUserId.last_name || ""}`
                                                    : "Unknown"}
                                            </td>
                                            <td>
                                                {sos?.responders?.map((responder, i) => (
                                                    <div key={i}>
                                                        {responder?.armedUserId?.first_name} {responder?.armedUserId?.last_name}
                                                    </div>
                                                ))}
                                            </td>
                                            <td>{sos?.armedSosstatus}</td>
                                            <td>{sos?.armedLocationId?.armedRadius}</td>
                                            <td>
                                                {sos.armedLocationId
                                                    ? `${sos.armedLocationId.city ? sos.armedLocationId.city + "," : ""} ${sos.armedLocationId.street ? sos.armedLocationId.street + "," : ""} ${sos.armedLocationId.suburb || ""}`
                                                    : "Unknown"}
                                            </td>
                                            <td>
                                                <NavLink
                                                    to={`/home/total-drivers/sos-information/${sos._id}`}
                                                    style={{ marginRight: "5px" }}
                                                    className="tbl-btn"
                                                >
                                                    view
                                                </NavLink>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: 'center' }}>
                                            No data found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="theme-table payout-section">
                        <div className="payout-info">
                            <div className="tab-heading">
                                <h3>Driver Payout</h3>
                            </div>
                            <h4 className="payout-amount">Amount: {driverform.data?.data.totalDriverAmount || 0}</h4>
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={(event) => handlePopup(event, 'payout', 'driver')}
                            disabled={edit}
                        >
                            Pay
                        </button>
                        {renderPopup()}
                    </div>

                </div>


            </div>
            {isSingle ? (
                <SingleImagePreview
                    show={showPreview}
                    onClose={() => {
                        setShowPreview(false);
                        setPreviewImage(null);
                    }}
                    image={previewImage}
                />
            ) : (
                <ImagePreviewModal
                    images={imageList}
                    currentIndex={currentIndex}
                    show={showPreview}
                    onClose={() => setShowPreview(false)}
                    onNext={nextImage}
                    onPrev={prevImage}
                />
            )}

        </div >
    );
};

export default VehicleInformation;

const setdriverformvalues = ({ ...props }) => {
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

        } else if (key === 'company_id') {
            newdata = { ...newdata, [key]: data?.company_id?._id ?? '' };
        } else {
            newdata = { ...newdata, [key]: data?.[key] ?? "" };
        }
    });
    form.setValues(newdata);
};
