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
        'is_premium'
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
