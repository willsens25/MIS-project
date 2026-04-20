<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductionLog extends Model
{
    protected $fillable = ['buku_id', 'qty_produksi', 'tanggal_produksi', 'keterangan'];

    public function book()
    {
        return $this->belongsTo(Book::class, 'buku_id');
    }
}
