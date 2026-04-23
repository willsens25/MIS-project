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
    'nomor_identitas', 'no_ktp', 'nama_ktp', 'nama_lengkap', 'panggilan',
    'nama_panggilan', 'jenis_identitas', 'jenis_kelamin', 'nomor_hp_primary',
    'email', 'alamat', 'kota', 'triyana', 'jenis_umat', 'is_agen_purna',
    'is_dharma_patriot', 'divisi_id', 'tempat_lahir', 'tanggal_lahir', 'agama',
    'status_keamanan', 'kewarganegaraan', 'pekerjaan'
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
        'tanggal_lahir' => 'date',
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

    // --- SCOPES & ACCESSORS ---

    public function getTotalDonasiAttribute()
    {
        return $this->transaksi()
                    ->where('jenis', 'DONASI')
                    ->sum('nominal');
    }

    public function scopeVip($query)
    {
        return $query->where('status_keamanan', 'VIP');
    }

    public function primaryAddress()
    {
        return $this->hasOne(IdentitasAddress::class, 'identitas_id')->where('is_primary', true);
    }

    public function primaryPhone()
    {
        return $this->contacts()->where('type', 'hp')->where('is_primary', true);
    }


    // protected static function booted()
    // {
    //     static::creating(function ($model) {
    //         if (!$model->created_by && auth()->check()) {
    //             $model->created_by = auth()->id();
    //         }
    //     });
    // }
}
