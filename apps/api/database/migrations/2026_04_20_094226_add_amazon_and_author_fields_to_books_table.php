<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('books', function (Blueprint $table) {
            $table->string('edition')->nullable();
            $table->string('format')->nullable();
            $table->integer('print_length')->nullable();
            $table->date('publication_date')->nullable();
            $table->string('accessibility')->nullable();
            $table->decimal('price', 8, 2)->nullable();
            $table->text('author_bio')->nullable();
            $table->string('author_image')->nullable();
            $table->string('author_license')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('books', function (Blueprint $table) {
            $table->dropColumn([
                'edition',
                'format',
                'print_length',
                'publication_date',
                'accessibility',
                'price',
                'author_bio',
                'author_image',
                'author_license'
            ]);
        });
    }
};
