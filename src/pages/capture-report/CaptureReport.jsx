import { useEffect, useState } from "react";
import {
    Paper,
    Box,
    Typography,
    Chip,
    Grid,
    Button
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import WhiteTick from '../../assets/images/WhiteTick.svg'
import forward from '../../assets/images/forward.svg'
import { useGetCaptureReportById } from "../../API Calls/API";
import CrimeReportMap from "../../common/CrimeReportMap";
import { toast } from "react-toastify";
import { toastOption } from "../../common/ToastOptions";
import { useQueryClient } from "@tanstack/react-query";
import SingleImagePreview from "../../common/SingleImagePreview";

const CaptureReport = () => {
    // Mock data – replace with actual props or API data
    const nav = useNavigate()
    const params = useParams();
    const infoObj = useGetCaptureReportById(params.id);
    const [dataObj, setDataObj] = useState({});
    const queryClient = useQueryClient();

    useEffect(() => {
        if (infoObj.data?.data && !dataObj._id) {
            setDataObj(infoObj.data.data);
        }

    }, [infoObj.data]);

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
                        #{dataObj.report_number}
                    </Typography>
                </Box>

                <Grid container spacing={3}>
                    <Grid size={7}>
                        {/* Subtitle */}
                        <Box mt={4} pb={1} borderBottom="1px solid #e0e0e0">
                            <Typography variant='subtitle1' fontWeight={550}>
                                Case Report
                            </Typography>
                        </Box>

                        {/* Description */}
                        <Box my={2}>
                            <Typography fontSize={'1rem'} fontWeight={500} color="text.secondary">
                                Other Comments (Optional)
                            </Typography>
                            <Typography variant="body1" mt={1} sx={{ backgroundColor: '#F9FAFB', borderRadius: '6px', p: 1.5 }}>
                                {dataObj.otherComments}

                            </Typography>
                        </Box>

                        <Box>
                            <Typography fontSize={'1rem'} fontWeight={500} color="text.secondary">
                                Time and Date
                            </Typography>
                            <Typography fontSize={'1.05rem'} mt={0.5}>
                                {dataObj.submittedDate}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid size={5}>
                        {/* Location & Time */}
                        <Box mt={3} sx={{ alignItems: 'center', gap: 5 }}>
                            <Typography variant='subtitle1' fontWeight={550}>
                                Incident Location
                            </Typography>
                            <CrimeReportMap lat={parseFloat(dataObj.lat)} long={parseFloat(dataObj.long)} address={dataObj.address} isMapLoaded={true} />
                            <Typography fontSize={'1.05rem'} mt={0.5}>
                                {dataObj.address}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>

                 {/* Feild information */}
                <Box mt={4} pb={1} borderBottom="1px solid #e0e0e0">
                    <Typography variant='subtitle1' fontWeight={550}>
                        Field Observations
                    </Typography>
                </Box>
                    <Box mt={3}>
                        <Grid container spacing={4}>
                            <Grid item xs={12} md={6}>
                                <Box mb={2}>
                                    <Typography fontSize="1rem" fontWeight={700} color="#4b5563">
                                        Arrival Comments
                                    </Typography>
                                    <Typography fontSize="1.05rem" mt={1}>
                                        {dataObj.comments?.arrival?.comment || '-'}
                                    </Typography>
                                </Box>

                                <Box mb={2}>
                                    <Typography fontSize="1rem" fontWeight={700} color="#4b5563">
                                        Contact Attempt Comments
                                    </Typography>
                                    <Typography fontSize="1.05rem" mt={1}>
                                        {dataObj.comments?.contact_attempt?.comment || '-'}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography fontSize="1rem" fontWeight={700} color="#4b5563">
                                        Closure Comments
                                    </Typography>
                                    <Typography fontSize="1.05rem" mt={1}>
                                        {dataObj.comments?.closure?.comment || '-'}
                                    </Typography>
                                </Box>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Box mb={2}>
                                    <Typography fontSize="1rem" fontWeight={700} color="#4b5563">
                                        Assessment Comments
                                    </Typography>
                                    <Typography fontSize="1.05rem" mt={1}>
                                        {dataObj.comments?.assessment?.comment || '-'}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography fontSize="1rem" fontWeight={700} color="#4b5563">
                                        Resolutions Comments
                                    </Typography>
                                    <Typography fontSize="1.05rem" mt={1}>
                                        {dataObj.comments?.resolution?.comment || '-'}
                                    </Typography>
                                </Box>
                            </Grid>

                        </Grid>
                    </Box>

                {/* Capture information */}
                <Box mt={4} pb={1} borderBottom="1px solid #e0e0e0">
                    <Typography variant='subtitle1' fontWeight={550}>
                       Captured By
                    </Typography>
                </Box>
                <Box mt={3} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <Box>
                        <Typography fontSize={'1rem'} fontWeight={500} color="text.secondary">
                            Name
                        </Typography>
                        <Typography fontSize={'1.05rem'} mt={1}>
                            {dataObj.capture_by_id?.first_name} {dataObj.capture_by_id?.last_name}
                        </Typography>
                    </Box>

                    <Box>
                        <Typography fontSize={'1rem'} fontWeight={500} color="text.secondary">
                           Contact Information
                        </Typography>
                        <Typography fontSize={'1.05rem'} mt={0.5}>
                            {dataObj.capture_by_id?.mobile_no_country_code}{dataObj.capture_by_id?.mobile_no}
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
                            {dataObj.user_id?.first_name} {dataObj.user_id?.last_name}
                        </Typography>
                    </Box>

                    <Box>
                        <Typography fontSize={'1rem'} fontWeight={500} color="text.secondary">
                            Contact Information
                        </Typography>
                        <Typography fontSize={'1.05rem'} mt={0.5}>
                            {dataObj.user_id?.mobile_no_country_code}{dataObj.user_id?.mobile_no}
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ mt: 2 }}>
                    <Typography fontSize={'1rem'} fontWeight={500} color="text.secondary">
                        Report Submitted
                    </Typography>
                    <Typography fontSize={'1.05rem'} mt={0.5}>
                        {dataObj.submittedDate}
                    </Typography>

                </Box>
                {/* evidence */}
                <Box mt={4} pb={1} borderBottom="1px solid #e0e0e0">
                    <Typography variant='subtitle1' fontWeight={550}>
                        Evidence
                    </Typography>
                    <Grid container spacing={2} mt={2}>
                        {dataObj.evidence_image?.map((item, index) => (
                            <Grid size={{ xs: 1, sm:3 }} key={index}>
                                <Box
                                    component="img"
                                    src={item}
                                    onClick={() => handleImageClick(item,`Evidence-${index+1}`)}
                                    alt={`Placeholder ${index}`}
                                    sx={{ width: "100%", maxWidth: "241px", height: "160px", objectFit: "cover",border: "1px solid #E5E7EB", borderRadius: "6px",cursor:"pointer" }}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Paper >
        </Box >
        </>
    );
};

export default CaptureReport;
