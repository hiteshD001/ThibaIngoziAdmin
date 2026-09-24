import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Typography, TextField, Button, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, Grid, InputAdornment, Stack, Select as MuiSelect, MenuItem, Checkbox, FormControlLabel, Divider, FormGroup, FormControl, InputLabel, Tooltip, TableSortLabel } from "@mui/material";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import { useRef } from "react";
import { startOfYear } from "date-fns";
import { useFormik } from "formik";
import Select from "react-select";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { components } from 'react-select';
import { chatGrouValidation } from "../../common/FormValidation";
import { useGetChatGroupById, useChatGroupEdit, useGetCountryList, useGetProvinceList, useGetCityList, useGetsurbubList} from "../../API Calls/API";
import CustomSelect from "../../common/Custom/CustomSelect";
import { BootstrapInput } from "../../common/BootstrapInput";
import PhoneInput from "react-phone-input-2";
import GrayPlus from '../../assets/images/GrayPlus.svg';
import ImportSheet from "../../common/ImportSheet";
import { toastOption } from "../../common/ToastOptions";

const ChatGroupDetails = () => {
    // useStates
    const [edit, setedit] = useState(false);
    const [popup, setpopup] = useState(false);
    const client = useQueryClient();
    const nav = useNavigate();
    const params = useParams();

    // react queries
    const companyInfo = useGetChatGroupById(params.id);

    // companyedit
    const CompanyForm = useFormik({
        initialValues: {
            group_name: "",
			country: "",
			province: "",
			city: "",
			suburb: "",
        },
        validationSchema: chatGrouValidation,
        onSubmit: (values) => {
            setedit(false);
            mutate({ id: params.id, data: values });
        },
    });

    const provincelist = useGetProvinceList(CompanyForm.values.country)
    const cityList = useGetCityList(CompanyForm.values.province)
    const suburbList = useGetsurbubList(CompanyForm.values.city)
    const countrylist = useGetCountryList()

    // set company values
    useEffect(() => {
        const user = companyInfo.data?.data;
        if (user) {
            CompanyForm.setValues({
                group_name: user.group_name || "",
                country: user.country?._id || user.country || "",
                province: user.province?._id || user.province || "",
                city: user.city?._id || user.city || "",
                suburb: user.suburb?._id || user.suburb || "",
            });
        }
    }, [companyInfo.data?.data, edit]);

    const displayField = (label, value) => (
        <Box mb={3}>
            <Typography sx={{ fontSize: '1.1rem', fontWeight: 400, mb: 1 }}>{label}</Typography>
        </Box>
    );


    const onSuccess = () => {
        client.invalidateQueries(["group", params.id]);
        toast.success("Chat Group Updated Successfully.");
    };
    const onError = (error) => {
        toast.error(error.response?.data?.message || "Something went Wrong", toastOption);
    };

    const { mutate } = useChatGroupEdit(onSuccess, onError);

    const DropdownIndicator = (props) => {
        return (
            <components.DropdownIndicator {...props}>
                {props.selectProps.menuIsOpen ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
            </components.DropdownIndicator>
        );
    };

    return (
        <Box p={2}>
            <Box>
                <Paper elevation={3} sx={{ backgroundColor: "rgb(253, 253, 253)", p: 3, borderRadius: "10px", mb: 2 }}>
                    <Grid container spacing={2}>
                        <Grid size={12}>
                            <Typography variant="h6" fontWeight={550} mb={1}>
                                Chat Group Information
                            </Typography>
                        </Grid>

                        {/* Group Name */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography sx={{ pb: 1 }} variant="body1" color="text.secondary">Group Name</Typography>
                            {edit ? (
                                <TextField
                                    fullWidth
                                    size="small"
                                    name="group_name"
                                    placeholder="Group Name"
                                    value={CompanyForm.values.group_name}
                                    onChange={CompanyForm.handleChange}
                                    error={CompanyForm.touched.group_name && Boolean(CompanyForm.errors.group_name)}
                                    helperText={CompanyForm.touched.group_name && CompanyForm.errors.group_name}
                                />
                            ) : (
                                <Typography>{companyInfo.data?.data.group_name || "-"}</Typography>
                            )}
                        </Grid>

                        {/* Country */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography sx={{ pb: 1 }} variant="body1" color="text.secondary">Country</Typography>
                            {edit ? (
                                <CustomSelect
                                    name="country"
                                    value={CompanyForm.values.country}
                                    onChange={CompanyForm.handleChange}
                                    options={countrylist.data?.data.data?.map(country => ({
                                        value: country._id,
                                        label: country.country_name
                                    })) || []}
                                    error={CompanyForm.touched.country && Boolean(CompanyForm.errors.country)}
                                    helperText={CompanyForm.touched.country && CompanyForm.errors.country}
                                />
                            ) : (
                                displayField(companyInfo.data?.data.country?.country_name)
                            )}
                        </Grid>

                        {/* Province */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography sx={{ pb: 1 }} variant="body1" color="text.secondary">Province</Typography>
                            {edit ? (
                                <CustomSelect
                                    name="province"
                                    value={CompanyForm.values.province}
                                    onChange={CompanyForm.handleChange}
                                    options={provincelist.data?.data.data?.map(province => ({
                                        value: province._id,
                                        label: province.province_name
                                    })) || []}
                                    disabled={!CompanyForm.values.country}
                                    error={CompanyForm.touched.province && Boolean(CompanyForm.errors.province)}
                                    helperText={CompanyForm.touched.province && CompanyForm.errors.province}
                                />
                            ) : (
                                displayField(companyInfo.data?.data.province?.province_name)
                            )}
                        </Grid>

                        {/* City */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography sx={{ pb: 1 }} variant="body1" color="text.secondary">City</Typography>
                            {edit ? (
                                <CustomSelect
                                    name="city"
                                    value={CompanyForm.values.city}
                                    onChange={CompanyForm.handleChange}
                                    options={cityList.data?.data.data?.map(city => ({
                                        value: city._id,
                                        label: city.city_name
                                    })) || []}
                                    disabled={!CompanyForm.values.country || !CompanyForm.values.province}
                                    error={CompanyForm.touched.city && Boolean(CompanyForm.errors.city)}
                                    helperText={CompanyForm.touched.city && CompanyForm.errors.city}
                                />
                            ) : (
                                displayField(companyInfo.data?.data.city?.city_name)
                            )}
                        </Grid>
                        
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography sx={{ pb: 1 }} variant="body1" color="text.secondary">Suburb</Typography>
                            {edit ? (
                                <CustomSelect
                                    name="suburb"
                                    value={CompanyForm.values.suburb}
                                    onChange={CompanyForm.handleChange}
                                    options={suburbList.data?.data.data?.map(suburb => ({
                                        value: suburb._id,
                                        label: suburb.surbub_name
                                    })) || []}
                                    disabled={!CompanyForm.values.city}
                                    error={CompanyForm.touched.suburb && Boolean(CompanyForm.errors.suburb)}
                                    helperText={CompanyForm.touched.suburb && CompanyForm.errors.suburb}
                                />
                            ) : (
                                displayField(companyInfo.data?.data.suburb?.surbub_name)
                            )}
                        </Grid>

                    </Grid>
                    {/* Save / Edit */}
                    <Box mt={3} textAlign="right">
                        {!edit && (
                            <Button variant="contained" sx={{ width: 120, height: 45, borderRadius: '10px', backgroundColor: 'var(--Blue)' }} onClick={() => setedit(true)}>
                                Edit
                            </Button>
                        )}
                    </Box>
                    {edit && (
                        <Grid size={12} sx={{ mt: 1 }}>
                            <Box display="flex" justifyContent="flex-end" gap={2}>
                                <Button variant="outlined" sx={{ width: 130, height: 48, borderRadius: '10px', color: 'black', borderColor: '#E0E3E7' }} onClick={() => setedit(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={() => {
                                        //  console.log("errors:", CompanyForm.errors);
                                        CompanyForm.handleSubmit();
                                    }}
                                    sx={{ width: 130, height: 48, borderRadius: '10px', backgroundColor: 'var(--Blue)' }}
                                >
                                    Save
                                </Button>
                            </Box>
                        </Grid>
                    )}
                </Paper>
            </Box>
            {popup && <ImportSheet setpopup={setpopup} type="driver" />}
        </Box>
    );
};

export default ChatGroupDetails;
