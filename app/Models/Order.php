<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
    'tanggal_pesan', 'via', 'nama_pembeli', 'nama_penerima',
    'alamat_penerima', 'ekspedisi', 'ongkir',
    'nominal_donasi', 'keterangan_donasi', 'catatan_khusus'
    ];

    public function details() {
        return $this->hasMany(OrderDetail::class);
    }
}
