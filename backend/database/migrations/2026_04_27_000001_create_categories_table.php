<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('slug');
            $table->text('description')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        // Partial unique index: slug must be unique among non-deleted rows only.
        DB::statement(
            'CREATE UNIQUE INDEX categories_slug_unique_active ON categories (slug) WHERE deleted_at IS NULL'
        );
    }

    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
