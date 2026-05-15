// Progress percentage nikalo
export const getProgressPercent = (consumed, target) => {
    if (!target || target === 0) return 0;
    const percent = (consumed / target) * 100;
    return Math.min(Math.round(percent), 100);
};

// Calories remaining nikalo
export const getRemainingCalories = (consumed, target) => {
    return Math.max(target - consumed, 0);
};

// Status check karo
export const getCalorieStatus = (consumed, target) => {
    const percent = getProgressPercent(consumed, target);

    if (percent < 50) return { status: 'low', color: 'text-yellow-500', message: 'Aur khao!' };
    if (percent < 85) return { status: 'good', color: 'text-green-500', message: 'Accha chal raha hai!' };
    if (percent < 100) return { status: 'almost', color: 'text-blue-500', message: 'Target ke paas!' };
    return { status: 'reached', color: 'text-red-500', message: 'Target reach ho gaya!' };
};

// Date format karo
export const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

// Today ki date lo
export const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
};

// Meal type ka label
export const getMealLabel = (mealType) => {
    const labels = {
        breakfast: '🌅 Breakfast',
        lunch: '☀️ Lunch',
        dinner: '🌙 Dinner',
        snacks: '🍎 Snacks',
    };
    return labels[mealType] || mealType;
};

// Goal ka label
export const getGoalLabel = (goal) => {
    const labels = {
        fat_loss: '🔥 Fat Loss',
        muscle_gain: '💪 Muscle Gain',
        maintain: '⚖️ Maintain Weight',
        general_health: '🌿 General Health',
    };
    return labels[goal] || goal;
};