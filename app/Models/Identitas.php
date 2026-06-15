<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Identitas extends Model
{
    use SoftDeletes, HasFactory;

    protected $table = 'identitas';

    protected $fillable = [
        'nama_lengkap',
        'panggilan',
        'jenis_identitas',
        'nomor_identitas',
        'tempat_lahir',
        'tanggal_lahir',
        'email',
        'jenis_kelamin',
        'kewarganegaraan',
        'nomor_hp_primary',
        'email',
        'pekerjaan',
        'kategori_jarkom',
        'alamat',
        'kota',
        'kode_pos',
        'agama',
        'triyana',
        'status_keamanan',
        'jenis_umat',
        'bhante_lay',
        'is_agen_purna',
        'is_dharma_patriot',
        'divisi_id',
        'created_by'
    ];

    protected $attributes = [
        'is_agen_purna' => 0,
        'is_dharma_patriot' => 0,
        'status_keamanan' => 'Normal',
        'kewarganegaraan' => 'WNI',
    ];

    protected $casts = [
        'is_agen_purna' => 'integer',
        'is_dharma_patriot' => 'integer',
        'deleted_at' => 'datetime',
    ];

    // --- RELASI ---

    public function divisi()
    {
        return $this->belongsTo(Divisi::class, 'divisi_id');
    }

    public function transaksi()
    {
        return $this->hasMany(Transaksi::class, 'identitas_id');
    }

    public function contacts()
    {
        return $this->hasMany(IdentitasContact::class, 'identitas_id');
    }

    public function addresses()
    {
        return $this->hasMany(IdentitasAddress::class, 'identitas_id');
    }

    public function jobs()
    {
        return $this->hasMany(Job::class, 'identitas_id');
    }

    public function kegiatans()
    {
        return $this->hasMany(Kegiatan::class);
    }
}
