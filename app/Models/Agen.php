<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Agen extends Model
{
    use HasFactory;

    // Tambahkan baris ini untuk mengizinkan input data
    protected $fillable = [
        'nama_agen',
        'wilayah',
        'no_telp',
        'total_buku_diterima'
    ];

    /**
     * Relasi: Satu Agen bisa punya banyak Invoice
     */
    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }
}