import type { z } from "zod"
import type { roomConnectionSchema } from "#/scripts/lib/room-connection-schema"
import type { buildingLayoutSchema } from "#/scripts/lib/building-layout-schema"

export type Connection = z.infer<typeof roomConnectionSchema>

export type Layout = z.infer<typeof buildingLayoutSchema>
