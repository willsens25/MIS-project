<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PengajuanCetak extends Model
{
    protected $fillable = ['buku_id', 'jumlah_pengajuan', 'status', 'catatan_bendahara'];

    public function buku()
    {
        return $this->belongsTo(Book::class, 'buku_id');
    }
}
