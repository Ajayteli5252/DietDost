import apiClient from './apiClient';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/user` : 'https://dietdost.onrender.com/api/user';

export const userApi = {
    saveOnboarding: async (data) => {
        const res = await apiClient.post('user/onboarding', data);
        return res.data;
    },

    getProfile: async () => {
        const res = await apiClient.get('user/profile');
        return res.data;
    },

    updateProfile: async (data) => {
        const res = await apiClient.put('user/profile', data);
        return res.data;
    },
};