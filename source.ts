import { z } from "zod";

export const sourceTypeSchema = z.enum([
  "manufacturer", "retailer", "official_documentation", "trusted_publication", "database", "other",
]);

export const sourceSchema = z.object({
  name: z.string().min(1).max(200),
  domain: z.string().max(255).optional(),
  source_type: sourceTypeSchema.default("other"),
  reliability_priority: z.number().int().min(0).max(100).default(0),
});
