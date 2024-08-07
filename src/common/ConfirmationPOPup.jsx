import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteUser } from "../API Calls/API";
import { toast } from "react-toastify";
import { toastOption } from "./ToastOptions";

export const DeleteConfirm = ({ ...p }) => {
  const client = useQueryClient();

  const deleteDriver = useMutation({
    mutationKey: ["delete user"],
    mutationFn: deleteUser,
    onSuccess: (res) => {
      toast.success("Delete User Successfully.");
      console.log(res);
      client.invalidateQueries("driver list");
    },
    onError: (error) =>
      toast.error(
        error.response.data.message || "Something went Wrong",
        toastOption
      ),
  });

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <p>Are you sure you want to delete this Driver?</p>
        <div className="popup-buttons">
          <button
            disabled={deleteDriver.isPending}
            style={{
              opacity: deleteDriver.isPending ? 0.5 : 1,
              cursor: deleteDriver.isPending ? "not-allowed" : "",
            }}
            className="popup-button confirm"
            onClick={() => deleteDriver.mutate(p.id)}
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
