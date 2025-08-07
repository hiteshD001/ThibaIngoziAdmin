import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useGetArmedSosDetails } from "../../API Calls/API"; // Adjust the import path
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { Tooltip } from "react-tooltip";
import Modal from "react-modal";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import "react-tooltip/dist/react-tooltip.css";
import "../../css/ArmedSosDetails.css";

Modal.setAppElement("#root");

const ArmedSosDetails = () => {
  const { id } = useParams();
  const [sosData, setSosData] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    user: true,
    location: true,
    sos: true,
    payment: true,
  });
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const { data, isLoading, error, refetch } = useGetArmedSosDetails(id);

  useEffect(() => {
    if (data) {
      setSosData(data.data.armedSos);
    }
  }, [data]);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const openImageModal = (image) => {
    setSelectedImage(image);
    setModalIsOpen(true);
  };

  const closeImageModal = () => {
    setModalIsOpen(false);
    setSelectedImage(null);
  };

  const mapContainerStyle = {
    width: "100%",
    height: "300px",
    borderRadius: "10px",
  };

  if (isLoading) {
    return (
      <div className="container-fluid text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading SOS Details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid text-center py-5">
        <div className="alert alert-danger" role="alert">
          Error: {error.message}
        </div>
        <button className="btn btn-primary" onClick={() => refetch()}>
          Retry
        </button>
      </div>
    );
  }

  if (!sosData) {
    return <div className="container-fluid py-5 text-center">No data available</div>;
  }

  const { armedUserId, armedLocationId, armedSosstatus, armedpayment, createdAt } = sosData;

  const mapCenter = {
    lat: armedLocationId.armedLocationlatitude,
    lng: armedLocationId.armedLocationlongitude,
  };

  return (
    <div className="container-fluid py-4">
      <h1 className="text-center my-4">Armed SOS Details</h1>
      <div className="row justify-content-center">
        <div className="col-md-10">
          {/* User Information */}
          <div className="card mb-3">
            <div
              className="card-header d-flex justify-content-between align-items-center"
              onClick={() => toggleSection("user")}
              style={{ cursor: "pointer" }}
            >
              <h3 className="mb-0">User Information</h3>
              {expandedSections.user ? <FaChevronUp /> : <FaChevronDown />}
            </div>
            {expandedSections.user && (
              <div className="card-body">
                <div className="row align-items-center">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="fw-bold" data-tooltip-id="fullName" data-tooltip-content="User's full name">
                        Full Name
                      </label>
                      <p>{armedUserId.first_name} {armedUserId.last_name}</p>
                      <Tooltip id="fullName" />
                    </div>
                    <div className="form-group">
                      <label className="fw-bold" data-tooltip-id="email" data-tooltip-content="User's email address">
                        Email
                      </label>
                      <p>{armedUserId.email}</p>
                      <Tooltip id="email" />
                    </div>
                    <div className="form-group">
                      <label className="fw-bold" data-tooltip-id="mobile" data-tooltip-content="User's contact number">
                        Mobile Number
                      </label>
                      <p>{armedUserId.mobile_no_country_code} {armedUserId.mobile_no}</p>
                      <Tooltip id="mobile" />
                    </div>
                    <div className="form-group">
                      <label className="fw-bold" data-tooltip-id="company" data-tooltip-content="User's company name">
                        Company
                      </label>
                      <p>{armedUserId.company_name}</p>
                      <Tooltip id="company" />
                    </div>
                  </div>
                  <div className="col-md-6 d-flex justify-content-center align-items-center">
                    {armedUserId.selfieImage ? (
                      <div className="image-container">
                        <label className="fw-bold text-center d-block">Selfie Image</label>
                        <img
                          src={armedUserId.selfieImage}
                          alt="Selfie"
                          className="img-fluid rounded clickable-image shadow-sm"
                          onClick={() => openImageModal(armedUserId.selfieImage)}
                        />
                        <div className="image-overlay">
                          <span>Click to Zoom</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted">No Selfie Image Available</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Location Information with Google Maps */}
          <div className="card mb-3">
            <div
              className="card-header d-flex justify-content-between align-items-center"
              onClick={() => toggleSection("location")}
              style={{ cursor: "pointer" }}
            >
              <h3 className="mb-0">Location Details</h3>
              {expandedSections.location ? <FaChevronUp /> : <FaChevronDown />}
            </div>
            {expandedSections.location && (
              <div className="card-body">
                <div className="row align-items-start">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="fw-bold" data-tooltip-id="address" data-tooltip-content="Full address of the location">
                        Address
                      </label>
                      <p>{armedLocationId.address}</p>
                      <Tooltip id="address" />
                    </div>
                    <div className="form-group">
                      <label className="fw-bold" data-tooltip-id="houseNumber" data-tooltip-content="House or building number">
                        House Number
                      </label>
                      <p>{armedLocationId.houseNumber}</p>
                      <Tooltip id="houseNumber" />
                    </div>
                    <div className="form-group">
                      <label className="fw-bold" data-tooltip-id="coordinates" data-tooltip-content="Latitude and Longitude">
                        Coordinates
                      </label>
                      <p>Lat: {armedLocationId.armedLocationlatitude}, Long: {armedLocationId.armedLocationlongitude}</p>
                      <Tooltip id="coordinates" />
                    </div>
                    <div className="form-group">
                      <label className="fw-bold" data-tooltip-id="radius" data-tooltip-content="Response radius in meters">
                        Response Radius
                      </label>
                      <p>{armedLocationId.armedRadius} meters</p>
                      <Tooltip id="radius" />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="fw-bold">Location Map</label>
                      <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
                        <GoogleMap
                          mapContainerStyle={mapContainerStyle}
                          center={mapCenter}
                          zoom={15}
                        >
                          <Marker position={mapCenter} />
                        </GoogleMap>
                      </LoadScript>
                    </div>
                    {armedLocationId.buildingImage ? (
                      <div className="form-group mt-4 image-container">
                        <label className="fw-bold text-center d-block">Building Image</label>
                        <img
                          src={armedLocationId.buildingImage}
                          alt="Building"
                          className="img-fluid rounded clickable-image shadow-sm"
                          onClick={() => openImageModal(armedLocationId.buildingImage)}
                        />
                        <div className="image-overlay">
                          <span>Click to Zoom</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted text-center mt-4">No Building Image Available</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SOS Details */}
          <div className="card mb-3">
            <div
              className="card-header d-flex justify-content-between align-items-center"
              onClick={() => toggleSection("sos")}
              style={{ cursor: "pointer" }}
            >
              <h3 className="mb-0">SOS Details</h3>
              {expandedSections.sos ? <FaChevronUp /> : <FaChevronDown />}
            </div>
            {expandedSections.sos && (
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="fw-bold" data-tooltip-id="status" data-tooltip-content="Current status of the SOS">
                        Status
                      </label>
                      <p className={armedSosstatus === "help_received" ? "text-success fw-bold" : "text-warning fw-bold"}>
                        {armedSosstatus.replace("_", " ").toUpperCase()}
                      </p>
                      <Tooltip id="status" />
                    </div>
                    <div className="form-group">
                      <label className="fw-bold" data-tooltip-id="locationType" data-tooltip-content="Type of location">
                        Location Type
                      </label>
                      <p>{sosData.armedLocationtype.replace("_", " ")}</p>
                      <Tooltip id="locationType" />
                    </div>
                    <div className="form-group">
                      <label className="fw-bold" data-tooltip-id="createdAt" data-tooltip-content="Date and time of SOS creation">
                        Created At
                      </label>
                      <p>{new Date(createdAt).toLocaleString()}</p>
                      <Tooltip id="createdAt" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Payment Information */}
          {armedpayment && (
            <div className="card mb-3">
              <div
                className="card-header d-flex justify-content-between align-items-center"
                onClick={() => toggleSection("payment")}
                style={{ cursor: "pointer" }}
              >
                <h3 className="mb-0">Payment Information</h3>
                {expandedSections.payment ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              {expandedSections.payment && (
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="fw-bold" data-tooltip-id="amount" data-tooltip-content="Payment amount in Rand">
                          Amount
                        </label>
                        <p>R {armedpayment.amount}</p>
                        <Tooltip id="amount" />
                      </div>
                      <div className="form-group">
                        <label className="fw-bold" data-tooltip-id="paymentStatus" data-tooltip-content="Payment status">
                          Status
                        </label>
                        <p className={armedpayment.status === "payment-suceed" ? "text-success fw-bold" : "text-danger fw-bold"}>
                          {armedpayment.status.replace("-", " ").toUpperCase()}
                        </p>
                        <Tooltip id="paymentStatus" />
                      </div>
                      <div className="form-group">
                        <label className="fw-bold" data-tooltip-id="method" data-tooltip-content="Method of payment">
                          Payment Method
                        </label>
                        <p>{armedpayment.paymentMethod}</p>
                        <Tooltip id="method" />
                      </div>
                      <div className="form-group">
                        <label className="fw-bold" data-tooltip-id="ref" data-tooltip-content="Payment reference number">
                          Reference
                        </label>
                        <p>{armedpayment.paymentRef}</p>
                        <Tooltip id="ref" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Image Zoom Modal */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeImageModal}
        style={{
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            padding: 0,
            border: "none",
            background: "transparent",
          },
          overlay: { backgroundColor: "rgba(0, 0, 0, 0.75)" },
        }}
      >
        <img src={selectedImage} alt="Zoomed" style={{ maxWidth: "90vw", maxHeight: "90vh" }} />
        <button className="btn btn-danger position-absolute top-0 end-0 m-2" onClick={closeImageModal}>
          Close
        </button>
      </Modal>
    </div>
  );
};

export default ArmedSosDetails;