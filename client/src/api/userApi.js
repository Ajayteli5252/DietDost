import apiClient from './apiClient';

export const userApi = {
    saveOnboarding: async (data) => {
        const res = await apiClient.post('/user/onboarding', data);
        return res.data;
    },

    getProfile: async () => {
        const res = await apiClient.get('/user/profile');
        return res.data;
    },

    updateProfile: async (data) => {
        const res = await apiClient.put('/user/profile', data);
        return res.data;
    },
};