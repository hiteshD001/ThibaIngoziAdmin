import { useState, useLayoutEffect, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { companyEditValidation, companyValidation } from "../common/FormValidation";
import { useGetUser, useGetUserList, useUpdateUser, useGetArmedSoS, useGetServicesList, armedSosPayout, payoutUserUpdate } from "../API Calls/API";
import PayoutPopup from "../common/Popup";
import Select from "react-select";
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
    const [GrpservicesList, setGrpservicesList] = useState({});
    const [payPopup, setPopup] = useState('')
    const [selectedPayoutType, setSelectedPayoutType] = useState('');

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
            services: []
        },
        validationSchema: companyEditValidation,
        onSubmit: (values) => {
            setedit(false);
            const formData = new FormData();
            Object.entries(values).forEach(([key, value]) => {
                if (key === "services") {
                    value.forEach((id) => formData.append("companyService[]", id));
                } else {
                    formData.append(key, value);
                }
            });
            mutate({ id: params.id, data: formData });
        },
    });

    const PayoutForm = useFormik({
        initialValues: {
            firstName: '',
            surname: '',
            branchCode: '',
            amount: 0,
            accountNumber: '',
            customerCode: ''
        }
    })
    const serviceslist = useGetServicesList()

    useEffect(() => {
        if (companyInfo.data) {
            setIsArmedLocal(companyInfo.data?.data?.user?.isArmed);
        }
    }, [companyInfo.data]);


    useEffect(() => {
        const user = companyInfo.data?.data?.user;
        if (user) {
            // Set Formik values
            CompanyForm.setValues({
                company_name: user.company_name || "",
                mobile_no: user.mobile_no || "",
                email: user.email || "",
                isArmed: user.isArmed || false,
                services: user.services
                    ?.filter(s => s.serviceId?.isService)
                    .map(s => s.serviceId._id) || [],
            });

            // Prepare grouped service list
            const filteredServices = user.services?.filter(s => s.serviceId?.isService);

            const grouped = filteredServices?.reduce((acc, s) => {
                const type = s.serviceId.type;
                if (!acc[type]) acc[type] = [];
                acc[type].push({
                    label: s.serviceId.type,
                    value: s.serviceId._id,
                });
                return acc;
            }, {});

            // Convert to array format if needed (for dropdowns like MUI Select)
            const groupedOptions = Object.keys(grouped || {}).map(type => ({
                label: type,
                options: grouped[type],
            }));

            setServicesList(groupedOptions);
            console.log("Grouped Options", groupedOptions);
        }
    }, [companyInfo.data?.data?.user]);


    useLayoutEffect(() => {
        if (Array.isArray(serviceslist)) {
            const filteredServices = serviceslist.filter(service => service.isService);

            const groupedOptions = [
                {
                    label: "Services",
                    options: filteredServices.map((service) => ({
                        label: service.type,
                        value: service._id,
                    })),
                }
            ];

            setGrpservicesList(groupedOptions ?? [])
        }
    }, [serviceslist])
    const onSuccess = () => {
        client.invalidateQueries(["user", params.id]);
        toast.success("User Updated Successfully.");
    }
    const onError = (error) => { toast.error(error.response.data.message || "Something went Wrong", toastOption) }
    const { mutate } = useUpdateUser(onSuccess, onError);


    const payoutMutation = armedSosPayout(
        (res) => {
            console.log("Success!", res);
            payoutUpdateMutation.mutate({
                user_id: companyInfo.data.data.user._id,
                type: selectedPayoutType,
                amount: PayoutForm.values.amount,
            });
            // payoutUpdateMutation.mutate({
            //     user_id: companyInfo.data.data.user._id,
            //     type: companyInfo.data.data.user.role,
            //     amount: PayoutForm.values.amount,
            // });

            closePopup();
        },
        (err) => {
            toast.error('payment failed')
            console.error("Error!", err);
        }
    );

    const payoutUpdateMutation = payoutUserUpdate(
        (res) => {
            toast.success('payment successful');
        },
        (err) => {
            toast.error('payment failed')
        }
    );

    const handleChange = () => {
        payoutMutation.mutate(PayoutForm.values);
    };

    const handlePopup = (event, type, payoutType) => {
        event.stopPropagation();

        const isCompany = payoutType === 'company';
        const selectedAmount = isCompany
            ? companyInfo.data?.data.totalCompanyAmount
            : companyInfo.data?.data.totalDriverAmount;

        PayoutForm.setValues({
            firstName: companyInfo.data?.data.user?.first_name || "",
            surname: companyInfo.data?.data.user?.last_name || "",
            branchCode: companyInfo.data?.data.user.bankId?.branch_code || "",
            accountNumber: companyInfo.data?.data.user?.accountNumber || "",
            customerCode: companyInfo.data?.data.user?.customerCode || "",
            amount: selectedAmount || 0,
        });

        setPopup(type);
        setSelectedPayoutType(payoutType);
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
                            {
                                edit ? (
                                    <div className="company-info">
                                        <div className="comapny-titles">Company Services</div>
                                        <div className="comapny-det">
                                            <Select
                                                isMulti
                                                name="services"
                                                options={GrpservicesList}
                                                classNamePrefix="select"
                                                placeholder="Select Services"
                                                className="form-control"
                                                value={GrpservicesList
                                                    .flatMap((group) => group.options)
                                                    .filter((option) => CompanyForm.values.services?.includes(option.value))}
                                                onChange={(selectedOptions) => {
                                                    const selectedValues = selectedOptions?.map((option) => option.value) || [];
                                                    CompanyForm.setFieldValue("services", selectedValues);
                                                }}
                                                styles={{
                                                    control: (base) => ({
                                                        ...base,
                                                        border: 'none',
                                                        boxShadow: 'none',
                                                        backgroundColor: 'transparent',
                                                    }),
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
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    servicesList.length > 0 && (
                                        <div className="company-info">
                                            <div className="comapny-titles">Company Services</div>
                                            <div className="comapny-det comapny-det2">
                                                {servicesList.map((group, index) => (
                                                    <div
                                                        key={index}
                                                        className={servicesList.length > index + 1 ? "c-ser" : "c-ser2"}
                                                    >
                                                        {group.options.map((service, idx) => (
                                                            <p key={`${index}-${idx}`}>{service.label}</p>
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                )
                            }

                            <div className="company-info">
                                <div className="comapny-titles">Company Payout</div>
                                <div className="comapny-det comapny-det2">
                                    <div className="c-info c-pay3">
                                        <div className="c-pay2">
                                            <div className="c-pay">
                                                <span>Total Company Amount:</span>
                                                <p>{companyInfo.data?.data.totalCompanyAmount}</p>
                                            </div>
                                            <button disabled={edit} style={{ height: '50px' }} className="btn btn-primary" onClick={(event) => handlePopup(event, 'payout', 'company')}>Pay</button>
                                            {renderPopup()}
                                        </div>
                                    </div>


                                    <div className="c-info">
                                        <div className="c-pay2">
                                            <div className="c-pay">
                                                <span>Total Driver Amount:</span>
                                                <p>{companyInfo.data?.data.totalDriverAmount}</p>
                                            </div>
                                            <button disabled={edit} style={{ height: '50px' }} className="btn btn-primary" onClick={(event) => handlePopup(event, 'payout', 'driver')}>Pay</button>
                                        </div>
                                    </div>

                                </div>
                            </div>


                            <div className="col-md-12 text-end">
                                <div className="saveform">
                                    {edit ? (
                                        <button type="submit"
                                            onClick={() => CompanyForm.submitForm()} className="btn btn-dark">Save</button>
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
