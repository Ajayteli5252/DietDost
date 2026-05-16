import apiClient from './apiClient';

export const streakApi = {
    getStreak: async () => {
        const res = await apiClient.get('/streak');
        return res.data;
    },

    updateStreak: async () => {
        const res = await apiClient.post('/streak/update');
        return res.data;
    },
};