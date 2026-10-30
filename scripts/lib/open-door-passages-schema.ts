import { z } from "zod"
const coordinate = z.number().int().nonnegative().safe(),
  point = z.tuple([z.number(), z.number()])

/** Paths connect every doorway to one clear room hub with the fitted leaves fully open; opening and closing remain separate operations. */
export const openDoorPassagesSchema = z.object({
  scope: z.literal("fully_open_planar_passages"),
  status: z.literal("proposed"),
  body_radius_m: z.number().positive(),
  hub_m: point,
  entries: z.array(z.object({ door: z.tuple([coordinate, coordinate]), points_m: z.array(point).min(2) })).min(1),
})
