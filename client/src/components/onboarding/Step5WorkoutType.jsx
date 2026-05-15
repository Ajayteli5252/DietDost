const workoutTypes = [
    {
        id: 'no_gym',
        icon: '🏠',
        title: 'No Gym',
        desc: "Don't really exercise much",
        example: 'Just daily routine',
        color: 'border-gray-300 bg-gray-50',
        selected: 'border-gray-500 bg-gray-100',
        text: 'text-gray-600',
    },
    {
        id: 'home_workout',
        icon: '🧘',
        title: 'Home Workout',
        desc: 'Exercise at home',
        example: 'Yoga, bodyweight, walking',
        color: 'border-purple-300 bg-purple-50',
        selected: 'border-purple-500 bg-purple-100',
        text: 'text-purple-600',
    },
    {
        id: 'gym_beginner',
        icon: '🏋️',
        title: 'Gym - Beginner',
        desc: 'Just started hitting the gym',
        example: '0-6 months gym experience',
        color: 'border-blue-300 bg-blue-50',
        selected: 'border-blue-500 bg-blue-100',
        text: 'text-blue-600',
    },
    {
        id: 'gym_intermediate',
        icon: '💪',
        title: 'Gym - Intermediate',
        desc: 'Go to the gym regularly',
        example: '6 months - 2 years experience',
        color: 'border-orange-300 bg-orange-50',
        selected: 'border-orange-500 bg-orange-100',
        text: 'text-orange-600',
    },
    {
        id: 'gym_advanced',
        icon: '⚡',
        title: 'Gym - Advanced',
        desc: 'Heavy and serious training',
        example: '2+ years, serious athlete',
        color: 'border-red-300 bg-red-50',
        selected: 'border-red-500 bg-red-100',
        text: 'text-red-600',
    },
];

const Step5WorkoutType = ({ data, onUpdate, onBack, onSubmit, loading }) => {
    return (
        <div>
            <div className="text-center mb-8">
                <div className="text-5xl mb-3">🏋️</div>
                <h2 className="text-2xl font-bold text-gray-800">Workout Type?</h2>
                <p className="text-gray-500 text-sm mt-1">
                    Last step! AI will suggest based on your workout routine
                </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {workoutTypes.map((workout) => (
                    <button
                        key={workout.id}
                        onClick={() => onUpdate({ workout_type: workout.id })}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${data.workout_type === workout.id
                                ? workout.selected
                                : workout.color
                            } hover:scale-[1.02]`}
                    >
                        <span className="text-3xl">{workout.icon}</span>
                        <div className="flex-1">
                            <p className={`font-bold ${workout.text}`}>{workout.title}</p>
                            <p className="text-gray-500 text-sm">{workout.desc}</p>
                            <p className="text-gray-400 text-xs mt-0.5">{workout.example}</p>
                        </div>
                        {data.workout_type === workout.id && (
                            <span className={`text-2xl ${workout.text}`}>✓</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Summary */}
            {data.workout_type && (
                <div className="bg-green-50 rounded-xl p-4 mt-4">
                    <p className="text-sm font-semibold text-green-700 mb-2">
                        🎉 Your Setup Summary:
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                        <p>📏 Height: {data.height} cm</p>
                        <p>⚖️ Weight: {data.weight} kg</p>
                        <p>🎯 Goal: {data.goal?.replace('_', ' ')}</p>
                        <p>⚡ Activity: {data.activity_level?.replace('_', ' ')}</p>
                        <p>🍽️ Diet: {data.diet_type?.replace('_', ' ')}</p>
                        <p>🏋️ Workout: {data.workout_type?.replace('_', ' ')}</p>
                    </div>
                </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 mt-6">
                <button
                    onClick={onBack}
                    className="flex-1 border-2 border-gray-200 text-gray-600 hover:border-gray-300 py-3 rounded-xl font-semibold transition-all"
                >
                    ← Back
                </button>
                <button
                    onClick={onSubmit}
                    disabled={!data.workout_type || loading}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white py-3 rounded-xl font-semibold transition-all"
                >
                    {loading ? 'Saving...' : 'Go to Dashboard 🚀'}
                </button>
            </div>
        </div>
    );
};

export default Step5WorkoutType;