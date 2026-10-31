import type { z } from "zod"
import type { authoredStairSectionsSourceSchema } from "#/scripts/lib/authored-renderer-source-schema"
import type { getAuthoredRoomSource } from "#/scripts/lib/get-authored-room-source"
import type { AuthoredPlan } from "#/world/town/floorplan/authored-types"

export type AuthoredRoomSource = ReturnType<typeof getAuthoredRoomSource>
export type AuthoredEntrance = { at: [number, number]; side: AuthoredPlan["entrySide"]; width: number }
export type AuthoredStairSource = z.infer<typeof authoredStairSectionsSourceSchema>[number]
