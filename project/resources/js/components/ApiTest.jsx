import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Set the correct base URL
axios.defaults.baseURL = 'http://localhost/react-laravel/project/public';
axios.defaults.withCredentials = true;
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

const ApiTest = () => {
    const [testResult, setTestResult] = useState(null);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        const testApi = async () => {
            try {
                // Test the API test endpoint
                console.log('Testing API at:', axios.defaults.baseURL + '/api/test');
                const response = await axios.get('/api/test');
                setTestResult(response.data);
                setError(null);
            } catch (err) {
                console.error('API Test Error:', err);
                setError({
                    message: err.message,
                    status: err.response?.status,
                    data: err.response?.data,
                    config: {
                        url: err.config?.url,
                        method: err.config?.method,
                        baseURL: err.config?.baseURL
                    }
                });
            }
        };
        
        testApi();
    }, []);
    
    return (
        <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md mt-10">
            <h2 className="text-xl font-bold mb-4">API Connection Test</h2>
            
            {testResult && (
                <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">
                    <p>API connection successful!</p>
                    <pre>{JSON.stringify(testResult, null, 2)}</pre>
                </div>
            )}
            
            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">
                    <p className="font-bold">Error connecting to API:</p>
                    <pre className="whitespace-pre-wrap">{JSON.stringify(error, null, 2)}</pre>
                </div>
            )}
            
            <div className="mt-4">
                <p className="text-sm text-gray-600">
                    Base URL: {axios.defaults.baseURL}
                </p>
                <p className="text-sm text-gray-600">
                    Test endpoint: {axios.defaults.baseURL}/api/test
                </p>
            </div>
        </div>
    );
};

export default ApiTest;