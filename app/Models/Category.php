<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    public function mutasis()
    {
        return $this->hasMany(Mutasi::class);
    }
}
