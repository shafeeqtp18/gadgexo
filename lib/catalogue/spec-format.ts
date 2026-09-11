/** Formats a spec's raw stored value + unit into display text. Never invents a unit that isn't in the database. */
export function formatSpecValue(value: string, unit: string | null): string {
  if (value === "true") return "Yes";
  if (value === "false") return "No";
  if (!unit) return value;
  return `${value} ${unit}`;
}

export function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
}
