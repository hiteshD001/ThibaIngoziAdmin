import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import icon from "../assets/images/icon.png";
import search from "../assets/images/search.png";
import Prev from "../assets/images/left.png";
import Next from "../assets/images/right.png";
import nouser from "../assets/images/NoUser.png";
import { format } from "date-fns";
import { useGetTripList, useGetUserList } from "../API Calls/API";
import { DeleteConfirm } from "../common/ConfirmationPOPup";
import Loader from "../common/Loader";
import apiClient from "../API Calls/APIClient";
import * as XLSX from 'xlsx';
import { toast } from "react-toastify";
import 'jspdf-autotable';
// import moment from "moment/moment";


const ListOfTrips = () => {
  const nav = useNavigate();
  const [page, setpage] = useState(1);
  const [filter, setfilter] = useState("");
  const [confirmation, setconfirmation] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const trip = useGetTripList("Trip list", page, 10, filter)
  const tripList = trip?.data?.data?.tripData

  const fetchAllUsers = async () => {
    try {
      const response = await apiClient.get(`${import.meta.env.VITE_BASEURL}/userTrip`, {
        params: {
          page: 1,
          limit: 10000,
          filter,
        },
      });
      return response?.data?.tripData || [];
    } catch (error) {
      console.error("Error fetching all Trip data for export:", error);
      toast.error("Failed to fetch Trp data.");
      return [];
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    const allUsers = await fetchAllUsers();
    setIsExporting(false);

    if (!allUsers || allUsers.length === 0) {
      toast.warning("No Trip data to export.");
      return;
    }

    const fileName = "Trip_List";

    // Prepare data for export
    const exportData = allUsers.map(user => ({
      "Driver": user?.driver?.first_name ?? '',
      "Passanger": user?.passenger?.first_name ?? '',
      "Status": user?.trip_status ?? '',
      "Started at": format(user?.createdAt, "HH:mm:ss - dd/MM/yyyy") ?? '',
      "Ended at": user?.trip_status === 'ended' ? format(user?.endedAt, "HH:mm:ss - dd/MM/yyyy") : '',
      "Ended By": user?.ended_by ?? '',
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Set column widths dynamically
    const columnWidths = Object.keys(exportData[0]).map((key) => ({
      wch: Math.max(
        key.length,
        ...exportData.map((row) => String(row[key] || '').length)
      ) + 2,
    }));
    worksheet['!cols'] = columnWidths;

    // Create workbook and add the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, fileName);

    // Trigger download
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-12">
          <div className="theme-table">
            <div className="tab-heading">
              <h3>List of Trips</h3>
              <div className="tbl-filter">
                <div className="input-group" style={{ width: "100%" }}>
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
                <button className="btn btn-primary" onClick={handleExport}
                  disabled={isExporting}>
                  {isExporting ? 'Exporting...' : '+ Export Sheet'}
                </button>

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
                            <td> {format(data.createdAt, "HH:mm:ss - dd/MM/yyyy")}</td>
                            <td>
                              {data.trip_status === 'ended' ? format(data.endedAt, "HH:mm:ss - dd/MM/yyyy") : '---'}
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
