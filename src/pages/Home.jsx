import dp from "../assets/images/driver-profile.png"
import CustomChart from "../common/CustomChart"

const Home = () => {
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
                {cards.map(card =>
                    <div key={card.id} className="col-md-4">
                        <div className="dash-counter">
                            <span>{card.name}</span>
                            <h3>{card.count}</h3>
                        </div>
                    </div>
                )}
            </div>
            <div className="clearfix"></div>
            <div className="row">
                <div className="col-md-8">
                    <div className="requests-chart">
                        <div className="chart-heading">
                            <h3>SOS Requests</h3>
                        </div>
                        <CustomChart data1={data1} data2={data2} />
                        {/* <canvas id="myChart"></canvas> */}
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="hotspot">
                        <h1>Hotspot</h1>
                        {location.map(d =>
                            <div className="location" key={d.id}>
                                <span>{d.name}</span>
                                <div className="progress">
                                    <div className="progress-bar" role="progressbar" style={{ width: d.progress }} aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                                </div>
                                <span>{d.count}</span>
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
                                {tabledata.map(row =>
                                    <tr key={row.id}>
                                        <td>
                                            <div className="prof">
                                                <img src={row.img} />
                                                {row.name}
                                            </div>
                                        </td>
                                        <td>{row.company}</td>
                                        <td>{row.laststatus}</td>
                                        <td><a href="#" className="tbl-btn">view</a></td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home

const cards = [
    { id: 1, name: "Total Companies", count: 124 },
    { id: 2, name: "Driver Active", count: 96 },
    { id: 3, name: "Driver Active This Month", count: 55 },
]

const tabledata = [
    { id: 1, img: dp, name: "Natali Craig", company: "Grandin & Co.", laststatus: "08:45 AM at Randburg, Johannesburg" },
    { id: 2, img: dp, name: "Natali Craig", company: "Grandin & Co.", laststatus: "08:45 AM at Randburg, Johannesburg" },
    { id: 3, img: dp, name: "Natali Craig", company: "Grandin & Co.", laststatus: "08:45 AM at Randburg, Johannesburg" },
    { id: 4, img: dp, name: "Natali Craig", company: "Grandin & Co.", laststatus: "08:45 AM at Randburg, Johannesburg" },
    { id: 5, img: dp, name: "Natali Craig", company: "Grandin & Co.", laststatus: "08:45 AM at Randburg, Johannesburg" },
]

const location = [
    { id: 1, name: "Location 1", progress: "90%", count: 6 },
    { id: 2, name: "Location 2", progress: "80%", count: 8 },
    { id: 3, name: "Location 3", progress: "92%", count: 10 },
    { id: 4, name: "Location 4", progress: "94%", count: 5 },
    { id: 5, name: "Location 5", progress: "98%", count: 9 },
    { id: 6, name: "Location 6", progress: "100%", count: 4 },
    { id: 7, name: "Location 7", progress: "80%", count: 3 },
]

const data1 = [20, 30, 40, 40, 30, 20, 30, 40, 50, 30, 20, 30]
const data2 = [30, 20, 20, 30, 40, 30, 20, 30, 40, 50, 50, 40]