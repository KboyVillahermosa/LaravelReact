<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChatMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'message_id',
        'chat_session_id',
        'text',
        'is_bot',
        'sent_at',
    ];

    protected $casts = [
        'is_bot' => 'boolean',
        'sent_at' => 'datetime',
    ];

    public function chatSession()
    {
        return $this->belongsTo(ChatSession::class);
    }
}
