import React from 'react'
import CustomSelect from '../../common/Custom/CustomSelect'
import confirmationIcon from '../../assets/images/confirmationIcon.svg'
import confirmationIcon2 from '../../assets/images/confirmationIcon2.png'
import confirmationIcon3 from '../../assets/images/confirmationIcon3.png'


import { Box, Paper, Grid, Typography } from '@mui/material'

const Confirmation = () => {
    return (
        <Box px={2} sx={{ height: '100vh' }}>
            <Paper elevation={2} sx={{ p: 3, mt: 3, mb: 3, borderRadius: '10px' }}>
                <Grid container spacing={3}>
                    <Grid size={12} sx={{ borderBottom: '1px solid var(--light-gray)' }}>
                        <img src={confirmationIcon} alt="confirmation icon" />
                        <Typography variant="h6" gutterBottom fontWeight={600}>
                            Ready to Forward
                        </Typography>
                        <Typography variant="h6" gutterBottom fontWeight={500}>
                            You're about to forward this crime report to the selected police units
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    )
}

export default Confirmation
