import type { z } from "zod"
import type { stairSectionsSchema } from "#/scripts/lib/stair-sections-schema"
import type { floorLevelsSchema } from "#/scripts/lib/floor-levels-schema"
import type { getStairSectionConnection } from "#/scripts/lib/get-stair-section-connection"
import type { getStairSectionFrame } from "#/scripts/lib/get-stair-section-frame"

export type StairSection = z.infer<typeof stairSectionsSchema>[number]
export type StairFloorLevels = z.infer<typeof floorLevelsSchema>
export type StairSectionConnection = Exclude<ReturnType<typeof getStairSectionConnection>, Error>
export type StairSectionFrame = Exclude<ReturnType<typeof getStairSectionFrame>, Error>
