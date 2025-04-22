<?php

namespace App\Http\Controllers;

use App\Models\ChatSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChatSessionController extends Controller
{
    public function index()
    {
        // Get current user's chat sessions or all sessions if not logged in
        $user = Auth::user();
        $sessions = $user 
            ? ChatSession::where('user_id', $user->id)->orderBy('date', 'desc')->get()
            : ChatSession::whereNull('user_id')->orderBy('date', 'desc')->get();
            
        return response()->json($sessions);
    }
    
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'messages' => 'required|array',
            'date' => 'required|date',
        ]);
        
        $user = Auth::user();
        
        // If there's an id, update the session
        if ($request->has('id') && !str_starts_with($request->id, 'session-') && !str_starts_with($request->id, 'default-')) {
            $session = ChatSession::find($request->id);
            
            if (!$session) {
                return response()->json(['message' => 'Session not found'], 404);
            }
            
            $session->update($validated);
            return response()->json($session);
        }
        
        // Otherwise create a new session
        $session = new ChatSession($validated);
        
        if ($user) {
            $session->user_id = $user->id;
        }
        
        $session->save();
        return response()->json($session);
    }
    
    public function destroy($id)
    {
        $session = ChatSession::find($id);
        
        if (!$session) {
            return response()->json(['message' => 'Session not found'], 404);
        }
        
        $session->delete();
        return response()->json(['message' => 'Session deleted']);
    }
}