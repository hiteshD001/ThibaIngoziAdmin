import axios from "axios";

export const userlogin = async (data) => {
    return await axios.post(`${import.meta.env.VITE_BASEURL}/users/login`, data);
}

export const register = async (data) => {
    return await axios.post(`${import.meta.env.VITE_BASEURL}/users/register`, data);
}

export const resetPassword = async ({ password, token }) => {
    console.log(password, token)
    return await axios.post(`${import.meta.env.VITE_BASEURL}/users/reset-password/${token}`, { newPassword: password });
}