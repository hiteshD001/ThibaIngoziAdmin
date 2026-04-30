import React, { useEffect, useState } from 'react';
import {
    Paper, Box, Typography, Chip, Button, Grid
} from '@mui/material';
import { AiOutlineEye, AiOutlineCheck } from "react-icons/ai";
import { useNavigate, useParams } from 'react-router-dom';
import WhiteTick from '../../assets/images/WhiteTick.svg'
import { useGetSuspectSightingById, useUpdateSuspectMarkAsReviewed } from "../../API Calls/API";
import { toast } from "react-toastify";
import { toastOption } from "../../common/ToastOptions";
import { useQueryClient } from "@tanstack/react-query";
import SingleImagePreview from "../../common/SingleImagePreview";

const suspectName = "John Doe";
const caseNumber = "CASE-2023-0458";
const description = "The suspect was seen wearing a black hoodie and jeans, fleeing the scene on foot.";
const location = "Downtown Street, Sector 12";
const dateTime = "August 5, 2025 at 10:45 AM";

const SuspectDetail = () => {
    
    // Mock data – replace with actual props or API data
    const nav = useNavigate()
    const params = useParams();
    const responseObj = useGetSuspectSightingById(params.id);
    const [suspectObj, setSuspectObj] = useState({});
    const queryClient = useQueryClient();
    let infoData = {}

    useEffect(() => {
        if (responseObj.data?.data && !suspectObj._id) {
            setSuspectObj(responseObj.data.data);
        }

    }, [responseObj.data]);

    const onSuccess = () => {
        toast.success("Status Updated Successfully.");
        setSuspectObj((prev) => ({
            ...prev,
            isMarkAsReviewed: true,   // or false based on response
        }));
        queryClient.invalidateQueries(["crime-report", params.id]);
    };
    const onError = (error) => {
        setUpdatingId(""); // Clear loader
        toast.error(
            error.response.data.message || "Something went Wrong",
            toastOption
        );
    };

    const { mutate } = useUpdateSuspectMarkAsReviewed(onSuccess, onError);
    const markAsReviewed = (id, report_status) => {
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
                            Suspect Sighting Details
                        </Typography>
                    </Box>

                    {/* Suspect Info */}
                    <Box mt={2}>
                        <Typography variant="h5" fontWeight={600}>
                            {suspectObj?.suspect_id?.first_name || '-'} {suspectObj?.suspect_id?.last_name || '-'}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                            <Typography>Case Number:</Typography>
                            <Chip
                                label={suspectObj.caseNumberId}
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
                            Sighting Detail
                        </Typography>
                    </Box>

                    {/* Description */}
                    <Box mt={2}>
                        <Typography fontSize={'1rem'} fontWeight={500} color="text.secondary">
                            Description
                        </Typography>
                        <Typography variant="body1" mt={1} sx={{ backgroundColor: '#F9FAFB', borderRadius: '6px', p: 1.5 }}>
                            {suspectObj.description}
                        </Typography>
                    </Box>

                    {/* Location & Time */}
                    <Box mt={3} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                        <Box>
                            <Typography fontSize={'1rem'} fontWeight={500} color="text.secondary">
                                Location of Sighting
                            </Typography>
                            <Typography fontSize={'1.05rem'} mt={0.5}>
                                {suspectObj.address}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography fontSize={'1rem'} fontWeight={500} color="text.secondary">
                                Time and Date
                            </Typography>
                            <Typography fontSize={'1.05rem'} mt={0.5}>
                                {suspectObj.submittedDate}
                            </Typography>
                        </Box>
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
                                {suspectObj?.reporter_id?.first_name || '-'} {suspectObj?.reporter_id?.last_name || '-'}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography fontSize={'1rem'} fontWeight={500} color="text.secondary">
                                Contact Information
                            </Typography>
                            <Typography fontSize={'1.05rem'} mt={0.5}>
                                {suspectObj.reporter_id?.mobile_no_country_code}-{suspectObj.reporter_id?.mobile_no}
                            </Typography>
                        </Box>
                    </Box>
                    {/* evidence */}
                    <Box mt={4} pb={1} borderBottom="1px solid #e0e0e0">
                        <Typography variant='subtitle1' fontWeight={550}>
                            Evidence
                        </Typography>
                        <Grid container spacing={2} mt={2}>
                            {suspectObj?.evidence_image?.map((item, index) => (
                                <Grid size={{ xs: 6, sm: 3 }} key={item}>
                                    <Box
                                        component="img"
                                        src={item}
                                        onClick={() => handleImageClick(item,`Evidence-${index+1}`)}
                                        alt={`Placeholder ${index}`}
                                        sx={{  width: "100%", maxWidth: "241px", height: "160px", objectFit: "cover",border: "1px solid #E5E7EB", borderRadius: "6px",cursor:"pointer" }}
                                    />
                                </Grid>
                             ))}
                        </Grid>
                    </Box>
                    <Box sx={{ mt: 4, display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', gap: 2 }}>
                        <Button
                            variant="outlined"
                            sx={{ height: '48px', width: '210px', borderRadius: '8px', fontWeight: 500, color: 'black', border: '1px solid var(--light-gray)' }}
                            onClick={() => nav(suspectObj?.linked_case_type === 'crimereports' ? `/home/crime-reports/crime-report/${suspectObj?.linked_case_type_id?._id}` : `/home/capture-reports?location_id=${suspectObj?.linked_case_type_id?._id}&sosId=${suspectObj?.linked_case_type_id?.sosNumber}`)}
                            startIcon={<AiOutlineEye />}
                        >
                            Go to Case Details
                        </Button>
                        <Button
                            variant="contained"
                            disabled={suspectObj.report_status === 'reviewed' ? true :false}
                            sx={{ height: '48px', width: '210px', borderRadius: '8px', fontWeight: 500, backgroundColor: 'var(--Blue)' }}
                            onClick={() => markAsReviewed(suspectObj?._id, 'reviewed')}
                            startIcon={<img src={WhiteTick} alt="white tick" />}

                        >
                            Mark as Reviewed
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </>
    );
};

export default SuspectDetail;
