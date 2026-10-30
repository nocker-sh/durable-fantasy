import { z } from "zod"

const coordinate = z.number().nonnegative()
export const workKitTableSetupSchema = z.object({
  box_origin_m: z.tuple([coordinate, coordinate]),
  lid_origin_m: z.tuple([coordinate, coordinate]),
  clearance_m: coordinate,
})
