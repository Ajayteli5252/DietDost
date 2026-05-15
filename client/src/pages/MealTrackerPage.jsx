import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { useCalorie } from '../hooks/useCalorie';
import { getMealLabel } from '../utils/calorieHelper';
import { streakApi } from '../api/streakApi';

const MealTrackerPage = () => {
    const navigate = useNavigate();
    const { todayMeals, totals, targets, loading, addMeal, deleteMeal } = useCalorie();
    const [mealType, setMealType] = useState('breakfast');
    const [foodDescription, setFoodDescription] = useState('');
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

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
                            placeholder="Example: 2 roti, 1 bowl dal, salad... or 'I had poha for breakfast'"
                            rows={3}
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 transition-all resize-none"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            💡 AI will automatically calculate calories
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
                                        onClick={() => deleteMeal(meal.id)}
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