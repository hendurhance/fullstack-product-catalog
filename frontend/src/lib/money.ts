const CENTS_PER_DOLLAR = 100;

export function formatPrice(cents: number, currency = "USD", locale = "en-US"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(cents / CENTS_PER_DOLLAR);
}

export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * CENTS_PER_DOLLAR);
}

export function centsToDollars(cents: number): number {
  return cents / CENTS_PER_DOLLAR;
}
