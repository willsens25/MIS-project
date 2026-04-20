<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('accounts', function (Blueprint $table) {
            $table->id();
            $table->string('kode_akun')->unique();
            $table->string('nama_akun');
            $table->enum('kategori', ['Aset', 'Pendapatan', 'Beban']);
            $table->decimal('saldo', 15, 2)->default(0);
            $table->timestamps();
        });

        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->constrained('accounts')->onDelete('cascade');
            $table->date('tanggal');
            $table->string('keterangan');
            $table->enum('tipe', ['Masuk', 'Keluar']);
            $table->decimal('nominal', 15, 2);
            $table->decimal('saldo_akhir', 15, 2);
            $table->string('referensi')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
        Schema::dropIfExists('accounts');
    }
};