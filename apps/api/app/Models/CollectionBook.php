<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CollectionBook extends Model
{
    use HasFactory;

    protected $fillable = [
        'collection_id',
        'book_id',
        'added_by_user_id',
        'added_at'
    ];

    public $timestamps = false;

    public function collection()
    {
        return $this->belongsTo(Collection::class);
    }

    public function book()
    {
        return $this->belongsTo(Book::class);
    }

    public function addedBy()
    {
        return $this->belongsTo(User::class, 'added_by_user_id');
    }
}
