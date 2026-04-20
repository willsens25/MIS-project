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
    if (!Schema::hasColumn('notifications', 'departemen')) {
        Schema::table('notifications', function (Blueprint $table) {
            $table->string('departemen')->nullable()->after('is_read');
        });
    }
}

public function down()
{
    Schema::table('notifications', function (Blueprint $table) {
        $table->dropColumn('departemen');
    });
}
};
