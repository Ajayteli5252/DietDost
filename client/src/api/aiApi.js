import apiClient from './apiClient';

export const aiApi = {
    getDailySuggestion: async () => {
        const res = await apiClient.get('/ai/suggestion');
        return res.data;
    },

    aiChat: async (message, chatHistory = [], imageFile = null) => {
        const cleanHistory = chatHistory.map(({ role, text }) => ({ role, text }));

        if (imageFile) {
            const formData = new FormData();
            formData.append('message', message || 'Analyze this food image and tell me its nutrition details.');
            formData.append('chatHistory', JSON.stringify(cleanHistory));
            formData.append('image', imageFile);
            const res = await apiClient.post('/ai/chat', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return res.data;
        }
        const res = await apiClient.post('/ai/chat', { message, chatHistory: cleanHistory });
        return res.data;
    },

    checkDeficiency: async () => {
        const res = await apiClient.get('/ai/deficiency');
        return res.data;
    },

    getMealPlan: async () => {
        const res = await apiClient.get('/ai/meal-plan');
        return res.data;
    },
};