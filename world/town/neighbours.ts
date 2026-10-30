import { HOUSES } from "#/world/town/houses"
import type { HouseDef } from "#/world/town/house-types"

/** Buildings on the same map within a few tiles of each other. */
export function neighbours(h: HouseDef, within = 6): HouseDef[] {
  return HOUSES.filter((o) => o.map === h.map && o.id !== h.id && Math.max(o.x0 - h.x1, h.x0 - o.x1, o.z0 - h.z1, h.z0 - o.z1) < within)
}
