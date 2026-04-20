<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaksi extends Model
{
    use HasFactory;
    protected $table = 'transaksis';

    protected $fillable = [
        'identitas_id',
        'invoice_id',
        'jenis',
        'tipe',
        'nominal',
        'item',
        'jumlah_item',
        'keterangan',
        'tanggal_transaksi',
        'saldo_akhir'
    ];

    public function identitas()
    {
        return $this->belongsTo(Identitas::class);
    }

    public function account()
    {
        return $this->belongsTo(Account::class);
    }

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }
}