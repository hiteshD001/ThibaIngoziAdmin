import React, { useEffect, useState } from 'react';
import {
    Box, Typography, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Grid, Stack, Button, Chip,
    Tooltip
} from "@mui/material";
import ViewBtn from '../../assets/images/ViewBtn.svg'
import WhiteTick from '../../assets/images/WhiteTick.svg'
import { useParams } from 'react-router-dom';
import { useDeleteMissingVehicaleById, usePutMissingPersonStatus } from '../../API Calls/API';
import moment from 'moment';
import Loader from "../../common/Loader";
import SingleImagePreview from "../../common/SingleImagePreview";
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';

const StolenCarDetails = () => {
    const params = useParams()
    const queryClient = useQueryClient();
    const missingVehicaleById = useDeleteMissingVehicaleById("missingVehicaleById", params.id)
    const [vehicale, setvehicale] = useState({});
    useEffect(() => {
        if (missingVehicaleById?.data?.data && !vehicale._id) {
            setvehicale(missingVehicaleById?.data?.data);
        }

    }, [missingVehicaleById.data]);

    const onSuccess = (responce) => {
        toast.success("Status Updated Successfully.");
        setvehicale((prev) => ({
            ...prev,
            isMarkAsReviewed: responce?.data?.data?.isMarkAsReviewed,
            help_received: responce?.data?.data?.help_received,
        }));
        queryClient.invalidateQueries(["missingVehicaleById", params.id]);
    };
    const onError = (error) => {
        toast.error(
            error.response.data.message || "Something went Wrong",
            toastOption
        );
    };
    const { mutate } = usePutMissingPersonStatus(onSuccess, onError);
    const markAsReviewed = (id, report_status = "") => {
        mutate({
            id: id,
            data: { report_status: report_status },
        });
    }
    const [previewImage, setPreviewImage] = useState({
        open: false,
        src: '',
        label: ''
    });
    const handleImageClick = (src, label) => {
        if (src) {
            setPreviewImage({
                open: true,
                src: src instanceof File ? URL.createObjectURL(src) : src,
                label: label
            });
        }
    };
    const handleClosePreview = () => {
        setPreviewImage(prev => ({ ...prev, open: false }));
    };

    return (
        <>
            <SingleImagePreview
                show={previewImage.open}
                onClose={handleClosePreview}
                image={previewImage.src ? { src: previewImage.src, label: previewImage.label } : null}
            />
            <Box px={2} sx={{ display: 'flex', gap: 3, flexDirection: 'column' }}>
                <Paper
                    elevation={0}
                    sx={{
                        backgroundColor: "white",
                        padding: 2,
                        borderRadius: '10px',
                    }}
                >
                    {/* Title */}
                    <Box pb={1} borderBottom="1px solid #e0e0e0">
                        <Typography variant='h6' fontWeight={550}>
                            Stolen Vehicle Broadcast SOS Details
                        </Typography>
                    </Box>

                    {/* Suspect Info */}
                    <Box mt={2}>
                        <Typography variant="h5" fontWeight={600}>
                            {(vehicale?.user_id?.first_name || "") + " " + (vehicale?.user_id?.last_name || "") || '-'}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                            <Typography>Vehicle Registration Number:</Typography>
                            <Chip
                                label={vehicale?.notification_details?.notification_data?.lostVehicle?.reg_no || '-'}
                                color="primary"
                                size="small"
                                sx={{
                                    backgroundColor: '#DBEAFE',
                                    color: '#9CA3AF',
                                    fontWeight: 500,
                                    '& .MuiChip-label': {
                                        textTransform: 'capitalize',
                                        color: '#367BE0'
                                    }
                                }}
                            />
                        </Box>
                    </Box>

                    {/* Subtitle */}
                    <Box mt={4} pb={1} borderBottom="1px solid #e0e0e0">
                        <Typography variant='subtitle1' fontWeight={550}>
                            Incident Details
                        </Typography>
                    </Box>

                    {/* Location & Time */}
                    <Box mt={3} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                        <Box>
                            <Typography fontSize={'1rem'} fontWeight={500} color="text.secondary">
                                Time and Date
                            </Typography>
                            <Typography fontSize={'1.05rem'} mt={0.5}>
                                {vehicale?.createdAt
                                    ? moment(vehicale.createdAt).format('MMM D, YYYY - HH:mm A')
                                    : '-'}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography fontSize={'1rem'} fontWeight={500} color="text.secondary">
                                Location of Sighting
                            </Typography>
                            <Typography fontSize={'1.05rem'} mt={0.5}>
                                {vehicale?.address}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Description */}
                    <Box mt={2}>
                        <Typography fontSize={'1rem'} fontWeight={500} color="text.secondary">
                            Description
                        </Typography>
                        <Typography variant="body1" mt={1} sx={{ backgroundColor: '#F9FAFB', borderRadius: '6px', p: 1.5 }}>
                            {vehicale?.notification_details?.notification_data?.lostVehicle?.description}
                        </Typography>
                    </Box>

                    {/* report information */}
                    <Box mt={4} pb={1} borderBottom="1px solid #e0e0e0">
                        <Typography variant='subtitle1' fontWeight={550}>
                            Reporter Information
                        </Typography>
                    </Box>
                    <Box mt={3} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                        <Box>
                            <Typography fontSize={'1rem'} fontWeight={500} color="text.secondary">
                                Reporter Name
                            </Typography>
                            <Typography fontSize={'1.05rem'} mt={1}>
                                {vehicale?.user_id?.first_name}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography fontSize={'1rem'} fontWeight={500} color="text.secondary">
                                Surname
                            </Typography>
                            <Typography fontSize={'1.05rem'} mt={1}>
                                {vehicale?.user_id?.last_name}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography fontSize={'1rem'} fontWeight={500} color="text.secondary">
                                Contact Information
                            </Typography>
                            <Typography fontSize={'1.05rem'} mt={0.5}>
                                LAPD Tip Line {vehicale?.user_id?.mobile_no_country_code} {vehicale?.user_id?.mobile_no}
                            </Typography>
                        </Box>
                    </Box>
                    {/* evidence */}
                    <Box mt={4} pb={1} borderBottom="1px solid #e0e0e0">
                        <Typography variant='subtitle1' fontWeight={550}>
                            Evidence
                        </Typography>
                        <Grid container spacing={2} mt={2}>
                            {vehicale?.evidence_image?.map((item, index) => {
                                const key = Object.keys(item)[0];
                                const imageUrl = item[key];
                                return (
                                    <Grid size={{ xs: 6, sm: 3 }} key={index}>
                                        <Box
                                            component="img"
                                            src={imageUrl}
                                            onClick={() => handleImageClick(imageUrl, key)}
                                            alt={key}
                                            sx={{ width: "100%", maxWidth: "241px", height: "160px", objectFit: "cover", border: "1px solid #E5E7EB", borderRadius: "6px", cursor: "pointer" }}
                                        />
                                    </Grid>
                                )
                            })}
                        </Grid>
                    </Box>
                    <Box sx={{ mt: 4, display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', gap: 2 }}>
                        <Button
                            variant="contained"
                            sx={{ height: '48px', width: '210px', borderRadius: '8px', fontWeight: 500, backgroundColor: '#259157' }}
                            onClick={() => markAsReviewed(vehicale?._id, 'help_received')}
                            disabled={vehicale.help_received === "help_received"}
                            startIcon={<img src={WhiteTick} alt="white tick" />}
                        >
                            {vehicale.help_received === 'help_received' ? "Founded" : "Mark as Found"}
                        </Button>
                        <Button
                            variant="contained"
                            sx={{ height: '48px', width: '210px', borderRadius: '8px', fontWeight: 500, backgroundColor: '#367BE0' }}
                            onClick={() => markAsReviewed(vehicale?._id, 'reviewed')}
                            disabled={vehicale.isMarkAsReviewed}
                            startIcon={<img src={WhiteTick} alt="white tick" />}
                        >
                            {vehicale.isMarkAsReviewed ? "Reviewed" : "Mark as Reviewed"}
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </>
    );
};

export default StolenCarDetails;
