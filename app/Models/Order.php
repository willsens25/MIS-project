<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $table = 'orders';

    protected $fillable = [
    'tanggal_pesan', 'via', 'nama_pembeli', 'nama_penerima',
    'alamat_penerima', 'ekspedisi', 'ongkir', 'total_tagihan','status','tercatat_finance'
    ];

    public function details()
    {
        return $this->hasMany(OrderDetail::class);
    }
}
