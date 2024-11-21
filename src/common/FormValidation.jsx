/* eslint-disable react-refresh/only-export-components */
import * as yup from "yup"

const Username = yup.string().required("This is a required field")

const String = yup.string().required("This Field is Required")

const Number = yup.number().required("This Field is Required")

const Email = yup.string().required("Email is Required").email("Please Enter a valid Email ID")

const ID = yup.string().required("Plase enter a valid ID").typeError("Plase enter a valid ID")

const Password = yup.string()
    .required("Password is Required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[!@#$%^&*]/, 'Password must contain at least one special character')

const MobileNumber = yup.string()
    .required("Mobile Number is Required");


export const resetPasswordValidation = yup.object({
    password: Password,

    confirmPassword: yup.string()
        .required("Confirm Password is Required")
        .oneOf([yup.ref('password'), null], 'Passwords must match')
})

export const loginValidation = yup.object({
    email: Email,
    password: Password,
})

export const profileValidation_s = yup.object({
    first_name: Username,
    last_name: Username,
    email: Email,
    mobile_no: MobileNumber,
    street: String,
    province: String,
    city: String,
    suburb: String,
    postal_code: Number,
    country: String
})

export const profileValidation_c = yup.object({
    contact_name: Username,
    email: Email,
    mobile_no: MobileNumber,
    street: String,
    province: String,
    city: String,
    suburb: String,
    postal_code: Number,
    country: String
})

export const companyValidation = yup.object({
    email: Email,
    password: Password,
    company_name: Username,
    contact_name: Username,
    mobile_no: MobileNumber,
    street: String,
    province: String,
    city: String,
    suburb: String,
    postal_code: Number,
    country: String,
    id_no: ID,
    company_bio: yup.string().required("Bio is required")
})

export const driverValidation = yup.object({
    company_id: yup.string(),
    first_name: Username,
    last_name: Username,
    email: Email,
    password: Password,
    mobile_no: MobileNumber,
    street: String,
    province: String,
    city: String,
    suburb: String,
    postal_code: Number,
    country: String,
    id_no: ID,
})

export const vehicleValidation = yup.object({
    first_name: Username,
    last_name: Username,
    company_id: yup.string().required('This field is required'),
    email: Email,
    mobile_no: MobileNumber,
    street: yup.string().required('This field is required'),
    province: yup.string().required('This field is required'),
    city: yup.string().required('This field is required'),
    suburb: yup.string().required('This field is required'),
    postal_code: yup.number().required('This field is required'),
    country: yup.string().required('This field is required'),
})