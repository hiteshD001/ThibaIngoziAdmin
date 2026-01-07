import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { useFormik } from "formik"
// import { userValidation } from "../../common/FormValidation"
import { useQueryClient } from "@tanstack/react-query"
import { useSubsById, useUpdateUser } from "../../API Calls/API"
import { toast } from "react-toastify"
import {
    Box, Button, Typography, InputLabel, FormControl, FormHelperText, Grid,
} from "@mui/material";
import { BootstrapInput } from "../../common/BootstrapInput";
import CustomSelect from "../../common/Custom/CustomSelect";
import CustomInput from "../../common/Custom/CustomInput"


const SubscriptionInfo = () => {
    const [editInfo, setEditInfo] = useState(false);
    const params = useParams();
    const client = useQueryClient()

    const userform = useFormik({
        initialValues: {
            firstName: "-",
            lastName: "",
            status: '',
            start_date: "",
            suspensionDate: "",
            method: "",
            total_paid_amount: ""
        },
        // validationSchema: userValidation,
        onSubmit: (values) => {
            mutate({ id: params.id, data: values });
        },
    });


    const UserInfo = useSubsById(params.id)
    const onSuccess = () => {
        toast.success("Subscription Details Updated Successfully.");
        client.invalidateQueries(["subscriptions"], { exact: false })
    }
    const onError = (error) => { toast.error(error.response.data.message || "Something went Wrong", toastOption) }
    const { mutate } = useUpdateUser(onSuccess, onError)

    useEffect(() => {
        const data = UserInfo?.data?.data
        if (data) {
            setuserformvalues({ form: userform, data: UserInfo?.data?.data })
        }
    }, [UserInfo?.data])

    const displayField = (label, value) => (
        <Box mb={3}>
            <Typography sx={{ fontSize: '0.95rem', fontWeight: 450, mb: 1, color: '#878787' }}>{label}</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ ml: 0.5 }}>
                {value || "-"}
            </Typography>
        </Box>
    );
    return (
        <Box sx={{ p: { xs: 0, sm: 2 } }}>

            {/* user information */}
            <Box sx={{ backgroundColor: "rgb(253, 253, 253)", p: 3, borderRadius: '10px', boxShadow: "-3px 4px 23px rgba(0, 0, 0, 0.1)", mb: 3 }}>
                <form>
                    <Grid container spacing={editInfo ? 3 : 1}>
                        <Grid size={12} sx={{
                            borderBottom: "1px solid #E5E7EB",
                            display: "inline-block",
                            paddingBottom: "4px",
                            marginBottom: "20px"
                        }}>
                            <Typography
                                variant="h6"
                                gutterBottom
                                fontWeight={600}

                            >
                                Subscription Details
                            </Typography>
                        </Grid>

                        {/* User Name */}
                        {
                            editInfo ? (
                                <>
                                    <Grid size={{ xs: 12, sm: 6, md: editInfo ? 6 : 4 }}>
                                        <CustomInput
                                            label="First Name"
                                            placeholder="Enter First Name"
                                            name="firstName"
                                            formik={userform}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6, md: editInfo ? 6 : 4 }}>
                                        <CustomInput
                                            label="Last Name"
                                            placeholder="Enter Last Name"
                                            name="lastName"
                                            formik={userform}
                                        />
                                    </Grid>
                                </>
                            ) : (
                                <Grid size={{ xs: 12, sm: 6, md: editInfo ? 6 : 4 }}>
                                    {displayField("User", `${userform.values.firstName} ${userform.values.lastName}` || '-')}
                                </Grid>
                            )
                        }
                        {/* Status */}
                        <Grid size={{ xs: 12, sm: 6, md: editInfo ? 6 : 4 }}>
                            {editInfo ? (
                                <CustomSelect
                                    id="status"
                                    name="status"
                                    label="Status"
                                    value={userform.values.status}
                                    onChange={userform.handleChange}
                                    options={[
                                        { label: "Suspended", value: "Suspended" },
                                        { label: "Active", value: "Active" },
                                        { label: "Expired", value: "Expired" },
                                    ]}
                                    error={userform.errors.status}
                                />
                            ) : displayField("Status", userform.values.status)}
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: editInfo ? 6 : 4 }}>
                            {editInfo ? (
                                <FormControl variant="standard" fullWidth>
                                    <InputLabel shrink htmlFor="start_date" sx={{ fontSize: "1.3rem", fontWeight: 450, color: "rgba(0,0,0,0.8)" }}>
                                        Start Date
                                    </InputLabel>
                                    <BootstrapInput
                                        id="start_date"
                                        name="start_date"
                                        placeholder="Enter Start Date"
                                        value={userform.values.start_date}
                                        onChange={userform.handleChange}
                                    />
                                    {userform.touched.start_date && <FormHelperText error>{userform.errors.start_date}</FormHelperText>}
                                </FormControl>
                            ) : displayField("Start Date", userform.values.start_date)}
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: editInfo ? 6 : 4 }}>
                            {editInfo ? (
                                <FormControl variant="standard" fullWidth>
                                    <InputLabel shrink htmlFor="suspensionDate" sx={{ fontSize: "1.3rem", fontWeight: 450, color: "rgba(0,0,0,0.8)" }}>
                                        Suspension Date
                                    </InputLabel>
                                    <BootstrapInput
                                        id="suspensionDate"
                                        name="suspensionDate"
                                        placeholder="Enter Suspension Date"
                                        value={userform.values.suspensionDate}
                                        onChange={userform.handleChange}

                                    />
                                    {userform.touched.suspensionDate && <FormHelperText error>{userform.errors.suspensionDate}</FormHelperText>}
                                </FormControl>
                            ) : displayField("Suspension Date", userform.values.suspensionDate)}
                        </Grid>


                        {/* Current Balance */}
                        <Grid size={{ xs: 12, sm: 6, md: editInfo ? 6 : 4 }}>
                            {editInfo ? (
                                <FormControl variant="standard" fullWidth>
                                    <InputLabel shrink htmlFor="total_paid_amount" sx={{ fontSize: "1.3rem", fontWeight: 450, color: "rgba(0,0,0,0.8)" }}>
                                        Amount Paid
                                    </InputLabel>
                                    <BootstrapInput
                                        id="total_paid_amount"
                                        name="total_paid_amount"
                                        placeholder="Enter Amount Paid"
                                        value={userform.values.total_paid_amount}
                                        onChange={userform.handleChange}
                                    />
                                    {userform.touched.total_paid_amount && <FormHelperText error>{userform.errors.total_paid_amount}</FormHelperText>}
                                </FormControl>
                            ) : displayField("Amount Paid", userform.values.total_paid_amount)}
                        </Grid>
                        {/*Payment Method */}
                        <Grid size={{ xs: 12, sm: 6, md: editInfo ? 6 : 4 }}>
                            {editInfo ? (
                                <FormControl variant="standard" fullWidth>
                                    <InputLabel shrink htmlFor="method" sx={{ fontSize: "1.3rem", fontWeight: 450, color: "rgba(0,0,0,0.8)" }}>
                                        Payment Method
                                    </InputLabel>
                                    <BootstrapInput
                                        id="method"
                                        name="method"
                                        placeholder="Enter Payment Method"
                                        value={userform.values.method}
                                        onChange={userform.handleChange}
                                    />
                                    {userform.touched.method && <FormHelperText error>{userform.errors.method}</FormHelperText>}
                                </FormControl>
                            ) : displayField("Payment Method", userform.values.method)}
                        </Grid>

                        {/* Action buttons */}
                        <Grid size={12}>
                            <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
                                {editInfo ? (
                                    <>
                                        <Button
                                            variant="outlined"
                                            sx={{ width: 130, height: 48, borderRadius: '8px', color: '#878787', fontSize: '16px', fontWeight: 400, border: '1px solid #D1D5DB' }}
                                            onClick={() => {
                                                setuserformvalues({ form: userform, data: UserInfo.data?.data?.user });
                                                setEditInfo(false);
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="contained"
                                            sx={{ width: 130, height: 48, borderRadius: '8px', color: 'white', backgroundColor: 'var(--Blue)', fontSize: '16px', fontWeight: 400, }}
                                            onClick={() => {
                                                userform.handleSubmit();
                                                setEditInfo(false);
                                            }}
                                        >
                                            Save
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        variant="contained"
                                        sx={{ width: 130, height: 48, borderRadius: "10px", color: 'white', backgroundColor: "var(--Blue)" }}
                                        onClick={() => setEditInfo(true)}
                                    >
                                        Edit
                                    </Button>
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Box>

        </Box>
    )
}

export default SubscriptionInfo

const setuserformvalues = ({ form, data }) => {
    if (!data) return;

    form.setValues({
        user_id: data.user_id,
        firstName: data.User.firstName || "",
        lastName: data.User.lastName || "",
        status: data.status || "",
        start_date: data.start_date || "",
        total_paid_amount: data.total_paid_amount || "",
    });
};