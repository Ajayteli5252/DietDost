import { useState } from 'react';

const Step1BasicInfo = ({ data, onUpdate, onNext }) => {
    const [error, setError] = useState('');

    const handleNext = () => {
        if (!data.height || !data.weight) {
            setError('Please enter both height and weight!');
            return;
        }
        if (data.age && (Number(data.age) < 10 || Number(data.age) > 100)) {
            setError('Please enter a valid age (10-100 years)!');
            return;
        }
        if (data.height < 100 || data.height > 250) {
            setError('Please enter a valid height (100-250 cm)!');
            return;
        }
        if (data.weight < 20 || data.weight > 300) {
            setError('Please enter a valid weight (20-300 kg)!');
            return;
        }
        setError('');
        onNext();
    };

    return (
        <div>
            <div className="text-center mb-8">
                <div className="text-5xl mb-3">📏</div>
                <h2 className="text-2xl font-bold text-gray-800">Basic Info</h2>
                <p className="text-gray-500 text-sm mt-1">
                    Necessary to calculate your metabolic rate & calorie target
                </p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">
                    ⚠️ {error}
                </div>
            )}

            <div className="space-y-6">
                {/* Age */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Age (Years)
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            value={data.age || ''}
                            onChange={(e) => onUpdate({ age: e.target.value })}
                            placeholder="Example: 22"
                            min="10"
                            max="100"
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-green-500 transition-all"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                            yrs
                        </span>
                    </div>
                </div>

                {/* Height */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Height (cm)
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            value={data.height}
                            onChange={(e) => onUpdate({ height: e.target.value })}
                            placeholder="Example: 170"
                            min="100"
                            max="250"
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-green-500 transition-all"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                            cm
                        </span>
                    </div>
                    {data.height && (
                        <p className="text-green-600 text-xs mt-1">
                            ✓ {data.height} cm = {(data.height / 30.48).toFixed(1)} feet
                        </p>
                    )}
                </div>

                {/* Weight */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Weight (kg)
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            value={data.weight}
                            onChange={(e) => onUpdate({ weight: e.target.value })}
                            placeholder="Example: 70"
                            min="20"
                            max="300"
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-green-500 transition-all"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                            kg
                        </span>
                    </div>
                    {data.weight && (
                        <p className="text-green-600 text-xs mt-1">
                            ✓ {data.weight} kg = {(data.weight * 2.205).toFixed(1)} lbs
                        </p>
                    )}
                </div>

                {/* BMI Preview */}
                {data.height && data.weight && (
                    <div className="bg-green-50 rounded-xl p-4">
                        <p className="text-sm text-gray-600 mb-1">Your BMI:</p>
                        <p className="text-2xl font-bold text-green-600">
                            {(data.weight / ((data.height / 100) ** 2)).toFixed(1)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            {(() => {
                                const bmi = data.weight / ((data.height / 100) ** 2);
                                if (bmi < 18.5) return '⚠️ Underweight - You should eat more!';
                                if (bmi < 25) return '✅ Normal - Great job!';
                                if (bmi < 30) return '⚠️ Overweight - Watch your diet!';
                                return '🔴 Obese - Consult a nutritionist!';
                            })()}
                        </p>
                    </div>
                )}
            </div>

            {/* Next Button */}
            <button
                onClick={handleNext}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold mt-8 transition-all"
            >
                Next →
            </button>
        </div>
    );
};

export default Step1BasicInfo;