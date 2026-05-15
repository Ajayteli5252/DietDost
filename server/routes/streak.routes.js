const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { getStreak, updateStreak } = require('../controllers/streak.controller');

router.get('/', verifyToken, getStreak);
router.post('/update', verifyToken, updateStreak);

module.exports = router;