<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
{
    // 1. Tambah kolom di tabel identitas
    Schema::table('identitas', function (Blueprint $table) {
        $table->string('nama_ktp')->after('nomor_identitas')->nullable();
        $table->string('sapaan')->after('panggilan')->nullable(); // Misal: Ci, Ko
        $table->enum('kewarganegaraan', ['WNI', 'WNA'])->default('WNI')->after('jenis_kelamin');
    });

    // 2. Tabel Master Pekerjaan (Biar bisa nambah sendiri)
    Schema::create('m_pekerjaan', function (Blueprint $table) {
        $table->id();
        $table->string('nama_pekerjaan');
        $table->timestamps();
    });

    // 3. Tabel Kontak (Multi HP & Email)
    Schema::create('identitas_contacts', function (Blueprint $table) {
        $table->id();
        $table->foreignId('identitas_id')->constrained('identitas')->onDelete('cascade');
        $table->enum('type', ['hp', 'email']);
        $table->string('value');
        $table->boolean('is_primary')->default(false);
        $table->timestamps();
    });
}

};
