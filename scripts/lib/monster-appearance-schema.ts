import { z } from "zod"
export const monsterAppearanceSchema = z.object({
  look: z.enum(["slime", "hare", "model"]),
  color: z.number().int().min(0).max(0xffffff).nullable(),
  size: z.number().finite().positive().nullable(),
  // slimes and hares share the body shapes; a creature built from blocks keeps its own in the bestiary
  shape_source: z.union([z.literal("apps/main/world/core/monster-body-shapes.ts"), z.string().regex(/^apps\/main\/world\/core\/bestiary\/[a-z-]+\.ts$/)]),
  footprint_source: z.literal("apps/main/world/core/get-monster-body-radius.ts"),
  movement_clearance: z.literal("walk_grid_adopted"),
})
