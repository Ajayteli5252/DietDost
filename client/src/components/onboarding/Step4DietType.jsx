const dietTypes = [
    {
        id: 'vegetarian',
        icon: '🥗',
        title: 'Vegetarian',
        desc: 'No meat, dairy products are okay',
        example: 'Dal, paneer, milk, etc. (no eggs)',
        color: 'border-green-300 bg-green-50',
        selected: 'border-green-500 bg-green-100',
        text: 'text-green-600',
    },
    {
        id: 'non_vegetarian',
        icon: '🍗',
        title: 'Non Vegetarian',
        desc: 'Everything is on the menu',
        example: 'Chicken, mutton, fish, eggs, etc.',
        color: 'border-red-300 bg-red-50',
        selected: 'border-red-500 bg-red-100',
        text: 'text-red-600',
    },
    {
        id: 'eggetarian',
        icon: '🥚',
        title: 'Eggetarian',
        desc: 'Vegetarian + Eggs',
        example: 'Dal, paneer + eggs, but no meat',
        color: 'border-yellow-300 bg-yellow-50',
        selected: 'border-yellow-500 bg-yellow-100',
        text: 'text-yellow-600',
    },
    {
        id: 'vegan',
        icon: '🌱',
        title: 'Vegan',
        desc: 'No animal products at all',
        example: 'No dairy, no eggs, no meat',
        color: 'border-emerald-300 bg-emerald-50',
        selected: 'border-emerald-500 bg-emerald-100',
        text: 'text-emerald-600',
    },
];

const Step4DietType = ({ data, onUpdate, onNext, onBack }) => {
    return (
        <div>
            <div className="text-center mb-8">
                <div className="text-5xl mb-3">🍽️</div>
                <h2 className="text-2xl font-bold text-gray-800">Diet Type?</h2>
                <p className="text-gray-500 text-sm mt-1">
                    AI will suggest food based on your diet type
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {dietTypes.map((diet) => (
                    <button
                        key={diet.id}
                        onClick={() => onUpdate({ diet_type: diet.id })}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${data.diet_type === diet.id ? diet.selected : diet.color
                            } hover:scale-[1.02]`}
                    >
                        <span className="text-4xl">{diet.icon}</span>
                        <div className="flex-1">
                            <p className={`font-bold text-lg ${diet.text}`}>{diet.title}</p>
                            <p className="text-gray-500 text-sm">{diet.desc}</p>
                            <p className="text-gray-400 text-xs mt-1">{diet.example}</p>
                        </div>
                        {data.diet_type === diet.id && (
                            <span className={`text-2xl ${diet.text}`}>✓</span>
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
                    disabled={!data.diet_type}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white py-3 rounded-xl font-semibold transition-all"
                >
                    Next →
                </button>
            </div>
        </div>
    );
};

export default Step4DietType;