// BMR Calculate karo
export const calculateBMR = (weight, height, age, gender) => {
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

// Daily calorie target
export const calculateCalorieTarget = (bmr, activityLevel, goal) => {
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
export const calculateMacros = (calories, goal) => {
    let protein, carbs, fat;

    if (goal === 'muscle_gain') {
        protein = Math.round((calories * 0.35) / 4);
        fat = Math.round((calories * 0.25) / 9);
        carbs = Math.round((calories * 0.40) / 4);
    } else if (goal === 'fat_loss') {
        protein = Math.round((calories * 0.40) / 4);
        fat = Math.round((calories * 0.30) / 9);
        carbs = Math.round((calories * 0.30) / 4);
    } else {
        protein = Math.round((calories * 0.30) / 4);
        fat = Math.round((calories * 0.30) / 9);
        carbs = Math.round((calories * 0.40) / 4);
    }

    return { protein, carbs, fat };
};