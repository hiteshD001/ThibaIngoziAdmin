import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useGetUser, useGetUserList, useUpdateUser } from "../API Calls/API";
import { useQueryClient } from "@tanstack/react-query"
import Prev from "../assets/images/left.png";
import Next from "../assets/images/right.png";
import nouser from "../assets/images/NoUser.png";
import search from "../assets/images/search.png";
import icon from "../assets/images/icon.png";
import apiClient from "../API Calls/APIClient";
import * as XLSX from 'xlsx';
import 'jspdf-autotable';
import { toast } from "react-toastify";
import Loader from "../common/Loader";
import { DeleteConfirm } from "../common/ConfirmationPOPup";
import ImportSheet from "../common/ImportSheet";

const ListOfUsers = () => {
    const [popup, setpopup] = useState(false)
    const nav = useNavigate();
    const [role] = useState(localStorage.getItem("role"));
    const params = useParams();
    const [page, setpage] = useState(1);
    const [filter, setfilter] = useState("");
    const [isExporting, setIsExporting] = useState(false);
    const [confirmation, setconfirmation] = useState("");
    let companyId = localStorage.getItem('userID')
    const paramId = role === "company" ? companyId : params.id;

    const notification_type = "677534649c3a99e13dcd7456"
    const UserList = useGetUserList("user list", "passanger", paramId, page, 10, filter)

    const fetchAllUsers = async () => {
        try {
            const response = await apiClient.get(`${import.meta.env.VITE_BASEURL}/users`, {
                params: {
                    role: "passanger",
                    page: 1,
                    limit: 10000,
                    filter,
                    company_id: paramId,
                },
            });
            return response?.data?.users || [];
        } catch (error) {
            console.error("Error fetching all User data for export:", error);
            toast.error("Failed to fetch User data.");
            return [];
        }
    };

    const handleExport = async () => {
        setIsExporting(true);
        const allUsers = await fetchAllUsers();
        setIsExporting(false);

        if (!allUsers || allUsers.length === 0) {
            toast.warning("No User data to export.");
            return;
        }

        const fileName = "Users_List";

        // Prepare data for export
        const exportData = allUsers.map(user => ({
            "userName": `${user.first_name || ''} ${user.last_name || ''}`,
            "Company": user.company_name || '',
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
                            <div className="count">
                                <h3>{role === 'sales_agent' ? 'Total Sales' : 'Total Users'}</h3>
                                <p>{UserList.isSuccess && UserList.data?.data.totalUsers || 0}</p>
                            </div>
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
                                    onClick={() => nav("/home/total-users/add-user")}
                                    className="btn btn-primary"
                                >
                                    + Add User
                                </button>
                                <button className="btn btn-primary" onClick={handleExport}
                                    disabled={isExporting}>
                                    {isExporting ? 'Exporting...' : '+ Export Sheet'}
                                </button>
                                <button className="btn btn-primary" onClick={() => setpopup(true)}>
                                    + Import Sheet
                                </button>
                            </div>
                        </div>
                        {UserList.isFetching ? (
                            <Loader />
                        ) : (
                            <>
                                {UserList.data?.data.users ? (
                                    <>
                                        <table
                                            id="example"
                                            className="table table-striped nowrap"
                                            style={{ width: "100%" }}
                                        >
                                            <thead>
                                                <tr>

                                                    <th>User</th>
                                                    <th>Company</th>
                                                    {/* <th>Email</th> */}
                                                    <th>Contact No.</th>
                                                    <th>Contact Email</th>
                                                    <th>&nbsp;</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {UserList?.data && UserList.data?.data?.users?.map((user) => (
                                                    <tr key={user._id}>

                                                        <td>
                                                            <div
                                                                className={
                                                                    (!user.first_name && !user.last_name) ? "prof nodata" : "prof"
                                                                }
                                                            >
                                                                <img
                                                                    className="profilepicture"
                                                                    src={
                                                                        user.selfieImage
                                                                            ? user.selfieImage
                                                                            : nouser
                                                                    }
                                                                />
                                                                {user.first_name} {user.last_name}
                                                            </div>
                                                        </td>
                                                        <td className={!user.company_name ? "companynamenodata" : ""}>
                                                            {user.company_name}
                                                        </td>
                                                        <td className={!user?.mobile_no ? "nodata" : ""}>
                                                            {`${user?.mobile_no_country_code ?? ''}${user?.mobile_no ?? ''}`}
                                                        </td>
                                                        <td className={!user.email ? "nodata" : ""}>
                                                            {user.email}
                                                        </td>
                                                        <td>
                                                            <span
                                                                onClick={() => setconfirmation(user._id)}
                                                                className="tbl-gray"
                                                            >
                                                                Delete
                                                            </span>
                                                            {confirmation === user._id && (
                                                                <DeleteConfirm
                                                                    id={user._id}
                                                                    setconfirmation={setconfirmation}
                                                                />
                                                            )}
                                                            <span
                                                                onClick={() =>
                                                                    nav(
                                                                        `/home/total-users/user-information/${user._id}`
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
                                                    disabled={page === UserList.data?.data.totalPages}
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
            {popup && <ImportSheet setpopup={setpopup} type="user" />}
        </div>
    );
};

export default ListOfUsers;
