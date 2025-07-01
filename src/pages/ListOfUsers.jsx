import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useGetUser, useGetUserList, useUpdateUser } from "../API Calls/API";
import { useQueryClient } from "@tanstack/react-query"
import Prev from "../assets/images/left.png";
import Next from "../assets/images/right.png";
import nouser from "../assets/images/NoUser.png";
import search from "../assets/images/search.png";
import icon from "../assets/images/icon.png";

import Loader from "../common/Loader";
import { DeleteConfirm } from "../common/ConfirmationPOPup";
import ImportSheet from "../common/ImportSheet";

const ListOfUsers = () => {
    const [popup, setpopup] = useState(false)
    const nav = useNavigate();
    const [role] = useState(localStorage.getItem("role"));
    const params = useParams();
    const [page, setpage] = useState(1);
    const [filter, setfilter] = useState("");
    const [confirmation, setconfirmation] = useState("");
    let companyId = localStorage.getItem('userID')
    const paramId = role === "company" ? companyId : params.id;

    const notification_type = "677534649c3a99e13dcd7456"
    const UserList = useGetUserList("user list", "passanger", paramId, page, 10, filter)


    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-md-12">
                    <div className="theme-table">
                        <div className="tab-heading">
                            <div className="count">
                                <h3>Total Users</h3>
                                <p>{UserList.isSuccess && UserList.data?.data.totalUsers || 0}</p>
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
                                    onClick={() => nav("/home/total-users/add-user")}
                                    className="btn btn-primary"
                                >
                                    + Add User
                                </button>
                                <button className="btn btn-primary" onClick={() => setpopup(true)}>
                                    + Import Sheet
                                </button>
                            </div>
                        </div>
                        {UserList.isFetching ? (
                            <Loader />
                        ) : (
                            <>
                                {UserList.data?.data.users ? (
                                    <>
                                        <table
                                            id="example"
                                            className="table table-striped nowrap"
                                            style={{ width: "100%" }}
                                        >
                                            <thead>
                                                <tr>

                                                    <th>User</th>
                                                    <th>Company</th>
                                                    {/* <th>Email</th> */}
                                                    <th>Contact No.</th>
                                                    <th>Contact Email</th>
                                                    <th>&nbsp;</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {UserList?.data && UserList.data?.data?.users?.map((user) => (
                                                    <tr key={user._id}>

                                                        <td>
                                                            <div
                                                                className={
                                                                    (!user.first_name && !user.last_name) ? "prof nodata" : "prof"
                                                                }
                                                            >
                                                                <img
                                                                    className="profilepicture"
                                                                    src={
                                                                        user.profileImage
                                                                            ? user.profileImage
                                                                            : nouser
                                                                    }
                                                                />
                                                                {user.first_name} {user.last_name}
                                                            </div>
                                                        </td>
                                                        <td className={!user.company_name ? "companynamenodata" : ""}>
                                                            {user.company_name}
                                                        </td>
                                                        <td className={!user?.mobile_no ? "nodata" : ""}>
                                                            {`${user?.mobile_no_country_code ?? ''}${user?.mobile_no ?? ''}`}
                                                        </td>
                                                        <td className={!user.email ? "nodata" : ""}>
                                                            {user.email}
                                                        </td>
                                                        <td>
                                                            <span
                                                                onClick={() => setconfirmation(user._id)}
                                                                className="tbl-gray"
                                                            >
                                                                Delete
                                                            </span>
                                                            {confirmation === user._id && (
                                                                <DeleteConfirm
                                                                    id={user._id}
                                                                    setconfirmation={setconfirmation}
                                                                />
                                                            )}
                                                            <span
                                                                onClick={() =>
                                                                    nav(
                                                                        `/home/total-users/user-information/${user._id}`
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
                                                    disabled={page === UserList.data?.data.totalPages}
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

export default ListOfUsers;
