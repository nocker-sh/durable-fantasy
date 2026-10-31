import { z } from "zod"

/** A footprint must have exact cell coverage and finite dimensions in physical metres. */
export const buildingDimensionsSchema = z
  .object({ cell_m: z.number().positive(), width: z.number().int().positive(), depth: z.number().int().positive() })
  .refine((dimensions) => Number.isSafeInteger(dimensions.width * dimensions.depth) && Number.isFinite(dimensions.width * dimensions.cell_m) && Number.isFinite(dimensions.depth * dimensions.cell_m))
