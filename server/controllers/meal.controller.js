const db = require('../config/db');
const { askAIJSON } = require('../config/groq');

// Helper: Get today's date in IST (UTC+5:30)
const getISTDate = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

// ================== ADD MEAL ==================
const addMeal = async (req, res) => {
    try {
        const userId = req.user.id;
        const { meal_type, food_description, log_date } = req.body;

        if (!meal_type || !food_description) {
            return res.status(400).json({
                success: false,
                message: 'Meal type and food description are both required!',
            });
        }

        // Fetch user profile for calorie targets
        const [profile] = await db.query(
            'SELECT diet_type, goal FROM user_profiles WHERE user_id = ?',
            [userId]
        );

        const dietType = profile[0]?.diet_type || 'vegetarian';
        const goal = profile[0]?.goal || 'general_health';

        // Calculate calories via AI (supporting English, Hindi, and Hinglish)
        const prompt = `
User ate: "${food_description}"
User Diet Type: ${dietType}
User Fitness Goal: ${goal}

TASK:
1. Identify all food items, quantities, and preparation style from the user's input.
2. The input can be written in English, Hindi (Devanagari script, e.g. "२ रोटी, दाल और चावल"), or Hinglish (Roman script, e.g. "maine 2 roti, 1 katori dal aur thoda chawal khaya", "2 ande aur 1 glass doodh", "poha aur chai").
3. Calculate realistic total nutrition (calories in kcal, protein in grams, carbs in grams, fat in grams). If no quantity is specified, assume standard single Indian/general serving.

CRITICAL: Respond ONLY with a valid JSON object in this format (no markdown, no other text):
{
  "calories": 350,
  "protein": 12,
  "carbs": 50,
  "fat": 8,
  "food_items": ["Roti", "Dal", "Rice"],
  "message": "Balanced meal logged!"
}
`;

        let nutritionData;
        try {
            const aiResponse = await askAIJSON(prompt);
            let cleanResponse = (aiResponse.response || '{}')
                .replace(/```json/gi, '')
                .replace(/```/g, '')
                .trim();
            const parsed = JSON.parse(cleanResponse);

            const cal = Number(parsed.calories);
            const prot = Number(parsed.protein);
            const carbs = Number(parsed.carbs);
            const fat = Number(parsed.fat);

            nutritionData = {
                calories: !isNaN(cal) && cal > 0 ? Math.round(cal) : 250,
                protein: !isNaN(prot) && prot >= 0 ? Math.round(prot * 10) / 10 : 8,
                carbs: !isNaN(carbs) && carbs >= 0 ? Math.round(carbs * 10) / 10 : 35,
                fat: !isNaN(fat) && fat >= 0 ? Math.round(fat * 10) / 10 : 7,
                food_items: Array.isArray(parsed.food_items) && parsed.food_items.length > 0 ? parsed.food_items : [food_description],
                message: parsed.message || 'Meal logged successfully!',
            };
        } catch (e) {
            console.error('AddMeal AI estimation error:', e.message);
            // Fallback estimation so user never gets 0s
            nutritionData = {
                calories: 250,
                protein: 8,
                carbs: 35,
                fat: 7,
                food_items: [food_description],
                message: 'Meal logged with estimated nutritional values.',
            };
        }

        // Save into database
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
            message: 'Meal logged successfully!',
            data: nutritionData,
        });

    } catch (error) {
        console.error('AddMeal error:', error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong!',
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

        // Calculate totals
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

        // Fetch user targets
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
            message: 'Something went wrong!',
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
            message: 'Something went wrong!',
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
            message: 'Meal deleted successfully!',
        });

    } catch (error) {
        console.error('DeleteMeal error:', error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong!',
        });
    }
};

// ================== ADD WATER ==================
const addWater = async (req, res) => {
    try {
        const userId = req.user.id;
        const { glasses } = req.body;
        const today = getISTDate();

        // Check if logged for today
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
            message: 'Water logged successfully!',
            glasses: glasses,
        });

    } catch (error) {
        console.error('AddWater error:', error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong!',
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
            message: 'Something went wrong!',
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