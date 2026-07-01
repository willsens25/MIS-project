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
        Schema::table('identitas', function (Blueprint $table) {
            // Menambahkan kolom tempat_lahir dan tanggal_lahir
            $table->string('tempat_lahir')->nullable()->after('status_keamanan');
            $table->date('tanggal_lahir')->nullable()->after('tempat_lahir');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('identitas', function (Blueprint $table) {
            // Menghapus kembali kolom jika di-rollback
            $table->dropColumn(['tempat_lahir', 'tanggal_lahir']);
        });
    }
};