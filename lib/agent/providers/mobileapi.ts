import "server-only";
import type { RawCandidate, SourceProvider } from "../types";

const API_BASE = "https://api.mobileapi.dev";

const CATEGORY_SLUG_TO_DEVICE_TYPE: Record<string, string> = {
  smartphones: "phone",
};

const MAX_CANDIDATES_PER_RUN = 2;
const MAX_LIST_PAGES = 1;
const MAX_RETRIES = 3;
const BASE_BACKOFF_MS = 1000;

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

async function fetchWithRetry(
  url: string,
  auth: MobileApiAuth,
  attempt = 1,
): Promise<Response> {
  const response = await fetch(url, {
    headers: {
      Authorization: `Token ${auth.apiKey}`,
      Accept: "application/json",
    },
  });

  if (response.status === 429 || response.status >= 500) {
    if (attempt >= MAX_RETRIES) {
      throw new Error(
        `MobileAPI: ${response.status} after ${MAX_RETRIES} attempts for ${url}`,
      );
    }

    const retryAfterHeader = response.headers.get("Retry-After");
    const retryAfterMs = retryAfterHeader
      ? Number(retryAfterHeader) * 1000
      : BASE_BACKOFF_MS * 2 ** (attempt - 1);

    await sleep(
      Number.isFinite(retryAfterMs) ? retryAfterMs : BASE_BACKOFF_MS,
    );

    return fetchWithRetry(url, auth, attempt + 1);
  }

  if (response.status === 401 || response.status === 403) {
    throw new Error(
      `MobileAPI: authentication rejected (${response.status}).`,
    );
  }

  if (!response.ok) {
    throw new Error(
      `MobileAPI: unexpected status ${response.status} for ${url}`,
    );
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

function extractDeviceArray(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;

  if (payload && typeof payload === "object") {
    const devices = (payload as Record<string, unknown>).devices;
    if (Array.isArray(devices)) return devices;

    const results = (payload as Record<string, unknown>).results;
    if (Array.isArray(results)) return results;
  }

  return [];
}

function mapDeviceToCandidate(
  raw: unknown,
  categorySlug: string,
): RawCandidate | null {
  if (!raw || typeof raw !== "object") return null;

  const d = raw as Record<string, unknown>;

  const name = typeof d.name === "string" ? d.name.trim() : "";
  if (!name) return null;

  const deviceId =
    typeof d.id === "string" || typeof d.id === "number"
      ? String(d.id)
      : "";

  if (!deviceId) return null;

  const manufacturerName =
    typeof d.manufacturer_name === "string" &&
    d.manufacturer_name.trim().length > 0
      ? d.manufacturer_name.trim()
      : "Unknown";

  const modelIdentifier =
    typeof d.model_numbers === "string" && d.model_numbers.trim().length > 0
      ? d.model_numbers.trim()
      : undefined;

  const specs: Record<string, string> = {};

  for (const [rawField, slug] of Object.entries(SPEC_SLUG_MAP)) {
    const value = d[rawField];

    if (typeof value === "string" && value.trim().length > 0) {
      specs[slug] = value.trim();
    }
  }

  return {
    brandName: manufacturerName,
    productName: name,
    modelIdentifier,
    categorySlug,
    specs,
    variants: [],
    sourceUrl: `${API_BASE}/devices/${encodeURIComponent(deviceId)}/`,
    sourceName: "MobileAPI.dev",
    sourceType: "database",
    observedAt: new Date().toISOString(),
  };
}

async function fetchCandidates(categorySlug: string): Promise<RawCandidate[]> {
  const auth = readAuth();
  // DIAGNOSTIC: point 1 — auth presence only, never the key value.
  console.error(`[mobileapi] auth present: ${auth !== null}`);
  if (!auth) return [];

  const deviceType = CATEGORY_SLUG_TO_DEVICE_TYPE[categorySlug];
  // DIAGNOSTIC: point 2 — categorySlug in vs deviceType resolved out.
  console.error(
    `[mobileapi] categorySlug="${categorySlug}" -> deviceType=${
      deviceType ?? "undefined"
    }`,
  );
  if (!deviceType) return [];

  const candidates: RawCandidate[] = [];

  for (let page = 1; page <= MAX_LIST_PAGES; page += 1) {
    if (candidates.length >= MAX_CANDIDATES_PER_RUN) break;

    const url =
      `${API_BASE}/devices/by-type/?type=${encodeURIComponent(deviceType)}` +
      `&page=${page}`;

    const response = await fetchWithRetry(url, auth);
    // DIAGNOSTIC: point 3 — HTTP status only.
    console.error(`[mobileapi] page ${page} response.status: ${response.status}`);

    const payload = await safeJson(response);
    // DIAGNOSTIC: point 4 — null-ness and, if an object, only its key
    // names (never values — no response body, no image_b64).
    if (payload === null) {
      console.error(`[mobileapi] page ${page} payload: null (JSON parse failed or empty body)`);
    } else if (typeof payload === "object") {
      console.error(
        `[mobileapi] page ${page} payload top-level keys: ${Object.keys(
          payload as Record<string, unknown>,
        ).join(", ")}`,
      );
    } else {
      console.error(`[mobileapi] page ${page} payload typeof: ${typeof payload}`);
    }

    if (payload === null) break;

    const rawDevices = extractDeviceArray(payload);
    // DIAGNOSTIC: point 5 — count only.
    console.error(`[mobileapi] page ${page} rawDevices.length: ${rawDevices.length}`);
    if (rawDevices.length === 0) break;

    // DIAGNOSTIC: point 6 — per-page counters, logged after the loop below.
    let rejectedByTypeFilter = 0;
    let passedToMapper = 0;
    let mapperReturnedNull = 0;
    let createdThisPage = 0;

    for (const rawDevice of rawDevices) {
      if (candidates.length >= MAX_CANDIDATES_PER_RUN) break;

      if (
        !rawDevice ||
        typeof rawDevice !== "object" ||
        (rawDevice as Record<string, unknown>).device_type !== deviceType
      ) {
        rejectedByTypeFilter += 1;
        continue;
      }

      passedToMapper += 1;
      const mapped = mapDeviceToCandidate(rawDevice, categorySlug);
      if (mapped) {
        candidates.push(mapped);
        createdThisPage += 1;
      } else {
        mapperReturnedNull += 1;
      }
    }

    // DIAGNOSTIC: point 6 (continued) — the four counts requested.
    console.error(
      `[mobileapi] page ${page} counts: rejectedByTypeFilter=${rejectedByTypeFilter}, ` +
        `passedToMapper=${passedToMapper}, mapperReturnedNull=${mapperReturnedNull}, ` +
        `createdThisPage=${createdThisPage}`,
    );
  }

  // DIAGNOSTIC: point 7 — final count only.
  console.error(`[mobileapi] final candidates.length: ${candidates.length}`);

  return candidates;
}

export const mobileApiProvider: SourceProvider = {
  id: "mobileapi-dev",
  name: "MobileAPI.dev",
  fetchCandidates,
};
