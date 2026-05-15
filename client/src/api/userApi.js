import axios from 'axios';

const API_URL = 'http://localhost:5000/api/user';

export const userApi = {
    saveOnboarding: async (data) => {
        const res = await axios.post(`${API_URL}/onboarding`, data);
        return res.data;
    },

    getProfile: async () => {
        const res = await axios.get(`${API_URL}/profile`);
        return res.data;
    },

    updateProfile: async (data) => {
        const res = await axios.put(`${API_URL}/profile`, data);
        return res.data;
    },
};