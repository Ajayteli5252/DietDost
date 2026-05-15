const db = require('../config/db');
const { createNotification } = require('./notification.controller');

// ================== GET STREAK ==================
const getStreak = async (req, res) => {
    try {
        const userId = req.user.id;

        // Streak record lo
        let [streak] = await db.query(
            'SELECT * FROM streaks WHERE user_id = ?',
            [userId]
        );

        // Pehli baar hai to create karo
        if (streak.length === 0) {
            await db.query(
                'INSERT INTO streaks (user_id, current_streak, longest_streak) VALUES (?, 0, 0)',
                [userId]
            );
            return res.status(200).json({
                success: true,
                data: {
                    current_streak: 0,
                    longest_streak: 0,
                    last_log_date: null,
                    badge: getBadge(0),
                },
            });
        }

        const streakData = streak[0];

        // Aaj log kiya ya nahi check karo
        const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
        const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
        const lastLogDate = streakData.last_log_date
            ? new Date(streakData.last_log_date).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
            : null;

        // Agar last log 2 din se pehle hai to streak reset
        if (lastLogDate && lastLogDate < yesterday) {
            await db.query(
                'UPDATE streaks SET current_streak = 0 WHERE user_id = ?',
                [userId]
            );
            streakData.current_streak = 0;
        }

        res.status(200).json({
            success: true,
            data: {
                current_streak: streakData.current_streak,
                longest_streak: streakData.longest_streak,
                last_log_date: lastLogDate,
                logged_today: lastLogDate === today,
                badge: getBadge(streakData.current_streak),
            },
        });

    } catch (error) {
        console.error('GetStreak error:', error);
        res.status(500).json({
            success: false,
            message: 'Kuch gadbad ho gayi!',
        });
    }
};

// ================== UPDATE STREAK ==================
const updateStreak = async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
        const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

        // Streak record lo
        let [streak] = await db.query(
            'SELECT * FROM streaks WHERE user_id = ?',
            [userId]
        );

        // Pehli baar hai to create karo
        if (streak.length === 0) {
            await db.query(
                'INSERT INTO streaks (user_id, current_streak, longest_streak, last_log_date) VALUES (?, 1, 1, ?)',
                [userId, today]
            );
            await createNotification(userId, 'streak', '🌱 Streak shuru ho gayi! Kal bhi log karna!');
            return res.status(200).json({
                success: true,
                data: {
                    current_streak: 1,
                    longest_streak: 1,
                    badge: getBadge(1),
                    message: '🔥 Streak shuru ho gayi!',
                },
            });
        }

        const streakData = streak[0];
        const lastLogDate = streakData.last_log_date
            ? new Date(streakData.last_log_date).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
            : null;

        // Aaj already log kiya hai
        if (lastLogDate === today) {
            return res.status(200).json({
                success: true,
                data: {
                    current_streak: streakData.current_streak,
                    longest_streak: streakData.longest_streak,
                    badge: getBadge(streakData.current_streak),
                    message: 'Aaj already log kiya hai!',
                },
            });
        }

        let newStreak;
        let oldBadge = getBadge(streakData.current_streak);

        // Kal log kiya tha - streak continue
        if (lastLogDate === yesterday) {
            newStreak = streakData.current_streak + 1;
        } else {
            // Miss ho gaya - reset
            newStreak = 1;
        }

        const newLongest = Math.max(newStreak, streakData.longest_streak);
        const newBadge = getBadge(newStreak);

        await db.query(
            `UPDATE streaks SET 
        current_streak = ?, 
        longest_streak = ?,
        last_log_date = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?`,
            [newStreak, newLongest, today, userId]
        );

        // Trigger Notifications
        if (newStreak === 1 && streakData.current_streak > 0) {
            await createNotification(userId, 'streak', '😴 Streak reset ho gayi, par koi baat nahi! Nayi shuruat karo! 🌱');
        } else if (newStreak > 1) {
            await createNotification(userId, 'streak', `🔥 Streak updated: ${newStreak} days! Keep it up!`);
        }

        // New Badge Alert
        if (newBadge.name !== oldBadge.name && newStreak > 0) {
            await createNotification(userId, 'badge', `🏆 Congrats! You earned the ${newBadge.icon} ${newBadge.name} badge!`);
        }

        res.status(200).json({
            success: true,
            data: {
                current_streak: newStreak,
                longest_streak: newLongest,
                badge: newBadge,
                message: getStreakMessage(newStreak),
            },
        });

    } catch (error) {
        console.error('UpdateStreak error:', error);
        res.status(500).json({
            success: false,
            message: 'Kuch gadbad ho gayi!',
        });
    }
};

// ================== BADGE LOGIC ==================
const getBadge = (streak) => {
    if (streak >= 365) return { icon: '👑', name: 'Legend', color: 'text-yellow-500' };
    if (streak >= 180) return { icon: '💎', name: 'Diamond', color: 'text-blue-400' };
    if (streak >= 90) return { icon: '🏆', name: 'Champion', color: 'text-yellow-600' };
    if (streak >= 30) return { icon: '🥇', name: 'Gold', color: 'text-yellow-500' };
    if (streak >= 14) return { icon: '🥈', name: 'Silver', color: 'text-gray-400' };
    if (streak >= 7) return { icon: '🥉', name: 'Bronze', color: 'text-orange-400' };
    if (streak >= 3) return { icon: '🔥', name: 'On Fire', color: 'text-orange-500' };
    if (streak >= 1) return { icon: '⭐', name: 'Beginner', color: 'text-green-500' };
    return { icon: '😴', name: 'Start Karo', color: 'text-gray-400' };
};

const getStreakMessage = (streak) => {
    if (streak === 1) return '🌱 Shuru ho gaya! Kal bhi aana!';
    if (streak === 3) return '🔥 3 din! Accha chal raha hai!';
    if (streak === 7) return '🎉 1 hafta! Bronze badge mila!';
    if (streak === 14) return '💪 2 hafte! Silver badge mila!';
    if (streak === 30) return '🏆 1 mahina! Gold badge mila!';
    if (streak === 90) return '👑 3 mahine! Champion ban gaye!';
    return `🔥 ${streak} din ka streak! Keep going!`;
};

module.exports = { getStreak, updateStreak };