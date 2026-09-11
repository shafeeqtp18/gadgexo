export interface PriceDrop {
  amount: number;
  percent: number;
  previousPrice: number;
}

/**
 * Compares the current price against the most recent *distinct* prior
 * price_history observation. Returns null (no badge, no claim) unless
 * there are at least 2 real historical points and the latest-but-one
 * price is genuinely higher than the current price.
 */
export function computePriceDrop(
  currentPrice: number,
  priceHistory: { price: number; recorded_at: string }[],
): PriceDrop | null {
  if (priceHistory.length < 2) return null;

  const sorted = [...priceHistory].sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime());
  const previous = sorted[sorted.length - 2];
  if (!previous) return null;

  if (previous.price <= currentPrice) return null;

  const amount = previous.price - currentPrice;
  const percent = Math.round((amount / previous.price) * 100);
  return { amount, percent, previousPrice: previous.price };
}
