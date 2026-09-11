import { formatINR } from "@/lib/catalogue/format";
import type { DetailVariant } from "@/lib/db/product-detail";

const MIN_POINTS_FOR_STATS = 2;

export function PriceHistorySection({ variant }: { variant?: DetailVariant }) {
  const history = variant?.priceHistory ?? [];

  return (
    <div>
      <h2 className="mb-3 text-h3">Price History</h2>
      {history.length < MIN_POINTS_FOR_STATS ? (
        <p className="text-small text-muted-foreground">
          Price history will appear as more verified price data is collected.
        </p>
      ) : (
        <PriceHistoryChart history={history} />
      )}
    </div>
  );
}

function PriceHistoryChart({ history }: { history: { price: number; recorded_at: string }[] }) {
  const prices = history.map((h) => h.price);
  const lowest = Math.min(...prices);
  const highest = Math.max(...prices);
  const current = history[history.length - 1].price;
  const range = highest - lowest || 1;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-6 text-small">
        <div><span className="text-caption text-muted-foreground">Current</span><p className="font-semibold">{formatINR(current)}</p></div>
        <div><span className="text-caption text-muted-foreground">Lowest recorded</span><p className="font-semibold">{formatINR(lowest)}</p></div>
        <div><span className="text-caption text-muted-foreground">Highest recorded</span><p className="font-semibold">{formatINR(highest)}</p></div>
      </div>
      <div className="flex h-16 items-end gap-1" role="img" aria-label={`Price trend from ${formatINR(history[0].price)} to ${formatINR(current)}`}>
        {history.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t bg-primary/60"
            style={{ height: `${8 + ((h.price - lowest) / range) * 100}%` }}
            title={`${formatINR(h.price)} on ${new Date(h.recorded_at).toLocaleDateString("en-IN")}`}
          />
        ))}
      </div>
      <p className="text-caption text-muted-foreground">Based on {history.length} recorded price points.</p>
    </div>
  );
}
