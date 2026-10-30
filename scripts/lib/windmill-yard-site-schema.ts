import { z } from "zod"
import { windmillRoadApproachSchema } from "#/scripts/lib/windmill-road-approach-schema"

/** Site and crop effects remain proposals until terrain, machinery access and supply have been designed. */
export const windmillYardSiteSchema = z.object({
  scope: z.literal("unplaced_mill_field_partition"),
  status: z.literal("proposed"),
  origin_tiles: z.tuple([z.number(), z.number()]),
  rotation_quarters: z.number().int().min(0).max(3),
  field_index: z.number().int().nonnegative().safe(),
  terrain_status: z.literal("unreviewed"),
  native_obstacles_status: z.literal("unreviewed"),
  crop_supply_status: z.literal("unreviewed"),
  approach: windmillRoadApproachSchema.optional(),
  pending: z.array(z.string().trim().min(1)).min(1),
})
