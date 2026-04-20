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
    Schema::create('penugasans', function (Blueprint $table) {
        $table->id();
        $table->foreignId('identitas_id')->constrained('identitas')->onDelete('cascade');
        $table->string('nama_job');
        $table->string('job_advance')->default('Job 1');
        $table->enum('status_job', ['Progres', 'Selesai', 'Pending', 'Batal'])->default('Progres');
        $table->date('tanggal_mulai')->nullable();
        $table->date('tanggal_deadline')->nullable();
        $table->text('keterangan')->nullable();
        $table->timestamps();
    });
}

public function down(): void
{
    Schema::dropIfExists('penugasans');
}

};