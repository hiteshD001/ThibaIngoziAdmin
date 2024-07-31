import { useNavigate } from "react-router-dom"
import dp from "../assets/images/driver-profile.png"

const ListOfDrivers = () => {
    const nav = useNavigate();

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-md-12">
                    <div className="company-info">
                        <div className="comapny-titles">Company Information</div>
                        <div className="comapny-det">
                            <div className="c-info">
                                <span>Company</span>
                                <p>Grandin & Co.</p>
                            </div>
                            <div className="c-info">
                                <span>Contact No.</span>
                                <p>+27 98250 98250</p>
                            </div>
                            <div className="c-info">
                                <span>Contact Email</span>
                                <p>demon@grandin.com</p>
                            </div>
                        </div>
                    </div>
                    <div className="theme-table">
                        <div className="tab-heading">
                            <h3>Total Drivers</h3>
                            <button onClick={() => nav("add-driver")} className="btn btn-primary">+ Add Driver</button>
                        </div>
                        <table id="example" className="table table-striped nowrap" style={{ width: "100%" }}>
                            <thead>
                                <tr>
                                    <th>Driver</th>
                                    <th>Driver ID</th>
                                    <th>Contact No.</th>
                                    <th>Contact Email</th>
                                    <th>&nbsp;</th>

                                </tr>
                            </thead>
                            <tbody>
                                {Driverdata.map(driver =>
                                    <tr key={driver.id}>
                                        <td>
                                            <div className="prof">
                                                <img src={driver.img} />
                                                {driver.name}
                                            </div>
                                        </td>
                                        <td>{driver.company}</td>
                                        <td>{driver.contactNo}</td>
                                        <td>{driver.email}</td>
                                        <td><span className="tbl-gray">Delete</span> <span onClick={() => nav("vehicle-information")} className="tbl-btn">view</span></td>
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

export default ListOfDrivers

const Driverdata = [
    { id: 1, name: "Natali Craig", img: dp, company: "Grandin & Co.", contactNo: "+27 98250 98250", email: "demon@grandin.com" },
    { id: 2, name: "Natali Craig", img: dp, company: "Grandin & Co.", contactNo: "+27 98250 98250", email: "demon@grandin.com" },
    { id: 3, name: "Natali Craig", img: dp, company: "Grandin & Co.", contactNo: "+27 98250 98250", email: "demon@grandin.com" },
    { id: 4, name: "Natali Craig", img: dp, company: "Grandin & Co.", contactNo: "+27 98250 98250", email: "demon@grandin.com" },
    { id: 5, name: "Natali Craig", img: dp, company: "Grandin & Co.", contactNo: "+27 98250 98250", email: "demon@grandin.com" },
    { id: 6, name: "Natali Craig", img: dp, company: "Grandin & Co.", contactNo: "+27 98250 98250", email: "demon@grandin.com" },
    { id: 7, name: "Natali Craig", img: dp, company: "Grandin & Co.", contactNo: "+27 98250 98250", email: "demon@grandin.com" },
    { id: 8, name: "Natali Craig", img: dp, company: "Grandin & Co.", contactNo: "+27 98250 98250", email: "demon@grandin.com" },
    { id: 9, name: "Natali Craig", img: dp, company: "Grandin & Co.", contactNo: "+27 98250 98250", email: "demon@grandin.com" },
]