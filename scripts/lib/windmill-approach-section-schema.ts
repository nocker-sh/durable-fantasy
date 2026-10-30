import { windmillSurfaceSchema } from "#/scripts/lib/windmill-surface-schema"
import { z } from "zod"

/** A height reservation for the centre line, without certifying drainage, road seams or a loaded body. */
export const windmillApproachSectionSchema = z.object({
  status: z.literal("proposed"),
  surface: windmillSurfaceSchema.optional(),
  scope: z.literal("centreline_level_reservation"),
  yard_elevation_m: z.number(),
  turn_elevation_m: z.number(),
  road_join: z.literal("sampled_road_centre"),
  maximum_grade: z.number().positive().max(1),
  pending: z.array(z.string().trim().min(1)).min(1),
})
