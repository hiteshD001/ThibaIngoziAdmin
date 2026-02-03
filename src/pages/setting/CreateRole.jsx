import { useFormik } from "formik";
import { Grid, Box, Typography, } from "@mui/material";
import { toast } from "react-toastify";
import { useGetPermissions, useCreateRole, useTogglePermission, useGetPermissionsByRoleId, useUpdateRole, useGetPermission } from "../../API Calls/API"; 
// import { BootstrapInput, CustomSwitch } from "../../common/custom"; 
import CustomSwitch from "../../common/Custom/CustomSwitch"
import AddUser from "./AddUser"
import CustomInput from "../../common/Custom/CustomInput";
import { useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react";

// assets
import Dashboard from '../../assets/images/Dashboard.svg'
import Driver from "../../assets/images/Driver.svg";
import users from '../../assets/images/users.svg'
import MeetingLink from '../../assets/images/MeetingLink.svg'
import Report from '../../assets/images/Report.svg'
import Trip from '../../assets/images/Trip.svg'
import Crime from '../../assets/images/crime.svg'
import ArmedSos from '../../assets/images/ArmedSos.svg'
import SapsWanted from '../../assets/images/SapsWanted.svg'
import salesagent from '../../assets/images/salesagent.svg'
import settings from "../../assets/images/settings.png";
import Flagged from '../../assets/images/Flagged.svg'
import StolenCarIcon from '../../assets/images/StolenCarIcon.svg'
import MissingPersonIcon from '../../assets/images/MissingPersonIcon.svg'
import SuspectIcon from '../../assets/images/SuspectIcon.svg'
import changePasswordIcon from '../../assets/images/changePasswordIcon.svg'
import Company from "../../assets/images/Company.svg";


export const iconMap = {
  home: Dashboard,

  "total-companies": Company,
  "total-drivers": Driver,
  "total-linked-trips": Trip,
  "total-meeting-links": MeetingLink,
  "total-users": users,
  "total-sos-amount": ArmedSos,

  settings: settings,
  "total-sales-agent": salesagent,
  "total-saps-wanted": SapsWanted,

  reports: Report,

  "total-missing-person": MissingPersonIcon,
  "total-stolen-cars": StolenCarIcon,
  "crime-reports": Crime,
  "total-suspect": SuspectIcon,
  "flagged-report": Flagged,

  "change-password": changePasswordIcon,
};
const CreateRole = ({ editRoleId, setEditRoleId }) => {
    const client = useQueryClient()

    const onSuccessRole = () => {
        client.invalidateQueries('roles')
        client.invalidateQueries('sideData')
        if (editRoleId) {
            toast.success("Role Updated Successfully.");
            roleform.resetForm({
    values: {
      roleName: "",
      permissionIds: activePermissionIds
    }
  });
            setEditRoleId(null); // Exit edit mode
        } else {
            toast.success("Role Created Successfully.");
        }
        roleform.resetForm();
    };

    const onErrorRole = (error) => {
        toast.error(error?.response?.data?.message || "Something went wrong");
    };

    const onSuccessToggle = () => {
        client.invalidateQueries('Permissions')
        toast.success("Permission status updated successfully.");
    };

    const onErrorToggle = (error) => {
        toast.error(error?.response?.data?.message || "Failed to toggle permission");
    };

    const { data: permissions } = useGetPermissions();
    const {data : permission} = useGetPermission()
    
    // Filter only active permissions
    const activePermissionIds = permission?.data?.data?.filter(perm => perm.status === 'active').map(perm => perm._id) || [];
    
    
    const { data: roleData } = useGetPermissionsByRoleId(editRoleId);
    const { mutate: createRole } = useCreateRole(onSuccessRole, onErrorRole);
    const { mutate: updateRole } = useUpdateRole(onSuccessRole, onErrorRole);
    const { mutate: togglePermission } = useTogglePermission(onSuccessToggle, onErrorToggle);

    // Populate form when editing
    useEffect(() => {
        if (editRoleId && roleData?.data?.data) {
            const role = roleData.data.data;
            roleform.setValues({
                roleName: role.name,
                permissionIds: role.permissions.map(p => p._id)
            });
        } else if (!editRoleId) {
            // Reset form for create mode
            roleform.resetForm();
        }
    }, [editRoleId, roleData]);

    useEffect(() => {
  roleform.setFieldValue("permissionIds", activePermissionIds);
}, [permission?.data?.data]);


    const roleform = useFormik({
        initialValues: {
            roleName: "",
            permissionIds: [],
        },
        onSubmit: (values) => {
            if (editRoleId) {
                
                updateRole({ id: editRoleId, data: { permissionIds: values.permissionIds } });
            } else {
               
                createRole({ roleName: values.roleName,  permissionIds: values.permissionIds });
            }
        },
    });

    const handlePermissionToggle = (permId) => {
        const current = roleform.values.permissionIds;
        if (current.includes(permId)) {
            // Remove from list
            roleform.setFieldValue(
                "permissionIds",
                current.filter((id) => id !== permId)
            );
        } else {
            // Add to list
            roleform.setFieldValue("permissionIds", [...current, permId]);
        }
    };

   const handlePermissionStatusToggle = (perm) => {
  const newStatus = perm.status === "active" ? "inactive" : "active";

  togglePermission(
    { permissionId: perm._id, status: newStatus },
    {
      onSuccess: () => {
        // If permission turned inactive → remove from role
        if (newStatus === "inactive") {
          roleform.setFieldValue(
            "permissionIds",
            roleform.values.permissionIds.filter(id => id !== perm._id)
          );
        }
      }
    }
  );
};

const handleCancel = () => {
  setEditRoleId(null);

  roleform.resetForm({
    values: {
      roleName: "",
      permissionIds: activePermissionIds
    }
  });
};




    return (
        <Grid
            size={{ xs: 12 }}
            sx={{
                backgroundColor: "rgb(253, 253, 253)",
                p: 3,
                borderRadius: "10px",
                boxShadow: "-3px 4px 23px rgba(0, 0, 0, 0.1)",
                mb: 3,
            }}
            className="main-content" 
        >
            <Box
                sx={{
                    display: "flex",
                    justifyContent: { xs: "center", sm: "space-between" },
                    flexDirection: { xs: "column", sm: "row" },
                    mb: 2,
                }}
                
            >
                <Typography variant="h6" fontWeight={550} mb={1}>
                    {editRoleId ? "Edit Role" : "Create New Role"}
                </Typography>
                <AddUser />
            </Box>

            {/* Role Name Input */}
            <Box sx={{ mb: 2 }}>
                <CustomInput
                    label="Role Name"
                    placeholder="Enter Role Name"
                    name="roleName"
                    formik={roleform}
                    mb={2}
                    disabled={!!editRoleId} // Disable role name editing
                />
            </Box>

            {/* Permissions */}
            <Box sx={{ mb: 2 }}>
                <Typography variant="body1" fontWeight={450} mb={2}>
                    Assign Permissions
                </Typography>

                <Grid
                    container
                    sx={{
                        border: "1px solid #E5E7EB",
                        backgroundColor: "#F9FAFB",
                        borderRadius: "6px",
                        p: 3,
                    }}
                    spacing={2}
                >
                    {permissions?.data?.data?.length > 0 ? (
                        permissions.data.data.map((perm) => {
                            const iconSrc = iconMap[perm.key] ||  Dashboard;
                            const isChecked = roleform.values.permissionIds.includes(perm._id);

                            return (
                                <Grid
                                    key={perm._id}
                                    size={{ xs: 12, md: 6 }}
                                    sx={{
                                        p: 1,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        backgroundColor: "white",
                                        borderRadius: "10px",
                                        border: "1px solid #E5E7EB",
                                    }}
                                >
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <img
                                            src={iconSrc}
                                            alt={perm.name}
                                            style={{ width: 25, height: 25 }}
                                        />
                                        <Typography
                                            variant="subtitle1"
                                            sx={{ color: "#384141", fontWeight: 500 }}
                                        >
                                            {perm.name}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        {/* Single Switch for role assignment (permission must be active to assign) */}
                                        {editRoleId ?
                                            <CustomSwitch
                                                checked={isChecked}
                                                disabled={perm.status !== "active"}
                                                onChange={() => {
                                                    // Only toggle role assignment if permission is active
                                                    if (perm.status === "active") {
                                                        handlePermissionToggle(perm._id);
                                                    }
                                                }}
                                                size="small"
                                            /> :
                                            <CustomSwitch
                                                checked={roleform.values.permissionIds.includes(perm._id)}
                                                disabled={perm.status !== "active"}
                                                onChange={() => handlePermissionStatusToggle(perm)}
                                                size="small"
                                            />}
                                    </Box>
                                </Grid>
                            );
                        })
                    ) : (
                        <Typography
                            variant="body2"
                            align="center"
                            sx={{ width: "100%", color: "text.secondary", py: 2 }}
                        >
                            No permissions available
                        </Typography>
                    )}
                </Grid>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3, gap: 2 }}>
                {editRoleId && (
                    <Box sx={{ display: "flex", gap: 1 }}>
                        <button
                            type="button"
                            onClick={handleCancel}
                            style={{
                                border: "1px solid #6b7280",
                                backgroundColor: "transparent",
                                color: "#6b7280",
                                padding: "8px 16px",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "14px",
                            }}
                        >
                            Cancel
                        </button>
                    </Box>
                )}
                <button
                    type="submit"
                    onClick={roleform.handleSubmit}
                    style={{
                        border: "1px solid var(--Blue)",
                        backgroundColor:  "var(--Blue)",
                        color: "white",
                        padding: "10px 20px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "500",
                    }}
                >
                    {editRoleId ? "Update Role" : "Create Role"}
                </button>
            </Box>
        </Grid>
    );
};

export default CreateRole;
