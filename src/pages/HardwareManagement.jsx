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
            </div>
            {orderList.isFetching ? (
              <Loader />
            ) : (
              <>
                {orderList.data?.data.orders ? (
                  <>
                    <div className="tablecontainer">
                      <table id="example" className="table table-striped nowrap" style={{ width: "100%", minWidth: '1500px' }}>

                        <thead>
                          <tr>
                            <th>Driver</th>
                            <th>Street</th>
                            <th>Province</th>
                            <th>City</th>
                            <th>Postal Code</th>
                            <th>Country</th>
                            <th>Suburb</th>
                            <th>Contact No.</th>
                            <th>Contact Email</th>
                            <th>Quantity</th>
                            <th>Total</th>
                            <th>Status</th>
                          </tr>
                        </thead>

                        <tbody>
                          {orderList.data?.data.orders.map((order) => (
                            <tr key={order._id}>

                              <td>
                                <div className={!order.user_id?.username ? "prof nodata" : "prof"}>
                                  <img
                                    className="profilepicture"
                                    src={order.user_id?.profileImage || nouser}
                                  />
                                  {order.user_id?.username}
                                </div>
                              </td>

                              <td className={!order?.street ? "nodata" : ""}>
                                {order?.street}
                              </td>

                              <td className={!order?.province?.province_name ? "nodata" : ""}>
                                {order?.province?.province_name}
                              </td>

                              <td className={!order?.city ? "nodata" : ""}>
                                {order?.city}
                              </td>

                              <td className={!order?.postal_code ? "nodata" : ""}>
                                {order?.postal_code}
                              </td>

                              <td className={!order?.country?.country_name ? "nodata" : ""}>
                                {order?.country?.country_name}
                              </td>

                              <td className={!order?.suburb ? "nodata" : ""}>
                                {order?.suburb}
                              </td>

                              <td className={!order.user_id?.mobile_no ? "nodata" : ""}>
                                {order.user_id?.mobile_no}
                              </td>

                              <td className={!order.user_id?.email ? "nodata" : ""}>
                                {order.user_id?.email}
                              </td>

                              <td className={!order?.item_quantity ? "nodata" : ""}>
                                {order?.item_quantity}
                              </td>

                              <td className={!order?.total_amount ? "nodata" : ""}>
                                {order?.total_amount}
                              </td>

                              <td>
                                <button
                                  className={`${order.status}-btn`}
                                  onClick={() => handleToggle(order._id, order.item_quantity, order.status)}
                                >
                                  {toggleStatus.isPending &&
                                    toggle === order._id ? <Loader color="white" /> :
                                    order.status === "order_received" ? "Order Received" : "Delivered"
                                  }
                                </button>
                              </td>

                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

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
  );
};

export default HardwareManagement;
