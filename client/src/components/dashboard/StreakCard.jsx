import { useState, useEffect } from 'react';
import { streakApi } from '../../api/streakApi';

const StreakCard = () => {
    const [streakData, setStreakData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStreak();
    }, []);

    const fetchStreak = async () => {
        try {
            const res = await streakApi.getStreak();
            if (res.success) setStreakData(res.data);
        } catch (error) {
            console.error('Streak fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-20 bg-gray-200 rounded-xl"></div>
            </div>
        );
    }

    const streak = streakData?.current_streak || 0;
    const longest = streakData?.longest_streak || 0;
    const badge = streakData?.badge;
    const loggedToday = streakData?.logged_today;

    // Last 7 days circles
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const isToday = i === 6;

        // Simple logic - streak ke hisaab se fill karo
        const daysAgo = 6 - i;
        const isFilled = daysAgo < streak || (isToday && loggedToday);

        return { dayName, isFilled, isToday };
    });

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            {/* Header */}
            <div className="flex justify-between items-center mb-5">
                <h3 className="font-bold text-gray-800">🔥 Streak</h3>
                <span className={`text-xs font-bold px-3 py-1 rounded-full bg-orange-50 text-orange-500`}>
                    {badge?.icon} {badge?.name}
                </span>
            </div>

            {/* Main Streak Number */}
            <div className="flex items-center gap-6 mb-6">
                <div className="text-center">
                    <div className="flex items-end gap-1">
                        <span className="text-5xl font-black text-orange-500">{streak}</span>
                        <span className="text-lg text-gray-400 mb-1">days</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Current Streak</p>
                </div>

                <div className="h-12 w-px bg-gray-100"></div>

                <div className="text-center">
                    <div className="flex items-end gap-1">
                        <span className="text-3xl font-bold text-gray-700">{longest}</span>
                        <span className="text-sm text-gray-400 mb-0.5">days</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Best Streak</p>
                </div>

                {/* Fire animation */}
                {streak >= 3 && (
                    <div className="ml-auto text-5xl animate-bounce">
                        🔥
                    </div>
                )}
            </div>

            {/* Last 7 Days */}
            <div className="flex justify-between mb-5">
                {last7Days.map((day, index) => (
                    <div key={index} className="flex flex-col items-center gap-2">
                        <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${day.isFilled
                                    ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                                    : day.isToday
                                        ? 'border-2 border-orange-300 text-orange-300'
                                        : 'bg-gray-100 text-gray-300'
                                }`}
                        >
                            {day.isFilled ? '🔥' : '·'}
                        </div>
                        <span className={`text-xs font-medium ${day.isToday ? 'text-orange-500' : 'text-gray-400'}`}>
                            {day.dayName}
                        </span>
                    </div>
                ))}
            </div>

            {/* Today Status */}
            {loggedToday ? (
                <div className="bg-orange-50 rounded-xl p-3 flex items-center gap-3">
                    <span className="text-2xl">✅</span>
                    <div>
                        <p className="text-sm font-semibold text-orange-700">Logged today!</p>
                        <p className="text-xs text-orange-500">Keep it up, come back tomorrow!</p>
                    </div>
                </div>
            ) : (
                <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                    <span className="text-2xl">⏰</span>
                    <div>
                        <p className="text-sm font-semibold text-gray-700">Log today's meal!</p>
                        <p className="text-xs text-gray-400">Don't break your streak!</p>
                    </div>
                </div>
            )}

            {/* Next Badge */}
            <div className="mt-4">
                {streak < 3 && (
                    <p className="text-xs text-center text-gray-400">
                        🔥 {3 - streak} more days to get <strong>On Fire</strong> badge!
                    </p>
                )}
                {streak >= 3 && streak < 7 && (
                    <p className="text-xs text-center text-gray-400">
                        🥉 {7 - streak} more days to get <strong>Bronze</strong> badge!
                    </p>
                )}
                {streak >= 7 && streak < 14 && (
                    <p className="text-xs text-center text-gray-400">
                        🥈 {14 - streak} more days to get <strong>Silver</strong> badge!
                    </p>
                )}
                {streak >= 14 && streak < 30 && (
                    <p className="text-xs text-center text-gray-400">
                        🥇 {30 - streak} more days to get <strong>Gold</strong> badge!
                    </p>
                )}
                {streak >= 30 && (
                    <p className="text-xs text-center text-gray-400">
                        🏆 You're a Champion! Keep going!
                    </p>
                )}
            </div>
        </div>
    );
};

export default StreakCard;