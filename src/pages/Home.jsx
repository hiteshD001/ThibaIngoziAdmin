import { Link, NavLink } from "react-router-dom";
import { useMemo } from "react";
import {
    useGetActiveSOS,
    useGetRecentSOS,
    useGetUser,
    useUpdateLocationStatus,
} from "../API Calls/API";
import { useWebSocket } from "../API Calls/WebSocketContext";
import nouser from "../assets/images/NoUser.png";
import CustomPagination from "../common/CustomPagination";
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


    const [statusUpdate, setStatusUpdate] = useState(false);
    const [status, setStatus] = useState('')
    const [activeUsers, setActiveUsers] = useState([])
    const [selectedId, setSelectedId] = useState("");
    const { isConnected, activeUserList } = useWebSocket();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const { data: recentSos, isFetching, refetch } = useGetRecentSOS({ page, limit });
    const activeSOS = useGetActiveSOS();
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
    useEffect(() => {
        if (activeUserList?.length > 0) {
            refetch();
            console.log('refetched')
        }
    }, [activeUserList?.length]);

    // active user list pagination
    // const [activePage, setActivePage] = useState(1);
    // const [activeLimit, setActiveLimit] = useState(10);
    // useEffect(() => {
    //     const maxPage = Math.max(
    //         1,
    //         Math.ceil((activeUserList?.length || 0) / activeLimit)
    //     );
    //     if (activePage > maxPage) setActivePage(maxPage);
    // }, [activeUserList, activeLimit]);
    // const paginatedActive = useMemo(() => {
    //     const start = (activePage - 1) * activeLimit;
    //     return activeUserList?.slice(start, start + activeLimit) || [];
    // }, [activeUserList, activePage, activeLimit]);

    return (
        <div className="container-fluid">
            <Analytics />
            <div className="row">
                <div className="col-md-12">
                    <div className="theme-table">
                        <div className="tab-heading">
                            {" "}
                            <h3>Active SOS Alerts</h3>{" "}
                        </div>

                        {isConnected && activeUserList?.length > 0 ? (
                            <>
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
                                        {activeUserList.map((row) => (
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
                                                                    ?.selfieImage || row.user_id.fullImage ||
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
                                {/* <CustomPagination
                                    page={activePage}
                                    setPage={setActivePage}
                                    limit={activeLimit}
                                    setLimit={setActiveLimit}
                                    totalPages={Math.ceil(activeUserList.length / activeLimit)}
                                    totalItems={activeUserList.length}
                                /> */}
                            </>
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
                            <h3>Recently Closed SOS Alerts</h3>
                        </div>

                        {isFetching ? (
                            <Loader />
                        ) : recentSos?.data?.items?.length > 0 ? (
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
                                            <th>Last Active Status</th>
                                            <th>Start Time Stamp</th>
                                            <th>End Time Stamp</th>
                                            <th>&nbsp;</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentSos?.data?.items?.map((row) => (
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
                                <CustomPagination
                                    page={page}
                                    setPage={setPage}
                                    limit={limit}
                                    setLimit={setLimit}
                                    totalPages={recentSos?.data?.totalPages || 1}
                                    totalItems={recentSos?.data?.totalItems || 0}
                                />
                            </>
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
