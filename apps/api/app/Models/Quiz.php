<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Quiz extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'book_id',
        'time_limit_minutes',
        'passing_score',
        'created_by'
    ];

    public function questions()
    {
        return $this->hasMany(Question::class);
    }

    public function attempts()
    {
        return $this->hasMany(QuizAttempt::class);
    }

    public function book()
    {
        return $this->belongsTo(Book::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
