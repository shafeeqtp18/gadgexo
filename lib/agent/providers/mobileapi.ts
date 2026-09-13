import "server-only";
import type { RawCandidate, SourceProvider } from "../types";

/**
 * MobileAPI.dev provider.
 *
 * STATUS AS OF IMPLEMENTATION (Sep 2026):
 *   - Auth method and the `/devices/search/` response shape were LIVE
 *     VERIFIED against the real account dashboard (query param `key=` and
 *     header `Authorization: Token <key>` both confirmed working; flat
 *     DeviceList fields — name, manufacturer_name, device_type, colors,
 *     storage, screen_resolution, weight, thickness, release_date, camera,
 *     battery_capacity, hardware, image_url, image_b64 — confirmed live).
 *   - The `/devices/by-year/` endpoint used below for category-driven
 *     discovery is NOT yet live-verified by us — only documented in a
 *     third-party OpenAPI profile of the public API surface. Response
 *     parsing below is defensive (handles either a raw array or a
 *     `{ devices: [...] }` wrapper) specifically because of this.
 *   - The `/devices/{id}/` nested full-spec endpoint (network, display,
 *     platform, memory, main_camera, battery, etc.) is used NOWHERE in
 *     this file yet. It's also only third-party-documented, not live
 *     tested, AND there's nothing confident to map its fields to until
 *     GadGexo's real `specifications.slug` values are confirmed (see
 *     SPEC_SLUG_MAP below). Wire it up as a deliberate second step once
 *     both of those are true — don't extend this file to call it on a
 *     guess.
 *
 * QUOTA: Free plan is 50 requests/month, 5/minute. This provider is
 * designed so ONE fetchCandidates() call costs AT MOST MAX_LIST_PAGES
 * credits (default 1) — see brief §9/§20 ("do NOT build a system that
 * consumes all 50 requests immediately").
 */

const API_BASE = "https://api.mobileapi.dev";

// Confirmed live: device_type is a real response field with this enum
// (phone | tablet | laptop | wearable | other). Not a guess.
const CATEGORY_SLUG_TO_DEVICE_TYPE: Record<string, string> = {
  smartphones: "phone",
};

// Safety caps — see file header. Raise deliberately, not by accident.
const MAX_CANDIDATES_PER_RUN = 2;
const MAX_LIST_PAGES = 1;
const MAX_RETRIES = 3;
const BASE_BACKOFF_MS = 1000;

// Deliberately empty. MobileAPI's raw field names do not automatically
// correspond to GadGexo's actual `specifications.slug` values (brief §13:
// "Do NOT blindly copy arbitrary provider field names... Only map fields
// when the meaning is clear... do not guess"). Populate only after
// confirming real slugs against the live `specifications` table AND a
// live-verified `/devices/{id}/` response — neither is true yet, so this
// provider currently returns specs: {} for every candidate.
const SPEC_SLUG_MAP: Record<string, string> = {};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface MobileApiAuth {
  apiKey: string;
}

function readAuth(): MobileApiAuth | null {
  const apiKey = process.env.MOBILEAPI_API_KEY;
  if (!apiKey) return null;
  return { apiKey };
}

/**
 * Discovery is intentionally not restricted to the current year. The
 * provider returns phone devices and the pipeline can later apply
 * configurable recency/business rules without producing zero candidates. `/devices/by-year/`
 * (per its third-party-documented signature) takes one 4-digit year, not
 * a range, so wider coverage means calling this provider's category
 * across multiple years over time — not something this single function
 * call does on its own.
 */
function getTargetYear(): number {
  const override = process.env.MOBILEAPI_TARGET_YEAR;
  if (override) {
    const parsed = Number(override);
    if (Number.isInteger(parsed) && parsed > 2000) return parsed;
  }
  return new Date().getFullYear();
}

async function fetchWithRetry(url: string, auth: MobileApiAuth, attempt = 1): Promise<Response> {
  const response = await fetch(url, {
    headers: {
      Authorization: `Token ${auth.apiKey}`,
      Accept: "application/json",
    },
  });

  if (response.status === 429 || response.status >= 500) {
    if (attempt >= MAX_RETRIES) {
      throw new Error(`MobileAPI: ${response.status} after ${MAX_RETRIES} attempts for ${url}`);
    }
    const retryAfterHeader = response.headers.get("Retry-After");
    const retryAfterMs = retryAfterHeader
      ? Number(retryAfterHeader) * 1000
      : BASE_BACKOFF_MS * 2 ** (attempt - 1);
    await sleep(Number.isFinite(retryAfterMs) ? retryAfterMs : BASE_BACKOFF_MS);
    return fetchWithRetry(url, auth, attempt + 1);
  }

  if (response.status === 401 || response.status === 403) {
    // Key present but rejected — a genuine failure worth surfacing (e.g.
    // revoked/regenerated key), not a silent empty result.
    throw new Error(`MobileAPI: authentication rejected (${response.status}).`);
  }

  if (!response.ok) {
    throw new Error(`MobileAPI: unexpected status ${response.status} for ${url}`);
  }

  return response;
}

async function safeJson(response: Response): Promise<unknown | null> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Extracts the device array from a by-year response, defensively, since
 * that endpoint's exact top-level shape is unverified (see file header).
 * Handles both a raw array and a `{ devices: [...] }` wrapper — the two
 * shapes actually seen across MobileAPI's documented/observed endpoints.
 */
function extractDeviceArray(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object") {
    const devices = (payload as Record<string, unknown>).devices;
    if (Array.isArray(devices)) return devices;
  }
  return [];
}

/**
 * Maps one raw device entry (confirmed live DeviceList shape) into a
 * RawCandidate. Guards every field access; returns null (skip this item)
 * rather than throwing on a malformed/unexpected entry.
 */
function mapDeviceToCandidate(raw: unknown, categorySlug: string): RawCandidate | null {
  if (!raw || typeof raw !== "object") return null;
  const d = raw as Record<string, unknown>;

  const name = typeof d.name === "string" ? d.name : undefined;
  const deviceId = typeof d.id === "number" || typeof d.id === "string" ? String(d.id) : undefined;
  if (!name || !deviceId) {
    // No confident real URL to use as sourceUrl (see file header) —
    // without it we can't honestly satisfy "sourceUrl must always be a
    // real, parseable URL", so skip rather than invent one.
    return null;
  }

  const manufacturerName =
    typeof d.manufacturer_name === "string" ? d.manufacturer_name : "Unknown";
  const modelIdentifier =
    typeof d.model_numbers === "string" && d.model_numbers.length > 0
      ? d.model_numbers
      : undefined;

  // specs intentionally empty — see SPEC_SLUG_MAP comment above. Left as
  // a loop over the map (currently empty, so this never runs) rather than
  // a hardcoded {} so populating SPEC_SLUG_MAP later is a one-line config
  // change, not a rewrite of this function.
  const specs: Record<string, string> = {};
  for (const [rawField, slug] of Object.entries(SPEC_SLUG_MAP)) {
    const value = d[rawField];
    if (typeof value === "string" && value.length > 0) specs[slug] = value;
  }

  return {
    brandName: manufacturerName,
    productName: name,
    modelIdentifier,
    categorySlug,
    specs,
    // Left empty deliberately: MobileAPI's `storage` and `colors` fields
    // are combined strings (e.g. "256GB, 512GB, 1TB") with no indication
    // of which storage option pairs with which color — splitting them
    // into discrete variants would mean guessing combinations that were
    // never actually stated (brief §12: "Do not create placeholder data
    // pretending to be real data").
    variants: [],
    // No `price` field populated — MobileAPI is a product-data source
    // here, not a price source (brief §16).
    sourceUrl: `${API_BASE}/devices/${encodeURIComponent(deviceId)}/`,
    sourceName: "MobileAPI.dev",
    sourceType: "database",
    observedAt: new Date().toISOString(),
  };
}

async function fetchCandidates(categorySlug: string): Promise<RawCandidate[]> {
  const auth = readAuth();
  if (!auth) {
    // Expected, honest state — no credentials configured yet.
    return [];
  }

  const deviceType = CATEGORY_SLUG_TO_DEVICE_TYPE[categorySlug];
  if (!deviceType) {
    // GadGexo asked for a category this provider doesn't know how to map
    // to a MobileAPI device_type yet. Not an error — nothing found.
    return [];
  }

  const candidates: RawCandidate[] = [];

  for (let page = 1; page <= MAX_LIST_PAGES; page += 1) {
    if (candidates.length >= MAX_CANDIDATES_PER_RUN) break;

    const url = `${API_BASE}/devices/by-year/?year=${year}&page=${page}`;
    const response = await fetchWithRetry(url, auth);
    const payload = await safeJson(response);
    if (payload === null) break;

    const rawDevices = extractDeviceArray(payload);
    if (rawDevices.length === 0) break; // no more data — legitimate end, not an error

    for (const rawDevice of rawDevices) {
      if (candidates.length >= MAX_CANDIDATES_PER_RUN) break;

      if (
        !rawDevice ||
        typeof rawDevice !== "object" ||
        (rawDevice as Record<string, unknown>).device_type !== deviceType
      ) {
        continue; // by-year isn't type-filtered server-side; filter client-side
      }

      const mapped = mapDeviceToCandidate(rawDevice, categorySlug);
      if (mapped) candidates.push(mapped);
    }
  }

  return candidates;
}

export const mobileApiProvider: SourceProvider = {
  id: "mobileapi-dev",
  name: "MobileAPI.dev",
  fetchCandidates,
};
