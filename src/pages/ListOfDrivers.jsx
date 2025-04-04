import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { companyValidation } from "../common/FormValidation";
import { useGetUser, useGetUserList, useUpdateUser, useGetArmedSoS } from "../API Calls/API";
import { useQueryClient } from "@tanstack/react-query"
import Prev from "../assets/images/left.png";
import Next from "../assets/images/right.png";
import nouser from "../assets/images/NoUser.png";
import search from "../assets/images/search.png";
import icon from "../assets/images/icon.png";
import { useFormik } from "formik";
import Loader from "../common/Loader";
import Analytics from "../common/Analytics";
import { DeleteConfirm } from "../common/ConfirmationPOPup";
import ImportSheet from "../common/ImportSheet";
import { toast } from "react-toastify";
import { toastOption } from "../common/ToastOptions";

const ListOfDrivers = () => {
    const [edit, setedit] = useState(false);
    const [isArmedLocal, setIsArmedLocal] = useState(false);
    const [popup, setpopup] = useState(false)
    const client = useQueryClient()
    const nav = useNavigate();
    const params = useParams();
    const [role] = useState(localStorage.getItem("role"))
    const [page, setpage] = useState(1);
    const [filter, setfilter] = useState("");
    const [confirmation, setconfirmation] = useState("");
    const [servicesList, setServicesList] = useState({});
    const companyInfo = useGetUser(params.id)
    const notification_type = "677534649c3a99e13dcd7456"
    const driverList = useGetUserList("driver list", "driver", params.id, page, 10, filter, notification_type)
    const getArmedSOS = useGetArmedSoS()
    const CompanyForm = useFormik({
        initialValues: {
            company_name: "",
            mobile_no: "",
            email: "",
            isArmed: "",
        },
        validationSchema: companyValidation,
        // onSubmit: (values) => {
        //     setedit(false);
        //     const formData = new FormData();
        //     formData.append(key, values[key]);
        //     mutate({ id: params.id, data: formData });
        // },
    });
    const submithandler = (values) => {
        setedit(false);
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
            formData.append(key, value);
        });
        mutate({ id: params.id, data: formData })
    }
    useEffect(() => {
        if (companyInfo.data) {
            setIsArmedLocal(companyInfo.data?.data?.user?.isArmed);
        }
    }, [companyInfo.data]);

    useEffect(() => {
        if (companyInfo.data?.data?.user) {
            CompanyForm.setValues({
                company_name: companyInfo.data.data.user.company_name || "",
                mobile_no: companyInfo.data.data.user.mobile_no || "",
                email: companyInfo.data.data.user.email || "",
                isArmed: companyInfo.data.data.user.isArmed || false,
            });
            const services = companyInfo.data?.data?.user?.services
            const groupedServices = services.reduce((acc, service) => {
                if (!acc[service.type]) {
                    acc[service.type] = [];
                }
                acc[service.type].push(service);
                return acc;
            }, {});
            setServicesList(groupedServices);

        }
    }, [companyInfo.data?.data?.user]);

    const onSuccess = () => {
        client.invalidateQueries(["user", params.id]);
        toast.success("User Updated Successfully.");
    }
    const onError = (error) => { toast.error(error.response.data.message || "Something went Wrong", toastOption) }
    const { mutate } = useUpdateUser(onSuccess, onError);

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-md-12">
                    {params.id && (
                        <>
                            <div className="company-info">
                                <div className="comapny-titles">Company Information</div>
                                <div className="comapny-det">
                                    <div className="c-info">
                                        <span>Company</span>
                                        {edit ? (
                                            <input
                                                type="text"
                                                name="company_name"
                                                placeholder="Company Name"
                                                className="form-control"
                                                value={CompanyForm.values.company_name}
                                                onChange={CompanyForm.handleChange}
                                                disabled={!edit}
                                            />

                                        ) : (
                                            <p>{companyInfo.data?.data.user.company_name}</p>
                                        )}
                                    </div>

                                    <div className="c-info">
                                        <span>Contact No.</span>
                                        {edit ? (
                                            <input
                                                type="text"
                                                name="mobile_no"
                                                placeholder="Contact No."
                                                className="form-control"
                                                value={CompanyForm.values.mobile_no}
                                                onChange={CompanyForm.handleChange}
                                                disabled={!edit}
                                            />

                                        ) : (
                                            <p>{companyInfo.data?.data.user.mobile_no}</p>
                                        )}
                                    </div>

                                    <div className="c-info">
                                        <span>Contact Email</span>
                                        {edit ? (

                                            <input
                                                type="email"
                                                name="email"
                                                placeholder="Contact Email"
                                                className="form-control"
                                                value={CompanyForm.values.email}
                                                onChange={CompanyForm.handleChange}
                                                disabled={!edit}
                                            />

                                        ) : (
                                            <p>{companyInfo.data?.data.user.email}</p>
                                        )}
                                    </div>

                                    <div className="c-info">
                                        <span>Total Used Google APIs</span>
                                        <p>{companyInfo.data?.data.totalGoogleMapApi}</p>
                                    </div>

                                    <div className="c-info2">

                                        <input
                                            type="checkbox"
                                            name="isArmed"
                                            id="isArmed"
                                            className="form-check-input me-1"
                                            checked={CompanyForm.values.isArmed}
                                            onChange={(e) =>
                                                CompanyForm.setFieldValue(
                                                    "isArmed",
                                                    e.target.checked
                                                )
                                            }
                                            disabled={!edit}
                                        />
                                        <label
                                            htmlFor="isArmed"
                                        >
                                            Security
                                        </label>

                                    </div>
                                </div>
                            </div>

                            {Object.keys(servicesList).length > 0 && (
                                <div className="company-info">
                                    <div className="comapny-titles">Company Services</div>
                                    <div className="comapny-det">
                                        {Object.keys(servicesList).map((serviceKey, index) => (
                                            <div
                                                key={index}
                                                className={Object.keys(servicesList).length > index + 1 ? "c-ser" : "c-ser2"}
                                            >
                                                <span>{serviceKey}</span>
                                                {servicesList[serviceKey]?.map((service, index) => (
                                                    <p key={index}>{service?.serviceName}</p>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="col-md-12 text-end">
                                <div className="saveform">
                                    {edit ? (
                                        <button type="submit"
                                            onClick={() => submithandler(CompanyForm.values)} className="btn btn-dark">Save</button>
                                    ) : (
                                        <button
                                            onClick={() => setedit(true)}
                                            className="btn btn-dark"
                                        >
                                            Edit
                                        </button>
                                    )}
                                </div>
                            </div>
                        </>
                    )}


                    {role === 'super_admin' && params.id && <Analytics id={params.id} />}



                    <div className="theme-table">
                        <div className="tab-heading">
                            <div className="count">
                                <h3>Total Drivers</h3>
                                <p>{driverList.isSuccess && driverList.data?.data.totalUsers || 0}</p>
                            </div>
                            <div className="tbl-filter">
                                <div className="input-group">
                                    <span className="input-group-text">
                                        <img src={search} />
                                    </span>
                                    <input
                                        type="text"
                                        value={filter}
                                        onChange={(e) => setfilter(e.target.value)}
                                        className="form-control"
                                        placeholder="Search"
                                    />
                                    <span className="input-group-text">
                                        <img src={icon} />
                                    </span>
                                </div>
                                <button
                                    onClick={() => nav("/home/total-drivers/add-driver")}
                                    className="btn btn-primary"
                                >
                                    + Add Driver
                                </button>
                                <button className="btn btn-primary" onClick={() => setpopup(true)}>
                                    + Import Sheet
                                </button>
                            </div>
                        </div>
                        {driverList.isFetching ? (
                            <Loader />
                        ) : (
                            <>
                                {driverList.data?.data.users ? (
                                    <>
                                        <table
                                            id="example"
                                            className="table table-striped nowrap"
                                            style={{ width: "100%" }}
                                        >
                                            <thead>
                                                <tr>
                                                    <th>Driver</th>
                                                    <th>Driver ID</th>
                                                    <th>Company</th>
                                                    <th>Contact No.</th>
                                                    <th>Contact Email</th>
                                                    <th>&nbsp;</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {driverList?.data && driverList.data?.data?.users?.map((driver) => (
                                                    <tr key={driver._id}>
                                                        <td>
                                                            <div
                                                                className={
                                                                    (!driver.first_name && !driver.last_name) ? "prof nodata" : "prof"
                                                                }
                                                            >
                                                                <img
                                                                    className="profilepicture"
                                                                    src={
                                                                        driver.profileImage
                                                                            ? driver.profileImage
                                                                            : nouser
                                                                    }
                                                                />
                                                                {driver.first_name} {driver.last_name}
                                                            </div>
                                                        </td>
                                                        <td className={!driver.id_no ? "nodata" : ""}>
                                                            {driver.id_no}
                                                        </td>
                                                        <td className={!driver.company_name ? "companynamenodata" : ""}>
                                                            {driver.company_name}
                                                        </td>
                                                        <td className={!driver?.mobile_no ? "nodata" : ""}>
                                                            {`${driver?.mobile_no_country_code ?? ''}${driver?.mobile_no ?? ''}`}
                                                        </td>
                                                        <td className={!driver.email ? "nodata" : ""}>
                                                            {driver.email}
                                                        </td>
                                                        <td>
                                                            <span
                                                                onClick={() => setconfirmation(driver._id)}
                                                                className="tbl-gray"
                                                            >
                                                                Delete
                                                            </span>
                                                            {confirmation === driver._id && (
                                                                <DeleteConfirm
                                                                    id={driver._id}
                                                                    setconfirmation={setconfirmation}
                                                                />
                                                            )}
                                                            <span
                                                                onClick={() =>
                                                                    nav(
                                                                        `/home/total-drivers/driver-information/${driver._id}`
                                                                    )
                                                                }
                                                                className="tbl-btn"
                                                            >
                                                                view
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <div className="pagiation">
                                            <div className="pagiation-left">
                                                <button
                                                    disabled={page === 1}
                                                    onClick={() => setpage((p) => p - 1)}
                                                >
                                                    <img src={Prev} /> Prev
                                                </button>
                                            </div>
                                            <div className="pagiation-right">
                                                <button
                                                    disabled={page === driverList.data?.data.totalPages}
                                                    onClick={() => setpage((p) => p + 1)}
                                                >
                                                    Next <img src={Next} />
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <p className="no-data-found">No data found</p>
                                )}
                            </>
                        )}

                    </div>
                </div>
            </div>
            {popup && <ImportSheet setpopup={setpopup} />}
        </div>
    );
};

export default ListOfDrivers;
