/* eslint-disable react-refresh/only-export-components */
import * as yup from "yup"

const Username = yup.string().required("This is a required field")

const Address = yup.string().required("Address is Required")

const Email = yup.string().required("Email is Required").email("Please Enter a valid Email ID")

const Password = yup.string()
    .required("Password is Required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[!@#$%^&*]/, 'Password must contain at least one special character')

const MobileNumber = yup.number()
    .required("Mobile Number is Required")
    .typeError("Mobile Number must be a number")
    .integer("Mobile Number must be an integer")
    .positive("Mobile Number must be positive")
    .min(1000000000, "Mobile Number must be at least 10 digits")
    .max(9999999999, "Mobile Number must be at most 10 digits")

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

export const profileValidation = yup.object({
    username: Username,
    email: Email,
    mobile_no: MobileNumber,
    address: Address,
})

export const companyValidation = yup.object({
    email: Email,
    password: Password,
    company_name: Username,
    contact_name: Username,
    mobile_no: MobileNumber,
    address: Address,
    id_no: yup.number().required("Plase enter a valid ID").typeError("Plase enter a valid ID"),
    company_bio: yup.string().required("Bio is required")
})

export const driverValidation = yup.object({
    username: Username,
    email: Email,
    password: Password,
    mobile_no: MobileNumber,
    address: Address,
    id_no: yup.number().required("Plase enter a valid ID").typeError("Plase enter a valid ID"),
})