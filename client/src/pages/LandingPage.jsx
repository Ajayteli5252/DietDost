import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-green-50 to-green-100 min-h-screen flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="flex flex-col lg:flex-row items-center gap-12">
                        {/* Left Content */}
                        <div className="flex-1 text-center lg:text-left">
                            <span className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                                🇮🇳 Made for Indian Diets
                            </span>
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-800 leading-tight mb-6">
                                Your Ultimate{' '}
                                <span className="text-green-600">Diet Buddy</span>{' '}
                                is Here! 🥗
                            </h1>
                            <p className="text-lg text-gray-600 mb-8 max-w-xl">
                                AI-powered diet tracker that understands Indian foods. Track calories,
                                check for deficiencies, and get personalized suggestions - all for free!
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <button
                                    onClick={() => navigate('/auth')}
                                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg"
                                >
                                    Get Started Now 🚀
                                </button>
                                <button
                                    onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}
                                    className="border-2 border-green-600 text-green-600 hover:bg-green-50 px-8 py-4 rounded-xl font-semibold text-lg transition-all"
                                >
                                    How It Works?
                                </button>
                            </div>
                            {/* Stats */}
                            <div className="flex gap-8 mt-12 justify-center lg:justify-start">
                                <div>
                                    <p className="text-2xl font-bold text-green-600">100%</p>
                                    <p className="text-gray-500 text-sm">Free</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-green-600">AI</p>
                                    <p className="text-gray-500 text-sm">Powered</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-green-600">🇮🇳</p>
                                    <p className="text-gray-500 text-sm">Indian Foods</p>
                                </div>
                            </div>
                        </div>

                        {/* Right - Illustration */}
                        <div className="flex-1 flex justify-center">
                            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full">
                                {/* Mock Dashboard Card */}
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-xl">
                                        👋
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">Hello, Rahul!</p>
                                        <p className="text-sm text-gray-500">Track your daily goal</p>
                                    </div>
                                </div>
                                {/* Calorie Ring Mock */}
                                <div className="flex justify-center mb-6">
                                    <div className="relative w-32 h-32">
                                        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                                            <path
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                fill="none"
                                                stroke="#dcfce7"
                                                strokeWidth="3"
                                            />
                                            <path
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                fill="none"
                                                stroke="#16a34a"
                                                strokeWidth="3"
                                                strokeDasharray="65, 100"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <p className="text-xl font-bold text-gray-800">1200</p>
                                            <p className="text-xs text-gray-500">/ 1800 kcal</p>
                                        </div>
                                    </div>
                                </div>
                                {/* Macros Mock */}
                                <div className="space-y-3">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-600">Protein</span>
                                            <span className="text-green-600 font-semibold">45g / 120g</span>
                                        </div>
                                        <div className="h-2 bg-green-100 rounded-full">
                                            <div className="h-2 bg-green-500 rounded-full" style={{ width: '37%' }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-600">Carbs</span>
                                            <span className="text-blue-600 font-semibold">180g / 250g</span>
                                        </div>
                                        <div className="h-2 bg-blue-100 rounded-full">
                                            <div className="h-2 bg-blue-500 rounded-full" style={{ width: '72%' }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-600">Fat</span>
                                            <span className="text-orange-600 font-semibold">30g / 60g</span>
                                        </div>
                                        <div className="h-2 bg-orange-100 rounded-full">
                                            <div className="h-2 bg-orange-500 rounded-full" style={{ width: '50%' }}></div>
                                        </div>
                                    </div>
                                </div>
                                {/* AI Suggestion Mock */}
                                <div className="mt-4 bg-green-50 rounded-xl p-3">
                                    <p className="text-xs text-green-700">
                                        🤖 <strong>AI Suggestion:</strong> Try adding more protein like dal or paneer to your dinner!
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
                            How It Works?
                        </h2>
                        <p className="text-gray-500 text-lg">Get started in 3 simple steps</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                step: '01',
                                icon: '📝',
                                title: 'Sign Up',
                                desc: 'Create a free account and fill in your basic info like goal, diet type, and activity level.',
                            },
                            {
                                step: '02',
                                icon: '🍽️',
                                title: 'Log Your Meals',
                                desc: 'Just describe what you ate - "I had 2 rotis and a bowl of dal" - our AI will calculate the calories.',
                            },
                            {
                                step: '03',
                                icon: '📊',
                                title: 'Track Progress',
                                desc: 'Get personalized suggestions, deficiency alerts, and view your weekly progress.',
                            },
                        ].map((item) => (
                            <div key={item.step} className="text-center p-8 rounded-2xl border-2 border-green-100 hover:border-green-300 hover:shadow-lg transition-all">
                                <div className="text-5xl mb-4">{item.icon}</div>
                                <div className="text-green-600 font-bold text-sm mb-2">STEP {item.step}</div>
                                <h3 className="text-xl font-bold text-gray-800 mb-3">{item.title}</h3>
                                <p className="text-gray-500">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Common Deficiencies */}
            <section className="py-20 bg-green-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
                            Common Deficiencies in Indian Diets
                        </h2>
                        <p className="text-gray-500 text-lg">Are you missing these essential nutrients?</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { icon: '🩸', name: 'Iron', desc: 'Leading cause of Anemia' },
                            { icon: '☀️', name: 'Vitamin D', desc: 'Crucial for bone health' },
                            { icon: '💊', name: 'Vitamin B12', desc: 'Very common in vegetarians' },
                            { icon: '🥛', name: 'Calcium', desc: 'Often low in modern diets' },
                        ].map((item) => (
                            <div key={item.name} className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-all">
                                <div className="text-4xl mb-3">{item.icon}</div>
                                <h3 className="font-bold text-gray-800 mb-1">{item.name}</h3>
                                <p className="text-gray-500 text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Us */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
                            Why Choose DietDost?
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: '🆓', title: 'Completely Free', desc: 'No hidden charges ever' },
                            { icon: '🤖', title: 'AI Powered', desc: 'Smart and easy calorie tracking' },
                            { icon: '🇮🇳', title: 'Indian Food Expert', desc: 'Knows everything from Roti to Paneer' },
                            { icon: '📱', title: 'Mobile Friendly', desc: 'Works seamlessly on all devices' },
                        ].map((item) => (
                            <div key={item.title} className="flex gap-4 p-6 rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-md transition-all text-left">
                                <div className="text-3xl">{item.icon}</div>
                                <div>
                                    <h3 className="font-bold text-gray-800 mb-1">{item.title}</h3>
                                    <p className="text-gray-500 text-sm">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-green-600">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                        Start Your Journey Today! 🚀
                    </h2>
                    <p className="text-green-100 text-lg mb-8">
                        Join for free and make AI your personal nutritionist
                    </p>
                    <button
                        onClick={() => navigate('/auth')}
                        className="bg-white text-green-600 hover:bg-green-50 px-10 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
                    >
                        Join Now for Free 🥗
                    </button>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default LandingPage;