import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
    Box,
    Typography,
    InputLabel,
    FormControl,
    Grid,
    Paper,
    Button, InputAdornment, Accordion, AccordionDetails, AccordionSummary
} from "@mui/material";
import search from "../../assets/images/search.svg";

import { BootstrapInput } from "../../common/BootstrapInput";
import { useQueryClient } from "@tanstack/react-query";
import SubscriptionDetails from "./SubscriptionDetail";
import UserDetail from "./UserDetail";
import CarDetail from "./CarDetail";

const VerificationView = () => {
    const client = useQueryClient();
    const [role] = useState(localStorage.getItem("role"))
    const [userDetailFind, setUserDetailFind] = useState(false);
    const [userDetails, setUserDetails] = useState({});
    const [loader, setLoader] = useState(false);

    const nav = useNavigate();

    return (
        <>
            {userDetailFind ?
                (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '90vh' }}>
                        <Grid size={12} >
                            <Grid size={12} mb={3} sx={{ textAlign: 'center' }}>
                                <Typography variant="h5" fontWeight={550}>
                                    User Verification
                                </Typography>
                                <Typography variant="body1" mt={1} color="text.secondary">
                                    Search for a user to manage verification status and view details.
                                </Typography>
                            </Grid>
                            <Paper
                                elevation={3}
                                sx={{ backgroundColor: "rgb(253, 253, 253)", p: 4, maxWidth: 500, borderRadius: "10px" }}
                            >
                                <Grid container spacing={3}>
                                    <Grid size={{ xs: 12 }}>
                                        <FormControl variant="standard" fullWidth sx={{ position: 'relative' }}>
                                            <InputLabel shrink htmlFor="identity" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                                Identity Document / Passport
                                            </InputLabel>

                                            <BootstrapInput
                                                id="identity"
                                                name="identity"
                                                placeholder="Enter ID or Passport Number"
                                                type={"text"}
                                                // value={changePasswordForm.values.newPassword}
                                                // onChange={changePasswordForm.handleChange}
                                                style={{ paddingRight: 0 }}
                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid size={12}>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            // disabled={}
                                            sx={{ width: '100%', height: 48, borderRadius: '10px', backgroundColor: 'var(--Blue)' }}
                                        >
                                            Search
                                            {/* {changePassword.isPending ? <Loader color="white" /> : "Submit"} */}
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>
                    </Box>
                ) : (
                    <Box p={2}>
                        <Grid container spacing={3}>    
                            <Grid size={3} >
                                <Box display="flex" flexDirection="column" gap={3}>
                                    <Paper
                                        elevation={3}
                                        sx={{ backgroundColor: "rgb(253, 253, 253)", p: 4, maxWidth: 500, borderRadius: "10px" }}
                                    >
                                        <Grid container spacing={3}>
                                            <Grid size={{ xs: 12 }}>
                                                <FormControl variant="standard" fullWidth sx={{ position: 'relative' }}>
                                                    <Typography variant="h6" fontWeight={550} mb={2}>
                                                        <img src={search} alt="search icon" height={"16px"} width={"16px"} /> Search Customer
                                                    </Typography>

                                                    <BootstrapInput
                                                        id="searchCustomer"
                                                        name="identity"
                                                        placeholder="Enter ID Number"
                                                        type={"text"}
                                                        // value={changePasswordForm.values.newPassword}
                                                        // onChange={changePasswordForm.handleChange}
                                                        style={{ paddingRight: 0 }}
                                                    />
                                                </FormControl>
                                            </Grid>
                                            <Grid size={12}>
                                                <Button
                                                    type="submit"
                                                    variant="contained"
                                                    // disabled={}
                                                    sx={{ width: '100%', height: 48, borderRadius: '10px', backgroundColor: 'var(--Blue)' }}
                                                >
                                                    Search User

                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                    <UserDetail/>
                                </Box>
                            </Grid>
                            <Grid size={9}>
                                <Box display="flex" flexDirection="column" gap={3}>
                                    <Paper
                                        elevation={3}
                                        sx={{ p: 3,  borderRadius: "10px" }}
                                    >
                                        <SubscriptionDetails></SubscriptionDetails>
                                    </Paper>
                                    <CarDetail/>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                )
            }
        </>
    );
};

export default VerificationView;

const formValues = {
    searchInput: ""
}
