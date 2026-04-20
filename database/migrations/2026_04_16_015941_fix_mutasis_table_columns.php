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
    Schema::table('mutasis', function (Blueprint $table) {
        if (!Schema::hasColumn('mutasis', 'category_id')) {
            $table->foreignId('category_id')->nullable()->constrained('categories')->onDelete('set null')->after('account_id');
        }
        if (!Schema::hasColumn('mutasis', 'user_id')) {
            $table->foreignId('user_id')->nullable()->constrained('users')->after('category_id');
        }
    });
}

public function down(): void
{
    Schema::table('mutasis', function (Blueprint $table) {
        $table->dropForeign(['category_id']);
        $table->dropColumn('category_id');
        $table->dropForeign(['user_id']);
        $table->dropColumn('user_id');
    });
}

};
