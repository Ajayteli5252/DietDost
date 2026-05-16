import apiClient from './apiClient';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/streak` : 'https://dietdost.onrender.com/api/streak';

export const streakApi = {
    getStreak: async () => {
        const res = await apiClient.get('streak');
        return res.data;
    },

    updateStreak: async () => {
        const res = await apiClient.post('streak/update');
        return res.data;
    },
};