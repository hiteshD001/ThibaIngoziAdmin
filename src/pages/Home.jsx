import { useQuery } from "@tanstack/react-query";
import {
    getRecentSOS,
} from "../API Calls/API";
import nouser from "../assets/images/NoUser.png";
import Loader from "../common/Loader";
import { Link } from "react-router-dom";
import Analytics from "../common/Analytics";

const Home = () => {

    const recentSOS = useQuery({
        queryKey: ["recent SOS"],
        queryFn: getRecentSOS,
        staleTime: 15 * 60 * 1000,
    });

    return (
        <div className="container-fluid">
            <Analytics />
            <div className="clearfix"></div>
            <div className="row">
                <div className="col-md-12">
                    <div className="theme-table">
                        <div className="tab-heading">
                            <h3>Recent Active Driver</h3>
                        </div>
                        {recentSOS.isFetching ? (
                            <Loader />
                        ) : (
                            <>
                                {recentSOS.data?.data ? (
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
                                                <th>&nbsp;</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentSOS.data?.data.toReversed().map((row) => (
                                                <tr key={row._id}>
                                                    <td>
                                                        <div
                                                            className={
                                                                !row.user_id?.username ? "prof nodata" : "prof"
                                                            }
                                                        >
                                                            <img
                                                                className="profilepicture"
                                                                src={row.user_id?.profileImage || nouser}
                                                            />
                                                            {row.user_id?.username}
                                                        </div>
                                                    </td>
                                                    <td
                                                        className={
                                                            !row.user_id?.company_name ? "companynamenodata" : ""
                                                        }
                                                    >
                                                        {row.user_id?.company_name}
                                                    </td>
                                                    <td className={!row.address ? "nodata" : ""}>
                                                        {row.address}
                                                    </td>
                                                    <td>
                                                        <Link
                                                            to={`total-drivers/vehicle-information/${row.user_id._id}`}
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

export default Home;
