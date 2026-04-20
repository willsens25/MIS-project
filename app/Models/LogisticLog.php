<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LogisticLog extends Model
{
    protected $fillable = ['buku_id', 'qty_keluar', 'tujuan', 'no_invoice'];

    public function book()
    {
        return $this->belongsTo(Book::class, 'buku_id');
    }
}
