import apiClient from './apiClient';

export const weightApi = {
    addWeight: async (weight, note = '') => {
        const res = await apiClient.post('/weight/add', { weight, note });
        return res.data;
    },

    getWeeklyWeight: async () => {
        const res = await apiClient.get('/weight/weekly');
        return res.data;
    },

    getWeightHistory: async () => {
        const res = await apiClient.get('/weight/history');
        return res.data;
    },
};