<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateNotificationsTable extends Migration
{
    public function up()
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary(); // Using UUID for notifications is common, but int is fine too. Let's stick to auto-increment for simplicity unless Laravel defaults use UUIDs for database notifications.
            // Actually, Laravel's default 'notifications' table uses UUIDs. Let's use a custom simple one for now or standard Laravel format?
            // User requested "a notification feature", better to stick to a simple custom table for maximum control given the custom requirements.
            // Let's use auto-increment ID to match other tables.
            // $table->id(); 
            // Wait, standard Laravel notifications use UUID. Let's use UUID to be compatible if we switch to Laravel's native system later.
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('type'); // 'group_invite', 'new_message', 'book_activity'
            $table->json('data'); // Stores details like group_name, message_preview, etc.
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('notifications');
    }
}
