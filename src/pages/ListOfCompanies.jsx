import { useNavigate } from "react-router-dom";
import icon from "../assets/images/icon.png";
import search from "../assets/images/search.png";
import { userList } from "../API Calls/API";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import Prev from "../assets/images/left.png";
import Next from "../assets/images/right.png";

import nouser from "../assets/images/NoUser.png";
import { useState } from "react";
import Loader from "../common/Loader";
import { DeleteConfirm } from "../common/ConfirmationPOPup";
// import { debounce } from "lodash"

const ListOfCompanies = () => {
  const nav = useNavigate();
  const [page, setpage] = useState(1);
  const [filter, setfilter] = useState("");
  const [confirmation, setconfirmation] = useState("");

  const companyList = useQuery({
    queryKey: ["company list", "company", "", page, 5, filter],
    queryFn: userList,
    staleTime: 15 * 60 * 1000,
    placeholderData: keepPreviousData,
  });

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-12">
          <div className="theme-table">
            <div className="tab-heading">
              <h3>List of Companies ({companyList.isSuccess && companyList.data?.data.totalUsers || 0})</h3>
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
                  className="btn btn-primary"
                  onClick={() => nav("add-company")}
                >
                  + Add Company
                </button>
              </div>
            </div>
            {!companyList.data ? (
              <Loader />
            ) : (
              <>
                {companyList.data?.data.users ? (
                  <>
                    <table
                      id="example"
                      className="table table-striped nowrap"
                      style={{ width: "100%" }}
                    >
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
                        {companyList.data?.data.users.map((data) => (
                          <tr key={data._id}>
                            <td>{data.company_name}</td>
                            <td>
                              <div
                                className={
                                  !data.contact_name ? "prof nodata" : "prof"
                                }
                              >
                                <img
                                  className="profilepicture"
                                  src={data.profileImage || nouser}
                                />
                                {data.contact_name}
                              </div>
                            </td>
                            <td className={!data?.mobile_no ? "nodata" : ""}>
                              {data?.mobile_no}
                            </td>
                            <td className={!data.email ? "nodata" : ""}>
                              {data.email}
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
                                />
                              )}
                              <span
                                onClick={() =>
                                  nav(`/home/total-drivers/${data._id}`)
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
                          disabled={page === companyList.data?.data.totalPages}
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

export default ListOfCompanies;
