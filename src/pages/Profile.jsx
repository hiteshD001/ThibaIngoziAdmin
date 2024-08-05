/* eslint-disable react-hooks/exhaustive-deps */
import { useFormik } from "formik"
import { profileValidation } from "../common/FormValidation"
import { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getUser, updateUser } from "../API Calls/API"
import { toast } from "react-toastify"
import { toastOption } from "../common/ToastOptions"

const Profile = () => {
    const [edit, setedit] = useState(false)
    const client = useQueryClient();

    const userinfo = useQuery({
        queryKey: ["userinfo", localStorage.getItem("userID")],
        queryFn: getUser,
        staleTime: Infinity
    })

    const profileForm = useFormik({
        initialValues: { username: "", email: "", address: "", role: "", mobile_no: "" },
        validationSchema: profileValidation,
        onSubmit: (values) => {
            setedit(false)
            console.log(values)
            mutate({ id: localStorage.getItem("userID"), data: values })
        }
    })

    const { mutate } = useMutation({
        mutationKey: ["update user"],
        mutationFn: updateUser,
        onSuccess: () => { client.invalidateQueries("userinfo") },
        onError: (error) => toast.error(error.response.data.message || "Something went Wrong", toastOption)
    })

    useEffect(() => {
        console.log(userinfo.data)
        profileForm.setValues({
            username: userinfo.data?.data.user.username || userinfo.data?.data.user.contact_name || "",
            email: userinfo.data?.data.user.email || "",
            address: userinfo.data?.data.user.address || "",
            role: userinfo.data?.data.user.role || "",
            mobile_no: userinfo.data?.data.user.mobile_no || "",
        })
    }, [userinfo.data])

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-md-12">
                    <div className="theme-table">
                        <div className="tab-heading">
                            <h3>Profile </h3>
                        </div>
                        <form>
                            <div className="row">
                                <div className="col-md-6">
                                    <input
                                        type="text"
                                        name="username"
                                        placeholder="Username"
                                        className="form-control"
                                        value={profileForm.values.username}
                                        onChange={profileForm.handleChange}
                                        disabled={!edit}
                                    />
                                    {profileForm.touched.username && <p className="err">{profileForm.errors.username}</p>}
                                </div>
                                {/* <div className="col-md-6">
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="Last Name"
                                        className="form-control"
                                        value={profileForm.values.password}
                                        onChange={profileForm.handleChange}
                                        disabled={!edit}
                                    />
                                    {profileForm.touched.password && <p className="err">{profileForm.errors.password}</p>}
                                </div> */}
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
                                    {profileForm.touched.email && <p className="err">{profileForm.errors.email}</p>}
                                </div>
                                <div className="col-md-6">
                                    <input
                                        type="text"
                                        name="mobile_no"
                                        placeholder="Mobile No."
                                        className="form-control"
                                        value={profileForm.values.mobile_no}
                                        onChange={profileForm.handleChange}
                                        disabled={!edit}
                                    />
                                    {profileForm.touched.mobile_no && <p className="err">{profileForm.errors.mobile_no}</p>}
                                </div>
                                <div className="col-md-6">
                                    <input
                                        type="text"
                                        name="address"
                                        placeholder="Address"
                                        className="form-control"
                                        value={profileForm.values.address}
                                        onChange={profileForm.handleChange}
                                        disabled={!edit}
                                    />
                                    {profileForm.touched.address && <p className="err">{profileForm.errors.address}</p>}
                                </div>
                            </div>
                        </form>
                    </div>


                </div>
                <div className="col-md-12 text-end">
                    <div className="saveform">
                        {edit ?
                            <button onClick={profileForm.handleSubmit} type="submit" className="btn btn-dark">Save</button> :
                            <button onClick={() => setedit(true)} className="btn btn-dark">Edit</button>}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Profile