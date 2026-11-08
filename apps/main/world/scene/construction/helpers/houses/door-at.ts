import type { HouseDef } from "#/world/town/house-types"
import type { V2 } from "#/world/scene/construction/registry"

export const doorAt = (h: HouseDef): V2 => {
  const u = h.door.u
  return h.door.side === "s" ? [h.x0 + u, h.z1] : h.door.side === "n" ? [h.x1 - u, h.z0] : h.door.side === "e" ? [h.x1, h.z1 - u] : [h.x0, h.z0 + u]
}
