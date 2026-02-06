import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { toastOption } from "../../common/ToastOptions";
import { chatValidation } from "../../common/FormValidation";
import { Box, Button, Typography, InputLabel, FormControl, Grid, Paper, Divider } from "@mui/material";
import { useFormik } from "formik";
import { BootstrapInput } from "../../common/BootstrapInput";
import { useGetCountryList, useGetProvinceList, useRegister, useGetCityList } from "../../API Calls/API";
import { useQueryClient } from "@tanstack/react-query";
import CustomSelect from "../../common/Custom/CustomSelect";
import Loader from "../../common/Loader";

const AddChatGroup = () => {

    const nav = useNavigate();
    const client = useQueryClient();
    // const companyId = location.state?.companyId;

    const [role] = useState(localStorage.getItem("role"))

    const chatgroupForm = useFormik({
        initialValues: {
            group_name: "",
            country: "",
            city: "",
            province: "",
            suburb: "",
        },
        validationSchema: chatValidation,
        onSubmit: (values) => {
            console.log(values)
            // newdriver.mutate(values);
        },
    });

    const onSuccess = () => {
        toast.success("Chat created successfully.");
        chatgroupForm.resetForm();
        client.invalidateQueries("chat group list");
        nav(role === 'super_admin' ? "/home/chat-groups" : `/home/chat-groups/${localStorage.getItem("userID")}`);
    };

    const onError = (error) => {
        toast.error(error.response.data.message || "Something went Wrong", toastOption)
    };

    const handleCancel = () => {
        nav("/home/chat-groups");
    };


    const newdriver = useRegister(onSuccess, onError);
    const provincelist = useGetProvinceList(chatgroupForm.values.country);
    const cityList = useGetCityList(chatgroupForm.values.province);
    const countrylist = useGetCountryList();

    // const companyList = useGetUserList("company list", "company")

    // useEffect(() => {
    //     if (companyId && companyList?.data?.data?.users?.length) {
    //         chatgroupForm.setFieldValue('company_id', companyId);

    //         const matchedCompany = companyList.data.data.users.find(
    //             (user) => user._id === companyId
    //         );

    //         if (matchedCompany) {
    //             chatgroupForm.setFieldValue('company_name', matchedCompany.company_name);
    //         }
    //     }
    // }, [companyId, companyList?.data?.data?.users]);

    return (
        <Box p={2}>
            <form onSubmit={chatgroupForm.handleSubmit}>
                <Paper elevation={0} sx={{ p: 3, borderRadius: '10px' }}>
                    <Grid container spacing={3}>
                        <Grid size={12}>
                            <Typography variant="h6" gutterBottom fontWeight={600}>
                                Group Information
                            </Typography>
                            <Divider sx={{ borderColor: "#E5E7EB" }} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl variant="standard" fullWidth>
                                <InputLabel shrink htmlFor="group_name" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                    Group Name
                                </InputLabel>
                                <BootstrapInput
                                    id="group_name"
                                    name="group_name"
                                    placeholder="First Name"
                                    value={chatgroupForm.values.group_name}
                                    onChange={chatgroupForm.handleChange}
                                />
                                {chatgroupForm.touched.group_name && <div style={{ color: '#d32f2f', fontSize: 12, marginLeft: "14px" }}>{chatgroupForm.errors.group_name}</div>}
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <CustomSelect
                                label="Country"
                                name="country"
                                value={chatgroupForm.values.country}
                                onChange={chatgroupForm.handleChange}
                                options={countrylist.data?.data.data?.map(country => ({
                                    value: country._id,
                                    label: country.country_name
                                })) || []}
                                error={chatgroupForm.errors.country && chatgroupForm.touched.country}
                                helperText={chatgroupForm.errors.country}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <CustomSelect
                                label="Province"
                                name="province"
                                value={chatgroupForm.values.province}
                                onChange={chatgroupForm.handleChange}
                                options={provincelist.data?.data.data?.map(province => ({
                                    value: province._id,
                                    label: province.province_name
                                })) || []}
                                error={chatgroupForm.errors.province && chatgroupForm.touched.province}
                                helperText={chatgroupForm.touched.province ? chatgroupForm.errors.province : ''}
                                disabled={!chatgroupForm.values.country}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <CustomSelect
                                label="City"
                                name="city"
                                value={chatgroupForm.values.city}
                                onChange={chatgroupForm.handleChange}
                                options={cityList.data?.data.data?.map(city => ({
                                    value: city._id,
                                    label: city.city_name
                                })) || []}
                                error={chatgroupForm.errors.city && chatgroupForm.touched.city}
                                helperText={chatgroupForm.touched.city ? chatgroupForm.errors.city : ''}
                                disabled={!chatgroupForm.values.country || !chatgroupForm.values.province}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl variant="standard" fullWidth >
                                <InputLabel shrink htmlFor="suburb" sx={{ fontSize: '1.3rem', color: 'rgba(0, 0, 0, 0.8)', '&.Mui-focused': { color: 'black' } }}>
                                    Suburb
                                </InputLabel>
                                <BootstrapInput
                                    id="suburb"
                                    name="suburb"
                                    placeholder="Enter Suburb"
                                    value={chatgroupForm.values.suburb}
                                    onChange={chatgroupForm.handleChange}
                                />
                                {chatgroupForm.touched.suburb && <div style={{ color: '#d32f2f', fontSize: 12, marginLeft: "14px" }}>{chatgroupForm.errors.suburb}</div>}
                            </FormControl>
                        </Grid>
                        <Grid size={12} sx={{ mt: 1 }}>
                            <Box display="flex" justifyContent="flex-end" gap={2}>
                                <Button variant="outlined" sx={{ width: 130, height: 48, borderRadius: '10px', color: 'black', borderColor: '#E0E3E7' }} onClick={handleCancel}>
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={newdriver.isPending}
                                    sx={{ width: 130, height: 48, borderRadius: '10px', backgroundColor: 'var(--Blue)' }}
                                >
                                    {newdriver.isPending ? <Loader color="white" /> : "Create Group"}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>
            </form>
        </Box >
    )
}

export default AddChatGroup