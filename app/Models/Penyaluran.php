<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Penyaluran extends Model
{
    protected $fillable = [
    'no_invoice', 'buku_id', 'jumlah', 'nama_agen',
    'status', 'tujuan', 'qty', 'tanggal', 'status_job'
];

    public function book()
    {
        return $this->belongsTo(Book::class, 'buku_id');
    }
}