import { useFormik } from "formik"
import { driverValidation } from "../common/FormValidation"
import { toast } from "react-toastify"
import { toastOption } from "../common/ToastOptions"
import { register } from "../API Calls/API"
import { useMutation } from "@tanstack/react-query"

const AddDriver = () => {
    const driverForm = useFormik({
        initialValues: {
            username: "",
            email: "",
            password: "",
            mobile_no: "",
            role: "driver",
            type: "email_pass",
            fcm_token: "fcm_token",
        },
        validationSchema: driverValidation,
        onSubmit: (values) => {
            console.log(values)
            newdriver.mutate(values)
        }
    })

    const newdriver = useMutation({
        mutationKey: ['create new driver'],
        mutationFn: register,
        onSuccess: (data) => console.log(data),
        onError: (error) => toast.error(error.response.data.message || "Something went Wrong", toastOption)
    })

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-md-12">
                    <div className="theme-table">
                        <div className="tab-heading">
                            <h3>Add Driver Information</h3>
                        </div>
                        <form>
                            <div className="row">
                                <div className="col-md-6">
                                    <input type="text"
                                        name="username"
                                        placeholder="Driver Name"
                                        className="form-control"
                                        value={driverForm.values.username}
                                        onChange={driverForm.handleChange}
                                    />
                                    {driverForm.touched.username && <p className="err">{driverForm.errors.username}</p>}
                                </div>
                                <div className="col-md-6">
                                    <input type="password"
                                        name="password"
                                        placeholder="Password"
                                        className="form-control"
                                        value={driverForm.values.password}
                                        onChange={driverForm.handleChange}
                                    />
                                    {driverForm.touched.password && <p className="err">{driverForm.errors.password}</p>}
                                </div>
                                <div className="col-md-6">
                                    <input type="text"
                                        name="email"
                                        placeholder="Email"
                                        className="form-control"
                                        value={driverForm.values.email}
                                        onChange={driverForm.handleChange}
                                    />
                                    {driverForm.touched.email && <p className="err">{driverForm.errors.email}</p>}
                                </div>
                                <div className="col-md-6">
                                    <input type="text"
                                        name="mobile_no"
                                        placeholder="Mobile No."
                                        className="form-control"
                                        value={driverForm.values.mobile_no}
                                        onChange={driverForm.handleChange}
                                    />
                                    {driverForm.touched.mobile_no && <p className="err">{driverForm.errors.mobile_no}</p>}
                                </div>
                                {/* <div className="col-md-6">
                                    <input type="text"
                                        name="address"
                                        placeholder="Address"
                                        className="form-control"
                                        value={driverForm.values.a}
                                        onChange={driverForm.handleChange}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <input type="text"
                                        name="idno"
                                        placeholder="ID No."
                                        className="form-control"
                                        value={driverForm.values.}
                                        onChange={driverForm.handleChange}
                                    />
                                </div> */}
                            </div>
                        </form>
                    </div>


                </div>
                <div className="col-md-12 text-end">
                    <div className="saveform">
                        <button type="submit" onClick={driverForm.handleSubmit} className="btn btn-dark">Save</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AddDriver
