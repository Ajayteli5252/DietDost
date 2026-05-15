import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

export const authApi = {
    signUp: async (userData) => {
        const res = await axios.post(`${API_URL}/signup`, userData);
        return res.data;
    },

    verifyOTP: async (email, otp) => {
        const res = await axios.post(`${API_URL}/verify-otp`, { email, otp });
        return res.data;
    },

    resendOTP: async (email) => {
        const res = await axios.post(`${API_URL}/resend-otp`, { email });
        return res.data;
    },

    signIn: async (email, password) => {
        const res = await axios.post(`${API_URL}/signin`, { email, password });
        return res.data;
    },

    getMe: async () => {
        const res = await axios.get(`${API_URL}/me`);
        return res.data;
    },
};