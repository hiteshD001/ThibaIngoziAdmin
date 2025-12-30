import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import { useGetRoles, useDeleteRole } from "../../API Calls/API"
import { toast } from "react-toastify"
import {
    Box, Typography, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, IconButton, Chip,
} from "@mui/material";
import edit from '../../assets/images/editSvg.svg'
import delBtn from '../../assets/images/delBtn.svg';

// import ConfirmationPOPup from '../../common/ConfirmationPOPup';
// import deleteConfirm from '../../assets/images/deleteConfirm.svg'
import CreateRole from "./CreateRole"
import UserAssignment from "./UserAssignment"
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AssignedUsers from './AssignedUsers'
import CustomPagination from "../../common/Custom/CustomPagination"


const AdminSetting = () => {
    const [name, setName] = useState('')
    const [roleId, setRoleId] = useState('')
    const [openPopup, setOpenPopup] = useState(null);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);


    const nav = useNavigate()
    const client = useQueryClient()
    const { data: roles, isLoading } = useGetRoles(currentPage, rowsPerPage);

    const totalUsers = roles?.data?.pagination?.totalCount;
    const totalPages = Math.ceil(totalUsers / rowsPerPage);

    const handleOpen = (type) => setOpenPopup(type);
    const handleClose = () => setOpenPopup(null);

    const { mutate: deleteRole } = useDeleteRole(
        () => {
            if (roles?.data?.data?.length === 1 && currentPage > 1) {
                setCurrentPage((prev) => prev - 1);
            }
            toast.success("Role Deleted Successfully");
            client.invalidateQueries(['roles'], { exact: false })
            handleClose();
        },
        (err) => {
            toast.error("Failed to delete role");
            handleClose()
        }
    );

    const handleConfirm = () => {
        deleteRole(roleId)
    };


    return (
        <Box p={2}>
            <Grid container spacing={2} >
                {/* ---------------- Create new role ---------------- */}
                <CreateRole />
                {/* ---------------- User Assignment ---------------- */}
                <UserAssignment />
            </Grid >

            {/* Exisiting Roles */}
            <Box sx={{ backgroundColor: "rgb(253, 253, 253)", boxShadow: "-3px 4px 23px rgba(0, 0, 0, 0.1)",padding:0, mt: 3, borderRadius: '10px' }}>
                <Grid container justifyContent="space-between" alignItems="center" p={2}>
                    <Grid size={{ xs: 12, lg: 6 }} sx={{ display: 'flex', flexDirection: 'row', gap: 2, mb: { xs: 1, md: 0 } }}>
                        <Typography variant="h6" fontWeight={590} sx={{ pl: 2 }}>Existing Roles</Typography>
                    </Grid>
                </Grid>
                {
                    isLoading ? (
                        <Typography align="center" color="text.secondary" sx={{ mt: 1, pb: 2 }}>Loading....</Typography>
                    ) : Array.isArray(roles?.data?.data) && roles?.data?.data?.length > 0 ? (
                        <>
                            <TableContainer >
                                <Table sx={{ '& .MuiTableCell-root': { fontSize: '15px', } }}>
                                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                        <TableRow >
                                            <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#878787' }}>Role Name</TableCell>
                                            <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#878787' }}>Permissions</TableCell>
                                            <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#878787' }}>Users Assigned</TableCell>
                                            <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#878787' }}>Created</TableCell>
                                            <TableCell sx={{
                                                backgroundColor: '#F9FAFB', color: '#878787'
                                            }}>Actions</TableCell>

                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {roles?.data?.data?.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell>
                                                    {user.description || "-"}
                                                </TableCell>
                                                <TableCell sx={{ color: '#878787' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Chip
                                                            label={user.permissionType}
                                                            sx={{
                                                                backgroundColor:
                                                                    user.permissionType === 'All permissions' ? '#DCFCE7' : '#FEF9C3',
                                                                '& .MuiChip-label': {
                                                                    textTransform: 'capitalize',
                                                                    fontWeight: 500,
                                                                    color:
                                                                        user.permissionType === 'All permissions' ? '#166534' : '#854D0E',
                                                                },
                                                            }}
                                                        />

                                                        <Tooltip
                                                            title={
                                                                user.permissionType === 'All permissions'
                                                                    ? 'All permissions: Full access to all modules'
                                                                    : 'Limited permissions: Access to selected modules only'
                                                            }
                                                        >
                                                            <IconButton size="small" disableRipple>
                                                                <InfoOutlinedIcon sx={{ fontSize: 18, color: '#878787' }} />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <AssignedUsers assignedUserCount={user.assignedUserCount} />
                                                </TableCell>
                                                <TableCell sx={{ color: '#878787' }}>
                                                    {user.created_at
                                                        ? (() => {
                                                            const date = new Date(user.created_at);
                                                            const utcDay = String(date.getUTCDate()).padStart(2, '0');
                                                            const utcMonth = date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
                                                            const utcYear = date.getUTCFullYear();
                                                            return `${utcDay}-${utcMonth}-${utcYear}`;
                                                        })()
                                                        : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <Box
                                                        align="center"
                                                        sx={{ display: "flex", flexDirection: "row", gap: 1 }}
                                                    >
                                                        <Tooltip title="edit">
                                                            <IconButton onClick={() => {
                                                                nav(`/home/settings/setting-edit/${user.id}`)
                                                            }}>
                                                                <img src={edit} alt="edit button" />
                                                            </IconButton>
                                                        </Tooltip>

                                                        <Tooltip title="Delete">
                                                            <IconButton onClick={() => {
                                                                handleOpen("delete")
                                                                setName(user.role)
                                                                setRoleId(user.id)
                                                            }}>
                                                                <img src={delBtn} alt="delete icon" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>

                                                </TableCell>

                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                {/* <ConfirmationPOPup
                                    open={openPopup === "delete"}
                                    onClose={handleClose}
                                    onConfirm={handleConfirm}
                                    title="Delete Role"
                                    message={`Are you sure you want to delete the ${name} role? This action cannot be undone, and any users assigned to this role will lose access`}
                                    BtnText={'Delete Role'}
                                    icon={deleteConfirm}
                                /> */}
                            </TableContainer>
                            <CustomPagination totalPages={totalPages} setCurrentPage={setCurrentPage} setRowsPerPage={setRowsPerPage} rowsPerPage={rowsPerPage} currentPage={currentPage} />
                        </>
                    ) : (
                        <>
                            <Typography align="center" color="text.secondary" sx={{ mt: 2,pb:2 }}>
                                No data found
                            </Typography>
                        </>

                    )

                }
            </Box >
        </Box>
    )
}

export default AdminSetting
