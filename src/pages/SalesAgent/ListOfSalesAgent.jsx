import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CustomDateRangePicker from "../../common/Custom/CustomDateRangePicker";
import {
    useGetSalesAgent, useShareAgent, payoutUserUpdate,
    armedSosPayout,
    useDeleteSalesAgent,
    useBulkUploadSalesAgent
} from "../../API Calls/API";
import { useFormik } from "formik";
import PayoutPopup from "../../common/Popup";
import Prev from "../../assets/images/left.png";
import Next from "../../assets/images/right.png";
import nouser from "../../assets/images/NoUser.png";
import search from "../../assets/images/search.png";
import icon from "../../assets/images/icon.png";
import apiClient from "../../API Calls/APIClient";
import * as XLSX from 'xlsx';
import 'jspdf-autotable';
import { toast } from "react-toastify";
import Loader from "../../common/Loader";
import { startOfYear } from "date-fns";
import calender from '../../assets/images/calender.svg';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DeleteSalesAgent } from "../../common/ConfirmationPOPup";
import ImportSheet from "../../common/ImportSheet";

const ListOfSalesAgent = () => {
    const [popup, setpopup] = useState(false)
    const nav = useNavigate();
    const [role] = useState(localStorage.getItem("role"));
    const params = useParams();
    const [page, setpage] = useState(1);
    const [sharingId, setSharingId] = useState(null);
    const [filter, setfilter] = useState("");
    const [isExporting, setIsExporting] = useState(false);
    const [confirmation, setconfirmation] = useState("");
    const [selectedPayoutType, setSelectedPayoutType] = useState('');
    const [payPopup, setPopup] = useState('')
    const [range, setRange] = useState([
        {
            startDate: startOfYear(new Date()),
            endDate: new Date(),
            key: 'selection'
        }
    ]);
    const fileInputRef = useRef(null);

    const startDate = range[0].startDate.toISOString();
    const endDate = range[0].endDate.toISOString();
    let UserList = useGetSalesAgent(page, 10, filter, startDate, endDate)
    const agentList = UserList?.data?.data?.data?.influencersData
    const queryClient = useQueryClient();

    const { mutate: shareAgent } = useShareAgent(
        (data) => {
            toast.success('Shared successfully');
            console.log("✅ Shared successfully:", data);

            // 🔄 Refetch sales agent list after success
            queryClient.invalidateQueries(["salesAgent"]);
            setSharingId(null); // reset after success
        },
        (error) => {
            toast.error("Error Sharing");
            console.error("❌ Error sharing:", error);
            setSharingId(null); // reset on error too
        }
    );


    const { mutate: bulkUploadAgent } = useBulkUploadSalesAgent(
        (data) => {
            toast.success('Sales agents uploaded successfully');
            console.log("✅ Sales agents uploaded successfully:", data);

            queryClient.invalidateQueries(["salesAgent"]);
            // ❌ remove setImportFile(null);
        },
        (error) => {
            toast.error("Error uploading sales agents");
            console.error("❌ Error uploading sales agents:", error);
            // ❌ remove setImportFile(null);
        }
    );


    const fetchAllUsers = async () => {
        try {
            const response = await apiClient.get(`${import.meta.env.VITE_BASEURL}/influencer`, {
                params: {
                    page: 1,
                    limit: 10000,
                    filter,
                },
            });
            return response?.data?.data?.influencersData || [];
        } catch (error) {
            console.error("Error fetching all Sales agent for export:", error);
            toast.error("Failed to fetch Sales data.");
            return [];
        }
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const allUsers = await fetchAllUsers();
            console.log("allUsers", allUsers)
            setIsExporting(false);

            if (!allUsers || allUsers.length === 0) {
                toast.warning("No Sales Agent data to export.");
                return;
            }

            // ✅ Dynamic file name with timestamp
            const fileName = `Sales_Agent_List_${new Date().toISOString().slice(0, 10)}`;

            // ✅ Prepare data for export
            const exportData = allUsers.map((user, index) => ({
                "Sr. No.": index + 1,
                "User Name": `${user.first_name || ''} ${user.last_name || ''}`,
                "Contact No.": `${user.mobile_no_country_code || ''}${user.mobile_no || ''}`,
                "Email": user.email || '',
                "Enrollement Discount": user.enrollAmountDeduction || '',
                "Referral Code": user.referralCode || '',
                "Enrolment Discount Amount": user.enrolmentDiscountAmount || '',
                "Total Earned Amount": user.totalEarnedAmount || '',
                "Total Commission Earned(30%)": user.commissionEarned || '',
                "Total Paid": user.totalPaid || '',
                "Total Unpaid": user.totalUnPaid || '',
                "Total Users": user.user_id.length || '',
                "Performance Level": user.performanceLevel,
                "Tie": user.tie,
                "Account Holder Name": user.accountHolderName || '',
                "Account Number": user.accountNumber || '',
                "Account Type": user.accountType || '',
                "Bank Name": user?.bankId?.bank_name || '',
                "Branch Code": user?.bankId?.branch_code || '',
            }));

            // ✅ Create worksheet
            const worksheet = XLSX.utils.json_to_sheet(exportData);

            // ✅ Set dynamic column widths
            const columnWidths = Object.keys(exportData[0]).map((key) => ({
                wch: Math.max(
                    key.length,
                    ...exportData.map((row) => String(row[key] || '').length)
                ) + 2,
            }));
            worksheet['!cols'] = columnWidths;

            // ✅ Create workbook and add the worksheet
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "SalesAgents");

            // ✅ Export to Excel
            XLSX.writeFile(workbook, `${fileName}.xlsx`);
            toast.success("Export successful!");
        } catch (error) {
            setIsExporting(false);
            console.error("❌ Error exporting data:", error);
            toast.error("Failed to export data.");
        }
    };

    const PayoutForm = useFormik({
        initialValues: {
            firstName: '',
            surname: '',
            branchCode: '',
            amount: 0,
            accountNumber: '',
            customerCode: ''
        }
    })

    const parseXmlResponse = (xmlString) => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "text/xml");

        const result = xmlDoc.getElementsByTagName("Result")[0]?.textContent;
        const message = xmlDoc.getElementsByTagName("ResultMessage")[0]?.textContent;

        return { result, message };
    };

    const payoutMutation = armedSosPayout(
        (res) => {
            const { result, message } = parseXmlResponse(res.data);

            if (result === "Success") {
                payoutUpdateMutation.mutate({
                    user_id: vehicleInfo?.data?.data?.user._id,
                    type: selectedPayoutType,
                    amount: PayoutForm.values.amount,
                });
                toast.success('Payment successful');
                closePopup();
            } else {
                toast.error(message || 'Payment failed');
                console.error("Payment Error:", message);
            }
        },

        (err) => {
            toast.error('payment failed')
            console.error("Error!", err);
        }
    );

    const payoutUpdateMutation = payoutUserUpdate(
        (res) => {
            toast.success('payment successful');
        },
        (err) => {
            toast.error('payment failed')
        }
    );

    const handleChange = () => {
        payoutMutation.mutate(PayoutForm.values);
    };


    const handlePopup = (event, type, payoutType) => {
        event.stopPropagation();
        PayoutForm.setValues({
            firstName: agentList?.first_name || "",
            surname: agentList?.last_name || "",
            branchCode: agentList?.bankId?.branch_code || "",
            accountNumber: agentList?.accountNumber || "",
            customerCode: agentList?.customerCode || "",
            amount: agentList?.totalUnPaid || 0,
        });
        setPopup(type);
        setSelectedPayoutType(payoutType);
    };

    const closePopup = (event) => {
        // event.stopPropagation();
        setPopup('')
    }
    const renderPopup = () => {
        if (!payPopup) return null;

        switch (payPopup) {
            case "payout":
                return (
                    <PayoutPopup
                        yesAction={handleChange}
                        noAction={closePopup}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-md-12">
                    <div className="theme-table">
                        <div className="tab-heading">
                            <div className="count">
                                <h3>Total Sales Agent</h3>
                                <p>{UserList.isSuccess && UserList?.data?.data?.data?.totalCount || 0}</p>
                            </div>
                            <div className="tbl-filter">
                                <div className="input-group" style={{ width: '40%' }}>
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
                                {/* <CustomDateRangePicker
                                    value={range}
                                    onChange={setRange}
                                    icon={calender}
                                /> */}
                                <button
                                    onClick={() => nav("/home/total-sales-agent/add-agent")}
                                    className="btn btn-primary"
                                >
                                    + Add Agent
                                </button>
                                <button className="btn btn-primary" onClick={handleExport}
                                    disabled={isExporting}>
                                    {isExporting ? 'Exporting...' : '+ Export Sheet'}
                                </button>

                                <button
                                    className="btn btn-primary"
                                    onClick={() => setpopup(true)}

                                >
                                    + Import Sheet
                                </button>
                                {/* <input
                                    type="file"
                                    accept=".xlsx, .xls, .csv"
                                    ref={fileInputRef}
                                    style={{ display: "none" }}
                                    onChange={handleFileChange}
                                /> */}
                            </div>
                            {
                                popup && (
                                    <ImportSheet setpopup={setpopup} popup={popup} type="sales-agent" />
                                )
                            }
                        </div>
                        {UserList.isFetching ? (
                            <Loader />
                        ) : (
                            <>
                                {agentList ? (
                                    <>
                                        <div
                                            style={{
                                                width: "100%",
                                                overflowX: "auto",   // enables horizontal scroll
                                                overflowY: "hidden", // hides vertical scroll if not needed
                                            }}
                                        >
                                            <table
                                                id="example"
                                                className="table table-striped nowrap"
                                                style={{ width: "100%" }}
                                            >
                                                <thead>
                                                    <tr>

                                                        <th>User</th>
                                                        <th>Contact No.</th>
                                                        <th>Email</th>
                                                        <th>Enrolment Discount %</th>
                                                        <th>Total Earned Amount</th>
                                                        <th>Total Commission Earned(30%)</th>
                                                        <th>Unpaid Amount</th>
                                                        <th>Paid Amount</th>
                                                        <th>Total Users</th>
                                                        <th>Account Number</th>
                                                        <th>Bank Name</th>
                                                        <th>Branch Code</th>
                                                        <th>Share Status</th>
                                                        <th>Performance Level</th>
                                                        <th>Tie</th>
                                                        <th>&nbsp;</th>
                                                        <th>&nbsp;</th>
                                                        <th>&nbsp;</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {UserList?.data && agentList?.map((user) => (
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

                                                            <td className={!user?.mobile_no ? "nodata" : ""}>
                                                                {`${user?.mobile_no_country_code ?? ''}${user?.mobile_no ?? ''}`}
                                                            </td>
                                                            <td className={!user.email ? "nodata" : ""}>
                                                                {user.email}
                                                            </td>
                                                            <td className={!user.enrollAmountDeduction ? "nodata" : ""}>
                                                                {user.enrollAmountDeduction}
                                                            </td>

                                                            {/* <td className={!user.totalCommission ? "0" : ""}>
                                                                {user.totalCommission}
                                                            </td> */}
                                                            <td className={!user.totalEarnedAmount ? "0" : ""}>
                                                                {user.totalEarnedAmount}
                                                            </td>
                                                            <td className={!user.commissionEarned ? "0" : ""}>
                                                                {user.commissionEarned}
                                                            </td>
                                                            <td className={!user.totalUnPaid ? "0" : ""}>
                                                                {user.totalUnPaid}
                                                            </td>
                                                            <td className={!user.totalPaid ? "0" : ""}>
                                                                {user.totalPaid || 0}
                                                            </td>
                                                            <td className={!user.user_id ? "0" : ""}>
                                                                {user.user_id.length}
                                                            </td>
                                                            <td className={!user.accountNumber ? "nodata" : ""}>
                                                                {user.accountNumber}
                                                            </td>
                                                            <td className={!user.bankId ? "nodata" : ""}>
                                                                {user.bankId?.bank_name ? user.bankId.bank_name : ""}
                                                            </td>
                                                            <td className={!user.bankId ? "nodata" : ""}>
                                                                {user.bankId?.branch_code ? user.bankId.branch_code : ""}
                                                            </td>
                                                            <td className={!user.sharedStatus ? "nodata" : ""}>
                                                                {user.sharedStatus}
                                                            </td>

                                                            <td className={!user.performanceLevel ? "nodata" : ""}>
                                                                {user.performanceLevel ? user.performanceLevel : ""}
                                                            </td>
                                                            <td className={!user.tie ? "nodata" : ""}>
                                                                {user.tie}
                                                            </td>

                                                            {/* <td className={!user.enrollAmountDeduction ? "nodata" : ""}>
                                                            {user.enrollAmountDeduction}
                                                        </td> */}
                                                            <td >

                                                                <span
                                                                    onClick={() =>
                                                                        nav(
                                                                            `/home/total-sales-agent/agent-information/${user._id}`
                                                                        )
                                                                    }
                                                                    className="tbl-btn"
                                                                    style={{ marginRight: "10px" }}
                                                                >
                                                                    view
                                                                </span>
                                                                <span
                                                                    onClick={() => {
                                                                        setSharingId(user?._id);
                                                                        shareAgent({ id: user?._id, email: user?.email });
                                                                    }}
                                                                    className="tbl-gray ml-2 cursor-pointer"
                                                                    style={{ marginRight: "10px" }}
                                                                >
                                                                    {sharingId === user?._id ? "Sharing..." : "Share"}
                                                                </span>
                                                                <span
                                                                    onClick={(event) => handlePopup(event, 'payout', 'sales_agent')}
                                                                    className="tbl-gray ml-2 cursor-pointer"
                                                                >
                                                                    Pay
                                                                </span>
                                                                <span
                                                                    // onClick={() => deleteAgent(user._id)}
                                                                    onClick={() => setconfirmation(user._id)}
                                                                    className="tbl-gray"
                                                                >
                                                                    Delete
                                                                </span>
                                                                {confirmation === user._id && (
                                                                    <DeleteSalesAgent
                                                                        id={user._id}
                                                                        setconfirmation={setconfirmation}
                                                                    />
                                                                )}
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
                                                    disabled={page === UserList?.data?.data?.data?.totalPages}
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
            {payPopup && renderPopup()}
        </div>
    );
};

export default ListOfSalesAgent;
