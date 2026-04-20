<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Book extends Model
{

    use HasFactory;
    protected $table = 'bukus';

    protected $fillable = ['judul', 'penulis', 'harga_jual', 'stok_gudang'];
}