import { Tooltip, Box, Typography, Avatar } from "@mui/material";

const AssignedUsers = ({ assignedUserCount }) => {
    const role = assignedUserCount.role || {};
    const users = role.name === 'sales_agent'
        ? (role.assignedInfluencers || [])
        : (role.assignedUsers || []);
    const visibleUsers = users.slice(0, 2);
    const extraCount = users.length - 2;

    return (
        <Tooltip
            placement="bottom"
            title={
                <Box sx={{ p: 1.5, maxHeight: 220, overflowY: "auto" }}>
                    <Typography sx={{ fontWeight: 600, mb: 1 }}>
                        Assigned Users ({users.length})
                    </Typography>

                    {users.map((user) => (
                        <Box
                            key={user._id}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                                mb: 1
                            }}
                        >
                            <Avatar
                                src={user.profileImage}
                                sx={{ width: 32, height: 32 }}
                            >
                                {user.first_name?.[0]?.toUpperCase() || "U"}
                            </Avatar>
                            <Typography fontSize={14}>
                                {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : "-"}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            }
            componentsProps={{
                tooltip: {
                    sx: {
                        bgcolor: "#fff !important",
                        color: "#000",
                        boxShadow: 3,
                        borderRadius: 2
                    }
                }
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", pl: 1 }}>
                {visibleUsers.map((user, index) => (
                    <Avatar
                        key={user._id}
                        src={user.profileImage}
                        sx={{
                            width: 35,
                            height: 35,
                            ml: index === 0 ? 0 : "-10px",
                            border: "3px solid #fff",
                            zIndex: visibleUsers.length + index
                        }}
                    >
                        {user.first_name?.[0]?.toUpperCase() || "U"}
                    </Avatar>
                ))}

                {extraCount > 0 && (
                    <Box
                        sx={{
                            width: 35,
                            height: 35,
                            ml: "-10px",
                            borderRadius: "50%",
                            border: "3px solid #fff",
                            fontSize: 12,
                            fontWeight: 500,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: "#E4E4E7",
                            zIndex: visibleUsers.length * 2
                        }}
                    >
                        {extraCount}+
                    </Box>
                )}

                {users.length === 0 && (
                    <Typography sx={{ color: "#9CA3AF" }}>-</Typography>
                )}
            </Box>
        </Tooltip>
    );
};

export default AssignedUsers;
