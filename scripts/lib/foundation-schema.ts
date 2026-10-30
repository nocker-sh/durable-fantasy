import { z } from "zod"

/** Elevation uses the world datum; the floor underside must leave the authored gap above terrain. */
export const foundationSchema = z.object({
  floor_elevation_m: z.number(),
  floor_thickness_m: z.number().positive(),
  minimum_ground_gap_m: z.number().nonnegative(),
})
