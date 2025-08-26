import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { toast } from "react-toastify";
import { toastOption } from "../common/ToastOptions";
import { driverValidation } from "../common/FormValidation";

import { useFormik } from "formik";

import { useGetCountryList, useGetProvinceList, useGetUserList, useRegister, useGeteHailingList, useGetBanksList } from "../API Calls/API";
import { useQueryClient } from "@tanstack/react-query";

import Loader from "../common/Loader";
import PhoneInput from "react-phone-input-2";

const AddDriver = () => {
    const client = useQueryClient();
    const [role] = useState(localStorage.getItem("role"))
    const nav = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    const driverForm = useFormik({
        initialValues: role === 'super_admin' ? formValues1 : formValues2,
        validationSchema: driverValidation,
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


    const handlecountryChange = (e) => {
        const { name, value } = e.target

        const companyname = companyList.data?.data.users.find((user) => user._id === value)?.company_name

        driverForm.setFieldValue(name, value)
        driverForm.setFieldValue('company_name', companyname)
    }
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
    const provincelist = useGetProvinceList(driverForm.values.country)
    const bankList = useGetBanksList();
    const countrylist = useGetCountryList()
    const eHailingList = useGeteHailingList()

    const eHailingOptions = eHailingList?.data?.data?.data?.map(item => ({
        label: item.name,
        value: item._id,
    })) || [];

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
                                            onChange={(e) => handlecountryChange(e)}
                                        // onChange={driverForm.handleChange}
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

                                    <div className="position-relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            placeholder="Password"
                                            className="form-control"
                                            value={driverForm.values.password}
                                            onChange={driverForm.handleChange}
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
                                    {driverForm.touched.password && (
                                        <p className="err">{driverForm.errors.password}</p>
                                    )}

                                    <PhoneInput
                                        country={"za"} // Set default country
                                        value={`${driverForm.values.mobile_no_country_code ?? ''}${driverForm.values.mobile_no ?? ''}`}
                                        onChange={(phone, countryData) => {
                                            const withoutCountryCode = phone.startsWith(countryData.dialCode)
                                                ? phone.slice(countryData.dialCode.length).trim()
                                                : phone;

                                            driverForm.setFieldValue("mobile_no", withoutCountryCode);
                                            driverForm.setFieldValue("mobile_no_country_code", `+${countryData.dialCode}`);
                                        }}
                                        inputClass="form-control"
                                    />
                                    {driverForm.touched.mobile_no && (
                                        <p className="err">{driverForm.errors.mobile_no}</p>
                                    )}

                                    {/* <input
                                        type="text"
                                        name="mobile_no"
                                        placeholder="Mobile No."
                                        className="form-control"
                                        value={driverForm.values.mobile_no}
                                        onChange={driverForm.handleChange}
                                    />
                                    {driverForm.touched.mobile_no && (
                                        <p className="err">{driverForm.errors.mobile_no}</p>
                                    )} */}

                                    <input
                                        type="text"
                                        name="id_no"
                                        placeholder="ID No./ Passport No."
                                        className="form-control"
                                        value={driverForm.values.id_no}
                                        onChange={driverForm.handleChange}
                                    />
                                    {driverForm.touched.id_no && (
                                        <p className="err">{driverForm.errors.id_no}</p>
                                    )}
                                    <select
                                        name="primary_e_hailing_company"
                                        className="form-control"
                                        value={driverForm.values.primary_e_hailing_company}
                                        onChange={(e) => {
                                            driverForm.setFieldValue("primary_e_hailing_company", e.target.value);
                                        }}
                                    >
                                        <option value="" hidden>Primary E-hailing Company</option>
                                        {eHailingOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    {/* <Select

                                        name="primary_e_hailing_company"
                                        options={eHailingOptions}
                                        classNamePrefix="select"
                                        placeholder="Primary E-hailing Company"
                                        className="form-control add-company-services"
                                        value={eHailingOptions.find(
                                            (option) => option.value === driverForm.values.primary_e_hailing_company
                                        )}
                                        onChange={(selectedOption) => {
                                            driverForm.setFieldValue("primary_e_hailing_company", selectedOption?.value || "");
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
                                    /> */}

                                    {/* {driverForm.touched.primary_e_hailing_company && driverForm.errors.primary_e_hailing_company && (
                                        <p className="err">{driverForm.errors.primary_e_hailing_company}</p>
                                    )} */}
                                    <label>Other eHailing platforms</label>
                                    <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', flexflexWrap: 'wrap', paddingTop: '10px' }}>
                                        {eHailingOptions.map((option) => (
                                            <div key={option.value} style={{ display: "flex", alignItems: "center", marginBottom: "4px", flexDirection: 'row' }}>
                                                <input
                                                    type="checkbox"
                                                    value={option.value}
                                                    checked={driverForm.values.other_e_hailing_company?.includes(option.value)}
                                                    onChange={(e) => {
                                                        const selected = driverForm.values.other_e_hailing_company || [];
                                                        const updated = e.target.checked
                                                            ? [...selected, e.target.value]
                                                            : selected.filter(id => id !== e.target.value);
                                                        driverForm.setFieldValue("other_e_hailing_company", updated);
                                                    }}
                                                />
                                                <span style={{ marginLeft: "8px" }}>{option.label}</span>
                                            </div>
                                        ))}
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
                                        value={driverForm.values.street}
                                        onChange={driverForm.handleChange}
                                    />
                                    {driverForm.touched.street && (
                                        <p className="err">{driverForm.errors.street}</p>
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

                                    <select
                                        name="province"
                                        className="form-control"
                                        value={driverForm.values.province}
                                        disabled={!driverForm.values.country}
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

                                    <div className=" form-checkbox form-control">
                                        <input
                                            type="checkbox"
                                            name="isArmed"
                                            id="isArmed"
                                            className="form-check-input"
                                            checked={driverForm.values.isArmed}
                                            onChange={(e) => driverForm.setFieldValue("isArmed", e.target.checked)}
                                        />
                                        <label className="form-check-label" htmlFor="isArmed">
                                            Security
                                        </label>
                                    </div>

                                    <div className=" form-checkbox form-control">
                                        <input
                                            type="checkbox"
                                            name="isPaymentToken"
                                            id="isPaymentToken"
                                            className="form-check-input"
                                            checked={driverForm.values.isPaymentToken}
                                            onChange={(e) => driverForm.setFieldValue("isPaymentToken", e.target.checked)}
                                        />
                                        <label className="form-check-label" htmlFor="isPaymentToken">
                                            Sos payment
                                        </label>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <label>Selfie Image</label>

                                            {driverForm.values.selfieImage && (
                                                <div className="form-control mt-2 img-preview-container">
                                                    <img
                                                        src={URL.createObjectURL(driverForm.values.selfieImage)}
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
                                                        driverForm.setFieldValue("selfieImage", file);
                                                    }} />
                                                <label htmlFor="selfieImage">
                                                    {driverForm.values.selfieImage ? driverForm.values.selfieImage.name : "Choose Selfie Image"}
                                                </label>
                                            </div>


                                        </div>

                                        <div className="col-md-6">
                                            <label>Full Image</label>

                                            {driverForm.values.fullImage && (
                                                <div className="form-control img-preview-container mt-2">
                                                    <img
                                                        src={URL.createObjectURL(driverForm.values.fullImage)}
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
                                                        driverForm.setFieldValue("fullImage", file);
                                                    }} />
                                                <label htmlFor="fullImage">
                                                    {driverForm.values.fullImage ? driverForm.values.fullImage.name : "Choose Full Image"}
                                                </label>
                                            </div>

                                        </div>
                                    </div>
                                    
                                </div>

                            </div>
                            <div className="row mt-4">
                                <div className="col-md-6">
                                    <input
                                        type="text"
                                        name="accountNumber"
                                        placeholder="Account Number"
                                        className="form-control"
                                        value={driverForm.values.accountNumber}
                                        onChange={driverForm.handleChange}
                                    />
                                    {driverForm.touched.accountNumber && (
                                        <p className="err">{driverForm.errors.accountNumber}</p>
                                    )}
                                    <input
                                        type="text"
                                        name="customerCode"
                                        placeholder="Customer Code"
                                        className="form-control"
                                        value={driverForm.values.customerCode}
                                        onChange={driverForm.handleChange}
                                    />
                                    {driverForm.touched.customerCode && (
                                        <p className="err">{driverForm.errors.customerCode}</p>
                                    )}
                                    <input
                                        type="text"
                                        name="accountType"
                                        placeholder="Account Type"
                                        className="form-control"
                                        value={driverForm.values.accountType}
                                        onChange={driverForm.handleChange}
                                    />
                                    {driverForm.touched.accountType && (
                                        <p className="err">{driverForm.errors.accountType}</p>
                                    )}
                                </div>
                                <div className="col-md-6">
                                    <input
                                        type="text"
                                        name="accountHolderName"
                                        placeholder="Account Holder Name"
                                        className="form-control"
                                        value={driverForm.values.accountHolderName}
                                        onChange={driverForm.handleChange}
                                    />
                                    {driverForm.touched.accountHolderName && (
                                        <p className="err">{driverForm.errors.accountHolderName}</p>
                                    )}
                                    <select
                                        name="bankId"
                                        className="form-control"
                                        value={driverForm.values.bankId}
                                        onChange={driverForm.handleChange}
                                    >
                                        <option value="" hidden>Bank</option>
                                        {bankList?.map((bank) => (
                                            <option key={bank._id} value={bank._id}>
                                                {bank.bank_name}
                                            </option>
                                        ))}
                                    </select>
                                    {driverForm.touched.bankId && (
                                        <p className="err">{driverForm.errors.bankId}</p>
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
    company_name: "",
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
    role: "driver",
    type: "email_pass",
    fcm_token: "fcm_token",
    isArmed: false,
    selfieImage: "",
    fullImage: "",
    primary_e_hailing_company: "",
    other_e_hailing_company: [],
    isPaymentToken: false,
}

const formValues2 = {
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
    role: "driver",
    type: "email_pass",
    fcm_token: "fcm_token",
    isArmed: false,
    selfieImage: "",
    fullImage: "",
    primary_e_hailing_company: "",
    other_e_hailing_company: [],
    isPaymentToken: false,
}
