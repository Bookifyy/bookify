<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('quizzes', function (Blueprint $table) {
            $table->string('attachment_path')->nullable()->after('description');
        });

        Schema::table('quiz_attempts', function (Blueprint $table) {
            $table->string('attachment_path')->nullable()->after('score');
        });
    }

    public function down()
    {
        Schema::table('quizzes', function (Blueprint $table) {
            $table->dropColumn('attachment_path');
        });

        Schema::table('quiz_attempts', function (Blueprint $table) {
            $table->dropColumn('attachment_path');
        });
    }
};
