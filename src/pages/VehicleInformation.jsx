// import { useFormik } from "formik"
import car from "../assets/images/car.png"

const VehicleInformation = () => {
    // const companyForm = useFormik({
    //     initialValues: {
    //         email: "",
    //         password: "",
    //         role: "company",
    //         company_name: "",
    //         mobile_no: "",
    //         address: "",
    //         id_no: "",
    //         company_bio: ""
    //     },
    //     // validationSchema: companyValidation,
    //     onSubmit: (values) => { console.log(values) }
    // })

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
                                    <input type="text" name="drivername" placeholder="Driver Name" className="form-control" />
                                </div>
                                <div className="col-md-6">
                                    <input type="text" name="companyname" placeholder="Company Name" className="form-control" />
                                </div>
                                <div className="col-md-6">
                                    <input type="text" name="email" placeholder="Email" className="form-control" />
                                </div>
                                <div className="col-md-6">
                                    <input type="text" name="mobileno" placeholder="Mobile No." className="form-control" />
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
                                    <input type="text" name="vehicleno" placeholder="Vehicle No." className="form-control" />
                                </div>
                                <div className="col-md-6">
                                    <input type="text" name="vehicletype" placeholder="Vehicle Type" className="form-control" />
                                </div>
                                <div className="col-md-6">
                                    <div className="vehiclpic">
                                        <span>Car Images </span>
                                        <div className="carimages">
                                            <img src={car} />
                                            <img src={car} />
                                            <img src={car} />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <input type="text" name="vehicleregistrationno" placeholder="Vehicle Registration No." className="form-control" />
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
                                    <input type="text" name="email" placeholder="emergencycontact@gu.link" className="form-control" />
                                </div>
                                <div className="col-md-6">
                                    <input type="text" name="password" placeholder="password" className="form-control" />
                                </div>
                                <div className="col-md-6">
                                    <input type="text" name="email" placeholder="emergencycontact@gu.link" className="form-control" />
                                </div>
                                <div className="col-md-6">
                                    <input type="text" name="password" placeholder="password" className="form-control" />
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                <div className="col-md-12 text-end">
                    <div className="saveform">
                        <button className="btn btn-dark">Edit</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VehicleInformation
