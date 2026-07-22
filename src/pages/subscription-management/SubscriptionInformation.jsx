import { useParams } from "react-router-dom";
import { Box, Typography, Paper,Grid} from "@mui/material";
import { useGetSubscriptionDetailId } from "../../API Calls/API";
import { formatDateTime } from "../../common/commonFn";

const SubscriptionInformation = () => {
    // useStates

    const params = useParams();

    // react queries
    const companyInfo = useGetSubscriptionDetailId(params.id);
    const detailsObj = companyInfo?.data?.data

    return (
        <Box p={2}>
            <Box>
                <Paper
                    elevation={3}
                    sx={{ backgroundColor: "rgb(253, 253, 253)", p: 3, borderRadius: "10px", mb: 2 }}
                >
                    <Box sx={{ borderBottom: '1px solid var(--light-gray)', mb: 3 }}>
                        <Typography variant="h6" fontWeight={550} mb={1}>
                           Subscription Details
                        </Typography>
                    </Box>

                    <Grid container spacing={2}>
                        {/* Company Name */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Typography sx={{ pb: 1 }} variant="body1" color="text.secondary">
                                User
                            </Typography>
                           
                            <Typography >{detailsObj?.first_name+''+detailsObj?.last_name}</Typography>
                           
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Typography sx={{ pb: 1 }} variant="body1" color="text.secondary">
                                Status
                            </Typography>
                           
                            <Typography >{detailsObj?.subscription_status}</Typography>
                           
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Typography sx={{ pb: 1 }} variant="body1" color="text.secondary">
                                Start Date
                            </Typography>
                           
                            <Typography >{detailsObj?.EnrollStartDate ? formatDateTime(detailsObj?.EnrollStartDate, "MMM DD, YYYY") : '-'}</Typography>
                           
                        </Grid>
                    </Grid>
                    <Grid container spacing={2} marginTop={5}>
                        {/* Company Name */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Typography sx={{ pb: 1 }} variant="body1" color="text.secondary">
                                Suspension Date
                            </Typography>
                           
                            <Typography >{detailsObj?.paymentDate ? formatDateTime(detailsObj?.paymentDate, "MMM DD, YYYY") : '-'}</Typography>
                           
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Typography sx={{ pb: 1 }} variant="body1" color="text.secondary">
                                Amount Paid
                            </Typography>
                           
                            <Typography >{detailsObj?.EnrollAmount || "-"}</Typography>
                           
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Typography sx={{ pb: 1 }} variant="body1" color="text.secondary">
                               Payment Method:
                            </Typography>
                           
                            <Typography >{detailsObj?.subscription_id?.paymentMethod || '-'}</Typography>
                           
                        </Grid>
                    </Grid>
                </Paper>
            </Box>
        </Box>
    );
};

export default SubscriptionInformation;
