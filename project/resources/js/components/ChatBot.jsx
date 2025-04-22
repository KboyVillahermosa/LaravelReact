import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const ChatBot = () => {
    const [messages, setMessages] = useState([
        { text: 'Hi! I\'m your AI assistant. How can I help you today?', isBot: true }
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    // Set to true to use fallback mode during development
    const useFallbackMode = true;
    
    const handleInputChange = (e) => {
        setInputText(e.target.value);
    };
    
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    
    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!inputText.trim()) return;
        
        // Add user message
        const userMessage = { text: inputText, isBot: false };
        setMessages(prev => [...prev, userMessage]);
        
        // Store input text in a local variable before clearing it
        const currentInput = inputText;
        setInputText('');
        setIsLoading(true);
        
        // Use fallback mode during development
        if (useFallbackMode) {
            setTimeout(() => {
                // Generate a relevant response based on user input
                let aiResponse;
                const userText = currentInput.toLowerCase(); // Use the stored input
                
                if (userText.includes('hello') || userText.includes('hi') || userText.includes('hey')) {
                    aiResponse = "Hello there! How can I assist you today?";
                } else if (userText.includes('how are you')) {
                    aiResponse = "I'm just a chatbot, but I'm functioning well. Thanks for asking! How can I help you?";
                } else if (userText.includes('help') || userText.includes('support')) {
                    aiResponse = "I'd be happy to help. What specific information or assistance do you need?";
                } else if (userText.includes('time') || userText.includes('date')) {
                    aiResponse = `It's currently ${new Date().toLocaleString()}`;
                } else if (userText.includes('thank')) {
                    aiResponse = "You're welcome! Is there anything else I can help with?";
                } else if (userText.includes('bye') || userText.includes('goodbye')) {
                    aiResponse = "Goodbye! Feel free to chat again if you need assistance.";
                } else if (userText.length < 10) {
                    aiResponse = "Could you provide more details so I can better assist you?";
                } else {
                    // Default response for any unrecognized input
                    const responses = [
                        `I understand your question about "${currentInput}". This is an interesting topic that can be approached from multiple angles. Can you provide more context about what you're trying to accomplish?`,
                        
                        `Regarding "${currentInput}", there are several perspectives to consider. The best approach may depend on your specific requirements and constraints. Would you like to discuss a particular aspect of this topic?`,
                        
                        `That's an interesting question about "${currentInput}". Based on my understanding, there are multiple factors involved. What specific information are you looking for?`,
                        
                        `When it comes to "${currentInput}", it's important to consider both practical and theoretical aspects. Could you clarify which aspect you're most interested in?`,
                        
                        `Thanks for asking about "${currentInput}". This is a topic with several dimensions. To provide the most helpful response, could you share what you're trying to achieve?`
                    ];
                    
                    // Select a random response
                    const randomIndex = Math.floor(Math.random() * responses.length);
                    aiResponse = responses[randomIndex];
                    
                    // Debug logging
                    console.log('Question:', currentInput);
                    console.log('Selected response index:', randomIndex);
                    console.log('Response:', aiResponse);
                }
                
                // Add bot response after delay
                setMessages(prev => [...prev, { text: aiResponse, isBot: true }]);
                setIsLoading(false);
            }, 1000);
            
            return; // Skip the API call when in fallback mode
        }
        
        try {
            // Get conversation history for context
            const conversationHistory = messages
                .slice(-4) // Only use the last 4 messages for context
                .map(msg => msg.isBot ? 'AI: ' + msg.text : 'User: ' + msg.text)
                .join('\n');
            
            const prompt = `${conversationHistory}\nUser: ${inputText}\nAI:`;
            
            // Call DeepAI API with updated header format
            const response = await axios({
                method: 'post',
                url: 'https://api.deepai.org/api/text-generator',
                headers: {
                    'Api-Key': 'd17f5611-8cef-4841-90e7-0b786611ca6b',
                    'Content-Type': 'application/json'
                },
                data: {
                    text: prompt
                }
            });
            
            console.log('API Response:', response.data);
            
            // Check if the response has the expected format
            if (!response.data || !response.data.output) {
                throw new Error('Invalid response from API');
            }
            
            // Process and clean up the response
            let aiResponse = response.data.output;
            
            // Remove any "AI:" or "User:" prefixes from the response
            aiResponse = aiResponse.split('\n')[0];
            if (aiResponse.startsWith('AI:')) {
                aiResponse = aiResponse.substring(3).trim();
            }
            
            console.log('Selected AI response:', aiResponse);
            setMessages(prev => [...prev, {
                text: aiResponse || "I'm not sure how to respond to that.",
                isBot: true
            }]);
        } catch (error) {
            console.error('Error calling DeepAI API:', error);
            
            // More detailed error message
            let errorMessage = 'Sorry, I encountered an error processing your request.';
            
            if (error.response) {
                console.error('API Error Response:', error.response.data);
                errorMessage = `Error ${error.response.status}: ${error.response.data.message || 'API returned an error'}`;
            } else if (error.request) {
                errorMessage = 'No response from the AI service. Please check your connection.';
            } else {
                errorMessage = `Error: ${error.message}`;
            }
            
            setMessages(prev => [...prev, {
                text: errorMessage,
                isBot: true
            }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    // Rest of the component remains the same
    return (
        <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 z-50">
            <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
                <h3 className="font-medium">AI Assistant</h3>
                <button 
                    onClick={() => document.querySelector('.chat-body').classList.toggle('hidden')}
                    className="text-white hover:text-gray-200"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 111.414 1.414l-4 4a1 1 01-1.414 0l-4-4a1 1 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
            
            <div className="chat-body">
                <div className="h-80 overflow-y-auto p-3">
                    {messages.map((message, index) => (
                        <div 
                            key={index} 
                            className={`mb-3 ${message.isBot ? 'text-left' : 'text-right'}`}
                        >
                            <div 
                                className={`inline-block p-2 rounded-lg max-w-[80%] ${
                                    message.isBot 
                                        ? 'bg-gray-200 text-gray-800' 
                                        : 'bg-blue-600 text-white'
                                }`}
                            >
                                {message.text}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="text-left mb-3">
                            <div className="inline-block p-2 rounded-lg bg-gray-200">
                                <div className="flex space-x-1">
                                    <div className="animate-bounce h-2 w-2 bg-gray-500 rounded-full"></div>
                                    <div className="animate-bounce h-2 w-2 bg-gray-500 rounded-full animation-delay-200"></div>
                                    <div className="animate-bounce h-2 w-2 bg-gray-500 rounded-full animation-delay-400"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                
                <form onSubmit={handleSubmit} className="border-t border-gray-200 p-3">
                    <div className="flex">
                        <input
                            type="text"
                            value={inputText}
                            onChange={handleInputChange}
                            placeholder="Type a message..."
                            className="flex-1 border rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-blue-600 text-white px-4 rounded-r-lg hover:bg-blue-700 disabled:bg-blue-400"
                        >
                            Send
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChatBot;