import { useState, useLayoutEffect, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Typography, TextField, Button, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, Grid, InputAdornment, Stack, Select as MuiSelect, MenuItem, Checkbox, FormControlLabel, Divider, FormGroup, Tooltip, TableSortLabel, Chip } from "@mui/material";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import payIcon from '../assets/images/payIcon.svg';
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import whiteplus from '../assets/images/whiteplus.svg';
import plus from '../assets/images/plus.svg'
import ViewBtn from '../assets/images/ViewBtn.svg'
import delBtn from '../assets/images/delBtn.svg'
import { useFormik } from "formik";
import Select from "react-select";
import checkedboxIcon from '../assets/images/checkboxIcon.svg'
import uncheckedIcon from '../assets/images/UnChecked.svg'
import CustomDateRangePicker from "../common/Custom/CustomDateRangePicker";
import calender from '../assets/images/calender.svg';
import { useQueryClient } from "@tanstack/react-query";
import jsPDF from 'jspdf';
import { startOfYear } from "date-fns";
import { autoTable } from 'jspdf-autotable'
import * as XLSX from 'xlsx';
import { toast } from "react-toastify";
import { components } from 'react-select';
import driverPaidicon from '../assets/images/driverPaidicon.svg'
import driverPayoutIcon from '../assets/images/driverPayoutIcon.svg'
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
} from "../API Calls/API";
import CustomExportMenu from '../common/Custom/CustomExport'
import PayoutPopup from "../common/Popup";
import Loader from "../common/Loader";
import Analytics from "../common/Analytics";
import { DeleteConfirm } from "../common/ConfirmationPOPup";
import ImportSheet from "../common/ImportSheet";
import { toastOption } from "../common/ToastOptions";
import apiClient from "../API Calls/APIClient";

import search from "../assets/images/search.svg";
import nouser from "../assets/images/NoUser.png";

import arrowup from '../assets/images/arrowup.svg';
import arrowdown from '../assets/images/arrowdown.svg';
import arrownuteral from '../assets/images/arrownuteral.svg';

const ListOfDrivers = () => {
    const [edit, setedit] = useState(false);
    const [isArmedLocal, setIsArmedLocal] = useState(false);
    const [popup, setpopup] = useState(false);
    const client = useQueryClient();
    const nav = useNavigate();
    const params = useParams();
    const [role] = useState(localStorage.getItem("role"));
    const [page, setpage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filter, setfilter] = useState("");
    const [confirmation, setconfirmation] = useState("");
    const [servicesList, setServicesList] = useState([]);
    const [GrpservicesList, setGrpservicesList] = useState([]);
    const [payPopup, setPopup] = useState("");
    const [selectedPayoutType, setSelectedPayoutType] = useState("");
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [range, setRange] = useState([
        {
            startDate: startOfYear(new Date()),
            endDate: new Date(),
            key: 'selection'
        }
    ]);
    const startDate = range[0].startDate.toISOString();
    const endDate = range[0].endDate.toISOString();

    // Sort 1
    const [sortBy, setSortBy] = useState("first_name");
    const [sortOrder, setSortOrder] = useState("asc");

    const changeSortOrder = (e) => {
        const field = e.target.id;
        if (field !== sortBy) {
            setSortBy(field);
            setSortOrder("asc");
        } else {
            setSortOrder(p => p === 'asc' ? 'desc' : 'asc')
        }
    }

    const companyInfo = useGetUser(params.id);
    const driverList = useGetUserList(
        "driver list",
        "driver",
        params.id,
        page,
        rowsPerPage,
        filter,
        "",
        startDate,
        endDate,
        sortBy,
        sortOrder
    );
    const getArmedSOS = useGetArmedSoS();
    const securityList = useGetSecurityList();
    const serviceslist = useGetServicesList();

    const totalDrivers = driverList.data?.data?.totalUsers || 0;
    const totalPages = Math.ceil(totalDrivers / rowsPerPage);

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

    const securityCompanyOptions =
        securityList?.data?.data?.company?.map((item) => ({
            label: item.company_name,
            value: item._id,
        })) || [];

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
                // Use selectedDriver._id if available, otherwise use company user id
                const userId = selectedDriver?._id || companyInfo.data.data.user._id;
                
                payoutUpdateMutation.mutate({
                    user_id: userId,
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
        () => {
            toast.success("payment successful");
            // Invalidate queries to refresh data
            client.invalidateQueries(["driver list"]);
            if (params.id) {
                client.invalidateQueries(["user", params.id]);
            }
        },
        () => {
            toast.error("payment failed");
        }
    );

    const handleChange = () => {
        payoutMutation.mutate(PayoutForm.values);
    };

    const handlePopup = (event, type, payoutType, driverData = null) => {
        event.stopPropagation();
        console.log(driverData,"driverData")
        // If driverData is provided, use individual driver info
        if (driverData) {
            console.log(driverData.bankId?.branchCode,"driverData.bankId?.branchCode")
            PayoutForm.setValues({
                firstName: driverData.first_name || "",
                surname: driverData.last_name || "",
                branchCode: driverData?.branchCode || "",
                accountNumber: driverData.accountNumber || "",
                customerCode: driverData.customerCode || "",
                amount: driverData.driverAmount || 10,
                bankId: driverData.bankId || "",
            });
            setSelectedDriver(driverData);
        } else {
            // Use company-level data
            console.log(companyInfo.data?.data.user.bankId?.branchCode,"companyInfo.data?.data.user.bankId?.branchCode")
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
            setSelectedDriver(null);
        }

        setPopup(type);
        setSelectedPayoutType(payoutType);
    };

    const closePopup = () => {
        setPopup("");
        setSelectedDriver(null);
    };

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


    const handleExport = async ({ startDate, endDate, exportFormat }) => {
        const user = companyInfo.data?.data?.user;
        try {
            const { data } = await apiClient.get(`${import.meta.env.VITE_BASEURL}/users`, {
                params: {
                    role: "driver",
                    page: 1,
                    limit: 10000,
                    filter: "",
                    company_id: params.id,
                    startDate,
                    endDate,
                },
            });

            const allUsers = data?.users || [];
            if (!allUsers.length) {
                toast.warning("No driver data found for this time period.");
                return;
            }
            const exportData = allUsers.map(user => ({
                "Driver": `${user.first_name || ''} ${user.last_name || ''}` || '',
                "Driver ID": user.passport_no || '',
                "Company": user.company_name || '',
                "Contact No.": `${user.mobile_no_country_code || ''}${user.mobile_no || ''}`,
                "Contact Email": user.email || ''
            }));
            const exportedByValue = user.role === 'company' ? user.company_name : 'Super Admin';
            if (exportFormat === "xlsx") {
                const workbook = XLSX.utils.book_new();
            
                // Add "Exported By" row
                const headerRow = [["Exported By", exportedByValue], []]; // blank row after header
            
                // Prepare data with header row
                const worksheetData = [
                    ...headerRow,
                    Object.keys(exportData[0] || {}),
                    ...exportData.map(obj => Object.values(obj))
                ];
            
                const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
            
                // Auto-fit columns
                const columnWidths = Object.keys(exportData[0] || {}).map((key) => ({
                    wch: Math.max(key.length, ...exportData.map((row) => String(row[key] ?? 'NA').length)) + 2
                }));
                worksheet['!cols'] = columnWidths;
            
                XLSX.utils.book_append_sheet(workbook, worksheet, "Drivers");
                XLSX.writeFile(workbook, "Drivers_List.xlsx");
            }
            
            else if (exportFormat === "csv") {            
                // Convert data to CSV
                const headers = Object.keys(exportData[0] || {});
                const csvRows = exportData.map(row =>
                    headers.map(h => JSON.stringify(row[h] ?? '')).join(',')
                );
                const csv = `Exported By,${exportedByValue}\n\n${headers.join(',')}\n${csvRows.join('\n')}`;
            
                // Download file
                const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'Drivers_List.csv';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
            
            else if (exportFormat === "pdf") {
                const doc = new jsPDF();
                // Header
                doc.setFontSize(14);
                doc.text('Driver List', 14, 16);
            
                // Exported By
                doc.setFontSize(10);
                doc.text(`Exported By: ${exportedByValue}`, 14, 24);
            
                // Table
                autoTable(doc, {
                    startY: 30,
                    head: [['Driver', 'Driver ID', 'Company', 'Contact No.', 'Contact Email']],
                    body: allUsers.map(user => [
                        `${user.first_name || ''} ${user.last_name || ''}` || 'NA',
                        user.passport_no || 'NA',
                        user.company_name || 'NA',
                        `${user.mobile_no_country_code || ''}${user.mobile_no || ''}` || 'NA',
                        user.email || 'NA'
                    ]),
                    theme: 'striped',
                    headStyles: { fillColor: [54, 123, 224], textColor: 255 },
                    styles: { fontSize: 10 },
                    margin: { top: 20 },
                });
            
                doc.save("Drivers_List.pdf");
            }
            

        } catch (err) {
            console.error("Error exporting data:", err);
            toast.error("Export failed.");
        }
    };


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
            {/* Company Info (when params.id is present) */}
            {params.id && (
                <Box sx={{}}>
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
                                role !== 'company' && (
                                    <Button variant="contained" sx={{ width: 120, height: 45, borderRadius: '10px', backgroundColor: 'var(--Blue)' }} onClick={() => setedit(true)}>
                                        Edit
                                    </Button>
                                )
                            )}
                        </Box>
                    </Paper>
                    <Grid container gap={{ xs: 0, lg: 4 }} >
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
                                    {GrpservicesList.map((group) => (
                                        <Box key={group.label} mb={2}>
                                            <FormGroup row>
                                                {group.options.map((service) => {
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

            )}

            {/* Analytics */}
            {role === "super_admin" && params.id && <Analytics id={params.id} />}

            {/* Drivers List */}
            <Paper
                elevation={3}
                sx={{ backgroundColor: "rgb(253, 253, 253)", p: 2, borderRadius: "10px" }}
            >
                {/* Header */}
                <Grid container justifyContent="space-between" alignItems="center" mb={2}>
                    <Grid
                        size={{ xs: 12, lg: 2.5 }}
                        sx={{ display: "flex", flexDirection: "row", gap: 2, mb: { xs: 1, md: 0 } }}
                    >
                        <Typography variant="h6" fontWeight={590}>
                            Total Drivers
                        </Typography>
                        <Typography variant="h6" fontWeight={550}>
                            {driverList.isSuccess && driverList.data?.data.totalUsers ? driverList.data?.data.totalUsers : 0}
                        </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, lg: 9.5 }} sx={{ display: 'flex', justifyContent: 'flex-end', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mt: { xs: 2, lg: 0 } }}>
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
                            <CustomDateRangePicker
                                value={range}
                                onChange={setRange}
                                icon={calender}
                            />
                            <CustomExportMenu onExport={handleExport} />
                            <Button variant="outlined" startIcon={<img src={plus} alt="plus icon" />} sx={{ height: '40px', width: '160px', fontSize: '0.8rem', borderRadius: '8px', border: '1px solid var(--Blue)' }} onClick={() => setpopup(true)}>
                                Import Sheet
                            </Button>
                            <Button variant="contained" onClick={handleAddDriver} sx={{ height: '40px', fontSize: '0.8rem', width: '150px', borderRadius: '8px' }}
                                startIcon={<img src={whiteplus} alt='white plus' />}>
                                Add Driver
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
                                    <TableCell sx={{ backgroundColor: "#F9FAFB", borderTopLeftRadius: '10px', color: "#4B5563" }}>
                                        <TableSortLabel
                                            id="first_name"
                                            active={sortBy === 'first_name'}
                                            direction={sortOrder}
                                            onClick={changeSortOrder}
                                            IconComponent={() => <img src={sortBy === 'first_name' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                        >
                                            Driver
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: "#F9FAFB", color: "#4B5563", width: '10%' }}>
                                        <TableSortLabel
                                            id="passport_no"
                                            active={sortBy === 'passport_no'}
                                            direction={sortOrder}
                                            onClick={changeSortOrder}
                                            IconComponent={() => <img src={sortBy === 'passport_no' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                        >
                                            Driver ID
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: "#F9FAFB", color: "#4B5563" }}>
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
                                    <TableCell sx={{ backgroundColor: "#F9FAFB", color: "#4B5563" }}>
                                        <TableSortLabel
                                            id="mobile_no_country_code"
                                            active={sortBy === 'mobile_no_country_code'}
                                            direction={sortOrder}
                                            onClick={changeSortOrder}
                                            IconComponent={() => <img src={sortBy === 'mobile_no_country_code' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                        >
                                            Contact No.
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: "#F9FAFB", color: "#4B5563" }}>
                                        <TableSortLabel
                                            id="email"
                                            active={sortBy === 'email'}
                                            direction={sortOrder}
                                            onClick={changeSortOrder}
                                            IconComponent={() => <img src={sortBy === 'email' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                        >
                                            Contact Email
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                        <TableSortLabel
                                            id="isEnroll"
                                            active={sortBy === 'isEnroll'}
                                            direction={sortOrder}
                                            onClick={changeSortOrder}
                                            IconComponent={() => <img src={sortBy === 'isEnroll' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                        >
                                            Subscription Status
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                        <TableSortLabel
                                            id="subscription_start_date"
                                            active={sortBy === 'subscription_start_date'}
                                            direction={sortOrder}
                                            onClick={changeSortOrder}
                                            IconComponent={() => <img src={sortBy === 'subscription_start_date' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
                                        >
                                            Tag Connection
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#4B5563' }}>
                                        <TableSortLabel
                                            id="subscription_end_date"
                                            active={sortBy === 'subscription_end_date'}
                                            direction={sortOrder}
                                            onClick={changeSortOrder}
                                            IconComponent={() => <img src={sortBy === 'subscription_end_date' ? sortOrder === 'asc' ? arrowup : arrowdown : arrownuteral} style={{ marginLeft: 5 }} />}
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
                                            <TableRow key={driver._id}>
                                                <TableCell sx={{ color: "#4B5563" }}>
                                                    <Stack direction="row" alignItems="center" gap={1.5}>
                                                        <Avatar
                                                            src={driver?.selfieImage || nouser}
                                                            alt="driver"
                                                            sx={{ width: 32, height: 32 }}
                                                        />
                                                        {driver.first_name} {driver.last_name}

                                                    </Stack>
                                                </TableCell>

                                                <TableCell sx={{ color: "#4B5563" }}>
                                                    {driver?.passport_no || "-"}
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

                                                <TableCell sx={{ color: "#4B5563" }}>
                                                    <Chip
                                                        label={driver.isEnroll ? "active" : "inactive"}
                                                        sx={{
                                                             backgroundColor: driver?.isEnroll ? '#DCFCE7' : '#E5565A1A',
                                                            '& .MuiChip-label': {
                                                                textTransform: 'capitalize',
                                                                fontWeight: 500,
                                                                color: driver?.isEnroll ? '#15803D' : '#E5565A',
                                                            }
                                                        }}
                                                    />
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
                                                        sx={{ display: "flex", flexDirection: "row", gap: 0 }}
                                                    >
                                                        <Tooltip title="View" arrow placement="top">
                                                            <IconButton onClick={() =>
                                                                nav(`/home/total-drivers/driver-information/${driver._id}`)
                                                            }>
                                                                <img src={ViewBtn} alt="view button" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        {role !== 'company' && (
                                                            <Tooltip title="Delete" arrow placement="top">
                                                                <IconButton onClick={() => setconfirmation(driver._id)}>
                                                                    <img src={delBtn} alt="delete button" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )}  
                                                        <Tooltip title="Payout" arrow placement="top">
                                                            <IconButton onClick={(event) => 
                                                                handlePopup(event, "payout", "driver", driver)
                                                            }>
                                                                <img src={driverPayoutIcon} alt="payout button" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        {confirmation === driver._id && (
                                                            <DeleteConfirm
                                                                id={driver._id}
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
                    {!driverList.isFetching && driverList.data?.data.users?.length > 0 && <Grid
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
                                    value={rowsPerPage}
                                    onChange={(e) => {
                                        setRowsPerPage(Number(e.target.value));
                                        setpage(1);
                                    }}
                                >
                                    {[5, 10, 15, 20,50,100].map((num) => (
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
                                    {page} / {totalPages}
                                </Typography>
                                <IconButton
                                    disabled={page === 1}
                                    onClick={() => setpage((prev) => prev - 1)}
                                >
                                    <NavigateBeforeIcon
                                        fontSize="small"
                                        sx={{
                                            color: page === 1 ? "#BDBDBD" : "#1976d2",
                                        }}
                                    />
                                </IconButton>
                                <IconButton
                                    disabled={page === totalPages}
                                    onClick={() => setpage((prev) => prev + 1)}
                                >
                                    <NavigateNextIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        </Grid>
                    </Grid>}
                </Box>
            </Paper>

            {popup && <ImportSheet setpopup={setpopup} type="driver" />}
            {renderPopup()}
        </Box>
    );
};

export default ListOfDrivers;
