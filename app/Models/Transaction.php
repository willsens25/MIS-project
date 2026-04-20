<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $fillable = [
        'account_id', 'tanggal', 'keterangan', 'tipe', 'nominal', 'saldo_akhir'
    ];

    // Hubungan ke tabel Account
    public function account()
    {
        return $this->belongsTo(Account::class);
    }
}