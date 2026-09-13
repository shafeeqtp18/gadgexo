/**
 * Normalizes common unit-representation variants to a single canonical
 * form. Deterministic and reversible-in-spirit — this never changes
 * what the value factually says, only how it's written.
 */
export function normalizeSpecValue(rawValue: string, specSlug: string): string {
  let value = rawValue.trim();

  // "6.7 inch" / "6.7-inch" / "6.7 inches" / "6.7in" -> "6.7"
  if (specSlug === "display-size") {
    value = value.replace(/(-|\s)?inch(es)?|in\b/gi, "").trim();
  }

  // "5,000 mAh" / "5000mAh" -> "5000"
  if (specSlug === "battery-capacity") {
    value = value.replace(/,/g, "").replace(/mah/gi, "").trim();
  }

  // "12 GB" / "12GB" -> "12"
  if (specSlug === "ram" || specSlug === "storage") {
    value = value.replace(/\s?gb/gi, "").trim();
  }

  return value;
}

export function normalizeBrandName(rawName: string): string {
  return rawName.trim().replace(/\s+/g, " ");
}

/** Deterministic slug generation — same rule the DB's slug_format check constraints expect. */
export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
