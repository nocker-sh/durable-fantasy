import type { HouseDef } from "#/world/town/house-types"

/** Floors the outside shows: the highest room's floor + 1. */
export const floorsOf = (h: HouseDef) => Math.max(...h.plan.rooms.map((r) => r.floor)) + 1
