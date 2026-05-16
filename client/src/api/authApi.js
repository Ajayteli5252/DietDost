import apiClient from './apiClient';

export const authApi = {
    signUp: async (userData) => {
        const res = await apiClient.post('/auth/signup', userData);
        return res.data;
    },

    verifyOTP: async (email, otp) => {
        const res = await apiClient.post('/auth/verify-otp', { email, otp });
        return res.data;
    },

    resendOTP: async (email) => {
        const res = await apiClient.post('/auth/resend-otp', { email });
        return res.data;
    },

    signIn: async (email, password) => {
        const res = await apiClient.post('/auth/signin', { email, password });
        return res.data;
    },

    getMe: async () => {
        const res = await apiClient.get('/auth/me');
        return res.data;
    },
};