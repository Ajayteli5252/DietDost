import apiClient from './apiClient';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/notifications` : 'https://dietdost.onrender.com/api/notifications';

export const notificationApi = {
    getSettings: async () => {
        const res = await apiClient.get('notifications/settings');
        return res.data;
    },

    updateSettings: async (settings) => {
        const res = await apiClient.put('notifications/settings', settings);
        return res.data;
    },

    sendTest: async (type) => {
        const res = await apiClient.post('notifications/test', { type });
        return res.data;
    },

    // In-App Notifications
    getNotifications: async () => {
        const res = await apiClient.get('notifications');
        return res.data;
    },

    markRead: async () => {
        const res = await apiClient.put('notifications/mark-read');
        return res.data;
    },

    deleteAll: async () => {
        const res = await apiClient.delete('notifications/all');
        return res.data;
    },
};