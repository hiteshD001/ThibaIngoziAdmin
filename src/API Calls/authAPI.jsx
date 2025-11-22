// src/API Calls/authAPI.jsx
import apiClient from './APIClient';

export const verify2FACode = async (tempToken, email, code) => {
    const response = await apiClient.post(
        '/auth/2fa/verify',
        { email, code },
        {
            headers: {
                'Authorization': `Bearer ${tempToken}`
            }
        }
    );
    return response.data;
};

export const loginUser = async (credentials) => {
    const response = await apiClient.post('/users/login', credentials);
    return response.data;
};

// Generate 2FA secret and get QR code
export const enable2FA = async (enable = true) => {
    const response = await apiClient.post('/auth/2fa/generate', { enable });
    return response.data;
};

// Disable 2FA for the current user
export const disable2FA = async () => {
    const response = await apiClient.post('/auth/2fa/disable');
    return response.data;
};