import { useState } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { useGetAllOrders, useUpdateStatus } from "../API Calls/API";

import nouser from "../assets/images/NoUser.png";
import Prev from "../assets/images/left.png";
import Next from "../assets/images/right.png";

import { toast } from "react-toastify";
import { toastOption } from "../common/ToastOptions";

import Loader from "../common/Loader";

const HardwareManagement = () => {
  const client = useQueryClient();
  const [page, setpage] = useState(1);
  const [toggle, settoggle] = useState("");


  const onSuccess = () => {
    toast.success("Order Updated Successfully.");
    client.invalidateQueries("order list");
  }
  const onError = (error) => {
    toast.error(error.response.data.message || "Something went Wrong", toastOption)
  }

  const orderList = useGetAllOrders(page, 10)
  const toggleStatus = useUpdateStatus(onSuccess, onError)

  const handleToggle = (id, quantity, status) => {
    settoggle(id);
    toggleStatus.mutate({ id, quantity, status: status === "delivered" ? "order_received" : "delivered" })
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-12">
          <div className="theme-table">
            <div className="tab-heading">
              <h3>Hardware Management</h3>
    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-md-12">
                    <div className="theme-table">
                        <div className="tab-heading">
                            <h3>Hardware Management</h3>
                        </div>
                        <div className="listing-table">
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
                        </div>
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
            {orderList.isFetching ? (
              <Loader />
            ) : (
              <>
                {orderList.data?.data.orders ? (
                  <>
                    <table
                      id="example"
                      className="table table-striped nowrap"
                      style={{ width: "100%" }}
                    >
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
                        {orderList.data?.data.orders.map((order) => (
                          <tr key={order._id}>
                            <td>
                              <div
                                className={
                                  !order.user_id?.username
                                    ? "prof nodata"
                                    : "prof"
                                }
                              >
                                <img
                                  className="profilepicture"
                                  src={order.user_id?.profileImage || nouser}
                                />
                                {order.user_id?.username}
                              </div>
                            </td>
                            <td
                              className={
                                !order.user_id?.address ? "nodata" : ""
                              }
                            >
                              {order.user_id?.address}
                            </td>
                            <td
                              className={
                                !order.user_id?.mobile_no ? "nodata" : ""
                              }
                            >
                              {order.user_id?.mobile_no}
                            </td>
                            <td
                              className={!order.user_id?.email ? "nodata" : ""}
                            >
                              {order.user_id?.email}
                            </td>
                            <td>
                              <button
                                className={`${order.status}-btn`}
                                onClick={() =>
                                  handleToggle(
                                    order._id,
                                    order.item_quantity,
                                    order.status
                                  )
                                }
                              >
                                {toggleStatus.isPending &&
                                  toggle === order._id ? (
                                  <Loader color="white" />
                                ) : order.status === "order_received" ? (
                                  "Order Received"
                                ) : (
                                  "Delivered"
                                )}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="pagiation">
                      <div className="pagiation-left">
                        <button
                          disabled={page === 1}
                          onClick={() => setpage((p) => p - 1)}
                        >
                          <img src={Prev} /> Prev
                        </button>
                      </div>
                      <div className="pagiation-right">
                        <button
                          disabled={page === orderList.data?.data.totalPages}
                          onClick={() => setpage((p) => p + 1)}
                        >
                          Next <img src={Next} />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="no-data-found">No data found</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
    </div>
  );
};

export default HardwareManagement;
