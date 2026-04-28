<?php

namespace App\Policies;

use App\Models\Review;
use App\Models\User;

class ReviewPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->currentAccessToken()->can('reviews:moderate');
    }

    public function view(User $user): bool
    {
        return $user->currentAccessToken()->can('reviews:moderate');
    }

    public function create(User $user): bool
    {
        return $user->currentAccessToken()->can('reviews:moderate');
    }

    public function update(User $user): bool
    {
        return $user->currentAccessToken()->can('reviews:moderate');
    }

    public function delete(User $user): bool
    {
        return $user->currentAccessToken()->can('reviews:moderate');
    }

    public function approve(User $user): bool
    {
        return $user->currentAccessToken()->can('reviews:moderate');
    }

    public function reject(User $user): bool
    {
        return $user->currentAccessToken()->can('reviews:moderate');
    }
}
