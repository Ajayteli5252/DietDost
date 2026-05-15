const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const {
    addWeight,
    getWeeklyWeight,
    getWeightHistory,
} = require('../controllers/weight.controller');

router.post('/add', verifyToken, addWeight);
router.get('/weekly', verifyToken, getWeeklyWeight);
router.get('/history', verifyToken, getWeightHistory);

module.exports = router;