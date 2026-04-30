<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('product_id')->constrained()->cascadeOnDelete();
            $table->string('reviewer_name');
            $table->string('email');
            $table->unsignedTinyInteger('rating')->check('rating >= 1 AND rating <= 5');
            $table->text('body');
            $table->boolean('is_approved')->default(false);
            $table->timestamps();

            $table->index(['product_id', 'is_approved', 'created_at'], 'reviews_product_approved_created_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
