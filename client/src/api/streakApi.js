import axios from 'axios';

const API_URL = 'http://localhost:5000/api/streak';

export const streakApi = {
    getStreak: async () => {
        const res = await axios.get(`${API_URL}/`);
        return res.data;
    },

    updateStreak: async () => {
        const res = await axios.post(`${API_URL}/update`);
        return res.data;
    },
};