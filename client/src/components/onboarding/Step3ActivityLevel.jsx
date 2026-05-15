const activities = [
    {
        id: 'sedentary',
        icon: '🪑',
        title: 'Sedentary',
        desc: 'Office job, very little walking',
        example: 'Example: desk job, staying home',
        color: 'border-gray-300 bg-gray-50',
        selected: 'border-gray-500 bg-gray-100',
        text: 'text-gray-600',
    },
    {
        id: 'lightly_active',
        icon: '🚶',
        title: 'Lightly Active',
        desc: 'Light walking or light exercise',
        example: 'Example: walking 1-2 days a week',
        color: 'border-yellow-300 bg-yellow-50',
        selected: 'border-yellow-500 bg-yellow-100',
        text: 'text-yellow-600',
    },
    {
        id: 'moderately_active',
        icon: '🏃',
        title: 'Moderately Active',
        desc: 'Regular exercise 3-4 days a week',
        example: 'Example: gym 3-4 days, sports',
        color: 'border-blue-300 bg-blue-50',
        selected: 'border-blue-500 bg-blue-100',
        text: 'text-blue-600',
    },
    {
        id: 'very_active',
        icon: '⚡',
        title: 'Very Active',
        desc: 'Intense exercise 5-6 days a week',
        example: 'Example: heavy gym, athlete',
        color: 'border-orange-300 bg-orange-50',
        selected: 'border-orange-500 bg-orange-100',
        text: 'text-orange-600',
    },
];

const Step3ActivityLevel = ({ data, onUpdate, onNext, onBack }) => {
    return (
        <div>
            <div className="text-center mb-8">
                <div className="text-5xl mb-3">⚡</div>
                <h2 className="text-2xl font-bold text-gray-800">Activity Level?</h2>
                <p className="text-gray-500 text-sm mt-1">
                    How active are you throughout the day?
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {activities.map((activity) => (
                    <button
                        key={activity.id}
                        onClick={() => onUpdate({ activity_level: activity.id })}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${data.activity_level === activity.id
                                ? activity.selected
                                : activity.color
                            } hover:scale-[1.02]`}
                    >
                        <span className="text-4xl">{activity.icon}</span>
                        <div className="flex-1">
                            <p className={`font-bold text-lg ${activity.text}`}>
                                {activity.title}
                            </p>
                            <p className="text-gray-500 text-sm">{activity.desc}</p>
                            <p className="text-gray-400 text-xs mt-1">{activity.example}</p>
                        </div>
                        {data.activity_level === activity.id && (
                            <span className={`text-2xl ${activity.text}`}>✓</span>
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
                    disabled={!data.activity_level}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white py-3 rounded-xl font-semibold transition-all"
                >
                    Next →
                </button>
            </div>
        </div>
    );
};

export default Step3ActivityLevel;