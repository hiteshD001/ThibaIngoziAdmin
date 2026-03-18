import React from 'react'
import CustomSelect from '../../common/Custom/CustomSelect'
import confirmationIcon from '../../assets/images/confirmationIcon.svg'
import confirmationIcon2 from '../../assets/images/confirmationIcon2.png'
import confirmationIcon3 from '../../assets/images/confirmationIcon3.png'


import { Box, Paper, Grid, Typography,Button } from '@mui/material'

const Confirmation = () => {
    return (
        <Box px={2} sx={{ height: '100vh' }}>
            <Paper elevation={2} sx={{ p: 3, mt: 3, mb: 3, borderRadius: '10px' }}>
                <Grid container spacing={3} sx={{my:3}}>
                    <Grid size={12} sx={{ textAlign:'center'}}>
                        <img src={confirmationIcon} alt="confirmation icon" />
                        <Typography variant="h6" gutterBottom fontWeight={600}>
                            Ready to Forward
                        </Typography>
                        <Typography variant="h6" gutterBottom fontWeight={500}>
                            You're about to forward this crime report to the selected police units
                        </Typography>

                    </Grid>
                </Grid>
                {/* Report Summary */}
                <Box sx={{ px: 3, backgroundColor: "#F9FAFB",borderRadius: '10px',p: 3,my:2}}>
                    <React.Fragment>
                            <Typography variant="h6" gutterBottom fontWeight={600}>
                                Report Summary
                            </Typography>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1,}}>
                            <Typography fontSize="1rem" color="text.secondary" sx={{ minWidth: 180 }}>
                                Report Number:
                            </Typography>
                            <Typography fontSize="1rem" >
                                Report Number
                            </Typography>
                        </Box>
                         <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1,}}>
                            <Typography fontSize="1rem" color="text.secondary" sx={{ minWidth: 180 }}>
                                Crime Type:
                            </Typography>
                            <Typography fontSize="1rem" >
                                Report Number
                            </Typography>
                        </Box>
                         <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1,}}>
                            <Typography fontSize="1rem" color="text.secondary" sx={{ minWidth: 180 }}>
                                Location:
                            </Typography>
                            <Typography fontSize="1rem" >
                                Report Number:
                            </Typography>
                        </Box>
                         <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1,}}>
                            <Typography fontSize="1rem" color="text.secondary" sx={{ minWidth: 180 }}>
                                Date Report:
                            </Typography>
                            <Typography fontSize="1rem" >
                                Report Number
                            </Typography>
                        </Box>

                    </React.Fragment>

                </Box>

                {/* Destination */}
                <Box sx={{ px: 3, backgroundColor: "#F9FAFB",borderRadius: '10px',p: 3,my:4}}>
                    <React.Fragment>
                            <Typography gutterBottom fontWeight={600}>
                                Destination
                            </Typography>
                        <Box sx={{py: 1,}}>
                            <Typography fontSize="1rem" >
                                <img src={confirmationIcon3} alt="confirmation icon" /> Sending to All Police Units
                            </Typography>
                            <Typography fontSize="1rem" color="text.secondary" sx={{my:1}}>
                                This report will be forwarded to all available police units in the system.
                            </Typography>
                        </Box>
                    </React.Fragment>
                    
                </Box>
                <Typography fontSize="1rem" color="text.secondary">
                   <img src={confirmationIcon3} alt="confirmation icon" /> Once forwarded, this report will be accessible to the selected police units for further investigation.
                </Typography>
                <Box sx={{my:4,display:'flex',justifyContent:'center'}}>
                 <Button variant="contained" sx={{height: '48px', width: '240px', borderRadius: '8px', fontWeight: 500, backgroundColor: 'var(--Blue)' }}>
                        Confirm and Send
                 </Button>
                </Box>
            </Paper>
        </Box>
    )
}

export default Confirmation
