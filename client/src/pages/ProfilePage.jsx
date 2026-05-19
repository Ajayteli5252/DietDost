import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { useAuth } from '../hooks/useAuth';
import { userApi } from '../api/userApi';
import { getGoalLabel } from '../utils/calorieHelper';
import { notificationApi } from '../api/notificationApi';

const ProfilePage = () => {
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await userApi.getProfile();
                if (res.success) setProfile(res.profile);
            } catch (error) {
                console.error('Profile error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const [notifSettings, setNotifSettings] = useState({
        meal_reminder: true,
        water_reminder: true,
        streak_reminder: true,
        reminder_time: '19:00',
    });
    const [notifLoading, setNotifLoading] = useState(false);
    const [notifSuccess, setNotifSuccess] = useState('');

    useEffect(() => {
        const fetchNotifSettings = async () => {
            try {
                const res = await notificationApi.getSettings();
                if (res.success) {
                    // Ensure reminder_time is HH:mm format for the input
                    const settings = res.settings;
                    if (settings.reminder_time && settings.reminder_time.length > 5) {
                        settings.reminder_time = settings.reminder_time.substring(0, 5);
                    }
                    setNotifSettings(settings);
                }
            } catch (error) {
                console.error('Notification settings error:', error);
            }
        };
        fetchNotifSettings();
    }, []);

    const handleNotifUpdate = async (key, value) => {
        const updated = { ...notifSettings, [key]: value };
        setNotifSettings(updated);
        try {
            setNotifLoading(true);
            await notificationApi.updateSettings(updated);
        } catch (error) {
            console.error('Update error:', error);
        } finally {
            setNotifLoading(false);
        }
    };

    const [testLoading, setTestLoading] = useState(false);
    const [testSuccess, setTestSuccess] = useState('');

    const handleSendTest = async (type) => {
        try {
            setTestLoading(true);
            setTestSuccess('');
            const res = await notificationApi.sendTest(type);
            if (res.success) {
                setTestSuccess(`Test ${type} notification triggered successfully! Check your email and the notification bell 🔔`);
                setTimeout(() => setTestSuccess(''), 5000);
            }
        } catch (error) {
            console.error('Test notification error:', error);
            alert('Failed to send test notification. Check console for details.');
        } finally {
            setTestLoading(false);
        }
    };

    const handleSignOut = () => {
        signOut();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
            <Navbar />

            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">👤 Profile</h1>

                {/* User Card */}
                <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-2xl p-6 mb-6 text-white">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-3xl font-bold">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">{user?.name}</h2>
                            <p className="text-green-100">{user?.email}</p>
                            <p className="text-green-100 text-sm mt-1">
                                {profile?.state} • {profile?.age} years old • {profile?.gender}
                            </p>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2].map((i) => (
                            <div key={i} className="h-32 bg-white rounded-2xl animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <>
                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            {[
                                { label: 'Height', value: `${profile?.height} cm`, icon: '📏' },
                                { label: 'Weight', value: `${profile?.weight} kg`, icon: '⚖️' },
                                { label: 'BMI', value: profile?.height && profile?.weight ? (profile.weight / ((profile.height / 100) ** 2)).toFixed(1) : '-', icon: '📊' },
                            ].map((stat) => (
                                <div key={stat.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
                                    <p className="text-2xl mb-1">{stat.icon}</p>
                                    <p className="text-lg font-bold text-gray-800">{stat.value}</p>
                                    <p className="text-xs text-gray-500">{stat.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Goals & Targets */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                            <h3 className="font-bold text-gray-800 mb-4">🎯 Goals & Targets</h3>
                            <div className="space-y-3">
                                {[
                                    { label: 'Goal', value: getGoalLabel(profile?.goal) },
                                    { label: 'Activity Level', value: profile?.activity_level?.replace('_', ' ') },
                                    { label: 'Diet Type', value: profile?.diet_type?.replace('_', ' ') },
                                    { label: 'Workout', value: profile?.workout_type?.replace('_', ' ') },
                                ].map((item) => (
                                    <div key={item.label} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                                        <span className="text-gray-500 text-sm">{item.label}</span>
                                        <span className="font-semibold text-gray-800 text-sm capitalize">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Daily Targets */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                            <h3 className="font-bold text-gray-800 mb-4">📊 Daily Targets</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { label: 'Calories', value: Math.round(profile?.daily_calorie_target || 0), unit: 'kcal', color: 'text-orange-500' },
                                    { label: 'Protein', value: Math.round(profile?.protein_target || 0), unit: 'g', color: 'text-green-600' },
                                    { label: 'Carbs', value: Math.round(profile?.carbs_target || 0), unit: 'g', color: 'text-blue-600' },
                                    { label: 'Fat', value: Math.round(profile?.fat_target || 0), unit: 'g', color: 'text-orange-400' },
                                ].map((target) => (
                                    <div key={target.label} className="bg-gray-50 rounded-xl p-4 text-center">
                                        <p className={`text-2xl font-bold ${target.color}`}>
                                            {target.value}
                                            <span className="text-sm font-normal">{target.unit}</span>
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">{target.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Update Goals Button */}
                        <button
                            onClick={() => navigate('/onboarding')}
                            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold mb-4 transition-all"
                        >
                            ✏️ Update Goals
                        </button>

                        {/* Notification Settings */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-4">
                            <h3 className="font-bold text-gray-800 mb-4">🔔 Notification Settings</h3>

                            {notifSuccess && (
                                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl mb-4 text-sm">
                                    ✅ {notifSuccess}
                                </div>
                            )}

                            <div className="space-y-4">
                                {/* Meal Reminder */}
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">🍽️</span>
                                        <div>
                                            <p className="font-medium text-gray-800 text-sm">Meal Reminder</p>
                                            <p className="text-xs text-gray-400">Daily reminder to log meals</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleNotifUpdate('meal_reminder', !notifSettings.meal_reminder)}
                                            className={`w-12 h-6 rounded-full transition-all ${notifSettings.meal_reminder ? 'bg-green-500' : 'bg-gray-200'
                                                }`}
                                        >
                                            <div className={`w-5 h-5 bg-white rounded-full shadow transition-all mx-0.5 ${notifSettings.meal_reminder ? 'translate-x-6' : 'translate-x-0'
                                                }`}></div>
                                        </button>
                                    </div>
                                </div>

                                {/* Water Reminder */}
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">💧</span>
                                        <div>
                                            <p className="font-medium text-gray-800 text-sm">Water Reminder</p>
                                            <p className="text-xs text-gray-400">Daily reminder to stay hydrated</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleNotifUpdate('water_reminder', !notifSettings.water_reminder)}
                                            className={`w-12 h-6 rounded-full transition-all ${notifSettings.water_reminder ? 'bg-blue-500' : 'bg-gray-200'
                                                }`}
                                        >
                                            <div className={`w-5 h-5 bg-white rounded-full shadow transition-all mx-0.5 ${notifSettings.water_reminder ? 'translate-x-6' : 'translate-x-0'
                                                }`}></div>
                                        </button>
                                    </div>
                                </div>

                                {/* Streak Reminder */}
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">🔥</span>
                                        <div>
                                            <p className="font-medium text-gray-800 text-sm">Streak Reminder</p>
                                            <p className="text-xs text-gray-400">Don't break your streak!</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleNotifUpdate('streak_reminder', !notifSettings.streak_reminder)}
                                            className={`w-12 h-6 rounded-full transition-all ${notifSettings.streak_reminder ? 'bg-orange-500' : 'bg-gray-200'
                                                }`}
                                        >
                                            <div className={`w-5 h-5 bg-white rounded-full shadow transition-all mx-0.5 ${notifSettings.streak_reminder ? 'translate-x-6' : 'translate-x-0'
                                                }`}></div>
                                        </button>
                                    </div>
                                </div>

                                {/* Reminder Time */}
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">⏰</span>
                                        <div>
                                            <p className="font-medium text-gray-800 text-sm">Reminder Time</p>
                                            <p className="text-xs text-gray-400">When to send daily reminders</p>
                                        </div>
                                    </div>
                                    <input
                                        type="time"
                                        value={notifSettings.reminder_time}
                                        onChange={(e) => handleNotifUpdate('reminder_time', e.target.value)}
                                        className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                                    />
                                </div>
                            </div>

                            {notifLoading && (
                                <p className="text-xs text-gray-400 text-center mt-3">Saving...</p>
                            )}
                        </div>

                        {/* Test Notifications */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-4">
                            <h3 className="font-bold text-gray-800 mb-2">🧪 Test Notifications</h3>
                            <p className="text-xs text-gray-400 mb-4">
                                Click below to instantly send a test notification to your email and notification bell.
                            </p>

                            {testSuccess && (
                                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 text-xs font-medium leading-relaxed">
                                    {testSuccess}
                                </div>
                            )}

                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    onClick={() => handleSendTest('meal')}
                                    disabled={testLoading}
                                    className="bg-green-50 hover:bg-green-100 text-green-700 py-2.5 px-2 rounded-xl text-xs font-semibold border border-green-100 transition-all disabled:opacity-50"
                                >
                                    🍽️ Meal Test
                                </button>
                                <button
                                    onClick={() => handleSendTest('water')}
                                    disabled={testLoading}
                                    className="bg-blue-50 hover:bg-blue-100 text-blue-700 py-2.5 px-2 rounded-xl text-xs font-semibold border border-blue-100 transition-all disabled:opacity-50"
                                >
                                    💧 Water Test
                                </button>
                                <button
                                    onClick={() => handleSendTest('streak')}
                                    disabled={testLoading}
                                    className="bg-orange-50 hover:bg-orange-100 text-orange-700 py-2.5 px-2 rounded-xl text-xs font-semibold border border-orange-100 transition-all disabled:opacity-50"
                                >
                                    🔥 Streak Test
                                </button>
                            </div>
                        </div>

                        {/* Sign Out */}
                        <button
                            onClick={handleSignOut}
                            className="w-full border-2 border-red-200 text-red-500 hover:bg-red-50 py-3 rounded-xl font-semibold transition-all"
                        >
                            🚪 Logout
                        </button>
                    </>
                )}
            </div>

            {/* Mobile Bottom Nav */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 md:hidden">
                <div className="flex justify-around">
                    {[
                        { icon: '🏠', label: 'Home', path: '/dashboard' },
                        { icon: '🍽️', label: 'Meals', path: '/meal-tracker' },
                        { icon: '📊', label: 'Progress', path: '/progress' },
                        { icon: '👤', label: 'Profile', path: '/profile' },
                    ].map((item) => (
                        <button
                            key={item.label}
                            onClick={() => navigate(item.path)}
                            className="flex flex-col items-center gap-1"
                        >
                            <span className="text-2xl">{item.icon}</span>
                            <span className="text-xs text-gray-500">{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;