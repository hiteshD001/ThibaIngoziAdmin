import { useState } from "react";
import { useFormik } from "formik";
import { useAssignRole, useGetRoles, useGetAdminUsers, useGetUserList, useGetRoleByIdWithCompany } from "../../API Calls/API";
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
import Loader from "../../common/Loader";

const UserAssignment = () => {
    const [filter, setFilter] = useState("");
    const [selectedUsers, setSelectedUsers] = useState([]);
    const client = useQueryClient()

    const { data: roles, isLoading, isError } = useGetRoles();
    const { data: users } = useGetAdminUsers()
    const companyList = useGetUserList("company list", "company");

    // Define success and error handlers first
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

    // Initialize form first
    const userform = useFormik({
        initialValues: {
            role: "",
            company_id: "",
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
                userId: selectedUsers,
            };

            assignRole(payload);
        },
    });

    // Now use the API hook after form is initialized
    const { data: roleData, isLoading: roleLoading } = useGetRoleByIdWithCompany(
        userform.values.role,
        userform.values.company_id
    );

    console.log("Roles data:", roles);
    console.log("Role data with company filter:", roleData);

    // Extract users from the role data response
    const roleUsers = roleData?.data?.recentUsers || [];
    
    // For company users, we need to check if there are any companyUsers in the recentUsers
    // Based on the API response, companyUsers are nested inside each user
    const companyUsers = roleUsers.length > 0 && roleUsers[0]?.companyUsers ? roleUsers[0].companyUsers : [];

    console.log("Role users:", roleUsers);
    console.log("Company users:", companyUsers);

    // Convert API response to dropdown options
    const roleOptions =
        roles?.data?.data?.map((role) => ({
            label: role.name || role.roleName,
            value: role._id, // Use _id instead of id
            description: role.description || "", // ✅ add description
        })) || [];

    console.log("Role options:", roleOptions);

    if (isError) {
        toast.error("Failed to load roles");
    }

        const handleRoleChange = (e) => {
        const { value } = e.target;
        console.log("Selected role:", value);
        userform.setFieldValue("role", value);
        setSelectedUsers([]); // Clear selected users when role changes
    };

    const handleCompanyChange = (e) => {
        const { name, value } = e.target;
        const companyname = companyList?.data?.data?.users?.find(
            (user) => user._id === value
        )?.company_name;
        userform.setFieldValue(name, value);
        userform.setFieldValue("company_name", companyname);
        setSelectedUsers([]); // Clear selected users when company changes
    };

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
                        label="Company"
                        name="company_id"
                        value={userform.values.company_id}
                        onChange={handleCompanyChange}
                        // options={companyList?.data?.data?.users?.map(user => ({
                        //     value: user._id,
                        //     label: user.company_name
                        // })) || []}

                        options={
                            isLoading
                                ? [{ label: "Loading...", value: "" }]
                                : companyList.data?.data?.users?.length > 0
                                    ? companyList.data?.data?.users.map((company) => ({
                                        value: company._id,
                                        label: (
                                            <Box sx={{ display: "flex", flexDirection: "column" }}>
                                                <Typography sx={{ fontWeight: 450 }}>
                                                    {company.company_name}
                                                </Typography>
                                            </Box>
                                        ),
                                    }))
                                    : [{ label: "No Companies Found", value: "" }]
                        }
                        
                        error={userform.errors.company_id}
                        helperText={userform.errors.company_id}
                    />
                    <CustomSelect
                        id="role"
                        name="role"
                        label="Add New Role"
                        value={userform.values.role}
                        onChange={handleRoleChange}
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
                        {roleLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                                <Loader />
                            </Box>
                        ) : userform.values.company_id ? (
                            // Show company users when company is selected
                            Array.isArray(companyUsers) && companyUsers.length > 0 ? (
                                companyUsers.map((user) => (
                                    <Box
                                        key={user._id || user.id}
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1.5,
                                            mb: 1.5,
                                        }}
                                    >
                                        <Checkbox
                                            icon={<img src={unChecked} alt="unchecked" />}
                                            checkedIcon={<img src={checked} alt="checked" />}
                                            checked={selectedUsers.includes(user._id || user.id)}
                                            onChange={() => {
                                                const userId = user._id || user.id;
                                                if (selectedUsers.includes(userId)) {
                                                    setSelectedUsers(selectedUsers.filter(id => id !== userId));
                                                } else {
                                                    setSelectedUsers([...selectedUsers, userId]);
                                                }
                                            }}
                                        />
                                        <Avatar
                                            src={user.profileImage}
                                            sx={{ width: 36, height: 36 }}
                                        >
                                            {user.first_name?.[0]?.toUpperCase() || "U"}
                                        </Avatar>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="body2" fontWeight={500}>
                                                {user.first_name} {user.last_name}
                                            </Typography>
                                            
                                            
                                        </Box>
                                    </Box>
                                ))
                            ) : (
                                <Typography variant="body2" sx={{ textAlign: 'center', py: 2, color: 'text.secondary' }}>
                                    No users found for this company
                                </Typography>
                            )
                        ) : Array.isArray(roleUsers) && roleUsers.length > 0 ? (
                            // Show role users when role is selected
                            roleUsers.map((user) => (
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
                                        icon={<img src={unChecked} alt="unchecked" />}
                                        checkedIcon={<img src={checked} alt="checked" />}
                                        checked={selectedUsers.includes(user._id)}
                                        onChange={() => {
                                            if (selectedUsers.includes(user._id)) {
                                                setSelectedUsers(selectedUsers.filter(id => id !== user._id));
                                            } else {
                                                setSelectedUsers([...selectedUsers, user._id]);
                                            }
                                        }}
                                    />
                                    <Avatar
                                        src={user.profileImage}
                                        sx={{ width: 36, height: 36 }}
                                    >
                                        {user.first_name?.[0]?.toUpperCase() || "U"}
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="body2" fontWeight={500}>
                                            {user.first_name} {user.last_name}
                                        </Typography>   
                                    </Box>
                                </Box>
                            ))
                        ) : (
                            <Typography variant="body2" sx={{ textAlign: 'center', py: 2, color: 'text.secondary' }}>
                                {userform.values.role ? 'No users found for this role' : 'Please select a role or company to view users'}
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
