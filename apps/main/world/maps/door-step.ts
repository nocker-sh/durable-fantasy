import type { HouseDef } from "#/world/town/house-types"
import type { Vector2Tuple as V2 } from "#/lib/engine/vector2-types"

/** Where one steps out of a house's door, half a tile out. */
export function doorStep(h: HouseDef): V2 {
  const u = h.door.u
  return h.door.side === "s" ? [h.x0 + u, h.z1 + 0.5] : h.door.side === "n" ? [h.x1 - u, h.z0 - 0.5] : h.door.side === "e" ? [h.x1 + 0.5, h.z1 - u] : [h.x0 - 0.5, h.z0 + u]
}
