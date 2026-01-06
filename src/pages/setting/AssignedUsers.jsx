import { Tooltip, Box, Typography, Avatar } from "@mui/material";

const AssignedUsers = ({ assignedUserCount }) => {
    return (
        <Tooltip
            enterDelay={100}
            leaveDelay={0}
            // arrow
            placement="bottom-start"
            title={
                <Box sx={{ p: 1.5, maxHeight: 250, overflowY: "auto" }}>
                    <Typography sx={{ fontWeight: 600, mb: 1 }}>
                        Assigned Users ({assignedUserCount?.count})
                    </Typography>

                    {assignedUserCount?.rows.map((usr) => (
                        <Box
                            key={usr.id}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                                mb: 1
                            }}
                        >
                            <Avatar src={usr.profile_img} sx={{ width: 36, height: 36 }} />
                            <Typography>{usr.firstName} {usr.lastName}</Typography>
                        </Box>
                    ))}
                </Box>
            }
            componentsProps={{
                tooltip: {
                    sx: {
                        bgcolor: "white",
                        color: "black",
                        boxShadow: 3,
                        borderRadius: 2,
                        p: 0.5
                    }
                }
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center" }}>
                {/* {assignedUserCount?.count > 0 ? (
                    <> */}
                {assignedUserCount?.rows.slice(0, 3).map((usr) => (
                    <Avatar
                        key={usr.id}
                        src={usr.profile_img}
                        sx={{ width: 32, height: 32, ml: "-8px", border: "2px solid white" }}
                    />
                ))}

                {assignedUserCount?.count > 3 && (
                    <Box
                        sx={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            ml: "-8px",
                            border: "2px solid white",
                            fontSize: 12,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "#E4E4E7"
                        }}
                    >
                        +{assignedUserCount?.count - 3}
                    </Box>
                )}
                {/* </>
                ) : (
                    "-"
                )} */}
            </Box>

        </Tooltip>
    );
};

export default AssignedUsers;
