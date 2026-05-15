import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { mealApi } from '../api/mealApi';
import { formatDate } from '../utils/calorieHelper';

const ProgressPage = () => {
    const navigate = useNavigate();
    const [summary, setSummary] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const res = await mealApi.getWeeklySummary();
                if (res.success) setSummary(res.summary);
            } catch (error) {
                console.error('Progress error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
    }, []);

    const maxCalories = Math.max(...summary.map((d) => d.total_calories || 0), 1);

    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">📊 Weekly Progress</h1>

                {/* Weekly Chart */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                    <h2 className="font-bold text-gray-800 mb-6">Last 7 Days Calories</h2>

                    {loading ? (
                        <div className="h-40 bg-gray-100 rounded-xl animate-pulse"></div>
                    ) : summary.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-5xl mb-3">📊</p>
                            <p className="text-gray-500">No data available yet!</p>
                            <p className="text-gray-400 text-sm mt-1">Log a meal to see your progress</p>
                        </div>
                    ) : (
                        <div className="flex items-end gap-3 h-40">
                            {summary.map((day, index) => {
                                const height = ((day.total_calories || 0) / maxCalories) * 100;
                                return (
                                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                        <p className="text-xs text-gray-500 font-medium">
                                            {Math.round(day.total_calories || 0)}
                                        </p>
                                        <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: '100px' }}>
                                            <div
                                                className="absolute bottom-0 w-full bg-green-500 rounded-t-lg transition-all duration-700"
                                                style={{ height: `${height}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-gray-400">
                                            {new Date(day.log_date).toLocaleDateString('en-IN', { weekday: 'short' })}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Weekly Stats */}
                {summary.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                        {[
                            {
                                label: 'Avg Calories',
                                value: Math.round(summary.reduce((a, b) => a + (b.total_calories || 0), 0) / summary.length),
                                unit: 'kcal',
                                color: 'text-orange-500',
                                icon: '🔥',
                            },
                            {
                                label: 'Avg Protein',
                                value: Math.round(summary.reduce((a, b) => a + (b.total_protein || 0), 0) / summary.length),
                                unit: 'g',
                                color: 'text-green-600',
                                icon: '🥩',
                            },
                            {
                                label: 'Avg Carbs',
                                value: Math.round(summary.reduce((a, b) => a + (b.total_carbs || 0), 0) / summary.length),
                                unit: 'g',
                                color: 'text-blue-600',
                                icon: '🍚',
                            },
                            {
                                label: 'Avg Fat',
                                value: Math.round(summary.reduce((a, b) => a + (b.total_fat || 0), 0) / summary.length),
                                unit: 'g',
                                color: 'text-orange-400',
                                icon: '🥑',
                            },
                        ].map((stat) => (
                            <div key={stat.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
                                <p className="text-2xl mb-1">{stat.icon}</p>
                                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                                <p className="text-xs text-gray-400">{stat.unit}</p>
                                <p className="text-sm text-gray-600 font-medium mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Daily Breakdown */}
                {summary.length > 0 && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h2 className="font-bold text-gray-800 mb-4">Daily Breakdown</h2>
                        <div className="space-y-3">
                            {summary.map((day, index) => (
                                <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                                    <div className="w-24">
                                        <p className="text-sm font-medium text-gray-700">
                                            {formatDate(day.log_date)}
                                        </p>
                                    </div>
                                    <div className="flex-1">
                                        <div className="h-2 bg-gray-200 rounded-full">
                                            <div
                                                className="h-2 bg-green-500 rounded-full"
                                                style={{ width: `${((day.total_calories || 0) / maxCalories) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-orange-500">
                                            {Math.round(day.total_calories || 0)} kcal
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
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

export default ProgressPage;