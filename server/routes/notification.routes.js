const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const {
    getSettings,
    updateSettings,
    sendTestNotification,
    getNotifications,
    markNotificationsRead,
    deleteAllNotifications,
} = require('../controllers/notification.controller');

router.get('/settings', verifyToken, getSettings);
router.put('/settings', verifyToken, updateSettings);
router.post('/test', verifyToken, sendTestNotification);

// In-App Notifications
router.get('/', verifyToken, getNotifications);
router.put('/mark-read', verifyToken, markNotificationsRead);
router.delete('/all', verifyToken, deleteAllNotifications);

module.exports = router;