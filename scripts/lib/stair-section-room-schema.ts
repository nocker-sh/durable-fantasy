import { z } from "zod"
import { roomGridSchema } from "#/scripts/lib/room-layout-schema"
import { roomConnectionsSchema, stairFurnitureSchema } from "#/scripts/lib/room-connection-schema"

export const stairSectionRoomSchema = z.object({
  kind: z.literal("rooms"),
  building: z.string(),
  floor: z.number().int(),
  grid: roomGridSchema,
  connections: roomConnectionsSchema,
  furniture: stairFurnitureSchema,
})
