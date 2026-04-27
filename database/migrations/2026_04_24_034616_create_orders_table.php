<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
    Schema::create('orders', function (Blueprint $table) {
        $table->id();
        $table->date('tanggal_pesan');
        $table->string('via');
        $table->string('nama_pembeli');
        $table->string('nama_penerima')->nullable();
        $table->text('alamat_penerima')->nullable();
        $table->string('ekspedisi')->nullable();
        $table->integer('ongkir')->default(0);
        $table->integer('nominal_donasi')->default(0);
        $table->string('keterangan_donasi')->nullable();
        $table->text('catatan_khusus')->nullable();
        $table->integer('total_tagihan')->default(0);
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
