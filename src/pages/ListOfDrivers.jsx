import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useGetUser, useGetUserList } from "../API Calls/API";

import Prev from "../assets/images/left.png";
import Next from "../assets/images/right.png";
import nouser from "../assets/images/NoUser.png";
import search from "../assets/images/search.png";
import icon from "../assets/images/icon.png";

import Loader from "../common/Loader";
import Analytics from "../common/Analytics";
import { DeleteConfirm } from "../common/ConfirmationPOPup";
import ImportSheet from "../common/ImportSheet";

const ListOfDrivers = () => {
    const [popup, setpopup] = useState(false)

    const nav = useNavigate();
    const params = useParams();
    const [role] = useState(localStorage.getItem("role"))
    const [page, setpage] = useState(1);
    const [filter, setfilter] = useState("");
    const [confirmation, setconfirmation] = useState("");

    const companyInfo = useGetUser(params.id)
    const notification_type =  "677534649c3a99e13dcd7456"
    const driverList = useGetUserList("driver list", "driver", params.id, page, 10, filter,notification_type)

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-md-12">
                    {params.id && (
                        <div className="company-info">
                            <div className="comapny-titles">Company Information</div>
                            <div className="comapny-det">
                                <div className="c-info">
                                    <span>Company</span>
                                    <p>{companyInfo.data?.data.user.company_name}</p>
                                </div>
                                <div className="c-info">
                                    <span>Contact No.</span>
                                    <p>{companyInfo.data?.data.user.mobile_no}</p>
                                </div>
                                <div className="c-info">
                                    <span>Contact Email</span>
                                    <p>{companyInfo.data?.data.user.email}</p>
                                </div>
                            </div>
                        </div>
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
