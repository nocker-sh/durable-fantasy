import { z } from "zod"
import { roomOriginSchema } from "#/scripts/lib/room-layout-schema"

/** Decode connection fields without coercing coordinates or discarding checks for width and reciprocal geometry. */
export const roomConnectionSchema = z.object({
  kind: z.string().optional(),
  door: roomOriginSchema.optional(),
  target: z.string().min(1),
  target_door: roomOriginSchema.optional(),
  width_cells: z.number().optional(),
  furniture: z.string().optional(),
  target_furniture: z.string().optional(),
  access: roomOriginSchema.optional(),
  target_access: roomOriginSchema.optional(),
})
export const roomConnectionsSchema = z
  .array(roomConnectionSchema)
  .nullish()
  .transform((connections) => connections ?? [])
export const stairFurnitureSchema = z
  .array(
    z.object({
      symbol: z.string(),
      rect: z.tuple([z.number(), z.number(), z.number(), z.number()]),
      access: z.array(roomOriginSchema),
    }),
  )
  .nullish()
  .transform((furniture) => furniture ?? [])
