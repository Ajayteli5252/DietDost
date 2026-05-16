import { useState, useEffect } from 'react';
import { useCalorie } from '../../hooks/useCalorie';

const WaterIntakeCard = () => {
    const { logWater } = useCalorie();
    const [glasses, setGlasses] = useState(0);
    const [loading, setLoading] = useState(false);
    const [lastAdded, setLastAdded] = useState(null);
    const target = 8;

    // Load from LocalStorage with IST date
    useEffect(() => {
        const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
        const saved = localStorage.getItem(`water_${today}`);
        if (saved) setGlasses(parseInt(saved));
    }, []);

    const handleAddGlass = async () => {
        if (glasses >= target) return;
        const newGlasses = glasses + 1;
        setLastAdded(newGlasses - 1); // index of newly filled glass
        setGlasses(newGlasses);

        // Clear animation flag after animation completes
        setTimeout(() => setLastAdded(null), 450);

        const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
        localStorage.setItem(`water_${today}`, newGlasses.toString());

        try {
            setLoading(true);
            await logWater(newGlasses);
        } catch (error) {
            console.error('Water log error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveGlass = async () => {
        if (glasses <= 0) return;
        const newGlasses = glasses - 1;
        setGlasses(newGlasses);

        const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
        localStorage.setItem(`water_${today}`, newGlasses.toString());

        try {
            await logWater(newGlasses);
        } catch (error) {
            console.error('Water log error:', error);
        }
    };

    const percent = Math.round((glasses / target) * 100);

    const getWaterMessage = () => {
        if (glasses === 0) return "Start drinking water! 💧";
        if (glasses < 4)  return "Drink a bit more! 😊";
        if (glasses < 8)  return "Doing great! 👍";
        return "Target reached! 🎉";
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full">
            <h3 className="font-bold text-gray-800 mb-4">💧 Water Tracker</h3>

            {/* Compact 4×2 Glass Grid */}
            <div className="grid grid-cols-4 gap-1.5 mb-4">
                {Array.from({ length: target }).map((_, index) => {
                    const isFilled = index < glasses;
                    const isNew    = index === lastAdded;
                    return (
                        <div
                            key={index}
                            className={`
                                aspect-square rounded-lg flex items-center justify-center text-base
                                transition-all duration-300
                                ${isFilled ? 'bg-blue-100 shadow-inner' : 'bg-gray-100'}
                                ${isNew ? 'animate-glass-wave' : ''}
                            `}
                        >
                            {isFilled ? '💧' : '🫙'}
                        </div>
                    );
                })}
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 font-medium">{glasses} / {target} glasses</span>
                    <span className="text-blue-600 font-bold">{percent}%</span>
                </div>
                <div className="h-2.5 bg-blue-100 rounded-full overflow-hidden">
                    <div
                        className="h-2.5 bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                    />
                </div>
            </div>

            {/* Message */}
            <p className="text-center text-sm text-gray-500 mb-4">{getWaterMessage()}</p>

            {/* Buttons */}
            <div className="flex gap-3">
                <button
                    onClick={handleRemoveGlass}
                    disabled={glasses <= 0}
                    className="flex-1 border-2 border-gray-200 hover:border-red-300 hover:text-red-500 disabled:opacity-30 text-gray-500 py-2 rounded-xl font-bold text-lg transition-all"
                >
                    −
                </button>
                <button
                    onClick={handleAddGlass}
                    disabled={glasses >= target || loading}
                    className="flex-grow bg-blue-500 hover:bg-blue-600 disabled:bg-blue-200 text-white py-2 rounded-xl font-semibold text-sm transition-all active:scale-95"
                >
                    {loading ? '...' : '+ Add Glass 💧'}
                </button>
            </div>

            {/* ML Info */}
            <p className="text-center text-xs text-gray-400 mt-3">
                {glasses * 250}ml / {target * 250}ml
            </p>
        </div>
    );
};

export default WaterIntakeCard;