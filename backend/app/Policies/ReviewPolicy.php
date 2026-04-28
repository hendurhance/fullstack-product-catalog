<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Review;
use App\Models\User;

final class ReviewPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->tokenCan('reviews:moderate');
    }

    public function view(User $user, Review $review): bool
    {
        return $user->tokenCan('reviews:moderate');
    }

    public function create(User $user): bool
    {
        return $user->tokenCan('reviews:moderate');
    }

    public function update(User $user, Review $review): bool
    {
        return $user->tokenCan('reviews:moderate');
    }

    public function delete(User $user, Review $review): bool
    {
        return $user->tokenCan('reviews:moderate');
    }

    public function approve(User $user, Review $review): bool
    {
        return $user->tokenCan('reviews:moderate');
    }

    public function reject(User $user, Review $review): bool
    {
        return $user->tokenCan('reviews:moderate');
    }
}
