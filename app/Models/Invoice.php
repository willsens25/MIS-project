<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'no_invoice',
        'buku_id',
        'nama_agen',
        'jumlah',
        'harga_satuan',
        'total_tagihan',
        'status',
        'status_pengiriman',
        'tercatat_finance',
        // 'ongkir', // 💡 Tambahkan di fillable jika nanti ada field ongkir tersendiri
    ];

    public function book()
    {
        return $this->belongsTo(Book::class, 'buku_id');
    }

    public function penyaluran()
    {
        return $this->hasMany(Penyaluran::class, 'no_invoice', 'no_invoice');
    }
}
