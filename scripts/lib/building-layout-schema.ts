import { z } from "zod"
import { buildingDimensionsSchema } from "#/scripts/lib/building-dimensions-schema"

export const buildingRoomIdsSchema = z.array(z.string().min(1))

/** Floor inventory extends the same validated dimensions used by the exterior audit. */
export const buildingLayoutSchema = buildingDimensionsSchema.safeExtend({
  floors: z.array(z.object({ floor: z.number(), rooms: buildingRoomIdsSchema })),
})
