import React from 'react';
import { Head, Link } from '@inertiajs/react';
import HealthcareLayout from '@/layouts/HealthcareLayout';
import HealthAssistantButton from '@/Components/HealthAssistantButton';

export default function HealthHome() {
    return (
        <HealthcareLayout>
            <Head title="MediAssist - Your Healthcare Information Portal" />
            
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
                    <div className="text-center">
                        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                            Your Health Information Assistant
                        </h1>
                        <p className="mt-6 text-xl max-w-3xl mx-auto">
                            Reliable health information explained in plain language. Ask questions, check symptoms, and get insights about medications.
                        </p>
                        <div className="mt-10 flex justify-center">
                            <Link 
                                href="/health/assistant" 
                                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                                </svg>
                                Ask MediAssist AI
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Features Section */}
            <div className="py-12 bg-white dark:bg-gray-800 transition-colors duration-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
                            How MediAssist Helps You
                        </h2>
                        <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-300 mx-auto">
                            Making healthcare information accessible and understandable
                        </p>
                    </div>
                    
                    <div className="mt-16">
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {/* Feature 1 */}
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 transition-colors duration-200">
                                <div className="w-12 h-12 rounded-md bg-blue-500 text-white flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="mt-5 text-lg font-medium text-gray-900 dark:text-white">Medical Information</h3>
                                <p className="mt-2 text-gray-500 dark:text-gray-300">
                                    Get clear explanations of medical terms, conditions, and procedures in simple language.
                                </p>
                            </div>
                            
                            {/* Feature 2 */}
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 transition-colors duration-200">
                                <div className="w-12 h-12 rounded-md bg-blue-500 text-white flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <h3 className="mt-5 text-lg font-medium text-gray-900 dark:text-white">Symptom Checker</h3>
                                <p className="mt-2 text-gray-500 dark:text-gray-300">
                                    Describe your symptoms to get information about possible causes and when to seek medical care.
                                </p>
                            </div>
                            
                            {/* Feature 3 */}
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 transition-colors duration-200">
                                <div className="w-12 h-12 rounded-md bg-blue-500 text-white flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                    </svg>
                                </div>
                                <h3 className="mt-5 text-lg font-medium text-gray-900 dark:text-white">Medication Information</h3>
                                <p className="mt-2 text-gray-500 dark:text-gray-300">
                                    Learn about medications, including uses, side effects, interactions, and general dosing guidance.
                                </p>
                            </div>
                            
                            {/* Feature 4 */}
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 transition-colors duration-200">
                                <div className="w-12 h-12 rounded-md bg-blue-500 text-white flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="mt-5 text-lg font-medium text-gray-900 dark:text-white">Medication Reminders</h3>
                                <p className="mt-2 text-gray-500 dark:text-gray-300">
                                    Set up reminders to help you take medications on schedule and track your adherence.
                                </p>
                            </div>
                            
                            {/* Feature 5 */}
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 transition-colors duration-200">
                                <div className="w-12 h-12 rounded-md bg-blue-500 text-white flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="mt-5 text-lg font-medium text-gray-900 dark:text-white">Telehealth Connection</h3>
                                <p className="mt-2 text-gray-500 dark:text-gray-300">
                                    Connect with healthcare providers through secure video consultations from the comfort of your home.
                                </p>
                            </div>
                            
                            {/* Feature 6 */}
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 transition-colors duration-200">
                                <div className="w-12 h-12 rounded-md bg-blue-500 text-white flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="mt-5 text-lg font-medium text-gray-900 dark:text-white">Health Education</h3>
                                <p className="mt-2 text-gray-500 dark:text-gray-300">
                                    Access articles, videos, and interactive tools to learn about health conditions and wellness.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Disclaimer Section */}
            <div className="bg-yellow-50 dark:bg-yellow-900 transition-colors duration-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-start md:items-center">
                        <div className="flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Medical Disclaimer</h3>
                            <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-200">
                                <p>
                                    The information provided by MediAssist is for general informational and educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Add the assistant button */}
            <HealthAssistantButton />
        </HealthcareLayout>
    );
}