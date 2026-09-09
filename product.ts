import { z } from "zod";
import { slugSchema, confidenceScoreSchema } from "./shared";

export const productStatusSchema = z.enum(["draft", "review", "published", "archived", "rejected"]);
export const verificationStatusSchema = z.enum([
  "unverified", "partially_verified", "verified", "conflicting", "needs_review",
]);

export const productSchema = z.object({
  brand_id: z.string().uuid(),
  category_id: z.string().uuid(),
  name: z.string().min(1).max(200),
  slug: slugSchema,
  status: productStatusSchema.default("draft"),
  verification_status: verificationStatusSchema.default("unverified"),
  confidence_score: confidenceScoreSchema.optional(),
});

export type ProductInput = z.infer<typeof productSchema>;

/** Any agent-proposed or manually entered fact that needs a source. */
export const provenancedValueSchema = z.object({
  value: z.string().min(1),
  source_id: z.string().uuid().optional(),
  verification_status: verificationStatusSchema.default("unverified"),
  confidence_score: confidenceScoreSchema.optional(),
}).refine(
  (v) => v.verification_status === "unverified" || v.source_id !== undefined,
  { message: "A verified/partially_verified value must reference a source", path: ["source_id"] },
);
