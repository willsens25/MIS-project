<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Job extends Model
{
    protected $table = 'penugasans';

    protected $fillable = [
    'identitas_id',
    'nama_job',
    'job_advance',
    'status_job',
    'tanggal_mulai',
    'tanggal_deadline',
    'keterangan'
    ];

    public function identitas()
    {
        return $this->belongsTo(Identitas::class);
    }
}