import { z } from "zod"
const point = z.tuple([z.number(), z.number()])

/** An unplaced exterior reservation cannot certify a live exit, lifting, or loaded transport. */
export const parkedCartDepartureSchema = z.object({
  scope: z.literal("empty_reverse_planar_reservation"),
  status: z.literal("proposed"),
  furniture: z.string().length(1),
  operator: z.string().min(1),
  body_radius_m: z.number().min(0.4),
  handling_gap_m: z.number().positive(),
  points_m: z.array(point).min(2),
  exterior_apron: z.object({ status: z.literal("unassigned"), rect_m: z.tuple([z.number(), z.number(), z.number().positive(), z.number().positive()]) }),
  exit_door: z.tuple([z.number().int().nonnegative().safe(), z.number().int().nonnegative().safe()]),
})
