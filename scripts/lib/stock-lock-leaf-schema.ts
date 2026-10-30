import { z } from "zod"
import { doorLeafGeometrySchema } from "#/scripts/lib/door-leaf-geometry-schema"

/** A gate's hinge stands beyond the frame face; fittings contribute to the entire moving thickness. */
export const stockLockLeafSchema = z.object({
  material: z.literal("wood"),
  makers: z.array(z.object({ resident: z.string().min(1), role: z.enum(["timber", "iron_fittings"]) })).length(2),
  frame_inset_m: z.number().positive(),
  thickness_m: z.number().positive(),
  hinge_projection_m: z.number().nonnegative(),
  fittings: doorLeafGeometrySchema.shape.fittings.unwrap().required({ handle_along_m: true }),
})
