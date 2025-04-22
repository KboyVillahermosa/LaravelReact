import React from 'react';
import { Link } from '@inertiajs/react';

const HealthAssistantButton = () => {
    return (
        <Link
            href="/health/assistant"
            className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-full shadow-lg p-4 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors z-50"
        >
            <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full"></span>
            </div>
        </Link>
    );
};

export default HealthAssistantButton;