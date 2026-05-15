const Loader = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-green-50">
            <div className="flex flex-col items-center gap-4">
                {/* Spinner */}
                <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                {/* Text */}
                <p className="text-green-600 font-semibold text-lg">DietDost...</p>
            </div>
        </div>
    );
};

export default Loader;