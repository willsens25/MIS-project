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
    Schema::create('production_logs', function (Blueprint $table) {
        $table->id();
        $table->foreignId('buku_id')
            ->constrained('bukus')
            ->onDelete('cascade');
        $table->integer('qty_produksi');
        $table->date('tanggal_produksi');
        $table->string('keterangan')->nullable();
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('production_logs');
    }
};
