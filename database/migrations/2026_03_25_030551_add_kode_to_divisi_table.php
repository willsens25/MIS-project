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
        Schema::table('divisi', function (Blueprint $table) {
            $table->string('kode', 10)->nullable()->after('nama_divisi');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('divisi', function (Blueprint $table) {
            $table->dropColumn('kode');
        });
    }
};
