import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { useCalorie } from '../hooks/useCalorie';
import { getMealLabel } from '../utils/calorieHelper';
import { streakApi } from '../api/streakApi';
import { aiApi } from '../api/aiApi';

// Parse **bold** markdown into <strong> elements
const renderBold = (text) => {
    if (!text) return null;
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**')
            ? <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>
            : <span key={i}>{part}</span>
    );
};

const MealTrackerPage = () => {
    const navigate = useNavigate();
    const { todayMeals, totals, targets, loading, addMeal, deleteMeal } = useCalorie();
    const [mealType, setMealType] = useState('breakfast');
    const [foodDescription, setFoodDescription] = useState('');
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [mealPlan, setMealPlan] = useState(null);
    const [mealPlanLoading, setMealPlanLoading] = useState(false);
    const [planOpen, setPlanOpen] = useState(true);

    const fetchMealPlan = async () => {
        try {
            setMealPlanLoading(true);
            const res = await aiApi.getMealPlan();
            if (res.success) setMealPlan(res.meal_plan);
        } catch (error) {
            console.error('MealPlan error:', error);
        } finally {
            setMealPlanLoading(false);
        }
    };

    const handleDeleteMeal = async (id) => {
        if (!window.confirm('Are you sure you want to delete this meal?')) return;
        
        try {
            await deleteMeal(id);
        } catch (err) {
            console.error('Delete error:', err);
        }
    };

    const handleAddMeal = async () => {
        if (!foodDescription.trim()) {
            setError('Please describe your meal!');
            return;
        }

        try {
            setAdding(true);
            setError('');
            const res = await addMeal({
                meal_type: mealType,
                food_description: foodDescription,
            });

            if (res.success) {
                setSuccess(`✅ ${Math.round(res.data.calories)} calories logged successfully!`);
                setFoodDescription('');
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err) {
            setError('Something went wrong!');
        } finally {
            setAdding(false);
        }

        // handleAddMeal ke andar, setSuccess ke baad:
        await streakApi.updateStreak();
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">🍽️ Meal Tracker</h1>

                {/* AI Meal Plan Section */}
                <div className="bg-white rounded-3xl shadow-xl shadow-green-100/50 border border-green-50 mb-8 overflow-hidden">
                    {/* Header with Gradient */}
                    <div
                        className="flex items-center justify-between p-6 cursor-pointer bg-gradient-to-r from-green-50/50 to-white"
                        onClick={() => setPlanOpen(!planOpen)}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-green-100 border border-green-50 overflow-hidden">
                                <img 
                                    src="/assets/ai-chef.png" 
                                    alt="AI Chef" 
                                    className="w-12 h-12 object-contain"
                                />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-gray-800 tracking-tight">AI Smart Plan ✨</h2>
                                <p className="text-xs font-bold text-green-600 uppercase tracking-widest opacity-70">Personalized for you</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {!mealPlan && !mealPlanLoading && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        fetchMealPlan();
                                        setPlanOpen(true);
                                    }}
                                    className="relative group overflow-hidden bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-2xl text-sm font-bold shadow-lg shadow-green-200 transition-all active:scale-95"
                                >
                                    <span className="relative z-10">Generate Plan ✨</span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                </button>
                            )}
                            {mealPlan && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        fetchMealPlan();
                                    }}
                                    disabled={mealPlanLoading}
                                    className="text-green-600 hover:text-green-700 font-bold text-sm px-4 py-2 rounded-xl border border-green-100 hover:bg-green-50 transition-all"
                                >
                                    {mealPlanLoading ? 'Thinking...' : '🔄 New Plan'}
                                </button>
                            )}
                            <div className={`w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 transition-transform duration-300 ${planOpen ? 'rotate-180' : ''}`}>
                                ▼
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    {planOpen && (
                        <div className="px-5 pb-5">
                            {mealPlanLoading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse"></div>
                                    ))}
                                </div>
                            ) : !mealPlan ? (
                                <div className="text-center py-8 bg-gray-50 rounded-xl">
                                    <p className="text-4xl mb-3">🍽️</p>
                                    <p className="text-gray-500 font-medium">No meal plan yet!</p>
                                    <p className="text-gray-400 text-sm mt-1">
                                        Click Generate to get your personalized meal plan
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Meal Cards */}
                                    <div className="space-y-3">
                                        {[
                                            { key: 'breakfast', icon: '🌅', label: 'Breakfast' },
                                            { key: 'lunch', icon: '☀️', label: 'Lunch' },
                                            { key: 'dinner', icon: '🌙', label: 'Dinner' },
                                            { key: 'snacks', icon: '🍎', label: 'Snacks' },
                                        ].map((item) => {
                                            const meal = mealPlan[item.key];
                                            if (!meal) return null;
                                            return (
                                                <div
                                                    key={item.key}
                                                    className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-green-50 transition-all"
                                                >
                                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm flex-shrink-0">
                                                        {item.icon}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <p className="text-xs font-semibold text-gray-400 uppercase">
                                                                {item.label}
                                                            </p>
                                                            <div className="flex gap-2">
                                                                <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-semibold">
                                                                    🔥 {meal.calories} kcal
                                                                </span>
                                                                <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-semibold">
                                                                    P: {meal.protein}g
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm font-semibold text-gray-800">{renderBold(meal.meal)}</p>
                                                        {meal.tip && (
                                                            <p className="text-xs text-gray-400 mt-1">💡 {renderBold(meal.tip)}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Total */}
                                    <div className="mt-4 p-4 bg-green-50 rounded-xl flex justify-between items-center">
                                        <p className="text-sm font-semibold text-green-700">Total for the day</p>
                                        <div className="flex gap-3">
                                            <span className="text-sm font-bold text-orange-500">
                                                🔥 {mealPlan.total_calories} kcal
                                            </span>
                                            <span className="text-sm font-bold text-green-600">
                                                P: {mealPlan.total_protein}g
                                            </span>
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <p className="text-xs text-gray-400 text-center mt-3">
                                        💡 This is a suggestion only. Eat what's available to you!
                                    </p>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Add Meal Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                    <h2 className="font-bold text-gray-800 mb-4">Log Your Meal</h2>

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

                    {/* Meal Type Select */}
                    <div className="grid grid-cols-4 gap-2 mb-4">
                        {['breakfast', 'lunch', 'dinner', 'snacks'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setMealType(type)}
                                className={`py-2 rounded-xl text-sm font-semibold transition-all ${mealType === type
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {getMealLabel(type).split(' ')[1]}
                            </button>
                        ))}
                    </div>

                    {/* Food Input */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            What did you eat?
                        </label>
                        <textarea
                            value={foodDescription}
                            onChange={(e) => {
                                setFoodDescription(e.target.value);
                                setError('');
                            }}
                            placeholder="E.g., 2 roti and 1 katori dal / maine 2 roti aur dal khayi / २ रोटी और दाल..."
                            rows={3}
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 transition-all resize-none"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            💡 Type in English, Hindi or Hinglish — AI will automatically calculate calories & macros
                        </p>
                    </div>

                    <button
                        onClick={handleAddMeal}
                        disabled={adding || !foodDescription.trim()}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white py-3 rounded-xl font-semibold transition-all"
                    >
                        {adding ? '🤖 AI is calculating calories...' : 'Log Meal 🥗'}
                    </button>
                </div>

                {/* Today Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: 'Calories', value: Math.round(totals.calories), target: Math.round(targets?.daily_calorie_target || 0), unit: 'kcal', color: 'text-orange-500' },
                        { label: 'Protein', value: Math.round(totals.protein), target: Math.round(targets?.protein_target || 0), unit: 'g', color: 'text-green-600' },
                        { label: 'Carbs', value: Math.round(totals.carbs), target: Math.round(targets?.carbs_target || 0), unit: 'g', color: 'text-blue-600' },
                        { label: 'Fat', value: Math.round(totals.fat), target: Math.round(targets?.fat_target || 0), unit: 'g', color: 'text-orange-400' },
                    ].map((item) => (
                        <div key={item.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
                            <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                            <p className="text-xs text-gray-400">/ {item.target} {item.unit}</p>
                            <p className="text-sm text-gray-600 font-medium mt-1">{item.label}</p>
                        </div>
                    ))}
                </div>

                {/* Meals List */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="font-bold text-gray-800 mb-4">Today's Log</h2>

                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse"></div>
                            ))}
                        </div>
                    ) : todayMeals.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-5xl mb-3">🍽️</p>
                            <p className="text-gray-500">Nothing logged today!</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {todayMeals.map((meal) => (
                                <div key={meal.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                                {getMealLabel(meal.meal_type)}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-800 truncate">
                                            {meal.food_description}
                                        </p>
                                        <div className="flex gap-3 mt-1">
                                            <span className="text-xs text-orange-500 font-semibold">🔥 {Math.round(meal.calories)} kcal</span>
                                            <span className="text-xs text-green-600">P: {Math.round(meal.protein)}g</span>
                                            <span className="text-xs text-blue-600">C: {Math.round(meal.carbs)}g</span>
                                            <span className="text-xs text-orange-400">F: {Math.round(meal.fat)}g</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteMeal(meal.id)}
                                        className="text-gray-300 hover:text-red-400 transition-colors"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
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

export default MealTrackerPage;