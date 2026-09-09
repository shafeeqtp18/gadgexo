import { z } from "zod";

export const slugSchema = z
  .string()
  .min(1)
  .max(160)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only");

export const confidenceScoreSchema = z.number().min(0).max(1);

export const nonNegativePriceSchema = z.number().nonnegative().max(100_000_000);

export const urlSchema = z.string().url();
