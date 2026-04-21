<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IdentitasContact extends Model
{
    protected $fillable = [
        'identitas_id',
        'type',
        'value',
        'is_primary'
    ];

    public function identitas()
    {
        return $this->belongsTo(Identitas::class);
    }
}
