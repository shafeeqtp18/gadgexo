import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: SITE_CONFIG.url, lastModified: new Date() }];
}
