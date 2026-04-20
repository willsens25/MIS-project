<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('identitas', function (Blueprint $table) {
            // Kolom KTP
            if (!Schema::hasColumn('identitas', 'no_ktp')) {
                $table->string('no_ktp')->unique()->nullable()->after('id');
            }
            if (!Schema::hasColumn('identitas', 'nama_ktp')) {
                $table->string('nama_ktp')->nullable()->after('no_ktp');
            }

            // Nama & Panggilan
            if (!Schema::hasColumn('identitas', 'nama_panggilan')) {
                $table->string('nama_panggilan')->nullable();
            }
            if (!Schema::hasColumn('identitas', 'gelar_panggilan')) {
                $table->string('gelar_panggilan')->nullable();
            }

            // Biodata
            if (!Schema::hasColumn('identitas', 'jenis_kelamin')) {
                $table->enum('jenis_kelamin', ['pria', 'wanita'])->nullable();
            }
            if (!Schema::hasColumn('identitas', 'tempat_lahir')) {
                $table->string('tempat_lahir')->nullable();
            }
            if (!Schema::hasColumn('identitas', 'tanggal_lahir')) {
                $table->date('tanggal_lahir')->nullable();
            }

            // Pekerjaan & Agama (Yang tadi bikin error)
            if (!Schema::hasColumn('identitas', 'pekerjaan')) {
                $table->string('pekerjaan')->nullable();
            }
            if (!Schema::hasColumn('identitas', 'agama')) {
                $table->string('agama')->nullable();
            }
            if (!Schema::hasColumn('identitas', 'kewarganegaraan')) {
                $table->enum('kewarganegaraan', ['WNI', 'WNA'])->default('WNI');
            }
        });
    }

    public function down(): void
    {
        // Untuk rollback jika diperlukan
        Schema::table('identitas', function (Blueprint $table) {
            $table->dropColumn([
                'nama_ktp', 'nama_panggilan', 'gelar_panggilan',
                'jenis_kelamin', 'tempat_lahir', 'tanggal_lahir',
                'pekerjaan', 'agama', 'kewarganegaraan'
            ]);
        });
    }
};
