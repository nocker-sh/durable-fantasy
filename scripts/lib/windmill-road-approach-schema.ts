import { windmillApproachSectionSchema } from "#/scripts/lib/windmill-approach-section-schema"
import { z } from "zod"

/** 南の搬入口から既存道路の端へ結ぶ、未採用の平面案。 */
export const windmillRoadApproachSchema = z.object({
  status: z.literal("proposed"),
  section: windmillApproachSectionSchema.optional(),
  road_index: z.number().int().nonnegative().safe(),
  road_end_tiles: z.tuple([z.number().finite(), z.number().finite()]),
  door: z.tuple([z.number().int().nonnegative(), z.number().int().nonnegative()]),
  span_cells: z.number().int().positive(),
  width_m: z.number().finite().positive(),
})
