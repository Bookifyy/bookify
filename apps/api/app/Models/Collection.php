<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Collection extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'visibility',
        'isSmart',
        'owner_id'
    ];

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function members()
    {
        return $this->hasMany(CollectionMember::class);
    }

    public function books()
    {
        return $this->hasMany(CollectionBook::class);
    }

    public function activities()
    {
        return $this->hasMany(CollectionActivity::class);
    }
}
