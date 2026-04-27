<?php

use App\Http\Controllers\Api\V1\CategoryController;
use Illuminate\Support\Facades\Route;


Route::prefix('v1')->group(function () {
    Route::get('/health', function () {
        return response()->json([
            'status' => 'ok',
            'service' => config('app.name'),
            'time' => now()->toIso8601String(),
        ]);
    });

    Route::apiResource('categories', CategoryController::class);
});
