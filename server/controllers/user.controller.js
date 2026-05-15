const db = require('../config/db');
const { calculateBMR, calculateCalorieTarget, calculateMacros } = require('../utils/bmrHelper');

// ================== ONBOARDING ==================
const saveOnboarding = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            height,
            weight,
            goal,
            activity_level,
            diet_type,
            workout_type,
        } = req.body;

        // Validation
        if (!height || !weight || !goal || !activity_level || !diet_type || !workout_type) {
            return res.status(400).json({
                success: false,
                message: 'Sab fields bharo!',
            });
        }

        // User ki info lo age aur gender ke liye
        const [user] = await db.query(
            'SELECT age, gender FROM users WHERE id = ?',
            [userId]
        );

        if (user.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User nahi mila!',
            });
        }

        const { age, gender } = user[0];

        // BMR calculate karo
        const bmr = calculateBMR(weight, height, age, gender);

        // Daily calorie target
        const dailyCalorieTarget = calculateCalorieTarget(bmr, activity_level, goal);

        // Macros calculate karo
        const { protein, carbs, fat } = calculateMacros(dailyCalorieTarget, goal, diet_type);

        // Profile already exists?
        const [existingProfile] = await db.query(
            'SELECT id FROM user_profiles WHERE user_id = ?',
            [userId]
        );

        if (existingProfile.length > 0) {
            // Update karo
            await db.query(
                `UPDATE user_profiles SET 
          height = ?, weight = ?, goal = ?, activity_level = ?,
          diet_type = ?, workout_type = ?, daily_calorie_target = ?,
          protein_target = ?, carbs_target = ?, fat_target = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?`,
                [height, weight, goal, activity_level, diet_type, workout_type,
                    dailyCalorieTarget, protein, carbs, fat, userId]
            );
        } else {
            // Naya profile banao
            await db.query(
                `INSERT INTO user_profiles 
          (user_id, height, weight, goal, activity_level, diet_type, workout_type,
          daily_calorie_target, protein_target, carbs_target, fat_target)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [userId, height, weight, goal, activity_level, diet_type, workout_type,
                    dailyCalorieTarget, protein, carbs, fat]
            );
        }

        // Onboarding complete mark karo
        await db.query(
            'UPDATE users SET onboarding_complete = true WHERE id = ?',
            [userId]
        );

        res.status(200).json({
            success: true,
            message: 'Profile save ho gaya!',
            data: {
                daily_calorie_target: dailyCalorieTarget,
                protein_target: protein,
                carbs_target: carbs,
                fat_target: fat,
            },
        });

    } catch (error) {
        console.error('Onboarding error:', error);
        res.status(500).json({
            success: false,
            message: 'Kuch gadbad ho gayi, dobara try karo!',
        });
    }
};

// ================== GET PROFILE ==================
const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const [profile] = await db.query(
            `SELECT u.name, u.email, u.age, u.gender, u.state,
        p.height, p.weight, p.goal, p.activity_level, p.diet_type,
        p.workout_type, p.daily_calorie_target, p.protein_target,
        p.carbs_target, p.fat_target
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE u.id = ?`,
            [userId]
        );

        if (profile.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Profile nahi mila!',
            });
        }

        res.status(200).json({
            success: true,
            profile: profile[0],
        });

    } catch (error) {
        console.error('GetProfile error:', error);
        res.status(500).json({
            success: false,
            message: 'Kuch gadbad ho gayi!',
        });
    }
};

// ================== UPDATE PROFILE ==================
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            height,
            weight,
            goal,
            activity_level,
            diet_type,
            workout_type,
        } = req.body;

        // User ki info lo
        const [user] = await db.query(
            'SELECT age, gender FROM users WHERE id = ?',
            [userId]
        );

        const { age, gender } = user[0];

        // Recalculate karo
        const bmr = calculateBMR(weight, height, age, gender);
        const dailyCalorieTarget = calculateCalorieTarget(bmr, activity_level, goal);
        const { protein, carbs, fat } = calculateMacros(dailyCalorieTarget, goal, diet_type);

        await db.query(
            `UPDATE user_profiles SET
        height = ?, weight = ?, goal = ?, activity_level = ?,
        diet_type = ?, workout_type = ?, daily_calorie_target = ?,
        protein_target = ?, carbs_target = ?, fat_target = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?`,
            [height, weight, goal, activity_level, diet_type, workout_type,
                dailyCalorieTarget, protein, carbs, fat, userId]
        );

        res.status(200).json({
            success: true,
            message: 'Profile update ho gaya!',
            data: {
                daily_calorie_target: dailyCalorieTarget,
                protein_target: protein,
                carbs_target: carbs,
                fat_target: fat,
            },
        });

    } catch (error) {
        console.error('UpdateProfile error:', error);
        res.status(500).json({
            success: false,
            message: 'Kuch gadbad ho gayi!',
        });
    }
};

module.exports = { saveOnboarding, getProfile, updateProfile };