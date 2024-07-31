import { useNavigate } from "react-router-dom"
import dp from "../assets/images/driver-profile.png"
import icon from "../assets/images/icon.png"
import search from "../assets/images/search.png"

const ListOfCompanies = () => {
    const nav = useNavigate();

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-md-12">
                    <div className="theme-table">
                        <div className="tab-heading">
                            <h3>List of Companies</h3>
                            <div className="tbl-filter">
                                <div className="input-group">
                                    <span className="input-group-text"><img src={search} /></span>
                                    <input type="text" className="form-control" placeholder="Filter by Company" />
                                    <span className="input-group-text"><img src={icon} /></span>
                                </div>
                                <button className="btn btn-primary" onClick={() => nav("add-company")}>+ Add Company</button>
                            </div>
                        </div>
                        <table id="example" className="table table-striped nowrap" style={{ width: "100%" }}>
                            <thead>
                                <tr>
                                    <th>Company</th>
                                    <th>Contact name</th>
                                    <th>Contact No.</th>
                                    <th>Contact Email</th>
                                    <th>&nbsp;</th>

                                </tr>
                            </thead>
                            <tbody>
                                {companyData.map(data =>
                                    <tr key={data.id}>
                                        <td>{data.company}</td>
                                        <td>
                                            <div className="prof">
                                                <img src={data.img}/>
                                                {data.name}
                                            </div>
                                        </td>
                                        <td>{data.contactNo}</td>
                                        <td>{data.email}</td>
                                        <td><span className="tbl-btn">view</span></td>
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

export default ListOfCompanies

const companyData = [
    { id: 1, name: "Natali Craig",img: dp, company: "Grandin & Co.", contactNo: "+27 98250 98250", email: "demon@grandin.com" },
    { id: 2, name: "Natali Craig",img: dp, company: "Grandin & Co.", contactNo: "+27 98250 98250", email: "demon@grandin.com" },
    { id: 3, name: "Natali Craig",img: dp, company: "Grandin & Co.", contactNo: "+27 98250 98250", email: "demon@grandin.com" },
    { id: 4, name: "Natali Craig",img: dp, company: "Grandin & Co.", contactNo: "+27 98250 98250", email: "demon@grandin.com" },
    { id: 5, name: "Natali Craig",img: dp, company: "Grandin & Co.", contactNo: "+27 98250 98250", email: "demon@grandin.com" },
    { id: 6, name: "Natali Craig",img: dp, company: "Grandin & Co.", contactNo: "+27 98250 98250", email: "demon@grandin.com" },
    { id: 7, name: "Natali Craig",img: dp, company: "Grandin & Co.", contactNo: "+27 98250 98250", email: "demon@grandin.com" },
    { id: 8, name: "Natali Craig",img: dp, company: "Grandin & Co.", contactNo: "+27 98250 98250", email: "demon@grandin.com" },
    { id: 9, name: "Natali Craig",img: dp, company: "Grandin & Co.", contactNo: "+27 98250 98250", email: "demon@grandin.com" },
]