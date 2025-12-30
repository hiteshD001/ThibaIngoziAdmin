import { useState } from "react";
import { useFormik } from "formik";
import { useAssignRole, useGetRoles, useGetAdminUsers ,useGetUserList } from "../../API Calls/API";
import { toast } from "react-toastify";
import {
    Box,
    Typography,
    Grid,
    TextField,
    InputAdornment,
    Checkbox,
    Avatar,
    Button,
} from "@mui/material";
import search from "../../assets/images/search.png";
import CustomSelect from "../../common/Custom/CustomSelect";
import unChecked from "../../assets/images/UnChecked.svg";
import checked from "../../assets/images/checkboxIcon.svg";
import { useQueryClient } from "@tanstack/react-query";

const UserAssignment = () => {
    const [filter, setFilter] = useState("");
    const [selectedUsers, setSelectedUsers] = useState([]);
    const client = useQueryClient()

    const { data: roles, isLoading, isError } = useGetRoles();
    const { data: users } = useGetAdminUsers()


    const onSuccess = () => {
        toast.success("Role Assigned Successfully.");
        client.invalidateQueries(['roles'], { exact: false })
        setSelectedUsers([]);
        userform.resetForm();
    };

    const onError = (error) => {
        toast.error(error?.response?.data?.message || "Something went wrong");
    };

    const { mutate: assignRole } = useAssignRole(onSuccess, onError);
    const companyList = useGetUserList("company list", "company");

    // Convert API response to dropdown options
    const roleOptions =
        roles?.data?.data?.map((role) => ({
            label: role.name || role.roleName,
            value: role.id, // only pass ID
            description: role.description || "", // ✅ add description
        })) || [];

    if (isError) {
        toast.error("Failed to load roles");
    }

        const handleCompanyChange = (e) => {
        const { name, value } = e.target;
        const companyname = companyList?.data?.data?.users?.find(
            (user) => user._id === value
        )?.company_name;
        userform.setFieldValue(name, value);
        userform.setFieldValue("company_name", companyname);
    };

    const userform = useFormik({
        initialValues: {
            role: "",
        },
        onSubmit: (values) => {
            if (!values.role) {
                toast.error("Please select a role before assigning users.");
                return;
            }
            if (selectedUsers.length === 0) {
                toast.error("Please select at least one user.");
                return;
            }

            const payload = {
                roleId: values.role,
                userIds: selectedUsers,
            };

            assignRole(payload);
        },
    });

    // Cancel button handler
    const handleCancel = () => {
        setSelectedUsers([]);
        setFilter("");
        userform.resetForm();
    };

    return (
        <>
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
                <Typography variant="h6" fontWeight={550} mb={2}>
                    User Assignment
                </Typography>

                {/* Select Role */}
                <Box sx={{ mb: 2,display:'flex',flexDirection:'row',gap:2 }}>
                    <CustomSelect
                        id="role"
                        name="role"
                        label="Role"
                        value={userform.values.role}
                        onChange={userform.handleChange}
                        options={
                            isLoading
                                ? [{ label: "Loading...", value: "" }]
                                : roleOptions.length > 0
                                    ? roleOptions.map((role) => ({
                                        value: role.value,
                                        label: (
                                            <Box sx={{ display: "flex", flexDirection: "column" }}>
                                                <Typography sx={{ fontWeight: 450 }}>
                                                    {role.description ? role.description : role.label}
                                                </Typography>
                                            </Box>
                                        ),
                                    }))
                                    : [{ label: "No Roles Found", value: "" }]
                        }
                        error={userform.errors.role}
                    />
                    <CustomSelect
                        label="Company"
                        name="company_id"
                        value={userform.values.company_id}
                        onChange={handleCompanyChange}
                        options={companyList?.data?.data?.users?.map(user => ({
                            value: user._id,
                            label: user.company_name
                        })) || []}
                        error={userform.errors.company_id}
                        helperText={userform.errors.company_id}
                    />
                </Box>

                {/* Assign Users */}
                <Box sx={{ mb: 2 }}>
                    <Typography variant="body1" fontWeight={400} mb={2}>
                        Assign Users
                    </Typography>

                    <Box
                        sx={{
                            border: "1px solid #E0E3E7",
                            borderBottom: "none",
                            borderTopLeftRadius: "6px",
                            borderTopRightRadius: "6px",
                            p: 2,
                        }}
                    >
                        <TextField
                            variant="outlined"
                            placeholder="Search"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            fullWidth
                            sx={{
                                width: "100%",
                                height: "40px",
                                borderRadius: "8px",
                                "& .MuiInputBase-root": {
                                    height: "40px",
                                    fontSize: "14px",
                                },
                                "& .MuiOutlinedInput-input": {
                                    padding: "10px 14px",
                                },
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <img src={search} alt="search icon" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>

                    <Box
                        sx={{
                            border: "1px solid #E0E3E7",
                            borderBottomLeftRadius: "6px",
                            borderBottomRightRadius: "6px",
                            p: 2,
                            maxHeight: 250,
                            overflowY: "auto",
                        }}
                    >
                        {Array.isArray(users?.data?.data) && users.data.data.length > 0 ? (
                            users.data.data.map((user) => (
                                <Box
                                    key={user.id}
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1.5,
                                        mb: 1.5,
                                    }}
                                >
                                    <Checkbox
                                        checked={selectedUsers.includes(user.id)}
                                        icon={
                                            <img
                                                src={unChecked}
                                                alt="unchecked"
                                                style={{ width: 24, height: 24 }}
                                            />
                                        }
                                        checkedIcon={
                                            <img
                                                src={checked}
                                                alt="checked"
                                                style={{ width: 24, height: 24 }}
                                            />
                                        }
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedUsers([
                                                    ...selectedUsers,
                                                    user.id,
                                                ]);
                                            } else {
                                                setSelectedUsers(
                                                    selectedUsers.filter(
                                                        (id) => id !== user.id
                                                    )
                                                );
                                            }
                                        }}
                                    />
                                    <Avatar
                                        src={user.profile_img}
                                        alt={user.firstName}
                                        sx={{ width: 32, height: 32 }}
                                    />
                                    <Typography variant="body2" fontWeight={450}>
                                        {user.firstName || user.lastName ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "-"}
                                    </Typography>
                                </Box>
                            ))) : (
                            <Typography variant="body2" color="text.secondary">
                                No users found
                            </Typography>
                        )}
                    </Box>
                </Box>
            </Grid>

            {/* Buttons */}
            <Grid
                size={12}
                sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 2,
                    mt: 2,
                }}
            >
                <Button
                    variant="outlined"
                    onClick={handleCancel}
                    sx={{
                        width: 130,
                        height: 48,
                        borderRadius: "8px",
                        color: "#878787",
                        fontSize: "16px",
                        fontWeight: 400,
                        border: "1px solid #D1D5DB",
                    }}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={userform.handleSubmit}
                    sx={{
                        width: 180,
                        height: 48,
                        borderRadius: "8px",
                        backgroundColor: "var(--Blue)",
                        fontSize: "16px",
                        fontWeight: 400,
                        gap: 1,
                        color: "white",
                    }}
                >
                    Save Settings
                </Button>
            </Grid>
        </>
    );
};

export default UserAssignment;
