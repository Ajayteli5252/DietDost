import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-gray-300 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-2xl">🥗</span>
                            <span className="text-xl font-bold text-white">DietDost</span>
                        </div>
                        <p className="text-gray-400 text-sm">
                            AI-powered diet tracker built for Indian users.
                            Use it for free and stay healthy!
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Quick Links</h3>
                        <div className="flex flex-col gap-2">
                            <Link to="/" className="text-gray-400 hover:text-green-400 text-sm transition-colors">Home</Link>
                            <Link to="/auth" className="text-gray-400 hover:text-green-400 text-sm transition-colors">Sign Up</Link>
                            <Link to="/dashboard" className="text-gray-400 hover:text-green-400 text-sm transition-colors">Dashboard</Link>
                        </div>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Contact</h3>
                        <p className="text-gray-400 text-sm">Made with ❤️ in India 🇮🇳</p>
                        <p className="text-gray-400 text-sm mt-2">support@dietdost.in</p>
                    </div>
                </div>

                <div className="border-t border-gray-700 pt-8 text-center">
                    <p className="text-gray-500 text-sm">
                        © 2024 DietDost. All rights reserved. 🥗
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;