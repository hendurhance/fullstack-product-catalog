<?php

namespace App\Providers;

use Dedoc\Scramble\Scramble;
use Dedoc\Scramble\Support\Generator\OpenApi;
use Dedoc\Scramble\Support\Generator\SecurityRequirement;
use Dedoc\Scramble\Support\Generator\SecurityScheme;
use Dedoc\Scramble\Support\Generator\Operation;
use Dedoc\Scramble\Support\RouteInfo;
use App\Support\Cache\RevalidationService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(RevalidationService::class, fn ($app) => new RevalidationService(
            $app->make('config')->get('services.revalidation.secret', ''),
            $app->make('config')->get('services.revalidation.url', ''),
        ));
    }

    public function boot(): void
    {
        /*
         * Register the Sanctum bearer scheme as a *component* (not a global
         * default) and attach it only to operations whose route is gated by
         * `auth:sanctum`. Document-level security would mark public reads
         * as gated too — drift the OpenAPI doc must not have.
         */
        Scramble::configure()
            ->withDocumentTransformers(function (OpenApi $openApi): void {
                $openApi->components->addSecurityScheme(
                    'bearer',
                    SecurityScheme::http('bearer'),
                );
            })
            ->withOperationTransformers(function (Operation $operation, RouteInfo $info): void {
                $middleware = $info->route->gatherMiddleware();
                $isGated = collect($middleware)->contains(
                    fn (string $m): bool => str_starts_with($m, 'auth:sanctum'),
                );

                if ($isGated) {
                    $operation->security[] = new SecurityRequirement(['bearer' => []]);
                }
            });
    }
}
