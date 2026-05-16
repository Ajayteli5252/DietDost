import { useEffect, useRef } from 'react';
import { getProgressPercent, getRemainingCalories, getCalorieStatus } from '../../utils/calorieHelper';

const CalorieCard = ({ consumed, target, loading }) => {
    const percent = getProgressPercent(consumed, target);
    const remaining = getRemainingCalories(consumed, target);
    const status = getCalorieStatus(consumed, target);

    // Circle progress calculations
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const targetOffset = circumference - (percent / 100) * circumference;

    // Animate SVG ring from 0 to target on mount
    const circleRef = useRef(null);
    useEffect(() => {
        if (!circleRef.current) return;
        // Start from full offset (empty), animate to target
        circleRef.current.style.strokeDashoffset = circumference;
        const raf = requestAnimationFrame(() => {
            circleRef.current.style.transition = 'stroke-dashoffset 1s ease-out';
            circleRef.current.style.strokeDashoffset = targetOffset;
        });
        return () => cancelAnimationFrame(raf);
    }, [targetOffset, circumference]);

    // Status colour by percentage
    const getStatusColor = () => {
        if (percent < 50)  return 'text-green-500';
        if (percent <= 85) return 'text-yellow-500';
        if (percent > 100) return 'text-red-500';
        return 'text-green-600';
    };

    if (loading) {
        return (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="w-40 h-40 bg-gray-200 rounded-full mx-auto"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full">
            <h3 className="font-bold text-gray-800 mb-4">🔥 Today's Calories</h3>

            {/* Circle Progress */}
            <div className="flex justify-center mb-6">
                <div className="relative w-40 h-40">
                    <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 120 120">
                        {/* Background circle */}
                        <circle
                            cx="60" cy="60" r={radius}
                            fill="none" stroke="#dcfce7" strokeWidth="10"
                        />
                        {/* Animated progress circle */}
                        <circle
                            ref={circleRef}
                            cx="60" cy="60" r={radius}
                            fill="none"
                            stroke={percent > 100 ? '#ef4444' : '#16a34a'}
                            strokeWidth="10"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={circumference}
                        />
                    </svg>
                    {/* Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <p className="text-3xl font-bold text-gray-800">{Math.round(consumed)}</p>
                        <p className="text-xs text-gray-400">/ {Math.round(target)} kcal</p>
                        <p className={`text-xs font-semibold mt-1 ${getStatusColor()}`}>{percent}%</p>
                    </div>
                </div>
            </div>

            {/* Status */}
            <div className="text-center mb-4">
                <p className={`font-semibold ${getStatusColor()}`}>{status.message}</p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-center transition-all hover:bg-green-100">
                    <p className="text-lg font-bold text-green-600">{Math.round(consumed)}</p>
                    <p className="text-xs text-gray-500">Consumed</p>
                </div>
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-center transition-all hover:bg-orange-100">
                    <p className="text-lg font-bold text-orange-500">{remaining}</p>
                    <p className="text-xs text-gray-500">Remaining</p>
                </div>
            </div>
        </div>
    );
};

export default CalorieCard;