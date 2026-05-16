import apiClient from './apiClient';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/meal` : 'https://dietdost.onrender.com/api/meal';

export const mealApi = {
    addMeal: async (data) => {
        const res = await apiClient.post('meal/add', data);
        return res.data;
    },

    getTodayMeals: async () => {
        const res = await apiClient.get('meal/today');
        return res.data;
    },

    getMealsByDate: async (date) => {
        const res = await apiClient.get('meal/date/' + date);
        return res.data;
    },

    deleteMeal: async (id) => {
        const res = await apiClient.delete('meal/' + id);
        return res.data;
    },

    logWater: async (glasses) => {
        const res = await apiClient.post('meal/water', { glasses });
        return res.data;
    },

    getWeeklySummary: async () => {
        const res = await apiClient.get('meal/weekly');
        return res.data;
    },
};