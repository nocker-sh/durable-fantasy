import { z } from "zod"
export const monsterAppearanceSchema = z.object({
  look: z.enum(["slime", "hare"]),
  color: z.number().int().min(0).max(0xffffff).nullable(),
  size: z.number().finite().positive().nullable(),
  shape_source: z.literal("world/core/monster-body-shapes.ts"),
  footprint_source: z.literal("world/core/get-monster-body-radius.ts"),
  movement_clearance: z.literal("walk_grid_adopted"),
})
