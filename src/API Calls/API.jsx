import axios from "axios";

export const resetPassword = async ({ password, token }) => {
    console.log(password, token)
    return await axios.post(`${import.meta.env.VITE_API_BASE_URL}/users/reset-password/${token}`, { newPassword: password });
}