import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";
import { useDeleteUser, useDeleteUserTrip, useDeleteUserMeetingTripTrip, useDeleteSosAmount, useDeleteMissingPerson, useDeleteMissingVehicale, useDeleteSalesAgent } from "../API Calls/API";
import { toast } from "react-toastify";
import { toastOption } from "./ToastOptions";
import { useState } from "react";
import DeleteIcon from '../assets/images/DeleteIcon.svg'
import Logout2 from '../assets/images/logout2.svg'

export const DeleteConfirm = ({ id, trip, setconfirmation }) => {
  const client = useQueryClient();

  const onSuccess = () => {
    toast.success("Delete User Successfully.");
    client.invalidateQueries("driver list");
    setconfirmation("");
  }
  const onError = (error) => {
    toast.error(error.response.data.message || "Something went Wrong", toastOption)
    setconfirmation("");
  }

  const onSuccessTrip = () => {
    toast.success("Trip Delete Successfully")
    client.invalidateQueries("Trip list");
    setconfirmation("");
  }

  const onSuccessMeetingTrip = () => {
    toast.success("Meeting Link Trip Delete Successfully")
    client.invalidateQueries("Meeting Link Trip list");
    setconfirmation("");
  }

  const onSuccessMissingPerson = () => {
    toast.success("Missing person deleted successfully");
    client.invalidateQueries("driver list");
    setconfirmation("");
  }

  const onSuccessMissingVehicle = () => {
    toast.success("Missing vehicle deleted successfully");
    client.invalidateQueries("driver list");
    setconfirmation("");
  }

  const deleteDriver = useDeleteUser(onSuccess, onError)
  const deleteTrip = useDeleteUserTrip(onSuccessTrip, onError)
  const deleteMeetingLinkTrip = useDeleteUserMeetingTripTrip(onSuccessMeetingTrip, onError)
  const deleteMissingPerson = useDeleteMissingPerson(onSuccessMissingPerson, onError)
  const deleteMissingVehicle = useDeleteMissingVehicale(onSuccessMissingVehicle, onError)

  const handleConfirm = () => {
    if (trip === "trip") {
      deleteTrip.mutate(id);
    } else if (trip === "meeting") {
      deleteMeetingLinkTrip.mutate(id);
    } else if (trip === "missingPerson") {
      deleteMissingPerson.mutate(id);
    } else if (trip === "missingVehicle") {
      deleteMissingVehicle.mutate(id);
    } 
    else {
      deleteDriver.mutate(id);
    }
  };

  const isPending = deleteDriver.isPending || deleteTrip.isPending || deleteMeetingLinkTrip.isPending;

  return (
    <Dialog open={true} onClose={() => setconfirmation("")} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', flexDirection: 'row', gap: 1.5 }}>
        <img src={DeleteIcon} alt="DeleteIcon" />
        Delete
      </DialogTitle>
      <DialogContent>
        <Typography>Are you sure you want to delete this ?</Typography>
      </DialogContent>
      <DialogActions>
        <Button sx={{ color: 'black', border: '1px solid rgb(175, 179, 189)' }} variant="outlined" onClick={() => setconfirmation("")}>
          No
        </Button>
        <Button
          variant="contained"
          color="error"
          disabled={isPending}
          onClick={handleConfirm}
          sx={{
            backgroundColor: '#EB5757',
            opacity: isPending ? 0.5 : 1,
            cursor: isPending ? "not-allowed" : "pointer"
          }}
        >
          Yes
        </Button>

      </DialogActions>
    </Dialog>
  );
};

export const DeleteSalesAgent = ({ id, setconfirmation }) => {
  const client = useQueryClient();

  const onSuccess = () => {
    toast.success("Delete Sos Amount Successfully.");
    client.invalidateQueries("ArmedSOSAmount List");
    setconfirmation("");
  }
  const onError = (error) => {
    toast.error(error.response.data.message || "Something went Wrong", toastOption)
  }


  const deleteagent = useDeleteSalesAgent(onSuccess, onError)

  return (
    <Dialog open={true} onClose={() => setconfirmation("")} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', flexDirection: 'row', gap: 1.5 }}>
        <img src={DeleteIcon} alt="DeleteIcon" />
        Delete
      </DialogTitle>
      <DialogContent>
        <Typography>Are you sure you want to delete this?</Typography>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={() => setconfirmation("")} sx={{ borderRadius: '8px', color: 'black', border: '1px solid rgb(175, 179, 189)' }}>
          No
        </Button>
        <Button
          variant="contained"
          color="error"
          disabled={deleteagent.isPending}
          onClick={() => deleteagent.mutate(id)}
          sx={{
            backgroundColor: '#EB5757',
            borderRadius: '8px',
            opacity: deleteagent.isPending ? 0.5 : 1,
            cursor: deleteagent.isPending ? "not-allowed" : "pointer"
          }}
        >
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const DeleteSosAmount = ({ id, setconfirmation }) => {
  const client = useQueryClient();

  const onSuccess = () => {
    toast.success("Delete Sos Amount Successfully.");
    client.invalidateQueries("ArmedSOSAmount List");
    setconfirmation("");
  }
  const onError = (error) => {
    toast.error(error.response.data.message || "Something went Wrong", toastOption)
  }


  const deleteSos = useDeleteSosAmount(onSuccess, onError)

  return (
    <Dialog open={true} onClose={() => setconfirmation("")} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', flexDirection: 'row', gap: 1.5 }}>
        <img src={DeleteIcon} alt="DeleteIcon" />
        Delete
      </DialogTitle>
      <DialogContent>
        <Typography>Are you sure you want to delete this?</Typography>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={() => setconfirmation("")} sx={{ borderRadius: '8px', color: 'black', border: '1px solid rgb(175, 179, 189)' }}>
          No
        </Button>
        <Button
          variant="contained"
          color="error"
          disabled={deleteSos.isPending}
          onClick={() => deleteSos.mutate(id)}
          sx={{
            backgroundColor: '#EB5757',
            borderRadius: '8px',
            opacity: deleteSos.isPending ? 0.5 : 1,
            cursor: deleteSos.isPending ? "not-allowed" : "pointer"
          }}
        >
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const LogoutConfirm = ({ handleLogout, setconfirm }) => {
  return (
    <Dialog PaperProps={{
      sx: {
        borderRadius: '20px',
        padding: '25px'
      }
    }} open={true} onClose={() => setconfirm(false)} maxWidth="xs">
      <DialogTitle sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 1.5 }}>
        <img src={Logout2} alt="logout" style={{ width: '55px', height: '100%' }} />
        Logout
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <Typography>Are you sure you want to log out?</Typography>
      </DialogContent>
      <DialogActions sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Button
          sx={{ backgroundColor: '#EB5757', width: '350px', height: '45px', borderRadius: '8px' }}
          variant="contained"
          // color="error"
          onClick={handleLogout}
        >
          Logout
        </Button>
        <Button sx={{ borderRadius: '8px', color: 'black', border: '1px solid rgb(175, 179, 189)', width: '350px', height: '45px' }} variant="outlined" onClick={() => setconfirm(false)}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const SOSStatusUpdate = ({ handleUpdate, handleCancel, open }) => {
  return (
    <Dialog
      open={true}
      onClose={handleCancel}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: { p: 1 }
      }}
    >
      <DialogTitle sx={{ fontWeight: 600 }}>Status</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to update the status?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={handleCancel} sx={{ borderRadius: '8px', color: 'black', border: '1px solid rgb(175, 179, 189)' }}
        >
          No
        </Button>
        <Button sx={{ backgroundColor: '#EB5757', borderRadius: '8px' }} variant="contained" color="primary" onClick={handleUpdate}>
          Yes
        </Button>

      </DialogActions>
    </Dialog>
  );
};

export const GoogleMapConfirm = ({ handleConfirm, message }) => {
  return (
    <Dialog
      open={true}
      onClose={() => { }}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: { p: 1 }
      }}
    >
      <DialogContent>
        <Typography>{message}</Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center' }}>
        <Button sx={{ backgroundColor: '#EB5757', width: '350px', height: '45px', borderRadius: '8px' }}
          variant="contained" onClick={handleConfirm}>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};
