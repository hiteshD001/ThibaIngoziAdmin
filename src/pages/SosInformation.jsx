import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useGetArmedSosDetails } from "../API Calls/API"; // Adjust the import path\import { useGetUser, useGetUserList, useUpdateUser, useGetArmedSoS } from "../API Calls/API";




const ArmedSosDetails = () => {
    
    const { id } = useParams(); // Get the ID from URL params

    const [sosData, setSosData] = useState(null);

    // Use the custom hook to fetch data
    const { data, isLoading, error } = useGetArmedSosDetails(id);

    useEffect(() => {
        if (data) {
            setSosData(data.data.armedSos); // Assuming the API response matches your sample structure
        }
    }, [data]);

    if (isLoading) {
        return <div className="container-fluid">Loading...</div>;
    }

    if (error) {
        return <div className="container-fluid">Error: {error.message}</div>;
    }

    if (!sosData) {
        return <div className="container-fluid">No data available</div>;
    }

    const { armedUserId, armedLocationId, armedSosstatus, armedpayment, createdAt } = sosData;

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-md-12">
                    {/* User Information */}
                    <div className="theme-table">
                        <div className="tab-heading">
                            <h3>Armed SOS User Information</h3>
                        </div>
                        <div className="row p-3">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="fw-bold">Full Name</label>
                                    <p>{armedUserId.first_name} {armedUserId.last_name}</p>
                                </div>
                                <div className="form-group">
                                    <label className="fw-bold">Email</label>
                                    <p>{armedUserId.email}</p>
                                </div>
                                <div className="form-group">
                                    <label className="fw-bold">Mobile Number</label>
                                    <p>{armedUserId.mobile_no_country_code} {armedUserId.mobile_no}</p>
                                </div>
                                <div className="form-group">
                                    <label className="fw-bold">Company</label>
                                    <p>{armedUserId.company_name}</p>
                                </div>
                            </div>
                            <div className="col-md-6">
                                {armedUserId.selfieImage && (
                                    <div className="form-group">
                                        <label className="fw-bold">Selfie Image</label>
                                        <img src={armedUserId.selfieImage} alt="Selfie" className="img-fluid rounded" style={{ maxHeight: "200px" }} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Location Information */}
                    <div className="theme-table">
                        <div className="tab-heading">
                            <h3>Location Details</h3>
                        </div>
                        <div className="row p-3">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="fw-bold">Address</label>
                                    <p>{armedLocationId.address}</p>
                                </div>
                                <div className="form-group">
                                    <label className="fw-bold">House Number</label>
                                    <p>{armedLocationId.houseNumber}</p>
                                </div>
                                <div className="form-group">
                                    <label className="fw-bold">Coordinates</label>
                                    <p>Lat: {armedLocationId.armedLocationlatitude}, Long: {armedLocationId.armedLocationlongitude}</p>
                                </div>
                                <div className="form-group">
                                    <label className="fw-bold">Response Radius</label>
                                    <p>{armedLocationId.armedRadius} meters</p>
                                </div>
                            </div>
                            <div className="col-md-6">
                                {armedLocationId.buildingImage && (
                                    <div className="form-group">
                                        <label className="fw-bold">Building Image</label>
                                        <img src={armedLocationId.buildingImage} alt="Building" className="img-fluid rounded" style={{ maxHeight: "200px" }} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* SOS Details */}
                    <div className="theme-table">
                        <div className="tab-heading">
                            <h3>SOS Details</h3>
                        </div>
                        <div className="row p-3">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="fw-bold">Status</label>
                                    <p className={armedSosstatus === "help_received" ? "text-success" : "text-warning"}>
                                        {armedSosstatus.replace("_", " ").toUpperCase()}
                                    </p>
                                </div>
                                <div className="form-group">
                                    <label className="fw-bold">Location Type</label>
                                    <p>{sosData.armedLocationtype.replace("_", " ")}</p>
                                </div>
                                <div className="form-group">
                                    <label className="fw-bold">Created At</label>
                                    <p>{new Date(createdAt).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Information */}
                    {armedpayment && (
                        <div className="theme-table">
                            <div className="tab-heading">
                                <h3>Payment Information</h3>
                            </div>
                            <div className="row p-3">
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="fw-bold">Amount</label>
                                        <p>R {armedpayment.amount}</p>
                                    </div>
                                    <div className="form-group">
                                        <label className="fw-bold">Status</label>
                                        <p className={armedpayment.status === "payment-suceed" ? "text-success" : "text-danger"}>
                                            {armedpayment.status.replace("-", " ").toUpperCase()}
                                        </p>
                                    </div>
                                    <div className="form-group">
                                        <label className="fw-bold">Payment Method</label>
                                        <p>{armedpayment.paymentMethod}</p>
                                    </div>
                                    <div className="form-group">
                                        <label className="fw-bold">Reference</label>
                                        <p>{armedpayment.paymentRef}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ArmedSosDetails;