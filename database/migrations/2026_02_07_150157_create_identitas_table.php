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
            // Informasi Profil Utama
            $table->string('nama_lengkap');
            $table->string('panggilan')->nullable();
            $table->enum('jenis_identitas', ['KTP', 'Passport', 'Lainnya'])->default('KTP');
            $table->string('nomor_identitas')->unique();
            $table->enum('jenis_kelamin', ['pria', 'wanita'])->nullable();

            // Kontak & Pekerjaan
            $table->string('nomor_hp_primary');
            $table->string('email')->nullable(); // Dibuat nullable agar tidak bentrok jika email kosong
            $table->string('pekerjaan')->nullable();

            // Lokasi & Jarkom
            $table->string('kategori_jarkom')->nullable();
            $table->text('alamat')->nullable(); // Pakai text agar bisa muat alamat panjang
            $table->string('kota')->nullable();
            $table->string('kode_pos', 10)->nullable();

            // Klasifikasi Spiritual & Keamanan
            $table->string('triyana')->nullable();
            $table->string('status_keamanan')->default('Normal'); // Normal, VIP, Pengawasan, Blacklist
            $table->enum('jenis_umat', ['Umat', 'Sangha'])->default('Umat');
            $table->enum('bhante_lay', ['Bhante', 'Lay'])->default('Lay');

            // Atribut Khusus (Checkbox)
            $table->boolean('is_agen_purna')->default(false);
            $table->boolean('is_dharma_patriot')->default(false);

            // Relasi
            $table->foreignId('divisi_id')->constrained('divisi')->onDelete('cascade');
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');

            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('identitas');
    }
};
