const db = require('../config/db');

// ================== ADD WEIGHT ==================
const addWeight = async (req, res) => {
    try {
        const userId = req.user.id;
        const { weight, note } = req.body;
        const today = new Date().toISOString().split('T')[0];

        if (!weight || weight < 20 || weight > 300) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid weight (20-300 kg)!',
            });
        }

        // Already logged today?
        const [existing] = await db.query(
            'SELECT id FROM weight_logs WHERE user_id = ? AND log_date = ?',
            [userId, today]
        );

        if (existing.length > 0) {
            await db.query(
                'UPDATE weight_logs SET weight = ?, note = ? WHERE user_id = ? AND log_date = ?',
                [weight, note || null, userId, today]
            );
        } else {
            await db.query(
                'INSERT INTO weight_logs (user_id, weight, note, log_date) VALUES (?, ?, ?, ?)',
                [userId, weight, note || null, today]
            );
        }

        // Update user profile weight
        await db.query(
            'UPDATE user_profiles SET weight = ? WHERE user_id = ?',
            [weight, userId]
        );

        res.status(200).json({
            success: true,
            message: 'Weight logged successfully!',
            weight: weight,
        });

    } catch (error) {
        console.error('AddWeight error:', error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong!',
        });
    }
};

// ================== GET WEEKLY WEIGHT ==================
const getWeeklyWeight = async (req, res) => {
    try {
        const userId = req.user.id;

        const [weights] = await db.query(
            `SELECT weight, log_date, note
      FROM weight_logs
      WHERE user_id = ? AND log_date >= (CURRENT_DATE - INTERVAL '7 day')
      ORDER BY log_date ASC`,
            [userId]
        );

        // Get user target weight from profile
        const [profile] = await db.query(
            'SELECT weight, height FROM user_profiles WHERE user_id = ?',
            [userId]
        );

        res.status(200).json({
            success: true,
            weights: weights,
            current_weight: profile[0]?.weight || null,
            height: profile[0]?.height || null,
        });

    } catch (error) {
        console.error('GetWeeklyWeight error:', error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong!',
        });
    }
};

// ================== GET ALL WEIGHT HISTORY ==================
const getWeightHistory = async (req, res) => {
    try {
        const userId = req.user.id;

        const [weights] = await db.query(
            `SELECT weight, log_date, note
      FROM weight_logs
      WHERE user_id = ?
      ORDER BY log_date DESC
      LIMIT 30`,
            [userId]
        );

        res.status(200).json({
            success: true,
            weights: weights,
        });

    } catch (error) {
        console.error('GetWeightHistory error:', error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong!',
        });
    }
};

module.exports = { addWeight, getWeeklyWeight, getWeightHistory };