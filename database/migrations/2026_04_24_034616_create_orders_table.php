<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->date('tanggal_pesan');
            $table->string('via');
            $table->string('nama_pembeli');
            $table->string('nama_penerima');
            $table->string('alamat_penerima');
            $table->string('ekspedisi');
            $table->decimal('ongkir', 12, 2)->default(0);
            $table->decimal('nominal_donasi', 12, 2)->default(0);
            $table->text('keterangan_donasi')->nullable();
            $table->text('catatan_khusus')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
