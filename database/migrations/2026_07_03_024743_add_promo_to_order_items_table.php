<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_details', function (Blueprint $table) {
            // Kita hapus ->after('kuantitas') agar tidak memicu error column not found
            $table->string('kode_promo_terpakai')->nullable();
            $table->decimal('potongan_diskon', 12, 2)->default(0);
        });
    }

    public function down(): void
    {
        Schema::table('order_details', function (Blueprint $table) {
            $table->dropColumn(['kode_promo_terpakai', 'potongan_diskon']);
        });
    }
};
