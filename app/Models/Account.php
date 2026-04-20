<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Account extends Model
{
    protected $fillable = ['kode_akun', 'nama_akun', 'kategori', 'saldo'];

    // Hubungan ke banyak transaksi
    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
}