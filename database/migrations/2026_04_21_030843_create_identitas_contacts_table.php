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
        Schema::create('identitas_contacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('identitas_id')->constrained('identitas')->onDelete('cascade');
            $table->enum('type', ['hp', 'email']);
            $table->string('value');
            $table->boolean('is_primary')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('identitas_contacts');
    }
};
