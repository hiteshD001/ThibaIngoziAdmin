import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {Link} from "react-router-dom"
import { getAllOrders, updateStatus } from "../API Calls/API"
import nouser from "../assets/images/NoUser.png"
import Prev from "../assets/images/left.png"
import Next from "../assets/images/right.png"


const HardwareManagement = () => {
    const client = useQueryClient()

    const orderList = useQuery({
        queryKey: ["order list"],
        queryFn: getAllOrders,
        staleTime: 15 * 60 * 1000
    })

    const toggleStatus = useMutation({
        mutationKey: ["Toggle Status"],
        mutationFn: updateStatus,
        onSuccess: (res) => { console.log(res); client.invalidateQueries("order list") },
        onError: (err) => console.log(err)
    })

    const handleToggle = (id, quantity, status) => {
        toggleStatus.mutate({ id, quantity, status: status === "delivered" ? "order_received" : "delivered" })
    }

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
                                {orderList.data?.data.toReversed().map(order =>
                                    <tr key={order._id}>
                                        <td>
                                            <div className="prof">
                                                <img className="profilepicture" src={order.user_id?.profileImage || nouser} />
                                                {order.user_id?.username}
                                            </div>
                                        </td>
                                        <td>{order.user_id?.address}</td>
                                        <td>{order.user_id?.mobile_no}</td>
                                        <td>{order.user_id?.email}</td>
                                        <td>
                                            <span
                                                className={`${order.status}-btn`}
                                                onClick={() => handleToggle(order._id, order.item_quantity, order.status)}
                                            >
                                                {order.status === "order_received" ? "Order Received" : order.status === "delivered" ? "Delivered" : ""}
                                            </span>
                                        </td>
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

console.log()

export default HardwareManagement

// const hardwareData = [
//     { id: 1, name: "Natali Craig", img: dp, address: "Randburg, Johannesburg", contactNo: "+27 98250 98250", email: "demon@grandin.com", status: "Order Received" },
//     { id: 2, name: "Natali Craig", img: dp, address: "Randburg, Johannesburg", contactNo: "+27 98250 98250", email: "demon@grandin.com", status: "Cancel" },
//     { id: 3, name: "Natali Craig", img: dp, address: "Randburg, Johannesburg", contactNo: "+27 98250 98250", email: "demon@grandin.com", status: "Order Received" },
//     { id: 4, name: "Natali Craig", img: dp, address: "Randburg, Johannesburg", contactNo: "+27 98250 98250", email: "demon@grandin.com", status: "Delivered" },
//     { id: 5, name: "Natali Craig", img: dp, address: "Randburg, Johannesburg", contactNo: "+27 98250 98250", email: "demon@grandin.com", status: "Order Received" },
//     { id: 6, name: "Natali Craig", img: dp, address: "Randburg, Johannesburg", contactNo: "+27 98250 98250", email: "demon@grandin.com", status: "Cancel" },
//     { id: 7, name: "Natali Craig", img: dp, address: "Randburg, Johannesburg", contactNo: "+27 98250 98250", email: "demon@grandin.com", status: "Order Received" },
//     { id: 8, name: "Natali Craig", img: dp, address: "Randburg, Johannesburg", contactNo: "+27 98250 98250", email: "demon@grandin.com", status: "Delivered" },
//     { id: 9, name: "Natali Craig", img: dp, address: "Randburg, Johannesburg", contactNo: "+27 98250 98250", email: "demon@grandin.com", status: "Cancel" },
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