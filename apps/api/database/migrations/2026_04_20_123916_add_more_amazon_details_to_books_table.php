<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('books', function (Blueprint $table) {
            $table->string('file_size')->nullable();
            $table->string('screen_reader')->nullable();
            $table->string('enhanced_typesetting')->nullable();
            $table->string('x_ray')->nullable();
            $table->string('word_wise')->nullable();
            $table->string('page_flip')->nullable();
            $table->string('accessibility_conformance')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('books', function (Blueprint $table) {
            $table->dropColumn([
                'file_size', 'screen_reader', 'enhanced_typesetting', 
                'x_ray', 'word_wise', 'page_flip', 'accessibility_conformance'
            ]);
        });
    }
};
