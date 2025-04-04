import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import icon from "../assets/images/icon.png";
import search from "../assets/images/search.png";
import Prev from "../assets/images/left.png";
import Next from "../assets/images/right.png";
import nouser from "../assets/images/NoUser.png";

import { useGetTripList, useGetUserList } from "../API Calls/API";
import { DeleteConfirm } from "../common/ConfirmationPOPup";
import Loader from "../common/Loader";

const ListOfTrips = () => {
  const nav = useNavigate();
  const [page, setpage] = useState(1);
  const [filter, setfilter] = useState("");
  const [confirmation, setconfirmation] = useState("");

  const trip = useGetTripList("Trip list", page, 10, filter)
  const tripList = trip?.data?.data?.tripData
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-12">
          <div className="theme-table">
            <div className="tab-heading">
              <h3>List of Trips</h3>
              <div className="tbl-filter">
                <div className="input-group">
                  <span className="input-group-text">
                    <img src={search} />
                  </span>
                  <input
                    type="text"
                    value={filter}
                    onChange={(e) => setfilter(e.target.value)}
                    className="form-control"
                    placeholder="Search"
                  />
                  <span className="input-group-text">
                    <img src={icon} />
                  </span>
                </div>
                {/* <button
                  className="btn btn-primary"
                  onClick={() => nav("add-company")}
                >
                  + Add Company
                </button> */}
              </div>
            </div>
            {!tripList ? (
              <Loader />
            ) : (
              <>
                {tripList ? (
                  <>
                    <table
                      id="example"
                      className="table table-striped nowrap"
                      style={{ width: "100%" }}
                    >
                      <thead>
                        <tr>
                          <th>Driver</th>
                          <th>Passanger</th>
                          <th>Status</th>
                          <th>Started at</th>
                          <th>Ended at</th>
                          <th>Ended By</th>
                          <th>Trip Location</th>
                          <th>&nbsp;</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tripList?.map((data) => {
                          const startlat = data?.trip_start?.split(",")[0]
                          const startlong = data?.trip_start?.split(",")[1]
                          const endlat = data?.trip_end?.split(",")[0]
                          const endlong = data?.trip_end?.split(",")[1]

                          return <tr key={data?._id}>
                            {/* <td>{`${data.driver_id.first_name} ${data.driver_id.last_name}`}</td> */}
                            <td><Link to={`/home/total-drivers/driver-information/${data.driver._id}`} className="link">{data.driver.first_name}
                            </Link></td>
                            <td>
                              <div
                                className={
                                  !data.passenger ? "prof nodata" : "prof"
                                }
                              >
                                {/* <img
                                  className="profilepicture"
                                  src={data.profileImage || nouser}
                                /> */}
                                <Link to={`/home/total-trips/user-information/${data.passenger._id}`} className="link">{data.passenger.first_name}</Link>
                              </div>
                            </td>

                            <td>
                              {data.trip_status}
                            </td>
                            <td>
                              {new Date(data.createdAt).toLocaleString()}
                            </td>
                            <td>
                              {data.trip_status === 'ended' ? new Date(data.endedAt).toLocaleString() : '---'}
                            </td>
                            <td>
                              {data.ended_by}
                            </td>
                            <td>
                              <span
                                onClick={() =>
                                  nav(`/home/total-trips/location?lat=${startlat}&long=${startlong}&end_lat=${endlat}&end_long=${endlong}`)
                                }
                                className="tbl-btn"
                              >
                                view
                              </span>
                            </td>
                            <td>
                              <span
                                onClick={() => setconfirmation(data._id)}
                                className="tbl-gray"
                              >
                                Delete
                              </span>
                              {confirmation === data._id && (
                                <DeleteConfirm
                                  id={data._id}
                                  setconfirmation={setconfirmation}
                                  trip={"trip"}
                                />
                              )}
                              {/* <span
                                onClick={() =>
                                  nav(`/home/total-trips/${data._id}`)
                                }
                                className="tbl-btn"
                              >
                                view
                              </span> */}
                            </td>
                          </tr>
                        })}
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
                          disabled={page === (trip.data.data?.totalPages ?? 0)}
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

export default ListOfTrips;
