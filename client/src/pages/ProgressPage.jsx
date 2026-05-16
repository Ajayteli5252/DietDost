import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { mealApi } from '../api/mealApi';
import { weightApi } from '../api/weightApi';
import { formatDate } from '../utils/calorieHelper';

// Meal type icon helper
const mealIcon = (type) => {
    const icons = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snacks: '🍎' };
    return icons[type] || '🍽️';
};

const ProgressPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('calories');

    // Calories state
    const [summary, setSummary] = useState([]);
    const [caloriesLoading, setCaloriesLoading] = useState(true);

    // "What I Ate" state
    const [selectedDay, setSelectedDay] = useState(null);      // { date, label }
    const [dayMeals, setDayMeals] = useState(null);            // { meals, totals }
    const [dayMealsLoading, setDayMealsLoading] = useState(false);

    // Weight state
    const [weeklyWeights, setWeeklyWeights] = useState([]);
    const [weightHistory, setWeightHistory] = useState([]);
    const [currentWeight, setCurrentWeight] = useState(null);
    const [height, setHeight] = useState(null);
    const [weightInput, setWeightInput] = useState('');
    const [noteInput, setNoteInput] = useState('');
    const [weightLoading, setWeightLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCalories();
        fetchWeightData();
    }, []);

    const fetchCalories = async () => {
        try {
            const res = await mealApi.getWeeklySummary();
            if (res.success) setSummary(res.summary);
        } catch (error) {
            console.error('Progress error:', error);
        } finally {
            setCaloriesLoading(false);
        }
    };

    // Normalize any date value → "YYYY-MM-DD" string (handles Date objects from MySQL)
    const toDateStr = (d) => {
        if (!d) return '';
        if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
        return new Date(d).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    };

    // Fetch meals for a specific day
    const fetchDayMeals = async (rawDate, label) => {
        const date = toDateStr(rawDate);
        // Toggle off if same day clicked again
        if (selectedDay?.date === date) {
            setSelectedDay(null);
            setDayMeals(null);
            return;
        }
        setSelectedDay({ date, label });
        setDayMealsLoading(true);
        setDayMeals(null);
        try {
            const res = await mealApi.getMealsByDate(date);
            if (res.success) setDayMeals(res);
        } catch (e) {
            console.error('DayMeals error:', e);
        } finally {
            setDayMealsLoading(false);
        }
    };

    const fetchWeightData = async () => {
        try {
            setWeightLoading(true);
            const [weekly, history] = await Promise.all([
                weightApi.getWeeklyWeight().catch(err => ({ success: false, weights: [] })),
                weightApi.getWeightHistory().catch(err => ({ success: false, weights: [] })),
            ]);

            console.log('Weight weekly res:', weekly);
            console.log('Weight history res:', history);

            if (weekly && weekly.success) {
                setWeeklyWeights(weekly.weights || []);
                setCurrentWeight(weekly.current_weight || null);
                setHeight(weekly.height || null);
            }
            if (history && history.success) {
                setWeightHistory(history.weights || []);
            }
        } catch (error) {
            console.error('Weight fetch error:', error);
        } finally {
            setWeightLoading(false);
        }
    };

    const handleAddWeight = async () => {
        if (!weightInput) {
            setError('Please enter your weight!');
            return;
        }
        try {
            setAdding(true);
            setError('');
            const res = await weightApi.addWeight(parseFloat(weightInput), noteInput);
            if (res.success) {
                setSuccess('Weight logged successfully! ✅');
                setWeightInput('');
                setNoteInput('');
                await fetchWeightData();
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err) {
            setError('Something went wrong!');
        } finally {
            setAdding(false);
        }
    };

    // BMI Calculate
    const calculateBMI = (weight, height) => {
        if (!weight || !height) return null;
        return (weight / ((height / 100) ** 2)).toFixed(1);
    };

    const getBMIStatus = (bmi) => {
        if (!bmi) return null;
        if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-500', bg: 'bg-blue-50' };
        if (bmi < 25) return { label: 'Normal', color: 'text-green-500', bg: 'bg-green-50' };
        if (bmi < 30) return { label: 'Overweight', color: 'text-yellow-500', bg: 'bg-yellow-50' };
        return { label: 'Obese', color: 'text-red-500', bg: 'bg-red-50' };
    };

    const maxCalories = Math.max(...summary.map((d) => d.total_calories || 0), 1);

    // Weight graph
    const maxWeight = Math.max(...weeklyWeights.map((w) => w.weight || 0), 1);
    const minWeight = Math.min(...weeklyWeights.map((w) => w.weight || 0), maxWeight);
    const weightRange = maxWeight - minWeight || 1;

    const bmi = calculateBMI(currentWeight, height);
    const bmiStatus = getBMIStatus(bmi);

    const tabs = [
        { id: 'calories', label: '🔥 Calories', },
        { id: 'weight', label: '⚖️ Weight', },
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">📊 Progress</h1>

                {/* Tabs */}
                <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-gray-100 mb-6">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${activeTab === tab.id
                                    ? 'bg-green-600 text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ============ CALORIES TAB ============ */}
                {activeTab === 'calories' && (
                    <div className="space-y-6">
                        {/* Weekly Chart */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h2 className="font-bold text-gray-800 mb-6">Last 7 Days Calories</h2>

                            {caloriesLoading ? (
                                <div className="h-40 bg-gray-100 rounded-xl animate-pulse"></div>
                            ) : summary.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-5xl mb-3">📊</p>
                                    <p className="text-gray-500">No data yet!</p>
                                    <p className="text-gray-400 text-sm mt-1">Log meals to see progress</p>
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
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {[
                                    { label: 'Avg Calories', value: Math.round(summary.reduce((a, b) => a + (b.total_calories || 0), 0) / summary.length), unit: 'kcal', color: 'text-orange-500', icon: '🔥' },
                                    { label: 'Avg Protein', value: Math.round(summary.reduce((a, b) => a + (b.total_protein || 0), 0) / summary.length), unit: 'g', color: 'text-green-600', icon: '🥩' },
                                    { label: 'Avg Carbs', value: Math.round(summary.reduce((a, b) => a + (b.total_carbs || 0), 0) / summary.length), unit: 'g', color: 'text-blue-600', icon: '🍚' },
                                    { label: 'Avg Fat', value: Math.round(summary.reduce((a, b) => a + (b.total_fat || 0), 0) / summary.length), unit: 'g', color: 'text-orange-400', icon: '🥑' },
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

                        {/* Daily Breakdown — clickable rows */}
                        {summary.length > 0 && (
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="font-bold text-gray-800">Daily Breakdown</h2>
                                    <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">Tap a day to see meals 👇</span>
                                </div>
                                <div className="space-y-2">
                                    {summary.map((day, index) => {
                                        const dateStr = toDateStr(day.log_date);
                                        const isSelected = selectedDay?.date === dateStr;
                                        // Human-friendly label
                                        const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
                                        const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
                                        const label = dateStr === today ? 'Today' : dateStr === yesterday ? 'Yesterday' : formatDate(day.log_date);

                                        return (
                                            <div key={index}>
                                                {/* Row */}
                                                <button
                                                    onClick={() => fetchDayMeals(day.log_date, label)}
                                                    className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all text-left ${
                                                        isSelected
                                                            ? 'bg-green-50 border border-green-200'
                                                            : 'bg-gray-50 hover:bg-gray-100'
                                                    }`}
                                                >
                                                    <div className="w-24 shrink-0">
                                                        <p className={`text-sm font-semibold ${
                                                            isSelected ? 'text-green-700' : 'text-gray-700'
                                                        }`}>{label}</p>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-2 rounded-full transition-all duration-500 ${
                                                                    isSelected ? 'bg-green-500' : 'bg-green-400'
                                                                }`}
                                                                style={{ width: `${((day.total_calories || 0) / maxCalories) * 100}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <p className="text-sm font-bold text-orange-500">
                                                            {Math.round(day.total_calories || 0)} kcal
                                                        </p>
                                                        <span className={`text-gray-400 transition-transform duration-200 ${
                                                            isSelected ? 'rotate-180' : ''
                                                        }`}>▾</span>
                                                    </div>
                                                </button>

                                                {/* Expanded: What I Ate Panel */}
                                                {isSelected && (
                                                    <div className="mt-2 mb-1 mx-1 bg-white border border-green-100 rounded-2xl overflow-hidden shadow-sm">
                                                        {/* Panel header */}
                                                        <div className="bg-gradient-to-r from-green-500 to-emerald-400 px-5 py-3 flex items-center justify-between">
                                                            <div>
                                                                <p className="text-white text-xs opacity-80 font-medium">What I Ate</p>
                                                                <p className="text-white font-bold text-base">{label}</p>
                                                            </div>
                                                            {dayMeals && (
                                                                <div className="flex gap-3 text-center">
                                                                    {[
                                                                        { label: 'kcal', val: Math.round(dayMeals.totals.calories) },
                                                                        { label: 'P', val: `${Math.round(dayMeals.totals.protein)}g` },
                                                                        { label: 'C', val: `${Math.round(dayMeals.totals.carbs)}g` },
                                                                        { label: 'F', val: `${Math.round(dayMeals.totals.fat)}g` },
                                                                    ].map(m => (
                                                                        <div key={m.label} className="bg-white/20 rounded-xl px-2 py-1">
                                                                            <p className="text-white text-sm font-bold leading-none">{m.val}</p>
                                                                            <p className="text-white text-[10px] opacity-80">{m.label}</p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Meals list */}
                                                        <div className="p-4">
                                                            {dayMealsLoading ? (
                                                                <div className="space-y-2 animate-pulse">
                                                                    {[1,2,3].map(i => (
                                                                        <div key={i} className="h-14 bg-gray-100 rounded-xl"></div>
                                                                    ))}
                                                                </div>
                                                            ) : dayMeals?.meals?.length === 0 ? (
                                                                <div className="text-center py-4">
                                                                    <p className="text-3xl mb-2">🍽️</p>
                                                                    <p className="text-gray-400 text-sm">No meals logged this day</p>
                                                                </div>
                                                            ) : (
                                                                <div className="space-y-2">
                                                                    {dayMeals?.meals?.map((meal, mi) => (
                                                                        <div key={mi} className="flex items-start gap-3 bg-gray-50 rounded-xl p-3">
                                                                            <span className="text-xl mt-0.5">{mealIcon(meal.meal_type)}</span>
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className="text-xs font-semibold text-gray-500 capitalize mb-0.5">{meal.meal_type}</p>
                                                                                <p className="text-sm text-gray-800 font-medium leading-snug line-clamp-2">{meal.food_description}</p>
                                                                            </div>
                                                                            <div className="text-right shrink-0">
                                                                                <p className="text-sm font-bold text-orange-500">{Math.round(meal.calories)} kcal</p>
                                                                                <p className="text-[10px] text-gray-400">P:{Math.round(meal.protein)}g C:{Math.round(meal.carbs)}g F:{Math.round(meal.fat)}g</p>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ============ WEIGHT TAB ============ */}
                {activeTab === 'weight' && (
                    <div className="space-y-6">

                        {/* Log Weight Card */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h2 className="font-bold text-gray-800 mb-4">⚖️ Log Today's Weight</h2>

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">
                                    ⚠️ {error}
                                </div>
                            )}
                            {success && (
                                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl mb-4 text-sm">
                                    {success}
                                </div>
                            )}

                            <div className="flex gap-3 mb-3">
                                <div className="relative flex-1">
                                    <input
                                        type="number"
                                        value={weightInput}
                                        onChange={(e) => setWeightInput(e.target.value)}
                                        placeholder="Enter weight"
                                        min="20"
                                        max="300"
                                        step="0.1"
                                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg font-bold focus:outline-none focus:border-green-500 transition-all"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">kg</span>
                                </div>
                                <button
                                    onClick={handleAddWeight}
                                    disabled={adding || !weightInput}
                                    className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white px-6 rounded-xl font-semibold transition-all"
                                >
                                    {adding ? '...' : 'Log'}
                                </button>
                            </div>

                            <input
                                type="text"
                                value={noteInput}
                                onChange={(e) => setNoteInput(e.target.value)}
                                placeholder="Add a note (optional) - e.g. after workout"
                                className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-green-500 transition-all"
                            />
                        </div>

                        {/* BMI Card */}
                        {bmi && (
                            <div className={`${bmiStatus?.bg} rounded-2xl p-6 border border-gray-100`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Current BMI</p>
                                        <p className={`text-4xl font-black ${bmiStatus?.color}`}>{bmi}</p>
                                        <p className={`font-semibold mt-1 ${bmiStatus?.color}`}>{bmiStatus?.label}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500">Current Weight</p>
                                        <p className="text-2xl font-bold text-gray-800">{currentWeight} kg</p>
                                        <p className="text-sm text-gray-400">{height} cm tall</p>
                                    </div>
                                </div>

                                {/* BMI Scale */}
                                <div className="mt-4">
                                    <div className="flex h-3 rounded-full overflow-hidden">
                                        <div className="flex-1 bg-blue-400"></div>
                                        <div className="flex-1 bg-green-400"></div>
                                        <div className="flex-1 bg-yellow-400"></div>
                                        <div className="flex-1 bg-red-400"></div>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                                        <span>Under</span>
                                        <span>Normal</span>
                                        <span>Over</span>
                                        <span>Obese</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Weekly Weight Graph */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h2 className="font-bold text-gray-800 mb-6">Last 7 Days Weight</h2>

                            {weightLoading ? (
                                <div className="h-40 bg-gray-100 rounded-xl animate-pulse"></div>
                            ) : weeklyWeights.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-5xl mb-3">⚖️</p>
                                    <p className="text-gray-500">No weight logged yet!</p>
                                    <p className="text-gray-400 text-sm mt-1">Log your weight above to see the graph</p>
                                </div>
                            ) : (
                                <div className="flex items-end gap-3 h-40">
                                    {weeklyWeights.map((day, index) => {
                                        const normalizedHeight = ((day.weight - minWeight) / weightRange) * 70 + 20;
                                        return (
                                            <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                                <p className="text-xs text-gray-500 font-bold">{day.weight}</p>
                                                <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: '100px' }}>
                                                    <div
                                                        className="absolute bottom-0 w-full bg-blue-500 rounded-t-lg transition-all duration-700"
                                                        style={{ height: `${normalizedHeight}%` }}
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

                        {/* Weight History */}
                        {weightHistory.length > 0 && (
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <h2 className="font-bold text-gray-800 mb-4">Weight History</h2>
                                <div className="space-y-3">
                                    {weightHistory.map((log, index) => {
                                        const prev = weightHistory[index + 1];
                                        const diff = prev ? (log.weight - prev.weight).toFixed(1) : null;
                                        return (
                                            <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-700">
                                                        {formatDate(log.log_date)}
                                                    </p>
                                                    {log.note && (
                                                        <p className="text-xs text-gray-400 mt-0.5">{log.note}</p>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {diff !== null && (
                                                        <span className={`text-xs font-semibold ${diff > 0 ? 'text-red-400' : diff < 0 ? 'text-green-500' : 'text-gray-400'
                                                            }`}>
                                                            {diff > 0 ? `+${diff}` : diff} kg
                                                        </span>
                                                    )}
                                                    <p className="text-lg font-bold text-gray-800">{log.weight} kg</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
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