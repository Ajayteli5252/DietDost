import axios from 'axios';

// Base URL configuration
// Dev: http://localhost:5000/api
// Prod: https://your-backend-api.com/api
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('dietdost_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for session expiry
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expire ho gaya ya invalid hai
            localStorage.removeItem('dietdost_token');
            // Hum reload nahi karenge, hooks handles it via state
        }
        return Promise.reject(error);
    }
);

export default apiClient;
