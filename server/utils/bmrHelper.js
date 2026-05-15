// BMR Calculate karo (Mifflin-St Jeor Formula)
const calculateBMR = (weight, height, age, gender) => {
    if (gender === 'male') {
        return 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
        return 10 * weight + 6.25 * height - 5 * age - 161;
    }
};

// Activity multiplier
const activityMultiplier = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
};

// Daily calorie target calculate karo
const calculateCalorieTarget = (bmr, activityLevel, goal) => {
    const tdee = bmr * activityMultiplier[activityLevel];

    switch (goal) {
        case 'fat_loss':
            return Math.round(tdee - 500);
        case 'muscle_gain':
            return Math.round(tdee + 500);
        case 'maintain':
            return Math.round(tdee);
        case 'general_health':
            return Math.round(tdee);
        default:
            return Math.round(tdee);
    }
};

// Macros calculate karo
const calculateMacros = (calories, goal, dietType) => {
    let protein, carbs, fat;

    if (goal === 'muscle_gain') {
        // High protein
        protein = Math.round((calories * 0.35) / 4); // 35% protein
        fat = Math.round((calories * 0.25) / 9);     // 25% fat
        carbs = Math.round((calories * 0.40) / 4);   // 40% carbs
    } else if (goal === 'fat_loss') {
        // High protein, low carbs
        protein = Math.round((calories * 0.40) / 4); // 40% protein
        fat = Math.round((calories * 0.30) / 9);     // 30% fat
        carbs = Math.round((calories * 0.30) / 4);   // 30% carbs
    } else {
        // Balanced
        protein = Math.round((calories * 0.30) / 4); // 30% protein
        fat = Math.round((calories * 0.30) / 9);     // 30% fat
        carbs = Math.round((calories * 0.40) / 4);   // 40% carbs
    }

    return { protein, carbs, fat };
};

module.exports = { calculateBMR, calculateCalorieTarget, calculateMacros };