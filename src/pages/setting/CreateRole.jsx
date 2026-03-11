import { useFormik } from "formik";
import { Grid, Box, Typography, Divider, Select, MenuItem, FormControl, InputLabel, Skeleton, CircularProgress } from "@mui/material";
import { toast } from "react-toastify";
import { useGetPermissions, useCreateRole, useTogglePermission, useGetPermissionsByRoleId, useUpdateRole, useGetPermission, useGeteHailingList } from "../../API Calls/API";
// import { BootstrapInput, CustomSwitch } from "../../common/custom"; 
import CustomSwitch from "../../common/Custom/CustomSwitch"
import AddUser from "./AddUser"
import CustomInput from "../../common/Custom/CustomInput";
import { useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react";

// assets
import changepassword from "../../assets/images/permission/change-password.svg"
import crimereports from "../../assets/images/permission/crime-reports.svg"
import flaggedreport from "../../assets/images/permission/flagged-report.svg"
import home from "../../assets/images/permission/home.svg"
import reports from "../../assets/images/permission/reports.svg"
import settings from "../../assets/images/permission/settings.svg"
import totalchatgroups from "../../assets/images/permission/total-chat-groups.svg"
import totalcompanies from "../../assets/images/permission/total-companies.svg"
import totaldrivers from "../../assets/images/permission/total-drivers.svg"
import totallinkedtrips from "../../assets/images/permission/total-linked-trips.svg"
import totalmeetinglinks from "../../assets/images/permission/total-meeting-links.svg"
import totalmissingperson from "../../assets/images/permission/total-missing-person.svg"
import totalsalesagent from "../../assets/images/permission/total-sales-agent.svg"
import totalsapswanted from "../../assets/images/permission/total-saps-wanted.svg"
import totalsosamount from "../../assets/images/permission/total-sos-amount.svg"
import totalstolencars from "../../assets/images/permission/total-stolen-cars.svg"
import totalsuspect from "../../assets/images/permission/total-suspect.svg"
import totalusers from "../../assets/images/permission/total-users.svg"
import ehailing from "../../assets/images/permission/e-hailing-view.svg"

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
                    permissionIds: [],
                    companyIds: [],
                }
            });
            setEditRoleId(null); // Exit edit mode
        } else {
            toast.success("Role Created Successfully.");
        }
        roleform.resetForm({
            values: {
                roleName: "",
                permissionIds: [],
                companyIds: [],
            }
        });
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

    const { data: permissions, isLoading: permissionsLoading } = useGetPermissions();
    const { data: permission } = useGetPermission();
    const { data: eHailingCompanies } = useGeteHailingList();

    // Resolve e-Hailing permission ID early so onSubmit can reference it
    const eHailingPermId = permissions?.data?.data?.find(p => p.name === "e-Hailing View")?._id;

    // Filter only active permissions
    const activePermissionIds = permission?.data?.data?.filter(perm => perm.status === 'active').map(perm => perm._id) || [];


    const { data: roleData } = useGetPermissionsByRoleId(editRoleId);
    const { mutate: createRole, isPending: isCreating } = useCreateRole(onSuccessRole, onErrorRole);
    const { mutate: updateRole, isPending: isUpdating } = useUpdateRole(onSuccessRole, onErrorRole);
    const { mutate: togglePermission } = useTogglePermission(onSuccessToggle, onErrorToggle);

    // Populate form when editing
    useEffect(() => {
        if (editRoleId && roleData?.data?.data) {
            const role = roleData.data.data;
            roleform.setValues({
                roleName: role.name,
                permissionIds: role.permissions.map(p => p._id),
                companyIds: role.companyIds?.length ? role.companyIds : (role.companyId ? [role.companyId] : [])
            });
        } else if (!editRoleId) {
            // Reset form for create mode
            roleform.resetForm();
        }
    }, [editRoleId, roleData]);

    // Removed incorrect useEffect that overwrote permissionIds
    // useEffect(() => {
    //     // Only pre-populate permissions when editing a role — in create mode all start as unchecked
    //     if (editRoleId) {
    //         roleform.setFieldValue("permissionIds", activePermissionIds);
    //     }
    // }, [permission?.data?.data, editRoleId]);


    const validateForm = (values) => {
        const errors = {};
        
        // Role name validation
        if (!values.roleName.trim()) {
            errors.roleName = "Role name is required";
        }
        
        // At least one permission required for new roles
        if (!editRoleId && values.permissionIds.length === 0) {
            errors.permissionIds = "At least one permission is required";
        }
        
        // Company selection required when e-Hailing View is assigned
        const isEHailingEnabled = !!eHailingPermId && values.permissionIds.includes(eHailingPermId);
        if (isEHailingEnabled && values.companyIds.length === 0) {
            errors.companyIds = "Company selection is required when e-Hailing View permission is assigned";
        }
        
        return errors;
    };

    const roleform = useFormik({
        initialValues: {
            roleName: "",
            permissionIds: [],
            companyIds: [],
        },
        validate: validateForm,
        onSubmit: (values) => {
            const isEHailingEnabled = !!eHailingPermId && values.permissionIds.includes(eHailingPermId);
            if (editRoleId) {
                const payload = { permissionIds: values.permissionIds };
                if (isEHailingEnabled && values.companyIds.length > 0) {
                    payload.companyIds = values.companyIds;
                }
                updateRole({ id: editRoleId, data: payload });
            } else {
                const payload = { roleName: values.roleName, permissionIds: values.permissionIds };
                if (isEHailingEnabled && values.companyIds.length > 0) {
                    payload.companyIds = values.companyIds;
                }
                createRole(payload);
            }
        },
    });

    const getIcon = (name) => {
        return icons?.find(i => i.name === name)?.icon
    }

    const handlePermissionToggle = (permId) => {
        const current = roleform.values.permissionIds;
        if (current.includes(permId)) {
            // Remove from list
            roleform.setFieldValue(
                "permissionIds",
                current.filter((id) => id !== permId)
            );
            // Clear companyIds if e-Hailing is being turned off
            if (permId === eHailingPermId) {
                roleform.setFieldValue("companyIds", []);
            }
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

    const handleSubmit = () => {
        // Trigger validation for permission and company fields
        roleform.setFieldTouched('permissionIds', true);
        roleform.setFieldTouched('companyIds', true);
        
        // Submit if valid
        if (!roleform.errors.permissionIds && !roleform.errors.companyIds) {
            roleform.handleSubmit();
        }
    };

    const handleCancel = () => {
        setEditRoleId(null);

        roleform.resetForm({
            values: {
                roleName: "",
                permissionIds: [],
                companyIds: [],
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

            <Divider sx={{ borderColor: "#E0E3E7", opacity: 1 }} />

            {/* Role Name Input */}
            <Box sx={{ my: 2 }}>
                <CustomInput
                    label="Role Name"
                    placeholder="You can define a new custom role here"
                    name="roleName"
                    formik={roleform}
                    mb={2}
                    disabled={!!editRoleId} // Disable role name editing
                />
            </Box>

            {/* Permissions */}
            <Box sx={{ mb: 2 }}>
                <Typography variant="body1" fontWeight={500} mb={2}>
                    Assign Permissions
                </Typography>
                
                {/* Permission validation error */}
                {roleform.errors.permissionIds && roleform.touched.permissionIds && (
                    <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                        {roleform.errors.permissionIds}
                    </Typography>
                )}

                {(() => {
                    const isAppOnlyRole = editRoleId && ['driver', 'passanger', 'passenger'].includes(roleData?.data?.data?.name);
                    return (
                        <Grid
                            container
                            sx={{
                                border: "1px solid #E5E7EB",
                                backgroundColor: "#F9FAFB",
                                borderRadius: "6px",
                                p: 3,
                                alignItems: "flex-start",
                                position: "relative"
                            }}
                            spacing={2}
                        >
                            {(isCreating || isUpdating) && (
                                <Box
                                    sx={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        width: "100%",
                                        height: "100%",
                                        backgroundColor: "rgba(255, 255, 255, 0.7)",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        zIndex: 10,
                                        borderRadius: "6px"
                                    }}
                                >
                                    <CircularProgress />
                                </Box>
                            )}
                            {permissions?.data?.data?.length > 0 ? (
                                [...permissions.data.data]
                                    .sort((a, b) => (a.name === "e-Hailing View" ? 1 : b.name === "e-Hailing View" ? -1 : 0))
                                    .map((perm) => {
                                        const isChecked = isAppOnlyRole ? false : roleform.values.permissionIds.includes(perm._id);
                                        const isDisabled = isAppOnlyRole || perm.status !== "active";
                                        const isEHailing = perm.name === "e-Hailing View";
                                        const isEHailingOn = roleform.values.permissionIds.includes(perm._id);

                                        return (
                                            <Grid
                                                key={perm._id}
                                                size={{ xs: 12, md: 6 }}
                                                sx={{
                                                    p: 1,
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    backgroundColor: "white",
                                                    borderRadius: "10px",
                                                    border: "1px solid #E5E7EB",
                                                }}
                                            >
                                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mx: 1 }}>
                                                        <img
                                                            src={getIcon(perm.name)}
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
                                                        {editRoleId ?
                                                            <CustomSwitch
                                                                checked={isChecked}
                                                                disabled={isDisabled}
                                                                onChange={() => {
                                                                    if (!isAppOnlyRole && perm.status === "active") {
                                                                        handlePermissionToggle(perm._id);
                                                                    }
                                                                }}
                                                                size="small"
                                                            /> :
                                                            <CustomSwitch
                                                                checked={roleform.values.permissionIds.includes(perm._id)}
                                                                disabled={perm.status !== "active"}
                                                                onChange={() => handlePermissionToggle(perm._id)}
                                                                size="small"
                                                            />}
                                                    </Box>
                                                </Box>

                                                {/* Company dropdown — shown only for e-Hailing View when switch is ON */}
                                                {isEHailing && isEHailingOn && (
                                                    <Box sx={{ mt: 1.5, px: 1 }}>
                                                        <FormControl fullWidth size="small">
                                                            <InputLabel id={`ehailing-company-label-${perm._id}`}>Select Company</InputLabel>
                                                            <Select
                                                                labelId={`ehailing-company-label-${perm._id}`}
                                                                label="Select Company"
                                                                value={roleform?.values?.companyIds?.[0] || ""}
                                                                onChange={(e) => roleform.setFieldValue("companyIds", e.target.value ? [e.target.value] : [])}
                                                                displayEmpty
                                                            >
                                                                {/* <MenuItem value=""><em>None</em></MenuItem> */}
                                                                {eHailingCompanies?.data?.data?.map((company) => (
                                                                    <MenuItem key={company._id} value={company._id}>
                                                                        {company.name || company.company_name || company._id}
                                                                    </MenuItem>
                                                                ))}
                                                            </Select>
                                                        </FormControl>
                                                        
                                                        {/* Company validation error */}
                                                        {roleform.errors.companyIds && roleform.touched.companyIds && (
                                                            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                                                                {roleform.errors.companyIds}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                )}
                                            </Grid>
                                        );
                                    })
                            ) : permissionsLoading ? (
                                // Skeleton loading cards while permissions fetch
                                [...Array(6)].map((_, i) => (
                                    <Grid
                                        key={i}
                                        size={{ xs: 12, md: 6 }}
                                        sx={{
                                            p: 1,
                                            display: "flex",
                                            flexDirection: "column",
                                            backgroundColor: "white",
                                            borderRadius: "10px",
                                            border: "1px solid #E5E7EB",
                                        }}
                                    >
                                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 1 }}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                                <Skeleton variant="circular" width={25} height={25} />
                                                <Skeleton variant="text" width={120} height={24} />
                                            </Box>
                                            <Skeleton variant="rounded" width={44} height={24} sx={{ borderRadius: "12px" }} />
                                        </Box>
                                    </Grid>
                                ))
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
                    );
                })()}
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
                    onClick={handleSubmit}
                    style={{
                        border: "1px solid var(--Blue)",
                        backgroundColor: "var(--Blue)",
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

const icons = [
    {
        name: "Change Password",
        icon: changepassword
    },
    {
        name: "Flag Reports",
        icon: flaggedreport
    },
    {
        name: "Settings",
        icon: settings
    },
    {
        name: "Suspect Sightings",
        icon: totalsuspect
    },
    {
        name: "Crime Reporting",
        icon: crimereports
    },
    {
        name: "Chats Groups",
        icon: totalchatgroups
    },
    {
        name: "Stolen Cars",
        icon: totalstolencars
    },
    {
        name: "Missing Persons",
        icon: totalmissingperson
    },
    {
        name: "Reports",
        icon: reports
    },
    {
        name: "SAPS Wanted",
        icon: totalsapswanted
    },
    {
        name: "Total Drivers",
        icon: totaldrivers
    },
    {
        name: "Total Companies",
        icon: totalcompanies
    },
    {
        name: "SOS Dashboard Access",
        icon: home
    },
    {
        name: "Armed Sos Amount",
        icon: totalsosamount
    },
    {
        name: "Total Meeting Links",
        icon: totalmeetinglinks
    },
    {
        name: "Total Linked Trips",
        icon: totallinkedtrips
    },
    {
        name: "Sales Agent",
        icon: totalsalesagent
    },
    {
        name: "Users",
        icon: totalusers
    },
    {
        name: "e-Hailing View",
        icon: ehailing
    }
]