<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
public function up() {
    Schema::create('invoices', function (Blueprint $table) {
        $table->id();
        $table->string('no_invoice')->unique();
        $table->unsignedBigInteger('buku_id');
        $table->string('nama_agen');
        $table->integer('jumlah');
        $table->decimal('harga_satuan', 15, 2);
        $table->decimal('total_tagihan', 15, 2);
        $table->enum('status', ['Pending', 'Lunas'])->default('Pending');
        $table->timestamps();

        $table->foreign('buku_id')->references('id')->on('bukus')->onDelete('cascade');
    });
}

    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};