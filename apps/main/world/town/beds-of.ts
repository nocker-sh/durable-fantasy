import type { HouseDef } from "#/world/town/house-types"

export const bedsOf = (h: HouseDef) => h.plan.rooms.reduce((n, r) => n + (r.beds ?? 0), 0)
