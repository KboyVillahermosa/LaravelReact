<?php

namespace App\Http\Controllers;

use App\Models\ChatSession;
use App\Models\ChatMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChatController extends Controller
{
    public function getSessions()
    {
        $user = Auth::user();
        $userId = $user ? $user->id : null;
        
        // Get sessions for the user or anonymous sessions from browser storage
        $query = ChatSession::query();
        if ($userId) {
            $query->where('user_id', $userId);
        }
        
        $sessions = $query->orderBy('last_activity_at', 'desc')
            ->with(['messages' => function($query) {
                $query->orderBy('sent_at', 'asc');
            }])
            ->get()
            ->map(function($session) {
                return [
                    'id' => $session->session_id,
                    'title' => $session->title,
                    'date' => $session->last_activity_at->toISOString(),
                    'messages' => $session->messages->map(function($message) {
                        return [
                            'id' => $message->message_id,
                            'text' => $message->text,
                            'isBot' => $message->is_bot,
                            'timestamp' => $message->sent_at->toISOString()
                        ];
                    })
                ];
            });
        
        return response()->json($sessions);
    }
    
    public function createSession(Request $request)
    {
        $user = Auth::user();
        $userId = $user ? $user->id : null;
        
        $session = ChatSession::create([
            'session_id' => $request->id,
            'user_id' => $userId,
            'title' => $request->title,
            'last_activity_at' => now(),
        ]);
        
        // Create welcome message
        $welcomeMessage = ChatMessage::create([
            'message_id' => $request->welcomeMessageId,
            'chat_session_id' => $session->id,
            'text' => $request->welcomeMessage,
            'is_bot' => true,
            'sent_at' => now(),
        ]);
        
        return response()->json([
            'success' => true,
            'session' => [
                'id' => $session->session_id,
                'title' => $session->title,
                'date' => $session->last_activity_at->toISOString(),
                'messages' => [
                    [
                        'id' => $welcomeMessage->message_id,
                        'text' => $welcomeMessage->text,
                        'isBot' => $welcomeMessage->is_bot,
                        'timestamp' => $welcomeMessage->sent_at->toISOString()
                    ]
                ]
            ]
        ]);
    }
    
    public function updateSession(Request $request, $sessionId)
    {
        $session = ChatSession::where('session_id', $sessionId)->first();
        
        if (!$session) {
            return response()->json(['error' => 'Session not found'], 404);
        }
        
        if ($request->has('title')) {
            $session->title = $request->title;
        }
        
        $session->last_activity_at = now();
        $session->save();
        
        return response()->json(['success' => true]);
    }
    
    public function deleteSession($sessionId)
    {
        $session = ChatSession::where('session_id', $sessionId)->first();
        
        if (!$session) {
            return response()->json(['error' => 'Session not found'], 404);
        }
        
        $session->delete();
        
        return response()->json(['success' => true]);
    }
    
    public function addMessage(Request $request, $sessionId)
    {
        $session = ChatSession::where('session_id', $sessionId)->first();
        
        if (!$session) {
            return response()->json(['error' => 'Session not found'], 404);
        }
        
        // Add user message
        $userMessage = ChatMessage::create([
            'message_id' => $request->userMessageId,
            'chat_session_id' => $session->id,
            'text' => $request->userText,
            'is_bot' => false,
            'sent_at' => now(),
        ]);
        
        // Generate AI response (using your existing logic)
        $aiResponse = $this->generateAIResponse($request->userText);
        
        // Add AI message
        $botMessage = ChatMessage::create([
            'message_id' => $request->botMessageId,
            'chat_session_id' => $session->id,
            'text' => $aiResponse,
            'is_bot' => true,
            'sent_at' => now(),
        ]);
        
        // Update session last activity
        $session->last_activity_at = now();
        $session->save();
        
        return response()->json([
            'success' => true,
            'messages' => [
                [
                    'id' => $userMessage->message_id,
                    'text' => $userMessage->text,
                    'isBot' => $userMessage->is_bot,
                    'timestamp' => $userMessage->sent_at->toISOString()
                ],
                [
                    'id' => $botMessage->message_id,
                    'text' => $botMessage->text,
                    'isBot' => $botMessage->is_bot,
                    'timestamp' => $botMessage->sent_at->toISOString()
                ]
            ]
        ]);
    }
    
    private function generateAIResponse($userText)
    {
        // This replicates your current fallback response logic
        $userText = strtolower($userText);
        
        // Put your existing AI response generation logic here
        // For brevity, I'll include just a few examples
        if (str_contains($userText, 'hello') || str_contains($userText, 'hi') || str_contains($userText, 'hey')) {
            return "Hello! I'm your healthcare assistant. I can help with medical information, symptoms, medications, and more. What health topic can I help you with today?";
        } else if (str_contains($userText, 'covid') || str_contains($userText, 'coronavirus')) {
            return "COVID-19 is caused by the SARS-CoV-2 virus and symptoms may include fever, cough, fatigue, loss of taste or smell, and shortness of breath. If you're experiencing symptoms, please consult with a healthcare provider. Would you like information about testing, prevention, or vaccination?";
        }
        
        // Default response for unrecognized inputs
        return "Thank you for your question. Could you provide more details so I can give you more specific health information?";
    }
}