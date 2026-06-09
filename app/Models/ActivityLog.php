<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class ActivityLog extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'aksi', 'model', 'keterangan', 'ip_address'];

    // Relasi ke User
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public static function record($aksi, $model, $keterangan)
    {
        self::create([
            'user_id'    => Auth::id(),
            'aksi'       => $aksi,
            'model'      => $model,
            'keterangan' => $keterangan,
            'ip_address' => request()->ip()
        ]);
    }
}
