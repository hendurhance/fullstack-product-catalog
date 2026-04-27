<?php

declare(strict_types=1);

namespace App\Support\Money;

use NumberFormatter;

final readonly class Money
{
    public function __construct(
        public int $cents,
    ) {}

    public static function fromCents(int $cents): self
    {
        return new self($cents);
    }

    public static function fromDollars(float $dollars): self
    {
        return new self((int) round($dollars * 100));
    }

    public function toDollars(): float
    {
        return $this->cents / 100;
    }

    public function format(string $currency = 'USD', string $locale = 'en_US'): string
    {
        $formatter = new NumberFormatter($locale, NumberFormatter::CURRENCY);

        return $formatter->formatCurrency($this->toDollars(), $currency);
    }

    public function isNegative(): bool
    {
        return $this->cents < 0;
    }

    public function isZero(): bool
    {
        return $this->cents === 0;
    }
}
