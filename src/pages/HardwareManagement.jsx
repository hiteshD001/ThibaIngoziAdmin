import dp from "../assets/images/driver-profile.png"

const HardwareManagement = () => {
    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-md-12">
                    <div className="theme-table">
                        <div className="tab-heading">
                            <h3>Hardware Management</h3>
                        </div>
                        <table id="example" className="table table-striped nowrap" style={{ width: "100%" }}>
                            <thead>
                                <tr>
                                    <th>Driver</th>
                                    <th>Address</th>
                                    <th>Contact No.</th>
                                    <th>Contact Email</th>
                                    <th>Status</th>

                                </tr>
                            </thead>
                            <tbody>
                                {hardwareData.map(hardware =>
                                    <tr key={hardware.id}>
                                        <td>
                                            <div className="prof">
                                                <img src={hardware.img} alt="Natali Craig" />
                                                    {hardware.name}
                                            </div>
                                        </td>
                                        <td>{hardware.address}</td>
                                        <td>{hardware.contactNo}</td>
                                        <td>{hardware.email}</td>
                                        <td><span className={`${hardware.status.replace(" ", "-")}-btn`}>{hardware.status}</span></td>
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

console.log()

export default HardwareManagement

const hardwareData = [
    { id: 1, name: "Natali Craig", img: dp, address: "Randburg, Johannesburg", contactNo: "+27 98250 98250", email: "demon@grandin.com", status: "Order Received" },
    { id: 2, name: "Natali Craig", img: dp, address: "Randburg, Johannesburg", contactNo: "+27 98250 98250", email: "demon@grandin.com", status: "Cancel" },
    { id: 3, name: "Natali Craig", img: dp, address: "Randburg, Johannesburg", contactNo: "+27 98250 98250", email: "demon@grandin.com", status: "Order Received" },
    { id: 4, name: "Natali Craig", img: dp, address: "Randburg, Johannesburg", contactNo: "+27 98250 98250", email: "demon@grandin.com", status: "Delivered" },
    { id: 5, name: "Natali Craig", img: dp, address: "Randburg, Johannesburg", contactNo: "+27 98250 98250", email: "demon@grandin.com", status: "Order Received" },
    { id: 6, name: "Natali Craig", img: dp, address: "Randburg, Johannesburg", contactNo: "+27 98250 98250", email: "demon@grandin.com", status: "Cancel" },
    { id: 7, name: "Natali Craig", img: dp, address: "Randburg, Johannesburg", contactNo: "+27 98250 98250", email: "demon@grandin.com", status: "Order Received" },
    { id: 8, name: "Natali Craig", img: dp, address: "Randburg, Johannesburg", contactNo: "+27 98250 98250", email: "demon@grandin.com", status: "Delivered" },
    { id: 9, name: "Natali Craig", img: dp, address: "Randburg, Johannesburg", contactNo: "+27 98250 98250", email: "demon@grandin.com", status: "Cancel" },
]