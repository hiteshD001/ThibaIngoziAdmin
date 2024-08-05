import { useQuery } from "@tanstack/react-query"
import CustomChart from "../common/CustomChart"
import { getchartData, getHotspot, getRecentSOS, userList } from "../API Calls/API"
import nouser from "../assets/images/NoUser.png"
import { useEffect, useState } from "react"
import {Link} from "react-router-dom"
import Prev from "../assets/images/left.png"
import Next from "../assets/images/right.png"

const Home = () => {
    const [chartData, setchartData] = useState(new Array(12).fill(0));

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
        queryKey: ["hotspot"],
        queryFn: getHotspot,
        staleTime: 15 * 60 * 1000
    })

    useEffect(() => {
        console.log(soscount.data)
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
                        <select className="form-select">
                            <option>Today</option>
                            <option>Yesterday</option>
                            <option>Last week</option>
                            <option>Last Month</option>
                            <option>Last Year</option>
                        </select>
                    </div>
                </div>
            </div>
            <div className="clearfix"></div>
            <div className="row">
                <div className="col-md-4">
                    <div className="dash-counter">
                        <span>Total Companies</span>
                        <h3>{companyList.data?.data.users.length || 0}</h3>
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
                        <h3>{driverList.data?.data.totalActiveDriversThisMonth || 0}</h3>
                    </div>
                </div>
            </div>
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
                        {hotspot.data?.data.map((d, index) =>
                            <div className="location" key={index}>
                                <span>{d.address}</span>
                                <div className="progress">
                                    <div className="progress-bar" role="progressbar" style={{ width: `${d.percentage}%` }} aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                                </div>
                                <span>{d.timesCalled}</span>
                            </div>
                        )}
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
                        <table id="example" className="table table-striped nowrap" style={{ width: "100%" }}>
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
                                            <div className="prof">
                                                <img className="profilepicture" src={row.user_id?.profileImage || nouser} />
                                                {row.user_id?.username}
                                            </div>
                                        </td>
                                        <td>{row.user_id?.company_name}</td>
                                        <td>{row.address}</td>
                                        <td><a href="#" className="tbl-btn">view</a></td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        <div className="pagiation">
                            <div className="pagiation-left">
                                <Link to="/"><img src={Prev} />  Prev</Link>
                            </div>
                            <div className="pagiation-number">
                                <Link to="/" className="active">1</Link>
                                <Link to="/">2</Link>
                                <Link to="/">3</Link>
                            </div>
                            <div className="pagiation-right">
                                <Link to="/">Next <img src={Next} /></Link>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home