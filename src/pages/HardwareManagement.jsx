import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getAllOrders, updateStatus } from "../API Calls/API"
import nouser from "../assets/images/NoUser.png"
import Prev from "../assets/images/left.png"
import Next from "../assets/images/right.png"
import { toast } from "react-toastify"
import { toastOption } from "../common/ToastOptions"
import { useState } from "react"
import Loader from "../common/Loader"


const HardwareManagement = () => {
    const client = useQueryClient()
    const [page, setpage] = useState(1)
    const [toggle, settoggle] = useState("")

    const orderList = useQuery({
        queryKey: ["order list", page, 7],
        queryFn: getAllOrders,
        staleTime: 15 * 60 * 1000,
        placeholderData: keepPreviousData
    })

    const toggleStatus = useMutation({
        mutationKey: ["Toggle Status"],
        mutationFn: updateStatus,
        onSuccess: (res) => { console.log(res); client.invalidateQueries("order list") },
        onError: (error) => toast.error(error.response.data.message || "Something went Wrong", toastOption)
    })

    const handleToggle = (id, quantity, status) => {
        settoggle(id)
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
                        {orderList.isFetching ? <Loader /> : <table id="example" className="table table-striped nowrap" style={{ width: "100%" }}>
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

                                {orderList.data?.data.orders.map(order =>
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
                                            <button
                                                className={`${order.status}-btn`}
                                                onClick={() => handleToggle(order._id, order.item_quantity, order.status)}
                                            >
                                                {toggleStatus.isPending && toggle === order._id ? <Loader /> : order.status === "order_received" ? "Order Received" : order.status === "delivered" ? "Delivered" : ""}
                                            </button>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>}
                        <div className="pagiation">
                            <div className="pagiation-left">
                                <button disabled={page === 1} onClick={() => setpage(p => p - 1)}><img src={Prev} />  Prev</button>
                            </div>
                            <div className="pagiation-right">
                                <button disabled={page === orderList.data?.data.totalPages} onClick={() => setpage(p => p + 1)} >Next <img src={Next} /></button>
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