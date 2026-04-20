<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('identitas', function (Blueprint $table) {
            $table->id();
            $table->string('nama_lengkap');
            $table->string('panggilan')->nullable();
            $table->enum('jenis_identitas', ['KTP', 'Passport', 'Lainnya']);
            $table->string('nomor_identitas')->unique();
            $table->string('nomor_hp_primary');
            $table->string('email')->unique()->nullable();
            $table->string('pekerjaan')->nullable();
            
            $table->string('kategori_jarkom')->nullable();
            $table->string('alamat')->nullable();
            $table->string('kota')->nullable();

            $table->string('triyana')->nullable();
            $table->string('status_keamanan')->default('Normal');
            $table->enum('jenis_umat', ['Umat', 'Sangha']);
            $table->enum('bhante_lay', ['Bhante', 'Lay']);

            $table->boolean('is_agen_purna')->default(false);
            $table->boolean('is_dharma_patriot')->default(false);

            $table->foreignId('divisi_id')->constrained('divisi');
            $table->foreignId('created_by')->nullable()->constrained('users');
            
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('identitas');
    }
};