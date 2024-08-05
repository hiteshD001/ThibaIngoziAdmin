import { useFormik } from "formik"
import { companyValidation } from "../common/FormValidation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { register } from "../API Calls/API"
import { toast } from "react-toastify"
import { toastOption } from "../common/ToastOptions"
import Loader from "../common/Loader"

const AddCompany = () => {
    const client = useQueryClient();


    const companyForm = useFormik({
        initialValues: {
            email: "",
            password: "",
            company_name: "",
            mobile_no: "",
            address: "",
            id_no: "",
            company_bio: "",
            contact_name: "",
            role: "company",
            type: "email_pass"
        },
        validationSchema: companyValidation,
        onSubmit: (values) => {
            console.log(values)
            newcompany.mutate(values)
        }
    })

    const newcompany = useMutation({
        mutationKey: ['create new company'],
        mutationFn: register,
        onSuccess: () => {
            companyForm.resetForm()
            client.invalidateQueries("company list")
        },
        onError: (error) => toast.error(error.response.data.message || "Something went Wrong", toastOption)
    })

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-md-12">
                    <div className="theme-table">
                        <div className="tab-heading">
                            <h3>List of Companies</h3>
                        </div>
                        <form>
                            <div className="row">
                                <div className="col-md-6">
                                    <input
                                        type="text"
                                        name="company_name"
                                        placeholder="Company Name"
                                        className="form-control"
                                        value={companyForm.values.company_name}
                                        onChange={companyForm.handleChange}
                                    />
                                    {companyForm.touched.company_name && <p className="err">{companyForm.errors.company_name}</p>}
                                </div>
                                <div className="col-md-6">
                                    <input
                                        type="text"
                                        name="email"
                                        placeholder="Email"
                                        className="form-control"
                                        value={companyForm.values.email}
                                        onChange={companyForm.handleChange}
                                    />
                                    {companyForm.touched.email && <p className="err">{companyForm.errors.email}</p>}
                                </div>
                                <div className="col-md-6">
                                    <input
                                        type="text"
                                        name="mobile_no"
                                        placeholder="Mobile No."
                                        className="form-control"
                                        value={companyForm.values.mobile_no}
                                        onChange={companyForm.handleChange}
                                    />
                                    {companyForm.touched.mobile_no && <p className="err">{companyForm.errors.mobile_no}</p>}
                                </div>
                                <div className="col-md-6">
                                    <input
                                        type="text"
                                        name="company_bio"
                                        placeholder="Company Bio."
                                        className="form-control"
                                        value={companyForm.values.company_bio}
                                        onChange={companyForm.handleChange}
                                    />
                                    {companyForm.touched.company_bio && <p className="err">{companyForm.errors.company_bio}</p>}
                                </div>
                                <div className="col-md-6">
                                    <input
                                        type="text"
                                        name="address"
                                        placeholder="Address"
                                        className="form-control"
                                        value={companyForm.values.address}
                                        onChange={companyForm.handleChange}
                                    />
                                    {companyForm.touched.address && <p className="err">{companyForm.errors.address}</p>}
                                </div>
                                <div className="col-md-6">
                                    <input
                                        type="text"
                                        name="id_no"
                                        placeholder="ID No."
                                        className="form-control"
                                        value={companyForm.values.id_no}
                                        onChange={companyForm.handleChange}
                                    />
                                    {companyForm.touched.id_no && <p className="err">{companyForm.errors.id_no}</p>}
                                </div>
                                <div className="col-md-6">
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="Password"
                                        className="form-control"
                                        value={companyForm.values.password}
                                        onChange={companyForm.handleChange}
                                    />
                                    {companyForm.touched.password && <p className="err">{companyForm.errors.password}</p>}
                                </div>
                                <div className="col-md-6">
                                    <input
                                        type="text"
                                        name="contact_name"
                                        placeholder="Contact Name"
                                        className="form-control"
                                        value={companyForm.values.contact_name}
                                        onChange={companyForm.handleChange}
                                    />
                                    {companyForm.touched.contact_name && <p className="err">{companyForm.errors.company_name}</p>}
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                <div className="col-md-12 text-end">
                    <div className="saveform">
                        <button
                            type="submit"
                            onClick={companyForm.handleSubmit}
                            className="btn btn-dark"
                            disabled={newcompany.isPending}
                        >
                            {newcompany.isPending ? <Loader /> :  "Save"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AddCompany
