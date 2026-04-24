<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderDetail extends Model
{
    protected $fillable = [
    'order_id', 'buku_id', 'jumlah', 'harga_satuan', 'subtotal'
    ];

    public function buku() {
        return $this->belongsTo(Buku::class);
    }
}
