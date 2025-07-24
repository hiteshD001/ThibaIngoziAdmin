import { useState, useLayoutEffect, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Box,
    Typography,
    TextField,
    Button,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    Grid,
    InputAdornment,
    Stack,
    Select as MuiSelect,
    MenuItem,
    Checkbox,
    FormControlLabel,
    Divider,
} from "@mui/material";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import whiteplus from '../assets/images/whiteplus.svg';
import plus from '../assets/images/plus.svg'
import ViewBtn from '../assets/images/ViewBtn.svg'
import delBtn from '../assets/images/delBtn.svg'
import { useFormik } from "formik";
import Select from "react-select";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

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

import PayoutPopup from "../common/Popup";
import Loader from "../common/Loader";
import Analytics from "../common/Analytics";
import { DeleteConfirm } from "../common/ConfirmationPOPup";
import ImportSheet from "../common/ImportSheet";
import { toastOption } from "../common/ToastOptions";

import search from "../assets/images/search.svg";
import nouser from "../assets/images/NoUser.png";

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

    const companyInfo = useGetUser(params.id);
    const driverList = useGetUserList(
        "driver list",
        "driver",
        params.id,
        page,
        rowsPerPage,
        filter
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
    }, [companyInfo.data?.data?.user]);

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

    return (
        <Box p={2}>
            {/* Company Info (when params.id is present) */}
            {params.id && (
                <Paper
                    elevation={3}
                    sx={{ backgroundColor: "rgb(253, 253, 253)", p: 2, borderRadius: "10px", mb: 2 }}
                >
                    <Typography variant="h6" fontWeight={600} mb={2}>
                        Company Information
                    </Typography>

                    <Grid container spacing={2}>
                        {/* Company Name */}
                        <Grid item xs={12} md={4}>
                            <Typography variant="body2" color="text.secondary">
                                Company
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
                                <Typography>{companyInfo.data?.data.user.company_name}</Typography>
                            )}
                        </Grid>

                        {/* Contact No */}
                        <Grid item xs={12} md={4}>
                            <Typography variant="body2" color="text.secondary">
                                Contact No.
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
                                <Typography>{companyInfo.data?.data.user.mobile_no}</Typography>
                            )}
                        </Grid>

                        {/* Contact Email */}
                        <Grid item xs={12} md={4}>
                            <Typography variant="body2" color="text.secondary">
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
                        <Grid item xs={12} md={4}>
                            <Typography variant="body2" color="text.secondary">
                                Total Used Google APIs
                            </Typography>
                            <Typography>{companyInfo.data?.data.totalGoogleMapApi}</Typography>
                        </Grid>

                        {/* Toggles */}
                        <Grid item xs={12} md={8} sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={CompanyForm.values.isArmed}
                                        onChange={(e) => CompanyForm.setFieldValue("isArmed", e.target.checked)}
                                        disabled={!edit}
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
                                        disabled={!edit}
                                    />
                                }
                                label="Pay subscription"
                            />
                        </Grid>
                    </Grid>

                    {/* Company Services */}
                    {edit ? (
                        <Box mt={3}>
                            <Typography variant="h6" fontWeight={600} mb={1}>
                                Company Services
                            </Typography>
                            <Select
                                isMulti
                                name="services"
                                options={GrpservicesList}
                                classNamePrefix="select"
                                placeholder="Select Services"
                                className="form-control"
                                value={GrpservicesList.flatMap((group) => group.options).filter((option) =>
                                    CompanyForm.values.services?.includes(option.value)
                                )}
                                onChange={(selectedOptions) => {
                                    const selectedValues = selectedOptions?.map((option) => option.value) || [];
                                    CompanyForm.setFieldValue("services", selectedValues);
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
                                        flexWrap: "wrap",
                                        maxHeight: "50px",
                                        overflowY: "auto",
                                    }),
                                    multiValue: (base) => ({
                                        ...base,
                                        margin: "2px",
                                    }),
                                    menu: (base) => ({
                                        ...base,
                                        zIndex: 9999,
                                    }),
                                }}
                            />
                        </Box>
                    ) : (
                        servicesList.length > 0 && (
                            <Box mt={3}>
                                <Typography variant="h6" fontWeight={600} mb={1}>
                                    Company Services
                                </Typography>
                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                                    {servicesList.map((group, index) => (
                                        <Box key={index}>
                                            {group.options.map((service, idx) => (
                                                <Typography key={`${index}-${idx}`} variant="body2">
                                                    {service.label}
                                                </Typography>
                                            ))}
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        )
                    )}

                    {/* Security Companies */}
                    {edit ? (
                        <Box mt={3}>
                            <Typography variant="h6" fontWeight={600} mb={1}>
                                Security Companies
                            </Typography>
                            <Select
                                isMulti
                                name="securityCompany"
                                options={securityCompanyOptions}
                                isDisabled={CompanyForm.values.isArmed}
                                classNamePrefix="select"
                                placeholder="Select Security Companies"
                                className="form-control"
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
                                        flexWrap: "wrap",
                                        maxHeight: "50px",
                                        overflowY: "auto",
                                    }),
                                    multiValue: (base) => ({
                                        ...base,
                                        margin: "2px",
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
                                <Typography variant="h6" fontWeight={600} mb={1}>
                                    Security Companies
                                </Typography>
                                {(CompanyForm.values.isArmed !== true) && (
                                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                                        {securityCompanyOptions
                                            .filter((opt) => CompanyForm.values.securityCompany.includes(opt.value))
                                            .map((company, index) => (
                                                <Typography key={index} variant="body2">
                                                    {company.label}
                                                </Typography>
                                            ))}
                                    </Box>
                                )}
                            </Box>
                        )
                    )}

                    {/* Payout Section */}
                    <Box mt={3}>
                        <Typography variant="h6" fontWeight={600} mb={1}>
                            Company Payout
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Box
                                    sx={{
                                        p: 2,
                                        borderRadius: 1,
                                        bgcolor: "#fff",
                                        border: "1px solid #eee",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Total Company Amount:
                                        </Typography>
                                        <Typography>{companyInfo.data?.data.totalCompanyAmount}</Typography>
                                    </Box>
                                    <Button
                                        disabled={edit}
                                        variant="contained"
                                        onClick={(event) => handlePopup(event, "payout", "company")}
                                    >
                                        Pay
                                    </Button>
                                </Box>
                                {renderPopup()}
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Box
                                    sx={{
                                        p: 2,
                                        borderRadius: 1,
                                        bgcolor: "#fff",
                                        border: "1px solid #eee",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Total Driver Amount:
                                        </Typography>
                                        <Typography>{companyInfo.data?.data.totalDriverAmount}</Typography>
                                    </Box>
                                    <Button
                                        disabled={edit}
                                        variant="contained"
                                        onClick={(event) => handlePopup(event, "payout", "driver")}
                                    >
                                        Pay
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>

                    {/* Save / Edit */}
                    <Box mt={3} textAlign="right">
                        {edit ? (
                            <Button variant="contained" color="primary" onClick={() => CompanyForm.submitForm()}>
                                Save
                            </Button>
                        ) : (
                            <Button variant="contained" color="primary" onClick={() => setedit(true)}>
                                Edit
                            </Button>
                        )}
                    </Box>
                </Paper>
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

                {/* Table / Loader / Empty */}
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
                                        value={rowsPerPage}
                                        onChange={(e) => {
                                            setRowsPerPage(Number(e.target.value));
                                            setpage(1);
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

export default ListOfDrivers;
