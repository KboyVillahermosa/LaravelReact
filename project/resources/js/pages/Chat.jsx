import React from 'react';
import { Head } from '@inertiajs/inertia-react';
import AppLayout from '@/Layouts/AppLayout';

export default function Chat() {
    return (
        <AppLayout>
            <Head title="Chat with AI" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <h1 className="text-2xl font-semibold mb-4">AI Chat Assistant</h1>
                            <p className="mb-4">Chat with our AI assistant using the chat window in the bottom right corner!</p>
                            <p className="text-sm text-gray-600">
                                This AI assistant is powered by DeepAI's text generation capabilities.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}