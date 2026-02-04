import { useState, useLayoutEffect, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Typography, TextField, Button, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, Grid, InputAdornment, Stack, Select as MuiSelect, MenuItem, Checkbox, FormControlLabel, Divider, FormGroup, FormControl, InputLabel, Tooltip, TableSortLabel } from "@mui/material";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import HotspotSection from "../common/HotspotSection";
import payIcon from '../assets/images/payIcon.svg';
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import whiteplus from '../assets/images/whiteplus.svg';
import plus from '../assets/images/plus.svg'
import CompanyAnalytics from '../assets/images/CompanyAnalytics.svg'
import CompanyAnalytics2 from '../assets/images/CompanyAnalytics2.svg'
import CompanyAnalytics3 from '../assets/images/CompanyAnalytics3.svg'
import CompanyAnalytics4 from '../assets/images/CompanyAnalytics4.svg'
import { useRef } from "react";
import { startOfYear } from "date-fns";
import ViewBtn from '../assets/images/ViewBtn.svg'
import delBtn from '../assets/images/delBtn.svg'
import { useFormik } from "formik";
import moment from "moment/moment";
import { format } from "date-fns";
import Select from "react-select";
import checkedboxIcon from '../assets/images/checkboxIcon.svg'
import uncheckedIcon from '../assets/images/UnChecked.svg'
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { components } from 'react-select';
import {
    companyEditValidation,
    companyValidation,
} from "../common/FormValidation";
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

    useGetNotificationType,
    useGetCountryList,
    useGetProvinceList,
    useGetCityList,
    useGetBanksList
} from "../API Calls/API";
import CustomSelect from "../common/Custom/CustomSelect";
import { BootstrapInput } from "../common/BootstrapInput";
import PhoneInput from "react-phone-input-2";
import GrayPlus from '../assets/images/GrayPlus.svg';
import CustomChart from "../common/CustomChart";
import PayoutPopup from "../common/Popup";
import Loader from "../common/Loader";
import Analytics from "../common/Analytics";
import { DeleteConfirm } from "../common/ConfirmationPOPup";
import ImportSheet from "../common/ImportSheet";
import { toastOption } from "../common/ToastOptions";

import search from "../assets/images/search.svg";
import nouser from "../assets/images/NoUser.png";

import arrowup from '../assets/images/arrowup.svg';
import arrowdown from '../assets/images/arrowdown.svg';
import arrownuteral from '../assets/images/arrownuteral.svg';

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

    // Sort 1
    const [sortBy, setSortBy] = useState("first_name");
    const [sortOrder, setSortOrder] = useState("desc");

    const [sortBy2, setSortBy2] = useState("first_name");
    const [sortOrder2, setSortOrder2] = useState("asc");

    const [sortBy3, setSortBy3] = useState("first_name");
    const [sortOrder3, setSortOrder3] = useState("asc");

    // Default date range for SOS data - last 30 days


    const [range, setRange] = useState([
        {
            startDate: startOfYear(new Date()),
            endDate: new Date(),
            key: 'selection'
        }
    ]);
    const startDate = range[0].startDate.toISOString();
    const endDate = range[0].endDate.toISOString();
    const changeSortOrder = (e) => {
        const field = e.target.id;
        if (field !== sortBy) {
            setSortBy(field);
            setSortOrder("asc");
        } else {
            setSortOrder(p => p === 'asc' ? 'desc' : 'asc')
        }
    }

    const changeSortOrder2 = (e) => {
        const field = e.target.id;
        if (field !== sortBy2) {
            setSortBy2(field);
            setSortOrder2("asc");
        } else {
            setSortOrder2(p => p === 'asc' ? 'desc' : 'asc')
        }
    }

    const changeSortOrder3 = (e) => {
        const field = e.target.id;
        if (field !== sortBy3) {
            setSortBy3(field);
            setSortOrder3("asc");
        } else {
            setSortOrder3(p => p === 'asc' ? 'desc' : 'asc')
        }
    }


    // react queries
    const companyInfo = useGetUser(params.id);
    const company_id = params.id
    const { data: recentSos, isFetching, refetch } = useGetRecentSOS(pagination.recentSos.page, pagination.recentSos.rowsPerPage, startDate, endDate, "", "", sortBy, sortOrder, company_id);
    const driverList = useGetUserList("driver list", "driver", params.id, pagination.driver.page, pagination.driver.rowsPerPage, filter, "", "", "", sortBy2, sortOrder2);
    const userList = useGetUserList("user list", "passanger", params.id, pagination.user.page, pagination.user.rowsPerPage, filter, "", "", "", sortBy3, sortOrder3);
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
            mobile_no_country_code: "+27",
            email: "",
            isArmed: "",
            isPaymentToken: "",
            services: [],
            securityCompany: [],
            isEnrollToken: "",
            contact_name: "",
            company_bio: "",
            id_no: "",
            street: "",
            province: "",
            city: "",
            suburb: "",
            postal_code: "",
            country: "",
            accountHolderName: "",
            customerCode: "",
            accountType: "",
            bankId: "",
            accountNumber: "",
            selfieImage: "",
            fullImage: "",
        },
        validationSchema: companyEditValidation,
        onSubmit: (values) => {
            setedit(false);
            const formData = new FormData();
            Object.entries(values).forEach(([key, value]) => {
                if (key === "services") {
                    if (value && value.length > 0) {
                        value.forEach((id) => formData.append("companyService[]", id));
                    }
                } else if (key === "securityCompany") {
                    if (value && value.length > 0) {
                        value.forEach((id) => formData.append("securityCompany[]", id));
                    }
                } else if (key === "selfieImage") {
                    if (value instanceof File) {
                        formData.append("selfieImage", value);
                    }
                } else if (key === "fullImage") {
                    if (value instanceof File) {
                        formData.append("fullImage", value);
                    }
                } else if (key === 'accountHolderName') {
                    formData.append("account_holder_name", values[key]);
                } else if (key === 'customerCode') {
                    formData.append("branch_code", values[key]);
                } else if (key === 'accountType') {
                    formData.append("account_type", values[key]);
                } else {
                    formData.append(key, value);
                }
            });
            mutate({ id: params.id, data: formData });
        },
    });

    const provincelist = useGetProvinceList(CompanyForm.values.country)
    const cityList = useGetCityList(CompanyForm.values.province)
    const countrylist = useGetCountryList()
    const bankList = useGetBanksList();

    useEffect(() => {
        if (companyInfo.data) {
            setIsArmedLocal(companyInfo.data?.data?.user?.isArmed);
        }
    }, [companyInfo.data]);

    // set company values
    useEffect(() => {
        const user = companyInfo.data?.data?.user;
        if (user) {
            console.log("user", user)
            CompanyForm.setValues({
                company_name: user.company_name || "",
                mobile_no: String(user.mobile_no || ""),
                contact_name: user.contact_name || "",
                email: user.email || "",
                isArmed: user.isArmed || false,
                isPaymentToken: user.isPaymentToken || false,
                isEnrollToken: user.isEnrollToken || false,
                company_bio: user.company_bio || "",
                id_no: user.id_no || "",
                street: user.street || "",
                suburb: user.suburb || "",
                postal_code: user.postal_code || "",
                country: user.country?._id || user.country || "",
                province: user.province?._id || user.province || "",
                city: user.city?._id || user.city || "",
                accountHolderName: user.account_holder_name || "",
                customerCode: user.branch_code || "",
                accountType: user.account_type || "",
                bankId: user.bankId?._id || user.bankId || "",
                accountNumber: user.accountNumber || "",
                selfieImage: user?.selfieImage || "",
                fullImage: user?.fullImage || "",
                services:
                    user.services?.filter((s) => s.serviceId?.isService).map((s) => s.serviceId?._id) ||
                    [],
                securityCompany:
                    user.securityCompany?.map((item) => item.securityCompanyId?._id) || [],
            });

            const filteredServices = user.services?.filter((s) => s.serviceId?.isService);
            const grouped = filteredServices?.reduce((acc, s) => {
                const type = s.serviceId.type;
                if (!acc[type]) acc[type] = [];
                acc[type].push({
                    label: s.serviceId.type,
                    value: s.serviceId?._id,
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
        value: item?._id,
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
                        value: service?._id,
                        color: service.bgColor,
                        icon: service.icon
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
                    user_id: companyInfo.data.data.user?._id,
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
    const handleAddUser = () => {
        if (role === "company" && params.id) {
            nav("/home/total-users/add-user", { state: { companyId: params.id } });
        } else {
            nav("/home/total-users/add-user");
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
                                    error={CompanyForm.touched.company_name && Boolean(CompanyForm.errors.company_name)}
                                    helperText={CompanyForm.touched.company_name && CompanyForm.errors.company_name}
                                />
                            ) : (
                                <Typography >{companyInfo.data?.data.user.company_name}</Typography>
                            )}
                        </Grid>

                        {/* Contact Name */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Typography sx={{ pb: 1 }} variant="body1" color="text.secondary">
                                Contact Name
                            </Typography>
                            {edit ? (
                                <TextField
                                    fullWidth
                                    size="small"
                                    name="contact_name"
                                    placeholder="Contact Name"
                                    value={CompanyForm.values.contact_name}
                                    onChange={CompanyForm.handleChange}
                                    error={CompanyForm.touched.contact_name && Boolean(CompanyForm.errors.contact_name)}
                                    helperText={CompanyForm.touched.contact_name && CompanyForm.errors.contact_name}
                                />
                            ) : (
                                <Typography >{companyInfo.data?.data.user.contact_name || "-"}</Typography>
                            )}
                        </Grid>

                        {/* Reg No */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Typography sx={{ pb: 1 }} variant="body1" color="text.secondary">
                                Company Reg No.
                            </Typography>
                            {edit ? (
                                <TextField
                                    fullWidth
                                    size="small"
                                    name="company_bio"
                                    placeholder="Company Reg No."
                                    value={CompanyForm.values.company_bio}
                                    onChange={CompanyForm.handleChange}
                                    error={CompanyForm.touched.company_bio && Boolean(CompanyForm.errors.company_bio)}
                                    helperText={CompanyForm.touched.company_bio && CompanyForm.errors.company_bio}
                                />
                            ) : (
                                <Typography >{companyInfo.data?.data.user.company_bio || "-"}</Typography>
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
                                    error={CompanyForm.touched.email && Boolean(CompanyForm.errors.email)}
                                    helperText={CompanyForm.touched.email && CompanyForm.errors.email}
                                />
                            ) : (
                                <Typography>{companyInfo.data?.data.user.email}</Typography>
                            )}
                        </Grid>

                        {/* Contact No */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Typography sx={{ pb: 1 }} variant="body1" color="text.secondary">
                                Contact Number
                            </Typography>
                            {edit ? (
                                // Use PhoneInput logic if preferred or simple TextField as placeholder
                                <Box>
                                    <PhoneInput
                                        country="za"
                                        value={String(CompanyForm.values.mobile_no || "")}
                                        onChange={(value, countryData) => {
                                            CompanyForm.setFieldValue("mobile_no", value);
                                            CompanyForm.setFieldValue("mobile_no_country_code", `+${countryData.dialCode}`);
                                        }}
                                        inputStyle={{
                                            width: '100%',
                                            height: '40px', // Match size='small' height
                                            borderRadius: '4px',
                                            border: '1px solid #c4c4c4',
                                            fontSize: '16px',
                                            paddingLeft: '48px',
                                            background: '#fff',
                                        }}
                                        buttonStyle={{
                                            borderRadius: '4px 0 0 4px',
                                            border: '1px solid #c4c4c4',
                                            background: '#fff'
                                        }}
                                        containerStyle={{
                                            height: '40px',
                                            width: '100%',
                                        }}
                                    />
                                    {CompanyForm.touched.mobile_no && CompanyForm.errors.mobile_no && (
                                        <Typography color="error" variant="caption" display="block" sx={{ mt: 0.5 }}>
                                            {CompanyForm.errors.mobile_no}
                                        </Typography>
                                    )}
                                </Box>
                            ) : (
                                <Typography >{companyInfo.data?.data.user.mobile_no}</Typography>
                            )}
                        </Grid>

                        {/* ID No */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Typography sx={{ pb: 1 }} variant="body1" color="text.secondary">
                                ID/Passport Number
                            </Typography>
                            {edit ? (
                                <TextField
                                    fullWidth
                                    size="small"
                                    name="id_no"
                                    placeholder="ID/Passport Number"
                                    value={CompanyForm.values.id_no}
                                    onChange={CompanyForm.handleChange}
                                    error={CompanyForm.touched.id_no && Boolean(CompanyForm.errors.id_no)}
                                    helperText={CompanyForm.touched.id_no && CompanyForm.errors.id_no}
                                />
                            ) : (
                                <Typography >{companyInfo.data?.data.user.id_no || "-"}</Typography>
                            )}
                        </Grid>

                        {/* Images Section (Only in Edit mode or if existing) */}
                        <Grid size={12}>
                            <Grid container gap={4} sx={{ mt: 1 }}>
                                <Grid size={{ xs: 12, sm: 2.5 }}>
                                    <label style={{ marginBottom: '10px', display: 'block', fontWeight: 500, color: 'rgba(0, 0, 0, 0.6)' }}>Selfie Image</label>
                                    {edit ? (
                                        <Box
                                            sx={{
                                                border: '2px dashed #E0E3E7',
                                                borderRadius: '12px',
                                                minHeight: 180,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                position: 'relative',
                                                background: '#fafbfc'
                                            }}
                                            component="label"
                                        >
                                            <input
                                                type="file"
                                                accept="image/*"
                                                hidden
                                                name="selfieImage"
                                                onChange={e => CompanyForm.setFieldValue('selfieImage', e.currentTarget.files[0])}
                                            />
                                            {CompanyForm.values.selfieImage instanceof File ? (
                                                <img
                                                    src={URL.createObjectURL(CompanyForm.values.selfieImage)}
                                                    alt="Selfie Preview"
                                                    style={{ height: 200, width: '100%', objectFit: 'contain', marginBottom: 8 }}
                                                />
                                            ) : CompanyForm.values.selfieImage ? (
                                                <img
                                                    src={CompanyForm.values.selfieImage}
                                                    alt="Selfie"
                                                    style={{ height: 200, width: '100%', objectFit: 'contain', marginBottom: 8 }}
                                                />
                                            ) : (<><img src={GrayPlus} alt="gray plus" />
                                                <Typography sx={{ color: '#B0B0B0', fontWeight: 550, mt: 1 }}>Upload</Typography></>
                                            )}
                                        </Box>
                                    ) : (
                                        CompanyForm.values.selfieImage ? (
                                            <img
                                                src={CompanyForm.values.selfieImage}
                                                alt="Selfie"
                                                style={{ height: 180, width: '100%', objectFit: 'contain', borderRadius: '12px', border: '1px solid #E0E3E7' }}
                                            />
                                        ) : <Typography>-</Typography>
                                    )}
                                </Grid>
                                <Grid size={{ xs: 12, sm: 2.5 }}>
                                    <label style={{ marginBottom: '10px', display: 'block', fontWeight: 500, color: 'rgba(0, 0, 0, 0.6)' }}>Full Image</label>
                                    {edit ? (
                                        <Box
                                            sx={{
                                                border: '2px dashed #E0E3E7',
                                                borderRadius: '12px',
                                                minHeight: 180,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                position: 'relative',
                                                background: '#fafbfc'
                                            }}
                                            component="label"
                                        >
                                            <input
                                                type="file"
                                                accept="image/*"
                                                hidden
                                                name="fullImage"
                                                onChange={e => CompanyForm.setFieldValue('fullImage', e.currentTarget.files[0])}
                                            />

                                            {CompanyForm.values.fullImage instanceof File ? (
                                                <img
                                                    src={URL.createObjectURL(CompanyForm.values.fullImage)}
                                                    alt="Full Preview"
                                                    style={{ height: 200, width: '100%', objectFit: 'contain', marginBottom: 8 }}
                                                />
                                            ) : CompanyForm.values.fullImage ? (
                                                <img
                                                    src={CompanyForm.values.fullImage}
                                                    alt="Full Image"
                                                    style={{ height: 200, width: '100%', objectFit: 'contain', marginBottom: 8 }}
                                                />
                                            ) : (<><img src={GrayPlus} alt="gray plus" />
                                                <Typography sx={{ color: '#B0B0B0', fontWeight: 550, mt: 1 }}>Upload</Typography></>
                                            )
                                            }
                                        </Box>
                                    ) : (
                                        CompanyForm.values.fullImage ? (
                                            <img
                                                src={CompanyForm.values.fullImage}
                                                alt="Full"
                                                style={{ height: 180, width: '100%', objectFit: 'contain', borderRadius: '12px', border: '1px solid #E0E3E7' }}
                                            />
                                        ) : <Typography>-</Typography>
                                    )}
                                </Grid>
                            </Grid>
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
                                    {CompanyForm.touched.securityCompany && CompanyForm.errors.securityCompany && (
                                        <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                                            {typeof CompanyForm.errors.securityCompany === 'string' ? CompanyForm.errors.securityCompany : 'Security Company is required'}
                                        </Typography>
                                    )}
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
                        {!edit && (
                            <Button variant="contained" sx={{ width: 120, height: 45, borderRadius: '10px', backgroundColor: 'var(--Blue)' }} onClick={() => setedit(true)}>
                                Edit
                            </Button>
                        )}
                    </Box>
                </Paper>

                {/* Address Section */}
                <Paper elevation={3} sx={{ backgroundColor: "rgb(253, 253, 253)", p: 3, borderRadius: "10px", mb: 2 }}>
                    <Grid container spacing={2}>
                        <Grid size={12}>
                            <Typography variant="h6" fontWeight={550} mb={1}>
                                Address
                            </Typography>
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
                                <Typography>{companyInfo.data?.data.user.country?.country_name || companyInfo.data?.data.user.country || "-"}</Typography>
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
                                <Typography>{companyInfo.data?.data.user.province?.province_name || companyInfo.data?.data.user.province || "-"}</Typography>
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
                                <Typography>{companyInfo.data?.data.user.city?.city_name || companyInfo.data?.data.user.city || "-"}</Typography>
                            )}
                        </Grid>

                        {/* Suburb */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography sx={{ pb: 1 }} variant="body1" color="text.secondary">Suburb</Typography>
                            {edit ? (
                                <Box>
                                    <BootstrapInput
                                        id="suburb"
                                        name="suburb"
                                        placeholder="Enter Suburb"
                                        value={CompanyForm.values.suburb}
                                        onChange={CompanyForm.handleChange}
                                        error={CompanyForm.touched.suburb && Boolean(CompanyForm.errors.suburb)}
                                    />
                                    {CompanyForm.touched.suburb && CompanyForm.errors.suburb && (
                                        <Typography color="error" variant="caption" display="block" sx={{ mt: 0.5 }}>{CompanyForm.errors.suburb}</Typography>
                                    )}
                                </Box>
                            ) : (
                                <Typography>{companyInfo.data?.data.user.suburb || "-"}</Typography>
                            )}
                        </Grid>

                        {/* Street */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography sx={{ pb: 1 }} variant="body1" color="text.secondary">Street</Typography>
                            {edit ? (
                                <Box>
                                    <BootstrapInput
                                        id="street"
                                        name="street"
                                        placeholder="Street"
                                        value={CompanyForm.values.street}
                                        onChange={CompanyForm.handleChange}
                                        error={CompanyForm.touched.street && Boolean(CompanyForm.errors.street)}
                                    />
                                    {CompanyForm.touched.street && CompanyForm.errors.street && (
                                        <Typography color="error" variant="caption" display="block" sx={{ mt: 0.5 }}>{CompanyForm.errors.street}</Typography>
                                    )}
                                </Box>
                            ) : (
                                <Typography>{companyInfo.data?.data.user.street || "-"}</Typography>
                            )}
                        </Grid>

                        {/* Postal Code */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography sx={{ pb: 1 }} variant="body1" color="text.secondary">Postal Code</Typography>
                            {edit ? (
                                <Box>
                                    <BootstrapInput
                                        id="postal_code"
                                        name="postal_code"
                                        placeholder="Enter Postal Code"
                                        value={CompanyForm.values.postal_code}
                                        onChange={CompanyForm.handleChange}
                                        error={CompanyForm.touched.postal_code && Boolean(CompanyForm.errors.postal_code)}
                                    />
                                    {CompanyForm.touched.postal_code && CompanyForm.errors.postal_code && (
                                        <Typography color="error" variant="caption" display="block" sx={{ mt: 0.5 }}>{CompanyForm.errors.postal_code}</Typography>
                                    )}
                                </Box>
                            ) : (
                                <Typography>{companyInfo.data?.data.user.postal_code || "-"}</Typography>
                            )}
                        </Grid>
                    </Grid>
                </Paper>

                {/* Bank Details Section */}
                <Paper elevation={3} sx={{ backgroundColor: "rgb(253, 253, 253)", p: 3, borderRadius: "10px", mb: 2 }}>
                    <Grid container spacing={2}>
                        <Grid size={12}>
                            <Typography variant="h6" fontWeight={550} mb={1}>
                                Bank Details
                            </Typography>
                        </Grid>

                        {/* Account Holder Name */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography sx={{ pb: 1 }} variant="body1" color="text.secondary">Account Holder Name</Typography>
                            {edit ? (
                                <Box>
                                    <BootstrapInput
                                        id="accountHolderName"
                                        name="accountHolderName"
                                        placeholder="Enter Account Holder Name"
                                        value={CompanyForm.values.accountHolderName}
                                        onChange={CompanyForm.handleChange}
                                        error={CompanyForm.touched.accountHolderName && Boolean(CompanyForm.errors.accountHolderName)}
                                    />
                                    {CompanyForm.touched.accountHolderName && CompanyForm.errors.accountHolderName && (
                                        <Typography color="error" variant="caption" display="block" sx={{ mt: 0.5 }}>{CompanyForm.errors.accountHolderName}</Typography>
                                    )}
                                </Box>
                            ) : (
                                <Typography>{companyInfo.data?.data.user.account_holder_name || "-"}</Typography>
                            )}
                        </Grid>

                        {/* Bank */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography sx={{ pb: 1 }} variant="body1" color="text.secondary">Bank Name</Typography>
                            {edit ? (
                                <CustomSelect
                                    name="bankId"
                                    value={CompanyForm.values.bankId}
                                    onChange={(e) => {
                                        const selectedBank = bankList?.find(bank => bank._id === e.target.value);
                                        CompanyForm.setValues({
                                            ...CompanyForm.values,
                                            bankId: e.target.value,
                                            customerCode: selectedBank?.branch_code || ''
                                        });
                                    }}
                                    options={bankList?.map(bank => ({
                                        value: bank._id,
                                        label: bank.bank_name
                                    })) || []}
                                    error={CompanyForm.touched.bankId && Boolean(CompanyForm.errors.bankId)}
                                    helperText={CompanyForm.touched.bankId && CompanyForm.errors.bankId}
                                />
                            ) : (
                                <Typography>{companyInfo.data?.data.user.bankId?.bank_name || "-"}</Typography>
                            )}
                        </Grid>

                        {/* Branch Code */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography sx={{ pb: 1 }} variant="body1" color="text.secondary">Branch Code</Typography>
                            {edit ? (
                                <Box>
                                    <BootstrapInput
                                        id="customerCode"
                                        name="customerCode"
                                        placeholder="Branch Code"
                                        readOnly
                                        value={CompanyForm.values.customerCode}
                                        onChange={CompanyForm.handleChange}
                                        error={CompanyForm.touched.customerCode && Boolean(CompanyForm.errors.customerCode)}
                                    />
                                    {CompanyForm.touched.customerCode && CompanyForm.errors.customerCode && (
                                        <Typography color="error" variant="caption" display="block" sx={{ mt: 0.5 }}>{CompanyForm.errors.customerCode}</Typography>
                                    )}
                                </Box>
                            ) : (
                                <Typography>{companyInfo.data?.data.user.branch_code || "-"}</Typography>
                            )}
                        </Grid>

                        {/* Account Type */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography sx={{ pb: 1 }} variant="body1" color="text.secondary">Account Type</Typography>
                            {edit ? (
                                <Box>
                                    <BootstrapInput
                                        id="accountType"
                                        name="accountType"
                                        placeholder="Enter Account Type"
                                        value={CompanyForm.values.accountType}
                                        onChange={CompanyForm.handleChange}
                                        error={CompanyForm.touched.accountType && Boolean(CompanyForm.errors.accountType)}
                                    />
                                    {CompanyForm.touched.accountType && CompanyForm.errors.accountType && (
                                        <Typography color="error" variant="caption" display="block" sx={{ mt: 0.5 }}>{CompanyForm.errors.accountType}</Typography>
                                    )}
                                </Box>
                            ) : (
                                <Typography>{companyInfo.data?.data.user.account_type || "-"}</Typography>
                            )}
                        </Grid>

                        {/* Account Number */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography sx={{ pb: 1 }} variant="body1" color="text.secondary">Account Number</Typography>
                            {edit ? (
                                <Box>
                                    <BootstrapInput
                                        id="accountNumber"
                                        name="accountNumber"
                                        placeholder="Enter Account Number"
                                        value={CompanyForm.values.accountNumber}
                                        onChange={CompanyForm.handleChange}
                                        error={CompanyForm.touched.accountNumber && Boolean(CompanyForm.errors.accountNumber)}
                                    />
                                    {CompanyForm.touched.accountNumber && CompanyForm.errors.accountNumber && (
                                        <Typography color="error" variant="caption" display="block" sx={{ mt: 0.5 }}>{CompanyForm.errors.accountNumber}</Typography>
                                    )}
                                </Box>
                            ) : (
                                <Typography>{companyInfo.data?.data.user.accountNumber || "-"}</Typography>
                            )}
                        </Grid>

                        {/* Save / Cancel Buttons */}
                        {edit && (
                            <Grid size={12} sx={{ mt: 1 }}>
                                <Box display="flex" justifyContent="flex-end" gap={2}>
                                    <Button variant="outlined" sx={{ width: 130, height: 48, borderRadius: '10px', color: 'black', borderColor: '#E0E3E7' }} onClick={() => setedit(false)}>
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        onClick={CompanyForm.handleSubmit}
                                        sx={{ width: 130, height: 48, borderRadius: '10px', backgroundColor: 'var(--Blue)' }}
                                    >
                                        Save
                                    </Button>
                                </Box>
                            </Grid>
                        )}
                    </Grid>
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
                                                        label={
                                                            <Box display="flex" alignItems="center" gap={1}>
                                                                {/* Circle background around icon */}
                                                                <Box
                                                                    sx={{
                                                                        width: 32,
                                                                        height: 32,
                                                                        borderRadius: "50%",
                                                                        backgroundColor: `${service.color}33`, // 33 = ~20% opacity in hex
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        justifyContent: "center",
                                                                    }}
                                                                >
                                                                    <img
                                                                        src={service.icon}
                                                                        alt={service.label}
                                                                        style={{ width: 15, height: 15 }}
                                                                    />
                                                                </Box>

                                                                {/* Colored text */}
                                                                <span style={{ color: service.color, fontWeight: 500 }}>
                                                                    {service.label}
                                                                </span>
                                                            </Box>

                                                        }
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
                                        <MenuItem key={type?._id} value={type?._id}>
                                            {type.display_title}
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
                <Box sx={{ px: { xs: 0, md: 2 }, pt: { xs: 0, md: 3 }, backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
                    <TableContainer >
                        <Table sx={{ '& .MuiTableCell-root': { fontSize: '15px' } }}>

                            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableRow >
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', borderTopLeftRadius: '10px' }}>
                                        <TableSortLabel
                                            id="first_name"
                                            active={sortBy === 'first_name'}
                                            direction={sortOrder}
                                            onClick={changeSortOrder}
                                            IconComponent={() => <img src={sortBy === 'first_name' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                        >
                                            User
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                        <TableSortLabel
                                            id="company_name"
                                            active={sortBy === 'company_name'}
                                            direction={sortOrder}
                                            onClick={changeSortOrder}
                                            IconComponent={() => <img src={sortBy === 'company_name' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                        >
                                            Company
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                        <TableSortLabel
                                            id="address"
                                            active={sortBy === 'address'}
                                            direction={sortOrder}
                                            onClick={changeSortOrder}
                                            IconComponent={() => <img src={sortBy === 'address' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                        >
                                            Last Active Status
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                        <TableSortLabel
                                            id="req_reach"
                                            active={sortBy === 'req_reach'}
                                            direction={sortOrder}
                                            onClick={changeSortOrder}
                                            IconComponent={() => <img src={sortBy === 'req_reach' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                        >
                                            Request reached
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                        <TableSortLabel
                                            id="req_accept"
                                            active={sortBy === 'req_accept'}
                                            direction={sortOrder}
                                            onClick={changeSortOrder}
                                            IconComponent={() => <img src={sortBy === 'req_accept' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                        >
                                            Request Accepted
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                        <TableSortLabel
                                            id="createdAt"
                                            active={sortBy === 'createdAt'}
                                            direction={sortOrder}
                                            onClick={changeSortOrder}
                                            IconComponent={() => <img src={sortBy === 'createdAt' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                        >
                                            Start Time Stamp
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                        <TableSortLabel
                                            id="updatedAt"
                                            active={sortBy === 'updatedAt'}
                                            direction={sortOrder}
                                            onClick={changeSortOrder}
                                            IconComponent={() => <img src={sortBy === 'updatedAt' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                        >
                                            End Time Stamp
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell align="center" sx={{ backgroundColor: '#F9FAFB', borderTopRightRadius: '10px', color: '#4B5563' }}>Action</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {isFetching ?
                                    <TableRow>
                                        <TableCell sx={{ color: '#4B5563', borderBottom: 'none' }} colSpan={8} align="center">
                                            <Loader />
                                        </TableCell>
                                    </TableRow>
                                    :
                                    (recentSos?.data?.items?.length > 0 ?
                                        recentSos?.data?.items?.map((row) => (
                                            <TableRow key={row?._id}>
                                                <TableCell sx={{ color: '#4B5563' }}>
                                                    <Stack direction="row" alignItems="center" gap={1}>

                                                        <Avatar
                                                            src={
                                                                row?.user
                                                                    ?.selfieImage ||
                                                                nouser
                                                            }
                                                            alt="User"
                                                        />

                                                        {row?.user?.first_name || ''} {row?.user?.last_name || ''}
                                                    </Stack>
                                                </TableCell>
                                                <TableCell sx={{ color: '#4B5563' }}>
                                                    {row?.user?.company_name}
                                                </TableCell>
                                                <TableCell sx={{ color: '#4B5563' }}>

                                                    {row?.address}
                                                </TableCell>
                                                <TableCell sx={{ color: 'var(--orange)' }}>
                                                    {row?.req_reach || "0"}

                                                </TableCell>
                                                <TableCell sx={{ color: '#01C971' }}>
                                                    {row?.req_accept || "0"}

                                                </TableCell>
                                                <TableCell sx={{ color: '#4B5563' }}>
                                                    {format(row?.createdAt, "HH:mm:ss - dd/MM/yyyy")}
                                                </TableCell>
                                                <TableCell sx={{ color: '#4B5563' }}>
                                                    {format(row?.updatedAt, "HH:mm:ss - dd/MM/yyyy")}
                                                </TableCell>

                                                <TableCell >
                                                    <Box align="center" sx={{ display: 'flex', flexDirection: 'row' }}>
                                                        <Tooltip title="View" arrow placement="top">
                                                            <IconButton onClick={() => nav(`/home/total-drivers/driver-information/${row?.user?._id}`)}>
                                                                <img src={ViewBtn} alt="view button" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                        :
                                        <TableRow>
                                            <TableCell sx={{ color: '#4B5563', borderBottom: 'none' }} colSpan={8} align="center">
                                                <Typography justifyContent="start" alignItems="start" color="text.secondary" sx={{ mt: 2 }}>
                                                    No data found
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                            </TableBody>
                        </Table>

                    </TableContainer>
                    {/* Pagination */}
                    {recentSos?.data?.items?.length > 0 && !isFetching && <Grid
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
                                    {[5, 10, 15, 20, 50, 100].map((num) => (
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
                    </Grid>}
                </Box>
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
                                        <TableSortLabel
                                            id="first_name"
                                            active={sortBy2 === 'first_name'}
                                            direction={sortOrder2}
                                            onClick={changeSortOrder2}
                                            IconComponent={() => <img src={sortBy2 === 'first_name' ? sortOrder2 === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                        >
                                            Driver
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: "#F9FAFB", color: "#4B5563", width: '10%' }}>
                                        <TableSortLabel
                                            id="id_no"
                                            active={sortBy2 === 'id_no'}
                                            direction={sortOrder2}
                                            onClick={changeSortOrder2}
                                            IconComponent={() => <img src={sortBy2 === 'id_no' ? sortOrder2 === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                        >
                                            Driver ID
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: "#F9FAFB", color: "#4B5563" }}>
                                        <TableSortLabel
                                            id="company_name"
                                            active={sortBy2 === 'company_name'}
                                            direction={sortOrder2}
                                            onClick={changeSortOrder2}
                                            IconComponent={() => <img src={sortBy2 === 'company_name' ? sortOrder2 === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                        >
                                            Company
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: "#F9FAFB", color: "#4B5563" }}>
                                        <TableSortLabel
                                            id="mobile_no_country_code"
                                            active={sortBy2 === 'mobile_no_country_code'}
                                            direction={sortOrder2}
                                            onClick={changeSortOrder2}
                                            IconComponent={() => <img src={sortBy2 === 'mobile_no_country_code' ? sortOrder2 === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                        >
                                            Contact No.
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: "#F9FAFB", color: "#4B5563" }}>
                                        <TableSortLabel
                                            id="email"
                                            active={sortBy2 === 'email'}
                                            direction={sortOrder2}
                                            onClick={changeSortOrder2}
                                            IconComponent={() => <img src={sortBy2 === 'email' ? sortOrder2 === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                        >
                                            Contact Email
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                        <TableSortLabel
                                            id="subscription_start_date"
                                            active={sortBy2 === 'subscription_start_date'}
                                            direction={sortOrder2}
                                            onClick={changeSortOrder2}
                                            IconComponent={() => <img src={sortBy2 === 'subscription_start_date' ? sortOrder2 === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}

                                        >
                                            Tag Connection
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                        <TableSortLabel
                                            id="subscription_end_date"
                                            active={sortBy2 === 'subscription_end_date'}
                                            direction={sortOrder2}
                                            onClick={changeSortOrder2}
                                            IconComponent={() => <img src={sortBy2 === 'subscription_end_date' ? sortOrder2 === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                        >
                                            Tag Disconnection
                                        </TableSortLabel>
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
                                {driverList.isFetching ?
                                    <TableRow>
                                        <TableCell sx={{ color: '#4B5563', borderBottom: 'none' }} colSpan={8} align="center">
                                            <Loader />
                                        </TableCell>
                                    </TableRow>
                                    : (driverList.data?.data.users?.length > 0 ?
                                        driverList?.data?.data?.users?.map((driver) => (
                                            <TableRow key={driver?._id}>
                                                <TableCell sx={{ color: "#4B5563" }}>
                                                    <Stack direction="row" alignItems="center" gap={1.5}>
                                                        <Avatar
                                                            src={driver.selfieImage || nouser}
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

                                                <TableCell sx={{ color: '#4B5563' }}>
                                                    {driver.tag_connection || "-"}
                                                </TableCell>

                                                <TableCell sx={{ color: '#4B5563' }}>
                                                    {driver.tag_disconnection || "-"}
                                                </TableCell>

                                                <TableCell>
                                                    <Box
                                                        align="center"
                                                        sx={{ display: "flex", flexDirection: "row", gap: 1 }}
                                                    >
                                                        <Tooltip title="View" arrow placement="top">
                                                            <IconButton onClick={() =>
                                                                nav(`/home/total-drivers/driver-information/${driver?._id}`)
                                                            }>
                                                                <img src={ViewBtn} alt="view button" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Delete" arrow placement="top">
                                                            <IconButton onClick={() => setconfirmation(driver?._id)}>
                                                                <img src={delBtn} alt="delete button" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        {confirmation === driver?._id && (
                                                            <DeleteConfirm
                                                                id={driver?._id}
                                                                setconfirmation={setconfirmation}
                                                            />
                                                        )}

                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                        :
                                        <TableRow>
                                            <TableCell sx={{ color: '#4B5563', borderBottom: 'none' }} colSpan={8} align="center">
                                                <Typography align="center" color="text.secondary" sx={{ mt: 2 }}>
                                                    No data found
                                                </Typography>
                                            </TableCell>
                                        </TableRow>)
                                }
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Pagination */}
                    {driverList.data?.data.users?.length > 0 && !driverList.isFetching && <Grid
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
                                    {[5, 10, 15, 20, 50, 100].map((num) => (
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
                    </Grid>}
                </Box>
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
                            <Button variant="contained" onClick={handleAddUser} sx={{ height: '40px', fontSize: '0.8rem', width: '150px', borderRadius: '8px' }}
                                startIcon={<img src={whiteplus} alt='white plus' />}>
                                Add User
                            </Button>


                        </Box>
                    </Grid>
                </Grid>

                {/* Table / Loader / Empty */}
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
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563', borderTopLeftRadius: '10px' }}>
                                        <TableSortLabel
                                            id="first_name"
                                            active={sortBy3 === 'first_name'}
                                            direction={sortOrder3}
                                            onClick={changeSortOrder3}
                                            IconComponent={() => <img src={sortBy3 === 'first_name' ? sortOrder3 === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                        >
                                            User
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                        <TableSortLabel
                                            id="company_name"
                                            active={sortBy3 === 'company_name'}
                                            direction={sortOrder3}
                                            onClick={changeSortOrder3}
                                            IconComponent={() => <img src={sortBy3 === 'company_name' ? sortOrder3 === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                        >
                                            Company
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                        <TableSortLabel
                                            id="mobile_no_country_code"
                                            active={sortBy3 === 'mobile_no_country_code'}
                                            direction={sortOrder3}
                                            onClick={changeSortOrder3}
                                            IconComponent={() => <img src={sortBy3 === 'mobile_no_country_code' ? sortOrder3 === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                        >
                                            Contact No.
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                        <TableSortLabel
                                            id="email"
                                            active={sortBy3 === 'email'}
                                            direction={sortOrder3}
                                            onClick={changeSortOrder3}
                                            IconComponent={() => <img src={sortBy3 === 'email' ? sortOrder3 === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                        >
                                            Contact Email
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell align="center" sx={{ backgroundColor: '#F9FAFB', borderTopRightRadius: '10px', color: '#4B5563' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {userList.isFetching ?
                                    <TableRow>
                                        <TableCell sx={{ color: '#4B5563', borderBottom: 'none' }} colSpan={5} align="center">
                                            <Loader />
                                        </TableCell>
                                    </TableRow>
                                    : (userList.data?.data.users?.length > 0 ?
                                        userList.data?.data.users.map((user) => (
                                            <TableRow key={user?._id}>
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
                                                        <Tooltip title="View" arrow placement="top">
                                                            <IconButton onClick={() => nav(`/home/total-users/user-information/${user?._id}`)}>
                                                                <img src={ViewBtn} alt="view button" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Delete" arrow placement="top">
                                                            <IconButton onClick={() => setconfirmation(user?._id)}>
                                                                <img src={delBtn} alt="delete button" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        {confirmation === user?._id && (
                                                            <DeleteConfirm id={user?._id} setconfirmation={setconfirmation} />
                                                        )}
                                                    </Box>


                                                </TableCell>
                                            </TableRow>
                                        ))
                                        :
                                        <TableRow>
                                            <TableCell sx={{ color: '#4B5563', borderBottom: 'none' }} colSpan={5} align="center">
                                                <Typography align="center" color="text.secondary" sx={{ mt: 2 }}>
                                                    No data found
                                                </Typography>
                                            </TableCell>
                                        </TableRow>)
                                }
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Pagination */}
                    {userList.data?.data.users?.length > 0 && !userList.isFetching && <Grid
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
                                    {[5, 10, 15, 20, 50, 100].map((num) => (
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
                    </Grid>}

                </Box>
            </Paper>





            {popup && <ImportSheet setpopup={setpopup} type="driver" />}
        </Box>
    );
};

export default CompanyInformation;
