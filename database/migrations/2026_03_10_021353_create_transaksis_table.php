<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transaksis', function (Blueprint $table) {
            $table->id();
            // Tetap hubungkan ke identitas (Anggota)
            $table->foreignId('identitas_id')->constrained('identitas')->onDelete('cascade');
            
            $table->enum('jenis', ['SALUR', 'DONASI']);
            $table->decimal('nominal', 15, 2)->default(0);
            $table->string('item')->nullable();
            $table->integer('jumlah_item')->default(0);
            $table->text('keterangan')->nullable();
            $table->date('tanggal_transaksi');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transaksis');
    }
};