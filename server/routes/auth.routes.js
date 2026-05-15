const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const {
    signUp,
    verifyOTP,
    resendOTP,
    signIn,
    getMe,
} = require('../controllers/auth.controller');

// Public routes
router.post('/signup', signUp);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/signin', signIn);

// Protected route
router.get('/me', verifyToken, getMe);

module.exports = router;