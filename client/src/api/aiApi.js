import axios from 'axios';

const API_URL = 'http://localhost:5000/api/ai';

export const aiApi = {
    getDailySuggestion: async () => {
        const res = await axios.get(`${API_URL}/suggestion`);
        return res.data;
    },

    aiChat: async (message, chatHistory = [], imageFile = null) => {
        // Strip imagePreview from history to avoid bloating the request
        const cleanHistory = chatHistory.map(({ role, text }) => ({ role, text }));

        if (imageFile) {
            // Use FormData when image is attached
            const formData = new FormData();
            formData.append('message', message || 'Analyze this food image and tell me its nutrition details.');
            formData.append('chatHistory', JSON.stringify(cleanHistory));
            formData.append('image', imageFile);
            const res = await axios.post(`${API_URL}/chat`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return res.data;
        }
        // Normal JSON chat
        const res = await axios.post(`${API_URL}/chat`, { message, chatHistory: cleanHistory });
        return res.data;
    },

    checkDeficiency: async () => {
        const res = await axios.get(`${API_URL}/deficiency`);
        return res.data;
    },
};