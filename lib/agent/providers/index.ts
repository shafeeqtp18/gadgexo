import type { SourceProvider } from "../types";
import { mobileApiProvider } from "./mobileapi";

/**
 * Registered data source providers for the discovery pipeline.
 *
 * mobileApiProvider is registered but returns [] until MOBILEAPI_API_KEY
 * is set in the environment (see lib/agent/providers/mobileapi.ts).
 *
 * Note on Flipkart: an earlier Flipkart Affiliate provider was drafted but
 * never finished or uploaded -- the project's data-provider strategy moved
 * to MobileAPI.dev for product/spec data before that draft was corrected
 * against Flipkart's real endpoint shape. Per the current plan, Flipkart
 * (or another affiliate network) belongs later as a monetization/buy-link
 * layer, separate from product-spec discovery -- not registered here.
 */
export const REGISTERED_PROVIDERS: SourceProvider[] = [mobileApiProvider];
