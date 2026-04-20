<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'author',
        'description',
        'isbn',
        'cover_image',
        'file_path',
        'language',
        'publisher',
        'subject_id',
        'is_premium',
        'edition',
        'format',
        'print_length',
        'publication_date',
        'accessibility',
        'price',
        'author_bio',
        'author_image',
        'author_license',
        'author_linkedin',
        'rating',
        'review_count'
    ];

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function progress()
    {
        return $this->hasMany(ReadingProgress::class);
    }
}
