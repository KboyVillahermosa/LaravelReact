<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChatSession extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'messages', 'date', 'user_id'];
    
    protected $casts = [
        'messages' => 'array',
        'date' => 'datetime',
    ];
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}