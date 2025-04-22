import React, { useState, useRef, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import HealthcareLayout from '@/layouts/HealthcareLayout';
import { Link } from '@inertiajs/react';

const HealthAssistant = () => {
    // Conversation state
    const [conversations, setConversations] = useState([
        { id: 'default', title: 'Medical Consultation', messages: [
            { text: 'Hi! I\'m your MediAssist AI. I can help answer health-related questions, explain medical terms, or provide general wellness information. How can I assist you today?', isBot: true }
        ]}
    ]);
    const [activeConversationId, setActiveConversationId] = useState('default');
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    
    const messagesEndRef = useRef(null);
    
    // Get the active conversation
    const activeConversation = conversations.find(c => c.id === activeConversationId) || conversations[0];
    
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    
    useEffect(() => {
        scrollToBottom();
    }, [activeConversation?.messages]);
    
    // Save conversations to localStorage
    useEffect(() => {
        try {
            localStorage.setItem('healthAssistantConversations', JSON.stringify(conversations));
        } catch (error) {
            console.error('Failed to save conversations to localStorage:', error);
        }
    }, [conversations]);
    
    // Load conversations from localStorage on initial load
    useEffect(() => {
        try {
            const savedConversations = localStorage.getItem('healthAssistantConversations');
            if (savedConversations) {
                setConversations(JSON.parse(savedConversations));
            }
        } catch (error) {
            console.error('Failed to load conversations from localStorage:', error);
        }
    }, []);
    
    const handleInputChange = (e) => {
        setInputText(e.target.value);
    };
    
    const createNewConversation = () => {
        const newId = `conv-${Date.now()}`;
        const newConversation = {
            id: newId,
            title: 'New Consultation',
            messages: [
                { text: 'Hi! I\'m your MediAssist AI. How can I help with your health questions today?', isBot: true }
            ]
        };
        
        setConversations(prev => [newConversation, ...prev]);
        setActiveConversationId(newId);
        setInputText('');
    };
    
    const deleteConversation = (id) => {
        setConversations(prev => prev.filter(conv => conv.id !== id));
        
        // If we deleted the active conversation, switch to the first one
        if (id === activeConversationId) {
            const remainingConversations = conversations.filter(conv => conv.id !== id);
            if (remainingConversations.length > 0) {
                setActiveConversationId(remainingConversations[0].id);
            } else {
                createNewConversation();
            }
        }
    };
    
    const updateConversationTitle = (id, firstUserMessage) => {
        setConversations(prev => 
            prev.map(conv => 
                conv.id === id 
                    ? { 
                        ...conv, 
                        title: firstUserMessage.length > 25 
                            ? firstUserMessage.substring(0, 25) + '...' 
                            : firstUserMessage 
                      } 
                    : conv
            )
        );
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!inputText.trim()) return;
        
        // Add user message
        const userMessage = { text: inputText, isBot: false };
        
        // Update the active conversation with the new message
        setConversations(prev => 
            prev.map(conv => 
                conv.id === activeConversationId 
                    ? { ...conv, messages: [...conv.messages, userMessage] } 
                    : conv
            )
        );
        
        // If this is the first user message, update the conversation title
        const isFirstUserMessage = activeConversation.messages.filter(m => !m.isBot).length === 0;
        if (isFirstUserMessage) {
            updateConversationTitle(activeConversationId, inputText);
        }
        
        // Store input text in a local variable before clearing it
        const currentInput = inputText;
        setInputText('');
        setIsLoading(true);
        
        // Fallback mode responses
        setTimeout(() => {
            // Generate a relevant response based on user input
            let aiResponse;
            const userText = currentInput.toLowerCase();
            
            // Health-specific responses
            if (userText.includes('hello') || userText.includes('hi') || userText.includes('hey')) {
                aiResponse = "Hello! I'm your healthcare assistant. I can help with medical information, symptoms, medications, and more. What health topic can I help you with today?";
            } else if (userText.includes('covid') || userText.includes('coronavirus')) {
                aiResponse = "COVID-19 is caused by the SARS-CoV-2 virus and symptoms may include fever, cough, fatigue, loss of taste or smell, and shortness of breath. If you're experiencing symptoms, please consult with a healthcare provider. Would you like information about testing, prevention, or vaccination?";
            } else if (userText.includes('headache')) {
                aiResponse = "Headaches can have many causes including stress, dehydration, lack of sleep, or underlying medical conditions. For occasional headaches, rest, hydration, and over-the-counter pain relievers may help. If you're experiencing severe, frequent, or unusual headaches, please consult a healthcare provider. Would you like tips for preventing headaches?";
            } else if (userText.includes('fever')) {
                aiResponse = "Fever is usually a sign that your body is fighting an infection. Adults typically have a fever when their temperature is above 100.4°F (38°C). For mild fevers, rest and hydration often help. If the fever is high (above 103°F/39.4°C), persists for more than 3 days, or is accompanied by severe symptoms, please seek medical attention.";
            } else if (userText.includes('blood pressure')) {
                aiResponse = "Normal blood pressure is typically around 120/80 mmHg. High blood pressure (hypertension) is generally considered to be 130/80 mmHg or higher. Lifestyle factors that can help manage blood pressure include regular exercise, reducing sodium intake, maintaining a healthy weight, limiting alcohol, and managing stress. Would you like more specific information about blood pressure management?";
            } else if (userText.includes('diabetes')) {
                aiResponse = "Diabetes is a chronic condition affecting how your body processes blood sugar. There are several types, with Type 1, Type 2, and gestational diabetes being the most common. Symptoms may include increased thirst, frequent urination, hunger, fatigue, and blurred vision. Management typically involves monitoring blood sugar, medication, healthy eating, and regular physical activity. Would you like information about a specific aspect of diabetes?";
            } else if (userText.includes('vaccination') || userText.includes('vaccine')) {
                aiResponse = "Vaccines are an important part of preventive healthcare. They work by stimulating your immune system to recognize and fight specific infectious agents. Recommended vaccines vary by age, health conditions, and other factors. It's best to consult with your healthcare provider about which vaccines are appropriate for you. Would you like information about specific vaccines?";
            } else if (userText.includes('sleep') || userText.includes('insomnia')) {
                aiResponse = "Quality sleep is essential for overall health. Adults typically need 7-9 hours per night. Good sleep hygiene includes maintaining a regular sleep schedule, creating a restful environment, limiting screen time before bed, avoiding caffeine and alcohol close to bedtime, and regular exercise (though not right before sleeping). If you have persistent sleep problems, consider consulting a healthcare provider. Would you like more specific sleep tips?";
            } else if (userText.includes('stress') || userText.includes('anxiety')) {
                aiResponse = "Stress and anxiety are common experiences that can affect physical and mental health. Management strategies include regular physical activity, relaxation techniques like deep breathing or meditation, adequate sleep, limiting alcohol and caffeine, and seeking social support. If stress or anxiety significantly impacts your daily life, consider speaking with a mental health professional. Would you like to learn about specific stress management techniques?";
            } else if (userText.includes('doctor') || userText.includes('appointment')) {
                aiResponse = "Regular check-ups with healthcare providers are important for preventive care. When choosing a doctor, consider factors such as their specialization, location, insurance coverage, and communication style. Our telehealth service can connect you with healthcare professionals remotely. Would you like information about finding a doctor or scheduling a telehealth appointment?";
            } else if (userText.includes('nutrition') || userText.includes('diet') || userText.includes('food')) {
                aiResponse = "A balanced diet typically includes fruits, vegetables, whole grains, lean proteins, and healthy fats. Nutritional needs vary based on age, sex, activity level, and health conditions. The Mediterranean and DASH diets are often recommended for overall health. Would you like nutrition information for a specific health condition or goal?";
            } else if (userText.includes('exercise') || userText.includes('workout')) {
                aiResponse = "Regular physical activity offers numerous health benefits, including reduced risk of chronic diseases, improved mood, and better sleep. Adults should aim for at least 150 minutes of moderate-intensity activity or 75 minutes of vigorous activity weekly, plus muscle-strengthening activities twice a week. Always start gradually if you're new to exercise. Would you like suggestions for exercises suitable for your fitness level?";
            } else if (userText.includes('thank')) {
                aiResponse = "You're welcome! Taking an active interest in your health is important. Is there anything else I can help you understand about health topics today?";
            } else if (userText.includes('bye') || userText.includes('goodbye')) {
                aiResponse = "Goodbye! Remember to take care of your health, and feel free to return if you have more questions. Stay well!";
            } else if (userText.length < 10) {
                aiResponse = "Could you provide more details about your health question so I can give you more specific information?";
            } else {
                // Default health-themed responses for unrecognized inputs
                const responses = [
                    `Regarding "${currentInput}", this is an important health topic. While I can provide general information, remember that personalized medical advice should come from healthcare professionals. What specific aspect would you like to know more about?`,
                    
                    `Your question about "${currentInput}" touches on an interesting health area. Health information can be complex, and individual factors often matter. Could you share what specific information would be most helpful for you?`,
                    
                    `When it comes to "${currentInput}", there are several health considerations to keep in mind. Would you like general information, prevention strategies, or management approaches?`,
                    
                    `"${currentInput}" is a topic that many people have questions about. I can provide general health information, but for personalized advice, consulting with a healthcare provider is best. What would you like to know specifically?`,
                    
                    `Thank you for asking about "${currentInput}". Understanding health information is important for making informed decisions. Would you like me to cover basics, recent research, or management strategies?`
                ];
                
                const randomIndex = Math.floor(Math.random() * responses.length);
                aiResponse = responses[randomIndex];
            }
            
            // Add bot response to the active conversation
            setConversations(prev => 
                prev.map(conv => 
                    conv.id === activeConversationId 
                        ? { ...conv, messages: [...conv.messages, { text: aiResponse, isBot: true }] } 
                        : conv
                )
            );
            
            setIsLoading(false);
        }, 1000);
    };
    
    return (
        <HealthcareLayout>
            <Head title="MediAssist AI - Your Health Assistant" />
            
            <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-white dark:bg-gray-900">
                {/* Sidebar for conversation history */}
                <div className={`${sidebarOpen ? 'block' : 'hidden'} md:block w-full md:w-80 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto`}>
                    <div className="p-4">
                        <button
                            onClick={createNewConversation}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            New consultation
                        </button>
                        
                        <div className="mt-6">
                            <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Conversation History
                            </h3>
                            <div className="mt-2 space-y-1">
                                {conversations.map((conversation) => (
                                    <div 
                                        key={conversation.id} 
                                        className="flex items-center justify-between"
                                    >
                                        <button
                                            onClick={() => setActiveConversationId(conversation.id)}
                                            className={`flex-1 flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 ${
                                                conversation.id === activeConversationId ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                                            }`}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                                            </svg>
                                            <span className="truncate">{conversation.title}</span>
                                        </button>
                                        <button
                                            onClick={() => deleteConversation(conversation.id)}
                                            className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="mt-8">
                            <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Capabilities
                            </h3>
                            <div className="mt-2 space-y-1">
                                <div className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                                    <span className="font-medium block">📋 Medical Information</span>
                                    <span className="text-xs">Symptoms, conditions, treatments</span>
                                </div>
                                <div className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                                    <span className="font-medium block">💊 Medication Guidance</span>
                                    <span className="text-xs">General information and reminders</span>
                                </div>
                                <div className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                                    <span className="font-medium block">🥗 Health & Wellness</span>
                                    <span className="text-xs">Nutrition, exercise, preventive care</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-8 px-3">
                            <div className="p-3 bg-yellow-50 dark:bg-yellow-900 rounded-md">
                                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                                    <strong>Medical Disclaimer:</strong> This AI provides general information, not medical advice. Always consult healthcare professionals for personal medical needs.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Main chat area */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Chat header */}
                    <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                        <div className="h-16 flex items-center justify-between px-4">
                            <div className="flex items-center">
                                <button
                                    className="md:hidden -ml-2 mr-2 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-50 focus:outline-none"
                                    onClick={() => setSidebarOpen(!sidebarOpen)}
                                >
                                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>
                                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                                    MediAssist AI
                                </h2>
                            </div>
                            <div className="flex items-center">
                                <Link href="/health" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                                    Back to Dashboard
                                </Link>
                            </div>
                        </div>
                    </div>
                    
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 bg-white dark:bg-gray-900">
                        <div className="max-w-3xl mx-auto">
                            {activeConversation.messages.map((message, index) => (
                                <div 
                                    key={index} 
                                    className={`mb-6 flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                                >
                                    <div className={`max-w-[80%]`}>
                                        {message.isBot && (
                                            <div className="flex items-center mb-2">
                                                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">MediAssist AI</span>
                                            </div>
                                        )}
                                        <div 
                                            className={`p-4 rounded-lg ${
                                                message.isBot 
                                                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200' 
                                                    : 'bg-blue-600 text-white'
                                            }`}
                                        >
                                            <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                                        </div>
                                        {!message.isBot && (
                                            <div className="flex justify-end mt-2">
                                                <span className="text-xs text-gray-500 dark:text-gray-400">You</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="mb-6 flex justify-start">
                                    <div className="max-w-[80%]">
                                        <div className="flex items-center mb-2">
                                            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">MediAssist AI</span>
                                        </div>
                                        <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
                                            <div className="flex space-x-2">
                                                <div className="animate-bounce h-2 w-2 bg-blue-500 rounded-full"></div>
                                                <div className="animate-bounce h-2 w-2 bg-blue-500 rounded-full animation-delay-200"></div>
                                                <div className="animate-bounce h-2 w-2 bg-blue-500 rounded-full animation-delay-400"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>
                    
                    {/* Input area */}
                    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
                        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
                            <div className="flex items-center">
                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={handleInputChange}
                                    placeholder="Type your health question..."
                                    className="flex-1 rounded-l-lg border border-gray-300 dark:border-gray-600 px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading || !inputText.trim()}
                                    className="bg-blue-600 text-white rounded-r-lg px-4 py-2 font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                            <p className="mt-2 text-xs text-center text-gray-500 dark:text-gray-400">
                                MediAssist AI provides general information, not medical advice. Consult healthcare professionals for personal medical guidance.
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </HealthcareLayout>
    );
};

export default HealthAssistant;