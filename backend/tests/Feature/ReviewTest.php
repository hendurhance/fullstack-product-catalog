<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ReviewTest extends TestCase
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

    public function test_public_user_can_submit_review(): void
    {
        $this->postJson('/api/v1/reviews', [
            'product_id' => $this->product->id,
            'reviewer_name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'rating' => 4,
            'body' => 'Great product, highly recommend it to everyone.',
        ])->assertCreated()
            ->assertJsonPath('data.reviewer_name', 'Jane Doe')
            ->assertJsonPath('data.rating', 4)
            ->assertJsonPath('data.is_approved', false);
    }

    public function test_review_validation_rejects_invalid_rating(): void
    {
        $this->postJson('/api/v1/reviews', [
            'product_id' => $this->product->id,
            'reviewer_name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'rating' => 6,
            'body' => 'Short',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['rating', 'body']);
    }

    public function test_admin_can_approve_review(): void
    {
        $review = Review::factory()->create([
            'product_id' => $this->product->id,
            'is_approved' => false,
        ]);

        $this->postJson(
            "/api/v1/reviews/{$review->id}/approve",
            [],
            $this->authHeader(),
        )->assertOk()
            ->assertJsonPath('data.is_approved', true);
    }

    public function test_admin_can_reject_review(): void
    {
        $review = Review::factory()->create([
            'product_id' => $this->product->id,
            'is_approved' => true,
        ]);

        $this->postJson(
            "/api/v1/reviews/{$review->id}/reject",
            [],
            $this->authHeader(),
        )->assertOk()
            ->assertJsonPath('data.is_approved', false);
    }

    public function test_admin_can_delete_review(): void
    {
        $review = Review::factory()->create([
            'product_id' => $this->product->id,
        ]);

        $this->deleteJson(
            "/api/v1/reviews/{$review->id}",
            [],
            $this->authHeader(),
        )->assertNoContent();

        $this->assertDatabaseMissing('reviews', ['id' => $review->id]);
    }

    public function test_approve_requires_auth(): void
    {
        $review = Review::factory()->create([
            'product_id' => $this->product->id,
        ]);

        $this->postJson("/api/v1/reviews/{$review->id}/approve")
            ->assertUnauthorized();
    }

    public function test_revalidation_webhook_fired_on_review_create(): void
    {
        $this->postJson('/api/v1/reviews', [
            'product_id' => $this->product->id,
            'reviewer_name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'rating' => 5,
            'body' => 'Amazing product, exceeded all my expectations.',
        ])->assertCreated();

        Http::assertSent(function ($request) {
            return str_ends_with($request->url(), '/api/revalidate')
                && $request->hasHeader('X-Revalidation-Signature');
        });
    }

    /**
     * @return array<string, string>
     */
    private function authHeader(): array
    {
        return ['Authorization' => "Bearer {$this->token}"];
    }
}
