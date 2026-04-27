<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ProductCacheInvalidationTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private string $token;

    private Category $category;

    protected function setUp(): void
    {
        parent::setUp();

        $this->category = Category::factory()->create(['name' => 'Test Category']);

        $this->admin = User::factory()->create([
            'password' => bcrypt('password'),
        ]);
        $this->token = $this->admin->createToken('test', [
            'products:write',
        ])->plainTextToken;

        Http::preventStrayRequests();
        Http::fake([
            '*/api/revalidate' => Http::response(['revalidated' => true], 200),
        ]);
    }

    public function test_list_returns_fresh_data_after_create(): void
    {
        Product::factory()->create([
            'category_id' => $this->category->id,
            'name' => 'Alpha',
            'is_published' => true,
        ]);

        $before = $this->getJson('/api/v1/products');
        $before->assertOk();
        $this->assertCount(1, $before->json('data'));

        $this->postJson('/api/v1/products', [
            'category_id' => $this->category->id,
            'name' => 'Beta',
            'price' => 2999,
            'stock_qty' => 10,
            'is_published' => true,
        ], $this->authHeader())->assertCreated();

        $after = $this->getJson('/api/v1/products');
        $after->assertOk();
        $names = collect($after->json('data'))->pluck('name');
        $this->assertCount(2, $names);
        $this->assertContains('Beta', $names);
    }

    public function test_detail_returns_fresh_data_after_update(): void
    {
        $product = Product::factory()->create([
            'category_id' => $this->category->id,
            'name' => 'Original',
            'is_published' => true,
        ]);

        $this->getJson("/api/v1/products/{$product->slug}")
            ->assertOk()
            ->assertJsonPath('data.name', 'Original');

        $response = $this->patchJson("/api/v1/products/{$product->slug}", [
            'name' => 'Updated',
        ], $this->authHeader());
        $newSlug = $response->json('data.slug');

        $this->getJson("/api/v1/products/{$newSlug}")
            ->assertOk()
            ->assertJsonPath('data.name', 'Updated');
    }

    public function test_detail_returns_404_after_delete(): void
    {
        $product = Product::factory()->create([
            'category_id' => $this->category->id,
            'name' => 'ToDelete',
            'is_published' => true,
        ]);

        $this->getJson("/api/v1/products/{$product->slug}")->assertOk();

        $this->deleteJson(
            "/api/v1/products/{$product->slug}",
            [],
            $this->authHeader(),
        )->assertNoContent();

        $this->getJson("/api/v1/products/{$product->slug}")->assertNotFound();
    }

    public function test_name_change_regenerates_slug(): void
    {
        $product = Product::factory()->create([
            'category_id' => $this->category->id,
            'name' => 'Old Name',
            'is_published' => true,
        ]);

        $this->getJson("/api/v1/products/{$product->slug}")->assertOk();

        $response = $this->patchJson("/api/v1/products/{$product->slug}", [
            'name' => 'New Name',
        ], $this->authHeader());
        $newSlug = $response->json('data.slug');

        $this->getJson("/api/v1/products/{$product->slug}")->assertNotFound();

        $this->getJson("/api/v1/products/{$newSlug}")
            ->assertOk()
            ->assertJsonPath('data.name', 'New Name');
    }

    public function test_revalidation_webhook_fired_on_mutation(): void
    {
        $this->postJson('/api/v1/products', [
            'category_id' => $this->category->id,
            'name' => 'New Product',
            'price' => 1999,
            'stock_qty' => 5,
            'is_published' => true,
        ], $this->authHeader())->assertCreated();

        Http::assertSent(function ($request) {
            return str_ends_with($request->url(), '/api/revalidate')
                && $request->hasHeader('X-Revalidation-Signature')
                && in_array('products', $request->data());
        });
    }

    public function test_public_reads_do_not_fire_webhook(): void
    {
        $product = Product::factory()->create([
            'category_id' => $this->category->id,
            'name' => 'Public',
            'is_published' => true,
        ]);

        $this->getJson('/api/v1/products')->assertOk();
        $this->getJson("/api/v1/products/{$product->slug}")->assertOk();

        Http::assertNothingSent();
    }

    /**
     * @return array<string, string>
     */
    private function authHeader(): array
    {
        return ['Authorization' => "Bearer {$this->token}"];
    }
}
