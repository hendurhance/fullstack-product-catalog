<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $isPgsql = DB::getDriverName() === 'pgsql';

        Schema::create('products', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('category_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('slug');
            $table->text('description')->nullable();
            $table->unsignedBigInteger('price');
            $table->unsignedInteger('stock_qty')->default(0);
            $table->boolean('is_published')->default(false);
            $table->timestamps();
            $table->softDeletes();

            $table->index(
                ['category_id', 'is_published', 'created_at'],
                'products_category_published_created_idx',
            );
        });

        if ($isPgsql) {
            DB::statement(
                'CREATE UNIQUE INDEX products_slug_unique_active ON products (slug) WHERE deleted_at IS NULL',
            );

            DB::statement(
                'ALTER TABLE products ADD CONSTRAINT products_price_non_negative CHECK (price >= 0)',
            );

            DB::statement(
                'ALTER TABLE products ADD CONSTRAINT products_stock_qty_non_negative CHECK (stock_qty >= 0)',
            );
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
