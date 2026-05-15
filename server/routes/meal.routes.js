const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const {
    addMeal,
    getTodayMeals,
    getMealsByDate,
    deleteMeal,
    addWater,
    getWeeklySummary,
} = require('../controllers/meal.controller');

// Sab protected routes hain
router.post('/add', verifyToken, addMeal);
router.get('/today', verifyToken, getTodayMeals);
router.get('/date/:date', verifyToken, getMealsByDate);
router.delete('/:id', verifyToken, deleteMeal);
router.post('/water', verifyToken, addWater);
router.get('/weekly', verifyToken, getWeeklySummary);

module.exports = router;