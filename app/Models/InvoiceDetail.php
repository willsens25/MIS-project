<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InvoiceDetail extends Model
{
    protected $fillable = ['invoice_id', 'buku_id', 'qty', 'harga_satuan', 'subtotal'];

    public function buku() {
        return $this->belongsTo(\App\Models\Book::class, 'buku_id');
    }
}
