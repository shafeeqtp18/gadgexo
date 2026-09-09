import { z } from "zod";
import { nonNegativePriceSchema, urlSchema } from "./shared";
import { verificationStatusSchema } from "./product";

export const priceSchema = z.object({
  variant_id: z.string().uuid(),
  retailer_id: z.string().uuid(),
  price: nonNegativePriceSchema,
  mrp: nonNegativePriceSchema.optional(),
  product_url: urlSchema,
  source_id: z.string().uuid().optional(),
  verification_status: verificationStatusSchema.default("unverified"),
}).refine(
  (v) => v.mrp === undefined || v.mrp >= v.price,
  { message: "MRP can't be lower than the current price", path: ["mrp"] },
).refine(
  (v) => v.verification_status === "unverified" || v.source_id !== undefined,
  { message: "A verified price must reference a source", path: ["source_id"] },
);
