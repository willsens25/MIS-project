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
        Schema::table('penyalurans', function (Blueprint $table) {
            if (!Schema::hasColumn('penyalurans', 'no_invoice')) {
            $table->string('no_invoice')->nullable()->after('id');
        }
        if (!Schema::hasColumn('penyalurans', 'book_id')) {
            $table->foreignId('book_id')->nullable()->after('no_invoice');
        }
        if (!Schema::hasColumn('penyalurans', 'jumlah')) {
            $table->integer('jumlah')->default(0)->after('book_id');
        }
        if (!Schema::hasColumn('penyalurans', 'nama_agen')) {
            $table->string('nama_agen')->nullable()->after('jumlah');
        }
        if (!Schema::hasColumn('penyalurans', 'status')) {
            $table->string('status')->default('dikirim')->after('nama_agen');
        }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('penyalurans', function (Blueprint $table) {
            //
        });
    }
};
