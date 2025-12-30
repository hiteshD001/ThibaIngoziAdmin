import { useFormik } from "formik";
import { Grid, Box, Typography, } from "@mui/material";
import { toast } from "react-toastify";
import { useGetPermissions, useCreateRole } from "../../API Calls/API"; 
// import { BootstrapInput, CustomSwitch } from "../../common/custom"; 
import CustomSwitch from "../../common/Custom/CustomSwitch"
import AddUser from "./AddUser"
import CustomInput from "../../common/Custom/CustomInput";
import { useQueryClient } from "@tanstack/react-query"

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
const CreateRole = () => {
    const client = useQueryClient()

    const onSuccessRole = () => {
        client.invalidateQueries('roles')
        toast.success("Role Created Successfully.");
        roleform.resetForm();
    };

    const onErrorRole = (error) => {
        toast.error(error?.response?.data?.message || "Something went wrong");
    };

    const { data: permissions } = useGetPermissions();
    const { mutate: createRole } = useCreateRole(onSuccessRole, onErrorRole);

    const roleform = useFormik({
        initialValues: {
            roleName: "",
            permissionIds: [],
        },
        onSubmit: (values) => {
            createRole(values);
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
                    Create New Role
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
                            const isChecked = roleform.values.permissionIds.includes(perm.id);

                            return (
                                <Grid
                                    key={perm.id}
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

                                    <CustomSwitch
                                        checked={isChecked}
                                        onChange={() => handlePermissionToggle(perm.id)}
                                    />
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

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
                <button
                    type="submit"
                    onClick={roleform.handleSubmit}
                    style={{
                        border: "1px solid var(--Blue)",
                        width: 180,
                        height: 48,
                        borderRadius: "8px",
                        backgroundColor: "var(--Blue)",
                        fontSize: "16px",
                        fontWeight: 400,
                        gap: 1,
                        cursor: 'pointer',
                        color: "white",
                    }}
                >
                    Create Role
                </button>
            </Box>
        </Grid>
    );
};

export default CreateRole;
