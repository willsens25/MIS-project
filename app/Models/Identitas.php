<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Identitas extends Model
{
    use SoftDeletes;

    protected $table = 'identitas';

    protected $fillable = [
    'nama_lengkap', 'panggilan', 'jenis_identitas', 'nomor_identitas',
    'jenis_kelamin', 'nomor_hp_primary', 'email', 'pekerjaan',
    'kategori_jarkom', 'alamat', 'kota', 'triyana', 'status_keamanan',
    'jenis_umat', 'bhante_lay', 'is_agen_purna', 'is_dharma_patriot',
    'divisi_id', 'created_by'
    ];

    protected $attributes = [
    'is_agen_purna' => 0,
    'is_dharma_patriot' => 0,
    ];

    protected $casts = [
    'is_agen_purna' => 'integer',
    'is_dharma_patriot' => 'integer',
    ];

    public function divisi()
    {
        return $this->belongsTo(Divisi::class, 'divisi_id');
    }

    public function transaksi()
    {
        return $this->hasMany(Transaksi::class, 'identitas_id');
    }

    public function getTotalDonasiAttribute()
    {
        return $this->transaksi()
                    ->where('jenis_transaksi', 'DONASI')
                    ->sum('nominal');
    }

    public function scopeVip($query)
    {
        return $query->where('status_keamanan', 'VIP');
    }

    protected static function booted()
    {
    static::creating(function ($model) {
        if (!$model->created_by && auth()->check()) {
            $model->created_by = auth()->id();
        }
    });
    }

    public function jobs()
    {
        return $this->hasMany(Job::class, 'identitas_id');
    }

    public function kegiatans()
    {
        return $this->hasMany(Kegiatan::class);
    }

    public function addresses()
    {
        return $this->hasMany(IdentitasAddress::class, 'identitas_id');
    }

    public function primaryAddress()
    {
        return $this->hasOne(IdentitasAddress::class, 'identitas_id')->where('is_primary', true);
    }


    public function contacts()
    {
    return $this->hasMany(IdentitasContact::class);
    }

    public function primaryPhone()
    {
    return $this->contacts()->where('type', 'hp')->where('is_primary', true)->first();
    }

    public function primaryEmail()
    {
    return $this->contacts()->where('type', 'email')->where('is_primary', true)->first();
    }
}
