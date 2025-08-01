import { useState } from "react";
import { useNavigate } from "react-router-dom";

import icon from "../assets/images/icon.png";
import search from "../assets/images/search.png";
import Prev from "../assets/images/left.png";
import Next from "../assets/images/right.png";
import nouser from "../assets/images/NoUser.png";
import apiClient from "../API Calls/APIClient";
import * as XLSX from 'xlsx';
import 'jspdf-autotable';
import { toast } from "react-toastify";
import { useGetUserList } from "../API Calls/API";
import { DeleteConfirm } from "../common/ConfirmationPOPup";
import Loader from "../common/Loader";

const ListOfCompanies = () => {
  const nav = useNavigate();
  const [page, setpage] = useState(1);
  const [filter, setfilter] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [confirmation, setconfirmation] = useState("");

  const companyList = useGetUserList("company list", "company", "", page, 10, filter)
  const fetchAllUsers = async () => {
    try {
      const response = await apiClient.get(`${import.meta.env.VITE_BASEURL}/users`, {
        params: {
          role: "company",
          page: 1,
          limit: 10000,
          filter,
          company_id: "",
        },
      });
      return response?.data?.users || [];
    } catch (error) {
      console.error("Error fetching all Company data for export:", error);
      toast.error("Failed to fetch Company data.");
      return [];
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    const allUsers = await fetchAllUsers();
    setIsExporting(false);

    if (!allUsers || allUsers.length === 0) {
      toast.warning("No Company data to export.");
      return;
    }

    const fileName = "Companies_List";

    // Prepare data for export
    const exportData = allUsers.map(user => ({
      "Company": user.company_name || '',
      "userName": `${user.first_name || ''} ${user.last_name || ''}`,
      "Contact Name": user.contact_name || '',
      "Contact No.": `${user.mobile_no_country_code || ''}${user.mobile_no || ''}`,
      "Contact Email": user.email || ''
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
              <h3>List of Companies</h3>
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
                <button className="btn btn-primary" onClick={handleExport}
                  disabled={isExporting}>
                  {isExporting ? 'Exporting...' : '+ Export Sheet'}
                </button>
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
                                  src={data.selfieImage || nouser}
                                />
                                {data.contact_name}
                              </div>
                            </td>
                            <td className={!data?.mobile_no ? "nodata" : ""}>
                              {`${data?.mobile_no_country_code ?? ''}${data?.mobile_no ?? ''}`}
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
