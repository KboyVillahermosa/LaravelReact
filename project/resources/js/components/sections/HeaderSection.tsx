export default function HeaderSection() {
    return (
        <div className="w-full flex flex-col items-center justify-center py-16 px-0 bg-white dark:bg-gray-900 text-center border-b border-gray-100 dark:border-gray-800">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-light mb-4 tracking-tight text-gray-900 dark:text-white">
                    HealthchatAI
                    <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 font-medium">
                        Medical Assistant
                    </span>
                </h1>
                
                <p className="text-xl md:text-2xl font-light mb-8 text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
                    Evidence-based health information at your fingertips
                </p>
                
                <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mb-8"></div>
                
                <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-10">
                    Ask questions about symptoms, conditions, medications, and preventive care.
                    Receive clear, medically-accurate information to help you make informed health decisions.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-md font-medium hover:from-blue-600 hover:to-purple-700 transition-colors shadow-sm">
                        Start Consultation
                    </button>
                    <button className="px-6 py-3 bg-transparent border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-md font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        How It Works
                    </button>
                </div>
            </div>
        </div>
    );
}