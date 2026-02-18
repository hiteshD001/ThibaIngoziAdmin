import { useEffect, useRef, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useGetRoles, useDeleteRole, useGetSideData } from "../../API Calls/API"
import { toast } from "react-toastify"
import { Box, Typography, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Button, } from "@mui/material";
import edit from '../../assets/images/editSvg.svg'
import delBtn from '../../assets/images/delBtn.svg';

import DeleteIcon from '../../assets/images/DeleteIcon.svg'
import CreateRole from "./CreateRole"
import UserAssignment from "./UserAssignment"
import InfoIcon from '@mui/icons-material/Info';
import AssignedUsers from './AssignedUsers'
import CustomPagination from "../../common/Custom/CustomPagination"
import Loader from "../../common/Loader"


const AdminSetting = () => {

    const client = useQueryClient()
    const createRoleRef = useRef(null);

    const [roleId, setRoleId] = useState('')
    const [editRoleId, setEditRoleId] = useState(null)
    const [openPopup, setOpenPopup] = useState(null);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);


    const { data: roles, isLoading } = useGetRoles(currentPage, rowsPerPage);
    const { data: sideData, isLoading: sideDataLoading } = useGetSideData(currentPage, rowsPerPage);

    const totalUsers = sideData?.data?.data?.pagination?.totalCount || 0;
    const totalPages = sideData?.data?.data?.pagination?.totalPages || 1;

    const handleOpen = (type) => setOpenPopup(type);
    const handleClose = () => setOpenPopup(null);

    useEffect(() => {
        if (editRoleId && createRoleRef.current) {
            createRoleRef.current.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    }, [editRoleId]);

    const { mutate: deleteRole } = useDeleteRole(
        () => {
            if (roles?.data?.data?.length === 1 && currentPage > 1) {
                setCurrentPage((prev) => prev - 1);
            }
            toast.success("Role Deleted Successfully");
            client.invalidateQueries(['roles'], { exact: false })
            handleClose();
        },
        () => {
            toast.error("Failed to delete role");
            handleClose()
        }
    );

    const handleConfirm = () => {
        deleteRole(roleId)
    };

    const handleEdit = (roleId) => {
        setEditRoleId(roleId);
    };

    return (
        <Box p={2}>
            <Grid container spacing={2}>
                {/* ---------------- Create new role ---------------- */}
                <Grid item xs={12} ref={createRoleRef}>
                    <CreateRole
                        editRoleId={editRoleId}
                        setEditRoleId={setEditRoleId}
                    />
                </Grid>
                {/* ---------------- User Assignment ---------------- */}
                <UserAssignment />
            </Grid >

            {/* Exisiting Roles */}
            <Box sx={{ backgroundColor: "rgb(253, 253, 253)", boxShadow: "-3px 4px 23px rgba(0, 0, 0, 0.1)", padding: 0, mt: 3, borderRadius: '10px' }}>
                <Grid container justifyContent="space-between" alignItems="center" p={3} rowGap={2}>
                    <Grid size={{ xs: 12, lg: 6 }} sx={{ display: 'flex', flexDirection: 'row', gap: 2, mb: { xs: 1, md: 0 } }}>
                        <Typography variant="h6" fontWeight={590}>Existing Roles</Typography>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        {
                            isLoading || sideDataLoading ? (
                                <Loader />
                            ) : Array.isArray(sideData?.data?.data?.rolesWithStats) && sideData?.data?.data?.rolesWithStats?.length > 0 ? (
                                <>
                                    <TableContainer>
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
                                                {sideData?.data?.data?.rolesWithStats?.map((role) => (
                                                    <TableRow key={role._id}>
                                                        <TableCell>
                                                            {role.name ? role.name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : "-"}
                                                        </TableCell>
                                                        <TableCell sx={{ color: '#878787' }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <Chip
                                                                    label={`${role.permissions?.length || 0} permissions`}
                                                                    sx={{
                                                                        backgroundColor:
                                                                            role.permissions?.length > 0 ? '#DCFCE7' : '#FEF9C3',
                                                                        '& .MuiChip-label': {
                                                                            textTransform: 'capitalize',
                                                                            fontWeight: 500,
                                                                            color:
                                                                                role.permissions?.length > 0 ? '#166534' : '#854D0E',
                                                                        },
                                                                    }}
                                                                />

                                                                <Tooltip
                                                                    arrow
                                                                    placement="top"
                                                                    title={
                                                                        role.permissions?.length > 0
                                                                            ? `${role.permissions?.length} permissions assigned`
                                                                            : 'No permissions assigned'
                                                                    }
                                                                >
                                                                    <IconButton size="small" disableRipple>
                                                                        <InfoIcon sx={{ fontSize: 22, color: '#ADAEBC' }} />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell>
                                                            <AssignedUsers assignedUserCount={{ count: role.userCount, rows: [], role: role }} />
                                                        </TableCell>
                                                        <TableCell sx={{ color: '#878787' }}>
                                                            {role.createdAt
                                                                ? (() => {
                                                                    const date = new Date(role.createdAt);
                                                                    const month = String(date.getMonth() + 1).padStart(2, '0');
                                                                    const day = String(date.getDate()).padStart(2, '0');
                                                                    const year = date.getFullYear();
                                                                    return `${day}/${month}/${year}`;
                                                                })()
                                                                : "-"
                                                            }
                                                        </TableCell>
                                                        <TableCell>
                                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                                <IconButton
                                                                    size="medium"
                                                                    onClick={() => {
                                                                        // Handle edit
                                                                        handleEdit(role._id);
                                                                    }}
                                                                >
                                                                    <img src={edit} alt="edit" style={{ width: 30, height: 30 }} />
                                                                </IconButton>
                                                                {!['company', "passanger", "super_admin", "driver", "sales_agent", "passenger"].includes(role.name) && (
                                                                    <IconButton
                                                                        size="medium"
                                                                        onClick={() => {
                                                                            setRoleId(role._id);
                                                                            handleOpen('delete');
                                                                        }}
                                                                    >
                                                                        <img src={delBtn} alt="delete" style={{ width: 30, height: 30 }} />
                                                                    </IconButton>
                                                                )}
                                                            </Box>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </>
                            ) : (
                                <Typography align="center" color="text.secondary" sx={{ mt: 1, pb: 2 }}>
                                    No roles found
                                </Typography>
                            )
                        }
                        <CustomPagination
                            page={currentPage}
                            setPage={setCurrentPage}
                            limit={rowsPerPage}
                            setLimit={setRowsPerPage}
                            totalPages={totalPages}
                            totalItems={totalUsers}
                        />
                    </Grid>

                </Grid>
            </Box>

            {/* Delete Confirmation Dialog */}
            <Dialog open={openPopup === 'delete'} onClose={handleClose} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ display: 'flex', flexDirection: 'row', gap: 1.5, alignItems: 'center' }}>
                    <img src={DeleteIcon} alt="DeleteIcon" style={{ width: 24, height: 24 }} />
                    Delete Role
                </DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete this role?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        sx={{ color: 'black', border: '1px solid rgb(175, 179, 189)' }}
                        variant="outlined"
                        onClick={handleClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleConfirm}
                        sx={{
                            backgroundColor: '#EB5757',
                        }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AdminSetting;
