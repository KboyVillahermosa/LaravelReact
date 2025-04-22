import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const HealthchatAI = () => {
    // Chat session data structure
    const [chatSessions, setChatSessions] = useState(() => {
        // Try to load from localStorage
        const savedSessions = localStorage.getItem('healthchat_sessions');
        if (savedSessions) {
            try {
                return JSON.parse(savedSessions);
            } catch (e) {
                console.error('Failed to parse saved sessions', e);
            }
        }
        
        // Default initial session
        return [{
            id: 'default-' + Date.now(),
            title: 'New conversation',
            date: new Date().toISOString(),
            messages: [
                { 
                    id: 'welcome-' + Date.now(),
                    text: 'Hi! I\'m your MediAssist AI. I can help answer health-related questions, explain medical terms, or provide general wellness information. How can I assist you today?', 
                    isBot: true,
                    timestamp: new Date().toISOString()
                }
            ]
        }];
    });
    
    const [activeSessionId, setActiveSessionId] = useState(() => {
        return chatSessions[0]?.id || 'default-' + Date.now();
    });
    
    // Current active messages
    const [messages, setMessages] = useState(() => {
        return chatSessions.find(s => s.id === activeSessionId)?.messages || [];
    });
    
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isChatExpanded, setIsChatExpanded] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);
    const messagesEndRef = useRef(null);
    
    const useFallbackMode = true;
    
    // Save sessions to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('healthchat_sessions', JSON.stringify(chatSessions));
    }, [chatSessions]);
    
    // Update messages when activeSessionId changes
    useEffect(() => {
        const session = chatSessions.find(s => s.id === activeSessionId);
        if (session) {
            setMessages(session.messages);
        }
    }, [activeSessionId, chatSessions]);
    
    const handleInputChange = (e) => {
        setInputText(e.target.value);
    };
    
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    
    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    
    const toggleChatExpansion = () => {
        setIsChatExpanded(!isChatExpanded);
        // Show sidebar when expanding
        if (!isChatExpanded) {
            setShowSidebar(true);
        }
    };
    
    const toggleSidebar = () => {
        setShowSidebar(!showSidebar);
    };
    
    const startNewChat = () => {
        const newSession = {
            id: 'session-' + Date.now(),
            title: 'New conversation',
            date: new Date().toISOString(),
            messages: [
                { 
                    id: 'welcome-' + Date.now(),
                    text: 'Hi! I\'m your MediAssist AI. I can help answer health-related questions, explain medical terms, or provide general wellness information. How can I assist you today?', 
                    isBot: true,
                    timestamp: new Date().toISOString()
                }
            ]
        };
        
        setChatSessions(prev => [newSession, ...prev]);
        setActiveSessionId(newSession.id);
    };
    
    const switchSession = (sessionId) => {
        setActiveSessionId(sessionId);
    };
    
    const deleteSession = (sessionId, e) => {
        e.stopPropagation(); // Prevent triggering switchSession
        
        setChatSessions(prev => prev.filter(session => session.id !== sessionId));
        
        // If we're deleting the active session, switch to another one
        if (sessionId === activeSessionId) {
            const remainingSessions = chatSessions.filter(session => session.id !== sessionId);
            if (remainingSessions.length > 0) {
                setActiveSessionId(remainingSessions[0].id);
            } else {
                // If there are no sessions left, create a new one
                startNewChat();
            }
        }
    };
    
    const updateSessionTitle = (sessionId, userText) => {
        // Create title from first user message
        const title = userText.length > 25 
            ? userText.substring(0, 25) + '...' 
            : userText;
        
        setChatSessions(prev => prev.map(session => {
            if (session.id === sessionId) {
                return {
                    ...session,
                    title
                };
            }
            return session;
        }));
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!inputText.trim()) return;
        
        // Add user message
        const userMessage = { 
            id: 'user-' + Date.now(), 
            text: inputText, 
            isBot: false, 
            timestamp: new Date().toISOString() 
        };
        
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        
        // Update the session
        setChatSessions(prev => prev.map(session => {
            if (session.id === activeSessionId) {
                // Check if this is first user message and update title
                if (session.messages.length === 1 && session.messages[0].isBot) {
                    updateSessionTitle(activeSessionId, inputText);
                }
                
                return {
                    ...session,
                    date: new Date().toISOString(),
                    messages: updatedMessages
                };
            }
            return session;
        }));
        
        // Store input text in a local variable before clearing it
        const currentInput = inputText;
        setInputText('');
        setIsLoading(true);
        
        // Use fallback mode during development
        if (useFallbackMode) {
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
                } else if (userText.includes('blood pressure') || userText.includes('hypertension')) {
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
                } else if (userText.includes('heart') || userText.includes('cardiac') || userText.includes('cardiovascular')) {
                    aiResponse = "Heart health is crucial for overall wellbeing. Common cardiovascular conditions include coronary artery disease, heart failure, arrhythmias, and valve disorders. Risk factors include high blood pressure, high cholesterol, smoking, diabetes, obesity, physical inactivity, and family history. Prevention strategies include regular exercise, a heart-healthy diet low in saturated fats and sodium, not smoking, limiting alcohol, and managing stress. Would you like information about specific heart conditions or prevention strategies?";
                } else if (userText.includes('cancer') || userText.includes('tumor') || userText.includes('oncology')) {
                    aiResponse = "Cancer refers to diseases characterized by abnormal cell growth. Common types include breast, lung, prostate, colorectal, and skin cancers. Early detection through screening is crucial for successful treatment. Treatment options may include surgery, chemotherapy, radiation therapy, immunotherapy, and targeted therapy. Risk can be reduced by avoiding tobacco, limiting alcohol, maintaining a healthy weight, staying physically active, eating a balanced diet, and protecting skin from sun exposure. Would you like information about a specific type of cancer?";
                } else if (userText.includes('asthma') || userText.includes('breathing') || userText.includes('respiratory')) {
                    aiResponse = "Asthma is a chronic condition affecting the airways in the lungs, causing wheezing, shortness of breath, chest tightness, and coughing. Triggers can include allergens, exercise, cold air, respiratory infections, and stress. Management typically involves avoiding triggers, using maintenance medications to control inflammation, and having rescue medications for sudden symptoms. An asthma action plan developed with a healthcare provider is essential. Would you like information about specific asthma medications or management strategies?";
                } else if (userText.includes('alzheimer') || userText.includes('dementia') || userText.includes('memory loss')) {
                    aiResponse = "Alzheimer's disease is the most common form of dementia, characterized by progressive memory loss and cognitive decline. Early signs include forgetting recent events, difficulty completing familiar tasks, confusion with time or place, and changes in mood or personality. While there's no cure, some medications may temporarily improve symptoms. Lifestyle factors that may reduce risk include regular physical exercise, social engagement, mental stimulation, heart-healthy diet, and quality sleep. Would you like more information about dementia care or support resources?";
                } else if (userText.includes('arthritis') || userText.includes('joint pain')) {
                    aiResponse = "Arthritis refers to inflammation of joints, with osteoarthritis and rheumatoid arthritis being the most common types. Symptoms include joint pain, stiffness, swelling, and decreased range of motion. Management strategies include physical activity, maintaining a healthy weight, hot and cold therapy, assistive devices, and medications for pain and inflammation. For rheumatoid arthritis, disease-modifying antirheumatic drugs (DMARDs) may prevent joint damage. Would you like information about specific types of arthritis or management approaches?";
                } else if (userText.includes('depression') || userText.includes('mental health')) {
                    aiResponse = "Depression is a common mental health condition characterized by persistent sadness, loss of interest in activities, changes in sleep or appetite, fatigue, difficulty concentrating, and feelings of worthlessness. Treatment typically includes psychotherapy, medication, or a combination. Lifestyle factors that may help include regular physical activity, adequate sleep, stress management, social connection, and limiting alcohol. If you're experiencing symptoms of depression, it's important to seek help from a healthcare provider. Would you like information about mental health resources or specific treatments?";
                } else if (userText.includes('allergy') || userText.includes('allergic')) {
                    aiResponse = "Allergies occur when your immune system reacts to a foreign substance that's typically harmless. Common allergens include pollen, pet dander, certain foods, insect stings, and medications. Symptoms range from mild (sneezing, itching) to severe (anaphylaxis). Management involves avoiding triggers, over-the-counter antihistamines, and prescription medications. For severe allergies, epinephrine auto-injectors (like EpiPen) may be prescribed. Immunotherapy can help reduce sensitivity over time. Would you like information about specific allergies or treatment options?";
                } else if (userText.includes('pregnancy') || userText.includes('prenatal')) {
                    aiResponse = "Pregnancy typically lasts about 40 weeks, divided into three trimesters. Prenatal care includes regular check-ups, proper nutrition, appropriate exercise, and avoiding harmful substances. Common discomforts may include morning sickness, fatigue, back pain, and swelling. A balanced diet rich in folate, iron, calcium, and protein is important. Warning signs that require immediate medical attention include vaginal bleeding, severe abdominal pain, severe headaches, and reduced fetal movement. Would you like information about a specific aspect of pregnancy care?";
                } else if (userText.includes('migraine')) {
                    aiResponse = "Migraines are severe, recurring headaches often accompanied by nausea, vomiting, and sensitivity to light and sound. Some people experience an aura (visual disturbances) before the headache begins. Triggers can include stress, certain foods, hormonal changes, sleep disruption, and environmental factors. Treatment approaches include preventive medications taken regularly, acute medications for attacks, and lifestyle modifications to avoid triggers. Keeping a headache diary can help identify patterns and triggers. Would you like more information about migraine prevention or treatment?";
                } else if (userText.includes('thyroid')) {
                    aiResponse = "The thyroid gland produces hormones that regulate metabolism. Common disorders include hypothyroidism (underactive thyroid), hyperthyroidism (overactive thyroid), and thyroid nodules. Symptoms of hypothyroidism include fatigue, weight gain, cold intolerance, and depression, while hyperthyroidism may cause weight loss, rapid heartbeat, anxiety, and heat intolerance. Diagnosis typically involves blood tests measuring thyroid hormone levels. Treatment depends on the specific condition and may include medication, radioactive iodine, or surgery. Would you like more specific information about thyroid conditions?";
                
                // Handle "what is" questions for common health topics
                } else if (userText.match(/what is|what are|what's|whats/) && userText.includes('symptoms')) {
                    aiResponse = "Symptoms are physical or mental changes that indicate a potential medical condition. They're subjective experiences you can describe to healthcare providers, unlike signs which are objective and measurable. Common symptoms include pain, fatigue, fever, nausea, and mood changes. Tracking your symptoms—their severity, duration, triggers, and what relieves them—helps healthcare providers make accurate diagnoses. Which specific condition's symptoms would you like to learn about?";
                } else if (userText.match(/what is|what are|what's|whats/) && (userText.includes('bmi') || userText.includes('body mass index'))) {
                    aiResponse = "Body Mass Index (BMI) is a calculation using your height and weight to estimate body fat and screen for weight categories associated with health problems. The formula is weight (kg) divided by height squared (m²). Generally, a BMI under 18.5 is considered underweight, 18.5-24.9 is normal weight, 25-29.9 is overweight, and 30+ is obese. While BMI is a useful screening tool, it doesn't directly measure body fat or account for factors like muscle mass, bone density, or fat distribution. Would you like to know more about healthy weight management?";
                } else if (userText.match(/what is|what are|what's|whats/) && userText.includes('cholesterol')) {
                    aiResponse = "Cholesterol is a waxy, fat-like substance found in all cells of the body. It's essential for producing hormones, vitamin D, and substances that help digest food. However, high blood cholesterol can form plaque in arteries, increasing heart disease risk. There are two main types: LDL (often called 'bad' cholesterol) and HDL ('good' cholesterol). Total cholesterol below 200 mg/dL is desirable, with LDL below 100 mg/dL and HDL above 60 mg/dL. Would you like information about managing cholesterol levels?";
                } else if (userText.match(/what is|what are|what's|whats/) && (userText.includes('virus') || userText.includes('viral infection'))) {
                    aiResponse = "Viruses are microscopic infectious agents that can only replicate inside host cells. They consist of genetic material (DNA or RNA) enclosed in a protein coat. Viral infections occur when viruses enter your body's cells and multiply, causing symptoms from mild (common cold) to severe (influenza, COVID-19). They spread through various routes including respiratory droplets, direct contact, contaminated surfaces, or insect bites. Unlike bacterial infections, viral infections generally don't respond to antibiotics. Would you like information about preventing viral infections or managing symptoms?";
                
                // Handle "how to" questions for health management
                } else if (userText.match(/how to|how do|how can/) && (userText.includes('lose weight') || userText.includes('weight loss'))) {
                    aiResponse = "Healthy weight loss involves creating a calorie deficit through diet changes and increased physical activity. Effective strategies include: 1) Focusing on nutrient-dense foods like vegetables, fruits, lean proteins, and whole grains; 2) Controlling portion sizes; 3) Staying hydrated; 4) Aiming for 150-300 minutes of moderate exercise weekly; 5) Getting adequate sleep; 6) Managing stress; and 7) Setting realistic goals (typically 1-2 pounds per week). Crash diets often lead to temporary results. Sustainable lifestyle changes are more effective for long-term weight management. Would you like specific information about nutrition or exercise planning?";
                } else if (userText.match(/how to|how do|how can/) && (userText.includes('blood pressure') || userText.includes('hypertension'))) {
                    aiResponse = "To manage blood pressure: 1) Maintain a healthy weight; 2) Follow a diet rich in fruits, vegetables, whole grains, and low-fat dairy (DASH diet); 3) Reduce sodium intake to less than 2,300mg daily; 4) Exercise regularly (150 minutes of moderate activity weekly); 5) Limit alcohol consumption; 6) Avoid or quit smoking; 7) Manage stress through techniques like meditation; 8) Take medications as prescribed; and 9) Monitor your blood pressure regularly. Even small reductions in blood pressure can significantly decrease cardiovascular risk. Would you like more specific information about the DASH diet or stress management techniques?";
                } else if (userText.match(/how to|how do|how can/) && userText.includes('stress')) {
                    aiResponse = "To manage stress effectively: 1) Practice relaxation techniques like deep breathing, meditation, or progressive muscle relaxation; 2) Exercise regularly; 3) Maintain a healthy diet and limit caffeine/alcohol; 4) Get adequate sleep (7-9 hours); 5) Connect with supportive people; 6) Set realistic goals and priorities; 7) Take breaks and practice self-care; 8) Engage in enjoyable activities; 9) Consider journaling to identify stress triggers; and 10) Seek professional help if stress becomes overwhelming. Would you like details about specific relaxation techniques or stress-reduction exercises?";
                
                // Handle "why" questions for health explanations
                } else if (userText.match(/why do|why does|why am|why is|why are/) && (userText.includes('tired') || userText.includes('fatigue'))) {
                    aiResponse = "Fatigue has many potential causes, including: 1) Poor sleep quality or insufficient sleep; 2) Physical conditions like anemia, thyroid disorders, diabetes, or heart disease; 3) Mental health issues such as depression or anxiety; 4) Medication side effects; 5) Poor nutrition or dehydration; 6) Excessive physical exertion; 7) Stress or emotional exhaustion; 8) Viral or bacterial infections; and 9) Chronic conditions like fibromyalgia or chronic fatigue syndrome. Persistent unexplained fatigue warrants medical attention, especially if accompanied by other symptoms. Would you like information about improving sleep quality or energy levels?";
                } else if (userText.match(/why do|why does|why am|why is|why are/) && userText.includes('headache')) {
                    aiResponse = "Headaches occur for many reasons: 1) Tension in neck, scalp, or jaw muscles; 2) Changes in brain chemistry or blood vessels (migraines); 3) Sinus congestion; 4) Eye strain; 5) Dehydration; 6) Hunger or low blood sugar; 7) Medication side effects; 8) Caffeine withdrawal; 9) Alcohol consumption; 10) Stress or anxiety; 11) Poor posture; 12) Environmental triggers like strong smells or bright lights; and 13) Underlying medical conditions. While most headaches aren't serious, sudden severe headaches, especially with other symptoms, require immediate medical attention. Would you like information about headache prevention or management?";
                
                // Handle prevention questions
                } else if (userText.includes('prevent') || userText.includes('prevention')) {
                    if (userText.includes('heart') || userText.includes('cardiac')) {
                        aiResponse = "To prevent heart disease: 1) Maintain a healthy blood pressure (under 120/80 mmHg); 2) Keep cholesterol levels in check; 3) Eat a heart-healthy diet rich in fruits, vegetables, whole grains, and lean proteins; 4) Exercise regularly (at least 150 minutes of moderate activity weekly); 5) Maintain a healthy weight; 6) Don't smoke and avoid secondhand smoke; 7) Limit alcohol consumption; 8) Manage stress; 9) Control diabetes if you have it; and 10) Get regular health screenings. Family history plays a role in heart disease risk, making preventive measures even more important for those with family history. Would you like specific information about heart-healthy diets or exercise?";
                    } else if (userText.includes('diabetes')) {
                        aiResponse = "To prevent type 2 diabetes: 1) Maintain a healthy weight; 2) Eat a balanced diet rich in vegetables, fruits, and whole grains while limiting refined carbs and added sugars; 3) Exercise regularly (at least 150 minutes of moderate activity weekly); 4) Quit smoking; 5) Control blood pressure and cholesterol; 6) Limit alcohol consumption; and 7) Get regular health screenings, especially if you have risk factors like family history or prediabetes. Even modest weight loss (5-7% of body weight) and moderate physical activity can significantly reduce diabetes risk. Would you like specific information about diabetes risk factors or dietary recommendations?";
                    } else {
                        aiResponse = "Disease prevention generally involves: 1) Maintaining a healthy lifestyle with balanced nutrition and regular physical activity; 2) Getting recommended vaccinations; 3) Getting adequate sleep; 4) Practicing good hygiene, including regular handwashing; 5) Avoiding tobacco and limiting alcohol; 6) Managing stress; 7) Maintaining a healthy weight; and 8) Getting regular health screenings appropriate for your age, sex, and risk factors. Preventive healthcare is often more effective and less costly than treating diseases after they develop. Which specific condition's prevention strategies would you like to learn more about?";
                    }
                
                // Handle treatment questions
                } else if (userText.includes('treatment') || userText.includes('cure') || userText.includes('heal')) {
                    aiResponse = "Treatment approaches vary widely depending on the condition. They may include: 1) Medications to manage symptoms or treat underlying causes; 2) Lifestyle modifications like diet changes or exercise; 3) Physical therapy; 4) Surgical interventions; 5) Counseling or psychotherapy; 6) Alternative therapies like acupuncture; and 7) Home remedies for symptom management. Medical treatments should be guided by healthcare professionals based on diagnosis, severity, medical history, and individual factors. For specific treatment information, consulting with a healthcare provider is recommended. Is there a particular condition's treatment you'd like to know more about?";
                
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
                
                const botMessage = { 
                    id: 'bot-' + Date.now(), 
                    text: aiResponse, 
                    isBot: true,
                    timestamp: new Date().toISOString()
                };
                
                const newMessages = [...updatedMessages, botMessage];
                setMessages(newMessages);
                
                // Update the session with bot response
                setChatSessions(prev => prev.map(session => {
                    if (session.id === activeSessionId) {
                        return {
                            ...session,
                            date: new Date().toISOString(),
                            messages: newMessages
                        };
                    }
                    return session;
                }));
                
                setIsLoading(false);
            }, 1000);
            
            return;
        }
        
        // DeepAI API integration code would go here (unchanged from your original implementation)
        // ...
    };
    
    const containerClass = isChatExpanded 
        ? "fixed inset-0 bg-white dark:bg-gray-900 z-50 flex" 
        : "fixed bottom-4 right-4 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 z-50";
    
    const headerClass = isChatExpanded
        ? "bg-blue-600 text-white p-4 flex justify-between items-center border-b dark:border-gray-700"
        : "bg-blue-600 text-white p-3 flex justify-between items-center";
    
    const chatBodyClass = isChatExpanded
        ? "flex-grow overflow-y-auto p-4"
        : "h-96 overflow-y-auto p-3";
    
    // Format date for display
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };
    
    return (
        <div className={containerClass}>
            {/* Sidebar - Only visible in expanded mode */}
            {isChatExpanded && showSidebar && (
                <div className="w-72 bg-gray-100 dark:bg-gray-800 border-r dark:border-gray-700 flex flex-col">
                    <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
                        <h3 className="font-medium text-gray-700 dark:text-gray-300">Chat History</h3>
                        <button 
                            onClick={toggleSidebar}
                            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                    
                    <div className="p-3">
                        <button 
                            onClick={startNewChat}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            New Chat
                        </button>
                    </div>
                    
                    <div className="overflow-y-auto flex-grow">
                        {chatSessions.map(session => (
                            <div 
                                key={session.id}
                                onClick={() => switchSession(session.id)}
                                className={`p-3 cursor-pointer flex justify-between group hover:bg-gray-200 dark:hover:bg-gray-700 ${
                                    session.id === activeSessionId ? 'bg-blue-100 dark:bg-blue-900/30 border-l-4 border-blue-500' : ''
                                }`}
                            >
                                <div className="overflow-hidden flex-1">
                                    <div className="font-medium text-gray-800 dark:text-gray-200 text-sm truncate">
                                        {session.title}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {formatDate(session.date)}
                                    </div>
                                </div>
                                <button 
                                    onClick={(e) => deleteSession(session.id, e)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-400 hover:text-red-500"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {/* Main chat interface */}
            <div className={isChatExpanded ? "flex flex-col flex-1" : ""}>
                <div className={headerClass}>
                    <div className="flex items-center">
                        {isChatExpanded && (
                            <button 
                                onClick={toggleSidebar}
                                className="text-white hover:text-gray-200 mr-3"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                </svg>
                            </button>
                        )}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <h3 className="font-medium">MediAssist AI</h3>
                    </div>
                    <div className="flex">
                        <button 
                            onClick={toggleChatExpansion}
                            className="text-white hover:text-gray-200 mr-2"
                        >
                            {isChatExpanded ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                </svg>
                            )}
                        </button>
                        {!isChatExpanded && (
                            <button 
                                onClick={() => document.querySelector('.chat-body').classList.toggle('hidden')}
                                className="text-white hover:text-gray-200"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
                
                <div className="chat-body flex-1">
                    <div className={chatBodyClass}>
                        {messages.map((message) => (
                            <div 
                                key={message.id} 
                                className={`mb-4 ${message.isBot ? 'text-left' : 'text-right'}`}
                            >
                                {message.isBot && (
                                    <div className="flex items-center mb-1 text-sm text-gray-500 dark:text-gray-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                        </svg>
                                        MediAssist AI
                                    </div>
                                )}
                                <div 
                                    className={`inline-block p-3 rounded-lg max-w-[90%] ${
                                        message.isBot 
                                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200' 
                                            : 'bg-blue-600 text-white'
                                    }`}
                                >
                                    {message.text}
                                </div>
                                {!message.isBot && (
                                    <div className="flex justify-end items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        You
                                    </div>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="text-left mb-4">
                                <div className="flex items-center mb-1 text-sm text-gray-500 dark:text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                    </svg>
                                    MediAssist AI
                                </div>
                                <div className="inline-block p-3 rounded-lg bg-gray-100 dark:bg-gray-700">
                                    <div className="flex space-x-2">
                                        <div className="animate-bounce h-2 w-2 bg-blue-500 rounded-full"></div>
                                        <div className="animate-bounce h-2 w-2 bg-blue-500 rounded-full animation-delay-200"></div>
                                        <div className="animate-bounce h-2 w-2 bg-blue-500 rounded-full animation-delay-400"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    
                    <form onSubmit={handleSubmit} className="border-t border-gray-200 dark:border-gray-700 p-3">
                        <div className="flex">
                            <input
                                type="text"
                                value={inputText}
                                onChange={handleInputChange}
                                placeholder="Type your health question..."
                                className="flex-1 border dark:border-gray-600 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !inputText.trim()}
                                className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors duration-200"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                            MediAssist AI provides general information, not medical advice. Consult healthcare professionals for personal medical guidance.
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default HealthchatAI;