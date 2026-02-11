<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Group extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'privacy',
        'owner_id'
    ];

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function members()
    {
        return $this->hasMany(GroupMember::class);
    }

    public function books()
    {
        return $this->belongsToMany(Book::class, 'group_books')
            ->withPivot('added_by_user_id', 'added_at');
    }

    public function messages()
    {
        return $this->hasMany(GroupMessage::class);
    }
}
