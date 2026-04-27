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
        Category::factory()->create(['name' => 'Alpha']);

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
        $category = Category::factory()->create(['name' => 'Original']);

        $this->getJson("/api/v1/categories/{$category->slug}")
            ->assertOk()
            ->assertJsonPath('data.name', 'Original');

        $response = $this->patchJson("/api/v1/categories/{$category->slug}", [
            'name' => 'Updated',
        ], $this->authHeader());
        $newSlug = $response->json('data.slug');

        $this->getJson("/api/v1/categories/{$newSlug}")
            ->assertOk()
            ->assertJsonPath('data.name', 'Updated');
    }

    public function test_detail_returns_404_after_delete(): void
    {
        $category = Category::factory()->create(['name' => 'ToDelete']);

        $this->getJson("/api/v1/categories/{$category->slug}")->assertOk();

        $this->deleteJson(
            "/api/v1/categories/{$category->slug}",
            [],
            $this->authHeader(),
        )->assertNoContent();

        $this->getJson("/api/v1/categories/{$category->slug}")->assertNotFound();
    }

    public function test_name_change_regenerates_slug(): void
    {
        $category = Category::factory()->create(['name' => 'Old Name']);

        $this->getJson("/api/v1/categories/{$category->slug}")->assertOk();

        $response = $this->patchJson("/api/v1/categories/{$category->slug}", [
            'name' => 'New Name',
        ], $this->authHeader());
        $newSlug = $response->json('data.slug');

        $this->getJson("/api/v1/categories/{$category->slug}")->assertNotFound();

        $this->getJson("/api/v1/categories/{$newSlug}")
            ->assertOk()
            ->assertJsonPath('data.name', 'New Name');
    }

    public function test_revalidation_webhook_fired_on_mutation(): void
    {
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
        $category = Category::factory()->create(['name' => 'Public']);

        $this->getJson('/api/v1/categories')->assertOk();
        $this->getJson("/api/v1/categories/{$category->slug}")->assertOk();

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
