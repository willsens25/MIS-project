<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Penjualan extends Model
{
    use HasFactory;

    protected $fillable = [
        'no_invoice',
        'nama_pelanggan',
        'total_item',
        'total_bayar',
        'tanggal_penjualan',
    ];
}
