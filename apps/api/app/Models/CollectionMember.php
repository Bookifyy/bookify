<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CollectionMember extends Model
{
    use HasFactory;

    protected $fillable = [
        'collection_id',
        'user_id',
        'role',
        'joined_at'
    ];

    public $timestamps = false;

    public function collection()
    {
        return $this->belongsTo(Collection::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
