const db = require('../config/db');
const { askAI } = require('../config/groq');

// Helper: IST mein aaj ki date lo (UTC+5:30)
const getISTDate = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

// ================== ADD MEAL ==================
const addMeal = async (req, res) => {
    try {
        const userId = req.user.id;
        const { meal_type, food_description, log_date } = req.body;

        if (!meal_type || !food_description) {
            return res.status(400).json({
                success: false,
                message: 'Meal type aur food description dono chahiye!',
            });
        }

        // User profile lo calories target ke liye
        const [profile] = await db.query(
            'SELECT diet_type, goal FROM user_profiles WHERE user_id = ?',
            [userId]
        );

        const dietType = profile[0]?.diet_type || 'vegetarian';
        const goal = profile[0]?.goal || 'general_health';

        // AI se calories calculate karwao
        const prompt = `
      User ate: "${food_description}"
      Diet type: ${dietType}
      Goal: ${goal}
      
      Calculate the calories and nutrition for this.
      Respond only in JSON format, do not include anything else:
      {
        "calories": number,
        "protein": number,
        "carbs": number,
        "fat": number,
        "food_items": ["item1", "item2"],
        "message": "short feedback in user's language"
      }
    `;

        const aiResponse = await askAI(prompt);

        // JSON parse karo
        let nutritionData;
        try {
            const cleanResponse = aiResponse.response
                .replace(/```json/g, '')
                .replace(/```/g, '')
                .trim();
            nutritionData = JSON.parse(cleanResponse);
        } catch (e) {
            nutritionData = {
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0,
                message: 'Nutrition calculate nahi ho saka!',
            };
        }

        // Database me save karo
        const date = log_date || getISTDate();

        await db.query(
            `INSERT INTO food_logs 
        (user_id, meal_type, food_description, calories, protein, carbs, fat, log_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, meal_type, food_description, nutritionData.calories,
                nutritionData.protein, nutritionData.carbs, nutritionData.fat, date]
        );

        res.status(201).json({
            success: true,
            message: 'Meal log ho gaya!',
            data: nutritionData,
        });

    } catch (error) {
        console.error('AddMeal error:', error);
        res.status(500).json({
            success: false,
            message: 'Kuch gadbad ho gayi!',
        });
    }
};

// ================== GET TODAY'S MEALS ==================
const getTodayMeals = async (req, res) => {
    try {
        const userId = req.user.id;
        const today = getISTDate();

        const [meals] = await db.query(
            `SELECT * FROM food_logs WHERE user_id = ? AND log_date = ? ORDER BY created_at ASC`,
            [userId, today]
        );

        // Total calculate karo
        const totals = meals.reduce(
            (acc, meal) => {
                acc.calories += meal.calories || 0;
                acc.protein += meal.protein || 0;
                acc.carbs += meal.carbs || 0;
                acc.fat += meal.fat || 0;
                return acc;
            },
            { calories: 0, protein: 0, carbs: 0, fat: 0 }
        );

        // User ka target lo
        const [profile] = await db.query(
            'SELECT daily_calorie_target, protein_target, carbs_target, fat_target FROM user_profiles WHERE user_id = ?',
            [userId]
        );

        res.status(200).json({
            success: true,
            meals: meals,
            totals: {
                calories: Math.round(totals.calories),
                protein: Math.round(totals.protein),
                carbs: Math.round(totals.carbs),
                fat: Math.round(totals.fat),
            },
            targets: profile[0] || null,
        });

    } catch (error) {
        console.error('GetTodayMeals error:', error);
        res.status(500).json({
            success: false,
            message: 'Kuch gadbad ho gayi!',
        });
    }
};

// ================== GET MEALS BY DATE ==================
const getMealsByDate = async (req, res) => {
    try {
        const userId = req.user.id;
        const { date } = req.params;

        const [meals] = await db.query(
            'SELECT * FROM food_logs WHERE user_id = ? AND log_date = ? ORDER BY created_at ASC',
            [userId, date]
        );

        const totals = meals.reduce(
            (acc, meal) => {
                acc.calories += meal.calories || 0;
                acc.protein += meal.protein || 0;
                acc.carbs += meal.carbs || 0;
                acc.fat += meal.fat || 0;
                return acc;
            },
            { calories: 0, protein: 0, carbs: 0, fat: 0 }
        );

        res.status(200).json({
            success: true,
            meals: meals,
            totals: {
                calories: Math.round(totals.calories),
                protein: Math.round(totals.protein),
                carbs: Math.round(totals.carbs),
                fat: Math.round(totals.fat),
            },
        });

    } catch (error) {
        console.error('GetMealsByDate error:', error);
        res.status(500).json({
            success: false,
            message: 'Kuch gadbad ho gayi!',
        });
    }
};

// ================== DELETE MEAL ==================
const deleteMeal = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        await db.query(
            'DELETE FROM food_logs WHERE id = ? AND user_id = ?',
            [id, userId]
        );

        res.status(200).json({
            success: true,
            message: 'Meal delete ho gaya!',
        });

    } catch (error) {
        console.error('DeleteMeal error:', error);
        res.status(500).json({
            success: false,
            message: 'Kuch gadbad ho gayi!',
        });
    }
};

// ================== ADD WATER ==================
const addWater = async (req, res) => {
    try {
        const userId = req.user.id;
        const { glasses } = req.body;
        const today = getISTDate();

        // Already log hai aaj ka?
        const [existing] = await db.query(
            'SELECT id FROM water_logs WHERE user_id = ? AND log_date = ?',
            [userId, today]
        );

        if (existing.length > 0) {
            await db.query(
                'UPDATE water_logs SET glasses = ? WHERE user_id = ? AND log_date = ?',
                [glasses, userId, today]
            );
        } else {
            await db.query(
                'INSERT INTO water_logs (user_id, glasses, log_date) VALUES (?, ?, ?)',
                [userId, glasses, today]
            );
        }

        res.status(200).json({
            success: true,
            message: 'Water log ho gaya!',
            glasses: glasses,
        });

    } catch (error) {
        console.error('AddWater error:', error);
        res.status(500).json({
            success: false,
            message: 'Kuch gadbad ho gayi!',
        });
    }
};

// ================== GET WEEKLY SUMMARY ==================
const getWeeklySummary = async (req, res) => {
    try {
        const userId = req.user.id;

        const [summary] = await db.query(
            `SELECT 
        log_date,
        SUM(calories) as total_calories,
        SUM(protein) as total_protein,
        SUM(carbs) as total_carbs,
        SUM(fat) as total_fat
      FROM food_logs 
      WHERE user_id = ? AND log_date >= ((NOW() AT TIME ZONE 'Asia/Kolkata')::date - INTERVAL '7 day')
      GROUP BY log_date
      ORDER BY log_date ASC`,
            [userId]
        );

        res.status(200).json({
            success: true,
            summary: summary,
        });

    } catch (error) {
        console.error('GetWeeklySummary error:', error);
        res.status(500).json({
            success: false,
            message: 'Kuch gadbad ho gayi!',
        });
    }
};

module.exports = {
    addMeal,
    getTodayMeals,
    getMealsByDate,
    deleteMeal,
    addWater,
    getWeeklySummary,
};