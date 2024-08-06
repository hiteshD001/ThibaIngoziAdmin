import { useQuery } from "@tanstack/react-query"
import CustomChart from "../common/CustomChart"
import { getchartData, getHotspot, getRecentSOS, userList } from "../API Calls/API"
import nouser from "../assets/images/NoUser.png"
import { useEffect, useState } from "react"
import Loader from "../common/Loader"
import { Link } from "react-router-dom"


const Home = () => {
    const [chartData, setchartData] = useState(new Array(12).fill(0));
    const [time, settime] = useState("today")
    const [activeUser, setactiveUser] = useState(0)

    const soscount = useQuery({
        queryKey: ["chart data"],
        queryFn: getchartData,
        staleTime: 15 * 60 * 1000
    })

    const driverList = useQuery({
        queryKey: ["driver list", "driver"],
        queryFn: userList,
        staleTime: 15 * 60 * 1000
    })

    const companyList = useQuery({
        queryKey: ["company list", "company"],
        queryFn: userList,
        staleTime: 15 * 60 * 1000
    })

    const recentSOS = useQuery({
        queryKey: ["recent SOS"],
        queryFn: getRecentSOS,
        staleTime: 15 * 60 * 1000
    })

    const hotspot = useQuery({
        queryKey: ["hotspot", time],
        queryFn: getHotspot,
        staleTime: 15 * 60 * 1000
    })

    const handlChange = (e) => {
        settime(e.target.value)

    }

    useEffect(() => {
        switch (time) {
            case "today":
                setactiveUser(driverList.data?.data.totalActiveDriversToday || 0)
                break;
            case "yesterday":
                setactiveUser(driverList.data?.data.totalActiveDriversYesterday || 0)
                break;
            case "this_week":
                setactiveUser(driverList.data?.data.totalActiveDriversThisWeek || 0)
                break;
            case "this_month":
                setactiveUser(driverList.data?.data.totalActiveDriversThisMonth || 0)
                break;
            case "this_year":
                setactiveUser(driverList.data?.data.totalActiveDriversThisYear || 0)
                break;
            default:
                setactiveUser(0)
                break;
        }
    }, [driverList.data, time])

    useEffect(() => {
        const newdata = [...chartData];
        soscount.data?.data.forEach(item => {
            newdata[item.month - 1] = item.count;
        });

        setchartData(newdata);
    }, [soscount.data])

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-md-12">
                    <div className="filter-date">
                        <select className="form-select" value={time} onChange={handlChange}>
                            <option value="today">Today</option>
                            <option value="yesterday">Yesterday</option>
                            <option value="this_week">This week</option>
                            <option value="this_month">This Month</option>
                            <option value="this_year">This Year</option>
                        </select>
                    </div>
                </div>
            </div>
            <div className="clearfix"></div>
            {localStorage.getItem("role") === 'super_admin' ?
                <div className="row">
                    <div className="col-md-4">
                        <div className="dash-counter">
                            <span>Total Companies</span>
                            <h3>{companyList.data?.data.totalUsers || 0}</h3>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="dash-counter">
                            <span>Driver Active</span>
                            <h3>{driverList.data?.data.totalActiveDrivers || 0}</h3>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="dash-counter">
                            <span>Driver Active This Month</span>
                            <h3>{activeUser}</h3>
                        </div>
                    </div>
                </div>
                :
                <div className="row">
                    <div className="col-md-6">
                        <div className="dash-counter">
                            <span>Driver Active</span>
                            <h3>{driverList.data?.data.totalActiveDrivers || 0}</h3>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="dash-counter">
                            <span>Driver Active This Month</span>
                            <h3>{driverList.data?.data.totalActiveDriversThisMonth || 0}</h3>
                        </div>
                    </div>
                </div>
            }

            <div className="clearfix"></div>
            <div className="row">
                <div className="col-md-8">
                    <div className="requests-chart">
                        <div className="chart-heading">
                            <h3>SOS Requests</h3>
                        </div>
                        <CustomChart data={chartData} />
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="hotspot">
                        <h1>Hotspot</h1>
                        <div className="location-list">
                            {hotspot.isFetching ? <Loader /> :
                                hotspot.data?.data.length === 0 ? <p>No data Found</p> : hotspot.data?.data.sort((a, b) => a.timesCalled > b.timesCalled ? -1 : 1).map((d, index) =>
                                    <div className="location" key={index}>
                                        <span>{d.address}</span>
                                        {/* <div className="progress">
                                        <div className="progress-bar" role="progressbar" style={{ width: `${d.percentage}%` }} aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                                    </div> */}
                                        <span>{d.timesCalled}</span>
                                    </div>
                                )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="clearfix"></div>
            <div className="row">
                <div className="col-md-12">
                    <div className="theme-table">
                        <div className="tab-heading">
                            <h3>Recent Active Driver</h3>
                        </div>
                        {recentSOS.isFetching ? <Loader /> : <table id="example" className="table table-striped nowrap" style={{ width: "100%" }}>
                            <thead>
                                <tr>
                                    <th>Driver</th>
                                    <th>Company</th>
                                    <th>Last Active Status</th>
                                    <th>&nbsp;</th>

                                </tr>
                            </thead>
                            <tbody>
                                {recentSOS.data?.data.toReversed().map(row =>
                                    <tr key={row._id}>
                                        <td>
                                            <div className={!row.user_id?.username ? "prof nodata" : "prof"}>
                                                <img className="profilepicture" src={row.user_id?.profileImage || nouser} />
                                                {row.user_id?.username}
                                            </div>
                                        </td>
                                        <td className={!row.user_id?.company_name ? "nodata" : ""}>{row.user_id?.company_name}</td>
                                        <td className={!row.address ? "nodata" : ""} >{row.address}</td>
                                        <td><Link to={`total-drivers/vehicle-information/${row.user_id._id}`} className="tbl-btn">view</Link></td>
                                    </tr>
                                )}
                            </tbody>
                        </table>}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home