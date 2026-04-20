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
        Schema::create('logistic_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('buku_id')->constrained('bukus');
            $table->integer('qty_keluar');
            $table->string('tujuan');
            $table->string('penerima')->nullable();
            $table->timestamp('tanggal_keluar');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('logistic_logs');
    }
};
