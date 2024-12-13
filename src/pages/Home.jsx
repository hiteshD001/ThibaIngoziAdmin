import { Link, NavLink } from "react-router-dom";

import { useGetRecentSOS} from "../API Calls/API";
import { useWebSocket } from "../API Calls/WebSocketContext";

import nouser from "../assets/images/NoUser.png";

import { format } from "date-fns";

import Loader from "../common/Loader";
import Analytics from "../common/Analytics";

const Home = () => {
    const recentSOS = useGetRecentSOS()

    const { isConnected, activeUserList  } = useWebSocket()

    console.log(isConnected, activeUserList )

    return (
        <div className="container-fluid">
            <Analytics />
            <div className="row">
                <div className="col-md-12">
                    <div className="theme-table">
                        <div className="tab-heading"> <h3>Active Drivers</h3> </div>

                        {(isConnected && activeUserList.length > 0) ?
                            <table
                                id="example"
                                className="table table-striped nowrap"
                                style={{ width: "100%" }}
                            >
                                <thead>
                                    <tr>
                                        <th>Driver</th>
                                        <th>Company</th>
                                        <th>Address</th>
                                        <th>Request reached</th>
                                        <th>Request Accept</th>
                                        <th>Location</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeUserList.map((row) => (
                                        <tr key={row._id}>
                                            <td>
                                                <div className={!row.user_id?.username ? "prof nodata" : "prof"}>
                                                    <img
                                                        className="profilepicture"
                                                        src={row.user_id?.profileImage || nouser}
                                                    />
                                                    {row.user_id?.username}
                                                </div>
                                            </td>

                                            <td className={!row.user_id?.company_name ? "companynamenodata" : ""}>
                                                {row.user_id?.company_name}
                                            </td>

                                            <td className={!row.address ? "nodata" : ""}>
                                                {row.address}
                                            </td>

                                            <td>
                                                {row.req_reach}
                                            </td>

                                            <td>
                                                {row.req_accept}
                                            </td>

                                            <td>
                                                <NavLink to={`/home/hotspot/location?lat=${row?.lat}&long=${row?.long}&req_reach=${row?.req_reach}&req_accept=${row?.req_accept}`} className="tbl-btn">
                                                    view
                                                </NavLink>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            : <p className="no-data-found">No Active Drivers</p>
                        }
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-12">
                    <div className="theme-table">
                        <div className="tab-heading"> <h3>Recent Active Driver</h3> </div>

                        {recentSOS.isFetching ?
                            <Loader /> :
                            recentSOS.data?.data ?
                                <table
                                    id="example"
                                    className="table table-striped nowrap"
                                    style={{ width: "100%" }}
                                >
                                    <thead>
                                        <tr>
                                            <th>Driver</th>
                                            <th>Company</th>
                                            <th>Last Active Status</th>
                                            <th>Time Stamp</th>
                                            <th>&nbsp;</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentSOS.data?.data?.map((row) => (
                                            <tr key={row._id}>
                                                <td>
                                                    <div className={!row.user_id?.username ? "prof nodata" : "prof"}>
                                                        <img
                                                            className="profilepicture"
                                                            src={row.user_id?.profileImage || nouser}
                                                        />
                                                        {row.user_id?.username}
                                                    </div>
                                                </td>

                                                <td className={!row.user_id?.company_name ? "companynamenodata" : ""}>
                                                    {row.user_id?.company_name}
                                                </td>

                                                <td className={!row.address ? "nodata" : ""}>
                                                    {row.address}
                                                </td>

                                                <td className={!row.createdAt ? "nodata" : ""}>
                                                    {format(row.createdAt, "dd/MM/yyyy  hh:mm aa")}
                                                </td>

                                                <td>
                                                    <Link to={`total-drivers/vehicle-information/${row.user_id._id}`} className="tbl-btn">
                                                        view
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                : <p className="no-data-found">No data found</p>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
