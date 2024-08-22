import { useNavigate, useParams } from "react-router-dom";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getUser, userList } from "../API Calls/API";
import Prev from "../assets/images/left.png";
import Next from "../assets/images/right.png";

import nouser from "../assets/images/NoUser.png";
import search from "../assets/images/search.png";
import icon from "../assets/images/icon.png";
import { useState } from "react";
import Loader from "../common/Loader";
import { DeleteConfirm } from "../common/ConfirmationPOPup";

const ListOfDrivers = () => {

  const nav = useNavigate();
  const params = useParams();
  const [page, setpage] = useState(1);
  const [filter, setfilter] = useState("");
  const [confirmation, setconfirmation] = useState("");

  const companyInfo = useQuery({
    queryKey: ["userinfo", params.id],
    queryFn: getUser,
    staleTime: Infinity,
    enabled: params.id ? true : false,
  });

  const driverList = useQuery({
    queryKey: ["driver list", "driver", params.id, page, 5, filter],
    queryFn: userList,
    staleTime: 15 * 60 * 1000,
    placeholderData: keepPreviousData,
  });

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-12">
          {params.id && (
            <div className="company-info">
              <div className="comapny-titles">Company Information</div>
              <div className="comapny-det">
                <div className="c-info">
                  <span>Company</span>
                  <p>{companyInfo.data?.data.user.company_name}</p>
                </div>
                <div className="c-info">
                  <span>Contact No.</span>
                  <p>{companyInfo.data?.data.user.mobile_no}</p>
                </div>
                <div className="c-info">
                  <span>Contact Email</span>
                  <p>{companyInfo.data?.data.user.email}</p>
                </div>
              </div>
            </div>
          )}
          <div className="theme-table">
            <div className="tab-heading">
              <h3>Total Drivers</h3>
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
                <button
                  onClick={() => nav("/home/total-drivers/add-driver")}
                  className="btn btn-primary"
                >
                  + Add Driver
                </button>
              </div>
            </div>
            {driverList.isFetching ? (
              <Loader />
            ) : (
              <>
                {driverList.data.data.users ? (
                  <>
                    <table
                      id="example"
                      className="table table-striped nowrap"
                      style={{ width: "100%" }}
                    >
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
                        {driverList.data?.data?.users?.map((driver) => (
                          <tr key={driver._id}>
                            <td>
                              <div
                                className={
                                  !driver.username ? "prof nodata" : "prof"
                                }
                              >
                                <img
                                  className="profilepicture"
                                  src={
                                    driver.profileImage
                                      ? driver.profileImage
                                      : nouser
                                  }
                                />
                                {driver.username}
                              </div>
                            </td>
                            <td className={!driver.id_no ? "nodata" : ""}>
                              {driver.id_no}
                            </td>
                            <td className={!driver?.mobile_no ? "nodata" : ""}>
                              {driver?.mobile_no}
                            </td>
                            <td className={!driver.email ? "nodata" : ""}>
                              {driver.email}
                            </td>
                            <td>
                              <span
                                onClick={() => setconfirmation(driver._id)}
                                className="tbl-gray"
                              >
                                Delete
                              </span>
                              {confirmation === driver._id && (
                                <DeleteConfirm
                                  id={driver._id}
                                  setconfirmation={setconfirmation}
                                />
                              )}
                              <span
                                onClick={() =>
                                  nav(
                                    `/home/total-drivers/vehicle-information/${driver._id}`
                                  )
                                }
                                className="tbl-btn"
                              >
                                view
                              </span>
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
                          disabled={page === driverList.data?.data.totalPages}
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

export default ListOfDrivers;
