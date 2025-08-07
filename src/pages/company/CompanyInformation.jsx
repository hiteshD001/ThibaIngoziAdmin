import { useState, useLayoutEffect, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Typography, TextField, Button, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, Grid, InputAdornment, Stack, Select as MuiSelect, MenuItem, Checkbox, FormControlLabel, Divider, FormGroup, FormControl, InputLabel } from "@mui/material";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import HotspotSection from "../../common/HotspotSection";
import payIcon from '../../assets/images/payIcon.svg';
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import whiteplus from '../../assets/images/whiteplus.svg';
import plus from '../../assets/images/plus.svg'
import CompanyAnalytics from '../../assets/images/CompanyAnalytics.svg'
import CompanyAnalytics2 from '../../assets/images/CompanyAnalytics2.svg'
import CompanyAnalytics3 from '../../assets/images/CompanyAnalytics3.svg'
import CompanyAnalytics4 from '../../assets/images/CompanyAnalytics4.svg'

import ViewBtn from '../../assets/images/ViewBtn.svg'
import delBtn from '../../assets/images/delBtn.svg'
import { useFormik } from "formik";
import moment from "moment/moment";
import { format } from "date-fns";
import Select from "react-select";
import checkedboxIcon from '../../assets/images/checkboxIcon.svg'
import uncheckedIcon from '../../assets/images/UnChecked.svg'
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { components } from 'react-select';
import {
    companyEditValidation,
    companyValidation,
} from "../../common/FormValidation";
import {
    useGetUser,
    useGetUserList,
    useUpdateUser,
    useGetArmedSoS,
    useGetServicesList,
    armedSosPayout,
    payoutUserUpdate,
    useGetSecurityList,
    useGetRecentSOS,
    useGetNotificationType
} from "../../API Calls/API";
import CustomChart from "../../common/Custom/CustomChart";
import PayoutPopup from "../../common/Popup";
import Loader from "../../common/Loader";
import Analytics from "../../common/Analytics";
import { DeleteConfirm } from "../../common/ConfirmationPOPup";
import ImportSheet from "../../common/ImportSheet";
import { toastOption } from "../../common/ToastOptions";

import search from "../../assets/images/search.svg";
import nouser from "../../assets/images/NoUser.png";

const CompanyInformation = ({ isMapLoaded }) => {
    // useStates
    const [edit, setedit] = useState(false);
    const [isArmedLocal, setIsArmedLocal] = useState(false);
    const [popup, setpopup] = useState(false);
    const client = useQueryClient();
    const nav = useNavigate();
    const params = useParams();
    const [selectedNotification, setSelectedNotification] = useState("");
    const [role] = useState(localStorage.getItem("role"));
    const [filter, setfilter] = useState("");
    const [confirmation, setconfirmation] = useState("");
    const [servicesList, setServicesList] = useState([]);
    const [GrpservicesList, setGrpservicesList] = useState([]);
    const [payPopup, setPopup] = useState("");
    const [selectedPayoutType, setSelectedPayoutType] = useState("");
    const [pagination, setPagination] = useState({
        driver: { page: 1, rowsPerPage: 5 },
        user: { page: 1, rowsPerPage: 5 },
        recentSos: { page: 1, rowsPerPage: 5 }
        // Add others as needed
    });
    const updatePagination = (table, key, value) => {
        setPagination((prev) => ({
            ...prev,
            [table]: {
                ...prev[table],
                [key]: value,
            },
        }));
    };

    // react queries
    const companyInfo = useGetUser(params.id);
    const driverList = useGetUserList("driver list", "driver", params.id, pagination.driver.page,
        pagination.driver.rowsPerPage, filter);
    const userList = useGetUserList("user list", "passanger", params.id, pagination.user.page,
        pagination.user.rowsPerPage, filter);
    const { data: recentSos, isFetching, refetch } = useGetRecentSOS(pagination.recentSos.page, pagination.recentSos.rowsPerPage);
    const notificationTypes = useGetNotificationType();
    const getArmedSOS = useGetArmedSoS();
    const securityList = useGetSecurityList();
    const serviceslist = useGetServicesList();


    // pagination
    const totalDriverPages = Math.ceil(driverList.data?.data?.totalUsers / pagination.driver.rowsPerPage);
    const totalUserPages = Math.ceil(userList?.data?.data?.totalUsers / pagination.user.rowsPerPage);
    const totalRecentSosPages = Math.ceil(recentSos?.data?.totalItems / pagination.recentSos.rowsPerPage);

    // notification type
    const handleNotificationChange = (e) => {
        setSelectedNotification(e.target.value);
    };
    useEffect(() => {
        if (notificationTypes.data?.data.length > 0 && !selectedNotification) {
            setSelectedNotification(notificationTypes.data?.data[1]?._id);
        }
    }, [notificationTypes]);

    // companyedit
    const CompanyForm = useFormik({
        initialValues: {
            company_name: "",
            mobile_no: "",
            email: "",
            isArmed: "",
            isPaymentToken: "",
            services: [],
            securityCompany: [],
            isEnrollToken: "",
        },
        validationSchema: companyEditValidation,
        onSubmit: (values) => {
            setedit(false);
            const formData = new FormData();
            Object.entries(values).forEach(([key, value]) => {
                if (key === "services") {
                    value.forEach((id) => formData.append("companyService[]", id));
                } else if (key === "securityCompany") {
                    value.forEach((id) => formData.append("securityCompany[]", id));
                } else {
                    formData.append(key, value);
                }
            });
            mutate({ id: params.id, data: formData });
        },
    });

    useEffect(() => {
        if (companyInfo.data) {
            setIsArmedLocal(companyInfo.data?.data?.user?.isArmed);
        }
    }, [companyInfo.data]);

    // set company values
    useEffect(() => {
        const user = companyInfo.data?.data?.user;
        if (user) {
            CompanyForm.setValues({
                company_name: user.company_name || "",
                mobile_no: user.mobile_no || "",
                email: user.email || "",
                isArmed: user.isArmed || false,
                isPaymentToken: user.isPaymentToken || false,
                isEnrollToken: user.isEnrollToken || false,
                services:
                    user.services?.filter((s) => s.serviceId?.isService).map((s) => s.serviceId._id) ||
                    [],
                securityCompany:
                    user.securityCompany?.map((item) => item.securityCompanyId._id) || [],
            });

            const filteredServices = user.services?.filter((s) => s.serviceId?.isService);
            const grouped = filteredServices?.reduce((acc, s) => {
                const type = s.serviceId.type;
                if (!acc[type]) acc[type] = [];
                acc[type].push({
                    label: s.serviceId.type,
                    value: s.serviceId._id,
                });
                return acc;
            }, {});
            const groupedOptions = Object.keys(grouped || {}).map((type) => ({
                label: type,
                options: grouped[type],
            }));
            setServicesList(groupedOptions);
        }
    }, [companyInfo.data?.data?.user, edit]);

    // security companies options
    const securityCompanyOptions = securityList?.data?.data?.company?.map((item) => ({
        label: item.company_name,
        value: item._id,
    })) || [];

    // Company services options
    useLayoutEffect(() => {
        if (Array.isArray(serviceslist)) {
            const filteredServices = serviceslist.filter((service) => service.isService);
            const groupedOptions = [
                {
                    label: "Services",
                    options: filteredServices.map((service) => ({
                        label: service.type,
                        value: service._id,
                    })),
                },
            ];
            setGrpservicesList(groupedOptions ?? []);
        }
    }, [serviceslist]);

    const onSuccess = () => {
        client.invalidateQueries(["user", params.id]);
        toast.success("User Updated Successfully.");
    };
    const onError = (error) => {
        toast.error(error.response?.data?.message || "Something went Wrong", toastOption);
    };

    const { mutate } = useUpdateUser(onSuccess, onError);
    const PayoutForm = useFormik({
        initialValues: {
            firstName: "",
            surname: "",
            branchCode: "",
            amount: 0,
            accountNumber: "",
            customerCode: "",
        },
    });

    const parseXmlResponse = (xmlString) => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "text/xml");
        const result = xmlDoc.getElementsByTagName("Result")[0]?.textContent;
        const message = xmlDoc.getElementsByTagName("ResultMessage")[0]?.textContent;
        return { result, message };
    };

    const payoutMutation = armedSosPayout(
        (res) => {
            const { result, message } = parseXmlResponse(res.data);
            if (result === "Success") {
                payoutUpdateMutation.mutate({
                    user_id: companyInfo.data.data.user._id,
                    type: selectedPayoutType,
                    amount: PayoutForm.values.amount,
                });
                toast.success("Payment successful");
                closePopup();
            } else {
                toast.error(message || "Payment failed");
                console.error("Payment Error:", message);
            }
        },
        (err) => {
            toast.error("payment failed");
            console.error("Error!", err);
        }
    );

    const payoutUpdateMutation = payoutUserUpdate(
        (res) => {
            toast.success("payment successful");
        },
        (err) => {
            toast.error("payment failed");
        }
    );

    const handleChange = () => {
        payoutMutation.mutate(PayoutForm.values);
    };

    const handlePopup = (event, type, payoutType) => {
        event.stopPropagation();
        const isCompany = payoutType === "company";
        const selectedAmount = isCompany
            ? companyInfo.data?.data.totalCompanyAmount
            : companyInfo.data?.data.totalDriverAmount;

        PayoutForm.setValues({
            firstName: companyInfo.data?.data.user?.first_name || "",
            surname: companyInfo.data?.data.user?.last_name || "",
            branchCode: companyInfo.data?.data.user.bankId?.branch_code || "",
            accountNumber: companyInfo.data?.data.user?.accountNumber || "",
            customerCode: companyInfo.data?.data.user?.customerCode || "",
            amount: selectedAmount || 0,
        });

        setPopup(type);
        setSelectedPayoutType(payoutType);
    };

    const closePopup = () => setPopup("");

    const renderPopup = () => {
        switch (payPopup) {
            case "payout":
                return <PayoutPopup yesAction={handleChange} noAction={closePopup} />;
            default:
                return null;
        }
    };

    useEffect(() => {
        if (CompanyForm.values.isArmed === true || CompanyForm.values.isArmed === "true") {
            CompanyForm.setFieldValue("securityCompany", []);
        }
    }, [CompanyForm.values.isArmed]);

    const handleAddDriver = () => {
        if (role === "company" && params.id) {
            nav("/home/total-drivers/add-driver", { state: { companyId: params.id } });
        } else {
            nav("/home/total-drivers/add-driver");
        }
    };
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
                <Paper
                    elevation={3}
                    sx={{ backgroundColor: "rgb(253, 253, 253)", p: 3, borderRadius: "10px", mb: 2 }}
                >
                    <Box sx={{ borderBottom: '1px solid var(--light-gray)', mb: 3 }}>
                        <Typography variant="h6" fontWeight={550} mb={1}>
                            Company Information
                        </Typography>
                    </Box>

                    <Grid container spacing={2}>
                        {/* Company Name */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Typography sx={{ pb: 1 }} variant="body1" color="text.secondary">
                                Company Name
                            </Typography>
                            {edit ? (
                                <TextField
                                    fullWidth
                                    size="small"
                                    name="company_name"
                                    placeholder="Company Name"
                                    value={CompanyForm.values.company_name}
                                    onChange={CompanyForm.handleChange}
                                />
                            ) : (
                                <Typography >{companyInfo.data?.data.user.company_name}</Typography>
                            )}
                        </Grid>

                        {/* Contact No */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Typography sx={{ pb: 1 }} variant="body1" color="text.secondary">
                                Contact Number
                            </Typography>
                            {edit ? (
                                <TextField
                                    fullWidth
                                    size="small"
                                    name="mobile_no"
                                    placeholder="Contact No."
                                    value={CompanyForm.values.mobile_no}
                                    onChange={CompanyForm.handleChange}
                                />
                            ) : (
                                <Typography >{companyInfo.data?.data.user.mobile_no}</Typography>
                            )}
                        </Grid>

                        {/* Contact Email */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Typography sx={{ pb: 1 }} variant="body1" color="text.secondary">
                                Contact Email
                            </Typography>
                            {edit ? (
                                <TextField
                                    fullWidth
                                    size="small"
                                    name="email"
                                    placeholder="Contact Email"
                                    value={CompanyForm.values.email}
                                    onChange={CompanyForm.handleChange}
                                />
                            ) : (
                                <Typography>{companyInfo.data?.data.user.email}</Typography>
                            )}
                        </Grid>

                        {/* Google APIs Used */}
                        <Grid size={{ xs: 12, md: 4 }} sx={{ pt: 1 }}>
                            <Typography variant="body1" color="text.secondary">
                                Total Google APIs Used
                            </Typography>
                            <Typography sx={{ pt: 1 }}>{companyInfo.data?.data.totalGoogleMapApi}</Typography>
                        </Grid>

                        {/* Toggles */}
                        <Grid size={{ xs: 12, md: 8 }} sx={{ display: "flex", flexDirection: 'column', flexWrap: "wrap", pt: 1 }}>
                            <Typography variant="body1" color="text.secondary">
                                Enabled Services
                            </Typography>
                            <Box>
                                <FormControlLabel
                                    sx={{
                                        '&.Mui-disabled': {
                                            color: 'black !important',
                                        },
                                        '.MuiTypography-root': {
                                            color: 'black',
                                        }
                                    }}
                                    control={
                                        <Checkbox
                                            checked={CompanyForm.values.isArmed}
                                            onChange={(e) => CompanyForm.setFieldValue("isArmed", e.target.checked)}
                                            disabled={!edit}
                                            icon={<img src={uncheckedIcon} alt='uncheckedIcon' />}
                                            checkedIcon={<img src={checkedboxIcon} alt='checkIcon' />}
                                            sx={{
                                                '&.Mui-disabled': {
                                                    color: 'black',
                                                }
                                            }}
                                        />
                                    }
                                    label="Security"
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={CompanyForm.values.isPaymentToken}
                                            onChange={(e) =>
                                                CompanyForm.setFieldValue("isPaymentToken", e.target.checked)
                                            }
                                            icon={<img src={uncheckedIcon} alt='uncheckedIcon' />}
                                            checkedIcon={<img src={checkedboxIcon} alt='checkIcon' />}
                                            disabled={!edit}
                                        />
                                    }
                                    label="Sos payment"
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={CompanyForm.values.isEnrollToken}
                                            onChange={(e) =>
                                                CompanyForm.setFieldValue("isEnrollToken", e.target.checked)
                                            }
                                            icon={<img src={uncheckedIcon} alt='uncheckedIcon' />}
                                            checkedIcon={<img src={checkedboxIcon} alt='checkIcon' />}
                                            disabled={!edit}
                                        />
                                    }
                                    label="Pay subscription"
                                />
                            </Box>
                        </Grid>
                    </Grid>

                    {/* Security Companies */}
                    <Grid container>
                        <Grid size={{ xs: 12, md: 5 }}>
                            {edit ? (
                                <Box mt={3}>
                                    <Typography variant="h6" fontWeight={550} mb={1}>
                                        Security Companies
                                    </Typography>
                                    <Select
                                        isMulti
                                        name="securityCompany"
                                        options={securityCompanyOptions}
                                        isDisabled={CompanyForm.values.isArmed}
                                        classNamePrefix="select"
                                        components={{ DropdownIndicator }}
                                        placeholder="Select Security Companies"
                                        className="add-company-services"
                                        value={securityCompanyOptions.filter((option) =>
                                            CompanyForm.values.securityCompany.includes(option.value)
                                        )}
                                        onChange={(selectedOptions) => {
                                            const selectedIds = selectedOptions?.map((option) => option.value) || [];
                                            CompanyForm.setFieldValue("securityCompany", selectedIds);
                                        }}
                                        menuPortalTarget={document.body}
                                        menuPosition="fixed"
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                border: "1px solid rgba(0,0,0,0.23)",
                                                boxShadow: "none",
                                                backgroundColor: "transparent",
                                            }),
                                            valueContainer: (base) => ({
                                                ...base,
                                                cursor: 'pointer',
                                                flexWrap: "wrap",
                                                maxHeight: "42px",
                                                overflowY: "auto",
                                            }),
                                            multiValue: (base) => ({
                                                ...base,
                                                margin: '2px',
                                                borderRadius: '8px',
                                                border: '1px solid var(--icon-gray)',
                                            }),
                                            multiValueLabel: (base) => ({
                                                ...base,
                                                color: 'black',
                                                backgroundColor: 'white',
                                                borderBottomLeftRadius: '8px',
                                                borderTopLeftRadius: '8px',
                                                fontWeight: 500,
                                                fontSize: 13,
                                            }),
                                            multiValueRemove: (base) => ({
                                                ...base,
                                                color: 'black',
                                                backgroundColor: 'white',
                                                borderBottomRightRadius: '8px',
                                                borderTopRightRadius: '8px',
                                                ':hover': {
                                                    backgroundColor: 'white',
                                                    color: 'black',
                                                },
                                            }),
                                            menu: (base) => ({
                                                ...base,
                                                zIndex: 9999,
                                            }),
                                        }}
                                    />
                                </Box>
                            ) : (
                                CompanyForm.values.securityCompany.length > 0 && (
                                    <Box mt={3}>
                                        <Typography variant="h6" fontWeight={550} mb={1}>
                                            Security Companies
                                        </Typography>
                                        {(CompanyForm.values.isArmed !== true) && (
                                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                                                {securityCompanyOptions
                                                    .filter((opt) => CompanyForm.values.securityCompany.includes(opt.value))
                                                    .map((company, index) => (
                                                        <Typography key={index} variant="body1">
                                                            {company.label}
                                                        </Typography>
                                                    ))}
                                            </Box>
                                        )}
                                    </Box>
                                )
                            )}
                        </Grid>
                    </Grid>


                    {/* Save / Edit */}
                    <Box mt={3} textAlign="right">
                        {edit ? (
                            <Box sx={{ display: "flex", justifyContent: 'flex-end', gap: 2 }}>
                                <Button
                                    variant="outlined"
                                    sx={{ width: 130, height: 48, borderRadius: '10px', border: '1px solid var(--icon-gray)', backgroundColor: 'white', color: 'black' }}
                                    onClick={() => {
                                        setedit(false);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="contained"
                                    sx={{ width: 130, height: 48, borderRadius: '10px', backgroundColor: 'var(--Blue)' }}
                                    onClick={() => CompanyForm.submitForm()}
                                >
                                    Save
                                </Button>

                            </Box>
                        ) : (
                            <Button variant="contained" sx={{ width: 120, height: 45, borderRadius: '10px', backgroundColor: 'var(--Blue)' }} onClick={() => setedit(true)}>
                                Edit
                            </Button>
                        )}
                    </Box>
                </Paper>
                <Grid container gap={{ xs: 0, lg: 4 }} sx={{ mb: 1 }}>
                    {/* Company Services */}
                    <Grid size={{ xs: 12, md: 12, lg: 7.5 }}>
                        <Paper
                            elevation={3}
                            sx={{ backgroundColor: "rgb(253, 253, 253)", p: 3, borderRadius: "10px", mb: 2 }}
                        >
                            <Typography variant="h6" fontWeight={550} mb={1}>
                                Company Services
                            </Typography>
                            <Typography fontSize={'0.9rem'} color="text.secondary" fontWeight={500} mb={1}>
                                Enabled Emergency Services
                            </Typography>

                            <Box>
                                {GrpservicesList.map((group, groupIdx) => (
                                    <Box key={group.label} mb={2}>
                                        <FormGroup row>
                                            {group.options.map((service, idx) => {
                                                const isChecked = CompanyForm.values.services?.includes(service.value);

                                                return (
                                                    <FormControlLabel
                                                        key={service.value}
                                                        control={
                                                            <Checkbox
                                                                checked={isChecked}
                                                                onChange={(e) => {
                                                                    const current = CompanyForm.values.services || [];
                                                                    const updated = e.target.checked
                                                                        ? [...current, service.value]
                                                                        : current.filter((v) => v !== service.value);

                                                                    CompanyForm.setFieldValue("services", updated);
                                                                }}
                                                                disabled={!edit}
                                                                icon={<img src={uncheckedIcon} alt="unchecked" />}
                                                                checkedIcon={<img src={checkedboxIcon} alt="checked" />}
                                                            />
                                                        }
                                                        label={service.label}
                                                    />
                                                );
                                            })}
                                        </FormGroup>
                                    </Box>
                                ))}
                            </Box>
                        </Paper>
                    </Grid>
                    {/* Payout Section */}
                    <Grid size={{ xs: 12, md: 12, lg: 4 }} >
                        <Paper
                            elevation={3}
                            sx={{ backgroundColor: "rgb(253, 253, 253)", px: 3, py: 4.8, borderRadius: "10px", mb: 2 }}
                        >

                            <Box>
                                <Typography variant="h6" fontWeight={550} mb={1}>
                                    Financial Overview
                                </Typography>

                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 6, lg: 12 }}>
                                        <Box
                                            sx={{
                                                p: 2,
                                                borderRadius: 1,
                                                bgcolor: "#f7f9fb",
                                                display: "flex",
                                                flexDirection: 'column',
                                                justifyContent: "space-between",
                                            }}
                                        >
                                            <Box sx={{ pb: { xs: 1, lg: 0 } }}>
                                                <Typography variant="body2" fontWeight={550} color="text.secondary">
                                                    Total Company Amount:
                                                </Typography>
                                                <Typography sx={{ py: 1 }} fontWeight={600} >{companyInfo.data?.data.totalCompanyAmount}</Typography>
                                            </Box>
                                            <Button
                                                disabled={edit}
                                                variant="contained"
                                                sx={{ gap: 1, backgroundColor: 'var(--Blue)' }}
                                                onClick={(event) => handlePopup(event, "payout", "company")}
                                            >
                                                <img src={payIcon} alt="payIcon" />
                                                Pay Company
                                            </Button>
                                        </Box>
                                        {renderPopup()}
                                    </Grid>

                                    <Grid size={{ xs: 6, lg: 12 }}>
                                        <Box
                                            sx={{
                                                p: 2,
                                                borderRadius: 1,
                                                bgcolor: "#f7f9fb",
                                                display: "flex",
                                                flexDirection: 'column',
                                                justifyContent: "space-between",
                                            }}
                                        >
                                            <Box sx={{ pb: 1 }}>
                                                <Typography variant="body2" fontWeight={550} color="text.secondary">
                                                    Total Driver Amount:
                                                </Typography>
                                                <Typography sx={{ py: 1 }} fontWeight={600}>{companyInfo.data?.data.totalDriverAmount}</Typography>
                                            </Box>
                                            <Button
                                                disabled={edit}
                                                variant="contained"
                                                sx={{ gap: 1, backgroundColor: 'var(--Blue)' }}
                                                onClick={(event) => handlePopup(event, "payout", "driver")}
                                            >
                                                <img src={payIcon} alt="payIcon" />
                                                Pay Driver
                                            </Button>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>

            {/* chart */}
            <Grid container gap={4}>
                <Grid size={{ xs: 12, md: 7.5 }}>
                    <Paper
                        elevation={3}
                        sx={{ backgroundColor: "rgb(253, 253, 253)", p: 2, mb: 3, borderRadius: "10px", minHeight: 400 }}
                    >
                        <CustomChart />
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper
                        elevation={3}
                        sx={{ backgroundColor: "rgb(253, 253, 253)", p: 2, mb: 3, borderRadius: "10px", minHeight: 400 }}
                    >
                        <Typography variant={'body1'} sx={{ mb: 4 }} fontWeight={550}>Real Time Activity</Typography>
                        <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1.5 }}>
                                <img src={CompanyAnalytics} alt="dash-counter" />
                                <Box sx={{ flexDirection: 'column', display: 'flex' }}>
                                    <Typography variant="h6" fontWeight={500}>124</Typography>
                                    <Typography>Total Active Users</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1.5 }}>
                                <img src={CompanyAnalytics2} alt="dash-counter2" />
                                <Box sx={{ flexDirection: 'column', display: 'flex' }}>
                                    <Typography variant="h6" fontWeight={500}>47</Typography>
                                    <Typography>User Actuve Today</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1.5 }}>
                                <img src={CompanyAnalytics3} alt="dash-counter3" />
                                <Box sx={{ flexDirection: 'column', display: 'flex' }}>
                                    <Typography variant="h6" fontWeight={500}>88</Typography>
                                    <Typography>Total Drivers</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1.5 }}>
                                <img src={CompanyAnalytics4} alt="dash-counter4" />
                                <Box sx={{ flexDirection: 'column', display: 'flex' }}>
                                    <Typography variant="h6" fontWeight={500}>124</Typography>
                                    <Typography>Total Active Drivers</Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
            {/* Active sos List */}

            {/* Hotspot section */}
            <HotspotSection isMapLoaded={isMapLoaded} />

            {/* Recent sos list */}
            <Paper
                elevation={3}
                sx={{ backgroundColor: "rgb(253, 253, 253)", p: 2, mb: 3, borderRadius: "10px" }}
            >
                <Grid container justifyContent="space-between" alignItems="center" mb={2}>
                    <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', flexDirection: 'row', gap: 2, mb: { xs: 1, md: 0 } }}>
                        <Typography variant="h6" fontWeight={590}>Recently Closed SOS Alerts</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 8 }} sx={{ display: 'flex', justifyContent: 'flex-end', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                        <TextField
                            variant="outlined"
                            placeholder="Search"
                            value={filter}
                            onChange={(e) => setfilter(e.target.value)}
                            fullWidth
                            sx={{
                                width: '100%',
                                height: '40px',
                                borderRadius: '8px',
                                '& .MuiInputBase-root': {
                                    height: '40px',
                                    fontSize: '14px',
                                },
                                '& .MuiOutlinedInput-input': {
                                    padding: '10px 14px',
                                },
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <img src={search} alt="search icon" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Box display="flex" sx={{ justifyContent: { xs: 'space-between' } }} gap={1}>
                            <FormControl size="small" sx={{ maxWidth: 200 }}>
                                <Select
                                    value={selectedNotification}
                                    onChange={handleNotificationChange}
                                    label="All Categories"
                                >
                                    <MenuItem value="all">All Categories</MenuItem>
                                    {notificationTypes?.data?.data?.map((type) => (
                                        <MenuItem key={type._id} value={type._id}>
                                            {type.type}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <Button
                                sx={{ height: '40px', width: '100px', borderRadius: '8px' }}
                                onClick={() => nav("/home")}

                            >
                                View All
                            </Button>
                        </Box>

                    </Grid>
                </Grid>
                {
                    isFetching ? (
                        <Loader />) :
                        recentSos?.data?.items?.length > 0 ? (
                            <Box sx={{ px: { xs: 0, md: 2 }, pt: { xs: 0, md: 3 }, backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
                                <TableContainer >
                                    <Table sx={{ '& .MuiTableCell-root': { fontSize: '15px' } }}>
                                        <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                            <TableRow >
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', borderTopLeftRadius: '10px' }}>User</TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Company</TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Last Active Status</TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Start Time Stamp</TableCell>
                                                <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>End Time Stamp</TableCell>
                                                <TableCell align="center" sx={{ backgroundColor: '#F9FAFB', borderTopRightRadius: '10px', color: '#4B5563' }}>Action</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {recentSos?.data?.items?.map((row) => (
                                                <TableRow key={row?._id}>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        <Stack direction="row" alignItems="center" gap={1}>

                                                            <Avatar
                                                                src={
                                                                    row?.user_id
                                                                        ?.selfieImage ||
                                                                    nouser
                                                                }
                                                                alt="User"
                                                            />

                                                            {row?.user_id?.username}
                                                        </Stack>
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        {row?.user_id?.company_name}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>

                                                        {row?.address}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        {format(row?.createdAt, "HH:mm:ss - dd/MM/yyyy")}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#4B5563' }}>
                                                        {moment(row?.updatedAt).format("HH:mm:ss - dd/MM/yyyy")}
                                                    </TableCell>

                                                    <TableCell >
                                                        <Box align="center" sx={{ display: 'flex', flexDirection: 'row' }}>
                                                            <IconButton onClick={() => nav(`total-drivers/driver-information/${row?.user_id?._id}`)}>
                                                                <img src={ViewBtn} alt="view button" />
                                                            </IconButton>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>

                                </TableContainer>
                                {/* Pagination */}
                                <Grid
                                    container
                                    sx={{ px: { xs: 0, sm: 3 } }}
                                    justifyContent="space-between"
                                    alignItems="center"
                                    mt={2}
                                >
                                    <Grid >
                                        <Typography variant="body2">
                                            Rows per page:&nbsp;
                                            <MuiSelect
                                                size="small"
                                                sx={{
                                                    border: "none",
                                                    boxShadow: "none",
                                                    outline: "none",
                                                    "& .MuiOutlinedInput-notchedOutline": {
                                                        border: "none",
                                                    },
                                                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                                        border: "none",
                                                    },
                                                    "& .MuiOutlinedInput-root": {
                                                        boxShadow: "none",
                                                        outline: "none",
                                                    },
                                                    "& .MuiSelect-select": {
                                                        outline: "none",
                                                    },
                                                }}
                                                value={pagination.recentSos.rowsPerPage}
                                                onChange={(e) => {
                                                    updatePagination("recentSos", "rowsPerPage", Number(e.target.value));
                                                    updatePagination("recentSos", "page", 1); // Reset to first page
                                                }}
                                            >
                                                {[5, 10, 15, 20].map((num) => (
                                                    <MenuItem key={num} value={num}>
                                                        {num}
                                                    </MenuItem>
                                                ))}
                                            </MuiSelect>
                                        </Typography>
                                    </Grid>

                                    <Grid>
                                        <Box display="flex" alignItems="center" gap={{ xs: 1, sm: 2 }}>
                                            <Typography variant="body2">
                                                {pagination.recentSos.page} / {totalRecentSosPages || 1}
                                            </Typography>
                                            <IconButton
                                                disabled={pagination.recentSos.page === 1}
                                                onClick={() => updatePagination("recentSos", "page", pagination.recentSos.page - 1)}
                                            >
                                                <NavigateBeforeIcon
                                                    fontSize="small"
                                                    sx={{
                                                        color: pagination.recentSos.page === 1 ? "#BDBDBD" : "#1976d2",
                                                    }}
                                                />
                                            </IconButton>
                                            <IconButton
                                                disabled={pagination.recentSos.page === totalRecentSosPages}
                                                onClick={() => updatePagination("recentSos", "page", pagination.recentSos.page + 1)}
                                            >
                                                <NavigateNextIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>
                        ) : (
                            <Typography align="center" color="text.secondary" sx={{ mt: 2 }}>
                                No data found
                            </Typography>
                        )}
            </Paper>

            {/* Drivers List */}
            <Paper
                elevation={3}
                sx={{ backgroundColor: "rgb(253, 253, 253)", p: 2, mb: 3, borderRadius: "10px" }}
            >
                {/* Header */}
                <Grid container justifyContent="space-between" alignItems="center" mb={2}>
                    <Grid
                        size={{ xs: 12, md: 4 }}
                        sx={{ display: "flex", flexDirection: "row", gap: 2, mb: { xs: 1, md: 0 } }}
                    >
                        <Typography variant="h6" fontWeight={590}>
                            Total Drivers
                        </Typography>
                        <Typography variant="h6" fontWeight={550}>
                            {driverList.isSuccess && driverList.data?.data.totalUsers ? driverList.data?.data.totalUsers : 0}
                        </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, md: 8 }} sx={{ display: 'flex', justifyContent: 'flex-end', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                        <TextField
                            variant="outlined"
                            placeholder="Search"
                            value={filter}
                            onChange={(e) => setfilter(e.target.value)}
                            fullWidth
                            sx={{
                                width: "100%",
                                height: "40px",
                                borderRadius: "8px",
                                "& .MuiInputBase-root": {
                                    height: "40px",
                                    fontSize: "14px",
                                },
                                "& .MuiOutlinedInput-input": {
                                    padding: "10px 14px",
                                },
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <img src={search} alt="search icon" />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Box display="flex" gap={1} sx={{ justifyContent: { xs: "space-between" } }}>
                            <Button variant="outlined" startIcon={<img src={plus} alt="plus icon" />} sx={{ height: '40px', width: '160px', fontSize: '0.8rem', borderRadius: '8px' }} onClick={() => setpopup(true)}>
                                Import Sheet
                            </Button>
                            <Button variant="contained" onClick={handleAddDriver} sx={{ height: '40px', fontSize: '0.8rem', width: '150px', borderRadius: '8px' }}
                                startIcon={<img src={whiteplus} alt='white plus' />}>
                                Add Driver
                            </Button>


                        </Box>
                    </Grid>
                </Grid>

                {/* Table*/}
                {driverList.isFetching ? (
                    <Loader />
                ) : driverList.data?.data.users?.length > 0 ? (
                    <Box
                        sx={{
                            px: { xs: 0, md: 2 },
                            pt: { xs: 0, md: 3 },
                            backgroundColor: "#FFFFFF",
                            borderRadius: "10px",
                        }}
                    >
                        <TableContainer>
                            <Table sx={{ "& .MuiTableCell-root": { fontSize: "15px" } }}>
                                <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                                    <TableRow>
                                        <TableCell sx={{ backgroundColor: "#F9FAFB", borderTopLeftRadius: '10px', color: "#4B5563" }}>
                                            Driver
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: "#F9FAFB", color: "#4B5563", width: '10%' }}>
                                            Driver ID
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: "#F9FAFB", color: "#4B5563" }}>
                                            Company
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: "#F9FAFB", color: "#4B5563" }}>
                                            Contact No.
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: "#F9FAFB", color: "#4B5563" }}>
                                            Contact Email
                                        </TableCell>
                                        <TableCell
                                            align="center"
                                            sx={{ backgroundColor: "#F9FAFB", borderTopRightRadius: '10px', color: "#4B5563" }}
                                        >
                                            Actions
                                        </TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {driverList?.data?.data?.users?.map((driver) => (
                                        <TableRow key={driver._id}>
                                            <TableCell sx={{ color: "#4B5563" }}>
                                                <Stack direction="row" alignItems="center" gap={1.5}>
                                                    <Avatar
                                                        src={driver.profileImage || nouser}
                                                        alt="driver"
                                                        sx={{ width: 32, height: 32 }}
                                                    />
                                                    {driver.first_name} {driver.last_name}
                                                </Stack>
                                            </TableCell>

                                            <TableCell sx={{ color: "#4B5563" }}>
                                                {driver.id_no || "-"}
                                            </TableCell>

                                            <TableCell sx={{ color: "#4B5563" }}>
                                                {driver.company_name || "-"}
                                            </TableCell>

                                            <TableCell sx={{ color: "#4B5563" }}>
                                                {`${driver?.mobile_no_country_code ?? ""}${driver?.mobile_no ?? ""}` || "-"}
                                            </TableCell>

                                            <TableCell sx={{ color: "#4B5563" }}>
                                                {driver.email || "-"}
                                            </TableCell>

                                            <TableCell>
                                                <Box
                                                    align="center"
                                                    sx={{ display: "flex", flexDirection: "row", gap: 1 }}
                                                >
                                                    <IconButton onClick={() =>
                                                        nav(`/home/total-drivers/driver-information/${driver._id}`)
                                                    }>
                                                        <img src={ViewBtn} alt="view button" />
                                                    </IconButton>
                                                    <IconButton onClick={() => setconfirmation(driver._id)}>
                                                        <img src={delBtn} alt="delete button" />
                                                    </IconButton>
                                                    {confirmation === driver._id && (
                                                        <DeleteConfirm
                                                            id={driver._id}
                                                            setconfirmation={setconfirmation}
                                                        />
                                                    )}

                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Pagination */}
                        <Grid
                            container
                            sx={{ px: { xs: 0, sm: 3 } }}
                            justifyContent="space-between"
                            alignItems="center"
                            mt={2}
                        >
                            <Grid >
                                <Typography variant="body2">
                                    Rows per page:&nbsp;
                                    <MuiSelect
                                        size="small"
                                        sx={{
                                            border: "none",
                                            boxShadow: "none",
                                            outline: "none",
                                            "& .MuiOutlinedInput-notchedOutline": {
                                                border: "none",
                                            },
                                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                                border: "none",
                                            },
                                            "& .MuiOutlinedInput-root": {
                                                boxShadow: "none",
                                                outline: "none",
                                            },
                                            "& .MuiSelect-select": {
                                                outline: "none",
                                            },
                                        }}
                                        value={pagination.driver.rowsPerPage}
                                        onChange={(e) => {
                                            updatePagination("driver", "rowsPerPage", Number(e.target.value));
                                            updatePagination("driver", "page", 1); // Reset to first page
                                        }}
                                    >
                                        {[5, 10, 15, 20].map((num) => (
                                            <MenuItem key={num} value={num}>
                                                {num}
                                            </MenuItem>
                                        ))}
                                    </MuiSelect>
                                </Typography>
                            </Grid>

                            <Grid>
                                <Box display="flex" alignItems="center" gap={{ xs: 1, sm: 2 }}>
                                    <Typography variant="body2">
                                        {pagination.driver.page} / {totalDriverPages || 1}
                                    </Typography>
                                    <IconButton
                                        disabled={pagination.driver.page === 1}
                                        onClick={() => updatePagination("driver", "page", pagination.driver.page - 1)}
                                    >
                                        <NavigateBeforeIcon
                                            fontSize="small"
                                            sx={{
                                                color: pagination.driver.page === 1 ? "#BDBDBD" : "#1976d2",
                                            }}
                                        />
                                    </IconButton>
                                    <IconButton
                                        disabled={pagination.driver.page === totalDriverPages}
                                        onClick={() => updatePagination("driver", "page", pagination.driver.page + 1)}
                                    >
                                        <NavigateNextIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                ) : (
                    <Typography align="center" color="text.secondary" sx={{ mt: 2 }}>
                        No data found
                    </Typography>
                )}
            </Paper>

            {/* User List */}
            <Paper
                elevation={3}
                sx={{ backgroundColor: "rgb(253, 253, 253)", p: 2, borderRadius: "10px" }}
            >
                {/* Header */}
                <Grid container justifyContent="space-between" alignItems="center" mb={2}>
                    <Grid
                        size={{ xs: 12, md: 4 }}
                        sx={{ display: "flex", flexDirection: "row", gap: 2, mb: { xs: 1, md: 0 } }}
                    >
                        <Typography variant="h6" fontWeight={590}>
                            Total Users
                        </Typography>
                        <Typography variant="h6" fontWeight={550}>
                            {userList.isSuccess && userList.data?.data.totalUsers ? userList.data?.data.totalUsers : 0}
                        </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, md: 8 }} sx={{ display: 'flex', justifyContent: 'flex-end', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                        <TextField
                            variant="outlined"
                            placeholder="Search"
                            value={filter}
                            onChange={(e) => setfilter(e.target.value)}
                            fullWidth
                            sx={{
                                width: "100%",
                                height: "40px",
                                borderRadius: "8px",
                                "& .MuiInputBase-root": {
                                    height: "40px",
                                    fontSize: "14px",
                                },
                                "& .MuiOutlinedInput-input": {
                                    padding: "10px 14px",
                                },
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <img src={search} alt="search icon" />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Box display="flex" gap={1} sx={{ justifyContent: { xs: "space-between" } }}>
                            <Button variant="outlined" startIcon={<img src={plus} alt="plus icon" />} sx={{ height: '40px', width: '160px', fontSize: '0.8rem', borderRadius: '8px' }} onClick={() => setpopup(true)}>
                                Import Sheet
                            </Button>
                            <Button variant="contained" onClick={handleAddDriver} sx={{ height: '40px', fontSize: '0.8rem', width: '150px', borderRadius: '8px' }}
                                startIcon={<img src={whiteplus} alt='white plus' />}>
                                Add User
                            </Button>


                        </Box>
                    </Grid>
                </Grid>

                {/* Table / Loader / Empty */}
                {userList.isFetching ? (
                    <Loader />
                ) : userList.data?.data.users?.length > 0 ? (
                    <Box
                        sx={{
                            px: { xs: 0, md: 2 },
                            pt: { xs: 0, md: 3 },
                            backgroundColor: "#FFFFFF",
                            borderRadius: "10px",
                        }}
                    >
                        <TableContainer>
                            <Table sx={{ "& .MuiTableCell-root": { fontSize: "15px" } }}>
                                <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                                    <TableRow>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', borderTopLeftRadius: '10px' }}>User</TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Company</TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Contact No.</TableCell>
                                        <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>Contact Email</TableCell>
                                        <TableCell align="center" sx={{ backgroundColor: '#F9FAFB', borderTopRightRadius: '10px', color: '#4B5563' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {userList.data?.data.users.map((user) => (
                                        <TableRow key={user._id}>
                                            <TableCell sx={{ color: '#4B5563' }}>
                                                <Stack direction="row" alignItems="center" gap={1}>
                                                    <Avatar
                                                        src={user.profileImage || nouser}
                                                        alt="User"
                                                    />

                                                    {user.first_name} {user.last_name}

                                                </Stack>
                                            </TableCell>
                                            <TableCell sx={{ color: '#4B5563' }}>

                                                {user.company_name || "-"}

                                            </TableCell>
                                            <TableCell sx={{ color: '#4B5563' }}>

                                                {`${user?.mobile_no_country_code ?? ""}${user?.mobile_no ?? "-"}`}

                                            </TableCell>
                                            <TableCell sx={{ color: '#4B5563' }}>

                                                {user.email || "-"}

                                            </TableCell>

                                            <TableCell >
                                                <Box align="center" sx={{ display: 'flex', flexDirection: 'row' }}>
                                                    <IconButton onClick={() => nav(`/home/total-users/user-information/${user._id}`)}>
                                                        <img src={ViewBtn} alt="view button" />
                                                    </IconButton>
                                                    <IconButton onClick={() => setconfirmation(user._id)}>
                                                        <img src={delBtn} alt="delete button" />
                                                    </IconButton>
                                                    {confirmation === user._id && (
                                                        <DeleteConfirm id={user._id} setconfirmation={setconfirmation} />
                                                    )}
                                                </Box>


                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Pagination */}
                        <Grid
                            container
                            sx={{ px: { xs: 0, sm: 3 } }}
                            justifyContent="space-between"
                            alignItems="center"
                            mt={2}
                        >
                            <Grid >
                                <Typography variant="body2">
                                    Rows per page:&nbsp;
                                    <MuiSelect
                                        size="small"
                                        sx={{
                                            border: "none",
                                            boxShadow: "none",
                                            outline: "none",
                                            "& .MuiOutlinedInput-notchedOutline": {
                                                border: "none",
                                            },
                                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                                border: "none",
                                            },
                                            "& .MuiOutlinedInput-root": {
                                                boxShadow: "none",
                                                outline: "none",
                                            },
                                            "& .MuiSelect-select": {
                                                outline: "none",
                                            },
                                        }}
                                        value={pagination.user.rowsPerPage}
                                        onChange={(e) => {
                                            updatePagination("user", "rowsPerPage", Number(e.target.value));
                                            updatePagination("user", "page", 1); // Reset to first page
                                        }}
                                    >
                                        {[5, 10, 15, 20].map((num) => (
                                            <MenuItem key={num} value={num}>
                                                {num}
                                            </MenuItem>
                                        ))}
                                    </MuiSelect>
                                </Typography>
                            </Grid>

                            <Grid>
                                <Box display="flex" alignItems="center" gap={{ xs: 1, sm: 2 }}>
                                    <Typography variant="body2">
                                        {pagination.user.page} / {totalUserPages || 1}
                                    </Typography>
                                    <IconButton
                                        disabled={pagination.user.page === 1}
                                        onClick={() => updatePagination("user", "page", pagination.user.page - 1)}
                                    >
                                        <NavigateBeforeIcon
                                            fontSize="small"
                                            sx={{
                                                color: pagination.user.page === 1 ? "#BDBDBD" : "#1976d2",
                                            }}
                                        />
                                    </IconButton>
                                    <IconButton
                                        disabled={pagination.user.page === totalUserPages}
                                        onClick={() => updatePagination("user", "page", pagination.user.page + 1)}
                                    >
                                        <NavigateNextIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            </Grid>
                        </Grid>

                    </Box>
                ) : (
                    <Typography align="center" color="text.secondary" sx={{ mt: 2 }}>
                        No data found
                    </Typography>
                )}
            </Paper>





            {popup && <ImportSheet setpopup={setpopup} type="driver" />}
        </Box>
    );
};

export default CompanyInformation;
