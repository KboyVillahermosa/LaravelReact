import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import HealthchatAI from '@/components/HealthchatAI';
import { useState } from 'react';
import HeaderSection from '@/components/sections/HeaderSection';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    const [showChat, setShowChat] = useState(false);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <HeaderSection />
            
            <div className="py-12 bg-gray-50 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-xl border border-gray-100 dark:border-gray-700">
                        <div className="p-8">
                            <div className="flex items-center mb-6">
                                <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center mr-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-600 dark:text-teal-300" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Welcome to Your Health Dashboard</h2>
                            </div>
                            
                            <p className="mb-8 text-gray-600 dark:text-gray-300 text-lg">
                                Access personalized health information and get evidence-based answers to your medical questions with our AI-powered assistant.
                            </p>
                            
                            <div className="p-6 bg-gray-50 dark:bg-gray-700/30 rounded-lg mb-8 border border-gray-100 dark:border-gray-700">
                                <div className="flex items-start">
                                    <div className="mr-4 text-teal-500 dark:text-teal-400 mt-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900 dark:text-white mb-2">How can MediAssist AI help you?</h3>
                                        <p className="text-gray-600 dark:text-gray-300">
                                            Ask questions about symptoms, medications, treatments, and receive medically-accurate information to help guide your health decisions.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => setShowChat(true)}
                                className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center font-medium shadow-sm"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                                Start MediAssist Consultation
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            {showChat && <HealthchatAI />}
        </AppLayout>
    );
}