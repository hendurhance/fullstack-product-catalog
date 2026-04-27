<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class CategoryCacheInvalidationTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private string $token;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'password' => bcrypt('password'),
        ]);
        $this->token = $this->admin->createToken('test', [
            'categories:write',
        ])->plainTextToken;

        Http::preventStrayRequests();
        Http::fake([
            '*/api/revalidate' => Http::response(['revalidated' => true], 200),
        ]);
    }

    public function test_list_returns_fresh_data_after_create(): void
    {
        Category::factory()->create(['name' => 'Alpha', 'slug' => 'alpha']);

        $before = $this->getJson('/api/v1/categories');
        $before->assertOk();
        $this->assertCount(1, $before->json('data'));

        $this->postJson('/api/v1/categories', [
            'name' => 'Beta',
        ], $this->authHeader())->assertCreated();

        $after = $this->getJson('/api/v1/categories');
        $after->assertOk();
        $names = collect($after->json('data'))->pluck('name');
        $this->assertCount(2, $names);
        $this->assertContains('Beta', $names);
    }

    public function test_detail_returns_fresh_data_after_update(): void
    {
        $category = Category::factory()->create([
            'name' => 'Original',
            'slug' => 'original',
        ]);

        $this->getJson("/api/v1/categories/{$category->slug}")
            ->assertOk()
            ->assertJsonPath('data.name', 'Original');

        $this->patchJson("/api/v1/categories/{$category->slug}", [
            'name' => 'Updated',
        ], $this->authHeader());

        $this->getJson("/api/v1/categories/{$category->slug}")
            ->assertOk()
            ->assertJsonPath('data.name', 'Updated');
    }

    public function test_detail_returns_404_after_delete(): void
    {
        $category = Category::factory()->create([
            'name' => 'ToDelete',
            'slug' => 'to-delete',
        ]);

        $this->getJson("/api/v1/categories/{$category->slug}")->assertOk();

        $this->deleteJson(
            "/api/v1/categories/{$category->slug}",
            [],
            $this->authHeader(),
        )->assertNoContent();

        $this->getJson("/api/v1/categories/{$category->slug}")->assertNotFound();
    }

    public function test_slug_change_invalidates_old_and_new_detail(): void
    {
        Category::factory()->create([
            'name' => 'Old Name',
            'slug' => 'old-slug',
        ]);

        $this->getJson('/api/v1/categories/old-slug')->assertOk();

        $this->patchJson('/api/v1/categories/old-slug', [
            'slug' => 'new-slug',
        ], $this->authHeader());

        $this->getJson('/api/v1/categories/old-slug')->assertNotFound();

        $this->getJson('/api/v1/categories/new-slug')
            ->assertOk()
            ->assertJsonPath('data.slug', 'new-slug');
    }

    public function test_revalidation_webhook_fired_on_mutation(): void
    {
        Category::factory()->create(['name' => 'Webhook', 'slug' => 'webhook']);

        $this->postJson('/api/v1/categories', [
            'name' => 'New Cat',
        ], $this->authHeader())->assertCreated();

        Http::assertSent(function ($request) {
            return str_ends_with($request->url(), '/api/revalidate')
                && $request->hasHeader('X-Revalidation-Signature')
                && in_array('categories', $request->data());
        });
    }

    public function test_public_reads_do_not_fire_webhook(): void
    {
        Category::factory()->create(['name' => 'Public', 'slug' => 'public']);

        $this->getJson('/api/v1/categories')->assertOk();
        $this->getJson('/api/v1/categories/public')->assertOk();

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
