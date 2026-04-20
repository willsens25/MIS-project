<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('divisi', function (Blueprint $table) {
        $table->id();
        $table->string('nama_divisi');
        $table->timestamps();
    });
    DB::table('divisi')->insert([
        ['id' => 1, 'nama_divisi' => 'Direktorat', 'created_at' => now(), 'updated_at' => now()],
        ['id' => 2, 'nama_divisi' => 'Bendahara', 'created_at' => now(), 'updated_at' => now()],
        ['id' => 3, 'nama_divisi' => 'Penerbitan', 'created_at' => now(), 'updated_at' => now()],
        ['id' => 4, 'nama_divisi' => 'Marketing', 'created_at' => now(), 'updated_at' => now()],
        ['id' => 5, 'nama_divisi' => 'Produksi', 'created_at' => now(), 'updated_at' => now()],
        ['id' => 6, 'nama_divisi' => 'Logistik', 'created_at' => now(), 'updated_at' => now()],
    ]);
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('divisi');
    }
};
