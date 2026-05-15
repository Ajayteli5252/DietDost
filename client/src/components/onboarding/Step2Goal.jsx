const goals = [
    {
        id: 'fat_loss',
        icon: '🔥',
        title: 'Fat Loss',
        desc: 'You want to lose weight',
        color: 'border-orange-300 bg-orange-50',
        selected: 'border-orange-500 bg-orange-100',
        text: 'text-orange-600',
    },
    {
        id: 'muscle_gain',
        icon: '💪',
        title: 'Muscle Gain',
        desc: 'You want to build muscle',
        color: 'border-blue-300 bg-blue-50',
        selected: 'border-blue-500 bg-blue-100',
        text: 'text-blue-600',
    },
    {
        id: 'maintain',
        icon: '⚖️',
        title: 'Maintain Weight',
        desc: 'You want to stay at the same weight',
        color: 'border-purple-300 bg-purple-50',
        selected: 'border-purple-500 bg-purple-100',
        text: 'text-purple-600',
    },
    {
        id: 'general_health',
        icon: '🌿',
        title: 'General Health',
        desc: 'You just want to stay healthy',
        color: 'border-green-300 bg-green-50',
        selected: 'border-green-500 bg-green-100',
        text: 'text-green-600',
    },
];

const Step2Goal = ({ data, onUpdate, onNext, onBack }) => {
    const handleSelect = (goalId) => {
        onUpdate({ goal: goalId });
    };

    return (
        <div>
            <div className="text-center mb-8">
                <div className="text-5xl mb-3">🎯</div>
                <h2 className="text-2xl font-bold text-gray-800">What's Your Goal?</h2>
                <p className="text-gray-500 text-sm mt-1">
                    Your calorie targets will be calculated based on this
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {goals.map((goal) => (
                    <button
                        key={goal.id}
                        onClick={() => handleSelect(goal.id)}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${data.goal === goal.id ? goal.selected : goal.color
                            } hover:scale-[1.02]`}
                    >
                        <span className="text-4xl">{goal.icon}</span>
                        <div className="flex-1">
                            <p className={`font-bold text-lg ${goal.text}`}>{goal.title}</p>
                            <p className="text-gray-500 text-sm">{goal.desc}</p>
                        </div>
                        {data.goal === goal.id && (
                            <span className={`text-2xl ${goal.text}`}>✓</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-8">
                <button
                    onClick={onBack}
                    className="flex-1 border-2 border-gray-200 text-gray-600 hover:border-gray-300 py-3 rounded-xl font-semibold transition-all"
                >
                    ← Back
                </button>
                <button
                    onClick={onNext}
                    disabled={!data.goal}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white py-3 rounded-xl font-semibold transition-all"
                >
                    Next →
                </button>
            </div>
        </div>
    );
};

export default Step2Goal;