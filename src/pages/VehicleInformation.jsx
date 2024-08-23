import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

import { useFormik } from "formik"
import { vehicleValidation } from "../common/FormValidation"

import { useQueryClient } from "@tanstack/react-query"
import { useGetUser, useGetUserList, useUpdateUser } from "../API Calls/API"

import { toast } from "react-toastify"
import { toastOption } from "../common/ToastOptions"

const VehicleInformation = () => {
    const [edit, setedit] = useState(false)
    const params = useParams();
    const client = useQueryClient()

    const vehicleForm = useFormik({
        initialValues: {
            username: "",
            company_id: "",
            email: "",
            mobile_no: "",
            vehicle_name: "",
            type: "",
            reg_no: "",
            images: [],
            emergency_contact_1_contact: "",
            emergency_contact_1_email: "",
            emergency_contact_2_contact: "",
            emergency_contact_2_email: "",
        },
        validationSchema: vehicleValidation,
        onSubmit: (values) => {
            const payload = { username: values.username, company_id: values.company_id, email: values.email, mobile_no: values.mobile_no }
            console.log(values);
            setedit(false);
            mutate({ id: params.id, data: payload })
        }
    })

    const vehicleInfo = useGetUser(params.id)
    const companyList = useGetUserList("company list", "company")

    const onSuccess = (res) => {
        toast.success("User Updated Successfully.");
        client.invalidateQueries("driver list")
        console.log(res)
    }
    const onError = (error) => { toast.error(error.response.data.message || "Something went Wrong", toastOption) }

    const { mutate } = useUpdateUser(onSuccess, onError)

    useEffect(() => {
        console.log(vehicleInfo.data)
        vehicleForm.setValues({
            username: vehicleInfo.data?.data.user.username || "",
            company_id: vehicleInfo.data?.data.user.company_id || "",
            email: vehicleInfo.data?.data.user.email || "",
            mobile_no: vehicleInfo.data?.data.user.mobile_no || "",
            vehicle_name: vehicleInfo.data?.data.vehicle[0]?.vehicle_name || "",
            type: vehicleInfo.data?.data.vehicle[0]?.type || "",
            reg_no: vehicleInfo.data?.data.vehicle[0]?.reg_no || "",
            images: Array.from({ length: 5 }, (_, i) => vehicleInfo.data?.data.vehicle[0]?.[`image_${i + 1}`] || null).filter(Boolean),
            emergency_contact_1_contact: vehicleInfo.data?.data.vehicle[0]?.emergency_contact_1_contact || "",
            emergency_contact_1_email: vehicleInfo.data?.data.vehicle[0]?.emergency_contact_1_email || "",
            emergency_contact_2_contact: vehicleInfo.data?.data.vehicle[0]?.emergency_contact_2_contact || "",
            emergency_contact_2_email: vehicleInfo.data?.data.vehicle[0]?.emergency_contact_2_email || "",
        })
    }, [vehicleInfo.data])

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
                                        name="username"
                                        placeholder="Driver Name"
                                        className="form-control"
                                        value={vehicleForm.values.username}
                                        onChange={vehicleForm.handleChange}
                                        disabled={!edit}
                                    />
                                    {vehicleForm.touched.username && <p className="err">{vehicleForm.errors.username}</p>}
                                </div>
                                <div className="col-md-6">
                                    <select
                                        name="company_id"
                                        className="form-control"
                                        value={vehicleForm.values.company_id}
                                        onChange={vehicleForm.handleChange}
                                        disabled={!edit}
                                    >
                                        <option value="" hidden>Others</option>
                                        {companyList.data?.data.users.map(user => <option key={user._id} value={user._id}>{user.company_name}</option>)}
                                    </select>
                                    {vehicleForm.touched.company_id && <p className="err">{vehicleForm.errors.company_id}</p>}
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
                                        value={vehicleForm.values.email}
                                        onChange={vehicleForm.handleChange}
                                        disabled={!edit}
                                    />
                                    {vehicleForm.touched.email && <p className="err">{vehicleForm.errors.email}</p>}
                                </div>
                                <div className="col-md-6">
                                    <input
                                        type="text"
                                        name="mobile_no"
                                        placeholder="Mobile No."
                                        className="form-control"
                                        value={vehicleForm.values.mobile_no}
                                        onChange={vehicleForm.handleChange}
                                        disabled={!edit}
                                    />
                                    {vehicleForm.touched.mobile_no && <p className="err">{vehicleForm.errors.mobile_no}</p>}
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
                                        value={vehicleForm.values.emergency_contact_1_email}
                                        onChange={vehicleForm.handleChange}
                                        disabled
                                    />
                                </div>
                                <div className="col-md-6">
                                    <input
                                        type="text"
                                        name="emergency_contact_1_contact"
                                        placeholder="Contact No."
                                        className="form-control"
                                        value={vehicleForm.values.emergency_contact_1_contact}
                                        onChange={vehicleForm.handleChange}
                                        disabled
                                    />
                                </div>
                                <div className="col-md-6">
                                    <input
                                        type="text"
                                        name="emergency_contact_2_email"
                                        placeholder="emergencycontact@gu.link"
                                        className="form-control"
                                        value={vehicleForm.values.emergency_contact_2_email}
                                        onChange={vehicleForm.handleChange}
                                        disabled
                                    />
                                </div>
                                <div className="col-md-6">
                                    <input
                                        type="text"
                                        name="emergency_contact_2_contact"
                                        placeholder="Contact No."
                                        className="form-control"
                                        value={vehicleForm.values.emergency_contact_2_contact}
                                        onChange={vehicleForm.handleChange}
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
                            <button type="submit" onClick={vehicleForm.handleSubmit} className="btn btn-dark">Save</button> :
                            <button onClick={() => setedit(true)} className="btn btn-dark">Edit</button>}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VehicleInformation
