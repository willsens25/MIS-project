<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Finance extends Model
{
    use HasFactory;

    // Tentukan nama tabelnya (pastikan sesuai dengan nama tabel di database kamu)
    protected $table = 'finances';

    // Daftar kolom yang boleh diisi
    protected $fillable = [
        'keterangan',
        'tipe',
        'nominal',
        'tanggal'
    ];
}