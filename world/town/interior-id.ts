import type { HouseDef } from "#/world/town/house-types"

/** Which map a building's inside is. */
export const interiorId = (h: HouseDef, floor = 0) => `${h.map.split("-")[0]}-in-${h.id}${floor > 0 ? `-floor-${floor + 1}` : ""}`
