import { z } from "zod"
import { floorLevelsSchema } from "#/scripts/lib/floor-levels-schema"

/** Runtime export requires a known ceiling; incomplete design metadata remains valid only outside this boundary. */
export const authoredFloorLevelsSourceSchema = z.array(floorLevelsSchema.element.extend({ ceiling_elevation_m: z.number() }))
export const authoredFloorFoundationSchema = z.object({ floor_thickness_m: z.number().positive() })
