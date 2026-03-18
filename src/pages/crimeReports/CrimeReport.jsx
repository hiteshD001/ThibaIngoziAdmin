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
import { AiOutlineEye, AiOutlineCheck } from "react-icons/ai";
import { useGetUserList, useGetCrimeReportById, useUpdateMarkAsReviewed } from "../../API Calls/API";
import CrimeReportMap from "../../common/CrimeReportMap";
import { toast } from "react-toastify";
import { toastOption } from "../../common/ToastOptions";
import { useQueryClient } from "@tanstack/react-query";

const CrimeReport = () => {
    // Mock data – replace with actual props or API data
    const nav = useNavigate()
    const params = useParams();
    const crimeReportInfoObj = useGetCrimeReportById(params.id);
    const [crimeReportObj, setCrimeReportObj] = useState({});
    const queryClient = useQueryClient();
    let infoData = {}

    useEffect(() => {
        if (crimeReportInfoObj.data?.data && !crimeReportObj._id) {
            setCrimeReportObj(crimeReportInfoObj.data.data);
        }

    }, [crimeReportInfoObj.data]);

    const onSuccess = () => {
        toast.success("Status Updated Successfully.");
        setCrimeReportObj((prev) => ({
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

    const { mutate } = useUpdateMarkAsReviewed(onSuccess, onError);
    const markAsReviewed = (id, report_status) => {
        mutate({
            id: id,
            data: { report_status: report_status },
        });
    }

    return (
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
                        Crime Report #{crimeReportObj.crime_report_number}
                    </Typography>
                </Box>

                <Grid container spacing={3}>
                    <Grid size={7}>
                        {/* Subtitle */}
                        <Box mt={4} pb={1} borderBottom="1px solid #e0e0e0">
                            <Typography variant='subtitle1' fontWeight={550}>
                                Sighting Details
                            </Typography>
                        </Box>

                        {/* Description */}
                        <Box my={2}>
                            <Typography fontSize={'1rem'} fontWeight={500} color="text.secondary">
                                Description
                            </Typography>
                            <Typography variant="body1" mt={1} sx={{ backgroundColor: '#F9FAFB', borderRadius: '6px', p: 1.5 }}>
                                {crimeReportObj.description}

                            </Typography>
                        </Box>

                        <Box>
                            <Typography fontSize={'1rem'} fontWeight={500} color="text.secondary">
                                Time and Date
                            </Typography>
                            <Typography fontSize={'1.05rem'} mt={0.5}>
                                {crimeReportObj.submittedDate}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid size={5}>
                        {/* Location & Time */}
                        <Box mt={3} sx={{ alignItems: 'center', gap: 5 }}>
                            <Typography variant='subtitle1' fontWeight={550}>
                                Incident Location
                            </Typography>
                            <CrimeReportMap lat={parseFloat(crimeReportObj.lat)} long={parseFloat(crimeReportObj.long)} address={crimeReportObj.address} isMapLoaded={true} />
                            <Typography fontSize={'1.05rem'} mt={0.5}>
                                {crimeReportObj.address}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>


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
                            {crimeReportObj.user_id?.first_name} {crimeReportObj.user_id?.last_name}
                        </Typography>
                    </Box>

                    <Box>
                        <Typography fontSize={'1rem'} fontWeight={500} color="text.secondary">
                            Contact Information
                        </Typography>
                        <Typography fontSize={'1.05rem'} mt={0.5}>
                            {crimeReportObj.user_id?.mobile_no_country_code}{crimeReportObj.user_id?.mobile_no}
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ mt: 2 }}>
                    <Typography fontSize={'1rem'} fontWeight={500} color="text.secondary">
                        Report Submitted
                    </Typography>
                    <Typography fontSize={'1.05rem'} mt={0.5}>
                        {crimeReportObj.submittedDate}
                    </Typography>

                </Box>
                {/* evidence */}
                <Box mt={4} pb={1} borderBottom="1px solid #e0e0e0">
                    <Typography variant='subtitle1' fontWeight={550}>
                        Evidence
                    </Typography>
                    <Grid container spacing={2} mt={2}>
                        {crimeReportObj.evidence_image?.map((item, index) => (
                            <Grid size={{ xs: 6, sm: 3 }} key={index}>
                                <Box
                                    component="img"
                                    src={item}
                                    alt={`Placeholder ${index}`}
                                    sx={{ width: '100%', height: 'auto', borderRadius: '6px' }}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </Box>
                <Box sx={{ mt: 4, display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', gap: 2 }}>
                    <Button
                        variant="contained"
                        sx={{ height: '48px', width: '210px', borderRadius: '8px', fontWeight: 500, backgroundColor: '#259157' }}
                        onClick={() => markAsReviewed(crimeReportObj?._id, 'reviewed')}
                        disabled={crimeReportObj.isMarkAsReviewed}
                        startIcon={<img src={WhiteTick} alt="white tick" />}
                    >
                        {crimeReportObj.isMarkAsReviewed ? "Reviewed" : "Mark as Reviewed"}
                    </Button>
                    <Button
                        variant="contained"
                        sx={{ height: '48px', width: '240px', borderRadius: '8px', fontWeight: 500, backgroundColor: 'var(--Blue)' }}
                        onClick={() => nav("/home/crime-reports/forward-to-police")}
                        startIcon={<img src={forward} alt="forward" />}

                    >
                        Forward to Police Unit
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default CrimeReport;
