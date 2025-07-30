import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

import { useFormik } from "formik"
import { vehicleValidation } from "../common/FormValidation"

import { useQueryClient } from "@tanstack/react-query"
import { useGetCountryList, useGetProvinceList, useGetUser, useGetUserList, useUpdateUser } from "../API Calls/API"

import { toast } from "react-toastify"
import { toastOption } from "../common/ToastOptions"
import PhoneInput from "react-phone-input-2"

const PassangerInformation = () => {
    const [edit, setEdit] = useState(false)
    const [role] = useState(localStorage.getItem("role"));
    const params = useParams();
    const client = useQueryClient()

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
            fullImage: null
        },
        validationSchema: vehicleValidation
    })

    // console.log('company_name', driverform.values.company_name)
    // console.log('company_id', driverform.values.company_id?._id)

    const submithandler = (values) => {
        setEdit(false);
        const formData = new FormData();
        Object.keys(values).forEach(key => {
            if (key !== 'selfieImage' && key !== 'fullImage') {
                formData.append(key, values[key]);
            }
        });

        if (values.selfieImage && values.selfieImage instanceof File) {
            formData.append("selfieImage", values.selfieImage);
        }

        if (values.fullImage && values.fullImage instanceof File) {
            formData.append("fullImage", values.fullImage);
        }

        mutate({ id: params.id, data: formData })
    }

    const emergencyform = useFormik({
        initialValues: {
            emergency_contact_1_contact: "",
            emergency_contact_1_email: "",
            emergency_contact_2_contact: "",
            emergency_contact_2_email: "",
        }
    })

    const UserInfo = useGetUser(params.id)
    const onSuccess = () => {
        toast.success("User Updated Successfully.");
        client.invalidateQueries("user list")
        // setEdit(false);
    }
    const onError = (error) => { toast.error(error.response.data.message || "Something went Wrong", toastOption) }

    const { mutate } = useUpdateUser(onSuccess, onError)

    const provincelist = useGetProvinceList(driverform.values.country)
    const countrylist = useGetCountryList()
    const companyList = useGetUserList("company list", "company");
    useEffect(() => {
        const data = UserInfo.data?.data

        if (data) {
            setdriverformvalues({ form: driverform, data: UserInfo.data?.data.user })
            setdriverformvalues({ form: emergencyform, data: UserInfo.data?.data?.user })
        }
    }, [UserInfo.data])
    console.log(driverform.values.company_id?._id)

    return (
        <div className="container-fluid">
            <div className="row">

                <div className="col-md-12">
                    <div className="theme-table">
                        <div className="tab-heading">
                            <h3>User Information</h3>
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
                                    {driverform.touched.first_name && <p className="err">{driverform.errors.first_name}</p>}
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
                                    {driverform.touched.last_name && <p className="err">{driverform.errors.last_name}</p>}
                                </div>
                                {/* <div className="col-md-6">
                                    <select
                                        name="company_id"
                                        className="form-control"
                                        value={driverform.values.company_id}
                                        onChange={driverform.handleChange}
                                        disabled={!edit}
                                    >
                                        <option value="" hidden>Others</option>
                                        {companyList.data?.data.users.map(user => <option key={user._id} value={user._id}>{user.company_name}</option>)}
                                    </select>
                                    {driverform.touched.company_id && <p className="err">{driverform.errors.company_id}</p>}
                                </div> */}
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
                                    {driverform.touched.email && <p className="err">{driverform.errors.email}</p>}
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
                                            // console.log(companyList.data?.data.users.find(
                                            //     (user) => {
                                            //         console.log(selectedId, user?._id)


                                            //     }
                                            // ))
                                            console.log(selectedCompany)



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
                                <div className="col-md-6">

                                    <PhoneInput
                                        country={"za"}
                                        disabled={!edit}
                                        value={`${driverform.values.mobile_no_country_code ?? ''}${driverform.values.mobile_no ?? ''}`}
                                        onChange={(phone, countryData) => {
                                            const withoutCountryCode = phone.startsWith(countryData.dialCode)
                                                ? phone.slice(countryData.dialCode.length).trim()
                                                : phone;

                                            driverform.setFieldValue("mobile_no", withoutCountryCode);
                                            driverform.setFieldValue("mobile_no_country_code", `+${countryData.dialCode}`);
                                        }}
                                        inputClass="form-control"
                                    />
                                    {driverform.touched.mobile_no && <p className="err">{driverform.errors.mobile_no}</p>}
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

                                <div className="col-md-12">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <label>Selfie Image</label>

                                                    {driverform.values.selfieImage instanceof File ? (
                                                        <div className="form-control mt-2 img-preview-container">
                                                            <img
                                                                src={URL.createObjectURL(driverform.values.selfieImage)}
                                                                alt="Selfie Preview"
                                                                className="img-preview"
                                                                width="100"
                                                                onLoad={(e) => URL.revokeObjectURL(e.target.src)}
                                                            />
                                                        </div>
                                                    ) : (
                                                        UserInfo.data?.data.user?.selfieImage && (
                                                            <div className="form-control mt-2 img-preview-container">
                                                                <img
                                                                    src={UserInfo.data?.data.user?.selfieImage}
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
                                                                driverform.setFieldValue("selfieImage", file);
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

                                                    {driverform.values.fullImage instanceof File ? (
                                                        <div className="form-control mt-2 img-preview-container">
                                                            <img
                                                                src={URL.createObjectURL(driverform.values.fullImage)}
                                                                alt="full Image"
                                                                className="img-preview"
                                                                width="100"
                                                                onLoad={(e) => URL.revokeObjectURL(e.target.src)}
                                                            />
                                                        </div>
                                                    ) : (
                                                        UserInfo.data?.data.user?.fullImage && (
                                                            <div className="form-control mt-2 img-preview-container">
                                                                <img
                                                                    src={UserInfo.data?.data.user?.fullImage}
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
                                                                driverform.setFieldValue("fullImage", file);
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
                                        <p className="err">{driverform.errors.street}</p>
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
                                        <option value="" hidden> Country </option>
                                        {countrylist.data?.data.data?.map((country) => (
                                            <option key={country._id} value={country._id}>
                                                {country.country_name}
                                            </option>
                                        ))}
                                    </select>
                                    {driverform.touched.country && (
                                        <p className="err">{driverform.errors.country}</p>
                                    )}
                                </div>

                                <div className="col-md-6">
                                    <select
                                        name="province"
                                        className="form-control"
                                        disabled={!driverform.values.country || !edit}
                                        value={driverform.values.province}
                                        onChange={driverform.handleChange}
                                    >
                                        <option value="" hidden>Province</option>
                                        {provincelist.data?.data.data?.map((province) => (
                                            <option key={province._id} value={province._id}>
                                                {province.province_name}
                                            </option>
                                        ))}
                                    </select>
                                    {driverform.touched.province && (
                                        <p className="err">{driverform.errors.province}</p>
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
                                        <p className="err">{driverform.errors.city}</p>
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
                                        <p className="err">{driverform.errors.suburb}</p>
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
                                        <p className="err">{driverform.errors.postal_code}</p>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* <div className="theme-table">
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
                                    <div className="vehiclpic">
                                        <span>Car Images </span>
                                        <div className="carimages">
                                            {vehicleForm.values.images && vehicleForm.values.images.map((image, i) => <img key={i} src={image} />)}
                                        </div>
                                    </div>
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
                            </div>
                        </form>
                    </div> */}

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
                                        value={emergencyform.values.emergency_contact_1_email}
                                        onChange={emergencyform.handleChange}
                                        disabled
                                    />
                                </div>
                                <div className="col-md-6">
                                    <input
                                        type="text"
                                        name="emergency_contact_1_contact"
                                        placeholder="Contact No."
                                        className="form-control"
                                        value={emergencyform.values.emergency_contact_1_contact}
                                        onChange={emergencyform.handleChange}
                                        disabled
                                    />
                                </div>
                                <div className="col-md-6">
                                    <input
                                        type="text"
                                        name="emergency_contact_2_email"
                                        placeholder="emergencycontact@gu.link"
                                        className="form-control"
                                        value={emergencyform.values.emergency_contact_2_email}
                                        onChange={emergencyform.handleChange}
                                        disabled
                                    />
                                </div>
                                <div className="col-md-6">
                                    <input
                                        type="text"
                                        name="emergency_contact_2_contact"
                                        placeholder="Contact No."
                                        className="form-control"
                                        value={emergencyform.values.emergency_contact_2_contact}
                                        onChange={emergencyform.handleChange}
                                        disabled
                                    />
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                <div className="col-md-12 text-end">
                    <div className="saveform">
                        {edit ?
                            <button type="submit" onClick={() => submithandler(driverform.values)} className="btn btn-dark">Save</button> :
                            <button onClick={() => setEdit(true)} className="btn btn-dark">Edit</button>}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PassangerInformation

const setdriverformvalues = ({ ...props }) => {
    const { form, data } = props;
    let newdata = {};

    Object.keys(form.values).forEach((key) => {

        if (key === 'images') {
            newdata = { ...newdata, [key]: Array.from({ length: 5 }, (_, i) => data?.[`image_${i + 1}`] || null).filter(Boolean) };
        } else if (key === 'company_id') {
            newdata = { ...newdata, [key]: data?.company_id?._id ?? '' };
        }
        else {
            newdata = { ...newdata, [key]: data?.[key] ?? '' };
        }

    });

    form.setValues(newdata)
}