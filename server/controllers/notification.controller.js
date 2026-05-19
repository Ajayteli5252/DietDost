const db = require('../config/db');
const { sendMealReminder, sendWaterReminder, sendStreakReminder } = require('../utils/sendNotification');

// ================== GET SETTINGS ==================
const getSettings = async (req, res) => {
    try {
        const userId = req.user.id;

        let [settings] = await db.query(
            'SELECT * FROM notification_settings WHERE user_id = ?',
            [userId]
        );

        // First time - create default settings
        if (settings.length === 0) {
            await db.query(
                'INSERT INTO notification_settings (user_id) VALUES (?)',
                [userId]
            );
            [settings] = await db.query(
                'SELECT * FROM notification_settings WHERE user_id = ?',
                [userId]
            );
        }

        res.status(200).json({
            success: true,
            settings: settings[0],
        });

    } catch (error) {
        console.error('GetSettings error:', error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong!',
        });
    }
};

// ================== UPDATE SETTINGS ==================
const updateSettings = async (req, res) => {
    try {
        const userId = req.user.id;
        const { meal_reminder, water_reminder, streak_reminder, reminder_time } = req.body;

        await db.query(
            `UPDATE notification_settings SET
        meal_reminder = ?,
        water_reminder = ?,
        streak_reminder = ?,
        reminder_time = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?`,
            [meal_reminder, water_reminder, streak_reminder, reminder_time, userId]
        );

        res.status(200).json({
            success: true,
            message: 'Notification settings updated!',
        });

    } catch (error) {
        console.error('UpdateSettings error:', error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong!',
        });
    }
};

// ================== SEND TEST NOTIFICATION ==================
const sendTestNotification = async (req, res) => {
    try {
        const userId = req.user.id;
        const { type } = req.body;

        const [user] = await db.query(
            'SELECT name, email FROM users WHERE id = ?',
            [userId]
        );

        if (user.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found!',
            });
        }

        const { name, email } = user[0];

        if (type === 'meal') {
            await sendMealReminder(email, name);
        } else if (type === 'water') {
            await sendWaterReminder(email, name);
        } else if (type === 'streak') {
            const [streak] = await db.query(
                'SELECT current_streak FROM streaks WHERE user_id = ?',
                [userId]
            );
            const currentStreak = streak[0]?.current_streak || 0;
            await sendStreakReminder(email, name, currentStreak);
        }

        res.status(200).json({
            success: true,
            message: `Test ${type} notification sent to ${email}!`,
        });

    } catch (error) {
        console.error('SendTestNotification error:', error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong!',
        });
    }
};

// ================== CRON JOB - Send Daily Notifications ==================
const sendDailyNotifications = async () => {
    try {
        // IST = UTC + 5 hours 30 minutes
        // toLocaleTimeString is unreliable on some servers — manual offset is guaranteed
        const now = new Date();
        const istOffsetMs = (5 * 60 + 30) * 60 * 1000;
        const istDate = new Date(now.getTime() + istOffsetMs);
        const hours = String(istDate.getUTCHours()).padStart(2, '0');
        const minutes = String(istDate.getUTCMinutes()).padStart(2, '0');
        const istTime = `${hours}:${minutes}`;

        console.log(`[Cron] UTC Time: ${now.toISOString()} | IST Time: ${istTime}`);

        // Get only users whose reminder_time matches current IST HH:mm
        const [users] = await db.query(
            `SELECT u.id, u.name, u.email,
        ns.meal_reminder, ns.water_reminder, ns.streak_reminder, ns.reminder_time
      FROM users u
      JOIN notification_settings ns ON u.id = ns.user_id
      WHERE u.is_verified = true
      AND ns.reminder_time = ?
      AND (ns.meal_reminder = true OR ns.water_reminder = true OR ns.streak_reminder = true)`,
            [istTime]
        );

        console.log(`[Cron] Found ${users.length} user(s) scheduled for ${istTime}`);

        if (users.length === 0) return;

        for (const user of users) {
            try {
                console.log(`[Cron] Processing user: ${user.email}`);

                // Check aaj meal log kiya ya nahi (IST Date)
                const todayIST = new Date(now.getTime() + istOffsetMs)
                    .toISOString().slice(0, 10); // YYYY-MM-DD format

                const [todayMeals] = await db.query(
                    'SELECT id FROM food_logs WHERE user_id = ? AND log_date = ? LIMIT 1',
                    [user.id, todayIST]
                );

                const loggedToday = todayMeals.length > 0;
                console.log(`[Cron] User ${user.id} logged today: ${loggedToday}`);

                // Meal reminder - agar aaj log nahi kiya
                if (user.meal_reminder && !loggedToday) {
                    await sendMealReminder(user.email, user.name);
                    await createNotification(user.id, 'meal', '🍽️ Don\'t forget to log your meals today!');
                    console.log(`[Cron] Meal reminder sent to ${user.email}`);
                }

                // Water reminder - always send
                if (user.water_reminder) {
                    await sendWaterReminder(user.email, user.name);
                    await createNotification(user.id, 'water', '💧 Stay hydrated! Have you had enough water today?');
                    console.log(`[Cron] Water reminder sent to ${user.email}`);
                }

                // Streak reminder - agar streak hai aur aaj log nahi kiya
                if (user.streak_reminder && !loggedToday) {
                    const [streak] = await db.query(
                        'SELECT current_streak FROM streaks WHERE user_id = ?',
                        [user.id]
                    );
                    const currentStreak = streak[0]?.current_streak || 0;
                    if (currentStreak > 0) {
                        await sendStreakReminder(user.email, user.name, currentStreak);
                        await createNotification(user.id, 'streak', `🔥 Don't break your ${currentStreak} day streak! Log a meal now.`);
                        console.log(`[Cron] Streak reminder sent to ${user.email} (streak: ${currentStreak})`);
                    }
                }

            } catch (userError) {
                console.error(`[Cron] Error for user ${user.id}:`, userError.message);
            }
        }

        console.log(`[Cron] Done! Notifications sent for time slot ${istTime}.`);

    } catch (error) {
        console.error('[Cron] Fatal error:', error.message);
    }
};

// ================== GET NOTIFICATIONS (In-App) ==================
const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const [notifications] = await db.query(
            'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
            [userId]
        );

        res.status(200).json({
            success: true,
            notifications,
        });
    } catch (error) {
        console.error('GetNotifications error:', error);
        res.status(500).json({ success: false, message: 'Error fetching notifications' });
    }
};

// ================== MARK ALL AS READ ==================
const markNotificationsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        await db.query(
            'UPDATE notifications SET is_read = true WHERE user_id = ? AND is_read = false',
            [userId]
        );

        res.status(200).json({ success: true, message: 'Notifications marked as read' });
    } catch (error) {
        console.error('MarkRead error:', error);
        res.status(500).json({ success: false, message: 'Error updating notifications' });
    }
};

// ================== INTERNAL HELPER: CREATE NOTIFICATION ==================
const createNotification = async (userId, type, message) => {
    try {
        await db.query(
            'INSERT INTO notifications (user_id, type, message) VALUES (?, ?, ?)',
            [userId, type, message]
        );
        return true;
    } catch (error) {
        console.error('CreateNotification error:', error);
        return false;
    }
};

// ================== DELETE ALL NOTIFICATIONS ==================
const deleteAllNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        await db.query('DELETE FROM notifications WHERE user_id = ?', [userId]);

        res.status(200).json({ success: true, message: 'All notifications cleared' });
    } catch (error) {
        console.error('DeleteAll error:', error);
        res.status(500).json({ success: false, message: 'Error clearing notifications' });
    }
};

module.exports = {
    getSettings,
    updateSettings,
    sendTestNotification,
    sendDailyNotifications,
    getNotifications,
    markNotificationsRead,
    createNotification,
    deleteAllNotifications,
};