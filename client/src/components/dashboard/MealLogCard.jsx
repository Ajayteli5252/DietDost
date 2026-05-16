import { getMealLabel } from '../../utils/calorieHelper';

const MealLogCard = ({ meals, loading, onDelete, onAddMeal }) => {
    if (loading) {
        return (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded-xl mb-3"></div>
                ))}
            </div>
        );
    }

    // Group meals by meal type
    const groupedMeals = meals.reduce((acc, meal) => {
        if (!acc[meal.meal_type]) acc[meal.meal_type] = [];
        acc[meal.meal_type].push(meal);
        return acc;
    }, {});

    const mealOrder = ['breakfast', 'lunch', 'dinner', 'snacks'];

    // Flatten meals for stagger index
    let rowIndex = 0;

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800">🍽️ Today's Meal Log</h3>
                <button
                    onClick={onAddMeal}
                    className="bg-green-600 hover:bg-green-700 active:scale-95 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                >
                    + Add Meal
                </button>
            </div>

            {meals.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-5xl mb-3 animate-bounce-emoji">🍽️</div>
                    <p className="text-gray-500 font-medium">Nothing logged today!</p>
                    <p className="text-gray-400 text-sm mt-1">
                        Go to the Meal Tracker to log your food
                    </p>
                    <button
                        onClick={onAddMeal}
                        className="mt-4 bg-green-600 hover:bg-green-700 active:scale-95 text-white px-6 py-2 rounded-xl text-sm font-semibold transition-all"
                    >
                        Log Your First Meal 🥗
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {mealOrder.map((mealType) => {
                        if (!groupedMeals[mealType]) return null;
                        return (
                            <div key={mealType}>
                                {/* Meal Type Header */}
                                <p className="text-sm font-semibold text-gray-500 mb-2">
                                    {getMealLabel(mealType)}
                                </p>

                                {/* Meal Rows */}
                                <div className="space-y-2">
                                    {groupedMeals[mealType].map((meal) => {
                                        const delay = `${rowIndex++ * 50}ms`;
                                        return (
                                            <div
                                                key={meal.id}
                                                className="group flex items-center gap-3 bg-gray-50 rounded-xl p-3 hover:bg-gray-100 transition-all animate-slide-in-left"
                                                style={{ animationDelay: delay }}
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-800 truncate">
                                                        {meal.food_description}
                                                    </p>
                                                    <div className="flex gap-3 mt-1">
                                                        <span className="text-xs text-orange-500 font-semibold">
                                                            🔥 {Math.round(meal.calories)} kcal
                                                        </span>
                                                        <span className="text-xs text-green-600">P: {Math.round(meal.protein)}g</span>
                                                        <span className="text-xs text-blue-600">C: {Math.round(meal.carbs)}g</span>
                                                        <span className="text-xs text-orange-400">F: {Math.round(meal.fat)}g</span>
                                                    </div>
                                                </div>

                                                {/* Delete btn — visible only on hover */}
                                                <button
                                                    onClick={() => onDelete(meal.id)}
                                                    className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all text-lg flex-shrink-0 scale-90 hover:scale-100"
                                                    aria-label="Delete meal"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MealLogCard;