<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::table('users', function (Blueprint $table) {
        // Kita tambahkan kolom divisi_id setelah kolom email
        $table->foreignId('divisi_id')->nullable()->after('email')->constrained('divisi');
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['divisi_id']);
            $table->dropColumn('divisi_id');
        });
    }
};
