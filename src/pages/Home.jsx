import { Link, NavLink } from "react-router-dom";

import {
    useGetActiveSOS,
    useGetRecentSOS,
    useGetUser,
    useUpdateLocationStatus,
} from "../API Calls/API";
import { useWebSocket } from "../API Calls/WebSocketContext";

import nouser from "../assets/images/NoUser.png";

import { format } from "date-fns";

import Loader from "../common/Loader";
import Analytics from "../common/Analytics";
import { SOSStatusUpdate } from "../common/ConfirmationPOPup";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { toastOption } from "../common/ToastOptions";
import moment from "moment/moment";
import { useQueryClient } from "@tanstack/react-query";

const Home = () => {
    const recentSOS = useGetRecentSOS();
    const activeSOS = useGetActiveSOS();
    const [statusUpdate, setStatusUpdate] = useState(false);
    const [status, setStatus] = useState('')
    const [activeUsers, setActiveUsers] = useState([])
    const [selectedId, setSelectedId] = useState("");
    const { isConnected, activeUserList } = useWebSocket();
    const queryClient = useQueryClient();
    const onSuccess = () => {
        toast.success("Status Updated Successfully.");
        setStatusUpdate(false);
        setSelectedId("");
        queryClient.refetchQueries(["activeSOS"]);
    };
    const onError = (error) => {
        toast.error(
            error.response.data.message || "Something went Wrong",
            toastOption
        );
    };

    const getUniqueById = (array) => {
        const map = new Map();
        array.forEach(item => {
            map.set(item._id, item); // or item.id depending on your data
        });
        return [...map.values()];
    };

    useEffect(() => {
        setActiveUsers([])
        setActiveUsers(prev => {
            const combined = [...prev, ...activeUserList || [], ...activeSOS || []];
            return getUniqueById(combined);
        });
    }, [activeUserList, activeSOS]);

    const { mutate } = useUpdateLocationStatus(onSuccess, onError);
    const userinfo = useGetUser(localStorage.getItem("userID"));

    const handleUpdate = () => {
        const toUpdate = {
            help_received: status,
        };
        mutate({
            id: selectedId,
            data: toUpdate,
        });
        setStatusUpdate(false)
    };
    const handleCancel = () => {
        setSelectedId("");
        setStatusUpdate(false);
        setStatus('')
    };
    return (
        <div className="container-fluid">
            <Analytics />
            <div className="row">
                <div className="col-md-12">
                    <div className="theme-table">
                        <div className="tab-heading">
                            {" "}
                            <h3>Active SOS</h3>{" "}
                        </div>

                        {isConnected && activeUsers?.length > 0 ? (
                            <table
                                id="example"
                                className="table table-striped nowrap"
                                style={{ width: "100%" }}
                            >
                                <thead>
                                    <tr>
                                        <th>Driver</th>
                                        <th style={{ width: "10%" }}>Company</th>
                                        <th>Address</th>
                                        <th style={{ width: "9%" }}>Request reached</th>
                                        <th style={{ width: "9%" }}>Request Accept</th>
                                        <th style={{ width: "9%" }}>Type</th>
                                        <th style={{ width: "11%" }}>Time</th>
                                        <th style={{ width: "11%" }}>Status</th>
                                        <th style={{ width: "10%" }}>Location</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeUsers.map((row) => (
                                        <tr key={row._id}>
                                            <td>
                                                <div
                                                    className={
                                                        !row.user_id?.username
                                                            ? "prof nodata"
                                                            : "prof"
                                                    }
                                                >
                                                    <img
                                                        className="profilepicture"
                                                        src={
                                                            row.user_id
                                                                ?.profileImage ||
                                                            nouser
                                                        }
                                                    />
                                                    {row.user_id?.username}
                                                </div>
                                            </td>

                                            <td
                                                className={
                                                    !row.user_id?.company_name
                                                        ? "companynamenodata"
                                                        : ""
                                                }
                                            >
                                                {row.user_id?.company_name}
                                            </td>

                                            <td
                                                className={
                                                    !row.address ? "nodata" : ""
                                                }
                                            >
                                                {row.address}
                                            </td>

                                            <td>{row.req_reach}</td>

                                            <td>{row.req_accept}</td>
                                            <td>{row.type?.type || "-"}</td>
                                            <td>{moment(row?.createdAt).format('HH:mm:ss')}</td>
                                            <td>
                                                {!row?.help_received && <select
                                                    name="help_received"
                                                    className="form-control"
                                                    onChange={(e) => {
                                                        setStatus(e.target.value);
                                                        setStatusUpdate(true);
                                                        setSelectedId(row._id);
                                                    }}
                                                >
                                                    <option value="" hidden> Select </option>
                                                    <option value="help_received"> Help Received </option>
                                                    <option value="cancel"> Cancel </option>
                                                </select>}
                                            </td>
                                            <td>
                                                <NavLink
                                                    type="button"
                                                    to={`/home/hotspot/location?locationId=${row?._id}&lat=${row?.lat}&long=${row?.long}&end_lat=${userinfo?.data?.data?.user?.current_lat}&end_long=${userinfo?.data?.data?.user?.current_long}&req_reach=${row?.req_reach}&req_accept=${row?.req_accept}`}
                                                    className="tbl-btn"
                                                >
                                                    view
                                                </NavLink>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="no-data-found">No Active SOS</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-12">
                    <div className="theme-table">
                        <div className="tab-heading">
                            <h3>Recent Active SOS</h3>
                        </div>

                        {recentSOS.isFetching ? (
                            <Loader />
                        ) : Array.isArray(recentSOS?.data?.data) && recentSOS.data?.data?.length > 0 ? (
                            <table
                                id="example"
                                className="table table-striped nowrap"
                                style={{ width: "100%" }}
                            >
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Company</th>
                                        <th>Last Active Status</th>
                                        <th>Start Time Stamp</th>
                                        <th>End Time Stamp</th>
                                        <th>&nbsp;</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentSOS.data.data.map((row) => (
                                        <tr key={row._id}>
                                            <td>
                                                <div
                                                    className={
                                                        !row.user_id?.username
                                                            ? "prof nodata"
                                                            : "prof"
                                                    }
                                                >
                                                    <img
                                                        className="profilepicture"
                                                        src={
                                                            row.user_id
                                                                ?.selfieImage ||
                                                            nouser
                                                        }
                                                    />
                                                    {row.user_id?.username}
                                                </div>
                                            </td>

                                            <td
                                                className={
                                                    !row.user_id?.company_name
                                                        ? "companynamenodata"
                                                        : ""
                                                }
                                            >
                                                {row.user_id?.company_name}
                                            </td>

                                            <td
                                                className={
                                                    !row.address ? "nodata" : ""
                                                }
                                            >
                                                {row.address}
                                            </td>

                                            <td
                                                className={
                                                    !row.createdAt
                                                        ? "nodata"
                                                        : ""
                                                }
                                            >
                                                {format(row.createdAt, "HH:mm:ss - dd/MM/yyyy")}
                                            </td>
                                            <td
                                                className={
                                                    !row.updatedAt
                                                        ? "nodata"
                                                        : ""
                                                }
                                            >
                                                {moment(row?.updatedAt).format("HH:mm:ss - dd/MM/yyyy")}
                                                {/* {format(row.updatedAt, "HH:mm:ss - dd/MM/yyyy")} */}
                                            </td>
                                            <td>
                                                <Link
                                                    to={`total-drivers/driver-information/${row.user_id._id}`}
                                                    className="tbl-btn"
                                                >
                                                    view
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="no-data-found">No Recent SOS</p>
                        )}
                    </div>
                </div>
            </div>
            {statusUpdate && (
                <SOSStatusUpdate
                    handleCancel={handleCancel}
                    handleUpdate={handleUpdate}
                />
            )}
        </div>
    );
};

export default Home;
