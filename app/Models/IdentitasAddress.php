<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IdentitasAddress extends Model
{
    protected $table = 'identitas_addresses';

    protected $fillable = [
        'identitas_id', 'nama_penerima', 'hp_penerima',
        'alamat_lengkap', 'kelurahan', 'kecamatan',
        'kota', 'kode_pos', 'note', 'is_primary'
    ];

    public function identitas()
    {
        return $this->belongsTo(Identitas::class);
    }
}
