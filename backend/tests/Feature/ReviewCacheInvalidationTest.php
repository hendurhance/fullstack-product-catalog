<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ReviewCacheInvalidationTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private string $token;

    private Product $product;

    protected function setUp(): void
    {
        parent::setUp();

        $category = Category::factory()->create(['name' => 'Test Category']);
        $this->product = Product::factory()->create([
            'category_id' => $category->id,
            'name' => 'Test Product',
            'is_published' => true,
        ]);

        $this->admin = User::factory()->create([
            'password' => bcrypt('password'),
        ]);
        $this->token = $this->admin->createToken('test', [
            'reviews:moderate',
        ])->plainTextToken;

        Http::preventStrayRequests();
        Http::fake([
            '*/api/revalidate' => Http::response(['revalidated' => true], 200),
        ]);
    }

    public function test_list_returns_fresh_data_after_create(): void
    {
        $before = $this->getJson('/api/v1/reviews');
        $before->assertOk();
        $countBefore = count($before->json('data'));

        $this->postJson('/api/v1/reviews', [
            'product_id' => $this->product->id,
            'reviewer_name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'rating' => 4,
            'body' => 'Great product, highly recommend it to everyone.',
        ])->assertCreated();

        $after = $this->getJson('/api/v1/reviews');
        $after->assertOk();
        $this->assertCount($countBefore + 1, $after->json('data'));
    }

    public function test_list_shows_approved_state_after_approve(): void
    {
        $review = Review::factory()->create([
            'product_id' => $this->product->id,
            'is_approved' => false,
        ]);

        $before = $this->getJson('/api/v1/reviews');
        $before->assertOk();
        $this->assertFalse($before->json('data.0.is_approved'));

        $this->postJson(
            "/api/v1/reviews/{$review->id}/approve",
            [],
            $this->authHeader(),
        )->assertOk();

        $after = $this->getJson('/api/v1/reviews');
        $after->assertOk();
        $this->assertTrue($after->json('data.0.is_approved'));
    }

    public function test_list_shows_rejected_state_after_reject(): void
    {
        $review = Review::factory()->create([
            'product_id' => $this->product->id,
            'is_approved' => true,
        ]);

        $this->postJson(
            "/api/v1/reviews/{$review->id}/reject",
            [],
            $this->authHeader(),
        )->assertOk();

        $after = $this->getJson('/api/v1/reviews');
        $after->assertOk();
        $this->assertFalse($after->json('data.0.is_approved'));
    }

    public function test_list_returns_fresh_data_after_delete(): void
    {
        Review::factory()->create([
            'product_id' => $this->product->id,
        ]);

        $before = $this->getJson('/api/v1/reviews');
        $before->assertOk();
        $countBefore = count($before->json('data'));

        $review = Review::firstOrFail();

        $this->deleteJson(
            "/api/v1/reviews/{$review->id}",
            [],
            $this->authHeader(),
        )->assertNoContent();

        $after = $this->getJson('/api/v1/reviews');
        $after->assertOk();
        $this->assertCount($countBefore - 1, $after->json('data'));
    }

    public function test_detail_returns_404_after_delete(): void
    {
        $review = Review::factory()->create([
            'product_id' => $this->product->id,
        ]);

        $this->getJson("/api/v1/reviews/{$review->id}")->assertOk();

        $this->deleteJson(
            "/api/v1/reviews/{$review->id}",
            [],
            $this->authHeader(),
        )->assertNoContent();

        $this->getJson("/api/v1/reviews/{$review->id}")->assertNotFound();
    }

    public function test_revalidation_webhook_fired_on_approve(): void
    {
        $review = Review::factory()->create([
            'product_id' => $this->product->id,
            'is_approved' => false,
        ]);

        $this->postJson(
            "/api/v1/reviews/{$review->id}/approve",
            [],
            $this->authHeader(),
        )->assertOk();

        Http::assertSent(function ($request) {
            return str_ends_with($request->url(), '/api/revalidate')
                && $request->hasHeader('X-Revalidation-Signature');
        });
    }

    public function test_public_reads_do_not_fire_webhook(): void
    {
        Review::factory()->create([
            'product_id' => $this->product->id,
        ]);

        $this->getJson('/api/v1/reviews')->assertOk();

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
