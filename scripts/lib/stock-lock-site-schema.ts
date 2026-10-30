import { z } from "zod"
import { stockLockWaitingSchema } from "#/scripts/lib/stock-lock-waiting-schema"
const point = z.tuple([z.number(), z.number()])

/** A partition candidate is not an adopted fence, terrain or animal movement plan. */
export const stockLockSiteSchema = z.object({
  status: z.literal("proposed"),
  scope: z.literal("northwest_pasture_partition"),
  origin_tiles: point,
  road_connection: z.object({ source_index: z.number().int().nonnegative().safe(), point_m: point }),
  terrain_status: z.literal("unreviewed"),
  stock_motion_status: z.literal("unreviewed"),
  waiting: stockLockWaitingSchema,
})
