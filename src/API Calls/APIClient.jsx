import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_BASEURL,
});

apiClient.interceptors.request.use(
    config => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
            // Do not force Content-Type for FormData. Let the browser set the correct multipart boundary.
            if (config.data instanceof FormData) {
                if (config.headers && config.headers['Content-Type']) {
                    delete config.headers['Content-Type'];
                }
            } else {
                // Default to JSON for non-FormData requests if not already set
                if (!config.headers) config.headers = {};
                if (!config.headers['Content-Type']) {
                    config.headers['Content-Type'] = 'application/json';
                }
            }
        }
        return config;
    },
    error => Promise.reject(error)
);

apiClient.interceptors.response.use(
    response => response,
    error => {
        const { response } = error;

        if (response && response.status === 400) {
            const errorMessage = response.data.message || response.data || '';
            // if (errorMessage?.toLowerCase().includes('account is already logged in on another device.')) {
            //     console.error('User logged in on another device');
            //     localStorage.removeItem("accessToken");
            //     localStorage.removeItem("refreshToken");
            //     window.location.href = "/";
            // }
        }

        return Promise.reject(error);
    }
);

export default apiClient;

