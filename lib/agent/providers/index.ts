import type { SourceProvider } from "../types";

/**
 * INTENTIONALLY EMPTY.
 *
 * No manufacturer API, retailer feed, or scraping integration has been
 * connected yet — none exists in this environment (no credentials, no
 * approved API access). Registering a fake/mock provider here would
 * mean the agent silently invents smartphone data, which the Phase 11
 * brief explicitly forbids.
 *
 * To connect a real source: implement SourceProvider (see ../types.ts),
 * import it below, and push an instance into this array. The rest of
 * the pipeline (dedup, confidence, conflicts, review routing) already
 * works against whatever RawCandidate[] a provider returns — no other
 * code needs to change.
 */
export const REGISTERED_PROVIDERS: SourceProvider[] = [];
