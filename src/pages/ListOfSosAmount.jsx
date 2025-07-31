import { useState } from "react";
import { useNavigate } from "react-router-dom";

import icon from "../assets/images/icon.png";
import search from "../assets/images/search.png";
import Prev from "../assets/images/left.png";
import Next from "../assets/images/right.png";
import nouser from "../assets/images/NoUser.png";

import { useGetSoSAmountList } from "../API Calls/API";
import { DeleteSosAmount } from "../common/ConfirmationPOPup";
import Loader from "../common/Loader";

const ListOfSosAmount = () => {
    const nav = useNavigate();
    const [role] = useState(localStorage.getItem("role"))
    const [page, setpage] = useState(1);
    const [filter, setfilter] = useState("");
    const [confirmation, setconfirmation] = useState("");

    const sosList = useGetSoSAmountList("ArmedSOSAmount List", page, 10, filter)

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-md-12">
                    <div className="theme-table">
                        <div className="tab-heading">
                            <h3>List of Sos Amount</h3>
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
                                {
                                    role === 'super_admin' && (
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => nav("add-service")}
                                        >
                                            + Add Service
                                        </button>
                                    )
                                }
                                <button
                                    className="btn btn-primary"
                                    onClick={() => nav("add-sos")}
                                >
                                    + Add Sos
                                </button>
                            </div>
                        </div>
                        {!sosList.data ? (
                            <Loader />
                        ) : (
                            <>
                                {sosList.data?.data ? (
                                    <>
                                        <table
                                            id="example"
                                            className="table table-striped nowrap"
                                            style={{ width: "100%" }}
                                        >
                                            <thead>
                                                <tr>
                                                    <th>Armed Sos Amount</th>
                                                    <th>Driver Split Amount</th>
                                                    <th>Company Split Amount</th>
                                                    <th>Currency</th>
                                                    <th>Type</th>

                                                    <th>&nbsp;</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sosList.data?.data.map((data) => (
                                                    <tr key={data._id}>
                                                        <td>{data.amount}</td>
                                                        <td>
                                                            <div className={data.driverSplitAmount === null ? "nodata" : ""}>
                                                                {data.driverSplitAmount == null ? 0 : data.driverSplitAmount}
                                                            </div>
                                                        </td>

                                                        <td className={data.companySplitAmount === null ? "nodata" : ""}>
                                                            {data.companySplitAmount == null ? 0 : data.companySplitAmount}
                                                        </td>

                                                        <td className={!data.currency ? "nodata" : ""}>
                                                            {data.currency}
                                                        </td>
                                                        <td className={!data.notificationTypeId?.type ? "nodata" : ""}>
                                                            {data.notificationTypeId?.type}
                                                        </td>
                                                        <td>
                                                            <span
                                                                onClick={() => setconfirmation(data._id)}
                                                                className="tbl-gray"
                                                            >
                                                                Delete
                                                            </span>
                                                            {confirmation === data._id && (
                                                                < DeleteSosAmount
                                                                    id={data._id}
                                                                    setconfirmation={setconfirmation}
                                                                />
                                                            )}
                                                            <span
                                                                onClick={() =>
                                                                    nav(`/home/total-sos-amount/sos-amount/${data._id}`)
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
                                                    disabled={page === sosList.data?.data.totalPages}
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
        </div>
    );
};

export default ListOfSosAmount;
