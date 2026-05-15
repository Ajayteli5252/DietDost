const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const {
    saveOnboarding,
    getProfile,
    updateProfile,
} = require('../controllers/user.controller');

// Sab protected routes hain
router.post('/onboarding', verifyToken, saveOnboarding);
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);

module.exports = router;