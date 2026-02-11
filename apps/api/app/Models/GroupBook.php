<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GroupBook extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'group_id',
        'book_id',
        'added_by_user_id',
        'added_at'
    ];

    protected $casts = [
        'added_at' => 'datetime'
    ];

    public function book()
    {
        return $this->belongsTo(Book::class);
    }

    public function addedBy()
    {
        return $this->belongsTo(User::class, 'added_by_user_id');
    }
}
