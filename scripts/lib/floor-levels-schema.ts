import { z } from "zod"
export const floorLevelsSchema = z.array(z.object({ floor: z.number().int().nonnegative(), elevation_m: z.number(), ceiling_elevation_m: z.number().nullable().optional() }))
