import { z } from "zod"
const integer = z.number().int().nonnegative(),
  positive = z.number().positive(),
  cell = z.tuple([integer, integer])

/** Share the fitted moving panel definition with loading, swept rotation and static open-door passages. */
export const doorLeafGeometrySchema = z.object({
  door: cell,
  hinge: z.enum(["start", "end"]),
  paired: z.boolean().optional(),
  meeting_gap_m: z.number().nonnegative().optional(),
  frame_inset_m: z.number().nonnegative().optional(),
  thickness_m: positive.optional(),
  wall_depth_cells: z.number().int().positive().optional(),
  fittings: z.object({ handle_along_m: positive.optional(), brace_projection_m: z.number().nonnegative(), handle_projection_m: z.number().nonnegative() }).optional(),
  waits_for: z.array(z.object({ furniture: z.string().length(1), space_index: integer })),
})
