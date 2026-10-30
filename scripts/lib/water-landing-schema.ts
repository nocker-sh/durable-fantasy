import { waterLandingBodySchema } from "#/scripts/lib/water-landing-body-schema"
import { z } from "zod"
const cell = z.number().int().nonnegative(),
  span = z.number().int().positive()
export const waterLandingSchema = z.object({
  anchor: z.literal("plaza"),
  origin_m: z.tuple([z.number(), z.number()]),
  cell_m: z.number().positive(),
  rows: z.array(z.string().min(1).max(64)).min(1).max(64),
  body_review: waterLandingBodySchema.optional(),
  zones: z
    .array(z.object({ symbol: z.string().regex(/^[A-Z]$/), role: z.enum(["departure", "collection", "waiting"]), capacity_people: z.literal(1), rect: z.tuple([cell, cell, span, span]) }))
    .length(3),
})
export type WaterLanding = z.infer<typeof waterLandingSchema>
