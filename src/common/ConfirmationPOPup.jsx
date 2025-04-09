import { useQueryClient } from "@tanstack/react-query";
import { useDeleteUser, useDeleteUserTrip } from "../API Calls/API";
import { toast } from "react-toastify";
import { toastOption } from "./ToastOptions";
import { useState } from "react";

export const DeleteConfirm = ({ ...p }) => {
  const client = useQueryClient();

  const onSuccess = () => {
    toast.success("Delete User Successfully.");
    client.invalidateQueries("driver list");
  }
  const onError = (error) => {
    toast.error(error.response.data.message || "Something went Wrong", toastOption)
  }

  const onSuccessTrip = () => {
    toast.success("Trip Delete Successfully")
    client.invalidateQueries("Trip list");
  }

  const deleteDriver = useDeleteUser(onSuccess, onError)
  const deleteTrip = useDeleteUserTrip(onSuccessTrip, onError)

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <p>Are you sure you want to delete this?</p>
        <div className="popup-buttons">
          <button
            disabled={deleteDriver.isPending}
            style={{
              opacity: deleteDriver.isPending ? 0.5 : 1,
              cursor: deleteDriver.isPending ? "not-allowed" : "",
            }}
            className="popup-button confirm"
            onClick={() => p.trip ? deleteTrip.mutate(p.id) : deleteDriver.mutate(p.id)}
          >
            Confirm
          </button>
          <button
            className="popup-button"
            onClick={() => p.setconfirmation("")}
          >
            cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export const LogoutConfirm = ({ ...p }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <p>Are you sure you want to Log out?</p>
        <div className="popup-buttons">
          <button
            className="popup-button confirm"
            onClick={() => p.handleLogout()}
          >
            {" "}
            Confirm{" "}
          </button>
          <button className="popup-button" onClick={() => p.setconfirm(false)}>
            cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export const SOSStatusUpdate = ({ ...p }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <p>Are you sure want to make this changes. It can't be change once change.</p>
        <div className="popup-buttons">
          <button
            className="popup-button confirm"
            onClick={() => p.handleUpdate()}
          >
            {" "}
            Submit{" "}
          </button>
          <button className="popup-button" onClick={() => p.handleCancel()}>
            cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export const GoogleMapConfirm = ({ ...p }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <p>{p.message}</p>
        <div className="popup-buttons">
          <button
            className="popup-button confirm"
            onClick={() => p.handleConfirm()}
          >
            {" "}
            Confirm{" "}
          </button>
        </div>
      </div>
    </div>
  );
};