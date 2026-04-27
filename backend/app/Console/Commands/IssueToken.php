<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

final class IssueToken extends Command
{
    protected $signature = 'token:issue
        {email : Email of the user (created if missing)}
        {--name=Admin : Token label}
        {--abilities=* : Token abilities (e.g. categories:write). Defaults to all admin abilities.}
        {--password= : Password to set when creating the user (random if omitted)}';

    protected $description = 'Issue a Sanctum token with the given abilities. Creates the user if needed.';

    /*
     * Default abilities a fresh admin token gets when none are passed. Mirrors
     * the scopes the API guards on for write paths.
     */
    private const array DEFAULT_ABILITIES = [
        'categories:write',
        'products:write',
        'reviews:moderate',
    ];

    public function handle(): int
    {
        $email = (string) $this->argument('email');
        $abilities = $this->option('abilities') ?: self::DEFAULT_ABILITIES;

        $user = User::firstOrNew(['email' => $email]);
        if (! $user->exists) {
            $password = (string) ($this->option('password') ?: bin2hex(random_bytes(8)));
            $user->name = $email;
            $user->password = Hash::make($password);
            $user->save();
            $this->info("Created user {$email} with password: {$password}");
        }

        $token = $user->createToken((string) $this->option('name'), $abilities);

        $this->newLine();
        $this->line('Token issued. Use it as: Authorization: Bearer <token>');
        $this->line('Abilities: '.implode(', ', $abilities));
        $this->newLine();
        $this->line($token->plainTextToken);

        return self::SUCCESS;
    }
}
