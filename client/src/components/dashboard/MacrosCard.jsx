const MacroBar = ({ label, consumed, target, color, bgColor, emoji }) => {
    const percent = target ? Math.min(Math.round((consumed / target) * 100), 100) : 0;

    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">
                    {emoji} {label}
                </span>
                <span className={`text-sm font-bold ${color}`}>
                    {Math.round(consumed)}g / {Math.round(target || 0)}g
                </span>
            </div>
            <div className={`h-3 ${bgColor} rounded-full overflow-hidden`}>
                <div
                    className={`h-3 ${color.replace('text', 'bg')} rounded-full transition-all duration-700`}
                    style={{ width: `${percent}%` }}
                ></div>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{percent}% complete</p>
        </div>
    );
};

const MacrosCard = ({ totals, targets, loading }) => {
    if (loading) {
        return (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
                <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i}>
                            <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-full"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full">
            <h3 className="font-bold text-gray-800 mb-6">💊 Macros Breakdown</h3>

            <div className="space-y-5">
                <MacroBar
                    label="Protein"
                    consumed={totals.protein}
                    target={targets?.protein_target}
                    color="text-green-600"
                    bgColor="bg-green-100"
                    emoji="🥩"
                />
                <MacroBar
                    label="Carbs"
                    consumed={totals.carbs}
                    target={targets?.carbs_target}
                    color="text-blue-600"
                    bgColor="bg-blue-100"
                    emoji="🍚"
                />
                <MacroBar
                    label="Fat"
                    consumed={totals.fat}
                    target={targets?.fat_target}
                    color="text-orange-500"
                    bgColor="bg-orange-100"
                    emoji="🥑"
                />
            </div>

            {/* Macro Tips */}
            <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                    {
                        label: 'Protein',
                        value: Math.round(totals.protein),
                        unit: 'g',
                        color: 'bg-green-50 text-green-600',
                    },
                    {
                        label: 'Carbs',
                        value: Math.round(totals.carbs),
                        unit: 'g',
                        color: 'bg-blue-50 text-blue-600',
                    },
                    {
                        label: 'Fat',
                        value: Math.round(totals.fat),
                        unit: 'g',
                        color: 'bg-orange-50 text-orange-500',
                    },
                ].map((macro) => (
                    <div
                        key={macro.label}
                        className={`${macro.color} rounded-xl p-3 text-center`}
                    >
                        <p className="text-xl font-bold">
                            {macro.value}
                            <span className="text-sm">{macro.unit}</span>
                        </p>
                        <p className="text-xs opacity-75">{macro.label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MacrosCard;