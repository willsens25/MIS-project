<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Mutasi extends Model
{
    use HasFactory;

    protected $table = 'mutasis';

    protected $fillable = [
    'account_id',
    'category_id',
    'user_id',
    'tipe',
    'nominal',
    'keterangan',
    'tanggal',
    'jenis'
    ];

    public function account()
    {
        return $this->belongsTo(Account::class, 'account_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

}
