<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderDetail extends Model
{
    protected $fillable = [
        'order_id',
        'buku_id',
        'jumlah',
        'harga_satuan',
        'subtotal'
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function buku()
    {
        return $this->belongsTo(Buku::class);
    }
}
