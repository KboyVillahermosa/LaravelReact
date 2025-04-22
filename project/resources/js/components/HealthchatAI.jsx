import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

// Setup CSRF protection for Laravel
axios.defaults.withCredentials = true;
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

const HealthchatAI = () => {
    const [chatSessions, setChatSessions] = useState([]);
    const [isLoadingSessions, setIsLoadingSessions] = useState(true);
    const [activeSessionId, setActiveSessionId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isChatExpanded, setIsChatExpanded] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);
    const messagesEndRef = useRef(null);
    
    const useFallbackMode = true;
    
    // Fetch sessions from database on initial load
    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const response = await axios.get('/api/chat-sessions');
                console.log('Fetched sessions from DB:', response.data);
                
                if (response.data.length > 0) {
                    setChatSessions(response.data);
                    setActiveSessionId(response.data[0].id);
                } else {
                    // Create a new session if none exist
                    startNewChat();
                }
            } catch (error) {
                console.error('Failed to fetch chat sessions:', error);
                
                // Fallback to localStorage
                const savedSessions = localStorage.getItem('healthchat_sessions');
                if (savedSessions) {
                    try {
                        const parsedSessions = JSON.parse(savedSessions);
                        setChatSessions(parsedSessions);
                        setActiveSessionId(parsedSessions[0]?.id);
                    } catch (e) {
                        console.error('Failed to parse saved sessions', e);
                        startNewChat();
                    }
                } else {
                    startNewChat();
                }
            } finally {
                setIsLoadingSessions(false);
            }
        };
        
        fetchSessions();
    }, []);
    
    // Backup to localStorage for offline support
    useEffect(() => {
        if (chatSessions.length > 0) {
            localStorage.setItem('healthchat_sessions', JSON.stringify(chatSessions));
        }
    }, [chatSessions]);
    
    // Update messages when activeSessionId changes
    useEffect(() => {
        const session = chatSessions.find(s => s.id === activeSessionId);
        if (session) {
            setMessages(session.messages || []);
        }
    }, [activeSessionId, chatSessions]);
    
    // Auto-scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    
    const handleInputChange = (e) => {
        setInputText(e.target.value);
    };
    
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    
    const toggleChatExpansion = () => {
        setIsChatExpanded(!isChatExpanded);
        if (!isChatExpanded) {
            setShowSidebar(true);
        }
    };
    
    const toggleSidebar = () => {
        setShowSidebar(!showSidebar);
    };
    
    const startNewChat = async () => {
        const welcomeMessage = {
            id: 'welcome-' + Date.now(),
            text: 'Hi! I\'m your MediAssist AI. I can help answer health-related questions, explain medical terms, or provide general wellness information. How can I assist you today?',
            isBot: true,
            timestamp: new Date().toISOString()
        };
        
        const newSession = {
            title: 'New conversation',
            date: new Date().toISOString(),
            messages: [welcomeMessage]
        };
        
        try {
            // Create session in database
            const response = await axios.post('/api/chat-sessions', newSession);
            console.log('Created new session in DB:', response.data);
            
            // Update state with the returned session (which now has a DB ID)
            setChatSessions(prev => [response.data, ...prev]);
            setActiveSessionId(response.data.id);
        } catch (error) {
            console.error('Failed to create new chat session in DB:', error);
            
            // Fallback to local ID if database save fails
            const tempSession = {
                id: 'session-' + Date.now(),
                ...newSession
            };
            
            setChatSessions(prev => [tempSession, ...prev]);
            setActiveSessionId(tempSession.id);
        }
    };
    
    const switchSession = (sessionId) => {
        setActiveSessionId(sessionId);
    };
    
    const deleteSession = async (sessionId, e) => {
        e.stopPropagation(); // Prevent triggering switchSession
        
        try {
            // Only attempt to delete from DB if it's not a temporary session
            if (!sessionId.startsWith('session-') && !sessionId.startsWith('default-')) {
                await axios.delete(`/api/chat-sessions/${sessionId}`);
                console.log('Deleted session from DB:', sessionId);
            }
            
            setChatSessions(prev => prev.filter(session => session.id !== sessionId));
            
            // If we deleted the active session, switch to another one
            if (sessionId === activeSessionId) {
                const remainingSessions = chatSessions.filter(session => session.id !== sessionId);
                if (remainingSessions.length > 0) {
                    setActiveSessionId(remainingSessions[0].id);
                } else {
                    startNewChat();
                }
            }
        } catch (error) {
            console.error('Failed to delete chat session:', error);
            alert('Failed to delete the chat session. Please try again.');
        }
    };
    
    const updateSessionTitle = (sessionId, userText) => {
        // Create title from first user message
        return userText.length > 25 
            ? userText.substring(0, 25) + '...' 
            : userText;
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
        
        // Find current session
        const currentSession = chatSessions.find(s => s.id === activeSessionId);
        
        // Check if this is first user message and update title
        let updatedTitle = currentSession.title;
        if (currentSession.messages.length === 1 && currentSession.messages[0].isBot) {
            updatedTitle = updateSessionTitle(activeSessionId, inputText);
        }
        
        // Optimistically update UI
        setChatSessions(prev => prev.map(session => {
            if (session.id === activeSessionId) {
                return {
                    ...session,
                    title: updatedTitle,
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
            setTimeout(async () => {
                // Your existing response generation logic
                let aiResponse = generateFallbackResponse(currentInput);
                
                const botMessage = { 
                    id: 'bot-' + Date.now(), 
                    text: aiResponse, 
                    isBot: true,
                    timestamp: new Date().toISOString()
                };
                
                const newMessages = [...updatedMessages, botMessage];
                setMessages(newMessages);
                
                // Prepare session data for database
                const updatedSession = {
                    id: activeSessionId,
                    title: updatedTitle,
                    date: new Date().toISOString(),
                    messages: newMessages
                };
                
                // Save to database if it's not a temporary session ID
                // or try to migrate temporary session to database
                try {
                    let response;
                    
                    if (!activeSessionId.startsWith('session-') && !activeSessionId.startsWith('default-')) {
                        // Update existing database session
                        response = await axios.post('/api/chat-sessions', updatedSession);
                        console.log('Updated session in DB:', response.data);
                    } else {
                        // Create new database session from temporary session
                        const sessionToSave = {
                            title: updatedTitle,
                            messages: newMessages,
                            date: new Date().toISOString()
                        };
                        
                        response = await axios.post('/api/chat-sessions', sessionToSave);
                        console.log('Migrated temp session to DB:', response.data);
                        
                        // Update local state with new database ID
                        setChatSessions(prev => prev.map(session => {
                            if (session.id === activeSessionId) {
                                return response.data;
                            }
                            return session;
                        }));
                        
                        // Update the active session ID
                        setActiveSessionId(response.data.id);
                    }
                } catch (error) {
                    console.error('Failed to save chat session to database:', error);
                    
                    // Still update local state even if DB update fails
                    setChatSessions(prev => prev.map(session => {
                        if (session.id === activeSessionId) {
                            return {
                                ...session,
                                title: updatedTitle,
                                messages: newMessages,
                                date: new Date().toISOString()
                            };
                        }
                        return session;
                    }));
                }
                
                setIsLoading(false);
            }, 1000);
            
            return;
        }
        
        // Your existing DeepAI implementation...
    };
    
    // Helper function to generate fallback responses
    const generateFallbackResponse = (input) => {
        const userText = input.toLowerCase();
        
        // Health-specific responses
        if (userText.includes('hello') || userText.includes('hi') || userText.includes('hey')) {
            return "Hello! I'm your healthcare assistant. I can help with medical information, symptoms, medications, and more. What health topic can I help you with today?";
        } else if (userText.includes('covid') || userText.includes('coronavirus')) {
            return "COVID-19 is caused by the SARS-CoV-2 virus and symptoms may include fever, cough, fatigue, loss of taste or smell, and shortness of breath. If you're experiencing symptoms, please consult with a healthcare provider. Would you like information about testing, prevention, or vaccination?";
        } else if (userText.includes('headache')) {
            return "Headaches can have many causes including stress, dehydration, lack of sleep, or underlying medical conditions. For occasional headaches, rest, hydration, and over-the-counter pain relievers may help. If you're experiencing severe, frequent, or unusual headaches, please consult a healthcare provider. Would you like tips for preventing headaches?";
        } else if (userText.includes('fever')) {
            return "Fever is usually a sign that your body is fighting an infection. Adults typically have a fever when their temperature is above 100.4°F (38°C). For mild fevers, rest and hydration often help. If the fever is high (above 103°F/39.4°C), persists for more than 3 days, or is accompanied by severe symptoms, please seek medical attention.";
        } else if (userText.includes('blood pressure') || userText.includes('hypertension')) {
            return "Normal blood pressure is typically around 120/80 mmHg. High blood pressure (hypertension) is generally considered to be 130/80 mmHg or higher. Lifestyle factors that can help manage blood pressure include regular exercise, reducing sodium intake, maintaining a healthy weight, limiting alcohol, and managing stress. Would you like more specific information about blood pressure management?";
        } else if (userText.includes('diabetes')) {
            return "Diabetes is a chronic condition affecting how your body processes blood sugar. There are several types, with Type 1, Type 2, and gestational diabetes being the most common. Symptoms may include increased thirst, frequent urination, hunger, fatigue, and blurred vision. Management typically involves monitoring blood sugar, medication, healthy eating, and regular physical activity. Would you like information about a specific aspect of diabetes?";
        } else if (userText.includes('vaccination') || userText.includes('vaccine')) {
            return "Vaccines are an important part of preventive healthcare. They work by stimulating your immune system to recognize and fight specific infectious agents. Recommended vaccines vary by age, health conditions, and other factors. It's best to consult with your healthcare provider about which vaccines are appropriate for you. Would you like information about specific vaccines?";
        } else if (userText.includes('sleep') || userText.includes('insomnia')) {
            return "Quality sleep is essential for overall health. Adults typically need 7-9 hours per night. Good sleep hygiene includes maintaining a regular sleep schedule, creating a restful environment, limiting screen time before bed, avoiding caffeine and alcohol close to bedtime, and regular exercise (though not right before sleeping). If you have persistent sleep problems, consider consulting a healthcare provider. Would you like more specific sleep tips?";
        } else if (userText.includes('stress') || userText.includes('anxiety')) {
            return "Stress and anxiety are common experiences that can affect physical and mental health. Management strategies include regular physical activity, relaxation techniques like deep breathing or meditation, adequate sleep, limiting alcohol and caffeine, and seeking social support. If stress or anxiety significantly impacts your daily life, consider speaking with a mental health professional. Would you like to learn about specific stress management techniques?";
        } else if (userText.includes('doctor') || userText.includes('appointment')) {
            return "Regular check-ups with healthcare providers are important for preventive care. When choosing a doctor, consider factors such as their specialization, location, insurance coverage, and communication style. Our telehealth service can connect you with healthcare professionals remotely. Would you like information about finding a doctor or scheduling a telehealth appointment?";
        } else if (userText.includes('nutrition') || userText.includes('diet') || userText.includes('food')) {
            return "A balanced diet typically includes fruits, vegetables, whole grains, lean proteins, and healthy fats. Nutritional needs vary based on age, sex, activity level, and health conditions. The Mediterranean and DASH diets are often recommended for overall health. Would you like nutrition information for a specific health condition or goal?";
        } else if (userText.includes('exercise') || userText.includes('workout')) {
            return "Regular physical activity offers numerous health benefits, including reduced risk of chronic diseases, improved mood, and better sleep. Adults should aim for at least 150 minutes of moderate-intensity activity or 75 minutes of vigorous activity weekly, plus muscle-strengthening activities twice a week. Always start gradually if you're new to exercise. Would you like suggestions for exercises suitable for your fitness level?";
        } else if (userText.includes('heart') || userText.includes('cardiac') || userText.includes('cardiovascular')) {
            return "Heart health is crucial for overall wellbeing. Common cardiovascular conditions include coronary artery disease, heart failure, arrhythmias, and valve disorders. Risk factors include high blood pressure, high cholesterol, smoking, diabetes, obesity, physical inactivity, and family history. Prevention strategies include regular exercise, a heart-healthy diet low in saturated fats and sodium, not smoking, limiting alcohol, and managing stress. Would you like information about specific heart conditions or prevention strategies?";
        } else if (userText.includes('cancer') || userText.includes('tumor') || userText.includes('oncology')) {
            return "Cancer refers to diseases characterized by abnormal cell growth. Common types include breast, lung, prostate, colorectal, and skin cancers. Early detection through screening is crucial for successful treatment. Treatment options may include surgery, chemotherapy, radiation therapy, immunotherapy, and targeted therapy. Risk can be reduced by avoiding tobacco, limiting alcohol, maintaining a healthy weight, staying physically active, eating a balanced diet, and protecting skin from sun exposure. Would you like information about a specific type of cancer?";
        } else if (userText.includes('asthma') || userText.includes('breathing') || userText.includes('respiratory')) {
            return "Asthma is a chronic condition affecting the airways in the lungs, causing wheezing, shortness of breath, chest tightness, and coughing. Triggers can include allergens, exercise, cold air, respiratory infections, and stress. Management typically involves avoiding triggers, using maintenance medications to control inflammation, and having rescue medications for sudden symptoms. An asthma action plan developed with a healthcare provider is essential. Would you like information about specific asthma medications or management strategies?";
        } else if (userText.includes('alzheimer') || userText.includes('dementia') || userText.includes('memory loss')) {
            return "Alzheimer's disease is the most common form of dementia, characterized by progressive memory loss and cognitive decline. Early signs include forgetting recent events, difficulty completing familiar tasks, confusion with time or place, and changes in mood or personality. While there's no cure, some medications may temporarily improve symptoms. Lifestyle factors that may reduce risk include regular physical exercise, social engagement, mental stimulation, heart-healthy diet, and quality sleep. Would you like more information about dementia care or support resources?";
        } else if (userText.includes('arthritis') || userText.includes('joint pain')) {
            return "Arthritis refers to inflammation of joints, with osteoarthritis and rheumatoid arthritis being the most common types. Symptoms include joint pain, stiffness, swelling, and decreased range of motion. Management strategies include physical activity, maintaining a healthy weight, hot and cold therapy, assistive devices, and medications for pain and inflammation. For rheumatoid arthritis, disease-modifying antirheumatic drugs (DMARDs) may prevent joint damage. Would you like information about specific types of arthritis or management approaches?";
        } else if (userText.includes('depression') || userText.includes('mental health')) {
            return "Depression is a common mental health condition characterized by persistent sadness, loss of interest in activities, changes in sleep or appetite, fatigue, difficulty concentrating, and feelings of worthlessness. Treatment typically includes psychotherapy, medication, or a combination. Lifestyle factors that may help include regular physical activity, adequate sleep, stress management, social connection, and limiting alcohol. If you're experiencing symptoms of depression, it's important to seek help from a healthcare provider. Would you like information about mental health resources or specific treatments?";
        } else if (userText.includes('allergy') || userText.includes('allergic')) {
            return "Allergies occur when your immune system reacts to a foreign substance that's typically harmless. Common allergens include pollen, pet dander, certain foods, insect stings, and medications. Symptoms range from mild (sneezing, itching) to severe (anaphylaxis). Management involves avoiding triggers, over-the-counter antihistamines, and prescription medications. For severe allergies, epinephrine auto-injectors (like EpiPen) may be prescribed. Immunotherapy can help reduce sensitivity over time. Would you like information about specific allergies or treatment options?";
        } else if (userText.includes('pregnancy') || userText.includes('prenatal')) {
            return "Pregnancy typically lasts about 40 weeks, divided into three trimesters. Prenatal care includes regular check-ups, proper nutrition, appropriate exercise, and avoiding harmful substances. Common discomforts may include morning sickness, fatigue, back pain, and swelling. A balanced diet rich in folate, iron, calcium, and protein is important. Warning signs that require immediate medical attention include vaginal bleeding, severe abdominal pain, severe headaches, and reduced fetal movement. Would you like information about a specific aspect of pregnancy care?";
        } else if (userText.includes('migraine')) {
            return "Migraines are severe, recurring headaches often accompanied by nausea, vomiting, and sensitivity to light and sound. Some people experience an aura (visual disturbances) before the headache begins. Triggers can include stress, certain foods, hormonal changes, sleep disruption, and environmental factors. Treatment approaches include preventive medications taken regularly, acute medications for attacks, and lifestyle modifications to avoid triggers. Keeping a headache diary can help identify patterns and triggers. Would you like more information about migraine prevention or treatment?";
        } else if (userText.includes('thyroid')) {
            return "The thyroid gland produces hormones that regulate metabolism. Common disorders include hypothyroidism (underactive thyroid), hyperthyroidism (overactive thyroid), and thyroid nodules. Symptoms of hypothyroidism include fatigue, weight gain, cold intolerance, and depression, while hyperthyroidism may cause weight loss, rapid heartbeat, anxiety, and heat intolerance. Diagnosis typically involves blood tests measuring thyroid hormone levels. Treatment depends on the specific condition and may include medication, radioactive iodine, or surgery. Would you like more specific information about thyroid conditions?";
        
        // Handle "what is" questions for common health topics
        } else if (userText.match(/what is|what are|what's|whats/) && userText.includes('symptoms')) {
            return "Symptoms are physical or mental changes that indicate a potential medical condition. They're subjective experiences you can describe to healthcare providers, unlike signs which are objective and measurable. Common symptoms include pain, fatigue, fever, nausea, and mood changes. Tracking your symptoms—their severity, duration, triggers, and what relieves them—helps healthcare providers make accurate diagnoses. Which specific condition's symptoms would you like to learn about?";
        } else if (userText.match(/what is|what are|what's|whats/) && (userText.includes('bmi') || userText.includes('body mass index'))) {
            return "Body Mass Index (BMI) is a calculation using your height and weight to estimate body fat and screen for weight categories associated with health problems. The formula is weight (kg) divided by height squared (m²). Generally, a BMI under 18.5 is considered underweight, 18.5-24.9 is normal weight, 25-29.9 is overweight, and 30+ is obese. While BMI is a useful screening tool, it doesn't directly measure body fat or account for factors like muscle mass, bone density, or fat distribution. Would you like to know more about healthy weight management?";
        } else if (userText.match(/what is|what are|what's|whats/) && userText.includes('cholesterol')) {
            return "Cholesterol is a waxy, fat-like substance found in all cells of the body. It's essential for producing hormones, vitamin D, and substances that help digest food. However, high blood cholesterol can form plaque in arteries, increasing heart disease risk. There are two main types: LDL (often called 'bad' cholesterol) and HDL ('good' cholesterol). Total cholesterol below 200 mg/dL is desirable, with LDL below 100 mg/dL and HDL above 60 mg/dL. Would you like information about managing cholesterol levels?";
        } else if (userText.match(/what is|what are|what's|whats/) && (userText.includes('virus') || userText.includes('viral infection'))) {
            return "Viruses are microscopic infectious agents that can only replicate inside host cells. They consist of genetic material (DNA or RNA) enclosed in a protein coat. Viral infections occur when viruses enter your body's cells and multiply, causing symptoms from mild (common cold) to severe (influenza, COVID-19). They spread through various routes including respiratory droplets, direct contact, contaminated surfaces, or insect bites. Unlike bacterial infections, viral infections generally don't respond to antibiotics. Would you like information about preventing viral infections or managing symptoms?";
        
        // Handle "how to" questions for health management
        } else if (userText.match(/how to|how do|how can/) && (userText.includes('lose weight') || userText.includes('weight loss'))) {
            return "Healthy weight loss involves creating a calorie deficit through diet changes and increased physical activity. Effective strategies include: 1) Focusing on nutrient-dense foods like vegetables, fruits, lean proteins, and whole grains; 2) Controlling portion sizes; 3) Staying hydrated; 4) Aiming for 150-300 minutes of moderate exercise weekly; 5) Getting adequate sleep; 6) Managing stress; and 7) Setting realistic goals (typically 1-2 pounds per week). Crash diets often lead to temporary results. Sustainable lifestyle changes are more effective for long-term weight management. Would you like specific information about nutrition or exercise planning?";
        } else if (userText.match(/how to|how do|how can/) && (userText.includes('blood pressure') || userText.includes('hypertension'))) {
            return "To manage blood pressure: 1) Maintain a healthy weight; 2) Follow a diet rich in fruits, vegetables, whole grains, and low-fat dairy (DASH diet); 3) Reduce sodium intake to less than 2,300mg daily; 4) Exercise regularly (150 minutes of moderate activity weekly); 5) Limit alcohol consumption; 6) Avoid or quit smoking; 7) Manage stress through techniques like meditation; 8) Take medications as prescribed; and 9) Monitor your blood pressure regularly. Even small reductions in blood pressure can significantly decrease cardiovascular risk. Would you like more specific information about the DASH diet or stress management techniques?";
        } else if (userText.match(/how to|how do|how can/) && userText.includes('stress')) {
            return "To manage stress effectively: 1) Practice relaxation techniques like deep breathing, meditation, or progressive muscle relaxation; 2) Exercise regularly; 3) Maintain a healthy diet and limit caffeine/alcohol; 4) Get adequate sleep (7-9 hours); 5) Connect with supportive people; 6) Set realistic goals and priorities; 7) Take breaks and practice self-care; 8) Engage in enjoyable activities; 9) Consider journaling to identify stress triggers; and 10) Seek professional help if stress becomes overwhelming. Would you like details about specific relaxation techniques or stress-reduction exercises?";
        
        // Handle "why" questions for health explanations
        } else if (userText.match(/why do|why does|why am|why is|why are/) && (userText.includes('tired') || userText.includes('fatigue'))) {
            return "Fatigue has many potential causes, including: 1) Poor sleep quality or insufficient sleep; 2) Physical conditions like anemia, thyroid disorders, diabetes, or heart disease; 3) Mental health issues such as depression or anxiety; 4) Medication side effects; 5) Poor nutrition or dehydration; 6) Excessive physical exertion; 7) Stress or emotional exhaustion; 8) Viral or bacterial infections; and 9) Chronic conditions like fibromyalgia or chronic fatigue syndrome. Persistent unexplained fatigue warrants medical attention, especially if accompanied by other symptoms. Would you like information about improving sleep quality or energy levels?";
        } else if (userText.match(/why do|why does|why am|why is|why are/) && userText.includes('headache')) {
            return "Headaches occur for many reasons: 1) Tension in neck, scalp, or jaw muscles; 2) Changes in brain chemistry or blood vessels (migraines); 3) Sinus congestion; 4) Eye strain; 5) Dehydration; 6) Hunger or low blood sugar; 7) Medication side effects; 8) Caffeine withdrawal; 9) Alcohol consumption; 10) Stress or anxiety; 11) Poor posture; 12) Environmental triggers like strong smells or bright lights; and 13) Underlying medical conditions. While most headaches aren't serious, sudden severe headaches, especially with other symptoms, require immediate medical attention. Would you like information about headache prevention or management?";
        
        // Handle prevention questions
        } else if (userText.includes('prevent') || userText.includes('prevention')) {
            if (userText.includes('heart') || userText.includes('cardiac')) {
                return "To prevent heart disease: 1) Maintain a healthy blood pressure (under 120/80 mmHg); 2) Keep cholesterol levels in check; 3) Eat a heart-healthy diet rich in fruits, vegetables, whole grains, and lean proteins; 4) Exercise regularly (at least 150 minutes of moderate activity weekly); 5) Maintain a healthy weight; 6) Don't smoke and avoid secondhand smoke; 7) Limit alcohol consumption; 8) Manage stress; 9) Control diabetes if you have it; and 10) Get regular health screenings. Family history plays a role in heart disease risk, making preventive measures even more important for those with family history. Would you like specific information about heart-healthy diets or exercise?";
            } else if (userText.includes('diabetes')) {
                return "To prevent type 2 diabetes: 1) Maintain a healthy weight; 2) Eat a balanced diet rich in vegetables, fruits, and whole grains while limiting refined carbs and added sugars; 3) Exercise regularly (at least 150 minutes of moderate activity weekly); 4) Quit smoking; 5) Control blood pressure and cholesterol; 6) Limit alcohol consumption; and 7) Get regular health screenings, especially if you have risk factors like family history or prediabetes. Even modest weight loss (5-7% of body weight) and moderate physical activity can significantly reduce diabetes risk. Would you like specific information about diabetes risk factors or dietary recommendations?";
            } else {
                return "Disease prevention generally involves: 1) Maintaining a healthy lifestyle with balanced nutrition and regular physical activity; 2) Getting recommended vaccinations; 3) Getting adequate sleep; 4) Practicing good hygiene, including regular handwashing; 5) Avoiding tobacco and limiting alcohol; 6) Managing stress; 7) Maintaining a healthy weight; and 8) Getting regular health screenings appropriate for your age, sex, and risk factors. Preventive healthcare is often more effective and less costly than treating diseases after they develop. Which specific condition's prevention strategies would you like to learn more about?";
            }
        
        // Handle treatment questions
        } else if (userText.includes('treatment') || userText.includes('cure') || userText.includes('heal')) {
            return "Treatment approaches vary widely depending on the condition. They may include: 1) Medications to manage symptoms or treat underlying causes; 2) Lifestyle modifications like diet changes or exercise; 3) Physical therapy; 4) Surgical interventions; 5) Counseling or psychotherapy; 6) Alternative therapies like acupuncture; and 7) Home remedies for symptom management. Medical treatments should be guided by healthcare professionals based on diagnosis, severity, medical history, and individual factors. For specific treatment information, consulting with a healthcare provider is recommended. Is there a particular condition's treatment you'd like to know more about?";
        
        } else if (userText.includes('thank')) {
            return "You're welcome! Taking an active interest in your health is important. Is there anything else I can help you understand about health topics today?";
        } else if (userText.includes('bye') || userText.includes('goodbye')) {
            return "Goodbye! Remember to take care of your health, and feel free to return if you have more questions. Stay well!";
        } else if (userText.length < 10) {
            return "Could you provide more details about your health question so I can give you more specific information?";
        } else {
            // Default health-themed responses for unrecognized inputs
            const responses = [
                `Regarding "${input}", this is an important health topic. While I can provide general information, remember that personalized medical advice should come from healthcare professionals. What specific aspect would you like to know more about?`,
                
                `Your question about "${input}" touches on an interesting health area. Health information can be complex, and individual factors often matter. Could you share what specific information would be most helpful for you?`,
                
                `When it comes to "${input}", there are several health considerations to keep in mind. Would you like general information, prevention strategies, or management approaches?`,
                
                `"${input}" is a topic that many people have questions about. I can provide general health information, but for personalized advice, consulting with a healthcare provider is best. What would you like to know specifically?`,
                
                `Thank you for asking about "${input}". Understanding health information is important for making informed decisions. Would you like me to cover basics, recent research, or management strategies?`
            ];
            
            const randomIndex = Math.floor(Math.random() * responses.length);
            return responses[randomIndex];
        }
    };
    
    const containerClass = isChatExpanded 
        ? "fixed inset-0 bg-white dark:bg-gray-900 z-50 flex" 
        : "fixed bottom-4 right-4 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700 z-50";
    
    const headerClass = isChatExpanded
        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 flex justify-between items-center border-b dark:border-gray-700 shadow-sm"
        : "bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 flex justify-between items-center";
    
    const chatBodyClass = isChatExpanded
        ? "flex-grow overflow-y-auto p-4 bg-slate-50 dark:bg-gray-850"
        : "h-96 overflow-y-auto p-3 bg-slate-50 dark:bg-gray-850";
    
    // Format date for display
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };
    
    return (
        <div className={containerClass}>
            {/* Sidebar - Only visible in expanded mode */}
            {isChatExpanded && showSidebar && (
                <div className="w-80 bg-white dark:bg-gray-800 border-r dark:border-gray-700 flex flex-col shadow-md">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 flex items-center justify-between text-white">
                        <h3 className="font-medium text-lg">Chat History</h3>
                        <button 
                            onClick={toggleSidebar}
                            className="p-1 rounded-full hover:bg-blue-500 transition-colors duration-200"
                            aria-label="Close sidebar"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                    
                    <div className="p-4 border-b dark:border-gray-700">
                        <button 
                            onClick={startNewChat}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-md flex items-center justify-center gap-2 transition-colors duration-200 font-medium shadow-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            New Chat
                        </button>
                    </div>
                    
                    <div className="overflow-y-auto flex-grow">
                        {isLoadingSessions ? (
                            <div className="flex justify-center items-center h-32">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : chatSessions.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                No chat history found
                            </div>
                        ) : (
                            chatSessions.map(session => (
                                <div 
                                    key={session.id}
                                    onClick={() => switchSession(session.id)}
                                    className={`p-3.5 cursor-pointer flex justify-between group hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
                                        session.id === activeSessionId ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' : 'border-l-4 border-transparent'
                                    }`}
                                >
                                    <div className="overflow-hidden flex-1">
                                        <div className="font-medium text-gray-800 dark:text-gray-200 text-sm truncate">
                                            {session.title}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            {formatDate(session.date)}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={(e) => deleteSession(session.id, e)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-400 hover:text-red-500 p-1"
                                        aria-label="Delete conversation"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            ))
                        )}
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
                                className="text-white hover:bg-blue-500 rounded-full p-1.5 mr-3 transition-colors duration-200"
                                aria-label="Toggle sidebar"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                </svg>
                            </button>
                        )}
                        <div className="bg-white/20 p-1.5 rounded-full mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h3 className="font-semibold text-lg">MediAssist AI</h3>
                    </div>
                    <div className="flex items-center">
                        <button 
                            onClick={toggleChatExpansion}
                            className="text-white hover:bg-blue-500 rounded-full p-1.5 mr-2 transition-colors duration-200"
                            aria-label={isChatExpanded ? "Minimize chat" : "Expand chat"}
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
                                className="text-white hover:bg-blue-500 rounded-full p-1.5 transition-colors duration-200"
                                aria-label="Toggle chat visibility"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
                
                <div className="chat-body flex-1 flex flex-col">
                    <div className={chatBodyClass}>
                        {messages.length === 0 && !isLoading ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                                <p className="text-lg font-medium mb-1">Welcome to MediAssist AI</p>
                                <p className="text-sm text-center max-w-xs">Ask any health-related questions and get helpful information</p>
                            </div>
                        ) : (
                            messages.map((message) => (
                                <div 
                                    key={message.id} 
                                    className={`mb-4 ${message.isBot ? 'text-left' : 'text-right'}`}
                                >
                                    {message.isBot && (
                                        <div className="flex items-center mb-1.5 text-sm text-gray-500 dark:text-gray-400">
                                            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-1 mr-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <span className="font-medium">MediAssist AI</span>
                                        </div>
                                    )}
                                    <div 
                                        className={`inline-block p-4 rounded-lg max-w-[90%] shadow-sm ${
                                            message.isBot 
                                                ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none' 
                                                : 'bg-blue-600 text-white rounded-tr-none'
                                        }`}
                                    >
                                        {message.text}
                                    </div>
                                    {!message.isBot && (
                                        <div className="flex justify-end items-center mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                                            <span className="font-medium">You</span>
                                            <div className="bg-gray-200 dark:bg-gray-700 rounded-full p-1 ml-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                        {isLoading && (
                            <div className="text-left mb-4">
                                <div className="flex items-center mb-1.5 text-sm text-gray-500 dark:text-gray-400">
                                    <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-1 mr-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <span className="font-medium">MediAssist AI</span>
                                </div>
                                <div className="inline-block p-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm rounded-tl-none">
                                    <div className="flex space-x-2">
                                        <div className="animate-bounce h-2.5 w-2.5 bg-blue-500 rounded-full"></div>
                                        <div className="animate-bounce h-2.5 w-2.5 bg-blue-500 rounded-full animation-delay-200" style={{animationDelay: '0.2s'}}></div>
                                        <div className="animate-bounce h-2.5 w-2.5 bg-blue-500 rounded-full animation-delay-400" style={{animationDelay: '0.4s'}}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    
                    <form onSubmit={handleSubmit} className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 shadow-inner">
                        <div className="flex items-center">
                            <input
                                type="text"
                                value={inputText}
                                onChange={handleInputChange}
                                placeholder="Type your health question..."
                                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-l-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !inputText.trim()}
                                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 rounded-r-xl hover:from-blue-600 hover:to-purple-700 disabled:from-blue-400 disabled:to-purple-500 disabled:opacity-70 transition-all duration-200 shadow-sm"
                                aria-label="Send message"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
                            MediAssist AI provides general information, not medical advice. Consult healthcare professionals for personal medical guidance.
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default HealthchatAI;