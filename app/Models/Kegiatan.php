<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Kegiatan extends Model
{
    protected $fillable = [
        'identitas_id',
        'nama_kegiatan',
        'tanggal_kegiatan',
        'peran',
        'user_id',
    ];

    public function identitas(): BelongsTo
    {
        return $this->belongsTo(Identitas::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}