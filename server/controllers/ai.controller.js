const db = require('../config/db');
const { askAI, askAIWithImage, askAIJSON, detectLanguage } = require('../config/groq');
const fs = require('fs');

// ================== AI SUGGESTION ==================
const getDailySuggestion = async (req, res) => {
    try {
        const userId = req.user.id;
        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istDate = new Date(now.getTime() + istOffset);
        const today = istDate.toISOString().split('T')[0];

        const [existing] = await db.query(
            'SELECT * FROM ai_suggestions WHERE user_id = ? AND suggestion_date = ?',
            [userId, today]
        );

        if (existing.length > 0) {
            return res.status(200).json({ success: true, suggestion: existing[0].suggestion });
        }

        const [profile] = await db.query(
            `SELECT u.name, u.age, u.gender, p.goal, p.diet_type, 
        p.workout_type, p.daily_calorie_target, p.protein_target
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE u.id = ?`,
            [userId]
        );

        const [todayMeals] = await db.query(
            `SELECT SUM(calories) as total_calories, SUM(protein) as total_protein,
        SUM(carbs) as total_carbs, SUM(fat) as total_fat
      FROM food_logs WHERE user_id = ? AND log_date = ?`,
            [userId, today]
        );

        const userProfile = profile[0];
        const todayData = todayMeals[0];

        const prompt = `
      User Profile:
      - Name: ${userProfile?.name}
      - Age: ${userProfile?.age}
      - Gender: ${userProfile?.gender}
      - Goal: ${userProfile?.goal}
      - Diet Type: ${userProfile?.diet_type}
      - Workout: ${userProfile?.workout_type}
      - Daily Calorie Target: ${userProfile?.daily_calorie_target}
      - Protein Target: ${userProfile?.protein_target}g

      Today's Data:
      - Total Calories: ${Math.round(todayData?.total_calories || 0)}
      - Total Protein: ${Math.round(todayData?.total_protein || 0)}g
      - Total Carbs: ${Math.round(todayData?.total_carbs || 0)}g
      - Total Fat: ${Math.round(todayData?.total_fat || 0)}g

      Give a short, helpful, personalized diet suggestion for this user today.
      Write 2-3 sentences max. Use **bold** only for key food names or numbers.
      Suggest Indian foods where possible. Be positive and motivating.
      IMPORTANT: Respond ONLY in English. Do NOT use Hindi or Hinglish.
    `;

        const aiResponse = await askAI(prompt);

        await db.query(
            'INSERT INTO ai_suggestions (user_id, suggestion, suggestion_date) VALUES (?, ?, ?)',
            [userId, aiResponse.response, today]
        );

        res.status(200).json({ success: true, suggestion: aiResponse.response });

    } catch (error) {
        console.error('GetDailySuggestion error:', error);
        res.status(500).json({ success: false, message: 'Something went wrong!' });
    }
};

// ================== AI CHAT ==================
const aiChat = async (req, res) => {
    try {
        const userId = req.user.id;
        const imageFile = req.file;

        // chatHistory can come as JSON string (FormData) or array (JSON body)
        let chatHistory = [];
        try {
            const raw = req.body.chatHistory;
            if (Array.isArray(raw)) {
                chatHistory = raw;
            } else if (typeof raw === 'string' && raw) {
                chatHistory = JSON.parse(raw);
            }
        } catch (e) {
            chatHistory = [];
        }

        const message = req.body.message || '';

        if (!message && !imageFile) {
            return res.status(400).json({ success: false, message: 'Message or image is required!' });
        }

        const [profile] = await db.query(
            `SELECT u.age, u.gender, p.goal, p.diet_type, p.workout_type,
        p.daily_calorie_target
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE u.id = ?`,
            [userId]
        );

        const userProfile = profile[0];
        const userMsg = message || 'Analyze this food image.';

        const contextPrompt = `User Profile: Age ${userProfile?.age}, Gender ${userProfile?.gender}, Goal ${userProfile?.goal}, Diet ${userProfile?.diet_type}, Workout ${userProfile?.workout_type}, Daily Calories ${userProfile?.daily_calorie_target}.

User: ${userMsg}`;

        const userLanguage = detectLanguage(userMsg);

        let aiResponse;
        if (imageFile) {
            // Image analysis with vision
            const imageBase64 = fs.readFileSync(imageFile.path, { encoding: 'base64' });
            const mimeType = imageFile.mimetype;
            // Filter chatHistory to only text entries (no imagePreview objects)
            const safeHistory = chatHistory.filter(m => m && typeof m.text === 'string').map(m => ({ role: m.role, text: m.text }));
            aiResponse = await askAIWithImage(contextPrompt, imageBase64, mimeType, userLanguage, safeHistory);
            // Clean up uploaded file
            try { fs.unlinkSync(imageFile.path); } catch (e) { }
        } else {
            aiResponse = await askAI(contextPrompt, userLanguage, chatHistory);
        }

        res.status(200).json({
            success: true,
            response: aiResponse.response,
            language: aiResponse.language,
        });

    } catch (error) {
        console.error('AIChat error:', error?.message || error);
        if (error?.error) console.error('API Error detail:', JSON.stringify(error.error));
        // Clean up file if error
        if (req.file) { try { fs.unlinkSync(req.file.path); } catch (e) { } }
        res.status(500).json({ success: false, message: error?.message || 'Something went wrong!' });
    }
};

// ================== DEFICIENCY CHECK ==================
const checkDeficiency = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get current date in IST (YYYY-MM-DD)
        // Get current date in IST (YYYY-MM-DD)
        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istDate = new Date(now.getTime() + istOffset);
        const todayIST = istDate.toISOString().split('T')[0];

        // IST mein last 7 days ka data
        const [weeklyData] = await db.query(
            `SELECT 
                COUNT(DISTINCT log_date) as days_tracked,
                AVG(calories) as avg_calories,
                AVG(protein) as avg_protein,
                AVG(carbs) as avg_carbs,
                AVG(fat) as avg_fat
            FROM food_logs
            WHERE user_id = ? AND log_date >= DATE_SUB(?, INTERVAL 7 DAY)`,
            [userId, todayIST]
        );

        const [profile] = await db.query(
            `SELECT u.age, u.gender, p.goal, p.diet_type,
        p.daily_calorie_target, p.protein_target, p.carbs_target, p.fat_target
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE u.id = ?`,
            [userId]
        );

        const weekData = weeklyData[0];
        const userProfile = profile[0];

        const daysTracked = weekData?.days_tracked || 0;

        const prompt = `
      User's average diet (based on ${daysTracked} day(s) of data out of last 7 days):
      - Avg Calories: ${Math.round(weekData?.avg_calories || 0)} kcal/day
      - Avg Protein: ${Math.round(weekData?.avg_protein || 0)}g/day
      - Avg Carbs: ${Math.round(weekData?.avg_carbs || 0)}g/day
      - Avg Fat: ${Math.round(weekData?.avg_fat || 0)}g/day

      User's Daily Targets:
      - Calories: ${userProfile?.daily_calorie_target} kcal
      - Protein: ${userProfile?.protein_target}g
      - Carbs: ${userProfile?.carbs_target}g
      - Fat: ${userProfile?.fat_target}g

      User Profile:
      - Gender: ${userProfile?.gender}
      - Goal: ${userProfile?.goal}
      - Diet Type: ${userProfile?.diet_type}

      ${daysTracked === 0 ? 'No food data yet. Based on the user profile and goals, predict likely deficiencies.' : `Based on ${daysTracked} day(s) of actual food data, identify nutritional gaps.`}
      What vitamins or nutrients might be deficient?
      Respond ONLY in valid JSON format (no extra text):
      {
        "deficiencies": ["deficiency1", "deficiency2"],
        "severity": "low/medium/high",
        "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
        "foods_to_add": ["food1", "food2", "food3"]
      }
    `;

        let aiResponse;
        try {
            aiResponse = await askAIJSON(prompt);
        } catch (aiErr) {
            console.error('AI Deficiency Check failed, using fallback mock logic:', aiErr.message);
            // AI fail ho gaya, par hum user ko empty nahi dikhayenge
            // Agar logs hain to moderate deficiency dikhao, warna low
            const hasGaps = (weekData?.avg_protein < userProfile?.protein_target * 0.8) || (weekData?.avg_calories < userProfile?.daily_calorie_target * 0.8);
            
            aiResponse = {
                response: JSON.stringify({
                    deficiencies: hasGaps ? ["Protein", "Vitamin D", "Iron"] : ["General Hydration"],
                    severity: hasGaps ? "medium" : "low",
                    suggestions: ["Eat more protein-rich foods like dal, paneer, or eggs.", "Track your food daily for better accuracy."],
                    foods_to_add: ["Dal", "Paneer", "Leafy Greens", "Nuts"]
                })
            };
        }

        let deficiencyData;
        try {
            deficiencyData = JSON.parse(aiResponse.response);
        } catch (e) {
            console.error('JSON Parse error in checkDeficiency:', e);
            deficiencyData = {
                deficiencies: ["Protein", "Fiber"],
                severity: 'low',
                suggestions: ['Log more meals to get a detailed AI analysis!'],
                foods_to_add: ['Green Vegetables', 'Pulses'],
            };
        }

        res.status(200).json({ success: true, data: deficiencyData });

    } catch (error) {
        console.error('CheckDeficiency error:', error);
        res.status(500).json({ 
            success: false, 
            message: `Server Error: ${error.message || 'Unknown error'}`,
            stack: error.stack
        });
    }
};

// ================== MEAL PLAN SUGGESTION ==================
const getMealPlanSuggestion = async (req, res) => {
    try {
        const userId = req.user.id;

        // User profile lo
        const [profile] = await db.query(
            `SELECT u.name, u.age, u.gender, u.state, p.goal, p.diet_type,
        p.workout_type, p.daily_calorie_target, p.protein_target,
        p.carbs_target, p.fat_target
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE u.id = ?`,
            [userId]
        );

        const userProfile = profile[0];

        const prompt = `Create a simple one day Indian meal plan for this user:
- Age: ${userProfile?.age}, Gender: ${userProfile?.gender}
- State: ${userProfile?.state} (suggest regional Indian foods)
- Goal: ${userProfile?.goal}
- Diet Type: ${userProfile?.diet_type}
- Daily Calorie Target: ${userProfile?.daily_calorie_target} kcal
- Protein Target: ${userProfile?.protein_target}g

Rules:
- Suggest simple, easily available Indian foods
- Foods should be affordable and common
- Keep it realistic for someone from ${userProfile?.state}
- No exotic or expensive ingredients

Reply ONLY in this JSON format, nothing else:
{
  "breakfast": { "meal": "food name", "calories": number, "protein": number, "tip": "one line tip" },
  "lunch": { "meal": "food name", "calories": number, "protein": number, "tip": "one line tip" },
  "dinner": { "meal": "food name", "calories": number, "protein": number, "tip": "one line tip" },
  "snacks": { "meal": "food name", "calories": number, "protein": number, "tip": "one line tip" },
  "total_calories": number,
  "total_protein": number
}`;

        const aiResponse = await askAI(prompt);

        let mealPlan;
        try {
            const cleanResponse = aiResponse.response
                .replace(/```json/g, '')
                .replace(/```/g, '')
                .trim();
            mealPlan = JSON.parse(cleanResponse);
        } catch (e) {
            return res.status(500).json({
                success: false,
                message: 'Could not generate meal plan, try again!',
            });
        }

        res.status(200).json({
            success: true,
            meal_plan: mealPlan,
            calorie_target: userProfile?.daily_calorie_target,
        });

    } catch (error) {
        console.error('MealPlanSuggestion error:', error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong!',
        });
    }
};
module.exports = { getDailySuggestion, aiChat, checkDeficiency, getMealPlanSuggestion };