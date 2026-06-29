<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Promo extends Model
{
    protected $fillable = [
        'code',
        'type',
        'reward_value',
        'max_uses',
        'used_count',
        'expiry_date',
    ];
}
