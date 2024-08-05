import { Link, useNavigate } from "react-router-dom"
import icon from "../assets/images/icon.png"
import search from "../assets/images/search.png"
import { userList } from "../API Calls/API"
import { useQuery } from "@tanstack/react-query"
import Prev from "../assets/images/left.png"
import Next from "../assets/images/right.png"

import nouser from "../assets/images/NoUser.png"


const ListOfCompanies = () => {
    const nav = useNavigate();

    const companyList = useQuery({
        queryKey: ["company list", "company"],
        queryFn: userList,
        staleTime: 15 * 60 * 1000
    })

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
                                {companyList.data?.data.users.toReversed().map(data =>
                                    <tr key={data._id}>
                                        <td>{data.company_name}</td>
                                        <td>
                                            <div className="prof">
                                                <img className="profilepicture" src={data.profileImage || nouser} />
                                                {data.name}
                                            </div>
                                        </td>
                                        <td>{data?.mobile_no}</td>
                                        <td>{data.email}</td>
                                        <td><span className="tbl-btn">view</span></td>
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

export default ListOfCompanies

// const companyData = [
//     { id: 1, name: "Natali Craig", img: dp, company: "Grandin & Co.", contactNo: "+27 98250 98250", email: "demon@grandin.com" },
//     { id: 2, name: "Natali Craig", img: dp, company: "Grandin & Co.", contactNo: "+27 98250 98250", email: "demon@grandin.com" },
//     { id: 3, name: "Natali Craig", img: dp, company: "Grandin & Co.", contactNo: "+27 98250 98250", email: "demon@grandin.com" },
//     { id: 4, name: "Natali Craig", img: dp, company: "Grandin & Co.", contactNo: "+27 98250 98250", email: "demon@grandin.com" },
//     { id: 5, name: "Natali Craig", img: dp, company: "Grandin & Co.", contactNo: "+27 98250 98250", email: "demon@grandin.com" },
//     { id: 6, name: "Natali Craig", img: dp, company: "Grandin & Co.", contactNo: "+27 98250 98250", email: "demon@grandin.com" },
//     { id: 7, name: "Natali Craig", img: dp, company: "Grandin & Co.", contactNo: "+27 98250 98250", email: "demon@grandin.com" },
//     { id: 8, name: "Natali Craig", img: dp, company: "Grandin & Co.", contactNo: "+27 98250 98250", email: "demon@grandin.com" },
//     { id: 9, name: "Natali Craig", img: dp, company: "Grandin & Co.", contactNo: "+27 98250 98250", email: "demon@grandin.com" },
// ]

// access_token
// :
// "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiJ0ZXN0dXNlcjAwMkBnbWFpbC5jb20iLCJyb2xlIjoiY29tcGFueSIsImlhdCI6MTcxOTk5OTQ5MywiZXhwIjoxNzIwMDAzMDkzfQ.fhVKfo7BtKXVqQymAh_KP9O1OeVli08HlD0H94GB1qM"
// address
// :
// "address"
// company_bio
// :
// "company_bio"
// company_name
// :
// "company_name"
// contacts
// :
// []
// createdAt
// :
// "2024-07-03T09:38:13.022Z"
// email
// :
// "testuser002@gmail.com"
// fcm_token
// :
// "123123"
// id_no
// :
// 789456
// mobile_no
// :
// 1234567890
// password
// :
// "$2a$10$tnw0NochKHax7QFCcL80n.urygMclk7tfH3eoVGPSjwNEiTZ5kWcO"
// refresh_token
// :
// "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiJ0ZXN0dXNlcjAwMkBnbWFpbC5jb20iLCJyb2xlIjoiY29tcGFueSIsImlhdCI6MTcxOTk5OTQ5MywiZXhwIjoxNzIwNjA0MjkzfQ.WWhbSMm5CqZG1IDJxRSpmG12EbVsZqmWS1kjZ9aoXLM"
// role
// :
// "company"
// __v
// :
// 0
// _id
// :
// "66851c0592d8f5885602f80f"