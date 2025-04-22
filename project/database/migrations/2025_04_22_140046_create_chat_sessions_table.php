<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('chat_messages', function (Blueprint $table) {
            $table->id();
            $table->string('message_id')->unique(); // Frontend-generated ID
            $table->foreignId('chat_session_id')->constrained('chat_sessions')->onDelete('cascade');
            $table->text('text');
            $table->boolean('is_bot')->default(false);
            $table->timestamp('sent_at');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('chat_messages');
    }
};