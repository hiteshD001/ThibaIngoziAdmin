import { useFormik } from "formik"
import { profileValidation } from "../common/FormValidation"
import { useState } from "react"

const Profile = () => {
    const [edit, setedit] = useState(false)

    const profileForm = useFormik({
        initialValues: {
            username: "Kenneth King",
            email: "kenneth.king@guard.co",
            password: "Example@1234",
            address: "address",
            role: "driver",
            mobile_no: 9825098250
        },
        validationSchema: profileValidation,
        onSubmit: (values) => {
            setedit(false)
            console.log(values)
        }
    })

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
                                </div>
                                <div className="col-md-6">
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="Last Name"
                                        className="form-control"
                                        value={profileForm.values.password}
                                        onChange={profileForm.handleChange}
                                        disabled={!edit}
                                    />
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
                                </div>
                                <div className="col-md-6">
                                    <input
                                        type="text"
                                        name="mobileno"
                                        placeholder="Mobile No."
                                        className="form-control"
                                        value={profileForm.values.mobile_no}
                                        onChange={profileForm.handleChange}
                                        disabled={!edit}
                                    />
                                </div>
                                <div className="col-md-12">
                                    <input
                                        type="text"
                                        name="address"
                                        placeholder="Address"
                                        className="form-control"
                                        value={profileForm.values.address}
                                        onChange={profileForm.handleChange}
                                        disabled={!edit}
                                    />
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