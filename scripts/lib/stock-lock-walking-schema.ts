import { z } from "zod"
import { MIN_PASSAGE_WIDTH_M } from "#/scripts/lib/spatial-rules"
const point = z.tuple([z.number(), z.number()])

/** One gate is fully open and held, its peer remains closed; this is not an opening operation or a shared livestock path. */
export const stockLockWalkingSchema = z.object({
  status: z.literal("proposed"),
  scope: z.literal("one_gate_open_empty_caretaker"),
  body_radius_m: z.number().min(MIN_PASSAGE_WIDTH_M / 2),
  hub_m: point,
  outside_side: z.object({ status: z.literal("unassigned"), rect_m: z.tuple([z.number(), z.number(), z.number().positive(), z.number().positive()]) }),
  paths: z.array(z.object({ gate: z.enum(["outer", "inner"]), points_m: z.array(point).min(2) })).length(2),
})
