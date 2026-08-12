import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Typography, TextField, Button, Paper,Grid, Select as MuiSelect, Autocomplete,Chip,FormControl,InputLabel } from "@mui/material";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import { familyMemberValidation } from "../../common/FormValidation";
import { useGetRelationshipList, useGetMedicalConditionList, useGetAllergiesList,useGetFamilyMemberDetailId,useEditFamilyMember } from "../../API Calls/API";
import CustomSelect from "../../common/Custom/CustomSelect";
import { BootstrapInput } from "../../common/BootstrapInput";
import GrayPlus from '../../assets/images/GrayPlus.svg';
import ImportSheet from "../../common/ImportSheet";
import { toastOption } from "../../common/ToastOptions";
import { useQueryClient } from "@tanstack/react-query";

const FamilyMemberInformation = () => {
    // useStates
    const [edit, setedit] = useState(false);
    const [popup, setpopup] = useState(false);
    const client = useQueryClient();
    const nav = useNavigate();
    const params = useParams();

    // react queries
    const companyInfo = useGetFamilyMemberDetailId(params.family_member_id);
    const details = companyInfo?.data?.data?.user || {}
    const relationshiplist = useGetRelationshipList();
    const allergiesList = useGetAllergiesList();
    const medicalConditionsList = useGetMedicalConditionList();

    // companyedit
    const CompanyForm = useFormik({
        initialValues: {
            first_name:"",
			last_name:"",
			relationship:"",
			passport_no:"",
			medical_aid_name:"",
			medical_plan:"",
			member_number:"",
			allergies:[],
			medical_conditions:[],
			emergency_contacts: [{
				name: "",
				relationship: "",
				mobile_number: "",
			},]
        },
        validationSchema: familyMemberValidation,
        onSubmit: (values) => {
            setedit(false);
            const formData = new FormData();

            Object.entries(values).forEach(([key, value]) => {
                if (key === "selfieImage" || key === "fullImage") {
                    if (value instanceof File) {
                        formData.append(key, value);
                    }
                } else if (key === "allergies" || key === "medical_conditions" || key === "emergency_contacts") {
                    formData.append(key, JSON.stringify(value));
                } else {
                    formData.append(key, value ?? "");
                }
    });

            mutate({ id: params.family_member_id, data: formData });
        },
    });

    // set company values
    useEffect(() => {
        const user = companyInfo?.data?.data?.user;
        if (user) {
            CompanyForm.setValues({
                first_name:user.first_name || "",
                last_name:user.last_name || "",
                relationship:user.relationship?._id || "",
                passport_no:user.passport_no || "",
                medical_aid_name:user?.medicalAidDetail?.medical_aid_name || "",
                medical_plan:user?.medicalAidDetail?.medical_plan || "",
                member_number:user?.medicalAidDetail?.member_number || "",
                medical_conditions:user?.medicalAidDetail?.medical_conditions?.map((item) => item._id) || [],
                allergies:user?.medicalAidDetail?.allergies?.map((item) => item._id) || [],
                emergency_contacts:user?.medicalAidDetail?.emergency_contacts || [],
                selfieImage: user?.selfieImage || "",
                fullImage: user?.fullImage || "",
            });
        }
    }, [companyInfo?.data?.data?.user, edit]);

    const onSuccess = () => {
        client.invalidateQueries(["family member detail", params.family_member_id]);
        toast.success("Family Member Updated Successfully.");
    };
    const onError = (error) => {
        toast.error(error.response?.data?.message || "Something went Wrong", toastOption);
    };

    const { mutate } = useEditFamilyMember(onSuccess, onError);

    return (
        <Box p={2}>
            <Box>
                <Paper
                    elevation={3}
                    sx={{ backgroundColor: "rgb(253, 253, 253)", p: 3, borderRadius: "10px", mb: 2 }}
                >
                    <Box sx={{ borderBottom: '1px solid var(--light-gray)', mb: 3 }}>
                        <Typography variant="h6" fontWeight={550} mb={1}>
                            Family Member Information
                        </Typography>
                    </Box>

                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Typography sx={{ pb: 1 }} variant="body1" color="text.secondary">
                                First Name
                            </Typography>
                            {edit ? (
                                <TextField
                                    fullWidth
                                    size="small"
                                    name="first_name"
                                    placeholder="First Name"
                                    value={CompanyForm.values.first_name}
                                    onChange={CompanyForm.handleChange}
                                    error={CompanyForm.touched.first_name && Boolean(CompanyForm.errors.first_name)}
                                    helperText={CompanyForm.touched.first_name && CompanyForm.errors.first_name}
                                />
                            ) : (
                                <Typography >{details?.first_name}</Typography>
                            )}
                        </Grid>

                        <Grid size={{ xs: 12, md: 4 }}>
                            <Typography sx={{ pb: 1 }} variant="body1" color="text.secondary">
                                Last Name
                            </Typography>
                            {edit ? (
                                <TextField
                                    fullWidth
                                    size="small"
                                    name="last_name"
                                    placeholder="Last Name"
                                    value={CompanyForm.values.last_name}
                                    onChange={CompanyForm.handleChange}
                                    error={CompanyForm.touched.last_name && Boolean(CompanyForm.errors.last_name)}
                                    helperText={CompanyForm.touched.last_name && CompanyForm.errors.last_name}
                                />
                            ) : (
                                <Typography >{details?.last_name}</Typography>
                            )}
                        </Grid>
                            
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Typography sx={{ pb: 1 }} variant="body1" color="text.secondary">
                                Id/Passport Number
                            </Typography>
                            {edit ? (
                                <TextField
                                    fullWidth
                                    size="small"
                                    name="passport_no"
                                    placeholder="Id/Passport Number"
                                    value={CompanyForm.values.passport_no}
                                    onChange={CompanyForm.handleChange}
                                    error={CompanyForm.touched.passport_no && Boolean(CompanyForm.errors.passport_no)}
                                    helperText={CompanyForm.touched.passport_no && CompanyForm.errors.passport_no}
                                />
                            ) : (
                                <Typography >{details?.passport_no}</Typography>
                            )}
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography sx={{ pb: 1 }} variant="body1" color="text.secondary">Relationship</Typography>
                            {edit ? (
                                <CustomSelect
                                    name="relationship"
                                    value={CompanyForm.values.relationship}
                                    onChange={CompanyForm.handleChange}
                                    options={relationshiplist.data?.data.relationships?.map(obj => ({
                                        value: obj._id,
                                        label: obj.name
                                    })) || []}
                                    error={CompanyForm.touched.relationship && Boolean(CompanyForm.errors.relationship)}
                                    helperText={CompanyForm.touched.relationship && CompanyForm.errors.relationship}
                                />
                            ) : (
                                <Typography >{details?.relationship?.name}</Typography>
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
                                Medical Aid Information
                            </Typography>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Typography sx={{ pb: 1 }} variant="body1" color="text.secondary">Medical Aid Name</Typography>
                            {edit ? (
                                <TextField
                                    fullWidth
                                    size="small"
                                    name="medical_aid_name"
                                    placeholder="Medical Aid Name"
                                    value={CompanyForm.values.medical_aid_name}
                                    onChange={CompanyForm.handleChange}
                                    error={CompanyForm.touched.medical_aid_name && Boolean(CompanyForm.errors.medical_aid_name)}
                                    helperText={CompanyForm.touched.medical_aid_name && CompanyForm.errors.medical_aid_name}
                                />
                            ) : (
                                <Typography>{details?.medicalAidDetail?.medical_aid_name || "-"}</Typography>
                            )}

                        </Grid>

                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Typography sx={{ pb: 1 }} variant="body1" color="text.secondary">Medical Plan</Typography>
                            {edit ? (
                                <TextField
                                    fullWidth
                                    size="small"
                                    name="medical_plan"
                                    placeholder="Medical Plan"
                                    value={CompanyForm.values.medical_plan}
                                    onChange={CompanyForm.handleChange}
                                    error={CompanyForm.touched.medical_plan && Boolean(CompanyForm.errors.medical_plan)}
                                    helperText={CompanyForm.touched.medical_plan && CompanyForm.errors.medical_plan}
                                />
                            ) : (
                                <Typography>{details?.medicalAidDetail?.medical_plan || "-"}</Typography>
                            )}

                        </Grid>

                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Typography sx={{ pb: 1 }} variant="body1" color="text.secondary">Member Number</Typography>
                            {edit ? (
                                <TextField
                                    fullWidth
                                    size="small"
                                    name="member_number"
                                    placeholder="Medical Number"
                                    value={CompanyForm.values.member_number}
                                    onChange={CompanyForm.handleChange}
                                    error={CompanyForm.touched.member_number && Boolean(CompanyForm.errors.member_number)}
                                    helperText={CompanyForm.touched.member_number && CompanyForm.errors.member_number}
                                />
                            ) : (
                                <Typography>{details?.medicalAidDetail?.member_number || "-"}</Typography>
                            )}

                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography variant="body1" fontWeight={500} fontSize={"16px"} mb={1}>
                                Medical Condition
                            </Typography>
                            {edit ? (
                                <Autocomplete
                                    multiple
                                    options={medicalConditionsList?.data?.data}
                                    getOptionLabel={(option) => option.medical_conditions_name}
                                    value={medicalConditionsList?.data?.data.filter((item) =>
                                        (CompanyForm.values.medical_conditions || []).includes(item._id)
                                    ) || []}
                                    onInputChange={(event, newInputValue) => {
                                        // setInputValue(newInputValue);
                                    }}
                                    onChange={(event, newValue) => {
                                        CompanyForm.setFieldValue(
                                            "medical_conditions",
                                            newValue.map((item) => item._id)
                                        );
                                    }}
                                    isOptionEqualToValue={(option, value) => option._id === value._id}
                                    renderTags={(value, getTagProps) =>
                                        value.map((option, index) => {
                                            const { key, ...tagProps } = getTagProps({ index });
    
                                            return (
                                                <Chip
                                                    key={key}
                                                    {...tagProps}
                                                    label={option.medical_conditions_name}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: `color-mix(in srgb, ${option.bgColor} 30%, transparent)`,
                                                        color: option.bgColor,
                                                        height: "28px",
                                                        borderRadius: "16px",
                                                        fontSize: "12px",
                                                        fontWeight: 400,
    
                                                        "& .MuiChip-label": {
                                                            px: "10px",
                                                        },
    
                                                        "& .MuiChip-deleteIcon": {
                                                            fontSize: "17px",
                                                            color: "#A7A7A7",
                                                            marginRight: "4px",
                                                        },
                                                    }}
                                                />
                                            );
                                        })
                                    }
    
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            placeholder={
                                                CompanyForm.values.medical_conditions?.length
                                                    ? ""
                                                    : "Search & Select Medical Condition"
                                            }
                                            error={
                                                CompanyForm.touched.medical_conditions &&
                                                Boolean(CompanyForm.errors.medical_conditions)
                                            }
                                            helperText={
                                                CompanyForm.touched.medical_conditions
                                                    ? CompanyForm.errors.medical_conditions
                                                    : ""
                                            }
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    minHeight: "45px",
                                                    height: "auto",
                                                    padding: "5px 40px 5px 8px !important",
                                                    alignItems: "center",
    
                                                    "& fieldset": {
                                                        borderColor: "#E0E3E7",
                                                    },
    
                                                    "&:hover fieldset": {
                                                        borderColor: "#1976d2",
                                                    },
    
                                                    "&.Mui-focused fieldset": {
                                                        borderColor: "#1976d2",
                                                        borderWidth: "1.5px",
                                                    },
                                                },
    
                                                "& .MuiAutocomplete-input": {
                                                    padding: "6px 4px !important",
                                                    fontSize: "14px",
                                                },
    
                                                "& .MuiAutocomplete-tag": {
                                                    margin: "2px 4px 2px 0",
                                                },
                                            }}
                                        />
                                    )}
                                    fullWidth
                                />
                            ) : (
                                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                                    {(medicalConditionsList?.data?.data || [])
                                        .filter((item) =>
                                            (CompanyForm.values.medical_conditions || []).includes(
                                                item._id
                                            )
                                        )
                                        .map((option) => (
                                            <Chip
                                                key={option._id}
                                                label={option.medical_conditions_name}
                                                size="small"
                                                sx={{
                                                    backgroundColor: `color-mix(in srgb, ${option.bgColor} 30%, transparent)`,
                                                    color: option.bgColor,
                                                    height: "28px",
                                                    borderRadius: "16px",
                                                    fontSize: "12px",
                                                    fontWeight: 400,

                                                    "& .MuiChip-label": {
                                                        px: "10px",
                                                    },
                                                }}
                                            />
                                        ))}

                                    {!CompanyForm.values.medical_conditions?.length && (
                                        <Typography color="text.secondary">
                                            -
                                        </Typography>
                                    )}
                                </Box>
                            )}
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography variant="body1" fontWeight={500} fontSize={"16px"} mb={1}>
                               Allergies
                            </Typography>
                            {edit ? (
                                <Autocomplete
                                    multiple
                                    options={allergiesList?.data?.data}
                                    getOptionLabel={(option) => option.allergy_name}
                                    value={allergiesList?.data?.data.filter((item) =>
                                        (CompanyForm.values.allergies || []).includes(item._id)
                                    ) || []}
                                    onInputChange={(event, newInputValue) => {
                                        // setInputValue(newInputValue);
                                    }}
                                    onChange={(event, newValue) => {
                                        CompanyForm.setFieldValue(
                                            "allergies",
                                            newValue.map((item) => item._id)
                                        );
                                    }}
                                    isOptionEqualToValue={(option, value) => option._id === value._id}
                                    renderTags={(value, getTagProps) =>
                                        value.map((option, index) => {
                                            const { key, ...tagProps } = getTagProps({ index });
    
                                            return (
                                                <Chip
                                                    key={key}
                                                    {...tagProps}
                                                    label={option.allergy_name}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: `color-mix(in srgb, ${option.bgColor} 30%, transparent)`,
                                                        color: option.bgColor,
                                                        height: "28px",
                                                        borderRadius: "16px",
                                                        fontSize: "12px",
                                                        fontWeight: 400,
    
                                                        "& .MuiChip-label": {
                                                            px: "10px",
                                                        },
    
                                                        "& .MuiChip-deleteIcon": {
                                                            fontSize: "17px",
                                                            color: "#A7A7A7",
                                                            marginRight: "4px",
                                                        },
                                                    }}
                                                />
                                            );
                                        })
                                    }
    
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            placeholder={
                                                CompanyForm.values.allergies?.length
                                                    ? ""
                                                    : "Search & Select Medical Condition"
                                            }
                                            error={
                                                CompanyForm.touched.allergies &&
                                                Boolean(CompanyForm.errors.allergies)
                                            }
                                            helperText={
                                                CompanyForm.touched.allergies
                                                    ? CompanyForm.errors.allergies
                                                    : ""
                                            }
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    minHeight: "45px",
                                                    height: "auto",
                                                    padding: "5px 40px 5px 8px !important",
                                                    alignItems: "center",
    
                                                    "& fieldset": {
                                                        borderColor: "#E0E3E7",
                                                    },
    
                                                    "&:hover fieldset": {
                                                        borderColor: "#1976d2",
                                                    },
    
                                                    "&.Mui-focused fieldset": {
                                                        borderColor: "#1976d2",
                                                        borderWidth: "1.5px",
                                                    },
                                                },
    
                                                "& .MuiAutocomplete-input": {
                                                    padding: "6px 4px !important",
                                                    fontSize: "14px",
                                                },
    
                                                "& .MuiAutocomplete-tag": {
                                                    margin: "2px 4px 2px 0",
                                                },
                                            }}
                                        />
                                    )}
                                    fullWidth
                                />
                            ) : (
                                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                                    {(allergiesList?.data?.data || [])
                                        .filter((item) =>
                                            (CompanyForm.values.allergies || []).includes(
                                                item._id
                                            )
                                        )
                                        .map((option) => (
                                            <Chip
                                                key={option._id}
                                                label={option.allergy_name}
                                                size="small"
                                                sx={{
                                                    backgroundColor: `color-mix(in srgb, ${option.bgColor} 30%, transparent)`,
                                                    color: option.bgColor,
                                                    height: "28px",
                                                    borderRadius: "16px",
                                                    fontSize: "12px",
                                                    fontWeight: 400,

                                                    "& .MuiChip-label": {
                                                        px: "10px",
                                                    },
                                                }}
                                            />
                                        ))}

                                    {!CompanyForm.values.allergies?.length && (
                                        <Typography color="text.secondary">
                                            -
                                        </Typography>
                                    )}
                                </Box>
                            )}
                        </Grid>
                        
                        <Grid size={{ xs: 12}}>
                            <Typography variant="body1" fontWeight={500} fontSize={"16px"} mb={1}>
                               Emergency Contacts
                            </Typography>
                            {CompanyForm.values.emergency_contacts?.length > 0 ? (
                                CompanyForm.values.emergency_contacts.map((contact, index) => (
                                    <Grid
                                        container
                                        spacing={2}
                                        key={index}
                                        sx={{
                                            width: "100%",
                                            mb: 2,
                                            p: 2,
                                            border: "1px solid #e5e7eb",
                                            borderRadius: "10px",
                                        }}
                                    >
                                        {edit ? (
                                            <>
                                                {/* Name */}
                                                <Grid size={{ xs: 12, sm: 4 }}>
                                                    <FormControl variant="standard" fullWidth>
                                                        <InputLabel shrink>
                                                            Name
                                                        </InputLabel>

                                                        <BootstrapInput
                                                            name={`emergency_contacts.${index}.name`}
                                                            placeholder="Contact Name"
                                                            value={contact.name || ""}
                                                            onChange={CompanyForm.handleChange}
                                                        />
                                                    </FormControl>
                                                </Grid>

                                                {/* Relationship */}
                                                <Grid size={{ xs: 12, sm: 4 }}>
                                                    <FormControl variant="standard" fullWidth>
                                                        <InputLabel shrink>
                                                            Relationship
                                                        </InputLabel>

                                                        <BootstrapInput
                                                            name={`emergency_contacts.${index}.relationship`}
                                                            placeholder="Relationship"
                                                            value={contact.relationship || ""}
                                                            onChange={CompanyForm.handleChange}
                                                        />
                                                    </FormControl>
                                                </Grid>

                                                {/* Mobile Number */}
                                                <Grid size={{ xs: 12, sm: 4 }}>
                                                    <FormControl variant="standard" fullWidth>
                                                        <InputLabel shrink>
                                                            Mobile Number
                                                        </InputLabel>

                                                        <BootstrapInput
                                                            name={`emergency_contacts.${index}.mobile_number`}
                                                            placeholder="Mobile Number"
                                                            value={contact.mobile_number || ""}
                                                            onChange={CompanyForm.handleChange}
                                                        />
                                                    </FormControl>
                                                </Grid>

                                                {/* Remove */}
                                                {CompanyForm.values.emergency_contacts.length > 1 && (
                                                    <Grid size={{ xs: 12 }}>
                                                        <Button
                                                            color="error"
                                                            onClick={() => {
                                                                const contacts = [
                                                                    ...CompanyForm.values.emergency_contacts,
                                                                ];

                                                                contacts.splice(index, 1);

                                                                CompanyForm.setFieldValue(
                                                                    "emergency_contacts",
                                                                    contacts
                                                                );
                                                            }}
                                                        >
                                                            Remove Contact
                                                        </Button>
                                                    </Grid>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                {/* View Name */}
                                                <Grid size={{ xs: 12, sm: 4 }}>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        mb={0.5}
                                                    >
                                                        Name
                                                    </Typography>

                                                    <Typography>
                                                        {contact.name || "-"}
                                                    </Typography>
                                                </Grid>

                                                {/* View Relationship */}
                                                <Grid size={{ xs: 12, sm: 4 }}>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        mb={0.5}
                                                    >
                                                        Relationship
                                                    </Typography>

                                                    <Typography>
                                                        {contact.relationship || "-"}
                                                    </Typography>
                                                </Grid>

                                                {/* View Mobile */}
                                                <Grid size={{ xs: 12, sm: 4 }}>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        mb={0.5}
                                                    >
                                                        Mobile Number
                                                    </Typography>

                                                    <Typography>
                                                        {contact.mobile_number || "-"}
                                                    </Typography>
                                                </Grid>
                                            </>
                                        )}
                                    </Grid>
                                ))
                            ) : (
                                <Typography color="text.secondary">
                                    No emergency contacts added.
                                </Typography>
                            )}

                            {edit && (
                                <Grid size={{ xs: 12 }}>
                                    <Button
                                        variant="outlined"
                                        onClick={() => {
                                            CompanyForm.setFieldValue("emergency_contacts", [
                                                ...(CompanyForm.values.emergency_contacts || []),
                                                {
                                                    name: "",
                                                    relationship: "",
                                                    mobile_number: "",
                                                },
                                            ]);
                                        }}
                                    >
                                        + Add Emergency Contact
                                    </Button>
                                </Grid>
                            )}
                        </Grid>
                       

                    </Grid>
                    {edit && (
                        <Grid size={12} sx={{ mt: 1 }}>
                            <Box display="flex" justifyContent="flex-end" gap={2}>
                                <Button variant="outlined" sx={{ width: 130, height: 48, borderRadius: '10px', color: 'black', borderColor: '#E0E3E7' }} onClick={() => setedit(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={() => {
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

export default FamilyMemberInformation;
