import { useNavigate } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteUser, userList } from "../API Calls/API";

import nouser from "../assets/images/NoUser.png"

const ListOfDrivers = () => {
    const nav = useNavigate();
    const client = useQueryClient()

    const driverList = useQuery({
        queryKey: ["driver list", "driver"],
        queryFn: userList,
        staleTime: 15 * 60 * 1000
    })

    const deleteDriver = useMutation({
        mutationKey: ["delete user"],
        mutationFn: deleteUser,
        onSuccess: (res) => { console.log(res); client.invalidateQueries("driver list") },
        onError: (res) => console.log(res)
    })

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
                                {driverList.data?.data.users.toReversed().map(driver =>
                                    <tr key={driver._id}>
                                        <td>
                                            <div className="prof">
                                                <img className="profilepicture" src={driver.profileImage ? driver.profileImage : nouser} />
                                                {driver.username}
                                            </div>
                                        </td>
                                        <td>{driver.id_no}</td>
                                        <td>{driver?.contacts && driver?.contacts[0]}</td>
                                        <td>{driver.email}</td>
                                        <td>
                                            <span onClick={() => deleteDriver.mutate(driver._id)} className="tbl-gray">Delete</span>
                                            <span onClick={() => nav("vehicle-information")} className="tbl-btn">view</span>
                                        </td>
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