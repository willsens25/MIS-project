<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Divisi extends Model
{
    protected $table = 'divisi';

    protected $fillable = ['nama_divisi'];

    public function users()
    {
        return $this->hasMany(User::class, 'divisi_id');
    }
}
