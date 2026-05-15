import axios from 'axios';

const API_URL = 'http://localhost:5000/api/meal';

export const mealApi = {
    addMeal: async (data) => {
        const res = await axios.post(`${API_URL}/add`, data);
        return res.data;
    },

    getTodayMeals: async () => {
        const res = await axios.get(`${API_URL}/today`);
        return res.data;
    },

    getMealsByDate: async (date) => {
        const res = await axios.get(`${API_URL}/date/${date}`);
        return res.data;
    },

    deleteMeal: async (id) => {
        const res = await axios.delete(`${API_URL}/${id}`);
        return res.data;
    },

    logWater: async (glasses) => {
        const res = await axios.post(`${API_URL}/water`, { glasses });
        return res.data;
    },

    getWeeklySummary: async () => {
        const res = await axios.get(`${API_URL}/weekly`);
        return res.data;
    },
};