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
import { useGetSOSDetailById } from "../../API Calls/API";
import CrimeReportMap from "../../common/CrimeReportMap";
import { toast } from "react-toastify";
import { toastOption } from "../../common/ToastOptions";
import { useQueryClient } from "@tanstack/react-query";
import SingleImagePreview from "../../common/SingleImagePreview";
import printBtn from '../../assets/images/PrintIcn.svg'
import {formatDateTime} from '../../common/commonFn';

const SOSDetail = () => {

    const nav = useNavigate()
    const params = useParams();
    const infoObj = useGetSOSDetailById(params.id);
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

    const handlePrint = () => {
        const printContent = document.getElementById("print-section").innerHTML;
        const originalContent = document.body.innerHTML;

        document.body.innerHTML = printContent; // replace whole body with selected part
        window.print();
        document.body.innerHTML = originalContent; // restore after print
        window.location.reload(); // optional (safe reset)
    };
    
    return (
        <>
        <SingleImagePreview
            show={previewImage.open}
            onClose={handleClosePreview}
            image={previewImage.src ? { src: previewImage.src, label: previewImage.label } : null}
        />
        <Box px={2} sx={{ display: 'flex', gap: 3, flexDirection: 'column' }} id="print-section">
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
                        <Grid container spacing={3}>
                            <Grid size={10}>
                                <Typography variant='h6' fontWeight={550}>
                                    SOS ID - #{dataObj?.sosNumber}
                                </Typography>
                            </Grid>
                            <Grid size={1}>
                                <Button
                                    onClick={() => handlePrint()}
                                    variant="contained"
                                    sx={{ height: '38px', width: "90.734375px", fontSize: '0.8rem', color: "black", backgroundColor: 'white', borderRadius: '8px', marginRight: "10px" }}
                                    startIcon={<img src={printBtn} alt="Print" />}
                                >
                                    Print
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>

                <Grid container spacing={3}>
                    <Grid size={7}>
                        <Box mt={4} pb={1} borderBottom="1px solid #e0e0e0">
                            <Typography variant='subtitle1' fontWeight={550}>
                                SOS Type
                            </Typography>
                        </Box>
                        <Box my={2} borderBottom="1px solid #e0e0e0">
                            <Typography variant="body1" mt={1}>
                                {dataObj?.type?.type}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography fontSize={'1rem'} fontWeight={500} color="text.secondary">
                                Time and Date
                            </Typography>
                            <Typography fontSize={'1.05rem'} mt={0.5}>
                                {formatDateTime(dataObj.createdAt,'DD/MM/YYYY  hh:mm A')}
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

                {/* report information */}
                <Box mt={4} pb={1} borderBottom="1px solid #e0e0e0">
                    <Typography variant='subtitle1' fontWeight={550}>
                        SOS Initiator Information
                    </Typography>
                </Box>
                <Box mt={3} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <Box>
                        <Typography fontSize={'1rem'} fontWeight={500} color="text.secondary">
                            SOS Initiator
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
                            {dataObj.user_id?.mobile_no_country_code} {dataObj.user_id?.mobile_no}
                        </Typography>
                    </Box>
                </Box>
            </Paper >
        </Box >
        </>
    );
};

export default SOSDetail;
