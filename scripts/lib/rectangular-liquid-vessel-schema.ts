import { z } from "zod"
const positiveInteger = z.number().int().positive().safe()

/** Authored rectangular cavities reserve room above the working liquid and for immersed contents. */
export const rectangularLiquidVesselSchema = z.object({
  shape: z.literal("rectangular_cavity"),
  inner_mm: z.tuple([positiveInteger, positiveInteger, positiveInteger]),
  wall_mm: positiveInteger,
  bottom_mm: positiveInteger,
  freeboard_mm: positiveInteger,
  displacement_ml: z.number().int().nonnegative().safe(),
})
